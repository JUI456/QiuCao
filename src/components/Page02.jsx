import { Link } from "react-router-dom";
import { LetterSwapPingPong } from "./LetterSwap.jsx";

export default function Page01() {
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
            Portfolio
          </div>

          <div className="absolute right-4 md:right-20 top-12 md:top-20 text-xs sm:text-[13px] md:text-sm tracking-widest uppercase text-stone-700 font-medium leading-relaxed">
            所有的话
            <br />
            都排进了版式里
          </div>

          <div
            className="italic font-medium leading-[0.85] tracking-tighter text-right md:pr-12 mt-2"
            style={{
              letterSpacing: "-0.04em",
              fontSize: "clamp(3rem, 10vw, 9.5rem)",
            }}
          >
            2026
          </div>
        </div>

        <div className="w-full max-w-2xl mt-12 flex flex-col sm:flex-row justify-between items-start sm:items-center px-4 space-y-6 sm:space-y-0">
          <p className="text-sm sm:text-base text-stone-800 max-w-sm leading-relaxed font-normal">
            习惯把话做进页面里：字距是斟酌，留白是欲言又止。你若读懂了这些小心思，我就当作收到了回信。
          </p>
          <Link
            to="/detail/page02"
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
