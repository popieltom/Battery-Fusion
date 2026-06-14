import React, { useState, useMemo } from 'react';
import { Exercise } from '../types';
import { MUSCLE_MAP, EQUIPMENT_MAP } from '../data/translations';
import ExerciseCard from './ExerciseCard';
import ExerciseModal from './ExerciseModal';

interface Props {
  exercises: Exercise[];
  loading: boolean;
  error: string | null;
  filterMuscle?: string | null;
  onAddToWorkout?: (exercise: Exercise) => void;
}

const EQUIPMENTS = ['barbell', 'dumbbell', 'body only', 'cable', 'machine', 'kettlebells', 'bands'];

export default function ExerciseList({ exercises, loading, error, filterMuscle, onAddToWorkout }: Props) {
  const [search, setSearch] = useState('');
  const [equipment, setEquipment] = useState('');
  const [selected, setSelected] = useState<Exercise | null>(null);

  const filtered = useMemo(() => {
    let list = exercises;
    if (filterMuscle) {
      list = list.filter(ex =>
        ex.primaryMuscles.includes(filterMuscle) ||
        ex.secondaryMuscles.includes(filterMuscle)
      );
    }
    if (equipment) {
      list = list.filter(ex => ex.equipment === equipment);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(ex =>
        ex.name.toLowerCase().includes(q) ||
        (ex.namePl?.toLowerCase().includes(q) ?? false)
      );
    }
    return list;
  }, [exercises, filterMuscle, equipment, search]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-400 text-sm">Ładowanie ćwiczeń…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-center px-6">
        <span className="text-4xl">⚠️</span>
        <p className="text-white font-semibold">Błąd ładowania</p>
        <p className="text-gray-400 text-sm">{error}</p>
        <p className="text-gray-500 text-xs">Sprawdź połączenie z internetem</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Filters */}
      <div className="flex flex-col gap-2 px-4">
        {filterMuscle && (
          <div className="flex items-center gap-2 bg-orange-500/20 border border-orange-500/40 rounded-xl px-3 py-2">
            <span className="text-orange-400 text-sm font-semibold">
              {MUSCLE_MAP[filterMuscle] ?? filterMuscle}
            </span>
            <span className="text-gray-400 text-xs ml-auto">{filtered.length} ćwiczeń</span>
          </div>
        )}
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Szukaj ćwiczenia…"
          className="bg-gray-800 text-white placeholder-gray-500 rounded-xl px-4 py-3 text-sm outline-none border border-gray-700 focus:border-orange-500 transition-colors"
        />
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setEquipment('')}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              !equipment ? 'bg-orange-500 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            Wszystko
          </button>
          {EQUIPMENTS.map(eq => (
            <button
              key={eq}
              onClick={() => setEquipment(equipment === eq ? '' : eq)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                equipment === eq ? 'bg-orange-500 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              {EQUIPMENT_MAP[eq] ?? eq}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="text-lg mb-1">Brak wyników</p>
          <p className="text-sm">Zmień filtry lub szukaj inaczej</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 px-4 pb-24">
          {filtered.slice(0, 60).map(ex => (
            <ExerciseCard
              key={ex.id}
              exercise={ex}
              onSelect={setSelected}
              onAddToWorkout={onAddToWorkout}
            />
          ))}
          {filtered.length > 60 && (
            <div className="col-span-2 text-center text-gray-500 text-sm py-4">
              Pokazano 60 z {filtered.length} wyników. Użyj wyszukiwania, aby zawęzić.
            </div>
          )}
        </div>
      )}

      {selected && (
        <ExerciseModal
          exercise={selected}
          onClose={() => setSelected(null)}
          onAddToWorkout={onAddToWorkout ? (ex) => { onAddToWorkout(ex); setSelected(null); } : undefined}
        />
      )}
    </div>
  );
}
