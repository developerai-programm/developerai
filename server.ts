import express from "express";
import path from "path";
import fs from "fs";
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

// Recursively get all workspace files helper (excluding node_modules, .git, dist, build, package-lock.json)
function getAllWorkspaceFiles(dirPath: string, fileList: { path: string; content: string }[] = [], relativePath = "") {
  const files = fs.readdirSync(dirPath);

  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    const relPath = relativePath ? `${relativePath}/${file}` : file;

    // Skip ignored directories/files
    if (
      file === "node_modules" ||
      file === ".git" ||
      file === "dist" ||
      file === "package-lock.json" ||
      file === ".env" ||
      file === "results.txt" ||
      file.endsWith(".png") ||
      file.endsWith(".jpg") ||
      file.endsWith(".jpeg") ||
      file.endsWith(".ico") ||
      file.endsWith(".gif") ||
      file.endsWith(".webp")
    ) {
      continue;
    }

    if (fs.statSync(fullPath).isDirectory()) {
      getAllWorkspaceFiles(fullPath, fileList, relPath);
    } else {
      try {
        const content = fs.readFileSync(fullPath, "utf8");
        fileList.push({ path: relPath, content });
      } catch (err) {
        console.error("Error reading file:", fullPath, err);
      }
    }
  }

  return fileList;
}

