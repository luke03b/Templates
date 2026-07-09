# Flutter Template

Template base Flutter pronto all'uso con una landing page iniziale.

## Cosa installare in locale

- Flutter SDK stabile.
- Dart incluso con Flutter.
- Chrome o un emulatore/device per l'esecuzione.

Verifica rapida dell'ambiente:

```bash
flutter --version
flutter doctor
```

## Avvio in locale

1. Recupera le dipendenze.

```bash
flutter pub get
```

2. Esegui i test.

```bash
flutter test
```

3. Avvia l'app in web o su device.

```bash
flutter run -d chrome
```

Se vuoi usare un altro device, prima esegui `flutter devices` e poi sostituisci `chrome` con l'id corretto.

## Avvio con Docker

1. Costruisci l'immagine.

```bash
docker build -t flutter-template .
```

2. Avvia il container.

```bash
docker run --rm -p 8080:80 flutter-template
```

3. Apri `http://localhost:8080`.

## Struttura

- `lib/main.dart` - bootstrap minimale dell'app
- `lib/screens/landing_page.dart` - landing page base
- `test/widget_test.dart` - smoke test della landing page

## Avvio

1. Installa le dipendenze.
2. Avvia l'app con `flutter run`.

## Scopo

Questo template e pensato per partire rapidamente con una UI iniziale pulita, da estendere con routing, stato e integrazione backend.
