import React, { useState, useEffect } from 'react';
import { Exercise } from '../types';
import { MUSCLE_MAP, EQUIPMENT_MAP, LEVEL_MAP } from '../data/translations';

interface Props {
  exercise: Exercise;
  onSelect: (exercise: Exercise) => void;
  onAddToWorkout?: (exercise: Exercise) => void;
}

export default function ExerciseCard({ exercise, onSelect, onAddToWorkout }: Props) {
  const [imgIdx, setImgIdx] = useState(0);
  const [imgError, setImgError] = useState(false);

  const displayName = exercise.namePl || exercise.name;
  const hasImages = exercise.images.length > 0;

  useEffect(() => {
    if (exercise.images.length < 2) return;
    const timer = setInterval(() => {
      setImgIdx(prev => (prev + 1) % exercise.images.length);
    }, 1200);
    return () => clearInterval(timer);
  }, [exercise.images.length]);

  const levelColor: Record<string, string> = {
    beginner: 'text-green-400',
    intermediate: 'text-yellow-400',
    expert: 'text-red-400',
  };

  return (
    <div
      className="bg-gray-800 rounded-2xl overflow-hidden hover:bg-gray-750 transition-colors cursor-pointer border border-gray-700 hover:border-orange-500/50"
      onClick={() => onSelect(exercise)}
    >
      {/* Animation area */}
      <div className="relative bg-gray-900 h-44 flex items-center justify-center overflow-hidden">
        {hasImages && !imgError ? (
          <>
            {exercise.images.map((src, i) => (
              <img
                key={src}
                src={src}
                alt={displayName}
                onError={() => setImgError(true)}
                className="absolute inset-0 w-full h-full object-contain p-2 transition-opacity duration-700"
                style={{ opacity: i === imgIdx ? 1 : 0 }}
              />
            ))}
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 text-gray-600">
            <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
            </svg>
            <span className="text-xs">Brak animacji</span>
          </div>
        )}
        {/* Level badge */}
        <span className={`absolute top-2 right-2 text-xs font-bold px-2 py-0.5 rounded-full bg-gray-800/80 ${levelColor[exercise.level]}`}>
          {LEVEL_MAP[exercise.level] ?? exercise.level}
        </span>
      </div>

      <div className="p-3">
        <h3 className="text-white font-semibold text-sm leading-tight line-clamp-2 mb-1">
          {displayName}
        </h3>
        {exercise.namePl && (
          <p className="text-gray-500 text-xs mb-2">{exercise.name}</p>
        )}
        <div className="flex flex-wrap gap-1 mb-2">
          {exercise.primaryMuscles.slice(0, 2).map(m => (
            <span key={m} className="text-xs bg-orange-500/20 text-orange-300 px-2 py-0.5 rounded-full">
              {MUSCLE_MAP[m] ?? m}
            </span>
          ))}
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">
            {EQUIPMENT_MAP[exercise.equipment ?? ''] ?? exercise.equipment ?? '—'}
          </span>
          {onAddToWorkout && (
            <button
              onClick={e => { e.stopPropagation(); onAddToWorkout(exercise); }}
              className="text-xs bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded-lg transition-colors font-semibold"
            >
              + Dodaj
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
