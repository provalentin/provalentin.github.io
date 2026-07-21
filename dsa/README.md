# DSA Interview Prep Website

A lightweight, static website for learning Data Structures and Algorithms, hosted on GitHub Pages.

## 🚀 Quick Start (5 minutes)

### Step 1: Clone or Create Repository

```bash
# Create new repo on GitHub named: dsa-prep-website
git clone https://github.com/YOUR_USERNAME/dsa-prep-website.git
cd dsa-prep-website
```

### Step 2: Add Template Files

Copy all files from this template directory into your repo:

```
index.html
css/
  ├── style.css
  └── article.css
js/
  ├── utils.js
  ├── markdown-renderer.js
  ├── router.js
  └── app.js
content/
  ├── index.json
  └── dsa/
      └── (markdown files go here)
.gitignore
README.md
```

### Step 3: Add Your Article Markdown Files

Copy your markdown articles into `content/dsa/`:

```bash
cp 01-arrays-strings-fundamentals.md content/dsa/
cp 02-array-manipulation-patterns.md content/dsa/
# ... copy other articles
```

### Step 4: Deploy to GitHub Pages

```bash
# Commit all files
git add .
git commit -m "Initial commit: DSA prep website"
git push origin main

# Enable GitHub Pages in repository settings:
# GitHub → Settings → Pages → Source: main branch
```

**Your site is live at:** `https://YOUR_USERNAME.github.io/dsa-prep-website`

---

## 📁 Project Structure

```
dsa-prep-website/
├── index.html                 # Main HTML file
├── .gitignore
├── README.md
│
├── css/
│   ├── style.css             # Global styles (sidebar, layout, theme)
│   └── article.css           # Article-specific styles
│
├── js/
│   ├── utils.js              # DOM, storage, theme utilities
│   ├── markdown-renderer.js  # Markdown parsing & rendering
│   ├── router.js             # Client-side routing
│   └── app.js                # Main application logic
│
└── content/
    ├── index.json            # Article catalog
    └── dsa/
        ├── 01-arrays-strings-fundamentals.md
        ├── 02-array-manipulation-patterns.md
        ├── 03-linked-lists-fundamentals.md
        ├── 04-stacks-queues.md
        ├── 05-hash-maps-sets.md
        └── ... (add more articles)
```

---

## ⚙️ Configuration

### Adding Articles

1. **Write markdown file** in `content/dsa/` following naming: `NN-article-name.md`

2. **Update** `content/index.json`:

```json
{
  "dsa": {
    "tier1": [
      {
        "id": "01",
        "title": "Arrays & Strings Fundamentals",
        "file": "content/dsa/01-arrays-strings-fundamentals.md",
        "difficulty": "Easy",
        "readTime": 12,
        "category": "Fundamentals",
        "description": "Your description here"
      }
      // Add more articles...
    ],
    "tier2": [],
    "tier3": []
  }
}
```

3. **Commit and push**:

```bash
git add content/
git commit -m "Add new article: article-name"
git push origin main
```

Site updates automatically!

### Customizing Appearance

**Global colors** - Edit `css/style.css`:

```css
:root {
    --primary-color: #2563eb;      /* Change primary color */
    --text-dark: #1f2937;
    --bg-light: #f9fafb;
    /* ... more variables */
}
```

**Article styling** - Edit `css/article.css`:

```css
.article h1 {
    font-size: 32px;              /* Adjust heading size */
    color: var(--text-dark);
}
```

**Typography** - Edit `index.html`:

```html
<!-- Change font -->
<link href="https://fonts.googleapis.com/css2?family=YOUR_FONT" rel="stylesheet">
```

---

## 🌙 Features

### Current (Phase 1 MVP)

- ✅ Markdown rendering (client-side)
- ✅ Responsive sidebar navigation
- ✅ Light & dark mode toggle
- ✅ Syntax highlighting for code blocks
- ✅ Mobile-friendly design
- ✅ Search in navigation (ready for activation)
- ✅ Progress tracking (localStorage)
- ✅ Fast loading (static files)
- ✅ Free hosting (GitHub Pages)

### Planned (Phase 2)

- 🔲 Full-text search
- 🔲 Table of contents auto-generation
- 🔲 Estimated reading time display
- 🔲 Bookmark system
- 🔲 Code copy button
- 🔲 Comments section
- 🔲 Analytics tracking

### Future (Phase 3 - Full Stack)

- 🔲 User authentication
- 🔲 Database for progress tracking
- 🔲 Personalized learning paths
- 🔲 Mobile app (React Native)
- 🔲 Video hosting integration
- 🔲 Discussion forums
- 🔲 Mock interviews

---

## 🧪 Local Testing

Test locally before deploying:

```bash
# Using Python 3
python3 -m http.server 8000

# Using Node.js
npx http-server

# Using Ruby
ruby -run -ehttpd . -p8000
```

