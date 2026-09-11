import { describe, expect, test } from "vitest";

import { bboxDariFeatureCollection, bboxDariFitur, bboxDariTitik } from "./bounds";

describe("bboxDariFitur", () => {
  test("bbox benar dari satu Feature Polygon", () => {
    const fitur: GeoJSON.Feature = {
      type: "Feature",
      properties: { iddesa: "1801040001", nmdesa: "A" },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [104.0, -5.0],
            [104.5, -5.0],
            [104.5, -4.5],
            [104.0, -4.5],
            [104.0, -5.0],
          ],
        ],
      },
    };

    expect(bboxDariFitur(fitur)).toEqual([
      [104.0, -5.0],
      [104.5, -4.5],
    ]);
  });
});

describe("bboxDariFeatureCollection", () => {
  test("bbox benar dari satu Polygon", () => {
    const fc: GeoJSON.FeatureCollection = {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: { iddesa: "1801040001", nmdesa: "A" },
          geometry: {
            type: "Polygon",
            coordinates: [
              [
                [104.0, -5.0],
                [104.5, -5.0],
                [104.5, -4.5],
                [104.0, -4.5],
                [104.0, -5.0],
              ],
            ],
          },
        },
      ],
    };

    expect(bboxDariFeatureCollection(fc)).toEqual([
      [104.0, -5.0],
      [104.5, -4.5],
    ]);
  });

  test("bbox benar dari MultiPolygon (nesting satu level lebih dalam dari Polygon)", () => {
    const fc: GeoJSON.FeatureCollection = {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: { iddesa: "1801040002", nmdesa: "B" },
          geometry: {
            type: "MultiPolygon",
            coordinates: [
              [
                [
                  [104.0, -5.0],
                  [104.2, -5.0],
                  [104.2, -4.8],
                  [104.0, -4.8],
                  [104.0, -5.0],
                ],
              ],
              [
                [
                  [105.0, -6.0],
                  [105.3, -6.0],
                  [105.3, -5.7],
                  [105.0, -5.7],
                  [105.0, -6.0],
                ],
              ],
            ],
          },
        },
      ],
    };

    expect(bboxDariFeatureCollection(fc)).toEqual([
      [104.0, -6.0],
      [105.3, -4.8],
    ]);
  });

  test("gabungan beberapa feature Polygon menghasilkan bbox gabungan", () => {
    const fc: GeoJSON.FeatureCollection = {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: { iddesa: "1", nmdesa: "A" },
          geometry: {
            type: "Polygon",
            coordinates: [
              [
                [100.0, -1.0],
                [101.0, -1.0],
                [101.0, 0.0],
                [100.0, 0.0],
                [100.0, -1.0],
              ],
            ],
          },
        },
        {
          type: "Feature",
          properties: { iddesa: "2", nmdesa: "B" },
          geometry: {
            type: "Polygon",
            coordinates: [
              [
                [102.0, -2.0],
                [103.0, -2.0],
                [103.0, -1.5],
                [102.0, -1.5],
                [102.0, -2.0],
              ],
            ],
          },
        },
      ],
    };

    expect(bboxDariFeatureCollection(fc)).toEqual([
      [100.0, -2.0],
      [103.0, 0.0],
    ]);
  });

  test("FeatureCollection tanpa feature mengembalikan null", () => {
    expect(bboxDariFeatureCollection({ type: "FeatureCollection", features: [] })).toBeNull();
  });
});
