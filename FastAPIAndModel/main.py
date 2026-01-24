from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import re

# Initialize FastAPI app
app = FastAPI(
    title="AI-Based SQLi/XSS Detection API",
    description="TF-IDF + Random Forest attack detection service",
    version="1.0"
)

# Load models
tfidf = joblib.load("tfidf_vectorizer.pkl")
model = joblib.load("randomforest_tfidf.pkl")

# Request schema
class InputData(BaseModel):
    input: str

# NLP preprocessing
def clean_text(text: str) -> str:
    # Only analyze string values, remove extra symbols
    text = str(text).lower()
    # Remove quotes and braces for query analysis
    text = re.sub(r'[\{\}"\']', ' ', text)
    text = re.sub(r'[\n\r\t]', ' ', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text
    

# Label mapping
LABELS = {
    0: "Normal",
    1: "SQL Injection",
    2: "XSS",
    3: "Command Injection"
}

@app.post("/detect")
def detect_attack(data: InputData):
    cleaned = clean_text(data.input)

    vector = tfidf.transform([cleaned])
    prediction = int(model.predict(vector)[0])
    confidence = float(max(model.predict_proba(vector)[0]))

    return {
        "isAttack": prediction != 0,
        "attackType": LABELS[prediction],
        "confidence": round(confidence, 3)
    }
