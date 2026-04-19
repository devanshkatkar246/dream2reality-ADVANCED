// GROQ: console.groq.com → free, 14400 req/day → make 5 Google accounts = 72000 req/day
// GEMINI: aistudio.google.com → Get API Key → free, 1500 req/day → make 5 accounts = 7500/day  
// OPENROUTER: openrouter.ai → free models, no credit card → make 3 accounts

import { GoogleGenerativeAI } from "@google/generative-ai";

interface ApiKey {
  key: string;
  provider: 'groq' | 'gemini' | 'openrouter';
  rateLimitedUntil: number; // timestamp
  hits: number;
  errors: number;
  lastUsedAt: number | null;
}

class SmartAIClient {
  private pools: Record<string, ApiKey[]> = {
    groq: [],
    gemini: [],
    openrouter: []
  };
  private indices: Record<string, number> = {
    groq: 0,
    gemini: 0,
    openrouter: 0
  };

  private stats = {
    totalServed: 0,
    startTime: Date.now(),
    byProvider: {} as Record<string, number>
  }

  private currentActiveProvider: string = "gemini";

  constructor() {
    this.loadKeys();
  }

  private loadKeys() {
    const groqKeys = (process.env.GROQ_API_KEYS || "").split(",").filter(Boolean);
    const geminiKeys = (process.env.GEMINI_API_KEYS || "").split(",").filter(Boolean);
    const openRouterKeys = (process.env.OPENROUTER_API_KEYS || "").split(",").filter(Boolean);

    this.pools.groq = groqKeys.map(key => ({ key, provider: 'groq', rateLimitedUntil: 0, hits: 0, errors: 0, lastUsedAt: null }));
    this.pools.gemini = geminiKeys.map(key => ({ key, provider: 'gemini', rateLimitedUntil: 0, hits: 0, errors: 0, lastUsedAt: null }));
    this.pools.openrouter = openRouterKeys.map(key => ({ key, provider: 'openrouter', rateLimitedUntil: 0, hits: 0, errors: 0, lastUsedAt: null }));

    console.log(`[SmartAI] Initialized with: ${this.pools.groq.length} Groq, ${this.pools.gemini.length} Gemini, ${this.pools.openrouter.length} OpenRouter keys.`);
  }

  private recordSuccess(provider: string, apiKey: ApiKey) {
    this.stats.totalServed++;
    this.stats.byProvider[provider] = (this.stats.byProvider[provider] || 0) + 1;
    apiKey.lastUsedAt = Date.now();
    this.currentActiveProvider = provider;
  }

  private getNextKey(provider: string): ApiKey | null {
    const pool = this.pools[provider];
    if (!pool || pool.length === 0) return null;

    let startIdx = this.indices[provider];
    for (let i = 0; i < pool.length; i++) {
      const idx = (startIdx + i) % pool.length;
      const apiKey = pool[idx];
      if (Date.now() > apiKey.rateLimitedUntil) {
        this.indices[provider] = (idx + 1) % pool.length;
        return apiKey;
      }
    }
    return null; // All keys in this pool are rate limited
  }

  private markRateLimited(apiKey: ApiKey) {
    apiKey.rateLimitedUntil = Date.now() + 60000; // 60s cooldown
    console.log(`[SmartAI] Marker: ${apiKey.provider} ...${apiKey.key.slice(-6)} ✗ rate limited, trying next`);
  }

  public async complete(prompt: string, systemPrompt: string = "You are a helpful assistant.", maxTokens: number = 2000): Promise<string> {
    const providers = ['groq', 'gemini', 'openrouter'] as const;

    for (const provider of providers) {
      const apiKey = this.getNextKey(provider);
      if (!apiKey) continue;

      try {
        const start = Date.now();
        let text = "";

        if (provider === 'groq') {
          text = await this.callGroq(apiKey, prompt, systemPrompt, maxTokens);
        } else if (provider === 'gemini') {
          text = await this.callGemini(apiKey, prompt, systemPrompt);
        } else if (provider === 'openrouter') {
          text = await this.callOpenRouter(apiKey, prompt, systemPrompt);
        }

        apiKey.hits++;
        this.recordSuccess(provider, apiKey);
        console.log(`[SmartAI] ${provider} ...${apiKey.key.slice(-6)} ✓ (${Date.now() - start}ms)`);
        return text;

      } catch (error: any) {
        apiKey.errors++;
        if (error.status === 429 || error.message.includes("429") || error.message.toLowerCase().includes("quota")) {
          this.markRateLimited(apiKey);
          return this.complete(prompt, systemPrompt, maxTokens);
        }
        console.error(`[SmartAI] ${provider} ...${apiKey.key.slice(-6)} ✗ Error: ${error.message}`);
      }
    }

    throw new Error("All AI providers exhausted");
  }

