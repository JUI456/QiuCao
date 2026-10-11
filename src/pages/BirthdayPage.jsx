// N°08 —— 生日档案 · A Birthday Archive
// 八幕流程：封印(倒数解锁) → 点灯 → 吹烛 → 绽放 → 长信 → 23支迟到的蜡烛 → 25岁之约 → 许愿星
// 文案与日期集中在 ../data/birthdayConfig.js；她人在宁平（UTC+7），解锁一律按她的日历。
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../components/Navbar";
import {
  HER, SECRET_CODE, WISH_STORAGE_KEY, COUNTDOWN_ENABLED,
  vnParts, isHerBirthday, isAfterBirthdayThisYear, nextBirthdayUtc, daysAlive, vowTargetUtc,
  LIGHTING_LINES, PAST_BIRTHDAYS, PAST23_FINALE,
  BLOOM_POPUPS, BLOOM_CENTER,
  LETTER_PARAGRAPHS, LETTER_SIGN, VOW,
} from "../data/birthdayConfig";

const EASE = [0.22, 1, 0.36, 1];
const HEART_D =
  "M0,8 C-10,-2 -22,-17 -8,-22 C2,-25 0,-10 0,-10 C0,-10 -2,-25 8,-22 C22,-17 10,-2 0,8 Z";
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const pad2 = (n) => String(n).padStart(2, "0");

/* ---------------- 各幕通用外壳 ---------------- */
function Act({ no = "00", dark = false, bg = "#f6f1e8", scene, className = "", children }) {
  // JFA 式画框：奶油色页框 + 居中画布
  return (
    <div className="relative w-full min-h-screen flex flex-col items-center" style={{ minHeight: "100dvh", background: bg }}>
      {scene && <div className="absolute inset-0 z-0">{scene}</div>}
      <div className={`no-scrollbar relative z-10 flex w-full flex-1 flex-col items-center ${className}`}>
        {children}
      </div>
    </div>
  );
}

function ActHead({ eyebrow, title, sub, dark = false }) {
  // 中文标题不用斜体（伪斜体会显廉价）；元素依次淡入，形成节奏
  return (
    <header className={`pt-24 md:pt-28 px-6 text-center ${dark ? "txt-veil-dark" : "txt-veil"}`}>
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE }}
        className={`text-[11px] md:text-[12px] tracking-[0.32em] uppercase font-medium ${dark ? "text-[#e8a79b]" : "text-red-800"}`}
      >
        {eyebrow}
      </motion.p>
      <motion.h1
        key={typeof title === "string" ? title : undefined}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.08, ease: EASE }}
        className={`mt-4 font-serif leading-[1.14] tracking-[0.02em] ${dark ? "text-[#f5efe4]" : "text-stone-900"}`}
        style={{ fontSize: "clamp(2.35rem, 9.5vw, 4.5rem)" }}
      >
        {title}
      </motion.h1>
      <span className={`mx-auto mt-5 block h-px w-10 ${dark ? "bg-[#f0c53c]/50" : "bg-[#b91c1c]/35"}`} />
      {sub && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.16, ease: EASE }}
          className={`mx-auto mt-5 max-w-sm text-[13px] leading-[1.95] ${dark ? "text-[#d3c3d2]" : "text-stone-600"}`}
        >
          {sub}
        </motion.p>
      )}
    </header>
  );
}

function NextBtn({ onClick, children, dark = false, disabled = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`mt-8 inline-flex items-center gap-2 rounded-full border px-7 py-3 text-[11px] tracking-[0.25em] uppercase font-medium transition-all cursor-pointer active:scale-[0.97] shadow-[0_12px_30px_rgba(232,150,180,0.22)] disabled:opacity-40 disabled:cursor-not-allowed ${dark ? "txt-veil-dark" : "txt-veil"} ${
        dark
          ? "border-[#f0c53c] text-[#f0c53c] hover:bg-[#f0c53c]/10"
          : "border-[#d6477c]/80 bg-white/55 text-[#c24568] backdrop-blur-md hover:bg-[#d6477c] hover:text-white"
      }`}
    >
      {children}
      <span aria-hidden>→</span>
    </button>
  );
}

/* ---------------- 获奖级质感层：胶片颗粒 / 四角标记 / 幽灵编号 / 边缘竖排字 / 光标 ---------------- */

const GRAIN_URI =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.55'/%3E%3C/svg%3E";

// 全页胶片颗粒：一层低透明度噪点，瞬间脱离"平面模板感"
function GrainOverlay() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[90]"
      style={{ backgroundImage: `url("${GRAIN_URI}")`, backgroundSize: "160px 160px", opacity: 0.06 }}
    />
  );
}

// 四角 registration marks（延续地图页的四角装饰语言）
function CornerMarks({ dark = false }) {
  const c = dark ? "border-[#f0c53c]/25" : "border-stone-500/30";
  return (
    <div aria-hidden className="pointer-events-none absolute inset-3 z-[5] md:inset-5">
      <span className={`absolute left-0 top-0 h-4 w-4 border-l border-t ${c}`} />
      <span className={`absolute right-0 top-0 h-4 w-4 border-r border-t ${c}`} />
      <span className={`absolute bottom-0 left-0 h-4 w-4 border-b border-l ${c}`} />
      <span className={`absolute bottom-0 right-0 h-4 w-4 border-b border-r ${c}`} />
    </div>
  );
}

// 边缘竖排注释（桌面端，呼应首页竖排"滚动"）
function EdgeText({ children, dark = false }) {
  return (
    <span
      aria-hidden
      className={`pointer-events-none absolute right-5 top-1/2 z-10 hidden -translate-y-1/2 text-[10px] uppercase tracking-[0.5em] md:block ${dark ? "text-[#8a91b8]" : "text-stone-500"}`}
      style={{ writingMode: "vertical-rl" }}
    >
      {children}
    </span>
  );
}

// 桌面端自定义光标：即时小点 + 缓动跟环（混合模式自动适配明暗底）
function CursorGlow() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia("(pointer: fine)").matches) return;
    let x = -100, y = -100, rx = -100, ry = -100, raf;
    const move = (e) => { x = e.clientX; y = e.clientY; };
    const loop = () => {
      rx += (x - rx) * 0.16;
      ry += (y - ry) * 0.16;
      if (dotRef.current) dotRef.current.style.transform = `translate(${x - 2}px, ${y - 2}px)`;
      if (ringRef.current) ringRef.current.style.transform = `translate(${rx - 16}px, ${ry - 16}px)`;
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener("mousemove", move, { passive: true });
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("mousemove", move);
      cancelAnimationFrame(raf);
    };
  }, []);
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[100] hidden md:block">
      <span ref={ringRef} className="absolute left-0 top-0 h-8 w-8 rounded-full border border-white/70 mix-blend-difference" />
      <span ref={dotRef} className="absolute left-0 top-0 h-1 w-1 rounded-full bg-white mix-blend-difference" />
    </div>
  );
}

/* ---------------- 梦幻仙境背景：粉紫蓝渐变天空（云/气球/光斑） + 插画主场景照片 ---------------- */

const BASE_URL = import.meta.env.BASE_URL;
const SCENE_SKY = {
  day: ["#ffeaf3", "#fbd9ec", "#f3cfe8"],
  dayLit: ["#ffe3ec", "#ffc9d6", "#ffd2c0"],
  dusk: ["#7a4a8e", "#c4739e", "#f2a0b8"],
  night: ["#241638", "#472a5c", "#8a4a74"],
};
const SCENE_FILTER = {
  day: "none",
  dayLit: "none",
  dusk: "hue-rotate(-18deg) saturate(1.12) brightness(0.8)",
  night: "brightness(0.45) saturate(0.9) hue-rotate(8deg)",
};

