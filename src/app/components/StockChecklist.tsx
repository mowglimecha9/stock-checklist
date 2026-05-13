"use client";
import { useState, useEffect, useRef } from "react";

const CATEGORIES = [
  {
    id: "business", icon: "🏢", title: "Business fundamentals",
    items: [
      { id: "understand", label: "Do you understand what the company does?", sub: "Can you explain it in 2 sentences?", warn: false },
      { id: "moat", label: "Does it have a clear competitive moat?", sub: "Brand, patents, network effects, switching costs, cost advantage", warn: false },
      { id: "industry", label: "Is the industry growing, stable, or declining?", sub: "Tailwinds matter — easier to grow with the tide", warn: false },
      { id: "competition", label: "Competitive position understood vs peers?", sub: "Market share trend more important than current share", warn: false },
      { id: "pricing", label: "Does it have pricing power?", sub: "Can it raise prices without losing customers?", warn: false },
    ]
  },
  {
    id: "financial", icon: "📊", title: "Financial health",
    items: [
      { id: "revenue", label: "Is revenue growing consistently?", sub: "3–5 year trend, not just last quarter", warn: false },
      { id: "margins", label: "Are profit margins expanding or stable?", sub: "Gross margin, operating margin — watch the direction", warn: false },
      { id: "fcf", label: "Is free cash flow positive?", sub: "Cash flow is harder to manipulate than earnings", warn: false },
      { id: "debt", label: "Is the debt level manageable?", sub: "D/E below 1.5× generally safe; check interest coverage", warn: false },
      { id: "balance", label: "Is the balance sheet strong?", sub: "Net cash companies survive downturns better", warn: false },
      { id: "earnings", label: "Are earnings growing and beating estimates?", sub: "Consistent beats signal credible management", warn: false },
    ]
  },
  {
    id: "valuation", icon: "💰", title: "Valuation",
    items: [
      { id: "pe", label: "Forward P/E checked vs sector average?", sub: "Premium is fine if growth justifies it", warn: false },
      { id: "peg", label: "PEG ratio assessed? (P/E ÷ growth rate)", sub: "Below 1 = undervalued; above 2 = pricey", warn: false },
      { id: "52wk", label: "Price context vs 52-week range noted?", sub: "Not a buy/sell signal alone — but context matters", warn: false },
      { id: "dcf", label: "Intrinsic/DCF value compared to price?", sub: "GF Value, Simply Wall St, or own estimate", warn: false },
      { id: "catalyst", label: "Is there a clear upside catalyst identified?", sub: "Earnings beat, new contract, index inclusion, product launch", warn: false },
    ]
  },
  {
    id: "management", icon: "👥", title: "Management & ownership",
    items: [
      { id: "aligned", label: "Is management aligned with shareholders?", sub: "Executives owning significant stock is a positive sign", warn: false },
      { id: "insider", label: "Insider buying/selling activity reviewed?", sub: "Heavy selling with no buying is a yellow flag", warn: true },
      { id: "guidance", label: "Has management delivered on past guidance?", sub: "Underpromise/overdeliver track record is valuable", warn: false },
      { id: "stable", label: "Is leadership experienced and stable?", sub: "High C-suite turnover is a red flag", warn: false },
      { id: "institutional", label: "Institutional ownership trend checked?", sub: "Smart money conviction adds validation", warn: false },
    ]
  },
  {
    id: "technical", icon: "📈", title: "Technical picture",
    items: [
      { id: "trend", label: "Is the stock in an uptrend or downtrend?", sub: "Above 50-day and 200-day MAs = bullish setup", warn: false },
      { id: "rsi", label: "RSI level noted?", sub: "Above 70 = overbought (caution); below 30 = oversold (opportunity)", warn: false },
      { id: "support", label: "Clear support level identified for stop-loss?", sub: "Know your downside before you enter", warn: false },
      { id: "volume", label: "Volume confirms the price move?", sub: "Rising price on rising volume = healthy move", warn: false },
    ]
  },
  {
    id: "risk", icon: "⚠️", title: "Risk factors",
    items: [
      { id: "worstcase", label: "Worst-case scenario identified and accepted?", sub: "If it happened, would you still hold?", warn: true },
      { id: "regulatory", label: "Regulatory or geopolitical risk assessed?", sub: "Key for energy, semis, China-exposed names", warn: true },
      { id: "concentration", label: "Customer/revenue concentration checked?", sub: "Single customer >20% of revenue = risk", warn: true },
      { id: "perfection", label: "Is valuation dependent on perfect execution?", sub: "Priced-for-perfection stocks punish any miss", warn: true },
      { id: "tolerance", label: "Maximum loss tolerance set for this position?", sub: "Never risk more than you can afford to lose", warn: true },
    ]
  },
  {
    id: "personal", icon: "🎯", title: "Your personal fit",
    items: [
      { id: "timeline", label: "Fits your investment timeline?", sub: "Short trade vs long hold needs different sizing", warn: false },
      { id: "allocation", label: "Portfolio allocation % decided?", sub: "No single stock above 10–15% for moderate risk", warn: false },
      { id: "exit", label: "Price target and exit plan set?", sub: "Know profit target AND stop-loss before buying", warn: false },
      { id: "follow", label: "Able to follow company news regularly?", sub: "If not, an ETF may be better for this exposure", warn: false },
      { id: "fomo", label: "Decision based on research, not hype/FOMO?", sub: "If main reason is 'everyone's talking about it' — pause", warn: true },
    ]
  }
];

