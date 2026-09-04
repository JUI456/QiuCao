// 首页每屏顶部显示的章节导航（斜杠分隔，可点击跳转到对应章节首屏）
export default function ChapterNav({ chapters, activeIndex, onSelect }) {
  return (
    <nav className="absolute top-16 md:top-28 left-6 md:left-12 z-30 flex flex-wrap items-center text-[11px] tracking-[0.18em] font-medium uppercase select-none pointer-events-auto">
      {chapters.map((chapter, index) => (
        <span key={chapter.label} className="flex items-center">
          {index > 0 && (
            <span className="text-stone-300 mx-2 md:mx-2.5">/</span>
          )}
          <button
            type="button"
            onClick={() => onSelect(index)}
            className={`transition-colors cursor-pointer ${
              index === activeIndex
                ? "text-stone-900 underline underline-offset-[6px] decoration-stone-900"
                : "text-stone-400 hover:text-stone-700"
            }`}
          >
            {chapter.label}
          </button>
        </span>
      ))}
    </nav>
  );
}
