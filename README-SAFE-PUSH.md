# 🚀 Safe Git Push - Quick Start Guide

**URGENT**: This guide helps you safely push your 510 changes while protecting your MCP servers and website.

## ⚡ Quick Start (5 minutes)

### Step 1: Test Current State
```bash
npm run safety:test
```
✅ **Expected**: All or most servers show "OK"  
❌ **If failed**: Fix critical issues before proceeding

### Step 2: Create Backup
```bash
npm run safety:backup
```
✅ **Expected**: Backup created in `./backups/` directory

### Step 3: Safe Push
```bash
# Windows (recommended)
scripts\safe-git-push.bat

# OR Linux/Mac/Git Bash
npm run safety:push
```

## 🚨 Emergency Commands

If anything breaks:
```bash
# Restore MCP configurations
npm run safety:restore

# Rollback git changes
git reset --hard pre-push-safety-backup
```

## 📋 What This Does

1. **Backs up** all MCP configurations
2. **Tests** all MCP servers are working
3. **Creates safety branches** for rollback
4. **Pushes changes** in stages
5. **Verifies** everything still works

## 🔍 Critical Files Protected

- ✅ Roo MCP Settings: `mcp_settings.json`
- ✅ Claude Desktop Config: `claude_desktop_config.json`
- ✅ GitHub Server: `src/mcp-servers/github-server/`
- ✅ Vercel Server: `src/mcp-servers/vercel-api-mcp.js`
- ✅ All Environment Variables

## ⏱️ Timeline

| Phase | Time | What Happens |
|-------|------|-------------|
| Backup | 2 min | Creates safety backups |
| Testing | 3 min | Verifies MCP servers work |
| Push | 5 min | Staged git push with safety checks |
| Verify | 2 min | Post-push validation |
| **Total** | **12 min** | **Complete safe deployment** |

## 🎯 Success Indicators

✅ **All MCP servers restart correctly**  
✅ **Roo can access all servers**  
✅ **Website functionality intact**  
✅ **No runtime errors**  

## 🚨 If Something Goes Wrong

### MCP Servers Not Working
```bash
# 1. Emergency restore
npm run safety:restore

# 2. Restart applications
# - Close Roo Code
# - Close Claude Desktop
# - Restart both

# 3. Test again
npm run safety:test
```

### Website Broken
```bash
# 1. Check if MCP-related
npm run safety:test

# 2. If MCP servers OK, check website logs
# 3. If MCP servers broken, restore:
npm run safety:restore
```

### Git Issues
```bash
# Rollback to safety point
git checkout main
git reset --hard pre-push-safety-backup
git push origin main --force

# Then restore MCP configs
npm run safety:restore
```

## 📞 Support Commands

```bash
# Check what's running
npm run safety:test

# Create new backup
npm run safety:backup

# Restore from backup
npm run safety:restore

# View backups
ls ./backups/

# Check git status
git status
git log --oneline -5
```

## 🔗 Related Files

- **📋 Full Plan**: [`docs/safe-git-push-plan.md`](docs/safe-git-push-plan.md)
- **🛠️ Scripts**: [`scripts/`](scripts/)
- **📦 Backups**: `./backups/` (created during backup)

---

## 🎊 Ready to Deploy?

**Run this command to start the safe push:**

```bash
# Windows
scripts\safe-git-push.bat

# Git Bash/Linux/Mac
npm run safety:push
```

**Your 510 changes will be safely deployed with full rollback protection! 🚀**