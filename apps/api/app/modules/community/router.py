"""Community Spaces, Feed, Interactive Posts, Reactions, and Comments API Router."""

import uuid
from datetime import UTC, datetime
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.constants import PermissionCode
from app.core.permissions import UserContext, require_permission
from app.db.session import get_db
from app.modules.auth.dependencies import get_current_user_context
from app.modules.community.models import Comment, CommunitySpace, Post, Reaction
from app.modules.users.models import User, UserProfile
from app.shared.enums import ModerationStatus

router = APIRouter(prefix="/community", tags=["Community Feed & Spaces"])


# Schemas
class SpaceItem(BaseModel):
    id: str
    name: str
    slug: str
    description: str
    icon_name: str | None = None


class CommentItem(BaseModel):
    id: str
    author_id: str
    author_name: str
    content: str
    created_at: str


class ReactionSummary(BaseModel):
    reaction_type: str
    count: int
    user_reacted: bool = False


class PostItem(BaseModel):
    id: str
    space_id: str
    space_name: str | None = None
    author_id: str
    author_name: str
    author_avatar: str | None = None
    author_badge: str | None = None
    title: str | None = None
    content: str
    media_urls: list[str] = Field(default_factory=list)
    pillar_tag: str | None = None
    post_type: str = "discussion"
    is_pinned: bool = False
    created_at: str
    reactions: list[ReactionSummary] = Field(default_factory=list)
    total_reactions: int = 0
    comments: list[CommentItem] = Field(default_factory=list)
    total_comments: int = 0


class CreatePostRequest(BaseModel):
    space_id: str | None = None
    title: str | None = None
    content: str
    media_urls: list[str] = Field(default_factory=list)
    pillar_tag: str | None = None
    post_type: str = "discussion"


class AddReactionRequest(BaseModel):
    reaction_type: str = "🔥"


class AddCommentRequest(BaseModel):
    content: str


@router.get("/spaces", response_model=list[SpaceItem], summary="List community spaces")
async def list_spaces(db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(CommunitySpace))
    spaces = res.scalars().all()
    return [
        SpaceItem(
            id=str(s.id),
            name=s.name,
            slug=s.slug,
            description=s.description,
            icon_name=s.icon_name,
        )
        for s in spaces
    ]


