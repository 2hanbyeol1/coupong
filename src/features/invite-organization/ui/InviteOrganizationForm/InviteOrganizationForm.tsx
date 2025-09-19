"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";

import { sendEmailOption } from "@/entities/email/query";
import { addInvitationOption } from "@/entities/invitation/api/query";
import { OrganizationType } from "@/entities/organization/api/type";
import useToast from "@/shared/lib/hook/useToast";
import { TextInput } from "@/shared/ui";

import {
  InviteOrganizationFormValues,
  inviteOrganizationSchema,
} from "../../lib/schema";
import { getInvitationEmailHtml } from "../../lib/util";

interface InviteOrganizationFormProps {
  formId: string;
  organization: OrganizationType;
}

function InviteOrganizationForm({
  formId,
  organization,
}: InviteOrganizationFormProps) {
  const { addToast } = useToast();

  const { mutateAsync: addInvitation } = useMutation({
    ...addInvitationOption(),
    onError: (error) => {
      addToast({
        message: error.message,
        type: "error",
      });
    },
  });

  const { mutateAsync: sendEmail } = useMutation({
    ...sendEmailOption(),
    onSuccess: () => {
      addToast({
        message: "초대를 보냈어요!",
        type: "success",
      });
    },
    onError: (error) => {
      addToast({
        message: error.message,
        type: "error",
      });
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<InviteOrganizationFormValues>({
    mode: "onChange",
    resolver: zodResolver(inviteOrganizationSchema),
  });

  const onSubmit = async (data: InviteOrganizationFormValues) => {
    if (!process.env.NEXT_PUBLIC_RESEND_EMAIL)
      throw Error(`환경 변수 값 "RESEND_FROM_EMAIL"이 설정되지 않았어요`);
    const token = await addInvitation({
      inviteEmail: data.email,
      organizationId: organization.id,
    });
    await sendEmail({
      from: process.env.NEXT_PUBLIC_RESEND_EMAIL,
      to: data.email,
      subject: `[쿠퐁] 그룹 "${organization.name}"에서 초대를 보냈어요!`,
      html: getInvitationEmailHtml(organization.name, token),
    });
  };

  return (
    <form id={formId} onSubmit={handleSubmit(onSubmit)} className="mt-6 mb-4">
      <TextInput
        placeholder="초대 수신 이메일"
        errorMessage={errors.email?.message}
        {...register("email")}
      />
    </form>
  );
}

export default InviteOrganizationForm;
