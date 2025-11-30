import { useEffect } from "react";
import { useFormContext } from "react-hook-form";

import useToast from "@/shared/lib/hook/useToast";
import { Button, ImageInput } from "@/shared/ui";

interface CouponImageUploaderProps {
  onNext: () => void;
  onImageChange: ({
    imageFile,
    imageUrl,
  }: {
    imageFile: File;
    imageUrl: string;
  }) => void;
}

function CouponImageUploader({
  onNext,
  onImageChange,
}: CouponImageUploaderProps) {
  const {
    register,
    formState: { errors },
    trigger,
  } = useFormContext();
  const { addToast } = useToast();

  useEffect(() => {
    trigger("imageFile");
  }, [trigger]);

  const handleNextButtonClick = () => {
    const imageFileError = errors.imageFile;
    if (!imageFileError) {
      onNext();
      return;
    }
    addToast({
      message: imageFileError.message as string, // ! 하드 코딩
      type: "error",
    });
  };

  return (
    <div className="flex h-full w-full flex-col justify-between gap-16 p-4">
      <div className="flex h-full flex-col gap-6">
        <h1 className="text-2xl leading-snug font-semibold">
          기프티콘을
          <br />
          업로드해주세요
        </h1>
        <ImageInput
          className="h-full w-full flex-1"
          previewImageClassName="object-contain"
          onImageChange={(props) => {
            // ! 임시
            onImageChange(props);
            trigger("imageFile");
          }}
          {...register("imageFile")}
        />
      </div>
      <div className="flex flex-col gap-1">
        <Button onClick={handleNextButtonClick} color="primary" size="lg" full>
          다음
        </Button>
      </div>
    </div>
  );
}

export default CouponImageUploader;
