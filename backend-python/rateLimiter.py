import asyncio
from collections import defaultdict
from datetime import datetime, timedelta


class AccountRateLimiter:
    def __init__(self, hourly_limit=5000, daily_limit=35000):
        self.hourly_limit = hourly_limit
        self.daily_limit = daily_limit
        self.account_limits = defaultdict(lambda: {"hourly_points": 0, "daily_points": 0})
        self.lock = asyncio.Lock()
        self.hourly_reset_times = defaultdict(lambda: datetime.now() + timedelta(hours=1))
        self.daily_reset_times = defaultdict(lambda: datetime.now() + timedelta(days=1))

    async def _reset_points(self, account_id):
        """Reset points for an account if time window has passed."""
        now = datetime.now()

        # Reset hourly points
        if now >= self.hourly_reset_times[account_id]:
            self.account_limits[account_id]["hourly_points"] = 0
            self.hourly_reset_times[account_id] = now + timedelta(hours=1)

        # Reset daily points
        if now >= self.daily_reset_times[account_id]:
            self.account_limits[account_id]["daily_points"] = 0
            self.daily_reset_times[account_id] = now + timedelta(days=1)

    async def acquire(self, account_id, action_points):
        """Try to acquire points for an account based on the action."""
        while True:
            async with self.lock:
                # Reset points if needed
                await self._reset_points(account_id)

                limits = self.account_limits[account_id]
                if (
                    limits["hourly_points"] + action_points <= self.hourly_limit
                    and limits["daily_points"] + action_points <= self.daily_limit
                ):
                    # Grant points
                    limits["hourly_points"] += action_points
                    limits["daily_points"] += action_points
                    return True

            await asyncio.sleep(1)  # Wait if limit exceeded

    def get_limits(self, account_id):
        """Get current limits for debugging or logging."""
        return self.account_limits[account_id]


# Usage Example
rate_limiter = AccountRateLimiter()

# Points for specific actions
ACTION_POINTS = {
    "CREATE": 3,
    "UPDATE": 2,
    "DELETE": 1,
}
