"use client";

export default function ProductImage({
  src,
  alt,
  className = "h-full w-full object-contain p-5",
}: {
  src: string | null | undefined;
  alt: string;
  className?: string;
}) {
  if (!src) {
    return (
      <div className="w-full h-full flex items-center justify-center text-slate-300 text-sm font-bold">
        {alt.slice(0, 2)}
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading="lazy"
      className={className}
      onError={(e) => {
        const el = e.currentTarget;
        el.style.display = "none";
        const fallback = el.parentElement?.querySelector("[data-fallback]");
        if (fallback) (fallback as HTMLElement).style.display = "flex";
      }}
    />
  );
}
