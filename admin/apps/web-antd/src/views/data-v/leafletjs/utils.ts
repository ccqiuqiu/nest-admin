// 获取制定类型的天气数据的最大最小值
export function calculateMinMax(data: any[], key: string) {
  let min = Infinity;
  let max = -Infinity;
  data.forEach((item) => {
    let value = item[key];
    if (value === 9999) {
      value = 0;
    }
    if (value < min) {
      min = value;
    }
    if (value > max) {
      max = value;
    }
  });

  return {
    min,
    max,
    data,
  };
}

/**
 * 根据网格参数生成经纬度网格
 * @param {object} gridParams
 * @returns {Array} 经纬度点数组 [{lon, lat}, ...]
 */
export function generateLatLonGrid(gridParams: any) {
  const nx = gridParams.nx || 1440; // 经度方向点数
  const ny = gridParams.ny || 721; // 纬度方向点数
  const lo1 = gridParams.lo1 || 0; // 起始经度
  const la1 = gridParams.la1 || 90; // 起始纬度
  const lo2 = gridParams.lo2 || 359.750_03; // 结束经度
  const la2 = gridParams.la2 || -90; // 结束纬度
  // const dx = gridParams.dx || 0.25; // 经度分辨率
  // const dy = gridParams.dy || 0.25; // 纬度分辨率

  const grid = [];
  for (let j = 0; j < ny; j++) {
    const lat = la1 + (j * (la2 - la1)) / (ny - 1);
    for (let i = 0; i < nx; i++) {
      const lon = lo1 + (i * (lo2 - lo1)) / (nx - 1);
      grid.push({ lng: Number.parseFloat(lon.toFixed(5)), lat: Number.parseFloat(lat.toFixed(5)) });
    }
  }
  return grid;
}

/**
 * grib2的数据转换为热力图数据
 * @param {object} {header, data}
 * @returns {object} {min, max, data}
 */
export function grib2heatmap(gribJson: any) {
  const data: any = {
    min: Infinity,
    max: -Infinity,
    data: [],
  };
  const grid: any[] = generateLatLonGrid(gribJson.header);
  gribJson.data.forEach((item: any, index: number) => {
    data.data.push({
      lat: grid[index].lat,
      lng: grid[index].lng,
      value: item,
    });
    data.max = Math.max(item, data.max);
    data.min = Math.min(item, data.min);
  });
  return data;
}

/**
 * 海拔高度和气压值转换工具
 * 基于国际标准大气（ISA）模型
 */

/**
 * 标准大气参数
 */
const ISA_PARAMS = {
  P0: 1013.25, // 海平面标准气压 (hPa)
  T0: 288.15, // 海平面标准温度 (K)
  L: -0.0065, // 温度递减率 (K/m)
  g: 9.806_65, // 重力加速度 (m/s²)
  R_d: 287.05, // 干空气气体常数 (J/(kg·K))
};

/**
 * 将海拔高度（默认英尺）转换为气压（hPa）
 */
export function heightToPressure(height: number, options: any = { foot: true }) {
  // 将英尺转换为米
  if (options.foot) {
    height = height * 0.3048;
  }
  const { P0 = ISA_PARAMS.P0, T0 = ISA_PARAMS.T0, L = ISA_PARAMS.L } = options;

  if (height < 0) {
    throw new Error('海拔高度不能为负数');
  }

  const pressure = P0 * (1 - (L * height) / T0) ** (ISA_PARAMS.g / (ISA_PARAMS.R_d * L));
  return Number.parseFloat(pressure.toFixed(2));
}

/**
 * 将气压值（hPa）转换为海拔高度（米）
 */
export function pressureToHeight(pressure: any, options: any = {}) {
  const { P0 = ISA_PARAMS.P0, T0 = ISA_PARAMS.T0, L = ISA_PARAMS.L } = options;

  if (pressure <= 0) {
    throw new Error('气压值必须大于0');
  }

  const height = (T0 / Math.abs(L)) * (1 - (pressure / P0) ** ((L * ISA_PARAMS.R_d) / -ISA_PARAMS.g));
  return Number.parseFloat(height.toFixed(2));
}

/**
 * 获取标准气压层对应的海拔高度
 */
export function getPressureLevelHeight(level: number | string) {
  const pressureLevels: any = {
    surface: 1013.25,
    1000: 1000,
    925: 925,
    850: 850,
    700: 700,
    500: 500,
    300: 300,
    200: 200,
    100: 100,
  };

  const pressure = pressureLevels[level];
  if (!pressure) {
    throw new Error(`不支持的气压层: ${level}`);
  }

  return pressureToHeight(pressure);
}

/**
 * 获取海拔高度对应的标准气压层
 */
export function getHeightPressureLevel(height: number) {
  const levels = [
    { level: 'surface', height: 0 },
    { level: 1000, height: pressureToHeight(1000) },
    { level: 925, height: pressureToHeight(925) },
    { level: 850, height: pressureToHeight(850) },
    { level: 700, height: pressureToHeight(700) },
    { level: 500, height: pressureToHeight(500) },
    { level: 300, height: pressureToHeight(300) },
    { level: 200, height: pressureToHeight(200) },
    { level: 100, height: pressureToHeight(100) },
  ];

  let closestLevel: any = levels[0];
  let minDiff = Math.abs(height - closestLevel.height);

  levels.forEach((level) => {
    const diff = Math.abs(height - level.height);
    if (diff < minDiff) {
      minDiff = diff;
      closestLevel = level;
    }
  });

  return closestLevel.level;
}
