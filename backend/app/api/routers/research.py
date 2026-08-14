import json
import asyncio
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.database.session import get_db
from app.database.models import User, Research, ResearchSource, ResearchClaim, ResearchAgentLog
from app.schemas.schemas import ResearchCreate, ResearchResponse, ResearchDetailResponse
from app.api.deps import get_current_user
from app.core.security_guard import SecurityGuard
from app.agents.state import ResearchState
from app.agents.graph import ResearchWorkflowEngine

router = APIRouter(prefix="/research", tags=["Research"])

@router.post("", response_model=ResearchResponse, status_code=status.HTTP_201_CREATED)
async def create_research(
    payload: ResearchCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Prompt injection protection
    sanitized_question = SecurityGuard.sanitize_prompt(payload.question)

    research = Research(
        user_id=current_user.id,
        question=sanitized_question,
        depth=payload.depth,
        source_preferences=payload.source_preferences,
        date_range=payload.date_range,
        status="pending"
    )
    db.add(research)
    await db.commit()
    await db.refresh(research)
    return research

@router.get("", response_model=List[ResearchResponse])
async def list_user_researches(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Research)
        .where(Research.user_id == current_user.id)
        .order_by(Research.created_at.desc())
    )
    return result.scalars().all()

@router.get("/{research_id}", response_model=ResearchDetailResponse)
async def get_research_detail(
    research_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Research)
        .options(
            selectinload(Research.sources),
            selectinload(Research.claims),
            selectinload(Research.agent_logs)
        )
        .where(Research.id == research_id, Research.user_id == current_user.id)
    )
    research = result.scalars().first()
    if not research:
        raise HTTPException(status_code=404, detail="Research report not found.")
    return research

@router.delete("/{research_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_research(
    research_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Research).where(Research.id == research_id, Research.user_id == current_user.id)
    )
    research = result.scalars().first()
    if not research:
        raise HTTPException(status_code=404, detail="Research not found.")

    await db.delete(research)
    await db.commit()
    return None

@router.post("/{research_id}/cancel")
async def cancel_research(
    research_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    cancelled = ResearchWorkflowEngine.cancel_job(research_id)
    result = await db.execute(
        select(Research).where(Research.id == research_id, Research.user_id == current_user.id)
    )
    research = result.scalars().first()
    if research:
        research.status = "cancelled"
        await db.commit()
    return {"status": "cancelled", "job_id": research_id, "success": cancelled}

@router.get("/{research_id}/stream")
async def stream_research_events(
    research_id: str,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Research).where(Research.id == research_id))
    research = result.scalars().first()
    if not research:
        raise HTTPException(status_code=404, detail="Research ID not found.")

    initial_state = ResearchState(
        research_id=research.id,
        question=research.question,
        depth=research.depth,
        source_preferences=research.source_preferences or ["Web", "Academic"],
        date_range=research.date_range or "Any time"
    )

    async def event_generator():
        # Update research status to running
        research.status = "running"
        await db.commit()

        async for data in ResearchWorkflowEngine.run_workflow_stream(initial_state):
            event_type = data.get("event")
            state_dict = data.get("state", {})

            if event_type in ("completed", "cancelled") and state_dict:
                from app.database.session import AsyncSessionLocal
                async with AsyncSessionLocal() as save_db:
                    res_item = await save_db.get(Research, research_id)
                    if res_item:
                        res_item.status = "completed" if event_type == "completed" else "cancelled"
                        res_item.report_markdown = state_dict.get("report_markdown", "")
                        res_item.summary = (state_dict.get("report_markdown", "")[:400] + "...") if state_dict.get("report_markdown") else ""
                        res_item.sources_count = len(state_dict.get("source_scores", []))
                        res_item.claims_count = len(state_dict.get("claims", []))
                        res_item.verified_claims_count = len([c for c in state_dict.get("claims", []) if c.get("status") == "Verified"])
                        res_item.total_tokens = state_dict.get("prompt_tokens", 0) + state_dict.get("completion_tokens", 0)
                        res_item.estimated_cost_usd = state_dict.get("estimated_cost_usd", 0.0)

                        for s in state_dict.get("source_scores", []):
                            src_obj = ResearchSource(
                                research_id=research_id,
                                title=s.get("title", "Source"),
                                url=s.get("url", ""),
                                publisher=s.get("publisher", "Web"),
                                publish_date=str(s.get("publish_date", "")),
                                quality_score=s.get("quality_score", 80),
                                authority_rating=s.get("authority_rating", 4),
                                relevance_rating=s.get("relevance_rating", 4),
                                recency_rating=s.get("recency_rating", 4),
                                evidence_rating=s.get("evidence_rating", 4),
                                quality_reasoning=s.get("quality_reasoning", ""),
                                citation_index=s.get("citation_index")
                            )
                            save_db.add(src_obj)

                        for c in state_dict.get("claims", []):
                            claim_obj = ResearchClaim(
                                research_id=research_id,
                                claim_text=c.get("claim_text", ""),
                                status=c.get("status", "Verified"),
                                confidence_score=c.get("confidence_score", 0.85),
                                evidence_summary=c.get("evidence_summary", ""),
                                source_urls=c.get("source_urls", [])
                            )
                            save_db.add(claim_obj)

                        for log in state_dict.get("agent_logs", []):
                            log_obj = ResearchAgentLog(
                                research_id=research_id,
                                agent_name=log.get("agent", "agent"),
                                status=log.get("status", "completed"),
                                message=log.get("message", "")
                            )
                            save_db.add(log_obj)

                        await save_db.commit()

            yield f"data: {json.dumps(data)}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")
