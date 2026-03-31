import type { Context, Config } from "@netlify/functions";
import { GoogleGenAI } from "@google/genai";

export default async (req: Request, context: Context) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const { skills, hours, budget, goal, workStyle, speed } = await req.json();

  const apiKey = Netlify.env.get("GEMINI_API_KEY") || "";
  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
    Analyze these 6 answers from a side hustle quiz and return a valid JSON object only, no markdown, no explanation.

    User Profile:
    - Skills: ${skills}
    - Hours available: ${hours}
    - Budget: ${budget}
    - Goal: ${goal}
    - Work Style: ${workStyle}
    - Speed needed: ${speed}

    Return exactly 3 hustle objects with this exact structure:
    {
      "hustles": [
        {
          "name": "Hustle Name",
          "tagline": "Short catchy tagline",
          "fit_score": 92,
          "monthly_income": "€X–Y/mo",
          "time_to_first_income": "Timeframe",
          "difficulty": "Beginner/Intermediate/Advanced",
          "why_perfect": "Two sentences personalized to the user's exact answers explaining why this fits them specifically.",
          "first_3_steps": ["Step 1", "Step 2", "Step 3"],
          "tools": [
            { "name": "Tool Name", "purpose": "Tool Purpose", "url": "https://toolurl.com" }
          ]
        }
      ]
    }

    Choose tools from: Fiverr, Upwork, Shopify, Teachable, Gumroad, Canva, Notion, Coursera, Skillshare, ConvertKit, Squarespace, Etsy.
    Pick the 2–3 most relevant tools per hustle.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
  });

  const text = response.text || "";
  const cleanJson = text.replace(/```json|```/g, "").trim();

  try {
    const data = JSON.parse(cleanJson);
    if (!data.hustles || data.hustles.length === 0) {
      return Response.json(
        { error: "No hustles found in response" },
        { status: 500 }
      );
    }
    return Response.json(data);
  } catch {
    return Response.json(
      { error: "Failed to parse AI response" },
      { status: 500 }
    );
  }
};

export const config: Config = {
  path: "/api/generate-hustles",
};
