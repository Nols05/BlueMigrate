import asyncio
from datetime import datetime, timedelta
from bluesky import resolve_did, migrateTweetsToBluesky
import re
import datetime
from datetime import timezone
from twikit import Client


# Mock data for testing
mock_tweets = [
    [
    
     {
            'text': "This is a very long tweet that will need to be split into multiple parts. It is far longer than 297 characters, so it will be truncated and posted as a thread. Part 1: " + "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. " * 5,
            'created_at_datetime': datetime.datetime(2024, 11, 24, 15, 40, tzinfo=timezone.utc),
            'media_urls': [],
            'facets': None
        }
    
    ],
    
]   



# Mock login credentials

client = Client(language="en-US")
client.load_cookies("cookies.json")


async def format_tweet_text(tweet):
    text = ""
    facets = []

    # Split text by t.co links
    segments = re.split(r"(http[s]?://t\.co/\S+)", tweet["text"])  # Access text using tweet["text"]
    current_index = 0  # Track the index of the current position in the text

    for segment in segments:
        if segment.startswith("http"):
            # Find the URL in the tweet's urls
            url_data = next((url for url in tweet["urls"] if url["url"] == segment), None)
            if url_data:
                # Use the indices from tweet["urls"] directly
                start_index = url_data["indices"][0]
                end_index = url_data["indices"][1]

                facet = {
                    "index": {
                        "byteStart": start_index,
                        "byteEnd": end_index,
                    },
                    "features": [{
                        "$type": "app.bsky.richtext.facet#link",
                        "uri": url_data["expanded_url"],
                    }]
                }
                facets.append(facet)

                # Append the display URL text to the plain text
                text += url_data["display_url"]
        else:
            # Add plain text
            text += segment

    return text, facets




async def main():

  

    user = await client.get_user_by_screen_name("basednolson")
    tweets = await user.get_tweets("Tweets")

    for tweet in tweets:
        print(tweet.text)
        print("\n\n")

    # Resolve DID before running migration
    # did = await resolve_did(bsky_handle)
    # tweet = "THis is a tweet with a link http://t.co/1234567890"
    # segments = re.split(r"(http[s]?://t\.co/\S+)", tweet)  # Access text using tweet["text"]
    # print(segments)
   
    # Migrate tweets to Bluesky
    # await migrateTweetsToBluesky(mock_tweets, bsky_handle, password, did)
    
    

# Run the async main function
if __name__ == "__main__":
    asyncio.run(main())
