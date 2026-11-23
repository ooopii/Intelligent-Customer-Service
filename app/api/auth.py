from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import User

from app.core.security import create_access_token, get_current_user, require_role

import hashlib
import hmac
import secrets

router = APIRouter(prefix="/auth", tags=["login"])

def hash_password(password: str) -> str:
    """对新密码进行加盐哈希。"""
    salt = secrets.token_hex(16)
    iterations = 600_000

    password_hash = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt.encode("utf-8"),
        iterations,
    ).hex()

    return f"pbkdf2_sha256${iterations}${salt}${password_hash}"


def verify_password(password: str, stored_password: str) -> bool:
    """验证哈希密码，并兼容数据库中原有的明文密码。"""
    if stored_password.startswith("pbkdf2_sha256$"):
        try:
            _, iterations, salt, expected_hash = stored_password.split("$")

            actual_hash = hashlib.pbkdf2_hmac(
                "sha256",
                password.encode("utf-8"),
                salt.encode("utf-8"),
                int(iterations),
            ).hex()

            return hmac.compare_digest(actual_hash, expected_hash)
        except (ValueError, TypeError):
            return False

    # 兼容尚未升级的旧账号
    return hmac.compare_digest(password, stored_password)


@router.post("/login")
def login(
    username: str,
    password: str,
    db: Session = Depends(get_db),
):
    user = (
        db.query(User)
        .filter(User.username == username)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Incorrect username or password."
        )

    if not verify_password(password, user.password):
        raise HTTPException(
            status_code=401,
            detail="Incorrect username or password."
        )

    from app.core.security import create_access_token

    token = create_access_token(
        user_id=user.id,
        role=user.role,
    )

    return {
        "message": "login successful",
        "access_token": token,
        "user_id": user.id,
        "username": user.username,
        "role": user.role,
    }

@router.post("/register")
def register(
    username: str,
    password: str,
    db: Session = Depends(get_db),
):
    username = username.strip()

    if not username:
        raise HTTPException(
            status_code=400,
            detail="Username cannot be empty.",
        )

    if len(username) > 50:
        raise HTTPException(
            status_code=400,
            detail="Username cannot exceed 50 characters.",
        )

    if len(password) < 6:
        raise HTTPException(
            status_code=400,
            detail="Password must be at least 6 characters.",
        )

    existing_user = (
        db.query(User)
        .filter(User.username == username)
        .first()
    )

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Username already exists. Please choose another username.",
        )

    new_user = User(
        username=username,
        password=hash_password(password),
        role="customer",
    )

    try:
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Registration failed. Please try again later.",
        )

    return {
        "message": "Registration successful.",
        "user_id": new_user.id,
        "username": new_user.username,
    }

@router.get("/me")
def get_me(current_user: dict = Depends(get_current_user)):
    return current_user

@router.get("/admin-test")
def admin_test(
    current_user: dict = Depends(require_role("admin")),
):
    return {
        "message": "Admin verification succeeded.",
        "user": current_user,
    }

