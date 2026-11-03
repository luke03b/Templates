# flutter-template

Template **frontend Flutter** (web, Android, iOS) con Material 3, routing
(go_router), client API tipizzato (package:http) e un CRUD completo contro le API
comuni del repository (`/api/health`, `/api/items`, vedi
[`docs/api-contract.md`](../docs/api-contract.md)).

Pagine incluse:

| Rotta         | Pagina      | Cosa mostra                                                                 |
|---------------|-------------|------------------------------------------------------------------------------|
| `/`           | Home        | presentazione + indicatore di stato del backend (`GET /api/health`, pallino verde *Online* / rosso *Offline*) |
| `/components` | Componenti  | vetrina dei widget Material con anteprima live e codice copiabile           |
| `/items`      | Items       | CRUD completo (lista, crea, modifica, elimina) con loading, errori e errori di validazione Problem Details sui campi |
| qualsiasi altra | 404       | pagina "Page not found" con ritorno alla Home                               |

## 1. Stack e versioni

Versioni usate e verificate per questa guida (novembre 2026):

| Componente                 | Versione            | Note                                              |
|----------------------------|---------------------|---------------------------------------------------|
| Flutter SDK (stable)       | **3.47.9**          | include Dart e DevTools                           |
| Dart SDK                   | **3.13.7**          | vincolo in `pubspec.yaml`: `sdk: ^3.13.0`         |
| DevTools                   | 2.60.0              |                                                   |
| go_router                  | 18.1.2              | routing ufficiale del team Flutter               |
| http                       | 1.6.0               | client HTTP ufficiale Dart (+ `MockClient` per i test) |
| cupertino_icons            | 2.0.0               | icone iOS usate da alcuni widget del framework   |
| flutter_lints              | 6.0.0               | regole di lint raccomandate                       |
| Android: Gradle / AGP / Kotlin | 9.3.1 / 9.1.0 / 2.4.0 | generati da `flutter create`, Java 17     |
| iOS deployment target      | 15.0                |                                                   |
| Docker build stage         | `buildpack-deps:trixie` + tarball Flutter 3.47.9 (checksum SHA-256 verificato) | |
| Docker runtime             | `nginx:1.30.6-alpine` | ramo stable di nginx                           |

## 2. Struttura delle cartelle

```
flutter-template/
├── lib/
│   ├── main.dart                  # bootstrap: URL strategy, dipendenze, runApp
│   ├── app.dart                   # root widget: tema + router + AppScope
│   ├── core/
│   │   ├── config/app_config.dart # API_BASE_URL (--dart-define), timeout
│   │   ├── di/app_scope.dart      # InheritedWidget che fornisce i repository
│   │   ├── router/                # app_routes.dart (percorsi) + app_router.dart (go_router)
│   │   └── theme/app_theme.dart   # UNICO file di tema: design token + ThemeData M3
│   ├── data/
│   │   ├── api/                   # ApiClient (http) + ApiException (Problem Details)
│   │   ├── models/                # Item, ItemInput, HealthStatus (fromJson/toJson)
│   │   └── repositories/          # interfacce + implementazioni HTTP
│   ├── features/                  # una cartella per pagina
│   │   ├── home/                  # pagina + BackendStatusController
│   │   ├── components/            # pagina + sections/ (un widget per esempio) + widgets/
│   │   ├── items/                 # pagina + ItemsController + widgets/ (form, riga)
│   │   └── not_found/             # pagina 404
│   └── shared/
│       ├── validators/            # validatori riutilizzabili dei form
│       └── widgets/               # AppShell, AppAlert, LoadingButton, ConfirmDialog, ...
├── test/                          # widget test delle pagine, test client API, validatori
│   └── helpers/fakes.dart         # repository finti + pumpApp()
├── web/ android/ ios/             # progetti di piattaforma (generati da flutter create)
├── nginx/default.conf.template    # config nginx del container (SPA + proxy /api)
├── Dockerfile  .dockerignore
├── analysis_options.yaml          # configurazione del linter
└── pubspec.yaml  pubspec.lock     # dipendenze (il lockfile va committato)
```

