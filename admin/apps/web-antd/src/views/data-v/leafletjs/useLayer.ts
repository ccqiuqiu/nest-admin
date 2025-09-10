import { debounce } from 'lodash-es';

import { calculateMinMax, grib2heatmap, heightToPressure } from './utils';

export default function useLayer({ mapRef, mapMovingRef, heightRef, lRef }: any): any {
  const showLayerRef = ref({
    wind: false,
    oc: false,
    rain: false,
    temp: false,
    atmoP: false,
    windSpeed: false,
    turbulence: false,
  });

  const heatmapConfig = {
    radius: 0.5,
    maxOpacity: 0.7,
    minOpacity: 0.3,
    scaleRadius: true,
    useLocalExtrema: false,
    colorRibbon: true,
    gradient: {
      0: '#032E85',
      0.07: '#165DAE',
      0.13: '#2175D2',
      0.2: '#3D9FF0',
      0.27: '#85D0FE',
      0.33: '#A2EBF9',
      0.4: '#D2FAFF',
      0.47: '#F2FEEF',
      0.53: '#CFFFD0',
      0.6: '#BFFE8C',
      0.67: '#FCFE9B',
      0.73: '#FFF2C2',
      0.8: '#FFCFA1',
      0.87: '#FF938A',
      0.93: '#FF5303',
      1: '#FE5602',
    },
    latField: 'lat',
    lngField: 'lng',
    valueField: 'value',
  };

  /** 航线相关 */
  const airRouteDataRef = shallowRef<any[]>([]);
  const airRouteLayer: any[] = [];
  function initAirRoute() {
    // 航线
    const polyline = lRef.value
      .polyline(
        airRouteDataRef.value.map((item) => [item.lati, item.longi]),
        { color: '#1677ff', weight: 1 },
      )
      .addTo(mapRef.value);
    mapRef.value.fitBounds(polyline.getBounds());

    airRouteLayer.push(polyline);

    const createMarker = (point: any, options: any = { color: '#1677ff' }) => {
      let markerColor = options.color;
      let markerRadius = 2;
      switch (point.impact) {
        case 'high': {
          markerColor = '#ff4444'; // 红色
          markerRadius = 6;

          break;
        }
        case 'low': {
          markerColor = '#00ff80'; // 绿色
          markerRadius = 4;

          break;
        }
        case 'medium': {
          markerColor = '#ffd700'; // 黄色
          markerRadius = 5;

          break;
        }
        // No default
      }
      const weatherData = point.weatherData;
      return lRef.value
        .circleMarker([point.lati, point.longi], {
          radius: markerRadius,
          color: markerColor,
          fillColor: markerColor,
          fillOpacity: 1,
        })
        .bindPopup(
          `<div style="line-height: 6px;">
					<p><strong>时间:</strong> ${point.fltdate}</p>
					<p><strong>坐标:</strong> ${point.lati}, ${point.longi}</p>
          <p><strong>高度:</strong> ${point.alt}英尺</p>
          ${
            weatherData
              ? `<div>
              ${weatherData.WEATHER && `<p><strong>天气状况:</strong> ${weatherData.WEATHER}</p>`}
              ${weatherData.TEMP && `<p><strong>温度:</strong> ${weatherData.TEMP}°C</p>`}
              ${weatherData.WINDSPEED && `<p><strong>风速:</strong> ${weatherData.WINDSPEED}m/s</p>`}
              ${weatherData.WINDDIR && `<p><strong>风向:</strong> ${weatherData.WINDDIR}°</p>`}
              ${weatherData.VISPREV && `<p><strong>能见度:</strong> ${weatherData.VISPREV}米</p>`}
              ${weatherData.WINDSHEAR && `<p><strong>风切变:</strong> ${weatherData.WINDSHEAR}</p>`}
            </div>`
              : ''
          }
				</div>`,
        );
    };
    // 批量添加航线上的点
    const circleMarkers = airRouteDataRef.value.map((point, index) => {
      if (index === 0) {
        return createMarker(point, { color: '#35C759', radius: 6 });
      } else if (index === airRouteDataRef.value.length - 1) {
        return createMarker(point, { color: '#FF6600', radius: 6 });
      }
      return createMarker(point);
    });
    const featureGroup = lRef.value.featureGroup(circleMarkers);
    featureGroup.addTo(mapRef.value);

    airRouteLayer.push(featureGroup);
  }
  watch(airRouteDataRef, () => {
    airRouteLayer.forEach((layer) => {
      mapRef.value.removeLayer(layer);
    });
    initAirRoute();
  });

  /* 风场相关 */
  const windDataRef = shallowRef([]);
  const velocityLayerWDRef = shallowRef(null);
  // 初始化风场图层
  function initWind() {
    const velocityLayerWD = lRef.value.velocityLayer({
      displayValues: true,
      displayOptions: {
        velocityType: '',
        position: 'bottomleft',
        emptyString: '',
        angleConvention: 'CNN',
        speedUnit: 'm/s',
        speedString: '速度',
        directionString: '风场方向',
      },
      data: windDataRef.value,
      minVelocity: 0,
      maxVelocity: 10,
      velocityScale: 0.01,
      // colorScale: ['rgb(248,176,112)', 'rgb(242,122,13)', 'rgb(252,28,10)'],
      frameRate: 60,
    });
    velocityLayerWDRef.value = velocityLayerWD;
  }
  // 监听按钮开关切换显示状态
  watch(
    () => showLayerRef.value.wind,
    (val) => {
      if (val) {
        mapRef.value.addLayer(velocityLayerWDRef.value);
      } else {
        mapRef.value.removeLayer(velocityLayerWDRef.value);
      }
    },
  );

  /* 洋流相关 */
  const ocDataRef = shallowRef([]);
  const velocityLayerOCRef = shallowRef(null);
  function initOc() {
    const velocityLayerOC = lRef.value.velocityLayer({
      displayValues: true,
      displayOptions: {
        velocityType: '',
        emptyString: '',
        position: 'bottomleft',
        angleConvention: 'CNN',
        speedUnit: 'm/s',
        speedString: '速度',
        directionString: '洋流方向',
      },
      data: ocDataRef.value,
      minVelocity: 0,
      maxVelocity: 10,
      velocityScale: 0.1,
      // colorScale: ['rgb(171,204,254)', 'rgb(85,152,253)', 'rgb(2,102,253)', 'rgb(2,68,166)', 'rgb(1,37,90)'],
      particleAge: 100,
      particleMultiplier: 0.05,
      lineWidth: 1,
      frameRate: 60,
    });
    velocityLayerOCRef.value = velocityLayerOC;
  }
  watch(
    () => showLayerRef.value.oc,
    (val) => {
      if (val) {
        mapRef.value.addLayer(velocityLayerOCRef.value);
      } else {
        mapRef.value.removeLayer(velocityLayerOCRef.value);
      }
    },
  );

  /* 天气相关 */
  const weatherDataRef = shallowRef([]);

  // 降水
  const rainLayerRef = shallowRef(null);
  function initRain() {
    const data = calculateMinMax(weatherDataRef.value, 'rain');
    const rainLayer = new lRef.value.HeatmapOverlay({
      ...heatmapConfig,
      valueField: 'rain',
    });
    rainLayer.setData(data);
    rainLayerRef.value = rainLayer;
  }
  watch(
    () => showLayerRef.value.rain,
    (val) => {
      if (val) {
        removeWeatherLayer('rain');
        mapRef.value.addLayer(rainLayerRef.value);
      } else {
        mapRef.value.removeLayer(rainLayerRef.value);
      }
    },
  );

  // 温度
  const tempLayerRef = shallowRef(null);
  function initTemp() {
    const data = calculateMinMax(weatherDataRef.value, 'temp');
    const tempLayer = new lRef.value.HeatmapOverlay({
      ...heatmapConfig,
      valueField: 'temp',
    });
    tempLayer.setData(data);
    tempLayerRef.value = tempLayer;
  }
  watch(
    () => showLayerRef.value.temp,
    (val) => {
      if (val) {
        removeWeatherLayer('temp');
        mapRef.value.addLayer(tempLayerRef.value);
      } else {
        mapRef.value.removeLayer(tempLayerRef.value);
      }
    },
  );

  // 气压
  const atmopLayerRef = shallowRef(null);
  function initAtmoP() {
    const data = calculateMinMax(weatherDataRef.value, 'pressure');
    const atmopLayer = new lRef.value.HeatmapOverlay({
      ...heatmapConfig,
      valueField: 'pressure',
    });
    atmopLayer.setData(data);
    atmopLayerRef.value = atmopLayer;
  }
  watch(
    () => showLayerRef.value.atmoP,
    (val) => {
      if (val) {
        removeWeatherLayer('atmoP');
        mapRef.value.addLayer(atmopLayerRef.value);
      } else {
        mapRef.value.removeLayer(atmopLayerRef.value);
      }
    },
  );

  // 风速
  const windSpeedLayerRef = shallowRef(null);
  function initWindSpeed() {
    const data = calculateMinMax(weatherDataRef.value, 'ws');
    const windSpeedLayer = new lRef.value.HeatmapOverlay({
      ...heatmapConfig,
      valueField: 'ws',
    });
    windSpeedLayer.setData(data);
    windSpeedLayerRef.value = windSpeedLayer;
  }
  watch(
    () => showLayerRef.value.windSpeed,
    (val) => {
      if (val) {
        removeWeatherLayer('windSpeed');
        mapRef.value.addLayer(windSpeedLayerRef.value);
      } else {
        mapRef.value.removeLayer(windSpeedLayerRef.value);
      }
    },
  );

  /* 湍流相关 */
  const turbulenceDataRef = shallowRef<any[]>([]);
  const turbulenceLayerRef = shallowRef<any>(null);
  function initTurbulence() {
    const turbulenceLayer = new lRef.value.HeatmapOverlay(heatmapConfig);

    turbulenceLayerRef.value = turbulenceLayer;
    setTurbulenceLayerData();
  }
  watch(
    () => showLayerRef.value.turbulence,
    (val) => {
      if (val) {
        removeWeatherLayer('turbulence');
        mapRef.value.addLayer(turbulenceLayerRef.value);
      } else {
        mapRef.value.removeLayer(turbulenceLayerRef.value);
      }
    },
  );
  // 根据海拔高度设置湍流层的数据
  async function setTurbulenceLayerData() {
    // if (!turbulenceDataRef.value || turbulenceDataRef.value.length === 0) {
    // 	console.warn('湍流数据未加载')
    // 	return
    // }
    if (!heightRef.value) return;
    // // 获取高度对应的气压
    const pressure = heightToPressure(heightRef.value) * 100;
    // 根据气压取最接近的数据
    turbulenceDataRef.value.sort((a, b) => Math.abs(a.header.surface1Value - pressure) - Math.abs(b.header.surface1Value - pressure));
    console.log(`高度：${heightRef.value}英尺, 气压：${heightToPressure(heightRef.value) * 100}`);
    console.log(`最近湍流数据层数据：`, turbulenceDataRef.value[0]);
    const data: any = grib2heatmap(turbulenceDataRef.value[0]);
    data.data = data.data.filter((item: any) => item.value > 0);
    turbulenceLayerRef.value.setData(data, true);
  }
  const setTurbulenceLayerDataDebounce = debounce(setTurbulenceLayerData, 500);
  watch(heightRef, (val) => {
    showLayerRef.value.turbulence = !!val;
    if (showLayerRef.value.turbulence) {
      setTurbulenceLayerDataDebounce();
    }
  });

  // 地图移动的时候，暂停洋流和风场，移动结束继续
  const beforeMove: any = {};
  watch(mapMovingRef, (val) => {
    if (val) {
      beforeMove.wind = showLayerRef.value.wind;
      beforeMove.oc = showLayerRef.value.oc;
      if (showLayerRef.value.wind) {
        showLayerRef.value.wind = false;
      }
      if (showLayerRef.value.oc) {
        showLayerRef.value.oc = false;
      }
    } else {
      showLayerRef.value = { ...showLayerRef.value, ...beforeMove };
    }
  });

  // 天气数据不能同时显示多种类型，切换的时候，关掉其他类型的天气数据
  function removeWeatherLayer(key: string) {
    showLayerRef.value = {
      ...showLayerRef.value,
      rain: key === 'rain',
      temp: key === 'temp',
      atmoP: key === 'atmoP',
      windSpeed: key === 'windSpeed',
      turbulence: key === 'turbulence',
    };
  }

  return {
    showLayerRef,
    windDataRef,
    velocityLayerWDRef,
    initWind,
    ocDataRef,
    velocityLayerOCRef,
    initOc,
    weatherDataRef,
    initRain,
    initTemp,
    initAtmoP,
    initWindSpeed,
    initTurbulence,
    turbulenceDataRef,
    initAirRoute,
    airRouteDataRef,
  };
}

