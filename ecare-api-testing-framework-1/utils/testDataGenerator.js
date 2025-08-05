class TestDataGenerator {
  static generateProviderData() {
    const timestamp = Date.now();
    const firstNames = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'Robert', 'Lisa'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis'];
    
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const email = `test.provider.${timestamp}@medarch.com`;
    
    return {
      "roleType": "PROVIDER",
      "active": false,
      "admin_access": true,
      "status": false,
      "avatar": "",
      "role": "PROVIDER",
      "firstName": firstName,
      "lastName": lastName,
      "gender": Math.random() > 0.5 ? "MALE" : "FEMALE",
      "phone": "",
      "npi": "",
      "specialities": null,
      "groupNpiNumber": "",
      "licensedStates": null,
      "licenseNumber": "",
      "acceptedInsurances": null,
      "experience": "",
      "taxonomyNumber": "",
      "workLocations": null,
      "email": email,
      "officeFaxNumber": "",
      "areaFocus": "",
      "hospitalAffiliation": "",
      "ageGroupSeen": null,
      "spokenLanguages": null,
      "providerEmployment": "",
      "insurance_verification": "",
      "prior_authorization": "",
      "secondOpinion": "",
      "careService": null,
      "bio": "",
      "expertise": "",
      "workExperience": "",
      "licenceInformation": [
        {
          "uuid": "",
          "licenseState": "",
          "licenseNumber": ""
        }
      ],
      "deaInformation": [
        {
          "deaState": "",
          "deaNumber": "",
          "deaTermDate": "",
          "deaActiveDate": ""
        }
      ]
    };
  }

  static generatePatientData() {
    const timestamp = Date.now();
    const firstNames = ['Alex', 'Sam', 'Jordan', 'Taylor', 'Casey', 'Morgan', 'Riley', 'Avery'];
    const lastNames = ['Peterson', 'Anderson', 'Thompson', 'Martinez', 'Robinson', 'Clark', 'Lewis', 'Walker'];
    
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    
    // Generate a birth date between 1950 and 2000
    const startDate = new Date('1950-01-01').getTime();
    const endDate = new Date('2000-12-31').getTime();
    const randomTime = startDate + Math.random() * (endDate - startDate);
    const birthDate = new Date(randomTime).toISOString();
    
    return {
      "phoneNotAvailable": true,
      "emailNotAvailable": true,
      "registrationDate": "",
      "firstName": firstName,
      "middleName": "",
      "lastName": lastName,
      "timezone": "IST",
      "birthDate": birthDate,
      "gender": Math.random() > 0.5 ? "MALE" : "FEMALE",
      "ssn": "",
      "mrn": "",
      "languages": null,
      "avatar": "",
      "mobileNumber": "",
      "faxNumber": "",
      "homePhone": "",
      "address": {
        "line1": "",
        "line2": "",
        "city": "",
        "state": "",
        "country": "",
        "zipcode": ""
      },
      "emergencyContacts": [
        {
          "firstName": "",
          "lastName": "",
          "mobile": ""
        }
      ],
      "patientInsurances": [
        {
          "active": true,
          "insuranceId": "",
          "copayType": "FIXED",
          "coInsurance": "",
          "claimNumber": "",
          "note": "",
          "deductibleAmount": "",
          "employerName": "",
          "employerAddress": {
            "line1": "",
            "line2": "",
            "city": "",
            "state": "",
            "country": "",
            "zipcode": ""
          },
          "subscriberFirstName": "",
          "subscriberLastName": "",
          "subscriberMiddleName": "",
          "subscriberSsn": "",
          "subscriberMobileNumber": "",
          "subscriberAddress": {
            "line1": "",
            "line2": "",
            "city": "",
            "state": "",
            "country": "",
            "zipcode": ""
          },
          "groupId": "",
          "memberId": "",
          "groupName": "",
          "frontPhoto": "",
          "backPhoto": "",
          "insuredFirstName": "",
          "insuredLastName": "",
          "address": {
            "line1": "",
            "line2": "",
            "city": "",
            "state": "",
            "country": "",
            "zipcode": ""
          },
          "insuredBirthDate": "",
          "coPay": "",
          "insurancePayer": {}
        }
      ],
      "emailConsent": false,
      "messageConsent": false,
      "callConsent": false,
      "patientConsentEntities": [
        {
          "signedDate": new Date().toISOString()
        }
      ]
    };
  }

  static generateAvailabilityData(providerId) {
    return {
      "setToWeekdays": true,  // Set to true to enable weekday availability
      "providerId": providerId,
      "bookingWindow": "90",  // 90 days booking window
      "timezone": "EST",
      "bufferTime": 0,
      "initialConsultTime": 0,
      "followupConsultTime": 0,
      "settings": [
        {
          "type": "NEW",
          "slotTime": "30",
          "minNoticeUnit": "8_HOUR"
        }
      ],
      "blockDays": [],
      "daySlots": [
        {
          "day": "MONDAY",
          "startTime": "09:00:00",  // Changed to 9 AM - 5 PM for broader availability
          "endTime": "17:00:00",
          "availabilityMode": "VIRTUAL"
        },
        {
          "day": "TUESDAY",
          "startTime": "09:00:00",
          "endTime": "17:00:00",
          "availabilityMode": "VIRTUAL"
        },
        {
          "day": "WEDNESDAY",
          "startTime": "09:00:00",
          "endTime": "17:00:00",
          "availabilityMode": "VIRTUAL"
        },
        {
          "day": "THURSDAY",
          "startTime": "09:00:00",
          "endTime": "17:00:00",
          "availabilityMode": "VIRTUAL"
        },
        {
          "day": "FRIDAY",
          "startTime": "09:00:00",
          "endTime": "17:00:00",
          "availabilityMode": "VIRTUAL"
        }
      ],
      "bookBefore": "undefined undefined",
      "xTENANTID": "stage_aithinkitive"
    };
  }

  static generateAppointmentData(providerId, patientId) {
    // Get next weekday that's not today (to ensure availability is set)
    const now = new Date();
    let appointmentDate = new Date(now);
    
    // Add days until we hit a weekday (Monday-Friday)
    do {
      appointmentDate.setDate(appointmentDate.getDate() + 1);
    } while (appointmentDate.getDay() === 0 || appointmentDate.getDay() === 6); // Skip weekends
    
    // Set appointment time to 10:00 AM EST (which is within the 9 AM - 5 PM availability)
    appointmentDate.setHours(10, 0, 0, 0);
    
    // Convert to EST timezone offset (UTC-5)
    const estOffset = 5 * 60 * 60 * 1000; // 5 hours in milliseconds
    const startTimeUTC = new Date(appointmentDate.getTime() + estOffset);
    
    const startTime = startTimeUTC.toISOString();
    const endTimeUTC = new Date(startTimeUTC.getTime() + 30 * 60 * 1000); // Add 30 minutes
    const endTime = endTimeUTC.toISOString();
    
    const complaints = [
      "Routine checkup and consultation",
      "Follow-up appointment for ongoing treatment",
      "General health assessment",
      "Preventive care consultation",
      "Health screening appointment"
    ];
    
    const complaint = complaints[Math.floor(Math.random() * complaints.length)];
    
    console.log(`📅 Scheduling appointment for: ${appointmentDate.toLocaleDateString()} at 10:00 AM EST`);
    console.log(`   UTC Start Time: ${startTime}`);
    console.log(`   UTC End Time: ${endTime}`);
    
    return {
      "mode": "VIRTUAL",
      "patientId": patientId,
      "customForms": null,
      "visit_type": "",
      "type": "NEW",
      "paymentType": "CASH",
      "providerId": providerId,
      "startTime": startTime,
      "endTime": endTime,
      "insurance_type": "",
      "note": "",
      "authorization": "",
      "forms": [],
      "chiefComplaint": `Automated test: ${complaint}`,
      "isRecurring": false,
      "recurringFrequency": "daily",
      "reminder_set": false,
      "endType": "never",
      "endDate": new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      "endAfter": 5,
      "customFrequency": 1,
      "customFrequencyUnit": "days",
      "selectedWeekdays": [],
      "reminder_before_number": 1,
      "timezone": "EST",  // Changed to match provider's timezone
      "duration": 30,
      "xTENANTID": "stage_aithinkitive"
    };
  }
}

module.exports = TestDataGenerator;