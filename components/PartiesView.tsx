

import React, { useState } from 'react';
import { Suspect, Statement } from '../types';

interface PartiesViewProps {
  parties: Suspect[];
  statements: Statement[];
  onUpdateParty?: (party: Suspect) => void;
  onAddParty?: (party: Partial<Suspect>) => void;
  onDeleteParty?: (id: string) => void;
}

const PartiesView: React.FC<PartiesViewProps> = ({ parties, statements }) => {
  const [selectedParty, setSelectedParty] = useState<Suspect | null>(parties[0] || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  const filteredParties = parties.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSuspectClick = (party: Suspect) => {
    setSelectedParty(party);
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

  const handleImageError = (partyId: string) => {
    setFailedImages(prev => new Set(prev).add(partyId));
  };

  return (
    <div className="animate-in fade-in duration-700">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-4xl font-serif text-white">Party List</h2>
          <span className="text-xs text-white/30 uppercase tracking-widest">{filteredParties.length} Individuals of Interest</span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-8">
        <div className="relative">
          <input
            type="text"
            placeholder="Search parties by name or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0a0a0a] border border-white/10 text-white p-3 pl-10 pr-20 text-sm focus:border-[#d4af37] outline-none transition-colors"
          />
          <svg className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] uppercase tracking-widest text-[#d4af37] hover:text-white transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {filteredParties.map((s) => (
          <div
            key={s.id}
            onClick={() => handleSuspectClick(s)}
            className={`cursor-pointer transition-all border p-4 group overflow-hidden relative ${selectedParty?.id === s.id ? 'border-[#d4af37] bg-white/5' : 'border-white/5 hover:border-white/20'
              }`}
          >
            {/* Image */}
            <div className="relative">
              {s.imageUrl && !failedImages.has(s.id) ? (
                <img 
                  src={s.imageUrl} 
                  alt={s.name} 
                  className="w-full aspect-[4/5] object-cover mb-4 grayscale group-hover:grayscale-0 transition-all duration-500"
                  onError={() => handleImageError(s.id)}
                />
              ) : (
                <div className={`w-full aspect-square mb-4 bg-gradient-to-br ${getPlaceholderColor(s.name)} flex items-center justify-center border border-white/5`}>
                  <span className="text-4xl font-serif text-white/20 font-bold">{getInitials(s.name)}</span>
                </div>
              )}
            </div>

            <div className="text-xs uppercase tracking-widest text-[#d4af37] mb-1 truncate">{s.role}</div>
            <h3 className="text-xl font-serif text-white truncate">{s.name}</h3>
          </div>
        ))}
      </div>

      {selectedParty && (
        <div className="border-t border-white/10 pt-8 animate-in slide-in-from-bottom-4 duration-500 relative">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h4 className="text-xs uppercase tracking-[0.2em] text-[#d4af37] mb-4">Official Profile</h4>
              <p className="text-white/80 leading-relaxed mb-8 italic">{selectedParty.description}</p>
              <div className="space-y-6">
                <section>
                  <h5 className="text-[10px] uppercase tracking-widest text-white/40 mb-2">Verified Alibi</h5>
                  <div className="p-4 bg-white/5 border border-white/5 text-sm text-white/70">
                    {selectedParty.alibi || 'No alibi recorded.'}
                  </div>
                </section>
                <section>
                  <h5 className="text-[10px] uppercase tracking-widest text-white/40 mb-2">Presumed Motive</h5>
                  <div className="p-4 bg-red-900/10 border border-red-900/20 text-sm text-red-100/70">
                    {selectedParty.motive || 'Motive unclear.'}
                  </div>
                </section>
              </div>
            </div>

            <div>
              <h4 className="text-xs uppercase tracking-[0.2em] text-[#d4af37] mb-4">Recorded Statements</h4>
              <div className="space-y-4">
                {statements.filter(st => st.speakerId === selectedParty.id).map(st => (
                  <div key={st.id} className="relative p-6 bg-[#0a0a0a] border border-white/5 italic">
                    <div className="absolute top-0 right-0 p-2 text-[8px] text-white/20 font-mono">{st.timestamp}</div>
                    <span className="text-white/40 text-2xl absolute -top-1 left-2 font-serif"></span>
                    <p className="text-white/70 text-sm relative z-10">{st.content}</p>
                    <span className="text-white/40 text-2xl absolute -bottom-6 right-4 font-serif"></span>
                  </div>
                ))}
                {statements.filter(st => st.speakerId === selectedParty.id).length === 0 && (
                  <div className="text-xs text-white/20 uppercase tracking-widest py-8 text-center border border-dashed border-white/10">
                    No recorded statements for this individual
                  </div>
                )}
              </div>

              <div className="mt-8">
                <h5 className="text-[10px] uppercase tracking-widest text-white/40 mb-2">Investigator Notes</h5>
                <div className="w-full bg-transparent border border-white/5 p-4 text-sm text-white/60 h-32 resize-none overflow-y-auto">
                  {selectedParty.notes || 'No notes recorded.'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PartiesView;
