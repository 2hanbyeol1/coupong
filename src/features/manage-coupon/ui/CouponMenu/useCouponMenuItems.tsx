"use client";
import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { deleteCouponOption } from "@/entities/coupon/api/query";
import { CouponType } from "@/entities/coupon/api/type";
import { getMyOrganizationRoleOption } from "@/entities/organization/api/query";
import { getMyInfoOption } from "@/entities/user/api/query";
import { EditCouponForm } from "@/features/manage-coupon/ui/EditCouponForm";
import useModal from "@/shared/lib/hook/useModal";
import useToast from "@/shared/lib/hook/useToast";
import { MoreMenuItem } from "@/shared/ui/MoreMenu";

const EDIT_COUPON_FORM_ID = "edit-coupon";

/**
 * 쿠폰 수정·삭제 메뉴 항목
 * 올린 사람이거나 그룹 관리자가 아니면 null
 */
function useCouponMenuItems(
  coupon: CouponType,
  { onDeleted }: { onDeleted?: () => void } = {},
): MoreMenuItem[] | null {
  const queryClient = useQueryClient();
  const { data: me } = useQuery(getMyInfoOption());
  const { data: myRole } = useQuery({
    ...getMyOrganizationRoleOption(coupon.organization_id ?? ""),
    enabled: !!coupon.organization_id,
  });
  const { showModal, hideModal, updateModal } = useModal();
  const { addToast } = useToast();

  const { mutate: deleteCoupon, isPending: isDeletingCoupon } = useMutation({
    ...deleteCouponOption(queryClient, {
      onSuccess: () => {
        hideModal();
        onDeleted?.();
      },
      // 권한이 없거나 네트워크 오류 등으로 실패하면 이유를 알려줌
      onError: (error) => {
        hideModal();
        addToast({ message: error.message });
      },
    }),
  });

  useEffect(() => {
    if (!isDeletingCoupon) return;
    updateModal({ confirmButtonDisabled: true });
    return () => updateModal({ confirmButtonDisabled: false });
  }, [isDeletingCoupon, updateModal]);

  // 올린 사람이거나 그룹 관리자면 수정·삭제 가능
  const canManage = me?.user_id === coupon.uploaded_by || myRole === "admin";
  if (!canManage) return null;

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
      },
    });
  };

  return [
    { label: "수정하기", onClick: openEditModal },
    { label: "삭제하기", onClick: openDeleteModal, variant: "danger" },
  ];
}

export default useCouponMenuItems;
