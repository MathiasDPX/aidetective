
import React from 'react';
import { TimelineEvent, Suspect } from '../types';

interface TimelineViewProps {
  timeline: TimelineEvent[];
  suspects: Suspect[];
}

const TimelineView: React.FC<TimelineViewProps & { onAddEvent?: (event: Partial<TimelineEvent>) => void }> = ({ timeline, suspects, onAddEvent }) => {
  const [isAdding, setIsAdding] = React.useState(false);
  const [newEvent, setNewEvent] = React.useState<Partial<TimelineEvent>>({ time: '', description: '', involvedSuspects: [] });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onAddEvent && newEvent.time && newEvent.description) {
      onAddEvent(newEvent);
      setNewEvent({ time: '', description: '', involvedSuspects: [] });
      setIsAdding(false);
    }
  };

  return (
    <div className="animate-in fade-in duration-700 pb-12">
      <div className="flex justify-between items-end mb-12">
        <div>
          <h2 className="text-4xl font-serif text-white">Event Timeline</h2>
          <span className="text-xs text-white/30 uppercase tracking-widest">Reconstructing the Night</span>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="px-4 py-2 border border-[#d4af37] text-[#d4af37] text-xs uppercase tracking-widest hover:bg-[#d4af37] hover:text-[#0a0a0a] transition-all"
        >
          {isAdding ? 'Cancel' : '+ Add Event'}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="mb-12 p-6 border border-white/10 bg-white/5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-1">
              <label className="block text-[10px] uppercase text-white/40 mb-1">Time</label>
              <input
                type="text"
                value={newEvent.time}
                onChange={e => setNewEvent({ ...newEvent, time: e.target.value })}
                className="w-full bg-[#0a0a0a] border border-white/10 text-white p-2 text-sm focus:border-[#d4af37] outline-none"
                placeholder="e.g. 21:30"
              />
            </div>
            <div className="md:col-span-3">
              <label className="block text-[10px] uppercase text-white/40 mb-1">Description</label>
              <input
                type="text"
                value={newEvent.description}
                onChange={e => setNewEvent({ ...newEvent, description: e.target.value })}
                className="w-full bg-[#0a0a0a] border border-white/10 text-white p-2 text-sm focus:border-[#d4af37] outline-none"
                placeholder="What happened at this time?"
              />
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <button type="submit" className="px-6 py-2 bg-[#d4af37] text-black text-xs uppercase font-bold tracking-widest">
              Record Event
            </button>
          </div>
        </form>
      )}

      {timeline.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-white/10 text-white/30 uppercase tracking-widest text-xs">
          No timeline events recorded yet.
        </div>
      ) : (
        <div className="relative pl-8 border-l border-white/10 space-y-12 py-4">
          {timeline.map((event, idx) => (
            <div key={event.id || idx} className="relative group">
              {/* Timeline Dot */}
              <div className="absolute -left-[37px] top-1.5 w-4 h-4 bg-[#0a0a0a] border-2 border-[#d4af37] rounded-full group-hover:scale-125 transition-transform" />

              <div className="flex flex-col md:flex-row md:items-start gap-4 md:gap-12">
                <div className="min-w-[100px]">
                  <span className="text-xl font-mono text-[#d4af37] font-medium">{event.time}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg text-white font-medium">{event.description}</h3>
                    {event.isGap && (
                      <span className="px-2 py-0.5 border border-yellow-500/30 text-yellow-500/70 text-[8px] uppercase tracking-widest rounded-full">Logical Gap</span>
                    )}
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    {(event.involvedSuspects || []).map(sid => {
                      const suspect = suspects.find(s => s.id === sid);
                      return (
                        <div key={sid} className="px-2 py-0.5 bg-white/5 border border-white/10 text-[9px] uppercase tracking-widest text-white/40">
                          {suspect ? suspect.name : `Ref: ${sid}`}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Gap indicator between events */}
              {idx < timeline.length - 1 && event.isGap && (
                <div className="absolute -left-[30px] top-full h-12 flex items-center">
                  <div className="h-full border-l-2 border-dotted border-yellow-500/20" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TimelineView;
