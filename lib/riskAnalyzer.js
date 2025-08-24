// lib/riskAnalyzer.js

class RiskAnalyzer {
  constructor() {
    this.serviceUrl = process.env.RISK_ANALYZER_URL || 'http://localhost:5001';
  }

  async analyzeRisk(text) {
    try {
      const response = await fetch(`${this.serviceUrl}/analyze-risk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error(`Risk analyzer service error: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Risk analysis failed:', error);
      // Fallback to keyword-based analysis
      return this._fallbackAnalysis(text);
    }
  }

  _fallbackAnalysis(text) {
    const textLower = text.toLowerCase();
    
    const suicidal_keywords = [
      "suicide", "kill myself", "end my life", "want to die", "better off dead",
      "end it all", "take my own life", "not worth living", "wish i was dead"
    ];
    
    const depressed_keywords = [
      "hopeless", "worthless", "useless", "burden", "hate myself",
      "severely depressed", "can't go on", "no point", "empty inside"
    ];

    if (suicidal_keywords.some(kw => textLower.includes(kw))) {
      return { risk_level: "Suicidal", confidence: 0.9, method: "fallback" };
    }
    
    if (depressed_keywords.some(kw => textLower.includes(kw))) {
      return { risk_level: "Depressed", confidence: 0.8, method: "fallback" };
    }
    
    return { risk_level: "Normal", confidence: 0.7, method: "fallback" };
  }

  async checkHealth() {
    try {
      const response = await fetch(`${this.serviceUrl}/health`);
      return response.ok;
    } catch {
      return false;
    }
  }
}

export default RiskAnalyzer;