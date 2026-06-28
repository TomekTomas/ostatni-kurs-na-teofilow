import { describe, expect, it } from "vitest";
import { createSeededRng, hashSeed } from "../src/logic/random.js";

describe("seedowany generator losowy", () => {
  it("zwraca identyczna sekwencje dla tego samego seeda", () => {
    const first = createSeededRng("linia-8");
    const second = createSeededRng("linia-8");
    expect([first.next(), first.next(), first.next()]).toEqual([second.next(), second.next(), second.next()]);
  });

  it("rozroznia rozne seedy", () => {
    expect(createSeededRng("zarzew").next()).not.toBe(createSeededRng("teofilow").next());
  });

  it("losuje liczby calkowite w domknietym zakresie", () => {
    const rng = createSeededRng("zakres");
    const values = Array.from({ length: 100 }, () => rng.int(3, 5));
    expect(values.every((value) => value >= 3 && value <= 5)).toBe(true);
    expect(new Set(values)).toEqual(new Set([3, 4, 5]));
  });

  it("wybiera tylko elementy podanej kolekcji", () => {
    const rng = createSeededRng("pojazd");
    expect([rng.pick(["konstal", "pesa"]), rng.pick(["konstal", "pesa"])]).toEqual(expect.arrayContaining([expect.stringMatching(/konstal|pesa/)]));
  });

  it("hash seeda jest stabilna liczba 32-bitowa", () => {
    expect(hashSeed("kurs8:1:2026-06-27")).toBe(14390778);
  });
});
