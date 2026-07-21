/* ============================================
   Client-Side Router
   ============================================ */

class Router {
    constructor() {
        this.routes = {};
        this.currentRoute = null;
        this.beforeHooks = [];
        this.afterHooks = [];
    }

    /**
     * Register a route
     */
    register(path, handler) {
        if (typeof handler !== 'function') {
            throw new Error(`Handler for route "${path}" must be a function`);
        }
        this.routes[path] = handler;
        Log.info(`Route registered: ${path}`);
    }

    /**
     * Register multiple routes at once
     */
    registerBatch(routeMap) {
        Object.entries(routeMap).forEach(([path, handler]) => {
            this.register(path, handler);
        });
    }

    /**
     * Register a before hook (runs before navigation)
     */
    before(hook) {
        if (typeof hook !== 'function') {
            throw new Error('Before hook must be a function');
        }
        this.beforeHooks.push(hook);
    }

    /**
     * Register an after hook (runs after navigation)
     */
    after(hook) {
        if (typeof hook !== 'function') {
            throw new Error('After hook must be a function');
        }
        this.afterHooks.push(hook);
    }

    /**
     * Navigate to a route
     */
    async navigate(path) {
        Log.info(`Navigating to: ${path}`);

        // Check if route exists
        const handler = this.routes[path];
        if (!handler) {
            Log.warn(`Route not found: ${path}`);
            this.navigateToHome();
            return false;
        }

        // Run before hooks
        for (const hook of this.beforeHooks) {
            const result = await hook(path);
            if (result === false) {
                Log.warn(`Navigation blocked by before hook`);
                return false;
            }
        }

        try {
            // Call the route handler
            await handler();

            // Update current route
            this.currentRoute = path;

            // Update URL hash
            window.location.hash = path;

            // Run after hooks
            for (const hook of this.afterHooks) {
                await hook(path);
            }

            Log.success(`Navigated to: ${path}`);
            return true;
        } catch (error) {
            Log.error(`Navigation error for route: ${path}`, error);
            this.renderErrorPage(path, error.message);
            return false;
        }
    }

    /**
     * Navigate to home
     */
    navigateToHome() {
        window.location.hash = '/';
    }

    /**
     * Get current route
     */
    getCurrentRoute() {
        return this.currentRoute;
    }

    /**
     * Parse URL path from hash
     */
    parsePath() {
        const hash = window.location.hash.slice(1);
        return hash.startsWith('/') ? hash : `/${hash}`;
    }

    /**
     * Initialize router (must be called once)
     */
    init() {
        Log.info('Router initializing');

        // Handle hash changes
        const handleHashChange = async () => {
            const path = this.parsePath();
            await this.navigate(path);
        };

        window.addEventListener('hashchange', handleHashChange);

        // Handle initial load
        const initialPath = this.parsePath();
        if (!initialPath || initialPath === '/') {
            this.navigate('/');
        } else {
            this.navigate(initialPath);
        }

        Log.success('Router initialized');
    }

    /**
     * Render error page
     */
    renderErrorPage(path, message) {
        const contentDiv = DOM.getId('content');
        if (!contentDiv) return;

        contentDiv.innerHTML = `
            <article class="article">
                <div style="
                    background-color: rgba(239, 68, 68, 0.1);
                    border-left: 4px solid #ef4444;
                    padding: 20px;
                    border-radius: 6px;
                    margin: 20px 0;
                ">
                    <h2 style="color: #ef4444; margin-top: 0;">⚠️ Navigation Error</h2>
                    <p><strong>Route:</strong> ${this.escapeHtml(path)}</p>
                    <p><strong>Error:</strong> ${this.escapeHtml(message)}</p>
                    <p><a href="#/" style="color: #2563eb;">← Back to home</a></p>
                </div>
            </article>
        `;
    }

    /**
     * Escape HTML
     */
    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, (m) => map[m]);
    }

    /**
     * Get all registered routes
     */
    getRoutes() {
        return Object.keys(this.routes);
    }

    /**
     * Check if route exists
     */
    hasRoute(path) {
        return path in this.routes;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Router;
}
