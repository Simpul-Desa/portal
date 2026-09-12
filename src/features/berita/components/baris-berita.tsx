/**
 * Satu baris Berita Desa: judul bertautan (atau teks biasa bila URL tidak
 * aman), baris meta `sumber • tanggal`, rangkuman terpotong tiga baris, dan
 * chip kategori statis. Presentational murni — tidak memanggil query apa pun.
 */

import { ExternalLink } from "lucide-react";

import { FOCUS_RING } from "@/shared/components/focus-ring";

import type { ItemBerita } from "../hooks/queries";
import { labelMeta, urlAman } from "../services/berita";

export function BarisBerita({ item }: { item: ItemBerita }) {
  const href = urlAman(item.url);

  return (
    <article className="py-3">
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Buka berita "${item.judul}" di situs ${item.sumber}, tab baru`}
          className={`group flex items-start gap-1.5 text-title-sm text-ink hover:text-primary transition-colors ${FOCUS_RING}`}
        >
          <span>{item.judul}</span>
          <ExternalLink
            aria-hidden="true"
            size={16}
            strokeWidth={1.5}
            className="mt-0.5 shrink-0 text-muted group-hover:text-primary transition-colors"
          />
        </a>
      ) : (
        <p className="text-title-sm text-ink">{item.judul}</p>
      )}

      <p className="mt-1 text-micro text-muted">{labelMeta(item)}</p>

      {item.rangkuman && <p className="mt-1 line-clamp-3 text-body-md text-body">{item.rangkuman}</p>}

      {item.kategori.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {item.kategori.map((k) => (
            <span key={k} className="rounded-xs bg-inset px-2 py-1 text-badge text-ink">
              {k}
            </span>
          ))}
        </div>
      )}
    </article>
  );
}