// 取景：center = 蛋糕主角（点灯/吹烛/绽放）；right = 灯塔日落；left = 小熊角落
function SceneBackdrop({ mood = "day", zoom = "center", lit = false, dim = false }) {
  const sky = SCENE_SKY[mood === "day" && lit ? "dayLit" : mood];
  const zoomCls = zoom === "right" ? "scene-zoom-right" : zoom === "left" ? "scene-zoom-left" : "";
  const stars = Array.from({ length: 42 }, (_, i) => {
    const a = Math.abs(Math.sin(i * 12.9898) * 43758.5453) % 1;
    const b = Math.abs(Math.sin(i * 78.233) * 12345.6789) % 1;
    return [a * 100, b * 34, 0.9 + ((i * 37) % 10) / 7];
  });
  return (
    <div className="absolute inset-0 z-0 overflow-hidden" aria-hidden>
      {/* 渐变天空 */}
      <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${sky[0]} 0%, ${sky[1]} 55%, ${sky[2]} 100%)` }} />

      {/* 星光（黄昏/夜晚） */}
      {mood !== "day" &&
        stars.map(([x, y, r], i) => (
          <span key={i} className="star-twinkle absolute rounded-full bg-[#fff6e8]" style={{ left: `${x}%`, top: `${y}%`, width: r, height: r, animationDelay: `${(i % 8) * 0.5}s` }} />
        ))}

      {/* 棉花糖云（柔焦 + 漂移） */}
      <svg className="cloud-drift absolute left-[4%] top-[7%] w-[38%] opacity-90" viewBox="0 0 200 60" fill={mood === "night" ? "#d8b8d8" : "#ffffff"} style={{ filter: "blur(5px)" }}>
        <ellipse cx="60" cy="38" rx="52" ry="15" />
        <ellipse cx="100" cy="26" rx="36" ry="14" />
        <ellipse cx="28" cy="30" rx="26" ry="11" />
      </svg>
      <svg className="cloud-drift-slow absolute right-[6%] top-[15%] w-[30%] opacity-75" viewBox="0 0 200 60" fill={mood === "night" ? "#d8b8d8" : "#ffffff"} style={{ filter: "blur(6px)" }}>
        <ellipse cx="100" cy="36" rx="56" ry="14" />
        <ellipse cx="140" cy="26" rx="30" ry="11" />
      </svg>

      {/* 漂浮气球 */}
      <svg className="balloon-float absolute left-[7%] top-[30%] w-9" viewBox="0 0 40 90">
        <ellipse cx="20" cy="22" rx="14" ry="17" fill="#f9a8c0" />
        <ellipse cx="15" cy="15" rx="4.5" ry="6.5" fill="#ffd3e2" opacity="0.9" />
        <path d="M20 39 l-3.4 5.6 h6.8 Z" fill="#f9a8c0" />
        <path d="M20 45 C12 62 28 76 18 90" fill="none" stroke="#e58aa8" strokeWidth="1.2" />
      </svg>
      <svg className="balloon-float-slow absolute right-[9%] top-[24%] w-8" viewBox="0 0 40 90">
        <ellipse cx="20" cy="22" rx="13" ry="16" fill="#b5a8f0" />
        <ellipse cx="15.5" cy="15" rx="4" ry="6" fill="#e2dcff" opacity="0.9" />
        <path d="M20 38 l-3 5 h6 Z" fill="#b5a8f0" />
        <path d="M20 43 C26 60 14 74 22 90" fill="none" stroke="#9a8ad8" strokeWidth="1.2" />
      </svg>

      {/* 光斑（bokeh） */}
      {[[18, 40, 10], [78, 33, 7], [10, 52, 6], [86, 47, 9], [40, 22, 5], [62, 44, 6]].map(([x, y, r], i) => (
        <span key={i} className="star-twinkle absolute rounded-full bg-[#fff2f8]" style={{ left: `${x}%`, top: `${y}%`, width: r * 2, height: r * 2, filter: "blur(4px)", opacity: 0.5, animationDelay: `${i * 0.7}s` }} />
      ))}

      {/* 主场景插画（气球/云/小熊/礼物/灯塔/蛋糕/水面）—— 顶部用遮罩渐隐，与渐变天空无缝融合 */}
      <div className="absolute inset-x-0 bottom-0 h-[58%]">
        <img
          src={`${BASE_URL}birthday/${lit ? "scene-lit" : "scene-main"}.jpg`}
          alt=""
          className={`h-full w-full object-cover ${zoomCls}`}
          style={{
            filter: SCENE_FILTER[mood],
            objectPosition: zoom === "right" ? "100% 100%" : zoom === "left" ? "0% 100%" : "50% 100%",
            WebkitMaskImage: "linear-gradient(180deg, transparent 0%, black 24%)",
            maskImage: "linear-gradient(180deg, transparent 0%, black 24%)",
          }}
        />
        <div className="absolute inset-x-0 top-0 h-10" style={{ background: `linear-gradient(180deg, ${sky[2]}88 0%, rgba(255,255,255,0) 100%)` }} />
      </div>

      {/* 薄雾 */}
      <div className="absolute inset-x-0 bottom-0 h-14 bg-white/15" style={{ filter: "blur(18px)" }} />

      {/* 熄灯薄纱：点亮后缓缓掀开，整个世界逐渐明亮 */}
      <div
        className="absolute inset-0"
        style={{ background: "#241630", opacity: dim ? 0.55 : 0, transition: `opacity ${dim ? 0.6 : 2.2}s ease` }}
      />
    </div>
  );
}

/* ================= 第 00 幕 · 封印（倒数解锁） ================= */

// 倒计时主视觉：天数做主角（衬线斜体大数字），时分秒为小号翻牌
function CountdownHero({ remainMs }) {
  const d = Math.floor(remainMs / 86400000);
  const h = Math.floor((remainMs % 86400000) / 3600000);
  const m = Math.floor((remainMs % 3600000) / 60000);
  const s = Math.floor((remainMs % 60000) / 1000);
  return (
    <div className="flex items-end justify-center gap-5 md:gap-8">
      <div className="text-center">
        <div className="relative h-[84px] md:h-[104px] overflow-hidden">
          <AnimatePresence mode="popLayout">
            <motion.span
              key={d}
              initial={{ y: 34, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -34, opacity: 0 }}
              transition={{ duration: 0.5, ease: EASE }}
              className="block font-serif italic leading-none text-[84px] md:text-[104px] text-stone-900"
              style={{ letterSpacing: "-0.03em" }}
            >
              {d}
            </motion.span>
          </AnimatePresence>
        </div>
        <p className="mt-1.5 text-[11px] tracking-[0.3em] uppercase font-medium text-red-800">DAYS · 天</p>
      </div>
      <div className="flex items-start gap-1.5 pb-1.5">
        {[["时", h], ["分", m], ["秒", s]].map(([u, v], i) => (
          <div key={u} className="flex items-start gap-1.5">
            {i > 0 && <span className="pt-2.5 font-mono text-lg text-stone-300">:</span>}
            <div className="flex flex-col items-center">
      <div className="relative h-11 w-10 overflow-hidden rounded-lg border border-white/70 bg-white/45 shadow-[0_8px_28px_rgba(244,160,190,0.30)] backdrop-blur-md">
                <AnimatePresence mode="popLayout">
                  <motion.span
                    key={v}
                    initial={{ y: -14, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 14, opacity: 0 }}
                    transition={{ duration: 0.26, ease: EASE }}
                    className="absolute inset-0 flex items-center justify-center font-mono text-lg text-stone-900"
                  >
                    {pad2(v)}
                  </motion.span>
                </AnimatePresence>
              </div>
              <span className="mt-1 text-[10px] tracking-[0.18em] uppercase text-stone-500">{u}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SealAct({ locked, isToday, remainMs, preview, onPreview, onOpen }) {
  const [sealOpen, setSealOpen] = useState(false); // 暗号输入区
  const [code, setCode] = useState("");
  const [wrong, setWrong] = useState(false);

  // 长按火漆章 3 秒 → 呼出暗号（提前预览用）
  const holdingRef = useRef(false);
  const rafRef = useRef(0);
  const sealRef = useRef(null);
  const startHold = () => {
    if (!locked || preview) return;
    holdingRef.current = true;
    const t0 = performance.now();
    const step = (t) => {
      const p = Math.min(1, (t - t0) / 3000);
      if (sealRef.current) sealRef.current.style.transform = `rotate(${-7 + p * 10}deg) scale(${1 + p * 0.06})`;
      if (p >= 1) { holdingRef.current = false; setSealOpen(true); return; }
      if (holdingRef.current) rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
  };
  const endHold = () => {
    holdingRef.current = false;
    if (sealRef.current && !sealOpen) sealRef.current.style.transform = "rotate(-7deg)";
  };
  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  // 信封开启动画：火漆弹开 → 顶盖翻起 → 信纸升起 → 放大淡出 → 进入第一幕
  const [opening, setOpening] = useState(false);
  const onOpenNow = () => {
    if (opening) return;
    setOpening(true);
    setTimeout(onOpen, 2050);
  };
  const handleEnvelopeClick = () => {
    if (opening) return;
    if (locked && !preview) { setSealOpen(true); return; } // 密封时点击 → 呼出暗号输入
    onOpenNow();
  };

  const submitCode = () => {
    if (code.trim() === SECRET_CODE) onPreview();
    else {
      setWrong(true);
      setTimeout(() => setWrong(false), 700);
    }
  };

  // 跨年彩蛋：生日当天打开，先回放去年许下的愿望
  const lastWish = useMemo(() => {
    try {
      const raw = localStorage.getItem(WISH_STORAGE_KEY);
      if (!raw) return null;
      const w = JSON.parse(raw);
      const y = vnParts().y;
      if (w && w.text && w.year && w.year < y) return w;
    } catch { /* 忽略坏档 */ }
    return null;
  }, []);

  let unlockedView;
  if (!COUNTDOWN_ENABLED) unlockedView = "open";
  else if (isToday) unlockedView = "today";
  else if (preview) unlockedView = "preview";
  else if (locked) unlockedView = "locked";
  else unlockedView = "replay";

  return (
    <Act bg="#f7e3f0" scene={<SceneBackdrop mood="day" />} className="items-center justify-center px-6 pb-10">
      <CornerMarks />
      <EdgeText>For Qiu Cao Only</EdgeText>
      <ActHead
        eyebrow="N°08 — A Sealed Surprise · 仅限当日拆封"
        title={<>有一份惊喜，<br />被提前藏好了</>}
        sub="在你亲手拆开之前，它会一直保持密封。今年最重要的礼物——全世界只有一个人打得开。"
      />

      {/* 去年愿望回放（跨年彩蛋，仅生日当天且有存档时出现） */}
      <AnimatePresence>
        {isToday && lastWish && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 w-full max-w-sm rounded-xl border border-[#e5ded0] bg-[#fffdf6] px-5 py-3.5 shadow-[0_8px_28px_rgba(28,25,23,0.10)]"
          >
            <p className="text-[10.5px] tracking-[0.24em] uppercase text-red-800">去年今天 · 你许的愿望</p>
            <p className="mt-1.5 font-serif italic text-[15px] text-stone-900">「{lastWish.text}」</p>
            <p className="mt-1 text-[11px] tracking-[0.08em] text-stone-500">
              {lastWish.year} 年封存 · 今年它归我盯着实现——先拆礼物吧
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 信封 + 火漆章（玻璃卡 + 长按 3 秒呼出暗号） */}
      <div className="relative mt-8 flex flex-1 items-center justify-center px-6">
        <div className="relative rounded-[28px] border border-white/60 bg-white/35 px-10 py-8 shadow-[0_18px_50px_rgba(214,71,124,0.14)] backdrop-blur-xl">
          {/* 偶尔掠过的小纸飞机（呼应 /route） */}
          <svg
            width="22" height="14" viewBox="-22 -14 48 26"
            className="seal-plane absolute -top-8 left-1/2"
            aria-hidden
          >
            <path d="M26,0 L-18,11 L-7,0 L-18,-11 Z" fill="#faf8f4" stroke="#8f8779" strokeWidth="1.4" strokeLinejoin="round" />
          </svg>
          <motion.svg
            width="230"
            height="180"
            viewBox="0 0 230 180"
            className="drop-shadow-[0_18px_30px_rgba(28,25,23,0.14)] overflow-visible"
            style={{ cursor: opening ? "default" : "pointer", transformOrigin: "115px 110px", transformBox: "view-box" }}
            role="button"
            aria-label="拆开信封"
            onClick={handleEnvelopeClick}
            animate={opening ? { scale: 1.12, opacity: 0 } : { scale: 1, opacity: 1 }}
            transition={opening ? { delay: 1.55, duration: 0.45, ease: "easeOut" } : { duration: 0.2 }}
          >
            {/* 信封底 */}
            <rect x="15" y="30" width="200" height="130" rx="8" fill="#fbf5ea" stroke="#c9beac" strokeWidth="1.5" />
            {/* 缎带 */}
            <path d="M115 30 L115 6" stroke="#d9a0a8" strokeWidth="6" strokeLinecap="round" />
            {/* 信纸（顶盖翻起后升起） */}
            <motion.g
              initial={false}
              animate={opening ? { y: -86, opacity: 1 } : { y: 16, opacity: 0 }}
              transition={opening ? { delay: 0.95, duration: 0.7, ease: EASE } : { duration: 0.15 }}
            >
              <rect x="47" y="60" width="136" height="86" rx="6" fill="#fffdf6" stroke="#ead9c8" strokeWidth="1.2" />
              <path d={HEART_D} fill="#d6477c" transform="translate(115 94) scale(1.6)" />
              <rect x="80" y="110" width="70" height="3.5" rx="1.75" fill="#e2d5c8" />
              <rect x="90" y="119" width="50" height="3.5" rx="1.75" fill="#e2d5c8" />
            </motion.g>
            {/* 信封前袋（盖住信纸下缘） */}
            <path d="M15,44 L115,110 L15,160 Z" fill="#fffdf6" stroke="#c9beac" strokeWidth="1.2" strokeLinejoin="round" />
            <path d="M215,44 L115,110 L215,160 Z" fill="#fdf8ef" stroke="#c9beac" strokeWidth="1.2" strokeLinejoin="round" />
            <path d="M15,160 L215,160 L115,110 Z" fill="#fff8ef" stroke="#c9beac" strokeWidth="1.2" strokeLinejoin="round" />
            {/* 顶盖（向后翻起 + 渐隐） */}
            <motion.g
              initial={false}
              animate={opening ? { scaleY: -1, opacity: 0.4 } : { scaleY: 1, opacity: 1 }}
              transition={opening ? { delay: 0.4, duration: 0.55, ease: "easeInOut" } : { duration: 0.15 }}
              style={{ transformOrigin: "115px 40px", transformBox: "view-box" }}
            >
              <path d="M15,40 L215,40 L115,106 Z" fill="#fff8ef" stroke="#c9beac" strokeWidth="1.2" strokeLinejoin="round" />
            </motion.g>
            {/* 火漆章：先弹开消失 */}
            <motion.g
              initial={false}
              animate={opening ? { scale: [1, 1.35, 0], opacity: [1, 1, 0] } : { scale: 1, opacity: 1 }}
              transition={opening ? { duration: 0.45, times: [0, 0.55, 1] } : { duration: 0.15 }}
              style={{ transformOrigin: "115px 118px", transformBox: "view-box" }}
            >
              <g transform="translate(115 118)">
                {unlockedView !== "locked" && <circle r="40" fill="#b91c1c" opacity="0.16" className="seal-glow" />}
                <g
                  ref={sealRef}
                  style={{ transform: "rotate(-7deg)", transformOrigin: "0 0", transition: wrong ? "transform 0.15s" : "none" }}
                  onPointerDown={startHold}
                  onPointerUp={endHold}
                  onPointerLeave={endHold}
                >
                  <path d="M0,-26 C8,-27 16,-24 20,-18 C25,-16 27,-8 25,-2 C28,4 24,12 18,15 C15,21 6,24 0,22 C-8,25 -16,21 -19,15 C-25,12 -28,4 -25,-2 C-27,-8 -25,-16 -20,-18 C-16,-24 -8,-27 0,-26 Z" fill="#b91c1c" />
                  <path d={HEART_D} fill="#f2efe9" transform="translate(0 -2)" />
                  <text y="38" textAnchor="middle" fontSize="8" letterSpacing="2" fill="#8a8478" fontFamily="monospace">SEALED · 秋</text>
                </g>
              </g>
            </motion.g>
            {/* 心心迸发 */}
            {opening &&
              [0, 1, 2].map((i) => (
                <motion.path
                  key={i}
                  d={HEART_D}
                  fill={i === 1 ? "#f7a8c0" : "#d6477c"}
                  initial={{ x: 105 + i * 4, y: 104, opacity: 1, scale: 0.7 }}
                  animate={{ x: 105 + (i - 1) * 30, y: 104 - 62 - i * 16, opacity: 0, scale: 1.1 }}
                  transition={{ delay: 0.32 + i * 0.12, duration: 0.9, ease: "easeOut" }}
                />
              ))}
          </motion.svg>
        </div>

        {/* 暗号输入（长按火漆后出现）：外层负责居中定位，内层只做动画，避免 transform 互相覆盖 */}
        <AnimatePresence>
          {sealOpen && locked && !preview && (
            <div className="absolute -bottom-2 left-1/2 w-[260px] -translate-x-1/2">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="rounded-xl border border-stone-200 bg-[#fffdf6] px-4 py-3 shadow-lg"
              >
                <p className="text-[10.5px] tracking-[0.22em] uppercase text-red-800">暗号 · 她出生的那一天</p>
                <div className="mt-2 flex items-center gap-2">
                  <input
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    inputMode="numeric"
                    maxLength={8}
                    placeholder="8 位数字"
                    className={`w-full rounded-md border bg-transparent px-2 py-1.5 font-mono text-sm tracking-[0.3em] outline-none ${wrong ? "border-red-600 text-red-700 shake" : "border-stone-300 text-stone-900"}`}
                  />
                  <button
                    type="button"
                    onClick={submitCode}
                    className="shrink-0 rounded-md border border-[#d6477c] px-3 py-1.5 text-[11px] tracking-[0.16em] uppercase text-[#d6477c] hover:bg-[#d6477c] hover:text-white transition-colors cursor-pointer"
                  >
                    验证
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* 底部：倒计时 / 解锁按钮 */}
      <div className="txt-veil w-full max-w-md text-center">
        {unlockedView === "locked" && (
          <>
            <p className="mb-4 text-[11px] tracking-[0.26em] uppercase text-stone-500">距离拆封 · 还剩</p>
            <CountdownHero remainMs={remainMs} />
            <p className="mt-5 text-[11px] tracking-[0.18em] uppercase text-stone-600">
              10·11 零点（宁平时区）自动解锁 · 长按火漆章可输入暗号预览
            </p>
          </>
        )}
        {unlockedView === "open" && (
          <>
            <p className="font-serif italic text-xl text-stone-800">这份礼物已经醒来了。</p>
            <NextBtn onClick={onOpenNow} disabled={opening}>拆开这份惊喜</NextBtn>
          </>
        )}
        {unlockedView === "today" && (
          <>
            <p className="font-serif italic text-xl text-red-800">宁平，已经进入 10 月 11 日。</p>
            <NextBtn onClick={onOpenNow} disabled={opening}>拆开这份惊喜</NextBtn>
          </>
        )}
        {unlockedView === "preview" && (
          <>
            <p className="font-serif italic text-lg text-stone-700">预览模式 · 正式解锁要等到她生日那天</p>
            <NextBtn onClick={onOpenNow} disabled={opening}>先替她拆开看看</NextBtn>
          </>
        )}
        {unlockedView === "replay" && (
          <>
            <p className="font-serif italic text-lg text-stone-700">这份礼物已经拆过了 · 随时可以重温</p>
            <NextBtn onClick={onOpenNow} disabled={opening}>再拆一次</NextBtn>
          </>
        )}
        <p className="mt-3 font-serif italic text-[12.5px] tracking-[0.04em] text-stone-600">
          Một món quà bí mật · 一份只属于你的秘密礼物
        </p>
        <p className="mt-6 text-[11px] tracking-[0.18em] uppercase text-stone-600">
          {COUNTDOWN_ENABLED
            ? "Fig.00 — 密封于 2026·10·01 · 解锁时刻：宁平 10·11 00:00 (UTC+7)"
            : "Fig.00 — 倒计时功能已保留 · 当前在 birthdayConfig.js 中暂时关闭"}
        </p>
      </div>
    </Act>
  );
}

/* ================= 第 01 幕 · 点灯 ================= */

// 小烟花：中心闪光 + 十颗光点向外绽开
function MiniFirework({ left, top, c = "#f7a8c0", d = 0 }) {
  const dots = Array.from({ length: 10 }, (_, i) => {
    const a = (i / 10) * Math.PI * 2;
    return [Math.cos(a) * 46, Math.sin(a) * 46];
  });
  return (
    <div className="pointer-events-none absolute" style={{ left, top }}>
      <motion.span
        className="absolute -left-1 -top-1 h-2 w-2 rounded-full"
        style={{ background: c, boxShadow: `0 0 14px ${c}` }}
        initial={{ scale: 0.4, opacity: 1 }}
        animate={{ scale: [0.4, 1.7, 0], opacity: [1, 1, 0] }}
        transition={{ delay: d, duration: 0.8 }}
      />
      {dots.map(([dx, dy], i) => (
        <motion.span
          key={i}
          className="absolute h-1.5 w-1.5 rounded-full"
          style={{ left: -3, top: -3, background: i % 2 ? "#ffd9a8" : c }}
          initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
          animate={{ x: dx, y: dy, opacity: [1, 1, 0], scale: [1, 0.8, 0.4] }}
          transition={{ delay: d + 0.08, duration: 0.75, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}

function LightAct({ onNext }) {
  const [lit, setLit] = useState(false);
  const [seq, setSeq] = useState(0); // 点亮编排进度：1 火焰 | 2 光扩散 | 3 烟花 | 4 星光渐亮
  const [flash, setFlash] = useState(false);
  const [lineIdx, setLineIdx] = useState(0);
  const [lineOn, setLineOn] = useState(false);
  useEffect(() => {
    if (!lineOn) return;
    const id = setInterval(() => setLineIdx((i) => (i + 1) % LIGHTING_LINES.length), 3200);
    return () => clearInterval(id);
  }, [lineOn]);
  const handleLight = () => {
    if (lit) return;
    setLit(true);
    setSeq(1);
    setFlash(true);
    setTimeout(() => setFlash(false), 900);
    setTimeout(() => setSeq(2), 250);  // 光源扩散
    setTimeout(() => setSeq(3), 550);  // 小烟花依次绽放
    setTimeout(() => setSeq(4), 900);  // 星光点亮 · 场景渐亮
    setTimeout(() => setLineOn(true), 2200);
  };

  const fireworks = [
    { left: "15%", top: "20%", c: "#f7a8c0", d: 0 },
    { left: "77%", top: "15%", c: "#ffd9a8", d: 0.32 },
    { left: "47%", top: "9%", c: "#b5a8f0", d: 0.64 },
  ];
  const sparkles = Array.from({ length: 16 }, (_, i) => {
    const a = Math.abs(Math.sin(i * 12.9898) * 43758.5453) % 1;
    const b = Math.abs(Math.sin(i * 78.233) * 24681.321) % 1;
    return { left: `${5 + a * 90}%`, top: `${7 + b * 32}%`, s: 3 + ((i * 7) % 4), d: 0.1 + i * 0.09, gold: i % 3 === 0 };
  });

  return (
    <Act
      bg="#f0d8f4"
      scene={<SceneBackdrop mood="day" lit={lit && seq >= 2} dim={!lit} />}
      className="items-center"
    >
      <CornerMarks />
      <EdgeText>Light The Candle</EdgeText>
      <ActHead
        eyebrow="Step 01 · Turn Off The Lights"
        title={lit ? "生日，正式开始" : "先把灯关掉"}
        sub={lit
          ? "看，烛光里的你，比平时温柔多了。它替我准备了三句话——每句都藏了一整年。"
          : "今晚，这个页面里没有时差，也没有别的大陆。点亮这根蜡烛，你的生日就正式开始了。"}
      />
      <div className="relative w-full flex-1">
        {/* 点亮语轮播 + 继续 */}
        <div className="txt-veil absolute inset-x-0 bottom-8 px-6 text-center">
          <AnimatePresence mode="wait">
            {lineOn && (
              <motion.div
                key={lineIdx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.7, ease: EASE }}
              >
                <p className="font-serif italic text-[15px] md:text-base text-[#c24568]">
                  「{LIGHTING_LINES[lineIdx]}」
                </p>
                <p className="mt-2 text-[10.5px] tracking-[0.2em] uppercase text-[#a06a84]">
                  点亮语 {lineIdx + 1} / {LIGHTING_LINES.length}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
          {lineOn && <NextBtn onClick={onNext}>蜡 烛 交 给 你</NextBtn>}
        </div>
      </div>
      {/* 烛火交互层：锚定整屏坐标系（画中圆圈即整屏 56% 处），避免被页头高度挤偏 */}
      <motion.div
        className="pointer-events-none absolute left-1/2 top-[56%] h-[320px] w-[320px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(255,214,150,0.32) 0%, rgba(255,214,150,0) 65%)" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: lit && seq >= 2 ? 0.6 : 0 }}
        transition={{ duration: 1.2 }}
      />
      {!lit && (
        <button
          type="button"
          onClick={handleLight}
          aria-label="点亮生日蜡烛"
          className="absolute left-1/2 top-[56%] h-40 w-64 -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-full bg-transparent transition-transform active:scale-[0.98]"
        />
      )}
      {flash && (
        <motion.span
          className="pointer-events-none absolute left-1/2 top-[56%] h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full"
          initial={{ scale: 0.3, opacity: 0.95 }}
          animate={{ scale: 3.8, opacity: 0 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          style={{ background: "radial-gradient(circle, rgba(255,240,210,0.95) 0%, rgba(255,190,150,0.35) 45%, rgba(255,190,150,0) 70%)" }}
        />
      )}
      {/* 光源扩散：两圈金色光波从烛芯荡开 */}
      {lit && seq >= 2 &&
        [0, 1].map((i) => (
          <motion.span
            key={i}
            className="pointer-events-none absolute left-1/2 top-[56%] h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#ffd9a8]/70"
            initial={{ scale: 0.3, opacity: 0.85 }}
            animate={{ scale: 2.6 + i * 1.1, opacity: 0 }}
            transition={{ delay: i * 0.35, duration: 1.2, ease: "easeOut" }}
          />
        ))}
      {/* 小烟花：依次绽放 */}
      {seq >= 3 && fireworks.map((f, i) => <MiniFirework key={i} {...f} />)}
      {/* 星光逐颗点亮 */}
      {seq >= 4 &&
        sparkles.map((s, i) => (
          <motion.span
            key={i}
            className={`star-twinkle pointer-events-none absolute rounded-full ${s.gold ? "bg-[#ffe9a8]" : "bg-white"}`}
            style={{ left: s.left, top: s.top, width: s.s, height: s.s, boxShadow: `0 0 10px ${s.gold ? "#ffe9a8" : "#ffffff"}` }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: s.d, duration: 0.45, ease: "easeOut" }}
          />
        ))}
    </Act>
  );
}

/* ================= 第 02 幕 · 吹烛（麦克风 / 长按双通道） ================= */

// 风的图标（lucide wind），替代 emoji
function WindIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12.8 19.6A2 2 0 1 0 14 16H2" />
      <path d="M17.5 8a2.5 2.5 0 1 1 2 4H2" />
      <path d="M9.8 4.4A2 2 0 1 1 11 8H2" />
    </svg>
  );
}

function BlowAct({ onBlown }) {
  const [mode, setMode] = useState("mic"); // mic | hold
  const [micState, setMicState] = useState("idle"); // idle | requesting | listening | denied
  const [vol, setVol] = useState(0);
  const [blown, setBlown] = useState(false);
  const blownRef = useRef(false);
  const streamRef = useRef(null);
  const ctxRef = useRef(null);
  const rafRef = useRef(0);
  const holdingRef = useRef(false);
  const progRef = useRef(null);

  const blow = useCallback(() => {
    if (blownRef.current) return;
    blownRef.current = true;
    setBlown(true);
    // 归还权限：只听风声，吹灭立刻挂断
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    ctxRef.current?.close().catch(() => {});
    setTimeout(onBlown, 1300);
  }, [onBlown]);

  useEffect(() => () => {
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    ctxRef.current?.close().catch(() => {});
  }, []);

  const startMic = async () => {
    if (blownRef.current || micState === "listening") return;
    setMicState("requesting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const AC = window.AudioContext || window.webkitAudioContext;
      const actx = new AC();
      ctxRef.current = actx;
      const analyser = actx.createAnalyser();
      analyser.fftSize = 512;
      actx.createMediaStreamSource(stream).connect(analyser);
      const buf = new Uint8Array(analyser.fftSize);
      let hot = 0;
      let lastShown = 0;
      setMicState("listening");
      const loop = () => {
        if (blownRef.current) return;
        analyser.getByteTimeDomainData(buf);
        let sum = 0;
        for (let i = 0; i < buf.length; i++) {
          const v = (buf[i] - 128) / 128;
          sum += v * v;
        }
        const rms = Math.sqrt(sum / buf.length);
        if (Math.abs(rms - lastShown) > 0.03) { lastShown = rms; setVol(rms); }
        hot = rms > 0.15 ? hot + 1 : Math.max(0, hot - 1);
        if (hot > 11) { blow(); return; }
        rafRef.current = requestAnimationFrame(loop);
      };
      rafRef.current = requestAnimationFrame(loop);
    } catch {
      setMicState("denied");
      setMode("hold");
    }
  };

  // 长按吹气（无麦克风时的兜底，进度环 1.6s 充满）
  const startHold = () => {
    if (blownRef.current || holdingRef.current) return;
    holdingRef.current = true;
    const t0 = performance.now();
    const step = (t) => {
      const p = Math.min(1, (t - t0) / 1600);
      if (progRef.current) {
        progRef.current.style.background = `conic-gradient(#d6477c ${p * 360}deg, rgba(214,71,124,0.25) 0deg)`;
      }
      if (p >= 1) { holdingRef.current = false; blow(); return; }
      if (holdingRef.current) rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
  };
  const endHold = () => {
    holdingRef.current = false;
    if (progRef.current) progRef.current.style.background = "conic-gradient(#d6477c 0deg, rgba(214,71,124,0.25) 0deg)";
  };

  return (
    <Act
      bg="#f0d8f4"
      scene={<SceneBackdrop mood="day" lit />}
      className="items-center"
    >
      <CornerMarks />
      <EdgeText>Thổi Nến · Make A Wish</EdgeText>
      <ActHead
        eyebrow="Bước 02 · Thổi Nến · Make A Wish"
        title="许个愿，然后吹"
        sub="闭上眼睛，心里数到三。愿望不许说出口——我知道就行了。"
      />
      <div className="relative w-full flex-1">
        {!blown && mode === "mic" && (
          <div className="absolute inset-x-4 bottom-8 mx-auto max-w-sm rounded-3xl border border-white/60 bg-white/45 px-6 py-5 text-center shadow-[0_18px_50px_rgba(214,71,124,0.16)] backdrop-blur-xl">
            {micState !== "listening" ? (
              <button
                type="button"
                onClick={startMic}
                className="inline-flex items-center gap-2.5 rounded-full border border-[#d6477c] px-7 py-3 text-[11px] tracking-[0.25em] uppercase text-[#d6477c] hover:bg-[#d6477c]/10 transition-colors cursor-pointer"
              >
                <WindIcon />
                {micState === "requesting" ? "正在打开麦克风…" : "打开麦克风 · 对屏幕吹气"}
              </button>
            ) : (
              <p className="font-serif italic text-lg text-[#d6477c]">检测到你的风声……再用力一点点</p>
            )}
            <p className="mx-auto mt-3 max-w-[280px] text-[11.5px] leading-relaxed text-[#8a5f76]">
              麦克风只在这一页打开，只听「风声」不录音；吹灭蜡烛的瞬间，权限立刻归还。
            </p>
            <button
              type="button"
              onClick={() => setMode("hold")}
              className="mt-3 text-[11px] tracking-[0.16em] uppercase text-stone-500 underline underline-offset-4 hover:text-[#d6477c] transition-colors cursor-pointer"
            >
              不方便开麦？长按吹也可以
            </button>
          </div>
        )}

        {!blown && mode === "hold" && (
          <div className="absolute inset-x-4 bottom-8 mx-auto max-w-sm rounded-3xl border border-white/60 bg-white/45 px-6 py-5 text-center shadow-[0_18px_50px_rgba(214,71,124,0.16)] backdrop-blur-xl">
            <button
              type="button"
              onPointerDown={startHold}
              onPointerUp={endHold}
              onPointerLeave={endHold}
              onPointerCancel={endHold}
              aria-label="按住吹气"
              className="inline-flex select-none items-center gap-3 rounded-full border border-[#d6477c] px-8 py-3.5 text-[11px] tracking-[0.25em] uppercase text-[#d6477c] cursor-pointer"
              style={{ touchAction: "none" }}
            >
              <span ref={progRef} className="h-3.5 w-3.5 rounded-full" style={{ background: "conic-gradient(#d6477c 0deg, rgba(214,71,124,0.25) 0deg)" }} />
              按住 · 吹气
            </button>
            <p className="mt-3 text-[11px] tracking-[0.16em] uppercase text-[#a06a84]">
              Hold to blow · 进度环充满即熄灭
            </p>
          </div>
        )}

        {blown && (
          <p className="txt-veil absolute inset-x-0 bottom-24 text-center font-serif italic text-lg text-stone-800">呼——许下的愿望，正在路上。</p>
        )}
      </div>
      {/* 烛火交互层：锚定整屏坐标系（画中烛火即整屏 56% 处） */}
      {!blown && micState === "listening" && (
        <div className="pointer-events-none absolute left-1/2 top-[74%] h-0 w-0" style={{ opacity: Math.min(1, vol * 6) }}>
          {[0, 1, 2].map((i) => (
            <span key={i} className="breath-ring" style={{ animationDelay: `${i * 0.5}s` }} />
          ))}
        </div>
      )}
      {/* 吹灭瞬间：一团柔焦烟云盖住画中的火焰 */}
      {blown && (
        <motion.div
          className="pointer-events-none absolute left-1/2 top-[50%] h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 0.95, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          style={{
            background: "radial-gradient(circle, rgba(255,240,245,0.95) 0%, rgba(255,214,228,0.55) 55%, rgba(255,214,228,0) 78%)",
            filter: "blur(2px)",
          }}
        />
      )}
      {blown && (
        <svg width="46" height="80" viewBox="0 0 46 80" className="absolute left-1/2 top-[42%] -translate-x-1/2" aria-hidden>
          <path d="M23 76 C17 62 29 54 23 40 C18 28 28 22 23 8" fill="none" stroke="#a8849c" strokeWidth="1.6" strokeLinecap="round" className="smoke-line" />
        </svg>
      )}
      <p className="txt-veil pb-8 text-center text-[11px] tracking-[0.18em] uppercase text-stone-600">
        Fig.02 — 对着屏幕吹气，风纹会升向烛火 · 熄灭瞬间全屏沉黑 1.2 秒
      </p>
    </Act>
  );
}

