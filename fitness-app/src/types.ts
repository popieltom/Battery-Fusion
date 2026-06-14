export interface Exercise {
  id: string;
  name: string;
  namePl?: string;
  force: string | null;
  level: 'beginner' | 'intermediate' | 'expert';
  mechanic: string | null;
  equipment: string | null;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  instructions: string[];
  category: string;
  images: string[];
}

export interface WorkoutSet {
  reps: number;
  weight: number;
  completed: boolean;
}

export interface WorkoutExercise {
  exercise: Exercise;
  sets: WorkoutSet[];
  notes: string;
}

export interface Workout {
  id: string;
  date: string;
  name: string;
  exercises: WorkoutExercise[];
  startTime: number;
  endTime?: number;
}

export type Tab = 'muscles' | 'exercises' | 'workout' | 'history';
