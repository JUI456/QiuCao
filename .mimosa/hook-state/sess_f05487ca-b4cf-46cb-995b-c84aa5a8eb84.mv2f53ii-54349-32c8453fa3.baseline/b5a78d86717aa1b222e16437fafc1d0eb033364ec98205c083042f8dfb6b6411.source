import { Link } from "react-router-dom";
import { LetterSwapPingPong } from "./LetterSwap.jsx";

export default function Page04() {
  return (
    <>
      <main className="w-full my-auto flex flex-col items-center relative">
        <div className="relative max-w-4xl w-full px-4">
          <div
            className="italic font-medium leading-[0.85] tracking-tighter text-left"
            style={{
              letterSpacing: "-0.04em",
              fontSize: "clamp(3rem, 10vw, 9.5rem)",
            }}
          >
            Qiu Cao
          </div>

          <div className="absolute right-4 md:right-20 top-0 md:top-0 text-xs sm:text-[13px] md:text-sm tracking-widest uppercase text-stone-700 font-medium leading-relaxed">
            编号 qiucao001
            <br />
            馆藏：关于你的全部
          </div>

          <div
            className="italic font-medium leading-[0.85] tracking-tighter text-right md:pr-12 mt-2"
            style={{
              letterSpacing: "-0.04em",
              fontSize: "clamp(3rem, 10vw, 9.5rem)",
            }}
          >
            Collection
          </div>
        </div>

        <div className="w-full max-w-2xl mt-12 flex flex-col sm:flex-row justify-between items-start sm:items-center px-4 space-y-6 sm:space-y-0">
          <p className="text-sm sm:text-base text-stone-800 max-w-sm leading-relaxed font-normal">
            全站唯一不对外的收藏。入藏标准不高：凡关于你，皆可入馆。藏品名：秋草；状态：常年陈列；借出：暂不开放。
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
      </main>
    </>
  );
}
