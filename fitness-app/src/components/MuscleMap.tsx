import React, { useState } from 'react';
import { MUSCLE_MAP } from '../data/translations';

interface Props {
  selectedMuscle: string | null;
  onMuscleSelect: (muscle: string | null) => void;
}

type View = 'front' | 'back';

interface Region {
  muscleId: string;
  shape: 'ellipse' | 'path' | 'rect';
  props: Record<string, string | number>;
}

const BODY_COLOR = '#374151';
const BODY_STROKE = '#4b5563';

const FRONT_REGIONS: Region[] = [
  // Chest
  { muscleId: 'chest', shape: 'path', props: { d: 'M72 95 Q80 88 98 90 Q108 92 112 108 Q114 124 106 133 Q95 140 82 133 Q68 122 72 95 Z' } },
  { muscleId: 'chest', shape: 'path', props: { d: 'M148 95 Q140 88 122 90 Q112 92 108 108 Q106 124 114 133 Q125 140 138 133 Q152 122 148 95 Z' } },
  // Front shoulders
  { muscleId: 'shoulders', shape: 'ellipse', props: { cx: 52, cy: 92, rx: 18, ry: 14 } },
  { muscleId: 'shoulders', shape: 'ellipse', props: { cx: 168, cy: 92, rx: 18, ry: 14 } },
  // Biceps
  { muscleId: 'biceps', shape: 'ellipse', props: { cx: 44, cy: 128, rx: 10, ry: 23 } },
  { muscleId: 'biceps', shape: 'ellipse', props: { cx: 176, cy: 128, rx: 10, ry: 23 } },
  // Forearms
  { muscleId: 'forearms', shape: 'ellipse', props: { cx: 46, cy: 210, rx: 9, ry: 28 } },
  { muscleId: 'forearms', shape: 'ellipse', props: { cx: 174, cy: 210, rx: 9, ry: 28 } },
  // Abs - 6 cells
  { muscleId: 'abdominals', shape: 'rect', props: { x: 95, y: 140, width: 18, height: 16, rx: 4 } },
  { muscleId: 'abdominals', shape: 'rect', props: { x: 117, y: 140, width: 18, height: 16, rx: 4 } },
  { muscleId: 'abdominals', shape: 'rect', props: { x: 95, y: 160, width: 18, height: 16, rx: 4 } },
  { muscleId: 'abdominals', shape: 'rect', props: { x: 117, y: 160, width: 18, height: 16, rx: 4 } },
  { muscleId: 'abdominals', shape: 'rect', props: { x: 95, y: 180, width: 18, height: 16, rx: 4 } },
  { muscleId: 'abdominals', shape: 'rect', props: { x: 117, y: 180, width: 18, height: 16, rx: 4 } },
  // Obliques
  { muscleId: 'abdominals', shape: 'ellipse', props: { cx: 76, cy: 168, rx: 9, ry: 24 } },
  { muscleId: 'abdominals', shape: 'ellipse', props: { cx: 154, cy: 168, rx: 9, ry: 24 } },
  // Quadriceps
  { muscleId: 'quadriceps', shape: 'ellipse', props: { cx: 82, cy: 300, rx: 19, ry: 55 } },
  { muscleId: 'quadriceps', shape: 'ellipse', props: { cx: 138, cy: 300, rx: 19, ry: 55 } },
  // Calves (front/tibialis)
  { muscleId: 'calves', shape: 'ellipse', props: { cx: 82, cy: 415, rx: 13, ry: 32 } },
  { muscleId: 'calves', shape: 'ellipse', props: { cx: 138, cy: 415, rx: 13, ry: 32 } },
];

const BACK_REGIONS: Region[] = [
  // Trapezius - diamond shape
  { muscleId: 'traps', shape: 'path', props: { d: 'M80 86 L110 78 L140 86 L136 142 L110 148 L84 142 Z' } },
  // Rear shoulders
  { muscleId: 'shoulders', shape: 'ellipse', props: { cx: 52, cy: 92, rx: 18, ry: 14 } },
  { muscleId: 'shoulders', shape: 'ellipse', props: { cx: 168, cy: 92, rx: 18, ry: 14 } },
  // Lats
  { muscleId: 'lats', shape: 'path', props: { d: 'M65 95 Q50 115 48 145 Q46 172 52 202 Q58 215 70 222 Q72 205 68 178 Q66 152 70 128 Q72 110 65 95 Z' } },
  { muscleId: 'lats', shape: 'path', props: { d: 'M155 95 Q170 115 172 145 Q174 172 168 202 Q162 215 150 222 Q148 205 152 178 Q154 152 150 128 Q148 110 155 95 Z' } },
  // Middle back
  { muscleId: 'middle_back', shape: 'ellipse', props: { cx: 110, cy: 122, rx: 19, ry: 16 } },
  // Triceps
  { muscleId: 'triceps', shape: 'ellipse', props: { cx: 42, cy: 132, rx: 11, ry: 24 } },
  { muscleId: 'triceps', shape: 'ellipse', props: { cx: 178, cy: 132, rx: 11, ry: 24 } },
  // Lower back
  { muscleId: 'lower_back', shape: 'ellipse', props: { cx: 96, cy: 190, rx: 12, ry: 22 } },
  { muscleId: 'lower_back', shape: 'ellipse', props: { cx: 124, cy: 190, rx: 12, ry: 22 } },
  // Glutes
  { muscleId: 'glutes', shape: 'ellipse', props: { cx: 86, cy: 230, rx: 24, ry: 20 } },
  { muscleId: 'glutes', shape: 'ellipse', props: { cx: 134, cy: 230, rx: 24, ry: 20 } },
  // Hamstrings
  { muscleId: 'hamstrings', shape: 'ellipse', props: { cx: 82, cy: 300, rx: 19, ry: 55 } },
  { muscleId: 'hamstrings', shape: 'ellipse', props: { cx: 138, cy: 300, rx: 19, ry: 55 } },
  // Calves (gastrocnemius)
  { muscleId: 'calves', shape: 'ellipse', props: { cx: 82, cy: 412, rx: 16, ry: 40 } },
  { muscleId: 'calves', shape: 'ellipse', props: { cx: 138, cy: 412, rx: 16, ry: 40 } },
];

