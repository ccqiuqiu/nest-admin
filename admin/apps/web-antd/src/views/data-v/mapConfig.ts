import { getTopLeft, getWidth } from 'ol/extent.js';
import { get as getProjection } from 'ol/proj.js';
import WMTS from 'ol/source/WMTS';
import XYZ from 'ol/source/XYZ';
import WMTSTileGrid from 'ol/tilegrid/WMTS';

import 'ol/ol.css';

export const gdMapList = [
  { title: '高德标准地图', sort: 1, url: '//webrd01.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}' },
  { title: '高德卫星地图', sort: 2, url: '//webst01.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}' },
  { title: '高德路网地图', sort: 3, url: '//webrd01.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=7&x={x}&y={y}&z={z}' },
];

export const gdMapXYZ: any = {};

gdMapList.forEach((item) => {
  gdMapXYZ[item.title] = new XYZ({ attributions: '© 高德地图', url: item.url });
});

// 天地图
const TIANDITU_KEY = '6b4d798c6f49c37358b8eaa1bcae4ce1';

const tMapList = [
  { name: 'vec_w', title: '天地图矢量地图', sort: 10 },
  { name: 'cva_w', title: '天地图矢量标记', sort: 20 },
  { name: 'img_w', title: '天地图影像地图', sort: 11 },
  { name: 'cia_w', title: '天地图影像标记', sort: 21 },
  { name: 'ter_w', title: '天地图地形地图', sort: 12 },
  { name: 'cta_w', title: '天地图地形标记', sort: 22 },
];

export const layerSortMap: any = Object.fromEntries([...tMapList, ...gdMapList].map((b) => [b.title, b.sort]));

export const tMapXYZ: any = {};
export const tMapWMTS: any = {};

const projection = getProjection('EPSG:3857');
const projectionExtent = projection!.getExtent();
const size = getWidth(projectionExtent) / 256;
const resolutions: number[] = Array.from({ length: 18 });
const matrixIds: string[] = Array.from({ length: 18 });
for (let z = 1; z < 19; ++z) {
  resolutions[z] = size / 2 ** z;
  matrixIds[z] = `${z}`;
}
const tileGrid = new WMTSTileGrid({
  origin: getTopLeft(projectionExtent),
  resolutions,
  matrixIds,
});

tMapList.forEach((item) => {
  tMapXYZ[item.title] = new XYZ({
    attributions: '© <a href="https://www.tianditu.gov.cn">天地图</a>',
    url: `https://t4.tianditu.gov.cn/DataServer?T=${item.name}&x={x}&y={y}&l={z}&tk=${TIANDITU_KEY}`,
  });
  const arr: string[] = item.name.split('_');
  tMapWMTS[item.title] = new WMTS({
    url: `//t4.tianditu.gov.cn/${item.name}/wmts?tk=${TIANDITU_KEY}`,
    layer: arr[0]!,
    matrixSet: arr[1]!,
    format: 'tiles',
    style: 'default',
    projection: 'EPSG:3857',
    tileGrid,
    wrapX: true,
    attributions: '© <a href="https://www.tianditu.gov.cn">天地图</a>',
  });
});
