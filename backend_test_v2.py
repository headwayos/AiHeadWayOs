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

API_BASE_URL = f"{BACKEND_URL}/api/v2"
print(f"Using API base URL: {API_BASE_URL}")

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

def test_health_check():
    """Test the health check endpoint"""
    try:
        response = requests.get(f"{API_BASE_URL}/health", timeout=10)
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

def test_get_career_fields():
    """Test the career fields endpoint"""
    try:
        response = requests.get(f"{API_BASE_URL}/career-fields", timeout=10)
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

def test_get_technologies():
    """Test the technologies endpoint"""
    try:
        response = requests.get(f"{API_BASE_URL}/technologies", timeout=10)
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

def test_generate_roadmap():
    """Test the roadmap generation endpoint"""
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
            f"{API_BASE_URL}/roadmap/generate",
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

def test_generate_lesson():
    """Test the lesson generation endpoint"""
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
            f"{API_BASE_URL}/lesson/generate",
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

def test_generate_assessment():
    """Test the assessment generation endpoint"""
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
            f"{API_BASE_URL}/assessment/generate",
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

def test_generate_market_insights():
    """Test the market insights generation endpoint"""
    try:
        # Sample request data
        request_data = {
            "role": "Cybersecurity Analyst",
            "location": "United States",
            "experience_level": "mid"
        }
        
        print(f"Sending market insights generation request: {json.dumps(request_data, indent=2)}")
        
        response = requests.post(
            f"{API_BASE_URL}/market-insights/generate",
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

def test_generate_lab():
    """Test the lab exercise generation endpoint"""
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
            f"{API_BASE_URL}/lab/generate",
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
    print(f"\n{'='*80}\nRunning Enhanced AI Learning Platform API Tests (v2)\n{'='*80}")
    print(f"API Base URL: {API_BASE_URL}")
    
    # Test health check
    run_test("Health Check", test_health_check)
    
    # Test get career fields
    run_test("Get Career Fields", test_get_career_fields)
    
    # Test get technologies
    run_test("Get Technologies", test_get_technologies)
    
    # Test roadmap generation
    roadmap_result = run_test("Generate Career Roadmap", test_generate_roadmap)
    
    # Test lesson generation
    lesson_result = run_test("Generate Lesson Content", test_generate_lesson)
    
    # Test assessment generation
    assessment_result = run_test("Generate Skill Assessment", test_generate_assessment)
    
    # Test market insights generation
    market_result = run_test("Generate Market Insights", test_generate_market_insights)
    
    # Test lab exercise generation
    lab_result = run_test("Generate Lab Exercise", test_generate_lab)
    
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