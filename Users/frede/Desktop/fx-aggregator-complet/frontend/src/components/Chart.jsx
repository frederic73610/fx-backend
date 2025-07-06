import React from "react";
import Plot from "react-plotly.js";

export default function Chart({ dates, open, high, low, close, bollingerHigh, bollingerLow, bollingerMiddle }) {
  console.log("🔍 LOG dates props:", dates);

  return (
    <Plot
      data={[
        {
          type: "candlestick",
          x: dates,
          open: open,
          high: high,
          low: low,
          close: close,
          xaxis: "x",
          yaxis: "y",
          increasing: { line: { color: "limegreen", width: 3 }, fillcolor: "rgba(50,205,50,0.7)" },
          decreasing: { line: { color: "crimson", width: 3 }, fillcolor: "rgba(220,20,60,0.7)" },
          name: "FX Pair",
          opacity: 0.9
        },
        {
          type: "scatter",
          mode: "lines",
          x: dates,
          y: bollingerHigh,
          name: "Bollinger High",
          line: { color: "deeppink", width: 3, dash: "dot" }
        },
        {
          type: "scatter",
          mode: "lines",
          x: dates,
          y: bollingerLow,
          name: "Bollinger Low",
          line: { color: "dodgerblue", width: 3, dash: "dot" }
        },
        {
          type: "scatter",
          mode: "lines",
          x: dates,
          y: bollingerMiddle,
          name: "Bollinger Middle",
          line: { color: "orange", width: 2, dash: "dash" }
        }
      ]}
      layout={{
        width: 1000,
        height: 650,
        plot_bgcolor: "#f8f9fa",
        paper_bgcolor: "#ffffff",
        xaxis: {
          title: "Date",
          type: "date",
          tickformat: "%d-%m-%Y",
          tickangle: -45,
          rangeslider: { visible: false },
          showgrid: true,
          gridcolor: "#e5e5e5",
          tickfont: { size: 10 }
        },
        yaxis: {
          title: "Price",
          showgrid: true,
          gridcolor: "#e5e5e5"
        },
        title: {
          text: "Graphique FX avec bandes de Bollinger",
          font: { size: 22 }
        },
        legend: { orientation: "h" },
        margin: { l: 60, r: 30, t: 50, b: 80 }
      }}
      config={{
        responsive: true,
        displayModeBar: false
      }}
    />
  );
};

export default Chart;
