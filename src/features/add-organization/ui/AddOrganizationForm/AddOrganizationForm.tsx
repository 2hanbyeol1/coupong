"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { addOrganizationOption } from "@/entities/organization/api/query";
import { ORGANIZATION_INFO } from "@/entities/organization/lib/schema";
import useModal from "@/shared/lib/hook/useModal";
import useToast from "@/shared/lib/hook/useToast";
import { TextInput } from "@/shared/ui";

import {
    AddOrganizationFormValues,
    addOrganizationSchema,
} from "../../lib/schema";

const INPUT_CONFIG = [
  {
    ...ORGANIZATION_INFO.name,
  },
];

function AddOrganizationForm({ formId }: { formId: string }) {
  const queryClient = useQueryClient();
  const { handleSubmit, register } = useForm<AddOrganizationFormValues>({
    mode: "onChange",
    resolver: zodResolver(addOrganizationSchema),
  });
  const { addToast } = useToast();
  const { hideModal } = useModal();

  const { mutate: addOrganization } = useMutation({
    ...addOrganizationOption(queryClient, {
      onSuccess: () => {
        addToast({
          message: "그룹이 추가되었어요",
          type: "success",
        });
        hideModal();
      },
      onError: (error) => {
        addToast({
          message: error.message,
          type: "error",
        });
      },
    }),
  });

  const onSubmit = (data: AddOrganizationFormValues) => {
    addOrganization({ organization: data });
  };

  return (
    <form id={formId} onSubmit={handleSubmit(onSubmit)}>
      <div className="flex flex-col gap-3">
        {INPUT_CONFIG.map(({ name, ...props }) => (
          <TextInput
            key={name}
            {...register(name as keyof AddOrganizationFormValues)}
            {...props}
          />
        ))}
      </div>
    </form>
  );
}

export default AddOrganizationForm;
