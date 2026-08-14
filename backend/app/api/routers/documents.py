from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.database.session import get_db
from app.database.models import User, Document
from app.schemas.schemas import DocumentSchema
from app.api.deps import get_current_user
from app.services.document_service import DocumentService

router = APIRouter(prefix="/documents", tags=["Documents"])

@router.post("/upload", response_model=DocumentSchema, status_code=status.HTTP_201_CREATED)
async def upload_document(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if not file.filename:
        raise HTTPException(status_code=400, detail="Filename missing.")

    contents = await file.read()
    if len(contents) > 25 * 1024 * 1024:  # 25 MB limit
        raise HTTPException(status_code=400, detail="File size exceeds maximum permitted limit of 25MB.")

    try:
        parsed_doc = DocumentService.parse_document(contents, file.filename)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse document: {str(e)}")

    doc_obj = Document(
        user_id=current_user.id,
        filename=parsed_doc["filename"],
        file_type=parsed_doc["file_type"],
        content_text=parsed_doc["content_text"],
        chunk_count=parsed_doc["chunk_count"]
    )
    db.add(doc_obj)
    await db.commit()
    await db.refresh(doc_obj)

    return doc_obj

@router.get("", response_model=list[DocumentSchema])
async def list_documents(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Document).where(Document.user_id == current_user.id))
    return result.scalars().all()
