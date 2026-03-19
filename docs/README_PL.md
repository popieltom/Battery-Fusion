# Battery Fusion — dokumentacja po polsku

> **Dwie różne baterie. Jeden inteligentny system. Bez dodatkowego sprzętu.**

Masz dwa magazyny energii — może różne marki, różny wiek, różną chemię. Twój falownik nie wie o obu naraz. Home Assistant widzi je jako osobne rzeczy. I ktoś prawdopodobnie powiedział Ci, że potrzebujesz drogiego sterownika EMS, żeby to spiąć.

**Battery Fusion mówi: prawdopodobnie nie potrzebujesz.**

---

## Rzeczywisty problem

Większość instalacji domowych z dwiema bateriami ma te same problemy:

- Falownik pokazuje błędny SoC, bo uwzględnia tylko jedną baterię
- Nie ma jednego widoku całkowitej dostępnej energii
- Automatyzacje "ładuj gdy prąd tani" działają dobrze tylko przy dokładnym SoC
- Dokupienie sprzętu (box EMS, mostek CAN, ESP32) kosztuje setki euro i dodaje złożoności

Przyczyna jest prosta: dwie baterie, dwa osobne źródła danych, brak wspólnej warstwy logicznej.

---

## Pomysł stojący za Battery Fusion

Home Assistant już działa w Twoim domu. Już odczytuje dane z falownika. Już wie, kiedy prąd jest tani.

**Battery Fusion zamienia Home Assistant w inteligentną warstwę łączącą Twoje baterie.**

Odczytuje energię przepływającą przez system, buduje własny model State of Charge metodą Coulomb Counting, auto-kalibruje się przy granicach napięcia i prezentuje wszystko jako jeden ujednolicony system — bez żadnego dodatkowego sprzętu.

---

## Co konkretnie dostajesz

| Encja | Opis |
|-------|------|
| `sensor.battery_fusion_soc` | Łączny Stan Naładowania całego systemu bateryjnego (%) |
| `sensor.battery_fusion_power_normalized` | Znormalizowany przepływ mocy: dodatni = rozładowanie, ujemny = ładowanie |
| `sensor.battery_fusion_status` | Stan systemu: `charging` / `discharging` / `idle` / `low_soc` |

**Dodatkowo:**

- **Automatyczna kalibracja** przy pełnym naładowaniu (100%) i prawie pustym (~0%)
- **Alert przeciążenia** gdy BMS jednej baterii ją odcina
- **Powiadomienie o niskim SoC** z szacunkami per-bateria
- **Nocny log statusu** do śledzenia dryftu licznika Coulomba
- **Moduł adaptacyjnego uczenia** (v2.1) — samokorygująca sprawność z krzywymi OCV
- **Live dashboard** — samodzielny widget HTML do monitorowania na żywo

---

## Czego to NIE zastępuje

Battery Fusion **nie zastępuje**:

- BMS (Battery Management System) — on obsługuje ochronę na poziomie ogniw
- Zabezpieczeń falownika
- Decyzji instalacyjnych

Jest **warstwą software'ową**, która poprawia widoczność i umożliwia mądrzejsze automatyzacje. Nie steruje sprzętem bezpośrednio.

> Wartości SoC per-bateria to **proporcjonalne estymacje**, nie odczyty z indywidualnych BMS.

---

## Dla kogo to jest

- Masz **dwa różne systemy bateryjne** podłączone do tego samego falownika
- Używasz **Home Assistant** i chcesz jeden ujednolicony sensor SoC dla automatyzacji
- Twój falownik to: **Deye, Sofar, Growatt, Victron, Solis** lub jakikolwiek falownik z integracją HA
- Chcesz uniknąć kupowania **dodatkowego sprzętu EMS** tylko po to, żeby monitorować całość
- Rozbudowujesz magazyn energii i chcesz, żeby nowa bateria była częścią tego samego systemu

---

## Szybki start

**1. Skopiuj packages**

```
Battery-Fusion/packages/ → twój_katalog_HA/packages/
```

**2. Dodaj do `configuration.yaml`**

```yaml
homeassistant:
  packages:
    bf_config:       !include packages/bf_configuration.yaml
    bf_templates:    !include packages/bf_templates.yaml
    bf_automations:  !include packages/bf_automations.yaml
    # Opcjonalnie moduł uczenia:
    # bf_learning:   !include packages/bf_learning.yaml
```

