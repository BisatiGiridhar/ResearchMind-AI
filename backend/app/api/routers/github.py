from fastapi import APIRouter, Depends, HTTPException
from app.schemas.schemas import GitHubInspectRequest, GitHubInspectResponse
from app.services.github_service import GitHubService
from app.core.security_guard import SecurityGuard
from app.api.deps import get_current_user
from app.database.models import User

router = APIRouter(prefix="/github", tags=["GitHub"])

@router.post("/inspect", response_model=GitHubInspectResponse)
async def inspect_github_repo(
    payload: GitHubInspectRequest,
    current_user: User = Depends(get_current_user)
):
    # Sanitize and validate external URL for SSRF protection
    validated_url = SecurityGuard.validate_external_url(payload.url)
    
    result = await GitHubService.inspect_repository(validated_url)
    if not result.get("valid"):
        raise HTTPException(status_code=400, detail=result.get("error", "Failed to inspect GitHub repository."))

    return result
