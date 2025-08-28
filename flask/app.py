# Updated Flask application to use the Gemini API for disease prediction and a conversational chatbot.
# This version uses the official Google Generative AI library for Python.
# Make sure to install the required libraries:
# pip install Flask flask-cors requests google-generativeai

from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin
import requests
import json
import os
import google.generativeai as genai

app = Flask(__name__)

# Explicitly configure CORS for all routes to handle preflight requests correctly.
# This allows the front-end to communicate with the back-end during development.
CORS(app, resources={r"/*": {"origins": "*"}})

# IMPORTANT: Replace with your actual Gemini API key.
# It's highly recommended to use environment variables for sensitive information.
# Example: API_KEY = os.getenv("GEMINI_API_KEY")
API_KEY = "AIzaSyCIrAVyohtuh6BABL9deiiKeCYwQR6GCXI"
if not API_KEY or API_KEY == "YOUR_GEMINI_API_KEY":
    raise ValueError("API_KEY must be set. Please replace 'YOUR_GEMINI_API_KEY' with your actual API key.")

# Configure the Gemini API for both functionalities
genai.configure(api_key=API_KEY)
# We'll use a specific model, but you can choose another one if needed.
GEMINI_MODEL = "gemini-1.5-flash"

# A dictionary to store chat history for each user (session).
# For a production application, you should use a more persistent storage solution
# like a database (e.g., Redis, PostgreSQL) to manage chat sessions.
chat_history = {}

# --- Disease Prediction Endpoint ---

@app.route('/check-symptoms', methods=['POST'])
def check_symptoms():
    """
    API endpoint to receive symptoms and return a disease prediction.
    """
    try:
        data = request.get_json()

        if not data or "symptoms" not in data:
            return jsonify({"error": "Invalid request. Send { \"symptoms\": [...] }"}), 400

        symptoms = data["symptoms"]

        if not isinstance(symptoms, list):
            return jsonify({"error": "Symptoms should be a list"}), 400

        print(f"Received symptoms for prediction: {symptoms}")
        
        # Construct a clear and specific prompt for the Gemini API.
        # We ask for a JSON format to ensure the response is easy to parse.
        prompt_text = f"""
        Based on the following symptoms, identify a likely disease, and provide a list of recommended medications and a list of precautions.
        
        Symptoms: {', '.join(symptoms)}
        
        Please provide the response as a single JSON object with the following structure:
        {{
            "disease": "string",
            "medications": ["string", "string", ...],
            "precautions": ["string", "string", ...]
        }}
        
        If the disease is unknown or you are unsure, set the disease field to "Unknown" and suggest consulting a doctor.
        """
        
        model = genai.GenerativeModel(GEMINI_MODEL)
        response = model.generate_content(
            contents=[{"role": "user", "parts": [{"text": prompt_text}]}],
            generation_config=genai.types.GenerationConfig(
                response_mime_type="application/json"
            )
        )
        
        # The response text should be a JSON string, so we need to load it.
        result = json.loads(response.text)
        
        return jsonify(result), 200

    except Exception as e:
        print(f"An unexpected server error occurred in symptom checker: {e}")
        return jsonify({
            "error": "Server error",
            "details": str(e),
            "medications": ["Please check your API key and network connection."],
            "precautions": ["Consult a medical professional for accurate diagnosis."]
        }), 500

# ----------------------------

# --- Medical Chatbot Endpoint ---

@app.route('/chat', methods=['POST'])
@cross_origin()
def chat():
    """
    API endpoint for the medical chatbot. Maintains conversation history.
    """
    try:
        data = request.get_json()
        if not data or "message" not in data or "user_id" not in data:
            return jsonify({"error": "Invalid request. Send { \"user_id\": \"...\", \"message\": \"...\" }"}), 400

        user_id = data["user_id"]
        user_message = data["message"]
        print(f"Received message for user {user_id}: {user_message}")

        # Get the chat session for the user; create a new one if it doesn't exist.
        if user_id not in chat_history:
            # Create a new chat session with a system instruction.
            model = genai.GenerativeModel(
                GEMINI_MODEL,
                system_instruction="You are a helpful and friendly medical assistant. Always remind the user to consult a healthcare professional for a proper diagnosis and treatment.provide specific medical advice that could be dangerous. Give only direct answers"
            )
            chat_session = model.start_chat(history=[])
            chat_history[user_id] = chat_session
        
        chat_session = chat_history[user_id]

        # Send the user's message and get a response.
        response = chat_session.send_message(user_message)
        
        return jsonify({"response": response.text}), 200

    except Exception as e:
        print(f"An unexpected server error occurred in chatbot: {e}")
        return jsonify({
            "error": "Server error",
            "details": str(e),
            "response": "Sorry, I'm having trouble connecting right now. Please try again later."
        }), 500

# ----------------------------

if __name__ == '__main__':
    # You can change the port here if needed, but the front-end must match.
    app.run(debug=True, port=5000)
