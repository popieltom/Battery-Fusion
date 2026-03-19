# Disclaimer

Battery Fusion is a software layer built on top of Home Assistant. Please read this before deploying it in your installation.

## What Battery Fusion does NOT replace

**Battery Management Systems (BMS)**
Each battery must have its own BMS handling cell-level protection: overvoltage, undervoltage, overcurrent, overtemperature. Battery Fusion does not monitor individual cells and cannot replace these protections.

**Inverter safety features**
Your inverter's built-in protections (overvoltage, overload, short circuit) remain the primary hardware safety layer. Battery Fusion does not interact with or override these.

**Electrical installation decisions**
Cable sizing, fusing, breaker selection, battery placement, and system architecture are electrical engineering decisions. Battery Fusion is not a substitute for proper installation design or professional advice.

## Accuracy limitations

Battery Fusion's SoC estimate is based on Coulomb counting — integrating power over time. This method has known limitations:

- **Sensor accuracy**: The quality of the SoC estimate depends entirely on how accurately your inverter reports power, voltage, and current.
- **Cumulative drift**: Small measurement errors accumulate over time. The system self-corrects at voltage calibration points (full/empty), but drift between calibrations is normal.
- **Per-battery estimates**: Individual battery SoC values are **proportional estimates only**, calculated from total system energy and each battery's capacity. They do not reflect individual battery behavior, internal resistance differences, or BMS decisions.
- **Efficiency assumptions**: Default charging efficiency is 97%. The adaptive learning module adjusts this over time, but early estimates may be less accurate.

## Configuration errors

Incorrect configuration (wrong sensor entity IDs, wrong capacity values, wrong voltage thresholds, wrong sign convention) will produce incorrect SoC readings. Always verify that `sensor.battery_fusion_power_normalized` shows the correct sign and magnitude before relying on `sensor.battery_fusion_soc`.

## Responsibility

Battery Fusion is provided as-is, under the MIT license, with no warranty of any kind. The authors are not responsible for any damage to equipment, data loss, or financial loss resulting from the use of this software.

**Use at your own responsibility.**

Verify behavior in your specific setup before relying on it for automation decisions.
