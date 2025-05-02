from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from transformers import pipeline
import requests

# Initialize FastAPI app
app = FastAPI()

# Enable CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Adjust as needed
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load Sentiment Analysis Model
pipe = pipeline("text-classification", model="finiteautomata/bertweet-base-sentiment-analysis")

# News API Key
NEWS_API_KEY = "50fa5204f4b44b869b36c9e8dfba7af5"
NEWS_API_URL = "https://newsapi.org/v2/everything"

# Request body schema
class TextInput(BaseModel):
    text: str

def fetch_news(sentiment: str):
    """Fetch relevant news articles based on sentiment."""
    query_map = {
        "POS": "mental health success stories",
        "NEU": "latest mental health research",
        "NEG": "mental health support and therapy",
    }
    
    query = query_map.get(sentiment, "mental health")
    params = {
        "q": query,
        "apiKey": NEWS_API_KEY,
        "language": "en",
        "sortBy": "relevancy",
    }
    try:
        response = requests.get(NEWS_API_URL, params=params)
        response.raise_for_status()
        articles = response.json().get("articles", [])[:5]  # Get top 5 articles
        return articles
    except requests.RequestException as e:
        return {"error": str(e)}

@app.post("/analyze/")
async def analyze_sentiment(data: TextInput):
    try:
        result = pipe(data.text)
        sentiment = result[0]["label"]  # "POS", "NEU", "NEG"
        confidence = result[0]["score"]  # Confidence score

        # Fetch relevant news articles
        articles = fetch_news(sentiment)

        return {"sentiment": sentiment, "confidence": confidence, "news": articles}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
def root():
    return {"message": "Sentiment Analysis API with News Feature is running!"}
