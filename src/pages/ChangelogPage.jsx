import { Link } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";

// 更新记录：新的在上
const CHANGES = [
  {
    version: "v1.6.0",
    time: "2026-09-05 22:03:01",
    text: "新增纸飞机地图功能，优化图片加载",
    isNew: true,
  },
  {
    version: "v1.5.0",
    time: "2026-09-04 22:56:01",
    text: "新增若干功能，优化性能和适配功能",
    // isNew: true,
  },
  {
    version: "v1.4.0",
    time: "2026-09-03 22:23:15",
    text: "为秋草上线专属页面，补充个性化文案，优化作品详情页的内容结构",
  },
  {
    version: "v1.3.0",
    time: "2026-09-02 14:45:21",
    text: "加入隐藏彩蛋：解密小游戏与爱心弹窗，微调全屏滚动的过渡细节",
  },
  {
    version: "v1.2.0",
    time: "2026-08-24 01:30:00",
    text: "更新首页底部更新日志，站点持续维护中",
  },
  {
    version: "v1.1.0",
    time: "2026-08-24 12:58:24",
    text: "修复首页导航被客户端脚本覆盖成 3 项的问题，6 项导航全站生效",
  },
];

export default function ChangelogPage() {
  return (
    <div
      className="w-full min-h-screen relative flex flex-col select-none overflow-x-hidden"
      style={{
        fontFamily: '"Inter", sans-serif',
        color: "#1c1917",
        backgroundColor: "#faf6ef",
      }}
    >
      <Navbar />

      {/* 返回首页 */}
      <div className="absolute top-24 md:top-28 left-6 md:left-12 z-20">
        <Link
          to="/"
          className="inline-flex items-center gap-2 border border-stone-500 rounded-full px-4 py-1.5 text-[11px] uppercase font-medium tracking-[0.18em] text-stone-600 hover:bg-stone-900 hover:text-white hover:border-stone-900 transition-colors"
        >
          <span>←</span>
          <span>返回首页</span>
        </Link>
      </div>

      <main className="w-full max-w-4xl mx-auto px-6 md:px-8 pt-40 md:pt-48 pb-28">
        {/* 页头 */}
        <header className="border-b border-stone-800/20 pb-10 md:pb-14 mb-12 md:mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <p className="text-[11px] uppercase tracking-[0.32em] text-stone-500 mb-4">
              Update Log
            </p>
            <h1
              className="italic font-medium leading-[0.9] tracking-tighter"
              style={{
                letterSpacing: "-0.03em",
                fontSize: "clamp(2.8rem, 9vw, 7.5rem)",
              }}
            >
              更新日志
            </h1>
            <p className="text-sm sm:text-base text-stone-600 mt-6 max-w-md leading-relaxed">
              这里记下每一次小小的改动——都是为了让这一页，更像你想看的那个样子。
            </p>
          </div>
          <div
            className="hidden md:block text-sm text-stone-500 tracking-widest leading-relaxed"
            style={{ writingMode: "vertical-lr" }}
          >
            愿 意 记 得
          </div>
        </header>

        {/* 更新条目 */}
        <ol>
          {CHANGES.map((item) => (
            <li
              key={item.version}
              className="border-b border-stone-800/15 py-6 md:py-7 first:pt-0 last:border-b-0 grid md:grid-cols-[auto_1fr_auto] md:items-baseline gap-x-6 gap-y-2"
            >
              <span
                className={`justify-self-start text-xs font-semibold px-3 py-1 border rounded-full tracking-wide ${
                  item.isNew
                    ? "bg-stone-900 text-white border-stone-900"
                    : "border-stone-400 text-stone-500"
                }`}
              >
                {item.version}
              </span>
              <p className="text-sm sm:text-[15px] text-stone-800 leading-relaxed">
                {item.text}
              </p>
              <time
                dateTime={item.time}
                className="text-[13px] tabular-nums text-stone-400 tracking-wide md:text-right"
              >
                {item.time}
              </time>
            </li>
          ))}
        </ol>
      </main>

      {/* 页尾 */}
      <footer className="mt-auto border-t border-stone-800/15">
        <div className="w-full max-w-4xl mx-auto px-6 md:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-500 tracking-wide">
          <span>
            <span className="text-stone-900 font-medium tracking-widest">HHH</span>{" "}
            / 秋草的小站点
          </span>
          <span>© 2026 HHH · All rights reserved</span>
        </div>
      </footer>
    </div>
  );
}
