/* ============================================
   Markdown Renderer
   ============================================ */

class MarkdownRenderer {
    constructor() {
        // Initialize markdown-it with options
        this.md = window.markdownit({
            html: true,
            linkify: true,
            typographer: true,
            breaks: true,
            highlight: (code, lang) => {
                if (lang && window.hljs && window.hljs.getLanguage(lang)) {
                    try {
                        return window.hljs.highlight(code, {
                            language: lang,
                            ignoreIllegals: true
                        }).value;
                    } catch (e) {
                        Log.error('Syntax highlighting error', e);
                    }
                }
                return this.escapeHtml(code);
            }
        });

        this.setupCustomRenderers();
    }

    /**
     * Setup custom renderers for markdown-it
     */
    setupCustomRenderers() {
        const defaultHeadingOpen = this.md.renderer.rules.heading_open;
        const defaultHeadingClose = this.md.renderer.rules.heading_close;

        // Add IDs to headings for anchor links
        this.md.renderer.rules.heading_open = (tokens, idx) => {
            const level = parseInt(tokens[idx].tag[1]);
            const content = tokens[idx + 1].content;
            const id = StringUtils.slugify(content);

            return `<h${level} id="${id}">`;
        };

        // Custom code block rendering
        this.md.renderer.rules.fence = (tokens, idx) => {
            const token = tokens[idx];
            const lang = token.info.trim();
            const code = token.content;

            const highlighted = this.md.options.highlight
                ? this.md.options.highlight(code, lang)
                : this.escapeHtml(code);

            return `
                <pre><code class="hljs ${lang ? `language-${lang}` : ''}">${highlighted}</code></pre>
            `;
        };

        // Custom link rendering (open in new tab for external links)
        const defaultLinkOpen = this.md.renderer.rules.link_open;
        this.md.renderer.rules.link_open = (tokens, idx) => {
            const href = tokens[idx].attrs[0][1];

            if (href && !href.startsWith('#') && !href.startsWith('/')) {
                tokens[idx].attrSet('target', '_blank');
                tokens[idx].attrSet('rel', 'noopener noreferrer');
            }

            return this.md.renderer.renderToken(tokens, idx, {});
        };
    }

    /**
     * Escape HTML special characters
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
     * Render markdown file
     */
    async renderFile(filepath) {
        try {
            Log.info(`Loading markdown file: ${filepath}`);

            const markdown = await HTTP.fetchText(filepath);
            const html = this.md.render(markdown);

            Log.success(`Markdown file loaded: ${filepath}`);
            return html;
        } catch (error) {
            Log.error(`Error loading markdown file: ${filepath}`, error);
            return this.renderErrorMessage(
                `Failed to load article: ${filepath}`,
                error.message
            );
        }
    }

    /**
     * Render error message
     */
    renderErrorMessage(title, message) {
        return `
            <article class="article">
                <div style="
                    background-color: rgba(239, 68, 68, 0.1);
                    border-left: 4px solid #ef4444;
                    padding: 20px;
                    border-radius: 6px;
                    margin: 20px 0;
                ">
                    <h2 style="color: #ef4444; margin-top: 0;">⚠️ ${title}</h2>
                    <p style="color: #dc2626; margin: 0;">${message}</p>
                </div>
            </article>
        `;
    }

    /**
     * Render HTML to content area
     */
    renderHTML(html) {
        const contentDiv = DOM.getId('content');
        if (!contentDiv) {
            Log.error('Content container not found');
            return;
        }

        contentDiv.innerHTML = `<article class="article">${html}</article>`;

        // Apply styling to rendered content
        this.styleArticle();

        // Scroll to top
        window.scrollTo(0, 0);

        Log.success('Article rendered');
    }

    /**
     * Apply styling classes to rendered content
     */
    styleArticle() {
        const article = document.querySelector('article');
        if (!article) return;

        // Add classes to headings
        this.addHeadingClasses(article);

        // Enhance code blocks
        this.enhanceCodeBlocks(article);

        // Enhance tables
        this.enhanceTables(article);

        // Enhance lists
        this.enhanceLists(article);

        // Add copy buttons to code blocks (future enhancement)
        this.setupCodeBlockCopy(article);
    }

    /**
     * Add CSS classes to headings
     */
    addHeadingClasses(article) {
        article.querySelectorAll('h1').forEach((h) => {
            DOM.addClass(h, 'article-h1');
        });
        article.querySelectorAll('h2').forEach((h) => {
            DOM.addClass(h, 'article-h2');
        });
        article.querySelectorAll('h3').forEach((h) => {
            DOM.addClass(h, 'article-h3');
        });
        article.querySelectorAll('h4').forEach((h) => {
            DOM.addClass(h, 'article-h4');
        });
        article.querySelectorAll('h5').forEach((h) => {
            DOM.addClass(h, 'article-h5');
        });
        article.querySelectorAll('h6').forEach((h) => {
            DOM.addClass(h, 'article-h6');
        });
    }

