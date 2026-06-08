import base64
import hashlib
import hmac
import os
import secrets


def _token_secret() -> bytes:
    return os.getenv("ADMIN_PANEL_TOKEN_SECRET", "aic-maamani-admin-secret").encode("utf-8")


def create_password_record(password: str) -> tuple[str, str]:
    salt = secrets.token_hex(16)
    password_hash = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt.encode("utf-8"),
        120_000,
    ).hex()
    return salt, password_hash


def verify_password(password: str, salt: str, expected_hash: str) -> bool:
    actual_hash = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt.encode("utf-8"),
        120_000,
    ).hex()
    return hmac.compare_digest(actual_hash, expected_hash)


def make_token(username: str) -> str:
    signature = hmac.new(_token_secret(), username.encode("utf-8"), hashlib.sha256).hexdigest()
    payload = base64.urlsafe_b64encode(username.encode("utf-8")).decode("utf-8").rstrip("=")
    return f"{payload}.{signature}"


def parse_token(token: str) -> str | None:
    try:
        payload, signature = token.split(".", 1)
        padding = "=" * (-len(payload) % 4)
        username = base64.urlsafe_b64decode((payload + padding).encode("utf-8")).decode("utf-8")
    except Exception:
        return None

    expected_signature = hmac.new(_token_secret(), username.encode("utf-8"), hashlib.sha256).hexdigest()
    if not hmac.compare_digest(signature, expected_signature):
        return None
    return username
