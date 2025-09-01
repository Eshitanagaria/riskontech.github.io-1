const applicantsData = {
  "120397": {
    "personal": { "name": "Rohan Gupta", "dob": "21/04/1986", "gender": "Male" },
    "graphImage": "graphs/riskon_animation_applicant_120397.gif",
    "graphImageStatic": "graphs/riskon_static_graph_applicant_120397.png", // Static version for PDF
    "geminiSummary": "The applicant, Rohan Gupta, is classified as 'Low' risk. The animated tracking graph demonstrates a consistently low and stable probability of default over the observed period. Historical payment data shows a perfect record of on-time payments, indicating strong financial discipline and reliability. The model's forecast suggests this stability will continue, making the applicant a prime, low-risk candidate for credit extension.",
    "history": [
      {"Risk_Category":"Low", "Month_Offset": -6, "Payment_Status": "On Time", "Predicted_Prob_Default": 0.06},
      {"Risk_Category":"Low", "Month_Offset": -3, "Payment_Status": "2 days early", "Predicted_Prob_Default": 0.05},
      {"Risk_Category":"Low", "Month_Offset": 0, "Payment_Status": "On Time", "Predicted_Prob_Default": 0.05}
    ]
  },
  "205743": {
    "personal": { "name": "Isha Reddy", "dob": "19/11/1991", "gender": "Female" },
    "graphImage": "graphs/riskon_animation_applicant_205743.gif",
    "graphImageStatic": "graphs/riskon_static_graph_applicant_205743.png",
    "geminiSummary": "This applicant, Isha Reddy, is flagged as a 'High' risk profile. The tracking animation clearly shows a sharp and sustained increase in the probability of default, peaking at over 80%. This trajectory is corroborated by a history of consistently late payments. This pattern suggests significant financial instability and a high likelihood of future delinquency. Extreme caution is advised, and credit is not recommended at this time.",
    "history": [
      {"Risk_Category":"Medium", "Month_Offset": -6, "Payment_Status": "5 days late", "Predicted_Prob_Default": 0.55},
      {"Risk_Category":"High", "Month_Offset": -3, "Payment_Status": "15 days late", "Predicted_Prob_Default": 0.75},
      {"Risk_Category":"High", "Month_Offset": 0, "Payment_Status": "25 days late", "Predicted_Prob_Default": 0.85}
    ]
  },
  "229335": {
    "personal": { "name": "Amit Kumar", "dob": "30/07/1978", "gender": "Male" },
    "graphImage": "graphs/riskon_animation_applicant_229335.gif",
    "graphImageStatic": "graphs/riskon_static_graph_applicant_229335.png",
    "geminiSummary": "Amit Kumar is assessed as a 'Low' risk candidate. His animated risk profile, while showing minor fluctuations, remains consistently within the low-probability-of-default range. His payment history is exemplary, with all installments paid on time or slightly early. This demonstrates a reliable and responsible financial character, making him a strong candidate for lending.",
    "history": [
      {"Risk_Category":"Low", "Month_Offset": -4, "Payment_Status": "On Time", "Predicted_Prob_Default": 0.10},
      {"Risk_Category":"Low", "Month_Offset": -2, "Payment_Status": "1 day early", "Predicted_Prob_Default": 0.08},
      {"Risk_Category":"Low", "Month_Offset": 0, "Payment_Status": "On Time", "Predicted_Prob_Default": 0.08}
    ]
  },
  "234968": {
    "personal": { "name": "Sneha Patel", "dob": "02/02/1995", "gender": "Female" },
    "graphImage": "graphs/riskon_animation_applicant_234968.gif",
    "graphImageStatic": "graphs/riskon_static_graph_applicant_234968.png",
    "geminiSummary": "The applicant, Sneha Patel, represents a 'High' risk profile, with the model showing a dangerously high and worsening probability of default over time. The tracking graph indicates a steep upward trend, culminating in a near-certain default prediction. This is supported by a history of severely delinquent payments. Based on this data, the applicant is deemed to have a very high likelihood of default, and credit extension is strongly discouraged.",
    "history": [
      {"Risk_Category":"Medium", "Month_Offset": -5, "Payment_Status": "10 days late", "Predicted_Prob_Default": 0.60},
      {"Risk_Category":"High", "Month_Offset": -2, "Payment_Status": "20 days late", "Predicted_Prob_Default": 0.80},
      {"Risk_Category":"High", "Month_Offset": 0, "Payment_Status": "30+ days late", "Predicted_Prob_Default": 0.95}
    ]
  },
  "257537": {
    "personal": { "name": "Varun Singh", "dob": "15/09/1989", "gender": "Male" },
    "graphImage": "graphs/riskon_animation_applicant_257537.gif",
    "graphImageStatic": "graphs/riskon_static_graph_applicant_257537.png",
    "geminiSummary": "Varun Singh's profile is categorized as 'Medium' risk. The animated graph shows significant volatility, with the risk score fluctuating between lower and higher thresholds. This instability is reflected in a mixed payment history, which includes both on-time payments and a notable instance of a 10-day delay. This pattern suggests a degree of financial unpredictability, warranting a cautious approach and potentially stricter lending terms.",
    "history": [
      {"Risk_Category":"Low", "Month_Offset": -6, "Payment_Status": "On Time", "Predicted_Prob_Default": 0.30},
      {"Risk_Category":"Medium", "Month_Offset": -3, "Payment_Status": "10 days late", "Predicted_Prob_Default": 0.60},
      {"Risk_Category":"Medium", "Month_Offset": 0, "Payment_Status": "On Time", "Predicted_Prob_Default": 0.55}
    ]
  },
  "338391": {
    "personal": { "name": "Pooja Sharma", "dob": "25/12/1993", "gender": "Female" },
    "graphImage": "graphs/riskon_animation_applicant_338391.gif",
    "graphImageStatic": "graphs/riskon_static_graph_applicant_338391.png",
    "geminiSummary": "Pooja Sharma is a 'Low' risk applicant. The model's tracking visualization shows that while there was a slight elevation in risk in the past, her profile has since stabilized to a very low probability of default. Her payment history is clean, with all recent payments made on time. This positive trend indicates a responsible borrower who has successfully managed their financial obligations. She is recommended for approval.",
    "history": [
      {"Risk_Category":"Medium", "Month_Offset": -8, "Payment_Status": "3 days late", "Predicted_Prob_Default": 0.25},
      {"Risk_Category":"Low", "Month_Offset": -4, "Payment_Status": "On Time", "Predicted_Prob_Default": 0.10},
      {"Risk_Category":"Low", "Month_Offset": 0, "Payment_Status": "On Time", "Predicted_Prob_Default": 0.10}
    ]
  },
  "348704": {
    "personal": { "name": "Karan Malhotra", "dob": "11/06/1982", "gender": "Male" },
    "graphImage": "graphs/riskon_animation_applicant_348704.gif",
    "graphImageStatic": "graphs/riskon_static_graph_applicant_348704.png",
    "geminiSummary": "Karan Malhotra is assessed as a 'High' risk candidate. The animated tracking graph shows a clear and worrying upward trend in default probability, moving from a moderate to a high-risk zone. This is consistent with a deteriorating payment history, starting with on-time payments but escalating to significant delays. This trajectory suggests increasing financial distress. The model strongly indicates a high likelihood of future default.",
    "history": [
      {"Risk_Category":"Low", "Month_Offset": -7, "Payment_Status": "On Time", "Predicted_Prob_Default": 0.20},
      {"Risk_Category":"Medium", "Month_Offset": -5, "Payment_Status": "12 days late", "Predicted_Prob_Default": 0.65},
      {"Risk_Category":"High", "Month_Offset": 0, "Payment_Status": "28 days late", "Predicted_Prob_Default": 0.90}
    ]
  },
  "419683": {
    "personal": { "name": "Diya Joshi", "dob": "08/03/1990", "gender": "Female" },
    "graphImage": "graphs/riskon_animation_applicant_419683.gif",
    "graphImageStatic": "graphs/riskon_static_graph_applicant_419683.png",
    "geminiSummary": "The applicant, Diya Joshi, has a 'Medium' risk profile. Her risk trajectory, as shown in the animated graph, is volatile, hovering in the 40-50% probability range. Her payment history confirms this inconsistency, with a mix of early payments and moderately late payments. This pattern indicates that while she is generally capable of meeting her obligations, there is a tangible risk of periodic financial difficulty. A cautious approach is advised.",
    "history": [
      {"Risk_Category":"Low", "Month_Offset": -9, "Payment_Status": "5 days early", "Predicted_Prob_Default": 0.35},
      {"Risk_Category":"Medium", "Month_Offset": -6, "Payment_Status": "8 days late", "Predicted_Prob_Default": 0.50},
      {"Risk_Category":"Medium", "Month_Offset": 0, "Payment_Status": "On Time", "Predicted_Prob_Default": 0.45}
    ]
  },
  "440013": {
    "personal": { "name": "Sameer Khan", "dob": "14/10/1987", "gender": "Male" },
    "graphImage": "graphs/riskon_animation_applicant_440013.gif",
    "graphImageStatic": "graphs/riskon_static_graph_applicant_440013.png",
    "geminiSummary": "Sameer Khan is rated as a 'Low' risk applicant. The visual tracking data shows a consistently low probability of default that remains stable over time. This is backed by a perfect record of on-time payments. The applicant exhibits all the characteristics of a financially responsible individual with stable income and disciplined payment habits. He is considered a very safe and creditworthy candidate.",
    "history": [
      {"Risk_Category":"Low", "Month_Offset": -5, "Payment_Status": "On Time", "Predicted_Prob_Default": 0.12},
      {"Risk_Category":"Low", "Month_Offset": -3, "Payment_Status": "On Time", "Predicted_Prob_Default": 0.12},
      {"Risk_Category":"Low", "Month_Offset": 0, "Payment_Status": "On Time", "Predicted_Prob_Default": 0.12}
    ]
  }
};
