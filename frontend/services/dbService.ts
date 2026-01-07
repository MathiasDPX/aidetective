
import { InvestigationCase, Suspect, Clue, TimelineEvent, Statement, Theory } from '../types';

const API_URL = `http://${window.location.hostname}:${window.location.port}`;

class DbService {

    private async fetchJson(endpoint: string, options: RequestInit = {}) {
        const res = await fetch(`${API_URL}${endpoint}`, options);
        if (!res.ok) {
            const text = await res.text();
            throw new Error(`API error: ${res.status} ${res.statusText} - ${text}`);
        }
        return res.json();
    }

    async getCase(): Promise<InvestigationCase> {
        const [caseData, parties, evidences, theories, timelines] = await Promise.all([
            this.fetchJson('/api/case'),
            this.fetchJson('/api/parties'),
            this.fetchJson('/api/evidences'),
            this.fetchJson('/api/theories'),
            this.fetchJson('/api/timelines'),
        ]);

        return {
            title: caseData.name,
            description: caseData.short_description || '',
            status: 'Open',
            parties: Object.entries(parties).map(([id, p]: [string, any]) => ({
                id,
                name: p.name,
                role: p.role,
                description: p.description || '',
                alibi: p.alibi || '',
                motive: '',
                notes: '',
                imageUrl: p.image && p.image.startsWith('/api') ? `${API_URL}${p.image}` : p.image
            })),
            clues: (evidences as any[]).map(e => ({
                id: e.id,
                title: e.name,
                description: e.description || '',
                source: e.place || '',
                linkedSuspects: e.suspects || []
            })),
            timeline: (timelines as any[]).map(t => {
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
            theories: Object.entries(theories).map(([id, t]: [string, any]) => ({
                id,
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
