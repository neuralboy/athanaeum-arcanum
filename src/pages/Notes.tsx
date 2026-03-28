import { useState, useEffect } from 'react';
import { getSupabaseClient } from '../services/supabaseClient';

interface Note {
  id: number;
  title: string | null;
  content: string | null;
  created_at: string;
  user_id: string | null;
}

export default function Notes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase.from('notes').select('*').order('created_at', { ascending: false });

        if (error) throw error;
        setNotes(data || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100 flex items-center justify-center">
        <div className="text-xl">Loading archival records...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100 flex items-center justify-center">
        <div className="text-red-400">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-amber-400">Archival Notes</h1>

        {notes.length === 0 ? (
          <p className="text-gray-400 italic">The archives are empty. Be the first to record a note.</p>
        ) : (
          <div className="space-y-4">
            {notes.map((note) => (
              <div
                key={note.id}
                className="bg-gray-800 rounded-lg p-6 border border-amber-700/30 hover:border-amber-500/50 transition-colors"
              >
                <h2 className="text-xl font-semibold text-amber-300 mb-2">
                  {note.title || 'Untitled Note'}
                </h2>
                <p className="text-gray-300 whitespace-pre-wrap mb-4">
                  {note.content || 'No content'}
                </p>
                <p className="text-sm text-gray-500">
                  Recorded: {new Date(note.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
