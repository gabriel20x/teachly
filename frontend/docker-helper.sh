#!/bin/bash

# Docker Helper Script for Teachly Frontend
# This script provides easy commands for common Docker operations

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}=== $1 ===${NC}"
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  start         Build and run production container"
    echo "  build         Build production image"
    echo "  stop          Stop container"
    echo "  clean         Remove container and image"
    echo "  logs          Show container logs"
    echo "  shell         Open shell in running container"
    echo "  health        Check container health"
    echo "  help          Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 start      # Start production environment on port 5173"
    echo "  $0 logs       # View logs"
    echo "  $0 clean      # Clean up everything"
}

# Function to check if Docker is running
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed or not in PATH"
        exit 1
    fi
    
    if ! docker info &> /dev/null; then
        print_error "Docker is not running"
        exit 1
    fi
}

# Function to build production image
build_prod() {
    print_header "Building Production Image"
    docker build -t teachly-frontend .
    print_status "Production image built successfully"
}



# Function to run production container
run_prod() {
    print_header "Starting Production Container"
    docker-compose up --build
}

# Function to stop containers
stop_containers() {
    print_header "Stopping Container"
    docker-compose down
    print_status "Container stopped"
}

# Function to show logs
show_logs() {
    print_header "Container Logs"
    if docker ps --format "table {{.Names}}" | grep -q "teachly-frontend"; then
        docker logs -f teachly-frontend
    else
        print_warning "No running container found"
    fi
}

# Function to open shell in container
open_shell() {
    print_header "Opening Shell in Container"
    if docker ps --format "table {{.Names}}" | grep -q "teachly-frontend"; then
        docker exec -it teachly-frontend /bin/sh
    else
        print_error "No running container found"
        exit 1
    fi
}

# Function to check container health
check_health() {
    print_header "Checking Container Health"
    if docker ps --format "table {{.Names}}" | grep -q "teachly-frontend"; then
        docker inspect teachly-frontend | grep -A 5 "Health"
    else
        print_error "No running container found"
        exit 1
    fi
}

# Function to clean up everything
clean_up() {
    print_header "Cleaning Up Docker Resources"
    print_warning "This will remove the Teachly frontend container and image"
    read -p "Are you sure? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        docker-compose down
        docker rmi teachly-frontend 2>/dev/null || true
        docker system prune -f
        print_status "Cleanup completed"
    else
        print_status "Cleanup cancelled"
    fi
}

# Main script logic
main() {
    check_docker
    
    case "${1:-help}" in
        "start"|"prod")
            run_prod
            ;;
        "build")
            build_prod
            ;;
        "stop")
            stop_containers
            ;;
        "clean")
            clean_up
            ;;
        "logs")
            show_logs
            ;;
        "shell")
            open_shell
            ;;
        "health")
            check_health
            ;;
        "help"|"-h"|"--help")
            show_usage
            ;;
        *)
            print_error "Unknown command: $1"
            echo ""
            show_usage
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@" 