import { APIRequestContext, expect } from '@playwright/test';
import { 
  LoginCredentials, 
  LoginResponse, 
  Patient, 
  PatientResponse,
  Provider,
  ProviderResponse,
  AvailabilityRequest,
  AppointmentRequest,
  AppointmentResponse
} from '../types/api.types';

export class ApiClient {
  private request: APIRequestContext;
  private baseURL: string;
  private tenantId: string;
  private bearerToken: string = '';

  constructor(request: APIRequestContext) {
    this.request = request;
    this.baseURL = 'https://stage-api.ecarehealth.com/api/master';
    this.tenantId = 'stage_aithinkitive';
  }

  private getHeaders(includeAuth: boolean = false) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-TENANT-ID': this.tenantId
    };

    if (includeAuth && this.bearerToken) {
      headers['Authorization'] = `Bearer ${this.bearerToken}`;
    }

    return headers;
  }

  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    console.log('🔐 Attempting login...');
    
    const response = await this.request.post(`${this.baseURL}/login`, {
      headers: this.getHeaders(),
      data: credentials
    });

    const responseBody = await response.json();
    
    console.log(`Login Response Status: ${response.status()}`);
    console.log('Login Response Body:', JSON.stringify(responseBody, null, 2));

    expect(response.status()).toBe(200);
    expect(responseBody.code).toBe('ENTITY');
    
    // Capture bearer token
    this.bearerToken = responseBody.data.access_token;
    console.log('✅ Login successful, token captured');
    
    return responseBody;
  }

  async createPatient(patient: Patient): Promise<PatientResponse> {
    console.log('👤 Creating patient...');
    
    const response = await this.request.post(`${this.baseURL}/patient`, {
      headers: this.getHeaders(true),
      data: patient
    });

    const responseBody = await response.json();
    
    console.log(`Create Patient Response Status: ${response.status()}`);
    console.log('Create Patient Response Body:', JSON.stringify(responseBody, null, 2));

    expect(response.status()).toBe(201);
    expect(responseBody.code).toBe('ENTITY');
    
    console.log(`✅ Patient created with ID: ${responseBody.data.id}`);
    
    return responseBody;
  }

  async createProvider(provider: Provider): Promise<ProviderResponse> {
    console.log('👨‍⚕️ Creating provider...');
    
    const response = await this.request.post(`${this.baseURL}/provider`, {
      headers: this.getHeaders(true),
      data: provider
    });

    const responseBody = await response.json();
    
    console.log(`Create Provider Response Status: ${response.status()}`);
    console.log('Create Provider Response Body:', JSON.stringify(responseBody, null, 2));

    expect(response.status()).toBe(201);
    expect(responseBody.success).toBe(true);
    
    console.log(`✅ Provider created with ID: ${responseBody.data.id}`);
    
    return responseBody;
  }

  async setProviderAvailability(availabilityRequest: AvailabilityRequest): Promise<any> {
    console.log('📅 Setting provider availability...');
    
    const response = await this.request.post(`${this.baseURL}/provider/availability-setting`, {
      headers: this.getHeaders(true),
      data: availabilityRequest
    });

    const responseBody = await response.json();
    
    console.log(`Set Availability Response Status: ${response.status()}`);
    console.log('Set Availability Response Body:', JSON.stringify(responseBody, null, 2));

    expect(response.status()).toBe(200);
    
    console.log('✅ Provider availability set successfully');
    
    return responseBody;
  }

  async bookAppointment(appointmentRequest: AppointmentRequest): Promise<AppointmentResponse> {
    console.log('📋 Booking appointment...');
    
    const response = await this.request.post(`${this.baseURL}/appointment`, {
      headers: this.getHeaders(true),
      data: appointmentRequest
    });

    const responseBody = await response.json();
    
    console.log(`Book Appointment Response Status: ${response.status()}`);
    console.log('Book Appointment Response Body:', JSON.stringify(responseBody, null, 2));

    expect(response.status()).toBe(201);
    expect(responseBody.success).toBe(true);
    
    console.log(`✅ Appointment booked with ID: ${responseBody.data.id}`);
    
    return responseBody;
  }

  // Verification methods
  async getProviders(): Promise<any> {
    console.log('🔍 Fetching providers list...');
    
    const response = await this.request.get(`${this.baseURL}/provider`, {
      headers: this.getHeaders(true)
    });

    const responseBody = await response.json();
    
    console.log(`Get Providers Response Status: ${response.status()}`);
    console.log('Get Providers Response Body:', JSON.stringify(responseBody, null, 2));

    expect(response.status()).toBe(200);
    
    return responseBody;
  }

  async getPatients(): Promise<any> {
    console.log('🔍 Fetching patients list...');
    
    const response = await this.request.get(`${this.baseURL}/patient`, {
      headers: this.getHeaders(true)
    });

    const responseBody = await response.json();
    
    console.log(`Get Patients Response Status: ${response.status()}`);
    console.log('Get Patients Response Body:', JSON.stringify(responseBody, null, 2));

    expect(response.status()).toBe(200);
    
    return responseBody;
  }

  async getAvailabilitySettings(providerId: string): Promise<any> {
    console.log('🔍 Fetching availability settings...');
    
    const response = await this.request.get(`${this.baseURL}/provider/${providerId}/availability-setting`, {
      headers: this.getHeaders(true)
    });

    const responseBody = await response.json();
    
    console.log(`Get Availability Settings Response Status: ${response.status()}`);
    console.log('Get Availability Settings Response Body:', JSON.stringify(responseBody, null, 2));

    expect(response.status()).toBe(200);
    
    return responseBody;
  }

  getBearerToken(): string {
    return this.bearerToken;
  }
}