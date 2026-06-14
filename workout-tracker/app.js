'use strict';

/* ════════════════════════════════════════
   DZIENNIK TRENINGOWY – Application Logic
   ════════════════════════════════════════ */

// ── Exercise Database ──────────────────────────────────────────────────────
const EXERCISES_DB = [
  // KLATKA PIERSIOWA
  { id:'bench_barbell',       name:'Wyciskanie sztangi leżąc',         muscle:'Klatka piersiowa', type:'Siłowe' },
  { id:'bench_incline',       name:'Wyciskanie na ławce skośnej',      muscle:'Klatka piersiowa', type:'Siłowe' },
  { id:'bench_decline',       name:'Wyciskanie na ławce ujemnej',      muscle:'Klatka piersiowa', type:'Siłowe' },
  { id:'bench_dumbbell',      name:'Wyciskanie hantlami leżąc',        muscle:'Klatka piersiowa', type:'Siłowe' },
  { id:'fly_cable',           name:'Rozpiętki na wyciągu',             muscle:'Klatka piersiowa', type:'Izolacja' },
  { id:'fly_dumbbell',        name:'Rozpiętki z hantlami',             muscle:'Klatka piersiowa', type:'Izolacja' },
  { id:'pushup',              name:'Pompki',                           muscle:'Klatka piersiowa', type:'Ciało' },
  { id:'pushup_wide',         name:'Pompki szerokim chwytem',          muscle:'Klatka piersiowa', type:'Ciało' },
  { id:'dip_chest',           name:'Dipy (klatka)',                    muscle:'Klatka piersiowa', type:'Ciało' },
  { id:'crossover',           name:'Sięganie przez wyciągi (crossover)',muscle:'Klatka piersiowa', type:'Izolacja' },
  { id:'pec_deck',            name:'Motyl (pec deck)',                 muscle:'Klatka piersiowa', type:'Izolacja' },

  // PLECY
  { id:'deadlift',            name:'Martwy ciąg',                      muscle:'Plecy',            type:'Siłowe' },
  { id:'deadlift_romanian',   name:'Martwy ciąg rumuński',             muscle:'Plecy',            type:'Siłowe' },
  { id:'row_barbell',         name:'Wiosłowanie sztangą',              muscle:'Plecy',            type:'Siłowe' },
  { id:'row_dumbbell',        name:'Wiosłowanie hantlem w opadzie',    muscle:'Plecy',            type:'Siłowe' },
  { id:'row_cable',           name:'Wiosłowanie na wyciągu',           muscle:'Plecy',            type:'Siłowe' },
  { id:'row_seated',          name:'Wiosłowanie siedząc (maszyna)',     muscle:'Plecy',            type:'Siłowe' },
  { id:'pullup',              name:'Podciąganie nachwytem',            muscle:'Plecy',            type:'Ciało' },
  { id:'chinup',              name:'Podciąganie podchwytem',           muscle:'Plecy',            type:'Ciało' },
  { id:'lat_pulldown',        name:'Ściąganie drążka (lat pulldown)',  muscle:'Plecy',            type:'Siłowe' },
  { id:'pullover',            name:'Pullover z hantlem',               muscle:'Plecy',            type:'Izolacja' },
  { id:'good_morning',        name:'Dzień dobry (good morning)',       muscle:'Plecy',            type:'Siłowe' },
  { id:'hyper_extension',     name:'Hyperekstensje',                   muscle:'Plecy',            type:'Izolacja' },

  // NOGI
  { id:'squat_barbell',       name:'Przysiad ze sztangą',              muscle:'Nogi',             type:'Siłowe' },
  { id:'squat_front',         name:'Przysiad z przodu (front squat)',  muscle:'Nogi',             type:'Siłowe' },
  { id:'squat_goblet',        name:'Przysiad goblet (kettlebell)',      muscle:'Nogi',             type:'Siłowe' },
  { id:'leg_press',           name:'Wyciskanie na suwnicy',            muscle:'Nogi',             type:'Siłowe' },
  { id:'lunge',               name:'Wykroki',                          muscle:'Nogi',             type:'Siłowe' },
  { id:'lunge_walking',       name:'Wykroki w marszu',                 muscle:'Nogi',             type:'Siłowe' },
  { id:'leg_extension',       name:'Prostowanie nóg (maszyna)',        muscle:'Nogi',             type:'Izolacja' },
  { id:'leg_curl',            name:'Uginanie nóg leżąc (maszyna)',     muscle:'Nogi',             type:'Izolacja' },
  { id:'calf_raise',          name:'Wspięcia na palce',                muscle:'Nogi',             type:'Izolacja' },
  { id:'calf_seated',         name:'Wspięcia na palce siedząc',        muscle:'Nogi',             type:'Izolacja' },
  { id:'hip_thrust',          name:'Hip thrust',                       muscle:'Nogi',             type:'Siłowe' },
  { id:'glute_kickback',      name:'Odwodzenie nogi w tył',            muscle:'Nogi',             type:'Izolacja' },
  { id:'sumo_deadlift',       name:'Martwy ciąg sumo',                 muscle:'Nogi',             type:'Siłowe' },
  { id:'step_up',             name:'Wejścia na skrzynię (step-up)',    muscle:'Nogi',             type:'Siłowe' },

  // BARKI
  { id:'ohp_barbell',         name:'Wyciskanie żołnierskie (OHP)',     muscle:'Barki',            type:'Siłowe' },
  { id:'ohp_dumbbell',        name:'Wyciskanie hantli nad głową',      muscle:'Barki',            type:'Siłowe' },
  { id:'lateral_raise',       name:'Unoszenie bokiem (boczna głowa)',  muscle:'Barki',            type:'Izolacja' },
  { id:'front_raise',         name:'Unoszenie przed siebie',           muscle:'Barki',            type:'Izolacja' },
  { id:'rear_delt_fly',       name:'Rozpiętki w skłonie (tylna głowa)',muscle:'Barki',            type:'Izolacja' },
  { id:'upright_row',         name:'Wiosłowanie stojąc (upright row)', muscle:'Barki',            type:'Siłowe' },
  { id:'face_pull',           name:'Face pull na wyciągu',             muscle:'Barki',            type:'Izolacja' },
  { id:'arnold_press',        name:'Wyciskanie Arnolda',               muscle:'Barki',            type:'Siłowe' },

  // BICEPS
  { id:'curl_barbell',        name:'Uginanie ze sztangą',              muscle:'Biceps',           type:'Izolacja' },
  { id:'curl_dumbbell',       name:'Uginanie z hantlami',              muscle:'Biceps',           type:'Izolacja' },
  { id:'curl_hammer',         name:'Uginanie neutralne (hammer curl)', muscle:'Biceps',           type:'Izolacja' },
  { id:'curl_cable',          name:'Uginanie na wyciągu',              muscle:'Biceps',           type:'Izolacja' },
  { id:'curl_concentration',  name:'Uginanie koncentryczne',           muscle:'Biceps',           type:'Izolacja' },
  { id:'curl_preacher',       name:'Uginanie na modlitewniku',         muscle:'Biceps',           type:'Izolacja' },
  { id:'curl_incline',        name:'Uginanie leżąc (ławka skośna)',    muscle:'Biceps',           type:'Izolacja' },

  // TRICEPS
  { id:'tri_pushdown',        name:'Wyciskanie wyciągiem w dół',       muscle:'Triceps',          type:'Izolacja' },
  { id:'tri_overhead_cable',  name:'Prostowanie ramion nad głową',     muscle:'Triceps',          type:'Izolacja' },
  { id:'tri_extension',       name:'Prostowanie leżąc (skull crusher)',muscle:'Triceps',          type:'Izolacja' },
  { id:'tri_kickback',        name:'Odwodzenie tricepsa (kickback)',    muscle:'Triceps',          type:'Izolacja' },
  { id:'tri_dip',             name:'Dipy na ławce (triceps)',          muscle:'Triceps',          type:'Ciało' },
  { id:'tri_close_bench',     name:'Wyciskanie wąskim chwytem',        muscle:'Triceps',          type:'Siłowe' },

  // BRZUCH
  { id:'plank',               name:'Deska (plank)',                    muscle:'Brzuch',           type:'Ciało' },
  { id:'plank_side',          name:'Deska boczna',                     muscle:'Brzuch',           type:'Ciało' },
  { id:'crunch',              name:'Brzuszki',                         muscle:'Brzuch',           type:'Ciało' },
  { id:'crunch_cable',        name:'Brzuszki na wyciągu',              muscle:'Brzuch',           type:'Izolacja' },
  { id:'leg_raise',           name:'Unoszenie nóg w leżeniu',          muscle:'Brzuch',           type:'Ciało' },
  { id:'hanging_leg_raise',   name:'Unoszenie nóg w zwisie',           muscle:'Brzuch',           type:'Ciało' },
  { id:'ab_wheel',            name:'Kółko do ćwiczeń brzucha',         muscle:'Brzuch',           type:'Ciało' },
  { id:'russian_twist',       name:'Skręty rosyjskie',                 muscle:'Brzuch',           type:'Ciało' },
  { id:'mountain_climber',    name:'Wspinaczka (mountain climber)',     muscle:'Brzuch',           type:'Cardio' },
  { id:'v_up',                name:'Unoszenie nóg i tułowia (V-up)',   muscle:'Brzuch',           type:'Ciało' },

  // CARDIO
  { id:'run_treadmill',       name:'Bieganie (bieżnia)',               muscle:'Cardio',           type:'Cardio' },
  { id:'cycle_stationary',    name:'Rower stacjonarny',                muscle:'Cardio',           type:'Cardio' },
  { id:'elliptical',          name:'Orbitrek',                         muscle:'Cardio',           type:'Cardio' },
  { id:'rowing_machine',      name:'Wioślarz',                         muscle:'Cardio',           type:'Cardio' },
  { id:'jump_rope',           name:'Skakanka',                         muscle:'Cardio',           type:'Cardio' },
  { id:'burpee',              name:'Burpee',                           muscle:'Cardio',           type:'Cardio' },
  { id:'kettlebell_swing',    name:'Swing kettlebell',                 muscle:'Cardio',           type:'Siłowe' },
];

