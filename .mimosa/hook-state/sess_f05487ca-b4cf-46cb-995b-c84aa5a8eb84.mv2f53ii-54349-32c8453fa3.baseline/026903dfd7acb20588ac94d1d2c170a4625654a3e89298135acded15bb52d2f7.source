import { Link } from "react-router-dom";
import { LetterSwapPingPong } from "./LetterSwap.jsx";

export default function Page01() {
  return (
    <>
      <main className="w-full my-auto flex flex-col items-center relative">
        {/* 大标题区块 */}
        <div className="relative max-w-4xl w-full px-4">
          <div
            className="italic font-medium leading-[0.85] tracking-tighter text-left"
            style={{
              letterSpacing: "-0.04em",
              fontSize: "clamp(3rem, 10vw, 9.5rem)",
            }}
          >
            Illustration
          </div>

          <div className="absolute right-4 md:right-20 top-0 md:top-0 text-xs sm:text-[13px] md:text-sm tracking-widest uppercase text-stone-700 font-medium leading-relaxed">
            准备了好久
            <br />
            把这一页递给你
          </div>

          <div
            className="italic font-medium leading-[0.85] tracking-tighter text-right md:pr-12 mt-2"
            style={{
              letterSpacing: "-0.04em",
              fontSize: "clamp(3rem, 10vw, 9.5rem)",
            }}
          >
            Design
          </div>
        </div>

        {/* 描述 + VISIT 按钮 */}
        <div className="w-full max-w-2xl mt-12 flex flex-col sm:flex-row justify-between items-start sm:items-center px-4 space-y-6 sm:space-y-0">
          <p className="text-sm sm:text-base text-stone-800 max-w-sm leading-relaxed font-normal">
            秋草。这里不是展览，是一封终于写好、又舍不得寄出去的信——请从第一页慢慢读到结尾。
          </p>
          <Link
            to="/detail/page01"
            className="flex items-center space-x-6 border border-stone-900 rounded-full px-6 py-2.5 text-sm uppercase font-medium tracking-wider hover:bg-stone-900 hover:text-white transition-colors"
          >
            <LetterSwapPingPong
              label="打开 ↗"
              className="text-sm uppercase font-medium tracking-wider"
            />
          </Link>
        </div>

        {/* 底部：作者信息 + 更新日志按钮 */}
        <div className="w-full max-w-5xl mt-16 md:mt-20 px-6 md:px-4">
          <div className="w-full border-t border-stone-800/20 pt-5 pb-2 flex flex-col-reverse sm:flex-row items-center justify-between gap-4 sm:gap-6">
            <p className="text-xs sm:text-sm text-stone-600 tracking-wide flex flex-wrap items-center justify-center sm:justify-start gap-x-2 gap-y-1">
              <span className="font-medium text-stone-900 tracking-widest">
                HHH
              </span>
              <span className="opacity-40">/</span>
              <a
                href="mailto:huanghuan52023@163.com"
                className="underline decoration-stone-400 underline-offset-4 hover:text-stone-900 hover:decoration-stone-900 transition-colors"
              >
                huanghuan52023@163.com
              </a>
            </p>
            <Link
              to="/changelog"
              className="shrink-0 border border-stone-800 rounded-full px-5 py-1.5 text-[11px] sm:text-xs uppercase font-medium tracking-[0.18em] text-stone-700 hover:bg-stone-900 hover:text-white hover:border-stone-900 transition-colors"
            >
              更新日志 ↗
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
