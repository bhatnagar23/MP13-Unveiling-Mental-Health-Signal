import random
import json
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from transformers import pipeline, AutoModelForCausalLM, AutoTokenizer
import torch
import emoji

# Initialize FastAPI app
app = FastAPI()

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load Sentiment Analysis Model
sentiment_pipe = pipeline("text-classification", model="finiteautomata/bertweet-base-sentiment-analysis")

# Load fine-tuned or lightweight Chatbot Model (DialoGPT or similar)
chatbot_tokenizer = AutoTokenizer.from_pretrained("microsoft/DialoGPT-small")
chatbot_model = AutoModelForCausalLM.from_pretrained("microsoft/DialoGPT-small")

# Load music recommendations
with open("music_recommendations.json", "r", encoding="utf-8") as file:
    MUSIC_DATA = json.load(file)

# Request schema
class TextInput(BaseModel):
    text: str

# Helper: Convert emojis to text
def convert_emojis_to_text(text: str) -> str:
    return emoji.demojize(text, delimiters=(" ", " "))

# Helper: Get music based on sentiment
def get_music_recommendations(sentiment: str):
    return random.sample(MUSIC_DATA.get(sentiment, []), 3)

def get_chatbot_response(user_input: str, sentiment: str) -> str:
    mood_suggestions = {
        "POS": "I'm glad you're feeling positive! Keep up the good mood with a fun hobby, a walk outside, or maybe call a friend to share your joy.",
        "NEG": "I'm here for you. It might help to talk to someone you trust, write your feelings down, or take a break with something relaxing like music or a short nap.",
        "NEU": "You seem to be in a neutral state. Maybe try something refreshing—like a walk, a good book, or journaling your thoughts."
    }

    encoded_input = chatbot_tokenizer(user_input + chatbot_tokenizer.eos_token, return_tensors="pt")
    input_ids = encoded_input["input_ids"]
    attention_mask = encoded_input["attention_mask"]

    chatbot_output = chatbot_model.generate(
        input_ids,
        attention_mask=attention_mask,
        max_length=1000,
        pad_token_id=chatbot_tokenizer.eos_token_id
    )

    base_response = chatbot_tokenizer.decode(chatbot_output[:, input_ids.shape[-1]:][0], skip_special_tokens=True)
    return f"{base_response}\n\n{mood_suggestions.get(sentiment, '')}"


# POST endpoint
@app.post("/analyze/")
async def analyze_sentiment(data: TextInput):
    try:
        processed_text = convert_emojis_to_text(data.text)

        result = sentiment_pipe(processed_text)
        sentiment = result[0]["label"]
        confidence = result[0]["score"]

        recommended_songs = get_music_recommendations(sentiment)
        chatbot_reply = get_chatbot_response(data.text, sentiment)

        return {
            "sentiment": sentiment,
            "confidence": confidence,
            "recommended_songs": recommended_songs,
            "chatbot_reply": chatbot_reply
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
def root():
    return {"message": "Sentiment Analysis API is running!"}
