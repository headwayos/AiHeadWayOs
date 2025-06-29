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

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# For testing purposes, we'll use an in-memory database
MOCK_DB = True  # Set to False in production

# In-memory database for testing
in_memory_db = {
    "learning_plans": [],
    "assessments": [],
    "assessment_results": [],
    "learning_sessions": [],
    "chat_messages": [],
    "user_progress": [],
    "achievements": []
}

class MockCollection:
    def __init__(self, collection_name):
        self.collection_name = collection_name
        
    async def find_one(self, query=None):
        if query is None:
            return None
            
        collection_data = in_memory_db.get(self.collection_name, [])
        for item in collection_data:
            if query.get("id") and item.get("id") == query.get("id"):
                return item
            # Support other query fields
            match = True
            for key, value in query.items():
                if key in item and item[key] != value:
                    match = False
                    break
            if match:
                return item
        return None
        
    async def insert_one(self, document):
        if self.collection_name in in_memory_db:
            in_memory_db[self.collection_name].append(document)
            
    async def delete_one(self, query):
        if self.collection_name in in_memory_db:
            collection_data = in_memory_db[self.collection_name]
            for i, item in enumerate(collection_data):
                match = True
                for key, value in query.items():
                    if key in item and item[key] != value:
                        match = False
                        break
                if match:
                    del collection_data[i]
                    return type('obj', (object,), {'deleted_count': 1})
            return type('obj', (object,), {'deleted_count': 0})
            
    def find(self):
        # This is not an async method, it returns self
        return self
            
    def sort(self, field, direction):
        # This is not an async method, it returns self
        return self
            
    def skip(self, n):
        # This is not an async method, it returns self
        return self
            
    def limit(self, n):
        # This is not an async method, it returns self
        return self
            
    async def to_list(self, length):
        # This is an async method that returns the actual list
        collection_data = in_memory_db.get(self.collection_name, [])
        return collection_data
            
    async def count_documents(self, query):
        collection_data = in_memory_db.get(self.collection_name, [])
        if not query:
            return len(collection_data)
        
        count = 0
        for item in collection_data:
            match = True
            for key, value in query.items():
                if key in item and item[key] != value:
                    match = False
                    break
            if match:
                count += 1
        return count

class MockDB:
    def __init__(self):
        self.learning_plans = MockCollection("learning_plans")
        self.assessments = MockCollection("assessments")
        self.assessment_results = MockCollection("assessment_results")
        self.learning_sessions = MockCollection("learning_sessions")
        self.chat_messages = MockCollection("chat_messages")
        self.user_progress = MockCollection("user_progress")
        self.achievements = MockCollection("achievements")
        
    def __getitem__(self, collection_name):
        if hasattr(self, collection_name):
            return getattr(self, collection_name)
        return MockCollection(collection_name)

if MOCK_DB:
    # Use in-memory database
    db = MockDB()
else:
    # MongoDB connection
    mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
    db_name = os.environ.get('DB_NAME', 'cybersecurity_learning_plans')
    try:
        client = AsyncIOMotorClient(mongo_url)
        db = client[db_name]
    except Exception as e:
        logger.error(f"Failed to connect to MongoDB: {str(e)}")
        # Fallback to in-memory database
        MOCK_DB = True
        db = MockDB()

# Create the main app without a prefix
app = FastAPI(title="Cybersecurity Learning Plans API", version="1.0.0")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Define Models

