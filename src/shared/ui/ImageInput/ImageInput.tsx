"use client";
import {
  ComponentProps,
  forwardRef,
  ReactNode,
  useEffect,
  useId,
  useState,
} from "react";
import { cva, VariantProps } from "class-variance-authority";
import { Image as ImageIcon } from "lucide-react";
import Image from "next/image";

import { cn } from "@/shared/lib/util/cn";

interface ImageInputProps
  extends VariantProps<typeof imageInputVariants>,
    ComponentProps<"input"> {
  className?: string;
  defaultImageUrl?: string | null;
  previewImageIcon?: ReactNode;
  previewImageClassName?: string;
  onImageChange?: ({
    imageFile,
    imageUrl,
  }: {
    imageFile: File;
    imageUrl: string;
  }) => void;
}

const imageInputVariants = cva(
  "flex w-full flex-col overflow-hidden rounded-md",
  {
    variants: {
      aspect: {
        none: "aspect-auto",
        square: "aspect-square",
        mobile: "aspect-[9/16]",
      },
    },
    defaultVariants: {
      aspect: "none",
    },
  },
);

const ImageInput = forwardRef<HTMLInputElement, ImageInputProps>(
  (
    {
      className,
      defaultImageUrl,
      previewImageIcon,
      previewImageClassName,
      aspect,
      onImageChange,
      onChange,
      ...props
    },
    ref,
  ) => {
    const [image, setImage] = useState<string | null>(null);

    const id = useId();

    useEffect(() => {
      return () => {
        if (image) URL.revokeObjectURL(image);
      };
    }, [image]);

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const imageFile = event.target.files?.[0];
      if (!imageFile) {
        return;
      }
      const imageUrl = URL.createObjectURL(imageFile);
      onImageChange?.({ imageFile, imageUrl });
      setImage(imageUrl);
    };

    return (
      <div className={cn(imageInputVariants({ aspect }), className)}>
        <input
          ref={ref}
          id={id}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            handleImageChange?.(e);
            onChange?.(e);
          }}
          {...props}
        />
        <label
          htmlFor={id}
          className={cn(
            "relative flex h-full w-full cursor-pointer items-center justify-center",
            image ? "" : "bg-light",
          )}
        >
          {image ? (
            <Image
              src={image}
              alt="이미지 미리보기"
              fill
              className={cn("h-full w-full", previewImageClassName)}
            />
          ) : (
            <>
              {defaultImageUrl ? (
                <Image
                  src={defaultImageUrl}
                  alt="이미지 미리보기"
                  fill
                  className={cn("h-full w-full", previewImageClassName)}
                />
              ) : (
                (previewImageIcon ?? (
                  <ImageIcon className="stroke-dark" size={28} />
                ))
              )}
            </>
          )}
        </label>
      </div>
    );
  },
);

ImageInput.displayName = "ImageInput";

export default ImageInput;
