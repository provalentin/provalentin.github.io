# GitHub Pages Deployment Plan: MVP → Production

## Phase 1: Simple GitHub Pages Site (2-3 weeks)

### Goal
Deploy a working website on GitHub Pages that renders markdown DSA articles with basic styling.

**Key constraint:** GitHub Pages is static hosting — no backend, no databases.

### Tech Stack (Phase 1)

| Component | Choice | Why |
|-----------|--------|-----|
| Hosting | GitHub Pages | Free, automatic deploys from git |
| Content | Markdown files (git) | Easy to edit, version control |
| Rendering | markdown-it.js | Small JS library, client-side parsing |
| Styling | Custom CSS | Lightweight, no dependencies |
| Build | Simple (no build step) | Faster, easier to understand |
| Routing | Hash-based (#/article/01) | Works on GitHub Pages (no server) |

### Project Structure

```
dsa-prep-website/
├── README.md
├── index.html              (main page)
├── css/
│   ├── style.css          (global styles)
│   └── article.css        (article-specific)
├── js/
│   ├── app.js             (main app logic)
│   ├── markdown-renderer.js (MD parsing)
│   ├── router.js          (navigation)
│   └── utils.js           (helpers)
├── content/
│   ├── dsa/
│   │   ├── 01-arrays-strings.md
│   │   ├── 02-array-patterns.md
│   │   ├── 03-linked-lists.md
│   │   ├── 04-stacks-queues.md
│   │   ├── 05-hash-maps.md
│   │   └── ...
│   └── index.json         (content catalog)
├── assets/
│   └── images/
└── .gitignore
```

### Step 1: Create GitHub Repository

```bash
# Create repo on GitHub.com named: dsa-prep-website

# Clone locally
git clone https://github.com/YOUR_USERNAME/dsa-prep-website.git
cd dsa-prep-website
```

### Step 2: Basic HTML Structure

**index.html:**
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DSA Interview Prep</title>
    <link rel="stylesheet" href="css/style.css">
    <link rel="stylesheet" href="css/article.css">
    
    <!-- markdown-it library (CDN) -->
    <script src="https://cdn.jsdelivr.net/npm/markdown-it@13/dist/markdown-it.min.js"></script>
</head>
<body>
    <div id="app">
        <!-- Navigation sidebar -->
        <nav id="sidebar" class="sidebar">
            <div class="nav-header">
                <h1>DSA Prep</h1>
            </div>
            <div id="nav-content" class="nav-content">
                <!-- Generated dynamically by JS -->
            </div>
        </nav>
        
        <!-- Main content area -->
        <main id="content" class="content">
            <!-- Article renders here -->
        </main>
    </div>
    
    <!-- Scripts -->
    <script src="js/utils.js"></script>
    <script src="js/markdown-renderer.js"></script>
    <script src="js/router.js"></script>
    <script src="js/app.js"></script>
</body>
</html>
```

### Step 3: Content Catalog

**content/index.json:**
```json
{
  "dsa": {
    "tier1": [
      {
        "id": "01",
        "title": "Arrays & Strings Fundamentals",
        "file": "content/dsa/01-arrays-strings.md",
        "difficulty": "Easy",
        "readTime": 12,
        "category": "Fundamentals"
      },
      {
        "id": "02",
        "title": "Array Manipulation Patterns",
        "file": "content/dsa/02-array-patterns.md",
        "difficulty": "Easy-Medium",
        "readTime": 14,
        "category": "Fundamentals"
      },
      {
        "id": "03",
        "title": "Linked Lists Fundamentals",
        "file": "content/dsa/03-linked-lists.md",
        "difficulty": "Easy",
        "readTime": 11,
        "category": "Fundamentals"
      }
    ]
  }
}
```

### Step 4: Markdown Renderer

**js/markdown-renderer.js:**
```javascript
class MarkdownRenderer {
    constructor() {
        this.md = window.markdownit({
            html: true,
            linkify: true,
            typographer: true,
            breaks: true
        });
        
        // Custom rendering for code blocks
        this.setupCodeHighlighting();
    }
    
    async renderFile(filepath) {
        try {
            const response = await fetch(filepath);
            if (!response.ok) throw new Error('File not found');
            
            const markdown = await response.text();
            return this.md.render(markdown);
        } catch (error) {
            console.error('Error loading markdown:', error);
            return `<p>Error loading article</p>`;
        }
    }
    
    renderHTML(html) {
        const contentDiv = document.getElementById('content');
        contentDiv.innerHTML = `<article class="article">${html}</article>`;
        
        // Add styling classes after rendering
        this.styleArticle();
    }
    
    styleArticle() {
        const article = document.querySelector('article');
        
        // Style headings
        article.querySelectorAll('h1').forEach(h => h.classList.add('article-h1'));
        article.querySelectorAll('h2').forEach(h => h.classList.add('article-h2'));
        article.querySelectorAll('h3').forEach(h => h.classList.add('article-h3'));
        
        // Style code blocks
        article.querySelectorAll('pre code').forEach(block => {
            block.classList.add('code-block');
        });
        
        // Style tables
        article.querySelectorAll('table').forEach(table => {
            table.classList.add('article-table');
        });
        
        // Style lists
        article.querySelectorAll('ul').forEach(ul => {
            ul.classList.add('article-list');
        });
    }
    
    setupCodeHighlighting() {
        // Optional: Add syntax highlighting library later
        // For MVP, just use basic styling
    }
}
```

### Step 5: Router (Client-Side Navigation)

**js/router.js:**
```javascript
class Router {
    constructor() {
        this.routes = {};
        this.currentRoute = null;
    }
    
    register(path, handler) {
        this.routes[path] = handler;
    }
    
    async navigate(path) {
        const handler = this.routes[path];
        
        if (!handler) {
            console.error(`Route not found: ${path}`);
            this.navigateToHome();
            return;
        }
        
        try {
            await handler();
            this.currentRoute = path;
            window.location.hash = path;
        } catch (error) {
            console.error('Navigation error:', error);
        }
    }
    
    init() {
        // Handle hash changes
        window.addEventListener('hashchange', () => {
            const path = window.location.hash.slice(1) || '/';
            this.navigate(path);
        });
        
        // Initial load
        const initialPath = window.location.hash.slice(1) || '/';
        this.navigate(initialPath);
    }
    
    navigateToHome() {
        window.location.hash = '/';
    }
}
```

### Step 6: Main App Logic

**js/app.js:**
```javascript
let renderer;
let router;
let catalog;

class App {
    static async init() {
        renderer = new MarkdownRenderer();
        router = new Router();
        
        // Load content catalog
        await this.loadCatalog();
        
        // Register routes
        this.registerRoutes();
        
        // Build navigation
        this.buildNavigation();
        
        // Start router
        router.init();
    }
    
    static async loadCatalog() {
        try {
            const response = await fetch('content/index.json');
            catalog = await response.json();
        } catch (error) {
            console.error('Error loading catalog:', error);
        }
    }
    
    static registerRoutes() {
        // Home route
        router.register('/', async () => {
            const homeHtml = `
                <article class="article">
                    <h1>DSA Interview Prep</h1>
                    <p>Master data structures and algorithms for big tech interviews.</p>
                    <p>Choose a topic from the left to get started.</p>
                </article>
            `;
            document.getElementById('content').innerHTML = homeHtml;
        });
        
        // Dynamic article routes
        if (catalog.dsa) {
            const articles = [
                ...catalog.dsa.tier1 || [],
                ...catalog.dsa.tier2 || [],
                ...catalog.dsa.tier3 || []
            ];
            
            articles.forEach(article => {
                router.register(`/article/${article.id}`, async () => {
                    const html = await renderer.renderFile(article.file);
                    renderer.renderHTML(html);
                    
                    // Update active nav item
                    this.updateActiveNav(`article-${article.id}`);
                });
            });
        }
    }
    
    static buildNavigation() {
        const navContent = document.getElementById('nav-content');
        navContent.innerHTML = '';
        
        if (!catalog.dsa) return;
        
        // Add tier 1
        if (catalog.dsa.tier1) {
            navContent.innerHTML += '<div class="nav-section"><h3>Fundamentals</h3></div>';
            catalog.dsa.tier1.forEach(article => {
                const link = document.createElement('a');
                link.id = `article-${article.id}`;
                link.href = `#/article/${article.id}`;
                link.textContent = article.title;
                link.classList.add('nav-link');
                navContent.appendChild(link);
            });
        }
        
        // Add tier 2
        if (catalog.dsa.tier2) {
            navContent.innerHTML += '<div class="nav-section"><h3>Intermediate</h3></div>';
            catalog.dsa.tier2.forEach(article => {
                const link = document.createElement('a');
                link.id = `article-${article.id}`;
                link.href = `#/article/${article.id}`;
                link.textContent = article.title;
                link.classList.add('nav-link');
                navContent.appendChild(link);
            });
        }
    }
    
    static updateActiveNav(itemId) {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        
        const item = document.getElementById(itemId);
        if (item) item.classList.add('active');
    }
}

// Start app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
```

### Step 7: Styling

**css/style.css:**
```css
:root {
    --primary-color: #2563eb;
    --secondary-color: #1e40af;
    --text-dark: #1f2937;
    --text-light: #6b7280;
    --bg-light: #f9fafb;
    --border-color: #e5e7eb;
    --sidebar-width: 280px;
}

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    color: var(--text-dark);
    background: #fff;
    line-height: 1.6;
}

