import React, { useState } from 'react';
import { Workout } from '../types';
import { MUSCLE_MAP } from '../data/translations';

interface Props {
  workouts: Workout[];
  onDelete: (id: string) => void;
}

function duration(w: Workout): string {
  if (!w.endTime) return '—';
  const s = Math.floor((w.endTime - w.startTime) / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  if (h > 0) return `${h}h ${m % 60}min`;
  return `${m}min`;
}

function totalVolume(w: Workout): string {
  const vol = w.exercises.reduce((sum, ex) =>
    sum + ex.sets.reduce((s2, set) => s2 + (set.weight * set.reps), 0), 0);
  if (vol === 0) return '—';
  return `${vol.toLocaleString('pl-PL')} kg`;
}

export default function WorkoutHistory({ workouts, onDelete }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null);

  if (workouts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-center px-6">
        <span className="text-5xl">📋</span>
        <p className="text-white font-semibold text-lg">Brak historii treningów</p>
        <p className="text-gray-400 text-sm">Zakończ swój pierwszy trening, a pojawi się tutaj</p>
      </div>
    );
  }

  return (
    <div className="px-4 py-4 space-y-3 pb-24">
      {[...workouts].reverse().map(workout => {
        const isOpen = expanded === workout.id;
        const totalSets = workout.exercises.reduce((s, ex) => s + ex.sets.length, 0);
        const completedSets = workout.exercises.reduce((s, ex) => s + ex.sets.filter(set => set.completed).length, 0);

        return (
          <div key={workout.id} className="bg-gray-800 rounded-2xl overflow-hidden border border-gray-700">
            <button
              className="w-full px-4 py-4 text-left flex items-start justify-between gap-3"
              onClick={() => setExpanded(isOpen ? null : workout.id)}
            >
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-sm leading-tight">{workout.name}</p>
                <p className="text-gray-400 text-xs mt-0.5">
                  {new Date(workout.date).toLocaleDateString('pl-PL', {
                    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                  })}
                </p>
                <div className="flex gap-3 mt-2 flex-wrap">
                  <span className="text-xs text-gray-500">⏱ {duration(workout)}</span>
                  <span className="text-xs text-gray-500">🏋️ {workout.exercises.length} ćw.</span>
                  <span className="text-xs text-gray-500">✓ {completedSets}/{totalSets} serii</span>
                  <span className="text-xs text-gray-500">📊 {totalVolume(workout)}</span>
                </div>
              </div>
              <span className={`text-gray-500 transition-transform mt-1 ${isOpen ? 'rotate-180' : ''}`}>▾</span>
            </button>

            {isOpen && (
              <div className="border-t border-gray-700 px-4 py-3 space-y-3">
                {workout.exercises.map((we, i) => (
                  <div key={i}>
                    <p className="text-white text-sm font-semibold mb-1">
                      {we.exercise.namePl || we.exercise.name}
                    </p>
                    <div className="grid grid-cols-[auto_1fr_1fr] gap-x-4 gap-y-1 text-xs text-gray-400">
                      <span className="font-semibold text-gray-500">Seria</span>
                      <span className="font-semibold text-gray-500">Ciężar</span>
                      <span className="font-semibold text-gray-500">Powt.</span>
                      {we.sets.map((set, si) => (
                        <React.Fragment key={si}>
                          <span className={set.completed ? 'text-green-400' : 'text-gray-600'}>
                            {si + 1}
                          </span>
                          <span className={set.completed ? 'text-white' : 'text-gray-600'}>
                            {set.weight > 0 ? `${set.weight} kg` : '—'}
                          </span>
                          <span className={set.completed ? 'text-white' : 'text-gray-600'}>
                            {set.reps}
                          </span>
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                ))}
                <button
                  onClick={() => {
                    if (confirm('Usunąć ten trening?')) onDelete(workout.id);
                  }}
                  className="text-xs text-red-400 hover:text-red-300 mt-2"
                >
                  Usuń trening
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
