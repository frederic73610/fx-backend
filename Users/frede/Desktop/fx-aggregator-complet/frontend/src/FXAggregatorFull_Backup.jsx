import React, { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";
import { Chart as ChartJS } from 'chart.js';
import {
  LineController,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Title
} from 'chart.js';
import {
  CandlestickController,
  CandlestickElement
} from 'chartjs-chart-financial';

import { TimeScale } from 'chart.js'; // ✅ TimeScale vient de chart.js

import 'chartjs-adapter-date-fns';

ChartJS.register(
  LineController,
  LineElement,
  PointElement,
  CategoryScale,
  CandlestickController,
  CandlestickElement,
  TimeScale,
  LinearScale,
  Tooltip,
  Title
);

function calculateBollingerBands(data, period = 20, multiplier = 2) {
  const bands = [];
  for (let i = period - 1; i < data.length; i++) {
    const slice = data.slice(i - period + 1, i + 1);
    const closes = slice.map(d => d.c);
    const mean = closes.reduce((sum, val) => sum + val, 0) / period;
    const std = Math.sqrt(closes.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / period);
    bands.push({
      x: data[i].x,
      upper: mean + multiplier * std,
      lower: mean - multiplier * std,
      middle: mean
    });
  }
  return bands;
}

export default function FXAggregatorFull() {
  const [symbolList, setSymbolList] = useState(["EUR/USD", "USD/JPY", "GBP/USD", "AUD/USD", "USD/CHF"]);
  const [selectedPair, setSelectedPair] = useState("EUR/USD");
  const [amount, setAmount] = useState(1000);
  const [price, setPrice] = useState(null);
  const [convertedAmount, setConvertedAmount] = useState(null);
  const [executions, setExecutions] = useState([]);
  const [prediction, setPrediction] = useState(null);
  const [historicalData, setHistoricalData] = useState([]);
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    fetch(`https://api.twelvedata.com/price?symbol=${encodeURIComponent(selectedPair)}&apikey=demo`)
      .then(res => res.json())
      .then(data => {
        if (!isNaN(parseFloat(data?.price))) {
          setPrice(+data.price);
          setConvertedAmount((+data.price * amount).toFixed(2));
        }
      });
  }, [selectedPair, amount]);

  useEffect(() => {
    fetch(`https://fx-backend2.onrender.com/predict?symbol=${encodeURIComponent(selectedPair)}&interval=1day`)
      .then(res => res.json())
      .then(data => {
        if (data?.prediction) {
          const match = data.prediction.match(/(Hausse|Baisse) probable \((\d+(\.\d+)?)%\)/);
          if (match) {
            const text = `Il y a ${match[2]}% de chances que le taux de change ${match[1] === "Hausse" ? "augmente" : "baisse"}.`;
            setPrediction(text);
          } else setPrediction(data.prediction);
        }
      });
  }, [selectedPair]);

  useEffect(() => {
    fetch(`https://api.twelvedata.com/time_series?symbol=${encodeURIComponent(selectedPair)}&interval=1day&outputsize=60&apikey=demo`)
      .then(res => res.json())
      .then(data => {
        if (data?.values) {
          const formatted = data.values.map(d => ({
            x: new Date(d.datetime),
            o: +d.open,
            h: +d.high,
            l: +d.low,
            c: +d.close
          })).reverse();
          setHistoricalData(formatted);
        }
      });
  }, [selectedPair]);

  useEffect(() => {
    if (!chartRef.current || historicalData.length < 20) return;
    const ctx = chartRef.current.getContext("2d");
    if (chartInstance.current) chartInstance.current.destroy();

    const bollingerBands = calculateBollingerBands(historicalData);

    chartInstance.current = new Chart(ctx, {
      type: 'candlestick',
      data: {
        datasets: [
          {
            label: selectedPair,
            data: historicalData,
            borderColor: "#3b82f6",
            barThickness: 4,
            color: {
              up: "#4caf50",
              down: "#f44336",
              unchanged: "#9e9e9e"
            }
          },
          {
            label: "Bollinger High",
            type: 'line',
            data: bollingerBands.map(b => ({ x: b.x, y: b.upper })),
            borderColor: "rgba(255, 99, 132, 0.5)",
            borderWidth: 1,
            pointRadius: 0,
            fill: false
          },
          {
            label: "Bollinger Low",
            type: 'line',
            data: bollingerBands.map(b => ({ x: b.x, y: b.lower })),
            borderColor: "rgba(75, 192, 192, 0.5)",
            borderWidth: 1,
            pointRadius: 0,
            fill: false
          },
          {
            label: "Bollinger Middle",
            type: 'line',
            data: bollingerBands.map(b => ({ x: b.x, y: b.middle })),
            borderColor: "rgba(255, 206, 86, 0.5)",
            borderWidth: 1,
            pointRadius: 0,
            fill: false
          }
        ]
      },
      options: {
        responsive: true,
        scales: {
          x: {
            type: 'time',
            time: { unit: 'day' },
            title: { display: true, text: 'Date' }
          },
          y: {
            title: { display: true, text: 'Price' }
          }
        }
      }
    });
  }, [historicalData, selectedPair]);

  const handleExecute = () => {
    if (!price) return;
    const newExecution = {
      time: new Date().toLocaleString(),
      pair: selectedPair,
      amount,
      price
    };
    setExecutions(prev => [newExecution, ...prev]);
  };

  return (
    <div style={{ padding: "1rem", fontFamily: "sans-serif" }}>
      <h1>FX Aggregator</h1>

      <p><strong>Prédiction IA :</strong> {prediction || "Chargement..."}</p>

      <select value={selectedPair} onChange={e => setSelectedPair(e.target.value)}>
        {symbolList.map(pair => (
          <option key={pair} value={pair}>{pair}</option>
        ))}
      </select>

      <input
        type="number"
        value={amount}
        onChange={e => setAmount(+e.target.value)}
        style={{ marginLeft: "0.5rem" }}
      />

      <button onClick={handleExecute} style={{ marginLeft: "0.5rem" }}>
        Exécuter
      </button>

      {convertedAmount && (
        <p>
          Montant converti : {convertedAmount} {selectedPair.split("/")[1]}
        </p>
      )}

      <canvas ref={chartRef} width="600" height="300" style={{ marginTop: "2rem" }} />

      <h2>Historique des exécutions</h2>
      {executions.length === 0 ? (
        <p>Aucune exécution.</p>
      ) : (
        <ul>
          {executions.map((ex, i) => (
            <li key={i}>
              {ex.time} - {ex.pair} - {ex.amount} - {ex.price}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
