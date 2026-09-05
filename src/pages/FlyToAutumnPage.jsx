// Between Us —— 世界地图 · 一架纸飞机在「杭州 ⇄ 宁平」之间往返
// 没有任何一座我们“去过”的城市：全图只有两个被点亮的坐标，和中间隔着的海。
// 想改：CITY_A / CITY_B 改坐标，ROUTE 改航线，COPY_* 改文案。
import { useState, useEffect, useRef, useCallback, memo } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../components/Navbar";
import { warmMessages } from "../components/HeartPopups";

const RED = "#b91c1c";
const HEART_D =
  "M0,8 C-10,-2 -22,-17 -8,-22 C2,-25 0,-10 0,-10 C0,-10 -2,-25 8,-22 C22,-17 10,-2 0,8 Z";

/* ---------------- 瓶中信（文案来自爱心页 warmMessages，随机一句） · 本班载货 ---------------- */
const CARGO_ITEMS = [
  "一枚刚剥好的橘子——剥到一半想你，就忘了吃。",
  "昨晚的月亮，我先替你看了。",
  "一朵晒干的桂花，把杭州的秋天寄给你。",
  "一杯热茶的功夫，正好够想完一整遍你。",
  "两行没写完的信，先让飞机帮你捎一半。",
  "绕远路也甘愿的思念。",
];
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

/* ---------------- 两地实时天气（open-meteo · 免费无 key；断网时自动隐藏） ---------------- */
const WMO = {
  0: ["☀", "晴"],
  1: ["🌤", "大部晴朗"],
  2: ["⛅", "多云"],
  3: ["☁", "阴"],
  45: ["🌫", "雾"],
  48: ["🌫", "雾凇"],
  51: ["🌦", "毛毛雨"],
  53: ["🌦", "毛毛雨"],
  55: ["🌦", "毛毛雨"],
  56: ["🌧", "冻毛毛雨"],
  57: ["🌧", "冻毛毛雨"],
  61: ["🌧", "小雨"],
  63: ["🌧", "雨"],
  65: ["🌧", "大雨"],
  66: ["🌧", "冻雨"],
  67: ["🌧", "冻雨"],
  71: ["🌨", "小雪"],
  73: ["🌨", "雪"],
  75: ["❄", "大雪"],
  77: ["❄", "雪粒"],
  80: ["🌦", "阵雨"],
  81: ["🌧", "阵雨"],
  82: ["⛈", "强阵雨"],
  85: ["🌨", "阵雪"],
  86: ["🌨", "阵雪"],
  95: ["⛈", "雷阵雨"],
  96: ["⛈", "雷阵雨"],
  99: ["⛈", "冰雹雷雨"],
};
const fmtWeather = (w) => {
  if (!w || !w.ok) return null;
  const [icon, label] = WMO[w.code] || ["🌡", "天气"];
  return `${w.temp}° ${icon} ${label}`;
};

/* ---------------- 坐标 & 航线（viewBox 1600 × 1000） ---------------- */
const CITY_A = [1390, 340]; // 杭州 · 我的坐标（中国东海岸）
const CITY_B = [1050, 760]; // 宁平 · 你的坐标（越南）
const [P0, C1, C2, P1] = [
  CITY_A,
  [1460, 560],
  [1200, 700],
  CITY_B,
]; // 三次贝塞尔：出海 → 跨海 → 靠岸

/* ---------------- 手绘陆地（示意，比例按想念调整） ---------------- */
const LAND_PRIMARY = [
  // 中国所在的大陆（被我画得大一点）
  [
    [830, 130],
    [1000, 85],
    [1220, 70],
    [1430, 90],
    [1580, 130],
    [1600, 200],
    [1560, 275],
    [1600, 365],
    [1540, 455],
    [1470, 520],
    [1400, 570],
    [1320, 592],
    [1290, 562],
    [1250, 600],
    [1195, 572],
    [1130, 608],
    [1060, 572],
    [1000, 540],
    [955, 565],
    [915, 505],
    [885, 435],
    [872, 370],
    [890, 310],
    [858, 255],
    [872, 200],
    [838, 150],
  ],
  // 越南（隔海相望的那一片）
  [
    [930, 660],
    [1040, 620],
    [1140, 660],
    [1210, 720],
    [1220, 800],
    [1160, 860],
    [1080, 890],
    [1000, 860],
    [950, 800],
    [920, 730],
  ],
];

const LAND_FAINT = [
  // 欧洲
  [
    [520, 170],
    [620, 140],
    [720, 150],
    [780, 200],
    [760, 260],
    [680, 290],
    [590, 270],
    [530, 230],
  ],
  // 北美洲
  [
    [70, 200],
    [170, 120],
    [300, 110],
    [390, 170],
    [370, 240],
    [320, 280],
    [260, 330],
    [200, 330],
    [160, 290],
    [110, 260],
  ],
  // 南美洲
  [
    [150, 560],
    [240, 535],
    [320, 580],
    [360, 660],
    [340, 760],
    [300, 860],
    [260, 940],
    [215, 900],
    [180, 800],
    [145, 700],
  ],
  // 非洲
  [
    [380, 320],
    [470, 280],
    [560, 300],
    [650, 350],
    [700, 410],
    [660, 480],
    [620, 560],
    [560, 620],
    [500, 660],
    [430, 640],
    [395, 580],
    [370, 500],
    [360, 420],
    [345, 365],
  ],
  // 澳洲
  [
    [1380, 860],
    [1470, 835],
    [1540, 880],
    [1560, 940],
    [1500, 985],
    [1425, 975],
    [1385, 930],
  ],
];

/* ---------------- 海域判定：瓶子只在海上随机漂，绝不穿模进陆地 ---------------- */
const ALL_LAND = [...LAND_PRIMARY, ...LAND_FAINT];

function inPoly(x, y, pts) {
  let inside = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const xi = pts[i][0], yi = pts[i][1];
    const xj = pts[j][0], yj = pts[j][1];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}
