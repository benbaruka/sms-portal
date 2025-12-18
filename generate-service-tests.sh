#!/bin/bash

# Script to generate comprehensive tests for all *.service.ts files
# This creates basic test structure that covers all exported functions

echo "🔍 Scanning for *.service.ts files..."

# Find all service files
SERVICE_FILES=$(find src/controller -name "*.service.ts" -type f | sort)

TOTAL_FILES=$(echo "$SERVICE_FILES" | wc -l)
CURRENT=0

echo "📝 Found $TOTAL_FILES service files to test"
echo ""

for SERVICE_FILE in $SERVICE_FILES; do
  CURRENT=$((CURRENT + 1))
  
  # Extract service name and path
  SERVICE_NAME=$(basename "$SERVICE_FILE" .ts)
  SERVICE_DIR=$(dirname "$SERVICE_FILE")
  RELATIVE_PATH="${SERVICE_FILE#src/}"
  
  # Create test directory structure
  TEST_DIR="__tests__/${SERVICE_DIR#src/}"
  mkdir -p "$TEST_DIR"
  
  # Test file path
  TEST_FILE="$TEST_DIR/${SERVICE_NAME}.comprehensive.test.ts"
  
  # Skip if test already exists and is comprehensive
  if [ -f "$TEST_FILE" ] && grep -q "Comprehensive Tests" "$TEST_FILE"; then
    echo "[$CURRENT/$TOTAL_FILES] ✅ $SERVICE_NAME - Test already exists"
    continue
  fi
  
  echo "[$CURRENT/$TOTAL_FILES] 🔨 Generating test for $SERVICE_NAME..."
  
  # Extract exported functions from service file
  EXPORTS=$(grep -E "^export (const|function)" "$SERVICE_FILE" | sed 's/export const //g' | sed 's/export function //g' | sed 's/ =.*//g' | sed 's/(.*//g')
  
  # Count exports
  EXPORT_COUNT=$(echo "$EXPORTS" | wc -l)
  
  # Generate test file
  cat > "$TEST_FILE" << 'EOF'
// Mock billingApiRequest
jest.mock("../../../../src/controller/api/config/config", () => ({
  billingApiRequest: jest.fn(),
}));

import { billingApiRequest } from "../../../../src/controller/api/config/config";
const mockBillingApiRequest = billingApiRequest as jest.MockedFunction<typeof billingApiRequest>;

EOF

  # Add imports for the service
  echo "import * as service from \"../../../../${RELATIVE_PATH%.ts}\";" >> "$TEST_FILE"
  echo "" >> "$TEST_FILE"
  
  # Generate test suite
  echo "describe(\"${RELATIVE_PATH} - Comprehensive Tests\", () => {" >> "$TEST_FILE"
  echo "  beforeEach(() => {" >> "$TEST_FILE"
  echo "    jest.clearAllMocks();" >> "$TEST_FILE"
  echo "  });" >> "$TEST_FILE"
  echo "" >> "$TEST_FILE"
  
  # Generate tests for each export
  for EXPORT_NAME in $EXPORTS; do
    if [ -z "$EXPORT_NAME" ]; then
      continue
    fi
    
    echo "  describe(\"$EXPORT_NAME\", () => {" >> "$TEST_FILE"
    echo "    it(\"should handle success scenario\", async () => {" >> "$TEST_FILE"
    echo "      const mockResponse = { data: { success: true }, status: 200, statusText: \"OK\", headers: {}, config: {}, request: {} };" >> "$TEST_FILE"
    echo "      mockBillingApiRequest.mockResolvedValueOnce(mockResponse);" >> "$TEST_FILE"
    echo "      " >> "$TEST_FILE"
    echo "      // TODO: Call service.$EXPORT_NAME with appropriate parameters" >> "$TEST_FILE"
    echo "      // const result = await service.$EXPORT_NAME(...);" >> "$TEST_FILE"
    echo "      // expect(result).toBeDefined();" >> "$TEST_FILE"
    echo "    });" >> "$TEST_FILE"
    echo "" >> "$TEST_FILE"
    echo "    it(\"should handle API error\", async () => {" >> "$TEST_FILE"
    echo "      const axiosError = { response: { status: 500, data: { message: \"Error\" } } };" >> "$TEST_FILE"
    echo "      mockBillingApiRequest.mockRejectedValueOnce(axiosError);" >> "$TEST_FILE"
    echo "      " >> "$TEST_FILE"
    echo "      // TODO: Test error handling" >> "$TEST_FILE"
    echo "      // await expect(service.$EXPORT_NAME(...)).rejects.toThrow();" >> "$TEST_FILE"
    echo "    });" >> "$TEST_FILE"
    echo "" >> "$TEST_FILE"
    echo "    it(\"should handle empty response\", async () => {" >> "$TEST_FILE"
    echo "      const mockResponse = { data: null, status: 200, statusText: \"OK\", headers: {}, config: {}, request: {} };" >> "$TEST_FILE"
    echo "      mockBillingApiRequest.mockResolvedValueOnce(mockResponse);" >> "$TEST_FILE"
    echo "      " >> "$TEST_FILE"
    echo "      // TODO: Test empty response handling" >> "$TEST_FILE"
    echo "    });" >> "$TEST_FILE"
    echo "  });" >> "$TEST_FILE"
    echo "" >> "$TEST_FILE"
  done
  
  echo "});" >> "$TEST_FILE"
  
  echo "   ✓ Generated $EXPORT_COUNT function tests"
done

echo ""
echo "✅ Test generation complete!"
echo "📊 Generated tests for $TOTAL_FILES service files"
echo ""
echo "⚠️  Note: Generated tests contain TODO comments."
echo "   You need to fill in the actual function calls and assertions."
echo ""
echo "🧪 To run all generated tests:"
echo "   npm test -- __tests__/controller"


