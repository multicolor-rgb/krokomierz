# Krokomierz 🏃‍♂️

Nowoczesny krokomierz w wersji **PWA** i **Android APK**. Ciemny, sportowy interfejs, cele wyliczane z profilu, statystyki, 28 osiągnięć, tryb cichy i przypomnienia. Wszystkie dane zostają na urządzeniu — bez konta, chmury i reklam.

- 🌐 Strona: **https://krokomierz.multidev.top** (GitHub Pages, custom domain)
- 📱 Wersja PWA: **https://krokomierz.multidev.top/app/**
- 💾 APK: **https://github.com/multicolor-rgb/krokomierz/releases/latest/download/krokomierz-latest.apk**
- 💻 Repozytorium: **https://github.com/multicolor-rgb/krokomierz**
- 🚀 Releases: **https://github.com/multicolor-rgb/krokomierz/releases**
- 🧪 Podgląd Pages: **https://multicolor-rgb.github.io/krokomierz/**

## Zrzuty ekranu

| Pulpit | Tracker | Statystyki | Osiągnięcia |
|---|---|---|---|
| ![Pulpit](landing/public/screens/home-pl.png) | ![Tracker](landing/public/screens/tracker-pl.png) | ![Statystyki](landing/public/screens/stats-pl.png) | ![Osiągnięcia](landing/public/screens/badges-pl.png) |

## Funkcje

| Funkcja | Opis |
|---|---|
| **Licznik kroków** | APK: `TYPE_STEP_COUNTER` → `TYPE_STEP_DETECTOR` → akcelerometr (fallback dla Redmi 7 i telefonów bez step countera) + foreground service. PWA: akcelerometr (`DeviceMotion`). |
| **Tryb cichy** | Autostart po restarcie, liczenie bez otwierania aplikacji, ciche powiadomienie usługi, wyłączanie optymalizacji baterii i skrót do autostartu MIUI. |
| **Diagnostyka** | W APK: dostępność sensorów, aktywny sensor, uprawnienia, stan usługi, bateria, ostatnie zdarzenie, model i test 20 kroków. |
| **Długość kroku** | Automatycznie ze wzrostu (`0,415` / `0,413`) lub ręcznie 40–120 cm; używana do dystansu. |
| **Czułość** | Presety i suwak 0,5–2,0×; natywnie dla akcelerometra, w PWA dla `DeviceMotion`. |
| **Mądre cele** | Rekomendacja z wieku, wzrostu, wagi, płci, aktywności, BMI i celu. Automatyczna progresja do +20%. |
| **Statystyki** | Dzień / 7 dni / 30 dni, dystans, kalorie, aktywne minuty, rekordy, skuteczność celu, historia. |
| **Osiągnięcia** | 28 odznak: serie, rekordy, kamienie milowe (1 000 → 1 000 000 kroków), ranny ptaszek, nocny marek. |
| **Przypomnienia** | Wybór godziny i dni tygodnia. W APK natywne powiadomienia działają przy zamkniętej aplikacji. |
| **Prywatność** | IndexedDB / SharedPreferences, eksport i import JSON, pełny offline, zero kont. |
| **PL / EN** | Pełne tłumaczenie interfejsu, osiągnięć i strony internetowej. |

## Struktura repozytorium

```
krokomierz/
├── mobile/                  # aplikacja React + Capacitor
│   ├── src/                 # UI, logika, i18n, IndexedDB
│   ├── android/             # projekt Android (Java + natywny plugin)
│   ├── public/              # ikony PWA
│   └── scripts/             # generowanie ikon, zrzuty ekranu
├── landing/                 # strona internetowa PL/EN
├── scripts/
│   ├── build-apk.sh         # build + podpis + version.json
│   ├── deploy.sh            # publikacja awaryjna na nginx
│   └── security-check.sh    # blokada .git i źródeł
├── download/                # APK, AAB, SHA-256, version.json
└── assets/                  # źródłowy logotyp SVG
```

## Wymagania

- Node.js 20+
- JDK 21 (lub 17)
- Android SDK: `platforms;android-35`, `build-tools;35.0.0`, `platform-tools`
- Do zrzutów ekranu: Playwright Chromium (opcjonalnie)

## Uruchomienie lokalne

```bash
# aplikacja
cd mobile
npm ci
npm run dev            # http://localhost:5173

# strona
cd landing
npm ci
npm run dev            # http://localhost:5174
```

Tryb demo (dane przykładowe, przydatne do zrzutów):

