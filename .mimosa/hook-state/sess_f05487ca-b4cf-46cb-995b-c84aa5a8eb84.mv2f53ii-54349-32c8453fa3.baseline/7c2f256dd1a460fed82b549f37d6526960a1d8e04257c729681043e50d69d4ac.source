// ============================================================================
// Wonderland —— 学习版：按 jfa-awards.snp.agency 的工程结构复刻交互骨架
// ----------------------------------------------------------------------------
// 【技术解剖结论】（原站探针实测，2026-10）
//   框架    ：Next.js + React + CSS Modules（Hero_root__xxx / Menu_root__xxx / BaseIllustrationSlide_root__xxx）
//   动画    ：无 GSAP / Three / 全局 Lenis —— 组件级 opacity/transform 显现 + 横向 translate 轨道
//   章节页  ：Hero 组件 = Tag(微标签) + 标题(结构化 opacity 显现) + 副文案 + 花朵分隔 + INDEX 按钮
//   画板    ：BaseIllustrationSlide —— 每块圆形画板以「屏幕中心」为原点，
//             translate(-720,-450)（= 1440×900 的一半）绝对居中，整条轨道横移切换画板
//   菜单    ：Menu 组件 = 编号章节链接（01 OUR STORY / 02 …）+ 社交外链 + 片头影片入口
//   字体    ：标题用商业字体 Voyage（学习版用 Google Fonts 的 Italiana 替代）
//   片头    ：VideoModal 影片序列（访谈/航拍），带 SKIP INTRO 与声音开关
// 【版权】结构与机制为学习目的复刻；插画/文案/影片均为占位原创内容，未使用原站任何素材。
// ============================================================================

import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const BASE = import.meta.env.BASE_URL;

/* ============ 内容配置（占位，全部可替换） ============ */
const SITE_TITLE_LINES = ["生日快乐", "秋草的生日"];
const SITE_TAG = "◦ A BIRTHDAY WONDERLAND ◦";
const SITE_SUB = "一坐在云端与海面之间的生日仙境。";

const CHAPTERS = [
  { no: "01", en: "OUR STORY", cn: "我们的故事", href: "/wonderland/story", film: "02:12",
    panels: [
      { img: "scene-main.jpg", pos: "50% 100%", tint: "#cfe3f5" },
      { img: "scene-main.jpg", pos: "0% 100%", tint: "#fdf3d8" },
      { img: "scene-main.jpg", pos: "100% 100%", tint: "#dff0e6" },
    ] },
  { no: "02", en: "LIGHT THE CANDLE", cn: "点亮蜡烛", href: "/wonderland/court", film: "01:38",
    panels: [
      { img: "scene-lit.jpg", pos: "50% 60%", tint: "#cfe3f5" },
      { img: "scene-lit.jpg", pos: "0% 60%", tint: "#ffdfe9" },
      { img: "scene-lit.jpg", pos: "100% 60%", tint: "#e6e0fa" },
    ] },
  { no: "03", en: "CENTRE WONDER", cn: "许个愿", href: "/wonderland/song", film: "01:05",
    panels: [
      { img: "scene-main.jpg", pos: "50% 20%", tint: "#d8e4fa" },
      { img: "scene-main.jpg", pos: "0% 30%", tint: "#ffdfe9" },
      { img: "scene-lit.jpg", pos: "100% 50%", tint: "#e6e0fa" },
    ] },
];

// 与 JFA 对齐的关键样式参数（原站探针实测值）
const VOYAGE_LIKE = `'Italiana', 'Noto Serif SC', 'Times New Roman', serif`; // 替代商业字体 Voyage（Latin: Italiana / CJK: Noto Serif SC）
const PALETTE = { bg: "#f6f4ec", ink: "#1e3a5f" }; // 奶油底 + 深藏青墨色

const BLOB_RADIUS = "48.5% 51.5% 47% 53% / 47.5% 45% 55% 52.5%"; // 原站画板近似弧形
const EASE = [0.22, 1, 0.36, 1];
/* ============ 配置结束 ============ */

function pad2(n) {
  return String(n).padStart(2, "0");
}

/* ----------------------------------------------------------------------------
 * Preloader —— 对应原站：百分比计数 → ENTER SITE（仪式化入口）
 * -------------------------------------------------------------------------- */
