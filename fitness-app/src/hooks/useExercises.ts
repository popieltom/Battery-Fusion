import { useState, useEffect } from 'react';
import { Exercise } from '../types';
import { POLISH_NAMES } from '../data/translations';

const CACHE_KEY = 'fitpl_exercises_cache';
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours
const API_URL = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json';
const IMG_BASE = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/';

function applyPolishNames(exercises: Exercise[]): Exercise[] {
  return exercises.map(ex => ({
    ...ex,
    namePl: POLISH_NAMES[ex.name] || undefined,
    images: ex.images.map(img => IMG_BASE + img),
  }));
}

export function useExercises() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      try {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_TTL) {
          setExercises(applyPolishNames(data));
          setLoading(false);
          return;
        }
      } catch {
        // ignore cache errors
      }
    }

    fetch(API_URL)
      .then(r => {
        if (!r.ok) throw new Error('Nie udało się pobrać ćwiczeń');
        return r.json();
      })
      .then((data: Exercise[]) => {
        localStorage.setItem(CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }));
        setExercises(applyPolishNames(data));
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return { exercises, loading, error };
}
