// Tidewater 游戏页：以全屏 iframe 加载 /public/tidewater 下的静态构建产物
// 构建来源：tidewater-main/ (npm run build → dist → public/tidewater)
export default function TidewaterPage() {
  const src = `${import.meta.env.BASE_URL}tidewater/index.html`;
  return (
    <div className="fixed inset-0 w-screen h-screen bg-black overflow-hidden">
      <iframe
        src={src}
        title="Tidewater — 海岛钓鱼游戏"
        className="w-full h-full border-0 block"
        allow="autoplay; fullscreen; pointer-lock; cross-origin-isolated"
        allowFullScreen
      />
    </div>
  );
}
