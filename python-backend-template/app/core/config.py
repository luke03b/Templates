"""Configurazione dell'applicazione letta da variabili d'ambiente (e dal file `.env`).

Usa pydantic-settings: ogni campo della classe `Settings` corrisponde a una variabile
d'ambiente con lo stesso nome (case-insensitive), es. `port` <- `PORT`.
I valori vengono validati e convertiti nel tipo dichiarato all'avvio: se `PORT=abc`
l'app non parte e l'errore è chiaro, invece di fallire più tardi.
"""

from functools import lru_cache
from typing import Annotated, Literal

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, NoDecode, SettingsConfigDict

SERVICE_NAME = "python-backend-template"

DEFAULT_CORS_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:4200",
    "http://localhost:5200",
    "http://localhost:5300",
    "http://localhost:8081",
    "http://localhost:8082",
    "http://localhost:8083",
    "http://localhost:8084",
]

LogLevel = Literal["debug", "info", "warn", "error"]


class Settings(BaseSettings):
    """Valori runtime del servizio. Vedi `.env.example` per l'elenco documentato."""

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    service_name: str = SERVICE_NAME
    host: str = "127.0.0.1"
    port: int = Field(default=8000, ge=1, le=65535)
    log_level: LogLevel = "info"
    # `NoDecode` dice a pydantic-settings di NON interpretare il valore come JSON:
    # lo riceviamo come stringa "a,b,c" e lo dividiamo noi nel validator qui sotto.
    cors_origins: Annotated[list[str], NoDecode] = Field(
        default_factory=lambda: list(DEFAULT_CORS_ORIGINS)
    )

    @field_validator("log_level", mode="before")
    @classmethod
    def _normalize_log_level(cls, value: object) -> object:
        # Accetta anche "INFO", " Warn ", "warning".
        if isinstance(value, str):
            normalized = value.strip().lower()
            return "warn" if normalized == "warning" else normalized
        return value

    @field_validator("cors_origins", mode="before")
    @classmethod
    def _split_cors_origins(cls, value: object) -> object:
        if isinstance(value, str):
            return [origin.strip() for origin in value.split(",") if origin.strip()]
        return value


@lru_cache
def get_settings() -> Settings:
    """Restituisce le impostazioni, lette una sola volta (cache) per tutto il processo."""
    return Settings()
