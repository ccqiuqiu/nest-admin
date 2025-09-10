<script setup lang="ts">
import { Feature } from 'ol';
import { boundingExtent } from 'ol/extent';
import { LineString, Point } from 'ol/geom';
import { Vector as VectorLayer } from 'ol/layer';
import VectorSource from 'ol/source/Vector';
import { Circle, Fill, Icon, Stroke, Style, Text } from 'ol/style';

import airplanePng from './airplane.png';
import OlMap from './components/ol-map.vue';
import { animateIconFeature } from './utils';

const mapRef = shallowRef<any>();

const waypoints: any[] = [
  { label: 'ZGSZ', point: [113.81, 22.64], isDanger: true },
  { label: 'SZ002', point: [113.722, 22.797] },
  { label: 'SZ013', point: [113.587, 22.717] },
  { label: 'SZ314', point: [113.657, 22.543] },
  { label: 'SZ113', point: [113.505, 22.378] },
  { label: 'ZUH', point: [113.465, 22.223] },
  { label: 'KIBAS', point: [113.242, 22.138] },
  { label: 'BOKAT', point: [113, 22.038] },
  { label: 'ADBIN', point: [112.822, 21.968] },
  { label: 'TOMUD', point: [112.547, 21.853] },
  { label: 'BIGRO', point: [111.827, 21.57], isWarn: true },
  { label: 'P470', point: [110.575, 21.203] },
  { label: 'LH', point: [110.335, 21.133] },
  { label: 'BHY', point: [109.433, 21.585], isWarn: true },
  { label: 'ALEKI', point: [109.095, 21.85], isWarn: true },
  { label: 'NIKUK', point: [108.752, 22.117], isWarn: true },
  { label: 'WUY', point: [108.15, 22.587], isWarn: true },
  { label: 'UVUNO', point: [107.642, 23.03] },
  { label: 'P479', point: [107.583, 23.082] },
  { label: 'P477', point: [107.243, 23.377] },
  { label: 'BSE', point: [106.603, 23.925] },
  { label: 'MEPAN', point: [105.703, 24.103], isWarn: true },
  { label: 'ADBAG', point: [105.217, 24.222], isWarn: true },
  { label: 'P128', point: [104.768, 24.315] },
  { label: 'LXI', point: [103.742, 24.54] },
  { label: 'IGRID', point: [103.185, 24.553] },
  { label: 'PM467', point: [103.138, 24.472] },
  { label: 'PM466', point: [103.072, 24.402] },
  { label: 'PM465', point: [102.988, 24.35] },
  { label: 'PM464', point: [102.893, 24.318] },
  { label: 'PM463', point: [102.792, 24.308] },
  { label: 'PM462', point: [102.692, 24.322] },
  { label: 'PM461', point: [102.598, 24.358] },
  { label: 'PM460', point: [102.519, 24.413] },
  { label: 'XSJ', point: [102.802, 24.682] },
  { label: 'PP512', point: [103.073, 25.028] },
  { label: 'PM436', point: [103.125, 25.093] },
  { label: 'PM435', point: [103.215, 25.055] },
  { label: 'PM434', point: [103.313, 25.043] },
  { label: 'PM433', point: [103.41, 25.063] },
  { label: 'PM432', point: [103.493, 25.112] },
  { label: 'PM431', point: [103.557, 25.182] },
  { label: 'PM430', point: [103.59, 25.265] },
  { label: 'MP2', point: [103.297, 25.315] },
  { label: 'ZPPP', point: [102.943, 25.103], isWarn: true },
];
watch(mapRef, () => {
  if (!mapRef.value) return;

  // 添加航线
  const lineFeature = new Feature({ name: '航线', geometry: new LineString(waypoints.map((waypoint) => waypoint.point)) });
  const lineLayer = new VectorLayer({
    source: new VectorSource({
      features: [lineFeature],
    }),
    style: new Style({
      stroke: new Stroke({
        color: 'blue',
        width: 3,
      }),
    }),
    opacity: 0.8,
  });
  mapRef.value.addLayer(lineLayer);

  // 添加航线点
  const pointFeatures = waypoints.map((v) => {
    const centerPoint = new Point(v.point);
    const color = v.isDanger ? '#BE3535' : v.isWarn ? '#ff9100' : '#35BE40';
    const pointFeature = new Feature({
      name: '航线点',
      geometry: centerPoint,
    });
    const dotStyle = new Style({
      image: new Circle({
        radius: 5,
        fill: new Fill({
          color,
        }),
        stroke: new Stroke({
          color: '#FFF',
          width: 1,
        }),
      }),
      text: new Text({
        fill: new Fill({ color: '#000' }),
        font: '14px',
        stroke: new Stroke({ color, width: 2 }),
        offsetY: 14,
        textAlign: 'center',
        text: v.label,
      }),
    });
    pointFeature.setStyle(dotStyle);
    return pointFeature;
  });
  const pointLayer = new VectorLayer({
    source: new VectorSource({ features: pointFeatures, wrapX: false }),
    opacity: 0.8,
  });
  mapRef.value.addLayer(pointLayer);

  // 添加飞机Icon
  const airplaneFeature = new Feature({ name: '飞机图标', geometry: new Point(waypoints[0].point) });
  const airplaneStyle = new Style({
    image: new Icon({
      anchor: [0.5, 0],
      anchorXUnits: 'fraction',
      anchorYUnits: 'pixels',
      opacity: 1,
      src: airplanePng,
      scale: 0.7,
    }),
  });
  airplaneFeature.setStyle(airplaneStyle);
  const airportLayer = new VectorLayer({
    source: new VectorSource({
      features: [airplaneFeature],
    }),
  });
  mapRef.value.addLayer(airportLayer);

  animateIconFeature(
    airportLayer,
    airplaneFeature,
    waypoints.map((waypoint) => waypoint.point),
    20_000,
  );

  // 地图平移并缩放到合适范围
  mapRef.value.getView().fit(boundingExtent(waypoints.map((waypoint) => waypoint.point)), {
    padding: [50, 50, 50, 50],
    duration: 1000,
  });
});
</script>
<template>
  <Page auto-content-height>
    <OlMap v-model:map="mapRef" :show-attribution="false" />
  </Page>
</template>
