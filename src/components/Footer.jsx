import { AnimatePresence, motion } from "framer-motion";

function ProjectNav({ current, total, onPrev, onNext }) {
  return (
    <div className="relative w-20 h-20 md:w-32 md:h-32 border border-stone-500 rounded-full flex items-center justify-center p-2 md:p-4 shrink-0">
      <div className="relative w-full h-full flex items-center justify-center">
        <div className="absolute w-[120%] h-[1px] bg-stone-400 rotate-[-45deg]"></div>
        <button
          onClick={onPrev}
          aria-label="上一页"
          className="absolute left-0.5 md:left-1 text-[10px] md:text-xs text-stone-700 cursor-pointer hover:text-black transition-colors"
        >
          ←
        </button>
        <div className="text-xl md:text-4xl font-light tracking-tighter flex items-center justify-center space-x-4 z-10">
          <AnimatePresence mode="wait">
            <motion.span
              key={current}
              className="absolute top-0 left-1.5 md:left-3"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              {String(current).padStart(2, "0")}
            </motion.span>
          </AnimatePresence>
          <AnimatePresence mode="wait">
            <motion.span
              key={total}
              className="absolute bottom-0 right-1.5 md:right-3"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              {String(total).padStart(2, "0")}
            </motion.span>
          </AnimatePresence>
        </div>
        <button
          onClick={onNext}
          aria-label="下一页"
          className="absolute right-0.5 md:right-1 text-[10px] md:text-xs text-stone-700 cursor-pointer hover:text-black transition-colors"
        >
          →
        </button>
      </div>
    </div>
  );
}

export default function Footer({ current, total, onPrev, onNext, image }) {
  return (
    <footer className="absolute bottom-0 left-0 right-0 w-full flex flex-row items-center justify-between md:items-end gap-3 md:gap-8 p-3 md:p-12 md:py-7 pointer-events-auto">
      <ProjectNav
        current={current}
        total={total}
        onPrev={onPrev}
        onNext={onNext}
      />

      <div className="hidden md:flex flex-col space-y-4 md:mb-4 justify-center items-center">
        <span
          className="text-sm italic text-stone-600 tracking-widest"
          style={{ writingMode: "vertical-lr" }}
        >
          滚 动
        </span>
        <div className="w-[1px] h-16 bg-stone-500"></div>
      </div>

      {/* 移动端：上下滑指示 */}
      <div className="flex md:hidden items-center text-[10px] tracking-[0.2em] uppercase text-stone-500">
        上下滑动
      </div>

      <div className="relative w-20 h-20 md:w-36 md:h-36 rounded-full overflow-hidden flex items-center justify-center shadow-lg border-2 md:border-4 border-white/50 shrink-0">
        {image ? (
          <img
            src={image}
            alt="Page decoration"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-rose-800 to-amber-900 flex items-center justify-center">
            <div className="absolute inset-2 bg-rose-950 opacity-40"></div>
            <div className="w-14 h-14 bg-orange-500 shadow-md transform rotate-12 z-10"></div>
          </div>
        )}
      </div>
    </footer>
  );
}