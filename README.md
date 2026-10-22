# Controlverlay Maker

A local-first prototype for creating animated controller overlays without writing CSS. The Windows x64 portable download includes its runtime: no Node.js installation or terminal is needed. The editor opens in your default browser; Chrome or Edge is recommended.

## Start

On Windows, **extract the entire ZIP**, open the extracted folder, and double-click **Controlverlay Maker.exe**. Keep the `runtime` and `public` folders beside the executable. A small desktop window starts the local bridge and opens the editor automatically. **Open editor** reopens it; **Quit** closes the launcher and stops the bridge it started. A running bridge is reused only when it matches this build and extracted folder. An older copy can keep running on its own port; this build selects another port automatically and checks all 116 artwork files before serving the editor. A reused matching bridge is not stopped when the launcher exits. This is a portable Windows launcher with a browser-based editor, not an installer or embedded-browser desktop build.

For source-only development, run `node server.mjs` using Node.js 20+ and open http://127.0.0.1:3210.

1. Connect a controller and press a button. Standard browser gamepad mapping is supported. Choose your specific hardware model from **Your controller** or open the thumbnail library. Recognized device names select a model automatically until you choose one manually.
2. Pick a preset, choose input colors and an animation, or upload a PNG, GIF, or WebP (16 MB maximum). Animated GIF/WebP frames play naturally; static artwork gets input-reactive effects, not automatically generated frame animation.
3. For uploaded art, drag the input markers over the appropriate buttons. Focus a marker and use arrow keys for one-pixel adjustments; Shift moves ten pixels. Artwork uses a 750 × 630 canvas. Transparent artwork works best.
4. Click **Add to OBS**. Copy the URL into an OBS Browser Source. Set it to 750 × 630, copy the generated custom CSS, paste it into that source's **Custom CSS** field, and click OK.
5. Keep the local server and editor open while streaming. Keep the editor visible in a separate window; browsers may pause gamepad polling in hidden tabs. Turn demo mode off before going live.

The overlay URL is for OBS on the same computer. The editor sends controller data to a loopback Node server, and the transparent overlay receives updates via Server-Sent Events. OBS does not need access to the controller. The output renderer is a top-level document so OBS Custom CSS applies directly. CSS is generated for this app's overlay URL, not arbitrary third-party overlay sites.

## Controller library

The searchable catalog has **116 entries with artwork and moving input previews**: 13 existing layered illustrations, 94 cleaned reference-photo previews and nine generated approximations. All 103 prepared frames now have individual stick, D-pad and face-button anchors, including six-button fight pads. They use pieces from their own image for input movement.

The cleanup changes alpha/canvas without redrawing controller details. Real reference artwork now distinguishes the standard Wolverine V2 from Chroma, restores the original Raiju, the asymmetric Fighting Commander 4 and the narrow Infinity4PS shell. Studio backgrounds and cable canvas were removed where possible. Source RGB preservation was checked across all 103 prepared files.

**Preview coverage is not a claim of complete hardware accuracy.** Nine generated images remain approximations; four exact variants are unverified. Camera angles and edge quality vary. System/shoulder placements, extra-button mapping and physical OBS behavior still need real-device validation. See `PREVIEW_QUALITY.md` for the current audit. Rejected generation candidates remain outside the app.

Original colors are preserved by default. Sticks move within stationary sockets, buttons depress, and trigger travel follows analog input. This is 2D image-derived animation rather than measured 3D mechanics. Uploaded images and legacy CSS keep their existing reactive behavior.

Choose the model manually if a driver exposes a generic Xbox identity. Rear paddles, gyro, touch coordinates and device-specific extra controls depend on browser/driver mapping. The library is extensible in `public/hardware.js` and `public/catalog.js`.

Artwork attribution and provenance are retained in `THIRD_PARTY_NOTICES.md` and the hardware source manifests. Bundled artwork works offline.

## Existing skin

Under **Your artwork → Advanced**, select **Load your original animated skin**, or paste Xbox Gamepad Viewer CSS. Chat-encoded spaces, Markdown image links, and Imgur image-page URLs are normalized. External skin assets require internet and remain controlled by their original host. CSS is isolated from the editor inside its preview frame. Legacy CSS may override the visual designer's effects.

## Data and limits

- Active settings and uploaded files stay in `data/` beside the app. Saved presets stay in this browser's local storage and reference those uploaded files. Copy this entire folder, including `data/`, to preserve uploaded artwork and the active design. Old uploaded files are retained until manually removed.
- Standard browser mapping works out of the box; nonstandard devices can learn button assignments. Axis remapping, SVG uploads, video backgrounds, timeline animation editing, cloud accounts, and an installer are not implemented. A portable Windows executable is included.
- Only one editor should send input at a time. Input is relayed at up to 30 updates per second. The bridge clears pressed state after the editor disconnects. Demo mode sends simulated input to OBS too.
- CSS export captures colors, artwork, marker positions, and legacy styling. Layout/effect classes and live input behavior come from the app, so its server must remain running. Changes to active design update OBS automatically; copied CSS can override newer settings, so recopy CSS after redesigning.
- Input markers have fixed sizes in this version; unusually sized artwork may need resizing or advanced CSS.
- This is an initial working prototype. Hardware/OBS validation on the streaming PC is still needed. It does not include AI-generated animation or animated GIF creation.

## Develop

`node --test` runs core behavior tests. `node server.mjs` serves the app at port 3210, bound only to 127.0.0.1. No build step is required. Public assets live in `public/`.

The repository was empty when this prototype was created. These source files have not been pushed to GitHub.


## 0.3.4 alignment update

595 control rectangles were refined across 103 prepared models. All 107 photo-based previews use continuous local image deformation to avoid duplicate sticks and crop seams. The nine layered illustrations retain their mechanical renderer. See ALIGNMENT-UPDATE.txt and ALIGNMENT_REPORT.json for validation and remaining limits.
