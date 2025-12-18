# Test Fixes Needed

## Status

✅ **Test files created and added to jest.config.js:**
1. `__tests__/controller/api/config/config.comprehensive.test.ts` - Added to testMatch
2. `__tests__/controller/query/admin/actions/actions.service.comprehensive.test.ts` - Added to testMatch

## Current Issues

### config.comprehensive.test.ts
- **Issue**: Mock setup for `billingApi` needs refinement
- **Problem**: `billingApi` is an axios instance that can be called directly (`billingApi(config)`) or via `.request(config)`
- **Solution Needed**: Mock needs to be both callable as a function AND have `.request()` method

### actions.service.comprehensive.test.ts
- **Status**: Should work, but needs verification

## Quick Fix for config.comprehensive.test.ts

The mock should be:

```typescript
const requestFn = jest.fn();
const mockBillingApi = jest.fn((config: any) => requestFn(config));
mockBillingApi.request = requestFn;
mockBillingApi.interceptors = {
  request: { use: jest.fn(), handlers: [] },
  response: { use: jest.fn(), handlers: [] },
};
```

Then in tests, use:
```typescript
requestFn.mockResolvedValueOnce(mockResponse);
```

## Next Steps

1. Fix the mock setup in `config.comprehensive.test.ts`
2. Run tests to verify both test files pass
3. Check coverage to confirm 100% coverage achieved


