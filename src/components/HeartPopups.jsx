import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";

// 温暖治愈的话语列表
const warmMessages = [
  "抱抱你", "要开心", "爱你哟", "加油鸭", "你最棒",
  "辛苦了", "别担心", "有我在", "好好睡", "早安呀",
  "晚安好梦", "好好吃饭", "多喝热水", "注意休息", "保持初心",
  "一切都会好的", "今天也辛苦了", "你已经很棒了", "值得被爱", "闪闪发光",
  "岁岁常安康", "平安到白头", "二餐伴四季", "水伴欢喜", "母大都安甜甜蜜蜜",
  "冷暖自相知，喜乐常分享", "好好爱自己", "别太在意", "顺顺利利",
  "我想你了", "天冷了多穿衣", "期待下一次见面", "愿所有烦恼都消失",
  "珍惜当下", "照顾好自己", "你很重要", "被爱着呢", "温暖如初",
  "微笑面对", "勇敢一点", "慢慢来", "没关系", "会好的",
  "永远支持你", "相信你自己", "每天都要快乐", "好运连连", "心想事成",
  "平安喜乐", "万事胜意", "前程似锦", "未来可期", "不负韶华",
  "温柔以待", "岁月静好", "现世安稳", "时光不老", "我们不散",
  "感恩遇见", "有幸相识", "不负相遇", "来日方长", "后会有期",
  "天天开心", "事事顺心", "时时如意", "处处有爱", "满满幸福",
  "暖暖的", "甜甜的", "美美的", "棒棒的", "好好的",
  "被惦记", "被需要", "被宠爱", "被理解", "被包容",
  "有人等", "有人陪", "有人懂", "有人爱", "有人疼",
  "春天般温暖", "夏日般热烈", "秋天般丰盈", "冬日般纯净",
  "星光璀璨", "月色温柔", "阳光正好", "微风不燥", "岁月温柔",
  "满心欢喜", "如沐春风", "暖阳如你", "甜在心头", "念念不忘",
  "温柔有趣", "元气满满", "可可爱爱", "平安顺遂", "万事无忧",
  "喜乐平安", "欢欣雀跃", "心花怒放", "笑口常开", "福气满满",
  "被温柔以待", "值得世间美好", "你是小太阳", "照亮我生活", "最好的你",
  "今天也要加油", "烦恼清零", "快乐加倍", "好运爆棚", "爱意满满",
  "做你自己", "不必完美", "慢慢长大", "一切安好", "万事可爱",
  "温柔且坚定", "清醒且自由", "善良有锋芒", "可爱又迷人", "独特而闪耀",
  "你笑起来真好看", "世界因你而暖", "你值得所有好", "日子会发光", "未来皆坦途",
  "深呼吸放松", "给自己鼓掌", "你已经够好", "别苛责自己", "允许不完美",
  "小确幸降临", "好心情营业", "治愈系上线", "温暖不打烊", "爱意永在线",
  "愿你被这世界温柔以待", "今天也要闪闪发光哦", "烦恼统统退散", "你比想象中更强大",
  "一切尽意百事从欢", "愿你所得皆所愿", "一路生花", "即使慢一点也没关系",
  "你本就很好", "把日子过成诗", "心有繁星沐光而行", "万事顺意常安乐",
  "笑容是最好看的妆", "你值得被温柔拥抱", "生活明朗万物可爱", "好运正在赶来的路上",
  "记得好好奖励自己", "世界和我爱着你", "你是最特别的存在", "慢慢来一切都来得及",
  "愿你眼里有光心中有爱", "今天的你也很努力", "放松一下吧", "愿你三冬暖愿你好运连",
  "所有美好如期而至", "你笑起来世界都亮了", "别怕前路漫漫", "你不是一个人",
  "被爱是种运气也是种福气", "把快乐还给自己", "愿你我皆安好", "心之所向素履以往",
  "生活需要一点甜", "你是我的小确幸", "烦恼丢进风里", "今天也要元气满满",
  "愿你无忧无虑", "温柔的人自带光芒", "你值得所有温柔", "前方有光",
  "愿你被爱被宠被珍惜", "生活明朗未来可期", "给自己一个拥抱", "你比昨天更棒",
  "愿你喜欢的都拥有", "平凡日子也发光", "愿你被这人间善待", "开心是头等大事",
  "你超棒的", "愿岁月静好现世安稳", "把温柔留给自己", "你值得世间一切美好",
  "今天也要加油鸭", "愿你睡个好觉", "爱与温暖常相伴", "你是我心中的小太阳",
  "愿所有等待都有回响", "生活可爱你也可爱", "保持热爱奔赴山海", "你值得被好好对待",

  // —— 暧昧 ——
  "你今天有没有想我呀", "靠近你的时候心跳会漏一拍", "只对你才有的温柔", "想和你一起虚度时光",
  "你笑起来我有点心动", "偷偷喜欢你也挺好的", "我的目光总落在你身上", "和你聊天会上瘾",
  "你是我心动的理由", "如果思念有声音一定很吵", "想被你偏心地宠着", "你是我藏不住的小欢喜",
  "和你待在一起时间过得特别快", "下次见面可不可以牵手", "你是我意料之外的喜欢", "悄悄话只说给你听",

  // —— 搞笑 ——
  "今天也要做个开心的小废物", "烦恼别找我，我在摸鱼", "奶茶续命，快乐加倍", "头发越来越少，快乐越来越多",
  "别卷了，来摸鱼", "我的可爱可是限量版", "今天也是为干饭而奋斗", "开心点，不然对不起奶茶",
  "生活已经很累了，笑一个", "笨蛋也是需要被爱的", "与其精神内耗不如 external 吃喝", "做梦都在减肥，醒来继续干饭",
  "今日宜发疯宜摆烂", "我的快乐很简单：吃饱睡好", "人生苦短，再来一碗", "工资不多，快乐管够",

  // —— 正经 ——
  "脚踏实地，稳步前行", "认真生活的人值得被尊重", "每一份努力都有它的意义", "守得住初心，才看得见远方",
  "靠谱是成年人最好的修养", "把该做的事做好", "沉住气，好事在后头", "责任让人成长",
  "言必信，行必果", "踏实比聪明更重要", "与其焦虑不如行动", "细节里藏着一个人的教养",
  "时间会奖励长期主义者", "专业的人做专业的事", "格局打开，路就宽了", "说到做到是最低成本的信任",

  // —— 认真 ——
  "我是认真想对你好", "这件事我放在心上了", "我会一直陪着你", "答应你的事我记着呢",
  "你的感受我很在意", "我想认真地告诉你：你很重要", "谢谢你出现在我生命里", "我会努力成为更好的自己",
  "这份心意，请收下", "下次见面可以亲你吗？", "今天有没有想我？", "你是我认真做的选择",
  "不敷衍，是对你最大的尊重", "我在努力成为你可靠的肩膀", "关于你，我从不将就", "什么时候带我回家？",

  // —— 关心 ——
  "天冷了记得加衣", "别熬夜，早点休息", "按时吃饭，不许饿着", "工作再忙也要喝水",
  "累了就歇会儿，别硬撑", "出门带伞，今天有雨", "多喝热水，老生常谈但真心", "最近降温，注意身体",
  "别太累着自己", "想你的胃有没有好好吃饭", "走路看路，别摔着", "压力大就跟我念叨念叨",
  "被窝里多躺十分钟也是一种温柔", "记得给手机充电也给自己充电", "换季了，照顾好自己", "无论多忙，记得笑一笑",
  "想躺我怀里吗？", "需不需要我接你下班？"
];

