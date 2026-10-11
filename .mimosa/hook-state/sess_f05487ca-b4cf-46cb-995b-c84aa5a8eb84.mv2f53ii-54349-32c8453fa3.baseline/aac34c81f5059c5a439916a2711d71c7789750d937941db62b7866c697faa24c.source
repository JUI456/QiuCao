import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

/* 字母雨解谜：焦点字符选中后伸出细触须，勾住散落字母组成一个单词，
   停留 2 秒后整组熄灭，焦点再爬去下一个单词。全程字母不拼行。 */
const SENTENCE =
  "No matter how good others are, it's none of my business. No matter how bad you are, I will always be with you and support you";

/* 按空格拆成逐个浮现的词；标点不点亮，只保留字母 */
const WORDS = SENTENCE.split(/\s+/).map((text) => ({
  text,
  letters: [...text]
    .filter((c) => /[a-zA-Z]/.test(c))
    .map((c) => c.toUpperCase()),
}));

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*()[]{}";
const NUM_PARTICLES = 520;

/* 赛博朋克配色：青 + 品红霓虹，深色底 */
const BG = "#03060d";
const RAIN_COLOR = "rgba(105,215,240,0.28)";
const RAIN_BRIGHT = "rgba(255,84,214,0.46)";
const RAIN_TAIL = "rgba(45,190,235,0.10)";
const CYAN = "0,240,255"; // 主霓虹
const MAGENTA = "255,43,214"; // 副霓虹
const RISER_COUNT = 30; // 向上攀升的能量线数量
const PUSH_RADIUS = 110; // 指针推开字母的半径
const PUSH_FORCE = 2.6; // 推开力度

const HOLD_MS = 1000; // 单词停留
const OUT_MS = 240; // 熄灭时长
const TENTACLE_MS = 180; // 单根触须生长
const TENTACLE_STAGGER = 80; // 触须错开间隔

const randomChar = () => CHARS[Math.floor(Math.random() * CHARS.length)];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
const easeInOutCubic = (t) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

