# 🔋 Battery Fusion — Home Assistant

> Inteligentne zarządzanie dwoma równoległymi magazynami energii LiFePO4 w Home Assistant z Coulomb Counting i YamBMS.

---

## 🇵🇱 Polski

### Co to jest?

**Battery Fusion** to integracja dla Home Assistant która pozwala na **precyzyjne monitorowanie i zarządzanie dwoma różnymi magazynami energii** podłączonymi równolegle do falownika Deye (lub podobnego).

Problem: falownik widzi obie baterie jako jedną, ale nie zna prawdziwego łącznego SoC.  
Rozwiązanie: HA liczy energię metodą Coulomb Counting i zarządza systemem na podstawie rzeczywistych danych.

### Moja konfiguracja

| Komponent | Model | Parametry |
|---|---|---|
| Falownik | Deye SUN-8K-SG04LP3-EU | 8 kW, 3-fazowy LV |
| Bateria 1 | Felicity ESS LUX-E-48250LG03 | 12.5 kWh · 250 Ah · 51.2V |
| Bateria 2 | JK BMS V19 (330 Ah) | 17 kWh · 330 Ah · 51.2V |
| Łącznie | — | **29.5 kWh** |
| PV | — | 7 kW (panele zachód + wschód) |
| ESP32 | WaveShare ESP32-S3-RS485-CAN | YamBMS (wkrótce) |

### Jak działa?

```
[Felicity 12.5 kWh] ──P+/P-──┐
                               ├──► Deye BAT (magistrala DC 48V)
[JK BMS 17 kWh]    ──P+/P-──┘

[JK BMS] ──UART TTL──► ESP32 YamBMS ──CAN Pylontech──► Deye
[Felicity] ──fizycznie równolegle──► magistrala (BMS lokalny)

ESP32 ──WiFi──► Home Assistant
                    │
                    ├── Coulomb Counter (SoC łączny)
                    ├── PV BRAIN (automatyzacje)
                    └── Dashboard Battery Fusion
```

### Komponenty integracji

#### 1. Coulomb Counter (`sensor.battery_soc_coulomb`)
Liczy energię w bateriach metodą całkowania mocy po czasie.  
Dokładność: **±5%** (znacznie lepsza niż pomiar napięciowy ±15-20%).

```yaml
# templates.yaml
- sensor:
    - name: "Battery SOC Coulomb"
      unique_id: battery_soc_coulomb
      unit_of_measurement: "%"
      device_class: battery
      state_class: measurement
      state: >
        {{ (states('input_number.battery_energy_kwh') | float(0) / 29.5 * 100) | round(1) }}
      attributes:
        energy_kwh: "{{ states('input_number.battery_energy_kwh') | float(0) | round(3) }}"
        capacity_kwh: 29.5
        felicity_kwh: "{{ (states('input_number.battery_energy_kwh') | float(0) * 12.5 / 29.5) | round(2) }}"
        jk_bms_kwh: "{{ (states('input_number.battery_energy_kwh') | float(0) * 17.0 / 29.5) | round(2) }}"
        felicity_soc_pct: "{{ ((states('input_number.battery_energy_kwh') | float(0) * 12.5 / 29.5) / 12.5 * 100) | round(1) }}"
        jk_bms_soc_pct: "{{ ((states('input_number.battery_energy_kwh') | float(0) * 17.0 / 29.5) / 17.0 * 100) | round(1) }}"
        note: "Wartości per-battery to ESTYMACJA proporcjonalna — baterie nie rozładowują się idealnie proporcjonalnie"
```

> ⚠️ **Uwaga:** `felicity_soc_pct` i `jk_bms_soc_pct` to **estymacje proporcjonalne**, nie rzeczywiste odczyty z BMS.  
> W praktyce baterie rozładowują się nieproporcjonalnie (różne rezystancje wewnętrzne, BMS).  
> Używaj tych wartości tylko orientacyjnie. Docelowe rozwiązanie: YamBMS + CAN → Deye (±2% SoC).

