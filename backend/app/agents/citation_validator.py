import re
from typing import Dict, Any, List
from app.agents.state import ResearchState

class CitationValidatorAgent:
    """
    Agent 9 — Citation Manager / Validator Agent
    Verifies that every inline numerical citation [1], [2] in the report markdown
    corresponds to a valid, existing source object in state.source_scores.
    """

    @staticmethod
    async def run(state: ResearchState) -> ResearchState:
        if state.is_cancelled:
            return state

        state.current_agent = "citation_validator"
        state.progress_percentage = 94

        state.agent_logs.append({
            "agent": "citation_validator",
            "status": "running",
            "message": "Validating inline report citations [1], [2] against retrieved source URLs..."
        })

        citations_found = re.findall(r"\[(\d+)\]", state.report_markdown)
        valid_indices = {s.get("citation_index") for s in state.source_scores if s.get("citation_index")}

        valid_citations = []
        invalid_citations = []

        for cit in set(citations_found):
            idx = int(cit)
            if idx in valid_indices or idx <= len(state.source_scores):
                valid_citations.append(idx)
            else:
                invalid_citations.append(idx)

        state.citation_validation = {
            "total_citations": len(citations_found),
            "unique_citations": len(set(citations_found)),
            "valid_citations": valid_citations,
            "invalid_citations": invalid_citations,
            "is_valid": len(invalid_citations) == 0
        }

        state.agent_logs.append({
            "agent": "citation_validator",
            "status": "completed",
            "message": f"Citation validation complete: {len(valid_citations)} verified, {len(invalid_citations)} ungrounded."
        })
        return state
