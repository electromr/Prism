import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Terminal, RefreshCw, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import axios from "axios";

const RETRY_COUNT = 5;
const RETRY_DELAY = 5000;

const formatConsoleOutput = (line) => {
  return line
    .replace(/\u001b\[(\d+)m/g, (match, code) => {
      const colors = {
        31: 'text-red-400',
        32: 'text-emerald-400',
        33: 'text-yellow-400',
        34: 'text-cyan-400',
        35: 'text-purple-400',
        36: 'text-teal-400',
        37: 'text-white'
      };
      return `<span class="${colors[code] || ''}">`;
    })
    .replace(/\u001b\[0m/g, '</span>')
    .replace(/\n/g, '<br>');
};

export default function ConsolePage() {
  const { id } = useParams();
  const socketRef = useRef(null);
  const [serverState, setServerState] = useState("offline");
  const [consoleLines, setConsoleLines] = useState([]);
  const [command, setCommand] = useState("");
  const [commandHistory, setCommandHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [retryCount, setRetryCount] = useState(0);
  const [autoScroll, setAutoScroll] = useState(true);
  const scrollAreaRef = useRef(null);
  const mounted = useRef(true);

  const handleWebSocketMessage = useCallback((event) => {
    if (!mounted.current) return;
    try {
      const message = JSON.parse(event.data);
      switch (message.event) {
        case 'auth success':
          socketRef.current?.send(JSON.stringify({ event: 'send logs', args: [null] }));
          break;
        case 'console output':
          setConsoleLines(prev => [...prev.slice(-1000), message.args[0]]);
          break;
        case 'status':
          setServerState(message.args[0]);
          break;
      }
    } catch (error) {
      console.error('WebSocket message handling error:', error);
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    const connectWebSocket = async () => {
      try {
        if (!mounted.current) return;
        const { data } = await axios.get(`/api/server/${id}/websocket`);
        const ws = new WebSocket(data.data.socket);
        ws.onopen = () => {
          if (!mounted.current) { ws.close(); return; }
          console.log('WebSocket connected');
          setRetryCount(0);
          ws.send(JSON.stringify({ event: "auth", args: [data.data.token] }));
        };
        ws.onmessage = handleWebSocketMessage;
        ws.onclose = () => {
          if (!mounted.current) return;
          console.log('WebSocket disconnected');
          if (retryCount < RETRY_COUNT) {
            setTimeout(() => {
              if (mounted.current) {
                setRetryCount(prev => prev + 1);
                connectWebSocket();
              }
            }, RETRY_DELAY);
          }
        };
        socketRef.current = ws;
      } catch (error) {
        console.error('WebSocket connection error:', error);
      }
    };
    connectWebSocket();
    return () => {
      mounted.current = false;
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
    };
  }, [id, retryCount, handleWebSocketMessage]);

  useEffect(() => {
    if (autoScroll && scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (viewport) {
        setTimeout(() => {
          viewport.scrollTo({ top: viewport.scrollHeight, behavior: 'instant' });
        }, 0);
      }
    }
  }, [consoleLines, autoScroll]);

  const handleScroll = useCallback((event) => {
    const container = event.currentTarget;
    const isAtBottom = Math.abs(
      (container.scrollHeight - container.clientHeight) - container.scrollTop
    ) < 100;
    setAutoScroll(isAtBottom);
  }, []);

  const sendCommand = (e) => {
    e?.preventDefault();
    if (!command.trim() || !socketRef.current) return;
    socketRef.current.send(JSON.stringify({
      event: "send command",
      args: [command]
    }));
    setCommandHistory(prev => [command, ...prev.slice(0, 99)]);
    setCommand("");
    setHistoryIndex(-1);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHistoryIndex(prev => {
        if (prev < commandHistory.length - 1) {
          const newIndex = prev + 1;
          setCommand(commandHistory[newIndex]);
          return newIndex;
        }
        return prev;
      });
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHistoryIndex(prev => {
        if (prev > -1) {
          const newIndex = prev - 1;
          setCommand(newIndex === -1 ? '' : commandHistory[newIndex]);
          return newIndex;
        }
        return prev;
      });
    }
  };

  const statusColor = {
    running: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
    starting: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40',
    stopping: 'bg-orange-500/20 text-orange-400 border-orange-500/40',
    offline: 'bg-red-500/20 text-red-400 border-red-500/40'
  }[serverState] || 'bg-neutral-700/50 text-neutral-400 border-neutral-600/50';

  return (
    <div className="min-h-screen bg-neutral-950 p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-violet-500 to-cyan-500 rounded-xl shadow-2xl">
            <Terminal className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
              Live Console
            </h1>
            <p className="text-sm text-neutral-500">Real-time server terminal</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className={`px-4 py-2 text-sm font-medium backdrop-blur-md border ${statusColor}`}>
            <Zap className="w-4 h-4 mr-2" />
            {serverState.toUpperCase()}
          </Badge>
          {retryCount > 0 && (
            <Badge variant="outline" className="bg-orange-500/20 text-orange-400 border-orange-500/40">
              Reconnecting... ({retryCount}/{RETRY_COUNT})
            </Badge>
          )}
        </div>
      </div>

      {/* Terminal — PRISM CORE */}
      <Card className="relative overflow-hidden border-2 border-transparent bg-neutral-950/90 backdrop-blur-3xl shadow-2xl
        before:absolute before:inset-0 before:bg-gradient-to-br before:from-violet-600/20 before:via-purple-600/10 before:to-cyan-600/20 before:opacity-70
        after:absolute after:-inset-1 after:bg-gradient-to-r after:from-violet-500/30 after:via-transparent after:to-cyan-500/30 after:blur-3xl after:-z-10">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setAutoScroll(!autoScroll)}
              className="text-xs"
            >
              <RefreshCw className={`w-4 h-4 mr-1 ${autoScroll ? 'text-emerald-400 animate-spin' : 'text-neutral-500'}`} />
              Auto-scroll {autoScroll ? 'ON' : 'OFF'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea
            ref={scrollAreaRef}
            className="h-[620px] p-6 font-mono text-sm leading-relaxed tracking-tight"
            onScroll={handleScroll}
          >
            <div className="text-neutral-400">
              {consoleLines.length === 0 ? (
                <div className="text-center py-20 text-neutral-600">
                  <Terminal className="w-16 h-16 mx-auto mb-4 opacity-20" />
                  <p>Waiting for console output...</p>
                </div>
              ) : (
                consoleLines.map((line, i) => (
                  <div
                    key={i}
                    className="py-0.5 break-all"
                    dangerouslySetInnerHTML={{ __html: formatConsoleOutput(line) }}
                  />
                ))
              )}
            </div>
          </ScrollArea>

          {/* Command Input */}
          <div className="border-t border-white/10 bg-gradient-to-t from-neutral-950/95 to-transparent">
            <form onSubmit={sendCommand} className="flex gap-3 p-4">
              <div className="flex items-center gap-3 flex-1">
                <span className="text-emerald-400 font-bold">></span>
                <Input
                  value={command}
                  onChange={(e) => setCommand(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Enter command..."
                  className="flex-1 bg-transparent border-none focus:ring-0 focus-visible:ring-0 text-white placeholder:text-neutral-600 font-mono text-sm"
                  spellCheck={false}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                />
              </div>
              <Button
                type="submit"
                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 shadow-lg"
              >
                Send
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
