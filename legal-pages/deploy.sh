#!/bin/bash
# Deployment script that excludes README.md

cd "$(dirname "$0")"

# Create temporary directory with only the files we want
TEMP_DIR=$(mktemp -d)
cp index.html terms.html privacy.html styles.css "$TEMP_DIR"

# Deploy from temp directory
cd "$TEMP_DIR"
wrangler pages deploy . --project-name=volunteer-app-legal --commit-dirty=true

# Cleanup
cd - > /dev/null
rm -rf "$TEMP_DIR"

echo "✅ Deployment complete! README.md excluded."

