import { CouponType } from "../../api/type";

import CouponImageWithCouponId from "./CouponImageWithCouponId";
import CouponImageWithCouponInfo from "./CouponImageWithCouponInfo";

type CouponInfo =
  | { couponId: CouponType["id"] }
  | { couponName: CouponType["name"]; imagePath: CouponType["image_path"] };

export interface CommonCouponImageProps {
  isInvalid?: boolean;
  imageClassName?: string;
}

type CouponImageProps = CouponInfo & CommonCouponImageProps;

function CouponImage({ ...props }: CouponImageProps) {
  const hasCouponDetailInfo = "imagePath" in props;

  if (hasCouponDetailInfo) return <CouponImageWithCouponInfo {...props} />;
  return <CouponImageWithCouponId {...props} />;
}

export default CouponImage;
