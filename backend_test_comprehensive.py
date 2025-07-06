#!/usr/bin/env python3
import requests
import json
import time
import os
import sys
from typing import Dict, Any, List, Optional
import uuid

# Get the backend URL from the frontend .env file
def get_backend_url():
    try:
        with open('/app/frontend/.env', 'r') as f:
            for line in f:
                if line.startswith('REACT_APP_BACKEND_URL='):
                    return line.strip().split('=')[1].strip('"\'')
    except Exception as e:
        print(f"Error reading backend URL: {e}")
        return None

# Configuration
BACKEND_URL = get_backend_url()
if not BACKEND_URL:
    print("Error: Could not determine backend URL")
    sys.exit(1)

API_BASE_URL = f"{BACKEND_URL}/api"
API_V2_BASE_URL = f"{BACKEND_URL}/api/v2"
print(f"Using API base URL: {API_BASE_URL}")
print(f"Using API v2 base URL: {API_V2_BASE_URL}")

# Test results tracking
test_results = {
    "total_tests": 0,
    "passed_tests": 0,
    "failed_tests": 0,
    "test_details": []
}

def run_test(test_name: str, test_func, *args, **kwargs):
    """Run a test and track its results"""
    print(f"\n{'='*80}\nRunning test: {test_name}\n{'='*80}")
    test_results["total_tests"] += 1
    
    try:
        start_time = time.time()
        result = test_func(*args, **kwargs)
        end_time = time.time()
        
        if result:
            test_results["passed_tests"] += 1
            status = "PASSED"
        else:
            test_results["failed_tests"] += 1
            status = "FAILED"
            
        test_results["test_details"].append({
            "name": test_name,
            "status": status,
            "duration": round(end_time - start_time, 2),
            "details": result if isinstance(result, dict) else {"success": bool(result)}
        })
        
        print(f"Test {status} in {round(end_time - start_time, 2)}s")
        return result
    except Exception as e:
        test_results["failed_tests"] += 1
        test_results["test_details"].append({
            "name": test_name,
            "status": "ERROR",
            "details": {"error": str(e)}
        })
        print(f"Test ERROR: {str(e)}")
        return False

# Original API Tests
def test_get_topics():
    """Test the topics endpoint"""
    try:
        response = requests.get(f"{API_BASE_URL}/topics", timeout=10)
        response.raise_for_status()
        data = response.json()
        
        # Check if the response contains the expected fields
        if not all(key in data for key in ["topics", "levels", "focus_areas"]):
            print(f"Topics response missing expected fields: {data}")
            return False
        
        # Check if the topics, levels, and focus_areas are non-empty
        if not data["topics"] or not data["levels"] or not data["focus_areas"]:
            print(f"Topics, levels, or focus_areas are empty: {data}")
            return False
        
        # Verify some expected topics are present
        expected_topics = ["network-security", "ethical-hacking", "cloud-security"]
        for topic in expected_topics:
            if topic not in data["topics"]:
                print(f"Expected topic '{topic}' not found in topics: {data['topics']}")
                return False
        
        # Verify some expected levels are present
        expected_levels = ["beginner", "intermediate", "advanced"]
        for level in expected_levels:
            if level not in data["levels"]:
                print(f"Expected level '{level}' not found in levels: {data['levels']}")
                return False
        
        # Verify some expected focus areas are present
        expected_focus_areas = ["Hands-on Labs", "Certification Preparation"]
        for focus_area in expected_focus_areas:
            if focus_area not in data["focus_areas"]:
                print(f"Expected focus area '{focus_area}' not found in focus_areas: {data['focus_areas']}")
                return False
        
        # Verify career goals are present (new field)
        if "career_goals" not in data:
            print(f"Career goals not found in response: {data}")
            return False
        
        # Verify question types are present (new field)
        if "question_types" not in data:
            print(f"Question types not found in response: {data}")
            return False
        
        print(f"Topics response contains {len(data['topics'])} topics, {len(data['levels'])} levels, {len(data['focus_areas'])} focus areas, {len(data['career_goals'])} career goals, and {len(data['question_types'])} question types")
        return {
            "success": True,
            "topics_count": len(data["topics"]),
            "levels_count": len(data["levels"]),
            "focus_areas_count": len(data["focus_areas"]),
            "career_goals_count": len(data["career_goals"]),
            "question_types_count": len(data["question_types"])
        }
    except requests.exceptions.RequestException as e:
        print(f"Get topics request failed: {e}")
        return False

