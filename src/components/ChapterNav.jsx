// 首页每屏顶部右侧显示的章节导航（斜杠分隔，可点击跳转到对应章节首屏）
import { Link } from "react-router-dom";

export default function ChapterNav({ chapters, activeIndex, onSelect }) {
  return (
    <nav className="absolute top-[4.25rem] md:top-[5.5rem] right-4 md:right-12 z-30 flex flex-wrap items-center justify-end text-[11px] md:text-[13px] tracking-[0.08em] md:tracking-[0.16em] font-medium uppercase select-none pointer-events-auto leading-relaxed">
      {chapters.map((chapter, index) => (
        <span key={chapter.label} className="flex items-center">
          {index > 0 && (
            <span className="text-stone-300 mx-1 md:mx-2.5">/</span>
          )}
          <button
            type="button"
            onClick={() => onSelect(index)}
            className={`transition-colors cursor-pointer whitespace-nowrap ${
              index === activeIndex
                ? "text-stone-900 underline underline-offset-[6px] decoration-stone-900"
                : "text-stone-400 hover:text-stone-700"
            }`}
          >
            {chapter.label}
          </button>
        </span>
      ))}
      <span className="flex items-center">
        <span className="text-stone-300 mx-2 md:mx-2.5">/</span>
        <Link
          to="/game"
          className="text-stone-400 hover:text-stone-700 transition-colors cursor-pointer whitespace-nowrap"
        >
          解密
        </Link>
      </span>
      <span className="flex items-center">
        <span className="text-stone-300 mx-2 md:mx-2.5">/</span>
        <Link
          to="/heart"
          className="text-stone-400 hover:text-stone-700 transition-colors cursor-pointer whitespace-nowrap"
        >
          爱心
        </Link>
      </span>
    </nav>
  );
}
