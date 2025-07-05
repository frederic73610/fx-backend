from fastapi import FastAPI
from pydantic import BaseModel
import random

app = FastAPI()

class PredictionResponse(BaseModel):
    prediction: str
    interval: str   # ➡️ ajoute ce champ

@app.get("/predict", response_model=PredictionResponse)
def predict(symbol: str = "EUR/USD", interval: str = "1day"):
    direction = random.choice(["Hausse", "Baisse"])
    confidence = round(random.uniform(51, 70), 1)
    return {
        "prediction": f"{direction} probable ({confidence}%)",
        "interval": interval   # ➡️ renvoie l'interval demandé
    }