def test_generate_assessment():
    """Test the generate assessment endpoint"""
    try:
        # Sample request parameters
        topic = "network-security"
        level = "beginner"
        career_goal = "student"
        
        print(f"Generating assessment with topic={topic}, level={level}, career_goal={career_goal}")
        
        response = requests.post(
            f"{API_BASE_URL}/generate-assessment?topic={topic}&level={level}&career_goal={career_goal}",
            timeout=60
        )
        
        # Check if the request was successful
        if response.status_code != 200:
            print(f"Generate assessment failed with status code {response.status_code}: {response.text}")
            return {
                "success": False,
                "status_code": response.status_code,
                "error": response.text
            }
        
        data = response.json()
        
        # Check if the response contains the expected fields
        expected_fields = ["success", "assessment_id", "topic", "level", "career_goal", "total_questions", "total_points", "questions"]
        for field in expected_fields:
            if field not in data:
                print(f"Generate assessment response missing expected field '{field}': {data}")
                return False
        
        # Check if the assessment_id is a valid UUID
        try:
            uuid_obj = uuid.UUID(data["assessment_id"])
            if str(uuid_obj) != data["assessment_id"]:
                print(f"assessment_id is not a valid UUID: {data['assessment_id']}")
                return False
        except ValueError:
            print(f"assessment_id is not a valid UUID: {data['assessment_id']}")
            return False
        
        # Check if questions are present and have the expected structure
        if not data["questions"] or not isinstance(data["questions"], list):
            print(f"Questions are missing or not a list: {data}")
            return False
        
        # Check the structure of the first question
        first_question = data["questions"][0]
        expected_question_fields = ["id", "question_type", "question_text", "options", "difficulty", "points"]
        for field in expected_question_fields:
            if field not in first_question:
                print(f"Question missing expected field '{field}': {first_question}")
                return False
        
        print(f"Generated assessment with ID: {data['assessment_id']}, {data['total_questions']} questions, {data['total_points']} total points")
        return {
            "success": True,
            "assessment_id": data["assessment_id"],
            "total_questions": data["total_questions"],
            "total_points": data["total_points"],
            "topic": data["topic"],
            "level": data["level"],
            "career_goal": data["career_goal"]
        }
    except requests.exceptions.RequestException as e:
        print(f"Generate assessment request failed: {e}")
        return False

def test_submit_assessment(assessment_id: str):
    """Test the submit assessment endpoint"""
    try:
        # Get the assessment to prepare responses
        response = requests.get(f"{API_BASE_URL}/assessment-result/{assessment_id}", timeout=10)
        if response.status_code == 404:
            # If we can't get the assessment directly, we'll create mock responses
            print("Could not retrieve assessment details, creating mock responses")
            
            # Sample submission data with mock responses
            submission_data = {
                "assessment_id": assessment_id,
                "responses": [
                    {
                        "question_id": str(uuid.uuid4()),  # Mock question ID
                        "answer": "To monitor and control network traffic based on security rules",
                        "time_spent": 30
                    },
                    {
                        "question_id": str(uuid.uuid4()),  # Mock question ID
                        "answer": "1. Document the observation with timestamps 2. Check network monitoring tools and logs 3. Isolate affected systems if necessary",
                        "time_spent": 60
                    },
                    {
                        "question_id": str(uuid.uuid4()),  # Mock question ID
                        "answer": "Confidentiality, Integrity, Availability",
                        "time_spent": 25
                    },
                    {
                        "question_id": str(uuid.uuid4()),  # Mock question ID
                        "answer": "DDoS Attack",
                        "time_spent": 20
                    },
                    {
                        "question_id": str(uuid.uuid4()),  # Mock question ID
                        "answer": "I'm interested in becoming a security analyst and want to develop skills in threat detection and incident response.",
                        "time_spent": 45
                    }
                ],
                "career_goal": "student",
                "current_role": "IT Support",
                "experience_years": 1
            }
        else:
            # If we got the assessment, create responses based on the actual questions
            assessment_data = response.json()
            
            # Create responses for each question
            responses = []
            for question in assessment_data.get("questions", []):
                # Create a response based on the question type
                if question["question_type"] == "mcq" and question.get("options"):
                    # For MCQ, use the first option as the answer
                    answer = question["options"][0]
                elif question["question_type"] == "fill_blank" and question.get("options"):
                    # For fill in the blank, join the options
                    answer = ", ".join(question["options"])
                else:
                    # For other types, provide a generic answer
                    answer = "This is a detailed response to the question, demonstrating understanding of the topic."
                
                responses.append({
                    "question_id": question["id"],
                    "answer": answer,
                    "time_spent": 30  # 30 seconds per question
                })
            
            submission_data = {
                "assessment_id": assessment_id,
                "responses": responses,
                "career_goal": "student",
                "current_role": "IT Support",
                "experience_years": 1
            }
        
        print(f"Submitting assessment with ID: {assessment_id}")
        
        response = requests.post(
            f"{API_BASE_URL}/submit-assessment",
            json=submission_data,
            timeout=30
        )
        
        # Check if the request was successful
        if response.status_code != 200:
            print(f"Submit assessment failed with status code {response.status_code}: {response.text}")
            return {
                "success": False,
                "status_code": response.status_code,
                "error": response.text
            }
        
        data = response.json()
        
        # Check if the response contains the expected fields
        expected_fields = ["success", "result_id", "score", "total_points", "percentage", "skill_level", "recommendations"]
        for field in expected_fields:
            if field not in data:
                print(f"Submit assessment response missing expected field '{field}': {data}")
                return False
        
        # Check if the result_id is a valid UUID
        try:
            uuid_obj = uuid.UUID(data["result_id"])
            if str(uuid_obj) != data["result_id"]:
                print(f"result_id is not a valid UUID: {data['result_id']}")
                return False
        except ValueError:
            print(f"result_id is not a valid UUID: {data['result_id']}")
            return False
        
        print(f"Assessment submitted successfully. Result ID: {data['result_id']}, Score: {data['score']}/{data['total_points']} ({data['percentage']}%), Skill level: {data['skill_level']}")
        return {
            "success": True,
            "result_id": data["result_id"],
            "score": data["score"],
            "total_points": data["total_points"],
            "percentage": data["percentage"],
            "skill_level": data["skill_level"],
            "recommendations": data["recommendations"]
        }
    except requests.exceptions.RequestException as e:
        print(f"Submit assessment request failed: {e}")
        return False

