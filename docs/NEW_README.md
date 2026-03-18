# 🔋 Battery Fusion

**Combine different battery systems into one smart energy model in Home Assistant.**

Battery Fusion lets you connect multiple batteries (even from different manufacturers or DIY builds) into a single logical system — without requiring expensive external controllers.

---

## 🚧 The real problem

If you have (or want):
- two different batteries,
- a DIY battery + commercial ESS,
- different BMS systems,
- or an inverter that doesn't "understand" your setup...

You are usually told:

> "You need additional hardware (EMS / controller / CAN bridge)."

That often means more cost, more complexity, and more points of failure.

---

## 💡 The idea behind Battery Fusion

Instead of adding hardware, Battery Fusion uses **Home Assistant as the intelligence layer**.

It builds a **virtual combined battery system** that:
- merges multiple batteries into one logical model,
- calculates a shared SOC,
- provides one data layer for automation,
- reduces the need for manual corrections.

---

## 🔥 What you actually get

- One **combined battery SOC** instead of two conflicting values
- One **logic layer** for automation (charging / discharging decisions)
- Support for **mixed systems (DIY + commercial)**
- No dependency on a single inverter ecosystem
- No need for expensive EMS in many setups

---

## ⚠️ What this is NOT

Battery Fusion does NOT replace:
- BMS safety systems
- inverter protections
- proper electrical design

It is a **software coordination layer**, not a safety controller.

---

## 👤 Who this is for

This project is ideal if you:
- use Home Assistant,
- have (or plan) multiple battery systems,
- want to avoid buying additional control hardware,
- want better visibility and control over your energy.

---

## ⚡ Quick start

1. Copy files to `/config/packages/`
2. Add to `configuration.yaml`:

```yaml
homeassistant:
  packages:
    battery_fusion: !include_dir_named packages
```

3. Restart Home Assistant
4. Go to **Settings → Helpers** and configure batteries and sensors

---

## 🧠 How it works (simple version)

Battery Fusion:
- tracks energy flow,
- estimates total stored energy,
- continuously corrects SOC over time,
- builds a unified model of your storage system.

---

## 📁 Project structure

```text
packages/
├── bf_configuration.yaml
├── bf_templates.yaml
├── bf_automations.yaml
└── bf_learning.yaml
```

---

## 🚀 Roadmap

- Dashboard (Lovelace)
- HACS integration
- Plug & play configuration
- Advanced optimization layer

---

## 📜 License

MIT — use freely, improve, share.
