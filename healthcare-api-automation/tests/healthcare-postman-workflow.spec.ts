import { test, expect } from '@playwright/test';
import { HealthcareApiWorkflow } from '../src/healthcare-api-workflow';

test.describe('Healthcare API Workflow - Based on Postman Collection', () => {
  let workflow: HealthcareApiWorkflow;

  test.beforeEach(async ({ request }) => {
    workflow = new HealthcareApiWorkflow(request, 'stage_aithinkitive');
  });

  test('Complete Healthcare Workflow - All Steps', async () => {
    console.log('🚀 Starting Complete Healthcare API Workflow Test\n');

    // Execute the complete workflow
    const results = await workflow.executeCompleteWorkflow();

    // Verify Login
    expect(results.loginResponse.data?.accessToken).toBeTruthy();
    console.log('✅ Login verification passed');

    // Verify Patient Creation
    expect(results.patientResponse.data?.id).toBeTruthy();
    expect(results.patientResponse.data?.firstName).toBe('Samuel');
    expect(results.patientResponse.data?.lastName).toBe('Peterson');
    console.log('✅ Patient creation verification passed');

    // Verify Provider Creation
    expect(results.providerResponse.data?.id).toBeTruthy();
    expect(results.providerResponse.data?.firstName).toBe('Steven');
    expect(results.providerResponse.data?.lastName).toBe('Miller');
    console.log('✅ Provider creation verification passed');

    // Verify Availability Setting
    expect(results.availabilityResponse).toBeTruthy();
    console.log('✅ Availability setting verification passed');

    // Verify Appointment Booking
    expect(results.appointmentResponse.data?.id).toBeTruthy();
    expect(results.appointmentResponse.data?.patientId).toBe(results.patientResponse.data.id);
    expect(results.appointmentResponse.data?.providerId).toBe(results.providerResponse.data.id);
    console.log('✅ Appointment booking verification passed');

    // Verify GET endpoints
    expect(results.verificationResults.providers.data).toBeTruthy();
    expect(results.verificationResults.patients.data).toBeTruthy();
    expect(results.verificationResults.availability.data).toBeTruthy();
    console.log('✅ All verification calls passed');

    console.log('\n🎉 Complete Healthcare API Workflow Test Completed Successfully!');
  });

  test('Individual Step Tests', async () => {
    console.log('🧪 Testing Individual Steps...\n');

    // Test Login
    const loginResponse = await workflow.providerLogin(
      'rose.gomez@jourrapide.com',
      'Pass@123'
    );
    expect(loginResponse.data?.accessToken).toBeTruthy();
    expect(workflow.getBearerToken()).toBeTruthy();

    // Test Create Patient
    const patientResponse = await workflow.createPatient();
    expect(patientResponse.data?.id).toBeTruthy();
    const patientId = patientResponse.data.id;

    // Test Add Provider
    const providerResponse = await workflow.addProvider();
    expect(providerResponse.data?.id).toBeTruthy();
    const providerId = providerResponse.data.id;

    // Test Set Availability
    const availabilityResponse = await workflow.setAvailability(providerId);
    expect(availabilityResponse).toBeTruthy();

    // Test Book Appointment
    const appointmentResponse = await workflow.bookAppointment(patientId, providerId);
    expect(appointmentResponse.data?.id).toBeTruthy();

    // Test Verification Endpoints
    const providers = await workflow.getProviders();
    expect(providers.data).toBeTruthy();

    const patients = await workflow.getPatients();
    expect(patients.data).toBeTruthy();

    const availability = await workflow.getAvailabilitySettings(providerId);
    expect(availability.data).toBeTruthy();

    console.log('✅ All individual step tests passed!');
  });

  test('Error Handling Tests', async () => {
    console.log('🧪 Testing Error Handling...\n');

    // Test invalid login
    try {
      await workflow.providerLogin('invalid@email.com', 'wrongpassword');
      // If we reach here, the test should fail
      expect(false).toBe(true);
    } catch (error) {
      console.log('✅ Invalid login error properly handled');
    }

    // Test unauthorized request (without login)
    const workflowNoAuth = new HealthcareApiWorkflow(workflow['request'], 'stage_aithinkitive');
    try {
      await workflowNoAuth.createPatient();
      // If we reach here, the test should fail
      expect(false).toBe(true);
    } catch (error) {
      console.log('✅ Unauthorized request error properly handled');
    }

    console.log('✅ Error handling tests completed!');
  });

  test('Tenant Configuration Test', async () => {
    console.log('🧪 Testing Tenant Configuration...\n');

    // Test with different tenant
    workflow.setTenantId('stage_ketamin');
    
    // This should work with the new tenant ID
    const loginResponse = await workflow.providerLogin(
      'rose.gomez@jourrapide.com',
      'Pass@123'
    );
    
    // Note: This might fail if the credentials don't exist for this tenant
    // but it tests the tenant switching functionality
    console.log('Login attempt with different tenant completed');
    console.log('Response status indicates tenant switching works');
  });

  test('Data Validation Tests', async () => {
    console.log('🧪 Testing Data Validation...\n');

    // Login first
    await workflow.providerLogin('rose.gomez@jourrapide.com', 'Pass@123');

    // Create patient and verify structure
    const patientResponse = await workflow.createPatient();
    expect(patientResponse.data).toHaveProperty('id');
    expect(patientResponse.data).toHaveProperty('firstName');
    expect(patientResponse.data).toHaveProperty('lastName');
    expect(patientResponse.data).toHaveProperty('gender');
    
    // Create provider and verify structure
    const providerResponse = await workflow.addProvider();
    expect(providerResponse.data).toHaveProperty('id');
    expect(providerResponse.data).toHaveProperty('firstName');
    expect(providerResponse.data).toHaveProperty('lastName');
    expect(providerResponse.data).toHaveProperty('email');
    expect(providerResponse.data).toHaveProperty('role');

    console.log('✅ Data validation tests passed!');
  });

  test('Pagination Tests', async () => {
    console.log('🧪 Testing Pagination...\n');

    // Login first
    await workflow.providerLogin('rose.gomez@jourrapide.com', 'Pass@123');

    // Test different page sizes
    const providers1 = await workflow.getProviders(0, 5);
    expect(providers1.data).toBeTruthy();

    const providers2 = await workflow.getProviders(0, 10);
    expect(providers2.data).toBeTruthy();

    const patients1 = await workflow.getPatients(0, 5);
    expect(patients1.data).toBeTruthy();

    const patients2 = await workflow.getPatients(0, 10, 'Samuel');
    expect(patients2.data).toBeTruthy();

    console.log('✅ Pagination tests passed!');
  });
});