
import React, { useState } from 'react';
import { Suspect, Statement } from '../types';

interface SuspectsViewProps {
  suspects: Suspect[];
  statements: Statement[];
  onUpdateSuspect?: (suspect: Suspect) => void;
  onAddSuspect?: (suspect: Partial<Suspect>) => void;
}

const SuspectsView: React.FC<SuspectsViewProps> = ({ suspects, statements, onUpdateSuspect, onAddSuspect }) => {
  const [selectedSuspect, setSelectedSuspect] = useState<Suspect | null>(suspects[0]);
  const [isAdding, setIsAdding] = useState(false);
  const [newSuspect, setNewSuspect] = useState<Partial<Suspect>>({ name: '', role: '', motive: '', alibi: '' });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (onAddSuspect && newSuspect.name && newSuspect.role) {
      onAddSuspect(newSuspect);
      setNewSuspect({ name: '', role: '', motive: '', alibi: '' });
      setIsAdding(false);
    } else {
      alert("Please fill in at least the Name and Role.");
    }
  };

  const getPlaceholderColor = (name: string) => {
    const colors = [
      'from-red-900/40 to-red-800/20',
      'from-blue-900/40 to-blue-800/20',
      'from-green-900/40 to-green-800/20',
      'from-yellow-900/40 to-yellow-800/20',
      'from-purple-900/40 to-purple-800/20',
      'from-pink-900/40 to-pink-800/20',
      'from-indigo-900/40 to-indigo-800/20',
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  };

  return (
    <div className="animate-in fade-in duration-700">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-4xl font-serif text-white">Suspect List</h2>
          <span className="text-xs text-white/30 uppercase tracking-widest">{suspects.length} Individuals of Interest</span>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="px-4 py-2 border border-[#d4af37] text-[#d4af37] text-xs uppercase tracking-widest hover:bg-[#d4af37] hover:text-[#0a0a0a] transition-all"
        >
          {isAdding ? 'Cancel' : '+ Add Suspect'}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAdd} className="mb-12 p-6 border border-white/10 bg-white/5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] uppercase text-white/40 mb-1">Name</label>
              <input
                className="w-full bg-[#0a0a0a] border border-white/10 text-white p-2 text-sm focus:border-[#d4af37] outline-none"
                value={newSuspect.name}
                onChange={e => setNewSuspect({ ...newSuspect, name: e.target.value })}
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase text-white/40 mb-1">Role</label>
              <input
                className="w-full bg-[#0a0a0a] border border-white/10 text-white p-2 text-sm focus:border-[#d4af37] outline-none"
                value={newSuspect.role}
                onChange={e => setNewSuspect({ ...newSuspect, role: e.target.value })}
                placeholder="Gardener"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase text-white/40 mb-1">Alibi</label>
              <input
                className="w-full bg-[#0a0a0a] border border-white/10 text-white p-2 text-sm focus:border-[#d4af37] outline-none"
                value={newSuspect.alibi}
                onChange={e => setNewSuspect({ ...newSuspect, alibi: e.target.value })}
                placeholder="Where were they?"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase text-white/40 mb-1">Motive</label>
              <input
                className="w-full bg-[#0a0a0a] border border-white/10 text-white p-2 text-sm focus:border-[#d4af37] outline-none"
                value={newSuspect.motive}
                onChange={e => setNewSuspect({ ...newSuspect, motive: e.target.value })}
                placeholder="Why would they do it?"
              />
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <button type="submit" className="px-6 py-2 bg-[#d4af37] text-black text-xs uppercase font-bold tracking-widest">
              Create Profile
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {suspects.map((s) => (
          <div
            key={s.id}
            onClick={() => setSelectedSuspect(s)}
            className={`cursor-pointer transition-all border p-4 group overflow-hidden relative ${selectedSuspect?.id === s.id ? 'border-[#d4af37] bg-white/5' : 'border-white/5 hover:border-white/20'
              }`}
          >
            {s.imageUrl && s.imageUrl.startsWith('http') ? (
              <img src={s.imageUrl} alt={s.name} className="w-full aspect-[4/5] object-cover mb-4 grayscale group-hover:grayscale-0 transition-all duration-500" />
            ) : (
              <div className={`w-full aspect-square mb-4 bg-gradient-to-br ${getPlaceholderColor(s.name)} flex items-center justify-center border border-white/5`}>
                <span className="text-4xl font-serif text-white/20 font-bold">{getInitials(s.name)}</span>
              </div>
            )}

            <div className="text-xs uppercase tracking-widest text-[#d4af37] mb-1 truncate">{s.role}</div>
            <h3 className="text-xl font-serif text-white truncate">{s.name}</h3>
          </div>
        ))}
      </div>

      {selectedSuspect && (
        <div className="border-t border-white/10 pt-8 animate-in slide-in-from-bottom-4 duration-500">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h4 className="text-xs uppercase tracking-[0.2em] text-[#d4af37] mb-4">Official Profile</h4>
              <p className="text-white/80 leading-relaxed mb-8 italic">"{selectedSuspect.description}"</p>

              <div className="space-y-6">
                <section>
                  <h5 className="text-[10px] uppercase tracking-widest text-white/40 mb-2">Verified Alibi</h5>
                  <div className="p-4 bg-white/5 border border-white/5 text-sm text-white/70">
                    {selectedSuspect.alibi}
                  </div>
                </section>
                <section>
                  <h5 className="text-[10px] uppercase tracking-widest text-white/40 mb-2">Presumed Motive</h5>
                  <div className="p-4 bg-red-900/10 border border-red-900/20 text-sm text-red-100/70">
                    {selectedSuspect.motive}
                  </div>
                </section>
              </div>
            </div>

            <div>
              <h4 className="text-xs uppercase tracking-[0.2em] text-[#d4af37] mb-4">Recorded Statements</h4>
              <div className="space-y-4">
                {statements.filter(st => st.speakerId === selectedSuspect.id).map(st => (
                  <div key={st.id} className="relative p-6 bg-[#0a0a0a] border border-white/5 italic">
                    <div className="absolute top-0 right-0 p-2 text-[8px] text-white/20 font-mono">{st.timestamp}</div>
                    <span className="text-white/40 text-2xl absolute -top-1 left-2 font-serif">“</span>
                    <p className="text-white/70 text-sm relative z-10">{st.content}</p>
                    <span className="text-white/40 text-2xl absolute -bottom-6 right-4 font-serif">”</span>
                  </div>
                ))}
                {statements.filter(st => st.speakerId === selectedSuspect.id).length === 0 && (
                  <div className="text-xs text-white/20 uppercase tracking-widest py-8 text-center border border-dashed border-white/10">
                    No recorded statements for this individual
                  </div>
                )}
              </div>

              <div className="mt-8">
                <h5 className="text-[10px] uppercase tracking-widest text-white/40 mb-2">Investigator Notes</h5>
                <textarea
                  className="w-full bg-transparent border border-white/5 p-4 text-sm text-white/60 focus:border-[#d4af37] transition-colors outline-none h-32 resize-none"
                  placeholder="Draft your observations here..."
                  defaultValue={selectedSuspect.notes}
                  onChange={(e) => {
                    if (onUpdateSuspect) {
                      onUpdateSuspect({ ...selectedSuspect, notes: e.target.value });
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuspectsView;