function inAnyLand(x, y) {
  for (let k = 0; k < ALL_LAND.length; k++) if (inPoly(x, y, ALL_LAND[k])) return true;
  return false;
}
// 瓶身整体都必须在水里：留白 = 瓶身半径 + 漂浮幅度
const BOTTLE_MARGIN = 26;
function seaClear(x, y) {
  if (inAnyLand(x, y)) return false;
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2;
    if (inAnyLand(x + Math.cos(a) * BOTTLE_MARGIN, y + Math.sin(a) * BOTTLE_MARGIN)) return false;
  }
  return true;
}
function randomSeaPoint() {
  for (let i = 0; i < 240; i++) {
    const x = 60 + Math.random() * 1480;
    const y = 60 + Math.random() * 880;
    if (seaClear(x, y)) return [x, y];
  }
  return [1300, 500]; // 兜底：东海开阔水面
}
// 直线航线是否全程在水上（避免横穿大陆）
function segClear(a, b) {
  // 整条航线（含瓶身留白）都必须在水上，避免横穿大陆或贴岸
  const N = 10;
  for (let k = 0; k <= N; k++) {
    const t = k / N;
    if (!seaClear(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t)) return false;
  }
  return true;
}

const poly = (pts) =>
  "M" + pts.map((p) => `${p[0]},${p[1]}`).join("L") + "Z";

/* ---------------- 贝塞尔：位置 / 切线 ---------------- */
const cubicAt = (t) => {
  const u = 1 - t;
  return [
    u * u * u * P0[0] + 3 * u * u * t * C1[0] + 3 * u * t * t * C2[0] + t * t * t * P1[0],
    u * u * u * P0[1] + 3 * u * u * t * C1[1] + 3 * u * t * t * C2[1] + t * t * t * P1[1],
  ];
};
const cubicD = (t) => {
  const u = 1 - t;
  return [
    3 * u * u * (C1[0] - P0[0]) + 6 * u * t * (C2[0] - C1[0]) + 3 * t * t * (P1[0] - C2[0]),
    3 * u * u * (C1[1] - P0[1]) + 6 * u * t * (C2[1] - C1[1]) + 3 * t * t * (P1[1] - C2[1]),
  ];
};
const ROUTE_D = `M${P0[0]},${P0[1]} C${C1[0]},${C1[1]} ${C2[0]},${C2[1]} ${P1[0]},${P1[1]}`;

/* ---------------- 太阳 · 昼夜 ---------------- */
const HZ = { lat: 30.27, lon: 120.15, tz: 8 }; // 杭州（中国，UTC+8）
const NB = { lat: 20.25, lon: 105.97, tz: 7 }; // 宁平（越南，UTC+7）
const PX_PER_DEG = (CITY_A[0] - CITY_B[0]) / (HZ.lon - NB.lon); // 每 1° 经度 ≈ 多少像素
const PERIOD = 360 * PX_PER_DEG; // 画布上一个完整昼夜周期的像素宽度
const X_AT = (lon) => CITY_A[0] + (lon - HZ.lon) * PX_PER_DEG;
const LNG_AT = (x) => HZ.lon + (x - CITY_A[0]) / PX_PER_DEG;
const wrapX = (x) => ((x % PERIOD) + PERIOD) % PERIOD;

const rad = (d) => (d * Math.PI) / 180;
const norm24 = (v) => ((v % 24) + 24) % 24;

const nowUtcHours = () => {
  const d = new Date();
  return d.getUTCHours() + d.getUTCMinutes() / 60 + d.getUTCSeconds() / 3600;
};
const fmtClock = (h) => {
  const hh = Math.floor(h);
  const mm = Math.floor((h - hh) * 60);
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
};

// 太阳赤纬：随季节在 ±23.44° 之间
function solarDec(date) {
  const start = Date.UTC(date.getFullYear(), 0, 0);
  const doy = (date.getTime() - start) / 86400000;
  return 23.44 * Math.sin((2 * Math.PI * (doy - 80.5)) / 365);
}
const DEC = solarDec(new Date());

// 太阳高度角：> 0 是白天，< 0 是夜晚
function sunAlt(lat, lon, utcH, dec = DEC) {
  const H = rad((utcH + lon / 15 - 12) * 15);
  const s =
    Math.sin(rad(lat)) * Math.sin(rad(dec)) +
    Math.cos(rad(lat)) * Math.cos(rad(dec)) * Math.cos(H);
  return (Math.asin(Math.max(-1, Math.min(1, s))) * 180) / Math.PI;
}

// 当地日出 / 日落（时钟时间）
function sunTimes(lat, lon, tz, dec = DEC) {
  const c = -Math.tan(rad(lat)) * Math.tan(rad(dec));
  const H0 = Math.acos(Math.max(-1, Math.min(1, c))) * (180 / Math.PI);
  return {
    sunrise: norm24(12 - H0 / 15 - lon / 15 + tz),
    sunset: norm24(12 + H0 / 15 - lon / 15 + tz),
  };
}

// 画布某处的昼夜（按当地真太阳时：6 点日出、18 点日落）
const isNightAtX = (x, utcH) => {
  const ls = norm24(utcH + LNG_AT(x) / 15);
  return ls < 6 || ls > 18;
};

// 夜区在画布上的横向区间：日落线 → 日出线
function nightBands(utcH) {
  const xs = wrapX(X_AT(15 * (18 - utcH))); // 日落线
  const xr = wrapX(X_AT(15 * (30 - utcH))); // 日出线（次日 06:00）
  const segs = [];
  const push = (a, b) => {
    const lo = Math.max(a, 0);
    const hi = Math.min(b, 1600);
    if (hi > lo) segs.push([lo, hi, a === xs, b === xr]);
  };
  if (xs <= xr) push(xs, xr);
  else {
    push(xs, PERIOD);
    push(0, xr);
  }
  return segs; // [x0, x1, 左边界是日落线?, 右边界是日出线?]
}

// 夜色：偏紫的石墨暮色，压得很淡（和米纸、石色、红章放在一起不打架）
// 想更暗/更亮，直接调这两个值：NIGHT_OPACITY 建议 0.22 ~ 0.42
const NIGHT_FILL = "#4a4760";
const NIGHT_OPACITY = 0.3;
const STAR_FILL = "#fffaf0";

