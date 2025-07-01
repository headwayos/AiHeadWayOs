#!/usr/bin/env python3
import requests
import json
import time
import os
import sys
import uuid
from datetime import datetime

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

def test_chat_with_ai(session_id):
    """Test the chat with AI endpoint"""
    print(f"\n{'='*80}\nTesting Chat with AI\n{'='*80}")
    
    try:
        # First, verify the session exists
        get_session_response = requests.get(f"{API_BASE_URL}/learning-session/{session_id}", timeout=10)
        if get_session_response.status_code != 200:
            print(f"Session with ID {session_id} not found: {get_session_response.status_code} - {get_session_response.text}")
            return False
        
        # Sample message
        message = "Can you explain the concept of defense in depth in network security?"
        
        print(f"Sending chat message to AI for session {session_id}: '{message}'")
        
        response = requests.post(
            f"{API_BASE_URL}/chat-with-ai?session_id={session_id}&message={message}",
            timeout=60
        )
        
        # Check if the request was successful
        if response.status_code != 200:
            print(f"Chat with AI failed with status code {response.status_code}: {response.text}")
            return False
        
        data = response.json()
        
        # Check if the response contains the expected fields
        expected_fields = ["success", "ai_response", "message_id"]
        for field in expected_fields:
            if field not in data:
                print(f"Chat with AI response missing expected field '{field}': {data}")
                return False
        
        # Check if the ai_response is non-empty
        if not data["ai_response"] or len(data["ai_response"]) < 10:
            print(f"AI response is empty or too short: {data['ai_response']}")
            return False
        
        # Check if the message_id is a valid UUID
        try:
            uuid_obj = uuid.UUID(data["message_id"])
            if str(uuid_obj) != data["message_id"]:
                print(f"message_id is not a valid UUID: {data['message_id']}")
                return False
        except ValueError:
            print(f"message_id is not a valid UUID: {data['message_id']}")
            return False
        
        print(f"Received AI response with message ID: {data['message_id']}")
        print(f"AI response preview: {data['ai_response'][:100]}...")
        
        # Send a second message to ensure we have multiple messages for chat history testing
        second_message = "What are some practical examples of implementing defense in depth?"
        print(f"Sending second chat message: '{second_message}'")
        
        second_response = requests.post(
            f"{API_BASE_URL}/chat-with-ai?session_id={session_id}&message={second_message}",
            timeout=60
        )
        
        if second_response.status_code != 200:
            print(f"Second chat message failed with status code {second_response.status_code}: {second_response.text}")
            return False
        
        second_data = second_response.json()
        print(f"Received second AI response with message ID: {second_data['message_id']}")
        
        return True
    except requests.exceptions.RequestException as e:
        print(f"Chat with AI request failed: {e}")
        return False

