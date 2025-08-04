import { APIRequestContext } from '@playwright/test';

/**
 * Healthcare API Workflow - TypeScript Implementation
 * Based on the actual Postman collection structure
 */

// ==================== INTERFACES ====================

export interface LoginCredentials {
  username: string;
  password: string;
  xTENANTID: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
    user: {
      id: string;
      email: string;
      role: string;
    };
  };
}

export interface Address {
  line1: string;
  line2: string;
  city: string;
  state: string;
  country: string;
  zipcode: string;
}

export interface EmergencyContact {
  firstName: string;
  lastName: string;
  mobile: string;
}

export interface InsurancePayer {
  [key: string]: any;
}

export interface PatientInsurance {
  active: boolean;
  insuranceId: string;
  copayType: string;
  coInsurance: string;
  claimNumber: string;
  note: string;
  deductibleAmount: string;
  employerName: string;
  employerAddress: Address;
  subscriberFirstName: string;
  subscriberLastName: string;
  subscriberMiddleName: string;
  subscriberSsn: string;
  subscriberMobileNumber: string;
  subscriberAddress: Address;
  groupId: string;
  memberId: string;
  groupName: string;
  frontPhoto: string;
  backPhoto: string;
  insuredFirstName: string;
  insuredLastName: string;
  address: Address;
  insuredBirthDate: string;
  coPay: string;
  insurancePayer: InsurancePayer;
}

export interface PatientConsentEntity {
  signedDate: string;
}

export interface CreatePatientRequest {
  phoneNotAvailable: boolean;
  emailNotAvailable: boolean;
  registrationDate: string;
  firstName: string;
  middleName: string;
  lastName: string;
  timezone: string;
  birthDate: string;
  gender: 'MALE' | 'FEMALE';
  ssn: string;
  mrn: string;
  languages: any;
  avatar: string;
  mobileNumber: string;
  faxNumber: string;
  homePhone: string;
  address: Address;
  emergencyContacts: EmergencyContact[];
  patientInsurances: PatientInsurance[];
  emailConsent: boolean;
  messageConsent: boolean;
  callConsent: boolean;
  patientConsentEntities: PatientConsentEntity[];
}

export interface LicenseInformation {
  uuid: string;
  licenseState: string;
  licenseNumber: string;
}

export interface DeaInformation {
  deaState: string;
  deaNumber: string;
  deaTermDate: string;
  deaActiveDate: string;
}

export interface CreateProviderRequest {
  roleType: string;
  active: boolean;
  admin_access: boolean;
  status: boolean;
  avatar: string;
  role: string;
  firstName: string;
  lastName: string;
  gender: string;
  phone: string;
  npi: string;
  specialities: any;
  groupNpiNumber: string;
  licensedStates: any;
  licenseNumber: string;
  acceptedInsurances: any;
  experience: string;
  taxonomyNumber: string;
  workLocations: any;
  email: string;
  officeFaxNumber: string;
  areaFocus: string;
  hospitalAffiliation: string;
  ageGroupSeen: any;
  spokenLanguages: any;
  providerEmployment: string;
  insurance_verification: string;
  prior_authorization: string;
  secondOpinion: string;
  careService: any;
  bio: string;
  expertise: string;
  workExperience: string;
  licenceInformation: LicenseInformation[];
  deaInformation: DeaInformation[];
}

export interface AvailabilitySetting {
  type: string;
  slotTime: string;
  minNoticeUnit: string;
}

export interface DaySlot {
  day: string;
  startTime: string;
  endTime: string;
  availabilityMode: string;
}

export interface SetAvailabilityRequest {
  setToWeekdays: boolean;
  providerId: string;
  bookingWindow: string;
  timezone: string;
  bufferTime: number;
  initialConsultTime: number;
  followupConsultTime: number;
  settings: AvailabilitySetting[];
  blockDays: any[];
  daySlots: DaySlot[];
  bookBefore: string;
  xTENANTID: string;
}

