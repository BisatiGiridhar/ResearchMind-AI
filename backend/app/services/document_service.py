import io
from typing import Dict, Any, List

class DocumentService:
    """
    Service for parsing uploaded PDF, DOCX, TXT, and Markdown files and chunking text.
    """

    @staticmethod
    def parse_document(contents: bytes, filename: str) -> Dict[str, Any]:
        ext = filename.split(".")[-1].lower() if "." in filename else "txt"
        extracted_text = ""

        if ext == "pdf":
            try:
                import PyPDF2
                reader = PyPDF2.PdfReader(io.BytesIO(contents))
                pages_text = [page.extract_text() or "" for page in reader.pages]
                extracted_text = "\n".join(pages_text)
            except Exception as e:
                extracted_text = f"PDF Text extraction error: {e}"

        elif ext == "docx":
            try:
                import docx
                doc = docx.Document(io.BytesIO(contents))
                extracted_text = "\n".join([p.text for p in doc.paragraphs if p.text])
            except Exception as e:
                extracted_text = f"DOCX Text extraction error: {e}"

        else:
            # Plain Text or Markdown
            try:
                extracted_text = contents.decode("utf-8")
            except Exception:
                extracted_text = contents.decode("latin-1", errors="ignore")

        # Basic chunking by 1000 characters
        chunks = [extracted_text[i:i+1000] for i in range(0, len(extracted_text), 1000)]

        return {
            "filename": filename,
            "file_type": ext,
            "content_text": extracted_text[:5000],  # Store first 5k chars for summary
            "chunk_count": max(len(chunks), 1)
        }
