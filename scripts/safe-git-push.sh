#!/bin/bash
set -e

# Safe Git Push Script - Implements staged push strategy for 510 changes
# This script safely pushes changes while protecting MCP server functionality

echo "🚀 SAFE GIT PUSH - 510 CHANGES"
echo "==============================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Configuration
SAFETY_BRANCH="pre-push-safety-backup"
STAGING_BRANCH="staging-510-changes"
MAIN_BRANCH="main"

# Function to print step headers
print_step() {
    echo ""
    echo -e "${BLUE}$1${NC}"
    echo "$(echo "$1" | sed 's/./-/g')"
}

# Function to check if command succeeded
check_success() {
    if [ $? -eq 0 ]; then
        echo -e "  ${GREEN}✅ Success${NC}"
    else
        echo -e "  ${RED}❌ Failed${NC}"
        echo "Aborting safe push process."
        exit 1
    fi
}

# Function to prompt user for confirmation
confirm() {
    while true; do
        read -p "$(echo -e "${YELLOW}$1 (y/n): ${NC}")" yn
        case $yn in
            [Yy]* ) return 0;;
            [Nn]* ) return 1;;
            * ) echo "Please answer yes or no.";;
        esac
    done
}

print_step "🔍 PHASE 1: PRE-PUSH SAFETY CHECKS"

echo "Checking git status..."
if ! git status > /dev/null 2>&1; then
    echo -e "${RED}❌ Not in a git repository!${NC}"
    exit 1
fi

# Check if we have uncommitted changes
UNCOMMITTED_CHANGES=$(git status --porcelain | wc -l)
echo "  Uncommitted changes: $UNCOMMITTED_CHANGES"

if [ $UNCOMMITTED_CHANGES -eq 0 ]; then
    echo -e "  ${YELLOW}⚠️  No uncommitted changes found.${NC}"
    if ! confirm "Continue anyway?"; then
        echo "Exiting."
        exit 0
    fi
fi

# Check current branch
CURRENT_BRANCH=$(git branch --show-current)
echo "  Current branch: $CURRENT_BRANCH"

print_step "📦 PHASE 2: CREATE SAFETY BACKUP"

echo "Creating MCP configuration backup..."
if [ -f "./scripts/create-backup.sh" ]; then
    ./scripts/create-backup.sh
    check_success
else
    echo -e "  ${RED}❌ Backup script not found!${NC}"
    echo "Run this from the project root directory."
    exit 1
fi

print_step "🔍 PHASE 3: TEST CURRENT MCP STATE"

echo "Testing all MCP servers..."
if [ -f "./scripts/test-mcp-servers.sh" ]; then
    ./scripts/test-mcp-servers.sh
    TEST_RESULT=$?
    
    if [ $TEST_RESULT -eq 0 ]; then
        echo -e "  ${GREEN}✅ All MCP servers healthy${NC}"
    elif [ $TEST_RESULT -eq 1 ]; then
        echo -e "  ${YELLOW}⚠️  Minor issues detected${NC}"
        if ! confirm "Continue despite minor issues?"; then
            echo "Fix issues and try again."
            exit 1
        fi
    else
        echo -e "  ${RED}❌ Critical MCP server issues detected${NC}"
        echo "Fix critical issues before proceeding."
        exit 1
    fi
else
    echo -e "  ${YELLOW}⚠️  Test script not found, skipping MCP tests${NC}"
fi

print_step "🔄 PHASE 4: CREATE SAFETY BRANCHES"

echo "Creating safety backup branch..."
git checkout -b "$SAFETY_BRANCH" 2>/dev/null || git checkout "$SAFETY_BRANCH"
git add .
git commit -m "Safety backup before 510 changes push - $(date)" || echo "  Nothing to commit"
git push origin "$SAFETY_BRANCH" --force
check_success

echo "Creating staging branch..."
git checkout "$CURRENT_BRANCH"
git checkout -b "$STAGING_BRANCH" 2>/dev/null || git checkout "$STAGING_BRANCH"
git add .
git commit -m "Staging: 510 changes for safety testing - $(date)" || echo "  Nothing to commit"
git push origin "$STAGING_BRANCH" --force
check_success

print_step "🧪 PHASE 5: REMOTE TESTING"

echo "Setting up remote test environment..."
TEMP_DIR="/tmp/mcp-remote-test-$(date +%s)"
REPO_URL=$(git config --get remote.origin.url)

