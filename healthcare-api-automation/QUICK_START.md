# Quick Start Guide

## Getting Started in 3 Steps

### 1. Setup Environment
```bash
cd D:\Claude\healthcare-api-automation
npm install
npm run install:playwright
```

**OR** Simply run the setup script:
```bash
setup.bat
```

### 2. Run Complete Workflow Test
```bash
npm test
```

### 3. View Results
- **Console**: Real-time logs with emojis and detailed responses
- **HTML Report**: Open `playwright-report/index.html` in browser
- **JSON Results**: Check `test-results/results.json`

## What the Test Does

✅ **Login** → Authenticate with provided credentials  
✅ **Create Patient** → Samuel Peterson (Male, DOB: 1994-08-16)  
✅ **Create Provider** → Steven Miller (PROVIDER role)  
✅ **Set Availability** → Monday 12:00-13:00 virtual slots  
✅ **Book Appointment** → Aug 4th, 2025, 17:00-17:30 UTC  
✅ **Verify** → GET calls to confirm all data created  

## Customization

### Update Credentials
Edit `tests/healthcare-workflow.spec.ts`:
```typescript
const loginCredentials: LoginCredentials = {
  username: 'your.email@domain.com',
  password: 'YourPassword123'
};
```

### Modify Test Data
Update patient/provider information in the same test file.

### Add New Endpoints  
Extend the `ApiClient` class in `src/utils/api-client.ts`.

## Commands Reference

| Command | Description |
|---------|-------------|
| `npm test` | Run all tests |
| `npm run test:headed` | Run with browser visible |
| `npm run test:debug` | Debug mode with step-by-step |

## Support

Check the main README.md for detailed documentation and troubleshooting.

🚀 **Ready to automate your healthcare API testing!**