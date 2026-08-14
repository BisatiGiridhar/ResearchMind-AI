import json
from typing import List
from app.agents.state import ResearchState
from app.core.config import settings

class PlannerAgent:
    """
    Agent 1 — Research Planner Agent
    Decomposes the main research question into 3-5 distinct subtopics and search queries.
    """

    @staticmethod
    async def run(state: ResearchState) -> ResearchState:
        if state.is_cancelled:
            return state

        state.current_agent = "planner"
        state.progress_percentage = 10
        state.agent_logs.append({
            "agent": "planner",
            "status": "running",
            "message": f"Decomposing research prompt '{state.question}' into search subtopics..."
        })

        if settings.OPENAI_API_KEY:
            try:
                from langchain_openai import ChatOpenAI
                llm = ChatOpenAI(model=settings.OPENAI_MODEL, api_key=settings.OPENAI_API_KEY, temperature=0.1)
                prompt = f"""You are an Expert Research Director. Decompose this research question into 3 focused subtopics and 3 web/academic search queries:
"{state.question}"

Return ONLY valid JSON in this format:
{{
  "subtopics": ["Subtopic 1", "Subtopic 2", "Subtopic 3"],
  "search_queries": ["Query 1", "Query 2", "Query 3"]
}}"""
                res = await llm.ainvoke(prompt)
                content = res.content.strip()
                if content.startswith("```"):
                    content = content.split("\n", 1)[1].rsplit("```", 1)[0].strip()
                parsed = json.loads(content)
                state.subtopics = parsed.get("subtopics", [])
                state.search_queries = parsed.get("search_queries", [])

                if hasattr(res, "response_metadata"):
                    tokens = res.response_metadata.get("token_usage", {})
                    state.prompt_tokens += tokens.get("prompt_tokens", 0)
                    state.completion_tokens += tokens.get("completion_tokens", 0)
            except Exception as e:
                print(f"[PlannerAgent] LLM error: {e}. Fallback heuristics applied.")
                PlannerAgent._heuristic_plan(state)
        else:
            PlannerAgent._heuristic_plan(state)

        state.agent_logs.append({
            "agent": "planner",
            "status": "completed",
            "message": f"Decomposed query into {len(state.subtopics)} subtopics and {len(state.search_queries)} search vectors."
        })
        return state

    @staticmethod
    def _heuristic_plan(state: ResearchState):
        q = state.question
        state.subtopics = [
            f"Current industry baseline and adoption trends for '{q[:30]}'",
            f"Workforce impact, labor displacement, and developer productivity metrics",
            f"Academic consensus and strategic forecasts for 2026-2030"
        ]
        state.search_queries = [
            f"{q} statistics market report",
            f"{q} software engineering productivity case study",
            f"{q} academic paper survey"
        ]
