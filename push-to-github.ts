import fs from "fs";
import path from "path";
import axios from "axios";

const token = process.argv[2];
const repo = process.argv[3] || "developerai-programm/developerai";

if (!token) {
  console.error("Xatolik: GitHub Personal Access Token taqdim etilmagan.");
  process.exit(1);
}

const [owner, repoName] = repo.split("/");
if (!owner || !repoName) {
  console.error("Xatolik: Repozitoriya nomi noto'g'ri (format: owner/repo).");
  process.exit(1);
}

const headers = {
  Authorization: `token ${token}`,
  Accept: "application/vnd.github.v3+json",
  "User-Agent": "DEVELOPER-AI-Pusher",
};

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
        // Skip binary or unreadable files
      }
    }
  }

  return fileList;
}

async function run() {
  try {
    console.log(`GitHub-ga ulanish tekshirilmoqda...`);
    const userRes = await axios.get("https://api.github.com/user", { headers });
    const authUserLogin = userRes.data.login;
    console.log(`Muvaffaqiyatli ulandi! Foydalanuvchi: ${authUserLogin}`);

    // Check if repo exists
    let repoExists = true;
    try {
      await axios.get(`https://api.github.com/repos/${owner}/${repoName}`, { headers });
      console.log(`Repozitoriya topildi: ${owner}/${repoName}`);
    } catch (err: any) {
      if (err.response?.status === 404) {
        repoExists = false;
        console.log(`Repozitoriya topilmadi. Yangi yaratiladi...`);
      } else {
        throw new Error(`Repositoryni tekshirishda xatolik: ${err.response?.data?.message || err.message}`);
      }
    }

    if (!repoExists) {
      try {
        if (owner.toLowerCase() === authUserLogin.toLowerCase()) {
          await axios.post(
            "https://api.github.com/user/repos",
            { name: repoName, private: false, auto_init: false },
            { headers }
          );
        } else {
          await axios.post(
            `https://api.github.com/orgs/${owner}/repos`,
            { name: repoName, private: false, auto_init: false },
            { headers }
          );
        }
        console.log(`Repozitoriya muvaffaqiyatli yaratildi: ${owner}/${repoName}`);
      } catch (err: any) {
        throw new Error(`Repozitoriya yaratishda xatolik: ${err.response?.data?.message || err.message}`);
      }
    }

    console.log("Workspace fayllari tayyorlanmoqda...");
    const filesToCommit = getAllWorkspaceFiles(process.cwd());
    console.log(`Jami ${filesToCommit.length} ta matnli fayl aniqlandi.`);

    // Master/main branch SHA ni olish
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
      console.log(`Mavjud commit SHA: ${lastCommitSha}`);
    } catch (err: any) {
      console.log(`Repozitoriya yangi (bo'sh). Birinchi commit yaratiladi.`);
    }

    console.log("Fayllar GitHub blob-lariga yuklanmoqda...");
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
        console.error(`Fayl yuklashda xatolik (${file.path}):`, err.response?.data || err.message);
      }
    }

    if (treeNodes.length === 0) {
      throw new Error("Hech qanday fayl blob yuklanmadi.");
    }

    console.log("Yangi daraxt (Tree) tuzilmoqda...");
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

    console.log("Yangi Commit yaratilmoqda...");
    const commitPayload: any = {
      message: "Fine-tune ImageGenView: remove styling & random button presets and implement robust preloader",
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

    console.log("Branch ref yangilanmoqda...");
    if (lastCommitSha) {
      await axios.patch(
        `https://api.github.com/repos/${owner}/${repoName}/git/refs/heads/${branchName}`,
        { sha: newCommitSha, force: true },
        { headers }
      );
    } else {
      await axios.post(
        `https://api.github.com/repos/${owner}/${repoName}/git/refs`,
        { ref: `refs/heads/${branchName}`, sha: newCommitSha },
        { headers }
      );
    }

    console.log(`🏆 MUVAFFQAQIYATLI YUKLANDI!`);
    console.log(`Havola: https://github.com/${owner}/${repoName}`);
  } catch (err: any) {
    console.error("Eksport qilishda jiddiy xatolik yuz berdi:", err.response?.data || err.message);
    process.exit(1);
  }
}

run();
