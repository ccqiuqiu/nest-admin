// 高德地图配置
export const gdMap = {
  url: '//webrd01.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}',
  config: {
    subdomains: '0123456789',
    maxZoom: 18,
    minZoom: 3,
    attribution: '© 高德地图',
  },
};
// 高德卫星地图
export const gdSatellite = {
  url: '//webst01.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}',
  config: {
    subdomains: '0123456789',
    maxZoom: 18,
    minZoom: 3,
    attribution: '© 高德卫星地图',
  },
};
// 高德路网地图
export const gdRoad = {
  url: '//webrd01.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=7&x={x}&y={y}&z={z}',
  config: {
    subdomains: '0123456789',
    maxZoom: 18,
    minZoom: 3,
    attribution: '© 高德路网地图',
  },
};
