import os
from dotenv import load_dotenv
from groq import Groq

load_dotenv()  # <-- this makes sure .env variables are loaded

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

resp = client.chat.completions.create(
    model="llama-3.1-8b-instant",
    messages=[
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "What is the capital of India?"}
    ]
)

print(resp.choices[0].message.content)
