import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const ROLES = {
  ADMIN: 'ADMIN',
  PASTOR: 'PASTOR',
  LEADER: 'LEADER',
  TEAM: 'TEAM',
} as const;

export type Role = keyof typeof ROLES;

export const STATUSES = {
  VISITOR: 'Visitante',
  FOLLOWING: 'Em Acompanhamento',
  DISCIPLESHIP: 'Em Discipulado',
  INTEGRATED: 'Integrado',
  AWAY: 'Afastado',
} as const;

export type Status = keyof typeof STATUSES;

export const CONTACT_TYPES = {
  CALL: 'Ligação',
  VISIT: 'Visita',
  COUNSELING: 'Aconselhamento',
  EVENT: 'Evento',
  OTHER: 'Outro',
} as const;

export type ContactType = keyof typeof CONTACT_TYPES;

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
}

export interface Member {
  id: number;
  name: string;
  dob?: string;
  gender?: string;
  marital_status?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  address?: string;
  neighborhood?: string;
  city?: string;
  first_visit_date?: string;
  invited_by?: string;
  previous_church?: string;
  is_baptized: boolean;
  wants_baptism: boolean;
  in_group: boolean;
  interest_ministry?: string;
  pastoral_notes?: string;
  status: Status;
  assigned_to?: number;
  assigned_name?: string;
  created_at: string;
  updated_at: string;
}

export interface Contact {
  id: number;
  member_id: number;
  user_id: number;
  user_name: string;
  type: ContactType;
  notes?: string;
  next_contact_date?: string;
  created_at: string;
}