@router.get("/posts", response_model=list[PostItem], summary="Get community feed posts")
async def list_posts(
    space_id: str | None = Query(None),
    post_type: str | None = Query(None),
    limit: int = Query(30, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    query = (
        select(Post)
        .where(Post.is_deleted.is_(False), Post.moderation_status == ModerationStatus.APPROVED)
        .options(
            selectinload(Post.author).selectinload(User.profile),
            selectinload(Post.space),
            selectinload(Post.comments).selectinload(Comment.author).selectinload(User.profile),
            selectinload(Post.reactions),
        )
        .order_by(desc(Post.is_pinned), desc(Post.created_at))
        .limit(limit)
    )

    if space_id:
        try:
            query = query.where(Post.space_id == uuid.UUID(space_id))
        except ValueError:
            pass

    if post_type and post_type != "all":
        query = query.where(Post.post_type == post_type)

    res = await db.execute(query)
    posts = res.scalars().all()

    output: list[PostItem] = []
    for p in posts:
        author_name = "Community Member"
        author_badge = "🔥 Member"
        if p.author and p.author.profile:
            author_name = f"{p.author.profile.first_name} {p.author.profile.last_name or ''}".strip()

        # Group reactions
        reaction_counts: dict[str, int] = {}
        for r in p.reactions:
            reaction_counts[r.reaction_type] = reaction_counts.get(r.reaction_type, 0) + 1

        reactions_summary = [
            ReactionSummary(reaction_type=rtype, count=cnt)
            for rtype, cnt in reaction_counts.items()
        ]

        comments_list = []
        for c in (p.comments or []):
            c_name = "Member"
            if c.author and c.author.profile:
                c_name = f"{c.author.profile.first_name} {c.author.profile.last_name or ''}".strip()
            comments_list.append(
                CommentItem(
                    id=str(c.id),
                    author_id=str(c.author_id),
                    author_name=c_name,
                    content=c.content,
                    created_at=c.created_at.isoformat() if c.created_at else datetime.now(UTC).isoformat(),
                )
            )

        output.append(
            PostItem(
                id=str(p.id),
                space_id=str(p.space_id),
                space_name=p.space.name if p.space else "General Discussion",
                author_id=str(p.author_id),
                author_name=author_name,
                author_badge=author_badge,
                title=p.title,
                content=p.content,
                media_urls=p.media_urls or [],
                pillar_tag=p.pillar_tag,
                post_type=p.post_type,
                is_pinned=p.is_pinned,
                created_at=p.created_at.isoformat() if p.created_at else datetime.now(UTC).isoformat(),
                reactions=reactions_summary,
                total_reactions=len(p.reactions),
                comments=comments_list,
                total_comments=len(comments_list),
            )
        )

    return output


@router.post("/posts", status_code=status.HTTP_201_CREATED, summary="Create an interactive community post")
async def create_post(
    req: CreatePostRequest,
    user_context: UserContext = Depends(get_current_user_context),
    db: AsyncSession = Depends(get_db),
):
    # Find space or default to first space
    target_space_id = None
    if req.space_id:
        try:
            target_space_id = uuid.UUID(req.space_id)
        except ValueError:
            pass

    if not target_space_id:
        space_res = await db.execute(select(CommunitySpace).limit(1))
        space = space_res.scalar_one_or_none()
        if space:
            target_space_id = space.id
        else:
            space = CommunitySpace(name="General Wellness", slug="general-wellness", description="Community discussion forum.")
            db.add(space)
            await db.flush()
            target_space_id = space.id

    post = Post(
        space_id=target_space_id,
        author_id=uuid.UUID(user_context.user_id),
        title=req.title,
        content=req.content,
        media_urls=req.media_urls,
        pillar_tag=req.pillar_tag,
        post_type=req.post_type,
        moderation_status=ModerationStatus.APPROVED,
    )
    db.add(post)
    await db.commit()
    await db.refresh(post)
    return {"status": "success", "post_id": str(post.id)}


@router.post("/posts/{post_id}/react", summary="Add or toggle emoji reaction to post")
async def react_to_post(
    post_id: uuid.UUID,
    req: AddReactionRequest,
    user_context: UserContext = Depends(get_current_user_context),
    db: AsyncSession = Depends(get_db),
):
    user_uuid = uuid.UUID(user_context.user_id)
    # Check if already reacted with same type -> toggle remove, or add new
    existing_res = await db.execute(
        select(Reaction).where(
            Reaction.post_id == post_id,
            Reaction.user_id == user_uuid,
            Reaction.reaction_type == req.reaction_type,
        )
    )
    existing = existing_res.scalar_one_or_none()
    if existing:
        await db.delete(existing)
        await db.commit()
        return {"status": "removed", "reaction_type": req.reaction_type}

    reaction = Reaction(
        post_id=post_id,
        user_id=user_uuid,
        reaction_type=req.reaction_type,
    )
    db.add(reaction)
    await db.commit()
    return {"status": "added", "reaction_type": req.reaction_type}


@router.post("/posts/{post_id}/comments", status_code=status.HTTP_201_CREATED, summary="Add comment to post")
async def add_comment(
    post_id: uuid.UUID,
    req: AddCommentRequest,
    user_context: UserContext = Depends(get_current_user_context),
    db: AsyncSession = Depends(get_db),
):
    post = await db.get(Post, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found.")

    comment = Comment(
        post_id=post_id,
        author_id=uuid.UUID(user_context.user_id),
        content=req.content,
        moderation_status=ModerationStatus.APPROVED,
    )
    db.add(comment)
    await db.commit()
    await db.refresh(comment)
    return {"status": "success", "comment_id": str(comment.id)}
