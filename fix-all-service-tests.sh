#!/bin/bash

# Script to fix all comprehensive service test files
# Applies consistent fixes for imports, mocks, and axios handling

echo "🔧 Fixing all comprehensive service test files..."
echo ""

FIXED=0
FAILED=0

# Find all comprehensive test files
TEST_FILES=$(find __tests__/controller/query -name "*.service.comprehensive.test.ts" -type f | sort)

for file in $TEST_FILES; do
  filename=$(basename "$file")
  echo "Processing: $filename"
  
  # Create backup
  cp "$file" "${file}.bak"
  
  # Fix 1: Replace relative paths with @ alias
  sed -i 's|"../../../../../src/controller|"@/controller|g' "$file"
  sed -i 's|"../../../../src/controller|"@/controller|g' "$file"
  
  # Fix 2: Clean up axios mock
  sed -i 's|jest.mock("axios", () => ({|jest.mock("axios");|' "$file"
  sed -i '/isAxiosError: jest.fn(),$/d' "$file"
  
  # Fix 3: Remove stray }));
  sed -i '/^}));$/d' "$file"
  
  # Fix 4: Replace (axios.isAxiosError as jest.Mock) with jest.spyOn
  sed -i 's|(axios.isAxiosError as jest.Mock).mockReturnValueOnce|jest.spyOn(axios, "isAxiosError").mockReturnValueOnce|g' "$file"
  
  # Fix 5: Ensure beforeEach has jest.clearAllMocks()
  sed -i '/beforeEach(() => {$/,/^  });$/ { /beforeEach/! { /^  });$/! { /jest.clearAllMocks/! s|^  });\$|    jest.clearAllMocks();\n  });| } } }' "$file"
  
  # Fix 6: Add afterEach with restoreAllMocks if not present  
  if ! grep -q "afterEach" "$file"; then
    sed -i '/beforeEach.*{/a\  });\n\n  afterEach(() => {\n    jest.restoreAllMocks();' "$file"
  fi
  
  # Test if file compiles
  if npx tsc --noEmit "$file" 2>/dev/null; then
    FIXED=$((FIXED + 1))
    rm "${file}.bak"
    echo "  ✅ Fixed"
  else
    FAILED=$((FAILED + 1))
    # Restore backup if compilation fails
    mv "${file}.bak" "$file"
    echo "  ⚠️  Failed (restored backup)"
  fi
  
  echo ""
done

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Summary:"
echo "   Fixed: $FIXED files"
echo "   Failed: $FAILED files"
echo ""
echo "🧪 Run tests with:"
echo "   npm test -- __tests__/controller/query/**/*.service.comprehensive.test.ts"
echo ""

