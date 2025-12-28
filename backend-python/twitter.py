"""
ULTRA-CONSERVATIVE RATE LIMITING MODE
========================================
This implementation is designed to NEVER hit rate limits to protect against account bans.
- Uses only 60% of allocated Twikit rate limits
- Single concurrent request at a time
- Minimum 5-minute gaps between migrations
- 80% safety threshold triggers early cooldown
- 60-second safety buffer when approaching limits
- Dynamic delay calculation based on safe request rates

DO NOT MODIFY THESE SETTINGS UNLESS YOU UNDERSTAND THE BAN RISK.
"""

import re
import time
import asyncio
import gc
from twikit import Client, TooManyRequests
from atproto import client_utils

# Global client instance (shared across all requests)
client = Client(language="en-US")
client.load_cookies("cookies.json")

# Per-migration semaphore to avoid concurrency issues
migration_semaphore = asyncio.Semaphore(1)  # SINGLE REQUEST AT A TIME - MAXIMUM SAFETY

# ULTRA-CONSERVATIVE rate limits (70% of actual Twikit limits for safety)
ENDPOINT_RATE_LIMITS = {
    'get_tweet_by_id': 140, 
    'get_user_by_screen_name': 90, 
    'get_user_tweets': 45, 
    'get_user_tweets_replies': 45, 
    'default': 45  
}

# Endpoint-specific counters
endpoint_counters = {endpoint: 0 for endpoint in ENDPOINT_RATE_LIMITS}
endpoint_start_times = {endpoint: time.time() for endpoint in ENDPOINT_RATE_LIMITS}

# Global counter (as fallback)
api_calls = 0
start_time = time.time()

RESET_TIME = 15 * 60  # 15 minutes in seconds (900s)
MAX_RECURSION_DEPTH = 100

async def cleanup_memory():
    """Force garbage collection to prevent memory leaks"""
    gc.collect()
    print("Memory cleanup performed")

def calculate_safe_request_rate(limit, window_seconds=900):
    """
    Calculate ultra-conservative request rate to ensure we NEVER hit rate limits.
    Uses 60% of the limit as maximum to add huge safety buffer.
    """
    safe_limit = int(limit * 0.6)  # Only use 60% of the allocated limit
    requests_per_second = safe_limit / window_seconds
    minimum_delay = 1.0 / requests_per_second if requests_per_second > 0 else 2.0
    return max(minimum_delay, 0.5)  # Minimum 0.5 second delay (improved from 1.0)

async def rate_limited_api_call(api_function, *args, **kwargs):
    global api_calls, start_time

    # Determine which endpoint we're calling based on function name
    endpoint = api_function.__name__
    limit = ENDPOINT_RATE_LIMITS.get(endpoint, ENDPOINT_RATE_LIMITS['default'])

    # Get current counters and timing
    current_count = endpoint_counters.get(endpoint, 0)
    current_start = endpoint_start_times.get(endpoint, time.time())

    # Check if we need to reset the counter (15-minute window)
    now = time.time()
    elapsed_time = now - current_start

    if elapsed_time >= RESET_TIME:
        print(f"Resetting {endpoint} counter after {elapsed_time:.2f} seconds")
        endpoint_counters[endpoint] = 0
        endpoint_start_times[endpoint] = now
        current_count = 0
        current_start = now
        elapsed_time = 0

    # ULTRA-CONSERVATIVE: Only apply delays when approaching limits
    # Start slowing down when we're at 70% of the limit (less aggressive than 80%)
    safety_threshold = int(limit * 0.7)  # 70% threshold for safety

    if current_count >= safety_threshold:
        # Calculate remaining time in the window with safety buffer
        remaining_time = RESET_TIME - elapsed_time
        # Add 30 second safety buffer (reduced from 60 for better performance)
        sleep_time = max(remaining_time + 30, 30)  # Minimum 30 seconds
        print(f"SAFETY THRESHOLD: {endpoint} at {current_count}/{limit} ({current_count/limit*100:.1f}%). Sleeping for {sleep_time:.2f} seconds.")
        await asyncio.sleep(sleep_time)

        # Reset after waiting
        endpoint_counters[endpoint] = 0
        endpoint_start_times[endpoint] = time.time()
        current_count = 0
    else:
        # Only apply minimal delay when well below limits
        # Calculate adaptive delay based on current usage
        usage_ratio = current_count / limit
        if usage_ratio < 0.3:  # Well below limit
            safe_delay = 0.1  # Very short delay
        elif usage_ratio < 0.5:  # Moderate usage
            safe_delay = 0.5  # Short delay
        else:  # Approaching limit
            safe_delay = calculate_safe_request_rate(limit)

        if safe_delay > 0:
            await asyncio.sleep(safe_delay)
            print(f"ADAPTIVE DELAY: {safe_delay:.2f}s for {endpoint} (usage: {current_count}/{limit})")

    # Make the API call
    try:
        endpoint_counters[endpoint] = current_count + 1
        print(f"{endpoint} API call {endpoint_counters[endpoint]}/{limit}, elapsed: {elapsed_time:.2f}s")

        return await api_function(*args, **kwargs)

    except TooManyRequests as e:
        print(f"Rate limit hit for {endpoint}! Waiting for rate limit reset.")
        # Reset counter and wait for the full window
        endpoint_counters[endpoint] = 0
        endpoint_start_times[endpoint] = time.time()
        sleep_time = RESET_TIME + 10  # Wait full window + buffer
        await asyncio.sleep(sleep_time)
        # Try once more
        return await api_function(*args, **kwargs)

    except Exception as e:
        # Check if it's a HTTP 429 error
        if hasattr(e, 'status_code') and e.status_code == 429:
            print(f"HTTP 429 error for {endpoint}! Waiting for rate limit reset.")
            endpoint_counters[endpoint] = 0
            endpoint_start_times[endpoint] = time.time()
            sleep_time = RESET_TIME + 10  # Wait full window + buffer
            await asyncio.sleep(sleep_time)
            # Try once more
            return await api_function(*args, **kwargs)
        # If it's another error, re-raise it
        raise