const MUSCLES = ['Klatka piersiowa','Plecy','Nogi','Barki','Biceps','Triceps','Brzuch','Cardio'];

// ── Storage Helpers ────────────────────────────────────────────────────────
const Storage = {
  KEY_WORKOUTS:   'dt_workouts',
  KEY_TEMPLATES:  'dt_templates',
  KEY_CURRENT:    'dt_current_workout',
  KEY_SETTINGS:   'dt_settings',

  load(key, def) {
    try { return JSON.parse(localStorage.getItem(key)) ?? def; }
    catch { return def; }
  },
  save(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
  },
};

// ── Utilities ──────────────────────────────────────────────────────────────
function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function fmtDuration(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  return `${m}:${String(s).padStart(2,'0')}`;
}

function fmtDate(iso) {
  const d = new Date(iso);
  const now = new Date();
  const days = ['Niedziela','Poniedziałek','Wtorek','Środa','Czwartek','Piątek','Sobota'];
  const months = ['sty','lut','mar','kwi','maj','cze','lip','sie','wrz','paź','lis','gru'];
  const diffMs = now - d;
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffDays === 0) return 'Dziś';
  if (diffDays === 1) return 'Wczoraj';
  if (diffDays < 7)  return days[d.getDay()];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

function fmtDateFull(iso) {
  const d = new Date(iso);
  const months = ['stycznia','lutego','marca','kwietnia','maja','czerwca',
                  'lipca','sierpnia','września','października','listopada','grudnia'];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}, ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
}

function getExercise(id) {
  return EXERCISES_DB.find(e => e.id === id) || { name: id, muscle: '', type: '' };
}

