# RailLine Design System

> **Design Direction:** Apple Maps × Linear × Stripe × Arc × Notion  
> **Aesthetic Tone:** Precision engineering, hyper-legible typography, muted dark map hero, tactile card layers, subtle glassmorphism, fast perceived speed.

---

## 1. Design Principles

1. **Information First:** Railway travel data (delay, platform, ETA) is critical. Never bury status behind decorative elements.
2. **Map as Hero:** The interactive map provides immediate spatial context. The map is immersive, dark-themed, and responsive to user focus.
3. **Dual-Theme Synergy:** The UI uses a crisp, high-contrast light/neutral theme with subtle borders and clean surfaces, while the live navigation map operates in a low-noise dark theme.
4. **Motion with Purpose:** Transitions communicate physical movement (train progressing along tracks, delay badges shifting, live heartbeat pulses). All motion strictly respects `prefers-reduced-motion`.
5. **Accessible by Default:** Statuses are never conveyed by color alone. High contrast ratios (WCAG 2.2 AA), clear font hierarchy, keyboard navigation, and screen-reader status text.

---

## 2. Brand & Palette

### Primary Color Tokens

```css
:root {
  /* Brand Accents */
  --brand-primary: #0F172A;        /* Deep obsidian slate */
  --brand-accent: #0284C7;         /* Azure railway electric blue */
  --brand-accent-hover: #0369A1;
  --brand-glow: rgba(2, 132, 199, 0.25);

  /* Status Colors */
  --status-ontime: #10B981;        /* Emerald green */
  --status-ontime-bg: #ECFDF5;
  --status-ontime-border: #A7F3D0;

  --status-delayed: #F59E0B;       /* Amber */
  --status-delayed-bg: #FFFBEB;
  --status-delayed-border: #FDE68A;

  --status-critical: #EF4444;      /* Crimson */
  --status-critical-bg: #FEF2F2;
  --status-critical-border: #FECACA;

  --status-neutral: #64748B;       /* Slate */
  --status-neutral-bg: #F1F5F9;
  --status-neutral-border: #CBD5E1;

  /* Neutrals (Light Surface) */
  --bg-app: #F8FAFC;
  --bg-surface: #FFFFFF;
  --bg-surface-subtle: #F1F5F9;
  --bg-glass: rgba(255, 255, 255, 0.85);

  /* Borders & Dividers */
  --border-subtle: #E2E8F0;
  --border-strong: #CBD5E1;
  --border-focus: #0284C7;

  /* Text Colors */
  --text-primary: #0F172A;         /* Slate 900 */
  --text-secondary: #475569;       /* Slate 600 */
  --text-muted: #94A3B8;           /* Slate 400 */
  --text-inverse: #FFFFFF;

  /* Map Dark Theme Tokens */
  --map-bg: #0B0F19;
  --map-route-completed: #0284C7;
  --map-route-remaining: #334155;
  --map-train-marker: #38BDF8;
  --map-train-marker-pulse: rgba(56, 189, 248, 0.4);
  --map-station-node: #94A3B8;
  --map-station-active: #F8FAFC;
}
```

---

## 3. Typography

- **Primary Typeface:** `Inter`, `-apple-system`, `BlinkMacSystemFont`, `Segoe UI`, `Roboto`, sans-serif.
- **Monospace/Numeric Typeface:** `JetBrains Mono`, `SFMono-Regular`, `Menlo`, monospace for train numbers, timestamps, coordinates, and delay metrics.

### Scale

| Token | Size | Line Height | Weight | Usage |
|---|---|---|---|---|
| `font-display` | 32px (2rem) | 1.2 | 700 / Bold | Hero title, train number headline |
| `font-h1` | 24px (1.5rem) | 1.3 | 600 / SemiBold | Section headers, modal titles |
| `font-h2` | 20px (1.25rem) | 1.4 | 600 / SemiBold | Card titles, station names |
| `font-h3` | 16px (1rem) | 1.4 | 600 / SemiBold | Sub-headers, component headers |
| `font-body` | 14px (0.875rem) | 1.5 | 400 / Regular | Default descriptions, table cells |
| `font-caption` | 12px (0.75rem) | 1.4 | 500 / Medium | Timestamps, metadata, badges |
| `font-metric` | 28px (1.75rem) | 1.1 | 700 / Bold (Mono) | KM distances, delay minutes, % progress |

---

## 4. Spacing & Grid

Standard 4px baseline scale:
- `space-1`: 4px
- `space-2`: 8px
- `space-3`: 12px
- `space-4`: 16px
- `space-5`: 20px
- `space-6`: 24px
- `space-8`: 32px
- `space-10`: 40px
- `space-12`: 48px

---

## 5. Border Radius & Elevation

### Radius
- `radius-sm`: 6px (buttons, badges, inputs)
- `radius-md`: 10px (cards, dropdowns)
- `radius-lg`: 16px (containers, dialogs, map overlays)
- `radius-xl`: 24px (floating command panels)
- `radius-full`: 9999px (pills, status dots, avatar circles)

### Shadows
- `shadow-subtle`: `0 1px 2px 0 rgba(0, 0, 0, 0.04)`
- `shadow-card`: `0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)`
- `shadow-floating`: `0 10px 25px -3px rgba(15, 23, 42, 0.12), 0 4px 6px -4px rgba(15, 23, 42, 0.05)`
- `shadow-map-overlay`: `0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.2)`

---

## 6. Component Specs

### 6.1 Status Badge
- Compound rendering: `[Dot Icon] + [Label Text] + [Optional Metric]`
- Examples:
  - `● ON TIME` (Green #10B981)
  - `● DELAYED (+18m)` (Amber #F59E0B)
  - `● ARRIVED` (Blue #0284C7)
  - `○ NOT STARTED` (Slate #64748B)

### 6.2 Train Marker & Pulsing Radar
- Marker: High-contrast train silhouette icon surrounded by an electric cyan ring (`#38BDF8`).
- Smooth bearing orientation matching current track gradient.
- Outer pulse animation radiating out to indicate live telemetry activity.

### 6.3 Route Lines
- Completed route: Solid glowing cyan line (`#0284C7`, 4px width, subtle halo).
- Remaining route: Semi-transparent slate dash/solid line (`#334155`, 3px width).
- Station dots: 6px circular nodes with tooltip on hover.

---

## 7. Motion & Transitions

- Marker interpolation: Linear or cubic-bezier lerp on `requestAnimationFrame`
- Sheet/Drawer: `cubic-bezier(0.16, 1, 0.3, 1)` spring-like slide-up
- Card hover: `transform: translateY(-2px)`, transition 150ms ease
- Reduced motion: instantly snap positions and skip transitions when `prefers-reduced-motion: reduce` is active.
