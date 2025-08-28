import { useState } from "react";
import axios from "axios";
import { Search, AlertCircle, Pill, Shield, Heart, Stethoscope } from "lucide-react";

function SymptomChecker() {
  const [symptoms, setSymptoms] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCheck = async () => {
    if (!symptoms.trim()) {
      setError("Please enter at least one symptom");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      // ✅ Real API call to Flask backend
      const res = await axios.post("http://127.0.0.1:5000/check-symptoms", {
        symptoms: symptoms.split(",").map(s => s.trim())
      });

      setResult(res.data);
    } catch (err) {
      console.error("API error:", err);
      setError("Unable to analyze symptoms. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleCheck();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 pt-8">
          <div className="flex justify-center items-center mb-4">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-full">
              <Stethoscope className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            AI Symptom Checker
          </h1>
          <p className="text-gray-600 text-lg">
            Describe your symptoms and get instant health insights
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 mb-6">
          <div className="space-y-6">
            {/* Input Section */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Describe Your Symptoms
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g., headache, fever, sore throat, fatigue..."
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full px-4 py-4 pr-12 text-gray-700 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:bg-white focus:outline-none transition-all duration-200 placeholder-gray-400"
                  disabled={loading}
                />
                <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Separate multiple symptoms with commas
              </p>
            </div>

            {/* Check Button */}
            <button
              onClick={handleCheck}
              disabled={loading || !symptoms.trim()}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] disabled:scale-100 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Analyzing Symptoms...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <Search className="h-5 w-5" />
                  <span>Check Symptoms</span>
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-xl mb-6 animate-pulse">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-400 mr-3" />
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden animate-fadeIn">
            {/* Result Header */}
            <div className="bg-gradient-to-r from-emerald-500 to-blue-600 px-6 py-4">
              <div className="flex items-center space-x-3">
                <Heart className="h-6 w-6 text-white" />
                <h3 className="text-xl font-bold text-white">Analysis Results</h3>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Disease */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                <h4 className="text-lg font-semibold text-blue-800 mb-2">Possible Condition</h4>
                <p className="text-2xl font-bold text-blue-900">{result.disease}</p>
              </div>

              {/* Medications */}
              {result.medications && (
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
                  <div className="flex items-center space-x-2 mb-3">
                    <Pill className="h-5 w-5 text-purple-600" />
                    <h4 className="text-lg font-semibold text-purple-800">Recommended Medications</h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {result.medications.map((med, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800 border border-purple-200"
                      >
                        {med}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Precautions */}
              {result.precautions && (
                <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl p-4 border border-emerald-100">
                  <div className="flex items-center space-x-2 mb-3">
                    <Shield className="h-5 w-5 text-emerald-600" />
                    <h4 className="text-lg font-semibold text-emerald-800">Precautions</h4>
                  </div>
                  <ul className="space-y-2">
                    {result.precautions.map((precaution, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-emerald-700 font-medium">{precaution}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Disclaimer */}
            <div className="bg-amber-50 border-t border-amber-100 px-6 py-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-amber-800">
                  <strong>Medical Disclaimer:</strong> This tool provides general health information only. 
                  Please consult with a qualified healthcare professional for proper medical diagnosis and treatment.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SymptomChecker;
