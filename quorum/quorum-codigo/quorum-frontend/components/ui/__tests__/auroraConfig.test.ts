import {
  AURORA_BLOB_ANIMATION_CLASS,
  AURORA_BLOBS,
  AURORA_REDUCED_MOTION_MEDIA,
  AURORA_THEME,
  getAuroraDurations,
  getBlobAnimationClass,
} from "../auroraConfig";

describe("auroraConfig", () => {
  describe("getAuroraDurations", () => {
    it("devuelve 3 duraciones distintas y positivas a partir de animationSpeed", () => {
      const durations = getAuroraDurations(15);

      expect(durations).toHaveLength(3);
      expect(durations.every((d) => d > 0)).toBe(true);
      expect(new Set(durations).size).toBe(3);
      expect(durations[0]).toBe(15);
      expect(durations[1]).toBe(18.75);
      expect(durations[2]).toBe(25);
    });

    it("usa 15s por defecto si baseSpeed es inválido", () => {
      const durations = getAuroraDurations(0);

      expect(durations[0]).toBe(15);
    });
  });

  describe("AURORA_THEME", () => {
    it("expone tokens diferenciados para modo claro y oscuro", () => {
      expect(AURORA_THEME.light.shell).toContain("bg-zinc-50");
      expect(AURORA_THEME.dark.shell).toContain("dark:bg-zinc-900");
      expect(AURORA_THEME.light.baseGradient).not.toBe(AURORA_THEME.dark.baseGradient);
      expect(AURORA_THEME.light.blobSample).not.toBe(AURORA_THEME.dark.blobSample);
    });
  });

  describe("AURORA_BLOBS", () => {
    it("define 3 blobs con colores claro/oscuro en cada entrada", () => {
      expect(AURORA_BLOBS).toHaveLength(3);
      for (const blob of AURORA_BLOBS) {
        expect(blob.color).toMatch(/bg-/);
        expect(blob.color).toMatch(/dark:bg-/);
      }
    });
  });

  describe("accesibilidad de movimiento", () => {
    it("expone la clase de animación y la media query de reduced-motion", () => {
      expect(getBlobAnimationClass()).toBe(AURORA_BLOB_ANIMATION_CLASS);
      expect(AURORA_BLOB_ANIMATION_CLASS).toBe("animate-aurora-blob-drift");
      expect(AURORA_REDUCED_MOTION_MEDIA).toBe("(prefers-reduced-motion: reduce)");
    });
  });
});
