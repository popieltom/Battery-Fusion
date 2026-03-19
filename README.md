# Battery Fusion

> **Two different batteries. One intelligent system. No extra hardware.**

You have two energy storage systems — maybe different brands, different ages, or different chemistries. Your inverter doesn't know about both of them. Your Home Assistant sees them as separate things. And someone probably told you that you need an expensive EMS controller to make them work together.

**Battery Fusion says: you probably don't.**

---

## The real problem

Most home energy storage setups with two batteries face the same issues:

- The inverter shows the wrong SoC because it only accounts for one battery
- There's no unified view of total available energy
- Automations like "charge when electricity is cheap" only work well with accurate SoC
- Adding hardware (EMS box, CAN bridge, ESP32 controller) costs hundreds of euros and adds complexity

The root cause is simple: two batteries, two separate data sources, no common logic layer.

---

## The idea behind Battery Fusion

Home Assistant is already running in your house. It already reads data from your inverter. It already knows when electricity is cheap.

**Battery Fusion turns Home Assistant into the intelligent layer that connects your batteries.**

It reads the energy flowing in and out of your system, builds its own State of Charge model using Coulomb Counting, auto-calibrates at voltage boundaries, and presents everything as one unified system — with no extra hardware required.

---

## What you actually get

| Entity | Description |
|--------|-------------|
| `sensor.battery_fusion_soc` | Combined State of Charge for your whole battery system (%) |
| `sensor.battery_fusion_power_normalized` | Normalized power flow: positive = discharge, negative = charge |
| `sensor.battery_fusion_status` | System state: `charging` / `discharging` / `idle` / `low_soc` |

**Plus:**

- **Automatic calibration** at full charge (100%) and near-empty (~0%)
- **Overload alert** when one battery's BMS disconnects and the other takes the full load
- **Low SoC notification** with proportional per-battery energy estimates
- **Nightly status log** to track Coulomb counter drift over time
- **Adaptive learning module** (v2.1) — self-correcting efficiency using OCV curves and EMA averaging
- **Live dashboard** — standalone HTML widget showing combined SoC, power flow, and per-battery status

---

## What this is NOT

Battery Fusion is **not** a replacement for:

- Your BMS (Battery Management System) — it handles hardware-level cell protection
- Inverter safety protections
- Electrical installation decisions

It is a **software layer** that improves visibility and enables smarter automations. It does not control your hardware directly.

> Per-battery SoC values are **proportional estimates**, not individual BMS readings. Real discharge ratios depend on internal resistance and BMS behavior.

---

## Who this is for

- You have **two different battery systems** connected to the same inverter
- You use **Home Assistant** and want one unified SoC sensor for automations
- Your inverter supports one of: **Deye, Sofar, Growatt, Victron, Solis** — or any inverter with a HA integration
- You want to avoid buying **additional EMS hardware** just to get combined monitoring
- You're expanding your storage capacity and want the new battery to be part of the same logical system

---

## Quick start

**1. Copy the packages**

```
Battery-Fusion/packages/ → your_ha_config/packages/
```

**2. Add to `configuration.yaml`**

```yaml
homeassistant:
  packages:
    bf_config:       !include packages/bf_configuration.yaml
    bf_templates:    !include packages/bf_templates.yaml
    bf_automations:  !include packages/bf_automations.yaml
    bf_scripts:      !include packages/bf_scripts.yaml
    # Optional adaptive learning:
    # bf_learning:   !include packages/bf_learning.yaml
```

**3. Configure your sensors** via HA UI (Settings → Helpers):

- Enter your inverter's battery power / voltage / current entity IDs
- Set battery capacities in kWh
- Set calibration voltages for your chemistry (see table below)
- Set initial energy value: `(bat1_soc% / 100 × cap1_kWh) + (bat2_soc% / 100 × cap2_kWh)`

**4. Restart Home Assistant**

Full step-by-step: [docs/INSTALLATION.md](docs/INSTALLATION.md)

---

## FAQ

### Why does Battery Fusion SoC differ from the inverter at first?

This is normal at startup.

Battery Fusion begins with the initial value you set and then tracks real energy flow using its own Coulomb counter. The inverter often estimates SoC differently and may only see part of the system.

Because of that, the values can differ at the beginning.

After a few charge/discharge cycles — especially after a full charge (100%) and a deep discharge (near 0%) — the system auto-calibrates and the values should get much closer.

If the difference stays large, check:
- correct power sign (charge vs discharge),
- correct voltage and current sensors,
- accurate battery capacity values,
- whether at least one full calibration cycle has occurred.

---

## How it works

```
[Inverter] ──sensor data──> [Home Assistant] ──> [Battery Fusion]
                                                        │
                             ┌──────────────────────────┼──────────────────────────┐
                             │                          │                          │
                   Coulomb Counter              OCV Correction             Overload Alert
                 (energy integration)          (rest detection)           (BMS disconnect)
                             │                          │
                             └──────────────────────────┘
                                           │
                              sensor.battery_fusion_soc
                              sensor.battery_fusion_status
                              sensor.battery_fusion_power_normalized
```

