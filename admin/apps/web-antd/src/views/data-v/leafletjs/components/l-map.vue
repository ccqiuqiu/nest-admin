<!-- eslint-disable perfectionist/sort-imports -->
<script setup lang="ts">
// @ts-ignore
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import 'leaflet-velocity';
import 'leaflet-velocity/dist/leaflet-velocity.min.css';

import 'heatmap.js';
// @ts-ignore
import HeatmapOverlay from 'leaflet-heatmap';

import { gdMap, gdRoad, gdSatellite } from '../../mapConfig';

defineOptions({
  name: 'LMap',
});
const props = withDefaults(
  defineProps<{
    center?: number[];
    id?: string;
    mapOptions?: any;
    showLayers?: boolean;
    showScale?: boolean;
    zoom?: number;
  }>(),
  {
    id: `l-map-${Date.now()}`,
    center: () => [39.9042, 116.4074],
    zoom: 4,
    mapOptions: () => ({
      layers: [L.tileLayer(gdMap.url, gdMap.config)], // 默认高德标准地图
      // zoomControl: false,
      // attributionControl: false, // 去除右下角版权
    }),
    showLayers: true,
    showScale: true,
  },
);

const mapDomRef = ref();
const mapRef = defineModel<any>('map');
const lRef = defineModel<any>('l');

const resizeObserverRef = ref<any>();

onMounted(async () => {
  initMap();
});

// 初始化地图
async function initMap() {
  // 创建地图实例
  // eslint-disable-next-line unicorn/no-array-callback-reference, unicorn/no-array-method-this-argument
  mapRef.value = L.map(props.id, props.mapOptions).setView(props.center, props.zoom);
  lRef.value = { ...L, HeatmapOverlay };
  await nextTick();

  // 添加图层控制器
  props.showLayers &&
    L.control
      .layers({
        标准地图: L.tileLayer(gdMap.url, gdMap.config),
        卫星地图: L.tileLayer(gdSatellite.url, gdSatellite.config),
        路网地图: L.tileLayer(gdRoad.url, gdRoad.config),
      })
      .addTo(mapRef.value);

  // 添加比例尺
  props.showScale &&
    L.control
      .scale({
        position: 'bottomright',
        metric: true,
        imperial: false,
        maxWidth: 200,
      })
      .addTo(mapRef.value);

  // 容器大小变化监听
  resizeObserverRef.value = new ResizeObserver((entries) => {
    entries.forEach(() => {
      mapRef.value && mapRef.value.invalidateSize();
    });
  });
  resizeObserverRef.value.observe(mapDomRef.value);
}

onUnmounted(() => {
  mapDomRef.value && resizeObserverRef.value.unobserve(mapDomRef);
});
</script>
<template>
  <div :id="id" ref="mapDomRef" class="w-full h-full"></div>
</template>
<style lang="less" scoped></style>
