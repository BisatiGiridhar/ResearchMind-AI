# Autonomous Multi-Agent AI Research Assistant

A production-ready full-stack AI platform where **10 specialized LangGraph agents** collaborate to research complex questions, search live web & academic literature, fact-check claims, grade source authority, and compile structured 12-section research reports with verifiable inline citations.

---

## 🌟 Key Features

1. **Zero Mock Policy**: Interacts with real external search APIs (Tavily, Serper, Brave) and real academic APIs (Semantic Scholar, arXiv XML API, Crossref REST API).
2. **10-Agent LangGraph Pipeline**:
   - **Research Planner**: Decomposes prompts into focused search vectors.
   - **Web Researcher**: Queries live web search APIs and parses metadata.
   - **Academic Researcher**: Searches peer-reviewed papers via Semantic Scholar, arXiv, and Crossref DOIs.
   - **Evidence Extraction Agent**: Identifies numerical data, statistics, and trends.
   - **Fact Checker Agent**: Cross-examines evidence into Verified, Conflicting, or Unsupported statuses.
   - **Source Quality Evaluator Agent**: Scores sources 0–100 on Domain Authority, Recency, and Evidence rigor.
   - **Synthesizer Agent**: Merges insights, deduplicates findings, and separates facts from forecasts.
   - **Report Generator Agent**: Compiles 12-section professional Markdown research reports.
   - **Citation Manager & Validator**: Validates inline `[1]`, `[2]` numerical citations against retrieved URLs.
   - **Evidence & Safety Auditor**: Verifies grounding against claims and tracks token USD cost.
3. **Security & Production Safety**:
   - **Prompt Injection Protection**: Sanitizes input prompts blocking adversarial overrides.
   - **SSRF Protection**: Validates external URLs blocking internal loopbacks (127.0.0.1, 10.x.x.x, 169.254.169.254).
   - **Job Cancellation**: Allows real-time background task abort via `/api/research/{id}/cancel`.
4. **Interactive 3D Frontend**: Built with Next.js App Router, Tailwind CSS, Three.js 3D Hero Scene, Framer Motion, and Recharts statistics visualization.

---

## 🛠️ Installation & Setup

### Prerequisites
- Python 3.11+
- Node.js 18+
- (Optional) Docker & Docker Compose

### 1. Environment Configuration
Create a `.env` file in `backend/`:
```env
ENV=production
PROJECT_NAME="Multi-Agent AI Research Assistant"
OPENAI_API_KEY="your-openai-api-key"
OPENAI_MODEL="gpt-4o-mini"
SEARCH_API_KEY="your-tavily-or-serper-key"
SEARCH_PROVIDER="tavily"
DATABASE_URL="sqlite+aiosqlite:///./multi_agent_research.db"
JWT_SECRET="your-super-secret-jwt-key"
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
# source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
Backend Swagger API documentation will be available at: `http://localhost:8000/api/docs`.

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:3000` in your web browser.

---

## 🧪 Testing Suite

Run the automated test suite:
```bash
cd backend
pytest
```
- **Unit Tests**: `pytest tests/unit` (SSRF protection, Prompt Injection sanitizer, Token cost math).
- **Integration Tests**: `pytest tests/integration` (JWT auth issuance, password verification, DB models).

---

## 🐳 Docker Deployment

Run the entire application stack using Docker Compose:
```bash
docker-compose up --build
```
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000`
