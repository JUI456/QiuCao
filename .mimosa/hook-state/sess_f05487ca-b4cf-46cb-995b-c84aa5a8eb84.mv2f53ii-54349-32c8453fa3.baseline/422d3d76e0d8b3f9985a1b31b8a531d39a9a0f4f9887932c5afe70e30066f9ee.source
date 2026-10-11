// N°08 · 生日档案 —— 日期、暗号、23 年寄语、信件、弹窗池全部集中在这里，
// 想改任何一句话都只需要动这个文件，不用碰组件。
// 注意：她在越南宁平（UTC+7），所有"今天是不是生日"的判断都按宁平的日历来。

export const HER = {
  name: "秋草",
  nameVi: "Thu Thảo", // 她名字的越南语拼法（秋 = Thu，草 = Thảo）——如她的本名不同，改这里即可
  birth: { year: 2002, month: 10, day: 11 }, // 2002·10·11
  tzOffset: 7, // 越南 UTC+7
};

// 预览暗号：她出生的那一天（8 位数字）。只有生日当天才能直接拆开；
// 提前打开时，长按火漆章 3 秒输入暗号可以预览整份礼物。
export const SECRET_CODE = "20021011";

// 生日倒计时锁：true = 密封状态，仅宁平 10·11 零点自动解锁（上线给她之前改回 true）；
// false = 暂时关闭倒计时，随时可拆，方便自己完整走一遍流程。
export const COUNTDOWN_ENABLED = false;

// 许愿星存档（跨年彩蛋）：明年生日打开会先回放"去年今天你许的愿望"
export const WISH_STORAGE_KEY = "qc_birthday_wish_v1";

/* ---------------- 宁平时区的时间工具 ---------------- */

// 把任意时刻换算成"宁平挂钟"的年月日
export function vnParts(now = new Date()) {
  const vn = new Date(now.getTime() + HER.tzOffset * 3600 * 1000);
  return {
    y: vn.getUTCFullYear(),
    m: vn.getUTCMonth() + 1,
    d: vn.getUTCDate(),
    hh: vn.getUTCHours(),
    mm: vn.getUTCMinutes(),
    ss: vn.getUTCSeconds(),
  };
}

// 宁平是否已经进入 10·11
export function isHerBirthday(now = new Date()) {
  const p = vnParts(now);
  return p.m === HER.birth.month && p.d === HER.birth.day;
}

// 是否已经过了今年的生日（生日第二天起进入"回放"状态，礼物永久解锁）
export function isAfterBirthdayThisYear(now = new Date()) {
  const p = vnParts(now);
  if (p.y > HER.birth.year === false && p.y !== HER.birth.year) return false;
  if (p.m > HER.birth.month) return true;
  return p.m === HER.birth.month && p.d > HER.birth.day;
}

// 下一场生日（宁平 10·11 零点）的绝对时刻：UTC+7 的午夜 = 前一日 17:00 UTC
export function nextBirthdayUtc(now = new Date()) {
  const p = vnParts(now);
  const y = p.m > HER.birth.month || (p.m === HER.birth.month && p.d >= HER.birth.day)
    ? p.y + 1
    : p.y;
  return new Date(Date.UTC(y, HER.birth.month - 1, HER.birth.day, -HER.tzOffset));
}

// 她来这颗星球第几天（信件数据行用）
export function daysAlive(now = new Date()) {
  const bornUtc = Date.UTC(HER.birth.year, HER.birth.month - 1, HER.birth.day, -HER.tzOffset);
  return Math.max(0, Math.floor((now.getTime() - bornUtc) / 86400000));
}

// 登机牌之约：2027·10·11（第 25 个生日）宁平午夜
export function vowTargetUtc() {
  return new Date(Date.UTC(HER.birth.year + 25, HER.birth.month - 1, HER.birth.day, -HER.tzOffset));
}

/* ---------------- 第 01 幕 · 点亮语（蛋糕上依次浮现） ---------------- */

export const LIGHTING_LINES = [
  "又长大一岁的你，还是我心里最好看的那个。",
  "第 24 支是你亲手点的；前面 23 支迟到的，等我慢慢补给你。",
  "愿望先别急着许——后面还有一整面星星灯，和一个飞去宁平的约定。",
];

/* ---------------- 第 05 幕 · 23 支迟到的蜡烛（2003–2025） ---------------- */
// 第 1 个生日 = 2003 年，第 23 个 = 2025 年；第 24 支就是她面前正在燃烧的这支。