    /**
     * Enhance code blocks with syntax highlighting
     */
    enhanceCodeBlocks(article) {
        article.querySelectorAll('pre code').forEach((block) => {
            DOM.addClass(block, 'hljs');

            // Get language from class
            const classList = Array.from(block.classList);
            const langClass = classList.find((c) => c.startsWith('language-'));

            if (langClass) {
                const lang = langClass.replace('language-', '');
                block.dataset.language = lang;

                // Highlight if hljs is available
                if (window.hljs) {
                    try {
                        window.hljs.highlightElement(block);
                    } catch (e) {
                        Log.warn('Highlight.js error', e);
                    }
                }
            }
        });
    }

    /**
     * Enhance tables with responsive styling
     */
    enhanceTables(article) {
        article.querySelectorAll('table').forEach((table) => {
            DOM.addClass(table, 'article-table');

            // Wrap table for horizontal scrolling on mobile
            const wrapper = DOM.create('div', 'table-wrapper');
            table.parentNode.insertBefore(wrapper, table);
            wrapper.appendChild(table);
        });
    }

    /**
     * Enhance lists
     */
    enhanceLists(article) {
        article.querySelectorAll('ul').forEach((list) => {
            DOM.addClass(list, 'article-list');
        });

        article.querySelectorAll('ol').forEach((list) => {
            DOM.addClass(list, 'article-list');
        });
    }

    /**
     * Setup copy-to-clipboard for code blocks
     */
    setupCodeBlockCopy(article) {
        article.querySelectorAll('pre').forEach((pre) => {
            const code = pre.querySelector('code');
            if (!code) return;

            // Create copy button
            const button = DOM.create('button', 'copy-button');
            button.innerHTML = '📋 Copy';
            button.style.cssText = `
                position: absolute;
                top: 10px;
                right: 10px;
                padding: 6px 12px;
                background-color: rgba(0, 0, 0, 0.3);
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-size: 12px;
                opacity: 0;
                transition: opacity 200ms;
            `;

            // Show button on hover
            pre.style.position = 'relative';
            pre.appendChild(button);

            pre.addEventListener('mouseenter', () => {
                button.style.opacity = '1';
            });

            pre.addEventListener('mouseleave', () => {
                button.style.opacity = '0';
            });

            // Copy on click
            button.addEventListener('click', async () => {
                try {
                    await navigator.clipboard.writeText(code.textContent);
                    button.innerHTML = '✓ Copied!';
                    setTimeout(() => {
                        button.innerHTML = '📋 Copy';
                    }, 2000);
                } catch (error) {
                    Log.error('Copy to clipboard failed', error);
                    button.innerHTML = '✗ Failed';
                }
            });
        });
    }

    /**
     * Generate table of contents from headings
     */
    generateTableOfContents() {
        const article = document.querySelector('article');
        if (!article) return null;

        const headings = article.querySelectorAll('h2, h3');
        if (headings.length === 0) return null;

        const toc = DOM.create('nav', 'table-of-contents');
        const list = DOM.create('ul');

        headings.forEach((heading) => {
            const level = parseInt(heading.tagName[1]);
            const li = DOM.create('li');
            const a = DOM.create('a');

            a.href = `#${heading.id}`;
            a.textContent = heading.textContent;

            if (level === 3) {
                li.style.marginLeft = '20px';
            }

            li.appendChild(a);
            list.appendChild(li);
        });

        toc.appendChild(list);
        return toc;
    }

    /**
     * Estimate reading time
     */
    estimateReadTime() {
        const article = document.querySelector('article');
        if (!article) return 0;

        const text = article.textContent;
        const wordsPerMinute = 200;
        const words = text.split(/\s+/).length;

        return Math.max(1, Math.ceil(words / wordsPerMinute));
    }

    /**
     * Extract metadata from article
     */
    extractMetadata() {
        const article = document.querySelector('article');
        if (!article) return {};

        const h1 = article.querySelector('h1');
        const firstParagraph = article.querySelector('p');

        return {
            title: h1 ? h1.textContent : 'Untitled',
            description: firstParagraph ? firstParagraph.textContent : '',
            readTime: this.estimateReadTime(),
            headingCount: article.querySelectorAll('h2, h3').length,
            codeBlockCount: article.querySelectorAll('pre').length,
            tableCount: article.querySelectorAll('table').length
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MarkdownRenderer;
}
