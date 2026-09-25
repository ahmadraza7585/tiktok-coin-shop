# TikTok Coin Shop — Live Karne Ka Guide (Step by Step)

Ye guide tumhe batayegi ke is website ko **Render** (free server) par kaise
live karna hai. Koi paisa nahi lagega. Bas neeche wale steps follow karo.

---

## Step 1: GitHub ka free account banao

1. Chrome me kholo: **github.com**
2. **Sign up** par click karo.
3. Email, password aur username dal kar account bana lo.
4. Email me jo code aye wo dal kar verify kar lo.

## Step 2: Nayi repository banao aur files upload karo

1. GitHub me login karke upar **+** (plus) par click karo, phir **New repository** chuno.
2. Repository ka naam likho: `tiktok-coin-shop`
3. **Public** select karo, phir neeche **Create repository** dabao.
4. Ab jo page khulega us me **"uploading an existing file"** wale link par click karo.
5. Apne computer se is folder ki **saari files** select karke drag-and-drop karo:
   - `package.json`, `server.js`, `render.yaml`, `.gitignore`, `README.md`, `DEPLOY-GUIDE.md`
   - `public` folder ke andar: `index.html`, `app.js`, `styles.css`
   - (Zaroori: `public` folder bhi saath upload ho, warna site nahi chalegi)
6. Neeche **Commit changes** ka button dabao.

## Step 3: Render ka free account banao

1. Chrome me kholo: **render.com**
2. **Get Started** ya **Sign Up** par click karo.
3. **Continue with GitHub** chuno aur apne GitHub account se login kar lo.

## Step 4: Web Service banao aur deploy karo

1. Render ke dashboard me **New +** par click karo, phir **Web Service** chuno.
2. **Connect a repository** me apni `tiktok-coin-shop` repository ke saamne **Connect** dabao.
3. Settings aise rakho:
   - **Name:** `tiktok-coin-shop` (ya jo marzi)
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Plan:** **Free** chuno
4. Neeche **Environment Variables** (ya **Environment**) me 2 cheezein add karo:
   - Key: `COIN_USER` — Value: apni marzi ka username (jaise `admin`)
   - Key: `COIN_PASS` — Value: apna password (yehi website ke login me kaam ayega)
   - Har ek ke baad **Add** dabana na bhoolo.
5. **Create Web Service** dabao. Ab Render tumhari site bana raha hai — 2-4 minute lagein ge.
6. Jab upar **Live** likha a jaye, tumhe link mil jayega, jaise:
   `https://tiktok-coin-shop-xxxx.onrender.com`

## Step 5: Website kholo

1. Wo link copy karke Chrome me kholo.
2. Login page ayega — wahi username/password dalo jo Step 4 me `COIN_USER` / `COIN_PASS` me rakhe thay.
3. Bas! Ab TikTok username search karo, profile pic khud a jayegi. 🪙

---

## 2 zaroori baatein (pehle se pata hon)

1. **Free plan so jata hai:** Agar 15 minute tak koi site na khole to Render
   usay "sula" deta hai. Dobara kholne par pehli baar **~30 second** lag sakte
   hain. Ghabrana nahi, wait karo — khul jayegi.
2. **Imandari wali warning:** TikTok kabhi kabhi servers ko block kar deta hai.
   Is liye kisi waqt profile pic ya data na bhi aye to ye TikTok ki taraf se hai,
   iski **koi guarantee nahi**. Thodi der baad dobara try kar lena.

---

## Masla aye to

- **Build fail ho jaye:** Render ke **Logs** me dekho ke kya error hai. Aksar
  wajah ye hoti hai ke `public` folder ya `package.json` upload nahi hua.
- **Login na ho:** Environment me `COIN_USER` / `COIN_PASS` dobara check karo,
  phir **Manual Deploy > Redeploy** karo.
- **Profile nahi mil rahi:** Username sahi likho (bina @ ke bhi chalega), ya
  poora profile link paste karo.