/* 以 (0,0) 为心绘制爱心路径，size 控制整体缩放 */
function heartPath(ctx, size) {
  const s = size / 16;
  ctx.beginPath();
  for (let t = 0; t <= Math.PI * 2 + 0.1; t += 0.12) {
    const hx = 16 * Math.pow(Math.sin(t), 3);
    const hy =
      13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
    const px = hx * s;
    const py = -hy * s; // 翻转使尖朝下
    if (t === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
}

export default function DecryptGame() {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const [wordIdx, setWordIdx] = useState(0);
  const [done, setDone] = useState(false);
  const [runKey, setRunKey] = useState(0); // 重启动画用
  const doneRef = useRef(false);
  const frameRef = useRef(null);
  const endTimerRef = useRef(null);

  /* 「不爱了」被点后，只有该按钮自己躲避鼠标，弹窗主体不动 */
  const [fleeing, setFleeing] = useState(false);
  const [flee, setFlee] = useState({ x: 0, y: 0 });
  const notLoveRef = useRef(null);

  useEffect(() => {
    if (!fleeing) return;
    const onMove = (e) => {
      const el = notLoveRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.hypot(dx, dy) || 1;
      if (dist < 110) {
        const dirx = -dx / dist;
        const diry = -dy / dist;
        setFlee({
          x: clamp(dirx * 190 + (Math.random() - 0.5) * 50, -190, 190),
          y: clamp(diry * 150 + (Math.random() - 0.5) * 50, -130, 130),
        });
      }
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("touchmove", onMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchmove", onMove);
    };
  }, [fleeing]);

  /* 点击「还爱」：小红心掉落 + 旋转一圈汇聚成一个大红心 */
  const [loveBurst, setLoveBurst] = useState(false);
  const loveCanvasRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!loveBurst) return;
    const cv = loveCanvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    let W = (cv.width = window.innerWidth);
    let H = (cv.height = window.innerHeight);
    const RED = "255,40,70"; // 红色系
    const N = 80;
    const parts = Array.from({ length: N }, () => ({
      ang: Math.random() * Math.PI * 2,
      radScatter: 0.4 * Math.min(W, H) + Math.random() * 0.55 * Math.min(W, H),
      spin: 0.6 + Math.random() * 0.8, // 旋转速度系数
      size: 5 + Math.random() * 11,
    }));
    const DUR = 2600;
    const start = performance.now();
    let raf;
    const frame = (now) => {
      const p = Math.min(1, (now - start) / DUR);
      ctx.clearRect(0, 0, W, H);
      const cxp = W / 2;
      const cyp = H / 2;
      const globalRot = p * Math.PI * 2; // 整体转一整圈
      const gather = p > 0.25 ? easeInOutCubic((p - 0.25) / 0.75) : 0; // 0.25 后收拢
      for (const pt of parts) {
        const ang = pt.ang + globalRot * (pt.spin / 0.7);
        // 先散开（半径 0→radScatter 布满屏幕），再汇聚（radScatter→0）
        const r =
          p < 0.25
            ? pt.radScatter * easeOutCubic(p / 0.25)
            : pt.radScatter * (1 - gather);
        const x = cxp + Math.cos(ang) * r;
        const y = cyp + Math.sin(ang) * r;
        const sz = pt.size * (0.6 + 0.4 * gather);
        const alpha = p < 0.25 ? 0.5 + 0.4 * (p / 0.25) : 0.6 + 0.4 * gather;
        const glow = p < 0.25 ? p / 0.25 : gather;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(ang + Math.PI / 2);
        ctx.fillStyle = `rgba(${RED},${alpha})`;
        ctx.shadowColor = `rgba(${RED},0.8)`;
        ctx.shadowBlur = 12 * glow;
        heartPath(ctx, sz);
        ctx.fill();
        ctx.restore();
      }
      // 最后绽放大红心
      if (p > 0.7) {
        const s = easeInOutCubic((p - 0.7) / 0.3);
        ctx.save();
        ctx.translate(cxp, cyp);
        ctx.fillStyle = `rgba(${RED},${s})`;
        ctx.shadowColor = `rgba(${RED},0.9)`;
        ctx.shadowBlur = 30 * s;
        heartPath(ctx, 12 + s * 160);
        ctx.fill();
        ctx.restore();
      }
      if (p < 1) {
        raf = requestAnimationFrame(frame);
      } else {
        setTimeout(() => navigate("/"), 750);
      }
    };
    raf = requestAnimationFrame(frame);
    const onResize = () => {
      W = cv.width = window.innerWidth;
      H = cv.height = window.innerHeight;
    };
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, [loveBurst, navigate]);

  useEffect(() => {
    doneRef.current = false;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);

    /* 字母雨 */
    particlesRef.current = Array.from({ length: NUM_PARTICLES }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.25,
      speed: 0.28 + Math.random() * 0.55,
      char: randomChar(),
      switch: Math.floor(Math.random() * 26),
      size: 12 + Math.random() * 6,
      stay: false,
      stable: false,
      bright: Math.random() < 0.07,
      lit: false,
      pvx: 0, // 被指针推开的瞬时速度
      pvy: 0,
      glow: 0, // 被触碰后的短暂发亮
    }));

    /* ---------- 指针 / 触摸交互：推开雨幕 ---------- */
    const pointer = {
      x: -999,
      y: -999,
      vx: 0,
      vy: 0,
      active: false,
      hasPrev: false,
    };
    const ripples = [];
    let lastRipple = { x: -999, y: -999 };

    const onMove = (e) => {
      const t = e.touches && e.touches[0];
      const cx = t ? t.clientX : e.clientX;
      const cy = t ? t.clientY : e.clientY;
      if (pointer.hasPrev) {
        pointer.vx = clamp(cx - pointer.x, -26, 26);
        pointer.vy = clamp(cy - pointer.y, -26, 26);
      }
      pointer.x = cx;
      pointer.y = cy;
      pointer.active = true;
      pointer.hasPrev = true;
      if (
        lastRipple.x < -900 ||
        Math.hypot(cx - lastRipple.x, cy - lastRipple.y) > 18
      ) {
        ripples.push({
          x: cx,
          y: cy,
          life: 26,
          maxLife: 26,
          hue: Math.random() < 0.25 ? MAGENTA : CYAN,
        });
        if (ripples.length > 26) ripples.shift();
        lastRipple = { x: cx, y: cy };
      }
    };
    const onLeave = () => {
      pointer.active = false;
      pointer.x = -999;
      pointer.y = -999;
      pointer.hasPrev = false;
      lastRipple = { x: -999, y: -999 };
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("touchstart", onMove, { passive: true });
    window.addEventListener("touchmove", onMove, { passive: true });
    window.addEventListener("touchend", onLeave, { passive: true });
    window.addEventListener("touchcancel", onLeave, { passive: true });
    document.addEventListener("mouseleave", onLeave);

    const handleResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    /* ---------- 单词粒子挑选：散落但彼此不太远，优先勾选本来就有的字母 ---------- */
    const pickWordParticles = (word) => {
      const chars = [...word];
      const free = () =>
        particlesRef.current.filter(
          (p) =>
            !p.stay &&
            p.x > w * 0.1 &&
            p.x < w * 0.9 &&
            p.y > h * 0.12 &&
            p.y < h * 0.88,
        );
      for (let R = Math.min(w, h) * 0.42; R < Math.max(w, h) * 2; R *= 1.4) {
        const pool = free();
        for (let attempt = 0; attempt < 140; attempt++) {
          // 焦点字母优先选本来就有的
          const fpPool = pool.filter((p) => p.char === chars[0]);
          const fp =
            (fpPool.length
              ? fpPool[(Math.random() * fpPool.length) | 0]
              : pool[(Math.random() * pool.length) | 0]) || pool[0];
          if (!fp) return chars.map(() => pool[0]).filter(Boolean);
          const chosen = [fp];
          let ok = true;
          for (let i = 1; i < chars.length; i++) {
            const near = pool.filter(
              (p) => !chosen.includes(p) && Math.hypot(p.x - fp.x, p.y - fp.y) < R,
            );
            const exact = near.filter((p) => p.char === chars[i]);
            const pick = exact.length
              ? exact[(Math.random() * exact.length) | 0]
              : near[(Math.random() * near.length) | 0];
            if (!pick) {
              ok = false;
              break;
            }
            chosen.push(pick);
          }
          if (ok) return chosen;
        }
      }
      const pool = free();
      return chars.map(() => pool[(Math.random() * pool.length) | 0]);
    };

    /* ---------- 阶段状态机 ---------- */
    let wordIdxLocal = 0;
    let phase = "travel"; // travel → grow → hold → out
    let phaseStart = performance.now();
    let travelDur = 600;
    let focus = { x: w * 0.5, y: h * 0.55 }; // 焦点虚拟点（爬行中的选中光标）
    let focusFrom = { x: focus.x, y: focus.y };
    let particles = []; // 当前单词的粒子（第 0 个是焦点）
    let tentacles = []; // { p, letter, start, isTarget, lit }
    let decorations = []; // 装饰触须端点（不点亮）
    let curStagger = TENTACLE_STAGGER;
    let holdStart = 0;
    const focusTrail = [];
    const bursts = [];

    /* ---------- 向上攀升的能量线（赛博朋克数据流） ---------- */
    const risers = Array.from({ length: RISER_COUNT }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      len: 90 + Math.random() * 320,
      sp: 1.1 + Math.random() * 3.2,
      width: Math.random() < 0.22 ? 2 : 1,
      a: 0.35 + Math.random() * 0.65,
      hue: Math.random() < 0.28 ? MAGENTA : CYAN,
    }));

    /* ---------- 扫描线纹理（预渲染，避免每帧大量描边） ---------- */
    const scanTile = document.createElement("canvas");
    scanTile.width = 1;
    scanTile.height = 4;
    const sctx = scanTile.getContext("2d");
    sctx.fillStyle = "rgba(0,0,0,0.18)";
    sctx.fillRect(0, 0, 1, 2);
    const scanPattern = ctx.createPattern(scanTile, "repeat");

    /* ---------- 故障（glitch）状态 ---------- */
    let glitchUntil = 0;
    let nextGlitch = ts0() + 1200 + Math.random() * 2200;
    function ts0() {
      return performance.now();
    }
    let glitchActive = false;

    const freeze = (p, char) => {
      p.stay = true;
      p.stable = true;
      if (char) p.char = char;
    };
    const unfreeze = (p) => {
      p.stay = false;
      p.stable = false;
      p.lit = false;
    };

    const beginWord = (ts) => {
      const word = WORDS[wordIdxLocal];
      particles = pickWordParticles(word.letters);
      particles.forEach((p) => freeze(p)); // 冻住待选字符（还是乱码样）
      focusFrom = { x: focus.x, y: focus.y };
      const target = particles[0];
      const dist = Math.hypot(target.x - focus.x, target.y - focus.y);
      travelDur = clamp(dist * 0.6, 280, 520);
      phase = "travel";
      phaseStart = ts;
      focusTrail.length = 0;
      setWordIdx(wordIdxLocal);
    };

    const endAll = () => {
      if (doneRef.current) return;
      doneRef.current = true;
      setWordIdx(WORDS.length);
      endTimerRef.current = setTimeout(() => setDone(true), 1200);
    };

    beginWord(phaseStart);

    let last = performance.now();

    const loop = (ts) => {
      const dt = Math.min(ts - last, 40);
      last = ts;

      ctx.fillStyle = BG;
      ctx.fillRect(0, 0, w, h);
      const vg = ctx.createRadialGradient(w * 0.5, h * 0.5, 40, w * 0.5, h * 0.5, Math.max(w, h) * 0.72);
      vg.addColorStop(0, "rgba(40,80,160,0.10)");
      vg.addColorStop(1, "rgba(0,0,0,0.28)");
      ctx.fillStyle = vg;
      ctx.fillRect(0, 0, w, h);

      /* 故障节奏：偶发触发 */
      if (ts > nextGlitch) {
        glitchUntil = ts + 60 + Math.random() * 90;
        nextGlitch = ts + 9000 + Math.random() * 11000;
      }
      glitchActive = ts < glitchUntil;

      /* ---------- 底部能量光带（数据从下往上涌） ---------- */
      const floor = ctx.createLinearGradient(0, h, 0, h * 0.62);
      floor.addColorStop(0, `rgba(${CYAN},0.16)`);
      floor.addColorStop(0.45, `rgba(${CYAN},0.04)`);
      floor.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = floor;
      ctx.fillRect(0, h * 0.62, w, h * 0.38);
      ctx.fillStyle = `rgba(${CYAN},0.35)`;
      ctx.fillRect(0, h - 2, w, 2);

      /* ---------- 向上攀升的发光线条 ---------- */
      ctx.lineCap = "butt";
      risers.forEach((r) => {
        r.y -= r.sp * (dt / 16.7);
        if (r.y + r.len < -30) {
          r.y = h + Math.random() * 120;
          r.x = Math.random() * w;
          r.len = 90 + Math.random() * 320;
          r.hue = Math.random() < 0.28 ? MAGENTA : CYAN;
        }
        const grad = ctx.createLinearGradient(0, r.y - r.len, 0, r.y);
        grad.addColorStop(0, `rgba(${r.hue},0)`);
        grad.addColorStop(0.7, `rgba(${r.hue},${0.1 * r.a})`);
        grad.addColorStop(1, `rgba(${r.hue},${0.34 * r.a})`);
        ctx.strokeStyle = grad;
        ctx.lineWidth = r.width;
        ctx.beginPath();
        ctx.moveTo(r.x, r.y - r.len);
        ctx.lineTo(r.x, r.y);
        ctx.stroke();
        // 顶端能量点 + 一小段拖影
        ctx.fillStyle = `rgba(${r.hue},${0.75 * r.a})`;
        ctx.shadowColor = `rgba(${r.hue},0.9)`;
        ctx.shadowBlur = 8;
        ctx.fillRect(r.x - r.width / 2, r.y - 3, r.width, 3);
        ctx.shadowBlur = 0;
      });

      /* ---------- 雨滴更新与绘制 ---------- */
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      particlesRef.current.forEach((p) => {
        if (p.stay && p.lit) return; // 已点亮的由高亮分支绘制
        if (!p.stay) {
          // 指针 / 手指经过时把字母推开并点亮
          if (pointer.active) {
            const dxR = p.x - pointer.x;
            const dyR = p.y - pointer.y;
            const dR = Math.hypot(dxR, dyR) || 1;
            if (dR < PUSH_RADIUS) {
              const f = 1 - dR / PUSH_RADIUS;
              p.pvx += (dxR / dR) * f * f * PUSH_FORCE + pointer.vx * f * 0.22;
              p.pvy += (dyR / dR) * f * f * PUSH_FORCE + pointer.vy * f * 0.22;
              p.glow = Math.min(1, p.glow + f * 0.55);
            }
          }
          p.x += p.pvx;
          p.y += p.pvy;
          p.pvx *= 0.9; // 阻尼，推开会缓慢停下
          p.pvy *= 0.9;
          p.glow *= 0.93;
          p.y += p.speed;
          p.x += p.vx + Math.sin(ts / 2400 + p.y * 0.008) * 0.04;
          if (p.y > h + 24) {
            p.y = -24;
            p.x = Math.random() * w;
            if (!p.stable) p.char = randomChar();
          }
          if (p.x < 6) p.x = w - 6;
          if (p.x > w - 6) p.x = 6;
          if (--p.switch <= 0) {
            if (!p.stable) p.char = randomChar();
            p.switch = 14 + Math.floor(Math.random() * 26);
          }
        }
        const g = p.glow;
        ctx.font = `${p.size * (1 + g * 0.28)}px "Inter", monospace`;
        if (g > 0.03) {
          ctx.fillStyle = `rgba(200,252,255,${0.32 + 0.62 * g})`;
          ctx.shadowColor = `rgba(${CYAN},0.95)`;
          ctx.shadowBlur = 14 * g;
        } else {
          ctx.fillStyle = p.bright ? RAIN_BRIGHT : RAIN_COLOR;
        }
        ctx.fillText(p.char, p.x, p.y);
        ctx.shadowBlur = 0;
        const tail = 6 + (p.size - 12) * 0.9;
        ctx.strokeStyle = g > 0.03 ? `rgba(${CYAN},${0.12 + 0.2 * g})` : RAIN_TAIL;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y - tail);
        ctx.lineTo(p.x, p.y + tail);
        ctx.stroke();
      });

      /* ---------- 指针涟漪 ---------- */
      pointer.vx *= 0.85;
      pointer.vy *= 0.85;
      for (let i = ripples.length - 1; i >= 0; i--) {
        const rp = ripples[i];
        rp.life--;
        if (rp.life <= 0) {
          ripples.splice(i, 1);
          continue;
        }
        const t = 1 - rp.life / rp.maxLife;
        ctx.beginPath();
        ctx.arc(rp.x, rp.y, 6 + t * 78, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${rp.hue},${0.32 * (1 - t)})`;
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }

      /* ---------- 状态机 ---------- */
      if (!doneRef.current) {
        const letters = WORDS[wordIdxLocal].letters;

        if (phase === "travel") {
          const t = clamp((ts - phaseStart) / travelDur, 0, 1);
          const e = easeOutCubic(t);
          focus.x = focusFrom.x + (particles[0].x - focusFrom.x) * e;
          focus.y = focusFrom.y + (particles[0].y - focusFrom.y) * e;
          focusTrail.push({ x: focus.x, y: focus.y });
          if (focusTrail.length > 26) focusTrail.shift();
          if (t >= 1) {
            // 到位：选中焦点字符
            freeze(particles[0], letters[0]);
            particles[0].lit = true;
            bursts.push({ x: focus.x, y: focus.y, life: 20, r0: 10 });
            // 长单词压缩触须错开间隔，避免拖太久
            const n = Math.max(1, particles.length - 1);
            curStagger = n > 6 ? Math.max(45, 520 / n) : TENTACLE_STAGGER;
            // 建立触须：目标触须 + 装饰触须
            tentacles = [];
            for (let i = 1; i < particles.length; i++) {
              tentacles.push({
                p: particles[i],
                letter: letters[i],
                start: ts + (i - 1) * curStagger,
                isTarget: true,
                lit: false,
              });
            }
            decorations = particlesRef.current
              .filter(
                (p) =>
                  !p.stay &&
                  !particles.includes(p) &&
                  Math.hypot(p.x - focus.x, p.y - focus.y) > 80 &&
                  Math.hypot(p.x - focus.x, p.y - focus.y) < 240,
              )
              .sort(() => Math.random() - 0.5)
              .slice(0, 4);
            phase = "grow";
            phaseStart = ts;
          }
        } else if (phase === "grow") {
          tentacles.forEach((tn) => {
            if (!tn.lit && ts >= tn.start + TENTACLE_MS) {
              freeze(tn.p, tn.letter);
              tn.p.lit = true;
              tn.lit = true;
              bursts.push({ x: tn.p.x, y: tn.p.y, life: 20, r0: 10 });
            }
          });
          const totalTentacles = tentacles.length + decorations.length;
          if (ts - phaseStart > totalTentacles * curStagger + TENTACLE_MS + 60) {
            phase = "hold";
            holdStart = ts;
          }
        } else if (phase === "hold") {
          if (ts - holdStart > HOLD_MS) {
            phase = "out";
            phaseStart = ts;
          }
        } else if (phase === "out") {
          if (ts - phaseStart > OUT_MS) {
            particles.forEach(unfreeze);
            tentacles.forEach((tn) => unfreeze(tn.p));
            particles = [];
            tentacles = [];
            decorations = [];
            wordIdxLocal++;
            if (wordIdxLocal < WORDS.length) {
              beginWord(ts);
            } else {
              endAll();
            }
          }
        }
      }

      const outAlpha =
        phase === "out" ? clamp(1 - (ts - phaseStart) / OUT_MS, 0, 1) : 1;

      /* ---------- 装饰触须（淡，连到附近未选中的字符） ---------- */
      if (phase === "grow" || phase === "hold" || phase === "out") {
        decorations.forEach((p, i) => {
          const start = phaseStart + i * curStagger;
          const t = clamp((ts - start) / TENTACLE_MS, 0, 1);
          if (t <= 0) return;
          ctx.strokeStyle = `rgba(170,205,245,${0.16 * t * outAlpha})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(focus.x, focus.y);
          ctx.lineTo(p.x, p.y);
          ctx.stroke();
        });
      }

      /* ---------- 目标触须：从焦点放射出的细直线 ---------- */
      if (phase === "grow" || phase === "hold" || phase === "out") {
        tentacles.forEach((tn) => {
          const t = clamp((ts - tn.start) / TENTACLE_MS, 0, 1);
          if (t <= 0) return;
          const ex = focus.x + (tn.p.x - focus.x) * easeOutCubic(t);
          const ey = focus.y + (tn.p.y - focus.y) * easeOutCubic(t);
          ctx.strokeStyle = `rgba(190,250,255,${0.6 * t * outAlpha})`;
          ctx.lineWidth = 1.2;
          ctx.shadowColor = `rgba(${CYAN},0.85)`;
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.moveTo(focus.x, focus.y);
          ctx.lineTo(ex, ey);
          ctx.stroke();
          ctx.shadowBlur = 0;
        });
      }

      /* ---------- 焦点光标爬行尾迹 ---------- */
      if (phase === "travel") {
        for (let i = 1; i < focusTrail.length; i++) {
          const q = i / focusTrail.length;
          ctx.strokeStyle = `rgba(${CYAN},${0.3 * q})`;
          ctx.lineWidth = 1.3;
          ctx.beginPath();
          ctx.moveTo(focusTrail[i - 1].x, focusTrail[i - 1].y);
          ctx.lineTo(focusTrail[i].x, focusTrail[i].y);
          ctx.stroke();
        }
        // 移动中的小亮点
        ctx.fillStyle = "#e8f6ff";
        ctx.shadowColor = "rgba(150,215,255,0.95)";
        ctx.shadowBlur = 14;
        ctx.beginPath();
        ctx.arc(focus.x, focus.y, 3.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      /* ---------- 选中态：焦点字符（霓虹青，故障时带品红色差） ---------- */
      if ((phase === "grow" || phase === "hold" || phase === "out") && particles[0]) {
        const fp = particles[0];
        ctx.beginPath();
        ctx.arc(fp.x, fp.y, 30, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${CYAN},${0.16 * outAlpha})`;
        ctx.fill();
        drawNeon(fp.char, fp.x, fp.y, 38, outAlpha);
        // 被触须勾住的目标字母
        tentacles.forEach((tn) => {
          if (!tn.lit) return;
          const p = tn.p;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 24, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${CYAN},${0.13 * outAlpha})`;
          ctx.fill();
          drawNeon(p.char, p.x, p.y, 32, outAlpha);
        });
      }

      function drawNeon(ch, x, y, size, alpha) {
        ctx.font = `bold ${size}px "Inter", monospace`;
        if (glitchActive) {
          ctx.globalCompositeOperation = "lighter";
          ctx.fillStyle = `rgba(${MAGENTA},${0.4 * alpha})`;
          ctx.fillText(ch, x - 2, y);
          ctx.fillStyle = `rgba(${CYAN},${0.4 * alpha})`;
          ctx.fillText(ch, x + 2, y);
          ctx.globalCompositeOperation = "source-over";
        }
        ctx.fillStyle = `rgba(242,253,255,${alpha})`;
        ctx.shadowColor = `rgba(${CYAN},0.95)`;
        ctx.shadowBlur = 24;
        ctx.fillText(ch, x, y);
        ctx.shadowBlur = 0;
      }

      /* ---------- 闪光 ---------- */
      for (let i = bursts.length - 1; i >= 0; i--) {
        const b = bursts[i];
        b.life--;
        if (b.life <= 0) {
          bursts.splice(i, 1);
          continue;
        }
        const a = b.life / 20;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r0 + (20 - b.life) * 1.8, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(160,220,255,${0.7 * a})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      /* ---------- 故障艺术：水平切片位移 + 色差 ---------- */
      if (glitchActive) {
        const slices = 1 + ((Math.random() * 2) | 0);
        for (let i = 0; i < slices; i++) {
          const sh = 8 + Math.random() * 24;
          const sy = Math.random() * (h - sh);
          const dx = (Math.random() - 0.5) * 12;
          ctx.drawImage(canvas, 0, sy, w, sh, dx, sy, w, sh);
          ctx.globalCompositeOperation = "lighter";
          ctx.fillStyle =
            Math.random() < 0.5
              ? `rgba(${CYAN},0.05)`
              : `rgba(${MAGENTA},0.05)`;
          ctx.fillRect(dx, sy, w, sh);
          ctx.globalCompositeOperation = "source-over";
        }
      }

      /* ---------- 扫描线 + 噪点 + 暗角（CRT 质感） ---------- */
      ctx.fillStyle = scanPattern;
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "rgba(255,255,255,0.018)";
      for (let i = 0; i < 8; i++) {
        ctx.fillRect(Math.random() * w, Math.random() * h, 1, 1);
      }
      const vig = ctx.createRadialGradient(
        w * 0.5,
        h * 0.5,
        Math.min(w, h) * 0.32,
        w * 0.5,
        h * 0.5,
        Math.max(w, h) * 0.8,
      );
      vig.addColorStop(0, "rgba(0,0,0,0)");
      vig.addColorStop(1, "rgba(0,0,0,0.55)");
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, w, h);

      frameRef.current = requestAnimationFrame(loop);
    };

    frameRef.current = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(frameRef.current);
      if (endTimerRef.current) clearTimeout(endTimerRef.current);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchstart", onMove);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onLeave);
      window.removeEventListener("touchcancel", onLeave);
      document.removeEventListener("mouseleave", onLeave);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runKey]);

  const restart = () => {
    setDone(false);
    doneRef.current = false;
    setWordIdx(0);
    setRunKey((k) => k + 1);
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#03060d]">
      <canvas ref={canvasRef} className="block w-full h-full" />

      <div className="absolute top-0 left-0 right-0 p-6 md:p-10 flex justify-between items-start pointer-events-none">
        <Link
          to="/"
          className="pointer-events-auto text-sm font-medium tracking-widest uppercase text-cyan-100/70 hover:text-fuchsia-200 drop-shadow-[0_0_8px_rgba(0,240,255,0.5)]"
        >
          ← 返回
        </Link>
        <div className="text-right max-w-[320px]">
          <p className="text-xs text-fuchsia-300/70 tracking-[0.35em] uppercase mb-1 drop-shadow-[0_0_10px_rgba(255,43,214,0.6)]">
            数据流 · 触须勾字
          </p>
          <p className="text-sm text-cyan-100/80 font-medium tracking-wide">
            看清楚被点亮的字母了吗
          </p>
        </div>
      </div>

      {/* 底部：只显示进度，不剧透句子内容 */}
      <div className="absolute bottom-6 left-0 right-0 px-4 flex justify-center pointer-events-none">
        <div className="flex flex-col items-center gap-2.5 px-6 py-3.5 bg-[#03060d]/70 backdrop-blur rounded-2xl border border-cyan-300/20 shadow-[0_0_28px_rgba(0,240,255,0.14)]">
          <span className="text-[11px] sm:text-xs text-cyan-200/70 tracking-[0.3em] uppercase">
            {String(Math.min(wordIdx + 1, WORDS.length)).padStart(2, "0")} /{" "}
            {WORDS.length} 个词
          </span>
          <div className="w-48 sm:w-56 h-[3px] rounded-full bg-cyan-300/10 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-300 via-cyan-200 to-fuchsia-400 shadow-[0_0_10px_rgba(0,240,255,0.85)] transition-[width] duration-500 ease-out"
              style={{
                width: `${((done ? WORDS.length : wordIdx + 1) / WORDS.length) * 100}%`,
              }}
            />
          </div>
        </div>
      </div>

      {done && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm pointer-events-auto">
          <div className="text-center px-10 py-12 rounded-2xl border border-white/10 bg-[#04070f]/90 max-w-sm mx-4">
            <p className="text-xl sm:text-2xl font-medium leading-relaxed text-slate-100 drop-shadow-[0_0_12px_rgba(0,240,255,0.35)] mb-8">
              不爱我了吗
              <span className="block mt-1.5 text-slate-400 text-base sm:text-lg font-normal">
                还没猜对？
              </span>
            </p>
            <div className="flex items-center justify-center gap-6">
              <button
                type="button"
                onClick={() => setLoveBurst(true)}
                className="text-sm text-slate-500 hover:text-slate-200 transition-colors"
              >
                还爱
              </button>
              <span className="w-px h-3.5 bg-white/10" />
              <button
                ref={notLoveRef}
                type="button"
                onClick={() => setFleeing(true)}
                style={{
                  transform: `translate(${flee.x}px, ${flee.y}px)`,
                  transition: fleeing ? "transform 0.25s ease-out" : "none",
                }}
                className="text-sm text-cyan-200/80 hover:text-cyan-100 transition-colors"
              >
                不爱了
              </button>
            </div>
          </div>
        </div>
      )}

      {loveBurst && (
        <canvas
          ref={loveCanvasRef}
          className="fixed inset-0 z-50"
          style={{ width: "100vw", height: "100vh" }}
        />
      )}
    </div>
  );
}