// 丰富多彩的弹窗颜色
const popupColors = [
  { bg: "#FFB6C1", text: "#8B0000" },
  { bg: "#FFC0CB", text: "#800000" },
  { bg: "#FFA07A", text: "#8B4513" },
  { bg: "#FFDAB9", text: "#CD853F" },
  { bg: "#FFE4E1", text: "#BC8F8F" },
  { bg: "#FFF0F5", text: "#DB7093" },
  { bg: "#E6E6FA", text: "#6A5ACD" },
  { bg: "#D8BFD8", text: "#663399" },
  { bg: "#DDA0DD", text: "#8B008B" },
  { bg: "#EE82EE", text: "#800080" },
  { bg: "#DA70D6", text: "#8B008B" },
  { bg: "#BA55D3", text: "#4B0082" },
  { bg: "#98FB98", text: "#2E8B57" },
  { bg: "#90EE90", text: "#228B22" },
  { bg: "#7FFFD4", text: "#008B8B" },
  { bg: "#AFEEEE", text: "#008080" },
  { bg: "#B0E0E6", text: "#4682B4" },
  { bg: "#ADD8E6", text: "#4169E1" },
  { bg: "#87CEEB", text: "#1E90FF" },
  { bg: "#87CEFA", text: "#4169E1" },
  { bg: "#B0C4DE", text: "#4682B4" },
  { bg: "#FFEFD5", text: "#D2691E" },
  { bg: "#FFF8DC", text: "#B8860B" },
  { bg: "#FAEBD7", text: "#A0522D" },
  { bg: "#FFFFE0", text: "#BDB76B" },
  { bg: "#F0FFF0", text: "#3CB371" },
  { bg: "#F5FFFA", text: "#2E8B57" },
  { bg: "#F0FFFF", text: "#5F9EA0" },
  { bg: "#F0F8FF", text: "#4682B4" },
  { bg: "#FFE4B5", text: "#A0522D" },
];

