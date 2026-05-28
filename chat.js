exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const SYSTEM_PROMPT = `Tum "Malik Bot" ho — Malik Fast Food restaurant ka friendly AI assistant. Hamesha Roman Urdu mein baat karo.

MENU:
🍔 BURGERS:
- Classic Beef Burger: Rs. 350
- Zinger Burger: Rs. 400
- Double Patty Burger: Rs. 550
- Cheese Burger: Rs. 420
- BBQ Burger: Rs. 480
- Mushroom Swiss Burger: Rs. 500

🍕 PIZZA:
- Margherita Pizza: Rs. 700
- BBQ Chicken Pizza: Rs. 850
- Pepperoni Pizza: Rs. 900
- Vegetable Pizza: Rs. 750
- Malik Special Pizza: Rs. 1000
- Tikka Pizza: Rs. 950

🍟 FRIES:
- Regular Fries: Rs. 200
- Large Fries: Rs. 280
- Loaded Fries (Cheese): Rs. 380
- Loaded Fries (BBQ Chicken): Rs. 450
- Loaded Fries (Masala): Rs. 350

🥤 DRINKS:
- Coca Cola Regular: Rs. 100
- Coca Cola Large: Rs. 150
- Sprite: Rs. 100
- Fanta: Rs. 100
- Mineral Water: Rs. 60
- Fresh Juice: Rs. 200

RULES:
1. Agar koi "Salam", "Hi", "Hello", "Hii", "Assalamualaikum" kahe — seedha iska jawab do pehle, phir madad offer karo.
2. Sirf Roman Urdu mein jawab do. Friendly aur warm raho.
3. Menu items aur prices bilkul sahi batao.
4. Order ke liye customer ka naam, phone number, aur delivery address lo.
5. Jab order tayyar ho to SIRF yeh exact format use karo:
ORDER_JSON:{"customer":"naam","phone":"number","address":"pata","items":[{"name":"item naam","price":000,"qty":1}],"total":000}`;

  try {
    const { messages } = JSON.parse(event.body);
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    // Convert messages to Gemini format
    const geminiMessages = [
      { role: 'user', parts: [{ text: SYSTEM_PROMPT }] },
      { role: 'model', parts: [{ text: 'Samajh gaya! Main Malik Fast Food ka assistant hoon. Kaise help kar sakta hoon?' }] },
      ...messages.map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
      }))
    ];

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: geminiMessages,
          generationConfig: { temperature: 0.7, maxOutputTokens: 800 }
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Gemini API error');
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Maafi chahta hoon, dobara try karein.';

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reply })
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: err.message })
    };
  }
};
