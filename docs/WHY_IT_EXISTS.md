# Why Battery Fusion exists

Battery Fusion exists for one simple reason: people should not need expensive extra hardware just to make two different energy storage systems work together in a sensible way.

## The common situation

In many home and small-business installations, the reality is messy:

- One battery may be older, another newer
- One battery may be DIY, another commercial
- The batteries may use different BMS systems
- The inverter may not understand the full picture
- The user is often told that a dedicated EMS, controller, or extra hardware is required

The typical advice is: "Buy a controller box." That box costs money, adds complexity, and creates another point of failure in the system.

## A different approach

Battery Fusion takes a different approach.

It uses **Home Assistant as the intelligent layer** that combines the available information and creates one unified operational view of the storage system.

That means:

- One combined state of charge model
- One place to monitor the system
- One logic layer for automation
- One way to reduce manual intervention

## What it removes

The most common barrier for people with two batteries is:

> "I have two different batteries, so I need a special expensive box before I can make them work together."

Battery Fusion removes that barrier for the cases where it isn't actually true.

For many setups — especially where both batteries are connected to the same inverter and the inverter already reports power, voltage, and current to Home Assistant — the intelligence needed to unify them already exists in the software you already have.

## What it doesn't remove

Battery Fusion does not remove the need for:

- Proper electrical design
- BMS protection for each battery
- Inverter safety features
- Physical inspection and maintenance

It is a software coordination layer, not a safety system.

## The honest scope

Not every installation will benefit equally. Battery Fusion works best when:

- Both batteries are on the same DC bus or inverter
- The inverter reports accurate power/voltage/current data
- You're comfortable with Home Assistant configuration

If your batteries are on separate systems with no shared data path, Battery Fusion cannot help much. It works with the data you already have.

## The core idea

> You may already have enough intelligence in Home Assistant to manage two different batteries as one system — without buying anything new.

That is the core idea behind this project.
