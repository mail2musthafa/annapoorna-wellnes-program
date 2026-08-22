"""Local filesystem storage adapter."""

import os
import shutil
from pathlib import Path
from typing import BinaryIO

from app.core.config import settings
from app.integrations.storage.interface import ObjectStorageProvider, StoredObject


class LocalStorageProvider(ObjectStorageProvider):
    def __init__(self):
        self.root_dir = Path(settings.STORAGE_LOCAL_ROOT)
        self.root_dir.mkdir(parents=True, exist_ok=True)

    async def upload_file(
        self,
        file_obj: BinaryIO,
        destination_path: str,
        content_type: str,
        is_public: bool = False,
    ) -> StoredObject:
        target_path = self.root_dir / destination_path
        target_path.parent.mkdir(parents=True, exist_ok=True)

        with open(target_path, "wb") as f:
            shutil.copyfileobj(file_obj, f)

        size_bytes = os.path.getsize(target_path)
        public_url = f"/static/uploads/{destination_path}"

        return StoredObject(
            storage_key=destination_path,
            public_url=public_url,
            content_type=content_type,
            size_bytes=size_bytes,
        )

    async def generate_presigned_url(self, storage_key: str, expiration_seconds: int = 3600) -> str:
        return f"/api/v1/media/secure-stream/{storage_key}?exp={expiration_seconds}"

    async def delete_file(self, storage_key: str) -> bool:
        target_path = self.root_dir / storage_key
        if target_path.exists():
            target_path.unlink()
            return True
        return False
