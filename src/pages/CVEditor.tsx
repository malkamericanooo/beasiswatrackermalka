import { useState, useEffect } from "react";
import { Plus, Trash2, Printer } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getCV, saveCV } from "@/store/data";
import type { CVData, CVEducation, CVCertificate, CVExperience } from "@/types";

function uid() {
  return `id_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

function SectionHeader({ label, onAdd, addLabel }: { label: string; onAdd?: () => void; addLabel?: string }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">{label}</h3>
      {onAdd && (
        <button onClick={onAdd} data-testid={`btn-add-${label.toLowerCase().replace(/\s/g, "-")}`} className="flex items-center gap-1 text-xs text-primary hover:underline">
          <Plus className="w-3 h-3" /> {addLabel || "Add"}
        </button>
      )}
    </div>
  );
}

interface CVPreviewProps {
  cv: CVData;
}

function CVPreview({ cv }: CVPreviewProps) {
  const { personalInfo: p, education, certificates, skills, languages, experience } = cv;
  return (
    <div id="cv-preview" className="font-serif text-[13px] leading-relaxed text-gray-900 bg-white p-8 min-h-[800px]">
      {/* Header */}
      <div className="text-center mb-5 pb-4 border-b-2 border-gray-900">
        <h1 className="text-2xl font-bold uppercase tracking-widest">{p.name || "Your Name"}</h1>
        <div className="flex flex-wrap justify-center gap-3 mt-1.5 text-xs text-gray-600">
          {p.email && <span>{p.email}</span>}
          {p.phone && <span>{p.phone}</span>}
          {p.address && <span>{p.address}</span>}
        </div>
      </div>

      {/* Education */}
      {education.length > 0 && (
        <div className="mb-4">
          <h2 className="text-xs font-bold uppercase tracking-widest border-b border-gray-400 pb-0.5 mb-2">Education</h2>
          {education.map(e => (
            <div key={e.id} className="mb-2">
              <div className="flex justify-between">
                <span className="font-bold">{e.school}</span>
                <span className="text-gray-600 text-xs">{e.startYear}{e.endYear ? ` – ${e.endYear}` : " – Present"}</span>
              </div>
              <div className="text-gray-700">{e.degree}{e.field ? `, ${e.field}` : ""}</div>
            </div>
          ))}
        </div>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <div className="mb-4">
          <h2 className="text-xs font-bold uppercase tracking-widest border-b border-gray-400 pb-0.5 mb-2">Experience</h2>
          {experience.map(e => (
            <div key={e.id} className="mb-2">
              <div className="flex justify-between">
                <span className="font-bold">{e.title}</span>
                <span className="text-gray-600 text-xs">{e.startDate}{e.endDate ? ` – ${e.endDate}` : " – Present"}</span>
              </div>
              <div className="text-gray-700 italic">{e.organization}</div>
              {e.description && <p className="text-gray-700 mt-0.5">{e.description}</p>}
            </div>
          ))}
        </div>
      )}

      {/* Certifications */}
      {certificates.length > 0 && (
        <div className="mb-4">
          <h2 className="text-xs font-bold uppercase tracking-widest border-b border-gray-400 pb-0.5 mb-2">Certifications & Achievements</h2>
          {certificates.map(c => (
            <div key={c.id} className="mb-2">
              <div className="flex justify-between">
                <span className="font-bold">{c.title}</span>
                <span className="text-gray-600 text-xs">{c.date}</span>
              </div>
              <div className="text-gray-700 italic">{c.issuer}</div>
              {c.description && <p className="text-gray-700 mt-0.5">{c.description}</p>}
            </div>
          ))}
        </div>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <div className="mb-4">
          <h2 className="text-xs font-bold uppercase tracking-widest border-b border-gray-400 pb-0.5 mb-2">Skills</h2>
          <p className="text-gray-700">{skills.join(" • ")}</p>
        </div>
      )}

      {/* Languages */}
      {languages.length > 0 && (
        <div className="mb-4">
          <h2 className="text-xs font-bold uppercase tracking-widest border-b border-gray-400 pb-0.5 mb-2">Languages</h2>
          <div className="flex flex-wrap gap-4">
            {languages.map(l => (
              <span key={l.id} className="text-gray-700">
                <span className="font-semibold">{l.name}</span>
                {l.level ? ` — ${l.level}` : ""}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function CVEditor() {
  const [cv, setCv] = useState<CVData>({
    personalInfo: { name: "", email: "", phone: "", address: "" },
    education: [],
    certificates: [],
    skills: [],
    languages: [],
    experience: [],
  });
  const [skillInput, setSkillInput] = useState("");

  useEffect(() => {
    getCV().then(data => setCv(data as CVData));
  }, []);

  const persist = (updated: CVData) => {
    setCv(updated);
    saveCV(updated);
  };

  const updatePersonal = (key: keyof CVData["personalInfo"], val: string) => {
    persist({ ...cv, personalInfo: { ...cv.personalInfo, [key]: val } });
  };

  // Education
  const addEducation = () => {
    const e: CVEducation = { id: uid(), school: "", degree: "", field: "", startYear: "", endYear: "" };
    persist({ ...cv, education: [...cv.education, e] });
  };
  const updateEducation = (id: string, key: keyof CVEducation, val: string) => {
    persist({ ...cv, education: cv.education.map(e => e.id === id ? { ...e, [key]: val } : e) });
  };
  const removeEducation = (id: string) => {
    persist({ ...cv, education: cv.education.filter(e => e.id !== id) });
  };

  // Certificates
  const addCertificate = () => {
    const c: CVCertificate = { id: uid(), title: "", issuer: "", date: "", description: "" };
    persist({ ...cv, certificates: [...cv.certificates, c] });
  };
  const updateCertificate = (id: string, key: keyof CVCertificate, val: string) => {
    persist({ ...cv, certificates: cv.certificates.map(c => c.id === id ? { ...c, [key]: val } : c) });
  };
  const removeCertificate = (id: string) => {
    persist({ ...cv, certificates: cv.certificates.filter(c => c.id !== id) });
  };

  // Skills
  const addSkill = () => {
    const s = skillInput.trim();
    if (!s || cv.skills.includes(s)) return;
    persist({ ...cv, skills: [...cv.skills, s] });
    setSkillInput("");
  };
  const removeSkill = (s: string) => {
    persist({ ...cv, skills: cv.skills.filter(x => x !== s) });
  };

  // Languages
  const addLanguage = () => {
    persist({ ...cv, languages: [...cv.languages, { id: uid(), name: "", level: "" }] });
  };
  const updateLanguage = (id: string, key: "name" | "level", val: string) => {
    persist({ ...cv, languages: cv.languages.map(l => l.id === id ? { ...l, [key]: val } : l) });
  };
  const removeLanguage = (id: string) => {
    persist({ ...cv, languages: cv.languages.filter(l => l.id !== id) });
  };

  // Experience
  const addExperience = () => {
    const e: CVExperience = { id: uid(), title: "", organization: "", startDate: "", endDate: "", description: "" };
    persist({ ...cv, experience: [...cv.experience, e] });
  };
  const updateExperience = (id: string, key: keyof CVExperience, val: string) => {
    persist({ ...cv, experience: cv.experience.map(e => e.id === id ? { ...e, [key]: val } : e) });
  };
  const removeExperience = (id: string) => {
    persist({ ...cv, experience: cv.experience.filter(e => e.id !== id) });
  };

  const handlePrint = () => window.print();

  return (
    <div className="p-8">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-1">CV Editor</h1>
          <p className="text-muted-foreground text-sm">Build and auto-generate your CV from your certificates and experience.</p>
        </div>
        <Button onClick={handlePrint} variant="outline" data-testid="btn-print-cv">
          <Printer className="w-4 h-4 mr-1.5" />
          Print CV
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-6 cv-editor-layout">
        {/* Left: Form */}
        <div className="cv-form space-y-6 overflow-y-auto max-h-[calc(100vh-160px)] pr-2">
          {/* Personal Info */}
          <Card>
            <CardContent className="p-4">
              <SectionHeader label="Personal Info" />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="cv-name" className="text-xs">Full Name</Label>
                  <Input id="cv-name" data-testid="input-cv-name" className="mt-1" value={cv.personalInfo.name} onChange={e => updatePersonal("name", e.target.value)} placeholder="Your Name" />
                </div>
                <div>
                  <Label htmlFor="cv-email" className="text-xs">Email</Label>
                  <Input id="cv-email" data-testid="input-cv-email" className="mt-1" value={cv.personalInfo.email} onChange={e => updatePersonal("email", e.target.value)} placeholder="email@example.com" />
                </div>
                <div>
                  <Label htmlFor="cv-phone" className="text-xs">Phone</Label>
                  <Input id="cv-phone" data-testid="input-cv-phone" className="mt-1" value={cv.personalInfo.phone} onChange={e => updatePersonal("phone", e.target.value)} placeholder="+62 ..." />
                </div>
                <div>
                  <Label htmlFor="cv-address" className="text-xs">Address</Label>
                  <Input id="cv-address" data-testid="input-cv-address" className="mt-1" value={cv.personalInfo.address} onChange={e => updatePersonal("address", e.target.value)} placeholder="City, Country" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Education */}
          <Card>
            <CardContent className="p-4">
              <SectionHeader label="Education" onAdd={addEducation} addLabel="Add Education" />
              {cv.education.length === 0 && (
                <p className="text-xs text-muted-foreground">No education entries yet.</p>
              )}
              {cv.education.map((e, i) => (
                <div key={e.id} className="border border-border rounded-md p-3 mb-3 last:mb-0">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-medium text-muted-foreground">Entry {i + 1}</span>
                    <button onClick={() => removeEducation(e.id)} data-testid={`btn-remove-edu-${e.id}`} className="text-muted-foreground hover:text-destructive">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="col-span-2">
                      <Label className="text-xs">School / Institution</Label>
                      <Input className="mt-0.5 h-8 text-sm" value={e.school} onChange={ev => updateEducation(e.id, "school", ev.target.value)} placeholder="School name" data-testid={`input-edu-school-${e.id}`} />
                    </div>
                    <div>
                      <Label className="text-xs">Degree</Label>
                      <Input className="mt-0.5 h-8 text-sm" value={e.degree} onChange={ev => updateEducation(e.id, "degree", ev.target.value)} placeholder="e.g. Bachelor" data-testid={`input-edu-degree-${e.id}`} />
                    </div>
                    <div>
                      <Label className="text-xs">Field</Label>
                      <Input className="mt-0.5 h-8 text-sm" value={e.field} onChange={ev => updateEducation(e.id, "field", ev.target.value)} placeholder="e.g. Computer Science" data-testid={`input-edu-field-${e.id}`} />
                    </div>
                    <div>
                      <Label className="text-xs">Start Year</Label>
                      <Input className="mt-0.5 h-8 text-sm" value={e.startYear} onChange={ev => updateEducation(e.id, "startYear", ev.target.value)} placeholder="2022" data-testid={`input-edu-start-${e.id}`} />
                    </div>
                    <div>
                      <Label className="text-xs">End Year</Label>
                      <Input className="mt-0.5 h-8 text-sm" value={e.endYear} onChange={ev => updateEducation(e.id, "endYear", ev.target.value)} placeholder="2026 or leave blank" data-testid={`input-edu-end-${e.id}`} />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Certificates / Achievements */}
          <Card>
            <CardContent className="p-4">
              <SectionHeader label="Certificates & Achievements" onAdd={addCertificate} addLabel="Add Certificate" />
              <p className="text-xs text-muted-foreground mb-3">Added certificates are auto-placed in your CV preview.</p>
              {cv.certificates.length === 0 && (
                <p className="text-xs text-muted-foreground">No certificates yet. Add one above!</p>
              )}
              {cv.certificates.map((c, i) => (
                <div key={c.id} className="border border-border rounded-md p-3 mb-3 last:mb-0">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-medium text-muted-foreground">Certificate {i + 1}</span>
                    <button onClick={() => removeCertificate(c.id)} data-testid={`btn-remove-cert-${c.id}`} className="text-muted-foreground hover:text-destructive">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="col-span-2">
                      <Label className="text-xs">Certificate Title</Label>
                      <Input className="mt-0.5 h-8 text-sm" value={c.title} onChange={ev => updateCertificate(c.id, "title", ev.target.value)} placeholder="e.g. IELTS 7.5" data-testid={`input-cert-title-${c.id}`} />
                    </div>
                    <div>
                      <Label className="text-xs">Issuing Organization</Label>
                      <Input className="mt-0.5 h-8 text-sm" value={c.issuer} onChange={ev => updateCertificate(c.id, "issuer", ev.target.value)} placeholder="e.g. British Council" data-testid={`input-cert-issuer-${c.id}`} />
                    </div>
                    <div>
                      <Label className="text-xs">Date</Label>
                      <Input className="mt-0.5 h-8 text-sm" value={c.date} onChange={ev => updateCertificate(c.id, "date", ev.target.value)} placeholder="e.g. June 2026" data-testid={`input-cert-date-${c.id}`} />
                    </div>
                    <div className="col-span-2">
                      <Label className="text-xs">Description (optional)</Label>
                      <Input className="mt-0.5 h-8 text-sm" value={c.description} onChange={ev => updateCertificate(c.id, "description", ev.target.value)} placeholder="Brief description..." data-testid={`input-cert-desc-${c.id}`} />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Skills */}
          <Card>
            <CardContent className="p-4">
              <SectionHeader label="Skills" />
              <div className="flex gap-2 mb-3">
                <Input
                  data-testid="input-skill"
                  className="flex-1 h-8 text-sm"
                  value={skillInput}
                  onChange={e => setSkillInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addSkill(); } }}
                  placeholder="Type a skill and press Enter"
                />
                <Button size="sm" onClick={addSkill} data-testid="btn-add-skill">Add</Button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {cv.skills.map(s => (
                  <div key={s} className="flex items-center gap-1 bg-muted text-sm px-2 py-0.5 rounded-md">
                    {s}
                    <button onClick={() => removeSkill(s)} data-testid={`btn-remove-skill-${s}`} className="text-muted-foreground hover:text-foreground">
                      <span className="text-xs">×</span>
                    </button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Languages */}
          <Card>
            <CardContent className="p-4">
              <SectionHeader label="Languages" onAdd={addLanguage} addLabel="Add Language" />
              {cv.languages.length === 0 && (
                <p className="text-xs text-muted-foreground">No languages added yet.</p>
              )}
              {cv.languages.map(l => (
                <div key={l.id} className="flex gap-2 mb-2 items-center">
                  <Input className="flex-1 h-8 text-sm" value={l.name} onChange={e => updateLanguage(l.id, "name", e.target.value)} placeholder="Language" data-testid={`input-lang-name-${l.id}`} />
                  <Input className="flex-1 h-8 text-sm" value={l.level} onChange={e => updateLanguage(l.id, "level", e.target.value)} placeholder="Level (e.g. Fluent, B2)" data-testid={`input-lang-level-${l.id}`} />
                  <button onClick={() => removeLanguage(l.id)} data-testid={`btn-remove-lang-${l.id}`} className="text-muted-foreground hover:text-destructive shrink-0">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Experience */}
          <Card>
            <CardContent className="p-4">
              <SectionHeader label="Experience" onAdd={addExperience} addLabel="Add Experience" />
              {cv.experience.length === 0 && (
                <p className="text-xs text-muted-foreground">No experience entries yet.</p>
              )}
              {cv.experience.map((e, i) => (
                <div key={e.id} className="border border-border rounded-md p-3 mb-3 last:mb-0">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-medium text-muted-foreground">Entry {i + 1}</span>
                    <button onClick={() => removeExperience(e.id)} data-testid={`btn-remove-exp-${e.id}`} className="text-muted-foreground hover:text-destructive">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs">Title / Role</Label>
                      <Input className="mt-0.5 h-8 text-sm" value={e.title} onChange={ev => updateExperience(e.id, "title", ev.target.value)} placeholder="e.g. Research Assistant" data-testid={`input-exp-title-${e.id}`} />
                    </div>
                    <div>
                      <Label className="text-xs">Organization</Label>
                      <Input className="mt-0.5 h-8 text-sm" value={e.organization} onChange={ev => updateExperience(e.id, "organization", ev.target.value)} placeholder="Organization name" data-testid={`input-exp-org-${e.id}`} />
                    </div>
                    <div>
                      <Label className="text-xs">Start Date</Label>
                      <Input className="mt-0.5 h-8 text-sm" value={e.startDate} onChange={ev => updateExperience(e.id, "startDate", ev.target.value)} placeholder="e.g. Jan 2024" data-testid={`input-exp-start-${e.id}`} />
                    </div>
                    <div>
                      <Label className="text-xs">End Date</Label>
                      <Input className="mt-0.5 h-8 text-sm" value={e.endDate} onChange={ev => updateExperience(e.id, "endDate", ev.target.value)} placeholder="e.g. Jun 2024 or Present" data-testid={`input-exp-end-${e.id}`} />
                    </div>
                    <div className="col-span-2">
                      <Label className="text-xs">Description</Label>
                      <Textarea className="mt-0.5 text-sm resize-none" rows={2} value={e.description} onChange={ev => updateExperience(e.id, "description", ev.target.value)} placeholder="Brief description..." data-testid={`input-exp-desc-${e.id}`} />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right: CV Preview */}
        <div className="cv-preview-panel">
          <div className="sticky top-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Live Preview</h2>
              <Button size="sm" variant="outline" onClick={handlePrint} data-testid="btn-print-cv-preview">
                <Printer className="w-3.5 h-3.5 mr-1.5" />
                Print
              </Button>
            </div>
            <div className="border border-border rounded-lg overflow-hidden shadow-sm">
              <CVPreview cv={cv} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
