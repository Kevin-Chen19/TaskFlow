-- TaskFlow Database Initialization Script

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  phone VARCHAR(20) NOT NULL UNIQUE,
  fullname VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  avatar_url TEXT,
  skills VARCHAR(100)[],
  mooto VARCHAR(255) DEFAULT 'I am a mooto'
);

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  owner_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  progress INTEGER DEFAULT 0,
  assignee_ids INTEGER[],
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  total_hours INTEGER DEFAULT 0
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
  creator_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  assignee_ids INTEGER[],
  due_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  start_date TIMESTAMP,
  progress INTEGER DEFAULT 0,
  priority INTEGER DEFAULT 0
);

-- Create project_members table
CREATE TABLE IF NOT EXISTS project_members (
  id SERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'member',
  position VARCHAR(50),
  is_active BOOLEAN DEFAULT FALSE
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
  creator_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  description TEXT,
  type VARCHAR(50) DEFAULT 'chat',
  assignee_ids INTEGER[],
  status BOOLEAN[],
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create notes table
CREATE TABLE IF NOT EXISTS notes (
  id SERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
  creator_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  status BOOLEAN DEFAULT FALSE
);

-- Create project_roles table
CREATE TABLE IF NOT EXISTS project_roles (
  id SERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
  rolename VARCHAR(50) NOT NULL,
  description TEXT,
  settings JSONB DEFAULT '{}'
);

-- Create project_positions table
CREATE TABLE IF NOT EXISTS project_positions (
  id SERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
  positionname VARCHAR(50) NOT NULL,
  description TEXT
);

-- Create project_folders table
CREATE TABLE IF NOT EXISTS project_folders (
  id SERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
  parent_folder_id INTEGER REFERENCES project_folders(id) ON DELETE CASCADE,
  name VARCHAR(50) NOT NULL,
  path TEXT,
  creator_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);

-- Create project_documents table
CREATE TABLE IF NOT EXISTS project_documents (
  id SERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
  parent_folder_id INTEGER REFERENCES project_folders(id) ON DELETE CASCADE,
  name VARCHAR(50) NOT NULL,
  path TEXT,
  creator_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);

-- Create indexes for query performance
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_creator_id ON tasks(creator_id);
CREATE INDEX IF NOT EXISTS idx_projects_owner_id ON projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_project_members_project_id ON project_members(project_id);
CREATE INDEX IF NOT EXISTS idx_project_members_user_id ON project_members(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_project_id ON notifications(project_id);
CREATE INDEX IF NOT EXISTS idx_notifications_creator_id ON notifications(creator_id);
CREATE INDEX IF NOT EXISTS idx_notes_project_id ON notes(project_id);
CREATE INDEX IF NOT EXISTS idx_notes_creator_id ON notes(creator_id);
CREATE INDEX IF NOT EXISTS idx_project_roles_project_id ON project_roles(project_id);
CREATE INDEX IF NOT EXISTS idx_project_positions_project_id ON project_positions(project_id);
CREATE INDEX IF NOT EXISTS idx_project_folders_project_id ON project_folders(project_id);
CREATE INDEX IF NOT EXISTS idx_project_folders_parent_id ON project_folders(parent_folder_id);
CREATE INDEX IF NOT EXISTS idx_project_documents_project_id ON project_documents(project_id);
CREATE INDEX IF NOT EXISTS idx_project_documents_folder_id ON project_documents(parent_folder_id);

-- Insert sample data
INSERT INTO users (phone, fullname, email, password) VALUES
  ('13800138001', '张三', 'zhangsan@example.com', 'password123'),
  ('13800138002', '李四', 'lisi@example.com', 'password123');

INSERT INTO projects (name, description, owner_id, assignee_ids) VALUES
  ('TaskFlow Project', 'Full-stack project management platform', 1, ARRAY[1, 2]),
  ('Mobile Adaptation', 'Mobile UI adaptation and optimization', 1, ARRAY[1]);

INSERT INTO tasks (title, description, project_id, creator_id, assignee_ids, priority) VALUES
  ('Design Database', 'Design PostgreSQL database structure', 1, 1, ARRAY[1], 2),
  ('Develop API', 'Implement RESTful API', 1, 1, ARRAY[1, 2], 2),
  ('Frontend Development', 'Develop frontend pages with Vue3', 1, 1, ARRAY[2], 1);