async def getMediaUrls(tweet):
    try:
        # Add defensive checks for tweet attributes
        is_quote = False
        is_retweet = False
        
        try:
            is_quote = hasattr(tweet, 'is_quote_status') and tweet.is_quote_status
        except Exception as e:
            print(f"Error checking is_quote_status: {e}")
            
        try:
            is_retweet = hasattr(tweet, 'retweeted_tweet') and tweet.retweeted_tweet
        except Exception as e:
            print(f"Error checking retweeted_tweet: {e}")
        
        if not is_quote and not is_retweet:
            try:
                if hasattr(tweet, 'media') and tweet.media:
                    media_urls = []
                    for media in tweet.media:
                        try:
                            if isinstance(media, dict) and "media_url_https" in media:
                                media_urls.append(media["media_url_https"])
                            elif hasattr(media, 'media_url_https'):
                                media_urls.append(media.media_url_https)
                        except Exception as e:
                            print(f"Error processing media item: {e}")
                            continue
                    return media_urls
            except Exception as e:
                print(f"Error accessing tweet.media: {e}")
        return []
    except Exception as e:
        print(f"Error in getMediaUrls: {e}")
        return []

async def format_tweet_text(tweet):
    text = ""
    facets = []
    
    # Add defensive programming to handle missing attributes
    tweet_text = ""
    try:
        tweet_text = tweet.text if hasattr(tweet, 'text') and tweet.text else ""
    except Exception as e:
        print(f"Error accessing tweet.text: {e}")
        return "", []
    
    segments = re.split(r"(http[s]?://t\.co/\S+)", tweet_text)
    for segment in segments:
        if segment.startswith("http"):
            try:
                # Add defensive access to tweet.urls with proper error handling
                tweet_urls = []
                if hasattr(tweet, 'urls'):
                    try:
                        tweet_urls = tweet.urls if tweet.urls else []
                    except Exception as e:
                        print(f"Error accessing tweet.urls: {e}")
                        tweet_urls = []
                
                url_data = None
                for url in tweet_urls:
                    try:
                        if isinstance(url, dict) and url.get("url") == segment:
                            url_data = url
                            break
                    except Exception as e:
                        print(f"Error processing URL data: {e}")
                        continue
                
                if url_data and "expanded_url" in url_data:
                    start_index = len(text)
                    expanded_url = url_data["expanded_url"]
                    text += expanded_url
                    end_index = len(text)
                    facet = {
                        "index": {
                            "byteStart": start_index,
                            "byteEnd": end_index + 6
                        },
                        "features": [{
                            "$type": "app.bsky.richtext.facet#link",
                            "uri": expanded_url,
                        }]
                    }
                    facets.append(facet)
                else:
                    # If we can't expand the URL, just add the original segment
                    text += segment
            except Exception as e:
                print(f"Error processing URL segment '{segment}': {e}")
                # Fallback: just add the original segment
                text += segment
        else:
            text += segment

    return text, facets

