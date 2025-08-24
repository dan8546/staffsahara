interface SmartImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
}

export function SmartImage({ src, alt, width, height, className, ...props }: SmartImageProps) {
  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      loading="lazy"
      decoding="async"
      fetchPriority="low"
      {...props}
    />
  );
}