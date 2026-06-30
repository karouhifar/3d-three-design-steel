# Steel panel PBR textures

Source: **R M Lussier — Silver QC-7500 Le Rustique (19")**
Tile size: 19" wide × 32" tall (used for real-world repeat in the 3D wall).

Drop the downloaded maps here with these **exact filenames** (the loader
looks them up — any that are missing are skipped, the wall falls back to the
flat color):

| filename         | channel        | which of the 5 images                                            |
| ---------------- | -------------- | ---------------------------------------------------------------- |
| `basecolor.jpg`  | Base color     | the **ribbed gray** panel (4096×4096) — the realistic albedo     |
| `normal.png`     | Normal         | the **purple / blue** image (tangent-space normal)               |
| `roughness.jpg`  | Roughness      | the **black with thin white vertical lines** image               |
| `metalness.jpg`  | Metalness      | (optional) a metalness/AO gray map if provided                   |
| `height.png`     | Displacement   | (optional) the flat gray height map — not used by default        |

Notes:
- `basecolor` is treated as sRGB; the others as linear data maps.
- Only `basecolor`, `normal`, `roughness`, `metalness` are wired into the
  material. Displacement is ignored (the wall geometry isn't subdivided, so it
  wouldn't show — the **normal** map already gives the rib relief).
- The chosen **wall color** still multiplies over the texture, so the color
  picker tints the steel.
- Accepts `.jpg` or `.png` — just match the names above (rename the extension
  in the filename if needed, e.g. `basecolor.png` → edit `useSteelTextures.ts`).
