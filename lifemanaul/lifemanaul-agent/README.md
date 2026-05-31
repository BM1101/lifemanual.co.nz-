# Life Manual Content Agent

Automated content pipeline for Life Manual. Every Sunday it:

1. **Researches** trending NZ topics (Google Trends, Reddit NZ, current news)
2. **Writes** a full MDX article using Claude with web search
3. **Commits** the article to your GitHub repo
4. Vercel **auto-deploys** on every commit — article is live within 2 minutes

---

## Setup

### 1. Get your API keys

**Anthropic API key:**
- Go to [console.anthropic.com](https://console.anthropic.com)
- Click API Keys → Create Key
- Copy it

**GitHub Personal Access Token:**
- Go to github.com → Settings → Developer settings → Personal access tokens → Fine-grained tokens
- Click Generate new token
- Set repository access to your `lifemanual.co.nz-` repo
- Give it **Contents: Read and Write** permission
- Copy the token

### 2. Install and configure

```bash
cd agent
npm install
cp .env.example .env
```

Edit `.env` and paste in your keys.

### 3. Run manually

```bash
node agent.js
```

Watch the output — it will:
- Search for trending NZ topics
- Pick the most relevant one
- Write a full article
- Commit it to GitHub
- Vercel deploys automatically

### 4. Run automatically every Sunday (GitHub Actions)

Copy the `.github/workflows/content-agent.yml` file into your repo's `.github/workflows/` folder.

Then add your secrets in GitHub:
- Go to your repo → Settings → Secrets and variables → Actions
- Add `ANTHROPIC_API_KEY` with your Anthropic key

The `GITHUB_TOKEN` is automatically available in GitHub Actions — you do not need to add it manually.

The agent will run every Sunday at 8am NZT.

---

## Customising

**Write more articles per run:**
In `agent.js`, change:
```js
const toWrite = topics.slice(0, 1);  // currently writes 1 article per run
```
to:
```js
const toWrite = topics.slice(0, 3);  // write 3 articles per run
```

**Change the schedule:**
Edit the cron expression in `.github/workflows/content-agent.yml`:
```yaml
- cron: '0 20 * * 0'   # Every Sunday 8pm UTC (8am NZT Monday)
- cron: '0 20 * * 1'   # Every Monday
- cron: '0 20 * * 1,4' # Monday and Thursday
```

**Focus on specific topics:**
Edit the research prompt in `agent.js` to direct Claude toward specific categories or life stages.

---

## How it works

```
GitHub Actions (Sunday 8am NZT)
         │
         ▼
  Research trending NZ topics
  (Claude + web search)
         │
         ▼
  Pick most relevant topic
  for Life Manual
         │
         ▼
  Write full MDX article
  (Claude + web search for NZ facts)
         │
         ▼
  Commit to GitHub repo
  lifemanaul/content/guides/{stage}/{slug}.mdx
         │
         ▼
  Vercel detects commit
  → auto-deploys
  → article live in ~2 mins
```

---

## Cost estimate

Each run uses approximately:
- 2 Claude API calls (research + write)
- ~3,000 to 5,000 tokens total
- Roughly $0.05 to $0.15 per article at current API pricing

Running weekly: approximately $3 to $8 per month in API costs.