export interface BookAppointmentRequest {
  mode: string;
  patientId: string;
  customForms: any;
  visit_type: string;
  type: string;
  paymentType: string;
  providerId: string;
  startTime: string;
  endTime: string;
  insurance_type: string;
  note: string;
  authorization: string;
  forms: any[];
  chiefComplaint: string;
  isRecurring: boolean;
  recurringFrequency: string;
  reminder_set: boolean;
  endType: string;
  endDate: string;
  endAfter: number;
  customFrequency: number;
  customFrequencyUnit: string;
  selectedWeekdays: any[];
  reminder_before_number: number;
  timezone: string;
  duration: number;
  xTENANTID: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
}

// ==================== MAIN CLASS ====================

export class HealthcareApiWorkflow {
  /**
   * Safely parse JSON from a Playwright APIResponse
   */
  private async safeJsonParse(response: any): Promise<any> {
    try {
      const text = await response.text();
      if (!text || text.trim() === "") {
        console.error(`❌ Empty response body. Status: ${response.status()}`);
        return { success: false, message: `Empty response body`, data: null, status: response.status() };
      }
      return JSON.parse(text);
    } catch (err) {
      console.error(`❌ Failed to parse JSON. Status: ${response.status()}`);
      try {
        const raw = await response.text();
        console.error(`Raw response: ${raw}`);
      } catch {}
      return { success: false, message: `Invalid JSON response`, data: null, status: response.status() };
    }
  }
  private request: APIRequestContext;
  private baseURL: string;
  private tenantId: string;
  private bearerToken: string = '';

  constructor(request: APIRequestContext, tenantId: string = 'stage_aithinkitive') {
    this.request = request;
    this.baseURL = 'https://stage-api.ecarehealth.com/api/master';
    this.tenantId = tenantId;
  }

  private getHeaders(includeAuth: boolean = false): Record<string, string> {
    const headers: Record<string, string> = {
      'Accept': 'application/json, text/plain, */*',
      'Accept-Language': 'en-US,en;q=0.9',
      'Connection': 'keep-alive',
      'Content-Type': 'application/json',
      'Origin': `https://${this.tenantId}.uat.provider.ecarehealth.com`,
      'Referer': `https://${this.tenantId}.uat.provider.ecarehealth.com/`,
      'Sec-Fetch-Dest': 'empty',
      'Sec-Fetch-Mode': 'cors',
      'Sec-Fetch-Site': 'same-site',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36',
      'X-TENANT-ID': this.tenantId,
      'sec-ch-ua': '"Not)A;Brand";v="8", "Chromium";v="138", "Google Chrome";v="138"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"'
    };

    if (includeAuth && this.bearerToken) {
      headers['Authorization'] = `Bearer ${this.bearerToken}`;
    }

    return headers;
  }

  /**
   * Step 1: Provider Login
   */
  async providerLogin(username: string, password: string): Promise<LoginResponse> {
    console.log('🔐 Step 1: Provider Login...');
    
    const credentials: LoginCredentials = {
      username,
      password,
      xTENANTID: this.tenantId
    };

    const response = await this.request.post(`${this.baseURL}/login`, {
      headers: this.getHeaders(),
      data: credentials
    });

    const responseBody = await response.json();
    
    console.log(`✅ Login Response Status: ${response.status()}`);
    console.log('Response Body:', JSON.stringify(responseBody, null, 2));

    if (response.status() === 200 && responseBody.data?.accessToken) {
      this.bearerToken = responseBody.data.accessToken;
      console.log('🔑 Bearer token captured successfully');
    }
    
    return responseBody;
  }

