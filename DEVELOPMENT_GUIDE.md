# 🚀 Pandit Ji Paneer Wale - Development & Deployment Guide

Welcome to your project documentation! This guide explains how to manage your website, make changes, and deploy them to the live server.

## 📂 Project Structure (Important!)

Your project uses a **Two-Branch System**. It is crucial to understand the difference to avoid losing work.

| Branch | Purpose | Status | Action |
| :--- | :--- | :--- | :--- |
| **`source`** | **Development** | 🟢 **EDIT THIS** | Write code, fix bugs, add images here. |
| **`main`** | **Live Website** | 🔴 **DO NOT EDIT** | Contains only built files for the browser. |

---

## 🛠️ Daily Workflow

### 1. Starting a New Session
Whenever you open VS Code or start a new chat with an AI, always ensure you are on the **source** branch.

**Run this command first:**
```powershell
git checkout source
```

### 2. Making Changes
1.  Edit your files (e.g., `src/App.jsx`, `src/data/products.js`).
2.  Preview your changes locally:
    ```powershell
    npm run dev
    ```
    *(Open the link shown in the terminal, usually `http://localhost:5173`)*

### 3. Saving Your Work
Once you are happy with your changes, save them to the cloud (GitHub):

```powershell
git add .
git commit -m "Description of what you changed"
git push origin source
```

---

## 🚀 How to Deploy (Go Live)

To update `panditjipaneerwale.me`, you need to build the project and push it to the `main` branch.

**The Easy Way (Ask AI):**
> "I have made changes on the source branch. Please build and deploy the project to the main branch for me."

**The Manual Way (If you want to do it yourself):**
1.  **Build the project:**
    ```powershell
    npm run build
    ```
2.  **Switch to main and deploy:**
    ```powershell
    git checkout main
    # (Danger: This deletes source files from your local view to prepare for deployment)
    Get-ChildItem -Path . -Exclude ".git", "dist", "README.md", "DEVELOPMENT_GUIDE.md" | Remove-Item -Recurse -Force
    Move-Item -Path .\dist\* -Destination . -Force
    Remove-Item -Path .\dist -Force
    Set-Content -Path .\CNAME -Value "panditjipaneerwale.me"
    git add .
    git commit -m "Deploy update"
    git push origin main
    git checkout source  # Always go back to source immediately!
    ```

---

## 🤖 Instructions for New AI Chats

If you start a new chat with Copilot or another AI, copy and paste this block so they understand your setup immediately:

> **Project Context for AI:**
> I am working on a Vite/React project deployed to GitHub Pages.
> - **Repo:** `panditjipaneerwale.me`
> - **Source Code:** Lives in the `source` branch.
> - **Live Site:** Lives in the `main` branch (served from root).
> - **Workflow:** I edit code in `source`. To deploy, I build to `dist`, switch to `main`, replace everything with `dist` contents, and push.
> - **Current State:** Please ensure I am on the `source` branch before making edits.

---

## 🆘 Troubleshooting

*   **"I can't find my files!"**
    *   You are probably on the `main` branch. Run `git checkout source` to get them back.
*   **"The live site isn't updating."**
    *   Wait 2-3 minutes. Try opening the site in an Incognito window to bypass cache.
*   **"Git error: refusing to merge unrelated histories"**
    *   This happens if branches get out of sync. Ask AI to "Force push the deployment" to fix it.
