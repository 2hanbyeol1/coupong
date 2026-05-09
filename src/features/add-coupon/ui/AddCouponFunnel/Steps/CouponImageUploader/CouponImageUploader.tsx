"use client";
import { useEffect, useId, useRef } from "react";
import { useFormContext } from "react-hook-form";
import { Image as ImageIcon, Plus, X } from "lucide-react";
import Image from "next/image";

import { AddCouponFormValues } from "@/features/add-coupon/lib/schema";
import useToast from "@/shared/lib/hook/useToast";
import { Button } from "@/shared/ui";

interface CouponImageUploaderProps {
  onNext: () => void;
  imagePreviews: string[];
  onImagesChange: (files: File[]) => void;
}

function fileListFromFiles(files: File[]): FileList {
  const dt = new DataTransfer();
  files.forEach((file) => dt.items.add(file));
  return dt.files;
}

function CouponImageUploader({
  onNext,
  imagePreviews,
  onImagesChange,
}: CouponImageUploaderProps) {
  const {
    setValue,
    trigger,
    getValues,
    formState: { errors },
  } = useFormContext<AddCouponFormValues>();
  const { addToast } = useToast();
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    trigger("imageFile");
  }, [trigger]);

  const syncFiles = (files: File[]) => {
    const fileList = fileListFromFiles(files);
    setValue("imageFile", fileList, {
      shouldValidate: true,
      shouldDirty: true,
    });
    onImagesChange(files);
  };

  const getCurrentFiles = (): File[] => {
    const current = getValues("imageFile") as FileList | undefined;
    return current ? Array.from(current) : [];
  };

  const handleFilesPicked = (event: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(event.target.files ?? []);
    if (picked.length === 0) return;

    syncFiles([...getCurrentFiles(), ...picked]);

    // 같은 파일을 다시 선택할 수 있도록 input 값 초기화
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleRemove = (index: number) => {
    syncFiles(getCurrentFiles().filter((_, i) => i !== index));
  };

  const handleNextButtonClick = () => {
    const imageFileError = errors.imageFile;
    if (!imageFileError) {
      onNext();
      return;
    }
    addToast({
      message: imageFileError.message as string,
      type: "error",
    });
  };

  return (
    <div className="flex h-full w-full flex-col p-4">
      <div className="flex min-h-0 flex-1 flex-col gap-6">
        <h1 className="text-2xl leading-snug font-semibold">
          기프티콘을
          <br />
          업로드해주세요
        </h1>

        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFilesPicked}
        />

        {imagePreviews.length === 0 ? (
          <label
            htmlFor={inputId}
            className="border-light bg-light relative flex w-full flex-1 cursor-pointer items-center justify-center overflow-hidden rounded-md border-4"
          >
            <ImageIcon className="stroke-dark" size={28} />
          </label>
        ) : (
          <div className="min-h-0 flex-1 overflow-y-auto">
            <div className="grid grid-cols-3 gap-2">
              {imagePreviews.map((url, index) => (
                <div
                  key={url}
                  className="border-light relative aspect-square overflow-hidden rounded-md border-2"
                >
                  <Image
                    src={url}
                    alt={`쿠폰 이미지 ${index + 1}`}
                    fill
                    className="object-contain"
                  />
                  <button
                    type="button"
                    aria-label="이미지 제거"
                    onClick={() => handleRemove(index)}
                    className="absolute top-1 right-1 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              <label
                htmlFor={inputId}
                className="border-light bg-light flex aspect-square cursor-pointer items-center justify-center rounded-md border-2"
              >
                <Plus className="stroke-dark" size={24} />
              </label>
            </div>
          </div>
        )}
      </div>
      <div className="flex shrink-0 flex-col gap-1 pt-4">
        <Button onClick={handleNextButtonClick} color="primary" size="lg" full>
          다음
        </Button>
      </div>
    </div>
  );
}

export default CouponImageUploader;
