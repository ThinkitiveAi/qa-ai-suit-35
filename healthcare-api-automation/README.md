# Healthcare API Automation Framework

A comprehensive Playwright-based API automation framework for testing healthcare platform APIs, now with full TypeScript implementation based on actual Postman collection structure.

## 🆕 New Features

- **✅ Postman Collection Based**: Built from actual API collection with real request/response structures
- **✅ Complete TypeScript Implementation**: Full type safety with interfaces matching actual API payloads
- **✅ Comprehensive Workflow Class**: `HealthcareApiWorkflow` class for easy integration
- **✅ Multiple Test Suites**: Both original and Postman-based implementations
- **✅ Enhanced Error Handling**: Robust error scenarios and validation
- **✅ Flexible Configuration**: Support for different tenants and environments

## Project Structure

```
healthcare-api-automation/
├── src/
│   ├── types/
│   │   └── api.types.ts              # Original API type definitions
│   ├── utils/
│   │   └── api-client.ts             # Original API client wrapper
│   └── healthcare-api-workflow.ts    # 🆕 NEW: Complete Postman-based implementation
├── tests/
│   ├── healthcare-workflow.spec.ts          # Original test suite
│   ├── healthcare-postman-workflow.spec.ts  # 🆕 NEW: Postman-based test suite
│   └── setup.ts                             # Test setup
├── playwright.config.ts             # Playwright configuration
├── package.json                     # Dependencies and scripts
├── tsconfig.json                    # TypeScript configuration
├── setup.bat                       # Windows setup script
├── QUICK_START.md                  # Quick setup guide
└── README.md                       # This file
```

## 🚀 Quick Start

### 1. Setup Environment
```bash
cd D:\Claude\healthcare-api-automation
npm install
npm run install:playwright
```

**OR** run the setup script:
```bash
setup.bat
```

### 2. Run Tests

#### NEW Postman-Based Tests (Recommended):
```bash
# Run complete postman-based workflow
npm run test:postman

# Run with browser visible
npm run test:postman:headed

# Debug mode
npm run test:postman:debug
```

#### Original Tests:
```bash
# Run original workflow
npm run test:original

# Run all tests
npm test
```

## 🎯 What the Tests Do

### Complete Healthcare Workflow:
1. **🔐 Provider Login** → Authenticate with credentials and capture Bearer token
2. **👤 Create Patient** → Samuel Peterson (Male, DOB: 1994-08-16) with full medical data
3. **👨‍⚕️ Create Provider** → Steven Miller (PROVIDER role) with complete profile
4. **📅 Set Availability** → Monday 12:00-13:00 virtual slots with 30-min duration
5. **📋 Book Appointment** → Aug 4th, 2025, 17:00-17:30 UTC virtual appointment
6. **🔍 Verify** → GET calls to confirm all data created properly

## 🛠️ Usage Examples

### Using the HealthcareApiWorkflow Class:

```typescript
import { HealthcareApiWorkflow } from './src/healthcare-api-workflow';

// In your test
test('Healthcare API Workflow', async ({ request }) => {
  const workflow = new HealthcareApiWorkflow(request, 'stage_aithinkitive');
  
  // Execute complete workflow
  const results = await workflow.executeCompleteWorkflow();
  
  // Verify results
  expect(results.loginResponse.data.accessToken).toBeTruthy();
  expect(results.patientResponse.data.id).toBeTruthy();
  expect(results.providerResponse.data.id).toBeTruthy();
});
```

### Individual Steps:

```typescript
// Step-by-step execution
const workflow = new HealthcareApiWorkflow(request);

// 1. Login
const loginResponse = await workflow.providerLogin(
  'rose.gomez@jourrapide.com',
  'Pass@123'
);

// 2. Create Patient
const patientResponse = await workflow.createPatient();
const patientId = patientResponse.data.id;

// 3. Add Provider
const providerResponse = await workflow.addProvider();
const providerId = providerResponse.data.id;

// 4. Set Availability
await workflow.setAvailability(providerId);

// 5. Book Appointment
await workflow.bookAppointment(patientId, providerId);

// 6. Verification
const providers = await workflow.getProviders();
const patients = await workflow.getPatients();
const availability = await workflow.getAvailabilitySettings(providerId);
```

