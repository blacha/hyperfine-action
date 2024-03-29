export const BenchmarkHtml = `<html>

<head>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@toast-ui/chart@4.3.6/dist/toastui-chart.css"
    integrity="sha256-Tjub96L9YQYpbzxXJJcQto8bJjzmGy5SPH6kn5SVe+Q=" crossorigin="anonymous">
  <script src="https://cdn.jsdelivr.net/npm/@toast-ui/chart@4.3.6/dist/toastui-chart.min.js"
    integrity="sha256-ZtanUf/tmM9btpMqLSoXOA2ITHM2bR6JNA1jpNwbquA=" crossorigin="anonymous"></script>
  <style>
    body {
      width: 800px;
      margin: auto;
      padding: 16px
    }
  </style>
  <script>
    document.addEventListener('DOMContentLoaded', async () => {
      let lastEvent = null;

      const categories = [];
      const series = [];


      const res = await fetch('./benchmarks.json').then(c => c.json());
      const benchmarks = res.reverse();

      const allSeries = new Set();
      for (const bench of benchmarks) {
        categories.push(bench.createdAt.slice(0, 10) + ' - ' + bench.hash.slice(0, 8));

        for (const r of bench.results) allSeries.add(r.name);
      }


      for (const name of allSeries) {
        const ser = { name, data: [] };
        series.push(ser)
        for (const bench of benchmarks) {
          if (lastEvent == null || bench.createdAt > lastEvent.date) lastEvent = bench;
          const result = bench.results.find(f => f.name === name);

          if (result == null) ser.data.push(undefined)
          else ser.data.push(result.mean)
        }
      }

      const options = {
        chart: { title: 'Benchmark results - ' + lastEvent.createdAt.slice(0, 10), width: 1000, height: 500 },
        legend: {
          align: 'bottom',
        },
      }
      const data = { categories, series }
      const el = document.getElementById('benchmarks');
      const chart = new toastui.Chart.lineChart({ el, data, options })
    })
  </script>
</head>

<body>
  <div id="benchmarks"></div>
</body>

</html>`;