def test_generate_learning_plan():
    """Test the enhanced generate learning plan endpoint with table of contents"""
    try:
        # Sample request data
        request_data = {
            "topic": "network-security",
            "level": "beginner",
            "duration_weeks": 4,
            "focus_areas": ["Hands-on Labs", "Certification Preparation"],
            "user_background": "I have basic IT knowledge but new to cybersecurity"
        }
        
        print(f"Sending enhanced learning plan request: {json.dumps(request_data, indent=2)}")
        
        response = requests.post(
            f"{API_BASE_URL}/generate-learning-plan",
            json=request_data,
            timeout=300  # 5 minutes timeout for generation
        )
        
        # Check if the request was successful
        if response.status_code != 200:
            print(f"Generate learning plan failed with status code {response.status_code}: {response.text}")
            return {
                "success": False,
                "status_code": response.status_code,
                "error": response.text
            }
        
        data = response.json()
        
        # Check if the response contains the expected fields
        expected_fields = ["success", "plan_id", "curriculum", "topic", "level", "duration_weeks", "table_of_contents"]
        for field in expected_fields:
            if field not in data:
                print(f"Enhanced learning plan response missing expected field '{field}': {data}")
                return False
        
        # Check if the plan_id is a valid UUID
        try:
            uuid_obj = uuid.UUID(data["plan_id"])
            if str(uuid_obj) != data["plan_id"]:
                print(f"plan_id is not a valid UUID: {data['plan_id']}")
                return False
        except ValueError:
            print(f"plan_id is not a valid UUID: {data['plan_id']}")
            return False
        
        # Check if the curriculum is non-empty and contains expected sections
        if not data["curriculum"] or len(data["curriculum"]) < 100:
            print(f"Curriculum is empty or too short: {data['curriculum'][:100]}...")
            return False
        
        expected_sections = ["LEARNING OBJECTIVES", "PREREQUISITES", "WEEKLY CURRICULUM"]
        for section in expected_sections:
            if section not in data["curriculum"]:
                print(f"Expected section '{section}' not found in curriculum")
                return False
        
        # Check if table_of_contents has the expected structure
        toc = data["table_of_contents"]
        if not isinstance(toc, dict):
            print(f"table_of_contents is not a dictionary: {toc}")
            return False
        
        expected_toc_fields = ["chapters", "total_chapters", "total_estimated_time", "difficulty_level"]
        for field in expected_toc_fields:
            if field not in toc:
                print(f"table_of_contents missing expected field '{field}': {toc}")
                return False
        
        # Check if chapters is a list and has at least one chapter
        if not isinstance(toc["chapters"], list) or len(toc["chapters"]) == 0:
            print(f"chapters is not a list or is empty: {toc['chapters']}")
            return False
        
        # Check the structure of the first chapter
        first_chapter = toc["chapters"][0]
        expected_chapter_fields = ["id", "number", "title", "sections"]
        for field in expected_chapter_fields:
            if field not in first_chapter:
                print(f"Chapter missing expected field '{field}': {first_chapter}")
                return False
        
        print(f"Generated enhanced learning plan with ID: {data['plan_id']}")
        print(f"Table of Contents: {toc['total_chapters']} chapters, {toc['total_estimated_time']} minutes estimated time")
        
        return {
            "success": True,
            "plan_id": data["plan_id"],
            "curriculum_length": len(data["curriculum"]),
            "topic": data["topic"],
            "level": data["level"],
            "total_chapters": toc["total_chapters"],
            "total_estimated_time": toc["total_estimated_time"]
        }
    except requests.exceptions.RequestException as e:
        print(f"Generate enhanced learning plan request failed: {e}")
        return False

