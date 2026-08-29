export interface Student {
  id: string;
  name: string;
  age: number;
  grade: string;
  diagnosis: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Medication {
  id: string;
  student_id: string;
  user_id: string;
  name: string;
  dosage: string;
  frequency: string;
  next_dose: string;
  created_at: string;
  updated_at: string;
}

export interface SupportPlan {
  id: string;
  student_id: string;
  support_needs: string[];
  skills: string[];
  triggers: string[];
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: string;
  student_id: string;
  title: string;
  type: string;
  start_time: string;
  end_time: string;
  created_at: string;
  updated_at: string;
}
