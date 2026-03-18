# 🔋 Battery Fusion

> Control ANY battery system in Home Assistant — even mixed batteries (DIY + commercial).

![Battery Fusion Dashboard](docs/dashboard.png)

---

## ❌ Problem
- Inverter shows inaccurate SOC (±15–20%)
- Can't handle mixed or multiple batteries
- No smart energy management without expensive hardware

## ✅ Solution
Battery Fusion creates a **virtual battery system** in Home Assistant — combining multiple batteries into one accurate SOC model using **Coulomb Counting**.

No inverter support required. Works with ANY inverter.

## 🔥 Key Feature
Works with **mixed battery systems**:
- DIY battery (JK BMS, Daly, ANT)
- Commercial ESS (Felicity, Pylontech, etc.)
- Any combination, any chemistry

---

## ⚡ Quick Start (2 min)

1. Copy files to `/config`
2. Add to `configuration.yaml`:
```yaml
homeassistant:
  packages:
      !include_dir_named packages
      ```
      3. Restart Home Assistant
      4. Set: battery capacity + battery power sensor

      ✅ Done — system is running.

      ---

      ## 🔌 Supported Systems

      ### Inverters
      | Inverter | Status | Notes |
      |---|---|---|
      | Deye / Solarman | ✅ Tested | Normal sign (+ = discharge) |
      | Sofar | ✅ Supported | Enable `bf_power_sign_inverted` |
      | Growatt | ✅ Supported | Normal sign |
      | Victron | ✅ Supported | Separate sensors |
      | Solis | ✅ Supported | Normal sign |
      | Any other | ✅ Universal | Configurable sensor + sign |

      ### Battery Chemistry
      | Chemistry | Full (100%) | Empty (0%) |
      |---|---|---|
      | LiFePO4 16S | 55.0V | 48.2V |
      | LiFePO4 15S | 51.5V | 45.0V |
      | NMC 14S | 58.8V | 42.0V |
      | Lead-acid | 54.0V | 46.0V |

      ---

      ## 🏗️ Architecture

      ```
      [Battery 1] ──DC──┐
                        ├──► Inverter (DC bus)
                        [Battery 2] ──DC──┘
                                          │
                                                            └── optional: BMS → ESP32 (YamBMS) ──CAN──► Inverter

                                                            Inverter ──Modbus/SolarmanAPI──► Home Assistant
                                                                          │
                                                                                        ├── sensor.battery_fusion_soc
                                                                                                      ├── sensor.battery_fusion_power_normalized
                                                                                                                    └── sensor.battery_fusion_status
                                                                                                                    ```
                                                                                                                    
                                                                                                                    ---
                                                                                                                    
                                                                                                                    ## ⚙️ Configuration
                                                                                                                    
                                                                                                                    After install, configure via HA Helpers UI:
                                                                                                                    
                                                                                                                    | Helper | What to set |
                                                                                                                    |---|---|
                                                                                                                    | `bf_battery_1_capacity_kwh` | Battery 1 capacity in kWh |
                                                                                                                    | `bf_battery_2_capacity_kwh` | Battery 2 capacity (0 = single battery) |
                                                                                                                    | `bf_battery_energy_kwh` | Current energy — calibrate once manually |
                                                                                                                    | `bf_voltage_full` | Voltage at 100% (see table above) |
                                                                                                                    | `bf_voltage_empty` | Voltage at 0% (see table above) |
                                                                                                                    | `bf_power_sensor` | entity_id of inverter battery power sensor |
                                                                                                                    | `bf_voltage_sensor` | entity_id of battery voltage sensor |
                                                                                                                    | `bf_current_sensor` | entity_id of battery current sensor |
                                                                                                                    | `bf_power_sign_inverted` | ON if inverter uses inverted sign (Sofar) |
                                                                                                                    
                                                                                                                    ### Initial Calibration (once)
                                                                                                                    ```
                                                                                                                    Energy = Bat1_SoC% × Bat1_kWh + Bat2_SoC% × Bat2_kWh
                                                                                                                    Example: 60% × 12.5 + 55% × 17.0 = 7.5 + 9.35 = 16.85 kWh
                                                                                                                    ```
                                                                                                                    Set `input_number.bf_battery_energy_kwh` to the result.
                                                                                                                    
                                                                                                                    ---
                                                                                                                    
                                                                                                                    ## 🧠 Adaptive Learning (experimental)
                                                                                                                    
                                                                                                                    Battery Fusion includes a **self-learning SOC correction system** that eliminates manual recalibration over time.
                                                                                                                    
                                                                                                                    ### How it works
                                                                                                                    1. Enable `input_boolean.bf_learning_enabled`
                                                                                                                    2. Read real SOC from your BMS display
                                                                                                                    3. Enter the value in `input_number.bf_real_soc_input`
                                                                                                                    4. System automatically learns and corrects the Coulomb Counter
                                                                                                                    
                                                                                                                    ### When to input real SOC
                                                                                                                    - ✅ Best: when battery is ~100% or ~10–20% (BMS most accurate here)
                                                                                                                    - ❌ Avoid: 30–70% range (BMS less accurate)
                                                                                                                    
                                                                                                                    ### Learning files (in `/learning` folder)
                                                                                                                    | File | Description |
                                                                                                                    |---|---|
                                                                                                                    | `bf_learning_helpers.yaml` | Input helpers for learning system |
                                                                                                                    | `bf_learning_templates.yaml` | Final SOC sensor with correction |
                                                                                                                    | `bf_learning_automations.yaml` | Learning automations |
                                                                                                                    
                                                                                                                    ### Sensors added by Adaptive Learning
                                                                                                                    | Sensor | Description |
                                                                                                                    |---|---|
                                                                                                                    | `sensor.battery_fusion_soc_final` | SOC with adaptive correction applied |
                                                                                                                    | `sensor.battery_fusion_learning_quality` | Learning quality 0–100% |
                                                                                                                    
                                                                                                                    ### Learning parameters
                                                                                                                    | Helper | Default | Description |
                                                                                                                    |---|---|---|
                                                                                                                    | `bf_learning_rate` | 0.1 | Learning speed (0.05 = stable, 0.2 = fast) |
                                                                                                                    | `bf_soc_correction` | 0 | Correction offset (learned automatically) |
                                                                                                                    | `bf_adaptive_efficiency` | 97 | Charge efficiency (learned automatically) |
                                                                                                                    
                                                                                                                    > ⚠️ **Experimental** — enable step by step. Start with `bf_learning_rate = 0.1`.
                                                                                                                    
                                                                                                                    ---
                                                                                                                    
                                                                                                                    ## 📊 Available Sensors
                                                                                                                    
                                                                                                                    | Sensor | Description |
                                                                                                                    |---|---|
                                                                                                                    | `sensor.battery_fusion_soc` | Combined SOC % (Coulomb Counter) |
                                                                                                                    | `sensor.battery_fusion_soc_final` | SOC with adaptive correction |
                                                                                                                    | `sensor.battery_fusion_power_normalized` | Power (+ discharge, − charge) |
                                                                                                                    | `sensor.battery_fusion_status` | charging / discharging / idle / low_soc |
                                                                                                                    | `sensor.battery_fusion_learning_quality` | Learning quality 0–100% |
                                                                                                                    
                                                                                                                    ---
                                                                                                                    
                                                                                                                    ## 🔔 Automatic Calibration
                                                                                                                    
                                                                                                                    System auto-calibrates at voltage boundaries:
                                                                                                                    
                                                                                                                    | Condition | Delay | Action |
                                                                                                                    |---|---|---|
                                                                                                                    | Voltage > `bf_voltage_full` and power < 200W | 5 min | Reset to 100% capacity |
                                                                                                                    | Voltage < `bf_voltage_empty` | 3 min | Reset to 2% capacity |
                                                                                                                    
                                                                                                                    ---
                                                                                                                    
                                                                                                                    ## ⚠️ Important Notes
                                                                                                                    
                                                                                                                    - **Per-battery SOC** (`battery_1_soc_est`, `battery_2_soc_est`) are proportional estimates — batteries do not discharge proportionally in practice. Use global SOC as primary metric.
                                                                                                                    - Leave **1 radiator without thermostatic valve** (or install a bypass) when using smart radiator valves — prevents pump damage.
                                                                                                                    - For **JK BMS**: connect via UART TTL (TX/RX/GND), not RS485.
                                                                                                                    - Batteries with closed RS485 protocol (e.g. Felicity): leave on DC bus only.
                                                                                                                    
                                                                                                                    ---
                                                                                                                    
                                                                                                                    ## 🗺️ Roadmap
                                                                                                                    
                                                                                                                    - [x] Universal Coulomb Counter (any inverter, any chemistry)
                                                                                                                    - [x] Configurable power sign (normal / inverted)
                                                                                                                    - [x] Auto-calibration at voltage boundaries
                                                                                                                    - [x] Overload alert (one battery disconnect scenario)
                                                                                                                    - [x] Low SOC warning
                                                                                                                    - [x] Multi-battery support (1, 2, 3+)
                                                                                                                    - [x] Adaptive Learning (self-correcting SOC)
                                                                                                                    - [x] Adaptive efficiency learning
                                                                                                                    - [ ] Dashboard card (Lovelace)
                                                                                                                    - [ ] HACS integration
                                                                                                                    - [ ] ESPHome YamBMS integration guide
                                                                                                                    - [ ] EMHASS optimization layer
                                                                                                                    
                                                                                                                    ---
                                                                                                                    
                                                                                                                    ## 📋 Changelog
                                                                                                                    
                                                                                                                    ### v2.1 — Adaptive Learning
                                                                                                                    - Added self-learning SOC correction system
                                                                                                                    - Adaptive charge efficiency (EMA algorithm)
                                                                                                                    - Learning quality sensor
                                                                                                                    - Reset automation
                                                                                                                    
                                                                                                                    ### v2.0 — Universal release
                                                                                                                    - Removed all hardcoded values
                                                                                                                    - Added configurable power sign (inverted / normal)
                                                                                                                    - Added multi-battery support
                                                                                                                    - Auto-calibration at voltage boundaries
                                                                                                                    - Added `sensor.battery_fusion_power_normalized`
                                                                                                                    - Added `sensor.battery_fusion_status`
                                                                                                                    
                                                                                                                    ### v1.1 — Expert review fixes
                                                                                                                    - Auto-calibration improvements
                                                                                                                    - JK BMS overload protection alert
                                                                                                                    - Low SOC warning automation
                                                                                                                    
                                                                                                                    ### v1.0 — Initial release
                                                                                                                    - Coulomb Counter sensor
                                                                                                                    - Dual battery energy tracking
                                                                                                                    
                                                                                                                    ---
                                                                                                                    
                                                                                                                    ## 🇵🇱 Polski
                                                                                                                    
                                                                                                                    ### Co to jest?
                                                                                                                    **Battery Fusion** to integracja dla Home Assistant, która pozwala na **precyzyjne monitorowanie i zarządzanie magazynami energii** podłączonymi do dowolnego falownika.
                                                                                                                    
                                                                                                                    Rozwiązuje dwa główne problemy:
                                                                                                                    - Falowniki pokazują niedokładny SoC (±15–20%)
                                                                                                                    - Brak obsługi mieszanych lub wielu baterii
                                                                                                                    
                                                                                                                    ### Jak działa?
                                                                                                                    System liczy energię metodą **Coulomb Counting** (całkowanie mocy po czasie) — dokładność ±5%, znacznie lepsza niż pomiar napięciowy.
                                                                                                                    
                                                                                                                    Opcjonalnie: **Adaptacyjne uczenie** automatycznie koryguje dryf licznika na podstawie ręcznie wpisywanych odczytów z BMS.
                                                                                                                    
                                                                                                                    ### Schemat
                                                                                                                    ```
                                                                                                                    [Bateria 1 (np. Felicity 12.5 kWh)] ──DC──┐
                                                                                                                                                               ├──► Deye / Sofar / Victron
                                                                                                                                                               [Bateria 2 (np. JK BMS 17 kWh)]    ──DC──┘
                                                                                                                                                               
                                                                                                                                                               Falownik ──WiFi/LAN──► Home Assistant
                                                                                                                                                                                          │
                                                                                                                                                                                                                     ├── Coulomb Counter
                                                                                                                                                                                                                                                ├── Adaptacyjne uczenie
                                                                                                                                                                                                                                                                           └── Automatyzacje (alerty, kalibracja)
                                                                                                                                                                                                                                                                           ```
                                                                                                                                                                                                                                                                           
                                                                                                                                                                                                                                                                           ---
                                                                                                                                                                                                                                                                           
                                                                                                                                                                                                                                                                           ## Credits
                                                                                                                                                                                                                                                                           
                                                                                                                                                                                                                                                                           - [YamBMS](https://github.com/Sleeper85/esphome-yambms) — multi-BMS aggregation for ESPHome
                                                                                                                                                                                                                                                                           - [esphome-deye-inverter](https://github.com/Lewa-Reka/esphome-deye-inverter) — Deye integration (PL community)
                                                                                                                                                                                                                                                                           - [Batmon-HA](https://github.com/fl4p/batmon-ha) — BMS Bluetooth monitoring
                                                                                                                                                                                                                                                                           
                                                                                                                                                                                                                                                                           ---
                                                                                                                                                                                                                                                                           
                                                                                                                                                                                                                                                                           ## License
                                                                                                                                                                                                                                                                           
                                                                                                                                                                                                                                                                           MIT — use freely, share improvements.
