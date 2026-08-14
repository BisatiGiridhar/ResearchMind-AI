from typing import Dict, Any

# Standard Pricing per 1M tokens (USD)
MODEL_PRICING = {
    "gpt-4o-mini": {"prompt_per_1m": 0.15, "completion_per_1m": 0.60},
    "gpt-4o": {"prompt_per_1m": 2.50, "completion_per_1m": 10.00},
    "gpt-3.5-turbo": {"prompt_per_1m": 0.50, "completion_per_1m": 1.50}
}

class CostTracker:
    """
    Utility tracking token consumption and calculating USD cost per research run.
    """

    @staticmethod
    def calculate_cost(prompt_tokens: int, completion_tokens: int, model: str = "gpt-4o-mini") -> Dict[str, Any]:
        pricing = MODEL_PRICING.get(model, MODEL_PRICING["gpt-4o-mini"])
        
        prompt_cost = (prompt_tokens / 1_000_000) * pricing["prompt_per_1m"]
        completion_cost = (completion_tokens / 1_000_000) * pricing["completion_per_1m"]
        total_cost = prompt_cost + completion_cost

        return {
            "prompt_tokens": prompt_tokens,
            "completion_tokens": completion_tokens,
            "total_tokens": prompt_tokens + completion_tokens,
            "estimated_cost_usd": round(total_cost, 6)
        }
