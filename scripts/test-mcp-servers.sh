#!/bin/bash

# MCP Server Health Check Script
# Tests all MCP servers to ensure they're working correctly

echo "🔍 MCP SERVER HEALTH CHECK"
echo "=========================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
TOTAL_SERVERS=0
PASSED_SERVERS=0
FAILED_SERVERS=0

# Test results array
declare -a TEST_RESULTS

# Function to test a server
test_server() {
    local server_name="$1"
    local npm_script="$2"
    local timeout_seconds="${3:-10}"
    
    TOTAL_SERVERS=$((TOTAL_SERVERS + 1))
    
    echo -n "  Testing ${server_name}... "
    
    # Create a temporary log file
    local log_file=$(mktemp)
    
    # Run the server with timeout and capture output
    if timeout "${timeout_seconds}s" npm run "$npm_script" > "$log_file" 2>&1; then
        # Server started successfully (or timed out, which is expected for servers)
        echo -e "${GREEN}✅ OK${NC}"
        TEST_RESULTS+=("$server_name: ✅ OK")
        PASSED_SERVERS=$((PASSED_SERVERS + 1))
    else
        # Check if it's a timeout (expected) or actual error
        local exit_code=$?
        if [ $exit_code -eq 124 ]; then
            # Timeout - this is actually good for servers
            echo -e "${GREEN}✅ OK (timeout - server running)${NC}"
            TEST_RESULTS+=("$server_name: ✅ OK (running)")
            PASSED_SERVERS=$((PASSED_SERVERS + 1))
        else
            # Actual error
            echo -e "${RED}❌ FAILED${NC}"
            echo -e "    ${YELLOW}Error details:${NC}"
            tail -3 "$log_file" | sed 's/^/      /'
            TEST_RESULTS+=("$server_name: ❌ FAILED")
            FAILED_SERVERS=$((FAILED_SERVERS + 1))
        fi
    fi
    
    # Clean up log file
    rm -f "$log_file"
}

echo ""
echo "🚀 Starting MCP server tests..."

# Test GitHub Server (most critical)
echo ""
echo -e "${BLUE}🔍 Testing Critical Servers:${NC}"
test_server "GitHub Server" "start:github" 8

# Test Vercel Server (important for deployments)
test_server "Vercel Server" "start:vercel-server" 8

echo ""
echo -e "${BLUE}🔍 Testing Core Servers:${NC}"

# Test other core servers
test_server "Filesystem Server" "start:filesystem" 6
test_server "Fetch Server" "start:fetch" 6
test_server "Brave Search Server" "start:brave-search" 6

echo ""
echo -e "${BLUE}🔍 Testing Business Intelligence Servers:${NC}"

# Test business intelligence servers
test_server "Market Analysis Server" "start:market-analysis" 6
test_server "Financial Modeling Server" "start:financial-modeling" 6
test_server "Technical Documentation Server" "start:technical-doc" 6
test_server "Mindmap Server" "start:mindmap" 6

echo ""
echo -e "${BLUE}🔍 Testing Infrastructure Servers:${NC}"

# Test infrastructure servers
test_server "Tunnel Server" "start:tunnel" 6

echo ""
echo "🔑 Checking Environment Variables..."

# Check critical environment variables
check_env_var() {
    local var_name="$1"
    local is_critical="$2"
    
    if [ -n "${!var_name}" ]; then
        echo -e "  ${var_name}: ${GREEN}✅ Present${NC}"
        return 0
    else
        if [ "$is_critical" = "true" ]; then
            echo -e "  ${var_name}: ${RED}❌ Missing (CRITICAL)${NC}"
            return 1
        else
            echo -e "  ${var_name}: ${YELLOW}⚠️  Missing (optional)${NC}"
            return 0
        fi
    fi
}

ENV_ISSUES=0

# Check critical environment variables
check_env_var "GITHUB_API_TOKEN" "true" || ENV_ISSUES=$((ENV_ISSUES + 1))
check_env_var "VERCEL_API_TOKEN" "true" || ENV_ISSUES=$((ENV_ISSUES + 1))

# Check optional environment variables
check_env_var "BRAVE_SEARCH_API_KEY" "false"
check_env_var "OPENAI_API_KEY" "false"

echo ""
echo "📊 TEST SUMMARY"
echo "==============="

# Display test results
echo "Server Test Results:"
for result in "${TEST_RESULTS[@]}"; do
    echo "  $result"
done

echo ""
echo "Statistics:"
echo "  📈 Total Servers Tested: $TOTAL_SERVERS"
echo -e "  ${GREEN}✅ Passed: $PASSED_SERVERS${NC}"
echo -e "  ${RED}❌ Failed: $FAILED_SERVERS${NC}"
echo -e "  🔑 Environment Issues: $ENV_ISSUES"

# Calculate success rate
if [ $TOTAL_SERVERS -gt 0 ]; then
    SUCCESS_RATE=$(( (PASSED_SERVERS * 100) / TOTAL_SERVERS ))
    echo "  📊 Success Rate: ${SUCCESS_RATE}%"
fi

echo ""

# Overall assessment
if [ $FAILED_SERVERS -eq 0 ] && [ $ENV_ISSUES -eq 0 ]; then
    echo -e "${GREEN}🎉 ALL SYSTEMS GO! Safe to proceed with git push.${NC}"
    exit 0
elif [ $FAILED_SERVERS -eq 0 ] && [ $ENV_ISSUES -gt 0 ]; then
    echo -e "${YELLOW}⚠️  ENVIRONMENT ISSUES DETECTED${NC}"
    echo "Some API tokens are missing, but servers are functional."
    echo "Consider setting missing environment variables before proceeding."
    exit 1
elif [ $FAILED_SERVERS -le 2 ]; then
    echo -e "${YELLOW}⚠️  MINOR ISSUES DETECTED${NC}"
    echo "Some servers failed, but core functionality should work."
    echo "Review failed servers before proceeding."
    exit 1
else
    echo -e "${RED}🚨 CRITICAL ISSUES DETECTED${NC}"
    echo "Multiple server failures detected. DO NOT PROCEED with git push."
    echo "Fix the issues and run this test again."
    exit 2
fi

echo ""
echo "🔧 TIP: If you see issues, try:"
echo "  1. Restart your terminal/shell"
echo "  2. Run: npm install"
echo "  3. Check environment variables"
echo "  4. Run: ./scripts/emergency-restore.sh (if needed)"