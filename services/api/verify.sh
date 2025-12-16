#!/bin/bash

# Verification script for JEE Timetable API
# This script tests basic API functionality

set -e

API_URL="${API_URL:-http://localhost:3001}"
TIMESTAMP=$(date +%s)
TEST_EMAIL="test-${TIMESTAMP}@example.com"
TEST_PASSWORD="password123"

echo "=========================================="
echo "JEE Timetable API Verification"
echo "=========================================="
echo "API URL: $API_URL"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Test function
test_endpoint() {
    local name=$1
    local result=$2
    if [ $result -eq 0 ]; then
        echo -e "${GREEN}✓${NC} $name"
    else
        echo -e "${RED}✗${NC} $name"
        exit 1
    fi
}

# 1. Health Check
echo "1. Testing health check..."
HEALTH=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/health")
if [ "$HEALTH" = "200" ]; then
    test_endpoint "Health check" 0
else
    test_endpoint "Health check (got $HEALTH)" 1
fi

# 2. Register User
echo "2. Testing user registration..."
REGISTER_RESPONSE=$(curl -s -X POST "$API_URL/v1/auth/register" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\",\"name\":\"Test User\"}")

ACCESS_TOKEN=$(echo $REGISTER_RESPONSE | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
REFRESH_TOKEN=$(echo $REGISTER_RESPONSE | grep -o '"refreshToken":"[^"]*' | cut -d'"' -f4)

if [ -n "$ACCESS_TOKEN" ]; then
    test_endpoint "User registration" 0
else
    echo "Register response: $REGISTER_RESPONSE"
    test_endpoint "User registration" 1
fi

# 3. Login
echo "3. Testing user login..."
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/v1/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\"}")

LOGIN_TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)

if [ -n "$LOGIN_TOKEN" ]; then
    test_endpoint "User login" 0
else
    test_endpoint "User login" 1
fi

# 4. Refresh Token
echo "4. Testing token refresh..."
REFRESH_RESPONSE=$(curl -s -X POST "$API_URL/v1/auth/refresh" \
    -H "Content-Type: application/json" \
    -d "{\"refreshToken\":\"$REFRESH_TOKEN\"}")

NEW_ACCESS_TOKEN=$(echo $REFRESH_RESPONSE | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)

if [ -n "$NEW_ACCESS_TOKEN" ]; then
    test_endpoint "Token refresh" 0
    ACCESS_TOKEN=$NEW_ACCESS_TOKEN
else
    test_endpoint "Token refresh" 1
fi

# 5. Create Schedule
echo "5. Testing schedule creation..."
SCHEDULE_RESPONSE=$(curl -s -X POST "$API_URL/v1/schedule" \
    -H "Authorization: Bearer $ACCESS_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"name":"Test Schedule","timezone":"Asia/Kolkata"}')

SCHEDULE_ID=$(echo $SCHEDULE_RESPONSE | grep -o '"id":"[^"]*' | cut -d'"' -f4)

if [ -n "$SCHEDULE_ID" ]; then
    test_endpoint "Schedule creation" 0
else
    test_endpoint "Schedule creation" 1
fi

# 6. Get Schedules
echo "6. Testing get schedules..."
SCHEDULES_RESPONSE=$(curl -s -X GET "$API_URL/v1/schedule" \
    -H "Authorization: Bearer $ACCESS_TOKEN")

SCHEDULES_COUNT=$(echo $SCHEDULES_RESPONSE | grep -o '"schedules":\[' | wc -l)

if [ "$SCHEDULES_COUNT" -ge "1" ]; then
    test_endpoint "Get schedules" 0
else
    test_endpoint "Get schedules" 1
fi

# 7. Create Lesson
echo "7. Testing lesson creation..."
LESSON_RESPONSE=$(curl -s -X POST "$API_URL/v1/lessons" \
    -H "Authorization: Bearer $ACCESS_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"scheduleId\":\"$SCHEDULE_ID\",\"dayOfWeek\":\"Monday\",\"startTime\":\"9:00 AM\",\"endTime\":\"11:00 AM\",\"subject\":\"Test Subject\",\"type\":\"test\",\"order\":0}")

LESSON_ID=$(echo $LESSON_RESPONSE | grep -o '"id":"[^"]*' | cut -d'"' -f4)

if [ -n "$LESSON_ID" ]; then
    test_endpoint "Lesson creation" 0
else
    test_endpoint "Lesson creation" 1
fi

# 8. Get Lessons
echo "8. Testing get lessons..."
LESSONS_RESPONSE=$(curl -s -X GET "$API_URL/v1/lessons?scheduleId=$SCHEDULE_ID" \
    -H "Authorization: Bearer $ACCESS_TOKEN")

LESSONS_COUNT=$(echo $LESSONS_RESPONSE | grep -o '"lessons":\[' | wc -l)

if [ "$LESSONS_COUNT" -ge "1" ]; then
    test_endpoint "Get lessons" 0
else
    test_endpoint "Get lessons" 1
fi

# 9. Update Lesson
echo "9. Testing lesson update..."
UPDATE_RESPONSE=$(curl -s -X PATCH "$API_URL/v1/lessons/$LESSON_ID" \
    -H "Authorization: Bearer $ACCESS_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"subject":"Updated Subject"}')

UPDATED_SUBJECT=$(echo $UPDATE_RESPONSE | grep -o '"subject":"[^"]*' | cut -d'"' -f4)

if [ "$UPDATED_SUBJECT" = "Updated Subject" ]; then
    test_endpoint "Lesson update" 0
else
    test_endpoint "Lesson update" 1
fi

# 10. Delete Lesson
echo "10. Testing lesson deletion..."
DELETE_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE "$API_URL/v1/lessons/$LESSON_ID" \
    -H "Authorization: Bearer $ACCESS_TOKEN")

if [ "$DELETE_RESPONSE" = "200" ]; then
    test_endpoint "Lesson deletion" 0
else
    test_endpoint "Lesson deletion" 1
fi

# 11. Logout
echo "11. Testing logout..."
LOGOUT_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API_URL/v1/auth/logout" \
    -H "Authorization: Bearer $ACCESS_TOKEN")

if [ "$LOGOUT_RESPONSE" = "200" ]; then
    test_endpoint "User logout" 0
else
    test_endpoint "User logout" 1
fi

echo ""
echo "=========================================="
echo -e "${GREEN}All tests passed! ✓${NC}"
echo "=========================================="
echo ""
echo "The API is working correctly!"
echo ""
