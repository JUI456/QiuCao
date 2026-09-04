// DetailPage 数据配置
// BASE_URL 本地为 '/', GitHub Pages 构建后为 '/QiuCao/'
const BASE = import.meta.env.BASE_URL;

export const DETAIL_PAGE_DATA = {
  page01: {
    title: ["illustration", "design"],
    description: "专注于视觉叙事和品牌标识设计。",
    projectNumber: "01",
    totalProjects: "03",
    role: "视觉设计师",
    agency: "个人工作室",
    year: "2026",
    awards: "-",
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
    description: "个人作品集",
    projectNumber: "02",
    totalProjects: "03",
    role: "全栈开发/UI 设计师",
    agency: "个人工作室",
    year: "2026",
    awards: "FWA OF THE DAY",
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
    description: "摄影爱好者",
    projectNumber: "03",
    totalProjects: "03",
    role: "摄影师",
    agency: "个人工作室",
    year: "2025",
    awards: "-",
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
