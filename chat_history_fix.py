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

def diagnose_chat_history_issue():
    """Diagnose the issue with the chat history endpoint"""
    print("\n=== Diagnosing Chat History Issue ===\n")
    
    # Step 1: Create a learning plan
    print("Step 1: Creating a learning plan...")
    request_data = {
        "topic": "network-security",
        "level": "beginner",
        "duration_weeks": 4,
        "focus_areas": ["Hands-on Labs", "Certification Preparation"],
        "user_background": "I have basic IT knowledge but new to cybersecurity"
    }
    
    response = requests.post(
        f"{API_BASE_URL}/generate-learning-plan",
        json=request_data,
        timeout=300
    )
    
    if response.status_code != 200:
        print(f"Failed to create learning plan: {response.status_code} - {response.text}")
        return
    
    plan_data = response.json()
    plan_id = plan_data["plan_id"]
    print(f"Created learning plan with ID: {plan_id}")
    
    # Step 2: Approve the learning plan
    print("\nStep 2: Approving the learning plan...")
    response = requests.post(
        f"{API_BASE_URL}/approve-learning-plan/{plan_id}?approved=true",
        timeout=10
    )
    
    if response.status_code != 200:
        print(f"Failed to approve learning plan: {response.status_code} - {response.text}")
        return
    
    print(f"Approved learning plan with ID: {plan_id}")
    
    # Step 3: Start a learning session
    print("\nStep 3: Starting a learning session...")
    response = requests.post(
        f"{API_BASE_URL}/start-learning-session?plan_id={plan_id}&user_id=anonymous",
        timeout=10
    )
    
    if response.status_code != 200:
        print(f"Failed to start learning session: {response.status_code} - {response.text}")
        return
    
    session_data = response.json()
    session_id = session_data["session_id"]
    print(f"Started learning session with ID: {session_id}")
    
    # Step 4: Send a chat message
    print("\nStep 4: Sending a chat message...")
    message = "Can you explain the concept of defense in depth in network security?"
    response = requests.post(
        f"{API_BASE_URL}/chat-with-ai?session_id={session_id}&message={message}",
        timeout=60
    )
    
    if response.status_code != 200:
        print(f"Failed to send chat message: {response.status_code} - {response.text}")
        return
    
    chat_data = response.json()
    message_id = chat_data["message_id"]
    print(f"Sent chat message with ID: {message_id}")
    print(f"AI response preview: {chat_data['ai_response'][:100]}...")
    
    # Step 5: Try to get chat history
    print("\nStep 5: Getting chat history...")
    response = requests.get(
        f"{API_BASE_URL}/chat-history/{session_id}",
        timeout=10
    )
    
    if response.status_code != 200:
        print(f"Failed to get chat history: {response.status_code} - {response.text}")
        print("\nDiagnostic information:")
        print("1. The chat-with-ai endpoint works correctly")
        print("2. The chat-history endpoint returns a 500 Internal Server Error")
        print("3. The issue is likely in the implementation of the chat-history endpoint")
        print("4. Specifically, the sort method in the MockCollection class doesn't actually sort the data")
        print("5. This causes an error when trying to sort the chat messages by timestamp")
        
        # Suggest a fix
        print("\nSuggested fix:")
        print("1. Update the sort method in the MockCollection class to actually sort the data")
        print("2. Or modify the get_chat_history endpoint to not rely on sorting")
        return
    
    chat_history_data = response.json()
    print(f"Retrieved {chat_history_data['total']} chat messages")
    
    # Print the first message if available
    if chat_history_data["messages"]:
        first_message = chat_history_data["messages"][0]
        print(f"First message: {first_message['message'][:100]}...")
    
    print("\nChat history endpoint is working correctly!")

if __name__ == "__main__":
    diagnose_chat_history_issue()