#app {
    display: flex;
    min-height: 100vh;
}

/* Sidebar Navigation */
.sidebar {
    width: var(--sidebar-width);
    background: var(--bg-light);
    border-right: 1px solid var(--border-color);
    overflow-y: auto;
    padding: 20px;
}

.nav-header h1 {
    font-size: 24px;
    margin-bottom: 30px;
    color: var(--primary-color);
}

.nav-section {
    margin-top: 30px;
}

.nav-section h3 {
    font-size: 12px;
    text-transform: uppercase;
    color: var(--text-light);
    margin-bottom: 10px;
    letter-spacing: 0.5px;
}

.nav-link {
    display: block;
    padding: 10px 12px;
    margin: 5px 0;
    color: var(--text-dark);
    text-decoration: none;
    border-radius: 6px;
    transition: all 0.2s;
    font-size: 14px;
}

.nav-link:hover {
    background: rgba(37, 99, 235, 0.1);
    color: var(--primary-color);
}

.nav-link.active {
    background: var(--primary-color);
    color: white;
}

/* Main Content */
.content {
    flex: 1;
    overflow-y: auto;
    padding: 40px 60px;
    max-width: 900px;
    margin: 0 auto;
}

/* Responsive */
@media (max-width: 768px) {
    #app {
        flex-direction: column;
    }
    
    .sidebar {
        width: 100%;
        border-right: none;
        border-bottom: 1px solid var(--border-color);
        max-height: 200px;
    }
    
    .content {
        padding: 20px;
    }
}
```

**css/article.css:**
```css
.article {
    max-width: 800px;
    margin: 0 auto;
}

