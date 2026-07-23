#!/bin/bash
# Deployment Verification Script for rei-ai
# Usage: ./scripts/verify-deploy.sh
# Saves tokens by not asking Vibe to check deployment status

set -e

echo "=== REI.AI DEPLOYMENT CHECK ==="
echo ""

# 1. Check live site
 echo "1. Checking live site..."
 if curl -s -I https://debate-furnace.vercel.app | grep -q "HTTP/2 200"; then
   echo "   ✅ Site is live"
 else
   echo "   ❌ Site is down"
   exit 1
 fi

# 2. Check last-modified header
 echo "2. Checking deployment timestamp..."
 LAST_MODIFIED=$(curl -s -I https://debate-furnace.vercel.app | grep -i "last-modified" | awk '{print $2, $3, $4, $5, $6}' | tr -d '\r')
 echo "   📅 Last deployed: $LAST_MODIFIED"

# 3. Check git status
 echo "3. Checking local git..."
 cd /home/potatoking/rei-ai
 CURRENT_COMMIT=$(git rev-parse --short HEAD)
 echo "   🪲 Local commit: $CURRENT_COMMIT"

# 4. Check GitHub
 echo "4. Checking GitHub main..."
 GITHUB_COMMIT=$(curl -s https://api.github.com/repos/aaronmarchant96-max/rei-ai/commits/main | grep '\"sha\"' | head -1 | cut -d'"' -f4 | head -c 7)
 echo "   🌍 GitHub commit: $GITHUB_COMMIT"

# 5. Compare
 echo "5. Deployment status..."
 if [ "$CURRENT_COMMIT" = "$GITHUB_COMMIT" ]; then
   echo "   ✅ Local matches GitHub"
 else
   echo "   ⚠️  Local ($CURRENT_COMMIT) != GitHub ($GITHUB_COMMIT)"
   echo "      (Push local changes or wait for Vercel auto-build to complete)"
 fi

echo ""
echo "=== CHECK COMPLETE ==="
echo "If Vercel last-modified is BEFORE your commit time, deployment hasn't run yet."
