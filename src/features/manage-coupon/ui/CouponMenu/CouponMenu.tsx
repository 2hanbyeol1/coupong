"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { deleteCouponOption } from "@/entities/coupon/api/query";
import { CouponType } from "@/entities/coupon/api/type";
import { getMyInfoOption } from "@/entities/user/api/query";
import { EditCouponForm } from "@/features/manage-coupon/ui/EditCouponForm";
import { ROUTES } from "@/shared/config/routes";
import useModal from "@/shared/lib/hook/useModal";
import { MoreMenu } from "@/shared/ui";

const EDIT_COUPON_FORM_ID = "edit-coupon";

export interface CouponMenuProps {
  coupon: CouponType;
  className?: string;
  redirectOnDelete?: boolean;
}

function CouponMenu({
  coupon,
  className,
  redirectOnDelete = false,
}: CouponMenuProps) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { data: me } = useQuery(getMyInfoOption());
  const { showModal, hideModal } = useModal();

  const { mutate: deleteCoupon } = useMutation({
    ...deleteCouponOption(queryClient, {
      onSuccess: () => {
        if (redirectOnDelete) router.replace(ROUTES.HOME);
      },
    }),
  });

  if (me?.user_id !== coupon.uploaded_by) return null;

  const openEditModal = () => {
    showModal({
      title: "쿠폰 수정",
      content: <EditCouponForm coupon={coupon} formId={EDIT_COUPON_FORM_ID} />,
      confirmButtonText: "수정",
      formId: EDIT_COUPON_FORM_ID,
    });
  };

  const openDeleteModal = () => {
    showModal({
      title: "쿠폰을 삭제할까요?",
      content: "삭제된 쿠폰은 되돌릴 수 없어요.",
      confirmButtonText: "삭제",
      onConfirm: () => {
        deleteCoupon(coupon.id);
        hideModal();
      },
    });
  };

  return (
    <MoreMenu
      className={className}
      items={[
        { label: "수정하기", onClick: openEditModal },
        { label: "삭제하기", onClick: openDeleteModal, variant: "danger" },
      ]}
    />
  );
}

export default CouponMenu;
