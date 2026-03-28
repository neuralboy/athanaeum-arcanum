import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus,
  Edit2,
  Trash2,
  LogOut,
  Loader2,
  X,
  Check,
  AlertCircle,
  FileText
} from 'lucide-react';

interface Note {
  id: number;
  title: string | null;
  content: string | null;
  created_at: string;
}

export default function AdminNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [authChecking, setAuthChecking] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const navigate = useNavigate();

  const [formData, setFormData] = useState<{ title: string; content: string }>({
    title: '',
    content: ''
  });

  useEffect(() => {
    checkAuth();
    fetchNotes();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/admin/check');
      const data = await res.json();
      if (!data.authenticated) {
        navigate('/admin/login');
      }
    } catch (err) {
      navigate('/admin/login');
    } finally {
      setAuthChecking(false);
    }
  };

  const fetchNotes = async () => {
    try {
      const res = await fetch('/api/notes');
      const data = await res.json();
      setNotes(data);
    } catch (err) {
      console.error('Failed to fetch notes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    navigate('/admin/login');
  };

  const validateForm = () => {
    if (!formData.title || formData.title.trim().length < 2) {
      return 'Title must be at least 2 characters.';
    }
    if (!formData.content || formData.content.trim().length < 10) {
      return 'Content must be at least 10 characters.';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    const error = validateForm();
    if (error) {
      setServerError(error);
      return;
    }

    const url = editingNote ? `/api/notes/${editingNote.id}` : '/api/notes';
    const method = editingNote ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setIsModalOpen(false);
        setEditingNote(null);
        setFormData({ title: '', content: '' });
        fetchNotes();
      } else {
        const errorData = await res.json();
        setServerError(errorData.error || 'Failed to save note. Please try again.');
      }
    } catch {
      setServerError('A connection error occurred. Please check your network.');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you certain you wish to purge this note from the archives?')) return;

    try {
      const res = await fetch(`/api/notes/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchNotes();
      }
    } catch {
      console.error('Failed to delete note');
    }
  };

  const openEditModal = (note: Note) => {
    setEditingNote(note);
    setFormData({ title: note.title || '', content: note.content || '' });
    setServerError(null);
    setIsModalOpen(true);
  };

  if (authChecking) {
    return (
      <div className="min-h-screen bg-surface-container-lowest flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-container-lowest text-on-surface p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="font-headline text-4xl uppercase tracking-tighter">Archival Notes</h1>
            <p className="font-body italic text-on-surface-variant text-sm">Record and manage research annotations.</p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => {
                setEditingNote(null);
                setFormData({ title: '', content: '' });
                setServerError(null);
                setIsModalOpen(true);
              }}
              className="bg-primary text-on-primary px-6 py-3 rounded-xl font-label uppercase tracking-widest text-xs flex items-center gap-2 hover:bg-primary/90 transition-colors"
            >
              <Plus size={18} />
              New Note
            </button>
            <button
              onClick={handleLogout}
              className="bg-surface-container-high text-on-surface px-6 py-3 rounded-xl font-label uppercase tracking-widest text-xs flex items-center gap-2 hover:bg-surface-container-highest transition-colors border border-outline-variant/20"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </header>

        {/* Notes List */}
        <div className="bg-surface-container-low rounded-3xl border border-outline-variant/15 overflow-hidden shadow-xl">
          <div className="p-6 border-b border-outline-variant/10 bg-surface-container-high/50">
            <div className="flex items-center gap-3">
              <FileText className="text-primary" size={24} />
              <h2 className="font-label text-sm uppercase tracking-widest text-outline">Research Notes</h2>
            </div>
          </div>
          
          <div className="divide-y divide-outline-variant/10">
            {loading ? (
              <div className="px-6 py-20 text-center">
                <Loader2 className="animate-spin mx-auto text-primary" size={32} />
              </div>
            ) : notes.length === 0 ? (
              <div className="px-6 py-20 text-center text-on-surface-variant italic font-body">
                The archives contain no notes yet.
              </div>
            ) : (
              notes.map((note) => (
                <div key={note.id} className="p-6 hover:bg-surface-container-high/30 transition-colors group">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <h3 className="font-headline text-lg text-on-surface group-hover:text-primary transition-colors mb-2">
                        {note.title || 'Untitled Note'}
                      </h3>
                      <p className="font-body text-sm text-on-surface-variant whitespace-pre-wrap mb-3">
                        {note.content || 'No content'}
                      </p>
                      <p className="font-label text-[9px] uppercase tracking-widest text-outline">
                        Recorded: {new Date(note.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditModal(note)}
                        className="p-2 text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(note.id)}
                        className="p-2 text-on-surface-variant hover:text-error hover:bg-error/10 rounded-lg transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Modal */}
        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsModalOpen(false)}
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-2xl bg-surface-container-low rounded-3xl border border-outline-variant/20 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
              >
                <div className="p-6 border-b border-outline-variant/15 flex justify-between items-center bg-surface-container-high/50">
                  <h2 className="font-headline text-2xl uppercase tracking-tight">
                    {editingNote ? 'Revise Note' : 'New Archival Note'}
                  </h2>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="p-2 hover:bg-surface-container-highest rounded-full transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 overflow-y-auto flex-1 space-y-6">
                  {serverError && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-error-container text-on-error-container p-4 rounded-xl flex items-center gap-3 border border-error/20"
                    >
                      <AlertCircle size={20} />
                      <p className="font-label text-xs uppercase tracking-widest">{serverError}</p>
                    </motion.div>
                  )}

                  <div>
                    <label className="block font-label text-[10px] uppercase tracking-widest text-outline mb-2">Title</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => {
                        setFormData(prev => ({ ...prev, title: e.target.value }));
                        if (serverError) setServerError(null);
                      }}
                      className="w-full bg-surface-container-highest border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary transition-colors"
                      placeholder="Enter note title..."
                    />
                  </div>

                  <div>
                    <label className="block font-label text-[10px] uppercase tracking-widest text-outline mb-2">Content</label>
                    <textarea
                      value={formData.content}
                      onChange={(e) => {
                        setFormData(prev => ({ ...prev, content: e.target.value }));
                        if (serverError) setServerError(null);
                      }}
                      className="w-full bg-surface-container-highest border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary transition-colors h-48 resize-none"
                      placeholder="Record your research findings..."
                    />
                  </div>

                  <div className="flex justify-end gap-4 pt-4 border-t border-outline-variant/15">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-8 py-4 rounded-xl font-label uppercase tracking-widest text-xs text-on-surface hover:bg-surface-container-highest transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-primary text-on-primary px-12 py-4 rounded-xl font-label uppercase tracking-widest text-xs hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                    >
                      {editingNote ? 'Update Note' : 'Commit to Archives'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
