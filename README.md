# Portfolio — Next.js + Express CMS + Neon (Vercel-ready)

`frontend/` Next.js 14 + Tailwind + TypeScript  ·  `backend/` Express API + private CMS data (Neon Postgres)

## Run locally
```
cd backend  && npm i && npm run dev     # http://localhost:4000   (reads backend/.env)
cd frontend && npm i && npm run dev     # http://localhost:3000   (reads frontend/.env.local)
```
Tables are created and seeded automatically on the first request.
CMS: open **/admin** and enter `ADMIN_CODE`. Edit hero, dev card, about, services, socials, projects (add/edit/reorder), skills, read messages.

## Secrets
All secrets live in `backend/.env` (git-ignored): `DATABASE_URL`, `ADMIN_CODE`, `JWT_SECRET`, `FRONTEND_URL`.
Never commit `.env`. On Vercel add the same values in Project -> Settings -> Environment Variables.

## Contact form: real emails only
A visitor enters name / email / message, we email a 6-digit code to **their** address, and the message is accepted only after they type that code (so fake addresses can't send). Verified messages are saved in the CMS and emailed to you as Name / Email / Message.
Sending the code needs a mail sender that can email anyone - pick ONE in `backend/.env` (and Vercel env vars):
- **Gmail App Password (quickest):** Google Account -> Security -> 2-Step Verification on -> App passwords -> create one -> `SMTP_USER=you@gmail.com`, `SMTP_PASS=<16 chars>`.
- **Resend + your own domain:** verify a domain in Resend, then set `MAIL_FROM="Name <hello@yourdomain.com>"` (+ `RESEND_API_KEY`). Resend's free sandbox sender can only email your own address, so it can't send codes to visitors.
Without one of these, the form shows "verification isn't available" instead of accepting unverified emails.

## Images
Uploads (images and the CV PDF; CMS drag & drop or choose file) are resized in the browser and stored in Neon, served from `/api/media/ID`.

## Deploy (two Vercel projects, same repo)
1. **Backend**: Root Directory `backend` -> add the 4 env vars (set `FRONTEND_URL` to your frontend URL) -> Deploy.
2. **Frontend**: Root Directory `frontend` -> env `NEXT_PUBLIC_API_URL` = backend URL (no trailing slash) -> Deploy.
3. Upload your CV (PDF) and everything else from the CMS: `/admin`.

Security: login is locked for 15 min after 5 wrong codes per IP, tokens expire after 12 h, `/admin` is `noindex` and disallowed in robots.txt.
