import httpx
import asyncio
import os
from dotenv import load_dotenv

load_dotenv()

# Function to test the tweets for different accounts
async def test_tweets():
    url = "http://127.0.0.1:8000/threads"
    data = {
        "migrationId": "xxxxxxxxxx",
        "twitterName": "noelliron",
        "bskyHandle": "bluemigrate.com",
        "password": os.getenv("TEST_PASSWORD", ""),  # Usar variable de entorno
        "migrationId": "xxxxxxxxxx",
        "limit": 20,
        "threadUrls": ["https://x.com/noelliron/status/1859005656612958318"]
    }

    async with httpx.AsyncClient() as client:
        response = await client.post(url, json=data)

    print(f"Status Code: {response.status_code}")
    print(f"Response Body: {response.json()}")



asyncio.run(test_tweets())