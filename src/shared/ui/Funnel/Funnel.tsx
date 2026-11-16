"use client";
import { PropsWithChildren, ReactElement } from "react";
import { AnimatePresence, motion, Variants } from "framer-motion";

import useSlideDirection from "@/shared/lib/hook/useSlideDirection";

import { StepProps } from "./Step";

interface FunnelProps extends PropsWithChildren {
  currentStep: string;
  children: ReactElement<StepProps>[];
}

// 다음 단계는 오른쪽에서, 이전 단계는 왼쪽에서 들어옴
const stepVariants: Variants = {
  enter: (direction: number) => ({ x: direction > 0 ? "100%" : "-100%" }),
  center: { x: 0 },
  exit: (direction: number) => ({ x: direction > 0 ? "-100%" : "100%" }),
};

function Funnel({ currentStep, children }: FunnelProps) {
  const currentStepIndex = children.findIndex(
    (child) => child.props.name === currentStep,
  );
  const currentStepElement = children[currentStepIndex];
  const direction = useSlideDirection(currentStepIndex);

  return (
    // 슬라이드 중 들어오고 나가는 화면이 문서 폭을 넓혀 가로 스크롤이 깜빡이지 않도록 잘라냄
    <div className="relative h-full w-full overflow-x-hidden">
      {/* 첫 진입 시에는 슬라이드하지 않음 (서버 렌더링 시 본문이 화면 밖에 있지 않도록) */}
      <AnimatePresence mode="popLayout" initial={false} custom={direction}>
        <motion.div
          key={currentStep}
          className="h-full w-full"
          custom={direction}
          variants={stepVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            duration: 0.3,
            ease: "easeInOut",
          }}
        >
          {currentStepElement}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default Funnel;