def test_approve_toc(plan_id: str):
    """Test the approve table of contents endpoint"""
    try:
        print(f"Testing TOC approval for plan ID: {plan_id}")
        
        # First, verify the plan exists
        get_plan_response = requests.get(f"{API_BASE_URL}/learning-plans/{plan_id}", timeout=10)
        if get_plan_response.status_code != 200:
            print(f"Plan with ID {plan_id} not found: {get_plan_response.status_code} - {get_plan_response.text}")
            return {
                "success": False,
                "status_code": get_plan_response.status_code,
                "error": f"Plan not found: {get_plan_response.text}"
            }
        
        # Now test the TOC approval endpoint
        print(f"Sending TOC approval request for plan ID: {plan_id}")
        response = requests.post(
            f"{API_BASE_URL}/approve-toc/{plan_id}",
            timeout=10
        )
        
        # Check if the request was successful
        if response.status_code != 200:
            print(f"Approve TOC failed with status code {response.status_code}: {response.text}")
            return {
                "success": False,
                "status_code": response.status_code,
                "error": response.text
            }
        
        data = response.json()
        
        # Check if the response contains the expected fields
        expected_fields = ["success", "plan_id", "toc_approved"]
        for field in expected_fields:
            if field not in data:
                print(f"Approve TOC response missing expected field '{field}': {data}")
                return False
        
        # Check if the TOC was approved
        if not data["toc_approved"]:
            print(f"TOC was not approved: {data}")
            return False
        
        print(f"Successfully approved TOC for plan with ID: {data['plan_id']}")
        return {
            "success": True,
            "plan_id": data["plan_id"],
            "toc_approved": data["toc_approved"]
        }
    except requests.exceptions.RequestException as e:
        print(f"Approve TOC request failed: {e}")
        return False

def test_get_chapter_content(plan_id: str, chapter_id: str):
    """Test the get chapter content endpoint"""
    try:
        print(f"Getting chapter content for plan ID: {plan_id}, chapter ID: {chapter_id}")
        
        response = requests.get(f"{API_BASE_URL}/learning-plans/{plan_id}/chapter/{chapter_id}", timeout=10)
        
        # Check if the request was successful
        if response.status_code != 200:
            print(f"Get chapter content failed with status code {response.status_code}: {response.text}")
            return {
                "success": False,
                "status_code": response.status_code,
                "error": response.text
            }
        
        data = response.json()
        
        # Check if the response contains the expected fields
        expected_fields = ["id", "chapter_number", "title", "description", "sections", "estimated_time"]
        for field in expected_fields:
            if field not in data:
                print(f"Chapter content response missing expected field '{field}': {data}")
                return False
        
        # Check if the id matches the requested chapter_id
        if data["id"] != chapter_id:
            print(f"Chapter ID mismatch: requested {chapter_id}, got {data['id']}")
            return False
        
        # Check if sections is a list
        if not isinstance(data["sections"], list):
            print(f"sections is not a list: {data}")
            return False
        
        # If there are sections, check the structure of the first section
        if data["sections"]:
            first_section = data["sections"][0]
            expected_section_fields = ["id", "title", "content", "estimated_time"]
            for field in expected_section_fields:
                if field not in first_section:
                    print(f"Section missing expected field '{field}': {first_section}")
                    return False
        
        print(f"Retrieved chapter content for chapter: {data['title']}")
        print(f"Chapter has {len(data['sections'])} sections, estimated time: {data['estimated_time']} minutes")
        
        return {
            "success": True,
            "chapter_id": data["id"],
            "chapter_title": data["title"],
            "sections_count": len(data["sections"]),
            "estimated_time": data["estimated_time"],
            "chapter_data": data
        }
    except requests.exceptions.RequestException as e:
        print(f"Get chapter content request failed: {e}")
        return False