// grib2数据字段	含义
// `parameterCategory: 19`	参数大类：19 = 物理大气属性
// `parameterNumber: 10`	参数编号：10 = 湍流（Turbulence）
// `parameterUnit: ""`	单位未指定（可能为无量纲或缺省）
// `productDefinitionTemplate: 0`	产品定义模板：0 = 单层瞬时预报
// `surface1Type: 100`	第一层类型：100 = 等压面（单位：Pa）
// `surface1Value: 75200.0`	等压面值：75200 Pa ≈ 750 hPa（约 2.5 km 高度）
// `surface2Type: 255`	第二层类型：255 = 缺失（表示单层数据）
// nx: gridParams.nx || 1440, // 经度方向点数
// ny: gridParams.ny || 721, // 纬度方向点数
// lo1: gridParams.lo1 || 0.0, // 起始经度
// la1: gridParams.la1 || 90.0, // 起始纬度
// lo2: gridParams.lo2 || 359.75003, // 结束经度
// la2: gridParams.la2 || -90.0, // 结束纬度
// dx: gridParams.dx || 0.25, // 经度分辨率
// dy: gridParams.dy || 0.25, // 纬度分辨率
// numberPoints: gridParams.numberPoints || 1038240, // 总网格点数
// shape: gridParams.shape || 6 // 地球形状
