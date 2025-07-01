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

def test_enhanced_learning_plan():
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
            f"{API_BASE_URL}/approve-toc/{plan_id}?approved=true",
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
        
        print(f"Successfully approved TOC for learning plan with ID: {data['plan_id']}")
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
                print(f"Chapter content missing expected field '{field}': {data}")
                return False
        
        # Check if the id matches the requested chapter_id
        if data["id"] != chapter_id:
            print(f"Chapter ID mismatch: requested {chapter_id}, got {data['id']}")
            return False
        
        # Check if sections is a list and has at least one section
        if not isinstance(data["sections"], list) or len(data["sections"]) == 0:
            print(f"Sections is not a list or is empty: {data['sections']}")
            return False
        
        # Check the structure of the first section
        first_section = data["sections"][0]
        expected_section_fields = ["id", "title", "content", "estimated_time"]
        for field in expected_section_fields:
            if field not in first_section:
                print(f"Section missing expected field '{field}': {first_section}")
                return False
        
        print(f"Retrieved chapter content: {data['title']}, {len(data['sections'])} sections")
        return {
            "success": True,
            "chapter_id": data["id"],
            "title": data["title"],
            "sections_count": len(data["sections"]),
            "estimated_time": data["estimated_time"]
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
                print(f"Section content missing expected field '{field}': {data}")
                return False
        
        # Check if the id matches the requested section_id
        if data["id"] != section_id:
            print(f"Section ID mismatch: requested {section_id}, got {data['id']}")
            return False
        
        # Check if content is non-empty
        if not data["content"] or len(data["content"]) < 10:
            print(f"Content is empty or too short: {data['content']}")
            return False
        
        print(f"Retrieved section content: {data['title']}, {len(data['content'])} characters")
        return {
            "success": True,
            "section_id": data["id"],
            "title": data["title"],
            "content_length": len(data["content"]),
            "estimated_time": data["estimated_time"]
        }
    except requests.exceptions.RequestException as e:
        print(f"Get section content request failed: {e}")
        return False

def test_approve_learning_plan(plan_id: str):
    """Test the approve learning plan endpoint"""
    try:
        print(f"Testing plan approval for plan ID: {plan_id}")
        
        # First, verify the plan exists
        get_plan_response = requests.get(f"{API_BASE_URL}/learning-plans/{plan_id}", timeout=10)
        if get_plan_response.status_code != 200:
            print(f"Plan with ID {plan_id} not found: {get_plan_response.status_code} - {get_plan_response.text}")
            return {
                "success": False,
                "status_code": get_plan_response.status_code,
                "error": f"Plan not found: {get_plan_response.text}"
            }
        
        # Now test the approval endpoint
        print(f"Sending approval request for plan ID: {plan_id}")
        response = requests.post(
            f"{API_BASE_URL}/approve-learning-plan/{plan_id}?approved=true",
            timeout=10
        )
        
        # Check if the request was successful
        if response.status_code != 200:
            print(f"Approve learning plan failed with status code {response.status_code}: {response.text}")
            return {
                "success": False,
                "status_code": response.status_code,
                "error": response.text
            }
        
        data = response.json()
        
        # Check if the response contains the expected fields
        expected_fields = ["success", "plan_id", "approved"]
        for field in expected_fields:
            if field not in data:
                print(f"Approve learning plan response missing expected field '{field}': {data}")
                return False
        
        # Check if the plan was approved
        if not data["approved"]:
            print(f"Plan was not approved: {data}")
            return False
        
        print(f"Successfully approved learning plan with ID: {data['plan_id']}")
        return {
            "success": True,
            "plan_id": data["plan_id"],
            "approved": data["approved"]
        }
    except requests.exceptions.RequestException as e:
        print(f"Approve learning plan request failed: {e}")
        return False

def test_structured_learning_plan_workflow():
    """Test the complete structured learning plan workflow"""
    print(f"\n{'='*80}\nTesting Structured Learning Plan Workflow\n{'='*80}")
    
    # Step 1: Generate enhanced learning plan with table of contents
    plan_result = run_test("Enhanced Learning Plan Generation", test_enhanced_learning_plan)
    
    if not plan_result or not plan_result.get("success"):
        print("Enhanced learning plan generation failed, skipping remaining tests")
        return False
    
    plan_id = plan_result.get("plan_id")
    print(f"Generated plan ID: {plan_id}")
    
    # Step 2: Get the plan to extract chapter and section IDs
    try:
        print("Getting plan details to extract chapter and section IDs")
        plan_response = requests.get(f"{API_BASE_URL}/learning-plans/{plan_id}", timeout=10)
        plan_response.raise_for_status()
        plan_data = plan_response.json()
        
        # Extract chapter and section IDs
        chapters = plan_data.get("chapters", [])
        if not chapters:
            print("No chapters found in the plan")
            return False
        
        chapter_id = chapters[0].get("id")
        if not chapter_id:
            print("No chapter ID found")
            return False
        
        sections = chapters[0].get("sections", [])
        if not sections:
            print("No sections found in the chapter")
            return False
        
        section_id = sections[0].get("id")
        if not section_id:
            print("No section ID found")
            return False
        
        print(f"Extracted chapter ID: {chapter_id}, section ID: {section_id}")
    except Exception as e:
        print(f"Error extracting chapter and section IDs: {e}")
        return False
    
    # Step 3: Approve the table of contents
    toc_result = run_test("Table of Contents Approval", test_approve_toc, plan_id)
    
    if not toc_result or not toc_result.get("success"):
        print("Table of contents approval failed, skipping remaining tests")
        return False
    
    # Step 4: Get chapter content
    chapter_result = run_test("Get Chapter Content", test_get_chapter_content, plan_id, chapter_id)
    
    if not chapter_result or not chapter_result.get("success"):
        print("Get chapter content failed, skipping remaining tests")
        return False
    
    # Step 5: Get section content
    section_result = run_test("Get Section Content", test_get_section_content, plan_id, section_id)
    
    if not section_result or not section_result.get("success"):
        print("Get section content failed")
        return False
    
    # Step 6: Approve the learning plan
    approval_result = run_test("Approve Learning Plan", test_approve_learning_plan, plan_id)
    
    if not approval_result or not approval_result.get("success"):
        print("Learning plan approval failed")
        return False
    
    print(f"\n{'='*80}\nStructured Learning Plan Workflow Test Complete\n{'='*80}")
    print("All tests passed successfully!")
    
    # Print summary
    print(f"\n{'='*80}\nTest Summary\n{'='*80}")
    print(f"Total tests: {test_results['total_tests']}")
    print(f"Passed tests: {test_results['passed_tests']}")
    print(f"Failed tests: {test_results['failed_tests']}")
    print(f"Success rate: {(test_results['passed_tests'] / test_results['total_tests']) * 100:.2f}%")
    
    return test_results['failed_tests'] == 0

if __name__ == "__main__":
    test_structured_learning_plan_workflow()