  private async callGroq(apiKey: ApiKey, prompt: string, system: string, maxTokens: number): Promise<string> {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey.key}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: system },
          { role: "user", content: prompt }
        ],
        max_tokens: maxTokens
      })
    });

    if (response.status === 429) throw new Error("429 Rate Limited");
    const json = await response.json();
    return json.choices[0].message.content;
  }

  private async callGemini(apiKey: ApiKey, prompt: string, system: string): Promise<string> {
    const genAI = new GoogleGenerativeAI(apiKey.key);
    const models = ["gemini-2.0-flash-lite-preview-02-05", "gemini-2.0-flash", "gemini-1.5-flash", "gemini-1.5-flash-8b"];

    for (const modelName of models) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const systemPrompted = system + "\n\n" + prompt;
        const result = await model.generateContent(systemPrompted);
        return result.response.text();
      } catch (e: any) {
        if (e.message.includes("429") || e.message.toLowerCase().includes("quota")) {
          throw e; 
        }
        continue;
      }
    }
    throw new Error("Generic Gemini Error");
  }

  private async callOpenRouter(apiKey: ApiKey, prompt: string, system: string): Promise<string> {
    const models = [
      "google/gemini-2.0-flash-exp:free",
      "meta-llama/llama-3.1-8b-instruct:free",
      "mistralai/mistral-7b-instruct:free",
      "google/gemma-2-9b-it:free"
    ];

    for (const modelName of models) {
      try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${apiKey.key}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "http://localhost:3000",
            "X-Title": "Dream2Reality AI"
          },
          body: JSON.stringify({
            model: modelName,
            messages: [
              { role: "system", content: system },
              { role: "user", content: prompt }
            ]
          })
        });

        if (response.status === 429) throw new Error("429 Rate Limited");
        const json = await response.json();
        if (json.choices && json.choices[0]) {
          return json.choices[0].message.content;
        }
      } catch (e: any) {
        if (e.message.includes("429")) throw e;
        continue;
      }
    }
    throw new Error("OpenRouter failed");
  }

  public getStatus() {
    const now = Date.now();
    const mapPool = (pool: ApiKey[], name: string) => {
      const keysAvailable = pool.filter(k => now > k.rateLimitedUntil).length;
      const earliestReset = pool.reduce((min, k) => k.rateLimitedUntil > 0 ? Math.min(min, k.rateLimitedUntil) : min, Infinity);
      const lastUsed = pool.reduce((max, k) => k.lastUsedAt ? Math.max(max, k.lastUsedAt) : max, 0);

      let status: "active" | "rate_limited" | "exhausted" | "not_configured" = "active";
      if (pool.length === 0) status = "not_configured";
      else if (keysAvailable === 0) status = "exhausted";
      else if (keysAvailable < pool.length) status = "rate_limited";

      let model = "unknown";
      if (name === "groq") model = "llama-3.1-8b-instant";
      if (name === "gemini") model = "gemini-2.5-flash-lite";
      if (name === "openrouter") model = "various (free)";

      return {
        name,
        model,
        status,
        keysTotal: pool.length,
        keysAvailable,
        requestsThisSession: this.stats.byProvider[name] || 0,
        lastUsed: lastUsed || null,
        rateLimitResetIn: earliestReset !== Infinity ? Math.max(0, earliestReset - now) : null
      };
    };

    return {
      activeProvider: this.currentActiveProvider,
      totalRequestsServed: this.stats.totalServed,
      serverUptime: now - this.stats.startTime,
      providers: [
        mapPool(this.pools.groq, "groq"),
        mapPool(this.pools.gemini, "gemini"),
        mapPool(this.pools.openrouter, "openrouter")
      ]
    };
  }
}

export const smartClient = new SmartAIClient();
