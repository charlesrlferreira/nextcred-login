import { describe, expect, it } from "vitest";
import { inteiroPorExtenso, reaisPorExtenso } from "@/lib/extenso";

describe("por extenso", () => {
  it.each([
    [0, "zero"],
    [1, "um"],
    [16, "dezesseis"],
    [21, "vinte e um"],
    [100, "cem"],
    [101, "cento e um"],
    [999, "novecentos e noventa e nove"],
    [1000, "mil"],
    [1001, "mil e um"],
    [1100, "mil e cem"],
    [1234, "mil duzentos e trinta e quatro"],
    [2500, "dois mil e quinhentos"],
    [1000000, "um milhão"],
    [2000000, "dois milhões"],
    [1200000, "um milhão e duzentos mil"],
  ])("%d", (n, esperado) => {
    expect(inteiroPorExtenso(n)).toBe(esperado);
  });

  it("reais e centavos", () => {
    expect(reaisPorExtenso(1)).toBe("um real");
    expect(reaisPorExtenso(1850)).toBe("mil oitocentos e cinquenta reais");
    expect(reaisPorExtenso(0.5)).toBe("cinquenta centavos");
    expect(reaisPorExtenso(2350.01)).toBe("dois mil trezentos e cinquenta reais e um centavo");
    expect(reaisPorExtenso(1000000)).toBe("um milhão de reais");
  });
});
