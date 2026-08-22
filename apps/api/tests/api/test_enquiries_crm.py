"""Tests for CRM Inbound Lead Ingestion, Pipeline Listing, and Timeline Activities."""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_inbound_enquiry_creation_and_activity_logging(client: AsyncClient):
    # Submit contact form enquiry
    res = await client.post(
        "/api/v1/enquiries",
        json={
            "first_name": "Kavya",
            "last_name": "Menon",
            "email": "kavya.menon@example.com",
            "phone": "+91 98765 00000",
            "enquiry_type": "contact_form",
            "interested_product": "Six-Week Lifestyle Reset",
            "message": "Interested in joining the next upcoming cohort.",
            "marketing_consent": True,
        },
    )
    assert res.status_code == 201
    enquiry = res.json()
    assert enquiry["status"] == "new"
    assert enquiry["first_name"] == "Kavya"
    assert len(enquiry["activities"]) >= 1
    assert enquiry["activities"][0]["activity_type"] == "enquiry_created"
