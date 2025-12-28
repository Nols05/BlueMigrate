"""
OPTIMIZED BLUESKY MIGRATION ENGINE
=====================================
- Parallel image processing and upload
- Connection pooling for HTTP requests
- Batch operations where possible
- Memory-efficient processing
- Comprehensive error recovery
"""

from atproto import AsyncClient, models
import httpx
import asyncio
from atproto_identity.handle.resolver import AsyncHandleResolver
from rateLimiter import AccountRateLimiter
from PIL import Image, ImageFile
from datetime import timezone, datetime
from io import BytesIO
import gc
from typing import List, Dict, Any, Optional
from concurrent.futures import ThreadPoolExecutor
import json
import logging


ImageFile.LOAD_TRUNCATED_IMAGES = True  # Handle incomplete images gracefully

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('migration.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger('bluesky_migration')

# Initialize the rate limiter
rate_limiter = AccountRateLimiter()
resolver = AsyncHandleResolver()

def log_migration_event(event_type: str, migration_id: str, details: dict = None):
    """Log structured migration events for monitoring and debugging"""
    log_entry = {
        "timestamp": datetime.now().isoformat(),
        "event_type": event_type,
        "migration_id": migration_id,
        "details": details or {}
    }
    logger.info(f"MIGRATION_EVENT: {json.dumps(log_entry)}")
    return log_entry

# Global connection pool for HTTP requests
HTTP_TIMEOUT = httpx.Timeout(30.0, connect=10.0)
http_client_pool = None

async def get_http_client():
    """Get or create a shared HTTP client with connection pooling"""
    global http_client_pool
    if http_client_pool is None:
        # Create a client with connection pooling and keep-alive
        limits = httpx.Limits(max_keepalive_connections=20, max_connections=100)
        http_client_pool = httpx.AsyncClient(
            timeout=HTTP_TIMEOUT,
            limits=limits,
            follow_redirects=True
        )
    return http_client_pool

async def login(bskyHandle, password):
    client = AsyncClient()
    await client.login(bskyHandle, password)
    return client

async def process_single_image(http_client: httpx.AsyncClient, url: str) -> Optional[models.AppBskyEmbedImages.Image]:
    """Process a single image with proper error handling and cleanup"""
    img = None
    img_buffer = None
    buffer = None

    try:
        # Download image
        response = await http_client.get(url)
        response.raise_for_status()

        # Process image in memory
        img_buffer = BytesIO(response.content)
        img = Image.open(img_buffer)

        # Check file size and resize if necessary
        if len(response.content) > 976 * 1024:  # 976 KB
            print(f"Image too large, resizing: {url}")
            img = img.resize(
                (int(img.width * 0.7), int(img.height * 0.7)),
                Image.Resampling.LANCZOS
            )
            buffer = BytesIO()
            format_to_use = img.format if img.format else "JPEG"
            img.save(buffer, format=format_to_use, quality=85)  # Add quality parameter
            img_data = buffer.getvalue()
        else:
            img_data = response.content

        return img_data

    except Exception as e:
        print(f"Failed to process image from URL {url}: {e}")
        return None
    finally:
        # Ensure cleanup of all resources
        try:
            if img is not None:
                img.close()
        except:
            pass
        try:
            if img_buffer is not None:
                img_buffer.close()
        except:
            pass
        try:
            if buffer is not None:
                buffer.close()
        except:
            pass

async def process_images_parallel(http_client: httpx.AsyncClient, urls: List[str], max_concurrent: int = 5) -> List[models.AppBskyEmbedImages.Image]:
    """Process multiple images in parallel with concurrency control"""
    if not urls:
        return []

    # Create semaphore for concurrency control
    semaphore = asyncio.Semaphore(max_concurrent)

    async def process_with_semaphore(url: str):
        async with semaphore:
            img_data = await process_single_image(http_client, url)
            return img_data

    # Process all images concurrently
    raw_images = await asyncio.gather(
        *[process_with_semaphore(url) for url in urls],
        return_exceptions=True
    )

    # Filter out None values and exceptions
    valid_images = [img for img in raw_images if img is not None and not isinstance(img, Exception)]

    # Upload images to Bluesky (this needs to be done sequentially due to API limits)
    uploaded_images = []
    for img_data in valid_images:
        try:
            # This will need to be passed from the main function
            # For now, we'll return the raw data and upload later
            uploaded_images.append(img_data)
        except Exception as e:
            print(f"Failed to upload image: {e}")

    return valid_images  # Return raw image data for batch upload

async def batch_upload_images(client, image_data_list: List[bytes], max_concurrent: int = 3) -> List[models.AppBskyEmbedImages.Image]:
    """Upload multiple images to Bluesky with concurrency control"""
    if not image_data_list:
        return []

    uploaded_images = []

    # Use semaphore to limit concurrent uploads
    semaphore = asyncio.Semaphore(max_concurrent)

    async def upload_single_image(img_data: bytes):
        async with semaphore:
            try:
                upload = await client.upload_blob(img_data)
                return models.AppBskyEmbedImages.Image(alt='', image=upload.blob)
            except Exception as e:
                error_msg = str(e).lower()
                if "rate limit" in error_msg or "429" in error_msg:
                    print(f"Rate limit hit during image upload: {e}")
                elif "too large" in error_msg or "413" in error_msg:
                    print(f"Image too large for Bluesky upload: {e}")
                elif "unsupported" in error_msg:
                    print(f"Unsupported image format: {e}")
                else:
                    print(f"Failed to upload image to Bluesky: {e}")
                return None

    # Upload all images concurrently
    upload_results = await asyncio.gather(
        *[upload_single_image(img_data) for img_data in image_data_list],
        return_exceptions=True
    )

    # Filter out failed uploads and exceptions
    for result in upload_results:
        if result is not None and not isinstance(result, Exception):
            uploaded_images.append(result)

    print(f"Successfully uploaded {len(uploaded_images)}/{len(image_data_list)} images")
    return uploaded_images

async def migrateTweetsToBluesky(tweets, bskyHandle, password, did, migration_id: str = None):
    """Optimized Bluesky migration with parallel processing and error recovery"""
    if not tweets:
        print("No tweets to migrate")
        log_migration_event("MIGRATION_START", migration_id or "unknown", {"status": "no_tweets"})
        return

    migration_id = migration_id or f"migration_{int(datetime.now().timestamp())}"

    # Log migration start
    log_migration_event("MIGRATION_START", migration_id, {
        "bsky_handle": bskyHandle,
        "did": did,
        "total_threads": len(tweets),
        "total_tweets": sum(len(thread) for thread in tweets)
    })

    # Initialize clients and counters (per-migration instances)
    client = await login(bskyHandle, password)
    http_client = await get_http_client()

    posts_made = 0
    successful_posts = 0
    failed_posts = 0
    threads_processed = 0

    print(f"Starting optimized migration for {bskyHandle} with {len(tweets)} threads")
    logger.info(f"Migration {migration_id}: Started processing {len(tweets)} threads for {bskyHandle}")

    try:
        for thread_idx, tweet_thread in enumerate(tweets):
            if posts_made >= 1500:
                print("Post limit of 1500 reached. Stopping migration.")
                log_migration_event("MIGRATION_LIMIT_REACHED", migration_id, {
                    "posts_made": posts_made,
                    "threads_processed": threads_processed
                })
                break

            threads_processed += 1
            print(f"Processing thread {thread_idx + 1}/{len(tweets)} ({len(tweet_thread)} tweets)")
            logger.info(f"Migration {migration_id}: Processing thread {thread_idx + 1}/{len(tweets)} with {len(tweet_thread)} tweets")

            # Pre-process all images for the thread to optimize I/O
            thread_image_data = {}
            if any(tweet.get('media_urls') for tweet in tweet_thread):
                print("Pre-processing all images for thread...")
                for i, tweet in enumerate(tweet_thread):
                    if tweet.get('media_urls'):
                        image_data = await process_images_parallel(
                            http_client, tweet['media_urls'], max_concurrent=5
                        )
                        thread_image_data[i] = image_data

            parent_post = None
            root_post = None

            for tweet_idx, tweet in enumerate(tweet_thread):
                if posts_made >= 1500:
                    break

                try:
                    # Acquire rate limiter points
                    await rate_limiter.acquire(did, 3)

                    # Use pre-processed images for this tweet
                    image_data_list = thread_image_data.get(tweet_idx, [])

                    # Upload images to Bluesky using optimized batch upload
                    images = []
                    if image_data_list:
                        print(f"Uploading {len(image_data_list)} images for tweet {tweet_idx + 1}")
                        images = await batch_upload_images(client, image_data_list, max_concurrent=3)

                    # Format timestamp
                    created_at = tweet['created_at_datetime']
                    created_at = created_at.astimezone(timezone.utc).isoformat().replace("+00:00", "Z")

                    # Create reply structure
                    reply = None
                    if parent_post:
                        reply = {
                            "root": {
                                "uri": root_post["uri"],
                                "cid": root_post["cid"]
                            },
                            "parent": {
                                "uri": parent_post["uri"],
                                "cid": parent_post["cid"]
                            }
                        }

                    # Truncate text if too long
                    tweet_text = tweet['text']
                    if len(tweet_text) > 297:
                        tweet_text = tweet_text[:297] + "..."

                    # Create post record
                    post = models.AppBskyFeedPost.Record(
                        text=tweet_text,
                        created_at=created_at,
                        embed=models.AppBskyEmbedImages.Main(images=images) if images else None,
                        reply=reply,
                        facets=tweet['facets'] if tweet['facets'] else None
                    )

                    # Post to Bluesky
                    resp = await client.app.bsky.feed.post.create(client.me.did, post)

                    # Update thread tracking
                    if not root_post:
                        root_post = resp
                    parent_post = resp

                    posts_made += 1
                    successful_posts += 1

                    if posts_made % 10 == 0:
                        print(f"Progress: {posts_made} posts created ({successful_posts} successful, {failed_posts} failed)")

                except Exception as e:
                    failed_posts += 1
                    error_msg = str(e).lower()

                    # Categorize and handle different types of errors
                    if "rate limit" in error_msg or "429" in error_msg:
                        print(f"Rate limit hit for tweet {tweet_idx + 1} in thread {thread_idx + 1}: {e}")
                        print("Waiting 60 seconds before continuing...")
                        await asyncio.sleep(60)
                    elif "unauthorized" in error_msg or "403" in error_msg:
                        print(f"Authentication error for tweet {tweet_idx + 1}: {e}")
                        print("This may indicate session expiry. Migration may need to be restarted.")
                        raise  # Re-raise auth errors as they require user intervention
                    elif "not found" in error_msg or "404" in error_msg:
                        print(f"Resource not found for tweet {tweet_idx + 1}: {e}")
                        print("Continuing with next tweet...")
                    elif "bad request" in error_msg or "400" in error_msg:
                        print(f"Bad request for tweet {tweet_idx + 1}: {e}")
                        print("This may be due to invalid data. Continuing with next tweet...")
                    else:
                        print(f"Unexpected error for tweet {tweet_idx + 1} in thread {thread_idx + 1}: {e}")
                        print("Continuing with next tweet...")

                    continue

            # Memory cleanup after each thread
            if thread_idx % 5 == 0:
                gc.collect()

        print(f"Migration completed: {successful_posts} successful, {failed_posts} failed, {posts_made} total posts")

        # Log successful completion
        log_migration_event("MIGRATION_COMPLETED", migration_id, {
            "successful_posts": successful_posts,
            "failed_posts": failed_posts,
            "total_posts": posts_made,
            "threads_processed": threads_processed,
            "success_rate": (successful_posts / posts_made * 100) if posts_made > 0 else 0
        })
        logger.info(f"Migration {migration_id}: Completed successfully. {successful_posts}/{posts_made} posts created.")

    except Exception as e:
        print(f"Migration failed with error: {e}")
        # Log migration failure
        log_migration_event("MIGRATION_FAILED", migration_id, {
            "error": str(e),
            "successful_posts": successful_posts,
            "failed_posts": failed_posts,
            "threads_processed": threads_processed,
            "posts_made": posts_made
        })
        logger.error(f"Migration {migration_id}: Failed with error: {e}")
        raise
    finally:
        # Cleanup
        try:
            await http_client.aclose()
        except:
            pass
        # Reset global client pool to ensure clean state for next migration
        global http_client_pool
        http_client_pool = None
        gc.collect()

async def resolve_did(handle):
    """Resolve a handle to a DID."""
    return await resolver.resolve(handle)
