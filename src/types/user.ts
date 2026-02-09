export interface User {
  id: number;
  phone: string;
  fullname: string;
  email: string;
  avatar_url?: string;
  skills?: string[];
  mooto?: string;
}

export interface Project {
  id: number;
  name: string;
  description?: string;
  owner_id: number;
  progress: number;
  assignee_ids: number[];
  created_at: string;
  total_hours: number;
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  project_id: number;
  creator_id: number;
  assignee_ids: number[];
  due_date?: string;
  start_date?: string;
  progress: number;
  priority: number; // 0=无, 1=低, 2=中, 3=高
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: number;
  project_id: number;
  creator_id: number;
  description: string;
  type: string;
  assignee_ids: number[];
  status: number[];
  created_at: string;
}

export interface Note {
  id: number;
  project_id: number;
  creator_id: number;
  description: string;
  status: boolean;
  created_at: string;
}

export interface ProjectMember {
  id: number;
  project_id: number;
  user_id: number;
  role: string;
  position?: string;
  is_active: boolean;
  fullname?: string;
  email?: string;
  avatar_url?: string;
}

export interface ProjectRole {
  id: number;
  project_id: number;
  rolename: string;
  description?: string;
  settings?: any;
}

export interface ProjectPosition {
  id: number;
  project_id: number;
  positionname: string;
  description?: string;
}

export interface ProjectFolder {
  id: number;
  project_id: number;
  parent_folder_id: number | null;
  name: string;
  creator_id: number;
  created_at: string;
  deleted_at?: string;
}

export interface ProjectDocument {
  id: number;
  project_id: number;
  parent_folder_id: number | null;
  name: string;
  creator_id: number;
  created_at: string;
  deleted_at?: string;
}
