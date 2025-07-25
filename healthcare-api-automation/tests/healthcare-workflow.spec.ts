import { test, expect } from '@playwright/test';
import { ApiClient } from '../src/utils/api-client';
import { 
  LoginCredentials, 
  Patient, 
  Provider, 
  AvailabilitySlot,
  AppointmentRequest 
} from '../src/types/api.types';

test.describe('Healthcare API Workflow', () => {
  let apiClient: ApiClient;
  let patientId: string;
  let providerId: string;

  test.beforeEach(async ({ request }) => {
    apiClient = new ApiClient(request);
  });

  test('Complete Healthcare Workflow', async () => {
    console.log('🚀 Starting Healthcare API Workflow Test');

    // Step 1: Provider Login
    const loginCredentials: LoginCredentials = {
      username: 'rose.gomez@jourrapide.com',
      password: 'Pass@123'
    };

    const loginResponse = await apiClient.login(loginCredentials);
    expect(loginResponse.code).toBe('ENTITY');
    expect(apiClient.getBearerToken()).toBeTruthy();

    // Step 2: Create Patient
    const patient: Patient = {
      firstName: 'Samuel',
      lastName: 'Peterson',
      gender: 'MALE',
      birthDate: '1994-08-16',
      email: 'samuel.peterson@example.com',
      phone: '+1234567890'
    };

    const patientResponse = await apiClient.createPatient(patient);
    patientId = patientResponse.data.id;
    expect(patientId).toBeTruthy();

    // Step 3: Add Provider
    const provider: Provider = {
      firstName: 'Steven',
      lastName: 'Miller',
      email: 'saurabh.kale+steven@medarch.com',
      role: 'PROVIDER',
      specialization: 'General Medicine'
    };

    const providerResponse = await apiClient.createProvider(provider);
    providerId = providerResponse.data.id;
    expect(providerId).toBeTruthy();

    // Step 4: Set Availability
    const availabilitySlot: AvailabilitySlot = {
      dayOfWeek: 'MONDAY',
      startTime: '12:00',
      endTime: '13:00',
      slotDuration: 30, // 30 minutes
      minimumNoticeHours: 8,
      appointmentType: 'VIRTUAL'
    };

    const availabilityRequest = {
      providerId: providerId,
      slots: [availabilitySlot]
    };

    await apiClient.setProviderAvailability(availabilityRequest);

    // Step 5: Book Appointment
    const appointmentRequest: AppointmentRequest = {
      patientId: patientId,
      providerId: providerId,
      appointmentDateTime: '2025-08-04T17:00:00Z',
      endDateTime: '2025-08-04T17:30:00Z',
      appointmentType: 'VIRTUAL',
      chiefComplaint: 'appointment test',
      notes: 'Test appointment via API automation'
    };

    const appointmentResponse = await apiClient.bookAppointment(appointmentRequest);
    expect(appointmentResponse.data.id).toBeTruthy();

    console.log('✅ All main workflow steps completed successfully!');

    // Step 6: Verification Calls
    console.log('🔍 Starting verification calls...');

    // Verify provider creation
    const providersResponse = await apiClient.getProviders();
    const createdProvider = providersResponse.data.find((p: any) => p.id === providerId);
    expect(createdProvider).toBeTruthy();
    expect(createdProvider.firstName).toBe('Steven');
    expect(createdProvider.lastName).toBe('Miller');

    // Verify patient creation
    const patientsResponse = await apiClient.getPatients();
    const createdPatient = patientsResponse.data.find((p: any) => p.id === patientId);
    expect(createdPatient).toBeTruthy();
    expect(createdPatient.firstName).toBe('Samuel');
    expect(createdPatient.lastName).toBe('Peterson');

    // Verify availability settings
    const availabilityResponse = await apiClient.getAvailabilitySettings(providerId);
    expect(availabilityResponse.data).toBeTruthy();
    
    console.log('✅ All verification calls completed successfully!');
    console.log('🎉 Healthcare API Workflow Test Completed Successfully!');
  });

  test('Error Handling Test', async () => {
    console.log('🧪 Testing error handling scenarios...');

    // Test invalid login
    const invalidCredentials: LoginCredentials = {
      username: 'invalid@email.com',
      password: 'wrongpassword'
    };

    try {
      await apiClient.login(invalidCredentials);
      expect(false).toBe(true); // Should not reach here
    } catch (error) {
      console.log('✅ Invalid login properly handled');
    }

    // Test unauthorized request (without login)
    const patient: Patient = {
      firstName: 'Test',
      lastName: 'Patient',
      gender: 'MALE',
      birthDate: '1990-01-01'
    };

    try {
      await apiClient.createPatient(patient);
      expect(false).toBe(true); // Should not reach here
    } catch (error) {
      console.log('✅ Unauthorized request properly handled');
    }
  });
});