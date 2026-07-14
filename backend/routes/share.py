import base64
import html as html_lib
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import HTMLResponse, Response
from pymongo import ReturnDocument

from models import ShareRequest, ShareInfo
from database import db

router = APIRouter()

ALLOWED_MIMES = {"image/png", "image/jpeg", "image/webp"}
MAX_COVER_BYTES = 5 * 1024 * 1024  # 5MB


def _public_base(request: Request) -> str:
    proto = request.headers.get("x-forwarded-proto", request.url.scheme)
    host = request.headers.get(
        "x-forwarded-host", request.headers.get("host", request.url.netloc)
    )
    return f"{proto}://{host}"


@router.post("/share")
async def create_share(req: ShareRequest, request: Request):
    if db is None:
        raise HTTPException(503, "Database not configured")
    if req.mime_type not in ALLOWED_MIMES:
        raise HTTPException(400, "Unsupported image type. Use PNG, JPEG or WebP.")
    try:
        raw = base64.b64decode(req.cover_data, validate=True)
    except Exception:
        raise HTTPException(400, "Invalid base64 cover data")
    if len(raw) > MAX_COVER_BYTES:
        raise HTTPException(413, "Cover image too large (max 5MB)")

    sid = uuid.uuid4().hex[:10]
    doc = {
        "id": sid,
        "title": req.title,
        "author": req.author,
        "material": req.material,
        "foil": req.foil,
        "size": req.size,
        "paper": req.paper,
        "finish": req.finish,
        "edge_stain": req.edge_stain,
        "mime_type": req.mime_type,
        "cover_data": req.cover_data,
        "views": 0,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.shared_books.insert_one(doc)
    base = _public_base(request)
    return {
        "id": sid,
        "share_url": f"{base}/api/share/{sid}/page",
        "app_url": f"{base}/share/{sid}",
    }


@router.get("/share/{sid}", response_model=ShareInfo)
async def get_share(sid: str, request: Request):
    if db is None:
        raise HTTPException(503, "Database not configured")
    doc = await db.shared_books.find_one_and_update(
        {"id": sid},
        {"$inc": {"views": 1}},
        return_document=ReturnDocument.AFTER,
    )
    if not doc:
        raise HTTPException(status_code=404, detail="Shared book not found")
    base = _public_base(request)
    return ShareInfo(
        id=doc["id"],
        title=doc["title"],
        author=doc.get("author"),
        material=doc.get("material"),
        foil=doc.get("foil"),
        size=doc.get("size"),
        paper=doc.get("paper"),
        finish=doc.get("finish"),
        edge_stain=doc.get("edge_stain"),
        created_at=doc["created_at"],
        views=doc["views"],
        cover_url=f"{base}/api/share/{sid}/cover",
    )


@router.get("/share/{sid}/cover")
async def get_share_cover(sid: str):
    if db is None:
        raise HTTPException(503, "Database not configured")
    doc = await db.shared_books.find_one({"id": sid})
    if not doc:
        raise HTTPException(status_code=404, detail="Shared book not found")
    return Response(
        content=base64.b64decode(doc["cover_data"]),
        media_type=doc["mime_type"],
        headers={"Cache-Control": "public, max-age=31536000"},
    )


@router.get("/share/{sid}/page")
async def get_share_page(sid: str, request: Request):
    if db is None:
        raise HTTPException(503, "Database not configured")
    doc = await db.shared_books.find_one({"id": sid})
    if not doc:
        raise HTTPException(status_code=404, detail="Shared book not found")
    base = _public_base(request)
    title = html_lib.escape(doc["title"])
    author = html_lib.escape(doc.get("author") or "")
    material = html_lib.escape(doc.get("material") or "Hardcover")
    cover_url = f"{base}/api/share/{sid}/cover"
    app_url = f"{base}/share/{sid}"
    desc = f"A bespoke {material} edition{' by ' + author if author else ''}, created on SagaDrop."
    page = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>{title} — SagaDrop Custom Edition</title>
<meta property="og:type" content="website">
<meta property="og:site_name" content="SagaDrop">
<meta property="og:title" content="{title} — Custom {material} Edition">
<meta property="og:description" content="{desc}">
<meta property="og:image" content="{cover_url}">
<meta property="og:url" content="{app_url}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{title} — Custom {material} Edition">
<meta name="twitter:description" content="{desc}">
<meta name="twitter:image" content="{cover_url}">
<meta http-equiv="refresh" content="0;url={app_url}">
</head>
<body>
<script>window.location.replace("{app_url}");</script>
<p>Redirecting to <a href="{app_url}">SagaDrop</a>…</p>
</body>
</html>"""
    return HTMLResponse(page)
