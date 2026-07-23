/**
 * Style presets. The modifier string is appended to the user's prompt on the
 * server, so the client only ever sends a preset id - it cannot inject
 * arbitrary trailing prompt text through this path.
 */

export interface StylePreset {
  id: string;
  label: string;
  /** Short description shown in the picker. */
  hint: string;
  /** Appended to the raw prompt server-side. */
  modifier: string;
  /** Two-stop gradient used for the preset chip's active state. */
  swatch: [string, string];
}

export const STYLE_PRESETS: readonly StylePreset[] = [
  {
    id: "none",
    label: "No style",
    hint: "Your prompt, untouched",
    modifier: "",
    swatch: ["#3F3F52", "#26263A"],
  },
  {
    id: "cinematic",
    label: "Cinematic",
    hint: "Anamorphic, moody, filmic",
    modifier:
      "cinematic still, anamorphic lens, shallow depth of field, dramatic volumetric lighting, film grain, colour graded, 35mm",
    swatch: ["#F0A868", "#8A4B2A"],
  },
  {
    id: "photoreal",
    label: "Photoreal",
    hint: "Studio-grade photography",
    modifier:
      "photorealistic, ultra detailed, natural skin texture, soft studio lighting, shot on 85mm prime lens, high dynamic range",
    swatch: ["#9FD3E8", "#2E5F80"],
  },
  {
    id: "anime",
    label: "Anime",
    hint: "Clean cel-shaded lineart",
    modifier:
      "anime key visual, cel shaded, crisp linework, vibrant saturated palette, expressive composition, studio production quality",
    swatch: ["#FF8FC8", "#8A3D74"],
  },
  {
    id: "render3d",
    label: "3D Render",
    hint: "Octane-style CGI",
    modifier:
      "3d render, octane render, physically based materials, soft global illumination, subsurface scattering, ultra clean topology",
    swatch: ["#A78BFA", "#4C2F92"],
  },
  {
    id: "watercolour",
    label: "Watercolour",
    hint: "Loose washes on paper",
    modifier:
      "watercolour painting, loose expressive washes, visible paper texture, bleeding pigment edges, delicate muted palette",
    swatch: ["#8FE3C8", "#2F7A63"],
  },
  {
    id: "neon",
    label: "Neon Noir",
    hint: "Rain-slick cyberpunk",
    modifier:
      "cyberpunk neon noir, rain-slick reflective streets, magenta and cyan rim lighting, dense atmospheric haze, high contrast",
    swatch: ["#FF5C8A", "#5B2A8A"],
  },
  {
    id: "minimal",
    label: "Minimal",
    hint: "Flat, graphic, spacious",
    modifier:
      "minimalist graphic design, flat vector shapes, generous negative space, limited two-tone palette, precise geometry",
    swatch: ["#E8E8EE", "#6E6E80"],
  },
] as const;

export const DEFAULT_PRESET_ID = "none";

export function getPreset(id: string | undefined): StylePreset {
  return (
    STYLE_PRESETS.find((preset) => preset.id === id) ??
    STYLE_PRESETS.find((preset) => preset.id === DEFAULT_PRESET_ID)!
  );
}

/** Combines a raw user prompt with a preset's modifier. */
export function composePrompt(prompt: string, presetId: string | undefined): string {
  const preset = getPreset(presetId);
  if (!preset.modifier) return prompt;
  return `${prompt}, ${preset.modifier}`;
}
