export type PillarKey = 'espiritual' | 'fisico' | 'mental' | 'familiar' | 'profissional';

export type TaskStatus = 'feito' | 'parcial' | 'nao' | null;

export interface PillarConfig {
  key: PillarKey;
  label: string;
  color: string;
  iconName: string;
}

export interface PlannedTask {
  id: string;
  pillar: PillarKey;
  text: string;
}

export interface TaskReviewItem {
  id: string;
  status: TaskStatus;
  excuse: string;
  excuseOther: string;
  focusShift: string;
  rating: number;
  comment: string;
  consequenceShort: string;
  consequenceMedium: string;
  consequenceLong: string;
}

export interface DayEntry {
  date: string; // YYYY-MM-DD
  dayNotes: string;
  plan: PlannedTask[];
  review: TaskReviewItem[];
  nextPlan: PlannedTask[];
  closed: boolean;
  closedAt?: string;
}

export interface HistoryStats {
  totalDays: number;
  closedDays: number;
  currentStreak: number;
  bestStreak: number;
  completionRate: number;
  totalTasks: number;
  doneTasks: number;
  partialTasks: number;
  notDoneTasks: number;
}
