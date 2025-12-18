#!/bin/bash

echo "🧪 Running all working comprehensive tests..."
echo ""

npm test -- \
  __tests__/controller/api/config/baseUrl.comprehensive.test.ts \
  __tests__/controller/api/config/config.comprehensive.test.ts \
  __tests__/controller/query/admin/actions/actions.service.comprehensive.test.ts \
  --coverage \
  --collectCoverageFrom='src/controller/api/config/baseUrl.ts' \
  --collectCoverageFrom='src/controller/api/config/config.ts' \
  --collectCoverageFrom='src/controller/query/admin/actions/actions.service.ts'


