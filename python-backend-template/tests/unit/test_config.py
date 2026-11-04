"""Unit test della configurazione da variabili d'ambiente."""

import pytest

from app.core.config import DEFAULT_CORS_ORIGINS, Settings


def test_defaults_match_contract(monkeypatch: pytest.MonkeyPatch) -> None:
    for name in ("PORT", "CORS_ORIGINS", "LOG_LEVEL", "HOST"):
        monkeypatch.delenv(name, raising=False)

    settings = Settings(_env_file=None)

    assert settings.port == 8000
    assert settings.log_level == "info"
    assert settings.cors_origins == DEFAULT_CORS_ORIGINS


def test_env_variables_are_parsed(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("PORT", "9000")
    monkeypatch.setenv("LOG_LEVEL", " WARNING ")
    monkeypatch.setenv("CORS_ORIGINS", "http://a.test, http://b.test,,")

    settings = Settings(_env_file=None)

    assert settings.port == 9000
    assert settings.log_level == "warn"
    assert settings.cors_origins == ["http://a.test", "http://b.test"]


def test_invalid_log_level_is_rejected(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("LOG_LEVEL", "verbose")

    with pytest.raises(ValueError, match="log_level"):
        Settings(_env_file=None)
