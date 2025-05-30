from flask import Flask, request, jsonify
from flask_cors import CORS
import random

app = Flask(__name__)
CORS(app)

@app.route("/predict")
def predict():
    symbol = request.args.get("symbol")
    interval = request.args.get("interval")
    
    if not symbol or not interval:
        return jsonify({"error": "Missing parameters"}), 400

    direction = random.choice(["Hausse", "Baisse"])
    confidence = round(random.uniform(51, 75), 1)
    return jsonify({"prediction": f"{direction} probable ({confidence}%)"})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)