  /**
   * Step 2: Create Patient - Samuel Peterson
   */
  async createPatient(): Promise<ApiResponse> {
    console.log('👤 Step 2: Creating Patient - Samuel Peterson...');
    
    const patientData: CreatePatientRequest = {
      phoneNotAvailable: false,
      emailNotAvailable: false,
      registrationDate: "2025-07-25",
      firstName: "Samuel",
      middleName: "A.",
      lastName: "Peterson",
      timezone: "IST",
      birthDate: "1994-08-16",
      gender: "MALE",
      ssn: "123-45-6789",
      mrn: "MRN123456",
      languages: ["English"],
      avatar: "https://randomuser.me/api/portraits/men/1.jpg",
      mobileNumber: "7058659504",
      faxNumber: "020-12345678",
      homePhone: "020-87654321",
      address: {
        line1: "123 Main St",
        line2: "Apt 4B",
        city: "Pune",
        state: "MH",
        country: "India",
        zipcode: "411001"
      },
      emergencyContacts: [
        {
          firstName: "Jane",
          lastName: "Peterson",
          mobile: "9876543210"
        }
      ],
      patientInsurances: [
        {
          active: true,
          insuranceId: "INS123456",
          copayType: "FIXED",
          coInsurance: "10%",
          claimNumber: "CLM987654",
          note: "Primary insurance",
          deductibleAmount: "5000",
          employerName: "TechCorp",
          employerAddress: {
            line1: "456 Tech Park",
            line2: "",
            city: "Pune",
            state: "MH",
            country: "India",
            zipcode: "411045"
          },
          subscriberFirstName: "Samuel",
          subscriberLastName: "Peterson",
          subscriberMiddleName: "A.",
          subscriberSsn: "123-45-6789",
          subscriberMobileNumber: "7058659504",
          subscriberAddress: {
            line1: "123 Main St",
            line2: "Apt 4B",
            city: "Pune",
            state: "MH",
            country: "India",
            zipcode: "411001"
          },
          groupId: "GRP123",
          memberId: "MEM456",
          groupName: "Tech Employees",
          frontPhoto: "https://randomuser.me/api/portraits/men/1.jpg",
          backPhoto: "https://randomuser.me/api/portraits/men/2.jpg",
          insuredFirstName: "Samuel",
          insuredLastName: "Peterson",
          address: {
            line1: "123 Main St",
            line2: "Apt 4B",
            city: "Pune",
            state: "MH",
            country: "India",
            zipcode: "411001"
          },
          insuredBirthDate: "1994-08-16",
          coPay: "200",
          insurancePayer: { name: "HealthSecure" }
        }
      ],
      emailConsent: true,
      messageConsent: true,
      callConsent: true,
      patientConsentEntities: [
        {
          signedDate: new Date().toISOString()
        }
      ]
    };

    const response = await this.request.post(`${this.baseURL}/patient`, {
      headers: this.getHeaders(true),
      data: patientData
    });

    const responseBody = await this.safeJsonParse(response);
    console.log(`✅ Create Patient Response Status: ${response.status()}`);
    console.log('Response Body:', JSON.stringify(responseBody, null, 2));
    return responseBody;
  }

  /**
   * Step 3: Add Provider - Steven Miller
   */
  async addProvider(): Promise<ApiResponse> {
    console.log('👨‍⚕️ Step 3: Adding Provider - Steven Miller...');
    
    const providerData: CreateProviderRequest = {
      roleType: "PROVIDER",
      active: false,
      admin_access: true,
      status: false,
      avatar: "",
      role: "PROVIDER",
      firstName: "Steven",
      lastName: "Miller",
      gender: "MALE",
      phone: "",
      npi: "",
      specialities: null,
      groupNpiNumber: "",
      licensedStates: null,
      licenseNumber: "",
      acceptedInsurances: null,
      experience: "",
      taxonomyNumber: "",
      workLocations: null,
      email: "saurabh.kale+steven@medarch.com",
      officeFaxNumber: "",
      areaFocus: "",
      hospitalAffiliation: "",
      ageGroupSeen: null,
      spokenLanguages: null,
      providerEmployment: "",
      insurance_verification: "",
      prior_authorization: "",
      secondOpinion: "",
      careService: null,
      bio: "",
      expertise: "",
      workExperience: "",
      licenceInformation: [
        {
          uuid: "",
          licenseState: "",
          licenseNumber: ""
        }
      ],
      deaInformation: [
        {
          deaState: "",
          deaNumber: "",
          deaTermDate: "",
          deaActiveDate: ""
        }
      ]
    };

    const response = await this.request.post(`${this.baseURL}/provider`, {
      headers: this.getHeaders(true),
      data: providerData
    });

    const responseBody = await this.safeJsonParse(response);
    console.log(`✅ Add Provider Response Status: ${response.status()}`);
    console.log('Response Body:', JSON.stringify(responseBody, null, 2));
    return responseBody;
  }