export const PAST_BIRTHDAYS = [
  { age: 1,  year: 2003, line: "你来到世界的第一年。谢谢你出生——这是后面一切的开始。" },
  { age: 2,  year: 2004, line: "听说两岁学会跑。你先跑，我晚二十多年才追上。" },
  { age: 3,  year: 2005, line: "第一次自己吹蜡烛，大概还不会许愿。这次的愿望，我替你记。" },
  { age: 4,  year: 2006, line: "奶油大概抹了一脸。缺席的我，隔空替你擦一擦。" },
  { age: 5,  year: 2007, line: "数不清蜡烛的年纪。没关系，现在每年有几支，我都数给你听。" },
  { age: 6,  year: 2008, line: "背着小书包的年纪。小小的人，还不知道杭州有个笨蛋在等你。" },
  { age: 7,  year: 2009, line: "换牙的年纪。缺的那颗，用这句迟到的祝福补上。" },
  { age: 8,  year: 2010, line: "愿望很简单的一年。现在也很简单：你要开心。" },
  { age: 9,  year: 2011, line: "第一次盼着快些长大吧？别急，好日子在后面。" },
  { age: 10, year: 2012, line: "两位数年龄的第一年。补记一句：小朋友，生日快乐。" },
  { age: 11, year: 2013, line: "开始写小心事的年纪。日记不用给我看，我只想看你笑。" },
  { age: 12, year: 2014, line: "旧日子我没赶上。往后的每一年，我都到场。" },
  { age: 13, year: 2015, line: "青春开场。你是主角，我是迟到的观众，从这页开始补票。" },
  { age: 14, year: 2016, line: "愿你被世界温柔相待——这句愿望，我现在开始兑现。" },
  { age: 15, year: 2017, line: "那年缺席的拥抱，按今天的汇率补给你：很紧的那种。" },
  { age: 16, year: 2018, line: "晚自习和月光。你做题的时候，月亮替我先陪了你几年。" },
  { age: 17, year: 2019, line: "最想快些长大的年纪。长大没有捷径，好在你走得很好。" },
  { age: 18, year: 2020, line: "十八岁，正式成年。迟到的成人礼祝福，今天一并签收。" },
  { age: 19, year: 2021, line: "十九岁的愿望开始具体了吗？我的很具体：见你。" },
  { age: 20, year: 2022, line: "二字头的起点。这一岁很棒——离我出现，越来越近了。" },
  { age: 21, year: 2023, line: "蜡烛熄灭时，我们的距离开始悄悄变短。" },
  { age: 22, year: 2024, line: "快了——下一次你过生日，就已经认识我了。" },
  { age: 23, year: 2025, line: "相遇前最后一个生日。辛苦它了，把接力棒交给第 24 个。" },
];

export const PAST23_FINALE = [
  "23 盏迟到的星星灯，现在都亮了。",
  "第 24 盏，今晚在你手里点亮；第 25 盏，我会挂上宁平的夜空，亲手点。",
];

/* ---------------- 第 03 幕 · 生日快报弹窗池（复用 /heart 的窗口语言） ---------------- */

export const BLOOM_POPUPS = [
  "生日快乐！",
  "又一年，谢谢你出生",
  "今天，你是全球中心",
  "24 岁快乐",
  "我不在场，但爱意准时抵达",
  "吹灭的是蜡烛，点亮的是我",
  "新的一岁，还是我来陪你",
  "全球唯一藏馆：秋草，今日上新一岁",
  "我记得的事：剥到一半的橘子，今天归你剥",
  "我记得的事：昨晚的月亮，替你点了根蜡烛",
  "我记得的事：桂花开好了，杭州的包裹已发货",
  "我记得的事：热茶泡好了，想你这件事也续杯了",
  "愿你眼里有光，手里有蛋糕",
  "今天的故事，只写你一个人",
  // —— 她的母语（她一定读得懂，不用翻译） ——
  "Chúc mừng sinh nhật em!",
  "Tuổi mới rực rỡ nha!",
];

// 满屏后固定在正中央的那句
export const BLOOM_CENTER = "第 24 个生日，为你点亮";

/* ---------------- 第 04 幕 · 长信（打字机逐字） ---------------- */

export const LETTER_PARAGRAPHS = [
  "这是你的第 24 个生日。数的时候我心跳了一下——前面的 23 个，我一个都没赶上。",
  "它们像 23 支迟到的蜡烛，插在我看不见的年份里。今年我把它们一支支补上：每支里放一句那年想说的话。缺席的事我都记着，不会再有了。",
  "第 25 个生日不一样。2027 年 10 月 11 日，我会拿着登机牌飞去宁平——不隔屏幕，不隔时差，就坐在你旁边看你吹蜡烛。",
  "再往后的每一个生日，名单我都排好了：在，在，都在。",
  "生日快乐，我的女孩。慢慢长大，别怕，我都在。",
  // —— 用她的母语再说一遍（她一定读得懂） ——
  "Yêu em — hôm nay, ngày mai, và mọi ngày sau nữa.（爱你，今天、明天，和以后的每一天。）",
];

export const LETTER_SIGN = "—— HHH · 写于杭州，一个想你的深夜";

/* ---------------- 第 06 幕 · 第 25 个生日之约（登机牌） ---------------- */

export const VOW = {
  airline: "想念航空 · MISS-YOU AIR",
  flightNo: "NB 2027",
  from: "HGH 杭州",
  to: "HAN 河内 → 宁平",
  dateLabel: "2027 · 10 · 11",
  passenger: "HHH",
  seat: "你的身边",
  cabin: "面对面舱",
  luggage: "一年份的想念（超重免费）",
  line: "不隔屏幕，不隔时差——你吹蜡烛的时候，我就坐在你旁边，替你记住愿望。",
  viLine: "Hẹn gặp em ở Ninh Bình —— 宁平见。",
  futureLine: "26 岁、27 岁、28 岁……以后的每个生日，我都在。",
};

/* ---------------- 弹窗配色（与 /heart 同一套马卡龙语言） ---------------- */

export const BLOOM_COLORS = [
  { bg: "#FFD9DF", text: "#8B1D33" },
  { bg: "#FFF0C9", text: "#8A6A1E" },
  { bg: "#E6E0FA", text: "#4A3B8F" },
  { bg: "#FFE4E1", text: "#A0522D" },
  { bg: "#D9F2E6", text: "#1F6B52" },
  { bg: "#FDE2EC", text: "#A33A5E" },
  { bg: "#FFF8DC", text: "#8B7500" },
  { bg: "#1C1917", text: "#F0C53C" },
];
