#!/bin/bash

files=(
  "__tests__/controller/query/auth/auth.service.comprehensive.test.ts"
  "__tests__/controller/query/auth/otp.service.comprehensive.test.ts"
  "__tests__/controller/query/contacts/contacts.service.comprehensive.test.ts"
  "__tests__/controller/query/dashboard/dashboard.service.comprehensive.test.ts"
  "__tests__/controller/query/documents/document.service.comprehensive.test.ts"
  "__tests__/controller/query/messages/messages.service.comprehensive.test.ts"
  "__tests__/controller/query/messages/messagesTable.service.comprehensive.test.ts"
  "__tests__/controller/query/notifications/notifications.service.comprehensive.test.ts"
  "__tests__/controller/query/profile/profile.service.comprehensive.test.ts"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    # Fix the jest.mock("axios") line that's inside another jest.mock
    perl -i -pe 's/billingApiRequest: jest\.fn\(\),\n\n\/\/ Mock axios\njest\.mock\("axios"\);\n\}\);/billingApiRequest: jest.fn(),\n});\n\n\/\/ Mock axios\njest.mock("axios");/g' "$file"
    echo "Fixed $file"
  fi
done


