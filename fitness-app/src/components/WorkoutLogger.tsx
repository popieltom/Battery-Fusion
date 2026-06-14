import React, { useState, useEffect } from 'react';
import { WorkoutExercise, WorkoutSet, Exercise, Workout } from '../types';
import { MUSCLE_MAP } from '../data/translations';

interface Props {
  exercises: WorkoutExercise[];
  onUpdate: (exercises: WorkoutExercise[]) => void;
  onFinish: (workout: Workout) => void;
  onDiscard: () => void;
  startTime: number;
}

function Timer({ startTime }: { startTime: number }) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - startTime) / 1000)), 1000);
    return () => clearInterval(t);
  }, [startTime]);
  const h = Math.floor(elapsed / 3600);
  const m = Math.floor((elapsed % 3600) / 60);
  const s = elapsed % 60;
  return (
    <span className="font-mono text-orange-400">
      {h > 0 ? `${h}:` : ''}{String(m).padStart(2, '0')}:{String(s).padStart(2, '0')}
    </span>
  );
}

export default function WorkoutLogger({ exercises, onUpdate, onFinish, onDiscard, startTime }: Props) {
  const [restTimer, setRestTimer] = useState<number | null>(null);
  const [restSeconds, setRestSeconds] = useState(0);

  useEffect(() => {
    if (restTimer === null) return;
    const t = setInterval(() => {
      setRestSeconds(prev => {
        if (prev <= 1) { clearInterval(t); setRestTimer(null); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [restTimer]);

  function startRest(seconds: number) {
    setRestTimer(seconds);
    setRestSeconds(seconds);
  }

  function addSet(exIdx: number) {
    const updated = [...exercises];
    const ex = { ...updated[exIdx] };
    const lastSet = ex.sets[ex.sets.length - 1];
    ex.sets = [...ex.sets, { reps: lastSet?.reps ?? 10, weight: lastSet?.weight ?? 0, completed: false }];
    updated[exIdx] = ex;
    onUpdate(updated);
  }

  function removeSet(exIdx: number, setIdx: number) {
    const updated = [...exercises];
    const ex = { ...updated[exIdx] };
    ex.sets = ex.sets.filter((_, i) => i !== setIdx);
    updated[exIdx] = ex;
    onUpdate(updated);
  }

  function updateSet(exIdx: number, setIdx: number, field: keyof WorkoutSet, value: number | boolean) {
    const updated = [...exercises];
    const ex = { ...updated[exIdx] };
    const sets = [...ex.sets];
    sets[setIdx] = { ...sets[setIdx], [field]: value };
    ex.sets = sets;
    updated[exIdx] = ex;
    onUpdate(updated);
  }

  function toggleComplete(exIdx: number, setIdx: number) {
    const set = exercises[exIdx].sets[setIdx];
    updateSet(exIdx, setIdx, 'completed', !set.completed);
    if (!set.completed) startRest(90);
  }

  function removeExercise(exIdx: number) {
    onUpdate(exercises.filter((_, i) => i !== exIdx));
  }

  function handleFinish() {
    const workout: Workout = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      name: `Trening ${new Date().toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long' })}`,
      exercises,
      startTime,
      endTime: Date.now(),
    };
    onFinish(workout);
  }

  const totalSets = exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
  const completedSets = exercises.reduce((sum, ex) => sum + ex.sets.filter(s => s.completed).length, 0);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-gray-900/95 backdrop-blur border-b border-gray-800 px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="text-white font-bold text-lg">Aktywny trening</p>
            <p className="text-gray-400 text-sm">
              <Timer startTime={startTime} /> · {completedSets}/{totalSets} serii
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onDiscard}
              className="px-3 py-2 text-gray-400 hover:text-white text-sm border border-gray-700 rounded-xl"
            >
              Porzuć
            </button>
            <button
              onClick={handleFinish}
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold rounded-xl"
            >
              Zakończ
            </button>
          </div>
        </div>
        {/* Progress bar */}
        <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-orange-500 transition-all duration-500"
            style={{ width: `${totalSets > 0 ? (completedSets / totalSets) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* Rest timer overlay */}
      {restTimer !== null && (
        <div className="mx-4 mt-4 bg-blue-900/40 border border-blue-500/40 rounded-2xl px-4 py-3 flex items-center justify-between">
          <div>
            <p className="text-blue-300 text-sm font-semibold">Czas odpoczynku</p>
            <p className="text-blue-200 text-xs">Następna seria za chwilę</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-blue-300 font-mono text-2xl font-bold">{restSeconds}s</span>
            <button
              onClick={() => setRestTimer(null)}
              className="text-blue-400 hover:text-white text-sm"
            >
              Pomiń
            </button>
          </div>
        </div>
      )}

      {/* Exercises */}
      <div className="flex-1 px-4 py-4 space-y-4 pb-24">
        {exercises.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <p className="text-lg mb-2">Brak ćwiczeń</p>
            <p className="text-sm">Przejdź do zakładki "Mięśnie" lub "Ćwiczenia", aby dodać</p>
          </div>
        ) : (
          exercises.map((we, exIdx) => (
            <div key={exIdx} className="bg-gray-800 rounded-2xl overflow-hidden">
              {/* Exercise header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
                <div>
                  <p className="text-white font-semibold text-sm">
                    {we.exercise.namePl || we.exercise.name}
                  </p>
                  <p className="text-gray-500 text-xs">
                    {we.exercise.primaryMuscles.map(m => MUSCLE_MAP[m] ?? m).join(', ')}
                  </p>
                </div>
                <button
                  onClick={() => removeExercise(exIdx)}
                  className="text-gray-600 hover:text-red-400 p-1 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Sets header */}
              <div className="grid grid-cols-[40px_1fr_1fr_48px] gap-2 px-4 py-2 text-gray-500 text-xs font-semibold uppercase tracking-wider">
                <span>Seria</span>
                <span className="text-center">Ciężar (kg)</span>
                <span className="text-center">Powtórzenia</span>
                <span />
              </div>

              {/* Sets */}
              <div className="space-y-1 px-3 pb-3">
                {we.sets.map((set, setIdx) => (
                  <div
                    key={setIdx}
                    className={`grid grid-cols-[40px_1fr_1fr_48px] gap-2 items-center rounded-xl px-1 py-1 transition-colors ${
                      set.completed ? 'bg-green-500/10' : ''
                    }`}
                  >
                    <button
                      onClick={() => toggleComplete(exIdx, setIdx)}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold transition-all ${
                        set.completed
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                      }`}
                    >
                      {set.completed ? '✓' : setIdx + 1}
                    </button>
                    <input
                      type="number"
                      value={set.weight}
                      onChange={e => updateSet(exIdx, setIdx, 'weight', parseFloat(e.target.value) || 0)}
                      min="0"
                      step="0.5"
                      className={`bg-gray-700 text-white text-center rounded-lg py-2 text-sm outline-none border-2 transition-colors ${
                        set.completed ? 'border-green-500/40' : 'border-transparent focus:border-orange-500'
                      }`}
                    />
                    <input
                      type="number"
                      value={set.reps}
                      onChange={e => updateSet(exIdx, setIdx, 'reps', parseInt(e.target.value) || 0)}
                      min="0"
                      className={`bg-gray-700 text-white text-center rounded-lg py-2 text-sm outline-none border-2 transition-colors ${
                        set.completed ? 'border-green-500/40' : 'border-transparent focus:border-orange-500'
                      }`}
                    />
                    <button
                      onClick={() => removeSet(exIdx, setIdx)}
                      className="w-10 h-10 flex items-center justify-center text-gray-600 hover:text-red-400 transition-colors"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>

              <button
                onClick={() => addSet(exIdx)}
                className="w-full py-2.5 text-orange-400 hover:text-orange-300 text-sm font-semibold transition-colors border-t border-gray-700"
              >
                + Dodaj serię
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
