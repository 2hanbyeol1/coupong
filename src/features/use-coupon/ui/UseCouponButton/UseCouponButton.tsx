import { useMutation, useQueryClient } from "@tanstack/react-query";

import { changeCouponToUsedOption } from "@/entities/coupon/api/query";
import { CouponType } from "@/entities/coupon/api/type";
import useModal from "@/shared/lib/hook/useModal";
import { Button } from "@/shared/ui";

function UseCouponButton({ couponId }: { couponId: CouponType["id"] }) {
  const queryClient = useQueryClient();

  const { mutate: changeCouponToUsed } = useMutation({
    ...changeCouponToUsedOption(queryClient),
  });

  const { showModal, hideModal } = useModal();

  const handleShowModal = () => {
    showModal({
      title: "쿠폰을 사용하셨나요?",
      content: "한번 사용 버튼을 누르면 되돌릴 수 없어요.",
      onConfirm: () => {
        changeCouponToUsed(couponId);
        hideModal();
      },
    });
  };

  return <Button onClick={handleShowModal}>사용 완료</Button>;
}

export default UseCouponButton;
