import { Feature } from 'ol';
import { Point } from 'ol/geom';
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import { Style } from 'ol/style';

// 图标沿路径移动，并根据路径方向旋转
// layer: ol/layer/Vector 图层
// feature: ol/Feature 要移动的图标要素
// pathCoords: [[x1, y1], [x2, y2], ...] 路径坐标数组
// duration: 动画持续时间，单位毫秒

// airportLayer: VectorLayer<VectorSource<Feature<Point>>, Feature<Point>>, airplaneFeature: Feature<Point>, arg2: any[], arg3: number
export const animateIconFeature = (
  layer: VectorLayer<VectorSource<Feature<Point>>, Feature<Point>>,
  feature: Feature<Point>,
  pathCoords: any[],
  duration: number,
) => {
  if (!layer || !feature || !feature.getGeometry || pathCoords.length < 2) return;

  const geometry = feature.getGeometry() as Point;
  const style = feature.getStyle() as Style | undefined;
  const icon = style?.getImage?.();
  if (!icon || typeof icon.setRotation !== 'function') {
    console.warn('Feature 未绑定 Icon 样式，或样式不支持旋转');
    return;
  }

  const totalDistance = pathCoords.reduce((sum: any, curr: any, i: any) => {
    if (i === 0) return 0;
    const [x1, y1] = pathCoords[i - 1];
    const [x2, y2] = curr;
    return sum + Math.hypot(x2 - x1, y2 - y1);
  }, 0);

  const startTime = performance.now();

  const step = (now: number) => {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const targetDist = totalDistance * progress;

    let traveled = 0;
    let segmentIndex = 0;
    for (let i = 1; i < pathCoords.length; i++) {
      const seg = Math.hypot(pathCoords[i][0] - pathCoords[i - 1][0], pathCoords[i][1] - pathCoords[i - 1][1]);
      if (traveled + seg >= targetDist) {
        segmentIndex = i - 1;
        break;
      }
      traveled += seg;
    }

    const [x1, y1] = pathCoords[segmentIndex];
    const [x2, y2] = pathCoords[segmentIndex + 1];
    const segLen = Math.hypot(x2 - x1, y2 - y1);
    const segProgress = (targetDist - traveled) / segLen;

    const currentX = x1 + (x2 - x1) * segProgress;
    const currentY = y1 + (y2 - y1) * segProgress;

    // 设置位置
    geometry.setCoordinates([currentX, currentY]);

    // 设置旋转角（航向）
    const rotation = calculateHeadingAngle([x1, y1], [x2, y2]);
    icon.setRotation(rotation);

    layer.changed();

    if (progress < 1) {
      requestAnimationFrame(step);
    }
  };

  requestAnimationFrame(step);
};

// 计算两点间的航向角
export const calculateHeadingAngle = (c1: [number, number], c2: [number, number]) => {
  const [lon1, lat1] = c1;
  const [lon2, lat2] = c2;

  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLon = toRad(lon2 - lon1);
  const y = Math.sin(dLon) * Math.cos(toRad(lat2));
  const x = Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) - Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(dLon);

  const bearing = (Math.atan2(y, x) * 180) / Math.PI;
  return (((bearing + 360) % 360) * Math.PI) / 180;
};
