// Wonderland Chapters —— JFA 式章节页模板（结构复刻：边缘装饰 + 巨型标题 + INDEX + 计数器）
// 三条路由共用同一模板，配色与文案由 CHAPTER_PAGE 配置驱动：
//   /wonderland/story  ·  /wonderland/court  ·  /wonderland/song
// 装饰插画为原创 SVG（生日主题：花柱/心气球/星团/丝带），替换素材直接改 Decor 组件。
import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1];

function pad2(n) {
  return String(n).padStart(2, "0");
}

/* ============ 章节页配置 ============ */
const CHAPTER_PAGES = {
  story: {
    no: "01",
    tag: "◦ OUR STORY ◦",
    tint: "#d9e6f2",
    ink: "#1e3a5f",
    lines: ["听一首来自", "杭州的", "生日恋歌"],
    sub: ["一个跨越一千八百公里的生日故事，", "在人间与云端之间。"],
  },
  court: {
    no: "03",
    tag: "◦ BIRTHDAY COURT ◦",
    tint: "#faedc8",
    ink: "#1e3a5f",
    lines: ["仙境的故事", "徐徐展开"],
    sub: ["蛋糕与小熊已经就位，", "就等你入场。"],
  },
  song: {
    no: "02",
    tag: "◦ VICTORIA WHARF ◦",
    tint: "#dcefe4",
    ink: "#1e3a5f",
    lines: ["汽笛响起", "向宁平出发"],
    sub: ["下一站的船票已经写好名字，", "是你。"],
  },
};
const CHAPTER_ORDER = ["story", "court", "song"];

/* ============ 原创装饰插画（生日主题） ============ */

// 花柱：一根茎上叠彩色花穗（角落立柱）
function PokerFlower({ x, y, s = 1, rot = 0, a = "#e8695c", b = "#f0c53c" }) {
  const petals = [0, 1, 2, 3, 4, 5].map((i) => y - i * 26);
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <line x1="0" y1="0" x2="0" y2="-140" stroke="#3f7d5c" strokeWidth="5" />
      {petals.map((py, i) => (
        <g key={i}>
          <ellipse cx="-11" cy={py} rx="10" ry="14" fill={i % 2 ? a : b} transform={`rotate(${-14} -11 ${py})`} />
          <ellipse cx="11" cy={py} rx="10" ry="14" fill={i % 2 ? a : b} transform={`rotate(${14} 11 ${py})`} />
        </g>
      ))}
      <circle cx="0" cy={petals[5] - 22} r="12" fill={b} />
      <circle cx="0" cy={petals[5] - 22} r="5" fill="#fff6dd" />
    </g>
  );
}

// 心形气球（飘带）
function HeartBalloon({ x, y, s = 1, rot = 0, c = "#f7a8c0" }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <path d="M0,14 C-9,8 -16,2 -16,-5 C-16,-12 -9,-15 0,-8 C9,-15 16,-12 16,-5 C16,2 9,8 0,14 Z" fill={c} />
      <ellipse cx="-6" cy="-6" rx="3" ry="4.5" fill="#ffffff" opacity="0.55" />
      <path d="M0 16 C-6 34 8 48 2 66" fill="none" stroke={c} strokeWidth="1.4" />
    </g>
  );
}

// 星团：一圈圆点围成的星芒（点缀）
function StarDots({ x, y, s = 1, c = "#7fb3d4" }) {
  const dots = Array.from({ length: 14 }, (_, i) => {
    const a = (i / 14) * Math.PI * 2;
    return [Math.cos(a) * 16, Math.sin(a) * 16];
  });
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {dots.map(([dx, dy], i) => (
        <circle key={i} cx={dx} cy={dy} r="2.6" fill={c} opacity="0.85" />
      ))}
      <circle cx="0" cy="0" r="3" fill={c} />
    </g>
  );
}

