# companion-module-kanata

[Bitfocus Companion](https://bitfocus.io/companion) module for [kanata](https://github.com/jtroo/kanata) — monitor and control keyboard layers over TCP.

## Features

- **Live layer tracking** — variables update on every layer change
- **Color support** — reads `color` from `deflayer` opts, drives button backgrounds
- **Icon support** — reads `icon` from `deflayer` opts, loads PNG from disk for `png64` fields
- **Presets** — one button per layer (color + icon), plus a live "Current Layer" status button
- **Actions** — switch to any layer, reload config
- **Feedbacks** — `layer_color` (bgcolor follows active layer), `layer_is_not` (dim inactive buttons)

## Requirements

- Bitfocus Companion 5.x
- kanata with TCP server enabled (`tcp-server-address` in `defcfg`, or `--port` flag)
- For color + icon support: kanata built from [PR #2204](https://github.com/jtroo/kanata/pull/2204) or later

## Installation

Load via Companion's `--extra-module-path` flag pointing at the directory containing this module:

```bash
companion --extra-module-path /path/to/modules
# where /path/to/modules/companion-module-kanata/ is this repo
```

Then in Companion: **Add connection → search "kanata"**.

## Variables

| Variable | Description |
|----------|-------------|
| `$(kanata:layer)` | Current layer name (e.g. `base`) |
| `$(kanata:color_hex)` | Layer color hex (e.g. `#c84090`) |
| `$(kanata:color_int)` | Layer color as Companion integer (for `bgcolor`) |
| `$(kanata:layer_icon)` | Base64 PNG for use in `png64` fields — updates on every layer change |
| `$(kanata:layer_icon_name)` | Icon name string (e.g. `kanata-base`) — use in `$(image:...)` text expressions |
| `$(kanata:cfg_text)` | Raw config text for the current layer (from `RequestCurrentLayerInfo`) |
| `$(kanata:message)` | Last `MessagePush` string received from kanata |

## Configuration

```
Host:      127.0.0.1
Port:      5829          (default; adjust to match kanata's --port)
Icon dir:  ~/.config/kanata/icons/256
```

Icons are loaded as `<icon_dir>/kanata-<layer>.png` (256×256 PNG). If no icon is found, the layer name is shown as text.

## deflayer opts syntax

```lisp
(deflayer (base color "#c84090" icon "kanata-base")
  ...
)
```

`color` and `icon` are optional. `icon` was introduced in kanata 1.8; `color` requires [PR #2204](https://github.com/jtroo/kanata/pull/2204).

## License

MIT