def test_get_section_content(plan_id: str, section_id: str):
    """Test the get section content endpoint"""
    try:
        print(f"Getting section content for plan ID: {plan_id}, section ID: {section_id}")
        
        response = requests.get(f"{API_BASE_URL}/learning-plans/{plan_id}/section/{section_id}", timeout=10)
        
        # Check if the request was successful
        if response.status_code != 200:
            print(f"Get section content failed with status code {response.status_code}: {response.text}")
            return {
                "success": False,
                "status_code": response.status_code,
                "error": response.text
            }
        
        data = response.json()
        
        # Check if the response contains the expected fields
        expected_fields = ["id", "title", "content", "estimated_time"]
        for field in expected_fields:
            if field not in data:
                print(f"Section content response missing expected field '{field}': {data}")
                return False
        
        # Check if the id matches the requested section_id
        if data["id"] != section_id:
            print(f"Section ID mismatch: requested {section_id}, got {data['id']}")
            return False
        
        # Check if the content is non-empty
        if not data["content"] or len(data["content"]) < 10:
            print(f"content is empty or too short: {data['content']}")
            return False
        
        print(f"Retrieved section content for section: {data['title']}")
        print(f"Section content length: {len(data['content'])} characters, estimated time: {data['estimated_time']} minutes")
        
        return {
            "success": True,
            "section_id": data["id"],
            "section_title": data["title"],
            "content_length": len(data["content"]),
            "estimated_time": data["estimated_time"]
        }
    except requests.exceptions.RequestException as e:
        print(f"Get section content request failed: {e}")
        return False

# V2 API Tests
def test_v2_health_check():
    """Test the v2 health check endpoint"""
    try:
        response = requests.get(f"{API_V2_BASE_URL}/health", timeout=10)
        response.raise_for_status()
        data = response.json()
        
        # Check if the response contains the expected fields
        if not all(key in data for key in ["status", "timestamp", "services"]):
            print(f"Health check missing expected fields: {data}")
            return False
        
        # Check if the status is healthy
        if data["status"] != "healthy":
            print(f"Health check status is not healthy: {data}")
            return {
                "success": False,
                "response": data,
                "message": "Health check indicates unhealthy status"
            }
        
        print(f"Health check response: {data}")
        return {
            "success": True,
            "response": data
        }
    except requests.exceptions.RequestException as e:
        print(f"Health check request failed: {e}")
        return False

def test_v2_get_career_fields():
    """Test the v2 career fields endpoint"""
    try:
        response = requests.get(f"{API_V2_BASE_URL}/career-fields", timeout=10)
        response.raise_for_status()
        data = response.json()
        
        # Check if the response contains the expected fields
        if "career_fields" not in data:
            print(f"Career fields response missing expected fields: {data}")
            return False
        
        # Check if career_fields is a list
        if not isinstance(data["career_fields"], list) or not data["career_fields"]:
            print(f"Career fields is not a list or is empty: {data}")
            return False
        
        # Check the structure of the first career field
        first_field = data["career_fields"][0]
        expected_fields = ["id", "name", "description"]
        for field in expected_fields:
            if field not in first_field:
                print(f"Career field missing expected field '{field}': {first_field}")
                return False
        
        print(f"Career fields response contains {len(data['career_fields'])} fields")
        return {
            "success": True,
            "career_fields_count": len(data["career_fields"]),
            "fields": [field["id"] for field in data["career_fields"]]
        }
    except requests.exceptions.RequestException as e:
        print(f"Get career fields request failed: {e}")
        return False

def test_v2_get_technologies():
    """Test the v2 technologies endpoint"""
    try:
        response = requests.get(f"{API_V2_BASE_URL}/technologies", timeout=10)
        response.raise_for_status()
        data = response.json()
        
        # Check if the response contains the expected fields
        if "technologies" not in data:
            print(f"Technologies response missing expected fields: {data}")
            return False
        
        # Check if technologies is a list
        if not isinstance(data["technologies"], list) or not data["technologies"]:
            print(f"Technologies is not a list or is empty: {data}")
            return False
        
        # Check the structure of the first technology
        first_tech = data["technologies"][0]
        expected_fields = ["id", "name", "category"]
        for field in expected_fields:
            if field not in first_tech:
                print(f"Technology missing expected field '{field}': {first_tech}")
                return False
        
        print(f"Technologies response contains {len(data['technologies'])} technologies")
        return {
            "success": True,
            "technologies_count": len(data["technologies"]),
            "categories": list(set(tech["category"] for tech in data["technologies"]))
        }
    except requests.exceptions.RequestException as e:
        print(f"Get technologies request failed: {e}")
        return False

