
export interface SubTask {
  n: string; // name
  s?: string; // start time/date
  e?: string; // end time/date
  done: boolean;
  subs?: SubTask[]; // Recursive subtasks
}

export interface TaskItem {
  s: string; // start time
  e: string; // end time
  n: string; // name
  c: 'work' | 'health' | 'beauty'; // category
}

export interface Project {
  name: string;
  cat: string;
  start: string;
  end: string;
  subs: SubTask[];
}

export interface GoalSub {
  n: string;
  s?: string;
  e?: string;
  done: boolean;
  subs?: GoalSub[];
}

export interface Goal {
  name: string;
  start?: string;
  end?: string;
  subs: GoalSub[];
}

export interface GoalCollection {
  health: Goal[];
  beauty: Goal[];
  work: Goal[];
}

export interface WeekFloatTask {
  n: string;
  done: boolean;
}

export interface HistoryEntry {
  date: string;
  pc: string; // percentage
  note: string;
  details?: {
    work: number;
    health: number;
    beauty: number;
  };
}

export interface Note {
  id: string;
  title: string;
  content: string;
  date: string;
}

export interface AppData {
  projects: Project[];
  goals: GoalCollection;
  daySubTasks: Record<string, SubTask[]>;
  dayChecks: Record<string, boolean>;
  weekFloat: Record<number, WeekFloatTask[]>;
  history: HistoryEntry[];
  quotes: string[];
  notes: Note[];
}
