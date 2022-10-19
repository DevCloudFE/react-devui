const lnglat = [
  [125.26, 46.34],
  [123.23, 44.67],
  [117.57, 41.76],
  [114.01, 40.23],
  [110.45, 37.15],
  [112.73, 31.71],
  [110.45, 29.22],
  [114.49, 27.44],
  [97.09, 34.76],
  [86.1, 38.6],
  [88.56, 42.25],
  [97.13, 37.25],
  [105.08, 37.25],
  [103.68, 33.71],
  [86.54, 43.85],
  [86.54, 43.85],
];

const points: { lnglat: [number, number] }[] = [
  { lnglat: [76.7, 38.67] },
  { lnglat: [94.1, 29.79] },
  { lnglat: [88.34, 45.48] },
  { lnglat: [117.61, 44.77] },
  { lnglat: [119.76, 28.33] },
  { lnglat: [99.24, 36.23] },
];
for (const point of lnglat) {
  for (let n = 0; n < 1000; n++) {
    points.push({
      lnglat: [point[0] - 2 + 4 * Math.random(), point[1] - 2 + 4 * Math.random()],
    });
  }
}

export default points;
