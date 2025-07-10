interface AvatarProps {
  src: string;
  alt: string;
  size: number;
}

export const Avatar = ({ src, alt, size }: AvatarProps) => {
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", overflow: "hidden" }}>
      <img src={src} alt={alt} style={{ width: "100%", height: "100%", borderRadius: "50%" }} />
    </div>
  );
};
