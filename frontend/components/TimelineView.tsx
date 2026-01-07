import React, { useState } from 'react';
import { TimelineEvent, Suspect } from '../types';

interface TimelineViewProps {
  timeline: TimelineEvent[];
  suspects: Suspect[];
  onAddEvent?: (event: Partial<TimelineEvent>) => void;
  onUpdateEvent?: (event: TimelineEvent) => void;
  onDeleteEvent?: (id: string) => void;
}

const TimelineView: React.FC<TimelineViewProps> = ({ timeline, suspects }) => {
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const sortedTimeline = [...timeline].sort((a, b) => {
    const dateTimeA = `${a.date}T${a.time}`;
    const dateTimeB = `${b.date}T${b.time}`;
    return sortOrder === 'asc'
      ? dateTimeA.localeCompare(dateTimeB)
      : dateTimeB.localeCompare(dateTimeA);
  });

  return (
    <div className="animate-in fade-in duration-700 pb-12">
      <div className="flex justify-between items-end mb-12">
        <div>
          <h2 className="text-4xl font-serif text-white">Event Timeline</h2>
          <span className="text-xs text-white/30 uppercase tracking-widest">{sortedTimeline.length} Points in Time Recorded</span>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="px-4 py-2 border border-white/10 text-white/40 text-[10px] uppercase tracking-widest hover:border-white/30 hover:text-white transition-all flex items-center gap-2"
          >
            <svg className={`w-3 h-3 transition-transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
            </svg>
            {sortOrder === 'asc' ? 'Oldest First' : 'Newest First'}
          </button>
        </div>
      </div>

      <div className="relative">
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#d4af37]/50 to-[#d4af37]/0" />

        <div className="space-y-0">
          {sortedTimeline.map((event, idx) => (
            <div key={event.id} className="relative pl-20 pb-12">
              {/* Timeline dot */}
              <div className="absolute left-0 top-2 w-4 h-4 bg-[#d4af37] rounded-full border-4 border-[#050505] shadow-lg" />

              {/* Event card */}
              <div className={`p-6 border transition-all ${event.isGap ? 'border-white/5 bg-transparent' : 'border-white/10 bg-white/5 hover:border-[#d4af37]/30'}`}>
                <div className="flex justify-between items-start mb-2">
                  <time className="text-xs font-mono text-[#d4af37] uppercase tracking-widest">
                    {event.date} at {event.time}
                  </time>
                  {event.isGap && <span className="text-[10px] uppercase text-white/30">⏸ Gap in timeline</span>}
                </div>

                <p className="text-sm text-white/70 leading-relaxed">
                  {event.description}
                </p>

                {event.involvedSuspects && event.involvedSuspects.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {event.involvedSuspects.map(suspectId => {
                      const suspect = suspects.find(s => s.id === suspectId);
                      return suspect ? (
                        <span key={suspectId} className="text-[10px] uppercase border border-white/10 px-2 py-1 text-white/40">
                          {suspect.name}
                        </span>
                      ) : null;
                    })}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TimelineView;
