import json
import re
import uuid
import logging

from fastapi import APIRouter, HTTPException

from emergentintegrations.llm.chat import LlmChat, UserMessage

from config import EMERGENT_LLM_KEY
from models import (
    RecommendRequest, RecommendResponse, RecommendedBook,
    CoverRequest, CoverResponse,
)
from catalog import CATALOG

router = APIRouter()
logger = logging.getLogger("sagadrop")


@router.post("/ai/recommend", response_model=RecommendResponse)
async def ai_recommend(req: RecommendRequest):
    if not EMERGENT_LLM_KEY:
        raise HTTPException(500, "AI key not configured")

    mood = req.mood.strip()
    tone = (req.tone or "").strip()

    catalog_snippet = "\n".join(
        f"- {b.title} by {b.author} [{b.category}] (id: {b.id})"
        for b in CATALOG
    )

    system = (
        "You are the SagaDrop AI Librarian. Recommend 4 books from the provided "
        "catalog that match the reader's mood. Reply as strict JSON with keys: "
        "summary (1-2 sentence editorial pitch), picks (array of 4 objects with "
        "title, author, reason (1 sentence), match_book_id from the catalog). "
        "No prose outside the JSON."
    )

    user_text = (
        f"Mood: {mood}\n"
        f"Extra vibe: {tone or 'n/a'}\n\n"
        f"Catalog:\n{catalog_snippet}"
    )

    try:
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"rec-{uuid.uuid4()}",
            system_message=system,
        ).with_model("anthropic", "claude-sonnet-4-5-20250929")

        raw = await chat.send_message(UserMessage(text=user_text))
    except Exception as e:
        logger.exception("Claude call failed")
        raise HTTPException(502, f"AI service error: {e}")

    text = raw if isinstance(raw, str) else str(raw)
    m = re.search(r"\{[\s\S]*\}", text)
    if not m:
        raise HTTPException(502, "AI returned invalid response")
    try:
        parsed = json.loads(m.group(0))
        picks_data = parsed.get("picks", [])[:4]
        picks = [
            RecommendedBook(
                title=p.get("title", ""),
                author=p.get("author", ""),
                reason=p.get("reason", ""),
                match_book_id=p.get("match_book_id"),
            )
            for p in picks_data
        ]
        return RecommendResponse(
            mood=mood,
            summary=parsed.get("summary", ""),
            picks=picks,
        )
    except Exception as e:
        raise HTTPException(502, f"AI parse error: {e}")


@router.post("/ai/generate-cover", response_model=CoverResponse)
async def ai_generate_cover(req: CoverRequest):
    if not EMERGENT_LLM_KEY:
        raise HTTPException(500, "AI key not configured")

    prompt = (
        f"Design a premium {req.material} book cover for the title "
        f"'{req.title}'"
        + (f" by {req.author}" if req.author else "")
        + f". Style: {req.style}. Include the title in large elegant serif "
        f"typography with {req.foil} foil accents. Cover only, portrait "
        f"orientation, dramatic cinematic lighting, high detail, luxury "
        f"editorial finish. No borders, no watermarks."
    )

    try:
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"cover-{uuid.uuid4()}",
            system_message="You are an award-winning book cover designer.",
        ).with_model("gemini", "gemini-3.1-flash-image-preview").with_params(
            modalities=["image", "text"]
        )

        _text, images = await chat.send_message_multimodal_response(
            UserMessage(text=prompt)
        )
    except Exception as e:
        logger.exception("Nano Banana call failed")
        raise HTTPException(502, f"Cover generation error: {e}")

    if not images:
        raise HTTPException(502, "No image returned")
    img = images[0]
    return CoverResponse(mime_type=img["mime_type"], data=img["data"])
