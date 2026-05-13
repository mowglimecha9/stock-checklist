import StockChecklist from "./components/StockChecklist";

export default function Home() {
  return (
    <main style={{ minHeight: "100vh", padding: "2rem 1rem" }}>
      <div style={{ maxWidth: 700, margin: "0 auto" }}>
        <div style={{ marginBottom: "1.5rem" }}>
          <h1 style={{ fontSize: 20, fontWeight: 600, marginBottom: 4 }}>Stock Research Checklist</h1>
          <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>
            AI-powered — enter any ticker to get sentiment, auto-filled checks, and a Buy/Hold/Sell recommendation.
          </p>
        </div>
        <StockChecklist />
      </div>
    </main>
  );
}
