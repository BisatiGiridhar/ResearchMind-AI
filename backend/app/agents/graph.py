import asyncio
from typing import AsyncGenerator, Dict, Any
from app.agents.state import ResearchState
from app.agents.planner_agent import PlannerAgent
from app.agents.web_agent import WebResearchAgent
from app.agents.academic_agent import AcademicResearchAgent
from app.agents.data_agent import DataAnalysisAgent
from app.agents.fact_checker_agent import FactCheckerAgent
from app.agents.source_evaluator_agent import SourceEvaluatorAgent
from app.agents.synthesizer_agent import SynthesizerAgent
from app.agents.report_generator_agent import ReportGeneratorAgent
from app.agents.citation_validator import CitationValidatorAgent
from app.agents.hallucination_validator import HallucinationValidatorAgent

class ResearchWorkflowEngine:
    """
    LangGraph orchestration engine executing the 10 multi-agent nodes.
    Supports real-time SSE generator stream events and background job cancellation.
    """

    ACTIVE_JOBS: Dict[str, ResearchState] = {}

    @classmethod
    def cancel_job(cls, research_id: str) -> bool:
        if research_id in cls.ACTIVE_JOBS:
            cls.ACTIVE_JOBS[research_id].is_cancelled = True
            return True
        return False

    @classmethod
    async def run_workflow_stream(cls, initial_state: ResearchState) -> AsyncGenerator[Dict[str, Any], None]:
        research_id = initial_state.research_id
        cls.ACTIVE_JOBS[research_id] = initial_state
        state = initial_state

        agents_pipeline = [
            ("planner", PlannerAgent.run),
            ("web_researcher", WebResearchAgent.run),
            ("academic_researcher", AcademicResearchAgent.run),
            ("data_analyzer", DataAnalysisAgent.run),
            ("fact_checker", FactCheckerAgent.run),
            ("source_evaluator", SourceEvaluatorAgent.run),
            ("synthesizer", SynthesizerAgent.run),
            ("report_generator", ReportGeneratorAgent.run),
            ("citation_validator", CitationValidatorAgent.run),
            ("hallucination_validator", HallucinationValidatorAgent.run),
        ]

        try:
            for name, agent_func in agents_pipeline:
                if state.is_cancelled:
                    yield {
                        "event": "cancelled",
                        "agent": name,
                        "progress": state.progress_percentage,
                        "message": f"Research job {research_id} was cancelled by user.",
                        "state": state.model_dump()
                    }
                    break

                yield {
                    "event": "node_start",
                    "agent": name,
                    "progress": state.progress_percentage,
                    "message": f"Agent '{name}' starting task...",
                }

                state = await agent_func(state)

                yield {
                    "event": "node_complete",
                    "agent": name,
                    "progress": state.progress_percentage,
                    "message": state.agent_logs[-1]["message"] if state.agent_logs else "Node complete",
                    "state": state.model_dump()
                }

                await asyncio.sleep(0.1)

            if not state.is_cancelled:
                yield {
                    "event": "completed",
                    "agent": "finished",
                    "progress": 100,
                    "message": "Multi-agent research workflow completed successfully.",
                    "state": state.model_dump()
                }

        finally:
            if research_id in cls.ACTIVE_JOBS:
                del cls.ACTIVE_JOBS[research_id]
