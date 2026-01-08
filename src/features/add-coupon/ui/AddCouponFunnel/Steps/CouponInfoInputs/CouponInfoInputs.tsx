import { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import Image from "next/image";

import { COUPON_INFO } from "@/entities/coupon/lib/schema";
import useToast from "@/shared/lib/hook/useToast";
import { TextInput } from "@/shared/ui";

interface CouponInfoInputsProps {
  couponImage: string;
}

const INPUT_CONFIG = [
  {
    ...COUPON_INFO.place,
  },
  {
    ...COUPON_INFO.name,
  },
  {
    ...COUPON_INFO.expire_at,
  },
];

function CouponInfoInputs({ couponImage }: CouponInfoInputsProps) {
  const {
    register,
    formState: { isValid, errors },
  } = useFormContext();

  const { addToast } = useToast();

  useEffect(() => {
    if (isValid) return;

    for (const { name } of INPUT_CONFIG) {
      if (errors?.[name]) {
        addToast({
          message: errors[name].message as string, // ! 하드 코딩
          type: "error",
        });
        break;
      }
    }
  }, [isValid, errors, addToast]);

  return (
    <div className="flex h-full flex-col gap-6">
      <h1 className="text-2xl leading-snug font-semibold">
        쿠폰에 대한 설명을
        <br />
        입력해주세요
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
        {INPUT_CONFIG.map(({ name, type, placeholder, ...props }) => (
          <TextInput
            key={name}
            type={type}
            placeholder={placeholder}
            {...register(name)}
            {...props}
          />
        ))}
      </div>
    </div>
  );
}

export default CouponInfoInputs;