// 丝带波浪
function Ribbon({ x, y, s = 1, rot = 0, c = "#f2a2b8" }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <path d="M0 0 C 24 -18 48 6 72 -10 C 88 -20 104 -8 116 -16" fill="none" stroke={c} strokeWidth="7" strokeLinecap="round" />
      <path d="M0 0 C 24 -18 48 6 72 -10" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
    </g>
  );
}

// 边缘装饰组合（按页面四角布置）
function EdgeDecor({ tint }) {
  const warm = tint === "#faedc8";
  return (
    <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" aria-hidden>
      {/* 左下花柱丛 */}
      <PokerFlower x={90} y={900} s={1.25} rot={-4} a="#e8695c" b="#f0a03c" />
      <PokerFlower x={190} y={920} s={0.95} rot={3} a="#f0c53c" b="#e8a03c" />
      <PokerFlower x={22} y={880} s={0.8} rot={-9} a="#f2a2b8" b="#f0c53c" />
      {/* 右下花柱 + 海螺位换星团 */}
      <PokerFlower x={1350} y={920} s={1.1} rot={5} a="#7fb3d4" b="#a8d8b8" />
      <PokerFlower x={1420} y={880} s={0.85} rot={10} a="#f0c53c" b="#e8695c" />
      {/* 左上花枝 */}
      <PokerFlower x={30} y={130} s={0.75} rot={-160} a="#e8695c" b="#f0c53c" />
      <PokerFlower x={1250} y={70} s={0.7} rot={150} a="#f2a2b8" b="#f0c53c" />
      {/* 心气球 */}
      <HeartBalloon x={180} y={210} s={1.1} rot={-8} c="#f7a8c0" />
      <HeartBalloon x={1300} y={260} s={0.9} rot={9} c="#b5a8f0" />
      <HeartBalloon x={80} y={520} s={0.7} rot={4} c={warm ? "#f0c53c" : "#7fb3d4"} />
      {/* 星团点缀 */}
      <StarDots x={340} y={150} s={0.9} />
      <StarDots x={1120} y={120} s={0.7} c={warm ? "#c9a24a" : "#6a9ec4"} />
      <StarDots x={1380} y={620} s={0.8} />
      {/* 丝带 */}
      <Ribbon x={1150} y={330} s={1.1} rot={-8} />
      <Ribbon x={140} y={640} s={0.9} rot={6} c="#b5a8f0" />
    </svg>
  );
}

