from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import User
from app.core.security import require_role

router = APIRouter(prefix="/users", tags=["user management"])


# 查询用户列表 + 分页
@router.get("")
def get_users(
    page: int = 1,
    page_size: int = 10,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_role("admin")),
):
    if page < 1 or page_size < 1:
        raise HTTPException(status_code=400, detail="Invalid pagination parameters.")

    total = db.query(User).count()

    users = (
        db.query(User)
        .order_by(User.id.asc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    return {
        "page": page,
        "page_size": page_size,
        "total": total,
        "data": [
            {
                "id": user.id,
                "username": user.username,
                "role": user.role,
                "created_at": user.created_at,
            }
            for user in users
        ],
    }


# 查询单个用户
@router.get("/{user_id}")
def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_role("admin")),
):
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="user not exist")

    return {
        "id": user.id,
        "username": user.username,
        "role": user.role,
        "created_at": user.created_at,
    }


# 创建用户
@router.post("")
def create_user(
    username: str,
    password: str,
    role: str = "customer",
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_role("admin")),
):
    existing_user = (
        db.query(User)
        .filter(User.username == username)
        .first()
    )

    if existing_user:
        raise HTTPException(status_code=400, detail="user already exist")

    if role not in ["admin", "customer_service", "customer"]:
        raise HTTPException(status_code=400, detail="Invalid role")

    user = User(
        username=username,
        password=password,
        role=role,
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return {
        "message": "create user successful",
        "id": user.id,
        "username": user.username,
        "role": user.role,
    }


# 修改用户
@router.put("/{user_id}")
def update_user(
    user_id: int,
    password: str | None = None,
    role: str | None = None,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_role("admin")),
):
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="user not exist")

    if role is not None:
        if role not in ["admin", "customer_service", "customer"]:
            raise HTTPException(status_code=400, detail="Invalid role")
        user.role = role

    if password is not None:
        user.password = password

    db.commit()
    db.refresh(user)

    return {
        "message": "User updated successfully.",
        "id": user.id,
        "username": user.username,
        "role": user.role,
    }


# 删除用户
@router.delete("/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_role("admin")),
):
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="user not exist")

    if user.id == current_user["user_id"]:
        raise HTTPException(status_code=400, detail="cannot delete the currently logged-in user.")

    db.delete(user)
    db.commit()

    return {"message": "User deleted successfully."}