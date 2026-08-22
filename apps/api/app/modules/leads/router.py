"""Leads and Discovery Call API Router."""

from fastapi import APIRouter, Depends, status
from pydantic import BaseModel, EmailStr
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.modules.leads.models import DiscoveryCallRequest, Lead, LeadMagnet, LeadMagnetDownload

router = APIRouter(prefix="/leads", tags=["Leads & Marketing"])


class LeadCaptureRequest(BaseModel):
    email: EmailStr
    first_name: str | None = None
    last_name: str | None = None
    magnet_slug: str | None = None
    campaign: str | None = None


class LeadCaptureResponse(BaseModel):
    status: str
    message: str
    download_url: str | None = None


class DiscoveryCallSubmission(BaseModel):
    name: str
    email: EmailStr
    phone: str | None = None
    primary_goal: str
    preferred_time: str | None = None


@router.post(
    "/capture",
    response_model=LeadCaptureResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Capture public lead and optionally deliver lead magnet",
)
async def capture_lead(req: LeadCaptureRequest, db: AsyncSession = Depends(get_db)):
    # Find or create lead safely
    res = await db.execute(select(Lead).where(Lead.email == req.email))
    lead = res.scalar_one_or_none()

    if not lead:
        lead = Lead(
            email=req.email,
            first_name=req.first_name,
            last_name=req.last_name,
            campaign=req.campaign,
        )
        db.add(lead)
        await db.flush()

    download_url = None
    if req.magnet_slug:
        mag_res = await db.execute(select(LeadMagnet).where(LeadMagnet.slug == req.magnet_slug))
        magnet = mag_res.scalar_one_or_none()
        if magnet:
            download = LeadMagnetDownload(lead_id=lead.id, magnet_id=magnet.id)
            db.add(download)
            download_url = magnet.download_url

    await db.commit()
    return LeadCaptureResponse(
        status="success",
        message="Thank you! Your wellness guide is ready for download.",
        download_url=download_url or "https://storage.annapoorna.wellness/guides/6-pillars-starter-guide.pdf",
    )


@router.post(
    "/discovery-call",
    status_code=status.HTTP_201_CREATED,
    summary="Submit a discovery call consultation request",
)
async def book_discovery_call(req: DiscoveryCallSubmission, db: AsyncSession = Depends(get_db)):
    call_req = DiscoveryCallRequest(
        name=req.name,
        email=req.email,
        phone=req.phone,
        primary_goal=req.primary_goal,
        preferred_time=req.preferred_time,
    )
    db.add(call_req)
    await db.commit()
    return {"status": "success", "message": "Discovery call request received. Our team will contact you shortly."}
