# Stock Research Checklist

AI-powered stock research tool with sentiment analysis, 35 auto-filled checks, and Buy/Hold/Sell recommendations.

## Features
- Enter any ticker → AI analyses sentiment (Bullish/Bearish), auto-fills checklist, gives Buy/Hold/Sell
- Green = Bullish, Red = Bearish sentiment colours
- 35 checks across 7 categories: Business, Financial, Valuation, Management, Technical, Risk, Personal fit
- 12-month price target + suggested stop-loss
- Progress saves to browser localStorage automatically
- API key stays server-side — never exposed to the browser

---

## Deploy to Vercel via GitHub

### Step 1 — Get your Anthropic API key
1. Go to https://console.anthropic.com
2. Click **API Keys** → **Create Key**
3. Copy the key — you'll need it in Step 4

### Step 2 — Push this project to GitHub
Open your terminal and run these commands one by one:

```bash
# Navigate into the project folder
cd stock-checklist

# Install dependencies
npm install

# Initialise git
git init
git add .
git commit -m "Initial commit — stock checklist"

# Create a new repo on GitHub (do this on github.com first)
# Then connect and push:
git remote add origin https://github.com/YOUR_USERNAME/stock-checklist.git
git branch -M main
git push -u origin main
```

Replace `YOUR_USERNAME` with your actual GitHub username.

### Step 3 — Connect to Vercel
1. Go to https://vercel.com and sign in with GitHub
2. Click **Add New Project**
3. Find and select your `stock-checklist` repo
4. Vercel will auto-detect it as a Next.js project — leave all settings as default
5. Click **Deploy** — but don't open the URL yet, you need to add the API key first

### Step 4 — Add your Anthropic API key in Vercel
1. In your Vercel project dashboard, go to **Settings** → **Environment Variables**
2. Click **Add New**
3. Set:
   - **Name:** `ANTHROPIC_API_KEY`
   - **Value:** paste your API key from Step 1
   - **Environment:** tick Production, Preview, and Development
4. Click **Save**
5. Go to **Deployments** → click the three dots on your latest deploy → **Redeploy**

### Step 5 — Done!
Your app is live. Vercel gives you a URL like `https://stock-checklist-xyz.vercel.app`.

Every time you push to GitHub, Vercel automatically redeploys.

---

## Run locally

```bash
# Copy the env example
cp .env.local.example .env.local

# Add your API key to .env.local
# ANTHROPIC_API_KEY=sk-ant-...

npm install
npm run dev
```

Open http://localhost:3000

---

## Project structure

```
src/
  app/
    api/
      analyse/
        route.ts        ← server-side API call (key never hits browser)
    components/
      StockChecklist.tsx ← main UI component
    globals.css
    layout.tsx
    page.tsx
```
# stock-checklist
