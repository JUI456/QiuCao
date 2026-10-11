// 全站调试面板：给站主自己用的开发快捷入口，正式访客（她）永远看不到。
// 开启方式：任意页面 URL 加 ?debug=1（会话内记住，跨页面保持）；点 ✕ 关闭。
// 功能：全站路由直达 + 生日页 8 幕任意跳转（?stage=序号或英文名）。
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

const FLAG = "qc_debug";

const ROUTES = [
  ["首页", "/"],
  ["纸飞机", "/route"],
  ["柏林", "/berlin"],
  ["更新日志", "/changelog"],
  ["解密", "/game"],
  ["爱心", "/heart"],
  ["详情·插画", "/detail/page01"],
  ["详情·作品", "/detail/page02"],
  ["详情·摄影", "/detail/page03"],
  ["生日", "/birthday"],
];

const BDAY_STAGES = [
  "seal 封印",
  "light 点灯",
  "blow 吹烛",
  "bloom 绽放",
  "letter 长信",
  "past 23盏灯",
  "vow 登机牌",
  "wish 许愿",
];

export default function DebugDock() {
  const loc = useLocation();
  const [on, setOn] = useState(() => {
    try { return sessionStorage.getItem(FLAG) === "1"; } catch { return false; }
  });
  const [open, setOpen] = useState(true);

  useEffect(() => {
    if (new URLSearchParams(loc.search).get("debug") === "1") {
      try { sessionStorage.setItem(FLAG, "1"); } catch { /* 忽略 */ }
      setOn(true);
    }
  }, [loc.search]);

  if (!on) return null;

  const close = () => {
    try { sessionStorage.removeItem(FLAG); } catch { /* 忽略 */ }
    setOn(false);
  };

  return (
    <div
      id="debug-dock"
      className="fixed bottom-3 left-1/2 z-[999] w-[min(94%,540px)] -translate-x-1/2 rounded-xl border border-stone-600/60 bg-[#1c1917]/95 text-left text-[#e7e2d6] shadow-[0_18px_50px_rgba(0,0,0,0.45)] backdrop-blur"
      style={{ fontSize: 12 }}
    >
      <div className="flex items-center justify-between border-b border-white/10 px-3.5 py-2">
        <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#f0c53c]">
          🛠 Debug · {loc.pathname}
        </span>
        <span className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="rounded border border-white/20 px-2 py-0.5 text-[10px] text-white/70 hover:text-white cursor-pointer"
          >
            {open ? "收起" : "展开"}
          </button>
          <button
            type="button"
            onClick={close}
            className="rounded border border-white/20 px-2 py-0.5 text-[10px] text-white/70 hover:text-white hover:border-red-400 hover:text-red-300 cursor-pointer"
          >
            ✕ 关闭
          </button>
        </span>
      </div>

      {open && (
        <div className="px-3.5 py-2.5">
          <p className="mb-1.5 font-mono text-[9px] tracking-[0.24em] uppercase text-white/40">全站页面</p>
          <div className="flex flex-wrap gap-1.5">
            {ROUTES.map(([label, to]) => {
              const active = loc.pathname === to;
              return (
                <Link
                  key={to}
                  to={`${to}?debug=1`}
                  className={`rounded-full border px-2.5 py-1 text-[11px] transition-colors cursor-pointer ${
                    active
                      ? "border-[#f0c53c] bg-[#f0c53c]/15 text-[#f0c53c]"
                      : "border-white/15 text-white/70 hover:border-white/50 hover:text-white"
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </div>

          <p className="mb-1.5 mt-3 font-mono text-[9px] tracking-[0.24em] uppercase text-white/40">
            生日页 · 8 幕直达（自动带预览解锁）
          </p>
          <div className="flex flex-wrap gap-1.5">
            {BDAY_STAGES.map((label, i) => (
              <Link
                key={label}
                to={`/birthday?stage=${i}&debug=1`}
                className="rounded-full border border-white/15 px-2.5 py-1 text-[11px] text-white/70 transition-colors hover:border-[#f0c53c] hover:text-[#f0c53c] cursor-pointer"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
