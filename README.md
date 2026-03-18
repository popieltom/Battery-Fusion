# Battery-Fusion
Inteligentne zarządzanie dwoma równoległymi magazynami energii LiFePO4 w Home Assistant z Coulomb Counting i YamBMS.
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
        energy_kwh: "{{ states('input_number.battery_energy_kwh') }}"
        capacity_kwh: 29.5
        felicity_kwh: "{{ (states('input_number.battery_energy_kwh') | float(0) * 12.5 / 29.5) | round(2) }}"
        jk_bms_kwh: "{{ (states('input_number.battery_energy_kwh') | float(0) * 17.0 / 29.5) | round(2) }}"
        felicity_soc_pct: "{{ ((states('input_number.battery_energy_kwh') | float(0) * 12.5 / 29.5) / 12.5 * 100) | round(1) }}"
        jk_bms_soc_pct: "{{ ((states('input_number.battery_energy_kwh') | float(0) * 17.0 / 29.5) / 17.0 * 100) | round(1) }}"
```

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

#### 3. Automatyzacja Coulomb Counter
```yaml
# automations.yaml
- alias: "🔋 Battery Coulomb Counter (co 1 min)"
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
            {{ [0, [29.5, current_kwh - delta_kwh] | min] | max }}
          {% else %}
            {{ [0, [29.5, current_kwh + (delta_kwh | abs * 0.97)] | min] | max }}
          {% endif %}
    - service: input_number.set_value
      target:
        entity_id: input_number.battery_energy_kwh
      data:
        value: "{{ new_kwh | round(3) }}"
  mode: single
```

> **Uwaga dla falownika Deye:** wartość dodatnia `sensor.inverter_battery_power` = rozładowanie, ujemna = ładowanie.

### Kalibracja

Po restarcie HA lub gdy wartość wyraźnie dryfuje:

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
- **Dual battery tracking** — separate kWh estimates for each bank
- **PV BRAIN** — smart charging/discharging based on RCE prices and Solcast forecast
- **YamBMS ready** — prepared for ESP32 + CAN integration

### Sign convention (Deye inverter)

```
sensor.inverter_battery_power > 0  →  DISCHARGING (battery → home/grid)
sensor.inverter_battery_power < 0  →  CHARGING (PV/grid → battery)
```

### Calibration

When SoC drifts, recalibrate manually:
1. Read % from JK BMS display
2. Read % from Felicity display
3. Calculate: `Felicity% × 12.5 + JK% × 17.0 = kWh`
4. Set `input_number.battery_energy_kwh` to result

---

## Roadmap

- [x] Parallel battery connection (Felicity + JK BMS)
- [x] Coulomb Counter sensor
- [x] PV BRAIN integration (52 automations updated)
- [x] Battery capacity corrected to 29.5 kWh
- [ ] WaveShare ESP32-S3-RS485-CAN (ordered)
- [ ] YamBMS firmware (UART JK BMS → CAN Deye)
- [ ] Bluetooth Proxy for JK BMS monitoring
- [ ] EMHASS optimization layer

---

## Credits

- [YamBMS](https://github.com/Sleeper85/esphome-yambms) — multi-BMS aggregation for ESPHome
- [esphome-deye-inverter](https://github.com/Lewa-Reka/esphome-deye-inverter) — Deye Modbus integration (PL community)
- [Batmon-HA](https://github.com/fl4p/batmon-ha) — BMS Bluetooth monitoring

---

## License

MIT — use freely, share improvements.
