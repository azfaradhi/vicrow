#!/bin/bash

# Prisma Query Helper Script
# This script helps execute Prisma queries from the C++ backend

PRISMA_SERVICE_URL="${PRISMA_SERVICE_URL:-http://localhost:3001}"

case "$1" in
    health)
        curl -s "$PRISMA_SERVICE_URL/health"
        ;;
    users)
        curl -s "$PRISMA_SERVICE_URL/api/users"
        ;;
    user)
        curl -s "$PRISMA_SERVICE_URL/api/users/$2"
        ;;
    create-user)
        curl -s -X POST -H "Content-Type: application/json" -d "$2" "$PRISMA_SERVICE_URL/api/users"
        ;;
    update-user)
        curl -s -X PUT -H "Content-Type: application/json" -d "$3" "$PRISMA_SERVICE_URL/api/users/$2"
        ;;
    delete-user)
        curl -s -X DELETE "$PRISMA_SERVICE_URL/api/users/$2"
        ;;
    *)
        echo "Usage: $0 {health|users|user <id>|create-user <json>|update-user <id> <json>|delete-user <id>}"
        exit 1
        ;;
esac