function Preloader({ onEnter }) {
  const [n, setN] = useState(0);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const t0 = performance.now();
    let raf;
    const tick = (t) => {
      const p = Math.min(1, (t - t0) / 2200);
      setN(Math.round(p * 100));
      if (p < 1) raf = requestAnimationFrame(tick);
      else setReady(true);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
  return (
    <motion.div exit={{ opacity: 0 }} transition={{ duration: 0.6 }} className="absolute inset-0 z-40" style={{ background: PALETTE.bg }}>
      <div className="flex h-full w-full flex-col items-center justify-center">
        <p className="text-[64px] italic leading-none md:text-[92px]" style={{ fontFamily: VOYAGE_LIKE }}>
          {pad2(n)}%
        </p>
        <p className="mt-6 text-[11px] uppercase tracking-[0.4em] opacity-50">{SITE_TAG.replace(/[◦<>]/g, "").trim()}</p>
        <AnimatePresence>
          {ready && (
            <motion.button
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={onEnter}
              className="mt-12 cursor-pointer rounded-md border border-stone-900/20 bg-white px-14 py-3.5 text-[12px] font-semibold uppercase tracking-[0.34em] shadow-[0_10px_30px_rgba(28,25,23,0.10)] transition-transform hover:scale-[1.03] active:scale-[0.98]"
            >
              Enter Site
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

/* ----------------------------------------------------------------------------
 * IntroFilm —— 对应原站：片头影片序列（这里用场景图逐帧交叉淡化模拟影片）
 * 含 Skip Intro 与右下声音开关（原站同款位置）
 * -------------------------------------------------------------------------- */
function IntroFilm({ frames, onSkip, onEnd }) {
  const [f, setF] = useState(0);
  useEffect(() => {
    if (f >= frames.length) { const t = setTimeout(onEnd, 900); return () => clearTimeout(t); }
    const t = setTimeout(() => setF((v) => v + 1), 2400);
    return () => clearTimeout(t);
  }, [f, frames.length, onEnd]);
  const fr = frames[Math.min(f, frames.length - 1)];
  return (
    <motion.div exit={{ opacity: 0 }} className="absolute inset-0 z-30 flex items-center justify-center">
      <div className="absolute inset-0 flex items-center justify-center">
        <AnimatePresence mode="sync">
          {frames.map((fr2, i) => (
            <motion.img
              key={i}
              src={`${BASE}birthday/${fr2.img}`}
              alt=""
              initial={{ opacity: i === 0 ? 1 : 0 }}
              animate={{ opacity: f >= i ? 1 : 0 }}
              transition={{ duration: 0.9 }}
              className="absolute h-full w-full object-cover"
              style={{ objectPosition: fr2.pos }}
            />
          ))}
        </AnimatePresence>
      </div>
      {/* 引言文字（影片字幕位） */}
      <div className="absolute inset-0 flex items-center justify-center">
        <AnimatePresence mode="wait">
          {f === 0 && (
            <motion.p key="l1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }}
              className="text-[30px] leading-tight md:text-[40px]" style={{ fontFamily: VOYAGE_LIKE }}>
              Join us · 加入我们
            </motion.p>
          )}
          {f === 1 && (
            <motion.p key="l2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }}
              className="text-center text-[24px] leading-snug md:text-[32px]" style={{ fontFamily: VOYAGE_LIKE }}>
              一场为秋草准备的<br />生日庆典
            </motion.p>
          )}
          {f === 2 && (
            <motion.p key="l3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }}
              className="text-[26px] md:text-[34px]" style={{ fontFamily: VOYAGE_LIKE }}>
              在云海与海面之间
            </motion.p>
          )}
        </AnimatePresence>
      </div>
      {/* Skip Intro */}
      <button
        onClick={onSkip}
        className="absolute bottom-8 right-8 z-10 cursor-pointer rounded-md border border-stone-900/25 bg-white/80 px-6 py-2.5 text-[11px] font-semibold uppercase tracking-[0.26em] text-stone-900 backdrop-blur transition-transform hover:scale-[1.03]"
      >
        Skip Intro
      </button>
    </motion.div>
  );
}

/* ----------------------------------------------------------------------------
 * BaseIllustrationSlide —— 对应原站 BaseIllustrationSlide 组件
 * 圆形画板：以容器中心为原点绝对定位（translate(-50%,-50%)），
 * 由父级轨道的 translateX 横移切换；非当前画板缩小降透明
 * -------------------------------------------------------------------------- */
function IllustrationSlide({ panel, isCur, onClick, refCb }) {
  return (
    <motion.div
      ref={refCb}
      onClick={onClick}
      className="absolute left-1/2 top-1/2 shrink-0 cursor-pointer overflow-hidden"
      style={{
        width: "min(44vw, 470px)",
        height: "min(52vh, 420px)",
        borderRadius: BLOB_RADIUS,
        background: panel.tint,
        x: "-50%",
        y: "-50%",
        zIndex: isCur ? 2 : 1,
        transition: "opacity 0.5s ease, box-shadow 0.5s ease",
        opacity: isCur ? 1 : 0.5,
        boxShadow: isCur ? "0 30px 80px rgba(28,25,23,0.15)" : "none",
      }}
    >
      <img
        src={`${BASE}birthday/${panel.img}`}
        alt=""
        draggable={false}
        className="h-full w-full object-cover"
        style={{ objectPosition: panel.pos }}
      />
    </motion.div>
  );
}

/* ----------------------------------------------------------------------------
 * Hero —— 对应原站 Hero 组件（章节页头部）
 * Tag(微标签) → 标题(逐行结构化显现) → 副文案 → 花朵分隔 → INDEX 按钮
 * -------------------------------------------------------------------------- */
function ChapterHero({ chapter, onIndex }) {
  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center px-6 text-center">
      {/* Tag */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: EASE }}
        className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.34em]"
        style={{ color: `${PALETTE.ink}cc` }}
      >
        <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: PALETTE.ink }} />
        {chapter.tag}
        <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: PALETTE.ink }} />
      </motion.p>
      {/* 标题（原站 Hero_content：外层 opacity 包裹逐行显现） */}
      <h1 className="mt-5 leading-[1.08]" style={{ fontFamily: VOYAGE_LIKE, color: PALETTE.ink }}>
        {chapter.cn.split("\n").map((l, i) => (
          <motion.span
            key={l}
            className="block text-[13vw] md:text-[92px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 + i * 0.18, duration: 0.9, ease: EASE }}
          >
            {l}
          </motion.span>
        ))}
      </h1>
      {/* 副文案 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.85, duration: 0.8 }}
        className="mt-7 space-y-1 text-[13.5px] leading-[1.9]"
        style={{ color: `${PALETTE.ink}cc` }}
      >
        {chapter.sub.map((s) => <p key={s}>{s}</p>)}
      </motion.div>
      {/* 花朵分隔 */}
      <motion.div
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.05, duration: 0.6 }}
        className="mt-7 flex h-6 w-6 items-center justify-center"
      >
        <svg viewBox="0 0 24 24" className="h-6 w-6">
          {[0, 60, 120, 180, 240, 300].map((a) => (
            <ellipse key={a} cx="12" cy="6.5" rx="3" ry="5.5" fill="#e8915c" transform={`rotate(${a} 12 12)`} />
          ))}
          <circle cx="12" cy="12" r="2.4" fill="#f0c53c" />
        </svg>
      </motion.div>
      {/* INDEX 按钮（原站同款白底矩形 + ≡） */}
      <motion.button
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.7, ease: EASE }}
        onClick={onIndex}
        className="mt-9 inline-flex cursor-pointer items-center gap-3 rounded-md border px-6 py-2.5 text-[12px] font-semibold uppercase tracking-[0.22em] shadow-[0_10px_30px_rgba(28,25,23,0.10)] transition-colors hover:bg-white"
        style={{ borderColor: `${PALETTE.ink}44`, color: PALETTE.ink }}
      >
        Index
        <span className="flex flex-col gap-[4px]">
          <span className="block h-[1.5px] w-4" style={{ background: PALETTE.ink }} />
          <span className="block h-[1.5px] w-4" style={{ background: PALETTE.ink }} />
        </span>
      </motion.button>
    </div>
  );
}

