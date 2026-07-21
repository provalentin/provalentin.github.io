/* ============================================
   Main Application Logic
   ============================================ */

// Global app state
let renderer = null;
let router = null;
let catalog = null;
let allArticles = [];

/**
 * Main App Class
 */
class App {
    /**
     * Initialize the application
     */
    static async init() {
        try {
            Log.info('Application initializing...');

            // Initialize components
            renderer = new MarkdownRenderer();
            router = new Router();

            // Load content catalog
            await this.loadCatalog();

            // Register routes
            this.registerRoutes();

            // Build navigation
            this.buildNavigation();

            // Setup event listeners
            this.setupEventListeners();

            // Setup router hooks
            this.setupRouterHooks();

            // Start router
            router.init();

            Log.success('Application initialized successfully');
        } catch (error) {
            Log.error('Application initialization failed', error);
            this.renderFatalError(error);
        }
    }

    /**
     * Load content catalog
     */
    static async loadCatalog() {
        try {
            Log.info('Loading content catalog...');

            const response = await HTTP.fetch('content/index.json');
            catalog = response;

            // Flatten all articles for easy access
            allArticles = [];
            if (catalog.dsa) {
                if (catalog.dsa.tier1) allArticles.push(...catalog.dsa.tier1);
                if (catalog.dsa.tier2) allArticles.push(...catalog.dsa.tier2);
                if (catalog.dsa.tier3) allArticles.push(...catalog.dsa.tier3);
            }

            Log.success(`Catalog loaded: ${allArticles.length} articles`);
        } catch (error) {
            Log.error('Error loading catalog', error);
            throw error;
        }
    }

    /**
     * Register all routes
     */
    static registerRoutes() {
        Log.info('Registering routes...');

        // Home route
        router.register('/', async () => {
            const homeHtml = this.renderHomePage();
            DOM.setHTML(DOM.getId('content'), homeHtml);
        });

        // Dynamic article routes
        if (allArticles.length > 0) {
            allArticles.forEach((article) => {
                router.register(`/article/${article.id}`, async () => {
                    await this.renderArticle(article);
                    this.updateActiveNav(`article-${article.id}`);
                });
            });
        }

        Log.success(`Routes registered: ${allArticles.length + 1} total`);
    }

    /**
     * Render home page
     */
    static renderHomePage() {
        return `
            <article class="article">
                <h1>DSA Interview Prep</h1>
                <p>Master data structures and algorithms for big tech interviews.</p>

                <h2>Getting Started</h2>
                <p>
                    This platform provides comprehensive articles and practice problems to help you ace
                    your technical interviews at companies like Google, Facebook, Amazon, Microsoft, and Apple.
                </p>

                <h2>What You'll Learn</h2>
                <ul>
                    <li><strong>Fundamentals:</strong> Arrays, strings, linked lists, stacks, queues, hash maps</li>
                    <li><strong>Intermediate:</strong> Trees, graphs, dynamic programming, sorting</li>
                    <li><strong>Advanced:</strong> Advanced DP, segment trees, bit manipulation</li>
                </ul>

                <h2>How to Use</h2>
                <ol>
                    <li>Select a topic from the sidebar</li>
                    <li>Read the article carefully, understanding each concept</li>
                    <li>Practice the recommended problems</li>
                    <li>Review the interview tips and common pitfalls</li>
                    <li>Move to the next topic once you feel confident</li>
                </ol>

                <h2>Topics Available</h2>
                <div style="display: grid; gap: 12px;">
                    ${this.renderTopicsList()}
                </div>

                <h2>Tips for Success</h2>
                <ul>
                    <li><strong>Understand, don't memorize:</strong> Focus on why algorithms work, not just how</li>
                    <li><strong>Code consistently:</strong> Write solutions daily, not just before interviews</li>
                    <li><strong>Optimize gradually:</strong> Start with brute force, then optimize</li>
                    <li><strong>Communicate clearly:</strong> Explain your approach as you code</li>
                    <li><strong>Track progress:</strong> Review completed topics to measure progress</li>
                </ul>

                <hr>
                <p style="font-size: 13px; color: var(--text-light);">
                    <strong>Pro tip:</strong> Use dark mode (bottom left) for late-night studying! 🌙
                </p>
            </article>
        `;
    }

