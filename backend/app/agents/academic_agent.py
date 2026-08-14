from typing import List, Dict, Any
from app.agents.state import ResearchState
from app.services.academic_service import AcademicService

class AcademicResearchAgent:
    """
    Agent 3 — Academic Research Agent
    Queries Semantic Scholar, arXiv, and Crossref REST APIs for peer-reviewed papers.
    """

    @staticmethod
    async def run(state: ResearchState) -> ResearchState:
        if state.is_cancelled:
            return state

        state.current_agent = "academic_researcher"
        state.progress_percentage = 40

        state.agent_logs.append({
            "agent": "academic_researcher",
            "status": "running",
            "message": "Querying Semantic Scholar, arXiv XML API, and Crossref DOIs for literature..."
        })

        try:
            academic_papers = await AcademicService.search_academic(state.question, max_results=4)
            state.academic_sources = academic_papers
        except Exception as e:
            print(f"[AcademicResearchAgent] Academic fetch error: {e}")
            state.academic_sources = []

        state.agent_logs.append({
            "agent": "academic_researcher",
            "status": "completed",
            "message": f"Retrieved {len(state.academic_sources)} peer-reviewed academic publications."
        })
        return state
