from flask import Flask, request, jsonify
from flask_cors import CORS
import random

app = Flask(__name__)
CORS(app)

@app.route("/predict")
def predict():
    symbol = request.args.get("symbol", "EUR/USD")
    interval = request.args.get("interval", "1day")
    
    direction = random.choice(["Hausse", "Baisse"])
    confidence = round(random.uniform(51.0, 75.0), 1)
    prediction = f"{direction} probable ({confidence}%)"
    
    return jsonify({"symbol": symbol, "interval": interval, "prediction": prediction})

if __name__ == "__main__":
    app.run(debug=True)