/* Headings */
.article h1,
.article-h1 {
    font-size: 32px;
    margin: 40px 0 20px 0;
    color: var(--text-dark);
    border-bottom: 2px solid var(--primary-color);
    padding-bottom: 10px;
}

.article h2,
.article-h2 {
    font-size: 24px;
    margin: 30px 0 15px 0;
    color: var(--text-dark);
}

.article h3,
.article-h3 {
    font-size: 18px;
    margin: 20px 0 10px 0;
    color: var(--text-dark);
}

/* Paragraphs */
.article p {
    margin-bottom: 15px;
    line-height: 1.8;
    color: var(--text-dark);
}

/* Code blocks */
.article pre {
    background: #f5f5f5;
    padding: 15px;
    border-radius: 6px;
    overflow-x: auto;
    margin: 15px 0;
    border-left: 4px solid var(--primary-color);
}

.article code {
    font-family: 'Monaco', 'Menlo', monospace;
    font-size: 13px;
    color: #d63384;
}

.article pre code {
    color: #333;
}

/* Inline code */
.article p code,
.article li code {
    background: #f0f0f0;
    padding: 2px 6px;
    border-radius: 3px;
}

/* Lists */
.article ul,
.article ol,
.article-list {
    margin: 15px 0 15px 30px;
}

