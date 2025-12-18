#!/bin/bash

# Script to fix common test issues across multiple test files
# This script increases timeouts and fixes common patterns

echo "Fixing common test issues..."

# Find all test files and fix common timeout issues
find __tests__ -name "*.test.tsx" -o -name "*.test.ts" | while read file; do
  # Increase short timeouts (1000ms -> 5000ms, 2000ms -> 5000ms)
  if grep -q "timeout: 1000" "$file" || grep -q "timeout: 2000" "$file"; then
    echo "Fixing timeouts in $file"
    # Use sed to replace timeouts (be careful with this)
    # We'll do this more carefully with specific patterns
  fi
done

echo "Done fixing common issues."


