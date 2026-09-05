// DetailPage 数据配置
// BASE_URL 本地为 '/', GitHub Pages 构建后为 '/QiuCao/'
const BASE = import.meta.env.BASE_URL;

export const DETAIL_PAGE_DATA = {
  page01: {
    title: ["illustration", "design"],
    description:
      "画是从收藏夹里挑了又挑的。别人的世界也很好看，可我盯着看时，总会忍不住想到你。",
    projectNumber: "01",
    totalProjects: "03",
    role: "页面主理人",
    agency: "献给：秋草",
    year: "2026 · 心动企划",
    awards: "待你验收",
    portrait: {
      image:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200",
    },
    cards: [
      {
        image: `${BASE}illustration/01.jpg`,
      },
      {
        image: `${BASE}illustration/02.jpg`,
      },
      {
        image: `${BASE}illustration/03.jpg`,
      },
      {
        image: `${BASE}illustration/04.jpg`,
      },
    ],
  },
  page02: {
    title: ["portfolio", "2026"],
    description:
      "做过许多设计稿，最难的始终是这一张：让“喜欢”出现得刚刚好，不多也不少。仍在反复改版，进度视你心情而定。",
    projectNumber: "02",
    totalProjects: "03",
    role: "设计师 & 长期规划者",
    agency: "秋草观察小组",
    year: "从遇见你那年算起",
    awards: "保密",
    cards: [
      {
        image: `${BASE}portfolio/01.jpg`,
      },
      {
        image: `${BASE}portfolio/02.jpg`,
      },
      {
        image: `${BASE}portfolio/03.jpg`,
      },
      {
        image: `${BASE}portfolio/04.jpg`,
      },
      {
        image: `${BASE}portfolio/05.jpg`,
      },
      {
        image: `${BASE}portfolio/06.jpg`,
      },
    ],
  },
  page03: {
    title: ["photography", "gallery"],
    description:
      "相机已经装进包里，路线可以慢慢定。只求你出现在取景框里时，别急着躲开——那会是我珍藏最久的一张。",
    projectNumber: "03",
    totalProjects: "03",
    role: "摄影师 & 理想旅客",
    agency: "看世界企划部",
    year: "待你答复",
    awards: "由你颁发",
    cards: [
      {
        image: `${BASE}photograph/01.jpg`,
      },
      {
        image: `${BASE}photograph/02.jpg`,
      },
      {
        image: `${BASE}photograph/03.jpg`,
      },
      {
        image: `${BASE}photograph/04.jpg`,
      },
    ],
  },
};

export const getDetailPageData = (pageId) => {
  return DETAIL_PAGE_DATA[pageId] || DETAIL_PAGE_DATA.page01;
};
