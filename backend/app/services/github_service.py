import urllib.parse
import httpx
from typing import Dict, Any

class GitHubService:
    """
    Service for inspecting GitHub public repository URL, metadata, and README.
    """

    @staticmethod
    async def inspect_repository(url: str) -> Dict[str, Any]:
        parsed = urllib.parse.urlparse(url)
        path_parts = [p for p in parsed.path.split("/") if p]
        
        if "github.com" not in parsed.netloc or len(path_parts) < 2:
            return {"valid": False, "error": "Invalid GitHub repository URL structure (expected https://github.com/owner/repo)."}

        owner, repo = path_parts[0], path_parts[1]
        api_url = f"https://api.github.com/repos/{owner}/{repo}"

        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(api_url, headers={"User-Agent": "MultiAgentResearchAssistant/1.0"})
            if resp.status_code != 200:
                return {"valid": False, "error": f"GitHub API error ({resp.status_code}): Repository not found or private."}

            data = resp.json()

            # Try fetching README
            readme_url = f"https://raw.githubusercontent.com/{owner}/{repo}/main/README.md"
            readme_resp = await client.get(readme_url)
            readme_text = readme_resp.text[:1500] if readme_resp.status_code == 200 else "README not found."

            return {
                "valid": True,
                "repo_name": data.get("full_name", f"{owner}/{repo}"),
                "stars": data.get("stargazers_count", 0),
                "forks": data.get("forks_count", 0),
                "description": data.get("description", "No description provided."),
                "readme_snippet": readme_text
            }
