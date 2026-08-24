import { useState } from "react";
import axios from "axios";

function Chat() {
  const [message, setMessage] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!message.trim()) return;

    setLoading(true);

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/chat",
        { message }
      );

      setResult(response.data);
    } catch (error) {
      console.error(error);
      setResult({
        response: "Erreur de connexion avec le backend.",
      });
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">

      <h1 className="text-3xl font-bold">
        Secure AI Chat
      </h1>

      <p className="text-gray-400 mt-2">
        Testez la sécurité de vos prompts avant leur traitement par le LLM.
      </p>

      <div className="max-w-4xl mx-auto mt-10">

        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Écrivez votre prompt..."
          className="w-full h-40 bg-gray-900 border border-gray-700 rounded-xl p-4 outline-none focus:border-blue-500"
        />

        <button
          onClick={sendMessage}
          disabled={loading}
          className="mt-4 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold"
        >
          {loading ? "Analyse..." : "Analyser le prompt"}
        </button>

        {result && (
          <div className="mt-8 bg-gray-900 border border-gray-800 rounded-xl p-6">

            <h2 className="text-xl font-semibold mb-4">
              Security Analysis
            </h2>

            {result.security && (
              <div className="mb-6">

                <p>
                  Score :
                  <strong className="ml-2">
                    {result.security.score}
                  </strong>
                </p>

                <p className="mt-2">
                  Decision :
                  <strong
                    className={`ml-2 ${
                      result.security.decision === "BLOCK"
                        ? "text-red-400"
                        : result.security.decision === "WARNING"
                        ? "text-yellow-400"
                        : "text-green-400"
                    }`}
                  >
                    {result.security.decision}
                  </strong>
                </p>

              </div>
            )}

            <div className="border-t border-gray-800 pt-5">

              <h3 className="text-gray-400 mb-2">
                Response
              </h3>

              <p className="whitespace-pre-wrap">
                {result.response}
              </p>

            </div>

          </div>
        )}

      </div>

    </div>
  );
}

export default Chat;