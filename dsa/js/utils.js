/* ============================================
   Utility Functions
   ============================================ */

/**
 * DOM Utilities
 */
const DOM = {
    /**
     * Get element by ID
     */
    getId: (id) => document.getElementById(id),

    /**
     * Get elements by class name
     */
    getClass: (className) => document.querySelectorAll(`.${className}`),

    /**
     * Get element by selector
     */
    query: (selector) => document.querySelector(selector),

    /**
     * Get all elements by selector
     */
    queryAll: (selector) => document.querySelectorAll(selector),

    /**
     * Add event listener
     */
    on: (element, event, handler) => {
        if (element) {
            element.addEventListener(event, handler);
        }
    },

    /**
     * Remove event listener
     */
    off: (element, event, handler) => {
        if (element) {
            element.removeEventListener(event, handler);
        }
    },

    /**
     * Add class to element
     */
    addClass: (element, className) => {
        if (element) {
            element.classList.add(className);
        }
    },

    /**
     * Remove class from element
     */
    removeClass: (element, className) => {
        if (element) {
            element.classList.remove(className);
        }
    },

    /**
     * Toggle class on element
     */
    toggleClass: (element, className) => {
        if (element) {
            element.classList.toggle(className);
        }
    },

    /**
     * Check if element has class
     */
    hasClass: (element, className) => {
        if (!element) return false;
        return element.classList.contains(className);
    },

    /**
     * Set text content
     */
    setText: (element, text) => {
        if (element) {
            element.textContent = text;
        }
    },

    /**
     * Set HTML content
     */
    setHTML: (element, html) => {
        if (element) {
            element.innerHTML = html;
        }
    },

    /**
     * Get text content
     */
    getText: (element) => {
        return element ? element.textContent : '';
    },

    /**
     * Create element
     */
    create: (tag, className = '') => {
        const element = document.createElement(tag);
        if (className) {
            element.className = className;
        }
        return element;
    }
};

/**
 * Storage Utilities (localStorage wrapper)
 */
const Storage = {
    /**
     * Set item in localStorage
     */
    set: (key, value) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.warn('Storage.set error:', error);
        }
    },

    /**
     * Get item from localStorage
     */
    get: (key, defaultValue = null) => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.warn('Storage.get error:', error);
            return defaultValue;
        }
    },

    /**
     * Remove item from localStorage
     */
    remove: (key) => {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.warn('Storage.remove error:', error);
        }
    },

    /**
     * Clear localStorage
     */
    clear: () => {
        try {
            localStorage.clear();
        } catch (error) {
            console.warn('Storage.clear error:', error);
        }
    }
};

/**
 * Theme Management
 */
const ThemeManager = {
    STORAGE_KEY: 'theme',
    DARK_CLASS: 'dark-mode',

    /**
     * Initialize theme
     */
    init: () => {
        const savedTheme = Storage.get(ThemeManager.STORAGE_KEY);

        // Check for saved preference
        if (savedTheme) {
            ThemeManager.setTheme(savedTheme);
        }
        // Check for system preference
        else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            ThemeManager.setTheme('dark');
        }
    },

    /**
     * Set theme
     */
    setTheme: (theme) => {
        if (theme === 'dark') {
            document.body.classList.add(ThemeManager.DARK_CLASS);
            Storage.set(ThemeManager.STORAGE_KEY, 'dark');
            ThemeManager.updateThemeButton('☀️');
        } else {
            document.body.classList.remove(ThemeManager.DARK_CLASS);
            Storage.set(ThemeManager.STORAGE_KEY, 'light');
            ThemeManager.updateThemeButton('🌙');
        }
    },

    /**
     * Toggle theme
     */
    toggle: () => {
        const isDark = document.body.classList.contains(ThemeManager.DARK_CLASS);
        ThemeManager.setTheme(isDark ? 'light' : 'dark');
    },

    /**
     * Get current theme
     */
    getCurrentTheme: () => {
        return document.body.classList.contains(ThemeManager.DARK_CLASS) ? 'dark' : 'light';
    },

    /**
     * Update theme button icon
     */
    updateThemeButton: (icon) => {
        const btn = DOM.getId('theme-btn');
        if (btn) {
            const iconSpan = btn.querySelector('.theme-icon');
            if (iconSpan) {
                iconSpan.textContent = icon;
            }
        }
    }
};

/**
 * Progress Tracking
 */
const Progress = {
    STORAGE_KEY: 'dsa-progress',

    /**
     * Mark article as completed
     */
    markComplete: (articleId) => {
        const completed = Progress.getCompleted();
        if (!completed.includes(articleId)) {
            completed.push(articleId);
            Storage.set(Progress.STORAGE_KEY, completed);
        }
    },

    /**
     * Check if article is completed
     */
    isCompleted: (articleId) => {
        const completed = Progress.getCompleted();
        return completed.includes(articleId);
    },

    /**
     * Get all completed articles
     */
    getCompleted: () => {
        return Storage.get(Progress.STORAGE_KEY, []);
    },

    /**
     * Get completion percentage
     */
    getPercentage: (total) => {
        const completed = Progress.getCompleted().length;
        return total > 0 ? Math.round((completed / total) * 100) : 0;
    },

    /**
     * Clear progress
     */
    clear: () => {
        Storage.remove(Progress.STORAGE_KEY);
    }
};

