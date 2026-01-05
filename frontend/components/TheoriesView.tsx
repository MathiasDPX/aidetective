
import React from 'react';
import { Theory, Suspect, Clue } from '../types';

interface TheoriesViewProps {
  theories: Theory[];
  suspects: Suspect[];
  clues: Clue[];
  onAddTheory?: (theory: Partial<Theory>) => void;
}

const TheoriesView: React.FC<TheoriesViewProps> = ({ theories, suspects, clues, onAddTheory }) => {
  const [isAdding, setIsAdding] = React.useState(false);
  const [newTheory, setNewTheory] = React.useState<Partial<Theory>>({ title: '', content: '', linkedSuspects: [], linkedClues: [] });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onAddTheory && newTheory.title && newTheory.content) {
      onAddTheory(newTheory);
      setNewTheory({ title: '', content: '', linkedSuspects: [], linkedClues: [] });
      setIsAdding(false);
    }
  };

  return (
    <div className="animate-in fade-in duration-700">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-4xl font-serif text-white">Hypotheses</h2>
          <span className="text-xs text-white/30 uppercase tracking-widest">Connecting the Dots</span>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="px-4 py-2 border border-[#d4af37] text-[#d4af37] text-xs uppercase tracking-widest hover:bg-[#d4af37] hover:text-[#0a0a0a] transition-all"
        >
          {isAdding ? 'Cancel' : '+ Add Theory'}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="mb-12 p-6 border border-white/10 bg-white/5 space-y-4">
          <div>
            <label className="block text-[10px] uppercase text-white/40 mb-1">Theory Title</label>
            <input
              className="w-full bg-[#0a0a0a] border border-white/10 text-white p-2 text-sm focus:border-[#d4af37] outline-none"
              value={newTheory.title}
              onChange={e => setNewTheory({ ...newTheory, title: e.target.value })}
              placeholder="The Butler's Secret..."
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase text-white/40 mb-1">Elaboration</label>
            <textarea
              className="w-full bg-[#0a0a0a] border border-white/10 text-white p-2 text-sm focus:border-[#d4af37] outline-none h-32"
              value={newTheory.content}
              onChange={e => setNewTheory({ ...newTheory, content: e.target.value })}
              placeholder="Describe the hypothesis..."
            />
          </div>

          {/* Simplified linking - could be improved with multi-select but keeping it simple for now */}

          <div className="flex justify-end pt-2">
            <button type="submit" className="px-6 py-2 bg-[#d4af37] text-black text-xs uppercase font-bold tracking-widest">
              Propose Theory
            </button>
          </div>
        </form>
      )}

      <div className="space-y-8">
        {theories.map((theory) => (
          <div key={theory.id} className="p-10 border border-white/5 bg-gradient-to-br from-[#0c0c0c] to-transparent relative overflow-hidden">
            <div className="absolute top-0 right-0 w-1 h-full bg-[#d4af37]" />

            <h3 className="text-3xl font-serif text-white mb-6">{theory.title}</h3>

            <p className="text-white/70 leading-relaxed mb-10 text-lg">
              {theory.content}
            </p>

            <div className="grid grid-cols-2 gap-8 border-t border-white/5 pt-8">
              <div>
                <h4 className="text-[10px] uppercase tracking-widest text-[#d4af37] mb-3">Linked Suspects</h4>
                <div className="flex gap-2 flex-wrap">
                  {theory.linkedSuspects.map(sid => {
                    const suspect = suspects.find(s => s.id === sid);
                    return (
                      <span key={sid} className="px-3 py-1 bg-white/5 border border-white/10 text-xs text-white/60">
                        {suspect ? suspect.name : sid}
                      </span>
                    );
                  })}
                </div>
              </div>
              <div>
                <h4 className="text-[10px] uppercase tracking-widest text-[#d4af37] mb-3">Linked Evidence</h4>
                <div className="flex gap-2 flex-wrap">
                  {theory.linkedClues.map(cid => {
                    const clue = clues.find(c => c.id === cid);
                    return (
                      <span key={cid} className="px-3 py-1 bg-white/5 border border-white/10 text-xs text-white/60">
                        {clue ? clue.title : cid}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        ))}

        <button className="w-full py-12 border border-dashed border-white/10 hover:border-white/30 hover:bg-white/5 transition-all text-white/20 hover:text-white/60 uppercase tracking-[0.3em] text-xs">
          Draft New Theory
        </button>
      </div>
    </div>
  );
};

export default TheoriesView;
