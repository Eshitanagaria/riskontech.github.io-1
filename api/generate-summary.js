// This is a Node.js serverless function that will run on Vercel.
// It receives applicant data, creates a detailed prompt, and securely calls the Gemini API.

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  // --- Get data from the request ---
  const { applicantData } = req.body;

  // --- Validate incoming data ---
  if (!applicantData || !applicantData.history || applicantData.history.length === 0) {
    return res.status(400).json({ error: "Applicant data is missing or invalid." });
  }

  // --- Construct the prompt for Gemini ---
  const latestRecord = applicantData.history.reduce((latest, current) => 
    current.Month_Offset > latest.Month_Offset ? current : latest
  );

  const historyString = applicantData.history
    .filter(d => d.Data_Type === "Historical")
    .map(d => `- Month ${d.Month_Offset}: Payment was ${d.Payment_Status}.`)
    .join("\n");

  const prompt = `
    As a professional credit risk analyst, generate a concise, insightful summary for a loan committee.
    The summary must be 2-3 detailed paragraphs long.
    Analyze the provided alternative data points for the applicant and conclude with a clear recommendation.
    Do not just list the data; interpret it. Explain what the patterns in the payment history imply about the applicant's financial stability and character.

    **Applicant Data:**
    - Final Applicant ID: ${latestRecord.Applicant_ID}
    - Final Risk Category determined by our model: ${latestRecord.Risk_Category}
    - Final Predicted Probability of Default: ${(latestRecord.Predicted_Prob_Default * 100).toFixed(2)}%

    **Detailed Payment History:**
    ${historyString || "No historical payments available."}

    **Analysis Task:**
    1.  Start with a clear opening statement declaring the applicant's risk level and the model's confidence (default probability).
    2.  Analyze the payment history. If it's good, emphasize the consistency and diligence. If it's bad, highlight the severity and frequency of delinquencies. If it's mixed, describe the volatility and what it might suggest about the applicant's financial situation.
    3.  Conclude with a firm, professional recommendation. For example: "Based on the consistent and proactive payment behavior, this applicant is highly recommended for credit extension." or "Given the pattern of severe delinquency, this applicant represents a significant credit risk and is not recommended for approval at this time."
  `;

  // --- Call the Gemini API ---
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "API key is not configured on the server." });
  }

  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;

  try {
    const apiResponse = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      }),
    });

    if (!apiResponse.ok) {
        const errorBody = await apiResponse.json();
        console.error("Gemini API Error:", errorBody);
        throw new Error(`Gemini API responded with status: ${apiResponse.status}`);
    }

    const responseData = await apiResponse.json();
    const summaryText = responseData.candidates[0].content.parts[0].text;
    
    // --- Send the generated summary back to the front-end ---
    res.status(200).json({ summary: summaryText });

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    res.status(500).json({ error: "Failed to generate summary from the API." });
  }
}