// 心形参数方程计算点位置
function getHeartPoint(t, scale = 12) {
  const x = scale * (16 * Math.pow(Math.sin(t), 3));
  const y = -scale * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
  return { x, y };
}

// 洗牌填充，尽量让相邻弹窗内容不同
function buildMessagePool(count) {
  const pool = [];
  while (pool.length < count) {
    const chunk = [...warmMessages];
    for (let i = chunk.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [chunk[i], chunk[j]] = [chunk[j], chunk[i]];
    }
    pool.push(...chunk);
  }
  return pool.slice(0, count);
}

// Fisher-Yates 洗牌：每次调用都重新随机
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// 单个弹窗：外层 slot 定位，内层 card 负责出现/悬停/浮动
function LovePopup({ message, color, slotStyle, cardStyle }) {
  return (
    <div className="popup-slot" style={slotStyle}>
      <div className="love-popup" style={{ backgroundColor: color.bg, color: color.text, ...cardStyle }}>
        <div className="popup-title-bar">
          <span className="popup-title">温馨提示</span>
        </div>
        <div className="popup-content">
          <span className="popup-message">{message}</span>
        </div>
        <div className="popup-controls">
          <button className="popup-btn minimize">─</button>
          <button className="popup-btn maximize">□</button>
          <button className="popup-btn close">×</button>
        </div>
      </div>
    </div>
  );
}