const TOTAL = CATEGORIES.reduce((s, c) => s + c.items.length, 0);
const LS_KEY = "stock_checklist_v3";

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}
function saveToStorage(data: Record<string, unknown>) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(data)); } catch { /* noop */ }
}

const SENTIMENT_CONFIG: Record<string, { label: string; bg: string; border: string; text: string; dot: string }> = {
  bullish:     { label: "Bullish",        bg: "var(--green-bg)",  border: "var(--green-border)",  text: "var(--green-text)",  dot: "var(--green-dot)" },
  mildBullish: { label: "Mildly bullish", bg: "var(--green-bg)",  border: "var(--green-border)",  text: "var(--green-text)",  dot: "#97C459" },
  neutral:     { label: "Neutral",        bg: "var(--blue-bg)",   border: "var(--blue-border)",   text: "var(--blue-text)",   dot: "#378ADD" },
  mildBearish: { label: "Mildly bearish", bg: "var(--amber-bg)",  border: "var(--amber-border)",  text: "var(--amber-text)",  dot: "#EF9F27" },
  bearish:     { label: "Bearish",        bg: "var(--red-bg)",    border: "var(--red-border)",    text: "var(--red-text)",    dot: "#E24B4A" },
};

const ACTION_CONFIG: Record<string, { label: string; bg: string; border: string; text: string; icon: string }> = {
  buy:      { label: "BUY",          bg: "var(--green-bg)",  border: "var(--green-border)",  text: "var(--green-text)",  icon: "↑" },
  buyOnDip: { label: "BUY ON DIP",   bg: "var(--green-bg)",  border: "var(--green-border)",  text: "var(--green-text)",  icon: "↗" },
  hold:     { label: "HOLD",         bg: "var(--blue-bg)",   border: "var(--blue-border)",   text: "var(--blue-text)",   icon: "→" },
  watchlist:{ label: "WATCHLIST",    bg: "var(--amber-bg)",  border: "var(--amber-border)",  text: "var(--amber-text)",  icon: "👁" },
  sell:     { label: "SELL / AVOID", bg: "var(--red-bg)",    border: "var(--red-border)",    text: "var(--red-text)",    icon: "↓" },
};

