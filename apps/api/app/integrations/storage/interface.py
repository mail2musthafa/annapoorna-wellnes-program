"""Object Storage SPI Interface."""

from abc import ABC, abstractmethod
from typing import BinaryIO

from pydantic import BaseModel


class StoredObject(BaseModel):
    storage_key: str
    public_url: str
    content_type: str
    size_bytes: int


class ObjectStorageProvider(ABC):
    @abstractmethod
    async def upload_file(
        self,
        file_obj: BinaryIO,
        destination_path: str,
        content_type: str,
        is_public: bool = False,
    ) -> StoredObject:
        """Upload a file stream to object storage."""
        pass

    @abstractmethod
    async def generate_presigned_url(self, storage_key: str, expiration_seconds: int = 3600) -> str:
        """Generate a secure pre-signed download/view URL."""
        pass

    @abstractmethod
    async def delete_file(self, storage_key: str) -> bool:
        """Delete an object from storage."""
        pass