export default function HeartPopups() {
  const [phase, setPhase] = useState("initial"); // initial -> forming -> complete -> scattering -> fullscreen
  const [visibleCount, setVisibleCount] = useState(0);
  const [popups, setPopups] = useState([]);
  const [isScattering, setIsScattering] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // 每次进入随机选一张背景图（懒初始化只在首次挂载执行一次）
  const [bgImage] = useState(() => {
    const imgs = [1, 2, 3, 4].map(
      (n) => `${import.meta.env.BASE_URL}illustration/0${n}.png`,
    );
    return imgs[Math.floor(Math.random() * imgs.length)];
  });

  const navigate = useNavigate();
  const goBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate("/");
  };

  const viewportRef = useRef({ w: 1920, h: 1080 });

  // 手机（窄屏）缩小心形轮廓，保证整颗心落在屏内并留出安全边距
  const [heartScale] = useState(() => {
    if (typeof window === "undefined") return 12;
    const w = window.innerWidth;
    return w < 380 ? 7 : w < 640 ? 8 : 12;
  });

  // 视口尺寸实时记录（不触发动画重跑）
  useEffect(() => {
    const update = () => {
      viewportRef.current = { w: window.innerWidth, h: window.innerHeight };
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const generateHeartPopups = useCallback(() => {
    const arr = [];
    const numPoints = 90;
    // 每次进入页面都重新随机文案与配色顺序
    const msgs = shuffle(warmMessages);
    const colors = shuffle(popupColors);
    for (let i = 0; i < numPoints; i++) {
      const t = (i / numPoints) * Math.PI * 2;
      const point = getHeartPoint(t, heartScale);
      arr.push({
        id: `heart-${i}`,
        message: msgs[i % msgs.length],
        color: colors[i % colors.length],
        targetX: point.x,
        targetY: point.y,
        delay: i * 70,
      });
    }
    return arr;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [heartScale]);

  const generateFullscreenPopups = useCallback((w, h) => {
    const cellW = w < 480 ? 106 : 150;
    const cellH = w < 480 ? 100 : 110;
    const cols = Math.ceil(w / cellW) + 1;
    const rows = Math.ceil(h / cellH) + 1;
    const total = cols * rows;
    const pool = buildMessagePool(total);
    const colors = shuffle(popupColors);
    const arr = [];
    let msgIdx = 0;
    const startX = -(cols * cellW) / 2 + cellW / 2;
    const startY = -(rows * cellH) / 2 + cellH / 2;
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        arr.push({
          id: `full-${row}-${col}`,
          message: pool[msgIdx % pool.length],
          color: colors[(row * cols + col) % colors.length],
          x: startX + col * cellW + (Math.random() - 0.5) * 30,
          y: startY + row * cellH + (Math.random() - 0.5) * 24,
          rotation: (Math.random() - 0.5) * 14,
          delay: (row * cols + col) * 20,
        });
        msgIdx++;
      }
    }
    // 保证"我一直都在"每次铺满都出现（普通弹窗，正常大小，固定在中央）
    const centerIndex = Math.floor(rows / 2) * cols + Math.floor(cols / 2);
    if (arr[centerIndex]) {
      arr[centerIndex] = {
        ...arr[centerIndex],
        message: "我一直都在",
        x: 0,
        y: 0,
        rotation: 0,
      };
    }
    return arr;
  }, []);

  // 统一异步时序，带取消标志，避免定时器被误清
  useEffect(() => {
    let cancelled = false;
    const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

    (async () => {
      await sleep(600);
      if (cancelled) return;

      // 阶段2：汇聚成心形
      setPhase("forming");
      const heart = generateHeartPopups();
      setPopups(heart);
      for (let i = 1; i <= heart.length; i++) {
        if (cancelled) return;
        setVisibleCount(i);
        await sleep(70);
      }
      await sleep(400);
      if (cancelled) return;

      // 阶段3：心形完整（短暂展示后即散开）
      setPhase("complete");
      await sleep(1000);
      if (cancelled) return;

      // 阶段4：确保心形全部长完后，再向四周散开淡出
      setVisibleCount(heart.length);
      await sleep(200);
      if (cancelled) return;
      setIsScattering(true);
      setPhase("scattering");
      await sleep(1500);
      if (cancelled) return;

      // 阶段5：散尽后，弹窗一个一个长出铺满整屏（不再消失）
      const { w, h } = viewportRef.current;
      const full = generateFullscreenPopups(w, h);
      setPopups(full);
      setIsScattering(false);
      setIsFullscreen(true);
      setVisibleCount(0);
      setPhase("fullscreen");
      for (let i = 1; i <= full.length; i++) {
        if (cancelled) return;
        setVisibleCount(i);
        await sleep(25);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [generateHeartPopups, generateFullscreenPopups]);

  // 渲染弹窗列表
  const renderPopups = () => {
    if (isFullscreen) {
      return popups.map((popup, index) => {
        const visible = index < visibleCount;
        const slotStyle = {
          left: "50%",
          top: "50%",
          transform: `translate(calc(-50% + ${popup.x}px), calc(-50% + ${popup.y}px)) rotate(${popup.rotation || 0}deg)`,
          "--float-delay": `${popup.delay}ms`,
        };
        const cardStyle = {
          opacity: visible ? 1 : 0,
          transform: `scale(${visible ? 1 : 0.5})`,
          transition: `opacity 0.45s cubic-bezier(0.34,1.56,0.64,1), transform 0.45s cubic-bezier(0.34,1.56,0.64,1)`,
        };
        return (
          <LovePopup
            key={popup.id}
            message={popup.message}
            color={popup.color}
            slotStyle={slotStyle}
            cardStyle={cardStyle}
          />
        );
      });
    }

    // 心形阶段（forming / complete / scattering）
    return popups.map((popup, index) => {
      const visible = index < visibleCount;
      const slotStyle = {
        left: "50%",
        top: "50%",
        transform: `translate(calc(-50% + ${popup.targetX}px), calc(-50% + ${popup.targetY}px))`,
      };
      const cardStyle = {
        opacity: visible ? 1 : 0,
        transform: `scale(${visible ? 1 : 0.5})`,
        transition: `opacity 0.45s cubic-bezier(0.34,1.56,0.64,1), transform 0.45s cubic-bezier(0.34,1.56,0.64,1)`,
      };
      return (
        <LovePopup
          key={popup.id}
          message={popup.message}
          color={popup.color}
          slotStyle={slotStyle}
          cardStyle={cardStyle}
        />
      );
    });
  };

  if (phase === "initial") {
    const firstMsg = warmMessages[Math.floor(Math.random() * warmMessages.length)];
    const firstColor = popupColors[Math.floor(Math.random() * popupColors.length)];
    return (
      <div className="heart-popups-container">
        <button className="back-btn" type="button" onClick={goBack}>
          ← 返回
        </button>
        <LovePopup
          message={firstMsg}
          color={firstColor}
          slotStyle={{ left: "50%", top: "50%", transform: "translate(-50%, -50%)" }}
          cardStyle={{ opacity: 1, transform: "scale(1)" }}
        />
      </div>
    );
  }

  return (
    <div className="heart-popups-container">
      <button className="back-btn" type="button" onClick={goBack}>
        ← 返回
      </button>
      <div className={`popups-wrapper ${isScattering ? "scattering" : ""} ${isFullscreen ? "fullscreen" : ""}`}>
        {renderPopups()}
      </div>

      {(phase === "complete" || phase === "fullscreen") && (
        <button className="replay-btn" onClick={() => window.location.reload()}>
          再看一次
        </button>
      )}

      <style>{`
        .heart-popups-container {
          position: fixed;
          inset: 0;
          width: 100vw;
          height: 100vh;
          background-image:
            linear-gradient(rgba(26, 26, 46, 0.82), rgba(15, 20, 40, 0.88)),
            url("${bgImage}");
          background-size: cover;
          background-position: center;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          z-index: 9999;
        }

        .back-btn {
          position: absolute;
          top: 20px;
          left: 20px;
          z-index: 2000;
          padding: 8px 18px;
          background: rgba(255, 255, 255, 0.12);
          border: 1px solid rgba(255, 255, 255, 0.35);
          backdrop-filter: blur(8px);
          color: rgba(255, 255, 255, 0.95);
          font-size: 14px;
          letter-spacing: 1px;
          border-radius: 20px;
          cursor: pointer;
          transition: all 0.25s ease;
        }
        .back-btn:hover {
          background: rgba(255, 255, 255, 0.25);
          transform: translateX(-2px);
        }

        .popups-wrapper {
          position: relative;
          width: 600px;
          height: 560px;
        }
        .popups-wrapper.fullscreen {
          width: 100vw;
          height: 100vh;
        }

        .popup-slot {
          position: absolute;
          will-change: transform, opacity, translate;
        }

        /* 散开：外层向外飘并淡出（用 translate 属性，不抢占 transform 定位） */
        .popups-wrapper.scattering .popup-slot {
          animation: scatter 1.5s ease-out forwards;
        }
        @keyframes scatter {
          0% { opacity: 1; translate: 0 0; }
          100% { opacity: 0; translate: var(--scatter-x, 0) var(--scatter-y, -240px); }
        }
        .popups-wrapper.scattering .popup-slot:nth-child(odd) {
          --scatter-x: -160px; --scatter-y: -220px;
        }
        .popups-wrapper.scattering .popup-slot:nth-child(even) {
          --scatter-x: 160px; --scatter-y: -200px;
        }
        .popups-wrapper.scattering .popup-slot:nth-child(3n) {
          --scatter-x: 0px; --scatter-y: -280px;
        }

        .love-popup {
          width: 132px;
          padding: 8px;
          border-radius: 8px;
          box-shadow:
            0 4px 15px rgba(0, 0, 0, 0.25),
            0 2px 4px rgba(0, 0, 0, 0.12),
            inset 0 1px 0 rgba(255, 255, 255, 0.35);
          cursor: pointer;
          user-select: none;
          backdrop-filter: blur(5px);
          border: 1px solid rgba(255, 255, 255, 0.25);
          will-change: transform, opacity, translate;
        }
        .love-popup:hover {
          transform: scale(1.12) !important;
          box-shadow:
            0 10px 28px rgba(0, 0, 0, 0.35),
            0 4px 8px rgba(0, 0, 0, 0.18);
          z-index: 100 !important;
        }

        /* 全屏铺满后：内层轻柔浮动（用 translate 属性，保留定位与缩放） */
        .popups-wrapper.fullscreen .love-popup {
          animation: float 3.2s ease-in-out infinite;
          animation-delay: var(--float-delay, 0ms);
        }
        @keyframes float {
          0%, 100% { translate: 0 0; }
          50% { translate: 0 -8px; }
        }

        .popup-title-bar {
          display: flex;
          align-items: center;
          gap: 6px;
          padding-bottom: 6px;
          border-bottom: 1px solid currentColor;
          opacity: 0.6;
          font-size: 10px;
        }
        .popup-title { flex: 1; font-weight: 500; }

        .popup-content {
          padding: 12px 4px;
          text-align: center;
          min-height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .popup-message {
          font-size: 14px;
          font-weight: 600;
          letter-spacing: 1px;
          line-height: 1.3;
        }

        .popup-controls {
          display: flex;
          justify-content: flex-end;
          gap: 6px;
          padding-top: 6px;
          border-top: 1px solid currentColor;
          opacity: 0.6;
        }
        .popup-btn {
          width: 18px;
          height: 18px;
          border: none;
          background: transparent;
          color: inherit;
          cursor: pointer;
          font-size: 14px;
          line-height: 1;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 3px;
          transition: background 0.2s;
        }
        .popup-btn:hover { background: rgba(0, 0, 0, 0.12); }
        .popup-btn.close:hover { background: #ff6b6b; color: white; }

        .replay-btn {
          position: absolute;
          bottom: 36px;
          left: 50%;
          transform: translateX(-50%);
          padding: 12px 28px;
          background: linear-gradient(135deg, #ff6b6b, #ff8e8e);
          color: white;
          border: none;
          border-radius: 25px;
          font-size: 16px;
          cursor: pointer;
          box-shadow: 0 4px 15px rgba(255, 107, 107, 0.4);
          transition: all 0.3s ease;
          z-index: 1000;
        }
        .replay-btn:hover {
          transform: translateX(-50%) scale(1.05);
          box-shadow: 0 6px 20px rgba(255, 107, 107, 0.6);
        }

        @media (max-width: 768px) {
          .love-popup { width: 104px; padding: 6px; }
          .popup-message { font-size: 11px; }
        }
      `}</style>
    </div>
  );
}