def test_get_chat_history(session_id):
    """Test the get chat history endpoint with detailed diagnostics"""
    print(f"\n{'='*80}\nTesting Chat History\n{'='*80}")
    
    try:
        print(f"Getting chat history for session {session_id}")
        
        # Make the request
        response = requests.get(f"{API_BASE_URL}/chat-history/{session_id}", timeout=10)
        
        # Check if the request was successful
        if response.status_code != 200:
            print(f"Get chat history failed with status code {response.status_code}: {response.text}")
            
            # Detailed diagnostics for 500 errors
            if response.status_code == 500:
                print("\nDIAGNOSTICS:")
                print("The error is likely related to the MockCollection.sort() method not actually sorting the data.")
                print("In server.py, the sort() method in the MockCollection class doesn't modify the data.")
                print("When the chat-history endpoint tries to sort messages by timestamp, it fails.")
                
                print("\nPOSSIBLE FIXES:")
                print("1. Implement proper sorting in the MockCollection.sort() method:")
                print("   - Modify the sort() method to actually sort the data based on the field and direction")
                print("   - Example implementation: sort the in_memory_db[collection_name] list based on the field")
                
                print("\n2. Modify the get_chat_history endpoint to not rely on sorting:")
                print("   - Change line 1589 from:")
                print("     cursor = db.chat_messages.find({\"session_id\": session_id}).sort(\"timestamp\", 1).limit(limit)")
                print("   - To:")
                print("     cursor = db.chat_messages.find({\"session_id\": session_id}).limit(limit)")
                print("   - Then sort the messages in Python after retrieving them:")
                print("     messages = sorted(messages, key=lambda x: x.get('timestamp', datetime.min))")
            
            return False
        
        data = response.json()
        
        # Check if the response contains the expected fields
        expected_fields = ["session_id", "messages", "total"]
        for field in expected_fields:
            if field not in data:
                print(f"Get chat history response missing expected field '{field}': {data}")
                return False
        
        # Check if the session_id matches the requested session_id
        if data["session_id"] != session_id:
            print(f"Session ID mismatch: requested {session_id}, got {data['session_id']}")
            return False
        
        # Check if messages is a list
        if not isinstance(data["messages"], list):
            print(f"Messages is not a list: {data}")
            return False
        
        # If there are messages, check the structure of the first message
        if data["messages"]:
            first_message = data["messages"][0]
            expected_message_fields = ["id", "session_id", "sender", "message", "timestamp"]
            for field in expected_message_fields:
                if field not in first_message:
                    print(f"Message missing expected field '{field}': {first_message}")
                    return False
            
            # Check if messages are sorted by timestamp
            if len(data["messages"]) > 1:
                is_sorted = True
                prev_timestamp = None
                for msg in data["messages"]:
                    current_timestamp = msg.get("timestamp")
                    if prev_timestamp and current_timestamp < prev_timestamp:
                        is_sorted = False
                        break
                    prev_timestamp = current_timestamp
                
                if not is_sorted:
                    print("WARNING: Messages are not properly sorted by timestamp")
        
        print(f"Retrieved {data['total']} chat messages for session: {data['session_id']}")
        return True
    except requests.exceptions.RequestException as e:
        print(f"Get chat history request failed: {e}")
        return False

def test_approve_toc(plan_id):
    """Test the approve table of contents endpoint"""
    print(f"\n{'='*80}\nTesting Table of Contents Approval\n{'='*80}")
    
    try:
        response = requests.post(
            f"{API_BASE_URL}/approve-toc/{plan_id}?approved=true",
            timeout=10
        )
        
        # Check if the request was successful
        if response.status_code != 200:
            print(f"Approve TOC failed with status code {response.status_code}: {response.text}")
            return False
        
        data = response.json()
        
        # Check if the response contains the expected fields
        expected_fields = ["success", "plan_id", "toc_approved"]
        for field in expected_fields:
            if field not in data:
                print(f"Approve TOC response missing expected field '{field}': {data}")
                return False
        
        # Check if the plan_id matches the requested plan_id
        if data["plan_id"] != plan_id:
            print(f"Plan ID mismatch: requested {plan_id}, got {data['plan_id']}")
            return False
        
        # Check if the TOC was approved
        if not data["toc_approved"]:
            print(f"TOC was not approved: {data}")
            return False
        
        print(f"Successfully approved TOC for plan with ID: {data['plan_id']}")
        return True
    except requests.exceptions.RequestException as e:
        print(f"Approve TOC request failed: {e}")
        return False

def test_get_chapter_content(plan_id, chapter_id):
    """Test the get chapter content endpoint"""
    print(f"\n{'='*80}\nTesting Chapter Content\n{'='*80}")
    
    try:
        response = requests.get(
            f"{API_BASE_URL}/learning-plans/{plan_id}/chapter/{chapter_id}",
            timeout=10
        )
        
        # Check if the request was successful
        if response.status_code != 200:
            print(f"Get chapter content failed with status code {response.status_code}: {response.text}")
            return False
        
        data = response.json()
        
        # Check if the response contains the expected fields
        expected_fields = ["id", "chapter_number", "title", "description", "sections"]
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
            print(f"Sections is not a list: {data}")
            return False
        
        # If there are sections, check the structure of the first section
        if data["sections"]:
            first_section = data["sections"][0]
            expected_section_fields = ["id", "title", "content"]
            for field in expected_section_fields:
                if field not in first_section:
                    print(f"Section missing expected field '{field}': {first_section}")
                    return False
        
        print(f"Retrieved chapter content for chapter ID: {data['id']}, title: {data['title']}")
        print(f"Chapter has {len(data['sections'])} sections")
        return True
    except requests.exceptions.RequestException as e:
        print(f"Get chapter content request failed: {e}")
        return False

