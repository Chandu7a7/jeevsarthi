from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
import pandas as pd
from dotenv import load_dotenv
import os

load_dotenv()

app = Flask(__name__)
CORS(app)

# Load ML model (if exists)
model_path = os.path.join(os.path.dirname(__file__), 'model', 'amu_predictor.pkl')
try:
    model = joblib.load(model_path)
    model_loaded = True
except FileNotFoundError:
    print("Warning: ML model not found. Using default predictions.")
    model = None
    model_loaded = False

@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        'success': True,
        'message': 'ML Service is running',
        'model_loaded': model_loaded
    })

@app.route('/predict', methods=['POST'])
def predict():
    """
    Predict MRL violation risk
    Input:
    {
        "dosage": float,
        "frequency": str,
        "drugType": str,
        "animalAge": float,
        "previousViolations": int
    }
    """
    try:
        data = request.json
        
        # Extract features
        dosage = float(data.get('dosage', 0))
        frequency = data.get('frequency', 'once')
        drugType = data.get('drugType', 'antibiotic')
        animalAge = float(data.get('animalAge', 1))
        previousViolations = int(data.get('previousViolations', 0))
        
        # Convert frequency to numeric
        freq_map = {'once': 1, 'twice': 2, 'thrice': 3, 'daily': 7, 'weekly': 1}
        freq_value = freq_map.get(frequency.lower(), 1)
        
        # Convert drug type to numeric
        drug_map = {'antibiotic': 1, 'antiparasitic': 2, 'vaccine': 3, 'vitamin': 4, 'other': 0}
        drug_value = drug_map.get(drugType.lower(), 0)
        
        # Feature vector
        features = np.array([[dosage, freq_value, drug_value, animalAge, previousViolations]])
        
        # Predict using model or default logic
        if model_loaded:
            risk_score = model.predict(features)[0]
            probability = float(risk_score) if isinstance(risk_score, (int, float)) else 0.5
        else:
            # Default prediction logic
            risk_score = 0.5
            if dosage > 100:
                risk_score += 0.2
            if previousViolations > 0:
                risk_score += 0.2
            if freq_value > 2:
                risk_score += 0.1
            probability = min(risk_score, 1.0)
        
        # Determine risk level
        if probability >= 0.7:
            risk_level = 'high'
        elif probability >= 0.4:
            risk_level = 'medium'
        else:
            risk_level = 'low'
        
        return jsonify({
            'success': True,
            'prediction': {
                'risk_score': round(probability, 3),
                'risk_level': risk_level,
                'violation_probability': round(probability * 100, 2),
                'recommendation': get_recommendation(risk_level, dosage, drugType)
            }
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 400

def get_recommendation(risk_level, dosage, drugType):
    """Generate recommendation based on risk level"""
    if risk_level == 'high':
        return f"High risk of MRL violation. Recommend reducing dosage or choosing alternative medicine for {drugType}."
    elif risk_level == 'medium':
        return f"Moderate risk detected. Monitor animal closely and ensure proper withdrawal period for {drugType}."
    else:
        return f"Low risk. Current dosage appears safe for {drugType}. Follow standard withdrawal period."

if __name__ == '__main__':
    port = int(os.getenv('ML_SERVICE_PORT', 5001))
    app.run(host='0.0.0.0', port=port, debug=True)