Flusso dei dati: **pagina → controller (ChangeNotifier) → repository → ApiClient → backend**.
Le pagine non conoscono HTTP; i widget in `shared/widgets` sono solo presentazionali.

## 3. Prerequisiti e installazione dell'ambiente

Serve il **Flutter SDK** (contiene già Dart). Per il web basta Chrome; per
mobile servono Android Studio (Android) e/o Xcode (iOS, solo macOS).
Download ufficiale: <https://docs.flutter.dev/get-started/install>
(archivio delle versioni: <https://docs.flutter.dev/install/archive>).

### Windows

1. Installa Git: `winget install --id Git.Git -e`.
2. Scarica lo zip di Flutter 3.47.9 stable dalla pagina ufficiale ed estrailo in
   `C:\src\flutter` (evita `C:\Program Files`, richiede permessi di amministratore).
3. Aggiungi `C:\src\flutter\bin` alla variabile `Path` dell'utente
   (Impostazioni → Sistema → Informazioni → Impostazioni di sistema avanzate → Variabili d'ambiente).
4. Opzionale per Android: `winget install Google.AndroidStudio`, poi da Android Studio
   installa SDK, command-line tools ed un emulatore; quindi `flutter doctor --android-licenses`.

### macOS

1. `xcode-select --install` (strumenti da riga di comando).
2. Con Homebrew: `brew install --cask flutter`, oppure scarica lo zip ufficiale ed
   estrailo in `~/development/flutter`, poi aggiungi a `~/.zshrc`:
   `export PATH="$HOME/development/flutter/bin:$PATH"`.
3. iOS: installa Xcode dall'App Store, poi
   `sudo xcodebuild -runFirstLaunch` e `brew install cocoapods`.
4. Android (opzionale): `brew install --cask android-studio`.

### Linux

```bash
sudo apt-get install -y curl git unzip xz-utils zip libglu1-mesa   # Debian/Ubuntu
# (Fedora: sudo dnf install -y curl git unzip xz zip mesa-libGLU)
curl -O https://storage.googleapis.com/flutter_infra_release/releases/stable/linux/flutter_linux_3.47.9-stable.tar.xz
tar -xf flutter_linux_3.47.9-stable.tar.xz -C ~          # installa in ~/flutter
echo 'export PATH="$HOME/flutter/bin:$PATH"' >> ~/.bashrc && source ~/.bashrc
```

In alternativa `sudo snap install flutter --classic`. Per il web serve Chrome o
Chromium: se non è in un percorso standard, imposta `CHROME_EXECUTABLE=/percorso/chrome`.

### Verifica (tutti i sistemi)

```bash
flutter --version     # Flutter 3.47.9 • channel stable ... Dart 3.13.7
dart --version
flutter doctor        # elenca cosa manca per ogni piattaforma
```

### Editor consigliati

- **VS Code** con le estensioni *Flutter* e *Dart* (Dart-Code).
- **Android Studio / IntelliJ** con i plugin *Flutter* e *Dart*.

## 4. Installazione delle dipendenze

```bash
cd flutter-template
flutter pub get
```

## 5. Comandi

| Scopo                         | Comando |
|-------------------------------|---------|
| Sviluppo web (porta 5300)     | `flutter run -d chrome --web-port 5300 --dart-define=API_BASE_URL=http://localhost:3000` |
| Sviluppo emulatore Android    | `flutter run -d emulator-5554 --dart-define=API_BASE_URL=http://10.0.2.2:3000` |
| Sviluppo simulatore iOS       | `flutter run -d ios --dart-define=API_BASE_URL=http://localhost:3000` |
| Device collegati              | `flutter devices` |
| Build web di produzione       | `flutter build web --release --no-web-resources-cdn` (output in `build/web`) |
| Build Android                 | `flutter build apk --release --dart-define=API_BASE_URL=https://api.example.com` |
| Build iOS (macOS)             | `flutter build ipa --dart-define=API_BASE_URL=https://api.example.com` |
| Test                          | `flutter test` |
| Coverage                      | `flutter test --coverage` (report in `coverage/lcov.info`; HTML con `genhtml coverage/lcov.info -o coverage/html`) |
| Lint                          | `flutter analyze` |
| Format                        | `dart format lib test` (verifica senza modificare: `dart format --set-exit-if-changed lib test`) |
| Anteprima build di produzione | `docker build -t flutter-template . && docker run --rm -p 8081:80 flutter-template` |

Durante `flutter run`: `r` = hot reload, `R` = hot restart, `q` = esci.

Note sull'emulatore Android: `10.0.2.2` è l'indirizzo con cui l'emulatore vede il
`localhost` del PC. Su un **telefono fisico** usa l'IP del PC nella LAN
(es. `http://192.168.1.20:3000`) e aggiungi l'origine al `CORS_ORIGINS` del
backend solo se usi il web. Il traffico HTTP in chiaro è abilitato **solo nel
build debug** Android (`android/app/src/debug/AndroidManifest.xml`); in release usa HTTPS.

## 6. Configurazione

Flutter non legge variabili d'ambiente a runtime: la configurazione viene
inserita **a compilazione** con `--dart-define` (vedi `lib/core/config/app_config.dart`).

| Chiave         | Dove                         | Default | Significato |
|----------------|------------------------------|---------|-------------|
| `API_BASE_URL` | `--dart-define` / `ARG` Docker | `''`  | URL del backend senza `/api`. Vuoto = URL relativi (`/api/...`), usati in Docker dove nginx fa da proxy. |
| `API_UPSTREAM` | env del container nginx      | `http://nodejs-backend-template:3000` | backend verso cui nginx inoltra `/api/` |

Il backend deve consentire l'origine `http://localhost:5300` in `CORS_ORIGINS`
(è già nel default del contratto). Colori, spaziature, raggi, breakpoint e font
sono in `lib/core/theme/app_theme.dart`.

## 7. Docker

Il `Dockerfile` è multi-stage: compila il web con Flutter 3.47.9 e serve
`build/web` con nginx sulla **porta 80** del container. nginx:

- fa fallback SPA (`try_files ... /index.html`), così `/items` funziona anche ricaricando;
- fa reverse proxy di `/api/` verso `API_UPSTREAM`, risolto a runtime con il DNS di
  Docker: il container parte anche senza backend (in quel caso la Home mostra *Offline*);
- comprime con gzip ed espone `/healthz` per l'`HEALTHCHECK`.

```bash
docker build -t flutter-template .
docker run --rm -p 8081:80 flutter-template                               # http://localhost:8081
docker run --rm -p 8081:80 -e API_UPSTREAM=http://host.docker.internal:3000 flutter-template
#   ^ backend avviato sul PC (su Linux aggiungi --add-host=host.docker.internal:host-gateway)
docker build --build-arg API_BASE_URL=https://api.example.com -t flutter-template .
#   ^ opzionale: URL assoluto invece del proxy
```

Con il `docker-compose.yml` della root (servizio `flutter-template`, porta host **8081**):

```bash
docker compose up --build flutter-template nodejs-backend-template
# apri http://localhost:8081
```

## 8. API usate e pagine

Il client (`lib/data/api/api_client.dart`) chiama, come da contratto:

| Metodo   | Rotta              | Usata da |
|----------|--------------------|----------|
| `GET`    | `/api/health`      | Home (stato backend) |
| `GET`    | `/api/items`       | Items (lista) |
| `GET`    | `/api/items/{id}`  | `ItemsRepository.get` (disponibile) |
| `POST`   | `/api/items`       | Items (crea) |
| `PUT`    | `/api/items/{id}`  | Items (modifica) |
| `DELETE` | `/api/items/{id}`  | Items (elimina) |

Gli errori `application/problem+json` diventano `ApiException` con `title`,
`detail` e `fieldErrors` (`campo → messaggi`), mostrati sotto i campi del form.
Errori di rete, timeout e risposte non JSON (es. 502 di nginx) diventano
anch'essi `ApiException` con un messaggio leggibile.

## 9. Come aggiungere una nuova risorsa/pagina

Esempio: risorsa `orders` con pagina `/orders`.

1. **Modello** — `lib/data/models/order.dart` con `fromJson`/`toJson` (copia `item.dart`).
2. **Repository** — `lib/data/repositories/orders_repository.dart`: interfaccia
   `OrdersRepository` + `HttpOrdersRepository(ApiClient)` che chiama `/api/orders`
   (copia `items_repository.dart`).
3. **Dipendenza** — aggiungi il campo `ordersRepository` in `AppScope`
   (`core/di/app_scope.dart`) e in `App` (`app.dart`), poi istanzialo in `main.dart`
   con `HttpOrdersRepository(apiClient)`.
4. **Stato** — `lib/features/orders/orders_controller.dart` (`ChangeNotifier`, copia `items_controller.dart`).
5. **Pagina** — `lib/features/orders/orders_page.dart` (`StatefulWidget` che crea il
   controller in `initState` con `AppScope.of(context).ordersRepository` e usa
   `ListenableBuilder`); widget specifici in `features/orders/widgets/`.
6. **Rotta** — aggiungi `static const orders = '/orders';` in `core/router/app_routes.dart`
   e una `GoRoute` dentro la `ShellRoute` di `core/router/app_router.dart`.
7. **Menu** — aggiungi un `AppDestination` in `appDestinations` (`shared/widgets/app_shell.dart`).
8. **Test** — un fake in `test/helpers/fakes.dart`, un widget test in
   `test/features/orders_page_test.dart` e un test del repository con `MockClient`
   (copia `test/data/items_repository_test.dart`).
9. Verifica: `dart format lib test && flutter analyze && flutter test`.

Widget riutilizzabile nuovo? Mettilo in `lib/shared/widgets/` (solo presentazione,
nessuna chiamata HTTP) e, se utile, aggiungi un esempio in
`lib/features/components/sections/` + nella lista di `ComponentsPage`.

## 10. Problemi comuni

| Problema | Soluzione |
|----------|-----------|
| Home *Offline* in sviluppo web | backend non avviato, `API_BASE_URL` mancante, oppure CORS: l'origine `http://localhost:5300` deve essere in `CORS_ORIGINS`. Usa `--web-port 5300` (senza, la porta è casuale). Controlla la console del browser (F12). |
| Home *Offline* in Docker | `API_UPSTREAM` non raggiungibile dal container (nome servizio sbagliato o backend non nella stessa rete compose). `curl localhost:8081/api/health` restituisce 502. |
| Offline su emulatore Android | usa `10.0.2.2` invece di `localhost`; su device fisico l'IP LAN del PC. |
| `Invalid API URL` su mobile | su Android/iOS gli URL relativi non funzionano: passa sempre `--dart-define=API_BASE_URL=...`. |
| `--dart-define` cambiato ma nessun effetto | i valori sono fissati a compilazione: serve hot **restart** (`R`) o un nuovo `flutter run`. |
| `Cannot find Chrome executable` | `export CHROME_EXECUTABLE=/percorso/chromium`. |
| `Woah! You appear to be trying to run flutter as root` | solo un avviso (es. nei container): si può ignorare. |
| Pagina bianca dopo un deploy | cache del service worker: ricarica forzata (Ctrl+Shift+R). nginx serve JS/HTML con `Cache-Control: no-cache`. |
| `docker build` fallisce con errori TLS dietro un proxy aziendale | il proxy ispeziona l'HTTPS: aggiungi temporaneamente nel build stage `COPY ca.crt /usr/local/share/ca-certificates/` + `RUN update-ca-certificates` (non committare) e passa `--build-arg HTTPS_PROXY=...`. |
| nginx: `socket() [::]:80 failed` | già gestito: il template ascolta solo IPv4. |
| `pumpAndSettle timed out` nei test | la pagina contiene animazioni infinite (spinner): usa `pumpApp(..., settle: false)` e `pumpFrames(tester)`. |

## 11. Comandi utili extra

```bash
flutter doctor -v                 # diagnostica completa
flutter pub outdated              # dipendenze aggiornabili
flutter pub upgrade --major-versions
flutter clean                     # cancella build/ e .dart_tool/
flutter upgrade                   # aggiorna l'SDK
flutter create --platforms=windows,macos,linux .   # aggiunge le piattaforme desktop
dart fix --apply                  # applica le correzioni automatiche del linter
flutter build web --wasm          # build WebAssembly (browser recenti)
```
