import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Integer, Float, JSON, Boolean
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    email = Column(String(255), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=True)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    researches = relationship("Research", back_populates="user", cascade="all, delete-orphan")
    documents = relationship("Document", back_populates="user", cascade="all, delete-orphan")

class Research(Base):
    __tablename__ = "researches"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    question = Column(Text, nullable=False)
    depth = Column(String(50), default="Standard")  # Quick, Standard, Deep, Comprehensive
    source_preferences = Column(JSON, default=list)  # ["Web", "Academic", "News", etc.]
    date_range = Column(String(50), default="Any time")
    status = Column(String(50), default="pending")  # pending, running, completed, cancelled, failed
    
    # Aggregated metrics
    sources_count = Column(Integer, default=0)
    claims_count = Column(Integer, default=0)
    verified_claims_count = Column(Integer, default=0)
    duration_seconds = Column(Float, default=0.0)
    
    # Token & Cost Metrics
    total_tokens = Column(Integer, default=0)
    estimated_cost_usd = Column(Float, default=0.0)

    # Generated Outputs
    summary = Column(Text, nullable=True)
    report_markdown = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="researches")
    sources = relationship("ResearchSource", back_populates="research", cascade="all, delete-orphan")
    claims = relationship("ResearchClaim", back_populates="research", cascade="all, delete-orphan")
    agent_logs = relationship("ResearchAgentLog", back_populates="research", cascade="all, delete-orphan")

class ResearchSource(Base):
    __tablename__ = "research_sources"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    research_id = Column(String(36), ForeignKey("researches.id"), nullable=False)
    title = Column(String(500), nullable=False)
    url = Column(Text, nullable=False)
    publisher = Column(String(255), nullable=True)
    publish_date = Column(String(100), nullable=True)
    source_type = Column(String(50), default="web")  # web, academic, document, github
    
    # Credibility Ratings (0-100)
    quality_score = Column(Integer, default=75)
    authority_rating = Column(Integer, default=4)  # 1-5
    relevance_rating = Column(Integer, default=4)  # 1-5
    recency_rating = Column(Integer, default=4)    # 1-5
    evidence_rating = Column(Integer, default=4)   # 1-5
    quality_reasoning = Column(Text, nullable=True)

    key_findings = Column(JSON, default=list)
    citation_index = Column(Integer, nullable=True)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    research = relationship("Research", back_populates="sources")

class ResearchClaim(Base):
    __tablename__ = "research_claims"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    research_id = Column(String(36), ForeignKey("researches.id"), nullable=False)
    claim_text = Column(Text, nullable=False)
    status = Column(String(50), default="Verified")  # Verified, Partially Verified, Conflicting, Unsupported
    confidence_score = Column(Float, default=0.85)  # 0.0 to 1.0
    evidence_summary = Column(Text, nullable=True)
    source_urls = Column(JSON, default=list)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    research = relationship("Research", back_populates="claims")

class Document(Base):
    __tablename__ = "documents"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    filename = Column(String(255), nullable=False)
    file_type = Column(String(50), nullable=False)  # pdf, docx, txt, md
    content_text = Column(Text, nullable=False)
    chunk_count = Column(Integer, default=0)
    
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    user = relationship("User", back_populates="documents")

class ResearchAgentLog(Base):
    __tablename__ = "research_agent_logs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    research_id = Column(String(36), ForeignKey("researches.id"), nullable=False)
    agent_name = Column(String(100), nullable=False)
    status = Column(String(50), default="completed")  # running, completed, error, cancelled
    message = Column(Text, nullable=False)
    timestamp = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    research = relationship("Research", back_populates="agent_logs")
