export const UNIVERSITIES_SEED = [
  {
    id: "ucb",
    name: "University of California, Berkeley (UCB)",
    shortName: "UC Berkeley",
    country: "USA",
    program: "Cognitive Science B.A.",
    department: "EECS",
    language: "English",
    applicationOpens: "2026-10-01",
    deadline: "2026-12-01",
    status: "Researching",
    priority: "High",
    registrationFee: { amount: 95, currency: "USD", source: "user-provided" },
    documents: [
      { id: "d1", name: "Online Application Form", category: "Document", completed: false },
      { id: "d2", name: "Motivation Letter", category: "Document", completed: false },
      { id: "d3", name: "IELTS min. 6.5", category: "Language", completed: true },
      { id: "d4", name: "Certificate of Graduation / Expected Graduation", category: "Academic", completed: false },
      { id: "d5", name: "JHS Certificate & SHS School Report / Certificate", category: "Academic", completed: false },
      { id: "d6", name: "Copy of Passport", category: "Document", completed: false },
      { id: "d7", name: "Letter of Recommendation", category: "Document", completed: false },
      { id: "d8", name: "Additional Documents (Certificate of Achievements, Portfolio, etc.)", category: "Document", completed: false }
    ]
  },
  {
    id: "ucsd",
    name: "University of California, San Diego (UCSD)",
    shortName: "UC San Diego",
    country: "USA",
    program: "Cognitive Science B.S. with Specialization in Machine Learning and Neural Computation",
    department: "Cognitive Science",
    language: "English",
    applicationOpens: "2026-10-01",
    deadline: "2026-12-01",
    status: "Researching",
    priority: "High",
    registrationFee: { amount: 95, currency: "USD", source: "user-provided" },
    documents: [
      { id: "d1", name: "Online Application Form", category: "Document", completed: false },
      { id: "d2", name: "Motivation Letter", category: "Document", completed: false },
      { id: "d3", name: "IELTS min. 6.5", category: "Language", completed: true },
      { id: "d4", name: "Certificate of Graduation / Expected Graduation", category: "Academic", completed: false },
      { id: "d5", name: "JHS Certificate & SHS School Report / Certificate", category: "Academic", completed: false },
      { id: "d6", name: "Copy of Passport", category: "Document", completed: false },
      { id: "d7", name: "Letter of Recommendation", category: "Document", completed: false },
      { id: "d8", name: "Additional Documents (Certificate of Achievements, Portfolio, etc.)", category: "Document", completed: false }
    ]
  },
  {
    id: "usyd",
    name: "University of Sydney",
    shortName: "USyd",
    country: "Australia",
    program: "Bachelor of Advanced Computing Or Data Science",
    department: "Faculty of Engineering",
    language: "English",
    applicationOpens: "2026-01-01",
    deadline: "2027-03-31",
    status: "Researching",
    priority: "Medium",
    registrationFee: { amount: 150, currency: "AUD", source: "user-provided" },
    documents: [
      { id: "d1", name: "High School Report / Transcript", category: "Academic", completed: false },
      { id: "d2", name: "Letter of Expected Graduation", category: "Academic", completed: false },
      { id: "d3", name: "Copy of Passport", category: "Document", completed: false },
      { id: "d4", name: "Recommendation Letter", category: "Document", completed: false },
      { id: "d5", name: "IELTS min. 6.5, with min. 6.0 in each components", category: "Language", completed: true },
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
    program: "Data Science HBSc",
    department: "Faculty of Arts & Science",
    language: "English",
    applicationOpens: "2026-09-01",
    deadline: "2026-11-30",
    status: "Researching",
    priority: "High",
    registrationFee: { amount: 192, currency: "CAD", source: "user-provided" },
    documents: [
      { id: "d1", name: "High School Report / Transcript", category: "Academic", completed: false },
      { id: "d2", name: "Letter of Expected Graduation", category: "Academic", completed: false },
      { id: "d3", name: "Copy of Passport", category: "Document", completed: false },
      { id: "d4", name: "Recommendation Letter", category: "Document", completed: false },
      { id: "d5", name: "IELTS min. 6.5", category: "Language", completed: true },
      { id: "d6", name: "SAT (optional)", category: "Academic", completed: true },
      { id: "d7", name: "Personal Statement", category: "Document", completed: false },
      { id: "d8", name: "Certificate of Achievements", category: "Document", completed: false }
    ]
  },
  {
    id: "ubc",
    name: "University of British Columbia",
    shortName: "UBC",
    country: "Canada",
    program: "Data Science BSc",
    department: "Faculty of Science",
    language: "English",
    applicationOpens: "2026-10-01",
    deadline: "2026-11-30",
    status: "Submitted",
    priority: "High",
    registrationFee: { amount: 174, currency: "CAD", source: "user-provided" },
    documents: [
      { id: "d1", name: "High School Report / Transcript", category: "Academic", completed: false },
      { id: "d2", name: "Letter of Expected Graduation", category: "Academic", completed: false },
      { id: "d3", name: "Copy of Passport", category: "Document", completed: false },
      { id: "d4", name: "IELTS 6.5", category: "Language", completed: true },
      { id: "d5", name: "SAT (Optional)", category: "Academic", completed: true },
      { id: "d6", name: "Grade 12 Math, Physics G11 Chemistry, Physics", category: "Academic", completed: false }
    ]
  },
  {
    id: "ucla",
    name: "University of California, Los Angeles (UCLA)",
    shortName: "UCLA",
    country: "USA",
    program: "Data Science Or Cognitive Science B.S. + Computing Specialization",
    department: "College of Letters and Science",
    language: "English",
    applicationOpens: "2026-10-01",
    deadline: "2026-11-30",
    status: "Researching",
    priority: "High",
    registrationFee: { amount: 95, currency: "USD", source: "user-provided" },
    documents: [
      { id: "d1", name: "Online Application Form", category: "Document", completed: false },
      { id: "d2", name: "Motivation Letter", category: "Document", completed: false },
      { id: "d3", name: "Copy of Passport of applicant and both parents", category: "Document", completed: false },
      { id: "d4", name: "Letter Of Recommendation", category: "Document", completed: false },
      { id: "d5", name: "IELTS 6.5", category: "Language", completed: false },
      { id: "d6", name: "Personal Statement", category: "Document", completed: false },
      { id: "d7", name: "Additional Documents (Certificate of Achievements, Portfolio, etc.)", category: "Document", completed: false },
      { id: "d8", name: "JHS Certificate & SHS School Report / Certificate", category: "Academic", completed: false },
      { id: "d9", name: "Certificate of Graduation / Expected Graduation", category: "Academic", completed: false }
    ]
  },
  {
    id: "kyoto",
    name: "Kyoto University - International Undergraduate Program",
    shortName: "Kyoto iUP",
    country: "Japan",
    program: "Informatics and Mathematical Science",
    department: "Faculty of Engineering",
    language: "Japanese and English",
    applicationOpens: "2026-11-04",
    deadline: "2026-12-04",
    status: "Researching",
    priority: "High",
    registrationFee: { amount: 9800, currency: "JPY", source: "user-provided" },
    documents: [
      { id: "d1", name: "Passphoto", category: "Document", completed: false },
      { id: "d2", name: "Copy of Passport", category: "Document", completed: false },
      { id: "d3", name: "Application Fee Payment Certificate", category: "Document", completed: false },
      { id: "d4", name: "School Transcript", category: "Academic", completed: false },
      { id: "d5", name: "Certificate of (expected) Graduation", category: "Academic", completed: false },
      { id: "d6", name: "Teacher Evaluation Form", category: "Document", completed: false },
      { id: "d7", name: "IELTS min. 6.5", category: "Language", completed: true },
      { id: "d8", name: "SAT (ideally 1350 or above)", category: "Academic", completed: false },
      { id: "d9", name: "Essay (up to 600 words)", category: "Document", completed: false },
      { id: "d10", name: "Certificate of achievements", category: "Document", completed: false }
    ]
  },
  {
    id: "hkust",
    name: "Hong Kong University of Science and Technology (HKUST)",
    shortName: "HKUST",
    country: "Hongkong",
    program: "BSc in Data Analytics and Artificial Intelligence in Science",
    department: "School of Science",
    language: "English",
    applicationOpens: "2026-10-01",
    deadline: "2026-11-25",
    status: "Researching",
    priority: "High",
    registrationFee: { amount: 450, currency: "HKD", source: "user-provided" },
    documents: [
      { id: "d1", name: "Copy Of Passport", category: "Document", completed: false },
      { id: "d2", name: "Certificate of Graduation / Expected Graduation", category: "Academic", completed: false },
      { id: "d3", name: "IELTS 6.5", category: "Language", completed: true },
      { id: "d4", name: "Nomination of Academic Referee", category: "Document", completed: false },
      { id: "d5", name: "JHS Certificate & SHS School Report: (TRANSCRIPT)", category: "Academic", completed: false },
      { id: "d6", name: "SAT 1190 (target ~1350)", category: "Academic", completed: false },
      { id: "d7", name: "Personal Statement", category: "Document", completed: false }
    ]
  },
  {
    id: "cuhk",
    name: "The Chinese University of Hong Kong (CUHK)",
    shortName: "CUHK",
    country: "Hongkong",
    program: "BSc Computational Data Science",
    department: "Faculty of Science",
    language: "English",
    applicationOpens: "2026-10-01",
    deadline: "2026-11-13",
    status: "Researching",
    priority: "High",
    registrationFee: { amount: 450, currency: "HKD", source: "user-provided" },
    documents: [
      { id: "d1", name: "Copy Of Passport", category: "Document", completed: false },
      { id: "d2", name: "Personal Statement", category: "Document", completed: false },
      { id: "d3", name: "Nomination of Academic Referee", category: "Document", completed: false },
      { id: "d4", name: "JHS Certificate & SHS School Report: (TRANSCRIPT)", category: "Academic", completed: false },
      { id: "d5", name: "IELTS 6.5", category: "Language", completed: true },
      { id: "d6", name: "Certificate of Graduation / Expected Graduation", category: "Academic", completed: false },
      { id: "d7", name: "SAT 1190 (target ~1350)", category: "Academic", completed: false }
    ]
  },
  {
    id: "kuleuven",
    name: "KU Leuven",
    shortName: "KU Leuven",
    country: "Belgium",
    program: "Engineering and Technology",
    department: "Faculty of Engineering Technology",
    language: "English",
    applicationOpens: "2026-10-01",
    deadline: "2027-03-01",
    status: "Researching",
    priority: "Medium",
    registrationFee: { amount: 100, currency: "EUR", source: "user-provided" },
    documents: [
      { id: "d1", name: "SAT Math 730, IELTS 6.5", category: "Academic", completed: true },
      { id: "d2", name: "Motivation Letter", category: "Document", completed: false },
      { id: "d3", name: "Nilai Rapor + SKL", category: "Academic", completed: false },
      { id: "d4", name: "Dokumen esensial (Passport, pas photo, etc)", category: "Document", completed: false }
    ]
  },
  {
    id: "unimelb",
    name: "The University of Melbourne",
    shortName: "UniMelb",
    country: "Australia",
    program: "Data Science",
    department: "Faculty of Science",
    language: "English",
    applicationOpens: "2026-10-01",
    deadline: "2027-05-31",
    status: "Researching",
    priority: "Medium",
    registrationFee: { amount: 100, currency: "AUD", source: "user-provided" },
    documents: [
      { id: "d1", name: "SAT Math 1210, IELTS 6.5", category: "Academic", completed: true },
      { id: "d2", name: "Sertif", category: "Document", completed: false },
      { id: "d3", name: "Nilai Rapor transkrip", category: "Academic", completed: false },
      { id: "d4", name: "Dokumen esensial (Passport, pas photo, etc)", category: "Document", completed: false }
    ]
  }
];

import type { WeeklyDrillCategory } from "@/types";

export const GOALS_SEED = [
  { 
    id: "g_ai_challenge", 
    title: "AI Challenge", 
    category: "Lomba", 
    priority: "High", 
    startDate: null, 
    deadline: "2026-09-16", 
    time: "23:59", 
    description: "SUKII LU", 
    completed: false 
  },
  { 
    id: "g_buat_akun", 
    title: "BUAT AKUNNNN", 
    category: "Application", 
    priority: "High", 
    startDate: null, 
    deadline: "2026-09-13", 
    time: "23:59", 
    description: "UC, UOFT, UBC, DLL (HONGONKONGGG) taro 45 menit", 
    completed: false 
  },
  { 
    id: "g_niche_uc", 
    title: "Cari jurusan Niche (UC)", 
    category: "Tugas Sekolah", 
    priority: "Medium", 
    startDate: null, 
    deadline: "2026-09-13", 
    time: "23:59", 
    description: "Riset jurusan niche untuk University of California", 
    completed: false 
  },
  { 
    id: "g_sb_video", 
    title: "SB Video", 
    category: "Tugas Sekolah", 
    priority: "High", 
    startDate: null, 
    deadline: "2026-09-25", 
    time: "23:59", 
    description: "Tugas pembuatan SB Video", 
    completed: false 
  },
  { 
    id: "g_ijaio", 
    title: "cicil IJAIO tiap hari", 
    category: "Lomba", 
    priority: "High", 
    startDate: null, 
    deadline: "2026-09-15", 
    time: "23:59", 
    description: "Persiapan dan pengerjaan IJAIO (Sudah Selesai)", 
    completed: true 
  }
];

export const WEEKLY_DRILLS_SEED: WeeklyDrillCategory[] = [
  {
    id: "reading",
    title: "Reading Comprehension Drills",
    priority: "High",
    target: 10,
    completed: 0,
    unit: "sessions",
    durationPerSession: "45 mins",
    description: "1 Session is 15 attempts of it & drill 7 questions"
  },
  {
    id: "grammar",
    title: "Grammar Drills",
    priority: "Medium",
    target: 7,
    completed: 0,
    unit: "sessions",
    durationPerSession: "30 mins",
    description: "20 questions: 10 hard, 7 med, 3 easy"
  },
  {
    id: "practice_test",
    title: "SAT Practice Test",
    priority: "High",
    target: 3,
    completed: 0,
    unit: "sessions",
    durationPerSession: "1h 30m",
    description: "Full practice test session (Monday, Wednesday, or Weekend)"
  },
  {
    id: "math",
    title: "Math Drills",
    priority: "Low",
    target: 5,
    completed: 0,
    unit: "sessions",
    durationPerSession: "30 mins",
    description: "Focus on geometry, word problems, and functions (~150 mins/week)"
  },
  {
    id: "evaluation",
    title: "Evaluation on Practice Test",
    priority: "High",
    target: 3,
    completed: 0,
    unit: "sessions",
    durationPerSession: "45 mins",
    description: "Redo wrong questions, analyze flaws and be mindful"
  },
  {
    id: "timo",
    title: "TIMO Preparation Drills",
    priority: "High",
    target: 10,
    completed: 0,
    unit: "sessions",
    durationPerSession: "30 mins",
    description: "Drill past year papers and competition guidelines"
  },
  {
    id: "ptln",
    title: "PTLN University Research",
    priority: "High",
    target: 4,
    completed: 0,
    unit: "sessions",
    durationPerSession: "45 mins",
    description: "Research overseas universities (requirements, essays, deadlines, portals)"
  },
  {
    id: "vocab",
    title: "Vocabulary Drills & 10 Qs Quiz",
    priority: "High",
    target: 5,
    completed: 0,
    unit: "sessions",
    durationPerSession: "30 mins",
    description: "15 mins vocab drills + 15 mins 10 qs vocab (medium to hard)"
  }
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
  const tsKey = `beasiswa_${key}_ts`;
  let localData = null;
  let localTs = 0;

  const localRaw = localStorage.getItem(localKey);
  if (localRaw) {
    try {
      localData = JSON.parse(localRaw);
      localTs = parseInt(localStorage.getItem(tsKey) || "0", 10);
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
        const apiTs = data.timestamp || 0;
        
        // CRITICAL PROTECTION: Only overwrite localData if API timestamp is strictly NEWER,
        // or if localData does not exist! If localData exists and is active user work, keep localData!
        if (localData === null || (apiTs > 0 && apiTs > localTs)) {
          localStorage.setItem(localKey, JSON.stringify(data.value));
          if (apiTs) localStorage.setItem(tsKey, apiTs.toString());
          return data.value;
        } else {
          // Local user data is newer or active -> Auto push local data up to Supabase!
          saveToAPI(key, localData);
          return localData;
        }
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
      localStorage.setItem(tsKey, Date.now().toString());
    } catch (e) {
      console.warn("Failed to set seed data in localStorage:", e);
    }
  }
  return finalData;
}

export function getOfflineQueueCount(): number {
  if (typeof window === "undefined") return 0;
  try {
    const q = localStorage.getItem("beasiswa_offline_queue");
    return q ? JSON.parse(q).length : 0;
  } catch {
    return 0;
  }
}

export function addToOfflineQueue(key: string, value: any) {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem("beasiswa_offline_queue");
    const queue: Array<{ key: string; timestamp: number }> = raw ? JSON.parse(raw) : [];
    if (!queue.find(item => item.key === key)) {
      queue.push({ key, timestamp: Date.now() });
    }
    localStorage.setItem("beasiswa_offline_queue", JSON.stringify(queue));
    window.dispatchEvent(new CustomEvent("offline-queue-updated"));
  } catch (e) {
    console.error("Failed to queue offline change:", e);
  }
}

