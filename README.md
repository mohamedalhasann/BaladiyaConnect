# Haretna

A community-driven website that connects citizens who report local neighborhood issues with volunteers who want to help fix, clean, and beautify their communities in Jordan.

## What is this project?
Haretna is a platform built for civic action, instead of waiting weeks for the local municipality to handle minor issues, regular people can use this website to report local problems like littered parks, broken benches, or neighborhood walls.
Once an issue is posted, it appears on a public map. 
Local youth groups, neighborhood committees, or active residents can step up to lead the fix. 
They schedule a project day and list exactly what help they need, allowing other volunteers to sign up to physically do the work or pledge to donate the supplies (like trash bags, paint, or tools) to get it done.

## The Problems It Solves

* **Slow local maintenance** Small issues like trash buildup, unplanted public gardens sit ignored for a long time because official city crews are busy with heavy construction.
* **Wasted Volunteer energy:** Lots of young people in Jordan want to volunteer for projects, but they lack a live tool to find real-time, local tasks near them.
* **Lack of resources and coordination** Even when people want to clean up a public space, projects often fall apart because there is no system to organize who is leading, who is showing, and who is bringing the supplies.

## Core Features (What it actually does)
1. **Report an issue:** Citizens can log a complaint, pick a category (like cleanup, painting, or planting), and select their neighborhood.
2. **Project Adoption:** A community group leader or active neighbor can adopt an open issue and turn it into a scheduled cleanup event.
3. **Supply Requests:** Project leaders can post a specific list of materials needed for the project.
4. **Volunteer and Donate:** Volunteers can browse and choose to either sign up for physical work on the event day or supply the requested tools.
5. **Call to action alerts:** The system tracks how long a reported problem sits unmanaged and automatically highlights it on the home page if no leader adopts it within two weeks.
6. **Community Leaderboard:** A simple page showing basic charts of the most active districts and top volunteer groups to encourage friendly competition.

## Tools Used
This repository contains a modern web implementation:

- **Backend:** Python 3.11, Django 5.2, Django REST Framework, SQLite
- **Frontend:** React 18, Vite, modern CSS with responsive design

## Frontend-Only Demo

The frontend now runs as a self-contained static demo with local sample data and no backend dependency. That makes it suitable for GitHub Pages, Netlify, or Vercel when you only want to show the product concept.

If you want the live Django backend later, you can restore API wiring separately.

**Target OS:** Linux / Ubuntu / macOS / Windows

---

## 🚀 How to Run the Website

### Prerequisites
You need to have installed on your machine:
- **Python 3.11 or higher** (with pip)
- **Node.js 16 or higher** (with npm)

### Option A: Frontend-only demo

This is the fastest way to share the idea publicly.

```bash
cd frontend
npm install
npm run build
```

Upload the generated `frontend/dist` folder to a static host such as GitHub Pages.

### Option B: Full local stack

Use this only if you want to run the backend again.

### Step 1: Setup Backend (Terminal 1)

```bash
# Navigate to project directory
cd Haretna

# Create Python virtual environment
python3 -m venv .venv

# Activate virtual environment
source .venv/bin/activate          # On Linux/macOS
# OR
.venv\Scripts\activate             # On Windows

# Install backend dependencies
pip install -r requirements.txt

# Navigate to backend folder
cd backend

# Create database and run migrations
python manage.py migrate

# Start Django development server
python manage.py runserver
```

**Expected output:**
```
Starting development server at http://127.0.0.1:8000/
```

### Step 2: Setup Frontend (Terminal 2)

Open a new terminal window/tab in the same project directory:

```bash
# From project root, navigate to frontend
cd frontend

# Install frontend dependencies
npm install

# Start Vite development server
npm run dev
```

**Expected output:**
```
  ➜  Local:   http://localhost:5173/
```

### Step 3: Access the Website

1. Open your web browser
2. Go to: **http://localhost:5173** (or the port shown in Terminal 2)
3. Click **"Register"** to create an account
4. Enter any username, email, and password
5. Click **"Create Account"** to sign in
6. Start exploring: report issues, browse events, sign up as a volunteer!

---

## 🛑 To Stop the Website

- Press **Ctrl+C** in both terminal windows to stop the servers
- Close your browser tab

---

## ❓ Troubleshooting

**Backend port already in use?**
```bash
# Find and kill process on port 8000
lsof -i :8000 | grep LISTEN | awk '{print $2}' | xargs kill -9  # Mac/Linux
netstat -ano | findstr :8000                                     # Windows

# Then restart the server
python manage.py runserver
```

**Frontend not connecting to backend?**
- Confirm backend is running: visit `http://127.0.0.1:8000/` in browser
- Hard refresh frontend: Press **Ctrl+Shift+R** (or **Cmd+Shift+R** on Mac)

**Port 5173 already in use?**
- Vite will automatically try the next port (5174, 5175, etc.)
- Just use whatever port is shown in Terminal 2

**Django database error?**
```bash
cd backend
rm db.sqlite3              # Delete corrupted database
python manage.py migrate   # Recreate it
```

---

## 📋 What You Can Do

✅ Report neighborhood issues  
✅ Browse all reported problems  
✅ Adopt issues and create volunteer events  
✅ Sign up for cleanup events  
✅ Pledge supplies to help projects  
✅ View community leaderboard  
✅ See urgent issues needing adoption (14+ days old)

Enjoy! 🌍
