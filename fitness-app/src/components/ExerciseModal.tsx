import React, { useState, useEffect } from 'react';
import { Exercise } from '../types';
import { MUSCLE_MAP, EQUIPMENT_MAP, LEVEL_MAP, CATEGORY_MAP } from '../data/translations';

interface Props {
  exercise: Exercise;
  onClose: () => void;
  onAddToWorkout?: (exercise: Exercise) => void;
}

export default function ExerciseModal({ exercise, onClose, onAddToWorkout }: Props) {
  const [imgIdx, setImgIdx] = useState(0);
  const [imgError, setImgError] = useState(false);
  const [added, setAdded] = useState(false);

  const displayName = exercise.namePl || exercise.name;

  useEffect(() => {
    if (exercise.images.length < 2) return;
    const timer = setInterval(() => {
      setImgIdx(prev => (prev + 1) % exercise.images.length);
    }, 1000);
    return () => clearInterval(timer);
  }, [exercise.images.length]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  function handleAdd() {
    onAddToWorkout?.(exercise);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  const levelColor: Record<string, string> = {
    beginner: 'bg-green-500/20 text-green-400',
    intermediate: 'bg-yellow-500/20 text-yellow-400',
    expert: 'bg-red-500/20 text-red-400',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-gray-900 rounded-t-3xl sm:rounded-3xl w-full sm:max-w-lg max-h-[90vh] overflow-y-auto border border-gray-700"
        onClick={e => e.stopPropagation()}
      >
        {/* Animation header */}
        <div className="relative bg-gray-950 h-64 flex items-center justify-center overflow-hidden rounded-t-3xl sm:rounded-t-3xl">
          {exercise.images.length > 0 && !imgError ? (
            exercise.images.map((src, i) => (
              <img
                key={src}
                src={src}
                alt={displayName}
                onError={() => setImgError(true)}
                className="absolute inset-0 w-full h-full object-contain p-4 transition-opacity duration-700"
                style={{ opacity: i === imgIdx ? 1 : 0 }}
              />
            ))
          ) : (
            <div className="text-gray-600 text-sm">Brak animacji</div>
          )}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-gray-800/80 hover:bg-gray-700 text-white w-8 h-8 rounded-full flex items-center justify-center"
          >
            ✕
          </button>
          {/* Image dots indicator */}
          {exercise.images.length > 1 && (
            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1">
              {exercise.images.map((_, i) => (
                <div
                  key={i}
                  className={`w-1.5 h-1.5 rounded-full transition-colors ${i === imgIdx ? 'bg-orange-500' : 'bg-gray-600'}`}
                />
              ))}
            </div>
          )}
        </div>

        <div className="p-6 space-y-4">
          <div>
            <h2 className="text-white text-xl font-bold">{displayName}</h2>
            {exercise.namePl && <p className="text-gray-500 text-sm mt-0.5">{exercise.name}</p>}
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${levelColor[exercise.level]}`}>
              {LEVEL_MAP[exercise.level]}
            </span>
            {exercise.equipment && (
              <span className="text-xs bg-gray-800 text-gray-300 px-3 py-1 rounded-full">
                {EQUIPMENT_MAP[exercise.equipment] ?? exercise.equipment}
              </span>
            )}
            {exercise.category && (
              <span className="text-xs bg-gray-800 text-gray-400 px-3 py-1 rounded-full">
                {CATEGORY_MAP[exercise.category] ?? exercise.category}
              </span>
            )}
          </div>

          {/* Muscles */}
          <div>
            <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Główne mięśnie</p>
            <div className="flex flex-wrap gap-1.5">
              {exercise.primaryMuscles.map(m => (
                <span key={m} className="text-sm bg-orange-500/20 text-orange-300 px-3 py-1 rounded-full">
                  {MUSCLE_MAP[m] ?? m}
                </span>
              ))}
            </div>
          </div>

          {exercise.secondaryMuscles.length > 0 && (
            <div>
              <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Mięśnie pomocnicze</p>
              <div className="flex flex-wrap gap-1.5">
                {exercise.secondaryMuscles.map(m => (
                  <span key={m} className="text-sm bg-gray-700 text-gray-300 px-3 py-1 rounded-full">
                    {MUSCLE_MAP[m] ?? m}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Instructions */}
          {exercise.instructions.length > 0 && (
            <div>
              <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3">Instrukcja</p>
              <ol className="space-y-2.5">
                {exercise.instructions.map((step, i) => (
                  <li key={i} className="flex gap-3 text-sm text-gray-300 leading-relaxed">
                    <span className="flex-shrink-0 w-6 h-6 bg-orange-500/20 text-orange-400 rounded-full flex items-center justify-center text-xs font-bold">
                      {i + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Add to workout button */}
          {onAddToWorkout && (
            <button
              onClick={handleAdd}
              className={`w-full py-4 rounded-2xl text-white font-bold text-base transition-all ${
                added
                  ? 'bg-green-600 scale-95'
                  : 'bg-orange-500 hover:bg-orange-600 active:scale-95'
              }`}
            >
              {added ? '✓ Dodano do treningu!' : '+ Dodaj do treningu'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