function BodySilhouette() {
  return (
    <g fill={BODY_COLOR} stroke={BODY_STROKE} strokeWidth="1">
      {/* Head */}
      <ellipse cx="110" cy="35" rx="24" ry="26" />
      {/* Neck */}
      <path d="M103 59 L117 59 L115 82 L105 82 Z" />
      {/* Torso */}
      <path d="M62 86 L158 86 L154 208 L140 228 L80 228 L66 208 Z" />
      {/* Left shoulder cap */}
      <ellipse cx="55" cy="90" rx="20" ry="14" />
      {/* Right shoulder cap */}
      <ellipse cx="165" cy="90" rx="20" ry="14" />
      {/* Left upper arm */}
      <rect x="38" y="84" width="28" height="96" rx="14" />
      {/* Right upper arm */}
      <rect x="154" y="84" width="28" height="96" rx="14" />
      {/* Left forearm */}
      <rect x="40" y="178" width="24" height="82" rx="12" />
      {/* Right forearm */}
      <rect x="156" y="178" width="24" height="82" rx="12" />
      {/* Left thigh */}
      <rect x="62" y="225" width="44" height="125" rx="14" />
      {/* Right thigh */}
      <rect x="114" y="225" width="44" height="125" rx="14" />
      {/* Left calf */}
      <rect x="66" y="346" width="36" height="125" rx="12" />
      {/* Right calf */}
      <rect x="118" y="346" width="36" height="125" rx="12" />
    </g>
  );
}

export default function MuscleMap({ selectedMuscle, onMuscleSelect }: Props) {
  const [view, setView] = useState<View>('front');
  const [hovered, setHovered] = useState<string | null>(null);

  const regions = view === 'front' ? FRONT_REGIONS : BACK_REGIONS;

  function getMuscleColor(muscleId: string) {
    const isSelected = selectedMuscle === muscleId;
    const isHovered = hovered === muscleId;
    if (isSelected) return 'rgba(249,115,22,0.85)';
    if (isHovered) return 'rgba(249,115,22,0.5)';
    return 'rgba(239,68,68,0.25)';
  }

  function renderShape(region: Region, idx: number) {
    const color = getMuscleColor(region.muscleId);
    const common = {
      key: idx,
      fill: color,
      stroke: selectedMuscle === region.muscleId ? '#f97316' : 'none',
      strokeWidth: 1.5,
      style: { cursor: 'pointer', transition: 'fill 0.2s' },
      onClick: () => onMuscleSelect(selectedMuscle === region.muscleId ? null : region.muscleId),
      onMouseEnter: () => setHovered(region.muscleId),
      onMouseLeave: () => setHovered(null),
    };

    if (region.shape === 'ellipse') {
      const { cx, cy, rx, ry } = region.props as { cx: number; cy: number; rx: number; ry: number };
      return <ellipse {...common} cx={cx} cy={cy} rx={rx} ry={ry} />;
    }
    if (region.shape === 'rect') {
      const { x, y, width, height, rx: rr } = region.props as {
        x: number; y: number; width: number; height: number; rx: number;
      };
      return <rect {...common} x={x} y={y} width={width} height={height} rx={rr} />;
    }
    return <path {...common} d={region.props.d as string} />;
  }

  const activeMuscle = hovered || selectedMuscle;

  return (
    <div className="flex flex-col items-center gap-4">
      {/* View toggle */}
      <div className="flex bg-gray-800 rounded-xl p-1 gap-1">
        {(['front', 'back'] as View[]).map(v => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${
              view === v
                ? 'bg-orange-500 text-white shadow-lg'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {v === 'front' ? 'Przód' : 'Tył'}
          </button>
        ))}
      </div>

      {/* Muscle label */}
      <div className="h-7 flex items-center">
        {activeMuscle ? (
          <span className="text-orange-400 font-semibold text-base">
            {MUSCLE_MAP[activeMuscle] ?? activeMuscle}
          </span>
        ) : (
          <span className="text-gray-500 text-sm">Kliknij mięsień, aby zobaczyć ćwiczenia</span>
        )}
      </div>

      {/* SVG body */}
      <div className="relative">
        <svg
          viewBox="0 0 220 490"
          className="w-56 h-auto select-none"
          style={{ filter: 'drop-shadow(0 0 12px rgba(249,115,22,0.15))' }}
        >
          <BodySilhouette />
          {regions.map((region, idx) => renderShape(region, idx))}
        </svg>
      </div>

      {/* Clear selection */}
      {selectedMuscle && (
        <button
          onClick={() => onMuscleSelect(null)}
          className="text-xs text-gray-500 hover:text-gray-300 underline"
        >
          Wyczyść wybór
        </button>
      )}
    </div>
  );
}