#### 2. Licznik energii (`input_number.battery_energy_kwh`)
```yaml
# configuration.yaml
input_number:
  battery_energy_kwh:
    name: "Energia w bateriach (kWh)"
    min: 0
    max: 29.5
    step: 0.001
    unit_of_measurement: kWh
    icon: mdi:battery-charging
```

#### 3. Automatyzacja Coulomb Counter (co 1 minutę)
```yaml
# automations.yaml
- alias: "🔋 Battery Coulomb Counter (co 1 min)"
  id: battery_coulomb_counter_co_1_min
  trigger:
    - platform: time_pattern
      minutes: "/1"
  action:
    - variables:
        power: "{{ states('sensor.inverter_battery_power') | float(0) }}"
        current_kwh: "{{ states('input_number.battery_energy_kwh') | float(0) }}"
        delta_kwh: "{{ power / 1000 / 60 }}"
        new_kwh: >
          {% if power > 0 %}
            {{ [0.0, [29.5, current_kwh - delta_kwh] | min] | max }}
          {% else %}
            {{ [0.0, [29.5, current_kwh + (delta_kwh | abs * 0.97)] | min] | max }}
          {% endif %}
    - service: input_number.set_value
      target:
        entity_id: input_number.battery_energy_kwh
      data:
        value: "{{ new_kwh | round(3) }}"
  mode: single
```

> **Uwaga dla falownika Deye:** wartość dodatnia `sensor.inverter_battery_power` = rozładowanie, ujemna = ładowanie.  
> Sprawność ładowania przyjęta na **97%** — rzadko uwzględniane, a ma znaczący wpływ na dokładność długoterminową.

#### 4. Automatyczna kalibracja przy pełnym naładowaniu *(v1.1)*

Kluczowa poprawa eliminująca **dryf licznika**. Po kilku dniach błędy pomiaru mocy, opóźnienia i straty powodują rozjazd nawet 10–20%. Automatyczna kalibracja przy punktach granicznych (100% i 0%) zeruje te błędy.

```yaml
- alias: "🔋 Battery Coulomb: Kalibracja przy pełnym naładowaniu"
  id: battery_coulomb_kalibracja_pelna
  trigger:
    - platform: numeric_state
      entity_id: sensor.inverter_battery_voltage
      above: 55.0
      for: "00:05:00"
  condition:
    - condition: template
      value_template: >
        {{ states('sensor.inverter_battery_power') | float(0) | abs < 200 }}
  action:
    - service: input_number.set_value
      target:
        entity_id: input_number.battery_energy_kwh
      data:
        value: 29.5
    - service: persistent_notification.create
      data:
        title: "🔋 Coulomb Counter — kalibracja 100%"
        message: >
          Licznik skalibrowany do 29.5 kWh (pełne naładowanie).
          Napięcie: {{ states('sensor.inverter_battery_voltage') }} V
  mode: single
```

#### 5. Automatyczna kalibracja przy minimalnym SoC *(v1.1)*

```yaml
- alias: "🔋 Battery Coulomb: Kalibracja przy minimalnym SoC"
  id: battery_coulomb_kalibracja_pusta
  trigger:
    - platform: numeric_state
      entity_id: sensor.inverter_battery_voltage
      below: 48.2
      for: "00:03:00"
  action:
    - service: input_number.set_value
      target:
        entity_id: input_number.battery_energy_kwh
      data:
        value: 1.5
    - service: persistent_notification.create
      data:
        title: "🔋 Coulomb Counter — kalibracja 0%"
        message: >
          Licznik skalibrowany do 1.5 kWh (bateria prawie pusta).
          Napięcie: {{ states('sensor.inverter_battery_voltage') }} V
  mode: single
```

#### 6. Ochrona przed przeciążeniem JK BMS *(v1.1)*

Gdy Felicity odcina się przez swój BMS, cały prąd rozładowania przepływa przez JK BMS. Automatyzacja wykrywa ten scenariusz i wysyła natychmiastowy alert.

