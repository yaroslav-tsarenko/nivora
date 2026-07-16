"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Maximize2 } from "lucide-react";
import { getProductImage, getProductImageFallback } from "@/lib/utils/product-image";

interface ProductGalleryProps {
  images: { id: string; url: string; alt?: string | null }[];
  productName: string;
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [errored, setErrored] = useState<Record<string, boolean>>({});

  const effectiveImages = useMemo(() => {
    if (images.length > 0) return images;
    return [
      {
        id: "fallback",
        url: getProductImageFallback("800x800", productName),
        alt: productName,
      },
    ];
  }, [images, productName]);

  const active = effectiveImages[selectedIndex];
  const resolveSrc = (id: string, url: string) =>
    errored[id]
      ? getProductImageFallback("800x800", `${productName}-${id}`)
      : getProductImage(url, productName);

  return (
    <div className="flex flex-col gap-3">
      {/* Primary image */}
      <div className="group relative aspect-square cursor-zoom-in overflow-hidden rounded-2xl border border-[color:var(--color-line)] bg-[rgb(247,247,247)] sm:aspect-[4/3]">

        {/* Frame index badge */}
        <span className="absolute left-3 top-3 z-10 inline-flex items-center gap-1 rounded-md border border-[color:var(--color-line)] bg-[color:var(--color-bg-elevated)]/90 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[color:var(--color-text-secondary)] backdrop-blur">
          <span className="tabular-nums">
            {(selectedIndex + 1).toString().padStart(2, "0")}
          </span>
          <span className="opacity-50">/</span>
          <span className="tabular-nums opacity-70">
            {effectiveImages.length.toString().padStart(2, "0")}
          </span>
        </span>

        {/* Zoom hint */}
        <span className="absolute right-3 top-3 z-10 inline-flex items-center gap-1 rounded-md border border-[color:var(--color-line)] bg-[color:var(--color-bg-elevated)]/90 px-2 py-1 text-[color:var(--color-text-secondary)] opacity-0 backdrop-blur transition-opacity group-hover:opacity-100">
          <Maximize2 size={11} />
        </span>

        <AnimatePresence mode="wait">
          <motion.div
            key={active.id}
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="relative h-full w-full"
          >
            <div className="absolute inset-0 flex items-center justify-center p-6 sm:p-10">
              <Image
                src={resolveSrc(active.id, active.url)}
                alt={active.alt || productName}
                width={800}
                height={800}
                sizes="(max-width: 768px) 100vw, 50vw"
                className="max-h-full max-w-full object-contain object-center transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                priority
                onError={() =>
                  setErrored((prev) => ({ ...prev, [active.id]: true }))
                }
              />
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Subtle bottom hairline glow */}
        <span
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[color:var(--color-primary)] to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-40"
        />
      </div>

      {/* Thumbnails */}
      {effectiveImages.length > 1 && (
        <div className="scrollbar-none flex gap-2 overflow-x-auto p-1">
          {effectiveImages.map((image, index) => {
            const isActive = index === selectedIndex;
            return (
              <motion.button
                key={image.id}
                whileTap={{ scale: 0.94 }}
                onClick={() => setSelectedIndex(index)}
                aria-label={`Show image ${index + 1}`}
                className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 bg-[rgb(247,247,247)] p-1 transition-all sm:h-[76px] sm:w-[76px] ${
                  isActive
                    ? "border-[color:var(--color-primary)] shadow-[0_0_0_3px_var(--color-primary-tint)]"
                    : "border-[color:var(--color-line)] hover:-translate-y-px hover:border-[color:var(--color-primary)]/60"
                }`}
              >
                <div className="absolute inset-0 flex items-center justify-center p-1">
                  <Image
                    src={resolveSrc(image.id, image.url)}
                    alt={image.alt || `${productName} ${index + 1}`}
                    width={76}
                    height={76}
                    sizes="76px"
                    className="max-h-full max-w-full object-contain object-center"
                    onError={() =>
                      setErrored((prev) => ({ ...prev, [image.id]: true }))
                    }
                  />
                </div>
                {isActive && (
                  <motion.span
                    layoutId="gallery-active-underline"
                    aria-hidden
                    className="absolute inset-x-2 bottom-1 h-0.5 rounded-full bg-[color:var(--color-primary)]"
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      )}
    </div>
  );
}
