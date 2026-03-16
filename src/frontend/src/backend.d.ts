import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface PatientRecord {
    id: string;
    doctorNotes: string;
    prescription: string;
    patientId: string;
    visitDate: string;
    diagnosis: string;
    patientName: string;
    doctorName: string;
    department: string;
}
export interface AppointmentPartial {
    id: string;
    tokenNumber: bigint;
}
export interface Appointment {
    id: string;
    status: string;
    paymentStatus: string;
    tokenNumber: bigint;
    patientId: string;
    createdAt: bigint;
    appointmentDate: string;
    patientName: string;
    doctorName: string;
    department: string;
    timeSlot: string;
}
export interface LoginResponse {
    userId: string;
    name: string;
    role: string;
    sessionToken: string;
}
export interface DashboardStats {
    appointmentCount: bigint;
    doctorCount: bigint;
    patientCount: bigint;
}
export interface UserProfile {
    name: string;
    role: string;
    email: string;
    phone: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    bookAppointment(sessionToken: string, doctorName: string, department: string, appointmentDate: string, timeSlot: string): Promise<{
        __kind__: "ok";
        ok: AppointmentPartial;
    } | {
        __kind__: "err";
        err: string;
    }>;
    completeConsultation(sessionToken: string, appointmentId: string, diagnosis: string, prescription: string, doctorNotes: string): Promise<{
        __kind__: "ok";
        ok: boolean;
    } | {
        __kind__: "err";
        err: string;
    }>;
    confirmPayment(sessionToken: string, appointmentId: string): Promise<{
        __kind__: "ok";
        ok: boolean;
    } | {
        __kind__: "err";
        err: string;
    }>;
    getAllConsultations(sessionToken: string): Promise<{
        __kind__: "ok";
        ok: Array<PatientRecord>;
    } | {
        __kind__: "err";
        err: string;
    }>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getDashboardStats(): Promise<DashboardStats>;
    getMyAppointments(sessionToken: string): Promise<{
        __kind__: "ok";
        ok: Array<Appointment>;
    } | {
        __kind__: "err";
        err: string;
    }>;
    getPatientRecords(sessionToken: string): Promise<{
        __kind__: "ok";
        ok: Array<PatientRecord>;
    } | {
        __kind__: "err";
        err: string;
    }>;
    getQueue(sessionToken: string, date: string): Promise<{
        __kind__: "ok";
        ok: Array<Appointment>;
    } | {
        __kind__: "err";
        err: string;
    }>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    initialize(): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    login(email: string, passwordHash: string, role: string): Promise<{
        __kind__: "ok";
        ok: LoginResponse;
    } | {
        __kind__: "err";
        err: string;
    }>;
    logout(token: string): Promise<void>;
    register(name: string, email: string, phone: string, passwordHash: string, role: string): Promise<{
        __kind__: "ok";
        ok: string;
    } | {
        __kind__: "err";
        err: string;
    }>;
    resetAppointments(): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    validateSession(token: string): Promise<{
        userId: string;
        name: string;
        role: string;
    } | null>;
}
