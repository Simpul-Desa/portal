"use client";

import { useEffect, useRef } from "react";
import type * as maplibregl from "maplibre-gl";

import { bboxDariFitur } from "@/lib/map/bounds";
import {
  LAYER_KEMBAR_FILL,
  LAYER_KEMBAR_GARIS,
  LAYER_KEMBAR_GARIS_HALO,
  LAYER_KEMBAR_LINE,
  LAYER_KEMBAR_TITIK,
  LAYER_KEMBAR_TITIK_INNER,
  SUMBER_KEMBAR_GARIS,
  SUMBER_KEMBAR_TITIK,
  layerKembarFill,
  layerKembarGaris,
  layerKembarGarisHalo,
  layerKembarLine,
  layerKembarTitik,
  layerKembarTitikInner,
} from "@/lib/map/kembar";
import { LAYER_DESA_TERPILIH_FILL, SUMBER_DESA } from "@/lib/map/sumber";
import { useGeoDesa } from "@/shared/hooks/queries-wilayah";

type UseKembarLayersOpsi = {
  map: maplibregl.Map | null;
  styleVersion: number;
  aktif: boolean;
  kembar: string | undefined;
  desa?: string;
  kab?: string;
};

/**
 * Mencari titik koordinat pusat [lon, lat] dari sebuah fitur desa.
 */
function pusatDesa(fitur: GeoJSON.Feature): [number, number] | null {
  const props = fitur.properties;
  if (props?.pusat && Array.isArray(props.pusat) && props.pusat.length === 2) {
    const [lon, lat] = props.pusat;
    if (typeof lon === "number" && typeof lat === "number") {
      return [lon, lat];
    }
  }
  const bbox = bboxDariFitur(fitur);
  if (bbox && Array.isArray(bbox) && bbox.length === 2) {
    const [[minLng, minLat], [maxLng, maxLat]] = bbox as [[number, number], [number, number]];
    return [(minLng + maxLng) / 2, (minLat + maxLat) / 2];
  }
  return null;
}

/**
 * Menggabungkan bounding box dari dua fitur desa agar kamera peta dapat
 * menampilkan kedua desa sekaligus dengan jelas.
 */
function bboxDuaFitur(
  fiturA: GeoJSON.Feature,
  fiturB: GeoJSON.Feature,
): maplibregl.LngLatBoundsLike | null {
  const bboxA = bboxDariFitur(fiturA);
  const bboxB = bboxDariFitur(fiturB);
  if (!bboxA && !bboxB) return null;
  if (!bboxA) return bboxB;
  if (!bboxB) return bboxA;

  const [[minLngA, minLatA], [maxLngA, maxLatA]] = bboxA as [[number, number], [number, number]];
  const [[minLngB, minLatB], [maxLngB, maxLatB]] = bboxB as [[number, number], [number, number]];

  return [
    [Math.min(minLngA, minLngB), Math.min(minLatA, minLatB)],
    [Math.max(maxLngA, maxLngB), Math.max(maxLatA, maxLatB)],
  ];
}

/**
 * Sorotan Desa Kembar terpilih:
 * 1. Dua layer poligon (isi + garis) pada desa kembar terpilih di atas SUMBER_DESA.
 * 2. Garis lurus animasi penghubung antara Desa Acuan dan Desa Kembar.
 * 3. Titik pin pusat pada kedua desa yang dibandingkan.
 * 4. Penyesuaian kamera (fitBounds) dinamis agar kedua desa tampil jelas bersama garis penghubung.
 */
