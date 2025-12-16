export interface Task {
  time: string;
  subject: string;
  details: string;
  type: 'maths' | 'physics' | 'chemistry' | 'english' | 'computer' | 'bengali' | 'break';
}

export interface Schedule {
  Sunday: Task[];
  Monday: Task[];
  Tuesday: Task[];
  Wednesday: Task[];
  Thursday: Task[];
  Friday: Task[];
  Saturday: Task[];
}

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  name: string;
}

export interface TaskUpdate {
  day: keyof Schedule;
  taskIndex: number;
  task: Task;
}

export interface ScheduleUpdate {
  day: keyof Schedule;
  tasks: Task[];
}
