// Types for our data structure
export interface Patient {
  id: string
  name: string
  dateOfBirth: string
  gender: "Male" | "Female" | "Other"
  email: string
  phone: string
  address: string
  medicalHistory?: string[]
  orders: TestOrder[]
}

export interface TestOrder {
  id: string
  patientId: string
  testName: string
  testType: string
  orderedBy: string
  orderedDate: string
  status: "Pending" | "Kit Shipped" | "Kit Delivered" | "Sample Received" | "In Progress" | "Completed" | "Cancelled"
  lastUpdated: string
  results?: TestResult
  notes?: string
}

export interface TestResult {
  id: string
  orderId: string
  completedDate: string
  resultSummary: string
  resultDetails: Record<string, any>
  interpretation?: string
  flagged: boolean
  recommendedFollowUp?: string
}

// Dummy data
export const patients: Patient[] = [
  {
    id: "P1001",
    name: "James Wilson",
    dateOfBirth: "1978-05-12",
    gender: "Male",
    email: "james.wilson@example.com",
    phone: "(555) 123-4567",
    address: "123 Main St, Anytown, CA 94501",
    medicalHistory: ["Hypertension", "Type 2 Diabetes"],
    orders: [
      {
        id: "O5001",
        patientId: "P1001",
        testName: "Complete Blood Count (CBC)",
        testType: "Blood",
        orderedBy: "Dr. Sarah Reynolds",
        orderedDate: "2024-07-10",
        status: "Completed",
        lastUpdated: "2024-07-15",
        results: {
          id: "R5001",
          orderId: "O5001",
          completedDate: "2024-07-15",
          resultSummary: "Normal CBC results with slightly elevated white blood cell count",
          resultDetails: {
            wbc: { value: 11.2, unit: "K/uL", reference: "4.5-11.0", flag: "H" },
            rbc: { value: 5.1, unit: "M/uL", reference: "4.5-5.9", flag: "" },
            hgb: { value: 14.2, unit: "g/dL", reference: "13.5-17.5", flag: "" },
            hct: { value: 42, unit: "%", reference: "41-50", flag: "" },
            plt: { value: 250, unit: "K/uL", reference: "150-450", flag: "" },
          },
          interpretation: "Slight leukocytosis may indicate mild infection or inflammation",
          flagged: true,
          recommendedFollowUp: "Repeat CBC in 2 weeks if symptoms persist",
        },
        notes: "Patient reported recent cold symptoms",
      },
      {
        id: "O5002",
        patientId: "P1001",
        testName: "Comprehensive Metabolic Panel",
        testType: "Blood",
        orderedBy: "Dr. Sarah Reynolds",
        orderedDate: "2024-07-20",
        status: "In Progress",
        lastUpdated: "2024-07-22",
        notes: "Fasting test",
      },
    ],
  },
  {
    id: "P1002",
    name: "Maria Garcia",
    dateOfBirth: "1985-09-23",
    gender: "Female",
    email: "maria.garcia@example.com",
    phone: "(555) 987-6543",
    address: "456 Oak Ave, Somewhere, CA 94502",
    medicalHistory: ["Asthma", "Seasonal allergies"],
    orders: [
      {
        id: "O5003",
        patientId: "P1002",
        testName: "Thyroid Function Panel",
        testType: "Blood",
        orderedBy: "Dr. Sarah Reynolds",
        orderedDate: "2024-07-05",
        status: "Completed",
        lastUpdated: "2024-07-12",
        results: {
          id: "R5002",
          orderId: "O5003",
          completedDate: "2024-07-12",
          resultSummary: "Thyroid function within normal limits",
          resultDetails: {
            tsh: { value: 2.1, unit: "mIU/L", reference: "0.4-4.0", flag: "" },
            t4: { value: 1.2, unit: "ng/dL", reference: "0.8-1.8", flag: "" },
            t3: { value: 120, unit: "ng/dL", reference: "80-200", flag: "" },
          },
          interpretation: "Normal thyroid function",
          flagged: false,
        },
      },
      {
        id: "O5004",
        patientId: "P1002",
        testName: "Allergy Panel - Environmental",
        testType: "Blood",
        orderedBy: "Dr. Sarah Reynolds",
        orderedDate: "2024-07-18",
        status: "Sample Received",
        lastUpdated: "2024-07-21",
        notes: "Patient reported worsening seasonal symptoms",
      },
    ],
  },
  {
    id: "P1003",
    name: "Robert Chen",
    dateOfBirth: "1965-03-15",
    gender: "Male",
    email: "robert.chen@example.com",
    phone: "(555) 234-5678",
    address: "789 Pine St, Elsewhere, CA 94503",
    medicalHistory: ["Hyperlipidemia", "Coronary artery disease", "GERD"],
    orders: [
      {
        id: "O5005",
        patientId: "P1003",
        testName: "Lipid Panel",
        testType: "Blood",
        orderedBy: "Dr. Sarah Reynolds",
        orderedDate: "2024-06-30",
        status: "Completed",
        lastUpdated: "2024-07-07",
        results: {
          id: "R5003",
          orderId: "O5005",
          completedDate: "2024-07-07",
          resultSummary: "Elevated LDL cholesterol and triglycerides",
          resultDetails: {
            totalCholesterol: { value: 240, unit: "mg/dL", reference: "<200", flag: "H" },
            ldl: { value: 155, unit: "mg/dL", reference: "<100", flag: "H" },
            hdl: { value: 42, unit: "mg/dL", reference: ">40", flag: "" },
            triglycerides: { value: 210, unit: "mg/dL", reference: "<150", flag: "H" },
          },
          interpretation: "Hyperlipidemia not adequately controlled with current therapy",
          flagged: true,
          recommendedFollowUp: "Adjust statin dosage and repeat lipid panel in 3 months",
        },
        notes: "Patient reports compliance with current statin therapy",
      },
      {
        id: "O5006",
        patientId: "P1003",
        testName: "Hemoglobin A1C",
        testType: "Blood",
        orderedBy: "Dr. Sarah Reynolds",
        orderedDate: "2024-07-15",
        status: "Kit Shipped",
        lastUpdated: "2024-07-16",
        notes: "Screening for diabetes",
      },
    ],
  },
  {
    id: "P1004",
    name: "Emily Rodriguez",
    dateOfBirth: "1992-11-08",
    gender: "Female",
    email: "emily.rodriguez@example.com",
    phone: "(555) 345-6789",
    address: "101 Maple Dr, Nowhere, CA 94504",
    medicalHistory: ["Anxiety", "Migraines"],
    orders: [
      {
        id: "O5007",
        patientId: "P1004",
        testName: "Vitamin D, 25-Hydroxy",
        testType: "Blood",
        orderedBy: "Dr. Sarah Reynolds",
        orderedDate: "2024-07-08",
        status: "Completed",
        lastUpdated: "2024-07-14",
        results: {
          id: "R5004",
          orderId: "O5007",
          completedDate: "2024-07-14",
          resultSummary: "Vitamin D deficiency",
          resultDetails: {
            vitaminD: { value: 18, unit: "ng/mL", reference: "30-100", flag: "L" },
          },
          interpretation: "Significant Vitamin D deficiency",
          flagged: true,
          recommendedFollowUp: "Start Vitamin D supplementation and recheck in 3 months",
        },
      },
      {
        id: "O5008",
        patientId: "P1004",
        testName: "Thyroid Function Panel",
        testType: "Blood",
        orderedBy: "Dr. Sarah Reynolds",
        orderedDate: "2024-07-20",
        status: "Pending",
        lastUpdated: "2024-07-20",
        notes: "Check for possible hypothyroidism",
      },
    ],
  },
  {
    id: "P1005",
    name: "David Kim",
    dateOfBirth: "1973-07-30",
    gender: "Male",
    email: "david.kim@example.com",
    phone: "(555) 456-7890",
    address: "202 Cedar Ln, Anyplace, CA 94505",
    medicalHistory: ["Hypertension", "Obesity"],
    orders: [
      {
        id: "O5009",
        patientId: "P1005",
        testName: "Comprehensive Metabolic Panel",
        testType: "Blood",
        orderedBy: "Dr. Sarah Reynolds",
        orderedDate: "2024-07-01",
        status: "Completed",
        lastUpdated: "2024-07-08",
        results: {
          id: "R5005",
          orderId: "O5009",
          completedDate: "2024-07-08",
          resultSummary: "Elevated liver enzymes",
          resultDetails: {
            glucose: { value: 105, unit: "mg/dL", reference: "70-99", flag: "H" },
            bun: { value: 18, unit: "mg/dL", reference: "7-20", flag: "" },
            creatinine: { value: 1.0, unit: "mg/dL", reference: "0.6-1.2", flag: "" },
            sodium: { value: 140, unit: "mmol/L", reference: "136-145", flag: "" },
            potassium: { value: 4.2, unit: "mmol/L", reference: "3.5-5.1", flag: "" },
            chloride: { value: 102, unit: "mmol/L", reference: "98-107", flag: "" },
            co2: { value: 24, unit: "mmol/L", reference: "21-32", flag: "" },
            calcium: { value: 9.5, unit: "mg/dL", reference: "8.5-10.2", flag: "" },
            protein: { value: 7.0, unit: "g/dL", reference: "6.0-8.3", flag: "" },
            albumin: { value: 4.2, unit: "g/dL", reference: "3.5-5.0", flag: "" },
            bilirubin: { value: 0.8, unit: "mg/dL", reference: "0.1-1.2", flag: "" },
            alt: { value: 65, unit: "U/L", reference: "7-56", flag: "H" },
            ast: { value: 72, unit: "U/L", reference: "10-40", flag: "H" },
            alp: { value: 110, unit: "U/L", reference: "44-147", flag: "" },
          },
          interpretation: "Mildly elevated liver enzymes may indicate NAFLD",
          flagged: true,
          recommendedFollowUp: "Ultrasound of liver and repeat CMP in 3 months",
        },
        notes: "Patient advised on lifestyle modifications",
      },
      {
        id: "O5010",
        patientId: "P1005",
        testName: "Lipid Panel",
        testType: "Blood",
        orderedBy: "Dr. Sarah Reynolds",
        orderedDate: "2024-07-18",
        status: "Kit Delivered",
        lastUpdated: "2024-07-20",
        notes: "Fasting test required",
      },
    ],
  },
  {
    id: "P1006",
    name: "Sarah Johnson",
    dateOfBirth: "1988-02-14",
    gender: "Female",
    email: "sarah.johnson@example.com",
    phone: "(555) 567-8901",
    address: "303 Birch St, Somewhere Else, CA 94506",
    medicalHistory: ["Endometriosis", "Iron deficiency anemia"],
    orders: [
      {
        id: "O5011",
        patientId: "P1006",
        testName: "Iron Panel",
        testType: "Blood",
        orderedBy: "Dr. Sarah Reynolds",
        orderedDate: "2024-07-05",
        status: "Completed",
        lastUpdated: "2024-07-12",
        results: {
          id: "R5006",
          orderId: "O5011",
          completedDate: "2024-07-12",
          resultSummary: "Iron deficiency anemia",
          resultDetails: {
            iron: { value: 35, unit: "ug/dL", reference: "50-170", flag: "L" },
            tibc: { value: 450, unit: "ug/dL", reference: "250-450", flag: "H" },
            transferrinSaturation: { value: 8, unit: "%", reference: "15-50", flag: "L" },
            ferritin: { value: 10, unit: "ng/mL", reference: "15-150", flag: "L" },
          },
          interpretation: "Results consistent with iron deficiency anemia",
          flagged: true,
          recommendedFollowUp: "Continue iron supplementation and repeat panel in 3 months",
        },
        notes: "Patient currently on iron supplements",
      },
      {
        id: "O5012",
        patientId: "P1006",
        testName: "Complete Blood Count (CBC)",
        testType: "Blood",
        orderedBy: "Dr. Sarah Reynolds",
        orderedDate: "2024-07-20",
        status: "In Progress",
        lastUpdated: "2024-07-22",
        notes: "Monitor response to iron therapy",
      },
    ],
  },
  {
    id: "P1007",
    name: "Michael Thompson",
    dateOfBirth: "1970-12-05",
    gender: "Male",
    email: "michael.thompson@example.com",
    phone: "(555) 678-9012",
    address: "404 Elm St, Elsewhere City, CA 94507",
    medicalHistory: ["Rheumatoid arthritis", "Osteoporosis"],
    orders: [
      {
        id: "O5013",
        patientId: "P1007",
        testName: "Rheumatoid Factor",
        testType: "Blood",
        orderedBy: "Dr. Sarah Reynolds",
        orderedDate: "2024-07-02",
        status: "Completed",
        lastUpdated: "2024-07-09",
        results: {
          id: "R5007",
          orderId: "O5013",
          completedDate: "2024-07-09",
          resultSummary: "Elevated rheumatoid factor",
          resultDetails: {
            rheumatoidFactor: { value: 75, unit: "IU/mL", reference: "<14", flag: "H" },
            antiCcp: { value: 60, unit: "U/mL", reference: "<20", flag: "H" },
          },
          interpretation: "Results consistent with active rheumatoid arthritis",
          flagged: true,
          recommendedFollowUp: "Refer to rheumatology for treatment adjustment",
        },
      },
      {
        id: "O5014",
        patientId: "P1007",
        testName: "Vitamin D, 25-Hydroxy",
        testType: "Blood",
        orderedBy: "Dr. Sarah Reynolds",
        orderedDate: "2024-07-15",
        status: "Sample Received",
        lastUpdated: "2024-07-18",
        notes: "Check vitamin D levels for osteoporosis management",
      },
    ],
  },
  {
    id: "P1008",
    name: "Jennifer Lee",
    dateOfBirth: "1982-08-17",
    gender: "Female",
    email: "jennifer.lee@example.com",
    phone: "(555) 789-0123",
    address: "505 Walnut Ave, Anytown, CA 94508",
    medicalHistory: ["Polycystic ovary syndrome", "Insulin resistance"],
    orders: [
      {
        id: "O5015",
        patientId: "P1008",
        testName: "Hormone Panel - Female",
        testType: "Blood",
        orderedBy: "Dr. Sarah Reynolds",
        orderedDate: "2024-07-03",
        status: "Completed",
        lastUpdated: "2024-07-10",
        results: {
          id: "R5008",
          orderId: "O5015",
          completedDate: "2024-07-10",
          resultSummary: "Hormone imbalance consistent with PCOS",
          resultDetails: {
            testosterone: { value: 65, unit: "ng/dL", reference: "15-70", flag: "" },
            freeTestosterone: { value: 12, unit: "pg/mL", reference: "0.3-1.9", flag: "H" },
            dheas: { value: 380, unit: "ug/dL", reference: "65-380", flag: "H" },
            lh: { value: 15, unit: "mIU/mL", reference: "2-15", flag: "H" },
            fsh: { value: 5, unit: "mIU/mL", reference: "2-12", flag: "" },
            estradiol: { value: 110, unit: "pg/mL", reference: "30-400", flag: "" },
          },
          interpretation: "Hormonal profile consistent with PCOS",
          flagged: true,
          recommendedFollowUp: "Continue current therapy and follow up in 6 months",
        },
      },
      {
        id: "O5016",
        patientId: "P1008",
        testName: "Hemoglobin A1C",
        testType: "Blood",
        orderedBy: "Dr. Sarah Reynolds",
        orderedDate: "2024-07-17",
        status: "Pending",
        lastUpdated: "2024-07-17",
        notes: "Monitor for insulin resistance",
      },
    ],
  },
  {
    id: "P1009",
    name: "William Davis",
    dateOfBirth: "1960-04-22",
    gender: "Male",
    email: "william.davis@example.com",
    phone: "(555) 890-1234",
    address: "606 Cherry Ln, Somewhere, CA 94509",
    medicalHistory: ["Chronic kidney disease", "Hypertension", "Type 2 Diabetes"],
    orders: [
      {
        id: "O5017",
        patientId: "P1009",
        testName: "Kidney Function Panel",
        testType: "Blood",
        orderedBy: "Dr. Sarah Reynolds",
        orderedDate: "2024-07-01",
        status: "Completed",
        lastUpdated: "2024-07-08",
        results: {
          id: "R5009",
          orderId: "O5017",
          completedDate: "2024-07-08",
          resultSummary: "Moderate renal impairment",
          resultDetails: {
            bun: { value: 32, unit: "mg/dL", reference: "7-20", flag: "H" },
            creatinine: { value: 1.8, unit: "mg/dL", reference: "0.6-1.2", flag: "H" },
            egfr: { value: 45, unit: "mL/min/1.73m²", reference: ">60", flag: "L" },
            sodium: { value: 138, unit: "mmol/L", reference: "136-145", flag: "" },
            potassium: { value: 4.8, unit: "mmol/L", reference: "3.5-5.1", flag: "" },
            chloride: { value: 104, unit: "mmol/L", reference: "98-107", flag: "" },
            co2: { value: 22, unit: "mmol/L", reference: "21-32", flag: "" },
          },
          interpretation: "Stage 3A chronic kidney disease",
          flagged: true,
          recommendedFollowUp: "Nephrology follow-up and repeat panel in 3 months",
        },
        notes: "Patient advised on dietary restrictions",
      },
      {
        id: "O5018",
        patientId: "P1009",
        testName: "Hemoglobin A1C",
        testType: "Blood",
        orderedBy: "Dr. Sarah Reynolds",
        orderedDate: "2024-07-15",
        status: "Kit Shipped",
        lastUpdated: "2024-07-16",
        notes: "Monitor diabetes control",
      },
    ],
  },
  {
    id: "P1010",
    name: "Olivia Martinez",
    dateOfBirth: "1995-10-10",
    gender: "Female",
    email: "olivia.martinez@example.com",
    phone: "(555) 901-2345",
    address: "707 Spruce Dr, Elsewhere, CA 94510",
    medicalHistory: ["Celiac disease", "Iron deficiency anemia"],
    orders: [
      {
        id: "O5019",
        patientId: "P1010",
        testName: "Celiac Disease Panel",
        testType: "Blood",
        orderedBy: "Dr. Sarah Reynolds",
        orderedDate: "2024-07-05",
        status: "Completed",
        lastUpdated: "2024-07-12",
        results: {
          id: "R5010",
          orderId: "O5019",
          completedDate: "2024-07-12",
          resultSummary: "Positive celiac disease markers",
          resultDetails: {
            tTG_IgA: { value: 85, unit: "U/mL", reference: "<4", flag: "H" },
            totalIgA: { value: 250, unit: "mg/dL", reference: "70-400", flag: "" },
            dGP_IgA: { value: 65, unit: "U/mL", reference: "<20", flag: "H" },
            dGP_IgG: { value: 45, unit: "U/mL", reference: "<20", flag: "H" },
          },
          interpretation: "Serological markers strongly positive for celiac disease",
          flagged: true,
          recommendedFollowUp: "Continue strict gluten-free diet and follow up in 6 months",
        },
        notes: "Patient reports strict adherence to gluten-free diet",
      },
      {
        id: "O5020",
        patientId: "P1010",
        testName: "Vitamin Panel",
        testType: "Blood",
        orderedBy: "Dr. Sarah Reynolds",
        orderedDate: "2024-07-18",
        status: "Kit Delivered",
        lastUpdated: "2024-07-20",
        notes: "Check for nutritional deficiencies",
      },
    ],
  },
  // Adding John Doe as a new patient
  {
    id: "P1011",
    name: "John Doe",
    dateOfBirth: "1980-06-15",
    gender: "Male",
    email: "john.doe@example.com",
    phone: "(555) 123-7890",
    address: "123 Evergreen Terrace, Springfield, CA 94511",
    medicalHistory: ["Allergic rhinitis", "Mild asthma", "Seasonal allergies"],
    orders: [
      // Order 1: In Progress
      {
        id: "O5021",
        patientId: "P1011",
        testName: "Comprehensive Metabolic Panel",
        testType: "Blood",
        orderedBy: "Dr. Sarah Reynolds",
        orderedDate: "2024-07-22",
        status: "In Progress",
        lastUpdated: "2024-07-24",
        notes: "Routine health checkup, fasting required",
      },
      // Order 2: Completed with results
      {
        id: "O5022",
        patientId: "P1011",
        testName: "Allergy Panel - Environmental",
        testType: "Blood",
        orderedBy: "Dr. Sarah Reynolds",
        orderedDate: "2024-07-10",
        status: "Completed",
        lastUpdated: "2024-07-18",
        results: {
          id: "R5011",
          orderId: "O5022",
          completedDate: "2024-07-18",
          resultSummary: "Significant allergic sensitization to multiple environmental allergens",
          resultDetails: {
            dustMites: { value: 3.8, unit: "kU/L", reference: "<0.35", flag: "H" },
            catDander: { value: 2.5, unit: "kU/L", reference: "<0.35", flag: "H" },
            dogDander: { value: 0.8, unit: "kU/L", reference: "<0.35", flag: "H" },
            grassPollen: { value: 5.2, unit: "kU/L", reference: "<0.35", flag: "H" },
            treePollen: { value: 4.1, unit: "kU/L", reference: "<0.35", flag: "H" },
            ragweed: { value: 3.9, unit: "kU/L", reference: "<0.35", flag: "H" },
            mold: { value: 0.6, unit: "kU/L", reference: "<0.35", flag: "H" },
          },
          interpretation: "Results indicate multiple environmental allergies, particularly to pollens and dust mites",
          flagged: true,
          recommendedFollowUp: "Referral to allergist for consideration of immunotherapy",
        },
        notes: "Patient reports worsening seasonal symptoms and indoor allergies",
      },
      // Order 3: Pending
      {
        id: "O5023",
        patientId: "P1011",
        testName: "Lipid Panel",
        testType: "Blood",
        orderedBy: "Dr. Sarah Reynolds",
        orderedDate: "2024-07-25",
        status: "Pending",
        lastUpdated: "2024-07-25",
        notes: "Baseline lipid assessment, fasting required",
      },
    ],
  },
]