  /**
   * Step 4: Set Availability - Monday 12:00-13:00 Virtual
   */
  async setAvailability(providerId: string): Promise<ApiResponse> {
    console.log('📅 Step 4: Setting Availability...');
    
    const availabilityData: SetAvailabilityRequest = {
      setToWeekdays: false,
      providerId: providerId,
      bookingWindow: "3",
      timezone: "EST",
      bufferTime: 0,
      initialConsultTime: 0,
      followupConsultTime: 0,
      settings: [
        {
          type: "NEW",
          slotTime: "30",
          minNoticeUnit: "8_HOUR"
        }
      ],
      blockDays: [],
      daySlots: [
        {
          day: "MONDAY",
          startTime: "12:00:00",
          endTime: "13:00:00",
          availabilityMode: "VIRTUAL"
        }
      ],
      bookBefore: "undefined undefined",
      xTENANTID: this.tenantId
    };

    const response = await this.request.post(`${this.baseURL}/provider/availability-setting`, {
      headers: this.getHeaders(true),
      data: availabilityData
    });

    const responseBody = await this.safeJsonParse(response);
    console.log(`✅ Set Availability Response Status: ${response.status()}`);
    console.log('Response Body:', JSON.stringify(responseBody, null, 2));
    return responseBody;
  }

  /**
   * Step 5: Book Appointment - August 4th, 2025, 17:00-17:30 UTC
   */
  async bookAppointment(patientId: string, providerId: string): Promise<ApiResponse> {
    console.log('📋 Step 5: Booking Appointment...');
    
    const appointmentData: BookAppointmentRequest = {
      mode: "VIRTUAL",
      patientId: patientId,
      customForms: null,
      visit_type: "",
      type: "NEW",
      paymentType: "CASH",
      providerId: providerId,
      startTime: "2025-08-04T17:00:00Z",
      endTime: "2025-08-04T17:30:00Z",
      insurance_type: "",
      note: "",
      authorization: "",
      forms: [],
      chiefComplaint: "appointment test",
      isRecurring: false,
      recurringFrequency: "daily",
      reminder_set: false,
      endType: "never",
      endDate: new Date().toISOString(),
      endAfter: 5,
      customFrequency: 1,
      customFrequencyUnit: "days",
      selectedWeekdays: [],
      reminder_before_number: 1,
      timezone: "CST",
      duration: 30,
      xTENANTID: this.tenantId
    };

    const response = await this.request.post(`${this.baseURL}/appointment`, {
      headers: this.getHeaders(true),
      data: appointmentData
    });

    const responseBody = await this.safeJsonParse(response);
    console.log(`✅ Book Appointment Response Status: ${response.status()}`);
    console.log('Response Body:', JSON.stringify(responseBody, null, 2));
    return responseBody;
  }

  /**
   * Verification: Get Providers List
   */
  async getProviders(page: number = 0, size: number = 20): Promise<ApiResponse> {
    console.log('🔍 Verification: Getting Providers List...');
    
    const response = await this.request.get(`${this.baseURL}/provider?page=${page}&size=${size}`, {
      headers: this.getHeaders(true)
    });

    const responseBody = await this.safeJsonParse(response);
    console.log(`✅ Get Providers Response Status: ${response.status()}`);
    console.log('Response Body:', JSON.stringify(responseBody, null, 2));
    return responseBody;
  }

