from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from groq import Groq
from security import analyze_prompt
from database import Base, engine, SessionLocal
from sqlalchemy.orm import Session
from fastapi import Depends
from database import SessionLocal
import models
import os

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Charger les variables du fichier .env
load_dotenv()

# Récupérer la clé Groq
api_key = os.getenv("GROQ_API_KEY")

if not api_key:
    raise ValueError("GROQ_API_KEY n'est pas définie dans le fichier .env")

# Créer le client Groq
client = Groq(api_key=api_key)

# Créer FastAPI
app = FastAPI()
Base.metadata.create_all(bind=engine)

# Autoriser React à communiquer avec FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"message": "Backend fonctionne !"}


class ChatRequest(BaseModel):
    message: str


@app.post("/chat")
def chat(request: ChatRequest):

    # ==========================================================
    # 1. Analyse de sécurité
    # ==========================================================

    security_result = analyze_prompt(request.message)

    # ==========================================================
    # 2. Enregistrer l'analyse dans PostgreSQL
    # ==========================================================

    db = SessionLocal()

    try:

        log = models.SecurityLog(
            message=request.message,
            score=security_result["score"],
            decision=security_result["decision"],
            categories=",".join(security_result["categories"]),
            owasp=",".join(security_result["owasp"])
        )

        db.add(log)
        db.commit()

    finally:

        db.close()

    # ==========================================================
    # 3. Bloquer les requêtes dangereuses
    # ==========================================================

    if security_result["decision"] == "BLOCK":

        return {
            "response": "REQUETE BLOQUEE",
            "security": security_result
        }

    # ==========================================================
    # 4. Envoyer les requêtes autorisées à Groq
    # ==========================================================

    response = client.chat.completions.create(
        model="openai/gpt-oss-20b",
        messages=[
            {
                "role": "user",
                "content": request.message
            }
        ]
    )

    # ==========================================================
    # 5. Retourner la réponse
    # ==========================================================

    return {
        "response": response.choices[0].message.content,
        "security": security_result
    }

@app.get("/logs")
def get_logs(db: Session = Depends(get_db)):
    logs = (
        db.query(models.SecurityLog)
        .order_by(models.SecurityLog.created_at.desc())
        .all()
    )

    return [
        {
            "id": log.id,
            "message": log.message,
            "score": log.score,
            "decision": log.decision,
            "categories": log.categories,
            "owasp": log.owasp,
            "created_at": log.created_at
        }
        for log in logs
    ]

@app.get("/stats")
def get_stats(db: Session = Depends(get_db)):

    logs = db.query(models.SecurityLog).all()

    total = len(logs)

    allowed = sum(
        1 for log in logs
        if log.decision == "ALLOW"
    )

    warnings = sum(
        1 for log in logs
        if log.decision == "WARNING"
    )

    blocked = sum(
        1 for log in logs
        if log.decision == "BLOCK"
    )

    average_score = (
        sum(log.score for log in logs) / total
        if total > 0
        else 0
    )

    categories = {}

    for log in logs:
        if log.categories:
            for category in log.categories.split(","):
                category = category.strip()

                if category:
                    categories[category] = categories.get(category, 0) + 1

    return {
        "total": total,
        "allowed": allowed,
        "warnings": warnings,
        "blocked": blocked,
        "average_score": round(average_score, 2),
        "categories": categories
    }