    /**
     * Render topics list on home page
     */
    static renderTopicsList() {
        if (!catalog.dsa) return '';

        let html = '';

        if (catalog.dsa.tier1 && catalog.dsa.tier1.length > 0) {
            html += '<div><strong>Fundamentals (Tier 1)</strong></div>';
            catalog.dsa.tier1.forEach((article) => {
                html += `
                    <div style="
                        padding: 8px;
                        background: var(--bg-lighter);
                        border-radius: 4px;
                        cursor: pointer;
                        transition: all 200ms;
                    " onmouseover="this.style.backgroundColor='rgba(37, 99, 235, 0.1)'"
                       onmouseout="this.style.backgroundColor='var(--bg-lighter)'">
                        <a href="#/article/${article.id}" style="
                            text-decoration: none;
                            color: var(--text-dark);
                        ">
                            <strong>${article.title}</strong>
                            <span style="float: right; color: var(--text-light); font-size: 12px;">
                                ${article.readTime}min
                            </span>
                        </a>
                    </div>
                `;
            });
        }

        return html;
    }

    /**
     * Render an article
     */
    static async renderArticle(article) {
        try {
            Log.info(`Loading article: ${article.id} - ${article.title}`);

            // Load and render markdown
            const html = await renderer.renderFile(article.file);
            renderer.renderHTML(html);

            // Mark as visited
            Progress.markComplete(article.id);

            // Update progress indicators (future enhancement)
            this.updateProgressIndicators();
        } catch (error) {
            Log.error(`Error rendering article: ${article.id}`, error);
            throw error;
        }
    }

    /**
     * Build navigation sidebar
     */
    static buildNavigation() {
        const navContent = DOM.getId('nav-content');
        if (!navContent) {
            Log.error('Navigation container not found');
            return;
        }

        navContent.innerHTML = '';

        if (!catalog.dsa) {
            navContent.innerHTML = '<p style="color: var(--text-light);">No articles available</p>';
            return;
        }

        // Tier 1: Fundamentals
        if (catalog.dsa.tier1 && catalog.dsa.tier1.length > 0) {
            this.addNavSection('Fundamentals', catalog.dsa.tier1, navContent);
        }

        // Tier 2: Intermediate
        if (catalog.dsa.tier2 && catalog.dsa.tier2.length > 0) {
            this.addNavSection('Intermediate', catalog.dsa.tier2, navContent);
        }

        // Tier 3: Advanced
        if (catalog.dsa.tier3 && catalog.dsa.tier3.length > 0) {
            this.addNavSection('Advanced', catalog.dsa.tier3, navContent);
        }

        Log.success('Navigation built');
    }

    /**
     * Add a navigation section
     */
    static addNavSection(title, articles, container) {
        const section = DOM.create('div', 'nav-section');

        const heading = DOM.create('h3');
        DOM.setText(heading, title);
        section.appendChild(heading);

        articles.forEach((article) => {
            const link = DOM.create('a', 'nav-link');
            link.id = `article-${article.id}`;
            link.href = `#/article/${article.id}`;
            DOM.setText(link, article.title);

            section.appendChild(link);
        });

        container.appendChild(section);
    }

    /**
     * Update active navigation item
     */
    static updateActiveNav(itemId) {
        // Remove active class from all links
        document.querySelectorAll('.nav-link').forEach((link) => {
            DOM.removeClass(link, 'active');
        });

        // Add active class to current item
        const item = DOM.getId(itemId);
        if (item) {
            DOM.addClass(item, 'active');
        }
    }

