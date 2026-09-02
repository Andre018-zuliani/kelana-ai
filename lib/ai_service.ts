import { GoogleGenAI } from "@google/genai";
import { retrieveRelevantChunks } from "./rag_service";

export function buildTripPrompt(
  destination: string,
  days: number,
  budget: number,
  category: string,
  knowledgeContext?: string
): string {
  let prompt = `You are an experienced local travel planner.

Create a detailed day-by-day itinerary for a ${days}-day trip to ${destination}.

Trip details:
- Destination: ${destination}
- Number of days: ${days}
- Total budget: USD ${budget.toFixed(0)}
- Travel style / category: ${category}`;

  if (knowledgeContext) {
    prompt += `\n\nVERIFIED LOCAL KNOWLEDGE BASE EXCERPTS (RAG GROUNDING):
${knowledgeContext}

IMPORTANT: Incorporate these verified local rules, transit pass details, and cultural etiquette into the itinerary where relevant!`;
  }

  prompt += `\n\nFor EVERY single day, structure the plan into exactly three sections
using this format:

## Day X: <short theme for the day>

Morning:
- Give 2-3 specific morning activities (e.g. a landmark, a breakfast spot, a scenic walk).

Afternoon:
- Recommend at least one cultural site (museum, temple, historical landmark, etc.).
- Include one local experience or hands-on activity (workshop, market visit, tour, etc.).

Evening:
- Suggest a specific dinner spot or type of local cuisine to try.
- Suggest a nightlife or evening entertainment option suited to the destination.

After all the daily sections, add a final summary section with:
- Estimated daily budget breakdown (based on the total budget of USD ${budget.toFixed(0)}).
- 2-3 local food recommendations worth trying overall.
- Transportation suggestions for getting around ${destination}.
- Verified Local Knowledge & Etiquette (cite any rules, fines, or passes from the knowledge base).
- General travel tips for visiting ${destination}.

Format the entire response in Markdown: use "##" for each day's header and
"-" for bullet lists under Morning / Afternoon / Evening.`;

  return prompt;
}

export async function generateTripRecommendation(
  destination: string,
  days: number,
  budget: number,
  category: string
): Promise<string> {
  const relevantChunks = retrieveRelevantChunks(destination, 2);
  const knowledgeContext = relevantChunks.length > 0
    ? relevantChunks.map((c) => `[Source: ${c.filename} - ${c.section}]\n${c.text}`).join("\n\n")
    : undefined;

  const prompt = buildTripPrompt(destination, days, budget, category, knowledgeContext);

  try {
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    if (response.text) {
      return response.text;
    }
  } catch (err) {
    console.error("Gemini API generation error:", err);
  }

  // Fallback itinerary generator if offline or API key not configured
  return generateFallbackItinerary(destination, days, budget, category, relevantChunks);
}

function generateFallbackItinerary(
  destination: string,
  days: number,
  budget: number,
  category: string,
  relevantChunks: ReturnType<typeof retrieveRelevantChunks> = []
): string {
  const daily = days > 0 ? (budget / days).toFixed(0) : "0";
  let output = "";

  for (let i = 1; i <= days; i++) {
    output += `## Day ${i}: Exploring ${destination} Essentials

Morning:
- Enjoy breakfast at a highly rated local cafe in central ${destination}.
- Take a leisurely morning walk through the scenic historic district and city parks.
- Capture photos at iconic architectural viewpoints.

Afternoon:
- Visit a celebrated national museum or cultural landmark in ${destination}.
- Explore the vibrant local market, discovering artisanal crafts and traditional delicacies.
- Participate in a cultural walking tour or local workshop.

Evening:
- Dine at a recommended local restaurant tasting specialty cuisine suitable for a ${category} budget.
- Enjoy an evening stroll along the illuminated promenade or experience local nightlife entertainment.

`;
  }

  output += `## Trip Summary & Travel Tips

- **Estimated Daily Budget**: ~$${daily} USD per day (${category} tier).
- **Local Food Recommendations**: Savor authentic regional specialties, street food markets, and fresh culinary delicacies.
- **Transportation**: Efficient metro trains, ride-hailing services, and walking between central districts.
- **General Tips**: Keep local currency on hand, check operating hours for top sights, and book popular attractions in advance.`;

  if (relevantChunks.length > 0) {
    output += `\n\n### 📚 KelanaAI Verified Local Knowledge Base Insights (RAG)
${relevantChunks.map((c) => `- **${c.section}** (*from ${c.filename}*): ${c.text.split("\n")[1] || c.text.slice(0, 140)}`).join("\n")}`;
  }

  return output;
}

