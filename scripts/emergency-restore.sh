#!/bin/bash
set -e

# Emergency MCP Server Restore Script
# This script restores MCP configurations from the most recent backup

echo "🚨 EMERGENCY MCP SERVER RESTORE INITIATED"
echo "=========================================="

# Find the most recent backup
if [ ! -d "backups" ]; then
    echo "❌ ERROR: No backups directory found!"
    echo "Run backup script first: ./scripts/create-backup.sh"
    exit 1
fi

LATEST_BACKUP=$(ls -1t backups/ 2>/dev/null | head -n 1)
if [ -z "$LATEST_BACKUP" ]; then
    echo "❌ ERROR: No backups found!"
    echo "Run backup script first: ./scripts/create-backup.sh"
    exit 1
fi

BACKUP_DIR="backups/$LATEST_BACKUP"
echo "📦 Using backup: $BACKUP_DIR"

# Function to safely copy with backup
safe_copy() {
    local src="$1"
    local dest="$2"
    local backup_name="$3"
    
    if [ -f "$dest" ]; then
        echo "  📋 Backing up current $backup_name..."
        cp "$dest" "$dest.emergency-backup-$(date +%H%M%S)"
    fi
    
    echo "  📥 Restoring $backup_name..."
    cp "$src" "$dest"
}

echo ""
echo "🔄 Stopping MCP processes..."
# Stop any running MCP servers (be gentle)
pkill -f "github-server" || true
pkill -f "vercel-api-mcp" || true
pkill -f "mcp-server" || true
sleep 2

echo ""
echo "📂 Restoring configuration files..."

# Restore Roo MCP settings
ROO_CONFIG="c:/Users/JamesCameron/AppData/Roaming/Code/User/globalStorage/rooveterinaryinc.roo-cline/settings/mcp_settings.json"
if [ -f "$BACKUP_DIR/roo_mcp_settings.json" ]; then
    safe_copy "$BACKUP_DIR/roo_mcp_settings.json" "$ROO_CONFIG" "Roo MCP settings"
else
    echo "  ⚠️  No Roo MCP settings backup found"
fi

# Restore Claude Desktop config
CLAUDE_CONFIG="c:/Users/JamesCameron/AppData/Roaming/Claude/claude_desktop_config.json"
if [ -f "$BACKUP_DIR/claude_desktop_config.json" ]; then
    safe_copy "$BACKUP_DIR/claude_desktop_config.json" "$CLAUDE_CONFIG" "Claude Desktop config"
else
    echo "  ⚠️  No Claude Desktop config backup found"
fi

# Restore package.json
if [ -f "$BACKUP_DIR/package.json" ]; then
    safe_copy "$BACKUP_DIR/package.json" "./package.json" "package.json"
else
    echo "  ⚠️  No package.json backup found"
fi

# Restore environment variables if available
if [ -f "$BACKUP_DIR/env_vars.txt" ]; then
    echo ""
    echo "🔑 Environment variables backup found:"
    echo "  📄 Check $BACKUP_DIR/env_vars.txt for API tokens"
    echo "  ⚠️  You may need to manually set these in your environment"
    cat "$BACKUP_DIR/env_vars.txt"
fi

echo ""
echo "📋 Restore Summary:"
echo "  ✅ Backup used: $LATEST_BACKUP"
echo "  📁 Files restored from: $BACKUP_DIR"
echo "  🔄 MCP processes stopped"

echo ""
echo "🚀 NEXT STEPS:"
echo "  1. Restart Roo Code"
echo "  2. Restart Claude Desktop"
echo "  3. Test MCP server connectivity"
echo "  4. Run: ./scripts/test-mcp-servers.sh"

echo ""
echo "✅ Emergency restore completed successfully!"
echo "🔍 If issues persist, check the backup files in: $BACKUP_DIR"