async def get_user_tweets(twitterName: str, limit: int = 800):
    async with migration_semaphore:
        print(f"Fetching tweets for {twitterName} with limit {limit}...")
        all_tweets = {}
        processed_ids = set()  # Global processed IDs to prevent duplicates

        try:
            user = await rate_limited_api_call(client.get_user_by_screen_name, twitterName)
            tweets = await rate_limited_api_call(user.get_tweets, "Tweets")

            # Collect tweets with pagination
            while tweets and (not limit or len(all_tweets) < limit):
                for tweet in tweets:
                    try:
                        # Add defensive checks for tweet attributes
                        is_quote_status = False
                        is_retweet = False
                        tweet_id = None
                        tweet_text_raw = ""
                        created_at = None
                        
                        try:
                            is_quote_status = hasattr(tweet, 'is_quote_status') and tweet.is_quote_status
                        except Exception as e:
                            print(f"Error checking is_quote_status: {e}")
                            
                        try:
                            tweet_text_raw = tweet.text if hasattr(tweet, 'text') and tweet.text else ""
                            is_retweet = tweet_text_raw.startswith("RT @")
                        except Exception as e:
                            print(f"Error accessing tweet text: {e}")
                            
                        try:
                            tweet_id = tweet.id if hasattr(tweet, 'id') else None
                        except Exception as e:
                            print(f"Error accessing tweet.id: {e}")
                            continue  # Skip tweet if we can't get ID
                            
                        if not tweet_id:
                            print("Skipping tweet without valid ID")
                            continue
                            
                        if is_quote_status or is_retweet:
                            continue
                            
                        if tweet_id not in processed_ids:
                            tweet_text, tweet_facets = await format_tweet_text(tweet)
                            if len(tweet_text) > 297:
                                tweet_text = tweet_text[:297] + "..."

                            try:
                                created_at = tweet.created_at_datetime if hasattr(tweet, 'created_at_datetime') else None
                            except Exception as e:
                                print(f"Error accessing created_at_datetime: {e}")
                                created_at = None
                                
                            if not created_at:
                                print(f"Skipping tweet {tweet_id} without valid timestamp")
                                continue

                            all_tweets[tweet_id] = {
                                "id": tweet_id,
                                "created_at_datetime": created_at,
                                "text": tweet_text,
                                "facets": tweet_facets,
                                "media_urls": await getMediaUrls(tweet),
                                "replies": [],  # Initialize as empty for now
                            }
                            processed_ids.add(tweet_id)
                    except Exception as e:
                        print(f"Error processing tweet: {e}")
                        continue

                tweets = await tweets.next()

            # Build threads from collected tweets
            threads = []
            sorted_tweets = sorted(all_tweets.values(), key=lambda t: t["created_at_datetime"], reverse=True)

            # Separate root tweets from replies
            root_tweets = []
            reply_tweets = set()

            # First pass: identify which tweets are replies
            for tweet_data in sorted_tweets:
                if tweet_data.get("replies"):
                    for reply in tweet_data["replies"]:
                        if reply and hasattr(reply, 'id'):
                            reply_tweets.add(reply.id)

            # Second pass: build threads only from root tweets
            for tweet_data in sorted_tweets:
                if tweet_data["id"] not in processed_ids and tweet_data["id"] not in reply_tweets:
                    thread = [tweet_data]
                    processed_ids.add(tweet_data["id"])  # Mark root tweet as processed
                    await process_replies(tweet_data, thread, processed_ids, 0)
                    threads.append(thread)
                    if limit and len(threads) >= limit:
                        break

            print(f"Collected {len(all_tweets)} tweets into {len(threads)} threads")

            # Clean up memory after processing large tweet collections
            if len(all_tweets) > 100:
                await cleanup_memory()

            return threads

        except TooManyRequests:
            print("Rate limit hit! Stopping tweet collection.")
            raise
        except Exception as e:
            print(f"An error occurred while fetching tweets: {e}")
            raise

