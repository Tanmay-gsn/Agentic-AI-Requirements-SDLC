/**
 * Agent 1: Software Requirements Identification Agent
 * Identifies and lists Functional and Non-Functional software requirements
 * for a given scenario, functionality, or module.
 */

export class RequirementAgent {
  constructor() {
    this.name = 'Requirements Identification Agent';
  }

  /**
   * Identifies requirements based on the given scenario
   * @param {string} scenario 
   * @returns {object} Functional and Non-Functional requirements
   */
  identifyRequirements(scenario) {
    const text = scenario.trim();
    const lower = text.toLowerCase();

    const functionalReqs = [];
    const nonFunctionalReqs = [];

    // Domain / Keyword heuristics to identify tailored requirements
    const isFinancial = lower.includes('bank') || lower.includes('payment') || lower.includes('loan') || lower.includes('credit') || lower.includes('fraud') || lower.includes('wallet');
    const isHealthcare = lower.includes('patient') || lower.includes('hospital') || lower.includes('health') || lower.includes('doctor') || lower.includes('prescription') || lower.includes('clinic');
    const isEcommerce = lower.includes('cart') || lower.includes('shop') || lower.includes('checkout') || lower.includes('order') || lower.includes('product') || lower.includes('inventory');
    const isEducation = lower.includes('student') || lower.includes('course') || lower.includes('exam') || lower.includes('quiz') || lower.includes('grade') || lower.includes('school');

    if (isFinancial) {
      functionalReqs.push(
        {
          id: 'FR-01',
          title: 'Account Authentication & Identity Verification',
          description: 'The system must support multi-factor user authentication (password + OTP/Biometric) before granting access to financial functions.',
          priority: 'High'
        },
        {
          id: 'FR-02',
          title: 'Transaction Initiation & Processing',
          description: 'The system must allow users to initiate fund transfers, loan applications, or payments with real-time balance validation.',
          priority: 'High'
        },
        {
          id: 'FR-03',
          title: 'Automated Risk & Fraud Screening',
          description: 'The system must screen transactions against velocity limits, unusual locations, and flag suspicious transactions for approval or rejection.',
          priority: 'Critical'
        },
        {
          id: 'FR-04',
          title: 'Transaction History & Receipt Generation',
          description: 'The system must generate downloadable digital transaction receipts and allow users to view detailed historical ledgers.',
          priority: 'Medium'
        }
      );

      nonFunctionalReqs.push(
        {
          id: 'NFR-01',
          category: 'Security',
          description: 'All financial data and customer credentials must be encrypted using AES-256 at rest and TLS 1.3 in transit. Must comply with PCI-DSS / central banking standards.'
        },
        {
          id: 'NFR-02',
          category: 'Performance',
          description: 'Payment and transaction validation response time must not exceed 2 seconds under peak loads.'
        },
        {
          id: 'NFR-03',
          category: 'Availability',
          description: 'The system must achieve 99.99% uptime with automated database failover and zero data loss.'
        },
        {
          id: 'NFR-04',
          category: 'Auditability',
          description: 'All state changes and financial operations must be logged into an append-only, tamper-evident audit trail retained for 7 years.'
        }
      );
    } else if (isHealthcare) {
      functionalReqs.push(
        {
          id: 'FR-01',
          title: 'Patient Profile & Medical History Management',
          description: 'The system shall allow patients and authorized medical practitioners to register, update medical records, allergies, and diagnostic history.',
          priority: 'High'
        },
        {
          id: 'FR-02',
          title: 'Appointment Scheduling & Doctor Consultation',
          description: 'The system shall enable patients to search for doctors by specialty, check live availability, and book physical or video appointments.',
          priority: 'High'
        },
        {
          id: 'FR-03',
          title: 'Electronic Prescription Generation',
          description: 'Physicians must be able to generate digitally signed digital prescriptions and transmit them directly to partner pharmacies.',
          priority: 'High'
        },
        {
          id: 'FR-04',
          title: 'Lab Report Ingestion & Notification',
          description: 'The system must automatically ingest diagnostic test results, notify patients, and make reports accessible via patient portal.',
          priority: 'Medium'
        }
      );

      nonFunctionalReqs.push(
        {
          id: 'NFR-01',
          category: 'Compliance & Privacy',
          description: 'Must strictly comply with HIPAA and GDPR medical privacy regulations. Protected Health Information (PHI) must be anonymized for analytics.'
        },
        {
          id: 'NFR-02',
          category: 'Access Control',
          description: 'Role-based access control (RBAC) ensuring patients only view their own records and doctors only access active patient profiles.'
        },
        {
          id: 'NFR-03',
          category: 'Reliability',
          description: 'System must maintain 99.95% availability for critical patient-monitoring services.'
        }
      );
    } else if (isEcommerce) {
      functionalReqs.push(
        {
          id: 'FR-01',
          title: 'Product Catalog & Advanced Search',
          description: 'Users must be able to browse products with filtering by category, price, brand, and search keywords with auto-suggestions.',
          priority: 'High'
        },
        {
          id: 'FR-02',
          title: 'Shopping Cart & Real-Time Inventory Hold',
          description: 'The system must allow users to add items to cart, automatically reserving inventory for 15 minutes during checkout.',
          priority: 'High'
        },
        {
          id: 'FR-03',
          title: 'Secure Multi-Payment Gateway',
          description: 'The system must accept multiple payment methods (Credit/Debit cards, UPI, PayPal, Net Banking) via tokenized payment gateways.',
          priority: 'Critical'
        },
        {
          id: 'FR-04',
          title: 'Order Tracking & Shipment Notification',
          description: 'Customers must receive automated status updates (Order Placed, Dispatched, Out for Delivery, Delivered) via email and SMS.',
          priority: 'Medium'
        }
      );

      nonFunctionalReqs.push(
        {
          id: 'NFR-01',
          category: 'Performance',
          description: 'Product catalog search and page load time must render in under 800 milliseconds during flash sales.'
        },
        {
          id: 'NFR-02',
          category: 'Scalability',
          description: 'System must auto-scale to support 50,000 concurrent active shoppers without server degradation.'
        },
        {
          id: 'NFR-03',
          category: 'Security',
          description: 'Zero plain-text card data storage; fully compliant with PCI-DSS Level 1 standards.'
        }
      );
    } else if (isEducation) {
      functionalReqs.push(
        {
          id: 'FR-01',
          title: 'Course Enrollment & Curriculum Viewer',
          description: 'Students must be able to browse available courses, view syllabi, and enroll with automated prerequisite verification.',
          priority: 'High'
        },
        {
          id: 'FR-02',
          title: 'Assignment Submission & Auto-Grading',
          description: 'The system shall allow students to upload assignments and support automated grading for objective quizzes and coding tests.',
          priority: 'High'
        },
        {
          id: 'FR-03',
          title: 'Live Interactive Lectures & Chat',
          description: 'The module must support live streaming lectures with real-time Q&A chat and session attendance logging.',
          priority: 'Medium'
        }
      );

      nonFunctionalReqs.push(
        {
          id: 'NFR-01',
          category: 'Usability',
          description: 'The interface must conform to WCAG 2.1 AA accessibility guidelines for students with disabilities.'
        },
        {
          id: 'NFR-02',
          category: 'Concurrency',
          description: 'System must handle up to 10,000 simultaneous students taking online examinations without connection drops.'
        }
      );
    } else {
      // General Software System
      functionalReqs.push(
        {
          id: 'FR-01',
          title: 'User Authentication & Session Management',
          description: 'The system shall provide secure sign-up, sign-in, password reset, and session management using tokens.',
          priority: 'High'
        },
        {
          id: 'FR-02',
          title: 'Core Workflow & Data Processing',
          description: `The system shall execute the primary operations specified in: "${text.slice(0, 100)}..." with input validation and state management.`,
          priority: 'High'
        },
        {
          id: 'FR-03',
          title: 'Search, Filter & Reporting',
          description: 'The module must allow users to query stored records, apply filters, and export results in standard formats (CSV, PDF).',
          priority: 'Medium'
        },
        {
          id: 'FR-04',
          title: 'Administrative Dashboard & User Roles',
          description: 'The system shall provide an administrative view to manage users, configure system parameters, and monitor activity.',
          priority: 'Medium'
        }
      );

      nonFunctionalReqs.push(
        {
          id: 'NFR-01',
          category: 'Security',
          description: 'The system must prevent common vulnerabilities (OWASP Top 10) including SQL injection, XSS, and CSRF.'
        },
        {
          id: 'NFR-02',
          category: 'Performance',
          description: 'API endpoints must respond within 1 second for 95% of standard requests under expected load.'
        },
        {
          id: 'NFR-03',
          category: 'Maintainability',
          description: 'The codebase must follow clean modular architecture with at least 80% automated unit test coverage.'
        }
      );
    }

    return {
      functionalRequirements: functionalReqs,
      nonFunctionalRequirements: nonFunctionalReqs,
      totalCount: functionalReqs.length + nonFunctionalReqs.length
    };
  }
}
