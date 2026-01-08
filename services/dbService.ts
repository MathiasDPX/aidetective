
import { InvestigationCase, Suspect, Clue, TimelineEvent, Statement, Theory } from '../types';

class DbService {

    async getCase(): Promise<InvestigationCase> {
        const response = await fetch('/case.json');
        if (!response.ok) {
            throw new Error(`Failed to load case config: ${response.status}`);
        }
        const data = await response.json();

        return {
            title: data.case.name,
            description: data.case.short_description || '',
            status: 'Open',
            parties: data.parties.map((p: any) => ({
                id: p.name,
                name: p.name,
                role: p.role,
                description: p.description || '',
                alibi: p.alibi || '',
                motive: '',
                notes: '',
                imageUrl: p.image
            })),
            clues: data.evidences.map((e: any) => ({
                id: e.id,
                title: e.name,
                description: e.description || '',
                source: e.place || '',
                linkedSuspects: e.suspects || [],
                document: e.document || null
            })),
            timeline: data.timelines.map((t: any) => {
                const d = new Date(t.timestamp);
                return {
                    id: t.id,
                    title: t.name || '',
                    time: isNaN(d.getTime()) ? '' : d.toTimeString().split(' ')[0].substring(0, 8),
                    date: isNaN(d.getTime()) ? '' : d.toISOString().split('T')[0],
                    description: t.description || '',
                    involvedSuspects: [],
                    isGap: false
                };
            }),
            theories: data.theories.map((t: any) => ({
                id: t.id,
                title: t.name,
                content: t.content,
                linkedClues: [],
                linkedSuspects: []
            })),
            statements: []
        };
    }
}

export const dbService = new DbService();
