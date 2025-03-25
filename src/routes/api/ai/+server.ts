import { json, type RequestHandler } from "@sveltejs/kit";
import { Ollama } from "ollama";

export const POST: RequestHandler = async ({ request }) => {
  try {
    const { message } = await request.json();
    const ollama = new Ollama({ host: "http://localhost:11434" });

    // User-specific data
    const dataofUser = {
      name: "Knight",
      course: "BSCS",
      hobbies: ["Working Out", "Programming"],
      favoriteFoods: ["Beef", "Eggs"],
      userType: "User",
    };

    // System prompt to enforce JSON response
    const systemPrompt = `
            Here is the information of the user: ${JSON.stringify(dataofUser)}.
            You MUST return your response in valid JSON format, following this schema:
            {
                "summary_of_context_data": "string",
                "master_user_name": "string",
                "sensitive_information_present": true/false,
                "confidence_level": 1-10,
                "user_persona_description": "string"
            }
            Do not include extra text before or after the JSON. Ensure it is properly formatted.
        `;

    // AI Chat interaction
    const chat = await ollama.chat({
      model: "llama3",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message },
      ],
    });

    let aiResponse;
    try {
      aiResponse = JSON.parse(chat.message.content); // Ensure JSON parsing
    } catch (error) {
      aiResponse = { error: "Invalid JSON response from AI." };
    }

    return json({ response: aiResponse });
  } catch (error) {
    return json({ error: "Something went wrong." }, { status: 500 });
  }
};
