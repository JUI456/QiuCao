import { Link } from "react-router-dom";
import { LetterSwapPingPong } from "./LetterSwap.jsx";

export default function Page03() {
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
            Photography
          </div>

          <div className="absolute right-4 md:right-20 top-0 md:top-0 text-xs sm:text-[13px] md:text-sm tracking-widest uppercase text-stone-700 font-medium leading-relaxed">
            景都替你挑好了
            <br />
            就差一个同路人
          </div>

          <div
            className="italic font-medium leading-[0.85] tracking-tighter text-right md:pr-12 mt-2"
            style={{
              letterSpacing: "-0.04em",
              fontSize: "clamp(3rem, 10vw, 9.5rem)",
            }}
          >
            Gallery
          </div>
        </div>

        <div className="w-full max-w-2xl mt-12 flex flex-col sm:flex-row justify-between items-start sm:items-center px-4 space-y-6 sm:space-y-0">
          <p className="text-sm sm:text-base text-stone-800 max-w-sm leading-relaxed font-normal">
            原计划是一本摄影集，后来翻着照片改了主意——风景哪都有，缺的是站在镜头里的那个人。所以它成了一纸企划案：目的地随你挑，门票和相机都归我。
          </p>
          <Link
            to="/detail/page03"
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
