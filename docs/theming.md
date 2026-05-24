# Theming

## Palettes

Five color palettes ship out of the box:

| Key | Vibe |
|---|---|
| `default` | Clean neutral |
| `rose-pine` | Muted rose/pine tones |
| `gruvbox` | Warm retro |
| `nord` | Cool arctic blues |
| `one-dark` | Atom One Dark |

Each palette has both a light and dark variant. The toggle controls light/dark independently of which palette is active.

## How it works

1. `src/index.css` defines all color tokens as CSS custom properties (`--background`, `--foreground`, `--primary`, etc.) for each palette × mode combination.
2. The active palette is applied as a class on `<html>` (e.g., `class="dark gruvbox"`).
3. An inline script in `src/layouts/Layout.astro` reads `localStorage` and applies the classes **before the first paint** — no flash of wrong theme.
4. `Navbar.tsx` writes new values to `localStorage` and updates the `<html>` class when the user switches.

## Storage keys

| Key | Values |
|---|---|
| `theme` | `light` \| `dark` |
| `palette` | `default` \| `rose-pine` \| `gruvbox` \| `nord` \| `one-dark` |

## Syntax highlighting

Shiki runs at build time with dual-theme output. Colors are emitted as CSS variables (`--shiki-light`, `--shiki-dark`) so the correct theme activates via the `dark` class without any JS re-run.
