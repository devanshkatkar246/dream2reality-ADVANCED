// src/lib/scoreEngine.ts
export interface ScoreInputs {
  interest_match: number;
  skill_alignment: number;
  market_opportunity: number;
  competition_level: number;
}

export function calculateRealityScore(inputs: ScoreInputs) {
  const { interest_match, skill_alignment, market_opportunity, competition_level } = inputs;
  
  const score = (interest_match * 0.3) + 
                (skill_alignment * 0.3) + 
                (market_opportunity * 0.2) + 
                ((100 - competition_level) * 0.2);
  
  const finalScore = Math.round(score);
  
  let label = "Medium";
  let explanation = "This path is achievable with dedicated effort.";
  
  if (finalScore >= 80) {
    label = "High";
    explanation = "Excellent alignment! Your skills and interests match perfectly with market demand.";
  } else if (finalScore < 50) {
    label = "Low";
    explanation = "This will be a challenging path. High competition and low initial skill match mean you'll need significant preparation.";
  }

  return {
    score: finalScore,
    label,
    explanation
  };
}
