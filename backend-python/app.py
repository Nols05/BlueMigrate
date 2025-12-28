import asyncio
from fastapi import FastAPI, HTTPException, Request
from pydantic import BaseModel
from typing import Optional, List
from fastapi.middleware.cors import CORSMiddleware
from processMigrations import add_to_queue, process_queue
from bluesky import resolve_did
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

# Initialize the FastAPI app
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://bluemigrate.com", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define a global task queue
queue = asyncio.Queue()

# Request model
class MigrationRequest(BaseModel):
    migrationId: str
    twitterName: Optional[str] = None
    bskyHandle: str
    password: str
    limit: Optional[int] = 800  # Default limit
    threadUrls: Optional[List[str]] = None

@app.post("/posts")
async def enqueue_posts_migration(request: MigrationRequest):
    # Resolve DID
    did = await resolve_did(request.bskyHandle)

    # Validate input
    if not request.twitterName and not request.threadUrls:
        raise HTTPException(
            status_code=400,
            detail="Either 'twitterName' or 'threadUrls' must be provided.",
        )

    # Determine task type and add to queue
    task_data = request.model_dump()
    task_data.update({"did": did, "task_type": "posts"})
    await add_to_queue(queue, task_data)

    return {
        "message": f"Migration task for {request.twitterName or 'threads'} (DID: {did}) has been queued.",
        "success": True,
    }

@app.on_event("startup")
async def start_queue_processors():
    """Start multiple queue processors for concurrent migration processing"""
    num_processors = 2  # Start with 2 processors for conservative concurrency

    print(f"Starting {num_processors} queue processors for concurrent migrations")

    for i in range(num_processors):
        processor_name = f"processor-{i+1}"
        asyncio.create_task(process_queue(queue, processor_name))

    print("All queue processors started successfully")

@app.get("/health")
async def health_check():
    """Health check endpoint to monitor system status"""
    return {
        "status": "healthy",
        "timestamp": "2024-01-01T00:00:00Z",  # Would be dynamic in production
        "version": "2.0.0-optimized",
        "features": [
            "ultra_conservative_rate_limiting",
            "parallel_image_processing",
            "multiple_queue_processors",
            "connection_pooling",
            "batch_operations",
            "error_recovery"
        ]
    }

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    print("Error:", exc.errors())
    print("Request Body:", await request.body())
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors()},
    )