export function clearOfflineQueue() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("beasiswa_offline_queue");
  window.dispatchEvent(new CustomEvent("offline-queue-updated"));
}

async function saveToAPI(key: string, value: any) {
  const localKey = `beasiswa_${key}`;
  const tsKey = `beasiswa_${key}_ts`;
  const now = Date.now();

  try {
    localStorage.setItem(localKey, JSON.stringify(value));
    localStorage.setItem(tsKey, now.toString());
  } catch (e) {
    console.error("Failed to write to localStorage:", e);
  }

  if (typeof navigator !== "undefined" && !navigator.onLine) {
    addToOfflineQueue(key, value);
    return;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(`/api/data?key=${key}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ value, timestamp: now }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (res.status === 401) {
      window.dispatchEvent(new Event('auth-error'));
    }
  } catch (e) {
    console.warn(`[data store] saveToAPI fallback for key "${key}":`, e);
    addToOfflineQueue(key, value);
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
    id: 201,
    title: "TIMO Preparation (Pagi)",
    description: "Drill TIMO past years & guidelines (Morning session)",
    date: formatDate(0),
    startTime: "07:30",
    endTime: "08:00",
    durationHours: 0.5,
    reminderMinutesBefore: 10,
    isCompleted: false,
    isNotified: false,
    iconId: "general",
    createdAt: now.toISOString(),
  },
  {
    id: 202,
    title: "SAT Prep (Pagi)",
    description: "General SAT Prep morning session",
    date: formatDate(0),
    startTime: "08:00",
    endTime: "08:40",
    durationHours: 0.67,
    reminderMinutesBefore: 10,
    isCompleted: false,
    isNotified: false,
    iconId: "sat",
    createdAt: now.toISOString(),
  },
  {
    id: 203,
    title: "School Preparation",
    description: "Making sure school things is fine",
    date: formatDate(0),
    startTime: "08:40",
    endTime: "09:00",
    durationHours: 0.33,
    reminderMinutesBefore: 5,
    isCompleted: false,
    isNotified: false,
    iconId: "general",
    createdAt: now.toISOString(),
  },
  {
    id: 204,
    title: "TIMO Preparation (After School)",
    description: "Afternoon TIMO drills (Monday - Friday)",
    date: formatDate(0),
    startTime: "15:10",
    endTime: "15:40",
    durationHours: 0.5,
    reminderMinutesBefore: 10,
    isCompleted: false,
    isNotified: false,
    iconId: "general",
    createdAt: now.toISOString(),
  },
  {
    id: 205,
    title: "SAT Prep (Night Main Session)",
    description: "Main evening SAT Prep focus (~90 mins)",
    date: formatDate(0),
    startTime: "20:30",
    endTime: "22:00",
    durationHours: 1.5,
    reminderMinutesBefore: 15,
    isCompleted: false,
    isNotified: false,
    iconId: "sat",
    createdAt: now.toISOString(),
  },
  {
    id: 206,
    title: "Preparing for Mapel",
    description: "Prep for unit test on ENGWA or PPKN",
    date: formatDate(0),
    startTime: "22:00",
    endTime: "22:15",
    durationHours: 0.25,
    reminderMinutesBefore: 5,
    isCompleted: false,
    isNotified: false,
    iconId: "general",
    createdAt: now.toISOString(),
  },
  {
    id: 207,
    title: "SAT Practice Test (Mon/Wed/Weekend)",
    description: "Full practice test session (Weekend 16:30 - 18:30 or Mon/Wed)",
    date: formatDate(1),
    startTime: "16:30",
    endTime: "18:30",
    durationHours: 2,
    reminderMinutesBefore: 15,
    isCompleted: false,
    isNotified: false,
    iconId: "sat",
    createdAt: now.toISOString(),
  }
];

export async function getReminders() {
  return await fetchFromAPI("reminders", REMINDERS_SEED);
}

export async function saveReminders(reminders: any) {
  await saveToAPI("reminders", reminders);
}

export async function getWeeklyDrills(): Promise<WeeklyDrillCategory[]> {
  return await fetchFromAPI("weekly_drills", WEEKLY_DRILLS_SEED);
}

export async function saveWeeklyDrills(drills: WeeklyDrillCategory[]) {
  await saveToAPI("weekly_drills", drills);
}

export async function syncAllToCloud() {
  const keys = ["universities", "goals", "cv", "documents", "reminders", "weekly_drills"];
  const seeds: Record<string, any> = {
    universities: UNIVERSITIES_SEED,
    goals: GOALS_SEED,
    cv: { personalInfo: { name: "", email: "", phone: "", address: "" }, education: [], certificates: [], skills: [], languages: [], experience: [] },
    documents: [],
    reminders: REMINDERS_SEED,
    weekly_drills: WEEKLY_DRILLS_SEED,
  };

  let synced = 0;
  for (const k of keys) {
    const localRaw = localStorage.getItem(`beasiswa_${k}`);
    const val = localRaw ? JSON.parse(localRaw) : seeds[k];
    await saveToAPI(k, val);
    synced++;
  }
  clearOfflineQueue();
  return synced;
}

// Auto-sync immediately on load and when network is restored
if (typeof window !== "undefined") {
  // Auto-migrate to current routine, 11 universities, screenshot goals, PTLN & Vocab drill
  const CURRENT_MIGRATION_VERSION = "v2026_09_newest_univ_ptln_vocab_v9";
  const applied = localStorage.getItem("beasiswa_migration_applied");
  if (applied !== CURRENT_MIGRATION_VERSION) {
    localStorage.setItem("beasiswa_universities", JSON.stringify(UNIVERSITIES_SEED));
    localStorage.setItem("beasiswa_universities_ts", Date.now().toString());
    localStorage.setItem("beasiswa_goals", JSON.stringify(GOALS_SEED));
    localStorage.setItem("beasiswa_goals_ts", Date.now().toString());
    localStorage.setItem("beasiswa_reminders", JSON.stringify(REMINDERS_SEED));
    localStorage.setItem("beasiswa_reminders_ts", Date.now().toString());
    localStorage.setItem("beasiswa_weekly_drills", JSON.stringify(WEEKLY_DRILLS_SEED));
    localStorage.setItem("beasiswa_weekly_drills_ts", Date.now().toString());
    localStorage.setItem("beasiswa_migration_applied", CURRENT_MIGRATION_VERSION);
    saveToAPI("universities", UNIVERSITIES_SEED);
    saveToAPI("goals", GOALS_SEED);
    saveToAPI("reminders", REMINDERS_SEED);
    saveToAPI("weekly_drills", WEEKLY_DRILLS_SEED);
  }

  setTimeout(() => {
    if (navigator.onLine) {
      syncAllToCloud().catch(err => console.warn("[store] Auto-sync failed:", err));
    }
  }, 1000);

  window.addEventListener("online", () => {
    syncAllToCloud()
      .then(() => {
        window.dispatchEvent(new CustomEvent("app-online-synced"));
      })
      .catch(err => console.warn("[store] Online re-sync failed:", err));
  });

  // Auto-sync to Supabase before tab close using fetch keepalive
  window.addEventListener("beforeunload", () => {
    const keys = ["universities", "goals", "cv", "documents", "reminders", "weekly_drills"];
    const token = localStorage.getItem("app_password") || "";
    for (const k of keys) {
      const localRaw = localStorage.getItem(`beasiswa_${k}`);
      if (localRaw) {
        try {
          const val = JSON.parse(localRaw);
          const ts = localStorage.getItem(`beasiswa_${k}_ts`) || Date.now().toString();
          fetch(`/api/data?key=${k}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ value: val, timestamp: parseInt(ts, 10) }),
            keepalive: true
          }).catch(() => {});
        } catch {}
      }
    }
  });
}

export async function restoreDefaultSeeds() {
  const seeds: Record<string, any> = {
    universities: UNIVERSITIES_SEED,
    goals: GOALS_SEED,
    cv: { personalInfo: { name: "", email: "", phone: "", address: "" }, education: [], certificates: [], skills: [], languages: [], experience: [] },
    documents: [],
    reminders: REMINDERS_SEED,
    weekly_drills: WEEKLY_DRILLS_SEED,
  };

  for (const k of Object.keys(seeds)) {
    localStorage.setItem(`beasiswa_${k}`, JSON.stringify(seeds[k]));
    await saveToAPI(k, seeds[k]);
  }
}
