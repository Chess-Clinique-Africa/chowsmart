interface ImageProps {
  src: string;
  alt: string;
  className?: string;
  aspect?: string;
}

export function Image({ src, alt, className = '', aspect = 'aspect-[4/3]' }: ImageProps) {
  return (
    <div className={`overflow-hidden bg-line/40 ${aspect} ${className}`}>
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        className="h-full w-full object-cover transition duration-500 hover:scale-[1.03]"
      />
    </div>
  );
}
