# Use Cases

Where Battery Fusion makes the most sense.

---

## 1. Old battery + new battery

You started with one battery system and later added another one. Different brand, different parameters, no common logic. Your inverter might be reporting the SoC of only one of them.

**What Battery Fusion does**: treats both as one logical storage system. One combined SoC, one power flow model.

**Example**: 12.5 kWh Felicity ESS + 16 kWh JK BMS DIY pack on the same Deye inverter.

---

## 2. DIY battery + commercial ESS

You built your own battery and later added a commercial one (or the other way around). They don't talk to each other. They may have different chemistries, different voltage curves, different BMS behavior.

**What Battery Fusion does**: merges them into one operational model inside Home Assistant based on energy flow, not BMS communication.

---

## 3. Inverter shows wrong SoC

Many inverters calculate SoC poorly when more than one battery is involved — or when the capacity stored in the inverter settings doesn't match the real installed capacity.

**What Battery Fusion does**: builds its own SoC model based on real measured energy flow (Coulomb counting), independent of the inverter's internal estimate.

---

## 4. Avoiding expensive EMS hardware

You were told that you need a dedicated EMS (Energy Management System), CAN bus bridge, or additional controller to manage multiple batteries.

**What Battery Fusion does**: provides a working alternative for setups where both batteries are visible to the same inverter and the inverter data is accessible in Home Assistant. No extra hardware needed.

**This only applies when**: both batteries share the same DC bus and inverter reports their combined behavior. It does not apply to setups with two fully independent inverters with no shared data.

---

## 5. Price-based charging automation

You want to charge batteries when electricity is cheap (dynamic tariff, night rate) and use stored energy during expensive hours. This requires an accurate SoC reading to decide when to charge and when to stop.

**What Battery Fusion does**: provides a reliable `sensor.battery_fusion_soc` that automations can use for threshold-based decisions — charge if SoC < 20% and price < 0.10 €/kWh, etc.

---

## 6. Overload detection

When one battery disconnects (due to BMS protection, thermal shutdown, or fault), the remaining battery suddenly takes the full load. This can exceed its safe current rating.

**What Battery Fusion does**: monitors current and triggers an alert when it exceeds the configured threshold. This is a first warning — not a replacement for hardware protection.

---

## 7. Capacity expansion monitoring

You're adding a second battery to an existing installation and want to track how the total storage behaves over time — how much drift occurs, whether calibration is working, whether the new battery is delivering its expected capacity.

**What Battery Fusion does**: logs nightly status, tracks calibration count, and (with the learning module) measures actual charging efficiency over time.

---

## When Battery Fusion is NOT the right fit

- Two batteries on two completely separate inverters with no shared data source
- Installations requiring active balancing between batteries (hardware-level)
- Setups where BMS data (individual cell voltages, temperatures) is needed for safety decisions
- Any situation requiring real-time hardware control rather than software monitoring
