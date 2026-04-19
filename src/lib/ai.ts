import { smartClient } from "./aiRotator";
import { incrementUsage } from "./usage";

// Helper for structured JSON using rotation
export async function getGeminiJSON(prompt: string, system: string = "You are a specialized JSON generator.") {
  try {
    incrementUsage();
    const text = await smartClient.complete(prompt + "\nIMPORTANT: Return ONLY valid raw JSON.", system);
    
    // Improved cleaning: Remove markdown code blocks if present (```json ... ```)
    const cleanJson = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const jsonMatch = cleanJson.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return JSON.parse(cleanJson);
  } catch (e: any) {
    console.error("SmartAI Error:", e);
    throw new Error(e.message || "Failed to generate structured data from AI.");
  }
}

export const DreamParserPrompt = (dream: string) => `
Convert the following user dream into structured career paths, required skills, and an estimated timeline to achieve it.
Be realistic, practical, and ambitious.

Dream: "${dream}"

Return ONLY valid JSON in this exact format, with NO raw text outside:
{
  "career": "Extracted Career Name (e.g. Software Engineer)",
  "summary": "Short explanation of this career path",
  "timeline": [
    { "phase": "Beginner", "duration": "6 months", "goal": "Learn basics" }
  ],
  "skills_required": ["Skill 1", "Skill 2"],
  "market_demand": "High / Medium / Low",
  "difficulty_level": "High / Medium / Low",
  "average_salary_range": "X-Y LPA",
  "risk_factors": ["Risk 1", "Risk 2"],
  "success_probability_inputs": {
    "interest_match": <0-100>,
    "skill_alignment": <0-100>,
    "market_opportunity": <0-100>,
    "competition_level": <0-100>
  }
}
`;

export const SimulationPrompt = (dream: string, history: { role: string; content: string }[]) => `
You are a "Future Simulation Engine". The user has a dream: "${dream}".
Create an immersive scenario where the user is living their future career.
Present realistic situations, challenges, and decisions.
Keep the responses engaging and slightly emotional.

Always end with exactly 2-3 distinct choices for the user to make.
For EACH choice, you MUST provide a hidden outcome in brackets immediately after the choice text in this exact format:
- Choice Text [OUTCOME: Good/Bad/Neutral | CONSEQUENCE: 2-sentence explanation of what happens. | XP: +15/-10/+5]

Example:
- Take the risky promotion [OUTCOME: Good | CONSEQUENCE: You successfully lead the new team and gain massive respect. Your workload increases but so does your influence. | XP: +15]

Current flow:
${history.map(h => `${h.role === 'assistant' ? 'Model' : 'User'}: ${h.content}`).join("\n")}
`;

export const RoadmapPrompt = (dream: string, simulationSummary?: string) => `
Generate a comprehensive career roadmap, including mentors, salary data, reality checks, and resources for this dream: "${dream}".
${simulationSummary ? `Consider these simulation outcomes: ${simulationSummary}` : ""}

Return ONLY valid JSON in this format:
{
  "daily_tasks": ["Task 1", "Task 2"],
  "weekly_goals": ["Goal 1", "Goal 2"],
  "projects": ["Project Title: Description"],
  "mentors": [
    {
      "name": "Full Name",
      "role": "Current Title",
      "company": "Company Name",
      "origin": "Started as X at Y / began with Z background",
      "journeyYears": 10,
      "quote": "A realistic quote",
      "linkedinQuery": "name+company",
      "twitterHandle": "@handle"
    }
  ],
  "salaryTrajectory": {
    "year1": { "amount": 8, "label": "₹8L" },
    "year3": { "amount": 22, "label": "₹22L" },
    "year5": { "amount": 38, "label": "₹38L" },
    "year10": { "amount": 75, "label": "₹75L+" },
    "globalUSA": "$80k-180k",
    "globalUK": "£40-90k",
    "globalRemote": "$60-150k",
    "indiaRange": "₹8L-75L+ across career"
  },
  "realityCheck": {
    "competition": 8,
    "timeInvestment": 9,
    "financialRisk": 4,
    "entryBarrier": 7,
    "fulfilmentPotential": 9,
    "jobMarketDemand": 8
  },
  "resources": {
    "courses": [
      { "name": "Name", "provider": "Provider", "price": "Free/₹X", "duration": "X weeks", "level": "Beginner", "bestFor": "desc", "url": "URL" }
    ],
    "books": [
      { "name": "Name", "author": "Author", "price": "₹X", "level": "Intermediate", "bestFor": "desc", "url": "URL" }
    ],
    "youtube": [
      { "name": "Video Topic", "channel": "Channel", "price": "Free", "level": "All levels", "bestFor": "desc", "url": "URL" }
    ],
    "communities": [
      { "name": "Name", "platform": "Platform", "price": "Free", "members": "X members", "bestFor": "desc", "url": "URL" }
    ]
  }
}
`;

