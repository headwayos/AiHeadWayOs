import requests
import json
from typing import Dict, Any, List
import asyncio
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

class LlamaAIService:
    def __init__(self, base_url: str = "http://localhost:11434"):
        self.base_url = base_url
        self.model_name = "llama3.2:latest"
        
    async def generate_content(self, prompt: str, system_prompt: str = None, max_tokens: int = 1000) -> str:
        """Generate content using Llama AI"""
        try:
            url = f"{self.base_url}/api/generate"
            
            payload = {
                "model": self.model_name,
                "prompt": prompt,
                "system": system_prompt or "You are a helpful AI assistant specialized in educational content.",
                "stream": False,
                "options": {
                    "temperature": 0.7,
                    "num_predict": max_tokens,
                    "top_p": 0.9
                }
            }
            
            response = requests.post(url, json=payload, timeout=60)
            
            if response.status_code == 200:
                result = response.json()
                return result.get("response", "")
            else:
                logger.error(f"Ollama API error: {response.status_code}")
                return f"Error generating content: {response.status_code}"
                
        except Exception as e:
            logger.error(f"Error in generate_content: {str(e)}")
            return f"Error: {str(e)}"
    
    async def generate_career_roadmap(self, career_field: str, experience_level: str, specialization: str = None) -> Dict[str, Any]:
        """Generate comprehensive career roadmap"""
        system_prompt = """You are an expert career advisor and educational content creator. 
        Create comprehensive, actionable career roadmaps that include:
        1. Clear learning path with phases
        2. Skills and technologies for each phase
        3. Timeline estimates
        4. Project recommendations
        5. Certification suggestions
        6. Market demand insights
        7. Salary expectations
        8. Industry trends
        
        Format the response as a detailed roadmap with clear sections."""
        
        specialization_text = f" with focus on {specialization}" if specialization else ""
        
        prompt = f"""Create a comprehensive career roadmap for {career_field}{specialization_text} 
        for someone at {experience_level} level.
        
        Include:
        - Learning phases (beginner to advanced)
        - Essential skills and technologies
        - Timeline estimates
        - Hands-on projects
        - Certifications
        - Market demand analysis
        - Salary progression
        - Industry trends for 2025
        
        Make it actionable and detailed."""
        
        content = await self.generate_content(prompt, system_prompt, 1500)
        
        return {
            "career_field": career_field,
            "experience_level": experience_level,
            "specialization": specialization,
            "roadmap_content": content,
            "generated_at": datetime.utcnow().isoformat(),
            "phases": self._extract_phases(content)
        }
    
    async def generate_lesson_content(self, topic: str, difficulty: str, lesson_type: str = "tutorial") -> Dict[str, Any]:
        """Generate exhaustive MDN-style lesson content"""
        system_prompt = """You are an expert educational content creator specializing in creating 
        comprehensive, MDN-style documentation and tutorials. Create detailed, structured content with:
        1. Clear introduction and objectives
        2. Step-by-step explanations
        3. Code examples with explanations
        4. Visual diagrams descriptions
        5. Practical exercises
        6. Key concepts summary
        7. Further reading suggestions
        8. Common pitfalls and solutions
        
        Format the content with proper headings, code blocks, and structured sections."""
        
        prompt = f"""Create exhaustive {lesson_type} content for: {topic}
        
        Difficulty Level: {difficulty}
        
        Structure the content like MDN documentation with:
        - Introduction and Learning Objectives
        - Detailed Explanation with Examples
        - Code Samples (where applicable)
        - Visual Concepts (describe diagrams/charts)
        - Hands-on Exercise
        - Key Takeaways
        - Further Reading
        - Common Mistakes to Avoid
        
        Make it comprehensive and practical."""
        
        content = await self.generate_content(prompt, system_prompt, 2000)
        
        return {
            "topic": topic,
            "difficulty": difficulty,
            "lesson_type": lesson_type,
            "content": content,
            "generated_at": datetime.utcnow().isoformat(),
            "estimated_time": self._estimate_reading_time(content)
        }
    
    async def generate_skill_assessment(self, skill: str, level: str, question_count: int = 10) -> Dict[str, Any]:
        """Generate comprehensive skill assessment"""
        system_prompt = """You are an expert assessment designer. Create comprehensive skill assessments with:
        1. Multiple choice questions
        2. Practical coding challenges
        3. Scenario-based questions
        4. True/false questions
        5. Fill-in-the-blank questions
        
        Include difficulty progression and clear evaluation criteria."""
        
        prompt = f"""Create a comprehensive skill assessment for {skill} at {level} level.
        
        Include {question_count} questions with mix of:
        - Multiple choice (40%)
        - Practical coding/scenario (30%)
        - True/false (20%)
        - Fill-in-the-blank (10%)
        
        For each question, provide:
        - Question text
        - Options (for MCQ)
        - Correct answer
        - Explanation
        - Difficulty score (1-5)
        
        Format as JSON-like structure."""
        
        content = await self.generate_content(prompt, system_prompt, 1500)
        
        return {
            "skill": skill,
            "level": level,
            "question_count": question_count,
            "assessment_content": content,
            "generated_at": datetime.utcnow().isoformat(),
            "estimated_time": question_count * 3  # 3 minutes per question
        }
    
    async def generate_market_insights(self, role: str, location: str = "Global") -> Dict[str, Any]:
        """Generate market demand and salary insights"""
        system_prompt = """You are a market research analyst specializing in tech job market trends.
        Provide comprehensive market insights including:
        1. Current demand levels
        2. Salary ranges
        3. Growth projections
        4. Required skills
        5. Industry trends
        6. Remote work opportunities
        7. Career advancement paths
        
        Base insights on 2024-2025 market data."""
        
        prompt = f"""Analyze the job market for {role} in {location}.
        
        Provide detailed insights on:
        - Current demand level (High/Medium/Low)
        - Salary ranges (entry, mid, senior)
        - Job growth projections for next 2-3 years
        - Most in-demand skills
        - Industry trends affecting this role
        - Remote work opportunities
        - Career advancement paths
        - Companies actively hiring
        
        Focus on actionable insights for 2025."""
        
        content = await self.generate_content(prompt, system_prompt, 1200)
        
        return {
            "role": role,
            "location": location,
            "market_insights": content,
            "generated_at": datetime.utcnow().isoformat(),
            "last_updated": datetime.utcnow().isoformat()
        }
    
    async def generate_lab_exercise(self, technology: str, difficulty: str, duration: str = "30 minutes") -> Dict[str, Any]:
        """Generate hands-on lab exercise"""
        system_prompt = """You are a practical learning expert. Create hands-on lab exercises with:
        1. Clear objectives
        2. Prerequisites
        3. Step-by-step instructions
        4. Code examples
        5. Expected outputs
        6. Troubleshooting tips
        7. Extensions for further practice
        
        Make exercises practical and engaging."""
        
        prompt = f"""Create a hands-on lab exercise for {technology} at {difficulty} level.
        
        Duration: {duration}
        
        Include:
        - Learning objectives
        - Prerequisites
        - Environment setup
        - Step-by-step instructions
        - Code examples with explanations
        - Expected outputs
        - Verification steps
        - Troubleshooting common issues
        - Extension challenges
        
        Make it practical and engaging."""
        
        content = await self.generate_content(prompt, system_prompt, 1500)
        
        return {
            "technology": technology,
            "difficulty": difficulty,
            "duration": duration,
            "lab_content": content,
            "generated_at": datetime.utcnow().isoformat(),
            "lab_type": "hands-on"
        }
    
    def _extract_phases(self, content: str) -> List[Dict[str, Any]]:
        """Extract learning phases from roadmap content"""
        # Simple phase extraction - can be enhanced with NLP
        phases = []
        lines = content.split('\n')
        current_phase = None
        
        for line in lines:
            if 'phase' in line.lower() or 'stage' in line.lower():
                if current_phase:
                    phases.append(current_phase)
                current_phase = {
                    "title": line.strip(),
                    "description": "",
                    "skills": [],
                    "duration": "4-6 weeks"
                }
            elif current_phase and line.strip():
                current_phase["description"] += line.strip() + " "
        
        if current_phase:
            phases.append(current_phase)
        
        return phases
    
    def _estimate_reading_time(self, content: str) -> str:
        """Estimate reading time based on content length"""
        words = len(content.split())
        minutes = max(1, words // 200)  # Average 200 words per minute
        return f"{minutes} minutes"

# Global AI service instance
ai_service = LlamaAIService()