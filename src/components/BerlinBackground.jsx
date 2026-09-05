import { useEffect, useRef, useState } from "react";

const BerlinBackground = () => {
  const containerRef = useRef(null);
  const globalVelocityRef = useRef(0);
  const touchStartRef = useRef(0);
  const [positions, setPositions] = useState({
    left: [0, 1, 2, 3],
    right: [0.5, 1.5, 2.5, 3.5],
  });

  // 数据源
  const TEXT_DATA = [
    { title: "柏林的秋天\n替你先看一场", no: "N. 01", year: "Y. 2026" },
    { title: "街灯亮起来时\n正巧想起你", no: "N. 02", year: "Y. 2026" },
    { title: "这一页放慢了\n只等你来入镜", no: "N. 03", year: "Y. 2026" },
    { title: "路还很长\n我们慢慢走", no: "N. 04", year: "Y. 2026" },
  ];

  const IMG_URLS = [
    `${import.meta.env.BASE_URL}illustration/01.jpg`,
    `${import.meta.env.BASE_URL}portfolio/03.jpg`,
    `${import.meta.env.BASE_URL}photograph/02.jpg`,
    `${import.meta.env.BASE_URL}illustration/02.jpg`,
  ];

  // 依据窗口宽度构建布局配置：窄屏（手机）等比缩小轨道与圆，避免被裁切
  const buildConfig = (width) => {
    const compact = width < 768;
    return {
      size: compact ? 104 : 200, // 圆形直径（px）
      gap: compact ? 24 : 40, // 纵向间隔（px）
      trackOffset: compact ? 82 : 150, // 左右两排的中心跨度（px）
      friction: 0.6, // 降低摩擦力，增加惯性持续时间
      bounce: 0.3, // 弹性系数，增加轻微的回弹效果
      settleThreshold: 0.05, // 完全停止的阈值
      compact,
    };
  };

  const [cfg, setCfg] = useState(() => buildConfig(window.innerWidth));
  const cfgRef = useRef(cfg);

  useEffect(() => {
    const onResize = () => setCfg(buildConfig(window.innerWidth));
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    cfgRef.current = cfg;
  }, [cfg]);

  const totalHeight = 4 * cfg.size + 4 * cfg.gap;

  const mod = (n, m) => {
    return ((n % m) + m) % m;
  };

  useEffect(() => {
    const handleWheel = (e) => {
      globalVelocityRef.current += e.deltaY * 0.5;
    };

    const handleTouchStart = (e) => {
      touchStartRef.current = e.touches[0].clientY;
    };

    const handleTouchMove = (e) => {
      const delta = touchStartRef.current - e.touches[0].clientY;
      touchStartRef.current = e.touches[0].clientY;
      globalVelocityRef.current += delta * 1;
    };

    window.addEventListener("wheel", handleWheel, { passive: true });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });

    const animate = () => {
      const c = cfgRef.current;
      // 应用摩擦力
      globalVelocityRef.current *= c.friction;

      // 添加轻微的弹性效果（当速度接近0时）
      if (
        Math.abs(globalVelocityRef.current) < 2 &&
        Math.abs(globalVelocityRef.current) > c.settleThreshold
      ) {
        globalVelocityRef.current *= 1 - c.bounce * 0.1;
      }

      // 完全停止阈值
      if (Math.abs(globalVelocityRef.current) < c.settleThreshold) {
        globalVelocityRef.current = 0;
      }

      setPositions((prev) => {
        const newLeft = prev.left.map((pos) => {
          const newPos =
            pos + globalVelocityRef.current / (c.size + c.gap);
          return mod(newPos + 4, 4);
        });

        const newRight = prev.right.map((pos) => {
          const newPos =
            pos - globalVelocityRef.current / (c.size + c.gap);
          return mod(newPos + 4, 4);
        });

        return { left: newLeft, right: newRight };
      });

      requestAnimationFrame(animate);
    };

    const animationId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, []);

  const renderCircle = (index, isText, track, position) => {
    const k = cfg.size / 200; // 缩放系数（200 为桌面基准尺寸）
    const baseY = position * (cfg.size + cfg.gap);
    const x = track === "left" ? -cfg.trackOffset : cfg.trackOffset;
    const y = baseY - totalHeight / 2;

    const style = {
      position: "absolute",
      width: cfg.size,
      height: cfg.size,
      borderRadius: "50%",
      left: `calc(50% + ${x}px - ${cfg.size / 2}px)`,
      top: `calc(50% + ${y}px - ${cfg.size / 2}px)`,
      transform: `translateY(${globalVelocityRef.current * 0.15}px) scale(${1 + Math.abs(globalVelocityRef.current) * 0.001})`,
      transition: "transform 0.05s ease-out",
      willChange: "transform",
    };

    if (isText) {
      const textItem = TEXT_DATA[index % TEXT_DATA.length];
      const lines = textItem.title.split("\n");
      const smallSize = Math.max(10, Math.round(12 * k));
      const titleSize = Math.max(14, Math.round(24 * k));
      const textMargin = Math.max(8, Math.round(20 * k));

      return (
        <div
          key={`${track}-${index}`}
          style={{
            ...style,
            backgroundColor: "rgba(255, 255, 255, 0.3)",
            border: "1px solid rgba(0, 0, 0, 0.2)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            fontFamily: '"Georgia", serif',
          }}
        >
          <div
            style={{
              fontSize: `${smallSize}px`,
              color: "rgba(40, 40, 40, 0.6)",
              marginBottom: `${textMargin}px`,
            }}
          >
            {textItem.no}
          </div>
          <div
            style={{
              fontSize: `${titleSize}px`,
              fontWeight: "500",
              fontStyle: "italic",
              color: "#1a1a1a",
              lineHeight: "1.2",
            }}
          >
            {lines.map((line, i) => (
              <div key={i}>{line}</div>
            ))}
          </div>
          <div
            style={{
              fontSize: `${smallSize}px`,
              color: "rgba(40, 40, 40, 0.6)",
              marginTop: `${textMargin}px`,
            }}
          >
            {textItem.year}
          </div>
        </div>
      );
    } else {
      const imgUrl = IMG_URLS[index % IMG_URLS.length];

      return (
        <div
          key={`${track}-${index}`}
          style={{
            ...style,
            overflow: "hidden",
          }}
        >
          <img
            src={imgUrl}
            alt={`Image ${index}`}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              borderRadius: "50%",
            }}
          />
        </div>
      );
    }
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 1,
        overflow: "hidden",
      }}
    >
      {positions.left.map((pos, i) => {
        const isText = i % 2 === 0;
        return renderCircle(i, isText, "left", pos);
      })}
      {positions.right.map((pos, i) => {
        const isText = i % 2 !== 0;
        return renderCircle(i, isText, "right", pos);
      })}
    </div>
  );
};

export default BerlinBackground;
