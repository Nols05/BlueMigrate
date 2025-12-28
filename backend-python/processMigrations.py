import asyncio
import httpx
from bluesky import migrateTweetsToBluesky
from twitter import get_user_tweets, extract_thread
from dotenv import load_dotenv
import os
import time

load_dotenv()
api_frontend_url = os.getenv("API_FRONTEND_URL")

# Add migration request to the queue
async def add_to_queue(queue: asyncio.Queue, request_data: dict):
    await queue.put(request_data)

# Process migration tasks from the queue
async def process_queue(queue: asyncio.Queue, processor_name: str = "default"):
    last_processed_time = None

    print(f"Queue processor {processor_name} started")

    while True:
        try:
            # Wait for a task from the queue
            request_data = await queue.get()
            print(f"[{processor_name}] Processing migration task: {request_data.get('migrationId', 'unknown')}")

            # SMART WAITING: Check rate limit status before enforcing gaps
            if last_processed_time:
                elapsed_time = time.time() - last_processed_time
                # Adaptive waiting based on rate limit reset status
                # Check if we need to wait for Twitter rate limit reset
                from twitter import RESET_TIME, endpoint_counters, endpoint_start_times, ENDPOINT_RATE_LIMITS

                # Check if any endpoint counters are still active
                needs_wait = False
                max_remaining_time = 0

                for endpoint, limit in ENDPOINT_RATE_LIMITS.items():
                    if endpoint in endpoint_counters and endpoint_counters[endpoint] > 0:
                        start_time = endpoint_start_times.get(endpoint, time.time())
                        elapsed = time.time() - start_time
                        if elapsed < RESET_TIME:
                            remaining = RESET_TIME - elapsed
                            max_remaining_time = max(max_remaining_time, remaining)
                            needs_wait = True

                if needs_wait and max_remaining_time > 60:  # Only wait if more than 1 minute remaining
                    sleep_time = min(max_remaining_time + 30, 300)  # Cap at 5 minutes
                    print(f"[{processor_name}] RATE LIMIT ACTIVE: Waiting {sleep_time:.2f} seconds for Twitter rate limits to reset.")
                    await asyncio.sleep(sleep_time)
                elif elapsed_time < 60:  # Minimum 1 minute gap for safety
                    sleep_time = 60 - elapsed_time
                    print(f"[{processor_name}] MINIMUM GAP: Waiting {sleep_time:.2f} seconds before next migration.")
                    await asyncio.sleep(sleep_time)

            # Perform migration
            await perform_migration(request_data)
            success = True
            error_message = None

        except Exception as e:
            success = False
            error_message = str(e)
            print(f"[{processor_name}] Error processing task: {e}")

        finally:
            # Notify task status
            await notify_task_status(request_data, success=success, error_message=error_message, processor_name=processor_name)

            # Always update the last processed time regardless of success to enforce rate limiting
            last_processed_time = time.time()
            queue.task_done()

# Perform migration
async def perform_migration(request_data: dict):
    await migrate_tweets(request_data)

# Migrate user tweets
async def migrate_tweets(request_data: dict):
    limit = request_data.get("limit", 800)
    print(f"Starting tweet migration for {request_data['twitterName']} with limit {limit}.")

    tweets = await get_user_tweets(request_data["twitterName"], limit=limit)

    # Extract thread data if thread URLs are provided
    thread_urls = request_data.get("threadUrls", [])
    if thread_urls:
        threads = await extract_threads(thread_urls)
        tweets.extend(threads)

    await migrateTweetsToBluesky(tweets, request_data["bskyHandle"], request_data["password"], request_data["did"], request_data["migrationId"])

    print(f"Migration completed for {request_data['twitterName']}")

# Extract thread data from URLs
async def extract_threads(thread_urls: list):
    threads = []
    for url in thread_urls:
        try:
            print(f"Extracting thread for URL: {url}")
            thread = await extract_thread(url)
            if thread:
                threads.append(thread)
            else:
                print(f"No thread data returned for URL: {url}")
        except Exception as e:
            print(f"Error extracting thread for URL {url}: {e}")
            # Continue processing other threads instead of failing entirely
            continue
    return threads

# Notify task status
async def notify_task_status(request_data: dict, success: bool, error_message: str = None, processor_name: str = "default"):
    url = f"{api_frontend_url}/api/notify"
    payload = {
        "migrationId": request_data["migrationId"],
        "twitterName": request_data.get("twitterName"),
        "bskyHandle": request_data["bskyHandle"],
        "task_type": "posts",
        "success": success,
        "error_message": error_message,
        "processor": processor_name,  # Add processor identification
    }
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(url, json=payload)
            response.raise_for_status()
            print(f"[{processor_name}] Notification sent for {request_data['bskyHandle']}.")
        except Exception as e:
            print(f"[{processor_name}] Failed to notify status for {request_data['bskyHandle']}: {e}")
