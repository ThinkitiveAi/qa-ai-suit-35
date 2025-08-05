# ECareHealth API Testing Framework

A comprehensive Playwright-based API testing framework for ECareHealth Clinician Management CRUD operations.

## 🔐 Dynamic Authentication

The framework now supports **dynamic token generation** for each test run:

### Authentication Flow:
1. **Fresh Token Each Run**: Framework attempts to get a new bearer token for every test execution
2. **Fallback Mechanism**: If login endpoint is not available, falls back to static token
3. **Token Validation**: Automatically checks token expiration and refreshes if needed
4. **Environment Support**: Different credentials for different environments

### Login Process:
```javascript
// Framework automatically:
1. Reads credentials from environment configuration
2. Calls login API endpoint to get fresh token
3. Sets the new token for all subsequent API calls
4. Validates token expiration before each test
```

## 🚀 Features

- **Dynamic Authentication**: Gets fresh bearer token for each test run
- **Environment Management**: Support for staging, production, and development environments
- **Dynamic Test Data Generation**: Automatically generates unique test data for each run using Faker.js
- **Robust Error Handling**: Comprehensive error handling and validation
- **Detailed Logging**: Step-by-step execution logging with request/response details
- **Multiple Test Scenarios**: Individual endpoint tests and complete flow tests
- **Authentication Management**: Automated bearer token handling
- **Data Integrity Verification**: Post-test data validation

## 📁 Project Structure

```
ecare-api-testing-framework/
├── package.json                     # Project dependencies and scripts
├── playwright.config.js             # Playwright configuration
├── README.md                        # This file
├── utils/
│   ├── apiClient.js                # API client with HTTP methods
│   ├── authHelper.js               # Authentication utilities
│   └── testDataGenerator.js        # Dynamic test data generation
├── tests/
│   └── clinician-management.spec.js # Main test specifications
└── test-results/                   # Test reports and artifacts
    ├── html-report/
    ├── results.json
    └── junit.xml
```

## 🛠️ Setup Instructions

### 1. Prerequisites

- Node.js (v16 or higher)
- npm or yarn package manager

### 2. Installation

1. **Clone or create the project directory:**
   ```bash
   mkdir ecare-api-testing-framework
   cd ecare-api-testing-framework
   ```

2. **Initialize the project:**
   ```bash
   npm init -y
   ```

3. **Install dependencies:**
   ```bash
   npm install @playwright/test @types/node faker@6.6.6 moment --save-dev
   ```

4. **Install Playwright browsers:**
   ```bash
   npx playwright install
   ```

5. **Copy all the framework files** to their respective directories as shown in the project structure above.

### 3. Configuration

1. **Environment Setup:**
   ```bash
   # Create .env file with your credentials
   cp .env.example .env
   # Edit .env file with actual passwords
   ```

2. **Update .env file:**
   ```bash
   TEST_ENV=staging
   TEST_PASSWORD=your_actual_password_here
   ```

3. **Login Endpoint Configuration:**
   Update `config/environment.js` with your actual login endpoint if different from `/api/auth/login`

## 🎯 Usage

### Running Tests

1. **Run all tests:**
   ```bash
   npm test
   ```

2. **Run tests with UI mode:**
   ```bash
   npm run test:ui
   ```

3. **Run tests in debug mode:**
   ```bash
   npm run test:debug
   ```

4. **Run tests in headed mode:**
   ```bash
   npm run test:headed
   ```

5. **View test reports:**
   ```bash
   npm run test:report
   ```

### Test Scenarios

The framework includes several test scenarios:

1. **Complete Clinician Management Flow**
   - Authentication
   - Create Provider
   - Get Provider Status
   - Set Provider Availability
   - Create Patient
   - Get Patient Details
   - Book Appointment
   - Data Integrity Verification

2. **Individual API Endpoint Tests**
   - Provider Creation
   - Patient Creation
   - Availability Setting
   - Appointment Booking

3. **Error Handling Tests**
   - Invalid ID handling
   - Error response validation

## 🔧 Key Features

### Dynamic Test Data Generation

The framework automatically generates unique test data for each run:
- **Providers**: Random names, emails with timestamps
- **Patients**: Random demographics, birth dates
- **Appointments**: Future dates, unique complaints
- **Availability**: Configurable time slots

### Authentication Management

- Static bearer token for consistent testing
- Automatic token validation
- Header management for all requests

### Comprehensive Logging

Every request includes:
- Request method and endpoint
- Request payload
- Response status and body
- Step-by-step execution progress

### Error Handling

- Status code validation
- Response structure validation
- Detailed error messages
- Graceful failure handling

## 📊 Test Reports

The framework generates multiple report formats:
- **HTML Report**: Interactive web-based report
- **JSON Report**: Machine-readable results
- **JUnit XML**: CI/CD integration compatible
- **List Report**: Console output

## 🔄 Continuous Integration

The framework is CI/CD ready with:
- Configurable retry logic
- Parallel execution control
- Multiple output formats
- Screenshot and trace capture on failures

## 📝 Test Data Management

### Provider Data
- Unique email addresses with timestamps
- Random names and demographics
- Complete license and DEA information structure

### Patient Data
- Random demographics
- Configurable birth dates
- Insurance information templates
- Consent management

### Appointment Data
- Future appointment scheduling
- Timezone handling
- Duration and type configuration
- Recurring appointment support

## 🚨 Important Notes

1. **Bearer Token**: The framework uses a static bearer token. Ensure it's valid for your testing period.

2. **Test Data**: Each test run generates completely new data, preventing conflicts from previous runs.

3. **Sequential Execution**: Tests run sequentially to maintain data dependencies and avoid race conditions.

4. **Environment**: Currently configured for staging environment. Update URLs for different environments.

## 🐛 Troubleshooting

### Common Issues

1. **Token Expiration**: Update the bearer token in `utils/authHelper.js`

2. **Network Issues**: Check VPN/firewall settings for API access

3. **Data Conflicts**: The framework generates unique data, but if issues persist, check for API-side constraints

4. **Timeout Issues**: Increase timeout values in `playwright.config.js`

### Debug Mode

For detailed debugging:
```bash
npm run test:debug
```

This opens the Playwright Inspector for step-by-step execution.

## 📈 Extending the Framework

### Adding New Test Cases

1. Create new test files in the `tests/` directory
2. Import required utilities from `utils/`
3. Follow the existing pattern for API calls and validations

### Adding New Endpoints

1. Add new methods to `ApiClient` class
2. Create corresponding test data generators
3. Add validation logic for responses

### Custom Data Generation

Modify `TestDataGenerator` class to add new data patterns or customize existing ones.

## 🤝 Contributing

1. Follow the existing code structure
2. Add appropriate error handling
3. Include detailed logging
4. Write comprehensive tests
5. Update documentation

## 📄 License

MIT License - feel free to use and modify as needed.

---

**Happy Testing! 🎉**

For questions or issues, please refer to the troubleshooting section or check the detailed logs in the test reports.