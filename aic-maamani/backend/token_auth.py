import os
import datetime
import jwt

SECRET = os.getenv("AIC_MAAMANI_JWT_SECRET") or os.getenv("AIC_MAAMANI_SESSION_SECRET") or "aic-maamani-default-secret"
ALGORITHM = "HS256"


def create_access_token(username: str, role: str, expires_seconds: int = 3600) -> str:
    now = datetime.datetime.utcnow()
    payload = {
        "sub": username,
        "role": role,
        "iat": now,
        "exp": now + datetime.timedelta(seconds=expires_seconds),
    }
    token = jwt.encode(payload, SECRET, algorithm=ALGORITHM)
    # PyJWT returns str in v2+, ensure string
    if isinstance(token, bytes):
        token = token.decode("utf-8")
    return token


def verify_token(token: str):
    try:
        payload = jwt.decode(token, SECRET, algorithms=[ALGORITHM])
        username = payload.get("sub")
        role = payload.get("role")
        return username, role
    except jwt.ExpiredSignatureError:
        raise
    except Exception:
        raise