/* ----------------------------------------------------------------------------
 * Menu —— 对应原站 Menu 组件：编号章节链接 + 社交外链 + 片头影片入口
 * -------------------------------------------------------------------------- */
function Menu({ open, onClose, onGo, cur }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-40 flex flex-col items-center justify-center"
          style={{ background: PALETTE.bg }}
        >
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-8 text-[10.5px] uppercase tracking-[0.4em] opacity-50"
          >
            Wonderland Index
          </motion.p>
          {CHAPTERS.map((c, i) => (
            <motion.button
              key={c.no}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.09, duration: 0.55, ease: EASE }}
              onClick={() => { onGo(i); onClose(); }}
              className="group flex w-[min(86%,560px)] cursor-pointer items-baseline gap-6 border-b px-3 py-4 text-left transition-colors"
              style={{ borderColor: `${PALETTE.ink}1e` }}
            >
              <span className="text-[12px] font-semibold" style={{ fontFamily: VOYAGE_LIKE }}>{c.no}</span>
              <span className="flex-1 text-[26px] leading-none transition-transform group-hover:translate-x-2" style={{ fontFamily: VOYAGE_LIKE }}>
                {c.en}
              </span>
              <span className="text-[11px] opacity-60">{c.cn} · 片头 {c.film}</span>
            </motion.button>
          ))}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-10 flex gap-6 text-[11px] uppercase tracking-[0.2em] opacity-60"
          >
            <span>Weibo</span><span>Instagram</span><span>Spotify</span>
          </motion.div>
          <button onClick={onClose} className="mt-8 cursor-pointer text-[11px] uppercase tracking-[0.3em] opacity-50 hover:opacity-100">
            ✕ Close
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ----------------------------------------------------------------------------
 * 主页：Enter → 片头 → 章节轮播（三个章节各含一组画板，←→ 切画板与章节）
 * ---------------------------------------------------------------------------- */