  /**
   * Verification: Get Patients List
   */
  async getPatients(page: number = 0, size: number = 20, searchString: string = ""): Promise<ApiResponse> {
    console.log('🔍 Verification: Getting Patients List...');
    
    const response = await this.request.get(`${this.baseURL}/patient?page=${page}&size=${size}&searchString=${searchString}`, {
      headers: this.getHeaders(true)
    });

    const responseBody = await this.safeJsonParse(response);
    console.log(`✅ Get Patients Response Status: ${response.status()}`);
    console.log('Response Body:', JSON.stringify(responseBody, null, 2));
    return responseBody;
  }

  /**
   * Verification: Get Availability Settings
   */
  async getAvailabilitySettings(providerId: string): Promise<ApiResponse> {
    console.log('🔍 Verification: Getting Availability Settings...');
    
    const response = await this.request.get(`${this.baseURL}/provider/${providerId}/availability-setting`, {
      headers: this.getHeaders(true)
    });

    const responseBody = await this.safeJsonParse(response);
    console.log(`✅ Get Availability Settings Response Status: ${response.status()}`);
    console.log('Response Body:', JSON.stringify(responseBody, null, 2));
    return responseBody;
  }

  /**
   * Execute Complete Workflow
   */
  async executeCompleteWorkflow(): Promise<{
    loginResponse: LoginResponse;
    patientResponse: ApiResponse;
    providerResponse: ApiResponse;
    availabilityResponse: ApiResponse;
    appointmentResponse: ApiResponse;
    verificationResults: {
      providers: ApiResponse;
      patients: ApiResponse;
      availability: ApiResponse;
    };
  }> {
    console.log('🚀 Starting Complete Healthcare API Workflow...\n');

    try {
      // Step 1: Login
      const loginResponse = await this.providerLogin(
        'rose.gomez@jourrapide.com',
        'Pass@123'
      );

      // Step 2: Create Patient
      const patientResponse = await this.createPatient();
      const patientId = patientResponse.data?.id;

      // Step 3: Add Provider
      const providerResponse = await this.addProvider();
      const providerId = providerResponse.data?.id;

      // Step 4: Set Availability
      const availabilityResponse = await this.setAvailability(providerId);

      // Step 5: Book Appointment
      const appointmentResponse = await this.bookAppointment(patientId, providerId);

      // Verification Steps
      console.log('\n🔍 Starting Verification Steps...');
      const providers = await this.getProviders();
      const patients = await this.getPatients();
      const availability = await this.getAvailabilitySettings(providerId);

      console.log('\n🎉 Complete Healthcare API Workflow Executed Successfully!');

      return {
        loginResponse,
        patientResponse,
        providerResponse,
        availabilityResponse,
        appointmentResponse,
        verificationResults: {
          providers,
          patients,
          availability
        }
      };

    } catch (error) {
      console.error('❌ Error in workflow execution:', error);
      throw error;
    }
  }

  /**
   * Get Bearer Token
   */
  getBearerToken(): string {
    return this.bearerToken;
  }

  /**
   * Set Tenant ID
   */
  setTenantId(tenantId: string): void {
    this.tenantId = tenantId;
  }
}

// ==================== USAGE EXAMPLE ====================

/**
 * Example usage:
 * 
 * import { HealthcareApiWorkflow } from './healthcare-api-workflow';
 * 
 * // In your test
 * test('Healthcare API Workflow', async ({ request }) => {
 *   const workflow = new HealthcareApiWorkflow(request, 'stage_aithinkitive');
 *   
 *   const results = await workflow.executeCompleteWorkflow();
 *   
 *   // Verify results
 *   expect(results.loginResponse.success).toBe(true);
 *   expect(results.patientResponse.data.id).toBeTruthy();
 *   expect(results.providerResponse.data.id).toBeTruthy();
 * });
 */

export default HealthcareApiWorkflow;