from fastapi import FastAPI, APIRouter, HTTPException, Request
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime
import requests
import asyncio
import json

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI(title="Cybersecurity Learning Plans API", version="1.0.0")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Define Models
class LearningPlanRequest(BaseModel):
    topic: str
    level: str
    duration_weeks: int = Field(default=8, ge=1, le=52)
    focus_areas: List[str] = Field(default_factory=list)
    include_labs: bool = Field(default=True)
    include_certifications: bool = Field(default=True)
    user_background: Optional[str] = Field(default="")

class LearningPlan(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    topic: str
    level: str
    duration_weeks: int
    focus_areas: List[str]
    curriculum: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    user_background: Optional[str] = Field(default="")

class LearningPlanResponse(BaseModel):
    success: bool
    plan_id: str
    curriculum: str
    topic: str
    level: str
    duration_weeks: int

# Ollama Configuration
OLLAMA_URL = "http://ai.nosnia.ai:11434"
OLLAMA_MODEL = "llama3.1"  # Best model for 64GB RAM

# Cybersecurity Topics Configuration
CYBERSECURITY_TOPICS = {
    "network-security": "Network Security and Infrastructure Protection",
    "ethical-hacking": "Ethical Hacking and Penetration Testing",
    "incident-response": "Incident Response and Digital Forensics",
    "threat-hunting": "Threat Hunting and Threat Intelligence",
    "malware-analysis": "Malware Analysis and Reverse Engineering",
    "cloud-security": "Cloud Security and DevSecOps",
    "application-security": "Application Security and Secure Coding",
    "compliance-governance": "Compliance, Governance, Risk Management",
    "cryptography": "Cryptography and PKI",
    "iot-security": "IoT and Embedded Systems Security",
    "social-engineering": "Social Engineering and Awareness",
    "blue-team": "Blue Team Operations and SOC",
    "red-team": "Red Team Operations and Advanced Tactics"
}

SKILL_LEVELS = {
    "beginner": "Beginner (No prior cybersecurity experience)",
    "intermediate": "Intermediate (Some IT/security background)",
    "advanced": "Advanced (Experienced security professional)",
    "expert": "Expert (Senior security specialist/consultant)"
}

FOCUS_AREAS = [
    "Hands-on Labs",
    "Certification Preparation",
    "Industry Tools & Software",
    "Compliance Frameworks",
    "Real-world Scenarios",
    "CTF Challenges",
    "Career Development",
    "Leadership Skills"
]

def create_comprehensive_prompt(request: LearningPlanRequest) -> str:
    """Create a comprehensive prompt for generating cybersecurity learning plans"""
    
    topic_description = CYBERSECURITY_TOPICS.get(request.topic, request.topic)
    level_description = SKILL_LEVELS.get(request.level, request.level)
    focus_areas_text = ", ".join(request.focus_areas) if request.focus_areas else "General comprehensive coverage"
    
    prompt = f"""
You are an expert cybersecurity instructor and curriculum designer. Create a comprehensive, structured learning plan for:

TOPIC: {topic_description}
SKILL LEVEL: {level_description}
DURATION: {request.duration_weeks} weeks
FOCUS AREAS: {focus_areas_text}
USER BACKGROUND: {request.user_background or "Not specified"}

Create a detailed learning plan with the following structure:

## 🎯 LEARNING OBJECTIVES
List 6-8 specific, measurable learning objectives that align with industry standards and real-world application.

## 📋 PREREQUISITES
- Required foundational knowledge
- Recommended prior experience
- Essential tools and software to install
- Hardware requirements (if any)

## 📅 WEEKLY CURRICULUM BREAKDOWN

### Week 1-2: Foundation & Fundamentals
- Core concepts and terminology
- Industry standards and frameworks
- Basic tools introduction
- Foundational theory

### Week 3-4: Core Concepts & Methodologies
- In-depth technical concepts
- Standard methodologies and approaches
- Tool mastery and configuration
- Best practices

### Week 5-6: Advanced Techniques & Applications
- Advanced topics and techniques
- Complex scenarios and case studies
- Integration with other security domains
- Emerging trends and threats

### Week 7-8: Practical Implementation & Mastery
- Capstone projects and assessments
- Real-world application scenarios
- Portfolio development
- Career preparation

## 🔬 HANDS-ON LABS & PRACTICAL EXERCISES
Provide detailed lab exercises with:
- Lab objectives and learning outcomes
- Required tools and environment setup
- Step-by-step procedures
- Expected results and deliverables
- Troubleshooting guides

Include at least 8-10 progressive labs covering:
1. Basic setup and configuration
2. Vulnerability identification
3. Exploitation techniques (ethical)
4. Defense and mitigation strategies
5. Monitoring and detection
6. Incident response procedures
7. Reporting and documentation
8. Advanced scenarios and challenges

## 📚 COMPREHENSIVE RESOURCE LIBRARY

### Books & Publications
- Essential textbooks (with ISBN when possible)
- Industry whitepapers and research
- Technical documentation
- Standards and compliance guides

### Online Courses & Training
- Recommended platforms (Coursera, Udemy, Cybrary, etc.)
- Specific course recommendations
- Free vs. paid options
- Estimated completion times

### Tools & Software
- Open-source tools with installation guides
- Commercial tools and alternatives
- Virtual lab environments
- Cloud-based platforms

### Community Resources
- Professional forums and communities
- Conferences and events
- Podcasts and webinars
- Social media groups and influencers

## 🏆 CERTIFICATION PATHWAYS
- Primary certifications aligned with this learning path
- Prerequisite requirements
- Exam preparation timeline
- Study materials and practice tests
- Costs and scheduling information
- Career advancement opportunities

## 📊 ASSESSMENT & EVALUATION METHODS
- Knowledge check quizzes (weekly)
- Practical skill assessments
- Portfolio projects
- Peer review exercises
- Self-assessment rubrics
- Final capstone project

## ⏱️ TIME ALLOCATION & STUDY SCHEDULE
- Hours per week breakdown
- Daily study recommendations
- Lab time requirements
- Review and practice sessions
- Flexibility for working professionals

## 🚀 CAREER DEVELOPMENT & NEXT STEPS
- Job roles this learning path prepares for
- Salary expectations and market demand
- Portfolio development guidance
- Interview preparation tips
- Networking opportunities
- Continuing education recommendations

## 🔄 CONTINUOUS LEARNING & UPDATES
- Industry trend monitoring
- Skill gap identification
- Advanced specialization paths
- Professional development planning
- Mentorship opportunities

## 💡 PRACTICAL TIPS FOR SUCCESS
- Study strategies and techniques
- Time management advice
- Motivation and goal setting
- Common pitfalls to avoid
- Building practical experience
- Creating a professional network

Please ensure all recommendations are current, practical, and aligned with industry best practices as of 2025. Focus on actionable content that learners can immediately apply.
"""
    
    return prompt

async def generate_with_ollama(prompt: str) -> str:
    """Generate content using Ollama API"""
    try:
        response = requests.post(
            f"{OLLAMA_URL}/api/generate",
            json={
                "model": OLLAMA_MODEL,
                "prompt": prompt,
                "stream": False,
                "options": {
                    "temperature": 0.7,
                    "top_p": 0.9,
                    "max_tokens": 8192
                }
            },
            timeout=300  # 5 minutes timeout for comprehensive generation
        )
        
        if response.status_code != 200:
            logger.error(f"Ollama API error: {response.status_code} - {response.text}")
            raise HTTPException(status_code=500, detail=f"Ollama generation failed: {response.text}")
        
        result = response.json()
        return result.get("response", "")
        
    except requests.exceptions.RequestException as e:
        logger.error(f"Ollama connection error: {str(e)}")
        raise HTTPException(status_code=503, detail=f"Could not connect to Ollama service: {str(e)}")
    except Exception as e:
        logger.error(f"Unexpected error during generation: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Generation error: {str(e)}")

# API Routes
@api_router.get("/")
async def root():
    return {"message": "Cybersecurity Learning Plans API", "version": "1.0.0"}

@api_router.get("/topics")
async def get_topics():
    """Get available cybersecurity topics"""
    return {
        "topics": CYBERSECURITY_TOPICS,
        "levels": SKILL_LEVELS,
        "focus_areas": FOCUS_AREAS
    }

@api_router.post("/generate-learning-plan", response_model=LearningPlanResponse)
async def generate_learning_plan(request: LearningPlanRequest):
    """Generate a comprehensive cybersecurity learning plan"""
    
    logger.info(f"Generating learning plan for topic: {request.topic}, level: {request.level}")
    
    # Validate topic
    if request.topic not in CYBERSECURITY_TOPICS:
        raise HTTPException(status_code=400, detail=f"Invalid topic. Available topics: {list(CYBERSECURITY_TOPICS.keys())}")
    
    # Validate level
    if request.level not in SKILL_LEVELS:
        raise HTTPException(status_code=400, detail=f"Invalid level. Available levels: {list(SKILL_LEVELS.keys())}")
    
    # Create comprehensive prompt
    prompt = create_comprehensive_prompt(request)
    
    # Generate content using Ollama
    curriculum = await generate_with_ollama(prompt)
    
    if not curriculum:
        raise HTTPException(status_code=500, detail="Failed to generate curriculum content")
    
    # Create learning plan object
    learning_plan = LearningPlan(
        topic=request.topic,
        level=request.level,
        duration_weeks=request.duration_weeks,
        focus_areas=request.focus_areas,
        curriculum=curriculum,
        user_background=request.user_background
    )
    
    # Save to database
    try:
        plan_dict = learning_plan.dict()
        await db.learning_plans.insert_one(plan_dict)
        logger.info(f"Learning plan saved with ID: {learning_plan.id}")
    except Exception as e:
        logger.error(f"Database error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to save learning plan")
    
    return LearningPlanResponse(
        success=True,
        plan_id=learning_plan.id,
        curriculum=curriculum,
        topic=request.topic,
        level=request.level,
        duration_weeks=request.duration_weeks
    )

@api_router.get("/learning-plans/{plan_id}")
async def get_learning_plan(plan_id: str):
    """Retrieve a specific learning plan"""
    try:
        plan = await db.learning_plans.find_one({"id": plan_id})
        if not plan:
            raise HTTPException(status_code=404, detail="Learning plan not found")
        
        # Remove MongoDB _id from response
        plan.pop("_id", None)
        return plan
        
    except Exception as e:
        logger.error(f"Error retrieving learning plan: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve learning plan")

@api_router.get("/learning-plans")
async def list_learning_plans(limit: int = 20, offset: int = 0):
    """List all learning plans with pagination"""
    try:
        cursor = db.learning_plans.find().sort("created_at", -1).skip(offset).limit(limit)
        plans = await cursor.to_list(length=limit)
        
        # Remove MongoDB _id from all plans
        for plan in plans:
            plan.pop("_id", None)
        
        total_count = await db.learning_plans.count_documents({})
        
        return {
            "plans": plans,
            "total": total_count,
            "limit": limit,
            "offset": offset
        }
        
    except Exception as e:
        logger.error(f"Error listing learning plans: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to list learning plans")

@api_router.delete("/learning-plans/{plan_id}")
async def delete_learning_plan(plan_id: str):
    """Delete a specific learning plan"""
    try:
        result = await db.learning_plans.delete_one({"id": plan_id})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Learning plan not found")
        
        return {"message": "Learning plan deleted successfully"}
        
    except Exception as e:
        logger.error(f"Error deleting learning plan: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to delete learning plan")

@api_router.get("/health")
async def health_check():
    """Health check endpoint"""
    try:
        # Test Ollama connection
        response = requests.get(f"{OLLAMA_URL}/api/tags", timeout=5)
        ollama_status = "healthy" if response.status_code == 200 else "unhealthy"
        
        # Test database connection
        await db.learning_plans.find_one()
        db_status = "healthy"
        
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        ollama_status = "unhealthy"
        db_status = "unhealthy"
    
    return {
        "status": "healthy" if ollama_status == "healthy" and db_status == "healthy" else "unhealthy",
        "ollama": ollama_status,
        "database": db_status,
        "model": OLLAMA_MODEL
    }

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()