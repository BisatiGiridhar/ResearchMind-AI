import urllib.parse
import xml.etree.ElementTree as ET
import httpx
from typing import List, Dict, Any

class AcademicService:
    """
    Production Academic Research Service integrating:
    1. arXiv XML API (http://export.arxiv.org/api/query)
    2. Crossref REST API (https://api.crossref.org/works)
    """

    @staticmethod
    async def search_academic(query: str, max_results: int = 5) -> List[Dict[str, Any]]:
        results = []

        # 1. arXiv API (Primary open-access paper source)
        try:
            arxiv_results = await AcademicService._search_arxiv(query, max_results=max_results)
            results.extend(arxiv_results)
        except Exception as e:
            print(f"[AcademicService] arXiv error: {e}")

        # 2. Crossref API (Supplementary peer-reviewed DOI publications)
        if len(results) < max_results:
            try:
                crossref_results = await AcademicService._search_crossref(query, max_results=max_results - len(results))
                results.extend(crossref_results)
            except Exception as e:
                print(f"[AcademicService] Crossref error: {e}")

        return results

    @staticmethod
    async def _search_arxiv(query: str, max_results: int = 3) -> List[Dict[str, Any]]:
        clean_query = urllib.parse.quote(f"all:{query}")
        url = f"http://export.arxiv.org/api/query?search_query={clean_query}&start=0&max_results={max_results}"

        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(url)
            if resp.status_code != 200:
                return []

            results = []
            root = ET.fromstring(resp.text)
            ns = {"atom": "http://www.w3.org/2005/Atom", "arxiv": "http://arxiv.org/schemas/atom"}

            for entry in root.findall("atom:entry", ns):
                title = entry.find("atom:title", ns).text.strip().replace("\n", " ")
                summary = entry.find("atom:summary", ns).text.strip().replace("\n", " ")
                published = entry.find("atom:published", ns).text[:4] if entry.find("atom:published", ns) is not None else "2024"
                
                paper_id = entry.find("atom:id", ns).text.strip()
                authors = [a.find("atom:name", ns).text for a in entry.findall("atom:author", ns)]

                results.append({
                    "title": f"[arXiv] {title}",
                    "url": paper_id,
                    "snippet": f"Authors: {', '.join(authors[:3])} ({published}). Abstract: {summary[:280]}...",
                    "publisher": "arXiv.org",
                    "publish_date": published,
                    "authors": authors[:5],
                    "source_type": "academic"
                })

            return results

    @staticmethod
    async def _search_crossref(query: str, max_results: int = 3) -> List[Dict[str, Any]]:
        url = f"https://api.crossref.org/works?query={urllib.parse.quote(query)}&rows={max_results}"

        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(url, headers={"User-Agent": "MultiAgentResearchAssistant/1.0"})
            if resp.status_code != 200:
                return []

            data = resp.json()
            items = data.get("message", {}).get("items", [])
            results = []

            for item in items:
                title_list = item.get("title", [])
                title = title_list[0] if title_list else "Academic Publication"
                doi_url = item.get("URL", f"https://doi.org/{item.get('DOI', '')}")
                publisher = item.get("publisher", "Academic Journal")
                
                issued = item.get("issued", {}).get("date-parts", [[2024]])[0][0]
                authors_raw = item.get("author", [])
                authors = [f"{a.get('given', '')} {a.get('family', '')}".strip() for a in authors_raw[:3]]

                results.append({
                    "title": title,
                    "url": doi_url,
                    "snippet": f"Published in {publisher} ({issued}) by {', '.join(authors) if authors else 'Research Group'}.",
                    "publisher": publisher,
                    "publish_date": str(issued),
                    "authors": authors,
                    "source_type": "academic"
                })

            return results