/**
 * URL & Routing Utilities
 */
const URL = {
    /**
     * Get hash from URL
     */
    getHash: () => {
        return window.location.hash.slice(1);
    },

    /**
     * Set hash in URL
     */
    setHash: (hash) => {
        window.location.hash = hash;
    },

    /**
     * Parse query parameters
     */
    getParams: () => {
        const params = new URLSearchParams(window.location.search);
        const result = {};
        params.forEach((value, key) => {
            result[key] = value;
        });
        return result;
    }
};

/**
 * String Utilities
 */
const StringUtils = {
    /**
     * Slugify string
     */
    slugify: (str) => {
        return str
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
    },

    /**
     * Capitalize first letter
     */
    capitalize: (str) => {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1);
    },

    /**
     * Truncate string
     */
    truncate: (str, length, suffix = '...') => {
        if (str.length <= length) return str;
        return str.substring(0, length).trimEnd() + suffix;
    },

    /**
     * Repeat string
     */
    repeat: (str, times) => {
        return str.repeat(times);
    }
};

/**
 * Number Utilities
 */
const NumberUtils = {
    /**
     * Format number with commas
     */
    format: (num) => {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    },

    /**
     * Round to decimal places
     */
    round: (num, decimals = 0) => {
        return Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals);
    },

    /**
     * Clamp number between min and max
     */
    clamp: (num, min, max) => {
        return Math.max(min, Math.min(max, num));
    }
};

/**
 * Array Utilities
 */
const ArrayUtils = {
    /**
     * Remove duplicates
     */
    unique: (arr) => {
        return [...new Set(arr)];
    },

    /**
     * Flatten nested array
     */
    flatten: (arr) => {
        return arr.reduce((flat, item) => {
            return flat.concat(Array.isArray(item) ? Array.flatten(item) : item);
        }, []);
    },

    /**
     * Shuffle array
     */
    shuffle: (arr) => {
        const shuffled = [...arr];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    },

    /**
     * Group array by key
     */
    groupBy: (arr, key) => {
        return arr.reduce((groups, item) => {
            const group = item[key];
            if (!groups[group]) {
                groups[group] = [];
            }
            groups[group].push(item);
            return groups;
        }, {});
    }
};

/**
 * Fetch & HTTP Utilities
 */
const HTTP = {
    /**
     * Fetch with error handling
     */
    fetch: async (url, options = {}) => {
        try {
            const response = await fetch(url, options);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error('HTTP fetch error:', error);
            throw error;
        }
    },

    /**
     * Fetch text file
     */
    fetchText: async (url) => {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            return await response.text();
        } catch (error) {
            console.error('HTTP fetchText error:', error);
            throw error;
        }
    }
};

/**
 * Logging Utilities
 */
const Log = {
    /**
     * Log info
     */
    info: (message, data = null) => {
        console.log(`%c[INFO] ${message}`, 'color: #2563eb; font-weight: bold;', data);
    },

    /**
     * Log warning
     */
    warn: (message, data = null) => {
        console.warn(`%c[WARN] ${message}`, 'color: #f59e0b; font-weight: bold;', data);
    },

    /**
     * Log error
     */
    error: (message, data = null) => {
        console.error(`%c[ERROR] ${message}`, 'color: #ef4444; font-weight: bold;', data);
    },

    /**
     * Log success
     */
    success: (message, data = null) => {
        console.log(`%c[SUCCESS] ${message}`, 'color: #10b981; font-weight: bold;', data);
    }
};

/**
 * Debounce function
 */
const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

/**
 * Throttle function
 */
const throttle = (func, limit) => {
    let inThrottle;
    return function executedFunction(...args) {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => (inThrottle = false), limit);
        }
    };
};

/**
 * Wait for element to be ready
 */
const waitForElement = (selector, timeout = 5000) => {
    return new Promise((resolve, reject) => {
        const element = document.querySelector(selector);
        if (element) {
            resolve(element);
            return;
        }

        const observer = new MutationObserver(() => {
            const element = document.querySelector(selector);
            if (element) {
                observer.disconnect();
                resolve(element);
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        setTimeout(() => {
            observer.disconnect();
            reject(new Error(`Element "${selector}" not found within ${timeout}ms`));
        }, timeout);
    });
};

// Initialize theme on page load
document.addEventListener('DOMContentLoaded', () => {
    ThemeManager.init();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        DOM,
        Storage,
        ThemeManager,
        Progress,
        URL,
        StringUtils,
        NumberUtils,
        ArrayUtils,
        HTTP,
        Log,
        debounce,
        throttle,
        waitForElement
    };
}
