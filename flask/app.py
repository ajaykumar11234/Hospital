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
CORS(app)

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
if not GROQ_API_KEY:
    raise ValueError("GROQ_API_KEY environment variable not set.")

client = Groq(api_key=GROQ_API_KEY)
GROQ_MODEL = "llama-3.1-8b-instant"

chat_history = {}

# ---------------- /check-symptoms ----------------
# ---------------- /check-symptoms ----------------
@app.route("/check-symptoms", methods=["POST"])
def check_symptoms():
    data = request.get_json()
    symptoms = data.get("symptoms", [])

    if not symptoms:
        return jsonify({"error": "No symptoms provided"}), 400

    # Strict JSON prompt for LLM
    prompt = f"""
You are a professional medical assistant.

Task:
- Based on the given symptoms, provide ONLY valid JSON.
- The JSON must have exactly these keys:
  1. "disease" → a string with the possible condition.
  2. "medications" → an array of strings with recommended medications.
  3. "precautions" → an array of strings with safety tips.

Rules:
- Do NOT include any text outside the JSON.
- Use valid JSON format (double quotes for keys and strings).
- If unsure about a field, use "Unknown" for strings or [] for arrays.

Symptoms: {', '.join(symptoms)}
"""

    try:
        response = client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"}
        )

        raw_result = response.choices[0].message.content

        # Try parsing JSON
        try:
            result = json.loads(raw_result)
            # Ensure keys exist and types are correct
            disease = result.get("disease", "Unknown")
            medications = result.get("medications") if isinstance(result.get("medications"), list) else []
            precautions = result.get("precautions") if isinstance(result.get("precautions"), list) else []
        except json.JSONDecodeError:
            # Fallback in case of malformed JSON
            disease = "Unknown"
            medications = ["Consult a doctor"]
            precautions = [raw_result]

        return jsonify({
            "disease": disease,
            "medications": medications,
            "precautions": precautions
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500




def clean_assistant_message(message: str) -> str:
    """Remove markdown, special characters, extra spaces for clean text"""
    message = re.sub(r"\*+", "", message)       # remove asterisks
    message = re.sub(r"`+", "", message)       # remove backticks
    message = re.sub(r'(\d+)\.', r'\1.', message)  # keep numbering but clean spacing
    message = re.sub(r'\s+', ' ', message)    # collapse multiple spaces
    return message.strip()

@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json()
    user_id = data.get("user_id")
    message = data.get("message")

    if not user_id or not message:
        return jsonify({"error": "Send both user_id and message"}), 400

    history = chat_history.get(user_id, [])
    history.append({"role": "user", "content": message})

    try:
        # Ask Groq LLM to reply in clean text
        system_prompt = (
    "You are a professional medical assistant chatbot for patients. "
    "Answer ONLY medical-related queries about symptoms, diseases, treatments, medications, dosages, and precautions. "
    "Do NOT answer general knowledge or personal questions. "
    "If the query is NOT medical-related, reply exactly: 'I can only help with medical-related queries.' "
    "Always respond in clear, concise, patient-friendly plain text, without markdown, code, or JSON."
)

        response = client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[{"role": "system", "content": system_prompt}] + history,
            max_tokens=400,
            temperature=0.5
        )

        assistant_message = response.choices[0].message.content
        assistant_message = clean_assistant_message(assistant_message)

        # Save history
        history.append({"role": "assistant", "content": assistant_message})
        chat_history[user_id] = history

        return jsonify({
            "response": assistant_message
        })

    except Exception as e:
        return jsonify({
            "error": str(e),
            "response": "Sorry, I'm having trouble connecting right now. Please try again later."
        }), 500

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", debug=True, port=port)
