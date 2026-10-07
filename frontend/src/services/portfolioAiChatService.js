const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5050';

/**
 * Ask the digital twin / AI avatar a question about the portfolio
 * Uses backend's OpenAI GPT-4o-mini integration
 *
 * @param {object} portfolio - Complete portfolio JSON schema
 * @param {Array<{role: string, content: string}>} messages - Prior chat history
 * @param {string} question - New question from visitor/recruiter
 * @returns {Promise<string>} - AI response
 */
export async function askPortfolioAi(portfolio, messages, question) {
  try {
    const botConfig = portfolio?.aiChatbot || {};

    const res = await fetch(`${API_BASE_URL}/api/v1/ai/portfolio-chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        portfolio,
        messages,
        question,
        provider: botConfig.provider || 'openai',
        apiKey: botConfig.apiKey || undefined,
        model: botConfig.model || undefined,
      }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data?.error?.message || 'Erreur lors de la réponse IA');
    }

    return data.data.reply;
  } catch (error) {
    console.error('Error contacting Portfolio AI:', error);
    throw error;
  }
}