# Assessment Models
class AssessmentQuestion(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    question_type: str  # 'mcq', 'practical', 'coding', 'fill_blank'
    question_text: str
    options: Optional[List[str]] = None  # For MCQ
    correct_answer: str
    explanation: Optional[str] = None
    difficulty: str  # 'beginner', 'intermediate', 'advanced'
    points: int = Field(default=10)

class Assessment(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    topic: str
    level: str
    questions: List[AssessmentQuestion]
    total_points: int
    created_at: datetime = Field(default_factory=datetime.utcnow)

class AssessmentResponse(BaseModel):
    question_id: str
    answer: str
    time_spent: int  # seconds

class AssessmentSubmission(BaseModel):
    assessment_id: str
    responses: List[AssessmentResponse]
    career_goal: str  # 'student', 'professional', 'career_switcher', 'faang_prep', 'startup_job'
    current_role: Optional[str] = None
    experience_years: Optional[int] = None

class AssessmentResult(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    assessment_id: str
    user_id: str = Field(default="anonymous")  # For future user management
    submission: AssessmentSubmission
    score: int
    total_points: int
    percentage: float
    skill_level: str
    recommendations: List[str]
    created_at: datetime = Field(default_factory=datetime.utcnow)

# Learning Plan Models
class LearningPlanRequest(BaseModel):
    topic: str
    level: str
    duration_weeks: int = Field(default=8, ge=1, le=52)
    focus_areas: List[str] = Field(default_factory=list)
    include_labs: bool = Field(default=True)
    include_certifications: bool = Field(default=True)
    user_background: Optional[str] = Field(default="")
    assessment_result_id: Optional[str] = None  # Link to assessment result for personalization

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
    assessment_result_id: Optional[str] = None
    approved: bool = Field(default=False)
    personalization_notes: Optional[str] = None

class LearningPlanResponse(BaseModel):
    success: bool
    plan_id: str
    curriculum: str
    topic: str
    level: str
    duration_weeks: int

# Learning Session Models
class LearningSession(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    plan_id: str
    user_id: str = Field(default="anonymous")
    current_module: str
    progress_percentage: float = 0.0
    time_spent: int = 0  # minutes
    questions_asked: int = 0
    ai_interactions: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class ChatMessage(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    session_id: str
    sender: str  # 'user' or 'ai'
    message: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    message_type: str = Field(default="text")  # 'text', 'code', 'question', 'explanation'

# Progress Tracking Models
class Achievement(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    icon: str
    category: str  # 'assessment', 'learning', 'progress', 'interaction'
    points: int

class UserProgress(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str = Field(default="anonymous")
    total_points: int = 0
    achievements: List[str] = Field(default_factory=list)  # Achievement IDs
    skill_levels: Dict[str, str] = Field(default_factory=dict)  # topic -> level
    learning_streak: int = 0
    total_time_spent: int = 0  # minutes
    assessments_completed: int = 0
    plans_completed: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

# Ollama Configuration - Try multiple possible host addresses
# Since we're in a Kubernetes environment, we need to find the right host address
# We'll try multiple common Docker host IP addresses in sequence
OLLAMA_HOSTS = [
    "http://host.docker.internal:11434",  # Docker Desktop for Mac/Windows
    "http://172.17.0.1:11434",           # Common Docker bridge network gateway
    "http://172.18.0.1:11434",           # Alternative Docker bridge network
    "http://192.168.65.2:11434",         # Docker Desktop for Mac
    "http://10.0.75.1:11434",            # Docker Desktop for Windows
    "http://localhost:11434"             # Local machine (unlikely to work in container)
]
OLLAMA_URL = OLLAMA_HOSTS[0]  # Default to first option
OLLAMA_MODEL = "llama3:70b"  # Best model for 64GB RAM

def get_working_ollama_host():
    """Try to find a working Ollama host from the list of possible hosts"""
    for host in OLLAMA_HOSTS:
        try:
            response = requests.get(f"{host}/api/tags", timeout=2)
            if response.status_code == 200:
                return host
        except:
            continue
    return OLLAMA_HOSTS[0]  # Default to first option if none work

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

CAREER_GOALS = {
    "student": "Student - Learning cybersecurity fundamentals",
    "professional": "Professional - Advancing current cybersecurity career",
    "career_switcher": "Career Switcher - Transitioning to cybersecurity",
    "faang_prep": "FAANG Preparation - Targeting top tech companies",
    "maang_prep": "MAANG Preparation - Targeting major tech companies", 
    "startup_job": "Startup Job - Looking for cybersecurity roles in startups",
    "freelance": "Freelance - Building independent cybersecurity consulting skills",
    "government": "Government - Preparing for public sector cybersecurity roles"
}

QUESTION_TYPES = {
    "mcq": "Multiple Choice Question",
    "practical": "Practical Scenario",
    "coding": "Coding Challenge",
    "fill_blank": "Fill in the Blanks"
}

# Default achievements
DEFAULT_ACHIEVEMENTS = [
    {
        "id": "first_assessment",
        "name": "First Steps",
        "description": "Completed your first cybersecurity assessment",
        "icon": "🎯",
        "category": "assessment",
        "points": 50
    },
    {
        "id": "plan_approved",
        "name": "Plan Maker",
        "description": "Approved your first personalized learning plan",
        "icon": "📋",
        "category": "learning",
        "points": 100
    },
    {
        "id": "first_session",
        "name": "Learning Journey",
        "description": "Started your first learning session",
        "icon": "🚀",
        "category": "learning",
        "points": 75
    },
    {
        "id": "ai_helper",
        "name": "AI Companion",
        "description": "Had your first conversation with AI tutor",
        "icon": "🤖",
        "category": "interaction",
        "points": 25
    },
    {
        "id": "progress_tracker",
        "name": "Progress Champion",
        "description": "Completed 25% of your learning plan",
        "icon": "📈",
        "category": "progress",
        "points": 200
    }
]

def create_assessment_prompt(topic: str, level: str, career_goal: str) -> str:
    """Create a prompt for generating cybersecurity assessment questions"""
    
    topic_description = CYBERSECURITY_TOPICS.get(topic, topic)
    level_description = SKILL_LEVELS.get(level, level)
    career_description = CAREER_GOALS.get(career_goal, career_goal)
    
    prompt = f"""
You are an expert cybersecurity instructor creating an assessment to evaluate a learner's current knowledge and skills.

ASSESSMENT REQUIREMENTS:
- TOPIC: {topic_description}
- SKILL LEVEL: {level_description}  
- CAREER GOAL: {career_description}
- GENERATE: 5-6 diverse questions covering different aspects

Create an assessment with the following structure. Return ONLY valid JSON format:

{{
    "questions": [
        {{
            "id": "unique_id_1",
            "question_type": "mcq",
            "question_text": "Question text here",
            "options": ["Option A", "Option B", "Option C", "Option D"],
            "correct_answer": "Option A",
            "explanation": "Brief explanation of why this is correct",
            "difficulty": "beginner|intermediate|advanced",  
            "points": 10
        }},
        {{
            "id": "unique_id_2", 
            "question_type": "practical",
            "question_text": "Describe a practical scenario question",
            "options": null,
            "correct_answer": "Expected answer or approach",
            "explanation": "What makes a good answer to this practical question",
            "difficulty": "beginner|intermediate|advanced",
            "points": 15
        }},
        {{
            "id": "unique_id_3",
            "question_type": "fill_blank", 
            "question_text": "A firewall is a _____ security device that monitors and _____ network traffic based on predetermined security _____.",
            "options": ["network", "controls", "filters"],
            "correct_answer": "network, controls, filters",
            "explanation": "Firewalls are network security devices that filter traffic using security rules",
            "difficulty": "beginner|intermediate|advanced",
            "points": 10
        }},
        {{
            "id": "unique_id_4",
            "question_type": "coding",
            "question_text": "Write a simple Python script to check if a password meets basic security requirements (8+ chars, uppercase, lowercase, number)",
            "options": null,
            "correct_answer": "Sample solution with regex or character checks",
            "explanation": "Good password validation should check multiple criteria",
            "difficulty": "intermediate",
            "points": 20
        }}
    ]
}}

QUESTION TYPE GUIDELINES:
- MCQ: Test theoretical knowledge and concepts
- Practical: Real-world scenarios and problem-solving
- Fill_blank: Key terminology and definitions  
- Coding: Technical implementation skills (when appropriate for topic)

Make questions relevant to {career_description} and appropriate for {level_description} level.
Ensure questions test different aspects: theory, application, analysis, and synthesis.
Include questions that help assess their background (student, professional experience, specific interests).
"""
    
    return prompt

async def generate_assessment_with_ollama(prompt: str) -> str:
    """Generate assessment using Ollama API or mock implementation"""
    if MOCK_OLLAMA:
        # Mock implementation for testing - return sample assessment
        logger.info("Using mock implementation for assessment generation")
        
        # Generate a mock assessment based on the prompt
        topic = "network-security"  # default
        level = "beginner"  # default
        
        # Extract topic and level from prompt if possible
        if "TOPIC:" in prompt:
            topic_line = prompt.split("TOPIC:")[1].split("\n")[0].strip()
            # Find matching topic key
            for key, value in CYBERSECURITY_TOPICS.items():
                if value in topic_line:
                    topic = key
                    break
        
        if "SKILL LEVEL:" in prompt:
            level_line = prompt.split("SKILL LEVEL:")[1].split("\n")[0].strip()
            for key, value in SKILL_LEVELS.items():
                if value in level_line:
                    level = key
                    break
        
        # Generate mock assessment
        mock_assessment = {
            "questions": [
                {
                    "id": str(uuid.uuid4()),
                    "question_type": "mcq",
                    "question_text": f"What is the primary purpose of a firewall in {topic.replace('-', ' ')} infrastructure?",
                    "options": [
                        "To block all network traffic",
                        "To monitor and control network traffic based on security rules", 
                        "To encrypt all data transmissions",
                        "To provide user authentication"
                    ],
                    "correct_answer": "To monitor and control network traffic based on security rules",
                    "explanation": "Firewalls are network security devices that monitor incoming and outgoing network traffic and permit or block data packets based on a set of security rules.",
                    "difficulty": level,
                    "points": 10
                },
                {
                    "id": str(uuid.uuid4()),
                    "question_type": "practical", 
                    "question_text": "You notice unusual network traffic patterns in your organization. Describe the first three steps you would take to investigate this potential security incident.",
                    "options": None,
                    "correct_answer": "1. Document the observation with timestamps 2. Check network monitoring tools and logs 3. Isolate affected systems if necessary and notify incident response team",
                    "explanation": "Proper incident response involves documentation, investigation using available tools, and following established procedures to contain potential threats.",
                    "difficulty": level,
                    "points": 15
                },
                {
                    "id": str(uuid.uuid4()),
                    "question_type": "fill_blank",
                    "question_text": "The CIA triad in cybersecurity stands for _____, _____, and _____.",
                    "options": ["Confidentiality", "Integrity", "Availability"],
                    "correct_answer": "Confidentiality, Integrity, Availability", 
                    "explanation": "The CIA triad is a fundamental security model that ensures data confidentiality, integrity, and availability.",
                    "difficulty": level,
                    "points": 10
                },
                {
                    "id": str(uuid.uuid4()),
                    "question_type": "mcq",
                    "question_text": "Which of the following is NOT a common type of social engineering attack?",
                    "options": [
                        "Phishing",
                        "Pretexting", 
                        "DDoS Attack",
                        "Baiting"
                    ],
                    "correct_answer": "DDoS Attack",
                    "explanation": "DDoS (Distributed Denial of Service) is a technical attack, not a social engineering attack which manipulates people rather than technology.",
                    "difficulty": level,
                    "points": 10
                },
                {
                    "id": str(uuid.uuid4()),
                    "question_type": "practical",
                    "question_text": "What career path interests you most in cybersecurity, and what specific skills do you want to develop? (This helps us personalize your learning plan)",
                    "options": None,
                    "correct_answer": "Personal response about career interests and skill goals",
                    "explanation": "Understanding your career goals helps create a more targeted and relevant learning experience tailored to your specific objectives.",
                    "difficulty": level,
                    "points": 5
                }
            ]
        }
        
        # Simulate a delay to mimic the generation process
        await asyncio.sleep(2)
        
        return json.dumps(mock_assessment)
    else:
        # Real implementation using Ollama API
        try:
            working_host = get_working_ollama_host()
            global OLLAMA_URL
            if working_host:
                OLLAMA_URL = working_host
            
            response = requests.post(
                f"{OLLAMA_URL}/api/generate",
                json={
                    "model": OLLAMA_MODEL,
                    "prompt": prompt,
                    "stream": False,
                    "options": {
                        "temperature": 0.7,
                        "top_p": 0.9,
                        "max_tokens": 4096
                    }
                },
                timeout=180  # 3 minutes timeout
            )
            
            if response.status_code != 200:
                logger.error(f"Ollama API error: {response.status_code} - {response.text}")
                raise HTTPException(status_code=500, detail=f"Assessment generation failed: {response.text}")
            
            result = response.json()
            return result.get("response", "")
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Ollama connection error: {str(e)}")
            raise HTTPException(status_code=503, detail=f"Could not connect to Ollama service: {str(e)}")
        except Exception as e:
            logger.error(f"Unexpected error during assessment generation: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Assessment generation error: {str(e)}")

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


# For testing purposes, we'll use a mock implementation of the Ollama API
# This will allow us to test the API without actually connecting to Ollama
# In a real production environment, we would need to properly configure the connection to Ollama
MOCK_OLLAMA = True  # Set to False in production

async def generate_with_ollama(prompt: str) -> str:
    """Generate content using Ollama API or a mock implementation for testing"""
    if MOCK_OLLAMA:
        # Mock implementation for testing
        logger.info("Using mock implementation of Ollama API")
        
        # Generate a mock curriculum based on the prompt
        topic = "Unknown Topic"
        level = "Unknown Level"
        duration = "Unknown Duration"
        
        # Extract topic, level, and duration from the prompt
        if "TOPIC:" in prompt:
            topic_line = prompt.split("TOPIC:")[1].split("\n")[0].strip()
            topic = topic_line
        
        if "SKILL LEVEL:" in prompt:
            level_line = prompt.split("SKILL LEVEL:")[1].split("\n")[0].strip()
            level = level_line
        
        if "DURATION:" in prompt:
            duration_line = prompt.split("DURATION:")[1].split("\n")[0].strip()
            duration = duration_line
        
        # Generate a mock curriculum
        mock_curriculum = f"""
## 🎯 LEARNING OBJECTIVES
- Understand fundamental concepts of {topic}
- Learn key terminology and frameworks
- Develop practical skills in implementing security controls
- Gain hands-on experience with security tools
- Prepare for relevant certifications
- Build a portfolio of security projects
- Develop incident response capabilities
- Understand compliance and regulatory requirements

## 📋 PREREQUISITES
- Basic understanding of computer networks
- Familiarity with operating systems (Windows, Linux)
- Basic command-line skills
- Understanding of TCP/IP protocols
- Basic programming knowledge (optional but helpful)
- Virtual machine software (VirtualBox or VMware)
- Minimum 8GB RAM, 100GB free disk space
- Reliable internet connection

## 📅 WEEKLY CURRICULUM BREAKDOWN

### Week 1-2: Foundation & Fundamentals
- Introduction to {topic} concepts
- Security principles and CIA triad
- Network fundamentals and protocols
- Basic security controls and mechanisms
- Introduction to security tools
- Risk assessment fundamentals
- Security policies and procedures
- Lab: Setting up a secure network environment

### Week 3-4: Core Concepts & Methodologies
- Advanced {topic} techniques
- Vulnerability assessment methodologies
- Security monitoring and logging
- Incident response procedures
- Security architecture principles
- Defense-in-depth strategies
- Threat modeling techniques
- Lab: Conducting a vulnerability assessment

## 🔬 HANDS-ON LABS & PRACTICAL EXERCISES
1. Setting up a secure network environment
   - Configure firewalls and access controls
   - Implement network segmentation
   - Configure secure remote access

2. Vulnerability scanning and assessment
   - Use tools like Nessus, OpenVAS
   - Identify and prioritize vulnerabilities
   - Document findings and recommendations

3. Security monitoring and logging
   - Configure SIEM solutions
   - Set up log collection and analysis
   - Create security dashboards and alerts

4. Incident response simulation
   - Detect and analyze security incidents
   - Follow incident response procedures
   - Document and report findings

## 📚 COMPREHENSIVE RESOURCE LIBRARY

### Books & Publications
- "Network Security Essentials" by William Stallings
- "Practical Network Security" by Nina Godbole
- NIST Special Publications 800 series
- SANS Reading Room articles

### Online Courses & Training
- Cybrary Network Security Fundamentals
- Coursera Network Security courses
- Udemy Practical Network Security
- edX Introduction to Network Security

### Tools & Software
- Wireshark for network analysis
- Nmap for network scanning
- Snort for intrusion detection
- pfSense for firewall implementation

### Community Resources
- SANS Internet Storm Center
- Krebs on Security blog
- r/netsec subreddit
- Network Security Podcast

## 🏆 CERTIFICATION PATHWAYS
- CompTIA Security+
- Cisco CCNA Security
- EC-Council Network Security Administrator
- GIAC GSEC (Security Essentials)

## 📊 ASSESSMENT & EVALUATION METHODS
- Weekly knowledge check quizzes
- Hands-on lab assessments
- Security implementation projects
- Certification practice exams
- Final capstone project

## ⏱️ TIME ALLOCATION & STUDY SCHEDULE
- 10-15 hours per week recommended
- 60% hands-on practice
- 30% theory and concepts
- 10% review and assessment
- Weekend intensive sessions recommended

## 🚀 CAREER DEVELOPMENT & NEXT STEPS
- Security Analyst positions
- Network Security Engineer roles
- SOC Analyst opportunities
- Continuing education in specialized areas

## 🔄 CONTINUOUS LEARNING & UPDATES
- Subscribe to security newsletters
- Join professional organizations
- Participate in CTF competitions
- Attend security conferences

## 💡 PRACTICAL TIPS FOR SUCCESS
- Build a home lab for practice
- Focus on hands-on skills
- Document all your projects
- Network with security professionals
- Stay current with security news
"""
        
        # Simulate a delay to mimic the generation process
        await asyncio.sleep(2)
        
        return mock_curriculum
    else:
        # Real implementation using Ollama API
        try:
            # Try to find a working Ollama host
            working_host = get_working_ollama_host()
            
            # If we found a working host, update the global OLLAMA_URL
            global OLLAMA_URL
            if working_host:
                OLLAMA_URL = working_host
            
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
    return {"message": "Cybersecurity Learning Plans API", "version": "2.0.0"}

@api_router.get("/topics")
async def get_topics():
    """Get available cybersecurity topics"""
    return {
        "topics": CYBERSECURITY_TOPICS,
        "levels": SKILL_LEVELS,
        "focus_areas": FOCUS_AREAS,
        "career_goals": CAREER_GOALS,
        "question_types": QUESTION_TYPES
    }

# Assessment endpoints
@api_router.post("/generate-assessment")
async def generate_assessment(topic: str, level: str, career_goal: str = "student"):
    """Generate a personalized cybersecurity assessment"""
    
    logger.info(f"Generating assessment for topic: {topic}, level: {level}, career_goal: {career_goal}")
    
    # Validate inputs
    if topic not in CYBERSECURITY_TOPICS:
        raise HTTPException(status_code=400, detail=f"Invalid topic. Available topics: {list(CYBERSECURITY_TOPICS.keys())}")
    
    if level not in SKILL_LEVELS:
        raise HTTPException(status_code=400, detail=f"Invalid level. Available levels: {list(SKILL_LEVELS.keys())}")
        
    if career_goal not in CAREER_GOALS:
        raise HTTPException(status_code=400, detail=f"Invalid career goal. Available goals: {list(CAREER_GOALS.keys())}")
    
    # Generate assessment using AI
    prompt = create_assessment_prompt(topic, level, career_goal)
    assessment_json = await generate_assessment_with_ollama(prompt)
    
    try:
        # Parse the generated assessment
        assessment_data = json.loads(assessment_json)
        
        # Create assessment questions
        questions = []
        total_points = 0
        
        for q_data in assessment_data["questions"]:
            question = AssessmentQuestion(
                id=q_data.get("id", str(uuid.uuid4())),
                question_type=q_data["question_type"],
                question_text=q_data["question_text"],
                options=q_data.get("options"),
                correct_answer=q_data["correct_answer"],
                explanation=q_data.get("explanation"),
                difficulty=q_data.get("difficulty", level),
                points=q_data.get("points", 10)
            )
            questions.append(question)
            total_points += question.points
        
        # Create assessment
        assessment = Assessment(
            topic=topic,
            level=level,
            questions=questions,
            total_points=total_points
        )
        
        # Save assessment
        assessment_dict = assessment.dict()
        await db.assessments.insert_one(assessment_dict)
        
        logger.info(f"Assessment created with ID: {assessment.id}")
        
        return {
            "success": True,
            "assessment_id": assessment.id,
            "topic": topic,
            "level": level,
            "career_goal": career_goal,
            "total_questions": len(questions),
            "total_points": total_points,
            "questions": [
                {
                    "id": q.id,
                    "question_type": q.question_type,
                    "question_text": q.question_text,
                    "options": q.options,
                    "difficulty": q.difficulty,
                    "points": q.points
                } for q in questions
            ]
        }
        
    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse assessment JSON: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to parse generated assessment")
    except Exception as e:
        logger.error(f"Error creating assessment: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to create assessment")

@api_router.post("/submit-assessment")
async def submit_assessment(submission: AssessmentSubmission):
    """Submit assessment responses and get results"""
    
    logger.info(f"Processing assessment submission for assessment: {submission.assessment_id}")
    
    # Get the assessment
    assessment = await db.assessments.find_one({"id": submission.assessment_id})
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")
    
    # Calculate score
    total_score = 0
    total_points = 0
    correct_answers = 0
    
    # Create a mapping of question_id to question for easy lookup
    question_map = {q["id"]: q for q in assessment["questions"]}
    
    for response in submission.responses:
        question = question_map.get(response.question_id)
        if question:
            total_points += question["points"]
            
            # Check if answer is correct (basic string matching for now)
            if question["question_type"] == "mcq":
                if response.answer.strip().lower() == question["correct_answer"].strip().lower():
                    total_score += question["points"]
                    correct_answers += 1
            elif question["question_type"] == "fill_blank":
                # For fill-in-the-blank, check if key terms are present
                correct_terms = question["correct_answer"].lower().split(", ")
                user_terms = response.answer.lower().split(", ")
                if len(set(correct_terms).intersection(set(user_terms))) >= len(correct_terms) * 0.7:
                    total_score += question["points"]
                    correct_answers += 1
            else:
                # For practical and coding questions, give partial credit (this could be enhanced with AI evaluation)
                if len(response.answer.strip()) > 20:  # Basic check for substantial answer
                    total_score += question["points"] * 0.7  # 70% credit for attempting
                    if len(response.answer.strip()) > 100:
                        total_score += question["points"] * 0.3  # Additional credit for detailed answer
                        correct_answers += 1
    
    # Calculate percentage and determine skill level
    percentage = (total_score / total_points * 100) if total_points > 0 else 0
    
    # Determine skill level based on performance
    if percentage >= 80:
        determined_level = "advanced" if assessment["level"] == "intermediate" else assessment["level"]
    elif percentage >= 60:
        determined_level = assessment["level"]
    else:
        skill_levels_order = ["beginner", "intermediate", "advanced", "expert"]
        current_index = skill_levels_order.index(assessment["level"])
        determined_level = skill_levels_order[max(0, current_index - 1)]
    
    # Generate recommendations
    recommendations = []
    if percentage < 50:
        recommendations.append("Focus on fundamental concepts and terminology")
        recommendations.append("Start with beginner-level resources and tutorials")
    elif percentage < 70:
        recommendations.append("Review core concepts before advancing")
        recommendations.append("Practice more hands-on exercises")
    else:
        recommendations.append("You're ready for advanced topics in this domain")
        recommendations.append("Consider pursuing relevant certifications")
    
    # Add career-specific recommendations
    if submission.career_goal == "faang_prep":
        recommendations.append("Focus on system design and scalability concepts")
        recommendations.append("Practice coding challenges related to security")
    elif submission.career_goal == "career_switcher":
        recommendations.append("Build a portfolio of security projects")
        recommendations.append("Consider entry-level certifications like Security+")
    
    # Create assessment result
    result = AssessmentResult(
        assessment_id=submission.assessment_id,
        submission=submission,
        score=int(total_score),
        total_points=total_points,
        percentage=round(percentage, 2),
        skill_level=determined_level,
        recommendations=recommendations
    )
    
    # Save result
    result_dict = result.dict()
    await db.assessment_results.insert_one(result_dict)
    
    logger.info(f"Assessment result saved with ID: {result.id}")
    
    return {
        "success": True,
        "result_id": result.id,
        "score": int(total_score),
        "total_points": total_points,
        "percentage": round(percentage, 2),
        "correct_answers": correct_answers,
        "total_questions": len(submission.responses),
        "skill_level": determined_level,
        "recommendations": recommendations,
        "career_goal": submission.career_goal
    }

@api_router.get("/assessment-result/{result_id}")
async def get_assessment_result(result_id: str):
    """Get assessment result by ID"""
    result = await db.assessment_results.find_one({"id": result_id})
    if not result:
        raise HTTPException(status_code=404, detail="Assessment result not found")
    
    # Remove MongoDB _id if present
    if "_id" in result:
        result.pop("_id", None)
    return result

# Learning session endpoints
@api_router.post("/start-learning-session")
async def start_learning_session(plan_id: str, user_id: str = "anonymous"):
    """Start a new learning session"""
    
    # Verify plan exists
    plan = await db.learning_plans.find_one({"id": plan_id})
    if not plan:
        raise HTTPException(status_code=404, detail="Learning plan not found")
    
    # Create new session
    session = LearningSession(
        plan_id=plan_id,
        user_id=user_id,
        current_module="Getting Started"
    )
    
    # Save session
    session_dict = session.dict()
    await db.learning_sessions.insert_one(session_dict)
    
    logger.info(f"Learning session started with ID: {session.id}")
    
    return {
        "success": True,
        "session_id": session.id,
        "plan_id": plan_id,
        "current_module": session.current_module
    }

@api_router.get("/learning-session/{session_id}")
async def get_learning_session(session_id: str):
    """Get learning session details"""
    session = await db.learning_sessions.find_one({"id": session_id})
    if not session:
        raise HTTPException(status_code=404, detail="Learning session not found")
    
    if "_id" in session:
        session.pop("_id", None)
    return session

@api_router.post("/chat-with-ai")
async def chat_with_ai(session_id: str, message: str):
    """Chat with AI tutor during learning session"""
    
    # Verify session exists
    session = await db.learning_sessions.find_one({"id": session_id})
    if not session:
        raise HTTPException(status_code=404, detail="Learning session not found")
    
    # Get the learning plan for context
    plan = await db.learning_plans.find_one({"id": session["plan_id"]})
    if not plan:
        raise HTTPException(status_code=404, detail="Learning plan not found")
    
    # Create user message
    user_message = ChatMessage(
        session_id=session_id,
        sender="user",
        message=message
    )
    
    # Save user message
    await db.chat_messages.insert_one(user_message.dict())
    
    # Generate AI response
    ai_prompt = f"""
You are an expert cybersecurity tutor helping a student learn {plan['topic']}. 
The student is at {plan['level']} level and currently studying: {session['current_module']}.

Student's question/message: {message}

Provide a helpful, clear, and educational response. Be encouraging and provide practical examples when possible.
Keep responses concise but informative. If the student asks about a specific topic, provide step-by-step explanations.
"""
    
    try:
        ai_response_text = await generate_with_ollama(ai_prompt)
        
        # Create AI message
        ai_message = ChatMessage(
            session_id=session_id,
            sender="ai",
            message=ai_response_text,
            message_type="explanation"
        )
        
        # Save AI message
        await db.chat_messages.insert_one(ai_message.dict())
        
        # Update session stats
        await db.learning_sessions.find_one_and_update(
            {"id": session_id},
            {
                "$inc": {
                    "ai_interactions": 1,
                    "questions_asked": 1
                },
                "$set": {
                    "updated_at": datetime.utcnow()
                }
            }
        )
        
        return {
            "success": True,
            "ai_response": ai_response_text,
            "message_id": ai_message.id
        }
        
    except Exception as e:
        logger.error(f"Error generating AI response: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to generate AI response")

@api_router.get("/chat-history/{session_id}")
async def get_chat_history(session_id: str, limit: int = 50):
    """Get chat history for a learning session"""
    
    cursor = db.chat_messages.find({"session_id": session_id}).sort("timestamp", 1).limit(limit)
    messages = await cursor.to_list(length=limit)
    
    # Remove MongoDB _id from all messages
    for message in messages:
        if "_id" in message:
            message.pop("_id", None)
    
    return {
        "session_id": session_id,
        "messages": messages,
        "total": len(messages)
    }

@api_router.post("/update-progress")
async def update_learning_progress(session_id: str, progress_percentage: float, time_spent: int):
    """Update learning progress for a session"""
    
    try:
        # Find and update the session in in-memory database
        session_found = False
        for i, session in enumerate(in_memory_db["learning_sessions"]):
            if session.get("id") == session_id:
                in_memory_db["learning_sessions"][i]["progress_percentage"] = progress_percentage
                in_memory_db["learning_sessions"][i]["time_spent"] = time_spent
                in_memory_db["learning_sessions"][i]["updated_at"] = datetime.utcnow()
                session_found = True
                break
        
        if not session_found:
            raise HTTPException(status_code=404, detail="Learning session not found")
        
        return {
            "success": True,
            "progress_percentage": progress_percentage,
            "time_spent": time_spent
        }
        
    except Exception as e:
        logger.error(f"Error updating progress: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to update progress: {str(e)}")

# Achievement and progress endpoints
@api_router.get("/achievements")
async def get_all_achievements():
    """Get all available achievements"""
    return {
        "achievements": DEFAULT_ACHIEVEMENTS
    }

@api_router.get("/user-progress/{user_id}")
async def get_user_progress(user_id: str = "anonymous"):
    """Get user progress and achievements"""
    
    progress = await db.user_progress.find_one({"user_id": user_id})
    if not progress:
        # Create new progress record
        progress = UserProgress(user_id=user_id)
        await db.user_progress.insert_one(progress.dict())
        progress = progress.dict()
    
    if "_id" in progress:
        progress.pop("_id", None)
    
    # Get achievement details
    achievement_details = []
    for achievement_id in progress.get("achievements", []):
        achievement = next((a for a in DEFAULT_ACHIEVEMENTS if a["id"] == achievement_id), None)
        if achievement:
            achievement_details.append(achievement)
    
    return {
        "user_id": user_id,
        "total_points": progress.get("total_points", 0),
        "achievements": achievement_details,
        "skill_levels": progress.get("skill_levels", {}),
        "learning_streak": progress.get("learning_streak", 0),
        "total_time_spent": progress.get("total_time_spent", 0),
        "assessments_completed": progress.get("assessments_completed", 0),
        "plans_completed": progress.get("plans_completed", 0)
    }

@api_router.post("/award-achievement")
async def award_achievement(user_id: str, achievement_id: str):
    """Award an achievement to a user"""
    
    # Verify achievement exists
    achievement = next((a for a in DEFAULT_ACHIEVEMENTS if a["id"] == achievement_id), None)
    if not achievement:
        raise HTTPException(status_code=404, detail="Achievement not found")
    
    try:
        # Get or create user progress
        progress = None
        progress_index = -1
        
        # Find existing progress
        for i, prog in enumerate(in_memory_db["user_progress"]):
            if prog.get("user_id") == user_id:
                progress = prog
                progress_index = i
                break
        
        # Create new progress if not found
        if not progress:
            progress = {
                "id": str(uuid.uuid4()),
                "user_id": user_id,
                "total_points": 0,
                "achievements": [],
                "skill_levels": {},
                "learning_streak": 0,
                "total_time_spent": 0,
                "assessments_completed": 0,
                "plans_completed": 0,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
            in_memory_db["user_progress"].append(progress)
            progress_index = len(in_memory_db["user_progress"]) - 1
        
        # Check if user already has this achievement
        if achievement_id in progress.get("achievements", []):
            return {
                "success": False,
                "message": "User already has this achievement"
            }
        
        # Award achievement
        in_memory_db["user_progress"][progress_index]["achievements"].append(achievement_id)
        in_memory_db["user_progress"][progress_index]["total_points"] += achievement["points"]
        in_memory_db["user_progress"][progress_index]["updated_at"] = datetime.utcnow()
        
        return {
            "success": True,
            "achievement": achievement,
            "points_awarded": achievement["points"]
        }
        
    except Exception as e:
        logger.error(f"Error awarding achievement: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to award achievement: {str(e)}")

@api_router.post("/approve-learning-plan/{plan_id}")
async def approve_learning_plan(plan_id: str, approved: bool = True):
    """Approve or reject a learning plan"""
    
    # Find and update the plan
    try:
        plan = await db.learning_plans.find_one({"id": plan_id})
        if not plan:
            raise HTTPException(status_code=404, detail="Learning plan not found")
        
        # Update the plan - note: this is a simplified update for in-memory database
        for i, stored_plan in enumerate(in_memory_db["learning_plans"]):
            if stored_plan.get("id") == plan_id:
                in_memory_db["learning_plans"][i]["approved"] = approved
                in_memory_db["learning_plans"][i]["updated_at"] = datetime.utcnow()
                break
        
        # Award achievement for first approved plan
        if approved:
            try:
                await award_achievement("anonymous", "plan_approved")
            except:
                pass  # Ignore if already awarded
        
        return {
            "success": True,
            "plan_id": plan_id,
            "approved": approved
        }
        
    except Exception as e:
        logger.error(f"Error approving plan: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to approve plan: {str(e)}")

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
    
    # Get assessment result if provided for personalization
    personalization_notes = ""
    if request.assessment_result_id:
        assessment_result = await db.assessment_results.find_one({"id": request.assessment_result_id})
        if assessment_result:
            personalization_notes = f"""
PERSONALIZATION BASED ON ASSESSMENT:
- Assessment Score: {assessment_result['score']}/{assessment_result['total_points']} ({assessment_result['percentage']}%)
- Determined Skill Level: {assessment_result['skill_level']}
- Career Goal: {assessment_result['submission']['career_goal']}
- Recommendations: {', '.join(assessment_result['recommendations'])}

Please tailor the learning plan to address the learner's specific strengths and areas for improvement based on their assessment performance.
"""
    
    # Create comprehensive prompt with personalization
    base_prompt = create_comprehensive_prompt(request)
    full_prompt = base_prompt + personalization_notes
    
    # Generate content using Ollama
    curriculum = await generate_with_ollama(full_prompt)
    
    if not curriculum:
        raise HTTPException(status_code=500, detail="Failed to generate curriculum content")
    
    # Create learning plan object
    learning_plan = LearningPlan(
        topic=request.topic,
        level=request.level,
        duration_weeks=request.duration_weeks,
        focus_areas=request.focus_areas,
        curriculum=curriculum,
        user_background=request.user_background,
        assessment_result_id=request.assessment_result_id,
        personalization_notes=personalization_notes
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
        
        # Remove MongoDB _id from response if it exists
        if "_id" in plan:
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
        
        # Remove MongoDB _id from all plans if it exists
        for plan in plans:
            if "_id" in plan:
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
        # For testing purposes, we'll use a mock implementation
        if MOCK_OLLAMA:
            ollama_status = "healthy"  # Pretend Ollama is healthy
            logger.info("Using mock implementation for Ollama health check")
        else:
            # Try to find a working Ollama host
            working_host = get_working_ollama_host()
            
            # Test Ollama connection with the working host
            response = requests.get(f"{working_host}/api/tags", timeout=5)
            ollama_status = "healthy" if response.status_code == 200 else "unhealthy"
            
            # If we found a working host, update the global OLLAMA_URL
            global OLLAMA_URL
            if ollama_status == "healthy":
                OLLAMA_URL = working_host
        
        # Test database connection
        await db.learning_plans.find_one()
        db_status = "healthy"
        
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        if MOCK_OLLAMA:
            ollama_status = "healthy"  # Pretend Ollama is healthy
        else:
            ollama_status = "unhealthy"
        db_status = "healthy"  # In-memory database is always healthy
    
    return {
        "status": "healthy" if ollama_status == "healthy" and db_status == "healthy" else "unhealthy",
        "ollama": ollama_status,
        "database": db_status,
        "model": OLLAMA_MODEL,
        "ollama_url": OLLAMA_URL,
        "mock_mode": MOCK_OLLAMA
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

if not MOCK_DB:
    @app.on_event("shutdown")
    async def shutdown_db_client():
        client.close()