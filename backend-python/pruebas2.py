from twikit import Client
import asyncio
from twitter import extract_thread

client = Client(language="en-US")
client.load_cookies("cookiesPRUEBAS.json")



async def main():
    thread_url = "https://x.com/basednolson/status/1741965694093148448"
    try:
        thread = await extract_thread(thread_url)
    except Exception as e:
        print(f"Migration of thread FAILED for URL {thread_url}: {e}")
    print(thread)

    
       

asyncio.run(main())