# Visitor Pass Management System

This is my MERN stack project for college. It's a digital visitor management system where organizations can register visitors, issue QR code passes, and track check-ins. I built this over a few weeks learning as I went.

## Here's what I used:

- MongoDB + Mongoose (database)
- Express.js (backend api)
- React + Vite (frontend)
- Node.js (runtime)
- TailwindCSS (styling)
- JWT (authentication)
- Cloudinary (photo and pdf storage)
- Socket.IO (real-time dashboard updates)
- QRCode.js + html5-qrcode (qr generation and scanning)
- Recharts (dashboard charts)
- TanStack Query (data fetching, makes it way cleaner)

## To run this locally:

1. Clone the repo
2. Install dependencies — run `npm install` in both the `backend` and `frontend` folders
3. Copy `.env.example` to `.env` in the backend folder and fill in your values (see comments in the file)
4. Run `npm run seed` in the backend folder to add test data
5. Start backend: `cd backend && npm run dev`
6. Start frontend: `cd frontend && npm run dev`
7. Open http://localhost:5173

The backend runs on port 5000 and the frontend on 5173. Make sure both are running at the same time.

## Test accounts

After running the seed script these accounts will be available (all passwords are `password123`):

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@vpms.com | password123 |
| Security | security@vpms.com | password123 |
| Employee | employee@vpms.com | password123 |
| Visitor | visitor@vpms.com | password123 |

## What it does:

- **Visitor registration** — staff can add visitors manually or invite them via email
- **Pre-registration** — visitors get an email link to fill in their own details before arriving
- **Approval workflow** — employees and admins can approve or reject visitor requests
- **QR pass generation** — security staff generate QR code passes for approved visitors
- **Check-in/out** — security can scan QR codes to log check-ins and check-outs
- **Dashboard** — real-time stats showing visitors today, pending approvals, active passes
- **Reports & Analytics** — check-in trends, peak hours, visitor purpose breakdown
- **Role-based access** — different views for admin, security, employee, and visitor roles
- **Audit logs** — server-side log of every action with actor and IP
- **PDF badges** — generates downloadable PDF passes (requires Cloudinary)

## Testing Notes

Here's how I tested the main workflows. All of these work with the seed data from `npm run seed`.

### Admin workflow
1. Login with `admin@vpms.com / password123`
2. Dashboard shows visitor counts, pending approvals, and recent check-ins
3. Go to Visitors → you should see 5 seed visitors in different statuses
4. Click on a visitor to see their detail page, pass, and check log history
5. Go to Analytics to see the purpose breakdown chart and peak hours
6. Go to Audit Logs to see every action logged with actor and IP

### Security workflow
1. Login with `security@vpms.com / password123`
2. Go to Issue Pass → search for "Raj" → select Raj Visitor → set validity dates → Generate
3. The pass will be created with a QR code (PDF only works if Cloudinary is configured)
4. Go to Check-In → either scan the QR code with camera or paste the pass code into the manual input field
5. After check-in, the visitor status updates and the dashboard updates live via socket.io

### Employee workflow
1. Login with `employee@vpms.com / password123`
2. Go to Invite Visitor → fill in a visitor name, email, date and time → Submit
3. An appointment gets created (email sends only if Gmail is configured)
4. Go to My Appointments to see it listed, can approve or cancel

### Visitor workflow
1. Login with `visitor@vpms.com / password123`
2. Go to My Pass — shows the QR pass if one has been issued

### Testing QR check-in manually
If you don't have a camera or the scanner isn't working:
1. Get a pass code from the Passes page (admin/security can see all passes)
2. Go to Check-In and paste the code into the "Or enter pass code manually..." input
3. Press Enter or click Check In

## Known Limitations

These are things I know don't work perfectly or are missing:

- **Email doesn't work by default** — needs a real Gmail account with app passwords enabled. Set `EMAIL_USER` and `EMAIL_PASS` in `.env`. If not configured, invitations and approval emails just silently fail (app still works).

- **SMS notifications are disabled** — Twilio costs money so I skipped it for local testing. The code is there but sendSMS() returns early if credentials aren't set.

- **PDF badges require Cloudinary** — without `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` set, PDF generation fails silently and passes just won't have a downloadable PDF. Everything else (QR code, check-in) still works fine.

- **QR scanner needs camera permission** — browser will ask for camera access. If denied, there's a manual code entry field as backup. Camera scanning works best on mobile.

- **No pagination on audit logs** — if there are thousands of log entries, this page will be slow. Would need to add server-side pagination.

- **JWT tokens stored in localStorage** — not ideal for production (XSS risk) but fine for a project. The token expires after 7 days.

- **Socket.IO updates are broadcast to all clients** — in production you'd want to scope events per organization or user. Right now anyone connected gets all events.

- **No file size limit on photo uploads** — should add validation for production use.

- **Pre-registration link doesn't check if visitor already completed it** — submitting twice will just overwrite the data, not fail gracefully.

## Building this taught me:

- How JWT auth actually works, especially the part where you verify the token on every request
- Mongoose populate and nested refs (the `ref` stuff was confusing at first)
- How Node streams work — the PDF generation using pdfkit was really hard to figure out
- React Context for global state instead of prop drilling everywhere
- TanStack Query which made data fetching and caching way cleaner than doing it manually
- Socket.IO for real-time updates — took a while to figure out the CORS setup
- QR scanning in the browser is tricky because of camera permission handling
- MongoDB aggregation pipelines — the `$lookup` stage (which is like a SQL JOIN) took me a long time to understand

## Resources I used while building this:

- JWT authentication tutorial on YouTube (Traversy Media)
- Mongoose docs (the populate section especially)
- React Router v6 docs — the new way is different from v5 so old tutorials were confusing
- html5-qrcode npm page for the scanner setup
- Stack Overflow for various random issues
- TanStack Query docs for the caching/stale time stuff
- MongoDB aggregation docs — specifically the pipeline operators page
