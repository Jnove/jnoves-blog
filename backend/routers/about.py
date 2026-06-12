"""关于页路由：公开读取，管理员可编辑"""
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from ..core.security import get_current_admin
from ..database import get_db
from ..models import AboutPage, User

router = APIRouter(prefix="/api/about", tags=["about"])


class AboutResponse(BaseModel):
    id: int
    content: str
    updated_at: str | None = None

    model_config = {"from_attributes": True}


class AboutUpdate(BaseModel):
    content: str


def _ensure_row(db: Session) -> AboutPage:
    """确保 about_page 行存在，返回当前行"""
    row = db.query(AboutPage).filter(AboutPage.id == 1).first()
    if not row:
        row = AboutPage(id=1, content="")
        db.add(row)
        db.commit()
        db.refresh(row)
    return row


@router.get("", response_model=AboutResponse)
def get_about(db: Session = Depends(get_db)):
    row = _ensure_row(db)
    return AboutResponse(
        id=row.id,
        content=row.content,
        updated_at=row.updated_at.isoformat() if row.updated_at else None,
    )


@router.put("", response_model=AboutResponse)
def update_about(
    body: AboutUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    row = _ensure_row(db)
    row.content = body.content
    db.commit()
    db.refresh(row)
    return AboutResponse(
        id=row.id,
        content=row.content,
        updated_at=row.updated_at.isoformat() if row.updated_at else None,
    )