// 夜空里的星星（固定伪随机，避免每次渲染乱跳）
const STARS = Array.from({ length: 56 }, (_, i) => {
  const a = Math.abs(Math.sin(i * 12.9898) * 43758.5453) % 1;
  const b = Math.abs(Math.sin(i * 78.233) * 12345.6789) % 1;
  return [a * 1600, b * 1000, 0.8 + ((i * 37) % 10) / 12];
});

/* ---------------- 纸飞机（往返飞行） ---------------- */
/* ---------------- 纸飞机（往返飞行：飞 → 到站前盘旋一圈 → 降落 → 停留 → 返程） ---------------- */
function PaperPlane({ active, onArrive, isNight, onNightChange, night, onCargo }) {
  const ref = useRef(null);
  const isNightRef = useRef(isNight);
  const nightRef = useRef(false);
  const posRef = useRef({ x: CITY_A[0], y: CITY_A[1], dir: 1 });

  useEffect(() => {
    isNightRef.current = isNight;
  });

  useEffect(() => {
    if (!active || !ref.current) return;
    const el = ref.current;
    let raf;
    let last = performance.now();
    let dir = 1; // 1: 飞向宁平，-1: 飞回杭州
    let q = 0; // 单程进度 0→1
    let restUntil = 0;
    let pendingFlip = false;
    const LEG = 6200; // 单程耗时（ms）
    const REST = 1600; // 到站停留（ms）

    const tick = (now) => {
      const dt = Math.min(now - last, 60);
      last = now;
      if (now >= restUntil) {
        if (pendingFlip) {
          pendingFlip = false;
          q = 0;
          dir = -dir;
        }
        q += dt / LEG;
        if (q >= 1) {
          q = 1;
          restUntil = now + REST;
          pendingFlip = true;
          onArrive(dir === 1 ? "b" : "a");
        }
      }
      // 正弦缓动：到站自然减速、掉头
      const e = 0.5 - 0.5 * Math.cos(Math.PI * q);
      const t = dir === 1 ? e : 1 - e;
      const p = cubicAt(t);
      const d = cubicD(t);
      const x = p[0];
      const y = p[1];
      let ang = (Math.atan2(d[1], d[0]) * 180) / Math.PI;
      if (dir === -1) ang += 180;

      // 飞进夜的那半边，就自己点一盏灯
      const nightNow = isNightRef.current(x);
      if (nightNow !== nightRef.current) {
        nightRef.current = nightNow;
        onNightChange(nightNow);
      }

      posRef.current = { x, y, dir };
      el.setAttribute("transform", `translate(${x} ${y}) rotate(${ang})`);
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, onArrive]);

  return (
    <g
      ref={ref}
      transform={`translate(${CITY_A[0]} ${CITY_A[1]}) rotate(72)`}
      className="cursor-pointer"
    >
      <path
        d="M26,0 L-18,11 L-7,0 L-18,-11 Z"
        fill="#faf8f4"
        stroke="#1c1917"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <path d="M26,0 L-7,0" stroke="#1c1917" strokeWidth="1" />
      <path d="M26,0 L-18,-11 L-2,-2 Z" fill="#e7e5e4" opacity="0.85" />
      {night && (
        <g>
          <circle cx="-2" cy="0" r="11" fill="#fcd34d" opacity="0.3" />
          <circle cx="-2" cy="0" r="3" fill="#fde68a" />
        </g>
      )}
      {/* 隐形命中区：点飞机 = 拆本班“货” */}
      <circle
        r="54"
        fill="transparent"
        onClick={() => onCargo && onCargo({ x: posRef.current.x, y: posRef.current.y })}
      />
    </g>
  );
}

/* ---------------- 城市：心 + 涟漪 ---------------- */
function CityMark({ x, y, label, sub, anchor = "start", geo, utcHours }) {
  const lx = anchor === "end" ? x - 34 : x + 34;
  const clock = norm24(utcHours + geo.tz);
  const isDay = sunAlt(geo.lat, geo.lon, utcHours) > 0;
  const times = sunTimes(geo.lat, geo.lon, geo.tz);
  const tx = lx + (anchor === "end" ? -26 : 26);

  return (
    <g>
      {/* 夜里，先替这座城点一盏灯 */}
      {!isDay && <circle cx={x} cy={y} r="32" fill="#fbbf24" opacity="0.18" />}

      <circle cx={x} cy={y} r="10" fill="none" stroke={RED} strokeWidth="1.4">
        <animate
          attributeName="r"
          values="10;40;10"
          dur="3.2s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="opacity"
          values="0.75;0;0.75"
          dur="3.2s"
          repeatCount="indefinite"
        />
      </circle>
      <path d={HEART_D} transform={`translate(${x} ${y})`} fill={RED} />

      <text
        x={lx}
        y={y + 4}
        textAnchor={anchor}
        fontSize="34"
        fill="#292524"
        className="font-serif italic"
      >
        {label}
      </text>
      <text
        x={lx}
        y={y + 28}
        textAnchor={anchor}
        fontSize="12"
        letterSpacing="3"
        fill={isDay ? "#78716c" : "#a8a196"}
      >
        {sub}
      </text>

      {/* 当地时钟 + 昼夜 */}
      <g transform={`translate(${lx} ${y + 52})`}>
        {isDay ? (
          <g>
            <circle r="6" fill="#e0972a" />
            {[0, 60, 120, 180, 240, 300].map((a) => (
              <line
                key={a}
                x1={Math.cos(rad(a)) * 9}
                y1={Math.sin(rad(a)) * 9}
                x2={Math.cos(rad(a)) * 13}
                y2={Math.sin(rad(a)) * 13}
                stroke="#e0972a"
                strokeWidth="1.4"
              />
            ))}
          </g>
        ) : (
          <path
            d="M2,-7 A7.5,7.5 0 1,0 2,7 A6,6 0 1,1 2,-7 Z"
            fill="#5b6b96"
          />
        )}
      </g>
      <text
        x={tx}
        y={y + 58}
        textAnchor={anchor}
        fontSize="19"
        fill="#292524"
        className="font-mono"
      >
        {fmtClock(clock)}
      </text>
      <text
        x={tx}
        y={y + 78}
        textAnchor={anchor}
        fontSize="11"
        letterSpacing="2"
        fill={isDay ? "#8a8478" : "#b3ac9e"}
      >
        日出 {fmtClock(times.sunrise)} · 日落 {fmtClock(times.sunset)}
      </text>
    </g>
  );
}

/* ---------------- 到站：海面涟漪 + 飘起的小心心 ---------------- */
function ArrivalBurst({ x, y }) {
  return (
    <g pointerEvents="none">
      {/* 落点晕开的一圈红 */}
      <motion.circle
        cx={x}
        cy={y}
        r={16}
        fill={RED}
        fillOpacity="0.16"
        style={{ transformBox: "fill-box", transformOrigin: "center" }}
        initial={{ scale: 0.5, opacity: 0.9 }}
        animate={{ scale: 5.2, opacity: 0 }}
        transition={{ duration: 2.2, ease: "easeOut" }}
      />
      {/* 涟漪 */}
      <motion.circle
        cx={x}
        cy={y}
        r={20}
        fill="none"
        stroke={RED}
        strokeWidth="1.6"
        style={{ transformBox: "fill-box", transformOrigin: "center" }}
        initial={{ scale: 0.7, opacity: 0.9 }}
        animate={{ scale: 3.2, opacity: 0 }}
        transition={{ duration: 1.9, ease: "easeOut" }}
      />
      {/* 飘起来的小心心 */}
      {[0, 1, 2, 3].map((i) => (
        <motion.g
          key={i}
          initial={{ x, y, opacity: 0, scale: 0.5 }}
          animate={{
            x: x + (i - 1.5) * 24,
            y: y - 96 - i * 20,
            opacity: [0, 1, 1, 0],
            scale: 0.55 + i * 0.06,
          }}
          transition={{ duration: 2.6, delay: i * 0.16, ease: "easeOut" }}
        >
          <path d={HEART_D} fill={RED} />
        </motion.g>
      ))}
    </g>
  );
}

/* ---------------- 海上的瓶中信（只在开阔海面漂移，绝不进入陆地；点击拆开） ---------------- */
/* ---------------- 海上的瓶中信（全图海域随机漫游，绝不进入陆地；点击拆开） ---------------- */
function DriftingBottle({ onOpen, onDone }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const LIFE = 26000; // 整段漫游寿命，之后淡出并重新漂来一只
    let cur = randomSeaPoint();
    let tgt = randomSeaPoint();
    for (let i = 0; i < 40 && !segClear(cur, tgt); i++) tgt = randomSeaPoint();
    let segStart = performance.now();
    let segDur = 2600 + Math.random() * 2600;
    const born = performance.now();
    let raf;
    const apply = (x, y, life) => {
      el.style.left = `${x / 16}%`;
      el.style.top = `${y / 10}%`;
      el.style.opacity = String(life < 0.04 ? life / 0.04 : life > 0.92 ? (1 - life) / 0.08 : 1);
    };
    apply(cur[0], cur[1], 0);
    const step = (now) => {
      const life = (now - born) / LIFE;
      if (life >= 1) {
        el.style.opacity = "0";
        onDone();
        return;
      }
      let s = (now - segStart) / segDur;
      if (s >= 1) {
        // 到站，挑下一个海水里的落脚点（直线航线也必须全程在水上）
        cur = tgt;
        let tries = 0;
        do {
          tgt = randomSeaPoint();
          tries++;
        } while (!segClear(cur, tgt) && tries < 40);
        segStart = now;
        segDur = 2600 + Math.random() * 2600;
        s = 0;
      }
      const e = s * s * (3 - 2 * s); // smoothstep，漂动更柔
      const x = cur[0] + (tgt[0] - cur[0]) * e;
      const y = cur[1] + (tgt[1] - cur[1]) * e;
      apply(x, y, life);
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [onDone]);

  return (
    <button
      type="button"
      ref={ref}
      onClick={onOpen}
      aria-label="海上的瓶中信，点击拆开"
      className="pointer-events-auto absolute z-10 -translate-x-1/2 -translate-y-full cursor-pointer select-none border-0 bg-transparent p-0"
      style={{ left: "50%", top: "50%", opacity: 0 }}
    >
      <motion.span
        className="block"
        animate={{ y: [0, -7, 0, -4, 0], rotate: [0, 5, 0, -5, 0] }}
        transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }}
      >
        <svg viewBox="0 0 34 48" overflow="visible" className="block h-auto w-7 md:w-9">
          {/* 瓶塞 */}
          <rect x="13.5" y="0" width="7" height="7" rx="2" fill="#b08968" />
          {/* 瓶颈 */}
          <path d="M15 6h4v5h-4z" fill="#bcd7e0" opacity="0.9" />
          {/* 瓶身玻璃 */}
          <path
            d="M15 11h4l7 10c2.6 3.9 3.4 7.6 2.4 11.4C27.2 37.8 23.6 44 17 44S6.8 37.8 5.6 32.4c-1-3.8-.2-7.5 2.4-11.4z"
            fill="#cde3ea"
            fillOpacity="0.75"
            stroke="#7f97a3"
            strokeWidth="1"
            strokeLinejoin="round"
          />
          {/* 瓶口高光 */}
          <path d="M15 12h4v3h-4z" fill="#e8f3f7" opacity="0.9" />
          {/* 卷起的信 */}
          <rect
            x="13"
            y="13"
            width="8"
            height="14"
            rx="4"
            fill="#f7f0e1"
            stroke="#d6c9ae"
            strokeWidth="0.8"
            transform="rotate(-4 17 20)"
          />
        </svg>
      </motion.span>
    </button>
  );
}