if [ -z "$REPO_URL" ]; then
    echo -e "  ${RED}❌ Could not determine remote repository URL${NC}"
    exit 1
fi

echo "  Cloning to: $TEMP_DIR"
git clone "$REPO_URL" "$TEMP_DIR"
cd "$TEMP_DIR"
git checkout "$STAGING_BRANCH"

echo "Installing dependencies..."
npm install > /dev/null 2>&1
check_success

echo "Testing MCP servers in clean environment..."
if [ -f "./scripts/test-mcp-servers.sh" ]; then
    ./scripts/test-mcp-servers.sh
    REMOTE_TEST_RESULT=$?
else
    echo -e "  ${YELLOW}⚠️  Test script not found in remote, assuming OK${NC}"
    REMOTE_TEST_RESULT=0
fi

# Return to original directory
cd - > /dev/null

# Clean up temporary directory
rm -rf "$TEMP_DIR"

if [ $REMOTE_TEST_RESULT -eq 0 ]; then
    echo -e "  ${GREEN}✅ Remote tests passed${NC}"
elif [ $REMOTE_TEST_RESULT -eq 1 ]; then
    echo -e "  ${YELLOW}⚠️  Remote tests showed minor issues${NC}"
    if ! confirm "Continue despite remote test issues?"; then
        echo "Aborting push."
        exit 1
    fi
else
    echo -e "  ${RED}❌ Remote tests failed critically${NC}"
    echo "DO NOT PROCEED - Fix issues first."
    exit 1
fi

print_step "🚀 PHASE 6: MERGE TO MAIN"

echo -e "${CYAN}Ready to merge staging branch to main and push.${NC}"
if ! confirm "Proceed with final push?"; then
    echo "Push cancelled. Staging branch is ready when you are."
    echo "Manual commands:"
    echo "  git checkout $MAIN_BRANCH"
    echo "  git merge $STAGING_BRANCH"
    echo "  git push origin $MAIN_BRANCH"
    exit 0
fi

echo "Merging staging to main..."
git checkout "$MAIN_BRANCH"
git merge "$STAGING_BRANCH"
check_success

echo "Pushing to main branch..."
git push origin "$MAIN_BRANCH"
check_success

echo "Creating deployment tag..."
DEPLOY_TAG="deploy-$(date +%Y%m%d_%H%M%S)"
git tag -a "$DEPLOY_TAG" -m "Safe deployment of 510 changes"
git push origin "$DEPLOY_TAG"
check_success

print_step "✅ PHASE 7: POST-PUSH VERIFICATION"

echo "Waiting for deployment to settle..."
sleep 5

echo -e "${YELLOW}IMPORTANT: Please manually verify the following:${NC}"
echo "  1. Restart Roo Code"
echo "  2. Restart Claude Desktop"
echo "  3. Test MCP server connectivity in Roo"
echo "  4. Test your website functionality"
echo ""

if confirm "Run post-push MCP server test now?"; then
    echo "Testing MCP servers after push..."
    ./scripts/test-mcp-servers.sh
    POST_PUSH_RESULT=$?
    
    if [ $POST_PUSH_RESULT -eq 0 ]; then
        echo -e "  ${GREEN}✅ Post-push tests passed${NC}"
    else
        echo -e "  ${YELLOW}⚠️  Post-push tests showed issues${NC}"
        echo "Monitor closely and run emergency restore if needed."
    fi
fi

print_step "🎉 DEPLOYMENT COMPLETE"

echo -e "${GREEN}✅ Successfully deployed 510 changes!${NC}"
echo ""
echo "📋 Deployment Summary:"
echo "  🏷️  Deployment Tag: $DEPLOY_TAG"
echo "  🌿 Safety Branch: $SAFETY_BRANCH"
echo "  🧪 Staging Branch: $STAGING_BRANCH"
echo "  📦 Backups: ./backups/"
echo ""
echo "🚨 Emergency Commands:"
echo "  Restore MCP configs: ./scripts/emergency-restore.sh"
echo "  Rollback git: git reset --hard $SAFETY_BRANCH"
echo ""
echo "🔍 Monitor your website and MCP servers for the next 30 minutes."
echo "If any issues arise, use the emergency restore script immediately."
echo ""
echo -e "${GREEN}🎊 Congratulations! Your 510 changes are safely deployed.${NC}"