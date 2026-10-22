import { horasPredeterminadas } from "../fichaDefaults";

describe("horasPredeterminadas", () => {
  // ── Regla sábado (prioridad máxima) ──────────────────────────────────────
  it("sábado + noche → 08:00-12:00 (sábado tiene prioridad)", () => {
    expect(horasPredeterminadas("noche", "sabado")).toEqual({
      hora_inicio: "08:00",
      hora_fin: "12:00",
    });
  });

  it("sábado + mañana → 08:00-12:00", () => {
    expect(horasPredeterminadas("mañana", "sabado")).toEqual({
      hora_inicio: "08:00",
      hora_fin: "12:00",
    });
  });

  it("sábado + tarde → 08:00-12:00", () => {
    expect(horasPredeterminadas("tarde", "sabado")).toEqual({
      hora_inicio: "08:00",
      hora_fin: "12:00",
    });
  });

  it("sábado + fin_de_semana → 08:00-12:00", () => {
    expect(horasPredeterminadas("fin_de_semana", "sabado")).toEqual({
      hora_inicio: "08:00",
      hora_fin: "12:00",
    });
  });

  // ── Jornada mañana ────────────────────────────────────────────────────────
  it("lunes + mañana → 07:00-13:00", () => {
    expect(horasPredeterminadas("mañana", "lunes")).toEqual({
      hora_inicio: "07:00",
      hora_fin: "13:00",
    });
  });

  it("viernes + mañana → 07:00-13:00", () => {
    expect(horasPredeterminadas("mañana", "viernes")).toEqual({
      hora_inicio: "07:00",
      hora_fin: "13:00",
    });
  });

  // ── Jornada tarde ─────────────────────────────────────────────────────────
  it("lunes + tarde → 13:00-19:00", () => {
    expect(horasPredeterminadas("tarde", "lunes")).toEqual({
      hora_inicio: "13:00",
      hora_fin: "19:00",
    });
  });

  it("jueves + tarde → 13:00-19:00", () => {
    expect(horasPredeterminadas("tarde", "jueves")).toEqual({
      hora_inicio: "13:00",
      hora_fin: "19:00",
    });
  });

  // ── Jornada noche ─────────────────────────────────────────────────────────
  it("lunes + noche → 18:00-22:00", () => {
    expect(horasPredeterminadas("noche", "lunes")).toEqual({
      hora_inicio: "18:00",
      hora_fin: "22:00",
    });
  });

  it("viernes + noche → 18:00-22:00", () => {
    expect(horasPredeterminadas("noche", "viernes")).toEqual({
      hora_inicio: "18:00",
      hora_fin: "22:00",
    });
  });

  // ── Jornada fin_de_semana ─────────────────────────────────────────────────
  it("lunes + fin_de_semana → 08:00-12:00", () => {
    expect(horasPredeterminadas("fin_de_semana", "lunes")).toEqual({
      hora_inicio: "08:00",
      hora_fin: "12:00",
    });
  });

  it("miercoles + fin_de_semana → 08:00-12:00", () => {
    expect(horasPredeterminadas("fin_de_semana", "miercoles")).toEqual({
      hora_inicio: "08:00",
      hora_fin: "12:00",
    });
  });
});
