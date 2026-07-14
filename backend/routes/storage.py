from fastapi import APIRouter, UploadFile, File, HTTPException
from services.storage_service import save_upload

router = APIRouter(prefix="/storage", tags=["storage"])


@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    if not file.filename:
        raise HTTPException(400, "No file provided")
    contents = await file.read()
    if len(contents) > 5 * 1024 * 1024:
        raise HTTPException(400, "File too large — max 5 MB")
    filename = save_upload(contents, file.filename)
    return {"url": f"/uploads/{filename}", "filename": filename}