export default function WonderlandChapterPage() {
  const { chapter = "story" } = useParams();
  const navigate = useNavigate();
  const cfg = CHAPTER_PAGES[chapter] ?? CHAPTER_PAGES.story;
  const [indexOpen, setIndexOpen] = useState(false);
  const idx = CHAPTER_ORDER.indexOf(chapter === "song" ? "song" : chapter === "court" ? "court" : "story");

  return (
    <div
      className="relative h-[100dvh] w-full overflow-hidden font-sans select-none"
      style={{ background: cfg.tint, color: cfg.ink }}
    >
      {/* 边缘装饰 */}
      <EdgeDecor tint={cfg.tint} />

      {/* 左上 logo 印章 */}
      <div className="absolute left-6 top-6 z-30 flex h-16 w-16 items-center justify-center rounded-full border-[1.5px] bg-white/50 backdrop-blur" style={{ borderColor: `${cfg.ink}55` }}>
        <span className="font-serif text-[9px] font-semibold leading-tight tracking-[0.1em]" style={{ color: cfg.ink }}>
          秋草<br />生日
        </span>
      </div>

      {/* 右上汉堡 */}
      <button
        onClick={() => setIndexOpen((o) => !o)}
        aria-label="菜单"
        className="absolute right-8 top-8 z-30 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border-[1.5px] bg-white/60 backdrop-blur transition-transform hover:scale-105"
        style={{ borderColor: `${cfg.ink}55` }}
      >
        <span className="flex flex-col gap-[5px]">
          <span className="block h-[1.5px] w-5" style={{ background: cfg.ink }} />
          <span className="block h-[1.5px] w-5" style={{ background: cfg.ink }} />
          <span className="block h-[1.5px] w-3" style={{ background: cfg.ink }} />
        </span>
      </button>

      {/* 中央：微标签 + 三行巨型标题 + 副文案 + 花朵分隔 */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6 text-center">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE }}
          className="text-[11px] font-semibold uppercase tracking-[0.34em]"
          style={{ color: `${cfg.ink}cc` }}
        >
          {cfg.tag}
        </motion.p>
        <h1 className="mt-4 font-serif text-[13vw] leading-[1.04] md:text-[88px]">
          {cfg.lines.map((l, i) => (
            <motion.span
              key={l}
              className="block"
              initial={{ opacity: 0, y: 34 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.16, duration: 0.9, ease: EASE }}
            >
              {l}
            </motion.span>
          ))}
        </h1>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="mt-7"
        >
          {cfg.sub.map((s) => (
            <p key={s} className="text-[13.5px] leading-[1.9]" style={{ color: `${cfg.ink}cc` }}>
              {s}
            </p>
          ))}
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.05, duration: 0.6 }}
          className="mt-7"
        >
          <StarDots s={0.85} c="#e8915c" />
        </motion.div>
      </div>

      {/* 底部 INDEX 按钮 */}
      <motion.button
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.7, ease: EASE }}
        onClick={() => setIndexOpen(true)}
        className="absolute bottom-10 left-1/2 z-30 flex -translate-x-1/2 cursor-pointer items-center gap-3 rounded-md bg-white/85 px-6 py-2.5 text-[12px] font-semibold uppercase tracking-[0.22em] shadow-[0_10px_30px_rgba(28,25,23,0.10)] backdrop-blur transition-colors hover:bg-white"
        style={{ color: cfg.ink }}
      >
        INDEX
        <span className="flex flex-col gap-[4px]">
          <span className="block h-[1.5px] w-4" style={{ background: cfg.ink }} />
          <span className="block h-[1.5px] w-4" style={{ background: cfg.ink }} />
        </span>
      </motion.button>

      {/* 右下计数器 */}
      <div className="absolute bottom-9 right-8 z-20 font-mono text-[13px] tracking-[0.14em]" style={{ color: `${cfg.ink}aa` }}>
        {pad2(idx + 1)}/{pad2(CHAPTER_ORDER.length)}
      </div>

      {/* 章节索引浮层 */}
      <AnimatePresence>
        {indexOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-40 flex flex-col items-center justify-center gap-2 backdrop-blur-xl"
            style={{ background: `${cfg.tint}e6` }}
          >
            <p className="mb-4 text-[10.5px] uppercase tracking-[0.34em]" style={{ color: `${cfg.ink}99` }}>
              Wonderland Index
            </p>
            {CHAPTER_ORDER.map((key, i) => {
              const c = CHAPTER_PAGES[key];
              const active = key === chapter;
              return (
                <motion.button
                  key={key}
                  initial={{ opacity: 0, x: -18 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.08, duration: 0.5, ease: EASE }}
                  onClick={() => { setIndexOpen(false); navigate(`/wonderland/${key}`); }}
                  className="group flex w-[min(86%,460px)] cursor-pointer items-baseline gap-5 border-b px-2 py-4 text-left transition-colors"
                  style={{ borderColor: `${cfg.ink}22`, color: cfg.ink }}
                >
                  <span className="font-serif italic text-[22px] opacity-60 group-hover:opacity-100">{c.no}</span>
                  <span className="flex-1 font-serif text-[20px]">{c.lines.join(" ")}</span>
                  <span className="text-[10px] uppercase tracking-[0.2em] opacity-60">{c.tag.replace(/[◦<>]/g, "").trim()}</span>
                </motion.button>
              );
            })}
            <button
              onClick={() => setIndexOpen(false)}
              className="mt-6 cursor-pointer text-[11px] uppercase tracking-[0.3em] opacity-60 hover:opacity-100"
            >
              ✕ 关闭
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