/* ---------------- 浮起的小字条（拆瓶 · 拆货共用） ---------------- */
function BubbleCard({ x, y, caption, note }) {
  return (
    <div
      style={{ left: `${x}%`, top: `${y}%` }}
      className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-[118%]"
    >
      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.85 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -6, scale: 0.92 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
      >
        <div className="w-[264px] rounded-xl border border-stone-200 bg-[#fffdf6] px-5 py-3.5 shadow-[0_8px_28px_rgba(28,25,23,0.14)]">
          <p className="text-[9px] tracking-[0.3em] uppercase text-red-800">{caption}</p>
          <p className="mt-1.5 font-serif italic text-[15px] leading-relaxed text-stone-900">{note}</p>
        </div>
        {/* 指向下方的小尾巴 */}
        <div className="absolute -bottom-[6px] left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-b border-r border-stone-200 bg-[#fffdf6]" />
      </motion.div>
    </div>
  );
}

/* ---------------- 静态底图（不随时间重绘） ---------------- */
const MapStatic = memo(function MapStatic() {
  return (
    <g>
      {/* 经纬网格 */}
      <g stroke="#e2dccf" strokeWidth="1">
        {[200, 400, 600, 800].map((y) => (
          <line key={`h${y}`} x1="0" y1={y} x2="1600" y2={y} />
        ))}
        {[300, 700, 1100, 1500].map((x) => (
          <line key={`v${x}`} x1={x} y1="0" x2={x} y2="1000" />
        ))}
      </g>

      {/* 淡淡的其他大陆 */}
      {LAND_FAINT.map((pts, i) => (
        <path
          key={`faint${i}`}
          d={poly(pts)}
          fill="#eeeae0"
          stroke="#cdc6b8"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
      ))}

      {/* 我们的两片陆地 */}
      {LAND_PRIMARY.map((pts, i) => (
        <path
          key={`main${i}`}
          d={poly(pts)}
          fill="#e6e0d3"
          stroke="#8f8779"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      ))}

      {/* 海 */}
      <text
        x="1300"
        y="875"
        textAnchor="middle"
        fontSize="18"
        letterSpacing="4"
        fill="#c3bcae"
        className="font-serif italic"
      >
        南海 · SOUTH CHINA SEA
      </text>
      <text
        x="1520"
        y="840"
        fontSize="20"
        letterSpacing="6"
        fill="#c3bcae"
        className="font-serif italic"
        transform="rotate(-90 1520 840)"
      >
        PACIFIC · 太平洋
      </text>
      <text
        x="975"
        y="605"
        textAnchor="end"
        fontSize="20"
        letterSpacing="4"
        fill="#c3bcae"
        className="font-serif italic"
      >
        ⇄ 每日往返，永不停航
      </text>
      <text
        x="760"
        y="940"
        fontSize="22"
        letterSpacing="5"
        fill="#c3bcae"
        className="font-serif italic"
      >
        INDIAN OCEAN · 印度洋
      </text>

      {/* 大陆标注 */}
      {[
        [200, 200, "NORTH AMERICA"],
        [650, 225, "EUROPE"],
        [240, 780, "SOUTH AMERICA"],
        [490, 460, "AFRICA"],
        [1450, 920, "AUSTRALIA"],
      ].map(([x, y, t]) => (
        <text
          key={t}
          x={x}
          y={y}
          textAnchor="middle"
          fontSize="15"
          letterSpacing="6"
          fill="#b1a99a"
        >
          {t}
        </text>
      ))}
      <text
        x="1120"
        y="250"
        fontSize="20"
        letterSpacing="6"
        fill="#a8a094"
        className="font-serif italic"
      >
        中国 · CHINA
      </text>
      <text
        x="1030"
        y="840"
        fontSize="16"
        letterSpacing="4"
        fill="#a8a094"
        className="font-serif italic"
      >
        VIỆT NAM · 越南
      </text>

      {/* 罗盘 */}
      <g transform="translate(260 430)" stroke="#cdc6b8" fill="none">
        <circle r="34" strokeWidth="1.2" />
        <circle r="26" strokeWidth="0.8" />
        <path d="M0,-22 L6,0 L0,6 L-6,0 Z" fill="#cdc6b8" stroke="none" />
        <text
          x="0"
          y="-40"
          textAnchor="middle"
          fontSize="13"
          letterSpacing="3"
          fill="#b1a99a"
          stroke="none"
        >
          N
        </text>
      </g>

      {/* 四角装饰 */}
      <g stroke="#d6d3d1" strokeWidth="2">
        <path d="M20,60 L20,20 L60,20" fill="none" />
        <path d="M1580,60 L1580,20 L1540,20" fill="none" />
        <path d="M20,940 L20,980 L60,980" fill="none" />
        <path d="M1580,940 L1580,980 L1540,980" fill="none" />
      </g>
    </g>
  );
});

