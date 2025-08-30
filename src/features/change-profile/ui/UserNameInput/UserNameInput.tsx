"use client";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getUserOption,
  updateUserProfileOption,
} from "@/entities/user/api/query";
import { USER_QUERY_KEY } from "@/entities/user/api/query-key";
import useToast from "@/shared/lib/hook/useToast";
import { cn } from "@/shared/lib/util/cn";
import Skeleton from "@/shared/ui/Skeleton";

import { changeProfileSchema } from "../../config/schema";

interface UserNameInputProps {
  className?: string;
}

function UserNameInput({ className }: UserNameInputProps) {
  const { addToast } = useToast();
  const queryClient = useQueryClient();

  const { data: user, isPending, isError } = useQuery(getUserOption(""));
  const { mutate: updateUserProfile } = useMutation({
    ...updateUserProfileOption(),
    onSuccess: () => {
      addToast({
        message: "사용자 이름이 수정되었어요",
        type: "success",
        duration: 3000,
      });
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEY.USER("") });
    },
    onError: () => {
      addToast({
        message: "사용자 이름 수정에 실패했어요",
        type: "error",
        duration: 3000,
      });
    },
  });

  const {
    register,
    setValue,
    formState: { errors },
  } = useForm({
    mode: "onChange",
    resolver: zodResolver(changeProfileSchema),
  });

  useEffect(() => {
    if (user) setValue("name", user.name);
  }, [user, setValue]);

  if (isPending) return <Skeleton className="w-20" textSize="3xl" />;
  if (isError) return <div>에러</div>;

  return (
    <label className="relative flex flex-col gap-1">
      <input
        type="text"
        className={cn(
          "w-full py-2 text-3xl font-semibold text-nowrap duration-200 hover:-translate-y-1.5",
          className,
        )}
        maxLength={8}
        {...register("name", {
          onBlur: (e) => {
            const newName = e.target.value;
            if (newName === user.name) return;
            updateUserProfile({ name: newName });
          },
        })}
      />
      {errors.name && (
        <p className="text-error absolute top-full">{errors.name.message}</p>
      )}
    </label>
  );
}

export default UserNameInput;
