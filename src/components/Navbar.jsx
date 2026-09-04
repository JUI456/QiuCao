import { Link } from "react-router-dom";
import { LetterSwapPingPong } from "./LetterSwap.jsx";

export default function Navbar() {
  return (
    <header className="absolute top-0 left-0 right-0 w-full flex justify-between items-start text-xs font-medium tracking-wider uppercase p-6 md:p-12 md:py-7 pointer-events-auto">
      <div className="flex items-center space-x-6">
        <div className="border border-stone-600 px-1.5 py-0.5 text-stone-600">
          来 中 国 带 你 去 旅 行
        </div>
        <div className="hidden sm:block text-stone-700">你好，秋草</div>
      </div>
      <div className="flex items-center space-x-8">
        <nav className="space-x-4">
          <Link to="/berlin" className="hover:underline cursor-pointer">
            <LetterSwapPingPong
              label="秋草"
              className="text-xs font-medium tracking-wider uppercase"
            />
          </Link>
        </nav>
        <div className="w-4 h-4 bg-stone-900 rounded-full opacity-20"></div>
      </div>
    </header>
  );
}
