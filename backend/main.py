import asyncio
import os
import logging
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import google.generativeai as genai
from dotenv import load_dotenv
from pydantic import BaseModel

# --- 1. Configure Logging ---
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

logger.info("Starting Shiksha Sahayak Backend...")

# --- 2. Load Environment Variables ---
load_dotenv()
logger.info("Environment variables loaded.")

# --- 3. FastAPI App Initialization ---
app = FastAPI(title="Shiksha Sahayak Backend")

# --- 4. Secure CORS Middleware ---
frontend_url = os.environ.get(f"CODESPACE_NAME", "")
if frontend_url:
    # Construct the full URL for the Vite frontend port
    allowed_origin = f"https://{frontend_url}-5173.app.github.dev"
    logger.info(f"CORS: Allowing specific origin for Codespaces: {allowed_origin}")
else:
    # Fallback for local development
    allowed_origin = "http://localhost:5173"
    logger.info(f"CORS: Allowing fallback origin for local development: {allowed_origin}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[allowed_origin],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 5. AI Model Configuration ---
is_ai_configured = False
try:
    api_key = os.environ.get('GOOGLE_API_KEY')
    if not api_key:
        logger.warning("GOOGLE_API_KEY not found in environment variables.")
        raise ValueError("API Key is not set.")
    
    genai.configure(api_key=api_key)
    vision_model = genai.GenerativeModel("gemini-2.5-pro")
    text_model = genai.GenerativeModel("gemini-2.5-flash")
    is_ai_configured = True
    logger.info("AI Models configured successfully.")
except Exception as e:
    logger.error(f"FATAL: AI Model configuration failed: {e}")

# --- Pydantic Models ---
class ContentRequest(BaseModel):
    language: str
    grade_level: str
    subject: str
    extracted_text: str

# --- API Endpoints ---
@app.post("/api/v1/extract-text-from-image")
async def extract_text(file: UploadFile = File(...)):
    logger.info(f"Received request to extract text from file: {file.filename}")
    if not is_ai_configured:
        logger.error("Text extraction failed: AI model not configured.")
        raise HTTPException(status_code=500, detail="AI Model not configured.")
    try:
        image_contents = await file.read()
        image_part = {"mime_type": file.content_type, "data": image_contents}
        prompt = "You are an OCR expert. Extract all readable text from this image. Present it cleanly and accurately."
        response = await vision_model.generate_content_async([prompt, image_part])
        logger.info("Successfully extracted text from image.")
        return {"success": True, "extracted_text": response.text}
    except Exception as e:
        logger.error(f"Error during text extraction: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/generate-content-from-text")
async def generate_content(request: ContentRequest):
    logger.info(f"Received request to generate content in {request.language} for {request.grade_level} {request.subject}.")
    if not is_ai_configured:
        logger.error("Content generation failed: AI model not configured.")
        raise HTTPException(status_code=500, detail="AI Model not configured.")
    try:
        async def gen_task(prompt):
            response = await text_model.generate_content_async(prompt)
            return response.text

        lesson_prompt = f"Generate a lesson plan for a {request.grade_level} {request.subject} class in {request.language}. Topic: '{request.extracted_text}'. Format with Markdown."
        worksheet_prompt = f"Generate a worksheet for a {request.grade_level} {request.subject} class in {request.language}. Topic: '{request.extracted_text}'. Format with Markdown."
        quiz_prompt = f"Generate a 5-question quiz with answers for a {request.grade_level} {request.subject} class in {request.language}. Topic: '{request.extracted_text}'. Format with Markdown."
        
        results = await asyncio.gather(gen_task(lesson_prompt), gen_task(worksheet_prompt), gen_task(quiz_prompt))
        logger.info("Successfully generated all content.")
        return {"success": True, "lesson_plan": results[0], "worksheet": results[1], "quiz": results[2]}
    except Exception as e:
        logger.error(f"Error during content generation: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# --- Server Startup ---
if __name__ == "__main__":
    import uvicorn
    logger.info("Starting Uvicorn server...")
    uvicorn.run(app, host="0.0.0.0", port=8000)