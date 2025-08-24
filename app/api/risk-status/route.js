import { NextResponse } from "next/server";
import RiskAnalyzer from "../../../lib/riskAnalyzer.js";

const riskAnalyzer = new RiskAnalyzer();

export async function GET() {
  try {
    const isHealthy = await riskAnalyzer.checkHealth();
    
    return NextResponse.json({
      status: isHealthy ? "healthy" : "unavailable",
      service: "Risk Analyzer",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({
      status: "error",
      service: "Risk Analyzer", 
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}