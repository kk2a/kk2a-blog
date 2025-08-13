"use client";

import Image from "next/image";

interface ImageWithCaptionProps {
  src: string;
  alt: string;
  caption?: string;
  width?: number;
  height?: number;
  className?: string;
}

export function ImageWithCaption({
  src,
  alt,
  caption,
  width = 600,
  height = 400,
  className = "",
}: ImageWithCaptionProps) {
  return (
    <figure className={`my-8 ${className}`}>
      <div className="relative rounded-lg overflow-hidden border border-theme-border">
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          className="w-full h-auto"
          style={{ objectFit: "cover" }}
        />
      </div>
      {caption && (
        <figcaption className="mt-2 text-sm text-theme-3 text-center italic">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
