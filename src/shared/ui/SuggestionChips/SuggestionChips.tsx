"use client";
import { AnimatePresence, motion } from "framer-motion";

interface SuggestionChipsProps {
  /** false면 높이를 접으며 사라짐 */
  show: boolean;
  items: string[];
  onSelect: (value: string) => void;
}

/** 입력칸 아래 추천 값 태그 줄 (나타나고 사라질 때 높이를 펼치고 접으며 전환) */
function SuggestionChips({ show, items, onSelect }: SuggestionChipsProps) {
  return (
    <AnimatePresence initial={false}>
      {show && items.length > 0 && (
        <motion.div
          initial={{ height: 0, marginTop: 0, opacity: 0 }}
          animate={{ height: "auto", marginTop: 8, opacity: 1 }}
          exit={{ height: 0, marginTop: 0, opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="overflow-hidden"
        >
          <div className="flex flex-wrap gap-1.5">
            {items.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => onSelect(item)}
                title={item}
                className="bg-light text-dark max-w-full cursor-pointer truncate rounded-full px-3 py-1 text-sm"
              >
                {item}
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default SuggestionChips;
