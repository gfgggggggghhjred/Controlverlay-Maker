# Hardware artwork

Controller images are from **Gamepad Asset Pack**, by **Al. Lopez / AL2009man**:
https://github.com/AL2009man/Gamepad-Asset-Pack

The upstream MIT license is included at `public/hardware/LICENSE.txt`. Original source paths are recorded in `public/hardware/sources.json`; Joy-Con grip artwork is from `Controller Asset Pack/Nintendo Switch Controller Images/Switch Joycons/Templates/VSCView Switch Joycon Grip.png` in the same repository. Downloaded October 16, 2026.

The pack contains hardware-based illustrations and modified source artwork; these are not official manufacturer endorsements. The upstream README describes the origins of its artwork and includes additional guidance for commercial game releases. Review that guidance when planning public distribution: https://github.com/AL2009man/Gamepad-Asset-Pack#guideline-controller-overlay

The original controller PNGs are retained unchanged. Controlverlay adds interactive input highlights, optional tinting, and a dark cover over the Steam Deck artwork's green screen placeholder at runtime.

## Separate manufacturer product artwork

Four local prototype designs use manufacturer-hosted product PNGs. They are separate from the MIT-licensed Gamepad Asset Pack. No redistribution license for these product photos has been verified; review rights before publicly distributing the prototype with them. Self-contained SVG wrappers select the front-facing panel without changing source PNG pixels.

- 8BitDo Pro 2: https://www.8bitdo.com/pro2/
- 8BitDo Ultimate Bluetooth: https://www.8bitdo.com/ultimate-bluetooth-controller/
- 8BitDo M30 Wired for Xbox: https://www.8bitdo.com/m30-wired-controller-xbox/
- HORI Fighting Commander OCTA: https://stores.horiusa.com/fighting-commander-octa-for-playstation-5-playstation-4-and-windows-11-10/

Exact image URLs for these four are recorded in `public/hardware/manufacturer-sources.json`; first-party moving-shell source paths are in `public/hardware/motion-sources.json`.

## Collected controller artwork previews

Six active catalog designs now use AI-generated front-face reconstructions from collected references. They are labeled generated and retain hardware/variant review notes. Generation does not establish manufacturer approval or clear third-party rights. Source references, output hashes, and review status are in `public/hardware/generated/SOURCES.json`. Original source files remain preserved separately; these outputs do not claim exact physical measurements. Two generated views replace active collected previews; four fill previously empty slots.

99 additional exact-model source selections are now embedded in SVG wrappers under `public/hardware/collected/`. The original raster pixels are unchanged. Each source page, image URL, source hash, and review note is recorded in `public/hardware/collected/SOURCES.json`. Manufacturer and retailer redistribution permission is unverified; these previews are not covered by the upstream asset pack's MIT license. Source photography may retain backgrounds, cables, shadows, text, and perspective. Four uncertain variants remain without built-in art. Preview availability does not imply calibrated inputs, separated moving parts, or verified driver compatibility.


## Prepared controller frames

The 103 files under `public/hardware/prepared/` derive from the previously retained reference and generated assets. Source RGB channels are preserved; alpha/canvas preparation does not establish additional source rights. See `SOURCES.json` in that directory for per-model provenance, source frames, dimensions, checksums and calibration metadata. The original and rejected assets remain preserved separately.
