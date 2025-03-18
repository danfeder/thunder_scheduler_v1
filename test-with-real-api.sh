#!/bin/bash

# Script to run real API tests with backend and frontend

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting Thunder Scheduler Real API Testing${NC}"
echo -e "${YELLOW}=======================================${NC}"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
  echo -e "${RED}Docker is not running. Please start Docker and try again.${NC}"
  exit 1
fi

# Start the database with Docker
echo -e "${YELLOW}Starting PostgreSQL database...${NC}"
docker-compose up -d db
if [ $? -ne 0 ]; then
  echo -e "${RED}Failed to start database. Exiting.${NC}"
  exit 1
fi

# Wait for database to be ready
echo -e "${YELLOW}Waiting for database to be ready...${NC}"
sleep 5

# Start the backend server in the background
echo -e "${YELLOW}Starting backend server...${NC}"
cd backend
npm run dev &
BACKEND_PID=$!

# Wait for backend to start
echo -e "${YELLOW}Waiting for backend to start (15 seconds)...${NC}"
sleep 15

# Check if backend is running
if ! curl -s http://localhost:3000/api/health > /dev/null; then
  echo -e "${RED}Backend server failed to start. Exiting.${NC}"
  kill $BACKEND_PID
  docker-compose down
  exit 1
fi

echo -e "${GREEN}Backend server is running.${NC}"

# Run the real API tests
echo -e "${YELLOW}Running real API tests...${NC}"
cd ../frontend
npm test -- -t "Real API"
TEST_RESULT=$?

# Cleanup
echo -e "${YELLOW}Cleaning up...${NC}"
kill $BACKEND_PID
cd ..
docker-compose down

# Report results
if [ $TEST_RESULT -eq 0 ]; then
  echo -e "${GREEN}All real API tests passed!${NC}"
  exit 0
else
  echo -e "${RED}Some real API tests failed.${NC}"
  exit 1
fi