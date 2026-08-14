from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class ResearchState(BaseModel):
    research_id: str
    question: str
    depth: str = "Standard"
    source_preferences: List[str] = Field(default_factory=lambda: ["Web", "Academic"])
    date_range: str = "Any time"
    document_context: Optional[str] = ""
    github_context: Optional[str] = ""

    # Execution control & cancellation flag
    is_cancelled: bool = False

    # State accumulated across agent nodes
    subtopics: List[str] = Field(default_factory=list)
    search_queries: List[str] = Field(default_factory=list)
    
    # Findings & Sources
    web_sources: List[Dict[str, Any]] = Field(default_factory=list)
    academic_sources: List[Dict[str, Any]] = Field(default_factory=list)
    extracted_statistics: List[Dict[str, Any]] = Field(default_factory=list)
    
    # Claim verification & Source scoring
    claims: List[Dict[str, Any]] = Field(default_factory=list)
    source_scores: List[Dict[str, Any]] = Field(default_factory=list)
    
    # Synthesis & Report
    synthesis: Dict[str, Any] = Field(default_factory=dict)
    report_markdown: str = ""
    citation_validation: Dict[str, Any] = Field(default_factory=dict)
    hallucination_check: Dict[str, Any] = Field(default_factory=dict)

    # Cost Tracking
    prompt_tokens: int = 0
    completion_tokens: int = 0
    estimated_cost_usd: float = 0.0

    # Execution Tracking
    current_agent: str = "initialized"
    progress_percentage: int = 0
    agent_logs: List[Dict[str, Any]] = Field(default_factory=list)
    errors: List[str] = Field(default_factory=list)
