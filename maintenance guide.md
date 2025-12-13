# Project Maintenance Guide: Pandit Ji Paneer Wale

This guide explains how to manage, edit, and deploy your website.

## 🌳 Branch Strategy (Crucial)

Your project uses a two-branch system. It is vital to understand this to avoid losing work.

| Branch Name | Purpose | Status |
| :--- | :--- | :--- |
| **`source`** | **EDIT HERE.** Contains your actual code (React, CSS, etc.). | **Safe.** Always save your work here. |
| **`main`** | **LIVE SITE.** Contains only the built website (HTML/JS/CSS). | **Destructive.** This branch is wiped and overwritten every time you deploy. |

---

## 🖼️ Adding Product Images (The Easy Way!)

You now have an AI-powered image sync tool! Just:

1.  **Drop images** into `uploads/incoming/`
2.  **Run the preview:**
    ```powershell
    npm run images
    ```
3.  **Review** what the AI detected and confirm to apply

The tool will automatically:
- Detect the product in each image
- Match it to your database
- Move and rename the file correctly
- Update `products.js` with the new path

📖 **Full guide:** See `IMAGE_SYNC_GUIDE.md` for detailed instructions.

---

## 🛠️ How to Make Changes (The Edit Cycle)

Whenever you want to update the site (change a price, add a photo, fix a typo):

1.  **Switch to the Source Code:**
    ```powershell
    git checkout source
    ```

2.  **Start the Local Server:**
    ```powershell
    npm run dev
    ```
    *   Open the link shown (usually `http://localhost:5173`) to see your changes in real-time.

3.  **Make Your Edits:**
    *   Edit files in `src/`.
    *   Add images to `public/images/`.

4.  **Save Your Work:**
    ```powershell
    git add .
    git commit -m "Description of what you changed"
    git push origin source
    ```

---

## 🚀 How to Deploy (The Release Cycle)

When you are happy with your changes and want them on `panditjipaneerwale.me`:

1.  **Ensure you are on `source` and have installed dependencies:**
    ```powershell
    git checkout source
    npm install
    ```

2.  **Build the Project:**
    ```powershell
    npm run build
    ```
    *   *Check:* Ensure a `dist` folder was created.

3.  **Deploy to Main (The "Magic" Command):**
    *   *Note: This command deletes the old site and replaces it with the new build.*
    ```powershell
    # 1. Switch to main
    git checkout main

    # 2. Clean old files (PowerShell command)
    Get-ChildItem -Path . -Exclude ".git", "dist", "README.md" | Remove-Item -Recurse -Force

    # 3. Move new build files to root
    Move-Item -Path .\dist\* -Destination . -Force
    Remove-Item -Path .\dist -Force

    # 4. Restore CNAME (Required for custom domain)
    Set-Content -Path .\CNAME -Value "panditjipaneerwale.me"

    # 5. Push to GitHub
    git add .
    git commit -m "Deploy update"
    git push origin main
    ```

4.  **Return to Safety:**
    ```powershell
    git checkout source
    ```

---

## 🤖 Instructions for New AI Chats

If you start a new chat with Copilot or ChatGPT and need help, paste this prompt so it understands your setup immediately:

> **"I am working on a Vite/React project deployed to GitHub Pages. I have a custom workflow:**
> 1. **Source code is on the `source` branch.**
> 2. **The `main` branch is ONLY for the production build (dist folder contents at root).**
> 3. **My custom domain is `panditjipaneerwale.me`.**
>
> **When helping me:**
> - **Always ensure I am on the `source` branch before editing code.**
> - **If I ask to deploy, generate the PowerShell commands to build, switch to main, clean the root, move dist files, recreate the CNAME, and push."**

---

## ❓ Troubleshooting

*   **"vite: command not found"**:
    *   You probably don't have the node modules installed. Run: `npm install`
*   **"The term 'git' is not recognized"**:
    *   Install Git for Windows.
*   **Site shows a 404 or blank page**:
    *   Check if the `CNAME` file exists in the root of the `main` branch.
    *   Ensure you didn't accidentally push source code to `main` or build code to `source`.
