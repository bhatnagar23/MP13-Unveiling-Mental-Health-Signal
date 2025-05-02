import random
import json
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from transformers import pipeline
import emoji

# Initialize FastAPI app
app = FastAPI()

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Update for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load Sentiment Analysis Model
pipe = pipeline("text-classification", model="finiteautomata/bertweet-base-sentiment-analysis")

# Load music recommendations from JSON file
with open("music_recommendations.json", "r", encoding="utf-8") as file:
    MUSIC_DATA = json.load(file)

# Request body schema
class TextInput(BaseModel):
    text: str

# Function to convert emojis to text
def convert_emojis_to_text(text: str) -> str:
    return emoji.demojize(text, delimiters=(" ", " "))  # Convert emojis to text format

# Function to get random music recommendations
def get_music_recommendations(sentiment: str):
    return random.sample(MUSIC_DATA.get(sentiment, []), 3)  # Get 3 random songs

# Define POST endpoint
@app.post("/analyze/")
async def analyze_sentiment(data: TextInput):
    try:
        # Convert emojis to text before analysis
        processed_text = convert_emojis_to_text(data.text)

        # Perform sentiment analysis
        result = pipe(processed_text)
        sentiment = result[0]["label"]  # "POS", "NEU", "NEG"
        confidence = result[0]["score"]  # Confidence score

        # Get music recommendations based on sentiment
        recommended_songs = get_music_recommendations(sentiment)

        return {
            "sentiment": sentiment,
            "confidence": confidence,
            "recommended_songs": recommended_songs
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Root endpoint
@app.get("/")
def root():
    return {"message": "Sentiment Analysis API is running!"}
