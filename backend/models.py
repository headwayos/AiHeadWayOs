from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime
from enum import Enum

class DifficultyLevel(str, Enum):
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"
    EXPERT = "expert"

class ExperienceLevel(str, Enum):
    ENTRY = "entry"
    MID = "mid"
    SENIOR = "senior"
    LEAD = "lead"

class CareerField(str, Enum):
    SOFTWARE_DEVELOPMENT = "software_development"
    DATA_SCIENCE = "data_science"
    CYBERSECURITY = "cybersecurity"
    DEVOPS = "devops"
    MACHINE_LEARNING = "machine_learning"
    CLOUD_COMPUTING = "cloud_computing"
    MOBILE_DEVELOPMENT = "mobile_development"
    FRONTEND = "frontend"
    BACKEND = "backend"
    FULLSTACK = "fullstack"

class ContentType(str, Enum):
    LESSON = "lesson"
    TUTORIAL = "tutorial"
    GUIDE = "guide"
    REFERENCE = "reference"
    EXERCISE = "exercise"

# Request Models
class RoadmapRequest(BaseModel):
    career_field: str = Field(..., description="Career field or technology")
    experience_level: str = Field(..., description="Current experience level")
    specialization: Optional[str] = Field(None, description="Specific specialization")
    duration_months: Optional[int] = Field(12, description="Target duration in months")
    focus_areas: Optional[List[str]] = Field([], description="Specific focus areas")

class LessonRequest(BaseModel):
    topic: str = Field(..., description="Lesson topic")
    difficulty: DifficultyLevel = Field(..., description="Difficulty level")
    lesson_type: ContentType = Field(ContentType.LESSON, description="Type of content")
    duration_minutes: Optional[int] = Field(30, description="Target duration")

class AssessmentRequest(BaseModel):
    skill: str = Field(..., description="Skill to assess")
    level: DifficultyLevel = Field(..., description="Assessment difficulty")
    question_count: int = Field(10, description="Number of questions")
    assessment_type: str = Field("comprehensive", description="Type of assessment")

class MarketInsightsRequest(BaseModel):
    role: str = Field(..., description="Job role")
    location: str = Field("Global", description="Geographic location")
    experience_level: Optional[ExperienceLevel] = None

class LabExerciseRequest(BaseModel):
    technology: str = Field(..., description="Technology or tool")
    difficulty: DifficultyLevel = Field(..., description="Exercise difficulty")
    duration_minutes: int = Field(30, description="Expected duration")
    lab_type: str = Field("hands-on", description="Type of lab exercise")

class CloudLabRequest(BaseModel):
    environment: str = Field(..., description="Lab environment needed")
    tools: List[str] = Field(..., description="Required tools")
    duration_hours: int = Field(2, description="Lab session duration")

# Response Models
class RoadmapPhase(BaseModel):
    title: str
    description: str
    skills: List[str]
    duration: str
    projects: List[str] = []
    certifications: List[str] = []

class RoadmapResponse(BaseModel):
    id: str
    career_field: str
    experience_level: str
    specialization: Optional[str]
    phases: List[RoadmapPhase]
    total_duration: str
    market_demand: str
    salary_range: str
    roadmap_content: str
    created_at: datetime
    updated_at: datetime

class LessonContent(BaseModel):
    section: str
    content: str
    code_examples: List[str] = []
    key_points: List[str] = []

class LessonResponse(BaseModel):
    id: str
    topic: str
    difficulty: DifficultyLevel
    lesson_type: ContentType
    content_sections: List[LessonContent]
    estimated_time: str
    prerequisites: List[str] = []
    learning_objectives: List[str] = []
    full_content: str
    created_at: datetime

class AssessmentQuestion(BaseModel):
    question_id: str
    question_text: str
    question_type: str  # mcq, coding, scenario, true_false, fill_blank
    options: List[str] = []
    correct_answer: str
    explanation: str
    difficulty_score: int
    points: int

class AssessmentResponse(BaseModel):
    id: str
    skill: str
    level: DifficultyLevel
    questions: List[AssessmentQuestion]
    total_questions: int
    total_points: int
    time_limit_minutes: int
    created_at: datetime

class MarketInsights(BaseModel):
    demand_level: str
    salary_range: Dict[str, str]
    growth_projection: str
    required_skills: List[str]
    industry_trends: List[str]
    remote_opportunities: str
    career_paths: List[str]

class MarketInsightsResponse(BaseModel):
    id: str
    role: str
    location: str
    insights: MarketInsights
    market_insights: str
    last_updated: datetime

class LabExercise(BaseModel):
    id: str
    technology: str
    difficulty: DifficultyLevel
    duration_minutes: int
    objectives: List[str]
    prerequisites: List[str]
    instructions: List[str]
    code_examples: List[str]
    expected_outputs: List[str]
    troubleshooting: List[str]
    extensions: List[str]
    lab_content: str
    created_at: datetime

class CloudLabEnvironment(BaseModel):
    id: str
    environment: str
    tools: List[str]
    access_url: str
    credentials: Dict[str, str]
    duration_hours: int
    status: str  # active, inactive, expired
    created_at: datetime
    expires_at: datetime

# Progress Tracking Models
class LearningProgress(BaseModel):
    user_id: str
    content_id: str
    content_type: str
    progress_percentage: float
    time_spent_minutes: int
    completed_at: Optional[datetime] = None
    last_accessed: datetime

class Achievement(BaseModel):
    id: str
    title: str
    description: str
    icon: str
    points: int
    category: str
    requirements: List[str]
    unlocked_at: Optional[datetime] = None

class UserProfile(BaseModel):
    id: str
    name: str
    email: str
    career_goals: List[str]
    current_skills: List[str]
    experience_level: ExperienceLevel
    preferred_learning_style: str
    achievements: List[Achievement] = []
    total_points: int = 0
    streak_days: int = 0
    created_at: datetime

# Analytics Models
class LearningAnalytics(BaseModel):
    user_id: str
    total_time_minutes: int
    completed_lessons: int
    completed_assessments: int
    completed_labs: int
    average_score: float
    skill_levels: Dict[str, str]
    learning_velocity: float
    strengths: List[str]
    improvement_areas: List[str]
    generated_at: datetime

class PlatformAnalytics(BaseModel):
    total_users: int
    active_users: int
    popular_topics: List[str]
    completion_rates: Dict[str, float]
    user_feedback: Dict[str, float]
    generated_at: datetime