/* ================= 第 03 幕 · 绽放（黑暗微光字 → 烟花 + 生日快报） ================= */

// 心形烟花 + 常规烟花：canvas 粒子（学习 canvas-confetti / 解密游戏的质感）
function FireworksCanvas({ className }) {
  const ref = useRef(null);
  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let W = 0, H = 0, raf = 0, frame = 0;
    const COLORS = ["#f0c53c", "#e05c4a", "#f2a2b8", "#fff7e0", "#c0392b", "#e8b4bc"];
    const rockets = [];
    const parts = [];

    const resize = () => {
      W = cv.clientWidth; H = cv.clientHeight;
      cv.width = W * dpr; cv.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const burst = (cx, cy, heart) => {
      const color = pick(COLORS);
      if (heart) {
        // 心形烟花：粒子沿心形参数方程的轮廓向外飞
        for (let i = 0; i < 96; i++) {
          const t = (i / 96) * Math.PI * 2;
          const scale = 2.6 + Math.random() * 0.5;
          const hx = 16 * Math.pow(Math.sin(t), 3) * scale;
          const hy = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * scale;
          parts.push({ x: cx, y: cy, vx: hx * 0.055, vy: hy * 0.055, life: 1, decay: 0.007 + Math.random() * 0.005, r: 1.7 + Math.random() * 1.1, color });
        }
      } else {
        for (let i = 0; i < 78; i++) {
          const a = Math.random() * Math.PI * 2;
          const sp = 1.1 + Math.random() * 2.7;
          parts.push({ x: cx, y: cy, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 1, decay: 0.009 + Math.random() * 0.007, r: 1.4 + Math.random() * 1.2, color: pick(COLORS) });
        }
      }
    };
    const spawnRocket = () => {
      rockets.push({
        x: W * 0.12 + Math.random() * W * 0.76,
        y: H + 8,
        vx: (Math.random() - 0.5) * 1.1,
        vy: -(5.4 + Math.random() * 1.9),
        ty: H * 0.16 + Math.random() * H * 0.3,
      });
    };
    const tick = () => {
      frame++;
      ctx.clearRect(0, 0, W, H);
      if (frame % 42 === 0 && rockets.length < 3) spawnRocket();
      for (let i = rockets.length - 1; i >= 0; i--) {
        const r = rockets[i];
        r.x += r.vx; r.y += r.vy; r.vy += 0.045;
        ctx.globalAlpha = 0.9;
        ctx.fillStyle = "#fde68a";
        ctx.beginPath(); ctx.arc(r.x, r.y, 1.8, 0, Math.PI * 2); ctx.fill();
        if (r.y <= r.ty || r.vy >= -0.5) {
          burst(r.x, r.y, Math.random() < 0.38);
          rockets.splice(i, 1);
        }
      }
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        p.x += p.vx; p.y += p.vy; p.vy += 0.035;
        p.vx *= 0.985; p.vy *= 0.985;
        p.life -= p.decay;
        if (p.life <= 0) { parts.splice(i, 1); continue; }
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.color;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r * (0.6 + p.life * 0.4), 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={ref} className={className} aria-hidden />;
}

function BloomAct({ onNext }) {
  const [phase, setPhase] = useState("dark"); // dark | bloom
  const [revealed, setRevealed] = useState(0);
  const [centerOn, setCenterOn] = useState(false);
  const listRef = useRef(null);
  const total = BLOOM_POPUPS.length;
  const done = revealed >= total;

  useEffect(() => {
    const t = setTimeout(() => setPhase("bloom"), 2100);
    return () => clearTimeout(t);
  }, []);
  // 名录逐条揭晓（JFA 式编号索引）
  useEffect(() => {
    if (phase !== "bloom" || done) return;
    const id = setInterval(() => setRevealed((c) => Math.min(total, c + 1)), 240);
    return () => clearInterval(id);
  }, [phase, done, total]);
  useEffect(() => {
    if (!done) return;
    const t = setTimeout(() => setCenterOn(true), 500);
    return () => clearTimeout(t);
  }, [done]);
  // 名录自动跟随最新条目（中央快报压轴出现时也滚到底）
  useEffect(() => {
    if (listRef.current) listRef.current.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [revealed, centerOn]);

  return (
    <Act
      bg={phase === "dark" ? "#241640" : "#f0d8f4"}
      scene={<SceneBackdrop mood={phase === "dark" ? "night" : "day"} lit={phase !== "dark"} />}
      className="items-center overflow-hidden"
    >
      {phase === "dark" ? (
        <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
          <CornerMarks dark />
          <motion.h1
            initial={{ opacity: 0, filter: "blur(8px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            transition={{ duration: 1.8, ease: EASE }}
            className="font-serif italic text-4xl md:text-5xl text-[#ffeef4]"
            style={{ textShadow: "0 0 26px rgba(255,190,215,0.55), 0 0 60px rgba(255,140,180,0.35)" }}
          >
            生日快乐，{HER.name}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 1.2 }}
            className="mt-6 text-[11px] tracking-[0.34em] uppercase text-[#c9a2b8]"
          >
            Happy Birthday, My Autumn Grass
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4, duration: 1.2 }}
            className="mt-2 font-serif italic text-[14px] text-[#ffb3ca]"
          >
            Chúc mừng sinh nhật, {HER.nameVi}
          </motion.p>
          <svg width="50" height="80" viewBox="0 0 50 80" className="mt-10">
            <path d="M25 76 C20 64 30 56 25 42 C21 32 30 26 25 14" fill="none" stroke="#a8849c" strokeWidth="1.5" strokeLinecap="round" className="smoke-line" />
          </svg>
        </div>
      ) : (
        <div className="relative flex-1 w-full">
          <FireworksCanvas className="absolute inset-0 z-[5] h-full w-full" />
          {/* 柔白薄纱：把仙境推远，让名录成为主角 */}
          <div className="absolute inset-0 z-[6] bg-[#fff2f5]/40" />
          <CornerMarks />
          <header className="relative z-10 pt-14 text-center">
            <p className="text-[11px] tracking-[0.28em] uppercase text-red-800">Candles Out · Fireworks On</p>
            <h1 className="mt-2 font-serif text-3xl md:text-5xl leading-tight tracking-[0.02em] text-stone-900">灯光为你重新亮起</h1>
          </header>
          {/* 入藏名录：编号索引，逐条揭晓 */}
          <div className="relative z-10 mx-auto mt-5 w-[min(92%,560px)] rounded-2xl border border-white/60 bg-white/45 px-5 shadow-[0_18px_50px_rgba(214,71,124,0.14)] backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-stone-900/10 px-1 py-3">
              <span className="text-[10.5px] tracking-[0.26em] uppercase text-stone-500">Birthday Bulletin · 入藏名录</span>
              <span className="font-serif italic text-[12px] text-stone-500">N°08</span>
            </div>
            <div ref={listRef} className="no-scrollbar max-h-[38vh] overflow-y-auto md:max-h-[42vh]">
              {BLOOM_POPUPS.slice(0, revealed).map((msg, i) => {
                const isMine = msg.startsWith("我记得的事");
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -14 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.45, ease: EASE }}
                    className="group flex items-baseline gap-4 border-b border-stone-900/10 py-3"
                  >
                    <span className="w-8 shrink-0 font-serif italic text-[17px] text-stone-400 transition-colors group-hover:text-red-800">{pad2(i + 1)}</span>
                    <p className="flex-1 font-serif text-[14.5px] leading-snug text-stone-800">{msg.replace("我记得的事：", "")}</p>
                    <span className="shrink-0 text-[9.5px] tracking-[0.18em] uppercase text-stone-400">{isMine ? "我记得的事" : "快报"}</span>
                  </motion.div>
                );
              })}
              {/* 中央快报：名录压轴 */}
              <AnimatePresence>
                {centerOn && (
                  <motion.div
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: EASE }}
                    className="my-3 flex items-center gap-4 rounded-xl bg-[#1c1917] px-4 py-3.5"
                  >
                    <span className="font-serif italic text-xl leading-none text-[#f0c53c]">★</span>
                    <p className="flex-1 font-serif text-[15px] leading-snug text-[#f0c53c]">{BLOOM_CENTER}</p>
                    <span className="shrink-0 text-[9.5px] uppercase tracking-[0.2em] text-[#f0c53c]/70">中央快报</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          {/* 编号计数器 */}
          <div className="txt-veil pointer-events-none absolute bottom-24 left-6 z-10 font-serif italic text-[26px] leading-none text-stone-800 md:text-[34px]">
            {pad2(revealed)}
            <span className="text-[14px] text-stone-400"> / {pad2(total)}</span>
          </div>
          {done && centerOn && (
            <div className="absolute bottom-7 left-0 right-0 z-10 flex justify-center">
              <NextBtn onClick={onNext}>收 下 烟 花</NextBtn>
            </div>
          )}
        </div>
      )}
    </Act>
  );
}

