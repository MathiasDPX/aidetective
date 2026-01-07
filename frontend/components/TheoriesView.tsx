
import React from 'react';
import { Theory, Suspect, Clue } from '../types';

interface TheoriesViewProps {
  theories: Theory[];
  suspects: Suspect[];
  clues: Clue[];
  onAddTheory?: (theory: Partial<Theory>) => void;
  onUpdateTheory?: (theory: Theory) => void;
  onDeleteTheory?: (id: string) => void;
}

const TheoriesView: React.FC<TheoriesViewProps> = ({ theories, suspects, clues }) => {
  return (
    <div className="animate-in fade-in duration-700">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-4xl font-serif text-white">Hypotheses</h2>
          <span className="text-xs text-white/30 uppercase tracking-widest">Connecting the Dots</span>
        </div>
      </div>

      {theories.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-white/40 uppercase text-sm tracking-widest">No theories recorded yet</p>
        </div>
      ) : (
        <div className="space-y-6">
          {theories.map((theory) => {
            const linkedSuspects = (theory.linkedSuspects || [])
              .map(id => suspects.find(s => s.id === id))
              .filter(Boolean);
            
            const linkedCluesData = (theory.linkedClues || [])
              .map(id => clues.find(c => c.id === id))
              .filter(Boolean);

            return (
              <div key={theory.id} className="p-8 border border-white/10 bg-white/5 hover:border-[#d4af37]/30 transition-all">
                <h3 className="text-2xl font-serif text-white mb-4">{theory.title}</h3>
                
                <p className="text-sm text-white/70 leading-relaxed mb-6">
                  {theory.content}
                </p>

                {linkedSuspects.length > 0 && (
                  <div className="mb-4">
                    <h5 className="text-[10px] uppercase tracking-widest text-white/40 mb-2">Implicated Suspects</h5>
                    <div className="flex flex-wrap gap-2">
                      {linkedSuspects.map(suspect => suspect && (
                        <span key={suspect.id} className="text-[10px] uppercase border border-white/20 px-3 py-1 text-white/60 bg-white/5">
                          {suspect.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {linkedCluesData.length > 0 && (
                  <div>
                    <h5 className="text-[10px] uppercase tracking-widest text-white/40 mb-2">Supporting Evidence</h5>
                    <div className="flex flex-wrap gap-2">
                      {linkedCluesData.map(clue => clue && (
                        <span key={clue.id} className="text-[10px] uppercase border border-white/20 px-3 py-1 text-white/60 bg-white/5">
                          {clue.title}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TheoriesView;
