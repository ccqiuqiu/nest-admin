<script setup lang="ts">
import { VbenIcon } from '@vben/icons';

import { LeftOutlined, LoadingOutlined } from '@ant-design/icons-vue';

import LMap from './components/l-map.vue';
import useLayer from './useLayer';

defineOptions({
  name: 'Map',
});

const mapRef = shallowRef<any>();
const lRef = shallowRef<any>();
const heightRef = ref(18_000); // 英尺
const loadingRef = ref(true);
const mapMovingRef = ref(false);
const showBtnTextRef = ref(true);
const btnList = [
  { label: '风场', value: 'wind', icon: 'solar:wind-linear' },
  { label: '洋流', value: 'oc', icon: 'mdi:ocean' },
  { label: '降水', value: 'rain', icon: 'lets-icons:rain' },
  { label: '温度', value: 'temp', icon: 'ri:temp-cold-line' },
  { label: '气压', value: 'atmoP', icon: 'lets-icons:pressure' },
  { label: '风速', value: 'windSpeed', icon: 'icon-park-outline:wind-turbine' },
  { label: '湍流', value: 'turbulence', icon: 'streamline:wind-flow-1-remix' },
];

const {
  showLayerRef,
  windDataRef,
  initWind,
  ocDataRef,
  initOc,
  weatherDataRef,
  initRain,
  initTemp,
  initAtmoP,
  initWindSpeed,
  turbulenceDataRef,
  initTurbulence,
  initAirRoute,
  airRouteDataRef,
} = useLayer({
  mapRef,
  mapMovingRef,
  heightRef,
  lRef,
});

watch(
  mapRef,
  async () => {
    if (!mapRef.value) return;

    // 地图事件监听
    mapRef.value.on('movestart', () => {
      mapMovingRef.value = true;
    });
    mapRef.value.on('moveend', () => {
      mapMovingRef.value = false;
    });

    await loadData();

    initWind(); // 风场
    initOc(); // 洋流
    initRain(); // 降水
    initTemp(); // 气温
    initAtmoP(); // 气压
    initWindSpeed(); // 风速
    initTurbulence(); // 湍流
    initAirRoute(); // 航线

    showLayerRef.value.turbulence = true;
  },
  { immediate: true },
);

async function loadData() {
  try {
    // 并行加载所有数据文件
    const [weatherData, windData, ocData, turbulenceData, airRouteData] = await Promise.all([
      import('../mockData/weather.json').then((module) => module.default),
      import('../mockData/wind-global.json').then((module) => module.default),
      import('../mockData/20140131-surface-currents-oscar-0.33.json').then((module) => module.default),
      import('../mockData/300hpa_data.json').then((module) => module.default),
      import('../mockData/adsb.json').then((module) => module.default),
    ]);

    // 解析天气数据
    weatherDataRef.value = weatherData.data.contours.map((item) => {
      return {
        rain: item[12],
        temp: item[19],
        ws: item[7],
        wd: item[6],
        pressure: item[8],
        pname: item[27],
        lat: item[2],
        lng: item[1],
      };
    });

    windDataRef.value = windData;
    ocDataRef.value = ocData;
    turbulenceDataRef.value = turbulenceData;
    airRouteDataRef.value = airRouteData;
  } catch (error) {
    console.error('数据加载失败:', error);
    throw error;
  } finally {
    loadingRef.value = false;
  }
}
</script>

<template>
  <Page auto-content-height class="relative">
    <!-- 加载状态 -->
    <div v-if="loadingRef" class="loading-overlay">
      <a-spin size="large">
        <template #indicator>
          <LoadingOutlined />
        </template>
      </a-spin>
      <div class="loading-text">正在加载数据...</div>
    </div>
    <LMap v-model:map="mapRef" v-model:l="lRef" />

    <div class="btn-list flex flex-col gap-2 items-center">
      <a-tooltip v-for="(item, i) in btnList" placement="right" :key="i" :trigger="showBtnTextRef ? undefined : 'hover'">
        <template #title>
          <span>{{ item.label }}</span>
        </template>
        <a-button
          type="primary"
          :shape="showBtnTextRef ? 'round' : 'circle'"
          :ghost="!showLayerRef[item.value]"
          @click="showLayerRef[item.value] = !showLayerRef[item.value]"
          class="flex items-center justify-center"
        >
          <template #icon><VbenIcon :icon="item.icon" class="text-[18px]" /></template>
          <span v-if="showBtnTextRef" class="ml-[6px]">{{ item.label }}</span>
        </a-button>
      </a-tooltip>

      <a-button type="link" :class="showBtnTextRef ? '' : 'rotate-180'" @click="showBtnTextRef = !showBtnTextRef">
        <template #icon> <LeftOutlined /></template>
      </a-button>
    </div>

    <div class="height-slider">
      <a-slider v-model:value="heightRef" :min="0" :max="100000" :step="100" />
      <a-input v-model:value.number="heightRef" />
    </div>
  </Page>
</template>

<style lang="scss" scoped>
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 2000;

  .loading-text {
    margin-top: 16px;
    font-size: 14px;
    color: #666;
  }
}
.btn-list {
  position: absolute;
  z-index: 1000;
  top: 100px;
  left: 20px;
  background-color: white;
  padding: 10px;
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.55);
  border-radius: 6px;
}
.height-slider {
  position: absolute;
  z-index: 1000;
  bottom: 20px;
  left: 20px;
  width: 300px;
  border-radius: 10px;
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.45);
  box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.1);
  display: flex;
  gap: 10px;
  padding: 4px 10px;
  .ant-slider {
    flex: 1;
  }
  input {
    width: 80px;
  }
}
</style>
