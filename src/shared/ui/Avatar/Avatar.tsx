import { cva, VariantProps } from "class-variance-authority";

interface AvatarProps extends VariantProps<typeof avatarVariants> {
  name: string;
}

const avatarVariants = cva(
  "flex items-center justify-center rounded-full overflow-hidden whitespace-nowrap",
  {
    variants: {
      color: {
        primary: "bg-primary text-white",
        secondary: "bg-light text-primary",
      },
      size: {
        24: "h-6 w-6 text-sm",
        80: "h-20 w-20 text-2xl",
      },
    },
    defaultVariants: {
      color: "primary",
      size: 24,
    },
  },
);

function Avatar({ name, color, size }: AvatarProps) {
  return <div className={avatarVariants({ size, color })}>{name[0]}</div>;
}

export default Avatar;
