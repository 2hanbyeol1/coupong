"use client";
import { PropsWithChildren, ReactElement } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { StepProps } from "./Step";

interface FunnelProps extends PropsWithChildren {
  currentStep: string;
  children: ReactElement<StepProps>[];
}

function Funnel({ currentStep, children }: FunnelProps) {
  const currentStepElement = children.find(
    (child) => child.props.name === currentStep,
  );

  return (
    // 첫 진입 시에는 슬라이드하지 않음 (서버 렌더링 시 본문이 화면 밖에 있지 않도록)
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.div
        key={currentStep}
        className="h-full w-full"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "-100%" }}
        transition={{
          duration: 0.3,
          ease: "easeInOut",
        }}
      >
        {currentStepElement}
      </motion.div>
    </AnimatePresence>
  );
}

export default Funnel;
