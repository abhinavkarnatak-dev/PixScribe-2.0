export const SITE = {
  name: "PixScribe",
  tagline: "Type your vision, see it in seconds.",
  description:
    "PixScribe turns a sentence into a finished image. Describe anything, pick a style, and get a high-resolution result in seconds.",
  /** Used across legal pages and the footer. */
  legalEntity: "PixScribe",
  supportEmail: "support@pixscribe.app",
  /** Last review date shown on the legal pages. */
  legalUpdated: "24 July 2026",
  /** Grace window, in days, for the refund policy. */
  refundWindowDays: 7,
} as const;

/** Real PixScribe generations carried over from v1, used in the showcase marquee. */
export const SHOWCASE_IMAGES = [
  { src: "/showcase/sample_img_1.png", alt: "A PixScribe generation" },
  { src: "/showcase/sample_img_2.png", alt: "A PixScribe generation" },
  { src: "/showcase/sample_img_3.png", alt: "A PixScribe generation" },
  { src: "/showcase/sample_img_4.png", alt: "A PixScribe generation" },
  { src: "/showcase/sample_img_5.png", alt: "A PixScribe generation" },
  { src: "/showcase/sample_img_6.png", alt: "A PixScribe generation" },
  { src: "/showcase/sample_img_7.png", alt: "A PixScribe generation" },
] as const;
