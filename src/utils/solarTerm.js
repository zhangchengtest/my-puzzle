/**
 * 24节气计算工具（单类版）
 * 精度：分钟级
 * 时区：Asia/Shanghai
 * 参考 Java 版本实现
 */

/* ================= 节气定义 ================= */

const NAMES = [
  "立春","雨水","惊蛰","春分","清明","谷雨",
  "立夏","小满","芒种","夏至","小暑","大暑",
  "立秋","处暑","白露","秋分","寒露","霜降",
  "立冬","小雪","大雪","冬至","小寒","大寒"
];

const LONGITUDES = [
  315,330,345,0,15,30,
  45,60,75,90,105,120,
  135,150,165,180,195,210,
  225,240,255,270,285,300
];

/* ================= 对外 API（名称不变） ================= */

/**
 * 计算某一年的 24 节气
 * @param {number} year
 * @returns {Map<string, Date>} Date 为 UTC
 */
export function calculate(year) {
  const map = new Map();
  for (let i = 0; i < 24; i++) {
    const jd = findSolarTerm(year, LONGITUDES[i]);
    map.set(NAMES[i], fromJulianDay(jd));
  }
  return map;
}

/**
 * 获取指定日期所属的节气名称和日期
 */
export function getCurrentSolarTermWithDate(
  year, month, day, hour = 0, minute = 0
) {
  // ⚠️ 统一用 UTC 构造当前时间
  const currentDate = new Date(Date.UTC(
    year, month - 1, day, hour, minute
  ));

  const terms = [
    ...calculate(year),
    ...calculate(year - 1),
    ...calculate(year + 1)
  ].map(([name, date]) => ({ name, date }));

  terms.sort((a, b) => a.date - b.date);

  let current = terms[0];
  for (const t of terms) {
    if (t.date <= currentDate) current = t;
    else break;
  }

  return {
    name: current.name,
    date: current.date
  };
}

/**
 * 获取指定日期所属的节气名称
 */
export function getCurrentSolarTerm(year, month, day) {
  return getCurrentSolarTermWithDate(year, month, day).name;
}

/* ================= 核心算法 ================= */

function findSolarTerm(year, targetLongitude) {
  let jd = toJulianDay(Date.UTC(year, 0, 1, 0, 0, 0));
  let prevLon = solarLongitude(jd);

  // 扫一年，步长 30 分钟（更稳）
  for (let i = 0; i < 370 * 48; i++) {
    jd += 1.0 / 48; // 30 分钟
    const currLon = solarLongitude(jd);

    // 处理 360° → 0° 跳变
    let adjPrev = prevLon;
    let adjCurr = currLon;
    if (adjCurr < adjPrev) {
      adjCurr += 360;
    }

    let target = targetLongitude;
    if (target < adjPrev) {
      target += 360;
    }

    // 判断是否跨越目标黄经
    if (adjPrev < target && adjCurr >= target) {
      return jd;
    }

    prevLon = currLon;
  }

  throw new Error("未找到节气：" + targetLongitude);
}

function solarLongitude(jd) {
  const T = (jd - 2451545.0) / 36525.0;

  const L0 = 280.46646
    + 36000.76983 * T
    + 0.0003032 * T * T;

  const M = 357.52911
    + 35999.05029 * T
    - 0.0001537 * T * T;

  const C = (1.914602 - 0.004817 * T) * Math.sin(rad(M))
    + 0.019993 * Math.sin(rad(2 * M))
    + 0.000289 * Math.sin(rad(3 * M));

  const trueLongitude = L0 + C;
  return norm360(trueLongitude);
}

/* ================= 时间工具 ================= */

function toJulianDay(ms) {
  return ms / 86400000 + 2440587.5;
}

function fromJulianDay(jd) {
  return new Date((jd - 2440587.5) * 86400000);
}

/* ================= 工具 ================= */

const rad = d => d * Math.PI / 180;
const norm360 = d => ((d % 360) + 360) % 360;
