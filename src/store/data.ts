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
  { id: "g_ppkn_swot", title: "Tugas Miss Lydia PPKN SWOT", category: "Tugas Sekolah", priority: "High", deadline: "2026-08-11", description: "Tugas Analisis SWOT Pelajaran PPKN Miss Lydia", completed: false },
  { id: "g_bindo_web", title: "Tugas Web Bu Susanti B.Indo", category: "Tugas Sekolah", priority: "High", deadline: "2026-08-11", description: "Pengumpulan Website Tugas Bahasa Indonesia Bu Susanti", completed: false },
  { id: "g_sat_english_project", title: "SAT English Project Continuous", category: "Project", priority: "High", deadline: "2026-08-16", description: "Project SAT English berjalan sampai 16 Agustus selesai/tamat", completed: false },
  { id: "g_nipro_its", title: "NIPRO ITS (Periode 2 Minggu)", category: "Lomba", priority: "High", deadline: "2026-08-31", description: "Kompetisi NIPRO ITS mulai 17 Agustus s/d 31 Agustus 2026", completed: false },
  { id: "g_gebyar_ulm", title: "Lomba Gebyar ULM", category: "Lomba", priority: "High", deadline: "2026-09-12", description: "Pendaftaran & Pengumpulan Lomba Gebyar ULM 2026", completed: false },
  { id: "g_math_challenge", title: "Lomba Mathematics Challenge", category: "Lomba", priority: "High", deadline: "2026-09-26", description: "Babak Penyisihan & Puncak Mathematics Challenge 2026", completed: false },
  { id: "g1", title: "Achieve IELTS Score 7.5", category: "Language", priority: "High", deadline: "2026-08-25", description: "Focus on writing and speaking sections. Practice every weekend.", completed: false },
  { id: "g2", title: "Draft Motivation Letter for CMU", category: "Application", priority: "High", deadline: "2026-08-20", description: "", completed: false },
  { id: "g3", title: "Save $500 for application fees", category: "Financial", priority: "Medium", deadline: null, description: "", completed: false },
  { id: "g4", title: "Translate Academic Transcripts to English", category: "Application", priority: "Low", deadline: "2026-08-15", description: "", completed: true },
];