/* ================= 第 04 幕 · 长信（打字机） ================= */

function LetterAct({ onNext }) {
  const fullTotal = useMemo(() => LETTER_PARAGRAPHS.reduce((n, p) => n + p.length, 0), []);
  const [chars, setChars] = useState(0);
  const done = chars >= fullTotal;
  useEffect(() => {
    if (done) return;
    const id = setInterval(() => setChars((c) => Math.min(fullTotal, c + 1)), 55);
    return () => clearInterval(id);
  }, [done, fullTotal]);
  const skip = () => setChars(fullTotal);

  let used = 0;
  const days = daysAlive();

  return (
    <Act bg="#f0d8f4" scene={<SceneBackdrop mood="day" />} className="items-center px-5 py-24 md:py-28">
      <CornerMarks />
      <EdgeText>A Letter For You</EdgeText>
      <div className="w-full max-w-md">
        <p className="text-[11px] tracking-[0.28em] uppercase text-red-800">Step 03 · A Letter, Typed Slowly</p>
        <h1 className="mt-2 font-serif italic text-3xl md:text-4xl text-stone-900">有些话，写进信里</h1>

          <div
            onClick={skip}
            className="relative mt-5 cursor-pointer rounded-2xl border border-white/70 bg-white/75 px-6 pb-24 pt-6 shadow-[0_18px_50px_rgba(214,71,124,0.14)] backdrop-blur-xl"
          >
          <p className="text-[11px] tracking-[0.3em] uppercase text-red-800">To {HER.name} · 见字如面</p>
          <div className="mt-4 space-y-0" style={{ backgroundImage: "repeating-linear-gradient(transparent 0 27px, rgba(28,25,23,0.05) 27px 28px)", backgroundPosition: "0 5px" }}>
            {LETTER_PARAGRAPHS.map((p, i) => {
              const shown = Math.max(0, Math.min(p.length, chars - used));
              const start = used;
              used += p.length;
              return (
                <p key={i} className="relative font-serif text-[14px] leading-[28px] text-stone-900">
                  {p.slice(0, shown)}
                  {!done && chars >= start && chars < used && <span className="type-cursor" />}
                </p>
              );
            })}
          </div>
          <AnimatePresence>
            {done && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}>
                <p className="mt-5 text-right font-serif italic text-[13px] text-stone-700">{LETTER_SIGN}</p>
                <div className="absolute bottom-4 right-5 -rotate-6 rounded-md border-[1.6px] border-red-800/75 bg-red-800/5 px-2 py-1.5 text-center text-[9.5px] leading-[1.7] tracking-[0.14em] text-red-800/90">
                  来 中 国<br />带 你 去 旅 行<br /><span className="tracking-[0.08em]">有效期：终身</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="txt-veil mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 font-mono text-[11.5px] tracking-[0.12em] uppercase text-stone-600">
          <span>来这颗星球第 {days.toLocaleString()} 天</span>
          <span className="opacity-40">/</span>
          <span>时差 1 小时</span>
          <span className="opacity-40">/</span>
          <span>航线 ≈1,800 km</span>
        </div>
        <div className="mt-5 flex justify-center">
          <NextBtn onClick={onNext} disabled={!done}>{done ? "带你去补蜡烛" : "信还在写……（点信可跳过）"}</NextBtn>
        </div>
      </div>
    </Act>
  );
}

