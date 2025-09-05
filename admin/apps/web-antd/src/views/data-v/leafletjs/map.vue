<script setup lang="ts">
import LMap from './components/l-map.vue';
import weatherData from './weather.json';

defineOptions({
  name: 'Map',
});

const mapRef = shallowRef<any>();
const lRef = shallowRef<any>();

watch(
  mapRef,
  () => {
    if (!mapRef.value) return;
    const dd = weatherData.data.contours.map((item) => {
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
    function calculateMinMax(data: any[], key: string) {
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
    const data = calculateMinMax(dd, 'temp');

    const rainLayer = new lRef.value.HeatmapOverlay({
      radius: 1,
      maxOpacity: 0.7,
      minOpacity: 0.3,
      scaleRadius: true,
      useLocalExtrema: false,
      colorRibbon: true,
      // gradient: {
      //   0: '#313695',
      //   0.1: '#4575b4',
      //   0.2: '#74add1',
      //   0.3: '#abd9e9',
      //   0.4: '#e0f3f8',
      //   0.5: '#e0f3f8',
      //   0.6: '#ffffbf',
      //   0.7: '#fdae61',
      //   0.8: '#f46d43',
      //   0.9: '#d73027',
      //   1: '#a50026',
      // },
      latField: 'lat',
      lngField: 'lng',
      valueField: 'temp',
    });
    rainLayer.setData(data);
    mapRef.value.addLayer(rainLayer);
  },
  { immediate: true },
);
</script>

<template>
  <Page auto-content-height><LMap v-model:map="mapRef" v-model:l="lRef" /></Page>
</template>

<style lang="less" scoped></style>