def test_v2_generate_roadmap():
    """Test the v2 roadmap generation endpoint"""
    try:
        # Sample request data
        request_data = {
            "career_field": "cybersecurity",
            "experience_level": "entry",
            "specialization": "network security",
            "duration_months": 12,
            "focus_areas": ["Hands-on Labs", "Certification Preparation"]
        }
        
        print(f"Sending roadmap generation request: {json.dumps(request_data, indent=2)}")
        
        response = requests.post(
            f"{API_V2_BASE_URL}/roadmap/generate",
            json=request_data,
            timeout=60
        )
        
        # Check if the request was successful
        if response.status_code != 200:
            print(f"Generate roadmap failed with status code {response.status_code}: {response.text}")
            return {
                "success": False,
                "status_code": response.status_code,
                "error": response.text
            }
        
        data = response.json()
        
        # Check if the response contains the expected fields
        expected_fields = ["id", "career_field", "experience_level", "specialization", "phases", "total_duration", "market_demand", "salary_range", "roadmap_content"]
        for field in expected_fields:
            if field not in data:
                print(f"Roadmap response missing expected field '{field}': {data}")
                return False
        
        # Check if the id is a valid UUID
        try:
            uuid_obj = uuid.UUID(data["id"])
            if str(uuid_obj) != data["id"]:
                print(f"id is not a valid UUID: {data['id']}")
                return False
        except ValueError:
            print(f"id is not a valid UUID: {data['id']}")
            return False
        
        # Check if phases is a list
        if not isinstance(data["phases"], list):
            print(f"phases is not a list: {data}")
            return False
        
        # If there are phases, check the structure of the first phase
        if data["phases"]:
            first_phase = data["phases"][0]
            expected_phase_fields = ["title", "description", "skills", "duration"]
            for field in expected_phase_fields:
                if field not in first_phase:
                    print(f"Phase missing expected field '{field}': {first_phase}")
                    return False
        
        print(f"Generated roadmap with ID: {data['id']}")
        print(f"Career field: {data['career_field']}, Experience level: {data['experience_level']}")
        print(f"Phases: {len(data['phases'])}, Total duration: {data['total_duration']}")
        
        return {
            "success": True,
            "roadmap_id": data["id"],
            "career_field": data["career_field"],
            "experience_level": data["experience_level"],
            "phases_count": len(data["phases"]),
            "total_duration": data["total_duration"]
        }
    except requests.exceptions.RequestException as e:
        print(f"Generate roadmap request failed: {e}")
        return False

def test_v2_generate_lesson():
    """Test the v2 lesson generation endpoint"""
    try:
        # Sample request data
        request_data = {
            "topic": "Network Security Fundamentals",
            "difficulty": "beginner",
            "lesson_type": "tutorial",
            "duration_minutes": 30
        }
        
        print(f"Sending lesson generation request: {json.dumps(request_data, indent=2)}")
        
        response = requests.post(
            f"{API_V2_BASE_URL}/lesson/generate",
            json=request_data,
            timeout=60
        )
        
        # Check if the request was successful
        if response.status_code != 200:
            print(f"Generate lesson failed with status code {response.status_code}: {response.text}")
            return {
                "success": False,
                "status_code": response.status_code,
                "error": response.text
            }
        
        data = response.json()
        
        # Check if the response contains the expected fields
        expected_fields = ["id", "topic", "difficulty", "lesson_type", "estimated_time", "full_content"]
        for field in expected_fields:
            if field not in data:
                print(f"Lesson response missing expected field '{field}': {data}")
                return False
        
        # Check if the id is a valid UUID
        try:
            uuid_obj = uuid.UUID(data["id"])
            if str(uuid_obj) != data["id"]:
                print(f"id is not a valid UUID: {data['id']}")
                return False
        except ValueError:
            print(f"id is not a valid UUID: {data['id']}")
            return False
        
        # Check if the full_content is non-empty
        if not data["full_content"] or len(data["full_content"]) < 100:
            print(f"full_content is empty or too short: {data['full_content'][:100]}...")
            return False
        
        print(f"Generated lesson with ID: {data['id']}")
        print(f"Topic: {data['topic']}, Difficulty: {data['difficulty']}")
        print(f"Estimated time: {data['estimated_time']}")
        
        return {
            "success": True,
            "lesson_id": data["id"],
            "topic": data["topic"],
            "difficulty": data["difficulty"],
            "estimated_time": data["estimated_time"]
        }
    except requests.exceptions.RequestException as e:
        print(f"Generate lesson request failed: {e}")
        return False

