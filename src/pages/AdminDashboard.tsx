import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  LogOut, 
  Loader2, 
  Upload, 
  X, 
  Check, 
  AlertCircle,
  BookOpen,
  Image as ImageIcon
} from 'lucide-react';
import { Book } from '../types';

export default function AdminDashboard() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [authChecking, setAuthChecking] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [uploading, setUploading] = useState(false);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState<Partial<Book>>({
    title: '',
    author: '',
    category: 'Hidden Truths',
    date: '',
    description: '',
    longDescription: '',
    imageUrl: '',
    status: 'Available',
    accessibility: 'Standard Access'
  });

  useEffect(() => {
    checkAuth();
    fetchBooks();
  }, []);

  useEffect(() => {
    return () => {
      if (localPreview) URL.revokeObjectURL(localPreview);
    };
  }, [localPreview]);

  useEffect(() => {
    if (!isModalOpen && localPreview) {
      setLocalPreview(null);
    }
  }, [isModalOpen]);

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

  const fetchBooks = async () => {
    try {
      const res = await fetch('/api/books');
      const data = await res.json();
      setBooks(data);
    } catch {
      // Silently handle error
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    navigate('/admin/login');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create local preview
    const objectUrl = URL.createObjectURL(file);
    setLocalPreview(objectUrl);

    setUploading(true);
    const formDataUpload = new FormData();
    formDataUpload.append('image', file);

    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formDataUpload,
      });
      const data = await res.json();
      if (data.imageUrl) {
        setFormData(prev => ({ ...prev, imageUrl: data.imageUrl }));
      }
    } catch {
      // Silently handle upload error
    } finally {
      setUploading(false);
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.title || formData.title.trim().length < 2) {
      errors.title = 'Title must be at least 2 characters.';
    }
    if (!formData.author || formData.author.trim().length < 2) {
      errors.author = 'Author name must be at least 2 characters.';
    }
    if (!formData.description || formData.description.trim().length < 10) {
      errors.description = 'Short description must be at least 10 characters.';
    }
    if (!formData.longDescription || formData.longDescription.trim().length < 20) {
      errors.longDescription = 'Long archival description must be at least 20 characters.';
    }
    if (!formData.imageUrl && !localPreview) {
      errors.imageUrl = 'A manuscript cover image is required.';
    } else if (formData.imageUrl && !formData.imageUrl.startsWith('http') && !formData.imageUrl.startsWith('/uploads/')) {
      errors.imageUrl = 'Please provide a valid image URL (starting with http) or upload a file.';
    }
    if (!formData.date || formData.date.trim().length === 0) {
      errors.date = 'Archival date is required.';
    }
    if (!formData.accessibility || formData.accessibility.trim().length === 0) {
      errors.accessibility = 'Accessibility level is required.';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    
    if (!validateForm()) return;

    const url = editingBook 
      ? `/api/admin/books/${editingBook.id}` 
      : '/api/admin/books';
    const method = editingBook ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setIsModalOpen(false);
        setEditingBook(null);
        setFormData({
          title: '',
          author: '',
          category: 'Hidden Truths',
          date: '',
          description: '',
          longDescription: '',
          imageUrl: '',
          status: 'Available',
          accessibility: 'Standard Access'
        });
        fetchBooks();
      } else {
        const errorData = await res.json();
        setServerError(errorData.message || 'Failed to save manuscript. Please try again.');
      }
    } catch {
      setServerError('A connection error occurred. Please check your network.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you certain you wish to purge this manuscript from the archives?')) return;

    try {
      const res = await fetch(`/api/admin/books/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchBooks();
      }
    } catch {
      // Silently handle delete error
    }
  };

  const openEditModal = (book: Book) => {
    setEditingBook(book);
    setFormData(book);
    setFormErrors({});
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
            <h1 className="font-headline text-4xl uppercase tracking-tighter">Archive Management</h1>
            <p className="font-body italic text-on-surface-variant text-sm">Curating the collective knowledge of the Athanaeum.</p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => {
                setEditingBook(null);
                setFormData({
                  title: '',
                  author: '',
                  category: 'Hidden Truths',
                  date: '',
                  description: '',
                  longDescription: '',
                  imageUrl: '',
                  status: 'Available',
                  accessibility: 'Standard Access'
                });
                setFormErrors({});
                setIsModalOpen(true);
              }}
              className="bg-primary text-on-primary px-6 py-3 rounded-xl font-label uppercase tracking-widest text-xs flex items-center gap-2 hover:bg-primary/90 transition-colors"
            >
              <Plus size={18} />
              New Manuscript
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

        {/* Books List */}
        <div className="bg-surface-container-low rounded-3xl border border-outline-variant/15 overflow-hidden shadow-xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-bottom border-outline-variant/10 bg-surface-container-high/50">
                <th className="px-6 py-4 font-label text-[10px] uppercase tracking-widest text-outline">Manuscript</th>
                <th className="px-6 py-4 font-label text-[10px] uppercase tracking-widest text-outline">Author</th>
                <th className="px-6 py-4 font-label text-[10px] uppercase tracking-widest text-outline">Category</th>
                <th className="px-6 py-4 font-label text-[10px] uppercase tracking-widest text-outline">Status</th>
                <th className="px-6 py-4 font-label text-[10px] uppercase tracking-widest text-outline text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <Loader2 className="animate-spin mx-auto text-primary" size={32} />
                  </td>
                </tr>
              ) : books.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-on-surface-variant italic font-body">
                    The archives are currently empty.
                  </td>
                </tr>
              ) : (
                books.map((book) => (
                  <tr key={book.id} className="hover:bg-surface-container-high/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-16 bg-surface-container-highest rounded-lg overflow-hidden flex-shrink-0 border border-outline-variant/10">
                          {book.imageUrl ? (
                            <img src={book.imageUrl} alt={book.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-outline">
                              <BookOpen size={20} />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-headline text-lg text-on-surface group-hover:text-primary transition-colors">{book.title}</p>
                          <p className="font-label text-[10px] uppercase tracking-widest text-outline">{book.date}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-body text-sm text-on-surface-variant italic">{book.author}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 bg-surface-container-highest text-on-surface font-label text-[9px] uppercase tracking-widest rounded border border-outline-variant/20">
                        {book.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded font-label text-[9px] uppercase tracking-widest ${
                        book.status === 'Available' ? 'bg-success-container text-on-success-container' :
                        book.status === 'Restricted' ? 'bg-error-container text-on-error-container' :
                        'bg-warning-container text-on-warning-container'
                      }`}>
                        {book.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEditModal(book)}
                          className="p-2 text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(book.id)}
                          className="p-2 text-on-surface-variant hover:text-error hover:bg-error/10 rounded-lg transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
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
                className="relative w-full max-w-4xl bg-surface-container-low rounded-3xl border border-outline-variant/20 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
              >
                <div className="p-6 border-b border-outline-variant/15 flex justify-between items-center bg-surface-container-high/50">
                  <h2 className="font-headline text-2xl uppercase tracking-tight">
                    {editingBook ? 'Revise Manuscript' : 'New Archival Entry'}
                  </h2>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="p-2 hover:bg-surface-container-highest rounded-full transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 overflow-y-auto flex-1 space-y-8">
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Left Column: Image Upload */}
                    <div className="space-y-6">
                      <div>
                        <label className="block font-label text-[10px] uppercase tracking-widest text-outline mb-4">Manuscript Cover</label>
                        <div className={`relative aspect-[3/4] bg-surface-container-highest rounded-2xl border-2 border-dashed overflow-hidden group transition-colors ${
                          formErrors.imageUrl ? 'border-error/50' : 'border-outline-variant/30'
                        }`}>
                          {localPreview || formData.imageUrl ? (
                            <>
                              <img src={localPreview || formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <label className="cursor-pointer bg-white text-black px-4 py-2 rounded-full font-label text-[10px] uppercase tracking-widest flex items-center gap-2">
                                  <Upload size={14} />
                                  Change Image
                                  <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*" />
                                </label>
                              </div>
                              {uploading && (
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                  <Loader2 className="animate-spin text-white" size={32} />
                                </div>
                              )}
                            </>
                          ) : (
                            <label className="absolute inset-0 cursor-pointer flex flex-col items-center justify-center gap-4 text-outline hover:text-primary transition-colors">
                              {uploading ? (
                                <Loader2 className="animate-spin" size={32} />
                              ) : (
                                <>
                                  <ImageIcon size={48} strokeWidth={1} />
                                  <span className="font-label text-[10px] uppercase tracking-widest">Upload Manuscript Image</span>
                                </>
                              )}
                              <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*" />
                            </label>
                          )}
                        </div>
                        <div className="mt-4">
                          <label className="block font-label text-[10px] uppercase tracking-widest text-outline mb-2">Or Image URL</label>
                          <input
                            type="text"
                            value={formData.imageUrl}
                            onChange={(e) => {
                              setFormData(prev => ({ ...prev, imageUrl: e.target.value }));
                              if (formErrors.imageUrl) setFormErrors(prev => ({ ...prev, imageUrl: '' }));
                            }}
                            className={`w-full bg-surface-container-highest border rounded-xl px-4 py-2 text-on-surface focus:outline-none focus:border-primary transition-colors text-sm ${
                              formErrors.imageUrl ? 'border-error/50' : 'border-outline-variant/30'
                            }`}
                            placeholder="https://images.unsplash.com/..."
                          />
                          {formErrors.imageUrl && (
                            <p className="text-error text-[10px] font-label uppercase tracking-wider mt-2 flex items-center gap-1">
                              <AlertCircle size={12} /> {formErrors.imageUrl}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Details */}
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 gap-6">
                        <div>
                          <label className="block font-label text-[10px] uppercase tracking-widest text-outline mb-2">Title</label>
                          <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => {
                              setFormData(prev => ({ ...prev, title: e.target.value }));
                              if (formErrors.title) setFormErrors(prev => ({ ...prev, title: '' }));
                            }}
                            className={`w-full bg-surface-container-highest border rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary transition-colors ${
                              formErrors.title ? 'border-error/50' : 'border-outline-variant/30'
                            }`}
                          />
                          {formErrors.title && (
                            <p className="text-error text-[10px] font-label uppercase tracking-wider mt-1 flex items-center gap-1">
                              <AlertCircle size={12} /> {formErrors.title}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="block font-label text-[10px] uppercase tracking-widest text-outline mb-2">Author</label>
                          <input
                            type="text"
                            value={formData.author}
                            onChange={(e) => {
                              setFormData(prev => ({ ...prev, author: e.target.value }));
                              if (formErrors.author) setFormErrors(prev => ({ ...prev, author: '' }));
                            }}
                            className={`w-full bg-surface-container-highest border rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary transition-colors ${
                              formErrors.author ? 'border-error/50' : 'border-outline-variant/30'
                            }`}
                          />
                          {formErrors.author && (
                            <p className="text-error text-[10px] font-label uppercase tracking-wider mt-1 flex items-center gap-1">
                              <AlertCircle size={12} /> {formErrors.author}
                            </p>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block font-label text-[10px] uppercase tracking-widest text-outline mb-2">Category</label>
                            <select
                              value={formData.category}
                              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                              className="w-full bg-surface-container-highest border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary transition-colors"
                            >
                              <option>Hidden Truths</option>
                              <option>History</option>
                              <option>Science</option>
                              <option>Esoterica</option>
                            </select>
                          </div>
                          <div>
                            <label className="block font-label text-[10px] uppercase tracking-widest text-outline mb-2">Archival Date</label>
                            <input
                              type="text"
                              value={formData.date}
                              onChange={(e) => {
                                setFormData(prev => ({ ...prev, date: e.target.value }));
                                if (formErrors.date) setFormErrors(prev => ({ ...prev, date: '' }));
                              }}
                              className={`w-full bg-surface-container-highest border rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary transition-colors ${
                                formErrors.date ? 'border-error/50' : 'border-outline-variant/30'
                              }`}
                              placeholder="e.g. 15th Century"
                            />
                            {formErrors.date && (
                              <p className="text-error text-[10px] font-label uppercase tracking-wider mt-1 flex items-center gap-1">
                                <AlertCircle size={12} /> {formErrors.date}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block font-label text-[10px] uppercase tracking-widest text-outline mb-2">Status</label>
                            <select
                              value={formData.status}
                              onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                              className="w-full bg-surface-container-highest border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary transition-colors"
                            >
                              <option value="Available">Available</option>
                              <option value="Restricted">Restricted</option>
                              <option value="In Repair">In Repair</option>
                            </select>
                          </div>
                          <div>
                            <label className="block font-label text-[10px] uppercase tracking-widest text-outline mb-2">Accessibility</label>
                            <input
                              type="text"
                              value={formData.accessibility}
                              onChange={(e) => {
                                setFormData(prev => ({ ...prev, accessibility: e.target.value }));
                                if (formErrors.accessibility) setFormErrors(prev => ({ ...prev, accessibility: '' }));
                              }}
                              className={`w-full bg-surface-container-highest border rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary transition-colors ${
                                formErrors.accessibility ? 'border-error/50' : 'border-outline-variant/30'
                              }`}
                              placeholder="e.g. Level III Clearance"
                            />
                            {formErrors.accessibility && (
                              <p className="text-error text-[10px] font-label uppercase tracking-wider mt-1 flex items-center gap-1">
                                <AlertCircle size={12} /> {formErrors.accessibility}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block font-label text-[10px] uppercase tracking-widest text-outline mb-2">Short Description</label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => {
                          setFormData(prev => ({ ...prev, description: e.target.value }));
                          if (formErrors.description) setFormErrors(prev => ({ ...prev, description: '' }));
                        }}
                        className={`w-full bg-surface-container-highest border rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary transition-colors h-24 resize-none ${
                          formErrors.description ? 'border-error/50' : 'border-outline-variant/30'
                        }`}
                      />
                      {formErrors.description && (
                        <p className="text-error text-[10px] font-label uppercase tracking-wider mt-1 flex items-center gap-1">
                          <AlertCircle size={12} /> {formErrors.description}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block font-label text-[10px] uppercase tracking-widest text-outline mb-2">Long Archival Description</label>
                      <textarea
                        value={formData.longDescription}
                        onChange={(e) => {
                          setFormData(prev => ({ ...prev, longDescription: e.target.value }));
                          if (formErrors.longDescription) setFormErrors(prev => ({ ...prev, longDescription: '' }));
                        }}
                        className={`w-full bg-surface-container-highest border rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary transition-colors h-48 resize-none ${
                          formErrors.longDescription ? 'border-error/50' : 'border-outline-variant/30'
                        }`}
                      />
                      {formErrors.longDescription && (
                        <p className="text-error text-[10px] font-label uppercase tracking-wider mt-1 flex items-center gap-1">
                          <AlertCircle size={12} /> {formErrors.longDescription}
                        </p>
                      )}
                    </div>
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
                      {editingBook ? 'Update Archival Record' : 'Commit to Archives'}
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
