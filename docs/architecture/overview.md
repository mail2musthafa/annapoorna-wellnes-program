# Annapoorna Portal Architecture Overview

## 1. Executive Summary

Annapoorna Portal is an evidence-informed holistic lifestyle education, coaching, membership, and community platform. The system is engineered around **Six Core Lifestyle Pillars**:
1. **Nutrition**
2. **Movement**
3. **Restorative Sleep**
4. **Mindfulness**
5. **Relationships & Community**
6. **Avoidance of Risky Substances**

Each pillar provides three structured capability tiers:
- **Education**: Video masterclasses, structured lessons, and guides.
- **Management**: Habit planning, daily check-ins, reminders, and class bookings.
- **Analysis**: Non-diagnostic progress tracking, trend logging, and reflection.

---

## 2. Core Architectural Philosophy: Modular Monolith

Annapoorna Portal adopts a clean **Modular Monolith** architecture:
- Single deployable backend codebase with strictly partitioned domain modules (`app/modules/*`).
- Eliminates premature distributed microservices overhead (e.g., Kubernetes, Kafka, distributed tracing, network partitioning).
- Enforces loose coupling: inter-module communication is performed via typed Python services and dependency injection.
- Database access is managed exclusively via SQLAlchemy 2.0 Async ORM with explicit transaction boundaries.

---

## 3. Service Provider Interface (SPI) Abstractions

To avoid vendor lock-in, all third-party integrations are defined through abstract provider interfaces (`app/integrations/*`):
- **Payment Gateway**: `PaymentGateway` interface supporting Stripe, Razorpay, and Mock local gateways with signed webhook verification.
- **Email Service**: `EmailProvider` interface supporting Console, SMTP, and AWS SES.
- **Object Storage**: `ObjectStorageProvider` interface supporting Local Storage and AWS S3 / Cloudflare R2 with secure pre-signed URLs.
- **Live Meeting Provider**: `MeetingProvider` interface supporting Zoom and WebRTC rooms with access-restricted link generation.
