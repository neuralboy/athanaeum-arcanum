import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Lock, Loader2 } from 'lucide-react';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        navigate('/admin');
      } else {
        const data = await res.json();
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-container-lowest flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-surface-container-low p-8 rounded-3xl border border-outline-variant/20 shadow-2xl"
      >
        <div className="flex justify-center mb-8">
          <div className="p-4 bg-primary/10 rounded-full text-primary">
            <Lock size={32} />
          </div>
        </div>
        
        <h1 className="font-headline text-3xl text-center text-on-surface mb-2 uppercase tracking-tighter">Archivist Access</h1>
        <p className="font-body text-on-surface-variant text-center mb-8 italic text-sm">Enter the cipher to access the restricted archives.</p>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block font-label text-[10px] uppercase tracking-widest text-outline mb-2 ml-1">Archive Cipher</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-surface-container-highest border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary transition-colors font-mono"
              placeholder="••••••••••••"
              required
            />
          </div>

          {error && (
            <p className="text-error text-xs font-label uppercase tracking-wider text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-on-primary font-label uppercase tracking-[0.2em] py-4 rounded-xl hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : 'Authenticate'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