.article li {
    margin: 8px 0;
    line-height: 1.8;
}

/* Tables */
.article table,
.article-table {
    border-collapse: collapse;
    width: 100%;
    margin: 20px 0;
    font-size: 14px;
}

.article table th,
.article table td {
    border: 1px solid var(--border-color);
    padding: 12px;
    text-align: left;
}

.article table th {
    background: var(--bg-light);
    font-weight: 600;
    color: var(--text-dark);
}

.article table tr:hover {
    background: rgba(37, 99, 235, 0.05);
}

/* Blockquotes */
.article blockquote {
    border-left: 4px solid var(--primary-color);
    padding-left: 15px;
    margin: 15px 0;
    color: var(--text-light);
    font-style: italic;
}

/* Links */
.article a {
    color: var(--primary-color);
    text-decoration: none;
    border-bottom: 1px solid rgba(37, 99, 235, 0.3);
    transition: all 0.2s;
}

.article a:hover {
    color: var(--secondary-color);
    border-bottom-color: var(--secondary-color);
}

/* Read time & meta */
.article-meta {
    display: flex;
    gap: 20px;
    font-size: 13px;
    color: var(--text-light);
    margin: 20px 0;
    padding-bottom: 20px;
    border-bottom: 1px solid var(--border-color);
}
```

### Step 8: Deploy to GitHub Pages

**1. Enable GitHub Pages**
```
GitHub Repo → Settings → Pages → Source: main branch
```

**2. Configure for root directory**
The site will be available at: `https://YOUR_USERNAME.github.io/dsa-prep-website`

**3. Push code**
```bash
git add .
git commit -m "Initial commit: simple markdown rendering site"
git push origin main
```

Your site is live in 1-2 minutes!

### Step 9: Copy MD Files to Repo

```bash
# Copy article markdown files
cp 01-arrays-strings-fundamentals.md content/dsa/
cp 02-array-manipulation-patterns.md content/dsa/
cp 03-linked-lists-fundamentals.md content/dsa/
cp 04-stacks-queues.md content/dsa/
cp 05-hash-maps-sets.md content/dsa/

git add content/
git commit -m "Add DSA articles"
git push origin main
```

---

## Phase 2: Enhanced MVP (Weeks 4-6)

### Improvements to Phase 1

**Add these features:**

1. **Syntax Highlighting**
```html
<!-- Add highlight.js -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/highlight.js@11/styles/github.min.css">
<script src="https://cdn.jsdelivr.net/npm/highlight.js@11/highlight.min.js"></script>
```

2. **Search Functionality**
```javascript
// Search through article titles and content
class SearchEngine {
    constructor(catalog) {
        this.catalog = catalog;
        this.index = this.buildIndex();
    }
    
    buildIndex() {
        const index = [];
        // Index all articles
        return index;
    }
    
    search(query) {
        return this.index.filter(item => 
            item.title.toLowerCase().includes(query.toLowerCase())
        );
    }
}
```

3. **Dark Mode Toggle**
```javascript
// Store preference in localStorage
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('theme', 
        document.body.classList.contains('dark-mode') ? 'dark' : 'light'
    );
}
```

