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
    <AnimatePresence mode="wait">
      <motion.div
        key={currentStep}
        className="h-full w-full"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "-100%" }}
        transition={{ duration: 0.2 }}
      >
        {currentStepElement}
      </motion.div>
    </AnimatePresence>
  );
}

export default Funnel;