**Coulomb Counting**: Every minute, `power × time` is integrated to track energy in/out. Charging efficiency (default 97%, adaptive) is applied.

**Auto-calibration**: When voltage exceeds the "full" threshold for 5 minutes → counter resets to 100%. When voltage drops below "empty" for 3 minutes → counter resets to ~2%.

**Adaptive learning** *(optional)*: After each calibration, the system learns the actual charging efficiency using exponential moving average (70% old / 30% new). After ~7 calibrations, drift typically drops below 1%.

**OCV correction** *(optional)*: When the battery is idle for 10+ minutes, voltage = Open Circuit Voltage. The system gently corrects the Coulomb counter using the LiFePO4 voltage curve.

---

## Supported systems

| Inverter | Typical entity | Sign convention |
|----------|----------------|-----------------|
| Deye / Solarman | `sensor.inverter_battery_power` | Positive = discharge |
| Sofar | `sensor.sofar_battery_power` | Enable sign inversion |
| Growatt | `sensor.growatt_battery_power` | Positive = discharge |
| Victron | `sensor.battery_power` | Check your setup |
| Solis | Via Modbus HA integration | Check your setup |
| Any inverter | Any HA sensor | Fully configurable |

**Battery chemistries**: LiFePO4, NMC, Lead-acid — configure voltage thresholds accordingly.

| Chemistry | Full voltage | Empty voltage |
|-----------|-------------|---------------|
| LiFePO4 16S | 55.0 V | 48.2 V |
| LiFePO4 15S | 51.5 V | 45.0 V |
| NMC 14S | 58.8 V | 42.0 V |
| Lead-acid | 54.0 V | 46.0 V |

---

## Project structure

```
Battery-Fusion/
├── packages/
│   ├── bf_configuration.yaml   ← fill in your sensor entity IDs and capacities
│   ├── bf_templates.yaml       ← SoC, power, and status sensors
│   ├── bf_automations.yaml     ← Coulomb counter, calibration, alerts
│   ├── bf_scripts.yaml         ← calibration scripts (apply / calibrate from voltage)
│   └── bf_learning.yaml        ← adaptive learning module (optional)
├── dashboard/
│   ├── battery_fusion_card.yaml  ← Lovelace entities card (paste into Manual Card)
│   └── battery_fusion_live.html  ← standalone live monitoring widget
├── docs/
│   ├── INSTALLATION.md         ← step-by-step setup guide
│   ├── FAQ.md                  ← common questions
│   ├── WHY_IT_EXISTS.md        ← project philosophy
│   ├── USE_CASES.md            ← scenarios where this helps
│   ├── DISCLAIMER.md           ← important limitations
│   └── README_PL.md            ← Polish version of this README
├── hacs.json
└── LICENSE
```

---

## Lovelace card

Battery Fusion includes a ready-to-paste Lovelace dashboard card at `dashboard/battery_fusion_card.yaml`.

**How to add it:**

1. Open your Lovelace dashboard → **Edit mode**
2. Click **Add card → Manual**
3. Paste the content of `dashboard/battery_fusion_card.yaml`
4. Save

**The card shows:**

| Section | Entities |
|---------|----------|
| State of Charge | Combined SoC, Battery 1 SoC (est.), Battery 2 SoC (est.) |
| Energy & Power | Total Energy (kWh), Power (W), State |
| Calibration | Battery 1 initial SoC, Battery 2 initial SoC, Apply calibration, Calibrate from voltage |

**No entity IDs need to be changed** if you installed Battery Fusion using the standard package names.

If you renamed any helpers, update the `entity:` values in the card to match.

> This is a universal template. It does not reference any specific hardware brand, inverter model, or location. The names "Battery 1" and "Battery 2" are generic labels — they refer to your actual batteries via the capacity values you configured in `bf_configuration.yaml`.

**Calibration workflow:**

- Set "Battery 1 initial SoC" and "Battery 2 initial SoC" sliders to your actual battery charge levels
- Press **Apply calibration** → the Coulomb counter is recalculated immediately
- Or press **Calibrate from voltage** → SoC is estimated from the current battery voltage (best after 10+ minutes idle)

---

## Roadmap

- [x] Universal Coulomb Counter (v2.0)
- [x] Auto-calibration at voltage boundaries
- [x] Adaptive learning with OCV correction (v2.1)
- [x] Live HTML dashboard
- [ ] HACS integration (in progress)
- [x] Lovelace dashboard YAML card (`dashboard/battery_fusion_card.yaml`)
- [ ] Support for 3+ batteries with individual sensor inputs
- [ ] Energy dashboard integration

---

## License

MIT — use freely, modify, share. See [LICENSE](LICENSE).

---

*Battery Fusion is not affiliated with any inverter or battery manufacturer.*
*Use at your own responsibility. Read [docs/DISCLAIMER.md](docs/DISCLAIMER.md) before deploying.*
