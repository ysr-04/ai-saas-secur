import { useEffect, useState } from "react";
import axios from "axios";
import Chat from "./Chat";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

import { Bar, Doughnut } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
);

const API_URL = "http://127.0.0.1:8000";

function App() {
  const [stats, setStats] = useState(null);
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState("");
  const [page, setPage] = useState("dashboard");

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const [statsResponse, logsResponse] = await Promise.all([
        axios.get(`${API_URL}/stats`),
        axios.get(`${API_URL}/logs`),
      ]);

      setStats(statsResponse.data);
      setLogs(logsResponse.data);
    } catch (err) {
      console.error(err);
      setError("Impossible de contacter le backend.");
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-400">
            Erreur de connexion
          </h1>
          <p className="text-gray-400 mt-2">{error}</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <p className="text-xl">Chargement du dashboard...</p>
      </div>
    );
  }

  // -----------------------------
  // CHART 1 : Security decisions
  // -----------------------------

  const decisionChart = {
  labels: ["Allowed", "Warnings", "Blocked"],
  datasets: [
    {
      label: "Requests",
      data: [
        
        stats.allowed,
        stats.warnings,
        stats.blocked,
      ],
      
      backgroundColor: ["#22c55e", "#eab308", "#ef4444"],
      borderRadius: 8,

      backgroundColor: [
        "#22c55e",
        "#eab308",
        "#ef4444",
      ],
      borderColor: [
        "#16a34a",
        "#ca8a04",
        "#dc2626",
      ],
      borderWidth: 1,
      borderRadius: 8,
      barThickness: 55,
    },
  ],
};

  // -----------------------------
  // CHART 2 : Attack categories
  // -----------------------------

  const categoryLabels = Object.keys(stats.categories || {});
  const categoryValues = Object.values(stats.categories || {});

  const categoryChart = {
  labels: categoryLabels,
  datasets: [
    {
      label: "Detected attacks",

      data: categoryValues,

      backgroundColor: [
        "#ef4444",
        "#f97316",
        "#eab308",
        "#a855f7",
        "#3b82f6",
        "#ec4899",
      ],

      borderColor: "#111827",
      borderWidth: 3,

      hoverOffset: 8,
    },
  ],
};
  return (
    <div className="min-h-screen bg-gray-950 text-white">

      {/* ================= HEADER ================= */}

      <header className="border-b border-gray-800 bg-gray-900">
        <div className="max-w-7xl mx-auto px-6 py-5">

          <div className="flex items-center justify-between">

            <div>
              <h1 className="text-3xl font-bold">
                AI Security Dashboard
              </h1>

              <p className="text-gray-400 mt-1">
                AI SaaS Security Monitoring
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>

              <span className="text-sm text-green-400">
                System Operational
              </span>
            </div>

          </div>

        </div>
      </header>
      
      <div className="max-w-7xl mx-auto px-6 pt-6 flex gap-3">
  <button
    onClick={() => setPage("dashboard")}
    className="px-4 py-2 bg-gray-800 rounded-lg"
  >
    Dashboard
  </button>

  <button
    onClick={() => setPage("chat")}
    className="px-4 py-2 bg-blue-600 rounded-lg"
  >
    Secure Chat
  </button>
</div>

      {/* ================= MAIN ================= */}
{page === "chat" ? (
  <Chat />
) : (
      <main className="max-w-7xl mx-auto px-6 py-8">

        {/* ================= STAT CARDS ================= */}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">

          {/* Total */}

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">

            <p className="text-gray-400 text-sm">
              Total Requests
            </p>

            <p className="text-4xl font-bold mt-3">
              {stats.total}
            </p>

          </div>

          {/* Allowed */}

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">

            <p className="text-gray-400 text-sm">
              Allowed
            </p>

            <p className="text-4xl font-bold text-green-400 mt-3">
              {stats.allowed}
            </p>

          </div>

          {/* Warning */}

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">

            <p className="text-gray-400 text-sm">
              Warnings
            </p>

            <p className="text-4xl font-bold text-yellow-400 mt-3">
              {stats.warnings}
            </p>

          </div>

          {/* Blocked */}

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">

            <p className="text-gray-400 text-sm">
              Blocked
            </p>

            <p className="text-4xl font-bold text-red-400 mt-3">
              {stats.blocked}
            </p>

          </div>

        </div>

        {/* ================= RISK SCORE ================= */}

        <div className="mt-6 bg-gray-900 border border-gray-800 rounded-xl p-6">

          <div className="flex justify-between items-center">

            <div>
              <p className="text-gray-400">
                Average Risk Score
              </p>

              <p className="text-4xl font-bold mt-2">
                {stats.average_score}
              </p>
            </div>

            <div className="text-right">

              <p className="text-gray-500 text-sm">
                Security Engine
              </p>

              <p className="text-green-400 font-semibold mt-1">
                Regex + OWASP + Llama Guard
              </p>

            </div>

          </div>

        </div>

        {/* ================= CHARTS ================= */}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">

          {/* Decisions */}

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">

            <h2 className="text-xl font-semibold mb-6">
              Security Decisions
            </h2>

            <div className="h-72">
            
              <Bar
                data={decisionChart}
                options={{
  responsive: true,
  maintainAspectRatio: false,

  plugins: {
    legend: {
      display: false,
    },

    tooltip: {
      backgroundColor: "#111827",
      titleColor: "#ffffff",
      bodyColor: "#d1d5db",
      padding: 12,
      displayColors: true,
    },
  },

  scales: {
    x: {
      grid: {
        display: false,
      },

      ticks: {
        color: "#d1d5db",
        font: {
          size: 13,
          weight: "500",
        },
      },
    },

    y: {
      beginAtZero: true,

      grid: {
        color: "rgba(148, 163, 184, 0.12)",
      },

      ticks: {
        color: "#9ca3af",
        precision: 0,
      },
    },
  },
}}
              />
            </div>

          </div>

          {/* Categories */}

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">

            <h2 className="text-xl font-semibold mb-6">
              Attack Categories
            </h2>

            {categoryLabels.length > 0 ? (

              <div className="h-72 flex justify-center">

                <Doughnut
                  data={categoryChart}
                  options={{
  responsive: true,
  maintainAspectRatio: false,

  cutout: "62%",

  plugins: {
    legend: {
      position: "bottom",

      labels: {
        color: "#d1d5db",

        padding: 18,

        usePointStyle: true,

        pointStyle: "circle",

        font: {
          size: 12,
        },
      },
    },

    tooltip: {
      backgroundColor: "#111827",

      titleColor: "#ffffff",

      bodyColor: "#d1d5db",

      padding: 12,
    },
  },
}}
                />

              </div>

            ) : (

              <div className="h-72 flex items-center justify-center">
                <p className="text-gray-500">
                  No attacks detected
                </p>
              </div>

            )}

          </div>

        </div>

        {/* ================= LOGS ================= */}

        <div className="mt-6 bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">

          <div className="p-6 border-b border-gray-800">

            <h2 className="text-xl font-semibold">
              Security Logs
            </h2>

            <p className="text-gray-500 text-sm mt-1">
              Recent security events detected by the AI firewall
            </p>

          </div>

          <div className="overflow-x-auto">

            <table className="w-full">

              <thead className="bg-gray-800">

                <tr>

                  <th className="text-left p-4 text-sm">
                    ID
                  </th>

                  <th className="text-left p-4 text-sm">
                    Message
                  </th>

                  <th className="text-left p-4 text-sm">
                    Score
                  </th>

                  <th className="text-left p-4 text-sm">
                    Decision
                  </th>

                  <th className="text-left p-4 text-sm">
                    Category
                  </th>

                  <th className="text-left p-4 text-sm">
                    Date
                  </th>

                </tr>

              </thead>

              <tbody>

                {logs.map((log) => (

                  <tr
                    key={log.id}
                    className="border-t border-gray-800 hover:bg-gray-800/50"
                  >

                    <td className="p-4">
                      {log.id}
                    </td>

                    <td className="p-4 max-w-md">

                      <div className="truncate">
                        {log.message}
                      </div>

                    </td>

                    <td className="p-4 font-semibold">
                      {log.score}
                    </td>

                    <td className="p-4">

                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          log.decision === "BLOCK"
                            ? "bg-red-900/40 text-red-400"
                            : log.decision === "WARNING"
                            ? "bg-yellow-900/40 text-yellow-400"
                            : "bg-green-900/40 text-green-400"
                        }`}
                      >
                        {log.decision}
                      </span>

                    </td>

                    <td className="p-4 text-gray-400">
                      {log.categories || "-"}
                    </td>

                    <td className="p-4 text-gray-500 text-sm">
                      {log.created_at
                        ? new Date(log.created_at).toLocaleString()
                        : "-"}
                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        </div>

      </main>

    )}
    </div>
  );
}

export default App;