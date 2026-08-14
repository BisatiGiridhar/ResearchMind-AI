import urllib.parse
import httpx
from typing import List, Dict, Any
from fastapi import HTTPException
from app.core.config import settings

class SearchService:
    """
    Production Web Search Service supporting Tavily, Serper, and Brave Search APIs.
    STRICT ZERO-MOCK POLICY: If no search API key is configured or search fails,
    an explicit HTTPException is returned.
    """

    @staticmethod
    async def search_web(query: str, max_results: int = 5) -> List[Dict[str, Any]]:
        api_key = settings.SEARCH_API_KEY
        provider = settings.SEARCH_PROVIDER.lower()

        if not api_key:
            raise HTTPException(
                status_code=503,
                detail="Search API Key is missing. Please configure SEARCH_API_KEY in your environment variables (Tavily, Serper, or Brave API key)."
            )

        if provider == "tavily" or (provider == "auto" and "tvly" in api_key):
            return await SearchService._search_tavily(query, api_key, max_results)
        elif provider == "serper":
            return await SearchService._search_serper(query, api_key, max_results)
        elif provider == "brave":
            return await SearchService._search_brave(query, api_key, max_results)
        else:
            # Default to Tavily if key present
            return await SearchService._search_tavily(query, api_key, max_results)

    @staticmethod
    async def _search_tavily(query: str, api_key: str, max_results: int) -> List[Dict[str, Any]]:
        async with httpx.AsyncClient(timeout=12.0) as client:
            resp = await client.post(
                "https://api.tavily.com/search",
                json={
                    "api_key": api_key,
                    "query": query,
                    "max_results": max_results,
                    "include_answer": False,
                    "include_raw_content": False
                }
            )
            if resp.status_code == 200:
                data = resp.json()
                results = []
                for item in data.get("results", []):
                    results.append({
                        "title": item.get("title", query),
                        "url": item.get("url"),
                        "snippet": item.get("content", ""),
                        "publisher": urllib.parse.urlparse(item.get("url")).netloc,
                        "source_type": "web"
                    })
                return results
            else:
                raise HTTPException(
                    status_code=resp.status_code,
                    detail=f"Tavily Search API Error ({resp.status_code}): {resp.text[:200]}"
                )

    @staticmethod
    async def _search_serper(query: str, api_key: str, max_results: int) -> List[Dict[str, Any]]:
        async with httpx.AsyncClient(timeout=12.0) as client:
            resp = await client.post(
                "https://google.serper.dev/search",
                headers={"X-API-KEY": api_key, "Content-Type": "application/json"},
                json={"q": query, "num": max_results}
            )
            if resp.status_code == 200:
                data = resp.json()
                results = []
                for item in data.get("organic", []):
                    results.append({
                        "title": item.get("title", query),
                        "url": item.get("link"),
                        "snippet": item.get("snippet", ""),
                        "publisher": urllib.parse.urlparse(item.get("link")).netloc,
                        "source_type": "web"
                    })
                return results
            else:
                raise HTTPException(
                    status_code=resp.status_code,
                    detail=f"Serper API Error ({resp.status_code}): {resp.text[:200]}"
                )

    @staticmethod
    async def _search_brave(query: str, api_key: str, max_results: int) -> List[Dict[str, Any]]:
        async with httpx.AsyncClient(timeout=12.0) as client:
            resp = await client.get(
                f"https://api.search.brave.com/res/v1/web/search?q={urllib.parse.quote(query)}&count={max_results}",
                headers={"Accept": "application/json", "X-Subscription-Token": api_key}
            )
            if resp.status_code == 200:
                data = resp.json()
                results = []
                for item in data.get("web", {}).get("results", []):
                    results.append({
                        "title": item.get("title", query),
                        "url": item.get("url"),
                        "snippet": item.get("description", ""),
                        "publisher": urllib.parse.urlparse(item.get("url")).netloc,
                        "source_type": "web"
                    })
                return results
            else:
                raise HTTPException(
                    status_code=resp.status_code,
                    detail=f"Brave Search API Error ({resp.status_code}): {resp.text[:200]}"
                )