/* ================= 第 05 幕 · 23 盏迟到的星星灯（Đèn ông sao · 宁平夜色） ================= */

// 五角星几何：10 个顶点 → 10 片"糊纸"三角 + 竹骨外框
function starGeom(cx, cy, R, r) {
  const pts = [];
  for (let k = 0; k < 10; k++) {
    const rad = k % 2 === 0 ? R : r;
    const a = -Math.PI / 2 + (k * Math.PI) / 5;
    pts.push([cx + rad * Math.cos(a), cy + rad * Math.sin(a)]);
  }
  const facets = [];
  for (let k = 0; k < 10; k++) {
    const p1 = pts[k];
    const p2 = pts[(k + 1) % 10];
    facets.push(
      `M${cx},${cy} L${p1[0].toFixed(2)},${p1[1].toFixed(2)} L${p2[0].toFixed(2)},${p2[1].toFixed(2)} Z`,
    );
  }
  const outline =
    pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(2)},${p[1].toFixed(2)}`).join("") + "Z";
  return { pts, facets, outline };
}

// 越南灯笼配色（红金粉青紫）：[暗面纸, 亮面纸, 竹骨]
const LANTERN_PALETTES = [
  ["#c8473f", "#e8695c", "#8f2a20"],
  ["#d99a3a", "#f2c063", "#a06a1c"],
  ["#d96a92", "#ef93b4", "#a33a5e"],
  ["#3d8f80", "#5cb3a1", "#1f6b52"],
  ["#7b5ea7", "#9d81c9", "#573f82"],
];
const HANGS = [10, 26, 4, 34, 16, 40, 22]; // 挂绳长短错落，像巷子里拉起的灯绳

function LanternGlyph({ i, lit, label, onClick, gold = false, onLight = false, strong = false }) {
  const [cDark, cLight, cFrame] = gold
    ? ["#d99a3a", "#f6d87c", "#a06a1c"]
    : LANTERN_PALETTES[i % LANTERN_PALETTES.length];
  const { facets, outline } = starGeom(18, 18, 15, 6.8);
  const hang = gold ? 6 : HANGS[i % HANGS.length];
  const bone = lit ? cFrame : "#7a5470";
  const unlitOp = strong ? 0.62 : 0.32;
  const labelCls = lit ? (onLight ? "text-red-800" : "text-[#f0c53c]") : "text-[#93708a]";
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label != null ? `第 ${label} 盏星星灯` : "星星灯"}
      className="flex flex-col items-center border-0 bg-transparent p-0 cursor-pointer"
    >
      {/* 挂绳 */}
      <span
        className="block w-px"
        style={{ height: hang, background: "linear-gradient(to bottom, rgba(122,84,112,0), #7a5470)" }}
      />
      <svg width="34" height="52" viewBox="0 0 36 54" className={lit ? "lantern-sway" : ""} overflow="visible" aria-hidden>
        {lit && (
          <g>
            <circle cx="18" cy="18" r="23" fill={cLight} opacity="0.16" />
            <circle cx="18" cy="18" r="13" fill={cLight} opacity="0.22" />
          </g>
        )}
        <g style={{ opacity: lit ? 1 : unlitOp, transition: "opacity 0.6s" }}>
          {facets.map((d, k) => (
            <path key={k} d={d} fill={k % 2 === 0 ? cLight : cDark} stroke={bone} strokeWidth="0.5" strokeLinejoin="round" />
          ))}
          <path d={outline} fill="none" stroke={bone} strokeWidth="0.9" strokeLinejoin="round" />
        </g>
        {/* 流苏 */}
        <g style={{ opacity: lit ? 0.9 : 0.3, transition: "opacity 0.6s" }}>
          <line x1="18" y1="33" x2="18" y2="38" stroke={bone} strokeWidth="0.8" />
          <path d="M15,38 L21,38 L19.5,48 L16.5,48 Z" fill={lit ? cLight : "#7a5470"} opacity="0.85" />
          <line x1="16" y1="38" x2="15.2" y2="47" stroke={bone} strokeWidth="0.5" />
          <line x1="20" y1="38" x2="20.8" y2="47" stroke={bone} strokeWidth="0.5" />
        </g>
      </svg>
      {label != null && (
        <span className={`mt-0.5 font-mono text-[10px] ${labelCls}`}>{label}</span>
      )}
    </button>
  );
}

// 宁平的夜：由 SceneBackdrop（黄昏）接管 —— 喀斯特与水面倒影统一进仙境场景

function Past23Act({ onNext }) {
  const [litSet, setLitSet] = useState(() => new Set());
  const [caption, setCaption] = useState(null); // {age, year, line}
  const runningRef = useRef(false);
  const litSetRef = useRef(litSet);
  useEffect(() => { litSetRef.current = litSet; }, [litSet]);

  const lightOne = (i) => {
    setLitSet((s) => {
      if (s.has(i)) return s;
      const n = new Set(s);
      n.add(i);
      return n;
    });
    const b = PAST_BIRTHDAYS[i];
    setCaption(b);
  };

  const lightAll = () => {
    if (runningRef.current) return;
    runningRef.current = true;
    let i = 0;
    const id = setInterval(() => {
      while (i < PAST_BIRTHDAYS.length && litSetRef.current.has(i)) i++;
      if (i >= PAST_BIRTHDAYS.length) { clearInterval(id); runningRef.current = false; return; }
      lightOne(i);
      i++;
    }, 220);
  };

  const allLit = litSet.size >= PAST_BIRTHDAYS.length;

  return (
    <Act bg="#3f2145" scene={<SceneBackdrop mood="dusk" zoom="right" />} className="items-center overflow-hidden">
      <CornerMarks dark />
      <EdgeText dark>Đèn Ông Sao</EdgeText>

      <div className="relative z-10 w-full">
        <ActHead
          dark
          eyebrow="Bước 04 · Đèn Ông Sao · 星星灯"
          title="23 盏迟到的星星灯"
          sub="你的家乡过中秋时，星星灯会点亮整条巷子。从 2003 年起，你有过 23 个生日，我一次都没赶上。今天一次补齐——每盏灯里，存着那年想对你说的一句话。"
        />
        {/* 灯串 */}
        <div className="mx-auto mt-6 flex max-w-[396px] flex-wrap items-start justify-center gap-x-2.5 gap-y-2 px-2 md:max-w-[560px] md:gap-x-3.5">
          {PAST_BIRTHDAYS.map((bd, i) => (
            <LanternGlyph key={bd.year} i={i} lit={litSet.has(i)} label={bd.age} onClick={() => lightOne(i)} strong />
          ))}
        </div>
        {/* 年份寄语 */}
        <div className="mx-auto mt-5 flex h-24 w-full max-w-md items-start justify-center px-4 text-center">
          <AnimatePresence mode="wait">
            {caption ? (
              <motion.div
                key={caption.year}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.5, ease: EASE }}
                className="inline-block rounded-2xl border border-white/50 bg-white/40 px-5 py-3 backdrop-blur-md"
              >
                <p className="font-mono text-[11px] tracking-[0.26em] text-[#c24568]">
                  第 {caption.age} 岁的生日 · Năm {caption.year}
                </p>
                <p className="mt-2 font-serif italic text-[15px] leading-relaxed text-stone-800">
                  「{caption.line}」
                </p>
              </motion.div>
            ) : (
              <motion.p
                key="hint"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-3 rounded-full border border-white/50 bg-white/40 px-4 py-1.5 text-[11px] tracking-[0.2em] uppercase text-[#7c3f5e] backdrop-blur-md"
              >
                点一盏灯 · 读那一年的话
              </motion.p>
            )}
          </AnimatePresence>
        </div>
        {/* 操作 / 终章 */}
        <div className="flex flex-col items-center px-5 pb-[110px]">
          {!allLit ? (
            <>
              <button
                type="button"
                onClick={lightAll}
                className="rounded-full border border-[#d6477c] bg-white/50 px-7 py-3 text-[11px] tracking-[0.25em] uppercase text-[#d6477c] shadow-[0_12px_30px_rgba(214,71,124,0.2)] backdrop-blur-md transition-colors hover:bg-white/70 cursor-pointer"
              >
                一次点亮这 23 盏
              </button>
              <p className="mt-3 text-[11px] tracking-[0.16em] uppercase text-[#7c3f5e]">
                已点亮 {litSet.size} / 23 · 也可以一盏一盏自己点
              </p>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: EASE }}
              className="flex flex-col items-center text-center"
            >
              <LanternGlyph i={0} gold lit label={24} onClick={() => {}} />
              <div className="txt-veil">
              {PAST23_FINALE.map((l, i) => (
                <p key={i} className={`font-serif italic ${i === 0 ? "mt-1 text-lg text-[#c24568]" : "mt-2 max-w-xs text-[14px] leading-relaxed text-stone-800"}`}>
                  {l}
                </p>
              ))}
              </div>
              <NextBtn onClick={onNext}>看那个约定</NextBtn>
            </motion.div>
          )}
        </div>
      </div>

      <p className="txt-veil-dark absolute bottom-2.5 left-0 right-0 z-10 px-24 text-center text-[11px] tracking-[0.18em] uppercase text-[#f0dbe8]">
        Fig.04 — 第 24 盏今晚点亮 · 第 25 盏挂在宁平的夜空
      </p>
    </Act>
  );
}

/* ================= 第 06 幕 · 第 25 个生日之约（登机牌） ================= */

function VowAct({ onNext }) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const remain = Math.max(0, vowTargetUtc() - now);
  const d = Math.floor(remain / 86400000);
  const h = Math.floor((remain % 86400000) / 3600000);
  const m = Math.floor((remain % 3600000) / 60000);
  const s = Math.floor((remain % 60000) / 1000);

  return (
    <Act bg="#f0d8f4" scene={<SceneBackdrop mood="day" />} className="items-center px-5 pb-16">
      <CornerMarks />
      <EdgeText>Hẹn gặp ở Ninh Bình</EdgeText>
      <ActHead
        eyebrow="Step 05 · The 25th, Face To Face"
        title={<>第 25 个生日，<br />换我飞向你</>}
        sub="这次不用隔着屏幕想象：我会站在你面前，亲手点上第 25 支蜡烛。票已经写好，就差出发了。"
      />
      {/* 登机牌 */}
      <motion.div
        initial={{ opacity: 0, y: 24, rotate: -1.5 }}
        animate={{ opacity: 1, y: 0, rotate: -1 }}
        transition={{ duration: 0.8, ease: EASE }}
        className="relative mt-9 w-full max-w-md rounded-2xl border border-white/60 bg-white/65 shadow-[0_18px_50px_rgba(214,71,124,0.18)] backdrop-blur-xl"
      >
        <div className="flex items-center justify-between border-b border-dashed border-stone-300 px-5 py-3.5">
          <span className="font-mono text-[11px] tracking-[0.18em] text-red-800">{VOW.airline}</span>
          <span className="text-[10.5px] tracking-[0.26em] uppercase text-stone-500">Boarding Pass</span>
        </div>
        <div className="flex items-center justify-between px-5 py-5">
          <div>
            <p className="font-serif italic text-2xl text-stone-900">{VOW.from.split(" ")[0]}</p>
            <p className="mt-0.5 text-[11px] tracking-[0.14em] text-stone-500">{VOW.from.split(" ")[1]} · 出发</p>
          </div>
          <div className="mx-3 flex-1">
            <p className="text-center font-mono text-[11px] tracking-[0.18em] text-red-800">{VOW.flightNo}</p>
            <div className="relative my-1.5 flex items-center">
              <span className="h-[1.5px] flex-1 border-t border-dashed border-stone-400" />
              <svg width="18" height="12" viewBox="-20 -12 48 26" className="mx-1 shrink-0">
                <path d="M26,0 L-18,11 L-7,0 L-18,-11 Z" fill="#1c1917" />
              </svg>
              <span className="h-[1.5px] flex-1 border-t border-dashed border-stone-400" />
            </div>
            <p className="text-center text-[10.5px] tracking-[0.12em] text-stone-500">直飞想念 · 约 3,300 km</p>
          </div>
          <div className="text-right">
            <p className="font-serif italic text-2xl text-stone-900">宁平</p>
            <p className="mt-0.5 text-[11px] tracking-[0.14em] text-stone-500">Ninh Bình · 抵达</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-y-3 border-t border-dashed border-stone-300 px-5 py-4 text-left">
          {[
            ["日期 · DATE", VOW.dateLabel],
            ["乘客 · PAX", VOW.passenger],
            ["舱位 · CLASS", VOW.cabin],
            ["座位 · SEAT", VOW.seat],
            ["行李 · BAG", VOW.luggage],
            ["状态 · STATUS", "已出票 · 候机中"],
          ].map(([k, v]) => (
            <div key={k} className={k.startsWith("行李") || k.startsWith("状态") ? "col-span-1" : ""}>
              <p className="text-[10px] tracking-[0.18em] uppercase text-stone-500">{k}</p>
              <p className="mt-0.5 font-mono text-[12px] text-stone-900">{v}</p>
            </div>
          ))}
        </div>
        {/* 撕票口 */}
        <div className="relative border-t border-dashed border-stone-300 py-3">
          <span className="absolute -left-2 -top-2 h-4 w-4 rounded-full bg-[#e9e6df]" />
          <span className="absolute -right-2 -top-2 h-4 w-4 rounded-full bg-[#e9e6df]" />
        </div>
      </motion.div>

      {/* 倒数与承诺 */}
        <div className="txt-veil mt-8 flex items-center gap-2 font-mono text-[13px] text-stone-900">
        <span className="rounded-md border border-stone-300 bg-[#fffdf6] px-2.5 py-1">{d}</span> 天
        <span className="rounded-md border border-stone-300 bg-[#fffdf6] px-2.5 py-1">{pad2(h)}</span> 时
        <span className="rounded-md border border-stone-300 bg-[#fffdf6] px-2.5 py-1">{pad2(m)}</span> 分
        <span className="rounded-md border border-stone-300 bg-[#fffdf6] px-2.5 py-1">{pad2(s)}</span> 秒
      </div>
      <p className="txt-veil mt-2 text-[11px] tracking-[0.18em] uppercase text-stone-600">距离 2027·10·11 · 宁平时间</p>
      <p className="txt-veil mt-6 max-w-sm text-center font-serif italic text-[15px] leading-relaxed text-stone-800">「{VOW.line}」</p>
      <p className="txt-veil mt-2 text-center font-serif italic text-[13px] text-red-800/90">{VOW.viLine}</p>
      <p className="txt-veil mt-3 max-w-sm text-center text-[12px] leading-relaxed text-stone-600">{VOW.futureLine}</p>
      {/* 未来的星星灯：25、26、27……到永远 */}
      <div className="mt-6 flex items-start justify-center gap-2.5">
        {[25, 26, 27, 28].map((n) => (
          <LanternGlyph key={n} i={n} lit label={n} onLight onClick={() => {}} />
        ))}
        <LanternGlyph i={1} gold lit label="∞" onLight onClick={() => {}} />
      </div>
      <NextBtn onClick={onNext}>最后一件事</NextBtn>
    </Act>
  );
}

/* ================= 第 07 幕 · 许愿星（跨年存档） ================= */

function WishAct() {
  const [text, setText] = useState("");
  const [saved, setSaved] = useState(null); // 已存的愿望（当年）
  const [nudge, setNudge] = useState(false);
  const risen = saved !== null; // 愿望已封存 → 新星升空
  const farRef = useRef(null);
  const nearRef = useRef(null);

  // 星空（固定伪随机，避免每次渲染乱跳）
  const stars = useMemo(() => {
    const rnd = (i, k) => Math.abs(Math.sin(i * 12.9898 + k * 78.233) * 43758.5453) % 1;
    return Array.from({ length: 90 }, (_, i) => ({
      x: rnd(i, 1) * 100,
      y: rnd(i, 2) * 62,
      s: 1 + rnd(i, 3) * 2,
      d: (i % 9) * 0.45,
      near: i % 5 === 0,
    }));
  }, []);

  // 进入时读取当年已存愿望
  useEffect(() => {
    try {
      const raw = localStorage.getItem(WISH_STORAGE_KEY);
      if (!raw) return;
      const w = JSON.parse(raw);
      if (w && w.text && w.year === vnParts().y) setSaved(w.text);
    } catch { /* 忽略坏档 */ }
  }, []);

  // 视差：两层星星随指针轻移（桌面端细节）
  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    const dx = (e.clientX - r.left) / r.width - 0.5;
    const dy = (e.clientY - r.top) / r.height - 0.5;
    if (farRef.current) farRef.current.style.transform = `translate(${dx * -10}px, ${dy * -6}px)`;
    if (nearRef.current) nearRef.current.style.transform = `translate(${dx * -24}px, ${dy * -14}px)`;
  };

  const save = () => {
    const t = text.trim();
    if (!t) {
      setNudge(true);
      setTimeout(() => setNudge(false), 800);
      return;
    }
    try {
      localStorage.setItem(WISH_STORAGE_KEY, JSON.stringify({ text: t, year: vnParts().y, at: Date.now() }));
    } catch { /* 隐私模式下静默失败，不影响流程 */ }
    setSaved(t);
  };

  return (
    <Act bg="#241640" scene={<SceneBackdrop mood="night" zoom="left" />} className="items-center" >
      <CornerMarks dark />
      <EdgeText dark>Điều ước của em</EdgeText>
      <div className="pointer-events-none absolute inset-0 overflow-hidden" onPointerMove={onMove}>
        <div ref={farRef} className="absolute inset-0 transition-transform duration-300 ease-out">
          {stars.filter((s) => !s.near).map((s, i) => (
            <span key={i} className="star-twinkle absolute rounded-full bg-[#fff7e0]"
              style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.s, height: s.s, animationDelay: `${s.d}s` }} />
          ))}
        </div>
        <div ref={nearRef} className="absolute inset-0 transition-transform duration-300 ease-out">
          {stars.filter((s) => s.near).map((s, i) => (
            <span key={i} className="star-twinkle absolute rounded-full bg-[#fffdf0]"
              style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.s + 1.5, height: s.s + 1.5, animationDelay: `${s.d}s`, boxShadow: "0 0 8px rgba(255,247,224,0.8)" }} />
          ))}
        </div>
        <span className="meteor-line" />
      </div>

      <ActHead
        dark
        eyebrow={risen ? "Sealed · 它已经在天上了" : "Step 06 · One Last Thing"}
        title={risen ? "今晚，夜空多了一颗星" : "把愿望说给流星听"}
        sub={risen
          ? "它现在是这片夜空里最亮的一颗。明年你生日打开这一页，它会第一个亮起来——提醒我，去把它实现。"
          : "写下一个今年的愿望。它会化作一颗星挂在这片夜空里——我负责每年检查一遍，看看帮你实现了没有。"}
      />

      {/* 新星升空 */}
      <div className="relative mt-4 h-20 w-full max-w-md">
        <AnimatePresence>
          {risen && (
            <div className="absolute left-1/2 top-3 -translate-x-1/2">
              <motion.div
                initial={{ y: 90, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 1.6, ease: EASE }}
                className="flex flex-col items-center gap-1.5"
              >
                <span className="flex items-center gap-2.5">
                  <span className="block h-4 w-4 rounded-full bg-[#f0c53c] star-twinkle" style={{ boxShadow: "0 0 22px rgba(240,197,60,0.95), 0 0 55px rgba(240,197,60,0.5)" }} />
                  <span className="font-serif italic text-[13px] text-[#f0c53c]">{vnParts().y} · {HER.nameVi}的愿望</span>
                </span>
                <span className="text-[10.5px] tracking-[0.2em] uppercase text-[#c9a2b8]">Điều ước đã lên trời · 愿望已上天</span>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* 许愿卡 / 封存卡 */}
      <div className="relative z-10 mt-2 w-[min(92%,380px)] rounded-2xl border border-white/70 bg-white/55 px-6 py-5 shadow-[0_18px_50px_rgba(214,71,124,0.20)] backdrop-blur-xl">
        <AnimatePresence mode="wait">
          {!saved ? (
            <motion.div key="form" exit={{ opacity: 0, y: -14 }} transition={{ duration: 0.5 }}>
              <p className="text-[10.5px] tracking-[0.24em] uppercase text-red-800">许愿卡 · Wish Card · {vnParts().y}</p>
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                maxLength={40}
                placeholder="我想……"
                className={`mt-3 w-full border-b bg-transparent pb-2 font-serif italic text-lg text-stone-900 outline-none placeholder:text-[#b8ad99] border-dashed ${nudge ? "shake border-red-500" : "border-[#b8ad99]"}`}
              />
              <button
                type="button"
                onClick={save}
                className="mt-4 w-full rounded-full border border-[#d6477c] bg-[#d6477c] py-2.5 text-[11px] tracking-[0.26em] uppercase text-white shadow-[0_12px_30px_rgba(214,71,124,0.28)] hover:bg-[#c23a6d] transition-colors cursor-pointer"
              >
                封存愿望 ✦
              </button>
            </motion.div>
          ) : (
            <motion.div key="done" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: EASE }} className="text-center">
              <p className="text-[10.5px] tracking-[0.24em] uppercase text-red-800">愿望已封存 · Locked In The Sky</p>
              <p className="mt-2.5 font-serif italic text-[16px] text-stone-900">「{saved}」</p>
              <p className="mt-2.5 text-[11px] tracking-[0.12em] text-stone-600">
                已存进这颗星星 · 只有拆开这份礼物的人，明年还能看到它
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 收尾 */}
      <div className="txt-veil-dark relative z-10 mt-9 flex flex-col items-center gap-3 pb-12">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-full border border-white/40 bg-white/15 px-5 py-2 text-[11px] tracking-[0.18em] uppercase text-white/90 backdrop-blur-md transition-colors hover:border-[#f0c53c] hover:text-[#f0c53c] cursor-pointer"
          >
            ↺ 从封印重看一遍
          </button>
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full border border-[#f0c53c] px-5 py-2 text-[11px] tracking-[0.18em] uppercase text-[#f0c53c] hover:bg-[#f0c53c]/10 transition-colors cursor-pointer"
          >
            回到那封信 <span aria-hidden>→</span>
          </Link>
        </div>
        <p className="txt-veil-dark text-[11px] tracking-[0.18em] uppercase text-[#f0dbe8]">
          Fig.07 — 愿望只保存在这台设备里 · 明年 10·11 自动回放
        </p>
      </div>
    </Act>
  );
}

