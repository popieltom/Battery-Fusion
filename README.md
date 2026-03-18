# 🔋 Battery Fusion

> Control ANY battery system in Home Assistant — even mixed batteries (DIY + commercial).

---

## ❌ Problem

- Inverter shows inaccurate SOC (±15–20%)
- Can't handle mixed or multiple batteries
- No smart energy management without expensive hardware

## ✅ Solution

Battery Fusion creates a **virtual battery system** in Home Assistant — combining multiple batteries into one accurate SOC model using **Coulomb Counting**.

No inverter support required. Works with ANY inverter.

## 🔥 Key Features

- Works with **mixed battery systems** (DIY + commercial ESS)
- **Adaptive learning** — self-correcting SOC drift over time
- Universal: any inverter, any chemistry, 1–3+ batteries
- No hardcoded values — everything configured via HA interface

---

## ⚡ Quick Start (2 min)

1. Copy files to `/config/packages/`
2. Add to `configuration.yaml`:

```yaml
homeassistant:
  packages:
    battery_fusion: !include_dir_named packages
```

3. Restart Home Assistant
4. Go to **Settings → Helpers** and set battery capacity + power sensor entity

✅ Done — system is running.

---

## 🔌 Supported Systems

### Inverters

| Inverter | Status | Notes |
|---|---|---|
| Deye / Solarman | ✅ Tested | Normal sign (+ = discharge) |
| Sofar | ✅ Supported | Enable `bf_power_sign_inverted` |
| Growatt | ✅ Supported | Normal sign |
| Victron | ✅ Supported | Separate power sensors |
| Solis | ✅ Supported | Normal sign |
| Any other | ✅ Universal | Configurable sensor + sign |

### Battery Chemistry

| Chemistry | Cells | Full (100%) | Empty (0%) |
|---|---|---|---|
| LiFePO4 | 16S | 55.0V | 48.2V |
| LiFePO4 | 15S | 51.5V | 45.0V |
| NMC | 14S | 58.8V | 42.0V |
| Lead-acid | — | 54.0V | 46.0V |

---

## 🏗️ Architecture

```
[Battery 1] ──DC──┐
                   ├──► Inverter (DC bus)
[Battery 2] ──DC──┘
                   │
                   └── optional: BMS → ESP32 (YamBMS) ──CAN──► Inverter

Inverter ──Modbus/WiFi──► Home Assistant
                               │
                   sensor.battery_fusion_soc
                   sensor.battery_fusion_power_normalized
                   sensor.battery_fusion_status
                   sensor.bf_learn_statistics  ← adaptive learning
```

---

## ⚙️ Configuration

After restart, go to **Settings → Helpers** and configure:

| Helper | What to set |
|---|---|
| `bf_battery_1_capacity_kwh` | Battery 1 capacity in kWh |
| `bf_battery_2_capacity_kwh` | Battery 2 capacity (0 = single battery) |
| `bf_battery_energy_kwh` | Current energy — calibrate once manually |
| `bf_voltage_full` | Voltage at full charge (see table above) |
| `bf_voltage_empty` | Voltage at empty (see table above) |
| `bf_power_sensor` | entity_id of inverter battery power sensor |
| `bf_voltage_sensor` | entity_id of battery voltage sensor |
| `bf_current_sensor` | entity_id of battery current sensor |
| `bf_power_sign_inverted` | ON if inverter uses inverted power sign |

### Power sign convention

Check your inverter's power sensor during PV charging:
- **Negative during charging** → leave `bf_power_sign_inverted = OFF` (Deye, Growatt, Solis)
- **Positive during charging** → set `bf_power_sign_inverted = ON` (Sofar)

### Initial calibration

Calculate current energy and set `input_number.bf_battery_energy_kwh`:

```
Energy = Bat1_SoC% × Bat1_kWh + Bat2_SoC% × Bat2_kWh

Example: Bat1=60% × 12.5kWh + Bat2=55% × 16.0kWh
       = 7.5 + 8.8 = 16.3 kWh
```

---

## 🧠 Adaptive Learning Module

Battery Fusion includes a self-learning SOC correction system that **eliminates daily manual calibration** over time.

### How it works

```
Every minute:   Coulomb Counter × learned_efficiency
Every 10 min:   OCV correction when battery at rest (power < 50W for 10+ min)
On calibration: EMA learning — 70% old + 30% new observation
```

