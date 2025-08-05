#!/usr/bin/env node

const readline = require('readline');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

async function updateToken() {
  console.log('🔑 ECareHealth Token Helper');
  console.log('═'.repeat(50));
  console.log('This helper will update your bearer token for dynamic authentication.\n');

  console.log('📋 STEP 1: Get Fresh Token');
  console.log('1. Open https://qa.practiceeasily.com in browser');
  console.log('2. Login with: rose.gomez@jourrapide.com / Pass@123');
  console.log('3. Open Developer Tools (F12) → Network tab');
  console.log('4. Refresh page or make any action');
  console.log('5. Look for API calls to stage-api.ecarehealth.com');
  console.log('6. Find Authorization header: "Bearer eyJ..."');
  console.log('7. Copy the token (without "Bearer " prefix)\n');

  const token = await askQuestion('📥 Paste your fresh token here: ');

  if (!token || token.trim().length < 50) {
    console.log('❌ Invalid token provided. Token should be a long string starting with "eyJ"');
    rl.close();
    return;
  }

  const cleanToken = token.trim();

  // Validate token format
  if (!cleanToken.startsWith('eyJ')) {
    console.log('❌ Token should start with "eyJ". Please make sure you copied the JWT token correctly.');
    rl.close();
    return;
  }

  try {
    // Parse and validate token
    const parts = cleanToken.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid JWT format');
    }

    const payload = JSON.parse(atob(parts[1]));
    const expirationDate = new Date(payload.exp * 1000);
    const currentDate = new Date();

    console.log('\n✅ Token validated successfully!');
    console.log(`👤 User: ${payload.preferred_username || payload.name || 'Unknown'}`);
    console.log(`🕒 Expires: ${expirationDate.toLocaleString()}`);
    console.log(`⏱️  Valid for: ${Math.ceil((expirationDate - currentDate) / (1000 * 60))} minutes\n`);

    // Ask how to store the token
    console.log('💾 How would you like to store this token?\n');
    console.log('1. Environment variable (recommended)');
    console.log('2. Update code directly');
    console.log('3. Just show me the commands\n');

    const choice = await askQuestion('Choose option (1-3): ');

    switch (choice.trim()) {
      case '1':
        await handleEnvironmentVariable(cleanToken);
        break;
      case '2':
        await handleCodeUpdate(cleanToken);
        break;
      case '3':
        showCommands(cleanToken);
        break;
      default:
        console.log('❌ Invalid choice. Showing commands instead...');
        showCommands(cleanToken);
    }

  } catch (error) {
    console.log(`❌ Error validating token: ${error.message}`);
    console.log('Please make sure you copied the complete JWT token.');
  }

  rl.close();
}

async function handleEnvironmentVariable(token) {
  console.log('\n🔧 ENVIRONMENT VARIABLE SETUP');
  console.log('═'.repeat(40));
  
  // Try to update .env file
  const envPath = '.env';
  let envContent = '';
  
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
  }

  // Remove existing BEARER_TOKEN if present
  envContent = envContent.replace(/^BEARER_TOKEN=.*$/m, '');
  
  // Add new token
  envContent += `\nBEARER_TOKEN=${token}\n`;
  
  fs.writeFileSync(envPath, envContent);
  
  console.log('✅ Updated .env file with new token');
  console.log('\n🚀 Ready to run tests:');
  console.log('   npm test');
  console.log('\n💡 The framework will now use your fresh token for dynamic authentication!');
}

async function handleCodeUpdate(token) {
  console.log('\n🔧 CODE UPDATE');
  console.log('═'.repeat(30));
  
  const authHelperPath = path.join('utils', 'authHelper.js');
  
  if (!fs.existsSync(authHelperPath)) {
    console.log('❌ Could not find utils/authHelper.js');
    showCommands(token);
    return;
  }

  try {
    let content = fs.readFileSync(authHelperPath, 'utf8');
    
    // Find and replace the token in getWorkingBearerToken method
    const tokenRegex = /(getWorkingBearerToken\(\)\s*\{\s*return\s+['"`])([^'"`]+)(['"`];)/;
    
    if (tokenRegex.test(content)) {
      content = content.replace(tokenRegex, `$1${token}$3`);
      fs.writeFileSync(authHelperPath, content);
      
      console.log('✅ Updated authHelper.js with new token');
      console.log('\n🚀 Ready to run tests:');
      console.log('   npm test');
    } else {
      console.log('❌ Could not find token location in authHelper.js');
      showCommands(token);
    }
    
  } catch (error) {
    console.log(`❌ Error updating file: ${error.message}`);
    showCommands(token);
  }
}

function showCommands(token) {
  console.log('\n📋 MANUAL COMMANDS');
  console.log('═'.repeat(35));
  console.log('\nOption 1 - Environment Variable:');
  console.log(`SET BEARER_TOKEN=${token}`);
  console.log('npm test\n');
  
  console.log('Option 2 - Update authHelper.js:');
  console.log('Replace the token in getWorkingBearerToken() method');
  console.log('Then run: npm test\n');
  
  console.log('🚀 Your tests will now use fresh authentication!');
}

// Run the helper
updateToken().catch(console.error);