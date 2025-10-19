import React, { useState } from 'react';
import { api } from '../services/api';
import { SparklesIcon, SendIcon, Loader2Icon } from 'lucide-react';

const AskChat: React.FC = () => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recordsAnalyzed, setRecordsAnalyzed] = useState<number | null>(null);
  const [style, setStyle] = useState<'brief' | 'detailed'>('brief');

  const exampleQuestions = [
    "What are the 3 hottest exoplanets?",
    "Tell me about Kepler-22 b",
    "Which planets are in the habitable zone?",
    "What's the smallest confirmed exoplanet?",
    "How many planets orbit stars cooler than the Sun?"
  ];

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || loading) return;

    setLoading(true);
    setError(null);
    setAnswer('');
    setRecordsAnalyzed(null);

    try {
      const response = await api.askQuestion(question, style);
      setAnswer(response.answer);
      setRecordsAnalyzed(response.records_analyzed);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get answer');
    } finally {
      setLoading(false);
    }
  };

  const handleExampleClick = (example: string) => {
    setQuestion(example);
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-blue-500/10 rounded-full px-4 py-2 mb-4">
          <SparklesIcon className="h-5 w-5 text-blue-400" />
          <span className="text-blue-400 font-medium">Powered by Gemini 2.5 Flash</span>
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">Ask About Exoplanets</h2>
        <p className="text-gray-400">
          Get instant answers about NASA's Kepler exoplanet data using natural language
        </p>
      </div>

      {/* Example Questions */}
      <div className="mb-6">
        <p className="text-sm text-gray-400 mb-3">Try asking:</p>
        <div className="flex flex-wrap gap-2">
          {exampleQuestions.map((example, index) => (
            <button
              key={index}
              onClick={() => handleExampleClick(example)}
              className="text-sm bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-2 rounded-lg transition-colors"
            >
              {example}
            </button>
          ))}
        </div>
      </div>

      {/* Input Form */}
      <form onSubmit={handleAsk} className="mb-6">
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask anything about exoplanets..."
            className="w-full bg-transparent text-white placeholder-gray-500 focus:outline-none resize-none"
            rows={3}
            disabled={loading}
          />
          
          <div className="flex items-center justify-between mt-4">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStyle('brief')}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  style === 'brief'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Brief
              </button>
              <button
                type="button"
                onClick={() => setStyle('detailed')}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  style === 'detailed'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Detailed
              </button>
            </div>

            <button
              type="submit"
              disabled={!question.trim() || loading}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors"
            >
              {loading ? (
                <>
                  <Loader2Icon className="h-4 w-4 animate-spin" />
                  Thinking...
                </>
              ) : (
                <>
                  <SendIcon className="h-4 w-4" />
                  Ask
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Error */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 mb-6">
          <p className="text-red-400">❌ {error}</p>
        </div>
      )}

      {/* Answer */}
      {answer && (
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-start gap-3 mb-4">
            <SparklesIcon className="h-6 w-6 text-blue-400 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white mb-2">Answer</h3>
              <div className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                {answer}
              </div>
            </div>
          </div>
          
          {recordsAnalyzed !== null && (
            <div className="mt-4 pt-4 border-t border-gray-700">
              <p className="text-sm text-gray-400">
                📊 Analyzed {recordsAnalyzed.toLocaleString()} exoplanets to answer your question
              </p>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!answer && !loading && !error && (
        <div className="text-center py-12">
          <SparklesIcon className="h-12 w-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500">Ask a question to get started</p>
        </div>
      )}
    </div>
  );
};

export default AskChat;