/* ================= 页面骨架：舞台机 ================= */

const STAGES = ["seal", "light", "blow", "bloom", "letter", "past", "vow", "wish"];
const stageVariants = {
  initial: { opacity: 0, y: 36, scale: 0.985 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -28, scale: 0.99 },
};

export default function BirthdayPage() {
  const [stage, setStage] = useState(0);
  const [preview, setPreview] = useState(false);
  const [instant, setInstant] = useState(false); // 调试跳幕时跳过过场动画
  const [now, setNow] = useState(() => new Date());
  const stageParam = useSearchParams()[0].get("stage");
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const isToday = isHerBirthday(now);
  const unlocked = isToday || isAfterBirthdayThisYear(now);
  const locked = !unlocked && !preview && COUNTDOWN_ENABLED;
  const remainMs = isToday ? 0 : Math.max(0, nextBirthdayUtc(now).getTime() - now.getTime());

  // 调试直达：/birthday?stage=5（或 ?stage=past）→ 自动解锁并瞬时跳到对应一幕；
  // 依赖参数值本身：调试面板在同页点击不同幕时也能重新触发（同路由不重挂载）
  useEffect(() => {
    if (stageParam == null) return;
    const idx = /^\d+$/.test(stageParam) ? parseInt(stageParam, 10) : STAGES.indexOf(stageParam);
    if (idx >= 0 && idx < STAGES.length) {
      setPreview(true);
      setInstant(true);
      setStage(idx);
    }
  }, [stageParam]);

  const next = useCallback(() => {
    setInstant(false);
    setStage((s) => Math.min(STAGES.length - 1, s + 1));
  }, []);
  const openGift = useCallback(() => {
    setInstant(false);
    if (!locked) setStage(1);
  }, [locked]);

  const actFor = (s) => {
    switch (s) {
      case 0: return <SealAct locked={locked} isToday={isToday} remainMs={remainMs} preview={preview} onPreview={() => setPreview(true)} onOpen={openGift} />;
      case 1: return <LightAct onNext={next} />;
      case 2: return <BlowAct onBlown={next} />;
      case 3: return <BloomAct onNext={next} />;
      case 4: return <LetterAct onNext={next} />;
      case 5: return <Past23Act onNext={next} />;
      case 6: return <VowAct onNext={next} />;
      default: return <WishAct />;
    }
  };

  return (
    <main
      className="relative min-h-screen w-full overflow-x-hidden font-sans select-none"
      style={{ color: "#1c1917" }}
    >
      <Navbar hideStamp />

      {/* 获奖级质感层：胶片颗粒 + 桌面端自定义光标 */}
      <GrainOverlay />
      <CursorGlow />

      {/* 左上角：返回首页（与 /route 一致） */}
      <Link
        to="/"
        aria-label="返回首页"
        className="fixed left-4 top-4 z-[60] inline-flex items-center gap-1.5 rounded-full border border-white/60 bg-white/45 px-3 py-1.5 text-[11px] uppercase tracking-[0.15em] text-stone-700 shadow-[0_8px_24px_rgba(214,71,124,0.14)] backdrop-blur-md transition-colors hover:bg-white/70 cursor-pointer"
      >
        <span aria-hidden>←</span> 首页
      </Link>

      {/* 预览模式角标 */}
      {preview && (
        <span className="fixed right-4 top-4 z-[60] rounded-full border border-[#f0c53c] bg-[#1c1917]/90 px-3 py-1.5 text-[10.5px] tracking-[0.18em] uppercase text-[#f0c53c] backdrop-blur">
          预览模式 · 她生日当天自动正式解锁
        </span>
      )}

      {instant ? (
        /* 调试直达：无过场，直接挂载对应一幕 */
        <div key={`instant-${stage}`}>{actFor(stage)}</div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={stage}
            variants={stageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.65, ease: EASE }}
          >
            {actFor(stage)}
          </motion.div>
        </AnimatePresence>
      )}

      {/* 全页动效样式（火苗/星星/流星/纸飞机/余烟/抖动） */}
      <style>{`
        @keyframes bdayFlicker {
          0%, 100% { transform: scale(1) rotate(-1.6deg); }
          30% { transform: scale(1.08, 0.94) rotate(1.8deg); }
          60% { transform: scale(0.94, 1.06) rotate(-2.2deg); }
        }
        .flame-anim { transform-origin: 150px 84px; animation: bdayFlicker 1.1s ease-in-out infinite; }
        .bday-flame { animation: bdayFlicker 0.9s ease-in-out infinite; transform-origin: 50% 100%; }

        @keyframes bdayTwinkle { 0%, 100% { opacity: 0.25; } 50% { opacity: 1; } }
        .star-twinkle { animation: bdayTwinkle 3s ease-in-out infinite; }

        @keyframes bdayMeteor {
          0%, 58% { right: -160px; opacity: 0; }
          62% { opacity: 1; }
          100% { right: 72%; opacity: 0; }
        }
        .meteor-line {
          position: absolute; top: 22%; right: -160px; width: 140px; height: 1.5px;
          background: linear-gradient(90deg, rgba(255,247,224,0), #fff7e0);
          transform: rotate(18deg);
          animation: bdayMeteor 6.5s ease-in infinite;
        }

        @keyframes bdayPlane {
          0%, 62% { transform: translateX(-150%) rotate(8deg); opacity: 0; }
          66% { opacity: 0.9; }
          100% { transform: translateX(160%) rotate(8deg); opacity: 0; }
        }
        .seal-plane { animation: bdayPlane 5.6s ease-in-out infinite; }

        @keyframes bdaySmoke {
          0% { stroke-dashoffset: 64; opacity: 0; }
          25% { opacity: 0.5; }
          100% { stroke-dashoffset: -18; opacity: 0; }
        }
        .smoke-line { stroke-dasharray: 64; animation: bdaySmoke 2.8s ease-out infinite; }

        @keyframes bdayShake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .shake { animation: bdayShake 0.32s ease-in-out 2; }

        @keyframes sealGlowPulse {
          0%, 100% { opacity: 0.55; transform: scale(1); transform-origin: center; transform-box: fill-box; }
          50% { opacity: 1; transform: scale(1.14); }
        }
        .seal-glow { animation: sealGlowPulse 2.8s ease-in-out infinite; }

        @keyframes tapRingPulse {
          0%, 100% { transform: translate(-50%, 0) scale(1); opacity: 0.9; }
          50% { transform: translate(-50%, 0) scale(1.18); opacity: 0.4; }
        }
        .tap-ring { animation: tapRingPulse 2s ease-in-out infinite; }

        @keyframes bdaySway {
          0%, 100% { transform: rotate(-2.2deg); }
          50% { transform: rotate(2.2deg); }
        }
        .lantern-sway { transform-origin: 18px 4px; animation: bdaySway 3.6s ease-in-out infinite; }

        @keyframes bdayBoat {
          0%, 100% { transform: translateY(0) rotate(-0.7deg); }
          50% { transform: translateY(-2.5px) rotate(0.9deg); }
        }
        .boat-bob { animation: bdayBoat 4.6s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }

        @keyframes bdayCloud {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(16px); }
        }
        .cloud-drift { animation: bdayCloud 9s ease-in-out infinite; }
        .cloud-drift-slow { animation: bdayCloud 13s ease-in-out infinite reverse; }

        @keyframes bdayBalloon {
          0%, 100% { transform: translateY(0) rotate(-1.2deg); }
          50% { transform: translateY(-12px) rotate(1.4deg); }
        }
        .balloon-float { animation: bdayBalloon 5.5s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
        .balloon-float-slow { animation: bdayBalloon 7s ease-in-out infinite reverse; transform-box: fill-box; transform-origin: center; }

        /* 场景变焦取景：配合 object-position 把窗口推到灯塔/小熊区域，让开中央蛋糕（桌面端窗口更宽，需更大倍数） */
        .scene-zoom-right { transform: scale(2.2); transform-origin: 100% 100%; }
        .scene-zoom-left { transform: scale(2.2); transform-origin: 0% 100%; }
        @media (max-width: 640px) {
          .scene-zoom-right, .scene-zoom-left { transform: scale(1.15); }
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { scrollbar-width: none; }

        /* 压在照片上的文字：白色光晕保证可读 */
        .txt-veil { text-shadow: 0 1px 10px rgba(255,255,255,0.9), 0 0 3px rgba(255,255,255,0.65); }
        .txt-veil-dark { text-shadow: 0 1px 10px rgba(24,12,32,0.75), 0 0 3px rgba(24,12,32,0.5); }

        @keyframes bdayBreath {
          0% { transform: translate(-50%, 0) scale(0.35); opacity: 0; }
          22% { opacity: 0.9; }
          100% { transform: translate(-50%, -150px) scale(1.8); opacity: 0; }
        }
        .breath-ring {
          position: absolute; bottom: 0; left: 50%;
          width: 46px; height: 46px; border-radius: 50%;
          border: 1.5px solid rgba(214,71,124,0.5);
          animation: bdayBreath 1.5s ease-out infinite;
        }
      `}</style>
    </main>
  );
}