/* ---------------- 昼夜：夜色、晨昏线、星空、太阳 ---------------- */
function NightLayer({ utcHours }) {
  const bands = nightBands(utcHours);
  const sunX = wrapX(X_AT(180 - 15 * utcHours));
  const showSun = sunX >= 8 && sunX <= 1592;

  return (
    <g pointerEvents="none">
      <defs>
        <linearGradient id="nightIn" x1="0" x2="1">
          <stop offset="0" stopColor={NIGHT_FILL} stopOpacity="0" />
          <stop offset="1" stopColor={NIGHT_FILL} stopOpacity={NIGHT_OPACITY} />
        </linearGradient>
        <linearGradient id="nightOut" x1="0" x2="1">
          <stop offset="0" stopColor={NIGHT_FILL} stopOpacity={NIGHT_OPACITY} />
          <stop offset="1" stopColor={NIGHT_FILL} stopOpacity="0" />
        </linearGradient>
        <clipPath id="nightClip">
          {bands.map(([x0, x1], i) => (
            <rect key={i} x={x0} y="0" width={x1 - x0} height="1000" />
          ))}
        </clipPath>
      </defs>

      {/* 夜的一半 */}
      {bands.map(([x0, x1, lT, rT], i) => (
        <g key={`b${i}`}>
          <rect
            x={x0}
            y="0"
            width={x1 - x0}
            height="1000"
            fill={NIGHT_FILL}
            opacity={NIGHT_OPACITY}
          />
          {lT && x0 > 1 && (
            <rect
              x={x0 - 48}
              y="0"
              width="48"
              height="1000"
              fill="url(#nightIn)"
            />
          )}
          {rT && x1 < 1599 && (
            <rect x={x1} y="0" width="48" height="1000" fill="url(#nightOut)" />
          )}
        </g>
      ))}

      {/* 夜空里的星星 */}
      {bands.length > 0 && (
        <g clipPath="url(#nightClip)">
          {STARS.map(([sx, sy, r], i) => (
            <circle key={i} cx={sx} cy={sy} r={r} fill={STAR_FILL} opacity="0.85">
              {i % 3 === 0 && (
                <animate
                  attributeName="opacity"
                  values="0.2;0.95;0.2"
                  dur={`${3 + (i % 5)}s`}
                  repeatCount="indefinite"
                />
              )}
            </circle>
          ))}
        </g>
      )}

      {/* 晨昏线 */}
      {bands.map(([x0, x1, lT, rT], i) => (
        <g key={`t${i}`}>
          {lT && x0 > 1 && (
            <g>
              <line
                x1={x0}
                y1="0"
                x2={x0}
                y2="1000"
                stroke="#8a7f6d"
                strokeWidth="1.4"
                strokeDasharray="4 8"
              />
              <text
                x={x0 - 12}
                y="52"
                textAnchor="end"
                fontSize="15"
                letterSpacing="3"
                fill="#8a7f6d"
                className="font-serif italic"
              >
                日落线 · SUNSET
              </text>
            </g>
          )}
          {rT && x1 < 1599 && (
            <g>
              <line
                x1={x1}
                y1="0"
                x2={x1}
                y2="1000"
                stroke="#8a7f6d"
                strokeWidth="1.4"
                strokeDasharray="4 8"
              />
              <text
                x={x1 + 12}
                y="52"
                fontSize="15"
                letterSpacing="3"
                fill="#8a7f6d"
                className="font-serif italic"
              >
                SUNRISE · 日出线
              </text>
            </g>
          )}
        </g>
      ))}

      {/* 此刻太阳直射的地方 */}
      {showSun && (
        <g transform={`translate(${sunX} 120)`}>
          <circle r="10" fill="#f59e0b" opacity="0.9" />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
            <line
              key={a}
              x1={Math.cos(rad(a)) * 14}
              y1={Math.sin(rad(a)) * 14}
              x2={Math.cos(rad(a)) * 20}
              y2={Math.sin(rad(a)) * 20}
              stroke="#f59e0b"
              strokeWidth="1.6"
            />
          ))}
          <text
            y="44"
            textAnchor="middle"
            fontSize="14"
            letterSpacing="3"
            fill="#c98a1e"
            className="font-serif italic"
          >
            此刻太阳在此
          </text>
        </g>
      )}
    </g>
  );
}

