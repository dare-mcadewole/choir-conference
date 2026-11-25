import Image from "next/image";

type LogoProps = {
  className?: string;
};

export function Logo({ className }: LogoProps) {
  return (
    <Image
      src="/images/cgac-logo.svg"
      alt=""
      width={64}
      height={64}
      className={className}
    />
  );
}