const CHECK_STYLE: Record<string, { bg: string; border: string; icon: string; color: string }> = {
  PASS:      { bg: "var(--green-bg)",      border: "var(--green-border)",      icon: "✓", color: "var(--green-text)" },
  FAIL:      { bg: "var(--red-bg)",        border: "var(--red-border)",        icon: "✗", color: "var(--red-text)" },
  WARN:      { bg: "var(--amber-bg)",      border: "var(--amber-border)",      icon: "!", color: "var(--amber-text)" },
  MANUAL:    { bg: "var(--bg-secondary)",  border: "var(--border)",            icon: "?", color: "var(--text-muted)" },
  USER:      { bg: "var(--green-bg)",      border: "var(--green-border)",      icon: "✓", color: "var(--green-text)" },
  UNCHECKED: { bg: "var(--bg)",            border: "var(--border-strong)",     icon: "",  color: "var(--text-muted)" },
};

type AiData = {
  ticker: string;
  companyName: string;
  sector: string;
  sentiment: string;
  sentimentScore: number;
  sentimentSummary: string;
  sentimentFactors: { bullish: string[]; bearish: string[] };
  action: string;
  actionRationale: string;
  priceTarget: string;
  stopLoss: string;
  autoChecks: Record<string, string>;
  autoCheckNotes: Record<string, string>;
  categories: Record<string, string>;
};

type TickerData = {
  checks: Record<string, boolean>;
  ai: AiData | null;
};

