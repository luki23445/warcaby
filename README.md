# Warcaby - PWA dla iPad

Kompletna aplikacja webowa (PWA) do gry w warcaby, zaprojektowana specjalnie dla iPad. Aplikacja działa offline, ma responsywny UI pod dotyk i może być zainstalowana na ekranie głównym.

## Technologie

- **TypeScript** - typowanie statyczne
- **React** - framework UI
- **Vite** - narzędzie budowania
- **Vitest** - testy jednostkowe
- **PWA** - Service Worker + Manifest

## Zasady gry

Aplikacja implementuje następujące zasady:

1. **Pionki** chodzą o 1 pole po skosie do przodu
2. **Damka** chodzi po skosie na dowolną liczbę pól (sliding)
3. **Bicia są obowiązkowe** - jeśli istnieje jakiekolwiek bicie, zwykłe ruchy są zablokowane
4. **Pionki mogą bić do tyłu**
5. **Wielokrotne bicia** w jednej turze są obowiązkowe
6. **Damka bije jako "latająca damka"** - przeskakuje dokładnie jedną bierkę i ląduje na dowolnym pustym polu za nią
7. **Promocja na damkę** następuje dopiero po zakończeniu całej sekwencji ruchu/bicia
8. **Zwycięstwo** gdy przeciwnik nie ma bierek lub nie ma legalnych ruchów

**UWAGA:** Zasada "największego bicia" jest wyłączona - gracz może wybrać dowolne legalne bicie.

## Instalacja

```bash
npm install
```

## Uruchomienie

### Tryb deweloperski

```bash
npm run dev
```

Aplikacja będzie dostępna pod adresem `http://localhost:5173`

### Build produkcyjny

```bash
npm run build
```

Zbudowane pliki znajdą się w katalogu `dist/`.

### Podgląd builda

```bash
npm run preview
```

## Testy

```bash
npm test
```

### Testy z interfejsem UI

```bash
npm run test:ui
```

## Instalacja na iPad (Dodaj do ekranu głównego)

1. Otwórz aplikację w przeglądarce Safari na iPad
2. Kliknij przycisk "Udostępnij" (ikona kwadratu ze strzałką)
3. Wybierz "Dodaj do ekranu głównego"
4. Potwierdź nazwę i dodaj
5. Aplikacja pojawi się jako ikona na ekranie głównym i będzie działać w trybie standalone

### Ikony PWA

Aplikacja używa SVG jako ikony. Jeśli chcesz użyć ikon PNG dla lepszej kompatybilności:

1. Wygeneruj ikony PNG (192x192, 512x512, 180x180 dla Apple) z pliku `public/icon.svg`
2. Umieść je w katalogu `public/` jako:
   - `pwa-192x192.png`
   - `pwa-512x512.png`
   - `apple-touch-icon.png`
3. Zaktualizuj `vite.config.ts` aby używał ikon PNG zamiast SVG

## Funkcje

### Ustawienia

- **Rozmiar planszy**: 8x8 lub 10x10 (domyślnie 8x8)
- **Kto zaczyna**: Białe lub Czarne
- **Tryb gry**: 
  - PvP (hot-seat) - gra na zmianę na tym samym urządzeniu
  - Bot - przeciwnik wykonuje losowe legalne ruchy

### Sterowanie

- **Tap-to-select**: Dotknij pionka aby go wybrać
- **Tap-to-move**: Dotknij docelowe pole aby wykonać ruch
- **Podświetlanie**: Po wybraniu pionka, legalne pola docelowe są podświetlone
- **Obowiązkowe bicia**: Gdy bicie jest obowiązkowe, tylko bierki mogące bić są dostępne

### Panel kontrolny

- **Nowa gra**: Rozpoczyna nową grę z aktualnymi ustawieniami
- **Cofnij**: Cofnij ostatni ruch (minimum 1 ruch w historii)
- **Ustawienia**: Otwórz modal z ustawieniami gry

### Wielobicia

Gdy wielobicie jest możliwe:
- Tylko bierka w trakcie bicia może być wybrana
- Wyświetlany jest komunikat "Kontynuuj bicie tą samą bierką"
- Inne bierki są zablokowane do czasu zakończenia sekwencji

### Offline

Aplikacja działa offline dzięki Service Worker. Stan gry jest automatycznie zapisywany w localStorage i przywracany po odświeżeniu strony.

## Architektura

### Silnik gry (`src/game/`)

Czysty TypeScript, niezależny od UI:

- `types.ts` - definicje typów
- `board.ts` - operacje na planszy
- `moves.ts` - generowanie ruchów i bić
- `gameLogic.ts` - logika gry i stan

### UI (`src/components/`)

- `Board.tsx` - główna plansza
- `Square.tsx` - pojedyncze pole
- `Piece.tsx` - komponent pionka/damki
- `ControlPanel.tsx` - panel kontrolny
- `SettingsModal.tsx` - modal ustawień

### Stan aplikacji

Używa `useReducer` do zarządzania stanem gry z historią dla funkcji Undo.

## Struktura projektu

```
warcaby/
├── src/
│   ├── game/              # Silnik gry (czysty TS)
│   │   ├── types.ts
│   │   ├── board.ts
│   │   ├── moves.ts
│   │   ├── gameLogic.ts
│   │   └── __tests__/     # Testy jednostkowe
│   ├── components/         # Komponenty React
│   ├── App.tsx
│   ├── App.css
│   └── main.tsx
├── public/                 # Pliki statyczne (ikony PWA)
├── package.json
├── vite.config.ts
├── tsconfig.json
└── README.md
```

## Rozwój

### Dodawanie nowych funkcji

1. Logika gry powinna być w `src/game/` (czysty TypeScript)
2. Komponenty UI w `src/components/`
3. Testy jednostkowe dla logiki w `src/game/__tests__/`

### Testowanie na iPad

1. Zbuduj aplikację: `npm run build`
2. Uruchom lokalny serwer w katalogu `dist/`
3. Otwórz w Safari na iPad (przez lokalną sieć)
4. Zainstaluj jako PWA

## Licencja

MIT

