import React, { useState } from 'react';
import { Tab, WorkoutExercise, Exercise, Workout } from './types';
import { useExercises } from './hooks/useExercises';
import { useLocalStorage } from './hooks/useLocalStorage';
import MuscleMap from './components/MuscleMap';
import ExerciseList from './components/ExerciseList';
import WorkoutLogger from './components/WorkoutLogger';
import WorkoutHistory from './components/WorkoutHistory';

const NAV_ITEMS: { id: Tab; label: string; icon: string }[] = [
  { id: 'muscles', label: 'Mięśnie', icon: '💪' },
  { id: 'exercises', label: 'Ćwiczenia', icon: '🏋️' },
  { id: 'workout', label: 'Trening', icon: '▶' },
  { id: 'history', label: 'Historia', icon: '📋' },
];

export default function App() {
  const [tab, setTab] = useState<Tab>('muscles');
  const [selectedMuscle, setSelectedMuscle] = useState<string | null>(null);
  const [workoutExercises, setWorkoutExercises] = useState<WorkoutExercise[]>([]);
  const [workoutStartTime, setWorkoutStartTime] = useState<number>(Date.now());
  const [workouts, setWorkouts] = useLocalStorage<Workout[]>('fitpl_workouts', []);

  const { exercises, loading, error } = useExercises();

  function handleMuscleSelect(muscle: string | null) {
    setSelectedMuscle(muscle);
    if (muscle) setTab('exercises');
  }

  function handleAddToWorkout(exercise: Exercise) {
    setWorkoutExercises(prev => {
      if (prev.find(we => we.exercise.id === exercise.id)) return prev;
      return [...prev, {
        exercise,
        sets: [{ reps: 10, weight: 0, completed: false }],
        notes: '',
      }];
    });
    setTab('workout');
  }

  function handleFinishWorkout(workout: Workout) {
    setWorkouts(prev => [...prev, workout]);
    setWorkoutExercises([]);
    setWorkoutStartTime(Date.now());
    setTab('history');
  }

  function handleDiscardWorkout() {
    if (workoutExercises.length > 0 && !confirm('Porzucić trening? Postęp zostanie utracony.')) return;
    setWorkoutExercises([]);
    setWorkoutStartTime(Date.now());
    setTab('muscles');
  }

  function handleDeleteWorkout(id: string) {
    setWorkouts(prev => prev.filter(w => w.id !== id));
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col max-w-md mx-auto relative">
      {/* Content */}
      <main className="flex-1 overflow-y-auto pb-20">
        {tab === 'muscles' && (
          <div className="flex flex-col">
            <div className="px-4 pt-6 pb-2">
              <h1 className="text-2xl font-bold text-white">FitPL</h1>
              <p className="text-gray-400 text-sm">Twój trener siłowy</p>
            </div>
            <div className="px-4 py-4">
              <MuscleMap
                selectedMuscle={selectedMuscle}
                onMuscleSelect={handleMuscleSelect}
              />
            </div>

            {/* Quick stats */}
            <div className="px-4 py-2 grid grid-cols-2 gap-3">
              <div className="bg-gray-800 rounded-2xl p-4">
                <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Treningi</p>
                <p className="text-white text-2xl font-bold">{workouts.length}</p>
              </div>
              <div className="bg-gray-800 rounded-2xl p-4">
                <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Aktywny trening</p>
                <p className={`text-2xl font-bold ${workoutExercises.length > 0 ? 'text-orange-400' : 'text-gray-600'}`}>
                  {workoutExercises.length} ćw.
                </p>
              </div>
            </div>
          </div>
        )}

        {tab === 'exercises' && (
          <div>
            <div className="px-4 pt-6 pb-4 flex items-center gap-3">
              <h2 className="text-xl font-bold text-white flex-1">Ćwiczenia</h2>
              {selectedMuscle && (
                <button
                  onClick={() => setSelectedMuscle(null)}
                  className="text-xs text-gray-400 hover:text-white"
                >
                  Wyczyść filtr
                </button>
              )}
            </div>
            <ExerciseList
              exercises={exercises}
              loading={loading}
              error={error}
              filterMuscle={selectedMuscle}
              onAddToWorkout={handleAddToWorkout}
            />
          </div>
        )}

        {tab === 'workout' && (
          workoutExercises.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-screen gap-4 px-6 text-center">
              <span className="text-6xl">🏋️</span>
              <h2 className="text-xl font-bold text-white">Zacznij trening</h2>
              <p className="text-gray-400 text-sm">
                Przejdź do zakładki <span className="text-orange-400 font-semibold">Mięśnie</span> lub{' '}
                <span className="text-orange-400 font-semibold">Ćwiczenia</span>, aby dodać ćwiczenia
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setTab('muscles')}
                  className="px-5 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-2xl transition-colors"
                >
                  💪 Mapa mięśni
                </button>
                <button
                  onClick={() => setTab('exercises')}
                  className="px-5 py-3 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-2xl transition-colors"
                >
                  🏋️ Ćwiczenia
                </button>
              </div>
            </div>
          ) : (
            <WorkoutLogger
              exercises={workoutExercises}
              onUpdate={setWorkoutExercises}
              onFinish={handleFinishWorkout}
              onDiscard={handleDiscardWorkout}
              startTime={workoutStartTime}
            />
          )
        )}

        {tab === 'history' && (
          <div>
            <div className="px-4 pt-6 pb-4">
              <h2 className="text-xl font-bold text-white">Historia</h2>
            </div>
            <WorkoutHistory workouts={workouts} onDelete={handleDeleteWorkout} />
          </div>
        )}
      </main>

      {/* Bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-gray-900/95 backdrop-blur border-t border-gray-800 safe-area-bottom">
        <div className="flex">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`flex-1 flex flex-col items-center gap-1 py-3 transition-colors relative ${
                tab === item.id ? 'text-orange-400' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {item.id === 'workout' && workoutExercises.length > 0 && (
                <span className="absolute top-2 right-[calc(50%-16px)] bg-orange-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                  {workoutExercises.length}
                </span>
              )}
              <span className="text-lg leading-none">{item.icon}</span>
              <span className="text-[10px] font-semibold">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
