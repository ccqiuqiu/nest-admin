<script setup lang="ts">
import { VbenIcon } from '@vben/icons';

import { Map, View } from 'ol';
import { defaults } from 'ol/control';
import TileLayer from 'ol/layer/Tile';

import { gdMapXYZ, layerSortMap, tMapWMTS } from '../../mapConfig';

import 'ol/ol.css';

defineOptions({
  name: 'OlMap',
});

const props = withDefaults(
  defineProps<{
    id?: string;
    layers?: any;
    showAttribution?: boolean;
    showLayersSelector?: boolean;
    showZoom?: boolean;
    viewOptions?: any;
  }>(),
  {
    id: `ol-map-${Date.now()}`,
    layers: () => ({
      ...gdMapXYZ,
      ...tMapWMTS,
    }),
    showZoom: true,
    viewOptions: () => ({}),
    showLayersSelector: true,
  },
);

const mapRef = defineModel<Map>('map');
// 默认显示的地图图层
const showLayerNamesRef = defineModel<string[]>('showLayerNames', { default: () => ['天地图矢量地图', '天地图矢量标记'] });

onMounted(() => {
  mapRef.value = new Map({
    target: props.id,
    layers: sortLayers(),
    view: new View({
      projection: 'EPSG:4326',
      center: [116.4074, 39.9042],
      zoom: 10,
      ...props.viewOptions,
    }),
    controls: defaults({
      zoom: props.showZoom,
      attribution: props.showAttribution,
    }),
  });
});

// 切换地图图层
watch(
  () => showLayerNamesRef.value,
  () => {
    if (!mapRef.value) return;
    // 只替换地图的TileLayer图层，也就是瓦片地图图层，保留业务图层
    const allLayers = mapRef.value.getLayers().getArray();
    mapRef.value.setLayers([
      ...sortLayers(),
      ...allLayers.filter((layer) => {
        return !(layer instanceof TileLayer);
      }),
    ]);
  },
);
// 地图图层要排序一下，标注图层一般在其他地图图层上层
function sortLayers() {
  showLayerNamesRef.value.sort((a, b) => layerSortMap[a] - layerSortMap[b]);
  return showLayerNamesRef.value.map((item) => new TileLayer({ source: props.layers[item] }));
}
</script>
<template>
  <div :id="id" class="w-full h-full relative">
    <div class="ol-map-layers-selector" v-if="showLayersSelector">
      <a-popover trigger="click" placement="bottomRight">
        <template #content>
          <a-checkbox-group class="flex w-min" v-model:value="showLayerNamesRef">
            <a-checkbox v-for="(_, key) in props.layers" :key="key" :value="key">{{ key }}</a-checkbox>
          </a-checkbox-group>
        </template>
        <a-button>
          <template #icon>
            <VbenIcon class="text-[24px]" icon="hugeicons:layer" />
          </template>
        </a-button>
      </a-popover>
    </div>
  </div>
</template>
<style lang="scss" scoped>
.ol-map-layers-selector {
  position: absolute;
  right: 10px;
  top: 10px;
  z-index: 10;
}
</style>
