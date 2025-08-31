from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin
import json
import os
import google.generativeai as genai
from dotenv import load_dotenv
load_dotenv() 

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# Get Gemini API key from environment variable
API_KEY = os.getenv("GEMINI_API_KEY")
if not API_KEY:
    raise ValueError("GEMINI_API_KEY environment variable not set.")

genai.configure(api_key=API_KEY)
GEMINI_MODEL = "gemini-1.5-flash"

chat_history = {}

# --- Disease Prediction Endpoint ---
@app.route('/check-symptoms', methods=['POST'])
def check_symptoms():
    try:
        data = request.get_json()
        if not data or "symptoms" not in data:
            return jsonify({"error": "Invalid request. Send { \"symptoms\": [...] }"}), 400
        symptoms = data["symptoms"]
        if not isinstance(symptoms, list):
            return jsonify({"error": "Symptoms should be a list"}), 400

        prompt_text = f"""
        Based on the following symptoms, identify a likely disease, and provide a list of recommended medications and a list of precautions.
        Symptoms: {', '.join(symptoms)}
        Please provide the response as a JSON object with keys: disease, medications, precautions.
        If unknown, set disease to "Unknown".
        """

        model = genai.GenerativeModel(GEMINI_MODEL)
        response = model.generate_content(
            contents=[{"role": "user", "parts": [{"text": prompt_text}]}],
            generation_config=genai.types.GenerationConfig(
                response_mime_type="application/json"
            )
        )
        result = json.loads(response.text)
        return jsonify(result), 200

    except Exception as e:
        print(f"Error in symptom checker: {e}")
        return jsonify({
            "error": "Server error",
            "details": str(e),
            "medications": ["Please check your API key and network connection."],
            "precautions": ["Consult a medical professional for accurate diagnosis."]
        }), 500

# --- Medical Chatbot Endpoint ---
@app.route('/chat', methods=['POST'])
@cross_origin()
def chat():
    try:
        data = request.get_json()
        if not data or "message" not in data or "user_id" not in data:
            return jsonify({"error": "Invalid request. Send { \"user_id\": \"...\", \"message\": \"...\" }"}), 400

        user_id = data["user_id"]
        user_message = data["message"]

        if user_id not in chat_history:
            model = genai.GenerativeModel(
                GEMINI_MODEL,
                system_instruction="You are a helpful and friendly medical assistant. Always remind the user to consult a healthcare professional. Do not provide dangerous medical advice."
            )
            chat_session = model.start_chat(history=[])
            chat_history[user_id] = chat_session

        chat_session = chat_history[user_id]
        response = chat_session.send_message(user_message)

        return jsonify({"response": response.text}), 200

    except Exception as e:
        print(f"Error in chatbot: {e}")
        return jsonify({
            "error": "Server error",
            "details": str(e),
            "response": "Sorry, I'm having trouble connecting right now. Please try again later."
        }), 500

# --- Run on Render ---
if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))  # Render sets PORT dynamically
    app.run(host="0.0.0.0", port=port, debug=False)