Visit: `http://localhost:8000`

---

## 📝 Adding Content

### Markdown Formatting

```markdown
# H1 Heading
## H2 Heading
### H3 Heading

**Bold text** or __bold text__
*Italic text* or _italic text_

- Bullet point
- Another point

1. Numbered list
2. Second item

> Blockquote

| Column 1 | Column 2 |
|----------|----------|
| Data 1   | Data 2   |

[Link text](https://example.com)

\`\`\`python
# Code block
def hello():
    print("Hello")
\`\`\`

\`inline code\`
```

### Code Highlighting

Supports all major languages. Specify language after triple backticks:

```python
def two_sum(arr, target):
    seen = {}
    for num in arr:
        if target - num in seen:
            return [seen[target - num], num]
        seen[num] = num
```

---

## 🎨 Customization Guide

### Change Brand Colors

**File:** `css/style.css`

```css
:root {
    --primary-color: #2563eb;      /* Links, buttons, active states */
    --primary-dark: #1e40af;       /* Hover states */
    --primary-light: #3b82f6;      /* Light backgrounds */
    --text-dark: #1f2937;          /* Main text */
    --text-light: #6b7280;         /* Secondary text */
    --bg-light: #f9fafb;           /* Sidebar background */
}
```

### Change Fonts

**File:** `index.html` (in `<head>`)

```html
<!-- Add custom font -->
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700" rel="stylesheet">
```

Then update in `css/style.css`:

```css
body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}
```

### Change Sidebar Width

**File:** `css/style.css`

```css
:root {
    --sidebar-width: 280px;  /* Change this value */
}
```

---

## 🔍 SEO & Meta Tags

Update `index.html` for better SEO:

```html
<meta name="description" content="Your site description">
<meta name="keywords" content="dsa, algorithms, interview">
<meta name="author" content="Your Name">
<meta property="og:title" content="DSA Interview Prep">
<meta property="og:description" content="Description">
<meta property="og:image" content="https://example.com/image.png">
```

---

## 📊 Analytics

Enable Google Analytics:

1. **Get tracking ID** from Google Analytics
2. **Uncomment in `index.html`:**

```javascript
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');  // Add your ID
</script>
```

---

## 🐛 Troubleshooting

### Articles Not Loading

**Check:** `content/index.json` has correct file paths

**Check:** Markdown file exists at specified path

**Check:** Run `console` (F12) for JavaScript errors

### Styles Not Applied

**Check:** CSS files are in `css/` directory

**Check:** No typos in class names

**Hard refresh:** Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

### GitHub Pages Not Showing

**Check:** Repository settings → Pages → Source is set to `main` branch

**Check:** Wait 1-2 minutes for GitHub to build site

**Check:** Visit `https://USERNAME.github.io/dsa-prep-website/` (with trailing slash)

---

## 🚀 Deployment Checklist

Before pushing to GitHub:

- [ ] All markdown files in `content/dsa/`
- [ ] `content/index.json` updated with all articles
- [ ] No broken links in markdown
- [ ] Tested locally (no 404s)
- [ ] Dark mode toggle works
- [ ] Mobile view responsive
- [ ] No JavaScript errors (console clear)
- [ ] Git repo created and configured
- [ ] GitHub Pages enabled in settings

---

## 📱 Mobile Optimization

Site is fully responsive:

- Desktop: Sidebar + content layout
- Tablet: Adjusts spacing and font sizes
- Mobile: Sidebar collapses, full-width content

Test on phone:

```bash
# Get your machine's IP
ipconfig getifaddr en0  # Mac
hostname -I            # Linux

# Visit on phone: http://YOUR_IP:8000
```

---

## 📚 Next Steps

1. **Add more articles** - Write tier 2 and tier 3 content
2. **Enhance features** - Implement Phase 2 features (search, TOC)
3. **Custom domain** - Point domain to GitHub Pages
4. **Migrate to full stack** - When you need user accounts and database
5. **Mobile app** - Build React Native version

---

## 🔗 Resources

- [markdown-it Documentation](https://github.com/markdown-it/markdown-it)
- [Highlight.js](https://highlightjs.org/)
- [GitHub Pages Help](https://docs.github.com/en/pages)
- [MDN Web Docs](https://developer.mozilla.org/)

---

## 📄 License

This project is open source. Use for learning and teaching.

---

## 💬 Support

Issues or questions? Check:

1. [Troubleshooting section](#-troubleshooting) above
2. GitHub Issues in repository
3. Console errors (F12 → Console tab)

---

## 🎯 Success Tips

- **Start small:** Begin with 5 articles, expand later
- **Keep writing:** Add one article per week
- **Get feedback:** Share with friends, gather feedback
- **Stay consistent:** Regular updates keep users engaged
- **Plan upgrades:** Document migration to full stack app

---

**Happy learning! Good luck with your interviews! 🚀**