```yaml
- alias: "⚠️ Battery Fusion: Alert przeciążenia JK BMS"
  id: battery_fusion_alert_przeciazenie
  trigger:
    - platform: numeric_state
      entity_id: sensor.inverter_battery_current
      above: 120
      for: "00:00:30"
  condition:
    - condition: numeric_state
      entity_id: sensor.inverter_battery_power
      above: 5000
  action:
    - service: persistent_notification.create
      data:
        title: "⚠️ UWAGA: Przeciążenie JK BMS!"
        message: >
          Prąd rozładowania: {{ states('sensor.inverter_battery_current') }} A
          Moc: {{ states('sensor.inverter_battery_power') }} W
          Możliwe odcięcie Felicity przez BMS!
          Sprawdź fizycznie stan obu baterii.
    - service: notify.mobile_app_oneplus_watch_2_3370
      data:
        title: "⚠️ Przeciążenie JK BMS"
        message: "Prąd {{ states('sensor.inverter_battery_current') }}A > 120A. Sprawdź Felicity!"
  mode: single
```

#### 7. Ostrzeżenie niskiego SoC *(v1.1)*

```yaml
- alias: "🔋 Battery Fusion: Ostrzeżenie niskiego SoC"
  id: battery_fusion_niski_soc
  trigger:
    - platform: numeric_state
      entity_id: sensor.battery_soc_coulomb
      below: 15
      for: "00:02:00"
  action:
    - service: persistent_notification.create
      data:
        title: "🔋 Niski SoC baterii!"
        message: >
          Łączny SoC: {{ states('sensor.battery_soc_coulomb') }}%
          Energia: {{ states('input_number.battery_energy_kwh') }} kWh
          Felicity szacowany: {{ state_attr('sensor.battery_soc_coulomb', 'felicity_soc_pct') }}%
          JK BMS szacowany: {{ state_attr('sensor.battery_soc_coulomb', 'jk_bms_soc_pct') }}%
  mode: single
```

### Kalibracja

**Automatyczna** — wyzwala się przy punktach granicznych napięcia:

| Warunek | Czas | Akcja |
|---|---|---|
| Napięcie > 55.0V i moc < 200W | 5 minut | Reset do **29.5 kWh (100%)** |
| Napięcie < 48.2V | 3 minuty | Reset do **1.5 kWh (~5%)** |

**Ręczna** — po restarcie HA lub gdy wartość wyraźnie dryfuje:

1. Odczytaj % z wyświetlacza JK BMS
2. Odczytaj % z wyświetlacza Felicity (lub historii HA)
3. Oblicz: `Felicity% × 12.5 + JK% × 17.0`
4. Ustaw w HA: `input_number.battery_energy_kwh = wynik`

Przykład: Felicity 40% + JK 50% = `0.4×12.5 + 0.5×17.0 = 5.0 + 8.5 = 13.5 kWh`

### Plan docelowy (YamBMS)

```
[JK BMS] ──UART TTL──► WaveShare ESP32-S3-RS485-CAN ──CAN──► Deye
                              │
                              └──WiFi──► HA (ESPHome + Bluetooth Proxy)
```

> ⚠️ **Ważne (rekomendacja eksperta):** JK BMS podłącz przez **UART TTL** (TX/RX/GND), nie RS485.  
> 90% modeli JK BMS działa stabilnie tylko przez UART. RS485 bywa niestabilne lub używa innego protokołu.  
> Felicity ma zamknięty protokół RS485 — **nie podłączaj do YamBMS**. Zostaw ją tylko fizycznie na magistrali DC.

Po wdrożeniu ESP32 z YamBMS:
- Deye dostanie prawdziwy SoC przez CAN (protokół Pylontech)
- Dokładność wzrośnie do **±2%**
- Coulomb Counter stanie się sensorem weryfikującym

---

## 🇬🇧 English

### What is this?

**Battery Fusion** is a Home Assistant integration for **accurate monitoring and management of two different LiFePO4 battery banks** connected in parallel to a Deye inverter.

The inverter sees both batteries as one but doesn't know the true combined SoC.  
Solution: HA uses Coulomb Counting to track energy accurately.

### System Architecture

