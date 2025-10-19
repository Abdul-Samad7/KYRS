import React, { useState } from 'react';
import { api } from '../services/api';
import { SparklesIcon, SendIcon, Loader2Icon, BookOpenIcon } from 'lucide-react';

const AskAnalysis: React.FC = () => {
  const [question, setQuestion] = useState('');
  const [conversation, setConversation] = useState<Array<{
    question: string;
    answer: string;
    recordsAnalyzed: number;
  }>>([]);
  const [loading, setLoading] = useState(false);
  const [style, setStyle] = useState<'brief' | 'detailed'>('brief');

  const researchQuestions = [
    "What's the temperature range of confirmed exoplanets?",
    "How many Earth-sized planets are in the dataset?",
    "Which planets have the shortest orbital periods?",
    "What's the average radius of candidate planets?",
    "Show me planets in the habitable zone",
    "What are the average and median equilibrium temperatures of the planets in this dataset?",
  ];

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || loading) return;

    const currentQuestion = question;
    setQuestion('');
    setLoading(true);

    try {
      const response = await api.askQuestion(currentQuestion, style);
      setConversation(prev => [...prev, {
        question: currentQuestion,
        answer: response.answer,
        recordsAnalyzed: response.records_analyzed
      }]);
    } catch (error) {
      setConversation(prev => [...prev, {
        question: currentQuestion,
        answer: `Error: ${error instanceof Error ? error.message : 'Failed to get answer'}`,
        recordsAnalyzed: 0
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleExampleClick = (example: string) => {
    setQuestion(example);
  };

  return (
    <div className="max-w-5xl mx-auto h-[calc(100vh-120px)] flex flex-col">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white flex items-center gap-2">
          <SparklesIcon className="h-8 w-8 text-blue-400" />
          AI Research Assistant
        </h1>
        <p className="mt-2 text-gray-400">
          Ask questions about your exoplanet dataset using natural language
        </p>
      </div>

      {/* Example Questions */}
      <div className="mb-4 bg-gray-900 border border-gray-800 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <BookOpenIcon className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-400">Example research questions:</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {researchQuestions.map((example, index) => (
            <button
              key={index}
              onClick={() => handleExampleClick(example)}
              className="text-left text-sm bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-2 rounded transition-colors"
            >
              {example}
            </button>
          ))}
        </div>
      </div>

      {/* Conversation Area */}
      <div className="flex-1 overflow-y-auto bg-gray-900 border border-gray-800 rounded-lg p-6 mb-4 space-y-4">
        {conversation.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <SparklesIcon className="h-12 w-12 mx-auto mb-4 text-gray-700" />
              <p>Start by asking a research question about your data</p>
            </div>
          </div>
        ) : (
          conversation.map((item, index) => (
            <div key={index} className="space-y-3">
              {/* Question */}
              <div className="flex justify-end">
                <div className="bg-blue-600 text-white px-4 py-2 rounded-lg max-w-2xl">
                  {item.question}
                </div>
              </div>

              {/* Answer */}
              <div className="flex justify-start">
                <div className="bg-gray-800 border border-gray-700 px-4 py-3 rounded-lg max-w-3xl">
                  <div className="text-gray-300 whitespace-pre-wrap">
                    {item.answer}
                  </div>
                  <div className="mt-2 pt-2 border-t border-gray-700 text-xs text-gray-500">
                    Analyzed {item.recordsAnalyzed.toLocaleString()} records
                  </div>
                </div>
              </div>
            </div>
          ))
        )}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-800 border border-gray-700 px-4 py-3 rounded-lg">
              <Loader2Icon className="h-5 w-5 animate-spin text-blue-400" />
            </div>
          </div>
        )}
      </div>

      {/* Input Form */}
      <form onSubmit={handleAsk} className="bg-gray-900 border border-gray-800 rounded-lg p-4">
        <div className="flex gap-2 mb-3">
          <button
            type="button"
            onClick={() => setStyle('brief')}
            className={`px-3 py-1 rounded text-sm transition-colors ${
              style === 'brief'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
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
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Detailed
          </button>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask a research question..."
            className="flex-1 bg-gray-800 border border-gray-700 text-white placeholder-gray-500 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={!question.trim() || loading}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2"
          >
            {loading ? (
              <Loader2Icon className="h-5 w-5 animate-spin" />
            ) : (
              <SendIcon className="h-5 w-5" />
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AskAnalysis;