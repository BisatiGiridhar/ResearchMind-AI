import asyncio
import httpx
import json

API_BASE_URL = "http://localhost:8000/api"

async def execute_live_research():
    async with httpx.AsyncClient(timeout=180.0) as client:
        # 1. Register / Login user to get JWT token
        auth_payload = {
            "email": "live_researcher@ai.org",
            "password": "password123",
            "full_name": "Dr. Alex Rivera"
        }
        try:
            await client.post(f"{API_BASE_URL}/auth/register", json=auth_payload)
        except Exception:
            pass

        login_resp = await client.post(
            f"{API_BASE_URL}/auth/login",
            data={"username": "live_researcher@ai.org", "password": "password123"}
        )
        
        token = login_resp.json().get("access_token")
        headers = {"Authorization": f"Bearer {token}"}
        print("Authenticated successfully with JWT token!")

        # 2. Create research task
        payload = {
            "question": "What will be the impact of generative AI on software engineering jobs in India between 2026 and 2030?",
            "depth": "Standard",
            "source_preferences": ["Web", "Academic"],
            "date_range": "Any time"
        }
        print("Submitting research job to backend API with live Tavily & OpenAI keys...")
        resp = await client.post(f"{API_BASE_URL}/research", json=payload, headers=headers)
        if resp.status_code not in (200, 201):
            print(f"Error submitting research: {resp.status_code} {resp.text}")
            return

        data = resp.json()
        research_id = data["id"]
        print(f"Research Job Created! Job ID: {research_id}\n")

        # 3. Connect to real-time SSE stream
        print("Connecting to live SSE stream & running 10-Agent pipeline...")
        async with client.stream("GET", f"{API_BASE_URL}/research/{research_id}/stream", headers=headers) as stream:
            async for line in stream.aiter_lines():
                if line.startswith("data: "):
                    event_json = line[6:]
                    try:
                        event_data = json.loads(event_json)
                        agent = event_data.get("agent", "engine")
                        progress = event_data.get("progress", 0)
                        message = event_data.get("message", "")
                        print(f"[{progress}%] Agent '{agent}': {message}")
                        
                        if event_data.get("event") == "completed":
                            print("\n=== MULTI-AGENT WORKFLOW COMPLETED! ===")
                            break
                    except Exception:
                        pass

        # 4. Wait brief moment for DB async commit to finalize
        await asyncio.sleep(1.0)

        # 5. Fetch detailed report output from DB
        detail_resp = await client.get(f"{API_BASE_URL}/research/{research_id}", headers=headers)
        if detail_resp.status_code == 200:
            detail = detail_resp.json()
            print("\n" + "="*70)
            print(f"RESEARCH TOPIC: {detail.get('question')}")
            print(f"Total Sources Retrieved: {len(detail.get('sources', []))}")
            print(f"Verified Claims: {len(detail.get('claims', []))}")
            print("="*70 + "\n")
            print(detail.get("report_markdown", "No report generated."))

if __name__ == "__main__":
    asyncio.run(execute_live_research())
