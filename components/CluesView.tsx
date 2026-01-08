

import React, { useState } from 'react';
import { Clue, Suspect } from '../types';

interface CluesViewProps {
  clues: Clue[];
  suspects: Suspect[];
  onAddClue?: (clue: Partial<Clue>) => void;
  onUpdateClue?: (clue: Clue) => void;
  onDeleteClue?: (id: string) => void;
}

const CluesView: React.FC<CluesViewProps> = ({ clues, suspects }) => {
  return (
    <div className="animate-in fade-in duration-700">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-4xl font-serif text-white">Evidence Locker</h2>
          <span className="text-xs text-white/30 uppercase tracking-widest">{clues.length} Items Cataloged</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         {clues.map((clue) => {
          return (
            <div
              key={clue.id}
              className="group relative p-8 bg-[#0a0a0a] border border-white/5 hover:border-[#d4af37]/30 transition-all flex flex-col justify-between overflow-hidden"
            >
              {/* Background Texture/Accent */}
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/5 rounded-full blur-3xl group-hover:bg-[#d4af37]/10 transition-colors" />

              <div>
                 <div className="flex justify-between items-start mb-6">
                   <span className="text-[10px] text-white/30 font-mono">{clue.source}</span>
                 </div>

                <h3 className="text-2xl font-serif text-white mb-3 group-hover:text-[#d4af37] transition-colors">{clue.title}</h3>
                <p className="text-sm text-white/50 leading-relaxed italic mb-4">
                  {clue.description}
                </p>

                {/* Display Linked Suspects */}
                {clue.linkedSuspects && clue.linkedSuspects.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {clue.linkedSuspects.map(sname => {
                      { sname }
                      const suspect = suspects.find(s => s.name.toLowerCase() === sname.toLowerCase());
                      return suspect ? (
                        <span key={sname} className="text-[10px] uppercase border border-white/10 px-2 py-0.5 text-white/40">
                          Link: {suspect.name}
                        </span>
                      ) : null;
                    })}
                  </div>
                )}
              </div>

              {clue.document && (
              <div className="flex items-center justify-between border-t border-white/5 pt-4">
                  <button className="text-[10px] uppercase tracking-widest text-white/30"><a href={clue.document} target="_blank">View Document</a></button>
              </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  );
};

export default CluesView;
