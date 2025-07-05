
import React, { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";

export default function FXAggregatorFull() {
  const [symbolList, setSymbolList] = useState([]);
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
    fetch("https://api.twelvedata.com/forex_pairs?apikey=demo")
      .then(res => res.json())
      .then(data => {
        if (data?.data) {
          setSymbolList(data.data.map(pair => pair.symbol));
        }
      });
  }, []);

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
    fetch(`https://api.twelvedata.com/time_series?symbol=${encodeURIComponent(selectedPair)}&interval=1day&outputsize=30&apikey=demo`)
      .then(res => res.json())
      .then(data => {
        if (data?.values) {
          setHistoricalData(data.values);
        }
      });
  }, [selectedPair]);

  useEffect(() => {
    if (!chartRef.current || historicalData.length < 2) return;
    const ctx = chartRef.current.getContext("2d");

    if (chartInstance.current) chartInstance.current.destroy();

    chartInstance.current = new Chart(ctx, {
      type: "line",
      data: {
        labels: historicalData.map(d => d.datetime).reverse(),
        datasets: [
          {
            label: selectedPair,
            data: historicalData.map(d => +d.close).reverse(),
            borderColor: "#3b82f6",
            tension: 0.3,
          },
        ],
      },
    });
  }, [historicalData, selectedPair]);

  const handleExecute = () => {
    if (!price) return;
    const newExecution = {
      time: new Date().toLocaleString(),
      pair: selectedPair,
      amount,
      price,
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