```
[Felicity 12.5 kWh] ──DC──┐
                            ├──► Deye SUN-8K (48V DC bus)
[JK BMS 17 kWh]    ──DC──┘

[JK BMS] ──UART──► ESP32 YamBMS ──CAN Pylontech──► Deye
[Felicity] ──parallel DC──► bus (protected by local BMS)

ESP32 ──WiFi──► Home Assistant
                    ├── Coulomb Counter
                    ├── PV BRAIN automations
                    └── Battery Fusion Dashboard
```

### Key Features

- **Coulomb Counting** — energy integration for ±5% accuracy SoC
- **Charging efficiency (0.97)** — rarely implemented, significantly improves long-term accuracy
- **Auto-calibration** — resets counter at voltage boundaries to eliminate drift *(v1.1)*
- **Dual battery tracking** — proportional kWh estimates for each bank *(estimation only)*
- **JK BMS overload protection** — alert when Felicity disconnects *(v1.1)*
- **Low SoC warning** — notification below 15% *(v1.1)*
- **PV BRAIN** — smart charging/discharging based on RCE prices and Solcast forecast
- **YamBMS ready** — prepared for ESP32 + CAN integration

### Sign convention (Deye inverter)

```
sensor.inverter_battery_power > 0  →  DISCHARGING (battery → home/grid)
sensor.inverter_battery_power < 0  →  CHARGING (PV/grid → battery)
```

### Per-battery SoC — important disclaimer

`felicity_soc_pct` and `jk_bms_soc_pct` are **proportional estimates**, not real BMS readings.  
In practice, batteries do not discharge proportionally — it depends on internal resistance, temperature, and BMS cutoff behavior.  
Use global SoC as the primary metric. Per-battery values are for reference only.

### Auto-calibration points

| Trigger | Condition | Action |
|---|---|---|
| Voltage > 55.0V for 5 min | Power < 200W (absorption phase) | Set to 29.5 kWh (100%) |
| Voltage < 48.2V for 3 min | — | Set to 1.5 kWh (~5%) |

### Calibration (manual)

When SoC drifts, recalibrate manually:
1. Read % from JK BMS display
2. Read % from Felicity display
3. Calculate: `Felicity% × 12.5 + JK% × 17.0 = kWh`
4. Set `input_number.battery_energy_kwh` to result

### ESP32 / YamBMS wiring note

> ⚠️ Connect JK BMS via **UART TTL** (TX/RX/GND), NOT RS485.  
> Felicity has a proprietary RS485 protocol — leave it on the DC bus only, do not connect to YamBMS.

---

## Roadmap

- [x] Parallel battery connection (Felicity + JK BMS)
- [x] Coulomb Counter sensor with 97% charging efficiency
- [x] PV BRAIN integration (52 automations updated)
- [x] Battery capacity corrected to 29.5 kWh
- [x] Auto-calibration at 100% and ~0% voltage boundaries *(v1.1)*
- [x] JK BMS overload alert — Felicity disconnect scenario *(v1.1)*
- [x] Low SoC warning automation *(v1.1)*
- [x] Per-battery estimation disclaimer *(v1.1)*
- [ ] WaveShare ESP32-S3-RS485-CAN (ordered)
- [ ] YamBMS firmware (UART JK BMS → CAN Deye)
- [ ] Bluetooth Proxy for JK BMS monitoring
- [ ] EMHASS optimization layer

---

## Changelog

### v1.1 — Expert review fixes
- Added auto-calibration at full charge (voltage > 55V) and near-empty (voltage < 48.2V)
- Added JK BMS overload protection alert (current > 120A)
- Added low SoC warning (< 15%)
- Added disclaimer: per-battery SoC values are proportional estimates
- Added UART vs RS485 guidance for JK BMS / Felicity
- Added charging efficiency note (0.97) to documentation

### v1.0 — Initial release
- Coulomb Counter sensor
- Dual battery energy tracking
- PV BRAIN integration

---

## Credits

- [YamBMS](https://github.com/Sleeper85/esphome-yambms) — multi-BMS aggregation for ESPHome
- [esphome-deye-inverter](https://github.com/Lewa-Reka/esphome-deye-inverter) — Deye Modbus integration (PL community)
- [Batmon-HA](https://github.com/fl4p/batmon-ha) — BMS Bluetooth monitoring

---

## License

MIT — use freely, share improvements.