export const RealityScorePrompt = (dream: string) => `
Evaluate the feasibility of this dream: "${dream}".
Be honest but motivational.

Return ONLY valid JSON in this exact format:
{
  "score": 80,
  "scoreBreakdown": {
    "complexity": 75,
    "feasibility": 85,
    "readiness": 80
  },
  "verdict": "Short motivational line about the score",
  "strengths": ["Clear strength 1", "Clear strength 2", "Clear strength 3"],
  "keyGaps": ["Big gap 1", "Big gap 2", "Big gap 3"],
  "topActions": ["Action 1", "Action 2", "Action 3"]
}

Rules:
1. strengths, keyGaps, topActions MUST be arrays of 3-4 strings each.
2. Short, specific, and actionable items.
3. No raw markdown, no asterisks, no bolding.
4. Scale: 0-100 for all scores.
`;
export const CareerGuidancePrompt = (answers: string[]) => `
You are a career counselor AI. Based on a student's quiz answers, recommend exactly 3 career paths perfectly suited to them.
Make recommendations specific to India job market.

Quiz answers: 
Energy: ${answers[0]}
Subjects: ${answers[1]}  
Strength: ${answers[2]}
Environment: ${answers[3]}
Priority: ${answers[4]}

Return ONLY valid JSON in this exact format:
{
  "personalityType": "The Analytical Builder",
  "personalitySummary": "2 sentence description of their profile",
  "recommendations": [
    {
      "rank": 1,
      "career": "Data Scientist",
      "company_example": "at companies like Google, Flipkart, or Razorpay",
      "matchScore": 94,
      "whyMatch": "Your analytical strength + tech background = perfect fit",
      "salary": "₹12-50 LPA",
      "timeToReady": "18 months",
      "difficulty": "High",
      "dreamStatement": "I want to become a Data Scientist at a top tech company"
    }
  ]
}

Rules:
1. Provide exactly 3 recommendations.
2. matchScore: 70-98, first always highest, then decreasing.
3. dreamStatement MUST be a ready-to-use dream sentence.
`;

export const CompareDreamsPrompt = (dreams: string[]) => `
Evaluate and compare these ${dreams.length} career dreams side-by-side: ${dreams.join(", ")}.
Return ONLY this JSON structure with parallel metrics for each dream.

Return ONLY valid JSON:
{
  "comparisons": [
    {
      "dream": "original dream text",
      "topCareer": "Data Scientist",
      "realityScore": 84,
      "salary": { "entry": "8-12", "senior": "40-80" },
      "timeToReady": "18 months",
      "difficulty": "High",
      "jobSecurity": 8,
      "fulfilment": 8,
      "indiaMarketDemand": 9,
      "globalScope": 9,
      "workLifeBalance": 6,
      "uniqueAdvantage": "Highest paying tech role in India right now",
      "biggestChallenge": "Requires strong math foundation",
      "aiRecommendation": "Choose this if you're analytical and data-driven"
    }
  ],
  "finalRecommendation": {
    "winner": "Career name",
    "reasoning": "Data Scientist is the stronger choice for most profiles. Higher Indian market demand, clearer skill path, and comparable salary ceiling. Choose Product Manager only if you prefer people over data."
  }
}

Rules:
1. salary amounts in Lakhs per annum (LPA).
2. Scores for security, fulfilment, etc. must be between 1-10.
3. Compare accurately based on current trends.
`;
