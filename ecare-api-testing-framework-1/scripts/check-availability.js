#!/usr/bin/env node

const { request } = require('@playwright/test');
const ApiClient = require('../utils/apiClient');
const AuthHelper = require('../utils/authHelper');
const TestDataGenerator = require('../utils/testDataGenerator');

async function comprehensiveAvailabilityCheck() {
  console.log('🔍 COMPREHENSIVE AVAILABILITY CHECK');
  console.log('═'.repeat(60));
  
  try {
    // Create API client
    const apiRequest = await request.newContext({
      baseURL: 'https://stage-api.ecarehealth.com',
      ignoreHTTPSErrors: true
    });
    
    const apiClient = new ApiClient(apiRequest);
    await AuthHelper.authenticate(apiClient);
    
    // Create a test provider
    console.log('\n📋 Creating test provider...');
    const providerData = TestDataGenerator.generateProviderData();
    const providerResult = await apiClient.createProvider(providerData);
    const providerId = providerResult.providerId;
    console.log(`✅ Provider created with ID: ${providerId}`);
    
    // Set availability
    console.log('\n📋 Setting provider availability...');
    const availabilityData = TestDataGenerator.generateAvailabilityData(providerId);
    console.log('📤 Availability request data:');
    console.log(JSON.stringify(availabilityData, null, 2));
    
    const availabilityResponse = await apiClient.setAvailability(availabilityData);
    
    // Wait a bit for processing
    console.log('\n⏳ Waiting 3 seconds for availability to process...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Check various availability endpoints
    console.log('\n🔍 Checking availability endpoints...\n');
    
    const endpoints = [
      { method: 'GET', url: `/api/master/provider/${providerId}/availability` },
      { method: 'GET', url: `/api/master/provider/availability/${providerId}` },
      { method: 'GET', url: `/api/master/provider/${providerId}/availability-setting` },
      { method: 'GET', url: `/api/master/provider/availability-setting/${providerId}` },
      { method: 'GET', url: `/api/master/availability/provider/${providerId}` },
      { method: 'GET', url: `/api/master/provider/${providerId}/schedule` },
      { method: 'GET', url: `/api/master/schedule/provider/${providerId}` },
      { method: 'POST', url: `/api/master/provider/availability-setting/get`, data: { providerId } },
    ];
    
    for (const endpoint of endpoints) {
      try {
        console.log(`🔍 Trying: ${endpoint.method} ${endpoint.url}`);
        const response = await apiClient.makeRequest(
          endpoint.method, 
          endpoint.url, 
          endpoint.data || null, 
          [200, 201, 204, 400, 404], 
          true
        );
        
        if (response.status === 200 || response.status === 201) {
          console.log('✅ Success! Response:');
          console.log(JSON.stringify(response.body, null, 2));
          console.log('');
        } else if (response.status === 204) {
          console.log('ℹ️ Success but no content (204)');
        } else {
          console.log(`❌ Status ${response.status}: ${JSON.stringify(response.body).substring(0, 100)}...`);
        }
      } catch (error) {
        console.log(`❌ Error: ${error.message.substring(0, 100)}...`);
      }
      console.log('');
    }
    
    // Check appointment slots
    console.log('\n🔍 Checking appointment slots...\n');
    
    const today = new Date();
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    const slotEndpoints = [
      `/api/master/appointment/available-slots?providerId=${providerId}&startDate=${today.toISOString()}&endDate=${nextWeek.toISOString()}`,
      `/api/master/appointment/slots?providerId=${providerId}&date=${tomorrow.toISOString()}`,
      `/api/master/provider/${providerId}/slots?startDate=${today.toISOString()}&endDate=${nextWeek.toISOString()}`,
      `/api/master/appointment/availability?providerId=${providerId}&date=${tomorrow.toISOString().split('T')[0]}`,
      `/api/master/slots/provider/${providerId}?startDate=${today.toISOString()}&endDate=${nextWeek.toISOString()}`,
    ];
    
    for (const endpoint of slotEndpoints) {
      try {
        console.log(`🔍 Trying: GET ${endpoint.substring(0, 80)}...`);
        const response = await apiClient.makeRequest('GET', endpoint, null, [200, 201, 204, 400, 404], true);
        
        if (response.status === 200 || response.status === 201) {
          console.log('✅ Found slots! Response:');
          console.log(JSON.stringify(response.body, null, 2));
        } else {
          console.log(`❌ Status ${response.status}`);
        }
      } catch (error) {
        console.log(`❌ Error: ${error.message.substring(0, 100)}...`);
      }
      console.log('');
    }
    
    // Try to book an appointment to see what error we get
    console.log('\n🔍 Attempting to book appointment for debugging...\n');
    
    // Create a patient first
    const patientData = TestDataGenerator.generatePatientData();
    const patientResult = await apiClient.createPatient(patientData);
    const patientId = patientResult.patientId;
    
    if (patientId) {
      const appointmentData = TestDataGenerator.generateAppointmentData(providerId, patientId);
      console.log('📤 Appointment request data:');
      console.log(JSON.stringify(appointmentData, null, 2));
      
      try {
        const appointmentResponse = await apiClient.makeRequest(
          'POST', 
          '/api/master/appointment', 
          appointmentData, 
          [200, 201, 400, 404], 
          true
        );
        
        if (appointmentResponse.status === 200 || appointmentResponse.status === 201) {
          console.log('✅ Appointment booked successfully!');
          console.log(JSON.stringify(appointmentResponse.body, null, 2));
        } else {
          console.log(`❌ Appointment booking failed with status ${appointmentResponse.status}:`);
          console.log(JSON.stringify(appointmentResponse.body, null, 2));
          
          // Provide debugging hints based on error
          if (appointmentResponse.body.code === 'AVAILABILITY_NOT_FOUND') {
            console.log('\n💡 Debugging hints:');
            console.log('- Check if provider needs to be activated (active: true)');
            console.log('- Verify timezone alignment between availability and appointment');
            console.log('- Check if additional provider setup is required (location, etc.)');
            console.log('- Confirm the booking window allows appointments for the selected date');
          }
        }
      } catch (error) {
        console.log(`❌ Error booking appointment: ${error.message}`);
      }
    }
    
    await apiRequest.dispose();
    
    console.log('\n═'.repeat(60));
    console.log('📊 Summary:');
    console.log(`Provider ID: ${providerId}`);
    console.log(`Patient ID: ${patientId || 'N/A'}`);
    console.log('Check the responses above to understand how availability is stored/retrieved');
    
  } catch (error) {
    console.log(`❌ Script error: ${error.message}`);
  }
}

// Run the comprehensive check
comprehensiveAvailabilityCheck().catch(console.error);