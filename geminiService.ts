
import { InvestigationCase } from "./types";

const HACK_CLUB_API_URL = "https://ai.hackclub.com/proxy/v1/chat/completions";
const MODEL = "gpt-4o"; // Using a high-quality model for the detective persona

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
    this.apiKey = import.meta.env.VITE_HACKCLUB_API_KEY || process.env.VITE_HACKCLUB_API_KEY || '';
  }

  async analyzeCase(activeCase: InvestigationCase, userMessage: string) {
    const caseContext = `
    CURRENT CASE DATA:
    Title: ${activeCase.title}
    Description: ${activeCase.description}
    Suspects: ${activeCase.suspects ? activeCase.suspects.map(s => `${s.name} (${s.role}): ${s.description}. Alibi: ${s.alibi}`).join(' | ') : activeCase.parties?.map(s => `${s.name} (${s.role}): ${s.description}. Alibi: ${s.alibi}`).join(' | ')}
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
        throw new Error(`API request failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data.choices[0].message.content || "I'm afraid I've lost my train of thought, dear friend. Let's look at those clues again.";

    } catch (error) {
      console.error("AI API Error:", error);
      return "The fog seems to have settled in on my reasoning. Let me take a moment to clear my head.";
    }
  }
}

export const detectiveAI = new DetectiveAI();
