import { describe, expect, test } from "vitest";

import { SUMBER_DESA } from "@/lib/map/sumber";

import { filterKembar, layerKembarFill, layerKembarLine } from "./kembar";

describe("filterKembar", () => {
  test("memakai iddesa yang diberikan", () => {
    expect(filterKembar("1801040002")).toEqual(["==", ["get", "iddesa"], "1801040002"]);
  });

  test("undefined menghasilkan filter yang tidak cocok dengan apa pun", () => {
    expect(filterKembar(undefined)).toEqual(["==", ["get", "iddesa"], ""]);
  });
});

describe("layerKembarFill", () => {
  test("memakai SUMBER_DESA dan warna token DESIGN.md map-fill-alt", () => {
    const layer = layerKembarFill("1801040002") as {
      source: string;
      paint: { "fill-color": string };
      filter: unknown;
    };

    expect(layer.source).toBe(SUMBER_DESA);
    expect(layer.paint["fill-color"]).toBe("rgba(255,115,0,0.18)");
    expect(layer.filter).toEqual(filterKembar("1801040002"));
  });
});

describe("layerKembarLine", () => {
  test("memakai SUMBER_DESA dan warna token DESIGN.md map-outline-alt", () => {
    const layer = layerKembarLine("1801040002") as {
      source: string;
      paint: { "line-color": string; "line-width": number };
      filter: unknown;
    };

    expect(layer.source).toBe(SUMBER_DESA);
    expect(layer.paint["line-color"]).toBe("#ff7300");
    expect(layer.paint["line-width"]).toBe(2);
    expect(layer.filter).toEqual(filterKembar("1801040002"));
  });
});
