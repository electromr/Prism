import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, Plus, RefreshCw, Zap } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";

const AllocationsPage = () => {
  const { id } = useParams();
  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [deleteError, setDeleteError] = useState(null);
  const [createError, setCreateError] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedAllocation, setSelectedAllocation] = useState(null);
  const [createLoading, setCreateLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchAllocations = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`/api/server/${id}/allocations`);
      setAllocations(response.data);
    } catch (err) {
      setError('Failed to fetch allocations');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAllocation = async () => {
    setCreateError(null);
    setCreateLoading(true);
    try {
      const response = await axios.post(`/api/server/${id}/allocations`, {});
      setAllocations(prev => [...prev, response.data]);
      setIsAddModalOpen(false);
    } catch (err) {
      const msg = err.response?.data?.details?.errors?.[0]?.detail || 'Failed to create allocation';
      setCreateError(msg);
    } finally {
      setCreateLoading(false);
    }
  };

  const handleDeleteAllocation = async () => {
    setDeleteError(null);
    setDeleteLoading(true);
    try {
      await axios.delete(`/api/server/${id}/allocations/${selectedAllocation.id}`);
      setAllocations(prev => prev.filter(a => a.id !== selectedAllocation.id));
      setIsDeleteModalOpen(false);
      setSelectedAllocation(null);
    } catch (err) {
      const msg = err.response?.data?.details?.errors?.[0]?.detail || 'Failed to delete allocation';
      setDeleteError(msg);
    } finally {
      setDeleteLoading(false);
    }
  };

  useEffect(() => { fetchAllocations(); }, [id]);

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Cyber Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900/30 via-black to-cyan-900/30" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,rgba(100,0,255,0.15),transparent_70%)]" />
      
      <div className="relative z-10 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-10">
            <div>
              <h1 className="text-6xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                NETWORK ALLOCATION
              </h1>
              <p className="text-cyan-400 mt-2 text-lg opacity-80">Server IP & Port Bindings</p>
            </div>
            <Button 
              onClick={() => setIsAddModalOpen(true)}
              className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-bold px-8 py-6 text-lg shadow-lg shadow-cyan-500/50"
            >
              <Plus className="w-6 h-6 mr-3" />
              DEPLOY NEW ALLOCATION
            </Button>
          </div>

          {/* Main Card */}
          <Card className="bg-black/70 backdrop-blur-2xl border-2 border-cyan-500/50 shadow-2xl shadow-cyan-500/30">
            <CardHeader className="border-b border-cyan-500/30">
              <div className="flex items-center justify-between">
                <CardTitle className="text-3xl font-bold text-cyan-400 flex items-center gap-3">
                  <Zap className="w-8 h-8" />
                  ACTIVE PORT BINDINGS
                </CardTitle>
                <Button variant="ghost" size="icon" onClick={fetchAllocations} disabled={loading}>
                  <RefreshCw className={`w-6 h-6 ${loading ? 'animate-spin' : ''} text-cyan-400`} />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex items-center justify-center h-96">
                  <RefreshCw className="w-16 h-16 text-cyan-400 animate-spin" />
                </div>
              ) : error ? (
                <div className="flex items-center justify-center h-96 text-red-400 text-xl">
                  CONNECTION ERROR // {error}
                </div>
              ) : allocations.length === 0 ? (
                <div className="flex items-center justify-center h-96 text-gray-500 text-xl">
                  NO ACTIVE ALLOCATIONS
                </div>
              ) : (
                <ScrollArea className="h-[600px]">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b-2 border-cyan-500/50">
                        <TableHead className="text-cyan-400 text-lg">IP ADDRESS</TableHead>
                        <TableHead className="text-purple-400 text-lg">PORT</TableHead>
                        <TableHead className="text-emerald-400 text-lg">PRIMARY</TableHead>
                        <TableHead className="text-orange-400 text-lg">ALIAS</TableHead>
                        <TableHead className="text-red-400 text-lg">ACTIONS</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {allocations.map((allocation) => (
                        <TableRow key={allocation.id} className="border-b border-cyan-500/20 hover:bg-white/5 transition-all">
                          <TableCell className="font-mono text-cyan-300 text-lg">
                            {allocation.ip}
                          </TableCell>
                          <TableCell className="font-mono text-purple-300 text-xl font-bold">
                            {allocation.port}
                          </TableCell>
                          <TableCell>
                            <span className={`px-4 py-2 rounded-full text-sm font-bold ${allocation.is_primary 
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500' 
                              : 'bg-gray-800 text-gray-400'}`}>
                              {allocation.is_primary ? 'PRIMARY' : 'SECONDARY'}
                            </span>
                          </TableCell>
                          <TableCell className="text-orange-300">
                            {allocation.alias || '—'}
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="bg-red-600 hover:bg-red-500 font-bold"
                              onClick={() => {
                                setSelectedAllocation(allocation);
                                setIsDeleteModalOpen(true);
                              }}
                            >
                              <Trash2 className="w-5 h-5 mr-2" />
                              TERMINATE
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Add Allocation Modal */}
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogContent className="bg-neutral-900/95 border-2 border-cyan-500/70 backdrop-blur-2xl">
            <DialogHeader>
              <DialogTitle className="text-3xl font-bold text-cyan-400">
                DEPLOY NEW ALLOCATION
              </DialogTitle>
              <DialogDescription className="text-gray-400 text-lg">
                A new random port will be assigned and bound to this node.
              </DialogDescription>
            </DialogHeader>
            {createError && (
              <Alert variant="destructive" className="bg-red-900/50 border-red-600">
                <AlertDescription className="text-lg">{createError}</AlertDescription>
              </Alert>
            )}
            <DialogFooter className="mt-6">
              <Button variant="ghost" onClick={() => setIsAddModalOpen(false)} className="text-gray-400">
                CANCEL
              </Button>
              <Button 
                onClick={handleAddAllocation} 
                disabled={createLoading}
                className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 font-bold text-lg px-8"
              >
                {createLoading ? (
                  <RefreshCw className="w-6 h-6 mr-3 animate-spin" />
                ) : (
                  <><Plus className="w-6 h-6 mr-3" /> DEPLOY</>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
          <DialogContent className="bg-neutral-900/95 border-2 border-red-600/70 backdrop-blur-2xl">
            <DialogHeader>
              <DialogTitle className="text-3xl font-bold text-red-500">
                TERMINATE ALLOCATION
              </DialogTitle>
              <DialogDescription className="text-gray-300 text-lg">
                This action is irreversible. The port will be released immediately.
                <br />
                <span className="font-mono text-xl text-red-400 mt-4 block">
                  {selectedAllocation?.ip}:{selectedAllocation?.port}
                </span>
              </DialogDescription>
            </DialogHeader>
            {deleteError && (
              <Alert variant="destructive" className="bg-red-900/50 border-red-600">
                <AlertDescription className="text-lg">{deleteError}</AlertDescription>
              </Alert>
            )}
            <DialogFooter className="mt-6">
              <Button variant="ghost" onClick={() => setIsDeleteModalOpen(false)}>
                CANCEL
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleDeleteAllocation}
                disabled={deleteLoading}
                className="bg-red-600 hover:bg-red-500 font-bold text-lg px-8"
              >
                {deleteLoading ? (
                  <RefreshCw className="w-6 h-6 mr-3 animate-spin" />
                ) : (
                  <><Trash2 className="w-6 h-6 mr-3" /> TERMINATE BINDING</>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AllocationsPage;
