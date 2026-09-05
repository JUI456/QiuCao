import { Link } from "react-router-dom";
import { LetterSwapPingPong } from "./LetterSwap.jsx";

export default function Page06() {
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
            The End?
          </div>

          <div className="absolute right-4 md:right-20 top-0 md:top-0 text-xs sm:text-[13px] md:text-sm tracking-widest uppercase text-stone-700 font-medium leading-relaxed">
            愿望单 · No.4
            <br />
            世界每个角落，想同你去
          </div>

          <div
            className="italic font-medium leading-[0.85] tracking-tighter text-right md:pr-12 mt-2"
            style={{
              letterSpacing: "-0.04em",
              fontSize: "clamp(3rem, 10vw, 9.5rem)",
            }}
          >
            To Be Continued
          </div>
        </div>

        <div className="w-full max-w-2xl mt-12 flex flex-col sm:flex-row justify-between items-start sm:items-center px-4 space-y-6 sm:space-y-0">
          <p className="text-sm sm:text-base text-stone-800 max-w-sm leading-relaxed font-normal">
           清单前三行都是小事：看一片海、吃一条街、拍一组只属于我们的照片；第四行我特意空着——想等你来补上。
          </p>
          <Link
            to="/berlin"
            className="flex items-center space-x-6 border border-stone-900 rounded-full px-6 py-2.5 text-sm uppercase font-medium tracking-wider hover:bg-stone-900 hover:text-white transition-colors"
          >
            <LetterSwapPingPong
              label="打开 ↗"
              className="text-sm uppercase font-medium tracking-wider"
            />
          </Link>
        </div>

        <p className="max-w-md mt-8 px-4 text-center text-sm sm:text-base text-stone-700 leading-relaxed font-normal">
         希望你每天都开心，累了就好好放松；哪天太累、不开心了，随时告诉我——我会一直在，永远支持你。
        </p>
      </main>
    </>
  );
}
