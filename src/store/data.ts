export const UNIVERSITIES_SEED = [
  {
    id: "ucb",
    name: "University of California, Berkeley",
    shortName: "UC Berkeley",
    country: "USA",
    program: "Computer Science",
    department: "EECS",
    language: "English",
    applicationOpens: "2026-10-01",
    deadline: "2026-12-01",
    status: "Researching",
    priority: "High",
    registrationFee: { amount: 80, currency: "USD", source: "agent-estimated" },
    documents: [
      { id: "d1", name: "Online Application Form", category: "Document", completed: false },
      { id: "d2", name: "Motivation Letter", category: "Document", completed: false },
      { id: "d3", name: "IELTS min. 6.5", category: "Language", completed: false },
      { id: "d4", name: "Certificate of Graduation / Expected Graduation", category: "Academic", completed: false },
      { id: "d5", name: "JHS Certificate & SHS School Report / Certificate", category: "Academic", completed: false },
      { id: "d6", name: "Copy of Passport", category: "Document", completed: false },
      { id: "d7", name: "Letter of Recommendation", category: "Document", completed: false },
      { id: "d8", name: "Additional Documents (Certificate of Achievements, Portfolio, etc.)", category: "Document", completed: false }
    ]
  },
  {
    id: "cmu",
    name: "Carnegie Mellon University",
    shortName: "CMU",
    country: "USA",
    program: "Computer Science",
    department: "CMU School of Computer Science",
    language: "English",
    applicationOpens: "2026-10-01",
    deadline: "2026-12-01",
    status: "Researching",
    priority: "High",
    registrationFee: { amount: 75, currency: "USD", source: "agent-estimated" },
    documents: [
      { id: "d1", name: "Online Application Form", category: "Document", completed: false },
      { id: "d2", name: "Common Application Writing Supplement (3 short-answer questions)", category: "Document", completed: false },
      { id: "d3", name: "Personal Statement", category: "Document", completed: false },
      { id: "d4", name: "IELTS min. 7.5", category: "Language", completed: false },
      { id: "d5", name: "Certificate of Graduation / Expected Graduation", category: "Academic", completed: false },
      { id: "d6", name: "JHS Certificate & SHS School Report / Certificate", category: "Academic", completed: false },
      { id: "d7", name: "SAT Result", category: "Academic", completed: false },
      { id: "d8", name: "Copy of Passport", category: "Document", completed: false },
      { id: "d9", name: "Counselor Evaluation", category: "Document", completed: false },
      { id: "d10", name: "Letter of Recommendation", category: "Document", completed: false },
      { id: "d11", name: "Additional Documents (Certificate of Achievements, Portfolio, etc.)", category: "Document", completed: false }
    ]
  },
  {
    id: "usyd",
    name: "University of Sydney",
    shortName: "USyd",
    country: "Australia",
    program: "Bachelor of Advanced Computing",
    department: "Bachelor of Advanced Computing",
    language: "English",
    applicationOpens: "2026-01-01",
    deadline: "2027-03-01",
    status: "Researching",
    priority: "Medium",
    registrationFee: { amount: 0, currency: "AUD", source: "agent-estimated" },
    documents: [
      { id: "d1", name: "High School Report / Transcript", category: "Academic", completed: false },
      { id: "d2", name: "Letter of Expected Graduation", category: "Academic", completed: false },
      { id: "d3", name: "Copy of Passport", category: "Document", completed: false },
      { id: "d4", name: "Recommendation Letter", category: "Document", completed: false },
      { id: "d5", name: "IELTS min. 6.5 (min. 6.0 in each component)", category: "Language", completed: false },
      { id: "d6", name: "SAT min. 1340", category: "Academic", completed: false },
      { id: "d7", name: "Personal Statement", category: "Document", completed: false },
      { id: "d8", name: "Certificate of Achievements", category: "Document", completed: false }
    ]
  },
  {
    id: "uoft",
    name: "University of Toronto",
    shortName: "UofT",
    country: "Canada",
    program: "Computer Science",
    department: "Faculty of Arts and Science",
    language: "English",
    applicationOpens: "2026-09-01",
    deadline: "2027-01-15",
    status: "Researching",
    priority: "High",
    registrationFee: { amount: 180, currency: "CAD", source: "agent-estimated" },
    documents: [
      { id: "d1", name: "High School Report / Transcript", category: "Academic", completed: false },
      { id: "d2", name: "Letter of Expected Graduation", category: "Academic", completed: false },
      { id: "d3", name: "Copy of Passport", category: "Document", completed: false },
      { id: "d4", name: "Recommendation Letter", category: "Document", completed: false },
      { id: "d5", name: "IELTS min. 6.5", category: "Language", completed: false },
      { id: "d6", name: "SAT (optional)", category: "Academic", completed: false },
      { id: "d7", name: "Personal Statement", category: "Document", completed: false },
      { id: "d8", name: "Certificate of Achievements", category: "Document", completed: false }
    ]
  },
  {
    id: "tsinghua",
    name: "Tsinghua University",
    shortName: "Tsinghua",
    country: "China",
    program: "Global Talents in Science and Engineering",
    department: "Department of Electronic Engineering",
    language: "English",
    applicationOpens: "2026-09-30",
    deadline: "2027-02-28",
    status: "Researching",
    priority: "Medium",
    registrationFee: { amount: 0, currency: "CNY", source: "agent-estimated" },
    documents: [
      { id: "d1", name: "High School Report / Transcript", category: "Academic", completed: false },
      { id: "d2", name: "Letter of Expected Graduation", category: "Academic", completed: false },
      { id: "d3", name: "Copy of Passport (applicant and both parents)", category: "Document", completed: false },
      { id: "d4", name: "Two Recommendation Letters", category: "Document", completed: false },
      { id: "d5", name: "CV", category: "Document", completed: false },
      { id: "d6", name: "IELTS", category: "Language", completed: false },
      { id: "d7", name: "SAT / A-Level / IB / CSCA", category: "Academic", completed: false },
      { id: "d8", name: "Self-introduction video", category: "Document", completed: false },
      { id: "d9", name: "Personal Statement", category: "Document", completed: false },
      { id: "d10", name: "Financial Sponsor Letter", category: "Document", completed: false },
      { id: "d11", name: "Certificate of Achievements", category: "Document", completed: false }
    ]
  },
  {
    id: "kyoto",
    name: "Kyoto University",
    shortName: "Kyoto",
    country: "Japan",
    program: "Informatics and Mathematical Science",
    department: "International Undergraduate Program",
    language: "Japanese and English",
    applicationOpens: "2026-11-04",
    deadline: "2026-12-04",
    status: "Researching",
    priority: "High",
    registrationFee: { amount: 17000, currency: "JPY", source: "agent-estimated" },
    documents: [
      { id: "d1", name: "Passphoto", category: "Document", completed: false },
      { id: "d2", name: "Copy of Passport", category: "Document", completed: false },
      { id: "d3", name: "Application Fee Payment Certificate", category: "Document", completed: false },
      { id: "d4", name: "School Transcript", category: "Academic", completed: false },
      { id: "d5", name: "Certificate of (expected) Graduation", category: "Academic", completed: false },
      { id: "d6", name: "Teacher Evaluation Form", category: "Document", completed: false },
      { id: "d7", name: "IELTS min. 6.5", category: "Language", completed: false },
      { id: "d8", name: "SAT (ideally 1350 or above)", category: "Academic", completed: false },
      { id: "d9", name: "Essay (up to 600 words)", category: "Document", completed: false },
      { id: "d10", name: "Certificate of Achievements", category: "Document", completed: false }
    ]
  },
  {
    id: "purdue",
    name: "Purdue University",
    shortName: "Purdue",
    country: "USA",
    program: "Computer Science",
    department: "Department of Computer Science",
    language: "English",
    applicationOpens: "2026-08-01",
    deadline: "2027-01-01",
    status: "Researching",
    priority: "Medium",
    registrationFee: { amount: 60, currency: "USD", source: "agent-estimated" },
    documents: [
      { id: "d1", name: "High School Report / Transcript", category: "Academic", completed: false },
      { id: "d2", name: "Letter of Expected Graduation", category: "Academic", completed: false },
      { id: "d3", name: "Copy of Passport", category: "Document", completed: false },
      { id: "d4", name: "Recommendation Letter", category: "Document", completed: false },
      { id: "d5", name: "IELTS min. 6.5", category: "Language", completed: false },
      { id: "d6", name: "SAT Result", category: "Academic", completed: false },
      { id: "d7", name: "Personal Statement", category: "Document", completed: false },
      { id: "d8", name: "Extracurricular Activities Record", category: "Document", completed: false }
    ]
  }
];