**3. Skonfiguruj sensory** przez UI HA (Ustawienia → Helpery):

- Wpisz entity_id sensorów mocy / napięcia / prądu z Twojego falownika
- Ustaw pojemności baterii w kWh
- Ustaw napięcia kalibracyjne dla swojej chemii
- Ustaw początkową wartość energii: `(soc_bat1% / 100 × poj1_kWh) + (soc_bat2% / 100 × poj2_kWh)`

**4. Zrestartuj Home Assistant**

Pełna instrukcja krok po kroku: [INSTALLATION.md](INSTALLATION.md)

---

## Jak to działa

**Licznik Coulomba**: Co minutę `moc × czas` jest całkowana, żeby śledzić energię wchodzącą/wychodzącą. Sprawność ładowania (domyślnie 97%, adaptacyjna) jest uwzględniana.

**Auto-kalibracja**: Gdy napięcie przekroczy próg "pełne" przez 5 minut → licznik resetuje się do 100%. Gdy napięcie spadnie poniżej "puste" przez 3 minuty → licznik resetuje się do ~2%.

**Adaptacyjne uczenie** *(opcjonalne)*: Po każdej kalibracji system uczy się rzeczywistej sprawności ładowania metodą EMA (70% stara / 30% nowa obserwacja). Po ~7 kalibracjach dryf typowo spada poniżej 1%.

**Korekcja OCV** *(opcjonalna)*: Gdy bateria jest w spoczynku przez 10+ minut, napięcie = OCV. System delikatnie koryguje licznik Coulomba korzystając z krzywej LiFePO4.

---

## Obsługiwane systemy

| Falownik | Typowa encja | Konwencja znaku |
|----------|-------------|-----------------|
| Deye / Solarman | `sensor.inverter_battery_power` | Dodatni = rozładowanie |
| Sofar | `sensor.sofar_battery_power` | Włącz odwrócenie znaku |
| Growatt | `sensor.growatt_battery_power` | Dodatni = rozładowanie |
| Victron | `sensor.battery_power` | Sprawdź swój setup |
| Solis | Przez integrację Modbus HA | Sprawdź swój setup |

**Chemia baterii**: LiFePO4, NMC, kwasowo-ołowiowe — skonfiguruj progi napięcia odpowiednio.

| Chemia | Napięcie pełne | Napięcie puste |
|--------|---------------|----------------|
| LiFePO4 16S | 55,0 V | 48,2 V |
| LiFePO4 15S | 51,5 V | 45,0 V |
| NMC 14S | 58,8 V | 42,0 V |
| Kwasowo-ołowiowe | 54,0 V | 46,0 V |

---

## Struktura projektu

```
Battery-Fusion/
├── packages/
│   ├── bf_configuration.yaml   ← wpisz entity_id sensorów i pojemności
│   ├── bf_templates.yaml       ← sensory SoC, mocy i statusu
│   ├── bf_automations.yaml     ← licznik Coulomba, kalibracja, alerty
│   └── bf_learning.yaml        ← moduł adaptacyjnego uczenia (opcjonalny)
├── dashboard/
│   └── battery_fusion_live.html  ← samodzielny widget monitorujący na żywo
├── docs/
│   ├── INSTALLATION.md         ← instrukcja instalacji krok po kroku
│   ├── FAQ.md                  ← najczęstsze pytania
│   ├── WHY_IT_EXISTS.md        ← filozofia projektu
│   ├── USE_CASES.md            ← scenariusze zastosowania
│   ├── DISCLAIMER.md           ← ważne ograniczenia
│   └── README_PL.md            ← ten plik
├── hacs.json
└── LICENSE
```

---

## Roadmapa

- [x] Universalny licznik Coulomba (v2.0)
- [x] Auto-kalibracja przy granicach napięcia
- [x] Adaptacyjne uczenie z korekcją OCV (v2.1)
- [x] Live dashboard HTML
- [ ] Integracja HACS (w przygotowaniu)
- [ ] Karta dashboard Lovelace YAML
- [ ] Wsparcie dla 3+ baterii z indywidualnymi sensorami

---

## Licencja

MIT — używaj swobodnie, modyfikuj, udostępniaj. Patrz [LICENSE](../LICENSE).

---

*Battery Fusion nie jest powiązany z żadnym producentem falowników ani baterii.*
*Używasz na własną odpowiedzialność. Przeczytaj [DISCLAIMER.md](DISCLAIMER.md) przed wdrożeniem.*
