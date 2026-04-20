from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import analyze, history
from app.config import settings
from app.database import init_db

app = FastAPI(title="Log Analyzer API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup() -> None:
    init_db()


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok", "model": settings.gemini_model}


app.include_router(analyze.router, prefix="/api", tags=["analyze"])
app.include_router(history.router, prefix="/api", tags=["history"])