    /**
     * Setup event listeners
     */
    static setupEventListeners() {
        // Theme toggle button
        const themeBtn = DOM.getId('theme-btn');
        if (themeBtn) {
            DOM.on(themeBtn, 'click', () => {
                ThemeManager.toggle();
            });
        }

        // Search input (for Phase 2)
        const searchInput = DOM.getId('search-input');
        if (searchInput) {
            DOM.on(
                searchInput,
                'input',
                debounce((e) => {
                    App.handleSearch(e.target.value);
                }, 300)
            );
        }
    }

    /**
     * Setup router hooks
     */
    static setupRouterHooks() {
        // Before navigation hook
        router.before(async (path) => {
            Log.info(`Before navigation: ${path}`);
            return true;
        });

        // After navigation hook
        router.after(async (path) => {
            Log.info(`After navigation: ${path}`);
            // Update page title
            if (path === '/') {
                document.title = 'DSA Interview Prep';
            } else {
                const articleId = path.replace('/article/', '');
                const article = allArticles.find((a) => a.id === articleId);
                if (article) {
                    document.title = `${article.title} - DSA Interview Prep`;
                }
            }
        });
    }

    /**
     * Handle search (Phase 2 feature)
     */
    static handleSearch(query) {
        if (!query.trim()) {
            this.buildNavigation();
            return;
        }

        const results = allArticles.filter((article) =>
            article.title.toLowerCase().includes(query.toLowerCase())
        );

        const navContent = DOM.getId('nav-content');
        navContent.innerHTML = '';

        if (results.length === 0) {
            const msg = DOM.create('p');
            msg.style.color = 'var(--text-light)';
            DOM.setText(msg, 'No articles found');
            navContent.appendChild(msg);
            return;
        }

        this.addNavSection('Search Results', results, navContent);
    }

    /**
     * Update progress indicators (Phase 2 feature)
     */
    static updateProgressIndicators() {
        const completed = Progress.getCompleted().length;
        const total = allArticles.length;
        const percentage = Progress.getPercentage(total);

        // Update progress display (add to sidebar footer in Phase 2)
        Log.info(`Progress: ${completed}/${total} (${percentage}%)`);
    }

    /**
     * Render fatal error page
     */
    static renderFatalError(error) {
        const app = DOM.getId('app');
        if (!app) return;

        app.innerHTML = `
            <div style="
                width: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                background: #111827;
                color: #f3f4f6;
                font-family: system-ui, sans-serif;
                padding: 20px;
            ">
                <div style="max-width: 500px; text-align: center;">
                    <h1 style="font-size: 48px; margin-bottom: 20px;">☠️</h1>
                    <h2 style="margin-bottom: 10px;">Fatal Error</h2>
                    <p style="color: #d1d5db; margin-bottom: 20px;">
                        The application encountered a critical error and could not continue.
                    </p>
                    <pre style="
                        background: #1f2937;
                        padding: 16px;
                        border-radius: 8px;
                        overflow-x: auto;
                        text-align: left;
                        font-size: 12px;
                        color: #60a5fa;
                    ">${error.message}</pre>
                    <button style="
                        margin-top: 20px;
                        padding: 12px 24px;
                        background: #2563eb;
                        color: white;
                        border: none;
                        border-radius: 6px;
                        cursor: pointer;
                        font-size: 16px;
                    " onclick="location.reload()">
                        Reload Page
                    </button>
                </div>
            </div>
        `;
    }
}

/**
 * Initialize app when DOM is ready
 */
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});

/**
 * Handle offline/online status
 */
window.addEventListener('offline', () => {
    Log.warn('You are now offline');
    // Add offline indicator to UI (Phase 2)
});

window.addEventListener('online', () => {
    Log.info('You are back online');
    // Remove offline indicator (Phase 2)
});

/**
 * Global error handler
 */
window.addEventListener('error', (event) => {
    Log.error('Uncaught error', {
        message: event.message,
        source: event.filename,
        line: event.lineno
    });
});

/**
 * Global promise rejection handler
 */
window.addEventListener('unhandledrejection', (event) => {
    Log.error('Unhandled promise rejection', event.reason);
});
