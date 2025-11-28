// Common Types
export interface User {
  id: string;
  email: string;
  created_at?: string;
  updated_at?: string;
  user_metadata?: {
    full_name?: string;
  };
}

export interface Session {
  access_token: string;
  refresh_token: string;
  user: User;
  expires_at: number;
}

// Facility Types
export interface MailingAddress {
  id?: string;
  parent_id?: string;
  'Mailing Account Name'?: string;
  'Mailing Account Address_line1'?: string;
  'Mailing Account Address_line2'?: string;
  'Mailing Account City'?: string;
  'Mailing Account State'?: string;
  'Mailing Account Zip'?: string;
  'Facility Mailing Account ID'?: string;
}

export interface Facility {
  id: string;
  facility_id: string;
  facility_name: string;
  'Facility ID'?: string;
  'Facility Name'?: string;
  'Active Customer?'?: string | boolean;
  'Roster Report Google Sheet Link'?: string;
  'Staff Emails For Reporting'?: string;
  report_link?: string;
  mailing_addresses?: MailingAddress[];
}

// Queue Types
export interface QueueItem {
  id: string;
  first_name: string;
  last_name: string;
  facility_name: string;
  document_type: string;
  status: string;
  created_at: string;
}

// Maverick Types
export interface Maverick {
  id: string;
  first_name: string;
  last_name: string;
  doc_number?: string;
  facility_id?: string;
  facility_name?: string;
  maverick_profile_id?: string;
  document_type?: string;
  mailing_address?: string | object;
  created_at?: string;
  full_name?: string;
  document_parent_id?: string;
}

// Results Types
export interface Result {
  document_id: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  document_type: string;
  score?: number;
  created_at: string;
  date_created?: string;
  doc_number?: string;
  facility_name?: string;
  facility_id?: string;
  parent_id?: string;
  mailing_address?: string;
  extracted_table?: string;
  [key: string]: any; // For dynamic Edovo question fields like Q1, Q2, etc.
}

// Document Types
export interface DocumentUrls {
  document_url?: string;
  image_url?: string;
  is_edovo?: boolean;
  questions?: EdovoQuestion[];
}

export interface EdovoQuestion {
  question_number: number;
  lesson: string;
  question: string;
  answer?: string;
  required?: boolean;
}

export interface EdovoAnswerKey {
  question_number: number;
  lesson: string;
  question: string;
  required: boolean;
}

// Mail Types
export interface MailItem {
  id: string;
  first_name?: string;
  last_name?: string;
  sender?: string;
  received_date?: string;
  archived?: boolean;
  status?: string;
  [key: string]: any;
}

// API Response Types
export interface ApiResponse<T = any> {
  success?: boolean;
  data?: T;
  error?: string;
  message?: string;
  status?: string;
}

// Pagination Types
export interface PaginationData<T = any> {
  items: T[];
  totalItems: number;
  page?: number;
  itemsPerPage?: number;
}

// Auth Types
export interface AuthResult {
  success: boolean;
  user?: User;
  error?: string;
}

export interface ValidationRule {
  (value: any): boolean | string;
}

// Form Types
export interface FormRules {
  required: ValidationRule;
  email?: ValidationRule;
  minLength?: ValidationRule;
  passwordMatch?: ValidationRule;
  mustAgree?: ValidationRule;
}

// Roster Report Types
export interface RosterData {
  total_mavericks?: number;
  mavericks?: RosterMaverick[];
}

export interface RosterMaverick {
  first_name: string;
  last_name: string;
  doc_number?: string;
  application?: { status?: string };
  tyh?: { status?: string };
  preseason?: { status?: string };
  book_one?: { status?: string };
  book_two?: { status?: string };
  notes?: string;
}

// Question Types
export type QuestionType = 'All' | string;

// Match Status
export type MatchStatus = 'All' | 'Matched' | 'Unmatched';

// Date Range
export type DateRange = string[];

// Route Types
export interface RouteParams {
  path: string;
  fullPath?: string;
}

