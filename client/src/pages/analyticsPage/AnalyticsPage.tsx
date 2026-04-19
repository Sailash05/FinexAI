import { useEffect, useState } from "react";
import { motion, } from "framer-motion";
import { PieChart } from "lucide-react";
import { TransactionService } from "../../service/transaction.service";

type Prediction = {
  predicted: number;
  budget: number;
};

type PredictionsResponse = {
  predictions: Record<string, Prediction>;
  summary: string;
};

export default function PredictiveAnalyticsPage() {
  const [predictions, setPredictions] = useState<PredictionsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchPredictions = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await TransactionService.getAnalytics();
      let data = res.data;

      // If predictions is empty, try parsing from summary
      if ((!data.predictions || Object.keys(data.predictions).length === 0) && data.summary) {
        const match = data.summary.match(/```json([\s\S]*)```/);
        if (match) {
          try {
            data = JSON.parse(match[1].trim());
          } catch (err) {
            console.error("Failed to parse AI JSON:", err);
          }
        }
      }

      setPredictions(data);
    } catch (err: any) {
      console.error("Failed to fetch predictions:", err.response?.data?.message || err.message);
      setError("Failed to fetch predictive analytics. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPredictions();
  }, []);

  return (
    <div className="flex flex-col gap-6 p-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <PieChart size={28} className="text-green-400" />
          Predictive Analytics
        </h2>
        <button
          onClick={fetchPredictions}
          className="px-4 py-2 cursor-pointer bg-green-600 hover:bg-green-800 text-white rounded-lg transition"
        >
          Refresh
        </button>
      </div>

      {/* Loading / Error */}
      {loading && <p className="text-gray-400">Loading predictions...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {/* Predictions Table */}
      {predictions && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="overflow-x-auto rounded-xl bg-black/50 backdrop-blur-lg border border-green-700 shadow-lg"
        >
          <table className="w-full text-left text-white border-separate border-spacing-0">
            <thead className="bg-green-900/60">
              <tr>
                <th className="px-4 py-3 rounded-tl-xl">Category</th>
                <th className="px-4 py-3">Predicted Expense</th>
                <th className="px-4 py-3">Suggested Budget</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(predictions.predictions).map(([category, data]) => (
                <tr key={category} className="border-b border-green-700 hover:bg-green-800/40 transition">
                  <td className="px-4 py-3">{category}</td>
                  <td className="px-4 py-3">${data.predicted.toLocaleString()}</td>
                  <td className="px-4 py-3">${data.budget.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Summary */}
          {predictions.summary && (
            <div className="mt-4 p-4 bg-green-800/30 rounded-lg text-white">
              <strong>Summary:</strong> {predictions.summary}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
