import { ArrowRight, Wallet, BarChart, Brain } from "lucide-react";

const HomePage = () => {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center py-20 px-6 bg-gradient-to-b from-violet-900/50 to-black">
        <h1 className="text-4xl md:text-6xl font-bold text-violet-400 mb-6">
          Welcome to Smart Finance
        </h1>
        <p className="text-lg md:text-xl text-gray-300 max-w-2xl mb-8">
          Track your expenses, analyze spending habits, and get AI-powered 
          insights to save more and spend smarter.
        </p>
        <button className="bg-violet-600 hover:bg-violet-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 transition">
          Get Started <ArrowRight size={18} />
        </button>
      </section>

      {/* Features Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 px-8 md:px-20 py-16">
        <div className="bg-violet-900/30 border border-violet-700 rounded-2xl p-6 shadow-lg hover:shadow-violet-500/20 transition">
          <Wallet className="text-violet-400 w-10 h-10 mb-4" />
          <h3 className="text-xl font-semibold text-violet-300 mb-2">Expense Tracking</h3>
          <p className="text-gray-300">
            Keep track of your daily income and expenses with ease.
          </p>
        </div>

        <div className="bg-violet-900/30 border border-violet-700 rounded-2xl p-6 shadow-lg hover:shadow-violet-500/20 transition">
          <BarChart className="text-violet-400 w-10 h-10 mb-4" />
          <h3 className="text-xl font-semibold text-violet-300 mb-2">Smart Analytics</h3>
          <p className="text-gray-300">
            Visualize spending trends and identify areas to save money.
          </p>
        </div>

        <div className="bg-violet-900/30 border border-violet-700 rounded-2xl p-6 shadow-lg hover:shadow-violet-500/20 transition">
          <Brain className="text-violet-400 w-10 h-10 mb-4" />
          <h3 className="text-xl font-semibold text-violet-300 mb-2">AI Insights</h3>
          <p className="text-gray-300">
            Get personalized recommendations to manage your finances better.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-6 border-t border-violet-800 mt-auto">
        <p className="text-gray-400 text-sm">
          © {new Date().getFullYear()} FinexAI. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default HomePage;
