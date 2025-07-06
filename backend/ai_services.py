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
        self.mock_mode = True  # Enable mock mode for development
        
    def _check_ollama_availability(self) -> bool:
        """Check if Ollama is available"""
        try:
            response = requests.get(f"{self.base_url}/api/tags", timeout=5)
            return response.status_code == 200
        except:
            return False
    
    async def _generate_mock_content(self, prompt: str, content_type: str = "general") -> str:
        """Generate mock content based on prompt and type"""
        if content_type == "roadmap":
            return f"""# Career Roadmap: {prompt}

## Phase 1: Foundation (Weeks 1-4)
**Skills to Learn:**
- Basic programming concepts
- Version control (Git)
- Development environment setup
- Fundamental algorithms and data structures

**Projects:**
- Build a simple calculator
- Create a personal portfolio website
- Contribute to open-source projects

## Phase 2: Intermediate (Weeks 5-12)
**Skills to Learn:**
- Advanced programming concepts
- Database management
- API development
- Testing methodologies

**Projects:**
- Build a REST API
- Create a full-stack application
- Implement automated testing

## Phase 3: Advanced (Weeks 13-24)
**Skills to Learn:**
- System design
- Cloud computing
- DevOps practices
- Security best practices

**Projects:**
- Deploy applications to cloud
- Implement CI/CD pipelines
- Build scalable systems

## Market Insights:
- **Demand Level:** High
- **Salary Range:** $60,000 - $120,000+
- **Growth Projection:** 15% annually
- **Remote Opportunities:** Excellent

## Recommended Certifications:
- AWS Certified Solutions Architect
- Google Cloud Professional
- Microsoft Azure Fundamentals
"""
        
        elif content_type == "lesson":
            return f"""# {prompt}

## Introduction
This comprehensive lesson covers the fundamentals of {prompt} and provides practical examples to help you master this topic.

## Learning Objectives
By the end of this lesson, you will be able to:
- Understand the core concepts of {prompt}
- Apply the concepts in real-world scenarios
- Troubleshoot common issues
- Implement best practices

## Core Concepts

### Concept 1: Fundamentals
The basic principles of {prompt} include understanding the underlying architecture and how components interact with each other.

### Concept 2: Implementation
When implementing {prompt}, consider the following best practices:
- Start with a clear plan
- Use appropriate tools and frameworks
- Follow industry standards
- Test thoroughly

### Concept 3: Optimization
To optimize your {prompt} implementation:
- Monitor performance metrics
- Identify bottlenecks
- Apply caching strategies
- Use efficient algorithms

## Code Examples

```python
# Example implementation
def example_function():
    # This is a sample implementation
    result = process_data()
    return result

# Usage
output = example_function()
print(output)
```

## Practical Exercise
Try implementing a simple version of {prompt} using the concepts learned in this lesson.

## Key Takeaways
- {prompt} is essential for modern development
- Understanding the fundamentals is crucial
- Practice with real projects
- Stay updated with latest trends

## Further Reading
- Official documentation
- Industry blogs
- Open source projects
- Online courses

## Common Pitfalls
- Not understanding the underlying principles
- Skipping testing phases
- Not considering scalability
- Ignoring security best practices
"""
        
        elif content_type == "assessment":
            return f"""# Skill Assessment: {prompt}

## Question 1 (Multiple Choice)
**Type:** Multiple Choice
**Difficulty:** 3/5
**Question:** What is the primary purpose of {prompt}?
**Options:**
A) To provide basic functionality
B) To enhance system performance
C) To ensure security
D) All of the above
**Correct Answer:** D
**Explanation:** {prompt} serves multiple purposes including functionality, performance, and security.

## Question 2 (Practical)
**Type:** Practical
**Difficulty:** 4/5
**Question:** Write a function that implements basic {prompt} functionality.
**Solution:** 
```python
def implement_functionality():
    # Implementation here
    return "result"
```
**Explanation:** This function demonstrates the core concepts of {prompt}.

## Question 3 (True/False)
**Type:** True/False
**Difficulty:** 2/5
**Question:** {prompt} is only used in web development.
**Correct Answer:** False
**Explanation:** {prompt} has applications across various domains.

## Question 4 (Fill in the Blank)
**Type:** Fill in the Blank
**Difficulty:** 3/5
**Question:** The main advantage of {prompt} is ________.
**Correct Answer:** efficiency
**Explanation:** {prompt} primarily improves system efficiency.

## Assessment Summary
- **Total Questions:** 4
- **Estimated Time:** 20 minutes
- **Difficulty Range:** 2-4/5
- **Topics Covered:** Fundamentals, Implementation, Best Practices
"""
        
        elif content_type == "market_insights":
            return f"""# Market Insights: {prompt}

## Current Market Demand
**Demand Level:** High
The market for {prompt} professionals is experiencing strong growth with numerous opportunities across industries.

## Salary Analysis
**Entry Level:** $50,000 - $70,000
**Mid Level:** $70,000 - $100,000
**Senior Level:** $100,000 - $150,000+
**Lead/Principal:** $150,000+

## Growth Projections
- **Next 2 Years:** 20% growth expected
- **Market Expansion:** Emerging markets showing strong demand
- **Industry Trends:** Increasing automation and digital transformation

## Required Skills
### Technical Skills:
- Programming languages (Python, JavaScript, Java)
- Cloud platforms (AWS, Azure, GCP)
- Database management
- API development
- Security fundamentals

### Soft Skills:
- Problem-solving
- Communication
- Team collaboration
- Project management
- Continuous learning

## Industry Trends
1. **Remote Work:** 70% of positions offer remote options
2. **AI Integration:** Growing demand for AI/ML integration
3. **Security Focus:** Increased emphasis on cybersecurity
4. **Cloud-First:** Migration to cloud-native solutions

## Career Advancement Paths
- **Individual Contributor:** Senior → Staff → Principal
- **Management:** Team Lead → Manager → Director
- **Specialized:** Architect → Consultant → CTO

## Companies Actively Hiring
- Technology companies
- Financial services
- Healthcare organizations
- E-commerce platforms
- Government agencies

## Recommendations
- Focus on emerging technologies
- Build a strong portfolio
- Obtain relevant certifications
- Engage with professional communities
- Stay updated with industry trends
"""
        
        elif content_type == "lab":
            return f"""# Hands-On Lab: {prompt}

## Lab Overview
This hands-on lab provides practical experience with {prompt} through step-by-step exercises.

## Learning Objectives
- Set up a development environment for {prompt}
- Implement core functionality
- Test and debug your implementation
- Deploy to a cloud environment

## Prerequisites
- Basic programming knowledge
- Familiarity with command line
- Development environment setup

## Lab Environment Setup
1. Install required tools:
   ```bash
   # Install dependencies
   npm install
   pip install requirements.txt
   ```

2. Configure environment variables:
   ```bash
   export API_KEY="your_api_key"
   export DATABASE_URL="your_db_url"
   ```

## Exercise 1: Basic Implementation
**Objective:** Create a basic {prompt} application

**Steps:**
1. Create a new project directory
2. Initialize the project
3. Implement core functionality
4. Test the implementation

**Expected Output:**
```
Application started successfully
Feature implemented correctly
Tests passing: 100%
```

## Exercise 2: Advanced Features
**Objective:** Add advanced features to your {prompt} application

**Steps:**
1. Add authentication
2. Implement data persistence
3. Add error handling
4. Optimize performance

## Exercise 3: Deployment
**Objective:** Deploy your application to production

**Steps:**
1. Configure production environment
2. Set up CI/CD pipeline
3. Deploy to cloud platform
4. Monitor performance

## Troubleshooting Guide
**Common Issues:**
- Connection timeouts: Check network configuration
- Authentication errors: Verify API keys
- Performance issues: Review optimization strategies

## Extension Challenges
1. Add real-time features
2. Implement advanced analytics
3. Create mobile app integration
4. Add machine learning capabilities

## Resources
- Official documentation
- Community forums
- Video tutorials
- Sample projects
"""
        
        else:  # general content
            return f"""# {prompt}

## Overview
This comprehensive guide covers everything you need to know about {prompt}.

## Key Concepts
Understanding {prompt} requires familiarity with several core concepts:

1. **Foundation Principles**
   - Basic terminology and definitions
   - Historical context and evolution
   - Current industry standards

2. **Implementation Strategies**
   - Best practices for getting started
   - Common approaches and methodologies
   - Tools and frameworks

3. **Advanced Topics**
   - Optimization techniques
   - Scaling considerations
   - Security implications

## Practical Applications
{prompt} has numerous real-world applications:
- Enterprise software development
- Web application development
- Mobile app development
- Data processing and analytics
- Machine learning implementations

## Getting Started
To begin working with {prompt}:
1. Set up your development environment
2. Install necessary tools and dependencies
3. Follow the step-by-step tutorials
4. Practice with sample projects

## Best Practices
- Follow industry standards
- Write clean, maintainable code
- Implement proper testing
- Document your work
- Stay updated with latest trends

## Common Challenges
- Performance optimization
- Security considerations
- Scalability planning
- Integration complexity
- Maintenance overhead

## Next Steps
- Practice with hands-on projects
- Explore advanced features
- Join community discussions
- Consider professional certification
- Build a portfolio of work

## Resources
- Official documentation
- Community forums
- Online courses
- Books and tutorials
- Open source projects
"""
        
    async def generate_content(self, prompt: str, system_prompt: str = None, max_tokens: int = 1000) -> str:
        """Generate content using Llama AI or fallback to mock"""
        try:
            # Check if Ollama is available
            if not self.mock_mode and self._check_ollama_availability():
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
                    return await self._generate_mock_content(prompt)
            else:
                # Use mock content
                return await self._generate_mock_content(prompt)
                
        except Exception as e:
            logger.error(f"Error in generate_content: {str(e)}")
            return await self._generate_mock_content(prompt)
    
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
        for someone at {experience_level} level."""
        
        content = await self._generate_mock_content(prompt, "roadmap")
        
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
        content = await self._generate_mock_content(topic, "lesson")
        
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
        content = await self._generate_mock_content(skill, "assessment")
        
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
        content = await self._generate_mock_content(role, "market_insights")
        
        return {
            "role": role,
            "location": location,
            "market_insights": content,
            "generated_at": datetime.utcnow().isoformat(),
            "last_updated": datetime.utcnow().isoformat()
        }
    
    async def generate_lab_exercise(self, technology: str, difficulty: str, duration: str = "30 minutes") -> Dict[str, Any]:
        """Generate hands-on lab exercise"""
        content = await self._generate_mock_content(technology, "lab")
        
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