# Installation Guide

## Prerequisites

- Home Assistant 2024.1.0 or newer
- At least one battery connected to an inverter that has a Home Assistant integration
- Basic familiarity with Home Assistant configuration files (`configuration.yaml`)

---

## Step 1: Get the files

**Option A: Manual download**

Download or clone this repository:

```bash
git clone https://github.com/popieltom/Battery-Fusion.git
```

Copy the `packages/` folder to your Home Assistant config directory (same place as `configuration.yaml`).

**Option B: HACS** *(coming soon)*

Battery Fusion will be available as a HACS integration in a future release.

---

## Step 2: Add packages to your HA config

In your `configuration.yaml`, add:

```yaml
homeassistant:
  packages:
    bf_config:       !include packages/bf_configuration.yaml
    bf_templates:    !include packages/bf_templates.yaml
    bf_automations:  !include packages/bf_automations.yaml
```

To also enable the adaptive learning module (optional):

```yaml
    bf_learning:     !include packages/bf_learning.yaml
```

---

## Step 3: Configure your system

After restarting Home Assistant, configure the helpers via the UI:
**Settings → Devices & Services → Helpers**

Or edit values directly in `packages/bf_configuration.yaml`.

### Required settings

| Helper | What to enter | Example |
|--------|---------------|---------|
| `input_text.bf_power_sensor` | Entity ID of battery power sensor | `sensor.inverter_battery_power` |
| `input_text.bf_voltage_sensor` | Entity ID of battery voltage sensor | `sensor.inverter_battery_voltage` |
| `input_text.bf_current_sensor` | Entity ID of battery current sensor | `sensor.inverter_battery_current` |
| `input_number.bf_battery_1_capacity_kwh` | Capacity of battery 1 in kWh | `12.5` |
| `input_number.bf_battery_2_capacity_kwh` | Capacity of battery 2 in kWh (set 0 for single battery) | `16.0` |

### Calibration voltages

Set these for your battery chemistry:

| Chemistry | Full voltage | Empty voltage |
|-----------|-------------|---------------|
| LiFePO4 16S | 55.0 V | 48.2 V |
| LiFePO4 15S | 51.5 V | 45.0 V |
| NMC 14S | 58.8 V | 42.0 V |
| Lead-acid | 54.0 V | 46.0 V |

Set `input_number.bf_voltage_full` and `input_number.bf_voltage_empty` accordingly.

### Power sign convention

Different inverters use different sign conventions. Set `input_boolean.bf_power_sign_inverted` based on your inverter:

| Inverter | Convention | Setting |
|----------|------------|---------|
| Deye, Growatt, Solis | Positive = discharge | OFF (default) |
| Sofar, some Victron | Negative = discharge | ON |

To verify: watch `sensor.battery_fusion_power_normalized` while the battery is clearly discharging. It should show a **positive** value. If it shows negative, toggle the sign inversion.

---

## Step 4: Set the initial SoC

Before the Coulomb counter can track accurately, you need to set the initial energy value.

Go to: **Settings → Helpers → BF: Energy in batteries (kWh)**

Calculate the value:

```
bf_battery_energy_kwh = (Battery1_SoC% / 100 × capacity1_kWh)
                      + (Battery2_SoC% / 100 × capacity2_kWh)
```

Example: Battery 1 at 80% (12.5 kWh) + Battery 2 at 75% (16.0 kWh):

```
0.80 × 12.5 + 0.75 × 16.0 = 10.0 + 12.0 = 22.0 kWh
```

The system will auto-calibrate at the next full charge or near-empty event, so precision here matters less over time.

---

## Step 5: Restart and verify

After restart, check these entities exist and have sensible values:

| Entity | Expected |
|--------|----------|
| `sensor.battery_fusion_soc` | A % value matching your actual charge level |
| `sensor.battery_fusion_power_normalized` | Changes when battery charges/discharges |
| `sensor.battery_fusion_status` | Shows `charging`, `discharging`, or `idle` |

---

## Optional: Live dashboard

The `dashboard/battery_fusion_live.html` file is a standalone monitoring widget.

1. Copy it to your Home Assistant `www/` folder
2. Access it at: `http://your-ha-ip:8123/local/battery_fusion_live.html`
3. You may need to update entity IDs and your Long-Lived Access Token inside the file

---

## Troubleshooting

**`sensor.battery_fusion_soc` shows 0% or wrong value**
Set `input_number.bf_battery_energy_kwh` to the correct initial value (Step 4).

**Power shows wrong sign (charging looks like discharging)**
Toggle `input_boolean.bf_power_sign_inverted`.

**Automations not appearing in HA**
Check that the YAML syntax is valid and there are no `automation:` key conflicts in your config.

**Helpers don't appear after restart**
Verify the `!include` paths in `configuration.yaml` are correct and the files exist.

For more answers: [FAQ.md](FAQ.md)