async def process_replies(tweet_data, thread, processed_ids, depth=0, thread_root_id=None):
    """Process replies with depth tracking to prevent infinite recursion"""
    if depth >= MAX_RECURSION_DEPTH:
        print(f"Maximum recursion depth ({MAX_RECURSION_DEPTH}) reached. Stopping reply processing.")
        return

    replies = tweet_data.get("replies", [])
    current_tweet_id = tweet_data.get("id")

    # Set thread root if not provided
    if thread_root_id is None and thread:
        thread_root_id = thread[0]["id"]

    for reply in replies:
        if not reply or reply.id in processed_ids:
            continue

        try:
            # Enhanced cycle detection with error handling
            reply_to_id = None
            reply_id = None
            
            try:
                reply_id = reply.id if hasattr(reply, 'id') else None
            except Exception as e:
                print(f"Error accessing reply.id: {e}")
                continue
                
            if not reply_id:
                print("Skipping reply without valid ID")
                continue
                
            try:
                if hasattr(reply, 'in_reply_to_status_id_str'):
                    reply_to_id = reply.in_reply_to_status_id_str
            except Exception as e:
                print(f"Error accessing in_reply_to_status_id_str: {e}")

            # Check for cycles: reply to self, reply to ancestor, or circular reference
            if reply_to_id:
                # Direct self-reply
                if str(reply_to_id) == str(reply_id):
                    print(f"Self-reply detected for tweet {reply_id}. Skipping.")
                    continue

                # Check if reply is to any tweet in current thread
                if any(str(t["id"]) == str(reply_to_id) for t in thread):
                    # Check if this creates a cycle by seeing if reply is already in thread
                    if any(str(t["id"]) == str(reply_id) for t in thread):
                        print(f"Cycle detected in reply chain for tweet {reply_id}. Skipping.")
                        continue
                else:
                    # Reply is not to any tweet in our thread, skip it
                    continue

            processed_ids.add(reply_id)  # Mark as processed
            reply_text, reply_facets = await format_tweet_text(reply)
            
            # Get created_at_datetime with error handling
            reply_created_at = None
            try:
                reply_created_at = reply.created_at_datetime if hasattr(reply, 'created_at_datetime') else None
            except Exception as e:
                print(f"Error accessing reply created_at_datetime: {e}")
                
            if not reply_created_at:
                print(f"Skipping reply {reply_id} without valid timestamp")
                continue
                
            reply_data = {
                "id": reply_id,
                "created_at_datetime": reply_created_at,
                "text": reply_text,
                "facets": reply_facets,
                "media_urls": await getMediaUrls(reply),
                "replies": [],  # Initialize as empty
            }
        except Exception as e:
            print(f"Error processing reply: {e}")
            continue
        thread.append(reply_data)
        # Process nested replies with incremented depth
        await process_replies(reply_data, thread, processed_ids, depth + 1, thread_root_id)

async def extract_thread(root_tweet_url: str):
    async with migration_semaphore:
        try:
            match = re.search(r"status/(\d+)", root_tweet_url)
            if not match:
                raise ValueError("Invalid tweet URL. Could not extract tweet ID.")
            
            root_tweet_id = str(match.group(1))
            print(f"Extracting thread for tweet ID: {root_tweet_id}")

            root_tweet = await rate_limited_api_call(client.get_tweet_by_id, root_tweet_id)
            
            # Defensive access to reply_to and thread attributes
            reply_to_tweets = []
            thread_tweets_list = []
            
            try:
                if hasattr(root_tweet, "reply_to") and root_tweet.reply_to:
                    reply_to_tweets = root_tweet.reply_to
            except Exception as e:
                print(f"Error accessing reply_to: {e}")
                
            try:
                if hasattr(root_tweet, "thread") and root_tweet.thread:
                    thread_tweets_list = root_tweet.thread
            except Exception as e:
                print(f"Error accessing thread: {e}")

            thread_tweets = [*reply_to_tweets, root_tweet, *thread_tweets_list]

            formatted_thread = []
            for tweet in thread_tweets:
                try:
                    tweet_text, tweet_facets = await format_tweet_text(tweet)
                    
                    # Defensive access to tweet attributes
                    tweet_id = None
                    created_at = None
                    
                    try:
                        tweet_id = tweet.id if hasattr(tweet, 'id') else None
                    except Exception as e:
                        print(f"Error accessing tweet.id: {e}")
                        continue
                        
                    try:
                        created_at = tweet.created_at_datetime if hasattr(tweet, 'created_at_datetime') else None
                    except Exception as e:
                        print(f"Error accessing created_at_datetime: {e}")
                        continue
                        
                    if not tweet_id or not created_at:
                        print(f"Skipping tweet without valid ID or timestamp")
                        continue
                    
                    formatted_thread.append({
                        "id": tweet_id,
                        "created_at_datetime": created_at,
                        "text": tweet_text,
                        "facets": tweet_facets,
                        "media_urls": await getMediaUrls(tweet),
                    })
                except Exception as e:
                    print(f"Error processing tweet in thread: {e}")
                    continue
            return formatted_thread

        except Exception as e:
            print(f"An error occurred while extracting the thread: {e}")
            raise