app.post("/api/github/export", async (req, res) => {
  try {
    const { token, repo, type, chats } = req.body;

    if (!token) {
      return res.status(400).json({ error: "GitHub Personal Access Token (PAT) kiritilishi shart." });
    }

    if (!repo || !repo.includes("/")) {
      return res.status(400).json({ error: "Repository formati noto'g'ri (Masalan: owner/repo)." });
    }

    const [owner, repoName] = repo.split("/");

    const headers = {
      Authorization: `token ${token}`,
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "DEVELOPER-AI-App",
    };

    // 1. Get authenticated user's login
    let authUserLogin = "";
    try {
      const userRes = await axios.get("https://api.github.com/user", { headers });
      authUserLogin = userRes.data.login;
    } catch (err: any) {
      console.error("GitHub Auth profile fetch error:", err.response?.data || err.message);
      return res.status(401).json({ error: "GitHub tokeningiz noto'g'ri yoki uning ruxsati yetarli emas. Iltimos qayta tekshiring." });
    }

    // 2. Check if repo exists, if not, create it
    let repoExists = true;
    try {
      await axios.get(`https://api.github.com/repos/${owner}/${repoName}`, { headers });
    } catch (err: any) {
      if (err.response?.status === 404) {
        repoExists = false;
      } else {
        throw new Error(`Repositoryni tekshirishda xatolik: ${err.response?.data?.message || err.message}`);
      }
    }

    if (!repoExists) {
      try {
        if (owner.toLowerCase() === authUserLogin.toLowerCase()) {
          // Create user repo
          await axios.post(
            "https://api.github.com/user/repos",
            { name: repoName, private: false, auto_init: false },
            { headers }
          );
        } else {
          // Create org repo
          await axios.post(
            `https://api.github.com/orgs/${owner}/repos`,
            { name: repoName, private: false, auto_init: false },
            { headers }
          );
        }
      } catch (err: any) {
        console.error("Repo creation error:", err.response?.data || err.message);
        return res.status(400).json({ 
          error: `GitHub repository yaratib bo'lmadi. '${owner}' tashkilotiga repo yaratish ruxsatingiz bormi yoki '${repoName}' nomli repository allaqachon mavjud emasligini tekshiring.` 
        });
      }
    }

    // 3. Prepare files to commit
    let filesToCommit: { path: string; content: string }[] = [];

    if (type === "chats") {
      // Create readable markdown and json representations of chats
      if (!chats || !Array.isArray(chats) || chats.length === 0) {
        return res.status(400).json({ error: "Eksport qilish uchun suhbatlar topilmadi." });
      }

      let markdownContent = `# DEVELOPER AI - Suhbatlar Tarixi\n\n`;
      chats.forEach((chat: any) => {
        markdownContent += `## ${chat.title || "Suhbat"} (${new Date(chat.timestamp).toLocaleString("uz-UZ")})\n`;
        markdownContent += `**Turi:** ${chat.type ? chat.type.toUpperCase() : "Nomalum"}\n\n`;
        
        if (Array.isArray(chat.messages)) {
          chat.messages.forEach((msg: any) => {
            const roleName = msg.role === "user" ? "Foydalanuvchi" : "DEVELOPER AI";
            const msgText = msg.parts?.[0]?.text || msg.content || "";
            markdownContent += `### 👤 ${roleName}:\n${msgText}\n\n---\n\n`;
          });
        }
      });

      filesToCommit.push({
        path: "chat_conversations.md",
        content: markdownContent,
      });
      filesToCommit.push({
        path: "chat_conversations.json",
        content: JSON.stringify(chats, null, 2),
      });
    } else {
      // Export original repository source files
      filesToCommit = getAllWorkspaceFiles(process.cwd());
    }

    if (filesToCommit.length === 0) {
      return res.status(400).json({ error: "Eksport qilish uchun hech qanday fayl topilmadi." });
    }

    // 4. Multi-file push using Git Database API
    // Get master/main SHA
    let lastCommitSha: string | null = null;
    let baseTreeSha: string | null = null;
    const branchName = "main";

    try {
      const branchRes = await axios.get(
        `https://api.github.com/repos/${owner}/${repoName}/git/ref/heads/${branchName}`,
        { headers }
      );
      lastCommitSha = branchRes.data.object.sha;
      
      const commitRes = await axios.get(
        `https://api.github.com/repos/${owner}/${repoName}/git/commits/${lastCommitSha}`,
        { headers }
      );
      baseTreeSha = commitRes.data.tree.sha;
    } catch (err: any) {
      // Repo is empty or brand new
      lastCommitSha = null;
      baseTreeSha = null;
    }

    // Upload files as Blobs and construct Tree nodes
    const treeNodes: any[] = [];
    for (const file of filesToCommit) {
      try {
        const blobRes = await axios.post(
          `https://api.github.com/repos/${owner}/${repoName}/git/blobs`,
          { content: file.content, encoding: "utf-8" },
          { headers }
        );
        treeNodes.push({
          path: file.path,
          mode: "100644",
          type: "blob",
          sha: blobRes.data.sha,
        });
      } catch (err: any) {
        console.error(`Error uploading blob for ${file.path}:`, err.response?.data || err.message);
      }
    }

    if (treeNodes.length === 0) {
      return res.status(400).json({ error: "Fayllar GitHub blob-lariga yuklanmadi. Iltimos barcha fayllarni qayta tekshiring." });
    }

    // Create the new Tree
    const treePayload: any = { tree: treeNodes };
    if (baseTreeSha) {
      treePayload.base_tree = baseTreeSha;
    }

    const treeRes = await axios.post(
      `https://api.github.com/repos/${owner}/${repoName}/git/trees`,
      treePayload,
      { headers }
    );
    const newTreeSha = treeRes.data.sha;

    // Create a Commit
    const commitPayload: any = {
      message: type === "chats" ? "Save chat conversations logs from DEVELOPER AI" : "Deploy codebase files from DEVELOPER AI applet workspace",
      tree: newTreeSha,
    };
    if (lastCommitSha) {
      commitPayload.parents = [lastCommitSha];
    }

    const commitRes = await axios.post(
      `https://api.github.com/repos/${owner}/${repoName}/git/commits`,
      commitPayload,
      { headers }
    );
    const newCommitSha = commitRes.data.sha;

    // Update the Ref
    if (lastCommitSha) {
      // Update existing ref
      await axios.patch(
        `https://api.github.com/repos/${owner}/${repoName}/git/refs/heads/${branchName}`,
        { sha: newCommitSha, force: true },
        { headers }
      );
    } else {
      // Create new ref
      await axios.post(
        `https://api.github.com/repos/${owner}/${repoName}/git/refs`,
        { ref: `refs/heads/${branchName}`, sha: newCommitSha },
        { headers }
      );
    }

    res.json({
      success: true,
      repoUrl: `https://github.com/${owner}/${repoName}`,
      message: type === "chats" 
        ? "Muvaffaqiyatli yuklandi! Suhbatlar tarixi chat_conversations.md va .json ko'rinishida saqlandi." 
        : "Loyiha fayllari va to'liq kodi muvaffaqiyatli ravishda GitHub repository-ga yuborildi!",
    });
  } catch (error: any) {
    console.error("GitHub Export Global Error:", error.response?.data || error.message);
    res.status(500).json({ error: error.response?.data?.message || error.message });
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

if (process.env.NODE_ENV !== "production" || !process.env.VERCEL) {
  setupVite();
}

export default app;
