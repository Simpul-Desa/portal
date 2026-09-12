import { describe, expect, test } from "vitest";

import { SUMBER_DESA } from "@/lib/map/sumber";

import {
  SUMBER_KEMBAR_GARIS,
  SUMBER_KEMBAR_TITIK,
  filterKembar,
  layerKembarFill,
  layerKembarGaris,
  layerKembarGarisHalo,
  layerKembarLine,
  layerKembarTitik,
  layerKembarTitikInner,
} from "./kembar";

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

describe("layerKembarGaris & Halo", () => {
  test("memakai SUMBER_KEMBAR_GARIS dan warna oranye", () => {
    const garis = layerKembarGaris() as {
      source: string;
      paint: { "line-color": string };
    };
    const halo = layerKembarGarisHalo() as {
      source: string;
      paint: { "line-color": string };
    };

    expect(garis.source).toBe(SUMBER_KEMBAR_GARIS);
    expect(garis.paint["line-color"]).toBe("#ff7300");
    expect(halo.source).toBe(SUMBER_KEMBAR_GARIS);
    expect(halo.paint["line-color"]).toBe("#ff7300");
  });
});

describe("layerKembarTitik & Inner", () => {
  test("memakai SUMBER_KEMBAR_TITIK", () => {
    const titik = layerKembarTitik() as { source: string };
    const inner = layerKembarTitikInner() as { source: string };

    expect(titik.source).toBe(SUMBER_KEMBAR_TITIK);
    expect(inner.source).toBe(SUMBER_KEMBAR_TITIK);
  });
});
