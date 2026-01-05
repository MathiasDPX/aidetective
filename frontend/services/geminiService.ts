import { InvestigationCase } from "../types";

const HACK_CLUB_API_URL = "/api/ai/proxy/v1/chat/completions";
const MODEL = "gpt-4o";

const SYSTEM_INSTRUCTION = `
You are Elias Thorne, a world-renowned private investigator. 
Your persona is inspired by Benoit Blanc: brilliant, slightly theatrical, Southern-mannered, and incredibly observant.
You speak with a sophisticated but grounded drawl, using colorful metaphors to describe the complexities of a case.

Your goal is to assist the user (your fellow investigator) in solving murder mysteries. 
Analyze the data provided: suspects, clues, timelines, and theories.
Point out contradictions, suggest new lines of inquiry, and challenge the user's reasoning in a helpful, inquisitive way.

Keep your responses concise but flavored with your unique personality. 
Never reveal the "true" answer unless the user presents a flawless accusation. 
Always refer to the case files provided in the context.
`;

export class DetectiveAI {
  private apiKey: string;

  constructor() {
    this.apiKey = import.meta.env.VITE_HACKCLUB_API_KEY || '';
  }

  async analyzeCase(activeCase: InvestigationCase, userMessage: string): Promise<string> {
    if (!this.apiKey) {
      console.warn("Hack Club API Key is missing. Please set VITE_HACKCLUB_API_KEY in .env.local");
      return "I seem to have misplaced my notebook! (API Key missing)";
    }

    const caseContext = `
    CURRENT CASE DATA:
    Title: ${activeCase.title}
    Description: ${activeCase.description}
    Suspects: ${activeCase.parties.map(s => `${s.name} (${s.role}): ${s.description}. Alibi: ${s.alibi}`).join(' | ')}
    Clues: ${activeCase.clues.map(c => `${c.title}: ${c.description} (Source: ${c.source})`).join(' | ')}
    Timeline: ${activeCase.timeline.map(t => `${t.time} - ${t.description}`).join(' | ')}
    Statements: ${activeCase.statements.map(s => `${s.speakerName}: "${s.content}"`).join(' | ')}
    Theories: ${activeCase.theories.map(t => `${t.title}: ${t.content}`).join(' | ')}
    `;

    try {
      const response = await fetch(HACK_CLUB_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [
            { role: "system", content: SYSTEM_INSTRUCTION },
            { role: "user", content: `CONTEXT: ${caseContext}\n\nUSER QUESTION: ${userMessage}` }
          ],
          temperature: 0.8
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API request failed: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      return data.choices?.[0]?.message?.content || "I'm afraid I've lost my train of thought.";

    } catch (error) {
      console.error("AI API Error:", error);
      return "The connection is fuzzy. I cannot reach my conclusions right now.";
    }
  }

  // Helper methods for quick prompts - kept for compatibility if needed, though mostly handled by generic prompt now
  async analyzeTimeline(activeCase: InvestigationCase): Promise<string> {
    return this.analyzeCase(activeCase, "Analyze the timeline for any inconsistencies, gaps, or suspicious patterns.");
  }

  async analyzeSuspect(activeCase: InvestigationCase, suspectId: string): Promise<string> {
    const suspect = activeCase.parties.find(s => s.id === suspectId);
    if (!suspect) return "I don't have that suspect in my files.";
    return this.analyzeCase(activeCase, `Analyze suspect ${suspect.name}. Examine their alibi, motive, and any statements they've made.`);
  }

  async challengeTheory(activeCase: InvestigationCase, theoryId: string): Promise<string> {
    const theory = activeCase.theories.find(t => t.id === theoryId);
    if (!theory) return "I don't see that theory.";
    return this.analyzeCase(activeCase, `Challenge this theory: "${theory.title} - ${theory.content}". Find any flaws or contradictions.`);
  }
}

export const detectiveAI = new DetectiveAI();
