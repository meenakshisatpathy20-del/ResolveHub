# Deploying ResolveHub

Two options:

- **[Option A: Vercel + Render (free, simplest)](#option-a-vercel--render)**
- **[Option B: AWS (Elastic Beanstalk + Amplify)](#option-b-aws)**

Both use MongoDB Atlas for the database and Cloudinary for evidence files.

---

## Option A: Vercel + Render

| Part | Service |
|---|---|
| Frontend | Vercel (root directory `frontend`, includes `vercel.json` for page routing) |
| Backend | Render web service (root directory `backend`) |

**Backend on Render**

1. render.com → **New → Web Service** → connect the GitHub repo.
2. Root directory: `backend` · Runtime: **Node** · Build command: `npm install` · Start command: `npm start`.
3. Instance type: **Free**. Health check path: `/api/health`.
4. Environment variables: everything from your `backend/.env`, plus `NODE_ENV=production` and `TRUST_PROXY=1`.
   Cloudinary keys are **required**, because Render's disk is wiped on every deploy.
5. Deploy, then open `https://<your-service>.onrender.com/api/health`.

**Frontend on Vercel**

1. vercel.com → **Add New → Project** → import the repo.
2. Root directory: `frontend` (Vite is detected automatically).
3. Environment variables: `VITE_API_URL=https://<your-service>.onrender.com/api`, `VITE_GOOGLE_CLIENT_ID`, `VITE_SUPPORT_EMAIL`.
4. Deploy, then copy the Vercel URL.

**Connect them**

- On Render, set `CLIENT_URL` to the Vercel URL (no trailing slash) and redeploy.
- In Google Cloud Console, add the Vercel URL to the OAuth client's **Authorized JavaScript origins**.

Free Render services sleep after about 15 minutes without traffic; the first request after that takes 30–50 seconds.

---

## Option B: AWS

| Part | Service |
|---|---|
| Database | MongoDB Atlas |
| Evidence files | Cloudinary |
| Backend API | AWS Elastic Beanstalk (Docker platform, single instance) |
| Frontend | AWS Amplify Hosting (HTTPS, builds from GitHub) |

```
Browser ──HTTPS──▶ Amplify (React app)
                     │  /api/* is proxied
                     ▼
               Elastic Beanstalk (Express API, Docker) ──▶ MongoDB Atlas
                                                     └──▶ Cloudinary
```

The frontend calls `/api` on its own HTTPS domain, and Amplify forwards those
requests to the backend. That gives you HTTPS in the browser and no CORS setup,
without buying a domain or certificate for the backend.

> Region: use **Asia Pacific (Mumbai) ap-south-1** for both services if your users are in India.
> Cost: a single small instance plus Amplify is cheap, but check what free tier or credits your AWS account has, and set a **billing alert** before you start.

---

## 0. Before you start

- Merge your work into `main` and push it.
- Change any secret that was ever committed (database password, Gmail app password, JWT secret, Cloudinary secret).
- Create a **new** `JWT_SECRET` for production:
  ```bash
  node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
  ```

## 1. MongoDB Atlas

1. In Atlas, open your cluster → **Database Access** and create a database user with a strong password.
2. **Network Access** → **Add IP Address** → `0.0.0.0/0`. Elastic Beanstalk's IP can change; your username and password still protect the database.
3. **Connect → Drivers** and copy the connection string. Put a database name in it, e.g.
   `mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/resolvehub?retryWrites=true&w=majority`

## 2. Backend on Elastic Beanstalk

### 2a. Build the upload zip

From the repository root (works on Windows, macOS and Linux):

```bash
git archive --format=zip -o backend.zip HEAD:backend
```

This zips only the committed backend files: no `node_modules`, no `.env`.
It includes `Dockerfile`, `.ebextensions/` (health check on `/api/health`) and
`.platform/` (raises nginx's upload limit to 30 MB).

### 2b. Create the environment

1. AWS Console → **Elastic Beanstalk** → **Create application**.
2. Environment tier: **Web server environment**.
3. Application name: `resolvehub-api`.
4. Platform: **Docker**, branch **Docker running on 64bit Amazon Linux 2023**.
5. Application code: **Upload your code** → choose `backend.zip`.
6. Presets: **Single instance** (cheapest; no load balancer).
7. Service access: let the console create the service role and EC2 instance profile if you don't have them.
8. Instance type: `t3.micro` or `t3.small`.
9. **Environment properties**: add these.

| Name | Value |
|---|---|
| `MONGO_URI` | your Atlas connection string |
| `JWT_SECRET` | the new production secret |
| `CLIENT_URL` | leave as `http://localhost:5173` for now; you'll update it in step 4 |
| `TRUST_PROXY` | `2` |
| `EMAIL_USER` / `EMAIL_PASS` | Gmail address and App Password |
| `REQUIRE_EMAIL_VERIFICATION` | `true` |
| `GOOGLE_CLIENT_ID` | your Google OAuth client ID |
| `CLOUDINARY_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | your Cloudinary keys (**required**: files on the instance's disk are lost on redeploy) |

`NODE_ENV=production` and `PORT=5000` are already set by `.ebextensions`.

10. Create the environment and wait for the health status to turn **Ok** (green).
11. Copy the environment URL, e.g. `http://resolvehub-api-env.eba-xxxx.ap-south-1.elasticbeanstalk.com`.
    Open `<that URL>/api/health`. You should see `{"success":true,"database":"connected",…}`.

If health is red: Elastic Beanstalk → your environment → **Logs → Request logs → Last 100 lines**.
The most common causes are a wrong `MONGO_URI` or Atlas network access not allowing the instance.

### 2c. Seed the first admin (once)

The simplest way is to run the seed from your own computer against the production database:

```bash
cd backend
MONGO_URI="<atlas connection string>" SEED_PASSWORD="<a strong password>" npm run seed
```

(On Windows PowerShell: `$env:MONGO_URI="..."; $env:SEED_PASSWORD="..."; npm run seed`)

This creates the platform admin plus the three demo organizations and their staff.
Log in as the admin afterwards and change its password from **Settings**.
If you don't want the demo organizations in production, delete them from the **Organizations** page.

## 3. Frontend on Amplify

1. AWS Console → **AWS Amplify** → **Create new app** → **GitHub** and authorize it.
2. Choose the `ResolveHub` repository and branch `main`.
3. Tick **My app is a monorepo** and enter `frontend` as the root directory.
   Amplify detects `amplify.yml` in the repository.
4. **Advanced settings → Environment variables**:

| Name | Value |
|---|---|
| `VITE_API_URL` | `/api` |
| `VITE_GOOGLE_CLIENT_ID` | your Google OAuth client ID (or leave it out to hide Google sign-in) |
| `VITE_SUPPORT_EMAIL` | your support email |

5. Save and deploy. Once it's done, copy the app URL, e.g. `https://main.d1abc234.amplifyapp.com`.

### 3a. Rewrites (proxy + single-page routing)

Amplify → your app → **Hosting → Rewrites and redirects → Manage redirects → Open text editor**.
Paste this, replacing the Elastic Beanstalk URL with yours. **Order matters**: the API rule must come first.

```json
[
  {
    "source": "/api/<*>",
    "target": "http://YOUR-EB-ENV.ap-south-1.elasticbeanstalk.com/api/<*>",
    "status": "200",
    "condition": null
  },
  {
    "source": "</^[^.]+$|\\.(?!(css|gif|ico|jpg|js|png|txt|svg|woff|woff2|ttf|map|json|webp)$)([^.]+$)/>",
    "target": "/index.html",
    "status": "200",
    "condition": null
  }
]
```

## 4. Connect the two

1. In Elastic Beanstalk → **Configuration → Updates, monitoring and logging → Environment properties**,
   set `CLIENT_URL` to your Amplify URL (e.g. `https://main.d1abc234.amplifyapp.com`). This is used for links in emails.
2. In **Google Cloud Console → APIs & Services → Credentials → your OAuth client**, add the Amplify URL
   under **Authorized JavaScript origins**.

## 5. Verify end to end

Open the Amplify URL and check each of these:

- [ ] Sign up with a real email address, and the OTP email arrives
- [ ] Log in, log out, forgot password
- [ ] Google sign-in (if configured)
- [ ] Raise a dispute with a PDF and an image attached; the files appear in Cloudinary
- [ ] Log in as an org admin and assign the case; log in as the employee and resolve it
- [ ] The customer gets the notification and the status email
- [ ] Reports load and CSV export downloads
- [ ] Refresh the page on `/dashboard/disputes`: it still loads (SPA rewrite works)

## Updating after changes

- **Frontend**: push to `main`, and Amplify rebuilds automatically.
- **Backend**: run `git archive --format=zip -o backend.zip HEAD:backend` again, then
  Elastic Beanstalk → **Upload and deploy**.

## Notes and limits

- Traffic between Amplify and Elastic Beanstalk is plain HTTP over AWS's network. That's fine for a demo or portfolio project.
  For production, give the backend its own HTTPS domain (Route 53 + ACM certificate on a load-balanced environment),
  set `VITE_API_URL` to that domain, and remove the proxy rule.
- If evidence uploads fail with a 413 or a timeout through the Amplify proxy, use the HTTPS backend option above so the browser uploads directly to the API.
- `TRUST_PROXY=2` makes rate limiting use the visitor's IP (Amplify + Elastic Beanstalk's nginx). If every user gets
  "Too many attempts" at the same time, the hop count is wrong: try `3`.
