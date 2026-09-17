export type DashboardUser = {
  id: number;
  name: string;
  email: string;
  role: string | null;
  department: string | null;
};

export type DashboardSummary = {
  overall_score: number;
  total_skills: number;
  strong_skills: number;
  skill_gaps: number;
  total_courses: number;
  completed_courses: number;
};

export type Competency = {
  skill_name: string;
  score: number;
  level: string;
};

export type SkillGap = {
  skill_name: string;
  score: number;
  level: string;
  priority?: string;
};

export type Recommendation = {
  course_id: number;
  course_name: string;
  category: string;
  description?: string;
  difficulty: string;
  skill_gap: string;
  current_score: number;
  priority: string;
  progress?: number;
  status?: string;
};

export type Course = {
  course_id: number;
  course_name: string;
  category: string;
  difficulty: string;
  progress: number;
  status: string;
  enrolled_at: string;
  completed_at?: string | null;
};

export type ImprovementHistory = {
  id: number;
  skill_name: string;
  previous_score: number;
  new_score: number;
  improvement: number;
  improvement_percentage: number;
  previous_level: string;
  new_level: string;
  source: string;
  created_at: string;
};

export type DashboardResponse = {
  user: DashboardUser;
  summary: DashboardSummary;
  competencies: Competency[];
  skill_gaps: SkillGap[];
  recommendations: Recommendation[];
  courses: Course[];
  improvement_history: ImprovementHistory[];
};