4. **Table of Contents**
```javascript
// Auto-generate TOC from headings
function generateTableOfContents() {
    const headings = document.querySelectorAll('article h1, article h2, article h3');
    const toc = document.createElement('div');
    toc.className = 'table-of-contents';
    
    headings.forEach(h => {
        const link = document.createElement('a');
        link.href = `#${h.id}`;
        link.textContent = h.textContent;
        toc.appendChild(link);
    });
    
    return toc;
}
```

5. **Read Time Calculation**
```javascript
function estimateReadTime(text) {
    const wordsPerMinute = 200;
    const words = text.split(/\s+/).length;
    return Math.ceil(words / wordsPerMinute);
}
```

6. **Progress Tracking (localStorage)**
```javascript
class ProgressTracker {
    markComplete(articleId) {
        let completed = JSON.parse(localStorage.getItem('completed') || '[]');
        completed.push(articleId);
        localStorage.setItem('completed', JSON.stringify(completed));
    }
    
    getProgress() {
        return JSON.parse(localStorage.getItem('completed') || '[]');
    }
}
```

---

## Phase 3: Migration Plan (Weeks 7-12)

### When to Migrate from GitHub Pages

**Signals to move:**
- Need user accounts & authentication
- Need backend database
- Need real-time features
- GitHub Pages limitations hit

### Migration Architecture

```
Phase 1: Static GitHub Pages
  ↓ (2-3 months)
Phase 2: Full-Stack Web App
  ├─ Frontend: React/Vue (moved from static)
  ├─ Backend: Node.js/Python
  ├─ Database: PostgreSQL/MongoDB
  └─ Hosting: Vercel/Railway
  ↓ (1 month)
Phase 3: Add Mobile App
  └─ React Native (code sharing with web)
```

### Phase 3A: Web App Upgrade (Full Stack)

**New stack:**

| Layer | Technology | Why |
|-------|-----------|-----|
| Frontend | React 18 + TypeScript | Component reuse for mobile |
| Backend | Node.js/Express + TypeScript | Type safety, fast |
| Database | PostgreSQL | ACID, relational data |
| Hosting | Vercel (frontend) + Railway (backend) | Automatic scaling |
| Auth | NextAuth.js | OAuth, no passwords |

**Project structure:**
```
dsa-prep/
├── web/                    (React app)
│   ├── src/
│   │   ├── components/     (reusable components)
│   │   ├── pages/
│   │   ├── hooks/
│   │   └── utils/
│   ├── public/             (assets)
│   └── package.json
├── backend/                (API server)
│   ├── src/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── models/
│   │   └── middleware/
│   └── package.json
├── shared/                 (shared types/utilities)
│   ├── types.ts
│   └── constants.ts
└── mobile/                 (React Native - later)
```

**New features enabled:**
- User authentication
- Progress tracking (database)
- Bookmarks and notes
- Personalized learning path
- Code execution sandbox
- Discussion/comments

### Phase 3B: Mobile App

**Use React Native with code sharing:**

```javascript
// Shared logic between web and mobile
// web/src/hooks/useArticles.ts
// mobile/src/hooks/useArticles.ts (same code!)