def test_get_section_content(plan_id, section_id):
    """Test the get section content endpoint"""
    print(f"\n{'='*80}\nTesting Section Content\n{'='*80}")
    
    try:
        response = requests.get(
            f"{API_BASE_URL}/learning-plans/{plan_id}/section/{section_id}",
            timeout=10
        )
        
        # Check if the request was successful
        if response.status_code != 200:
            print(f"Get section content failed with status code {response.status_code}: {response.text}")
            return False
        
        data = response.json()
        
        # Check if the response contains the expected fields
        expected_fields = ["id", "title", "content"]
        for field in expected_fields:
            if field not in data:
                print(f"Section content response missing expected field '{field}': {data}")
                return False
        
        # Check if the id matches the requested section_id
        if data["id"] != section_id:
            print(f"Section ID mismatch: requested {section_id}, got {data['id']}")
            return False
        
        print(f"Retrieved section content for section ID: {data['id']}, title: {data['title']}")
        print(f"Section content preview: {data['content'][:100]}...")
        return True
    except requests.exceptions.RequestException as e:
        print(f"Get section content request failed: {e}")
        return False

def run_ai_chat_tests():
    """Run tests for AI Chat functionality"""
    print(f"\n{'='*80}\nRunning AI Chat Functionality Tests\n{'='*80}")
    
    # First, we need to create a learning plan
    try:
        # Sample request data
        request_data = {
            "topic": "network-security",
            "level": "beginner",
            "duration_weeks": 4,
            "focus_areas": ["Hands-on Labs", "Certification Preparation"],
            "user_background": "I have basic IT knowledge but new to cybersecurity"
        }
        
        print("Generating a learning plan for testing...")
        
        response = requests.post(
            f"{API_BASE_URL}/generate-learning-plan",
            json=request_data,
            timeout=300
        )
        
        if response.status_code != 200:
            print(f"Failed to generate learning plan: {response.status_code} - {response.text}")
            return False
        
        plan_data = response.json()
        plan_id = plan_data["plan_id"]
        print(f"Generated learning plan with ID: {plan_id}")
        
        # Test TOC approval
        if not test_approve_toc(plan_id):
            print("TOC approval test failed")
        
        # Get the first chapter ID
        if "table_of_contents" in plan_data and "chapters" in plan_data["table_of_contents"]:
            chapters = plan_data["table_of_contents"]["chapters"]
            if chapters:
                chapter_id = chapters[0]["id"]
                print(f"Using chapter ID: {chapter_id}")
                
                # Test chapter content
                if not test_get_chapter_content(plan_id, chapter_id):
                    print("Chapter content test failed")
                
                # Get the first section ID
                if "sections" in chapters[0]:
                    sections = chapters[0]["sections"]
                    if sections:
                        section_id = sections[0]["id"]
                        print(f"Using section ID: {section_id}")
                        
                        # Test section content
                        if not test_get_section_content(plan_id, section_id):
                            print("Section content test failed")
        
        # Approve the learning plan
        print("Approving the learning plan...")
        approve_response = requests.post(
            f"{API_BASE_URL}/approve-learning-plan/{plan_id}?approved=true",
            timeout=10
        )
        
        if approve_response.status_code != 200:
            print(f"Failed to approve learning plan: {approve_response.status_code} - {approve_response.text}")
            return False
        
        # Start a learning session
        print("Starting a learning session...")
        session_response = requests.post(
            f"{API_BASE_URL}/start-learning-session?plan_id={plan_id}&user_id=anonymous",
            timeout=10
        )
        
        if session_response.status_code != 200:
            print(f"Failed to start learning session: {session_response.status_code} - {session_response.text}")
            return False
        
        session_data = session_response.json()
        session_id = session_data["session_id"]
        print(f"Started learning session with ID: {session_id}")
        
        # Test chat with AI
        if not test_chat_with_ai(session_id):
            print("Chat with AI test failed")
        
        # Test chat history
        if not test_get_chat_history(session_id):
            print("Chat history test failed")
        
        return True
    except Exception as e:
        print(f"Error running AI chat tests: {e}")
        return False

if __name__ == "__main__":
    run_ai_chat_tests()