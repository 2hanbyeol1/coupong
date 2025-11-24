import { PropsWithChildren } from "react";
import { motion } from "framer-motion";

function Swiper({ children }: PropsWithChildren) {
  return (
    <motion.div className="relative flex h-full w-full snap-x snap-mandatory gap-6 overflow-x-auto">
      {children}
    </motion.div>
  );
}

export default Swiper;