export default function WonderlandPage() {
  // stage: preloader → intro → main（对齐原站：Preloader → VideoModal 片头 → 主站）
  const [stage, setStage] = useState("preloader");
  const [menuOpen, setMenuOpen] = useState(false);
  // 调试直达：/wonderland?skip=1 → 跳过加载与片头，直接进主画廊
  const skipParam = useSearchParams()[0].get("skip");
  useEffect(() => {
    if (skipParam != null) setStage("main");
  }, [skipParam]);
  const [chapter, setChapter] = useState(0);
  const [panel, setPanel] = useState(0);
  const stripRef = useRef(null);
  const stripBoxRef = useRef(null);
  const [offset, setOffset] = useState(0);

  const ch = CHAPTERS[chapter];
  const panels = ch.panels;

  // 章内横移；走完 → 下一章；第一章往回 → 最后一章
  const step = useCallback(
    (dir) => {
      setChapter((c) => {
        let p = panel + dir;
        let nc = c;
        if (p >= panels.length) { nc = (c + 1) % CHAPTERS.length; p = 0; }
        if (p < 0) { nc = (c - 1 + CHAPTERS.length) % CHAPTERS.length; p = CHAPTERS[nc].panels.length - 1; }
        setPanel(p);
        return nc;
      });
    },
    [panel, panels.length],
  );
  const goToChapter = useCallback((c) => {
    setChapter(c);
    setPanel(0);
  }, []);

  // 画板居中偏移（BaseIllustrationSlide 同款：以中心为原点横移）
  const measure = useCallback(() => {
    const strip = stripRef.current;
    const box = stripBoxRef.current;
    if (!strip || !box || !strip.children.length) return;
    const w = strip.children[0].offsetWidth;
    const gap = 56;
    const center = box.clientWidth / 2;
    setOffset(center - (panel * (w + gap) + w / 2));
  }, [panel]);
  useEffect(() => {
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [measure, chapter]);

  // 键盘 ← →
  useEffect(() => {
    if (stage !== "main") return;
    const h = (e) => {
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [stage, step]);

  return (
    <main className="relative h-[100dvh] w-full overflow-hidden font-sans select-none" style={{ background: PALETTE.bg, color: PALETTE.ink }}>
      <Link
        to="/"
        aria-label="返回首页"
        className="fixed left-4 top-4 z-[60] inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] uppercase tracking-[0.15em] backdrop-blur transition-colors hover:bg-white/80 cursor-pointer"
        style={{ borderColor: `${PALETTE.ink}33`, color: PALETTE.ink }}
      >
        <span aria-hidden>←</span> 首页
      </Link>

      <AnimatePresence mode="wait">
        {stage === "preloader" && (
          <motion.div key="pre" exit={{ opacity: 0 }} transition={{ duration: 0.6 }} className="absolute inset-0 z-40">
            <Preloader onEnter={() => setStage("intro")} />
          </motion.div>
        )}

        {stage === "intro" && (
          <motion.div key="intro" exit={{ opacity: 0 }} className="absolute inset-0 z-30">
            <IntroFilm
              frames={CHAPTERS.map((c) => c.panels[0])}
              onSkip={() => setStage("main")}
              onEnd={() => setStage("main")}
            />
          </motion.div>
        )}

        {stage === "main" && (
          <motion.div key="main" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }} className="absolute inset-0 z-10">
            {/* 画板轨道（BaseIllustrationSlide 条带） */}
            <div ref={stripBoxRef} className="absolute inset-0 overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={chapter}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.45 }}
                  className="absolute inset-0"
                >
                  <div
                    ref={stripRef}
                    className="flex h-full items-center gap-14"
                    style={{ transform: `translateX(${offset}px)` }}
                  >
                    {panels.map((p, i) => (
                      <IllustrationSlide key={i} panel={p} isCur={i === panel} onClick={() => setPanel(i)} />
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* 章节标题（Hero 同构：微标签 + 大标题） */}
            <div className="pointer-events-none absolute inset-x-0 bottom-[110px] z-10 text-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={chapter}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.45, ease: EASE }}
                >
                  <p className="flex items-center justify-center gap-3 text-[11px] font-semibold uppercase tracking-[0.34em]" style={{ color: `${PALETTE.ink}cc` }}>
                    <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: PALETTE.ink }} />
                    {ch.en}
                    <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: PALETTE.ink }} />
                  </p>
                  <h1 className="mt-3 text-[40px] leading-none tracking-[0.08em] md:text-[52px]" style={{ fontFamily: VOYAGE_LIKE, color: PALETTE.ink }}>
                    {ch.cn}
                  </h1>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* 箭头（JFA 描边矩形同款） */}
            <div className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 gap-4">
              <button
                onClick={() => step(-1)}
                aria-label="上一块"
                className="flex h-10 w-12 cursor-pointer items-center justify-center rounded-md border text-[15px] transition-colors hover:bg-stone-900 hover:text-white"
                style={{ borderColor: `${PALETTE.ink}55`, color: PALETTE.ink }}
              >
                ←
              </button>
              <button
                onClick={() => step(1)}
                aria-label="下一块"
                className="flex h-10 w-12 cursor-pointer items-center justify-center rounded-md border text-[15px] transition-colors hover:bg-stone-900 hover:text-white"
                style={{ borderColor: `${PALETTE.ink}55`, color: PALETTE.ink }}
              >
                →
              </button>
            </div>

            {/* 计数器（章节号） */}
            <div className="absolute bottom-9 right-8 z-10 font-serif italic text-[15px]" style={{ color: PALETTE.ink }}>
              {pad2(chapter + 1)} <span className="opacity-50">/ {pad2(CHAPTERS.length)}</span>
            </div>

            {/* 右上汉堡 → 菜单 */}
            <button
              onClick={() => setMenuOpen(true)}
              aria-label="菜单"
              className="absolute right-6 top-6 z-10 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border"
              style={{ borderColor: `${PALETTE.ink}44` }}
            >
              <span className="flex flex-col gap-[5px]">
                <span className="block h-[1.5px] w-5" style={{ background: PALETTE.ink }} />
                <span className="block h-[1.5px] w-5" style={{ background: PALETTE.ink }} />
                <span className="block h-[1.5px] w-3" style={{ background: PALETTE.ink }} />
              </span>
            </button>
            <Menu open={menuOpen} onClose={() => setMenuOpen(false)} onGo={(c) => { setChapter(c); setPanel(0); }} cur={chapter} />

            {/* 左下声音开关（装饰位，原站在同位置） */}
            <div className="absolute bottom-8 left-6 z-10 flex h-10 w-10 items-center justify-center rounded-full border" style={{ borderColor: `${PALETTE.ink}44` }}>
              <span className="text-[11px]" style={{ color: PALETTE.ink }}>♪</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
