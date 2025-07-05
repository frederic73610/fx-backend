from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import random

app = FastAPI()

# ⭐ AJOUTE BIEN LE MIDDLEWARE JUSTE APRES app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # ou ["http://localhost:5173"] si tu veux restreindre
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PredictionResponse(BaseModel):
    prediction: str
    interval: str

@app.get("/predict", response_model=PredictionResponse)
def predict(symbol: str = "EUR/USD", interval: str = "1day"):
    direction = random.choice(["Hausse", "Baisse"])
    confidence = round(random.uniform(51, 70), 1)
    return {
        "prediction": f"{direction} probable ({confidence}%)",
        "interval": interval
    }