def test_v2_generate_assessment():
    """Test the v2 assessment generation endpoint"""
    try:
        # Sample request data
        request_data = {
            "skill": "Network Security",
            "level": "beginner",
            "question_count": 5,
            "assessment_type": "comprehensive"
        }
        
        print(f"Sending assessment generation request: {json.dumps(request_data, indent=2)}")
        
        response = requests.post(
            f"{API_V2_BASE_URL}/assessment/generate",
            json=request_data,
            timeout=60
        )
        
        # Check if the request was successful
        if response.status_code != 200:
            print(f"Generate assessment failed with status code {response.status_code}: {response.text}")
            return {
                "success": False,
                "status_code": response.status_code,
                "error": response.text
            }
        
        data = response.json()
        
        # Check if the response contains the expected fields
        expected_fields = ["id", "skill", "level", "total_questions", "total_points", "time_limit_minutes"]
        for field in expected_fields:
            if field not in data:
                print(f"Assessment response missing expected field '{field}': {data}")
                return False
        
        # Check if the id is a valid UUID
        try:
            uuid_obj = uuid.UUID(data["id"])
            if str(uuid_obj) != data["id"]:
                print(f"id is not a valid UUID: {data['id']}")
                return False
        except ValueError:
            print(f"id is not a valid UUID: {data['id']}")
            return False
        
        print(f"Generated assessment with ID: {data['id']}")
        print(f"Skill: {data['skill']}, Level: {data['level']}")
        print(f"Total questions: {data['total_questions']}, Total points: {data['total_points']}")
        
        return {
            "success": True,
            "assessment_id": data["id"],
            "skill": data["skill"],
            "level": data["level"],
            "total_questions": data["total_questions"],
            "total_points": data["total_points"]
        }
    except requests.exceptions.RequestException as e:
        print(f"Generate assessment request failed: {e}")
        return False

def test_v2_generate_market_insights():
    """Test the v2 market insights generation endpoint"""
    try:
        # Sample request data
        request_data = {
            "role": "Cybersecurity Analyst",
            "location": "United States",
            "experience_level": "mid"
        }
        
        print(f"Sending market insights generation request: {json.dumps(request_data, indent=2)}")
        
        response = requests.post(
            f"{API_V2_BASE_URL}/market-insights/generate",
            json=request_data,
            timeout=60
        )
        
        # Check if the request was successful
        if response.status_code != 200:
            print(f"Generate market insights failed with status code {response.status_code}: {response.text}")
            return {
                "success": False,
                "status_code": response.status_code,
                "error": response.text
            }
        
        data = response.json()
        
        # Check if the response contains the expected fields
        expected_fields = ["id", "role", "location", "market_insights", "last_updated"]
        for field in expected_fields:
            if field not in data:
                print(f"Market insights response missing expected field '{field}': {data}")
                return False
        
        # Check if the id is a valid UUID
        try:
            uuid_obj = uuid.UUID(data["id"])
            if str(uuid_obj) != data["id"]:
                print(f"id is not a valid UUID: {data['id']}")
                return False
        except ValueError:
            print(f"id is not a valid UUID: {data['id']}")
            return False
        
        # Check if the market_insights is non-empty
        if not data["market_insights"] or len(data["market_insights"]) < 100:
            print(f"market_insights is empty or too short: {data['market_insights'][:100]}...")
            return False
        
        print(f"Generated market insights with ID: {data['id']}")
        print(f"Role: {data['role']}, Location: {data['location']}")
        
        return {
            "success": True,
            "insights_id": data["id"],
            "role": data["role"],
            "location": data["location"]
        }
    except requests.exceptions.RequestException as e:
        print(f"Generate market insights request failed: {e}")
        return False

def test_v2_generate_lab():
    """Test the v2 lab exercise generation endpoint"""
    try:
        # Sample request data
        request_data = {
            "technology": "Wireshark",
            "difficulty": "beginner",
            "duration_minutes": 45,
            "lab_type": "hands-on"
        }
        
        print(f"Sending lab exercise generation request: {json.dumps(request_data, indent=2)}")
        
        response = requests.post(
            f"{API_V2_BASE_URL}/lab/generate",
            json=request_data,
            timeout=60
        )
        
        # Check if the request was successful
        if response.status_code != 200:
            print(f"Generate lab exercise failed with status code {response.status_code}: {response.text}")
            return {
                "success": False,
                "status_code": response.status_code,
                "error": response.text
            }
        
        data = response.json()
        
        # Check if the response contains the expected fields
        expected_fields = ["id", "technology", "difficulty", "duration_minutes", "lab_content"]
        for field in expected_fields:
            if field not in data:
                print(f"Lab exercise response missing expected field '{field}': {data}")
                return False
        
        # Check if the id is a valid UUID
        try:
            uuid_obj = uuid.UUID(data["id"])
            if str(uuid_obj) != data["id"]:
                print(f"id is not a valid UUID: {data['id']}")
                return False
        except ValueError:
            print(f"id is not a valid UUID: {data['id']}")
            return False
        
        # Check if the lab_content is non-empty
        if not data["lab_content"] or len(data["lab_content"]) < 100:
            print(f"lab_content is empty or too short: {data['lab_content'][:100]}...")
            return False
        
        print(f"Generated lab exercise with ID: {data['id']}")
        print(f"Technology: {data['technology']}, Difficulty: {data['difficulty']}")
        print(f"Duration: {data['duration_minutes']} minutes")
        
        return {
            "success": True,
            "lab_id": data["id"],
            "technology": data["technology"],
            "difficulty": data["difficulty"],
            "duration_minutes": data["duration_minutes"]
        }
    except requests.exceptions.RequestException as e:
        print(f"Generate lab exercise request failed: {e}")
        return False

