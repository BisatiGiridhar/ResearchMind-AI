from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field

# --- User Schemas ---
class UserCreate(BaseModel):
    email: str
    password: str
    full_name: Optional[str] = None

class UserResponse(BaseModel):
    id: str
    email: str
    full_name: Optional[str] = None
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

# --- Research Schemas ---
class ResearchCreate(BaseModel):
    question: str
    depth: str = "Standard"
    source_preferences: List[str] = Field(default_factory=lambda: ["Web", "Academic"])
    date_range: str = "Any time"
    github_url: Optional[str] = None

class ResearchSourceResponse(BaseModel):
    id: str
    title: str
    url: str
    publisher: Optional[str] = None
    publish_date: Optional[str] = None
    source_type: str = "web"
    quality_score: int = 80
    authority_rating: int = 4
    relevance_rating: int = 4
    recency_rating: int = 4
    evidence_rating: int = 4
    quality_reasoning: Optional[str] = None
    citation_index: Optional[int] = None

    class Config:
        from_attributes = True

class ResearchClaimResponse(BaseModel):
    id: str
    claim_text: str
    status: str = "Verified"
    confidence_score: float = 0.85
    evidence_summary: Optional[str] = None
    source_urls: List[str] = Field(default_factory=list)

    class Config:
        from_attributes = True

class ResearchAgentLogResponse(BaseModel):
    id: str
    agent_name: str
    status: str
    message: str
    timestamp: datetime

    class Config:
        from_attributes = True

class ResearchResponse(BaseModel):
    id: str
    question: str
    depth: str
    status: str
    sources_count: int = 0
    claims_count: int = 0
    verified_claims_count: int = 0
    total_tokens: int = 0
    estimated_cost_usd: float = 0.0
    created_at: datetime

    class Config:
        from_attributes = True

class ResearchDetailResponse(ResearchResponse):
    summary: Optional[str] = None
    report_markdown: Optional[str] = None
    sources: List[ResearchSourceResponse] = Field(default_factory=list)
    claims: List[ResearchClaimResponse] = Field(default_factory=list)
    agent_logs: List[ResearchAgentLogResponse] = Field(default_factory=list)

    class Config:
        from_attributes = True

# --- Document Schemas ---
class DocumentSchema(BaseModel):
    id: str
    filename: str
    file_type: str
    chunk_count: int
    created_at: datetime

    class Config:
        from_attributes = True

# --- GitHub Inspect Schemas ---
class GitHubInspectRequest(BaseModel):
    url: str

class GitHubInspectResponse(BaseModel):
    valid: bool
    repo_name: Optional[str] = None
    stars: int = 0
    forks: int = 0
    description: Optional[str] = None
    readme_snippet: Optional[str] = None
    error: Optional[str] = None

# --- Dashboard Stats Schemas ---
class DashboardStatsResponse(BaseModel):
    researches_completed: int
    sources_analyzed: int
    claims_verified: int
    reports_generated: int
    recent_researches: List[ResearchResponse]
