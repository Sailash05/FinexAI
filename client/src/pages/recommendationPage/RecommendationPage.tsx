import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Lightbulb } from "lucide-react";
import { TransactionService } from "../../service/transaction.service";

type Recommendation = {
  category: string;
  advice: string;
};

type RecommendationsResponse = {
  recommendations: Recommendation[];
  summary: string;
};

export default function SmartRecommendationsPage() {
  const [recommendations, setRecommendations] = useState<RecommendationsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await TransactionService.getRecommendation(); // call backend /ai/recommendations
      setRecommendations(res.data);
    } catch (err: any) {
      console.error("Failed to fetch recommendations:", err.response?.data?.message || err.message);
      setError("Failed to fetch smart recommendations. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  return (
    <div className="flex flex-col gap-6 p-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Lightbulb size={28} className="text-yellow-400" />
          Smart Recommendations
        </h2>
        <button
          onClick={fetchRecommendations}
          className="px-4 py-2 cursor-pointer bg-yellow-600 hover:bg-yellow-800 text-white rounded-lg transition"
        >
          Refresh
        </button>
      </div>

      {/* Loading / Error */}
      {loading && <p className="text-gray-400">Fetching recommendations...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {/* Recommendations Table */}
      {recommendations && (
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
  className="overflow-x-auto rounded-2xl bg-black/80 backdrop-blur-md border border-violet-700 shadow-lg p-6"
>
  <h3 className="text-xl font-semibold text-violet-400 mb-4">Category-wise Recommendations</h3>
  <div className="flex flex-col gap-4">
    {recommendations.recommendations.map((rec, i) => (
      <div
        key={i}
        className="p-4 bg-black/60 border border-violet-600 rounded-xl text-white hover:bg-black/70 transition shadow-sm"
      >
        <strong className="text-violet-300">{rec.category}:</strong>{" "}
        <span>{rec.advice}</span>
      </div>
    ))}
  </div>

  {/* Summary */}
  {recommendations.summary && (
    <div className="mt-6 p-4 bg-violet-900/30 rounded-xl text-white shadow-inner">
      <strong className="text-violet-200">Overall Summary:</strong> {recommendations.summary}
    </div>
  )}
</motion.div>


      )}
    </div>
  );
}
