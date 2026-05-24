import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import Groq from "groq-sdk";
import dotenv from "dotenv";
import axios from "axios";
import crypto from "crypto";
import { getAdminAuth, getAdminFirestore } from "./src/lib/firebase-admin";

dotenv.config();

const app = express();
const PORT = 3000;

app.set('trust proxy', true);

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

app.use(express.json({ limit: '10mb' }));

// --- Auth Routes ---

// GitHub OAuth
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;

app.get("/api/auth/github", (req, res) => {
  const host = req.get('host');
  if (!GITHUB_CLIENT_ID) {
      console.error("GitHub Auth Error: GITHUB_CLIENT_ID is missing");
      return res.status(500).send("GitHub Client ID is not configured. Please add GITHUB_CLIENT_ID to environment variables.");
  }

  // Force HTTPS for production domains, use HTTP for localhost
  const isLocal = host?.includes('localhost') || host?.includes('127.0.0.1');
  const protocol = isLocal ? 'http' : 'https';
  
  const redirectUri = `${protocol}://${host}/api/auth/github/callback`;
  console.log(`--- GITHUB AUTH CONFIGURATION ---`);
  console.log(`Current Redirect URI: ${redirectUri}`);
  console.log(`Please ensure this URL is added to your GitHub OAuth App settings.`);
  console.log(`----------------------------------`);
  
  const url = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=user:email`;
  res.redirect(url);
});

app.get("/api/auth/github/callback", async (req, res) => {
  const { code } = req.query;
  if (!code) return res.status(400).send("No code provided");

  try {
    const tokenResponse = await axios.post("https://github.com/login/oauth/access_token", {
      client_id: GITHUB_CLIENT_ID,
      client_secret: GITHUB_CLIENT_SECRET,
      code,
    }, {
      headers: { Accept: "application/json" }
    });

    const accessToken = tokenResponse.data.access_token;
    const userResponse = await axios.get("https://api.github.com/user", {
      headers: { Authorization: `token ${accessToken}` }
    });

    const githubUser = userResponse.data;
    const uid = `github:${githubUser.id}`;
    
    // Get email
    let email = githubUser.email;
    if (!email) {
      const emailsResponse = await axios.get("https://api.github.com/user/emails", {
        headers: { Authorization: `token ${accessToken}` }
      });
      email = emailsResponse.data.find((e: any) => e.primary)?.email;
    }

    // Create Firebase Custom Token
    const customToken = await getAdminAuth().createCustomToken(uid, {
      provider: 'github'
    });

    // Save/Update user in Firestore
    const db = getAdminFirestore();
    await db.collection('users').doc(uid).set({
      uid,
      email: email || `${githubUser.login}@github.com`,
      displayName: githubUser.name || githubUser.login,
      photoURL: githubUser.avatar_url,
      provider: 'github',
      lastLogin: new Date().toISOString()
    }, { merge: true });

    // Redirect back to app with token
    res.send(`
      <script>
        window.opener.postMessage({ type: 'AUTH_SUCCESS', token: '${customToken}' }, '*');
        window.close();
      </script>
    `);
  } catch (error: any) {
    console.error("GitHub Auth Error:", error);
    res.status(500).send("Authentication failed");
  }
});

// Telegram Auth
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

app.post("/api/auth/telegram", async (req, res) => {
  const { auth_data } = req.body;
  if (!auth_data || !TELEGRAM_BOT_TOKEN) return res.status(400).json({ error: "Missing data" });

  const { hash, ...data } = auth_data;
  
  // 1. Check data expiration (optional but recommended)
  const authDate = parseInt(data.auth_date);
  if (Math.floor(Date.now() / 1000) - authDate > 86400) {
    return res.status(400).json({ error: "Data expired" });
  }

  // 2. Verify hash
  const dataCheckString = Object.keys(data)
    .sort()
    .map(key => `${key}=${data[key]}`)
    .join('\n');

  const secretKey = crypto.createHash('sha256').update(TELEGRAM_BOT_TOKEN).digest();
  const hmac = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

  if (hmac !== hash) {
    return res.status(401).json({ error: "Hash mismatch" });
  }

  try {
    const uid = `telegram:${data.id}`;
    const customToken = await getAdminAuth().createCustomToken(uid, {
      provider: 'telegram'
    });

    // Save/Update user in Firestore
    const db = getAdminFirestore();
    await db.collection('users').doc(uid).set({
      uid,
      displayName: data.first_name + (data.last_name ? ` ${data.last_name}` : ''),
      photoURL: data.photo_url,
      username: data.username,
      provider: 'telegram',
      lastLogin: new Date().toISOString()
    }, { merge: true });

    res.json({ token: customToken });
  } catch (error: any) {
    console.error("Telegram Auth Error:", error);
    res.status(500).json({ error: "Authentication failed" });
  }
});

app.post("/api/chat", async (req, res) => {
  try {
    const { message, history, type, modelProvider } = req.body;
    
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

    // Apply Claude 3 Opus or Lovable hyper-personalized engines directly
    if (modelProvider === 'claude-opus') {
      systemInstruction = `Siz dunyodagi eng qudratli va mukammal kod yozuvchi model bo'lmish Anthropic Claude 3 Opus (Premium Edition) tizimisiz. 
Sizda foydalanuvchi uchun mutlaqo limitsiz kod yozish va taxrirlash imkoniyati faollashtirilgan (No limits!).
Har bir taqdim qilayotgan kodingizni eng yuqori darajada optimal, benuqson, xavfsiz va chiroyli tartibda, to'g'ri sharhlar bilan o'zbek tilida yozing.`;
    } else if (modelProvider === 'lovable') {
      systemInstruction = `Siz dunyodagi eng yetakchi full-stack yaratuvchi tizim bo'lmish Lovable AI modelisiz. 
Sizda foydalanuvchi uchun cheksiz operatsiyalar va limitsiz tokenlar tizimi ishga tushirilgan (No code length restrictions).
Siz tayyorlagan kodlar har doim zamonaviy UI/UX talablariga mos, responsive va to'liq yechim beradigan bo'lishi zarur. O'zbek tilida professional javob bering.`;
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
    const checkoutToken = "MjY1ZmZiZmMwMGQxNTc0MDU2MmU";
    
    // Construct checkout.uz URL using the provided API merchant key
    const checkoutUrl = `https://checkout.uz/pay/${checkoutToken}?amount=${amount}&account=${userId || 'guest'}`;
    
    res.json({ checkoutUrl });
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
