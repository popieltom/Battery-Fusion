# Frequently Asked Questions

---

## General

**Do I need extra hardware?**

No. Battery Fusion runs entirely in Home Assistant using YAML automations and template sensors. No ESP32, no CAN bridge, no EMS box.

**Does it work with my inverter?**

If your inverter has a Home Assistant integration that exposes battery power, voltage, and current as sensors — it works. Tested with Deye/Solarman, Sofar, Growatt, Victron, Solis. Any inverter with readable HA sensors will work.

**Can I use it with just one battery?**

Yes. Set `input_number.bf_battery_2_capacity_kwh` to `0` and `input_select.bf_battery_count` to `"1"`. All features work with a single battery.

**Is it free?**

Yes. MIT license. Use it, modify it, share it.

**Does it work with 3+ batteries?**

The Coulomb counter aggregates all batteries as one system, which works for any number. Per-battery estimation currently supports 2 batteries proportionally. Contributions for more batteries are welcome.

---

## Setup

**How do I find my battery sensor entity IDs?**

In Home Assistant: **Settings → Devices & Services → [your inverter integration] → Entities**. Look for entities with names containing "battery_power", "battery_voltage", "battery_current".

**What if my inverter doesn't have a separate current sensor?**

The current sensor is only used for the overload alert. You can disable the alert with `input_boolean.bf_disable_overload_alert` and leave the current sensor entity ID as a placeholder.

**How do I set the initial SoC correctly?**

Set `input_number.bf_battery_energy_kwh` to:
```
(Battery1_SoC% / 100 × capacity1_kWh) + (Battery2_SoC% / 100 × capacity2_kWh)
```

The system will auto-correct at the next calibration event (full charge or near-empty voltage), so an approximate starting value is fine.

**My helpers appeared but have wrong initial values**

Edit them via **Settings → Helpers** in the HA UI, or change the `initial:` values in `packages/bf_configuration.yaml` and restart.

---

## Accuracy

**How accurate is the SoC?**

Depends on your sensor quality and how often you reach calibration points. With good auto-calibration at full/empty voltage boundaries, drift is typically under 3-5% per cycle. The adaptive learning module (optional) reduces this further over time.

**Why does SoC drift over time?**

Coulomb counting accumulates small measurement errors. This is normal and expected. The system corrects at voltage boundaries (full/empty). Between calibrations, some drift is unavoidable.

**What is OCV correction?**

OCV = Open Circuit Voltage. When the battery has been idle for 10+ minutes, terminal voltage stabilizes and reflects actual State of Charge via a known voltage curve (for LiFePO4). Battery Fusion uses this to gently correct the Coulomb counter during rest periods.

**Does it work for NMC or Lead-acid batteries?**

The Coulomb Counter and voltage calibration work for any chemistry — just set the correct voltage thresholds. The OCV correction curve is currently hardcoded for LiFePO4 16S. For other chemistries, OCV correction will not be accurate but you can disable it with `input_boolean.bf_ocv_correction_enabled`.

**Per-battery SoC values look the same — is that correct?**

Yes. When two batteries share the same inverter bus, Battery Fusion cannot independently measure each battery's energy. The per-battery estimates are proportional — each battery is assumed to hold energy proportional to its capacity. This is an approximation, not a reading from individual BMS.

---

## Advanced

**Can I use the adaptive learning module?**

Yes. Add `packages/bf_learning.yaml` to your `configuration.yaml`. The system learns your actual charging efficiency through EMA after each calibration. After ~7 calibrations, drift typically drops below 1%.

**What happens if one battery disconnects?**

The overload alert (`battery_fusion_overload_alert`) fires when current exceeds `input_number.bf_overload_current_threshold`. This typically indicates one battery was cut off by its BMS and the other is handling the full load. Check your batteries physically when this alert fires.

**Can I use `sensor.battery_fusion_soc` in automations?**

Yes, that's the primary intended use. Use it for:
- Charge scheduling ("charge if soc < 20% and tariff is cheap")
- Discharge limits ("stop export if soc < 15%")
- Notifications ("alert if soc < 10% at night")

**Can I combine Battery Fusion with other energy management integrations?**

Yes. Battery Fusion only creates sensors and automations — it doesn't lock your inverter or modify other integrations. You can use its sensors as inputs to other automations or integrations.

---

## Dashboard

**How do I install the live dashboard?**

Copy `dashboard/battery_fusion_live.html` to your HA `www/` folder and open:
```
http://your-ha-ip:8123/local/battery_fusion_live.html
```

**The dashboard shows no data**

Make sure you've added a valid Long-Lived Access Token inside the HTML file (replace the placeholder). Also verify the entity IDs referenced in the file match your actual setup.

**Can I add the dashboard to my HA Lovelace?**

You can embed the live HTML widget using the `webpage` card:
```yaml
type: webpage
url: /local/battery_fusion_live.html
```

You can also use the native Lovelace YAML card — see below.

**How do I add the Lovelace entities card?**

Battery Fusion includes a ready-to-paste Lovelace card at `dashboard/battery_fusion_card.yaml`.

Steps:
1. Open your Lovelace dashboard in **Edit mode**
2. Click **Add card → Manual**
3. Paste the contents of `dashboard/battery_fusion_card.yaml`
4. Save

No entity ID changes are needed if you installed Battery Fusion using the standard package names from `bf_configuration.yaml`.

The card includes: Combined SoC, per-battery SoC estimates, total energy, power, system state, capacity inputs, voltage thresholds, and a manual calibration field.

**What entities does the Lovelace card use?**

All entities are created automatically by `packages/bf_configuration.yaml`:

| Entity | Description |
|--------|-------------|
| `sensor.battery_fusion_soc` | Combined SoC (%) |
| `sensor.battery_fusion_power_normalized` | Power flow (W) |
| `sensor.battery_fusion_status` | System state |
| `input_number.bf_battery_energy_kwh` | Coulomb counter / manual calibration |
| `input_number.bf_battery_1_capacity_kwh` | Battery 1 capacity |
| `input_number.bf_battery_2_capacity_kwh` | Battery 2 capacity |
| `input_number.bf_voltage_full` | Full-charge voltage threshold |
| `input_number.bf_voltage_empty` | Empty-charge voltage threshold |
| `script.battery_fusion_calibrate_from_voltage` | Voltage-based calibration (optional) |

The last entry (calibrate from voltage) requires a small script — the full YAML is included as a comment inside `battery_fusion_card.yaml`.
