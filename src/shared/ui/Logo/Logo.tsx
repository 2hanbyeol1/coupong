import Image from "next/image";

interface LogoProps {
  size: number;
}

function Logo({ size }: LogoProps) {
  return (
    <Image src="/logo/192.png" alt="로고" width={size} height={size} priority />
  );
}

export default Logo;
