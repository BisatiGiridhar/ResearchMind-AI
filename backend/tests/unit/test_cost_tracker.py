from app.core.cost_tracker import CostTracker

def test_cost_tracker_calculation():
    cost_info = CostTracker.calculate_cost(prompt_tokens=1000, completion_tokens=500, model="gpt-4o-mini")
    assert cost_info["total_tokens"] == 1500
    assert cost_info["prompt_tokens"] == 1000
    assert cost_info["completion_tokens"] == 500
    assert cost_info["estimated_cost_usd"] > 0