export function useArticles() {
    const [articles, setArticles] = useState([]);
    // Fetch from API (works on web and mobile)
    
    return { articles };
}
```

**Build path:**
1. Extract common logic to `shared/` folder
2. Use conditional imports for platform-specific code
3. Deploy to App Store & Google Play

---

## Implementation Roadmap

### Week 1-2: GitHub Pages MVP
- [ ] Create GitHub repo & structure
- [ ] Build basic HTML/CSS/JS site
- [ ] Implement markdown rendering
- [ ] Create router & navigation
- [ ] Deploy to GitHub Pages
- [ ] Add first 5 articles

### Week 3-4: Content & Polish
- [ ] Add remaining tier 1 articles (12 total)
- [ ] Syntax highlighting
- [ ] Mobile responsive design
- [ ] Performance optimization
- [ ] SEO setup

### Week 5-6: Enhanced MVP
- [ ] Search functionality
- [ ] Dark mode
- [ ] Table of contents
- [ ] Read time & progress tracking
- [ ] Analytics (Google Analytics)

### Week 7-8: Plan Full Stack
- [ ] Design database schema
- [ ] Plan API endpoints
- [ ] Set up backend infrastructure
- [ ] Start React migration

### Week 9-12: Full Stack Rollout
- [ ] Build React frontend
- [ ] Implement Node.js backend
- [ ] Database integration
- [ ] User authentication
- [ ] Migration script (GitHub Pages → new DB)

### Month 4+: Mobile App
- [ ] React Native setup
- [ ] Share components/logic with web
- [ ] Build native features (notifications, offline)
- [ ] Submit to app stores

---

## Cost Breakdown

| Phase | Service | Cost |
|-------|---------|------|
| 1-2 | GitHub Pages | Free |
| 1-2 | Domain (optional) | $12/year |
| 3+ | Vercel (frontend) | Free tier → $20/mo |
| 3+ | Railway (backend) | Free tier → $5-50/mo |
| 3+ | PostgreSQL | Free tier → $15/mo |
| 3+ | App Store Developer | $99/year |
| 3+ | Google Play Developer | $25 one-time |

**Total Phase 1-2:** $0-12/year
**Total Phase 3:** $150-250/year

---

## GitHub Pages Deployment Checklist

- [ ] Create GitHub repo (dsa-prep-website)
- [ ] Build project structure (index.html, css/, js/, content/)
- [ ] Implement markdown rendering (markdown-it.js)
- [ ] Create router (hash-based navigation)
- [ ] Build navigation sidebar
- [ ] Style with CSS (light theme first)
- [ ] Copy MD articles to content/ folder
- [ ] Test locally (simple HTTP server)
- [ ] Configure GitHub Pages (Settings → Pages)
- [ ] Push to main branch
- [ ] Verify site live at USERNAME.github.io/dsa-prep-website
- [ ] Set up custom domain (optional)
- [ ] Add Google Analytics
- [ ] Test on mobile
- [ ] Create README.md with instructions

---

## Local Testing (Before Deployment)

```bash
# Simple Python HTTP server
python3 -m http.server 8000

# Or Node.js
npx http-server

# Visit: http://localhost:8000
```

---

## Migration Path Summary

```
GitHub Pages (Static)
    ↓
    Cost: $0
    Time: 2-3 weeks
    Scale: 1k-10k users
    ↓
Full-Stack App (React + Node.js)
    ↓
    Cost: $150-250/year
    Time: 4-8 weeks build + migration
    Scale: 10k-100k users
    Features: Auth, DB, Real-time
    ↓
Mobile App (React Native)
    ↓
    Cost: +$100/year (app store fees)
    Time: 2-4 weeks
    Scale: 100k+ users
    Features: Offline, Push notifications
```

---

## Key Advantages of This Approach

1. **Start cheap:** GitHub Pages is free
2. **Fast launch:** No build process, no backend needed
3. **Git-friendly:** Version control for content automatically
4. **Easy migration:** Simple structure → can rebuild in React later
5. **Code reuse:** Phase 3 reuses Phase 1 components
6. **Scale gradually:** Add features as users grow

---

## Example: Complete First Deploy (30 minutes)

```bash
# 1. Create repo and clone
git clone https://github.com/YOUR_USERNAME/dsa-prep-website.git
cd dsa-prep-website

# 2. Create folder structure
mkdir -p css js content/dsa assets

# 3. Copy article files
cp ~/path/to/01-arrays-strings-fundamentals.md content/dsa/
cp ~/path/to/02-array-manipulation-patterns.md content/dsa/
# ... copy others

# 4. Create files (index.html, css/style.css, js/app.js, etc.)
# (Use templates provided above)

# 5. Commit and push
git add .
git commit -m "Initial deployment: DSA prep website"
git push origin main

# 6. Enable GitHub Pages in Settings
# Site live in 1-2 minutes at:
# https://YOUR_USERNAME.github.io/dsa-prep-website
```

Done! Your website is live.

