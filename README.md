# Arman Khachyan — Portfolio Website

Simple personal portfolio for a 3D animator and programmer.
Built with HTML, CSS, Vanilla JavaScript, Node.js and Express.

---

## Quick Start

### 1. Install Node.js

Download and install Node.js from [nodejs.org](https://nodejs.org/) (LTS version).

### 2. Install dependencies

Open a terminal in the `portfolio` folder and run:

```bash
npm install
```

### 3. Configure admin login

Copy `.env.example` to `.env` (already done if you see `.env` file) and change:

```
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_password_here
```

### 4. Start the server

```bash
npm start
```

### 5. Open the site

- **Website:** [http://localhost:3000](http://localhost:3000)
- **Admin panel:** [http://localhost:3000/admin](http://localhost:3000/admin)

---

## How to Edit Your Profile

Open **one file** to change all your personal info:

```
server/data/profile.json
```

You can edit:

| Field | What it changes |
|-------|----------------|
| `name` | Your name everywhere on the site |
| `username` | Your @username |
| `age` | Age in About section |
| `location` | Country/city |
| `mainDirection` | Your main field |
| `heroTitle` | Big title on homepage ("Hi, I'm Arman") |
| `heroSubtitle` | Subtitle under the title |
| `heroDescription` | Short text under subtitle |
| `about` | Full about me text |
| `interests` | List of interest tags |
| `skills` | Skill cards |
| `email` | Contact email |
| `social.github` | GitHub link |
| `social.instagram` | Instagram link |
| `social.youtube` | YouTube link |

After saving the file, refresh the page — changes appear immediately.

---

## How to Add Your Photo

Place your photo in:

```
client/images/avatar.jpg
```

Recommended: square image, at least 400x400 pixels.

---

## How to Use Admin Panel

1. Go to [http://localhost:3000/admin](http://localhost:3000/admin)
2. Log in with your credentials from `.env`
3. Fill in the project form:
   - **Title** — project name
   - **Category** — e.g. "3D Animation", "Fight Animation"
   - **Description** — short text about the project
   - **Project Type** — "Video" or "External Link"
   - **Thumbnail** — preview image (JPG, PNG)
   - **Video File** — upload MP4 or WebM
   - **Video URL** — or paste a YouTube link
4. Click **Add Project**
5. The project appears on the main page in the "My Work" section

### Edit or Delete

In the admin dashboard, each project has **Edit** and **Delete** buttons.

---

## How to Change Design / Colors

Open:

```
client/css/style.css
```

At the top, find the `:root` section:

```css
:root {
  --bg: #0f0f0f;           /* Background color */
  --bg-card: #181818;      /* Card background */
  --text: #ffffff;          /* Main text */
  --text-secondary: #a0a0a0; /* Secondary text */
  --accent: #6c63ff;       /* Accent color (buttons, links) */
}
```

Change any value and refresh the page.

---

## Project Structure

```
portfolio/
├── client/                  ← Frontend (what users see)
│   ├── index.html           ← Main page
│   ├── project.html         ← Single project page
│   ├── admin.html           ← Admin panel
│   ├── css/
│   │   ├── style.css        ← Main styles (change colors here)
│   │   └── admin.css        ← Admin panel styles
│   ├── js/
│   │   ├── main.js          ← Profile loading, navigation
│   │   ├── projects.js      ← Portfolio cards on main page
│   │   ├── project-page.js  ← Single project with video player
│   │   └── admin.js         ← Admin panel logic
│   ├── images/              ← Your photos and thumbnails
│   └── videos/              ← Uploaded video files
├── server/                  ← Backend
│   ├── server.js            ← Main server file
│   ├── routes/
│   │   ├── auth.js          ← Login/logout
│   │   ├── profile.js       ← Profile data API
│   │   └── projects.js      ← Projects CRUD API
│   ├── middleware/
│   │   └── auth.js          ← Auth check
│   └── data/
│       ├── profile.json     ← YOUR PROFILE DATA (edit this!)
│       └── projects.json    ← Projects list (managed via admin)
├── .env                     ← Admin login credentials
├── package.json
└── README.md
```

---

## Where Things Are

| I want to... | Edit this file |
|---|---|
| Change my name, bio, skills | `server/data/profile.json` |
| Change colors and design | `client/css/style.css` |
| Add/edit/delete projects | Admin panel at `/admin` |
| Add my photo | `client/images/avatar.jpg` |
| Change admin password | `.env` file |
| Add a new page section | `client/index.html` + `client/css/style.css` |

---

## Video Support

The portfolio supports three video types:

1. **Local MP4/WebM** — upload via admin panel, stored in `client/videos/`
2. **YouTube URL** — paste a YouTube link in the "Video URL" field
3. **External link** — set project type to "External Link" and add a URL

Videos play on the project detail page using a simple HTML5 `<video>` player.

---

## License

MIT — use freely for your personal portfolio.
