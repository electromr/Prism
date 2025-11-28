import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, Plus, RefreshCw, Download } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";

const BackupsPage = () => {
  const { id } = useParams();
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [createError, setCreateError] = useState(null);
  const [deleteError, setDeleteError] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState(null);
  const [createLoading, setCreateLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchBackups = async () => {
    setLoading(false);
    setError(null);
    try {
      const response = await axios.get(`/api/server/${id}/backups`);
      setBackups(response.data.data);
    } catch (err) {
      setError('Failed to fetch backups. Please try again later.');
      console.error(err);
    }
  };

  const handleCreateBackup = async () => {
    setCreateError(null);
    setCreateLoading(true);
    try {
      const response = await axios.post(`/api/server/${id}/backups`);
      setBackups([...backups, response.data]);
      setIsCreateModalOpen(false);
    } catch (err) {
      setCreateError('Failed to create backup. Please try again later.');
      console.error(err);
    } finally {
      setCreateLoading(false);
    }
  };

  const handleDeleteBackup = async () => {
    setDeleteError(null);
    setDeleteLoading(true);
    try {
      await axios.delete(`/api/server/${id}/backups/${selectedBackup.attributes.uuid}`);
      setBackups(backups.filter(backup => backup.attributes.uuid !== selectedBackup.attributes.uuid));
      setIsDeleteModalOpen(false);
    } catch (err) {
      setDeleteError('Failed to delete backup. Please try again later.');
      console.error(err);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDownloadBackup = async (backup) => {
    try {
      const response = await axios.get(`/api/server/${id}/backups/${backup.attributes.uuid}/download`);
      window.open(response.data.attributes.url, '_blank');
    } catch (err) {
      console.error('Failed to generate download link:', err);
    }
  };

  const getBackupStatus = (backup) => {
    if (!backup.attributes.is_successful && backup.attributes.bytes === 0) {
      return 'Creating';
    }
    return backup.attributes.is_successful ? 'Completed' : 'Failed';
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return 'Pending';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString();
  };

  useEffect(() => {
    fetchBackups();
    const interval = setInterval(fetchBackups, 3000);
    return () => clearInterval(interval);
  }, [id]);

  useEffect(() => {
    if (!isDeleteModalOpen) {
      setDeleteError(null);
      setDeleteLoading(false);
    }
  }, [isDeleteModalOpen]);

  useEffect(() => {
    if (!isCreateModalOpen) {
      setCreateError(null);
      setCreateLoading(false);
    }
  }, [isCreateModalOpen]);

  return (
    <div className="min-h-screen bg-neutral-950 p-6 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
          Server Backups
        </h1>
        <Button 
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 shadow-lg"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create Backup
        </Button>
      </div>

      {/* Main Card — PRISM DATA VAULT */}
      <Card className="relative overflow-hidden border-2 border-transparent bg-gradient-to-br from-violet-500/10 via-transparent to-cyan-500/10 backdrop-blur-2xl shadow-2xl
        before:absolute before:inset-0 before:bg-gradient-to-t before:from-violet-600/30 before:via-purple-600/10 before:to-cyan-600/30 before:opacity-70
        after:absolute after:-inset-1 after:bg-gradient-to-r after:from-violet-500/40 after:via-transparent after:to-cyan-500/40 after:blur-3xl after:-z-10">
        <CardHeader>
          <CardTitle className="text-2xl text-white flex items-center gap-3">
            <div className="p-3 bg-white/10 rounded-xl backdrop-blur-md">
              <RefreshCw className="w-6 h-6 text-cyan-300" />
            </div>
            Backup History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="flex items-center justify-center min-h-[400px] text-red-400 text-lg">
              {error}
            </div>
          ) : (
            <ScrollArea className="h-[600px] rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10">
                    <TableHead className="text-gray-300">Name</TableHead>
                    <TableHead className="text-gray-300">Size</TableHead>
                    <TableHead className="text-gray-300">Created</TableHead>
                    <TableHead className="text-gray-300">Status</TableHead>
                    <TableHead className="text-gray-300 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {backups.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-gray-500 py-12">
                        No backups found. Create your first one!
                      </TableCell>
                    </TableRow>
                  ) : (
                    backups.map((backup) => (
                      <TableRow key={backup.attributes.uuid} className="border-white/5 hover:bg-white/5 transition-all">
                        <TableCell className="font-medium text-white">
                          {backup.attributes.name || 'Untitled Backup'}
                        </TableCell>
                        <TableCell className="text-gray-300">
                          {formatBytes(backup.attributes.bytes)}
                        </TableCell>
                        <TableCell className="text-sm text-gray-400">
                          {formatDate(backup.attributes.created_at)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getBackupStatus(backup) === 'Creating' && (
                              <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
                            )}
                            <span className={
                              getBackupStatus(backup) === 'Completed' 
                                ? 'text-emerald-400 font-medium' 
                                : getBackupStatus(backup) === 'Failed' 
                                ? 'text-red-400' 
                                : 'text-yellow-400'
                            }>
                              {getBackupStatus(backup)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-cyan-500/50 text-cyan-300 hover:bg-cyan-500/20"
                            onClick={() => handleDownloadBackup(backup)}
                            disabled={!backup.attributes.is_successful}
                          >
                            <Download className="w-4 h-4 mr-1" />
                            Download
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="bg-red-500/20 border-red-500/50 text-red-300 hover:bg-red-500/30"
                            onClick={() => {
                              setSelectedBackup(backup);
                              setIsDeleteModalOpen(true);
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Create Backup Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="bg-neutral-950/95 backdrop-blur-2xl border-white/10">
          <DialogHeader>
            <DialogTitle className="text-2xl text-white">Create New Backup</DialogTitle>
            <DialogDescription className="text-gray-400">
              This will create a full snapshot of your server. The process may take a few minutes depending on server size.
            </DialogDescription>
          </DialogHeader>
          {createError && (
            <Alert variant="destructive" className="border-red-500/50 bg-red-500/10">
              <AlertDescription>{createError}</AlertDescription>
            </Alert>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateBackup} 
              disabled={createLoading}
              className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400"
            >
              {createLoading ? (
                <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <Plus className="w-5 h-5 mr-2" />
              )}
              Create Backup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="bg-neutral-950/95 backdrop-blur-2xl border-white/10">
          <DialogHeader>
            <DialogTitle className="text-2xl text-red-400">Delete Backup</DialogTitle>
            <DialogDescription className="text-gray-400">
              Are you sure you want to permanently delete this backup?
              <span className="block mt-2 text-white font-medium">
                {selectedBackup?.attributes.name || 'Untitled Backup'}
              </span>
              This action <strong>cannot be undone</strong>.
            </DialogDescription>
          </DialogHeader>
          {deleteError && (
            <Alert variant="destructive" className="border-red-500/50 bg-red-500/10">
              <AlertDescription>{deleteError}</AlertDescription>
            </Alert>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteBackup}
              disabled={deleteLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteLoading ? (
                <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <Trash2 className="w-5 h-5 mr-2" />
              )}
              Delete Forever
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BackupsPage;