```
http://localhost:5173/?demo=1&screen=stats&lang=pl
```

## Budowa APK

Podpisany build wymaga pliku `mobile/android/keystore.properties`:

```properties
storeFile=/ścieżka/do/release.jks
storePassword=********
keyAlias=krokomierz
keyPassword=********
```

Następnie:

```bash
JAVA_HOME=/ścieżka/do/jdk \
ANDROID_HOME=/ścieżka/do/android-sdk \
./scripts/build-apk.sh
```

Wynik:

```
download/krokomierz-1.1.2.apk
download/krokomierz-1.1.2.aab
download/krokomierz-1.1.2.apk.sha256
download/krokomierz-latest.apk
download/version.json
```

### Podpisywanie

Klucz release **nigdy nie trafia do repozytorium**. Trzymaj go poza projektem i zrób kopię zapasową — bez niego nie da się wydać aktualizacji (utrata klucza = nowy pakiet/nowa instalacja). Do GitHub Actions dodaj sekrety:

| Sekret | Wartość |
|---|---|
| `KEYSTORE_BASE64` | `base64 -w0 release.jks` |
| `KEYSTORE_PASSWORD` | hasło magazynu |
| `KEY_ALIAS` | `krokomierz` |
| `KEY_PASSWORD` | hasło klucza |

## Wdrożenie strony

```bash
./scripts/deploy.sh
```

### GitHub Pages (aktywne)

Strona i PWA są publikowane przez `.github/workflows/pages.yml` na GitHub Pages (custom domain `krokomierz.multidev.top`). APK/AAB pozostają w GitHub Releases, a `version.json` jest kopiowany na Pages z najnowszego Release.

- podgląd project site: `https://multicolor-rgb.github.io/krokomierz/`
- custom domain: `https://krokomierz.multidev.top/`

DNS w Cloudflare:

| Typ | Nazwa | Wartość | Proxy |
|---|---|---|---|
| CNAME | `krokomierz` | `multicolor-rgb.github.io` | **DNS only** (szara chmurka) |

Domena jest już podłączona przez CNAME i certyfikat Let's Encrypt GitHub Pages. Dla odtworzenia: po propagacji DNS ustaw w GitHub → Settings → Pages custom domain `krokomierz.multidev.top` i włącz **Enforce HTTPS**. Nie używaj orange cloud — GitHub Pages + proxy Cloudflare mogą powodować pętle SSL.

### Nginx (fallback)

`./scripts/deploy.sh` publikuje awaryjnie na stary nginx. Katalogi źródłowe i `.git` są blokowane przez `chmod 700` oraz `scripts/security-check.sh`.

## Dokumenty prawne

- **Polityka prywatności:** https://krokomierz.multidev.top/privacy/
- **Polityka cookies:** https://krokomierz.multidev.top/cookies/
- Kontakt: **gramodrana1@gmail.com**
- Strona nie używa cookies śledzących; dane aplikacji pozostają na urządzeniu.

## Bezpieczeństwo

`.git` został przeniesiony poza web-root (`/home/multi/krokomierz.git` + plik `gitdir`). Katalogi `mobile`, `landing`, `scripts`, `assets`, `.github` mają `chmod 700`, więc nginx nie może ich serwować. Sprawdzenie:

```bash
./scripts/security-check.sh
# /.git/config, /mobile/..., /scripts/... → 403/404
```

## Natywny licznik kroków (Android)

- `StepCounterPlugin` — uprawnienie `ACTIVITY_RECOGNITION`, start/stop usługi, odczyt dzisiejszych kroków, ręczne korekty.
- `StepService` — foreground service typu `health`, sensor `TYPE_STEP_COUNTER`, stałe powiadomienie z licznikiem.
- `StepStore` — baseline sensora, offset, obsługa nowego dnia i restartu telefonu.
- `BootReceiver` — wznawia liczenie po restarcie urządzenia.
- Powiadomienia — `@capacitor/local-notifications`, harmonogram dla wybranych dni tygodnia.

> Uwaga: Android 14+ może ograniczać start usługi z tła; liczenie wznawia się przy następnym otwarciu aplikacji.

## Ograniczenia wersji web

Przeglądarki nie mają dostępu do systemowego licznika kroków (HealthKit / Google Fit). W PWA liczenie działa, gdy aplikacja jest otwarta; na iOS wymagana jest zgoda na `DeviceMotion`. Pełne liczenie w tle zapewnia tylko APK.

## Licencja

[MIT](LICENSE) © 2026 multicolor-rgb
