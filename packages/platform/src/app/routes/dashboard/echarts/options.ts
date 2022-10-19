const NUM = 3;

const dataset = {
  dimensions: (() => {
    const dimensions = ['date'];
    for (let n = 0; n < NUM; n++) {
      dimensions.push(`Group ${n + 1}`);
    }
    return dimensions;
  })(),
  source: ['Mon', 'Tus', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((date) => {
    const data = { date };
    for (let n = 0; n < NUM; n++) {
      data[`Group ${n + 1}`] = Math.floor(((Math.random() * 600 + 400) * (NUM - n)) / NUM);
    }
    return data;
  }),
};
const noGridDataset = {
  source: Array.from({ length: NUM }).map((_, i) => [`Group ${i + 1}`, Math.floor(Math.random() * 100)]),
};

export const lineOptions: echarts.ComposeOption<
  | echarts.TitleComponentOption
  | echarts.LegendComponentOption
  | echarts.TooltipComponentOption
  | echarts.DatasetComponentOption
  | echarts.GridComponentOption
  | echarts.LineSeriesOption
> = {
  title: {
    text: 'Line Chart',
    subtext: '(Subtitle here)',
  },
  legend: {
    right: 0,
  },
  tooltip: {
    trigger: 'axis',
  },
  dataset,
  xAxis: {
    type: 'category',
  },
  yAxis: {},
  grid: {
    bottom: 32,
  },
  series: Array.from({ length: NUM }).map(() => ({
    type: 'line',
    markPoint: {
      data: [
        {
          name: 'Maximum',
          type: 'max',
        },
      ],
    },
  })),
};

export const stackedLineOptions: echarts.ComposeOption<
  | echarts.TitleComponentOption
  | echarts.LegendComponentOption
  | echarts.TooltipComponentOption
  | echarts.DatasetComponentOption
  | echarts.GridComponentOption
  | echarts.LineSeriesOption
> = {
  title: {
    text: 'Stacked Line Chart',
    subtext: '(Subtitle here)',
  },
  legend: {
    right: 0,
  },
  tooltip: {
    trigger: 'axis',
  },
  dataset,
  xAxis: {
    type: 'category',
    boundaryGap: false,
  },
  yAxis: {},
  grid: {
    bottom: 32,
  },
  series: Array.from({ length: NUM }).map((_, index) => ({
    type: 'line',
    label: {
      show: index === NUM - 1,
      position: 'top',
    },
    stack: 'Total',
    stackStrategy: 'all',
    areaStyle: {},
  })),
};

export const barOptions: echarts.ComposeOption<
  | echarts.TitleComponentOption
  | echarts.LegendComponentOption
  | echarts.TooltipComponentOption
  | echarts.DatasetComponentOption
  | echarts.GridComponentOption
  | echarts.BarSeriesOption
> = {
  title: {
    text: 'Bar Chart',
  },
  legend: {
    right: 0,
  },
  tooltip: {
    trigger: 'axis',
  },
  dataset,
  xAxis: {
    type: 'category',
  },
  yAxis: {},
  grid: {
    bottom: 32,
  },
  series: Array.from({ length: NUM }).map(() => ({
    type: 'bar',
    markPoint: {
      data: [
        {
          name: 'Maximum',
          type: 'max',
        },
      ],
    },
  })),
};

export const stackedBarOptions: echarts.ComposeOption<
  | echarts.TitleComponentOption
  | echarts.LegendComponentOption
  | echarts.TooltipComponentOption
  | echarts.DatasetComponentOption
  | echarts.GridComponentOption
  | echarts.BarSeriesOption
> = {
  title: {
    text: 'Stacked Bar Chart',
    subtext: '(Subtitle here)',
  },
  legend: {
    right: 0,
  },
  tooltip: {
    trigger: 'axis',
  },
  dataset,
  xAxis: {
    type: 'category',
  },
  yAxis: {},
  grid: {
    bottom: 32,
  },
  series: Array.from({ length: NUM }).map((_, index) => ({
    type: 'bar',
    label: {
      show: index === NUM - 1,
      position: 'top',
    },
    stack: 'Total',
    stackStrategy: 'all',
    areaStyle: {},
  })),
};

export const pieOptions: echarts.ComposeOption<
  | echarts.TitleComponentOption
  | echarts.LegendComponentOption
  | echarts.TooltipComponentOption
  | echarts.DatasetComponentOption
  | echarts.GridComponentOption
  | echarts.PieSeriesOption
> = {
  title: {
    text: 'Pie Chart',
  },
  legend: {
    right: 0,
  },
  tooltip: {
    trigger: 'item',
  },
  dataset: noGridDataset,
  grid: {
    bottom: 0,
  },
  series: Array.from({ length: NUM }).map(() => ({
    type: 'pie',
  })),
};

export const nightingaleOptions: echarts.ComposeOption<
  | echarts.TitleComponentOption
  | echarts.LegendComponentOption
  | echarts.TooltipComponentOption
  | echarts.DatasetComponentOption
  | echarts.GridComponentOption
  | echarts.PieSeriesOption
> = {
  title: {
    text: 'Nightingale Chart',
  },
  legend: {
    right: 0,
  },
  tooltip: {
    trigger: 'item',
  },
  dataset: noGridDataset,
  grid: {
    bottom: 0,
  },
  series: Array.from({ length: NUM }).map(() => ({
    type: 'pie',
    radius: [20, 100],
    roseType: 'radius',
  })),
};

export const scatterOptions: echarts.ComposeOption<
  | echarts.TitleComponentOption
  | echarts.ToolboxComponentOption
  | echarts.TooltipComponentOption
  | echarts.DataZoomComponentOption
  | echarts.DatasetComponentOption
  | echarts.GridComponentOption
  | echarts.ScatterSeriesOption
> = {
  title: {
    text: 'Scatter Chart',
  },
  toolbox: {
    feature: {
      dataView: { show: true },
      saveAsImage: { show: true },
      restore: { show: true },
    },
  },
  tooltip: {
    trigger: 'item',
  },
  dataZoom: [
    {
      type: 'slider',
    },
  ],
  xAxis: {
    type: 'value',
  },
  yAxis: {},
  series: Array.from({ length: NUM }).map((_, i) => ({
    name: `Group ${i + 1}`,
    type: 'scatter',
    data: Array.from({ length: 32 }).map(() => [
      Math.floor(((Math.random() * 600 + 400) * (NUM - i)) / NUM),
      Math.floor(((Math.random() * 600 + 400) * (NUM - i)) / NUM),
    ]),
  })),
};