// Helper functions to work with the data
export function getPatientById(patientId: string): Patient | undefined {
  return patients.find((patient) => patient.id === patientId)
}

export function getOrderById(orderId: string): TestOrder | undefined {
  for (const patient of patients) {
    const order = patient.orders.find((order) => order.id === orderId)
    if (order) return order
  }
  return undefined
}

export function getPatientsByName(name: string): Patient[] {
  const lowerName = name.toLowerCase()
  return patients.filter((patient) => patient.name.toLowerCase().includes(lowerName))
}

export function getOrdersByStatus(status: TestOrder["status"]): TestOrder[] {
  const orders: TestOrder[] = []
  for (const patient of patients) {
    const matchingOrders = patient.orders.filter((order) => order.status === status)
    orders.push(...matchingOrders)
  }
  return orders
}

export function getRecentOrders(limit = 5): TestOrder[] {
  const allOrders: TestOrder[] = []

  // Collect all orders
  for (const patient of patients) {
    allOrders.push(...patient.orders)
  }

  // Sort by ordered date (most recent first)
  const sortedOrders = allOrders.sort((a, b) => new Date(b.orderedDate).getTime() - new Date(a.orderedDate).getTime())

  // Return the specified number of orders
  return sortedOrders.slice(0, limit)
}

export function getTestTypes(): string[] {
  const testTypes = new Set<string>()

  for (const patient of patients) {
    for (const order of patient.orders) {
      testTypes.add(order.testName)
    }
  }

  return Array.from(testTypes).sort()
}