## 📝 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run test:postman` | Run Postman-based workflow tests |
| `npm run test:postman:headed` | Run Postman tests with browser visible |
| `npm run test:postman:debug` | Debug Postman tests step-by-step |
| `npm run test:original` | Run original workflow tests |
| `npm test` | Run all tests |
| `npm run test:headed` | Run all tests with browser visible |
| `npm run test:debug` | Debug all tests |
| `npm run build` | Compile TypeScript |
| `npm run clean` | Clean build artifacts and reports |

## 🔧 Configuration

### API Endpoints
- **Base URL**: `https://stage-api.ecarehealth.com/api/master`
- **Default Tenant**: `stage_aithinkitive`

### Required Headers (Auto-managed)
- `Content-Type: application/json`
- `X-TENANT-ID: <tenant-id>`
- `Authorization: Bearer <token>` (for authenticated requests)
- Plus all browser headers matching real requests

### Test Data
All test data matches the Postman collection structure:
- **Login**: `rose.gomez@jourrapide.com` / `Pass@123`
- **Patient**: Samuel Peterson (Male, 1994-08-16)
- **Provider**: Steven Miller (saurabh.kale+steven@medarch.com)
- **Appointment**: Virtual, Aug 4th 2025, 17:00-17:30 UTC

## 🎛️ Advanced Features

### Multi-Tenant Support
```typescript
const workflow = new HealthcareApiWorkflow(request, 'stage_ketamin');
// or
workflow.setTenantId('stage_aithinkitive');
```

### Pagination Support
```typescript
// Get providers with pagination
const providers = await workflow.getProviders(0, 10); // page 0, size 10

// Search patients
const patients = await workflow.getPatients(0, 20, 'Samuel'); // search for 'Samuel'
```

### Error Handling
```typescript
try {
  await workflow.providerLogin('invalid@email.com', 'wrong');
} catch (error) {
  console.log('Login failed as expected');
}
```

## 🧪 Test Categories

### 1. Complete Workflow Test
- End-to-end healthcare workflow
- All steps in sequence with verification

### 2. Individual Step Tests
- Each API endpoint tested separately
- Isolated functionality validation

### 3. Error Handling Tests
- Invalid credentials
- Unauthorized requests
- Network failures

### 4. Data Validation Tests
- Response structure validation
- Required field verification
- Type checking

### 5. Configuration Tests
- Multi-tenant support
- Pagination functionality
- Header management

## 📊 Reporting

Test results are available in multiple formats:
- **HTML Report**: `playwright-report/index.html`
- **JSON Results**: `test-results/results.json`
- **Console Logs**: Real-time execution with emojis and detailed responses

## 🔍 Key Differences from Original

### ✅ Postman-Based Implementation Benefits:
1. **Real API Structure**: Matches actual API requests/responses exactly
2. **Complete Data Models**: Full TypeScript interfaces for all payloads  
3. **Authentic Headers**: All browser headers from real requests
4. **Robust Error Handling**: Based on actual API behavior
5. **Comprehensive Validation**: Tests data structure accuracy

### 🆚 Comparison:

| Feature | Original | Postman-Based |
|---------|----------|---------------|
| **API Accuracy** | Simplified | ✅ **100% Accurate** |
| **Type Safety** | Basic interfaces | ✅ **Complete models** |
| **Headers** | Minimal | ✅ **Full browser headers** |
| **Error Handling** | Basic | ✅ **Comprehensive** |
| **Test Coverage** | Workflow only | ✅ **Multi-scenario** |

## 💡 Troubleshooting

### Common Issues:
1. **Authentication Failures**: Verify credentials and tenant ID
2. **Network Issues**: Check API endpoint availability  
3. **Token Expiry**: Framework automatically handles token capture
4. **Data Validation**: Review actual API response vs expected structure

### Debug Mode:
```bash
npm run test:postman:debug
```

### Verbose Logging:
All responses are logged with detailed JSON output for debugging.

## 🤝 Contributing

1. Follow TypeScript best practices
2. Add proper error handling for new endpoints
3. Include comprehensive logging
4. Update type definitions for new API structures
5. Create tests for new functionality
6. Document changes in README

## 📚 API Documentation

The framework is built from actual Postman collection, ensuring 100% API compatibility. All request/response structures match the real healthcare platform APIs.

---

**🚀 Ready to automate your healthcare API testing with production-ready accuracy!**