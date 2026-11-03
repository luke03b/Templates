"""Router principale: raccoglie tutti i router delle risorse sotto il prefisso `/api`.

Per una nuova risorsa: crea `app/api/<risorsa>.py` con il suo `router` e aggiungi qui
una riga `api_router.include_router(...)`.
"""

from fastapi import APIRouter

from app.api import health, items

api_router = APIRouter(prefix="/api")
api_router.include_router(health.router)
api_router.include_router(items.router)
