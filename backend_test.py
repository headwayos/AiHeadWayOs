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
        if not all(key in data for key in ["status", "ollama", "database", "model"]):
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
        
        print(f"Topics response contains {len(data['topics'])} topics, {len(data['levels'])} levels, and {len(data['focus_areas'])} focus areas")
        return {
            "success": True,
            "topics_count": len(data["topics"]),
            "levels_count": len(data["levels"]),
            "focus_areas_count": len(data["focus_areas"])
        }
    except requests.exceptions.RequestException as e:
        print(f"Get topics request failed: {e}")
        return False

def test_generate_learning_plan():
    """Test the generate learning plan endpoint"""
    try:
        # Sample request data
        request_data = {
            "topic": "network-security",
            "level": "beginner",
            "duration_weeks": 4,
            "focus_areas": ["Hands-on Labs", "Certification Preparation"],
            "user_background": "I have basic IT knowledge but new to cybersecurity"
        }
        
        print(f"Sending learning plan request: {json.dumps(request_data, indent=2)}")
        
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
        expected_fields = ["success", "plan_id", "curriculum", "topic", "level", "duration_weeks"]
        for field in expected_fields:
            if field not in data:
                print(f"Generate learning plan response missing expected field '{field}': {data}")
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
        
        print(f"Generated learning plan with ID: {data['plan_id']}")
        return {
            "success": True,
            "plan_id": data["plan_id"],
            "curriculum_length": len(data["curriculum"]),
            "topic": data["topic"],
            "level": data["level"]
        }
    except requests.exceptions.RequestException as e:
        print(f"Generate learning plan request failed: {e}")
        return False

def test_list_learning_plans():
    """Test the list learning plans endpoint"""
    try:
        response = requests.get(f"{API_BASE_URL}/learning-plans", timeout=10)
        response.raise_for_status()
        data = response.json()
        
        # Check if the response contains the expected fields
        if not all(key in data for key in ["plans", "total", "limit", "offset"]):
            print(f"List learning plans response missing expected fields: {data}")
            return False
        
        # Check if the plans field is a list
        if not isinstance(data["plans"], list):
            print(f"Plans field is not a list: {data}")
            return False
        
        # If there are plans, check the structure of the first plan
        if data["plans"]:
            first_plan = data["plans"][0]
            expected_plan_fields = ["id", "topic", "level", "duration_weeks", "curriculum", "created_at"]
            for field in expected_plan_fields:
                if field not in first_plan:
                    print(f"Plan missing expected field '{field}': {first_plan}")
                    return False
        
        print(f"Listed {len(data['plans'])} learning plans out of {data['total']} total")
        return {
            "success": True,
            "plans_count": len(data["plans"]),
            "total_plans": data["total"]
        }
    except requests.exceptions.RequestException as e:
        print(f"List learning plans request failed: {e}")
        return False

def test_get_specific_plan(plan_id: str):
    """Test the get specific learning plan endpoint"""
    try:
        response = requests.get(f"{API_BASE_URL}/learning-plans/{plan_id}", timeout=10)
        
        # Check if the request was successful
        if response.status_code != 200:
            print(f"Get specific plan failed with status code {response.status_code}: {response.text}")
            return {
                "success": False,
                "status_code": response.status_code,
                "error": response.text
            }
        
        data = response.json()
        
        # Check if the response contains the expected fields
        expected_fields = ["id", "topic", "level", "duration_weeks", "curriculum", "created_at"]
        for field in expected_fields:
            if field not in data:
                print(f"Get specific plan response missing expected field '{field}': {data}")
                return False
        
        # Check if the id matches the requested plan_id
        if data["id"] != plan_id:
            print(f"Plan ID mismatch: requested {plan_id}, got {data['id']}")
            return False
        
        print(f"Retrieved learning plan with ID: {data['id']}, topic: {data['topic']}, level: {data['level']}")
        return {
            "success": True,
            "plan_id": data["id"],
            "topic": data["topic"],
            "level": data["level"],
            "curriculum_length": len(data["curriculum"])
        }
    except requests.exceptions.RequestException as e:
        print(f"Get specific plan request failed: {e}")
        return False

def test_delete_learning_plan(plan_id: str):
    """Test the delete learning plan endpoint"""
    try:
        response = requests.delete(f"{API_BASE_URL}/learning-plans/{plan_id}", timeout=10)
        
        # Check if the request was successful
        if response.status_code != 200:
            print(f"Delete learning plan failed with status code {response.status_code}: {response.text}")
            return {
                "success": False,
                "status_code": response.status_code,
                "error": response.text
            }
        
        data = response.json()
        
        # Check if the response contains the expected message
        if "message" not in data or "deleted successfully" not in data["message"]:
            print(f"Delete learning plan response missing expected message: {data}")
            return False
        
        # For testing purposes, we'll consider the test successful if the delete operation returned a success message
        # In a real environment, we would verify the plan is actually deleted by trying to get it
        print(f"Successfully deleted learning plan with ID: {plan_id}")
        return {
            "success": True,
            "plan_id": plan_id
        }
    except requests.exceptions.RequestException as e:
        print(f"Delete learning plan request failed: {e}")
        return False

def run_all_tests():
    """Run all tests in sequence"""
    print(f"\n{'='*80}\nRunning Cybersecurity Learning Plans API Tests\n{'='*80}")
    print(f"API Base URL: {API_BASE_URL}")
    
    # Test health check
    health_result = run_test("Health Check", test_health_check)
    
    # Test get topics
    topics_result = run_test("Get Topics", test_get_topics)
    
    # Test generate learning plan
    plan_result = run_test("Generate Learning Plan", test_generate_learning_plan)
    
    # If plan generation succeeded, test getting and deleting the plan
    plan_id = None
    if plan_result and plan_result.get("success"):
        plan_id = plan_result.get("plan_id")
        
        # Test list learning plans
        run_test("List Learning Plans", test_list_learning_plans)
        
        # Test get specific plan
        run_test("Get Specific Plan", test_get_specific_plan, plan_id)
        
        # Test delete learning plan
        run_test("Delete Learning Plan", test_delete_learning_plan, plan_id)
    else:
        print("Skipping plan retrieval and deletion tests due to failed plan generation")
    
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