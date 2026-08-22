"""Media Upload & Secure Delivery API Router."""

import uuid

from fastapi import APIRouter, Depends, File, UploadFile
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.permissions import UserContext
from app.db.session import get_db
from app.integrations.storage.local import LocalStorageProvider
from app.modules.auth.dependencies import get_current_user_context
from app.modules.media.models import MediaAsset

router = APIRouter(prefix="/media", tags=["Media & Assets"])


class UploadResponse(BaseModel):
    asset_id: str
    filename: str
    url: str
    content_type: str
    size_bytes: int


@router.post("/upload", response_model=UploadResponse, summary="Upload a media file")
async def upload_file(
    file: UploadFile = File(...),
    user_context: UserContext = Depends(get_current_user_context),
    db: AsyncSession = Depends(get_db),
):
    storage = LocalStorageProvider()
    ext = file.filename.split(".")[-1] if file.filename and "." in file.filename else "bin"
    destination_path = f"{uuid.uuid4().hex}.{ext}"

    stored = await storage.upload_file(
        file_obj=file.file,
        destination_path=destination_path,
        content_type=file.content_type or "application/octet-stream",
        is_public=True,
    )

    asset = MediaAsset(
        filename=file.filename or "file",
        storage_key=stored.storage_key,
        public_url=stored.public_url,
        content_type=stored.content_type,
        size_bytes=stored.size_bytes,
        is_public=True,
        uploaded_by_id=uuid.UUID(user_context.user_id),
    )
    db.add(asset)
    await db.commit()
    await db.refresh(asset)

    return UploadResponse(
        asset_id=str(asset.id),
        filename=asset.filename,
        url=asset.public_url,
        content_type=asset.content_type,
        size_bytes=asset.size_bytes,
    )
