from google import genai
import os

# Only run this block for Gemini Developer API
# key = str(os.getenv('GEMINI_API_KEY'))
# print(key)
client = genai.Client(api_key='AIzaSyD4u-D9Q8t5qqighDIFUT-iMghkSDNtP7A')

response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents="Explain how AI works"
)
print(response.text)