After 3–7 manual calibrations, the system stabilizes and drift drops below 1%.

### Learning sensors

| Sensor | Description |
|---|---|
| `sensor.bf_learn_statistics` | Learning status: `brak danych` / `uczenie (N/3)` / `stabilny` |
| `sensor.bf_learn_soc_ocv` | SOC estimated from OCV voltage curve |
| `sensor.bf_learn_drift_vs_ocv` | Current drift: Coulomb counter vs OCV |

### Learning helpers (auto-updated)

| Helper | Description |
|---|---|
| `input_number.bf_learned_efficiency` | Learned charging efficiency (starts at 0.97) |
| `input_number.bf_calibration_count` | Number of completed calibrations |
| `input_number.bf_avg_drift_before_correction` | Average drift before correction |

> ⚠️ **Per-battery SoC disclaimer:** `battery_1_soc_est` and `battery_2_soc_est` are **proportional estimates**, not real BMS readings. Use global SoC as the primary metric.

---

## 📊 Available Sensors

| Sensor | Description |
|---|---|
| `sensor.battery_fusion_soc` | Combined SOC in % |
| `sensor.battery_fusion_power_normalized` | Power (+ discharge, − charge) |
| `sensor.battery_fusion_status` | State: charging / discharging / idle / low_soc |
| `sensor.bf_learn_statistics` | Learning module status |
| `sensor.bf_learn_soc_ocv` | OCV-based SOC estimate |
| `sensor.bf_learn_drift_vs_ocv` | SOC drift vs OCV |

---

## 📁 File Structure

```
packages/
├── bf_configuration.yaml    ← helpers (input_number, input_boolean, input_text, input_select)
├── bf_templates.yaml        ← template sensors
├── bf_automations.yaml      ← core automations (Coulomb counter, calibration, alerts)
└── bf_learning.yaml         ← adaptive learning module
```

---

## 🔮 Roadmap

- [x] Universal Coulomb Counter (any inverter, any chemistry)
- [x] Configurable power sign (normal / inverted)
- [x] Configurable sensor entity IDs
- [x] Auto-calibration at voltage boundaries
- [x] Overload alert (battery disconnect scenario)
- [x] Low SOC warning
- [x] Multi-battery support (1, 2, 3+)
- [x] Adaptive efficiency learning (v2.1)
- [x] OCV-based SOC correction (v2.1)
- [ ] Dashboard card (Lovelace)
- [ ] HACS integration
- [ ] ESPHome YamBMS integration guide
- [ ] EMHASS optimization layer

---

## 📋 Changelog

### v2.1 — Adaptive Learning
- Self-learning SOC correction (EMA algorithm)
- OCV correction when battery at rest
- Learning quality sensor (`bf_learn_statistics`)
- Trigger on `button.battery_pack_apply_initial_soc` for accurate calibration detection

### v2.0 — Universal release
- Removed all hardcoded values
- Configurable power sign (inverted / normal)
- Configurable sensor entity IDs
- Multi-battery support
- Auto-calibration at voltage boundaries
- `sensor.battery_fusion_power_normalized`
- `sensor.battery_fusion_status`

### v1.1 — Expert review fixes
- Auto-calibration at 100% and ~0%
- JK BMS overload protection alert
- Low SOC warning
- Per-battery estimation disclaimer
- Charging efficiency 0.97

### v1.0 — Initial release
- Coulomb Counter sensor
- Dual battery energy tracking

---

## 🇵🇱 Polski

**Battery Fusion** to integracja dla Home Assistant, która pozwala na precyzyjne monitorowanie i zarządzanie magazynami energii podłączonymi do dowolnego falownika.

System liczy energię metodą **Coulomb Counting** (±5% dokładności), a moduł **adaptacyjnego uczenia** automatycznie eliminuje dryf licznika na podstawie ręcznych kalibracji — po 7 kalibracjach system stabilizuje się i codzienne korekty stają się zbędne.

---

## Credits

- [YamBMS](https://github.com/Sleeper85/esphome-yambms) — multi-BMS aggregation for ESPHome
- [esphome-deye-inverter](https://github.com/Lewa-Reka/esphome-deye-inverter) — Deye integration (PL community)
- [Batmon-HA](https://github.com/fl4p/batmon-ha) — BMS Bluetooth monitoring

---

## License

MIT — use freely, share improvements.