const getHeaders = () => {
  const token = localStorage.getItem('app_password') || '';
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

async function fetchFromAPI(key: string, seedData: any) {
  const localKey = `beasiswa_${key}`;
  let localData = null;
  const localRaw = localStorage.getItem(localKey);
  if (localRaw) {
    try {
      localData = JSON.parse(localRaw);
    } catch {
      localData = null;
    }
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);
    const res = await fetch(`/api/data?key=${key}`, {
      headers: getHeaders(),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (res.status === 401) {
      window.dispatchEvent(new Event('auth-error'));
      return localData ?? seedData;
    }

    const contentType = res.headers.get("content-type");
    if (res.ok && contentType && contentType.includes("application/json")) {
      const data = await res.json();
      if (data && data.value !== undefined && data.value !== null) {
        // Supabase has real data -> update localStorage and return
        localStorage.setItem(localKey, JSON.stringify(data.value));
        return data.value;
      } else if (localData !== null) {
        // Supabase row is empty, but local storage HAS user data -> auto upload to Supabase!
        saveToAPI(key, localData);
        return localData;
      }
    }
  } catch (e) {
    console.warn(`[data store] fetchFromAPI fallback for key "${key}":`, e);
  }

  const finalData = localData !== null ? localData : seedData;
  if (localData === null && seedData !== null) {
    try {
      localStorage.setItem(localKey, JSON.stringify(seedData));
    } catch (e) {
      console.warn("Failed to set seed data in localStorage:", e);
    }
  }
  return finalData;
}

async function saveToAPI(key: string, value: any) {
  const localKey = `beasiswa_${key}`;
  try {
    localStorage.setItem(localKey, JSON.stringify(value));
  } catch (e) {
    console.error("Failed to write to localStorage:", e);
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(`/api/data?key=${key}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ value }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (res.status === 401) {
      window.dispatchEvent(new Event('auth-error'));
    }
  } catch (e) {
    console.warn(`[data store] saveToAPI fallback for key "${key}":`, e);
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

const now = new Date();
const formatDate = (offsetDays: number) => {
  const d = new Date(now);
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
};

export const REMINDERS_SEED: any[] = [
  {
    id: 101,
    title: "Mau belajar SAT",
    description: "Latihan Reading & Writing section (Barron 2026)",
    date: formatDate(0),
    startTime: "08:00",
    durationHours: 2,
    reminderMinutesBefore: 15,
    isCompleted: false,
    isNotified: false,
    iconId: "sat",
    createdAt: now.toISOString(),
  },
  {
    id: 102,
    title: "Draft Essay SOP CMU",
    description: "Tulis short answer question #1",
    date: formatDate(0),
    startTime: "14:00",
    durationHours: 1.5,
    reminderMinutesBefore: 15,
    isCompleted: false,
    isNotified: false,
    iconId: "essay",
    createdAt: now.toISOString(),
  },
  {
    id: 103,
    title: "IELTS Practice Test",
    description: "Listening section 4 & Speaking test",
    date: formatDate(1),
    startTime: "09:00",
    durationHours: 2,
    reminderMinutesBefore: 15,
    isCompleted: false,
    isNotified: false,
    iconId: "sat",
    createdAt: now.toISOString(),
  },
  {
    id: 104,
    title: "Review CV Editor",
    description: "Update pengalaman organisasi & sertifikat",
    date: formatDate(1),
    startTime: "16:00",
    durationHours: 1,
    reminderMinutesBefore: 10,
    isCompleted: false,
    isNotified: false,
    iconId: "general",
    createdAt: now.toISOString(),
  },
  {
    id: 105,
    title: "Research Berkeley EECS",
    description: "Cek syarat IELTS & deadline pendaftaran",
    date: formatDate(2),
    startTime: "10:00",
    durationHours: 1.5,
    reminderMinutesBefore: 15,
    isCompleted: false,
    isNotified: false,
    iconId: "uni",
    createdAt: now.toISOString(),
  },
  {
    id: 106,
    title: "Submit Recommendation Request",
    description: "Kirim email rekomendasi ke guru PAI & BTA",
    date: formatDate(3),
    startTime: "13:00",
    durationHours: 1,
    reminderMinutesBefore: 15,
    isCompleted: false,
    isNotified: false,
    iconId: "mail",
    createdAt: now.toISOString(),
  },
  {
    id: 107,
    title: "Math SAT Drills",
    description: "Kombinatorik & Fungsi Floor Ceiling",
    date: formatDate(4),
    startTime: "09:30",
    durationHours: 2.5,
    reminderMinutesBefore: 15,
    isCompleted: false,
    isNotified: false,
    iconId: "sat",
    createdAt: now.toISOString(),
  },
  {
    id: 108,
    title: "Rest & Exercise Break",
    description: "Olahraga & Istirahat sore",
    date: formatDate(5),
    startTime: "16:00",
    durationHours: 1,
    reminderMinutesBefore: 10,
    isCompleted: false,
    isNotified: false,
    iconId: "fitness",
    createdAt: now.toISOString(),
  },
  {
    id: 109,
    title: "Weekly Progress Review",
    description: "Evaluasi target beasiswa 7 hari terakhir",
    date: formatDate(6),
    startTime: "19:00",
    durationHours: 1,
    reminderMinutesBefore: 15,
    isCompleted: false,
    isNotified: false,
    iconId: "general",
    createdAt: now.toISOString(),
  },
  {
    id: 110,
    title: "SAT Subscription Active",
    description: "Masa aktif paket & latihan SAT s/d 22 Agustus 2026",
    date: "2026-08-22",
    startTime: "09:00",
    durationHours: 2,
    reminderMinutesBefore: 15,
    isCompleted: false,
    isNotified: false,
    iconId: "sat",
    createdAt: now.toISOString(),
  },
  {
    id: 111,
    title: "NIPRO ITS Pembukaan (2 Minggu)",
    description: "Kickoff & Pembukaan NIPRO ITS (17 Agustus - 31 Agustus 2026)",
    date: "2026-08-17",
    startTime: "10:00",
    durationHours: 2,
    reminderMinutesBefore: 15,
    isCompleted: false,
    isNotified: false,
    iconId: "uni",
    createdAt: now.toISOString(),
  }
];

export async function getReminders() {
  return await fetchFromAPI("reminders", REMINDERS_SEED);
}

export async function saveReminders(reminders: any) {
  await saveToAPI("reminders", reminders);
}

export async function syncAllToCloud() {
  const keys = ["universities", "goals", "cv", "documents", "reminders"];
  const seeds: Record<string, any> = {
    universities: UNIVERSITIES_SEED,
    goals: GOALS_SEED,
    cv: { personalInfo: { name: "", email: "", phone: "", address: "" }, education: [], certificates: [], skills: [], languages: [], experience: [] },
    documents: [],
    reminders: REMINDERS_SEED,
  };

  let synced = 0;
  for (const k of keys) {
    const localRaw = localStorage.getItem(`beasiswa_${k}`);
    const val = localRaw ? JSON.parse(localRaw) : seeds[k];
    await saveToAPI(k, val);
    synced++;
  }
  return synced;
}

export async function restoreDefaultSeeds() {
  const seeds: Record<string, any> = {
    universities: UNIVERSITIES_SEED,
    goals: GOALS_SEED,
    cv: { personalInfo: { name: "", email: "", phone: "", address: "" }, education: [], certificates: [], skills: [], languages: [], experience: [] },
    documents: [],
    reminders: REMINDERS_SEED,
  };

  for (const k of Object.keys(seeds)) {
    localStorage.setItem(`beasiswa_${k}`, JSON.stringify(seeds[k]));
    await saveToAPI(k, seeds[k]);
  }
}
