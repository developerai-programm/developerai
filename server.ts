import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

app.use(express.json({ limit: '10mb' }));

app.post("/api/chat", async (req, res) => {
  try {
    const { message, history, type } = req.body;
    
    let modelName = "llama-3.3-70b-versatile"; 
    let systemInstruction = "Siz DEVELOPER AI professional yordamchisiz. O'zbek tilida muloyim va foydali javob berasiz.";

    if (type === 'code') {
      modelName = "llama-3.3-70b-versatile";
      systemInstruction = "Siz professional dasturchisiz. Kodlar yozishda va xatolarni tuzatishda yordam berasiz.";
    } else if (type === 'code-edit') {
      modelName = "llama-3.3-70b-versatile"; 
      systemInstruction = "Siz tajribali kod taxrirlovchisiz. Ta'qdim etilgan kodni optimallashtiring va yaxshilang.";
    } else if (type === 'file-analyze') {
      modelName = "mixtral-8x7b-32768";
      systemInstruction = "Siz fayllarni tahlil qilish bo'yicha mutaxassissiz. Fayl mazmunini o'rganib tafsilotlarni tushuntirasiz.";
    } else if (type === 'translate') {
      modelName = "llama-3.3-70b-versatile";
      systemInstruction = "Siz professional tarjimonsiz. Matnlarni o'zbek tilidan istalgan tilga va aksincha, ma'no yo'qolmagan holda tarjima qiling.";
    } else {
      modelName = "llama-3.3-70b-versatile";
    }

    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemInstruction },
        ...(history || []).map((m: any) => ({
          role: m.role === 'model' ? 'assistant' : 'user',
          content: m.parts[0].text
        })),
        { role: "user", content: message }
      ],
      model: modelName,
    });

    res.json({ text: completion.choices[0]?.message?.content || "" });
  } catch (error: any) {
    console.error("Groq Error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/generate-image", async (req, res) => {
  res.status(403).json({ error: "Rasm yasash vaqtincha o'chiq." });
});

app.post("/api/search", async (req, res) => {
  try {
    const { query } = req.body;
    const completion = await groq.chat.completions.create({
      messages: [
        { 
          role: "system", 
          content: "Siz web izlash va ma'lumotlarni umumlashtirish bo'yicha mutaxassissiz. Groq Compound modelisiz." 
        },
        { role: "user", content: query }
      ],
      model: "llama-3.3-70b-versatile",
    });

    res.json({ text: completion.choices[0]?.message?.content || "" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/create-checkout", async (req, res) => {
  try {
    const { plan, isAnnual, userId } = req.body;
    const amount = plan === 'Pro' ? (isAnnual ? 419990 : 39990) : (isAnnual ? 639990 : 59990);
    
    res.json({ 
      checkoutUrl: `https://checkout.uz/pay?amount=${amount}&account=${userId}&service_id=YOUR_SERVICE_ID` 
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

async function setupVite() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

setupVite();
