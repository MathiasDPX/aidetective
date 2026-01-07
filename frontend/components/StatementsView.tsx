import React, { useState } from 'react';
import { Statement, Suspect } from '../types';

interface StatementsViewProps {
  statements: Statement[];
  suspects: Suspect[];
  onAddStatement?: (statement: Partial<Statement>) => void;
  onUpdateStatement?: (statement: Statement) => void;
  onDeleteStatement?: (id: string) => void;
}

const StatementsView: React.FC<StatementsViewProps> = ({ statements, suspects }) => {
  const [filterBySuspect, setFilterBySuspect] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'time' | 'speaker'>('time');

  const filteredStatements = filterBySuspect
    ? statements.filter(s => s.speakerId === filterBySuspect)
    : statements;

  const sortedStatements = [...filteredStatements].sort((a, b) => {
    if (sortBy === 'time') {
      return a.timestamp.localeCompare(b.timestamp);
    } else {
      return a.speakerName.localeCompare(b.speakerName);
    }
  });

  return (
    <div className="animate-in fade-in duration-700">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-4xl font-serif text-white">Recorded Statements</h2>
          <span className="text-xs text-white/30 uppercase tracking-widest">{statements.length} Testimonies</span>
        </div>
      </div>

      {/* Filter and Sort Controls */}
      <div className="mb-8 space-y-4">
        <div>
          <label className="text-[10px] uppercase text-white/40 mb-2 block">Filter by Speaker</label>
          <select
            className="w-full md:w-64 bg-[#0a0a0a] border border-white/10 text-white p-2 text-sm focus:border-[#d4af37] outline-none"
            value={filterBySuspect || ''}
            onChange={e => setFilterBySuspect(e.target.value || null)}
          >
            <option value="">All Speakers</option>
            {suspects.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-[10px] uppercase text-white/40 mb-2 block">Sort by</label>
          <div className="flex gap-4">
            {['time', 'speaker'].map((option) => (
              <button
                key={option}
                onClick={() => setSortBy(option as 'time' | 'speaker')}
                className={`text-[10px] uppercase transition-colors ${
                  sortBy === option ? 'text-[#d4af37]' : 'text-white/40 hover:text-white/60'
                }`}
              >
                {option === 'time' ? 'By Time' : 'By Speaker'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {sortedStatements.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-white/40 uppercase text-sm tracking-widest">No statements recorded</p>
          </div>
        ) : (
          sortedStatements.map((statement) => {
            const speaker = suspects.find(s => s.id === statement.speakerId);
            return (
              <div key={statement.id} className="p-6 bg-[#0a0a0a] border border-white/5 hover:border-white/10 transition-all">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="text-sm font-serif text-[#d4af37]">{statement.speakerName}</h4>
                    <p className="text-[10px] text-white/40 uppercase tracking-widest">{statement.timestamp}</p>
                  </div>
                  {statement.context && (
                    <span className="text-[10px] uppercase bg-white/5 border border-white/10 px-2 py-1 text-white/50">
                      {statement.context}
                    </span>
                  )}
                </div>
                <p className="text-sm text-white/70 leading-relaxed italic">
                  "{statement.content}"
                </p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default StatementsView;
