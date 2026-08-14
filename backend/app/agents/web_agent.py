from typing import List, Dict, Any
from app.agents.state import ResearchState
from app.services.search_service import SearchService

class WebResearchAgent:
    """
    Agent 2 — Web Research Agent
    Queries real web search APIs (Tavily/Serper/Brave) for each search query vector.
    """

    @staticmethod
    async def run(state: ResearchState) -> ResearchState:
        if state.is_cancelled:
            return state

        state.current_agent = "web_researcher"
        state.progress_percentage = 25

        state.agent_logs.append({
            "agent": "web_researcher",
            "status": "running",
            "message": f"Executing parallel web searches across Tavily/Serper APIs..."
        })

        gathered_results: List[Dict[str, Any]] = []

        queries = state.search_queries or [state.question]
        for query in queries[:3]:
            try:
                results = await SearchService.search_web(query, max_results=3)
                gathered_results.extend(results)
            except Exception as e:
                err_msg = f"[WebResearchAgent] Search error for '{query}': {e}"
                print(err_msg)
                state.agent_logs.append({
                    "agent": "web_researcher",
                    "status": "error",
                    "message": err_msg
                })

        state.web_sources = gathered_results
        state.agent_logs.append({
            "agent": "web_researcher",
            "status": "completed",
            "message": f"Retrieved {len(gathered_results)} real web search source objects."
        })
        return state
