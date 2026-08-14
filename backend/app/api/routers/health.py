from fastapi import APIRouter
from app.core.config import settings

router = APIRouter(tags=["Health"])

@router.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": settings.ENV,
        "search_configured": bool(settings.SEARCH_API_KEY),
        "openai_configured": bool(settings.OPENAI_API_KEY)
    }
