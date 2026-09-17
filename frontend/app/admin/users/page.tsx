"use client";

import { FormEvent, ReactNode, useState } from "react";
import { ShieldCheck, UserPlus } from "lucide-react";
import { provisionUser, saveTeacherProfile } from "@/app/services/adminService";
import { Role } from "@/app/services/authService";
import { addStudent } from "@/app/services/studentService";
import { StudentGender } from "@/app/types/api";
import { InlineNotice } from "@/components/AsyncState";

type ProvisioningForm = {
  name: string;
  email: string;
  password: string;
  role: Role;
  studentClass: string;
  parentEmail: string;
  gender: "" | StudentGender;
  assignedClasses: string;
  assignedSubjects: string;
};

const INITIAL: ProvisioningForm = {
  name: "",
  email: "",
  password: "",
  role: "STUDENT",
  studentClass: "",
  parentEmail: "",
  gender: "",
  assignedClasses: "",
  assignedSubjects: "",
};

export default function UserProvisioningPage() {
  const [form, setForm] = useState(INITIAL);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");
    let accountCreated = false;
    const email = form.email.trim().toLowerCase();

    try {
      await provisionUser({ name: form.name.trim(), email, password: form.password, role: form.role });
      accountCreated = true;
      if (form.role === "STUDENT") {
        await addStudent({
          name: form.name.trim(),
          email,
          parentEmail: form.parentEmail.trim() ? form.parentEmail.trim().toLowerCase() : null,
          studentClass: form.studentClass.trim(),
          gender: form.gender || null,
        });
      }
      if (form.role === "TEACHER") {
        await saveTeacherProfile({
          email,
          assignedClassIds: csv(form.assignedClasses),
          assignedSubjects: csv(form.assignedSubjects),
        });
      }
      const hasProfile = form.role === "STUDENT" || form.role === "TEACHER";
      setNotice(`${form.role.toLowerCase()} account${hasProfile ? " and profile" : ""} created successfully.`);
      setForm(INITIAL);
    } catch (unknownError: unknown) {
      const message = unknownError instanceof Error ? unknownError.message : "Could not provision the account.";
      setError(accountCreated
        ? `The login account was created, but its role profile could not be completed: ${message}`
        : message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-7">
      <header>
        <h1 className="flex items-center gap-3 text-3xl font-black">
          <UserPlus className="h-8 w-8 text-rose-600" />Provision user account
        </h1>
        <p className="mt-1 text-slate-500">Create login accounts and their required role profiles in one guided workflow.</p>
      </header>
      <InlineNotice
        tone="info"
        message="Give the temporary password through a trusted channel and ask the user to change it after signing in. A first-login reset is not currently enforced."
      />
      {notice && <InlineNotice message={notice} />}
      {error && <InlineNotice message={error} tone="error" />}

      <form onSubmit={submit} className="space-y-5 rounded-3xl border border-slate-200 bg-white p-7 dark:border-slate-800 dark:bg-slate-900">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Full name"><input required minLength={2} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="field" /></Field>
          <Field label="Email"><input required type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className="field" /></Field>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Temporary password (upper/lower/number/symbol)"><input required type="password" minLength={8} maxLength={128} pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.#_-]).{8,128}" title="Use 8–128 characters with uppercase, lowercase, a number, and a special character." autoComplete="new-password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} className="field" /></Field>
          <Field label="Role">
            <select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value as Role })} className="field">
              <option value="STUDENT">Student</option><option value="PARENT">Parent</option><option value="TEACHER">Teacher</option><option value="ADMIN">Administrator</option>
            </select>
          </Field>
        </div>

        {form.role === "STUDENT" && (
          <div className="grid gap-5 rounded-2xl bg-slate-50 p-5 dark:bg-slate-800/50 sm:grid-cols-3">
            <Field label="Class"><input required value={form.studentClass} onChange={(event) => setForm({ ...form, studentClass: event.target.value })} className="field" /></Field>
            <Field label="Parent email (optional)"><input type="email" value={form.parentEmail} onChange={(event) => setForm({ ...form, parentEmail: event.target.value })} className="field" /></Field>
            <Field label="Gender (optional)">
              <select value={form.gender} onChange={(event) => setForm({ ...form, gender: event.target.value as ProvisioningForm["gender"] })} className="field">
                <option value="">Not provided</option><option value="MALE">Male</option><option value="FEMALE">Female</option><option value="OTHER">Other</option><option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
              </select>
            </Field>
          </div>
        )}

        {form.role === "TEACHER" && (
          <div className="grid gap-5 rounded-2xl bg-slate-50 p-5 dark:bg-slate-800/50 sm:grid-cols-2">
            <Field label="Assigned classes (comma-separated)"><input required placeholder="10-A, 11-B" value={form.assignedClasses} onChange={(event) => setForm({ ...form, assignedClasses: event.target.value })} className="field" /></Field>
            <Field label="Assigned subjects (comma-separated)"><input required placeholder="Mathematics, Physics" value={form.assignedSubjects} onChange={(event) => setForm({ ...form, assignedSubjects: event.target.value })} className="field" /></Field>
          </div>
        )}

        <button disabled={saving} className="flex w-full items-center justify-center gap-2 rounded-xl bg-rose-600 py-3 font-bold text-white disabled:opacity-60">
          <ShieldCheck className="h-5 w-5" />{saving ? "Provisioning…" : "Create secure account"}
        </button>
      </form>
    </div>
  );
}

function csv(value: string) {
  return value.split(",").map((part) => part.trim()).filter(Boolean);
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="grid gap-1 text-sm font-semibold">{label}{children}</label>;
}