export function useKembarLayers({
  map,
  styleVersion,
  aktif,
  kembar,
  desa,
  kab,
}: UseKembarLayersOpsi): void {
  const geo = useGeoDesa(kab);
  const geoSiap = Boolean(geo.data);
  const terakhirFitRef = useRef<string>("");

  useEffect(() => {
    if (!kembar) {
      terakhirFitRef.current = "";
    }
  }, [kembar, desa]);

  useEffect(() => {
    if (!map) return;
    const petaAktif = map;

    if (!aktif || !kembar) return;
    if (!petaAktif.getSource(SUMBER_DESA)) return;

    // 1. Pasang layer sorotan poligon desa kembar
    petaAktif.addLayer(
      layerKembarFill(kembar) as maplibregl.AddLayerObject,
      LAYER_DESA_TERPILIH_FILL,
    );
    petaAktif.addLayer(
      layerKembarLine(kembar) as maplibregl.AddLayerObject,
      LAYER_DESA_TERPILIH_FILL,
    );

    let animId: number | null = null;

    // 2. Tarik garis lurus animasi & titik jika kedua desa ada dalam dataset geo
    if (desa && geo.data) {
      const fiturAcuan = geo.data.features.find((f) => f.properties?.iddesa === desa);
      const fiturKembar = geo.data.features.find((f) => f.properties?.iddesa === kembar);

      if (fiturAcuan && fiturKembar) {
        const posA = pusatDesa(fiturAcuan);
        const posB = pusatDesa(fiturKembar);

        if (posA && posB) {
          // Siapkan sumber GeoJSON untuk garis & titik
          if (!petaAktif.getSource(SUMBER_KEMBAR_GARIS)) {
            petaAktif.addSource(SUMBER_KEMBAR_GARIS, {
              type: "geojson",
              data: { type: "FeatureCollection", features: [] },
            });
          }
          if (!petaAktif.getSource(SUMBER_KEMBAR_TITIK)) {
            petaAktif.addSource(SUMBER_KEMBAR_TITIK, {
              type: "geojson",
              data: { type: "FeatureCollection", features: [] },
            });
          }

          // Pasang layer visual garis lurus & titik pin
          if (!petaAktif.getLayer(LAYER_KEMBAR_GARIS_HALO)) {
            petaAktif.addLayer(layerKembarGarisHalo() as maplibregl.AddLayerObject);
          }
          if (!petaAktif.getLayer(LAYER_KEMBAR_GARIS)) {
            petaAktif.addLayer(layerKembarGaris() as maplibregl.AddLayerObject);
          }
          if (!petaAktif.getLayer(LAYER_KEMBAR_TITIK)) {
            petaAktif.addLayer(layerKembarTitik() as maplibregl.AddLayerObject);
          }
          if (!petaAktif.getLayer(LAYER_KEMBAR_TITIK_INNER)) {
            petaAktif.addLayer(layerKembarTitikInner() as maplibregl.AddLayerObject);
          }

          // Set titik pusat kedua desa
          const fcTitik: GeoJSON.FeatureCollection<GeoJSON.Point> = {
            type: "FeatureCollection",
            features: [
              { type: "Feature", properties: {}, geometry: { type: "Point", coordinates: posA } },
              { type: "Feature", properties: {}, geometry: { type: "Point", coordinates: posB } },
            ],
          };
          (petaAktif.getSource(SUMBER_KEMBAR_TITIK) as maplibregl.GeoJSONSource | undefined)?.setData(
            fcTitik,
          );

          // Animasi garis lurus ditarik dari Desa Acuan ke Desa Kembar
          const waktuMulai = performance.now();
          const durasiAnimasi = 1000; // 1 detik

          const gambarFrame = (sekarang: number) => {
            const waktuLewat = sekarang - waktuMulai;
            const progress = Math.min(1, waktuLewat / durasiAnimasi);
            const ease = 1 - Math.pow(1 - progress, 3); // cubic ease-out

            const curLon = posA[0] + (posB[0] - posA[0]) * ease;
            const curLat = posA[1] + (posB[1] - posA[1]) * ease;

            const fcGaris: GeoJSON.FeatureCollection<GeoJSON.LineString> = {
              type: "FeatureCollection",
              features: [
                {
                  type: "Feature",
                  properties: {},
                  geometry: {
                    type: "LineString",
                    coordinates: [posA, [curLon, curLat]],
                  },
                },
              ],
            };

            const sumberGaris = petaAktif.getSource(
              SUMBER_KEMBAR_GARIS,
            ) as maplibregl.GeoJSONSource | undefined;
            if (sumberGaris) {
              sumberGaris.setData(fcGaris);
            }

            if (progress < 1) {
              animId = requestAnimationFrame(gambarFrame);
            }
          };

          animId = requestAnimationFrame(gambarFrame);

          // 3. Atur kamera (view map) agar kedua desa terlihat jelas
          const kunci = `${desa}-${kembar}`;
          if (kunci !== terakhirFitRef.current) {
            terakhirFitRef.current = kunci;
            const bbox = bboxDuaFitur(fiturAcuan, fiturKembar);
            if (bbox) {
              const isDesktop = typeof window !== "undefined" && window.innerWidth >= 768;
              const padLeft = isDesktop ? 440 : 60;

              petaAktif.fitBounds(bbox, {
                padding: { top: 120, right: 90, bottom: 80, left: padLeft },
                maxZoom: 14.5,
                duration: 1200,
              });
            }
          }
        }
      }
    }

    return () => {
      if (animId !== null) {
        cancelAnimationFrame(animId);
      }

      // Bersihkan layer titik & garis
      if (petaAktif.getLayer(LAYER_KEMBAR_TITIK_INNER)) {
        petaAktif.removeLayer(LAYER_KEMBAR_TITIK_INNER);
      }
      if (petaAktif.getLayer(LAYER_KEMBAR_TITIK)) {
        petaAktif.removeLayer(LAYER_KEMBAR_TITIK);
      }
      if (petaAktif.getLayer(LAYER_KEMBAR_GARIS)) {
        petaAktif.removeLayer(LAYER_KEMBAR_GARIS);
      }
      if (petaAktif.getLayer(LAYER_KEMBAR_GARIS_HALO)) {
        petaAktif.removeLayer(LAYER_KEMBAR_GARIS_HALO);
      }

      // Bersihkan sumber titik & garis
      if (petaAktif.getSource(SUMBER_KEMBAR_TITIK)) {
        petaAktif.removeSource(SUMBER_KEMBAR_TITIK);
      }
      if (petaAktif.getSource(SUMBER_KEMBAR_GARIS)) {
        petaAktif.removeSource(SUMBER_KEMBAR_GARIS);
      }

      // Bersihkan layer sorotan poligon
      if (petaAktif.getLayer(LAYER_KEMBAR_LINE)) {
        petaAktif.removeLayer(LAYER_KEMBAR_LINE);
      }
      if (petaAktif.getLayer(LAYER_KEMBAR_FILL)) {
        petaAktif.removeLayer(LAYER_KEMBAR_FILL);
      }
    };
  }, [map, styleVersion, aktif, kembar, desa, geoSiap, geo.data]);
}
