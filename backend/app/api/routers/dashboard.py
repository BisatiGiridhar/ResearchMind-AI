from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func

from app.database.session import get_db
from app.database.models import User, Research, ResearchSource, ResearchClaim
from app.schemas.schemas import DashboardStatsResponse, ResearchResponse
from app.api.deps import get_current_user

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/stats", response_model=DashboardStatsResponse)
async def get_dashboard_stats(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Researches completed
    res_count = await db.execute(
        select(func.count(Research.id)).where(Research.user_id == current_user.id, Research.status == "completed")
    )
    completed_cnt = res_count.scalar() or 0

    # Sources analyzed
    src_count = await db.execute(
        select(func.count(ResearchSource.id))
        .join(Research, ResearchSource.research_id == Research.id)
        .where(Research.user_id == current_user.id)
    )
    sources_cnt = src_count.scalar() or 0

    # Claims verified
    claim_count = await db.execute(
        select(func.count(ResearchClaim.id))
        .join(Research, ResearchClaim.research_id == Research.id)
        .where(Research.user_id == current_user.id, ResearchClaim.status == "Verified")
    )
    claims_cnt = claim_count.scalar() or 0

    # Recent researches
    recents = await db.execute(
        select(Research)
        .where(Research.user_id == current_user.id)
        .order_by(Research.created_at.desc())
        .limit(5)
    )
    recent_items = recents.scalars().all()

    return {
        "researches_completed": completed_cnt,
        "sources_analyzed": sources_cnt,
        "claims_verified": claims_cnt,
        "reports_generated": completed_cnt,
        "recent_researches": recent_items
    }
