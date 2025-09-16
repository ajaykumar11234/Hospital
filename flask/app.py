from flask import Flask, request, jsonify
from groq import Groq
import os
import json
from dotenv import load_dotenv
from flask_cors import CORS
import re

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)  # Allow all origins for simplicity

# Initialize Groq client
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
if not GROQ_API_KEY:
    raise ValueError("GROQ_API_KEY environment variable not set.")

client = Groq(api_key=GROQ_API_KEY)
GROQ_MODEL = "llama-3.1-8b-instant"  # Groq supported chat model

# In-memory chat history per user
chat_history = {}

# ---------------- /check-symptoms ----------------
@app.route("/check-symptoms", methods=["POST"])
def check_symptoms():
    data = request.get_json()
    symptoms = data.get("symptoms", [])

    if not symptoms:
        return jsonify({"error": "No symptoms provided"}), 400

    prompt = (
        "You are a medical assistant. Based on these symptoms, "
        "return ONLY JSON with the following keys: disease, medications, precautions. "
        f"Symptoms: {', '.join(symptoms)}"
    )

    try:
        response = client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"}
        )

        result = response.choices[0].message.content
        try:
            return jsonify(json.loads(result))
        except json.JSONDecodeError:
            return jsonify({
                "disease": "Unknown",
                "medications": ["Consult a doctor"],
                "precautions": result
            })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ---------------- /chat ----------------
def clean_assistant_message(message):
    # 1️⃣ Remove Markdown bold
    message = re.sub(r"\*\*(.*?)\*\*", r"\1", message)

    # 2️⃣ Ensure numbered lists are on separate lines
    # Matches: 1. item2. item -> adds newline before each number followed by dot
    message = re.sub(r'(\d+)\.', r'\n\1.', message)

    # 3️⃣ Strip leading/trailing whitespace
    message = message.strip()

    return message
@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json()
    user_id = data.get("user_id")
    message = data.get("message")

    if not user_id or not message:
        return jsonify({"error": "Send both user_id and message"}), 400

    # Load user chat history
    history = chat_history.get(user_id, [])
    history.append({"role": "user", "content": message})

    try:
        response = client.chat.completions.create(
            model=GROQ_MODEL,
            messages=history,
            max_tokens=200,
            temperature=0.5
        )

        assistant_message = response.choices[0].message.content
        assistant_message=clean_assistant_message(assistant_message)
        # assistant_message = assistant_message.replace("\n", "<br />")
        # assistant_message = re.sub(r"\*\*(.*?)\*\*", r"\1", assistant_message)
        # assistant_message=re.sub(r'(\d+)\.', r'\n\1.', assistant_message)
        history.append({"role": "assistant", "content": assistant_message})
        chat_history[user_id] = history

        # Try to parse assistant_message as JSON if possible
        try:
            parsed_response = json.loads(assistant_message)
            # Ensure keys exist
            disease = parsed_response.get("disease", "Unknown")
            medications = parsed_response.get("medications", [])
            precautions = parsed_response.get("precautions", [])
        except Exception:
            # Fallback if assistant_message is plain text
            disease = None
            medications = []
            precautions = []
            parsed_response = None

        return jsonify({
            "response": assistant_message,       # Raw message for text display
            "structured": {
                "disease": disease,
                "medications": medications,
                "precautions": precautions,
                "raw_json": parsed_response      # Keep original JSON if available
            }
        })

    except Exception as e:
        return jsonify({
            "error": str(e),
            "response": "Sorry, I'm having trouble connecting right now. Please try again later.",
            "structured": {
                "disease": None,
                "medications": [],
                "precautions": []
            }
        }), 500

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
