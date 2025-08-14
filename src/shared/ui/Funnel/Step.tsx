import { PropsWithChildren } from "react";

export interface StepProps extends PropsWithChildren {
  name: string;
}

const Step = ({ children }: StepProps) => {
  return <>{children}</>;
};

export default Step;
