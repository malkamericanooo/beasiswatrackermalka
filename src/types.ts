export type DocCategory = "Academic" | "Document" | "Language";

export type BerkasCategory = "Akademik" | "Bahasa" | "Sertifikat" | "Lainnya";

export interface StoredBerkas {
  id: string;
  name: string;
  originalName: string;
  category: BerkasCategory;
  description: string;
  dateAdded: string;
  fileSize: number;
  fileType: string;
  dataUrl: string;
}
export type UniStatus = "Researching" | "Applying" | "Applied" | "Submitted";
export type Priority = "High" | "Medium" | "Low";
export type FeeSource = "agent-estimated" | "user-provided";

export interface UniversityDocument {
  id: string;
  name: string;
  category: DocCategory;
  completed: boolean;
}

export interface RegistrationFee {
  amount: number;
  currency: string;
  source: FeeSource;
}

export interface University {
  id: string;
  name: string;
  shortName: string;
  country: string;
  program: string;
  department: string;
  language: string;
  applicationOpens: string;
  deadline: string;
  status: UniStatus;
  priority: Priority;
  registrationFee: RegistrationFee;
  documents: UniversityDocument[];
}

export interface Goal {
  id: string;
  title: string;
  category: string;
  priority: Priority;
  deadline: string | null;
  description: string;
  completed: boolean;
}

export interface CVPersonalInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
}

export interface CVEducation {
  id: string;
  school: string;
  degree: string;
  field: string;
  startYear: string;
  endYear: string;
}

export interface CVCertificate {
  id: string;
  title: string;
  issuer: string;
  date: string;
  description: string;
}

export interface CVExperience {
  id: string;
  title: string;
  organization: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface CVData {
  personalInfo: CVPersonalInfo;
  education: CVEducation[];
  certificates: CVCertificate[];
  skills: string[];
  languages: { id: string; name: string; level: string }[];
  experience: CVExperience[];
}