// ══════════════════════════════════════════════════════════════════════════
// APP
// ══════════════════════════════════════════════════════════════════════════
const App = (() => {

  // ── State ──────────────────────────────────────────────────────────────
  let state = {
    view: 'home',
    workouts: [],
    templates: [],
    currentWorkout: null,
    workoutTimerInterval: null,
    workoutStartTime: null,

    restTimer: {
      active: false,
      remaining: 60,
      total: 60,
      interval: null,
    },

    // Exercise picker context
    pickerTarget: null,   // 'workout' | 'catalog'
    filterMuscle: null,
    modalFilterMuscle: null,
  };

  // ── Load Persisted Data ────────────────────────────────────────────────
  function loadData() {
    state.workouts   = Storage.load(Storage.KEY_WORKOUTS, []);
    state.templates  = Storage.load(Storage.KEY_TEMPLATES, []);
    state.currentWorkout = Storage.load(Storage.KEY_CURRENT, null);
  }

  function saveWorkouts()  { Storage.save(Storage.KEY_WORKOUTS, state.workouts); }
  function saveTemplates() { Storage.save(Storage.KEY_TEMPLATES, state.templates); }
  function saveCurrent()   { Storage.save(Storage.KEY_CURRENT, state.currentWorkout); }

  // ── Navigation ─────────────────────────────────────────────────────────
  function navigateTo(viewId) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));

    const view = document.getElementById(`view-${viewId}`);
    if (view) view.classList.add('active');
    const navBtn = document.querySelector(`.nav-item[data-view="${viewId}"]`);
    if (navBtn) navBtn.classList.add('active');

    state.view = viewId;

    if (viewId === 'home')      renderHome();
    if (viewId === 'exercises') renderExerciseCatalog(state.filterMuscle);
    if (viewId === 'history')   renderHistory();
    if (viewId === 'progress')  renderProgressSelects();
    if (viewId === 'workout')   renderActiveWorkout();
  }

  // ── Modals ─────────────────────────────────────────────────────────────
  function openModal(id) {
    document.getElementById(`modal-${id}`).classList.remove('hidden');
  }
  function closeModal(id) {
    document.getElementById(`modal-${id}`).classList.add('hidden');
  }

  // ══════════════════════════════════════════════════════════════════════
  // HOME VIEW
  // ══════════════════════════════════════════════════════════════════════
  function renderHome() {
    // Stats
    const weekStart = new Date();
    weekStart.setHours(0,0,0,0);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay() + (weekStart.getDay() === 0 ? -6 : 1));

    let totalVol = 0;
    let weekCount = 0;
    state.workouts.forEach(w => {
      const wDate = new Date(w.date);
      if (wDate >= weekStart) weekCount++;
      w.exercises.forEach(ex => {
        ex.sets.forEach(s => {
          if (s.completed) totalVol += (s.weight || 0) * (s.reps || 0);
        });
      });
    });

    const streak = calcStreak();
    document.getElementById('stat-total').textContent = state.workouts.length;
    document.getElementById('stat-week').textContent  = weekCount;
    document.getElementById('stat-volume').textContent = totalVol >= 1000
      ? Math.round(totalVol/1000) + 'k'
      : totalVol;
    document.getElementById('stat-streak').textContent = streak;

    // Templates
    const tmplCont = document.getElementById('templates-container');
    if (state.templates.length === 0) {
      tmplCont.innerHTML = '<p class="empty-hint">Brak szablonów. Utwórz szablon, by szybko zaczynać trening.</p>';
    } else {
      tmplCont.innerHTML = state.templates.map(t => `
        <div class="template-card">
          <div class="template-card-info" onclick="App.startWorkoutFromTemplate('${t.id}')">
            <div class="template-card-name">${esc(t.name)}</div>
            <div class="template-card-sub">${t.exercises.map(e => getExercise(e.exerciseId).name).slice(0,3).join(', ')}${t.exercises.length > 3 ? '...' : ''}</div>
          </div>
          <div class="template-card-actions">
            <button class="btn btn-ghost btn-sm" onclick="App.deleteTemplate('${t.id}')">Usuń</button>
          </div>
        </div>
      `).join('');
    }

    // Recent workouts (last 5)
    const recentCont = document.getElementById('recent-workouts-container');
    const recent = [...state.workouts].sort((a,b) => new Date(b.date) - new Date(a.date)).slice(0,5);
    if (recent.length === 0) {
      recentCont.innerHTML = '<p class="empty-hint">Brak treningów. Czas na siłownię! 💪</p>';
    } else {
      recentCont.innerHTML = recent.map(w => {
        const vol = calcWorkoutVolume(w);
        const sets = w.exercises.reduce((s, e) => s + e.sets.filter(x => x.completed).length, 0);
        const exNames = w.exercises.map(e => getExercise(e.exerciseId).name).slice(0,3).join(', ');
        return `
          <div class="recent-workout-card" onclick="App.showWorkoutDetail('${w.id}')">
            <div class="recent-header">
              <span class="recent-name">${esc(w.name)}</span>
              <span class="recent-date">${fmtDate(w.date)}</span>
            </div>
            <div class="recent-stats">
              <div class="recent-stat"><strong>${fmtDuration(w.duration || 0)}</strong> czas</div>
              <div class="recent-stat"><strong>${vol} kg</strong> objętość</div>
              <div class="recent-stat"><strong>${sets}</strong> serii</div>
            </div>
            <div class="recent-exercises">${esc(exNames)}${w.exercises.length > 3 ? '...' : ''}</div>
          </div>
        `;
      }).join('');
    }
  }

  function calcStreak() {
    if (state.workouts.length === 0) return 0;
    const days = new Set(state.workouts.map(w => w.date.slice(0, 10)));
    let streak = 0;
    const d = new Date();
    while (true) {
      const key = d.toISOString().slice(0, 10);
      if (days.has(key)) { streak++; d.setDate(d.getDate() - 1); }
      else break;
    }
    return streak;
  }

  // ══════════════════════════════════════════════════════════════════════
  // ACTIVE WORKOUT
  // ══════════════════════════════════════════════════════════════════════
  function startEmptyWorkout() {
    state.currentWorkout = {
      id: uid(),
      name: defaultWorkoutName(),
      date: new Date().toISOString(),
      duration: 0,
      exercises: [],
    };
    state.workoutStartTime = Date.now();
    saveCurrent();
    startWorkoutTimer();
    navigateTo('workout');
  }

  function startWorkoutFromTemplate(templateId) {
    const tmpl = state.templates.find(t => t.id === templateId);
    if (!tmpl) return;
    state.currentWorkout = {
      id: uid(),
      name: tmpl.name,
      date: new Date().toISOString(),
      duration: 0,
      exercises: tmpl.exercises.map(ex => ({
        exerciseId: ex.exerciseId,
        sets: ex.sets.map(s => ({ ...s, completed: false })),
      })),
    };
    state.workoutStartTime = Date.now();
    saveCurrent();
    startWorkoutTimer();
    navigateTo('workout');
  }

  function defaultWorkoutName() {
    const h = new Date().getHours();
    if (h < 10) return 'Poranny trening';
    if (h < 14) return 'Trening przedpołudniowy';
    if (h < 18) return 'Trening popołudniowy';
    return 'Wieczorny trening';
  }

  function startWorkoutTimer() {
    clearInterval(state.workoutTimerInterval);
    state.workoutTimerInterval = setInterval(() => {
      if (!state.workoutStartTime) return;
      const elapsed = Math.floor((Date.now() - state.workoutStartTime) / 1000);
      state.currentWorkout.duration = elapsed;
      const el = document.getElementById('workout-elapsed');
      if (el) el.textContent = fmtDuration(elapsed);
      const hdr = document.getElementById('header-workout-timer');
      if (hdr && !hdr.classList.contains('hidden')) hdr.textContent = fmtDuration(elapsed);
    }, 1000);
  }

  function stopWorkoutTimer() {
    clearInterval(state.workoutTimerInterval);
    state.workoutTimerInterval = null;
  }

  function renderActiveWorkout() {
    if (!state.currentWorkout) {
      navigateTo('home');
      return;
    }

    const nameInput = document.getElementById('workout-name-input');
    if (nameInput) nameInput.value = state.currentWorkout.name;

    const list = document.getElementById('active-exercises-list');
    if (!state.currentWorkout.exercises.length) {
      list.innerHTML = `
        <div style="text-align:center; padding:40px 0; color:var(--text-sub)">
          <p style="font-size:1rem; margin-bottom:16px">Brak ćwiczeń w treningu</p>
        </div>
      `;
      return;
    }

    list.innerHTML = state.currentWorkout.exercises.map((ex, exIdx) =>
      renderExerciseBlock(ex, exIdx)
    ).join('');
  }

  function renderExerciseBlock(ex, exIdx) {
    const exerciseInfo = getExercise(ex.exerciseId);
    const isCardio = exerciseInfo.type === 'Cardio';

    const setsRows = ex.sets.map((set, sIdx) => {
      const isPR = !isCardio && isPersonalRecord(ex.exerciseId, set.weight, sIdx, exIdx);
      return `
        <tr class="set-row ${set.completed ? 'completed' : ''}">
          <td>
            <span class="set-num ${isPR ? 'pr-set' : ''}">${sIdx + 1}${isPR ? ' <span class="pr-badge">PR</span>' : ''}</span>
          </td>
          ${isCardio ? `
            <td><input class="num-input" type="number" min="0" step="0.1"
              value="${set.distance ?? ''}" placeholder="km"
              onchange="App.updateSet(${exIdx}, ${sIdx}, 'distance', this.value)"></td>
            <td><input class="num-input" type="number" min="0"
              value="${set.time ?? ''}" placeholder="min"
              onchange="App.updateSet(${exIdx}, ${sIdx}, 'time', this.value)"></td>
          ` : `
            <td><input class="num-input" type="number" min="0" step="0.5"
              value="${set.weight ?? ''}" placeholder="kg"
              onchange="App.updateSet(${exIdx}, ${sIdx}, 'weight', this.value)"></td>
            <td><input class="num-input" type="number" min="1"
              value="${set.reps ?? ''}" placeholder="ilość"
              onchange="App.updateSet(${exIdx}, ${sIdx}, 'reps', this.value)"></td>
          `}
          <td>
            <button class="btn-check ${set.completed ? 'done' : ''}"
              onclick="App.toggleSet(${exIdx}, ${sIdx})">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
            </button>
          </td>
          <td>
            <button class="delete-set-btn" onclick="App.deleteSet(${exIdx}, ${sIdx})">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
            </button>
          </td>
        </tr>
      `;
    }).join('');

    return `
      <div class="exercise-block" id="ex-block-${exIdx}">
        <div class="exercise-block-header">
          <div>
            <div class="exercise-block-name">${esc(exerciseInfo.name)}</div>
            <div class="exercise-block-muscle">${esc(exerciseInfo.muscle)} · ${esc(exerciseInfo.type)}</div>
          </div>
          <button class="btn-icon" onclick="App.removeExercise(${exIdx})">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
          </button>
        </div>
        <table class="sets-table">
          <thead>
            <tr>
              <th>Seria</th>
              ${isCardio ? '<th>km</th><th>min</th>' : '<th>kg</th><th>Powt.</th>'}
              <th>✓</th>
              <th></th>
            </tr>
          </thead>
          <tbody>${setsRows}</tbody>
        </table>
        <div class="exercise-block-footer">
          <button class="btn btn-secondary btn-sm" onclick="App.addSet(${exIdx})">+ Seria</button>
          <button class="btn btn-ghost btn-sm" onclick="App.showRestTimer()">⏱ Odpoczynek</button>
        </div>
      </div>
    `;
  }

  function isPersonalRecord(exerciseId, weight, setIdx, exIdx) {
    if (!weight) return false;
    for (const w of state.workouts) {
      for (const ex of w.exercises) {
        if (ex.exerciseId === exerciseId) {
          for (const s of ex.sets) {
            if (s.completed && (s.weight || 0) >= weight) return false;
          }
        }
      }
    }
    return true;
  }

  function addExerciseToWorkout(exerciseId) {
    if (!state.currentWorkout) return;
    const last = state.workouts.flatMap(w => w.exercises)
      .filter(e => e.exerciseId === exerciseId)
      .flatMap(e => e.sets)
      .filter(s => s.completed);
    const defaultSet = last.length
      ? { weight: last[last.length-1].weight, reps: last[last.length-1].reps, completed: false }
      : { weight: null, reps: null, completed: false };

    state.currentWorkout.exercises.push({
      exerciseId,
      sets: [{ ...defaultSet }],
    });
    saveCurrent();
    renderActiveWorkout();
    closeModal('pick-exercise');
  }

  function removeExercise(exIdx) {
    state.currentWorkout.exercises.splice(exIdx, 1);
    saveCurrent();
    renderActiveWorkout();
  }

  function addSet(exIdx) {
    const ex = state.currentWorkout.exercises[exIdx];
    const prevSet = ex.sets[ex.sets.length - 1] || {};
    ex.sets.push({ weight: prevSet.weight ?? null, reps: prevSet.reps ?? null, completed: false });
    saveCurrent();
    renderActiveWorkout();
  }

  function deleteSet(exIdx, sIdx) {
    const ex = state.currentWorkout.exercises[exIdx];
    if (ex.sets.length === 1) { removeExercise(exIdx); return; }
    ex.sets.splice(sIdx, 1);
    saveCurrent();
    renderActiveWorkout();
  }

  function toggleSet(exIdx, sIdx) {
    const set = state.currentWorkout.exercises[exIdx].sets[sIdx];
    set.completed = !set.completed;
    if (set.completed) showRestTimer();
    saveCurrent();
    renderActiveWorkout();
  }

  function updateSet(exIdx, sIdx, field, val) {
    const set = state.currentWorkout.exercises[exIdx].sets[sIdx];
    set[field] = val === '' ? null : parseFloat(val);
    saveCurrent();
  }

  function calcWorkoutVolume(workout) {
    let vol = 0;
    workout.exercises.forEach(ex => {
      ex.sets.forEach(s => {
        if (s.completed) vol += (s.weight || 0) * (s.reps || 0);
      });
    });
    return Math.round(vol);
  }

  // ── Finish Workout ─────────────────────────────────────────────────────
  function showFinishWorkout() {
    const w = state.currentWorkout;
    const completedSets = w.exercises.reduce((n, ex) => n + ex.sets.filter(s=>s.completed).length, 0);
    const totalSets    = w.exercises.reduce((n, ex) => n + ex.sets.length, 0);
    const vol = calcWorkoutVolume(w);

    document.getElementById('finish-summary').innerHTML = `
      <div class="finish-row">
        <span class="finish-label">Czas treningu</span>
        <span class="finish-value">${fmtDuration(w.duration || 0)}</span>
      </div>
      <div class="finish-row">
        <span class="finish-label">Ćwiczenia</span>
        <span class="finish-value">${w.exercises.length}</span>
      </div>
      <div class="finish-row">
        <span class="finish-label">Serie ukończone</span>
        <span class="finish-value">${completedSets} / ${totalSets}</span>
      </div>
      <div class="finish-row">
        <span class="finish-label">Objętość</span>
        <span class="finish-value">${vol} kg</span>
      </div>
    `;
    openModal('finish-workout');
  }

  function saveAndFinishWorkout() {
    const w = state.currentWorkout;
    if (!w) return;

    w.name = document.getElementById('workout-name-input')?.value || w.name;
    w.exercises = w.exercises.map(ex => ({
      ...ex,
      sets: ex.sets.filter(s => s.completed || s.weight || s.reps),
    })).filter(ex => ex.sets.length > 0);

    state.workouts.push(w);
    saveWorkouts();

    state.currentWorkout = null;
    saveCurrent();
    stopWorkoutTimer();

    document.getElementById('header-workout-timer')?.classList.add('hidden');

    closeModal('finish-workout');
    navigateTo('home');
  }

  function discardWorkout() {
    if (!confirm('Na pewno chcesz porzucić trening? Dane nie zostaną zapisane.')) return;
    state.currentWorkout = null;
    saveCurrent();
    stopWorkoutTimer();
    document.getElementById('header-workout-timer')?.classList.add('hidden');
    navigateTo('home');
  }

  // ══════════════════════════════════════════════════════════════════════
  // EXERCISE CATALOG
  // ══════════════════════════════════════════════════════════════════════
  function renderExerciseCatalog(filterMuscle = null) {
    state.filterMuscle = filterMuscle;

    // Chips
    const chipsEl = document.getElementById('muscle-filter-chips');
    chipsEl.innerHTML = ['Wszystkie', ...MUSCLES].map(m => `
      <div class="chip ${(!filterMuscle && m==='Wszystkie') || m===filterMuscle ? 'active' : ''}"
        onclick="App.setCatalogFilter('${m === 'Wszystkie' ? '' : m}')">
        ${esc(m)}
      </div>
    `).join('');

    // List
    const search = document.getElementById('exercise-search-input')?.value.toLowerCase() || '';
    const filtered = EXERCISES_DB.filter(e =>
      (!filterMuscle || e.muscle === filterMuscle) &&
      (!search || e.name.toLowerCase().includes(search))
    );

    const grouped = {};
    filtered.forEach(e => {
      if (!grouped[e.muscle]) grouped[e.muscle] = [];
      grouped[e.muscle].push(e);
    });

    const listEl = document.getElementById('exercises-catalog-list');
    if (filtered.length === 0) {
      listEl.innerHTML = '<p class="empty-hint">Brak wyników</p>';
      return;
    }

    listEl.innerHTML = Object.entries(grouped).map(([muscle, exs]) => `
      <div class="muscle-group-section">
        <div class="muscle-group-title">${esc(muscle)}</div>
        ${exs.map(e => `
          <div class="exercise-list-item" onclick="App.showExerciseDetail('${e.id}')">
            <div class="exercise-item-info">
              <div class="exercise-item-name">${esc(e.name)}</div>
              <div class="exercise-item-sub">${esc(e.type)}</div>
            </div>
            <div class="exercise-item-action">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>
            </div>
          </div>
        `).join('')}
      </div>
    `).join('');
  }

  function setCatalogFilter(muscle) {
    renderExerciseCatalog(muscle || null);
  }

  // ── Exercise Detail ────────────────────────────────────────────────────
  function showExerciseDetail(exerciseId) {
    const ex = getExercise(exerciseId);
    document.getElementById('ex-detail-name').textContent = ex.name;

    // PR & history
    const history = [];
    state.workouts.forEach(w => {
      const found = w.exercises.find(e => e.exerciseId === exerciseId);
      if (!found) return;
      const completedSets = found.sets.filter(s => s.completed);
      if (!completedSets.length) return;
      const maxW = Math.max(...completedSets.map(s => s.weight || 0));
      const vol  = completedSets.reduce((v, s) => v + (s.weight||0)*(s.reps||0), 0);
      history.push({ date: w.date, sets: completedSets, maxWeight: maxW, volume: vol });
    });
    history.sort((a,b) => new Date(a.date) - new Date(b.date));

    const pr = history.length ? Math.max(...history.map(h => h.maxWeight)) : null;

    document.getElementById('ex-detail-body').innerHTML = `
      <div class="detail-meta-row">
        <div class="detail-badge">${esc(ex.muscle)}</div>
        <div class="detail-badge">${esc(ex.type)}</div>
        ${pr ? `<div class="detail-badge" style="color:var(--warn);border-color:rgba(255,179,71,.3)">PR: ${pr} kg</div>` : ''}
      </div>
      <div style="margin-top:14px">
        <div class="muscle-group-title">Historia</div>
        ${history.length === 0
          ? '<p class="empty-hint" style="padding:12px 0">Brak historii dla tego ćwiczenia</p>'
          : history.slice(-10).reverse().map(h => `
            <div class="history-row">
              <div class="history-row-header">
                <span class="history-row-date">${fmtDateFull(h.date)}</span>
                <span class="history-row-best">Maks: ${h.maxWeight} kg</span>
              </div>
              <div class="history-row-sets">${h.sets.map(s => `${s.weight}kg × ${s.reps}`).join('  ·  ')}</div>
            </div>
          `).join('')
        }
      </div>
    `;
    openModal('exercise-detail');
  }

  // ══════════════════════════════════════════════════════════════════════
  // EXERCISE PICKER MODAL
  // ══════════════════════════════════════════════════════════════════════
  function openExercisePicker() {
    state.modalFilterMuscle = null;
    renderExercisePicker('');
    document.getElementById('modal-exercise-search').value = '';
    openModal('pick-exercise');
  }

  function renderExercisePicker(search = '') {
    const filterMuscle = state.modalFilterMuscle;

    // Chips
    document.getElementById('modal-muscle-chips').innerHTML =
      ['Wszystkie', ...MUSCLES].map(m => `
        <div class="chip ${(!filterMuscle && m==='Wszystkie') || m===filterMuscle ? 'active' : ''}"
          onclick="App.setPickerFilter('${m === 'Wszystkie' ? '' : m}')">
          ${esc(m)}
        </div>
      `).join('');

    const term = search.toLowerCase();
    const filtered = EXERCISES_DB.filter(e =>
      (!filterMuscle || e.muscle === filterMuscle) &&
      (!term || e.name.toLowerCase().includes(term))
    );

    const grouped = {};
    filtered.forEach(e => {
      if (!grouped[e.muscle]) grouped[e.muscle] = [];
      grouped[e.muscle].push(e);
    });

    const listEl = document.getElementById('modal-exercise-list');
    if (filtered.length === 0) {
      listEl.innerHTML = '<p class="empty-hint">Brak wyników</p>';
      return;
    }

    listEl.innerHTML = Object.entries(grouped).map(([muscle, exs]) => `
      <div class="muscle-group-section">
        <div class="muscle-group-title">${esc(muscle)}</div>
        ${exs.map(e => `
          <div class="exercise-list-item" onclick="App.addExerciseToWorkout('${e.id}')">
            <div class="exercise-item-info">
              <div class="exercise-item-name">${esc(e.name)}</div>
              <div class="exercise-item-sub">${esc(e.type)}</div>
            </div>
            <div class="exercise-item-action" style="color:var(--accent)">+</div>
          </div>
        `).join('')}
      </div>
    `).join('');
  }

  function setPickerFilter(muscle) {
    state.modalFilterMuscle = muscle || null;
    const search = document.getElementById('modal-exercise-search')?.value || '';
    renderExercisePicker(search);
  }

  // ══════════════════════════════════════════════════════════════════════
  // HISTORY VIEW
  // ══════════════════════════════════════════════════════════════════════
  function renderHistory() {
    const sorted = [...state.workouts].sort((a,b) => new Date(b.date) - new Date(a.date));
    const cont = document.getElementById('history-list-container');

    if (sorted.length === 0) {
      cont.innerHTML = '<p class="empty-hint">Brak historii treningów.</p>';
      return;
    }

    const groups = {};
    sorted.forEach(w => {
      const key = fmtDate(w.date);
      if (!groups[key]) groups[key] = [];
      groups[key].push(w);
    });

    cont.innerHTML = Object.entries(groups).map(([dateLabel, wks]) => `
      <div class="history-date-group">
        <div class="history-date-label">${esc(dateLabel)}</div>
        ${wks.map(w => {
          const vol = calcWorkoutVolume(w);
          const sets = w.exercises.reduce((n, e) => n + e.sets.filter(s=>s.completed).length, 0);
          const exNames = w.exercises.map(e => getExercise(e.exerciseId).name).slice(0,3).join(', ');
          return `
            <div class="recent-workout-card" onclick="App.showWorkoutDetail('${w.id}')">
              <div class="recent-header">
                <span class="recent-name">${esc(w.name)}</span>
                <span class="recent-date">${new Date(w.date).toLocaleTimeString('pl-PL',{hour:'2-digit',minute:'2-digit'})}</span>
              </div>
              <div class="recent-stats">
                <div class="recent-stat"><strong>${fmtDuration(w.duration || 0)}</strong> czas</div>
                <div class="recent-stat"><strong>${vol} kg</strong></div>
                <div class="recent-stat"><strong>${sets}</strong> serii</div>
              </div>
              <div class="recent-exercises">${esc(exNames)}${w.exercises.length > 3 ? ` +${w.exercises.length - 3}` : ''}</div>
            </div>
          `;
        }).join('')}
      </div>
    `).join('');
  }

  // ── Workout Detail ─────────────────────────────────────────────────────
  function showWorkoutDetail(workoutId) {
    const w = state.workouts.find(x => x.id === workoutId);
    if (!w) return;

    document.getElementById('detail-workout-name').textContent = w.name;
    document.getElementById('detail-meta').innerHTML = `
      <div class="detail-meta-row">
        <span class="detail-badge">${fmtDateFull(w.date)}</span>
        <span class="detail-badge">${fmtDuration(w.duration || 0)}</span>
        <span class="detail-badge">${calcWorkoutVolume(w)} kg</span>
      </div>
    `;

    document.getElementById('detail-exercises').innerHTML = w.exercises.map(ex => {
      const info = getExercise(ex.exerciseId);
      const completedSets = ex.sets.filter(s => s.completed);
      return `
        <div class="detail-exercise-block">
          <div class="detail-exercise-name">${esc(info.name)}</div>
          ${completedSets.map((s, i) => `
            <div class="detail-set-row">
              <span>Seria ${i+1}</span>
              <span>${info.type === 'Cardio'
                ? `${s.distance ?? '?'} km · ${s.time ?? '?'} min`
                : `<strong>${s.weight ?? '?'} kg</strong> × <strong>${s.reps ?? '?'}</strong>`}
              </span>
            </div>
          `).join('')}
        </div>
      `;
    }).join('');

    document.getElementById('btn-delete-workout').onclick = () => deleteWorkout(workoutId);
    openModal('workout-detail');
  }

  function deleteWorkout(workoutId) {
    if (!confirm('Usunąć ten trening?')) return;
    state.workouts = state.workouts.filter(w => w.id !== workoutId);
    saveWorkouts();
    closeModal('workout-detail');
    if (state.view === 'history') renderHistory();
    if (state.view === 'home')    renderHome();
  }

  // ══════════════════════════════════════════════════════════════════════
  // REST TIMER
  // ══════════════════════════════════════════════════════════════════════
  function showRestTimer() {
    if (!state.restTimer.active) {
      state.restTimer.remaining = state.restTimer.total || 90;
    }
    updateRestTimerUI();
    openModal('rest-timer');
    if (!state.restTimer.active) startRestTimer();
  }

  function startRestTimer() {
    clearInterval(state.restTimer.interval);
    state.restTimer.active = true;
    state.restTimer.interval = setInterval(() => {
      state.restTimer.remaining--;
      updateRestTimerUI();
      if (state.restTimer.remaining <= 0) {
        stopRestTimer();
        try { new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAA...').play(); } catch {}
      }
    }, 1000);
  }

  function stopRestTimer() {
    clearInterval(state.restTimer.interval);
    state.restTimer.active = false;
    state.restTimer.interval = null;
  }

  function updateRestTimerUI() {
    const el = document.getElementById('rest-timer-seconds');
    if (el) el.textContent = state.restTimer.remaining;

    const circle = document.getElementById('rest-circle-progress');
    if (circle) {
      const circumference = 339.3;
      const ratio = Math.max(0, state.restTimer.remaining / (state.restTimer.total || 90));
      circle.style.strokeDashoffset = circumference * (1 - ratio);
    }
  }

  function skipRest() {
    stopRestTimer();
    state.restTimer.remaining = state.restTimer.total || 90;
    closeModal('rest-timer');
  }

  function adjustRest(delta) {
    state.restTimer.remaining = Math.max(5, state.restTimer.remaining + delta);
    updateRestTimerUI();
  }

  function setRest(seconds) {
    stopRestTimer();
    state.restTimer.total = seconds;
    state.restTimer.remaining = seconds;
    updateRestTimerUI();
    startRestTimer();
  }

  function closeRestTimer() {
    stopRestTimer();
    closeModal('rest-timer');
  }

  // ══════════════════════════════════════════════════════════════════════
  // TEMPLATES
  // ══════════════════════════════════════════════════════════════════════
  function showNewTemplateModal() {
    document.getElementById('template-name-input').value = '';
    openModal('new-template');
  }

  function saveTemplate() {
    const name = document.getElementById('template-name-input').value.trim();
    if (!name) return;

    if (state.currentWorkout && state.currentWorkout.exercises.length > 0) {
      state.templates.push({
        id: uid(),
        name,
        exercises: state.currentWorkout.exercises.map(ex => ({
          exerciseId: ex.exerciseId,
          sets: ex.sets.map(s => ({ weight: s.weight, reps: s.reps })),
        })),
      });
    } else {
      state.templates.push({
        id: uid(),
        name,
        exercises: [],
      });
    }

    saveTemplates();
    closeModal('new-template');
    if (state.view === 'home') renderHome();
  }

  function deleteTemplate(id) {
    if (!confirm('Usunąć ten szablon?')) return;
    state.templates = state.templates.filter(t => t.id !== id);
    saveTemplates();
    renderHome();
  }

  // ══════════════════════════════════════════════════════════════════════
  // PROGRESS VIEW
  // ══════════════════════════════════════════════════════════════════════
  function renderProgressSelects() {
    const sel = document.getElementById('progress-exercise-select');
    const exercisesInHistory = new Set(
      state.workouts.flatMap(w => w.exercises.map(e => e.exerciseId))
    );

    const grouped = {};
    EXERCISES_DB.filter(e => exercisesInHistory.has(e.id)).forEach(e => {
      if (!grouped[e.muscle]) grouped[e.muscle] = [];
      grouped[e.muscle].push(e);
    });

    sel.innerHTML = '<option value="">— wybierz —</option>' +
      Object.entries(grouped).map(([muscle, exs]) => `
        <optgroup label="${esc(muscle)}">
          ${exs.map(e => `<option value="${e.id}">${esc(e.name)}</option>`).join('')}
        </optgroup>
      `).join('');

    sel.onchange = () => renderProgressCharts(sel.value);
    document.getElementById('progress-content').classList.add('hidden');
    document.getElementById('progress-empty-hint').classList.remove('hidden');
  }

  function renderProgressCharts(exerciseId) {
    if (!exerciseId) {
      document.getElementById('progress-content').classList.add('hidden');
      document.getElementById('progress-empty-hint').classList.remove('hidden');
      return;
    }

    const data = [];
    state.workouts
      .filter(w => w.exercises.some(e => e.exerciseId === exerciseId))
      .sort((a,b) => new Date(a.date) - new Date(b.date))
      .forEach(w => {
        const ex = w.exercises.find(e => e.exerciseId === exerciseId);
        const completedSets = ex.sets.filter(s => s.completed);
        if (!completedSets.length) return;
        const maxW = Math.max(...completedSets.map(s => s.weight || 0));
        const vol  = completedSets.reduce((v, s) => v + (s.weight||0)*(s.reps||0), 0);
        data.push({ date: w.date.slice(0,10), maxWeight: maxW, volume: Math.round(vol) });
      });

    if (!data.length) {
      document.getElementById('progress-content').classList.add('hidden');
      document.getElementById('progress-empty-hint').textContent = 'Brak danych dla wybranego ćwiczenia.';
      document.getElementById('progress-empty-hint').classList.remove('hidden');
      return;
    }

    document.getElementById('progress-content').classList.remove('hidden');
    document.getElementById('progress-empty-hint').classList.add('hidden');

    const pr = Math.max(...data.map(d => d.maxWeight));
    document.getElementById('pr-value').textContent = `${pr} kg`;

    drawLineChart('chart-weight', data.map(d => d.date), data.map(d => d.maxWeight), '#6c63ff');
    drawLineChart('chart-volume', data.map(d => d.date), data.map(d => d.volume), '#4cffb3');
  }

  function drawLineChart(canvasId, labels, values, color) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    const cssW = canvas.parentElement.clientWidth - 28;
    const cssH = 200;
    canvas.width  = cssW * dpr;
    canvas.height = cssH * dpr;
    canvas.style.width  = cssW + 'px';
    canvas.style.height = cssH + 'px';

    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    const pad = { top: 16, right: 16, bottom: 36, left: 48 };
    const w = cssW - pad.left - pad.right;
    const h = cssH - pad.top - pad.bottom;

    ctx.clearRect(0, 0, cssW, cssH);

    if (values.length === 0) return;

    const minV = 0;
    const maxV = Math.max(...values) * 1.1 || 1;
    const n = values.length;

    const xScale = i => pad.left + (n === 1 ? w/2 : (i / (n-1)) * w);
    const yScale = v => pad.top + h - ((v - minV) / (maxV - minV)) * h;

    // Grid
    ctx.strokeStyle = '#2a2a4a';
    ctx.lineWidth = 1;
    [0,.25,.5,.75,1].forEach(t => {
      const y = pad.top + h * t;
      ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(pad.left + w, y); ctx.stroke();
      const val = Math.round(maxV * (1 - t));
      ctx.fillStyle = '#55556a';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(val, pad.left - 6, y + 4);
    });

    // Line gradient fill
    const grad = ctx.createLinearGradient(0, pad.top, 0, pad.top + h);
    grad.addColorStop(0, color + '40');
    grad.addColorStop(1, color + '00');

    ctx.beginPath();
    ctx.moveTo(xScale(0), yScale(values[0]));
    for (let i = 1; i < n; i++) ctx.lineTo(xScale(i), yScale(values[i]));
    ctx.lineTo(xScale(n-1), pad.top + h);
    ctx.lineTo(xScale(0), pad.top + h);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // Line
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.lineJoin = 'round';
    ctx.moveTo(xScale(0), yScale(values[0]));
    for (let i = 1; i < n; i++) ctx.lineTo(xScale(i), yScale(values[i]));
    ctx.stroke();

    // Points
    values.forEach((v, i) => {
      ctx.beginPath();
      ctx.arc(xScale(i), yScale(v), 4, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = '#1a1a2e';
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    // X Labels (only a few)
    ctx.fillStyle = '#55556a';
    ctx.font = '9px sans-serif';
    ctx.textAlign = 'center';
    const step = Math.max(1, Math.ceil(n / 5));
    for (let i = 0; i < n; i += step) {
      const lbl = labels[i].slice(5); // MM-DD
      ctx.fillText(lbl, xScale(i), pad.top + h + 16);
    }
    if ((n-1) % step !== 0) {
      ctx.fillText(labels[n-1].slice(5), xScale(n-1), pad.top + h + 16);
    }
  }

  // ══════════════════════════════════════════════════════════════════════
  // XSS Helper
  // ══════════════════════════════════════════════════════════════════════
  function esc(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // ══════════════════════════════════════════════════════════════════════
  // INIT
  // ══════════════════════════════════════════════════════════════════════
  function init() {
    loadData();

    // Bottom nav
    document.querySelectorAll('.nav-item').forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.dataset.view === 'workout' && !state.currentWorkout) return;
        navigateTo(btn.dataset.view);
      });
    });

    // Home buttons
    document.getElementById('btn-start-empty-workout').addEventListener('click', () => {
      if (state.currentWorkout) {
        if (!confirm('Trwa aktywny trening. Porzucić go i zacząć nowy?')) return;
        discardWorkout();
      } else {
        startEmptyWorkout();
      }
    });

    document.getElementById('btn-new-template').addEventListener('click', showNewTemplateModal);
    document.getElementById('btn-save-template').addEventListener('click', saveTemplate);

    // Workout buttons
    document.getElementById('btn-add-exercise-to-workout').addEventListener('click', openExercisePicker);
    document.getElementById('btn-finish-workout').addEventListener('click', showFinishWorkout);
    document.getElementById('btn-discard-workout').addEventListener('click', discardWorkout);
    document.getElementById('btn-save-finish').addEventListener('click', saveAndFinishWorkout);

    // Exercise search in catalog
    document.getElementById('exercise-search-input').addEventListener('input', e => {
      renderExerciseCatalog(state.filterMuscle);
    });

    // Exercise picker search
    document.getElementById('modal-exercise-search').addEventListener('input', e => {
      renderExercisePicker(e.target.value);
    });

    // Workout name sync
    document.getElementById('workout-name-input')?.addEventListener('input', e => {
      if (state.currentWorkout) state.currentWorkout.name = e.target.value;
    });

    // Close modals on backdrop click
    document.querySelectorAll('.modal-overlay').forEach(modal => {
      modal.addEventListener('click', e => {
        if (e.target === modal) {
          const id = modal.id.replace('modal-', '');
          if (id === 'rest-timer') closeRestTimer();
          else closeModal(id);
        }
      });
    });

    // Resume active workout if exists
    if (state.currentWorkout) {
      const elapsed = Math.floor((Date.now() - new Date(state.currentWorkout.date)) / 1000);
      state.workoutStartTime = Date.now() - elapsed * 1000;
      state.currentWorkout.duration = elapsed;
      document.getElementById('header-workout-timer')?.classList.remove('hidden');
      startWorkoutTimer();

      // Show workout indicator in nav
      const workoutNavBtn = document.querySelector('.nav-item[data-view="workout"]');
      if (workoutNavBtn) {
        workoutNavBtn.style.color = 'var(--accent)';
      }
    }

    renderHome();
  }

  // Public API
  return {
    init,
    navigateTo,
    openModal,
    closeModal,
    setCatalogFilter,
    setPickerFilter,
    addExerciseToWorkout,
    removeExercise,
    addSet,
    deleteSet,
    toggleSet,
    updateSet,
    showRestTimer,
    skipRest,
    adjustRest,
    setRest,
    closeRestTimer,
    showWorkoutDetail,
    showExerciseDetail,
    deleteTemplate,
    startWorkoutFromTemplate,
  };
})();

document.addEventListener('DOMContentLoaded', () => App.init());
