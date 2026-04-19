import { describe, it, expect } from "vitest";
import { calculateRealityScore } from "./scoreEngine";

describe("calculateRealityScore", () => {
  it("should calculate a high score for perfect metrics", () => {
    const inputs = {
      interest_match: 100,
      skill_alignment: 10,
      market_opportunity: 10,
      competition_level: 0
    };
    
    const result = calculateRealityScore(inputs);
    expect(result.score).toBe(100);
    expect(result.label).toBe("High");
  });

  it("should calculate a low score for poor metrics", () => {
    const inputs = {
      interest_match: 10,
      skill_alignment: 1,
      market_opportunity: 1,
      competition_level: 10
    };
    
    const result = calculateRealityScore(inputs);
    expect(result.score).toBeLessThan(40);
    expect(result.label).toBe("Low");
  });

  it("should weight metrics correctly according to formula", () => {
    // Formula: (interest*0.3) + (skill*10*0.3) + (market*10*0.2) + ((10-comp)*10*0.2)
    const inputs = {
      interest_match: 50, // 50 * 0.3 = 15
      skill_alignment: 5,   // 50 * 0.3 = 15
      market_opportunity: 5,// 50 * 0.2 = 10
      competition_level: 5  // (10-5)*10 * 0.2 = 10
    };
    // Expected: 15 + 15 + 10 + 10 = 50
    
    const result = calculateRealityScore(inputs);
    expect(result.score).toBe(50);
  });
});
