import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { ticker } = await req.json();
    if (!ticker || typeof ticker !== "string") {
      return NextResponse.json({ error: "Invalid ticker" }, { status: 400 });
    }

    const t = ticker.trim().toUpperCase();

    const prompt = `You are a rigorous stock analyst. Analyse the ticker "${t}". Return ONLY valid JSON — no markdown, no extra text.

SENTIMENT must be one of: bullish, mildBullish, neutral, mildBearish, bearish
ACTION must be one of: buy, buyOnDip, hold, watchlist, sell
sentimentScore: integer 1-100 where 100 = extremely bullish, 50 = neutral, 1 = extremely bearish

For autoChecks use: PASS, FAIL, WARN, or MANUAL
- PASS = clearly true based on your knowledge
- FAIL = clear red flag or false
- WARN = mixed picture or notable concern
- MANUAL = needs live price data or personal input

Always MANUAL: valuation_52wk, technical_rsi, technical_support, technical_volume, risk_worstcase, risk_tolerance, personal_timeline, personal_allocation, personal_exit, personal_follow, personal_fomo

Be honest — flag real problems. Do not just PASS everything.

{
  "ticker": "${t}",
  "companyName": "Full company name",
  "sector": "sector name",
  "sentiment": "bullish|mildBullish|neutral|mildBearish|bearish",
  "sentimentScore": 75,
  "sentimentSummary": "2-3 sentence overall market sentiment and momentum summary",
  "sentimentFactors": {
    "bullish": ["factor 1", "factor 2", "factor 3"],
    "bearish": ["factor 1", "factor 2", "factor 3"]
  },
  "action": "buy|buyOnDip|hold|watchlist|sell",
  "actionRationale": "2-3 sentence explanation of the buy/hold/sell call",
  "priceTarget": "$X-$Y",
  "stopLoss": "$X or below $Y",
  "autoChecks": {
    "business_understand": "PASS","business_moat": "PASS","business_industry": "PASS","business_competition": "PASS","business_pricing": "PASS",
    "financial_revenue": "PASS","financial_margins": "PASS","financial_fcf": "PASS","financial_debt": "PASS","financial_balance": "PASS","financial_earnings": "PASS",
    "valuation_pe": "PASS","valuation_peg": "PASS","valuation_52wk": "MANUAL","valuation_dcf": "PASS","valuation_catalyst": "PASS",
    "management_aligned": "PASS","management_insider": "PASS","management_guidance": "PASS","management_stable": "PASS","management_institutional": "PASS",
    "technical_trend": "PASS","technical_rsi": "MANUAL","technical_support": "MANUAL","technical_volume": "MANUAL",
    "risk_worstcase": "MANUAL","risk_regulatory": "PASS","risk_concentration": "PASS","risk_perfection": "PASS","risk_tolerance": "MANUAL",
    "personal_timeline": "MANUAL","personal_allocation": "MANUAL","personal_exit": "MANUAL","personal_follow": "MANUAL","personal_fomo": "MANUAL"
  },
  "autoCheckNotes": {
    "business_understand": "brief note","business_moat": "brief note","business_industry": "brief note","business_competition": "brief note","business_pricing": "brief note",
    "financial_revenue": "brief note","financial_margins": "brief note","financial_fcf": "brief note","financial_debt": "brief note","financial_balance": "brief note","financial_earnings": "brief note",
    "valuation_pe": "brief note","valuation_peg": "brief note","valuation_dcf": "brief note","valuation_catalyst": "brief note",
    "management_aligned": "brief note","management_insider": "brief note","management_guidance": "brief note","management_stable": "brief note","management_institutional": "brief note",
    "technical_trend": "brief note","risk_regulatory": "brief note","risk_concentration": "brief note","risk_perfection": "brief note"
  },
  "categories": {
    "business": "2-3 sentence analysis",
    "financial": "2-3 sentence analysis",
    "valuation": "2-3 sentence analysis",
    "management": "2-3 sentence analysis",
    "technical": "2-3 sentence analysis",
    "risk": "2-3 sentence analysis",
    "personal": "2-3 sentence analysis"
  }
}`;

    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2500,
      messages: [{ role: "user", content: prompt }],
    });

    const text = message.content.map((b) => ("text" in b ? b.text : "")).join("");
    const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());

    return NextResponse.json(parsed);
  } catch (err) {
    console.error("Analyse error:", err);
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}