export default function StockChecklist() {
  const [saved, setSaved] = useState<Record<string, TickerData>>({});
  const [hydrated, setHydrated] = useState(false);
  const [ticker, setTicker] = useState("");
  const [activeTicker, setActiveTicker] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [freshAi, setFreshAi] = useState<AiData | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [openCats, setOpenCats] = useState(new Set(["business", "financial", "valuation", "risk"]));
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setSaved(loadFromStorage());
    setHydrated(true);
  }, []);

  const currentData = activeTicker ? saved[activeTicker] : null;
  const currentChecks = currentData?.checks || {};
  const displayAi: AiData | null = freshAi || currentData?.ai || null;
  const checkedCount = Object.values(currentChecks).filter(Boolean).length;
  const pct = Math.round((checkedCount / TOTAL) * 100);

  function persist(updated: Record<string, TickerData>) {
    setSaved(updated);
    saveToStorage(updated);
  }

  function toggleCheck(catId: string, itemId: string) {
    if (!activeTicker) return;
    const key = `${catId}_${itemId}`;
    const updated = { ...saved };
    updated[activeTicker] = {
      ...updated[activeTicker],
      checks: { ...(updated[activeTicker]?.checks || {}), [key]: !updated[activeTicker]?.checks?.[key] },
    };
    persist(updated);
  }

  function toggleCat(id: string) {
    setOpenCats(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }

  function resetTicker() {
    if (!activeTicker) return;
    const updated = { ...saved, [activeTicker]: { checks: {}, ai: saved[activeTicker]?.ai || null } };
    persist(updated);
  }

  function deleteTicker(t: string) {
    const updated = { ...saved };
    delete updated[t];
    persist(updated);
    if (activeTicker === t) { setActiveTicker(null); setFreshAi(null); }
  }

  function getCheckState(catId: string, itemId: string) {
    const key = `${catId}_${itemId}`;
    if (currentChecks[key]) return "USER";
    const v = displayAi?.autoChecks?.[key];
    if (v === "PASS") return "PASS";
    if (v === "FAIL") return "FAIL";
    if (v === "WARN") return "WARN";
    if (v === "MANUAL") return "MANUAL";
    return "UNCHECKED";
  }

  async function runAnalysis(tickerOverride?: string) {
    const t = (tickerOverride || ticker).trim().toUpperCase();
    if (!t) return;
    setActiveTicker(t);
    setFreshAi(null);
    setAiError(null);
    setAiLoading(true);
    setTicker("");

    try {
      const res = await fetch("/api/analyse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticker: t }),
      });
      if (!res.ok) throw new Error("API error");
      const parsed: AiData = await res.json();

      const newChecks: Record<string, boolean> = {};
      Object.entries(parsed.autoChecks || {}).forEach(([key, val]) => {
        if (val === "PASS") newChecks[key] = true;
      });

      const existing = saved[t]?.checks || {};
      const merged = { ...newChecks };
      Object.entries(parsed.autoChecks || {}).forEach(([key, val]) => {
        if (val === "MANUAL" && existing[key]) merged[key] = true;
      });

      setFreshAi(parsed);
      const updated = { ...saved, [t]: { checks: merged, ai: parsed } };
      persist(updated);
    } catch {
      setAiError("Analysis failed. Check the ticker symbol and try again.");
    }
    setAiLoading(false);
  }

  if (!hydrated) return (
    <div style={{ padding: "2rem", textAlign: "center", color: "var(--text-secondary)", fontSize: 13 }}>Loading...</div>
  );

  const savedTickers = Object.keys(saved);
  const sc = displayAi ? SENTIMENT_CONFIG[displayAi.sentiment] || SENTIMENT_CONFIG.neutral : null;
  const ac = displayAi ? ACTION_CONFIG[displayAi.action] || ACTION_CONFIG.hold : null;

  return (
    <div style={{ maxWidth: 680 }}>

      <div style={{ marginBottom: "1.25rem" }}>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            ref={inputRef} value={ticker}
            onChange={e => setTicker(e.target.value.toUpperCase())}
            onKeyDown={e => e.key === "Enter" && runAnalysis()}
            placeholder="Enter ticker — e.g. NVDA, CEG, MU, GEV, VST"
            style={{ fontFamily: "'Courier New', monospace", letterSpacing: "0.04em" }}
            disabled={aiLoading}
          />
          <button onClick={() => runAnalysis()} disabled={!ticker.trim() || aiLoading} style={{ fontWeight: 500, fontSize: 13 }}>
            {aiLoading ? "Analysing..." : "Run checklist ↗"}
          </button>
        </div>

        {savedTickers.length > 0 && (
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10, alignItems: "center" }}>
            <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>Saved:</span>
            {savedTickers.map(t => {
              const tDone = Object.values(saved[t]?.checks || {}).filter(Boolean).length;
              const tPct = Math.round((tDone / TOTAL) * 100);
              const tSc = saved[t]?.ai ? SENTIMENT_CONFIG[saved[t].ai!.sentiment] : null;
              const isActive = activeTicker === t;
              return (
                <div key={t} style={{ display: "flex" }}>
                  <button
                    onClick={() => { setActiveTicker(t); setFreshAi(null); setAiError(null); }}
                    style={{ fontSize: 12, padding: "0 10px", height: 30, borderRadius: "var(--radius-md) 0 0 var(--radius-md)", borderRight: "none", background: isActive ? "var(--blue-bg)" : (tSc?.bg || "var(--bg-secondary)"), color: isActive ? "var(--blue-text)" : (tSc?.text || "var(--text-secondary)"), fontFamily: "monospace" }}
                  >
                    {t} <span style={{ opacity: 0.6 }}>{tPct}%</span>
                  </button>
                  <button onClick={() => deleteTicker(t)} style={{ fontSize: 12, padding: "0 8px", height: 30, borderRadius: "0 var(--radius-md) var(--radius-md) 0", background: "var(--bg-secondary)", color: "var(--text-muted)" }}>×</button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {aiError && (
        <div style={{ padding: "10px 14px", background: "var(--red-bg)", color: "var(--red-text)", borderRadius: "var(--radius-md)", fontSize: 13, marginBottom: 12 }}>
          {aiError}
        </div>
      )}

      {aiLoading && (
        <div style={{ padding: "24px", background: "var(--bg-secondary)", borderRadius: "var(--radius-lg)", fontSize: 13, color: "var(--text-secondary)", marginBottom: 16, textAlign: "center", lineHeight: 1.8 }}>
          <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 4 }}>Researching {activeTicker}...</div>
          <span style={{ fontSize: 12, opacity: 0.65 }}>Analysing sentiment, running 35 checks, generating Buy/Hold/Sell recommendation</span>
        </div>
      )}

      {activeTicker && !aiLoading && displayAi && sc && ac && (
        <>
          <div className="card" style={{ overflow: "hidden", marginBottom: 16 }}>

            <div style={{ padding: "14px 16px", borderBottom: "0.5px solid var(--border)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                <div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                    <span style={{ fontFamily: "monospace", fontWeight: 600, fontSize: 20 }}>{displayAi.ticker}</span>
                    <span style={{ fontSize: 14, color: "var(--text-secondary)" }}>{displayAi.companyName}</span>
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{displayAi.sector}</div>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <div style={{ width: 100, height: 5, background: "var(--bg-secondary)", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ width: `${pct}%`, height: "100%", background: pct >= 80 ? "#1D9E75" : pct >= 50 ? "#EF9F27" : "#E24B4A", borderRadius: 3, transition: "width 0.3s" }} />
                  </div>
                  <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{checkedCount}/{TOTAL}</span>
                </div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
              <div style={{ padding: "14px 16px", background: sc.bg, borderRight: "0.5px solid var(--border)" }}>
                <div style={{ fontSize: 10, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.07em", color: sc.text, opacity: 0.65, marginBottom: 8 }}>Sentiment</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <div style={{ width: 9, height: 9, borderRadius: "50%", background: sc.dot }} />
                  <span style={{ fontSize: 17, fontWeight: 600, color: sc.text }}>{sc.label}</span>
                </div>
                <div style={{ height: 4, background: "rgba(0,0,0,0.08)", borderRadius: 2, overflow: "hidden", marginBottom: 10 }}>
                  <div style={{ width: `${displayAi.sentimentScore || 50}%`, height: "100%", background: sc.dot, borderRadius: 2 }} />
                </div>
                <div style={{ fontSize: 12, color: sc.text, lineHeight: 1.55, opacity: 0.9 }}>{displayAi.sentimentSummary}</div>
              </div>

              <div style={{ padding: "14px 16px", background: ac.bg }}>
                <div style={{ fontSize: 10, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.07em", color: ac.text, opacity: 0.65, marginBottom: 8 }}>Recommendation</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: 18, color: ac.text }}>{ac.icon}</span>
                  <span style={{ fontSize: 17, fontWeight: 600, color: ac.text }}>{ac.label}</span>
                </div>
                <div style={{ fontSize: 12, color: ac.text, lineHeight: 1.55, opacity: 0.9 }}>{displayAi.actionRationale}</div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", borderTop: "0.5px solid var(--border)", borderBottom: "0.5px solid var(--border)" }}>
              {[
                { label: "12-month target", value: displayAi.priceTarget || "N/A" },
                { label: "Suggested stop-loss", value: displayAi.stopLoss || "N/A" },
                { label: "Research complete", value: `${pct}%` },
              ].map((item, i) => (
                <div key={i} style={{ padding: "10px 16px", borderRight: i < 2 ? "0.5px solid var(--border)" : "none" }}>
                  <div style={{ fontSize: 10, color: "var(--text-muted)", marginBottom: 4 }}>{item.label}</div>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{item.value}</div>
                </div>
              ))}
            </div>

            <div style={{ padding: "12px 16px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--green-text)", marginBottom: 8 }}>Bullish factors</div>
                  {(displayAi.sentimentFactors?.bullish || []).map((f, i) => (
                    <div key={i} style={{ display: "flex", gap: 6, marginBottom: 5, alignItems: "flex-start" }}>
                      <span style={{ color: "var(--green-dot)", fontSize: 11, flexShrink: 0, marginTop: 2 }}>▲</span>
                      <span style={{ fontSize: 12, lineHeight: 1.4 }}>{f}</span>
                    </div>
                  ))}
                </div>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--red-text)", marginBottom: 8 }}>Bearish factors</div>
                  {(displayAi.sentimentFactors?.bearish || []).map((f, i) => (
                    <div key={i} style={{ display: "flex", gap: 6, marginBottom: 5, alignItems: "flex-start" }}>
                      <span style={{ color: "#E24B4A", fontSize: 11, flexShrink: 0, marginTop: 2 }}>▼</span>
                      <span style={{ fontSize: 12, lineHeight: 1.4 }}>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, flexWrap: "wrap", gap: 6 }}>
            <div style={{ display: "flex", gap: 10, fontSize: 11, color: "var(--text-secondary)", flexWrap: "wrap" }}>
              {([["✓","var(--green-bg)","var(--green-border)","var(--green-text)","AI pass"],["✗","var(--red-bg)","var(--red-border)","var(--red-text)","Red flag"],["!","var(--amber-bg)","var(--amber-border)","var(--amber-text)","Caution"],["?","var(--bg-secondary)","var(--border-strong)","var(--text-muted)","Verify yourself"]] as const).map(([icon,bg,border,col,label]) => (
                <span key={label} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ width: 15, height: 15, borderRadius: 3, background: bg, border: `1px solid ${border}`, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: col, fontWeight: 600 }}>{icon}</span>
                  {label}
                </span>
              ))}
            </div>
            <button onClick={resetTicker} style={{ fontSize: 11, padding: "0 10px", height: 28, color: "var(--text-muted)" }}>Reset checks</button>
          </div>

          {CATEGORIES.map((cat, ci) => {
            const isOpen = openCats.has(cat.id);
            const states = cat.items.map(item => getCheckState(cat.id, item.id));
            const passed = states.filter(s => s === "PASS" || s === "USER").length;
            const failed = states.filter(s => s === "FAIL").length;
            const warned = states.filter(s => s === "WARN").length;
            const analysis = displayAi?.categories?.[cat.id];

            return (
              <div key={cat.id} style={{ marginBottom: 2 }}>
                <div
                  onClick={() => toggleCat(cat.id)}
                  style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: "var(--radius-md)", cursor: "pointer", background: isOpen ? "var(--bg-secondary)" : "transparent", userSelect: "none", transition: "background 0.1s" }}
                >
                  <span style={{ fontSize: 16 }}>{cat.icon}</span>
                  <span style={{ fontSize: 14, fontWeight: 500, flex: 1 }}>{cat.title}</span>
                  <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
                    {failed > 0 && <span style={{ fontSize: 10, background: "var(--red-bg)", color: "var(--red-text)", padding: "2px 7px", borderRadius: 10, fontWeight: 600 }}>{failed} flag{failed > 1 ? "s" : ""}</span>}
                    {warned > 0 && <span style={{ fontSize: 10, background: "var(--amber-bg)", color: "var(--amber-text)", padding: "2px 7px", borderRadius: 10, fontWeight: 600 }}>{warned} warn</span>}
                    <span style={{ fontSize: 11, color: "var(--text-muted)", minWidth: 30, textAlign: "right" }}>{passed}/{cat.items.length}</span>
                  </div>
                  <span style={{ fontSize: 12, color: "var(--text-muted)", display: "inline-block", transform: isOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>▾</span>
                </div>

                <div style={{ height: 3, margin: "0 12px 2px", background: "var(--bg-secondary)", borderRadius: 2, overflow: "hidden" }}>
                  <div style={{ width: `${(passed / cat.items.length) * 100}%`, height: "100%", background: failed > 0 ? "#E24B4A" : warned > 0 ? "#EF9F27" : "#1D9E75", borderRadius: 2, transition: "width 0.3s" }} />
                </div>

                {isOpen && (
                  <div style={{ paddingLeft: 38, paddingBottom: 6 }}>
                    {analysis && (
                      <div style={{ fontSize: 12, color: "var(--text-secondary)", background: "var(--bg-secondary)", borderRadius: "var(--radius-md)", padding: "8px 12px", margin: "6px 0 10px", lineHeight: 1.65, borderLeft: "2px solid var(--blue-border)" }}>
                        <span style={{ fontWeight: 600, color: "var(--blue-text)", fontSize: 10, display: "block", marginBottom: 3, textTransform: "uppercase", letterSpacing: "0.05em" }}>AI analysis</span>
                        {analysis}
                      </div>
                    )}
                    {cat.items.map(item => {
                      const state = getCheckState(cat.id, item.id);
                      const cs = CHECK_STYLE[state];
                      const noteKey = `${cat.id}_${item.id}`;
                      const note = displayAi?.autoCheckNotes?.[noteKey];
                      const isManual = state === "MANUAL" || state === "UNCHECKED";
                      const userChecked = !!currentChecks[noteKey];

                      return (
                        <div
                          key={item.id}
                          onClick={() => toggleCheck(cat.id, item.id)}
                          style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "7px 8px", borderRadius: "var(--radius-sm)", cursor: "pointer", opacity: state === "PASS" && !userChecked ? 0.75 : 1, transition: "background 0.1s" }}
                          onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-secondary)")}
                          onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                        >
                          <div style={{ width: 18, height: 18, borderRadius: 4, flexShrink: 0, marginTop: 1, background: userChecked ? "var(--green-bg)" : cs.bg, border: `1.5px solid ${userChecked ? "var(--green-border)" : cs.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 600, color: userChecked ? "var(--green-text)" : cs.color, transition: "all 0.15s" }}>
                            {userChecked ? "✓" : cs.icon}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 13, lineHeight: 1.4 }}>{item.label}</div>
                            <div style={{ fontSize: 11, marginTop: 2, lineHeight: 1.4, color: (note && !isManual) ? (state === "FAIL" ? "var(--red-text)" : state === "WARN" ? "var(--amber-text)" : state === "PASS" ? "var(--green-text)" : "var(--text-muted)") : (item.warn ? "var(--amber-text)" : "var(--text-muted)") }}>
                              {note && !isManual ? note : (isManual ? `→ ${item.sub}` : item.sub)}
                            </div>
                          </div>
                          {isManual && !userChecked && <span style={{ fontSize: 10, color: "var(--text-muted)", flexShrink: 0, marginTop: 3 }}>tap</span>}
                        </div>
                      );
                    })}
                  </div>
                )}
                {ci < CATEGORIES.length - 1 && <div style={{ borderTop: "0.5px solid var(--border)", margin: "2px 0" }} />}
              </div>
            );
          })}

          <div style={{ marginTop: 14, padding: "10px 14px", borderRadius: "var(--radius-md)", fontSize: 13, lineHeight: 1.6, background: pct >= 80 ? "var(--green-bg)" : pct >= 50 ? "var(--amber-bg)" : "var(--bg-secondary)", color: pct >= 80 ? "var(--green-text)" : pct >= 50 ? "var(--amber-text)" : "var(--text-secondary)" }}>
            <strong>{pct}% complete</strong> ({checkedCount}/{TOTAL}).{" "}
            {pct < 50 ? "Complete the manual checks (?) before deciding." : pct < 80 ? "Focus on remaining manual checks — especially risk and personal fit." : "Well researched. Set your stop-loss and size the position carefully."}
          </div>
        </>
      )}

      {!activeTicker && !aiLoading && (
        <div style={{ textAlign: "center", padding: "3rem 1rem", color: "var(--text-muted)", fontSize: 13, lineHeight: 2 }}>
          Enter a ticker and hit <strong style={{ color: "var(--text-secondary)" }}>Run checklist</strong>.<br />
          AI analyses sentiment, auto-fills 35 checks, and gives a Buy/Hold/Sell call.<br />
          <span style={{ fontSize: 11, opacity: 0.6 }}>Progress saves to your browser automatically.</span>
        </div>
      )}

      <div style={{ marginTop: 16, padding: "8px 14px", background: "var(--bg-secondary)", borderRadius: "var(--radius-md)", fontSize: 11, color: "var(--text-muted)", lineHeight: 1.5 }}>
        AI analysis based on training knowledge — not live prices. Always verify manual checks (?) yourself before buying. Not financial advice.
      </div>
    </div>
  );
}