export default function FlyToAutumnPage() {
  const [entered, setEntered] = useState(false);
  const [info, setInfo] = useState({
    key: 0,
    text: "正在装信……",
  });
  const [burst, setBurst] = useState(null); // 到站特效
  const [utcHours, setUtcHours] = useState(nowUtcHours);
  const [mode, setMode] = useState("now"); // now：此刻 / play：播放一天 / manual：手动拖动
  const [planeNight, setPlaneNight] = useState(false); // 纸飞机是否飞在夜里

  // 瓶中信：海面上偶尔漂来一只，点击拆开
  const [bottle, setBottle] = useState(null);
  const [bubble, setBubble] = useState(null); // { id, x(%), y(%), caption, note }
  const bottleTimer = useRef(null);
  const spawnBottle = useCallback((delay) => {
    clearTimeout(bottleTimer.current);
    bottleTimer.current = setTimeout(() => {
      setBottle({ id: Date.now(), note: pick(warmMessages) });
    }, delay);
  }, []);
  const bottleOpen = useCallback((note) => {
    setBottle(null);
    setBubble({ id: Date.now(), x: 50, y: 46, caption: "爱心话 · 漂流瓶", note });
    spawnBottle(8000 + Math.random() * 9000);
  }, [spawnBottle]);
  const bottleDone = useCallback(() => {
    setBottle(null);
    spawnBottle(9000 + Math.random() * 9000);
  }, [spawnBottle]);
  useEffect(() => {
    if (!entered) {
      setBottle(null);
      return;
    }
    spawnBottle(1600); // 进来一会儿后，第一只瓶子漂过
    return () => clearTimeout(bottleTimer.current);
  }, [entered, spawnBottle]);

  // 拆飞机的“货”：点一下，它告诉你这班带了什么
  const openCargo = useCallback((pt) => {
    setBubble({
      id: Date.now(),
      x: pt.x / 16,
      y: pt.y / 10,
      caption: "本班货单 · 拆开看看",
      note: pick(CARGO_ITEMS),
    });
  }, []);
  useEffect(() => {
    if (!bubble) return;
    const t = setTimeout(() => setBubble(null), 5200);
    return () => clearTimeout(t);
  }, [bubble]);

  // 两地真实天气（open-meteo，断网时静默隐藏）
  const [weatherHZ, setWeatherHZ] = useState(null);
  const [weatherNB, setWeatherNB] = useState(null);
  useEffect(() => {
    let alive = true;
    const getWeather = async (geo, setter) => {
      try {
        const r = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${geo.lat}&longitude=${geo.lon}&current=temperature_2m,weather_code&timezone=auto`,
        );
        if (!r.ok) throw new Error("bad weather resp");
        const d = await r.json();
        if (alive && d?.current?.temperature_2m != null) {
          setter({ ok: true, temp: Math.round(d.current.temperature_2m), code: d.current.weather_code });
        }
      } catch {
        if (alive) setter({ ok: false }); // 静默降级：不显示，不影响页面
      }
    };
    getWeather(HZ, setWeatherHZ);
    getWeather(NB, setWeatherNB);
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!entered) return;
    const t = setTimeout(
      () => setInfo({ key: Date.now(), text: "纸飞机已起飞 · 越过海面，正朝宁平" }),
      900,
    );
    return () => clearTimeout(t);
  }, [entered]);

  // 昼夜：此刻 → 每 10 秒校准一次；播放一天 → 60 秒走完 24 小时
  useEffect(() => {
    if (mode !== "now") return;
    const id = setInterval(() => setUtcHours(nowUtcHours()), 10000);
    return () => clearInterval(id);
  }, [mode]);

  useEffect(() => {
    if (mode !== "play") return;
    const id = setInterval(() => setUtcHours((h) => (h + 0.04) % 24), 100);
    return () => clearInterval(id);
  }, [mode]);

  const isNight = useCallback((x) => isNightAtX(x, utcHours), [utcHours]);
  const handleNightChange = useCallback((v) => setPlaneNight(v), []);

  // 两座城的昼夜关系
  const hzDay = sunAlt(HZ.lat, HZ.lon, utcHours) > 0;
  const nbDay = sunAlt(NB.lat, NB.lon, utcHours) > 0;
  const dayLine =
    hzDay && nbDay
      ? "此刻，你那边和我这边，都泡在同一个白天里。"
      : !hzDay && !nbDay
        ? "我们这边都天黑了——还好，梦是同一个时区。"
        : !hzDay && nbDay
          ? "我这边已经入夜，你那边天还亮着：每天这一小时，是你替我把太阳多留了六十分钟。"
          : "我这边天亮了，你那边还黑着——那我先替你看一眼今天的太阳。";

  // 用 useCallback 固定引用，否则每次渲染都会重启飞行循环
  const handleArrive = useCallback((who) => {
    setBurst({ key: Date.now(), pt: who === "b" ? CITY_B : CITY_A });
    setInfo(
      who === "b"
        ? { key: Date.now(), text: "已抵达 · 宁平 —— 今天的想念，平安送达" }
        : { key: Date.now(), text: "已回到 · 杭州 —— 装好新的早安，再次出发" },
    );
    setTimeout(() => {
      setInfo({
        key: Date.now() + 1,
        text:
          who === "b"
            ? "返程中 · 载着你的晚安，回到杭州"
            : "飞行中 · 越过海面，正朝宁平",
      });
    }, 1600);
  }, []);

  return (
    <main className="min-h-screen bg-[#f2efe9] text-stone-900 relative font-sans overflow-x-hidden">
      <Navbar hideStamp />

      {/* 左上角：返回首页 */}
      <Link
        to="/"
        aria-label="返回首页"
        className="fixed top-4 left-4 z-[60] inline-flex items-center gap-1.5 rounded-full border border-stone-300 bg-[#f2efe9]/90 px-3 py-1.5 text-[11px] tracking-[0.15em] uppercase text-stone-700 backdrop-blur hover:bg-stone-900 hover:text-[#f2efe9] transition-colors cursor-pointer"
      >
        <span aria-hidden>←</span> 首页
      </Link>

      {/* ============ 封面 ============ */}
      <AnimatePresence>
        {!entered && (
          <motion.section
            key="intro"
            className="fixed inset-0 z-50 bg-[#f2efe9] flex flex-col items-center justify-center px-6 text-center"
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
          >
            <p className="text-[11px] md:text-xs tracking-[0.35em] uppercase text-red-800 font-medium">
              A World Map · Two Glowing Dots
            </p>
            <h1 className="mt-6 font-serif italic text-[13vw] md:text-[6rem] leading-[1.05] tracking-tight text-stone-900">
              世界被画小了
              <br />
              把你我画大了
            </h1>
            <p className="mt-7 max-w-md text-sm md:text-base leading-relaxed text-stone-600">
              别的大陆，我都只淡淡描了几笔——那些地方我们还没一起去过，先留白。
              真正被我描了又描、又点亮的，只有两个坐标：你住的宁平，和我住的杭州。
              下面这架纸飞机，会在两点之间一直往返：去时带着想念，回来带着你的晚安。
            </p>
            <button
              onClick={() => setEntered(true)}
              className="mt-10 group inline-flex items-center gap-3 border border-stone-900 rounded-full px-7 py-3 text-xs tracking-[0.25em] uppercase font-medium hover:bg-stone-900 hover:text-[#f2efe9] transition-colors cursor-pointer"
            >
              让纸飞机起飞
              <span className="group-hover:translate-x-1 transition-transform">
                →
              </span>
            </button>
            <p className="absolute bottom-6 text-[10px] tracking-[0.2em] text-stone-400 uppercase">
              Fig.01 — 其余大陆，等我们一起走过，再一笔一笔补上颜色
            </p>
          </motion.section>
        )}
      </AnimatePresence>

      {/* ============ 标题 ============ */}
      <section className="pt-28 md:pt-32 px-5 md:px-12">
        <div className="max-w-container mx-auto">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="text-[11px] tracking-[0.3em] uppercase text-red-800 font-medium">
                N°07 — 世界地图 / The World, Drawn Small
              </p>
              <h2 className="mt-2 font-serif italic text-4xl md:text-6xl text-stone-900">
                两点之间，只有你和我
              </h2>
            </div>
            <p className="text-xs md:text-sm text-stone-500 max-w-xs md:text-right leading-relaxed">
              这张世界地图没有按真实比例画——比例是按想念调整的：
              其余大陆先画淡一点，只有你我所在的这两片陆地，被我放大了，因为你就是我的全世界。
            </p>
          </div>
        </div>
      </section>

      {/* ============ 地图 ============ */}
      <section className="px-5 md:px-12 pt-6 pb-16">
        <div className="max-w-container mx-auto">
          <div className="relative">
          <svg
            viewBox="0 0 1600 1000"
            className="w-full h-auto"
            role="img"
            aria-label="世界地图：杭州与宁平之间往返的纸飞机"
          >
            {/* 静态底图（大陆 / 海 / 罗盘） */}
            <MapStatic />

            {/* 昼夜：夜色 · 晨昏线 · 星空 · 太阳 */}
            <NightLayer utcHours={utcHours} />

            {/* 航线 */}
            <path
              d={ROUTE_D}
              fill="none"
              stroke="#b3ab9c"
              strokeWidth="2.2"
              strokeDasharray="6 10"
              strokeLinecap="round"
            />

            {/* 纸飞机 */}
            <PaperPlane
              active={entered}
              onArrive={handleArrive}
              isNight={isNight}
              onNightChange={handleNightChange}
              night={planeNight}
              onCargo={openCargo}
            />

            {/* 两座城 */}
            <CityMark
              x={CITY_A[0]}
              y={CITY_A[1]}
              label="杭州 Hángzhōu"
              sub="MY CITY · 我的坐标"
              anchor="end"
              geo={HZ}
              utcHours={utcHours}
            />
            <CityMark
              x={CITY_B[0]}
              y={CITY_B[1]}
              label="宁平 Ninh Bình"
              sub="YOUR CITY · 你的坐标"
              anchor="start"
              geo={NB}
              utcHours={utcHours}
            />

            {/* 到站那一秒：涟漪 + 小心心 */}
            {burst && (
              <ArrivalBurst
                key={burst.key}
                x={burst.pt[0]}
                y={burst.pt[1]}
              />
            )}

          </svg>

          {/* 覆盖在海面上的小机关：瓶中信 · 拆货纸条 */}
          <div className="pointer-events-none absolute inset-0">
            <AnimatePresence>
              {bottle && (
                <DriftingBottle
                  key={bottle.id}
                  onOpen={() => bottleOpen(bottle.note)}
                  onDone={bottleDone}
                />
              )}
            </AnimatePresence>
            <AnimatePresence>
              {bubble && (
                <BubbleCard
                  key={bubble.id}
                  x={bubble.x}
                  y={bubble.y}
                  caption={bubble.caption}
                  note={bubble.note}
                />
              )}
            </AnimatePresence>
          </div>
          </div>

          {/* ============ 状态条 ============ */}
          <div className="mt-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-t border-stone-300 pt-6">
            <div>
              <p className="text-[10px] tracking-[0.3em] uppercase text-stone-400">
                终点 · YOUR CITY
              </p>
              <p className="mt-1 font-serif italic text-2xl text-stone-900">
                宁平 Ninh Bình
              </p>
              {fmtWeather(weatherNB) && (
                <p className="mt-1.5 text-[11px] tracking-[0.08em] text-stone-500">
                  此刻 {fmtWeather(weatherNB)}
                </p>
              )}
            </div>

            <div className="flex-1 md:text-center min-h-[68px]">
              <motion.p
                key={info.key}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="font-serif italic text-lg md:text-xl text-red-800"
              >
                {info.text}
              </motion.p>
              <p className="mt-2 text-[10px] tracking-[0.25em] uppercase text-stone-400">
                ≈ 1,800 km · 时差 1 小时 · 每日一班，风雨无阻
              </p>
            </div>

            <div className="md:text-right">
              <p className="text-[10px] tracking-[0.3em] uppercase text-stone-400">
                起点 · MY CITY
              </p>
              <p className="mt-1 font-serif italic text-2xl text-stone-900">
                杭州 Hángzhōu
              </p>
              {fmtWeather(weatherHZ) && (
                <p className="mt-1.5 text-[11px] tracking-[0.08em] text-stone-500">
                  此刻 {fmtWeather(weatherHZ)}
                </p>
              )}
            </div>
          </div>

          {/* ============ 昼夜时间轴 ============ */}
          <div className="mt-10 border-t border-stone-300 pt-6">
            <p className="font-serif italic text-lg md:text-xl text-stone-700 text-center md:px-10">
              {dayLine}
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-[10px] tracking-[0.2em] uppercase text-stone-400">
              <span>时间轴 · 拖动，看夜色先落到谁那边</span>
              <span className="font-mono tracking-normal normal-case text-stone-500">
                {fmtClock(norm24(utcHours + HZ.tz))} 杭州 ·{" "}
                {fmtClock(norm24(utcHours + NB.tz))} 宁平
              </span>
            </div>

            <input
              type="range"
              min="0"
              max="24"
              step="0.02"
              value={utcHours}
              onChange={(e) => {
                setMode("manual");
                setUtcHours(parseFloat(e.target.value));
              }}
              aria-label="时间轴：拖动查看昼夜变化"
              className="mt-3 w-full cursor-pointer accent-red-800"
            />

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                onClick={() => {
                  setMode("now");
                  setUtcHours(nowUtcHours());
                }}
                className={`rounded-full border px-4 py-2 text-[11px] tracking-[0.2em] uppercase transition-colors cursor-pointer ${
                  mode === "now"
                    ? "border-stone-900 bg-stone-900 text-[#f2efe9]"
                    : "border-stone-400 text-stone-600 hover:border-stone-900 hover:text-stone-900"
                }`}
              >
                此刻
              </button>
              <button
                onClick={() => setMode((m) => (m === "play" ? "manual" : "play"))}
                className={`rounded-full border px-4 py-2 text-[11px] tracking-[0.2em] uppercase transition-colors cursor-pointer ${
                  mode === "play"
                    ? "border-stone-900 bg-stone-900 text-[#f2efe9]"
                    : "border-stone-400 text-stone-600 hover:border-stone-900 hover:text-stone-900"
                }`}
              >
                {mode === "play" ? "暂停" : "播放一天"}
              </button>
              <span className="text-[10px] tracking-[0.2em] uppercase text-stone-400">
                播放一天 = 60 秒 · 夜里飞行的纸飞机会自己点灯
              </span>
            </div>
          </div>

          <p className="mt-8 text-[10px] tracking-[0.2em] uppercase text-stone-400 text-center">
            Fig.01 — 示意地图 · 比例按想念调整 · 杭州 ⇄ 宁平
          </p>
          <p className="mt-2 text-[10px] tracking-[0.2em] uppercase text-stone-400 text-center">
            Fig.02 — 点一下纸飞机，拆开本班带的东西 · 海面偶有瓶中信漂过
          </p>

          <div className="mt-10 flex justify-center">
            <Link
              to="/"
              className="inline-flex items-center gap-3 border border-stone-900 rounded-full px-7 py-3 text-[11px] tracking-[0.25em] uppercase font-medium hover:bg-stone-900 hover:text-[#f2efe9] transition-colors cursor-pointer"
            >
              回到那封信 →
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