export const GOALS_SEED = [
  { id: "g1", title: "Achieve IELTS Score 7.5", category: "Language", priority: "High", deadline: "2026-07-22", description: "Focus on writing and speaking sections. Practice every weekend.", completed: false },
  { id: "g2", title: "Draft Motivation Letter for CMU", category: "Application", priority: "High", deadline: "2026-07-07", description: "", completed: false },
  { id: "g3", title: "Save $500 for application fees", category: "Financial", priority: "Medium", deadline: null, description: "", completed: false },
  { id: "g4", title: "Translate Academic Transcripts to English", category: "Application", priority: "Low", deadline: "2026-06-17", description: "", completed: true },
  { id: "g5", title: "Prepare SAT Study Plan", category: "Academic", priority: "High", deadline: "2026-07-01", description: "Aim for 1400+", completed: false },
  { id: "g6", title: "Request Recommendation Letters", category: "Application", priority: "High", deadline: "2026-08-01", description: "Ask 2 teachers and 1 counselor", completed: false }
];

const getHeaders = () => {
  const token = localStorage.getItem('app_password') || '';
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

async function fetchFromAPI(key: string, seedData: any) {
  try {
    const res = await fetch(`/api/data?key=${key}`, { headers: getHeaders() });
    if (res.status === 401) {
      window.dispatchEvent(new Event('auth-error'));
      return seedData;
    }
    if (res.ok) {
      const data = await res.json();
      if (data.value) return data.value;
    }
    await saveToAPI(key, seedData);
    return seedData;
  } catch (e) {
    console.error('Failed to fetch data from API:', e);
    return seedData;
  }
}

async function saveToAPI(key: string, value: any) {
  try {
    const res = await fetch(`/api/data?key=${key}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ value })
    });
    if (res.status === 401) {
      window.dispatchEvent(new Event('auth-error'));
    }
  } catch (e) {
    console.error('Failed to save data to API:', e);
  }
}

export async function getUniversities() {
  return await fetchFromAPI("universities", UNIVERSITIES_SEED);
}

export async function saveUniversities(universities: any) {
  await saveToAPI("universities", universities);
}

export async function getGoals() {
  return await fetchFromAPI("goals", GOALS_SEED);
}

export async function saveGoals(goals: any) {
  await saveToAPI("goals", goals);
}

export async function getCV() {
  const initialCV = {
    personalInfo: { name: "", email: "", phone: "", address: "" },
    education: [],
    certificates: [],
    skills: [],
    languages: [],
    experience: []
  };
  return await fetchFromAPI("cv", initialCV);
}

export async function saveCV(cv: any) {
  await saveToAPI("cv", cv);
}

export async function getDocuments() {
  return await fetchFromAPI("documents", []);
}

export async function saveDocuments(docs: any) {
  await saveToAPI("documents", docs);
}

export const REMINDERS_SEED: any[] = [];

export async function getReminders() {
  return await fetchFromAPI("reminders", REMINDERS_SEED);
}

export async function saveReminders(reminders: any) {
  await saveToAPI("reminders", reminders);
}
