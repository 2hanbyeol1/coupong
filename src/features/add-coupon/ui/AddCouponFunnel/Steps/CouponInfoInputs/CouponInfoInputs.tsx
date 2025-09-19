import { useFormContext } from "react-hook-form";
import Image from "next/image";

import { INPUT_CONFIG } from "@/features/add-coupon/lib/input";
import useToast from "@/shared/lib/hook/useToast";
import { Button, TextInput } from "@/shared/ui";
import { FullView } from "@/shared/ui/FullView";

interface CouponInfoInputsProps {
  couponImage: string;
  isSubmitting: boolean;
}

function CouponInfoInputs({
  couponImage,
  isSubmitting,
}: CouponInfoInputsProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext();
  const { addToast } = useToast();

  const handleSubmitButtonClick = () => {
    for (const input of INPUT_CONFIG) {
      if (!!errors[input.name]) {
        addToast({
          message: errors[input.name]?.message as string, // ! 하드 코딩
          type: "error",
        });
        return;
      }
    }
  };

  return (
    <FullView className="relative" withHeader={true}>
      <div className="flex h-full w-full flex-col justify-between gap-16 p-4">
        <div className="flex h-full flex-col gap-6">
          <h1 className="text-2xl leading-snug font-semibold">
            쿠폰에 대한 설명을 입력해주세요
          </h1>
          <div className="relative h-full w-full flex-1">
            <Image
              src={couponImage}
              alt="쿠폰 이미지"
              fill
              className="object-contain object-left"
            />
          </div>
          <div className="flex flex-col gap-3">
            {INPUT_CONFIG.map((input) => (
              <TextInput
                key={input.name}
                type={input.type}
                placeholder={input.placeholder}
                {...register(input.name)}
              />
            ))}
          </div>
        </div>
        <Button
          type="submit"
          size="lg"
          full
          disabled={isSubmitting}
          onClick={handleSubmitButtonClick}
        >
          {isSubmitting ? "등록 중..." : "등록"}
        </Button>
      </div>
    </FullView>
  );
}

export default CouponInfoInputs;
