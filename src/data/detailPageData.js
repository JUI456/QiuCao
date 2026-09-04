// DetailPage 数据配置
// BASE_URL 本地为 '/', GitHub Pages 构建后为 '/QiuCao/'
const BASE = import.meta.env.BASE_URL;

export const DETAIL_PAGE_DATA = {
  page01: {
    title: ["illustration", "design"],
    description:
      "这是一组我挑了很久的画。画里是别人的世界，但看画的时候，想的都是你。",
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
        image: `${BASE}illustration/01.png`,
      },
      {
        image: `${BASE}illustration/02.png`,
      },
      {
        image: `${BASE}illustration/03.png`,
      },
      {
        image: `${BASE}illustration/04.png`,
      },
    ],
  },
  page02: {
    title: ["portfolio", "2026"],
    description:
      "设计过不少页面，最难的是这一种——让“喜欢”两个字出现得刚刚好。方案仍在优化中，请给我一点时间。",
    projectNumber: "02",
    totalProjects: "03",
    role: "设计师 & 长期规划者",
    agency: "秋草观察小组",
    year: "从遇见你那年算起",
    awards: "保密",
    cards: [
      {
        image: `${BASE}portfolio/01.png`,
      },
      {
        image: `${BASE}portfolio/02.png`,
      },
      {
        image: `${BASE}portfolio/03.png`,
      },
      {
        image: `${BASE}portfolio/04.png`,
      },
      {
        image: `${BASE}portfolio/05.png`,
      },
      {
        image: `${BASE}portfolio/06.png`,
      },
    ],
  },
  page03: {
    title: ["photography", "gallery"],
    description:
      "想带你去很多地方，把沿途风景都拍下来。若镜头里多一个你，那一定是我最舍不得删的一张。",
    projectNumber: "03",
    totalProjects: "03",
    role: "摄影师 & 理想旅客",
    agency: "看世界企划部",
    year: "待你答复",
    awards: "由你颁发",
    cards: [
      {
        image: `${BASE}photograph/01.png`,
      },
      {
        image: `${BASE}photograph/02.png`,
      },
      {
        image: `${BASE}photograph/03.png`,
      },
      {
        image: `${BASE}photograph/04.png`,
      },
    ],
  },
};

export const getDetailPageData = (pageId) => {
  return DETAIL_PAGE_DATA[pageId] || DETAIL_PAGE_DATA.page01;
};