def run_all_tests():
    """Run all tests in sequence"""
    print(f"\n{'='*80}\nRunning Comprehensive AI Learning Platform API Tests\n{'='*80}")
    print(f"API Base URL: {API_BASE_URL}")
    print(f"API v2 Base URL: {API_V2_BASE_URL}")
    
    # Test original API endpoints
    print(f"\n{'='*80}\nTesting Original API Endpoints\n{'='*80}")
    
    # Test get topics
    run_test("Get Topics", test_get_topics)
    
    # Test assessment generation
    assessment_result = run_test("Generate Assessment", test_generate_assessment)
    
    assessment_id = None
    assessment_result_id = None
    if assessment_result and assessment_result.get("success"):
        assessment_id = assessment_result.get("assessment_id")
        
        # Test assessment submission
        submission_result = run_test("Submit Assessment", test_submit_assessment, assessment_id)
        
        if submission_result and submission_result.get("success"):
            assessment_result_id = submission_result.get("result_id")
    
    # Test generate learning plan
    plan_result = run_test("Generate Learning Plan", test_generate_learning_plan)
    
    # If plan generation succeeded, test TOC approval and chapter/section content
    plan_id = None
    if plan_result and plan_result.get("success"):
        plan_id = plan_result.get("plan_id")
        
        # Test TOC approval
        toc_result = run_test("Approve Table of Contents", test_approve_toc, plan_id)
        
        # Test chapter content
        # First, get the plan to extract a chapter ID
        try:
            plan_response = requests.get(f"{API_BASE_URL}/learning-plans/{plan_id}", timeout=10)
            if plan_response.status_code == 200:
                plan_data = plan_response.json()
                if "table_of_contents" in plan_data and "chapters" in plan_data["table_of_contents"]:
                    chapters = plan_data["table_of_contents"]["chapters"]
                    if chapters and len(chapters) > 0:
                        chapter_id = chapters[0]["id"]
                        # Test chapter content
                        chapter_result = run_test("Get Chapter Content", test_get_chapter_content, plan_id, chapter_id)
                        
                        # If chapter content retrieval succeeded, test section content
                        if chapter_result and chapter_result.get("success"):
                            chapter_data = chapter_result.get("chapter_data", {})
                            if "sections" in chapter_data and chapter_data["sections"] and len(chapter_data["sections"]) > 0:
                                section_id = chapter_data["sections"][0]["id"]
                                run_test("Get Section Content", test_get_section_content, plan_id, section_id)
        except Exception as e:
            print(f"Error retrieving chapter/section IDs: {e}")
    
    # Test v2 API endpoints
    print(f"\n{'='*80}\nTesting v2 API Endpoints\n{'='*80}")
    
    # Test health check
    run_test("v2 Health Check", test_v2_health_check)
    
    # Test get career fields
    run_test("v2 Get Career Fields", test_v2_get_career_fields)
    
    # Test get technologies
    run_test("v2 Get Technologies", test_v2_get_technologies)
    
    # Test roadmap generation
    run_test("v2 Generate Career Roadmap", test_v2_generate_roadmap)
    
    # Test lesson generation
    run_test("v2 Generate Lesson Content", test_v2_generate_lesson)
    
    # Test assessment generation
    run_test("v2 Generate Skill Assessment", test_v2_generate_assessment)
    
    # Test market insights generation
    run_test("v2 Generate Market Insights", test_v2_generate_market_insights)
    
    # Test lab exercise generation
    run_test("v2 Generate Lab Exercise", test_v2_generate_lab)
    
    # Print summary
    print(f"\n{'='*80}\nTest Summary\n{'='*80}")
    print(f"Total tests: {test_results['total_tests']}")
    print(f"Passed tests: {test_results['passed_tests']}")
    print(f"Failed tests: {test_results['failed_tests']}")
    print(f"Success rate: {(test_results['passed_tests'] / test_results['total_tests']) * 100:.2f}%")
    
    # Print detailed results
    print(f"\n{'='*80}\nDetailed Test Results\n{'='*80}")
    for i, test in enumerate(test_results["test_details"], 1):
        print(f"{i}. {test['name']}: {test['status']}")
        if "duration" in test:
            print(f"   Duration: {test['duration']}s")
        if test["status"] != "PASSED":
            print(f"   Details: {json.dumps(test['details'], indent=2)}")
    
    return test_results

if __name__ == "__main__":
    run_all_tests()