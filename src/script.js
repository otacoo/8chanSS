////////// HELPERS ///////////////////////
// DOM onReady Helper
function onReady(fn) {
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", fn, { once: true });
    } else {
        fn();
    }
}
// Debouncer
// Usage: debounce(fn, delay);
const debounce = (fn, delay) => {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => fn.apply(this, args), delay);
    };
};
// Observer registry helper
const observerRegistry = {};
let unloadListenerAdded = false;

function observeSelector(selector, options = { childList: true, subtree: false }) {
    if (observerRegistry[selector]) return observerRegistry[selector];

    const node = document.querySelector(selector);
    if (!node) return null;

    const handlers = [];
    const observer = new MutationObserver(mutations => {
        for (const handler of handlers) {
            try {
                handler(mutations, node);
            } catch (e) {
                console.error(`Observer handler error for ${selector}:`, e);
            }
        }
    });

    observer.observe(node, options);

    // Disconnect on unload, use a single shared listener for all observers
    if (!unloadListenerAdded) {
        unloadListenerAdded = true;
        window.addEventListener('beforeunload', () => {
            for (const key in observerRegistry) {
                observerRegistry[key].observer.disconnect();
            }
        }, { once: true });
    }

    observerRegistry[selector] = {
        node,
        observer,
        handlers,
        addHandler: fn => handlers.push(fn)
    };
    return observerRegistry[selector];
}
// URL-based location helper (catalog, thread, index) 
// Usage: e.g. window.pageType.isCatalog, or to get the raw values: window.pageType.host or pageType.path
window.pageType = (() => {
    const path = window.location.pathname.toLowerCase();
    const currentHost = window.location.hostname.toLowerCase();

    return {
        isCatalog: /\/catalog\.html$/i.test(path),
        isThread: /\/(res|last)\/[^/]+\.html$/i.test(path),
        isLast: /\/last\/[^/]+\.html$/i.test(path),
        isIndex: /\/[^/]+\/$/i.test(path),
        is8chan: /^8chan\.(moe|st|cc)$/.test(currentHost),
        host: currentHost,
        path: path
    };
})();
///////// CSS Shim Inject ASAP ////////////
(function injectCssAsap() {
    function doInject() {
        if (document.getElementById('8chSShim')) return;
        if (!document.head) {
            setTimeout(doInject, 1);
            return;
        }
        const style = document.createElement('style');
        style.id = '8chSShim';
        style.textContent = "<%= grunt.file.read('tmp/shim.min.css').replace(/\\(^\")/g, '') %>";
        document.head.appendChild(style);
    }
    doInject();
})();
//////// START OF THE SCRIPT ////////////////////
onReady(async function () {
    "use strict";
    //////// GLOBAL SELECTORS ///////////////////////
    const divThreads = document.getElementById('divThreads');
    const innerOP = document.querySelector('.innerOP');
    const divPosts = document.querySelector('.divPosts');
    const opHeadTitle = document.querySelector('.opHead.title');
    const catalogDiv = document.querySelector('.catalogDiv');
    // Storage keys
    const HIDDEN_POSTS_KEY = '8chanSS_hiddenPosts';
    const FILTERED_NAMES_KEY = '8chanSS_filteredNames';
    const FILTERED_IDS_KEY = '8chanSS_filteredIDs';
    // Version
    const VERSION = "<%= version %>";

    /////// Default Settings ////////////////////////
    const scriptSettings = {
        site: {
            _siteTWTitle: { type: "title", label: ":: Thread Watcher" },
            _siteSection1: { type: "separator" },
            alwaysShowTW: {
                label: "Pin Thread Watcher",
                default: false,
                subOptions: {
                    noPinInCatalog: {
                        label: "Don't pin in Catalog",
                        default: false,
                    }
                }
            },
            autoExpandTW: { label: "Auto Expand Thread Watcher", default: false },
            _siteSiteTitle: { type: "title", label: ":: Site" },
            _siteSection2: { type: "separator" },
            customFavicon: {
                label: "Custom Favicon",
                default: false,
                subOptions: {
                    faviconStyle: {
                        label: "Favicon Style",
                        type: "select",
                        default: "default",
                        options: [
                            { value: "default", label: "Default" },
                            { value: "pixel", label: "Pixel" },
                            { value: "pixel_alt", label: "Pixel Alt" },
                            { value: "eight", label: "Eight" },
                            { value: "eight_dark", label: "Eight Dark" }
                        ]
                    }
                }
            },
            enableBottomHeader: { label: "Bottom Header", default: false },
            enableAutoHideHeaderScroll: { label: "Auto-hide Header On Scroll", default: false },
            enableHeaderCatalogLinks: {
                label: "Header Catalog Links",
                default: true,
                subOptions: {
                    openInNewTab: {
                        label: "Always open in new tab",
                        default: false,
                    }
                }
            },
            enableScrollArrows: { label: "Show Up/Down Arrows", default: false },
            _siteMediaTitle: { type: "title", label: ":: Media" },
            _siteSection3: { type: "separator" },
            enableFitImage: { label: "Fit expanded Images and Videos", default: true },
            blurSpoilers: {
                label: "Blur Spoilers",
                default: false,
                subOptions: {
                    removeSpoilers: {
                        label: "Remove Spoilers",
                        default: false
                    }
                }
            },
            enablePNGstop: { label: "Prevent animated PNG images from playing", default: false },
            enableMediaViewer: {
                label: "Enable Advanced Media Viewer",
                default: false,
                subOptions: {
                    viewerStyle: {
                        label: "Style",
                        type: "select",
                        default: "native",
                        options: [
                            { value: "native", label: "Native" },
                            { value: "topright", label: "Pin Top Right" },
                            { value: "topleft", label: "Pin Top Left" }
                        ]
                    }
                }
            },
            hoverVideoVolume: { label: "Hover Media Volume (0-100%)", default: 50, type: "number", min: 0, max: 100 }
        },
        threads: {
            _threadsNotiTitle: { type: "title", label: ":: Notifications" },
            _threadsSection1: { type: "separator" },
            beepOnYou: { label: "Beep on (You)", default: false },
            notifyOnYou: {
                label: "Tab Notification when (You) (!)",
                default: true,
                subOptions: {
                    customMessage: {
                        label: "Custom Text (max: 8 chars.)",
                        default: "",
                        type: "text",
                        maxLength: 9
                    }
                }
            },
            _threadsNavTitle: { type: "title", label: ":: Navigation & Others" },
            _threadsSection3: { type: "separator" },
            enableThreadImageHover: { label: "Thread Image Hover", default: true },
            enableBacklinkIcons: { label: "Backlink Icons", default: false },
            enableScrollSave: {
                label: "Save Scroll Position",
                default: true,
                subOptions: {
                    showUnreadLine: {
                        label: "Show Unread Line",
                        default: true,
                    }
                }
            },
            quoteThreading: { label: "Quote Threading (Shift + T to toggle)", default: false },
            enableHashNav: { label: "Hash Navigation", default: false },
            threadStatsInHeader: { label: "Thread Stats in Header", default: false },
            watchThreadOnReply: { label: "Watch Thread on Reply", default: true },
            hideHiddenPostStub: { label: "Hide Stubs of Hidden Posts", default: false, },
            _miscelIDTitle: { type: "title", label: ":: IDs" },
            _miscelSection2: { type: "separator" },
            highlightNewIds: {
                label: "Highlight New IDs",
                default: false,
                subOptions: {
                    idHlStyle: {
                        label: "Highlight Style",
                        type: "select",
                        default: "moetext",
                        options: [
                            { value: "moetext", label: "Moe" },
                            { value: "glow", label: "Glow" },
                            { value: "dotted", label: "Border" }
                        ]
                    }
                }
            },
            alwaysShowIdCount: { label: "Always show ID post count", default: false },
            enableIdFilters: {
                label: "Show all posts by ID when ID is clicked",
                type: "checkbox",
                default: true,
                subOptions: {
                    idViewMode: {
                        label: "View Mode",
                        type: "select",
                        default: "showPostsOfIdOnly",
                        options: [
                            { value: "showPostsOfIdOnly", label: "Only ID's posts" },
                            { value: "showIdLinksOnly", label: "Floating list" },
                            { value: "showIdLinksVertical", label: "Vertical list" }
                        ]
                    }
                }
            },
            enableIdToggle: { label: "Add menu entry to toggle IDs as Yours", type: "checkbox", default: false }
        },
        catalog: {
            enableCatalogImageHover: { label: "Catalog Image Hover", default: true },
            enableThreadHiding: { 
                label: "Enable Thread Hiding (Shift + Click to hide/unhide a thread)", 
                default: false,
                subOptions: {
                    enableCatalogFiltering: {
                        label: "Enable Catalog Thread Filtering",
                        default: false
                    }
                }
            },
            openCatalogThreadNewTab: { label: "Always Open Threads in New Tab", default: false },
            enableLastFifty: { label: "Show Last 50 Posts button", default: false }
        },
        styling: {
            _stylingMascotTitle: { type: "title", label: ":: Mascots" },
            _stylingSection1: { type: "separator" },
            enableMascots: {
                label: "Enable Mascots",
                default: false,
                subOptions: {
                    mascotOpacity: {
                        label: "Mascot Opacity (0-100%)",
                        default: 30,
                        type: "number",
                        min: 0,
                        max: 100
                    },
                    mascotUrls: {
                        label: "Mascot Image URLs (one per line)",
                        type: "textarea",
                        default: "",
                        placeholder: "Enter image URLs, one per line\nExample:\n/.media/mascot1.png\n/.media/mascot2.png",
                        rows: 4
                    }
                }
            },
            _stylingSiteTitle: { type: "title", label: ":: Site Styling" },
            _stylingSection2: { type: "separator" },
            hideAnnouncement: { label: "Hide Announcement (unhides if new announcement posted)", default: false },
            hidePanelMessage: { label: "Hide Panel Message", default: false },
            hidePostingForm: {
                label: "Hide Posting Form",
                default: false,
                subOptions: {
                    showCatalogForm: {
                        label: "Don't Hide in Catalog",
                        default: false
                    }
                }
            },
            hideBanner: { label: "Hide Board Banners", default: false },
            hideNoCookieLink: { label: "Hide No Cookie? Link", default: false },
            hideJannyTools: { label: "Hide Janitor Forms", default: false },
            hlCurrentBoard: { label: "Highlight Current Board", default: false },
            _stylingThreadTitle: { type: "title", label: ":: Thread Styling" },
            _stylingSection3: { type: "separator" },
            enableSidebar: {
                label: "Enable Sidebar",
                default: false,
                subOptions: {
                    leftSidebar: {
                        label: "Sidebar on Left",
                        default: false
                    }
                }
            },
            enableFitReplies: { label: "Fit Replies", default: false },
            highlightOnYou: { label: "Style (You) posts", default: true },
            opBackground: { label: "OP background", default: false },
            enableStickyQR: { label: "Sticky Quick Reply", default: false },
            fadeQuickReply: { label: "Fade Quick Reply", default: false },
            threadHideCloseBtn: { label: "Hide Inline Close Button", default: false },
            hideCheckboxes: { label: "Hide Post Checkbox", default: false }
        },
        miscel: {
            enableShortcuts: { label: "Enable Keyboard Shortcuts", type: "checkbox", default: true },
            enableUpdateNotif: { label: "8chanSS update notifications", default: true },
            switchTimeFormat: { label: "Enable 12-hour Clock (AM/PM)", default: false },
            truncFilenames: {
                label: "Truncate filenames",
                default: false,
                subOptions: {
                    customTrunc: {
                        label: "Max filename length (min: 5, max: 50)",
                        default: 15,
                        type: "number",
                        min: 5,
                        max: 50
                    }
                }
            },
            _miscelThreadTitle: { type: "title", label: ":: Linkification" },
            _miscelSection1: { type: "separator" },
            enhanceLinks_showIcons: {
                label: "Show Icons and Titles",
                default: true,
                subOptions: {
                    showIconsYoutube: { label: "Youtube", default: true },
                    showIconsTwitch: { label: "Twitch", default: true },
                    showIconsX: { label: "X.com", default: true },
                    showIconsBsky: { label: "Bluesky", default: true },
                    showIconsRentry: { label: "Rentry", default: true },
                    showIconsCatbox: { label: "Catbox", default: true },
                    showIconsPastebin: { label: "Pastebin", default: true }
                }
            },
            enhanceLinks_showThumbnails: {
                label: "Show Thumbnails on Hover",
                default: true,
                subOptions: {
                    showThumbnailsYoutube: { label: "Youtube", default: true },
                    showThumbnailsTwitch: { label: "Twitch", default: true }
                }
            },
            enhanceLinks_enableEmbeds: {
                label: "Enable Embedding",
                default: false,
                subOptions: {
                    enableEmbedsX: { label: "X.com", default: true },
                    enableEmbedsBsky: { label: "Bluesky", default: true },
                    enableEmbedsRentry: { label: "Rentry", default: true },
                    enableEmbedsPastebin: { label: "Pastebin", default: true }
                }
            },
            enableTheSauce: {
                label: "Sauce Links",
                default: false,
                subOptions: {
                    iqdb: {
                        label: "IQDB",
                        default: false,
                    },
                    saucenao: {
                        label: "Saucenao",
                        default: false,
                    },
                    pixiv: {
                        label: "Pixiv (only added if filename matches Pixiv ID)",
                        default: false,
                    }
                }
            },
            _miscelStorageTitle: { type: "title", label: ":: Storage & Sync" },
            _miscelSection2: { type: "separator" },
            saveWatchedThreads: {
                label: "Save Current Watched Threads",
                type: "button"
            },
            saveFavoriteBoards: {
                label: "Save Current Favorite Boards",
                type: "button"
            },
            restoreWatchedThreads: {
                label: "Restore Watched Threads",
                type: "button"
            },
            restoreFavoriteBoards: {
                label: "Restore Favorite Boards",
                type: "button"
            },
        }
    };

    Object.freeze(scriptSettings); // Prevent accidental mutation of original settings

    // Flatten settings for backward compatibility with existing functions
    function flattenSettings() {
        const result = {};
        function flattenRecursive(obj, prefix = '') {
            Object.keys(obj).forEach((key) => {
                if (key.startsWith('_')) return;
                const fullKey = prefix ? `${prefix}_${key}` : key;
                result[fullKey] = obj[key];
                const subOptions = obj[key].subOptions;
                if (subOptions && typeof subOptions === "object") {
                    flattenRecursive(subOptions, fullKey);
                }
            });
        }
        Object.keys(scriptSettings).forEach((category) => {
            flattenRecursive(scriptSettings[category]);
        });
        return Object.freeze(result);
    }
    let flatSettings = flattenSettings();

    // --- GM storage wrappers ---
    async function getSetting(key) {
        if (!flatSettings[key]) {
            console.warn(`Setting key not found: ${key}`);
            return false;
        }
        let val;
        try {
            val = await GM.getValue("8chanSS_" + key, null);
        } catch (err) {
            console.error(`Failed to get setting for key ${key}:`, err);
            return flatSettings[key]?.default ?? false;
        }
        if (val === null) return flatSettings[key].default;
        switch (flatSettings[key].type) {
            case "number":
                return Number(val);
            case "text":
                return String(val).replace(/[<>"']/g, "").slice(0, flatSettings[key].maxLength || 32);
            case "textarea":
            case "select":
                return String(val);
            default:
                return val === "true";
        }
    }

    async function setSetting(key, value) {
        // Always store as string for consistency
        try {
            await GM.setValue("8chanSS_" + key, String(value));
        } catch (err) {
            console.error(`Failed to set setting for key ${key}:`, err);
        }
    }

    // --- Storage helpers ---
    async function getStoredObject(key) {
        let obj = {};
        if (typeof GM !== 'undefined' && GM.getValue) {
            obj = await GM.getValue(key, {});
        }
        return typeof obj === 'object' && obj !== null ? obj : {};
    }
    async function setStoredObject(key, obj) {
        if (typeof GM !== 'undefined' && GM.setValue) {
            await GM.setValue(key, obj);
        }
    }

    // --- Helper: Extract raw ID from labelId element textContent ---
    function getRawIdFromLabelId(labelIdSpan) {
        return labelIdSpan ? labelIdSpan.textContent.split(/[|\(]/)[0].trim() : null;
    }

    // --- Root CSS Class Toggles ---
    (async function featureCssClassToggles() {
        document.documentElement.classList.add("8chanSS");
        const enableSidebar = await getSetting("enableSidebar");
        const enableSidebar_leftSidebar = await getSetting("enableSidebar_leftSidebar");

        const classToggles = {
            enableFitReplies: "fit-replies",
            // enableSidebar handled below
            enableSidebar_leftSidebar: "ss-leftsidebar",
            enableStickyQR: "sticky-qr",
            fadeQuickReply: "fade-qr",
            enableBottomHeader: "bottom-header",
            hideHiddenPostStub: "hide-stub",
            hideBanner: "disable-banner",
            hidePostingForm: "hide-posting-form",
            hidePostingForm_showCatalogForm: "show-catalog-form",
            hidePanelMessage: "hide-panelmessage",
            highlightOnYou: "highlight-yous",
            hlCurrentBoard: "hl-currentBoard",
            threadHideCloseBtn: "hide-close-btn",
            hideCheckboxes: "hide-checkboxes",
            hideNoCookieLink: "hide-nocookie",
            autoExpandTW: "auto-expand-tw",
            hideJannyTools: "hide-jannytools",
            opBackground: "op-background",
            blurSpoilers: "ss-blur-spoilers",
            enableBacklinkIcons: "backlink-icon",
            enableFitImage: "fit-images"
        };

        // Special logic for Sidebar: only add if enableSidebar is true and leftSidebar is false
        if (enableSidebar && !enableSidebar_leftSidebar) {
            document.documentElement.classList.add("ss-sidebar");
        } else {
            document.documentElement.classList.remove("ss-sidebar");
        }

        // All other toggles
        const settingKeys = Object.keys(classToggles);
        const settingValues = await Promise.all(settingKeys.map(getSetting));
        settingKeys.forEach((key, i) => {
            const className = classToggles[key];
            if (settingValues[i]) {
                document.documentElement.classList.add(className);
            } else {
                document.documentElement.classList.remove(className);
            }
        });

        // URL-based class toggling
        if (window.pageType?.isCatalog) {
            document.documentElement.classList.add("is-catalog");
        } else {
            document.documentElement.classList.remove("is-catalog");
        }
        if (window.pageType?.isThread) {
            document.documentElement.classList.add("is-thread");
        } else {
            document.documentElement.classList.remove("is-thread");
        }
        if (window.pageType?.isIndex) {
            document.documentElement.classList.add("is-index");
        } else {
            document.documentElement.classList.remove("is-index");
        }
    })();

    // Sidebar Right/Left
    (async function featureSidebar() {
        const enableSidebar = await getSetting("enableSidebar");
        const enableSidebar_leftSidebar = await getSetting("enableSidebar_leftSidebar");

        const mainPanel = document.getElementById("mainPanel");
        if (!mainPanel) return;

        if (enableSidebar && enableSidebar_leftSidebar) {
            mainPanel.style.marginLeft = "19rem";
            mainPanel.style.marginRight = "0";
        } else if (enableSidebar) {
            mainPanel.style.marginRight = "19rem";
            mainPanel.style.marginLeft = "0";
        } else {
            mainPanel.style.marginRight = "0";
            mainPanel.style.marginLeft = "0";
        }
    })();

    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // Custom CSS injection
    (function injectCustomCss() {
        // Only inject if not already present
        if (document.getElementById('8chSS')) return;

        let css = "";
        // Always inject site CSS for 8chan domains
        if (window.pageType?.is8chan) {
            css += "<%= grunt.file.read('tmp/site.min.css').replace(/\\(^\")/g, '') %>";
        }
        // Inject CSS based on page type
        if (window.pageType?.isThread) {
            css += "<%= grunt.file.read('tmp/thread.min.css').replace(/\\(^\")/g, '') %>";
        } else if (window.pageType?.isCatalog) {
            css += "<%= grunt.file.read('tmp/catalog.min.css').replace(/\\(^\")/g, '') %>";
        }

        if (!css) return;

        const style = document.createElement('style');
        style.id = '8chSS';
        style.textContent = css;
        document.head.appendChild(style);
    })();

    ////// Favicon Manager /////////////////////////////////////////////////////////////////////////////////////////////////////////
    const faviconManager = (() => {
        // Map available styles
        const STYLES = [
            "default",
            "eight", "eight_dark",
            "pixel", "pixel_alt"
        ];
        const STATES = ["base", "unread", "notif"];

        // Favicons
        const FAVICON_DATA = {
            default: {
                base: "data:image/png;base64,<%= grunt.file.read('src/img/fav/default_base.png', {encoding: 'base64'}) %>",
                unread: "data:image/png;base64,<%= grunt.file.read('src/img/fav/default_unread.png', {encoding: 'base64'}) %>",
                notif: "data:image/png;base64,<%= grunt.file.read('src/img/fav/default_notif.png', {encoding: 'base64'}) %>",
            },
            eight: {
                base: "data:image/png;base64,<%= grunt.file.read('src/img/fav/eight_base.png', {encoding: 'base64'}) %>",
                unread: "data:image/png;base64,<%= grunt.file.read('src/img/fav/eight_unread.png', {encoding: 'base64'}) %>",
                notif: "data:image/png;base64,<%= grunt.file.read('src/img/fav/eight_notif.png', {encoding: 'base64'}) %>",
            },
            eight_dark: {
                base: "data:image/png;base64,<%= grunt.file.read('src/img/fav/eight_dark_base.png', {encoding: 'base64'}) %>",
                unread: "data:image/png;base64,<%= grunt.file.read('src/img/fav/eight_dark_unread.png', {encoding: 'base64'}) %>",
                notif: "data:image/png;base64,<%= grunt.file.read('src/img/fav/eight_dark_notif.png', {encoding: 'base64'}) %>",
            },
            pixel: {
                base: "data:image/png;base64,<%= grunt.file.read('src/img/fav/pixel_base.png', {encoding: 'base64'}) %>",
                unread: "data:image/png;base64,<%= grunt.file.read('src/img/fav/pixel_unread.png', {encoding: 'base64'}) %>",
                notif: "data:image/png;base64,<%= grunt.file.read('src/img/fav/pixel_notif.png', {encoding: 'base64'}) %>",
            },
            pixel_alt: {
                base: "data:image/png;base64,<%= grunt.file.read('src/img/fav/pixel_alt_base.png', {encoding: 'base64'}) %>",
                unread: "data:image/png;base64,<%= grunt.file.read('src/img/fav/pixel_alt_unread.png', {encoding: 'base64'}) %>",
                notif: "data:image/png;base64,<%= grunt.file.read('src/img/fav/pixel_alt_notif.png', {encoding: 'base64'}) %>",
            }
        };

        // Internal state tracking
        let currentStyle = "default";
        let currentState = "base";
        let cachedUserStyle = null;

        // Remove all favicon links from <head>
        function removeFavicons() {
            const head = document.head;
            if (!head) return;
            // Only remove if present
            head.querySelectorAll('link[rel="icon"], link[rel="shortcut icon"]').forEach(link => link.remove());
        }

        // Insert favicon link into <head>
        function insertFavicon(href) {
            const head = document.head;
            if (!head) return;
            const link = document.createElement('link');
            link.rel = 'icon';
            link.type = 'image/png';
            link.href = href;
            head.appendChild(link);
        }

        // Get user-selected style from settings ('faviconStyle', fallback: "default")
        async function getUserFaviconStyle() {
            if (cachedUserStyle) return cachedUserStyle;
            let style = "default";
            try {
                style = await getSetting("customFavicon_faviconStyle");
            } catch { }
            if (!STYLES.includes(style)) style = "default";
            cachedUserStyle = style;
            return style;
        }

        // Only update favicon if style/state changed
        async function setFaviconStyle(style, state = "base") {
            if (!STYLES.includes(style)) style = "default";
            if (!STATES.includes(state)) state = "base";
            if (currentStyle === style && currentState === state) return; // No change

            const url = (FAVICON_DATA?.[style]?.[state]) || FAVICON_DATA.default.base;
            removeFavicons();
            insertFavicon(url);
            // Track state
            currentStyle = style;
            currentState = state;
            // Dispatch event for listeners
            document.dispatchEvent(new CustomEvent("faviconStateChanged", {
                detail: { style, state }
            }));
        }

        // Set favicon based on state ("base", "unread", "notif") and user style
        async function setFavicon(state = "base") {
            if (!STATES.includes(state)) state = "base";
            const style = await getUserFaviconStyle();
            await setFaviconStyle(style, state);
        }
        // Reset to base state (default)
        async function resetFavicon() {
            await setFavicon("base");
        }
        // Getter for current state (for state managers)
        function getCurrentFaviconState() {
            return { style: currentStyle, state: currentState };
        }

        return {
            setFavicon,
            setFaviconStyle,
            resetFavicon,
            getCurrentFaviconState,
            STYLES,
            STATES
        };
    })();

    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // --- Feature Initialization based on Settings ---
    // Map all the settings to their functions
    const featureMap = [
        { key: "enableScrollSave", fn: featureSaveScroll },
        { key: "watchThreadOnReply", fn: featureWatchThreadOnReply },
        { key: "blurSpoilers", fn: featureBlurSpoilers },
        { key: "enableHeaderCatalogLinks", fn: featureHeaderCatalogLinks },
        { key: "openCatalogThreadNewTab", fn: catalogThreadsInNewTab },
        { key: "enableScrollArrows", fn: featureScrollArrows },
        { key: "alwaysShowTW", fn: featureAlwaysShowTW },
        { key: "enableThreadHiding", fn: featureCatalogHiding },
        { key: "switchTimeFormat", fn: featureLabelCreated12h },
        { key: "enableIdFilters", fn: featureIdFiltering },
        { key: "threadStatsInHeader", fn: threadInfoHeader },
        { key: "enableHashNav", fn: hashNavigation },
        { key: "hideAnnouncement", fn: featureHideAnnouncement },
        { key: "enableAutoHideHeaderScroll", fn: autoHideHeaderOnScroll },
        { key: "enableMediaViewer", fn: mediaViewerPositioning },
        { key: "customFavicon", fn: enableFavicon },
        { key: "highlightNewIds", fn: featureHighlightNewIds },
        { key: "quoteThreading", fn: featureQuoteThreading },
        { key: "enableLastFifty", fn: featureLastFifty },
        { key: "enableIdToggle", fn: featureToggleIdAsYours },
        { key: "enableTheSauce", fn: featureSauceLinks },
        { key: "enableUpdateNotif", fn: updateNotif },
        { key: "alwaysShowIdCount", fn: featureShowIDCount },
        { key: "enablePNGstop", fn: featureAPNGStop },
        { key: "enableMascots", fn: featureMascots },
    ];
    // Enable settings
    for (const { key, fn } of featureMap) {
        try {
            if (await getSetting(key)) {
                fn();
            }
        } catch (e) {
            console.error(`${fn.name || 'Feature'} failed:`, e);
        }
    }
    // Truncate filenames
    if (await getSetting("truncFilenames")) {
        try {
            const filenameLength = await getSetting("truncFilenames_customTrunc");
            truncateFilenames(filenameLength);
        } catch (e) {
            console.error("truncateFilenames failed:", e);
        }
    }
    // Custom Favicon
    async function enableFavicon() {
        try {
            const customFaviconEnabled = await getSetting("customFavicon");
            const selectedStyle = await getSetting("customFavicon_faviconStyle");

            if (customFaviconEnabled) {
                // Make sure selectedStyle is a non-empty string
                if (selectedStyle && typeof selectedStyle === 'string') {
                    await faviconManager.setFaviconStyle(selectedStyle);
                } else {
                    console.warn("Invalid favicon style:", selectedStyle);
                    // Fallback to a known style
                    await faviconManager.setFaviconStyle("eight_dark");
                }
            } else {
                await faviconManager.resetFavicon();
            }
        } catch (e) {
            console.error("Error updating favicon:", e);
        }
    }

    // Image Hover - Check if we should enable hover based on the current page
    let imageHoverEnabled = false;
    try {
        if (window.pageType?.isCatalog) {
            imageHoverEnabled = await getSetting("enableCatalogImageHover");
        } else {
            imageHoverEnabled = await getSetting("enableThreadImageHover");
        }
        if (imageHoverEnabled) {
            localStorage.setItem("hoveringImage", "false");
            featureImageHover();
        }
    } catch (e) {
        console.error("featureImageHover failed:", e);
    }

    //////// NOTIFICATION HANDLER ///////////////////
    (function () {
        // Strip all tags except <a>, <b>, <i>, <u>, <strong>, <em>
        // Only allows href, target, rel on <a>
        function sanitizeToastHTML(html) {
            // Remove all tags except allowed ones
            html = html.replace(/<(\/?)(?!a\b|b\b|i\b|u\b|strong\b|em\b)[^>]*>/gi, '');
            // Remove all attributes from allowed tags except for <a>
            html = html.replace(/<(b|i|u|strong|em)[^>]*>/gi, '<$1>');

            // For <a>, only allow href, target, rel attributes
            html = html.replace(/<a\s+([^>]+)>/gi, function (match, attrs) {
                let allowed = '';
                attrs.replace(/(\w+)\s*=\s*(['"])(.*?)\2/gi, function (_, name, q, value) {
                    name = name.toLowerCase();
                    if (['href', 'target', 'rel'].includes(name)) {
                        // Prevent javascript: and data: URIs in href
                        if (name === 'href' && (/^\s*javascript:/i.test(value) || /^\s*data:/i.test(value))) return;
                        allowed += ` ${name}=${q}${value}${q}`;
                    }
                });
                return `<a${allowed}>`;
            });

            return html;
        }

        // Notification handler - internal use only
        function showToast(htmlMessage, color = "black", duration = 1200) {
            // Prevent multiple notifications at once
            if (document.querySelector('.global-toast-notification')) {
                return;
            }

            const colorMap = {
                black: "#222",
                orange: "#cc7a00",
                green: "#339933",
                blue: "#1976d2",
                red: "#c62828"
            };
            const bgColor = colorMap[color] || color;

            const icon = document.getElementById("8chanSS-icon");
            let toast = document.createElement("span");
            toast.className = "global-toast-notification";
            toast.innerHTML = sanitizeToastHTML(htmlMessage);
            toast.style.position = "absolute";
            toast.style.background = bgColor;
            toast.style.color = "#fff";
            toast.style.padding = "4px 12px";
            toast.style.borderRadius = "4px";
            toast.style.fontSize = "13px";
            toast.style.zIndex = 99999;
            toast.style.opacity = "1";
            toast.style.transition = "opacity 0.3s";
            toast.style.pointerEvents = "auto";
            toast.style.boxShadow = "0 2px 8px rgba(0,0,0,0.18)";

            // Add close button
            let closeBtn = document.createElement("span");
            closeBtn.textContent = "✕";
            closeBtn.style.marginLeft = "10px";
            closeBtn.style.cursor = "pointer";
            closeBtn.style.fontWeight = "bold";
            closeBtn.style.fontSize = "15px";
            closeBtn.style.opacity = "0.7";
            closeBtn.style.float = "right";
            closeBtn.style.userSelect = "none";

            closeBtn.addEventListener('click', function (e) {
                e.stopPropagation();
                if (toast.parentNode) toast.parentNode.removeChild(toast);
                if (timeout1) clearTimeout(timeout1);
                if (timeout2) clearTimeout(timeout2);
            });
            closeBtn.addEventListener('mouseover', function () { closeBtn.style.opacity = "1"; });
            closeBtn.addEventListener('mouseout', function () { closeBtn.style.opacity = "0.7"; });

            toast.appendChild(closeBtn);

            if (icon && icon.parentNode) {
                toast.style.left = (icon.offsetLeft - 50) + "px";
                toast.style.top = "28px";
                icon.parentNode.appendChild(toast);
            } else {
                toast.style.right = "25px";
                toast.style.top = "25px";
                toast.style.position = "fixed";
                document.body.appendChild(toast);
            }

            let timeout1 = setTimeout(() => { toast.style.opacity = "0"; }, duration - 300);
            let timeout2 = setTimeout(() => { toast.remove(); }, duration);
        }

        window.callPageToast = function (msg, color = 'black', duration = 1200) {
            showToast(msg, color, duration);
        };
    })();

    //////////// FEATURES ///////////////////////////////////////////////////////////////////////////////////////////////////////////

    // --- Feature: Save Scroll Position ---
    async function featureSaveScroll() {
        if (!window.pageType?.isThread) return;

        const STORAGE_KEY = "8chanSS_scrollPositions";
        const UNREAD_LINE_ID = "unread-line";
        const MAX_THREADS = 200;

        // Helper functions
        // Get board name and thread number
        function getBoardAndThread() {
            const match = window.location.pathname.match(/^\/([^/]+)\/res\/([^/.]+)\.html$/i); // don't run on /last/ threads
            if (!match) return null;
            return { board: match[1], thread: match[2] };
        }
        // Get saved positions
        async function getAllSavedScrollData() {
            const saved = await GM.getValue(STORAGE_KEY, null);
            if (!saved) return {};
            try { return JSON.parse(saved); } catch { return {}; }
        }
        async function setAllSavedScrollData(data) {
            await GM.setValue(STORAGE_KEY, JSON.stringify(data));
        }
        // Get current post count
        function getCurrentPostCount() {
            if (!divPosts) return 0;
            return divPosts.querySelectorAll(":scope > .postCell[id]").length;
        }
        // Remove unread line marker
        function removeUnreadLineMarker() {
            const oldMarker = document.getElementById(UNREAD_LINE_ID);
            if (oldMarker && oldMarker.parentNode) {
                oldMarker.parentNode.removeChild(oldMarker);
            }
        }

        // Unseen post count logic
        let lastSeenPostCount = 0;
        let unseenCount = 0;
        let tabTitleBase = null;

        // Store previous favicon state so we can restore it
        let previousFaviconState = null;
        // Helper: Update Tab title and favicon state
        const customFaviconEnabled = await getSetting("customFavicon");

        async function updateTabTitle() {
            if (window.isNotifying) return;
            if (!tabTitleBase) tabTitleBase = document.title.replace(/^\(\d+\)\s*/, "");
            document.title = unseenCount > 0 ? `(${unseenCount}) ${tabTitleBase}` : tabTitleBase;

            // Get current favicon state
            const { style, state } = faviconManager.getCurrentFaviconState();

            if (unseenCount > 0 && customFaviconEnabled) {
                if (state !== "unread") {
                    previousFaviconState = { style, state };
                }
                // Use setFaviconStyle to preserve current style but change state to "unread"
                faviconManager.setFaviconStyle(style, "unread");
            } else if (unseenCount == 0 && customFaviconEnabled) {
                // Restore previous favicon state
                if (state === "unread" && previousFaviconState) {
                    faviconManager.setFaviconStyle(previousFaviconState.style, previousFaviconState.state);
                    previousFaviconState = null;
                } else if (state === "unread") {
                    // Fallback: reset to default if no previous state
                    faviconManager.setFavicon("base");
                }
            }
        }

        // Update Unseen counter
        async function updateUnseenCountFromSaved() {
            const info = getBoardAndThread();
            if (!info) return;
            const allData = await getAllSavedScrollData();
            const key = `${info.board}/${info.thread}`;
            const saved = allData[key];
            const currentCount = getCurrentPostCount();
            lastSeenPostCount = (saved && typeof saved.lastSeenPostCount === "number") ? saved.lastSeenPostCount : 0;
            unseenCount = Math.max(0, currentCount - lastSeenPostCount);
            updateTabTitle();
        }

        // Only update lastSeenPostCount if user scrolls down
        let lastScrollY = window.scrollY;
        async function onScrollUpdateSeen() {
            const info = getBoardAndThread();
            if (!info || !(await getSetting("enableScrollSave"))) return;

            // Always get the latest .divPosts
            const posts = Array.from(document.querySelectorAll(".divPosts > .postCell[id]"));
            let maxIndex = -1;
            for (let i = 0; i < posts.length; ++i) {
                const rect = posts[i].getBoundingClientRect();
                if (rect.bottom > 0 && rect.top < window.innerHeight) maxIndex = i;
            }
            const currentCount = getCurrentPostCount();
            let newLastSeen = lastSeenPostCount;

            if (window.scrollY > lastScrollY) {
                if (maxIndex >= 0 && currentCount > 0) {
                    if ((window.innerHeight + window.scrollY) >= (document.body.offsetHeight - 20)) {
                        newLastSeen = currentCount;
                    } else {
                        newLastSeen = Math.max(lastSeenPostCount, maxIndex + 1);
                    }
                }
                if (newLastSeen !== lastSeenPostCount) {
                    lastSeenPostCount = newLastSeen;
                    let allData = await getAllSavedScrollData();
                    const key = `${info.board}/${info.thread}`;
                    if (!allData[key]) allData[key] = {};
                    allData[key].lastSeenPostCount = lastSeenPostCount;
                    allData[key].timestamp = Date.now();
                    if (
                        typeof allData[key].position !== "number" ||
                        window.scrollY > allData[key].position
                    ) {
                        allData[key].position = window.scrollY;
                    }
                    await setAllSavedScrollData(allData);
                }
                unseenCount = Math.max(0, currentCount - lastSeenPostCount);
                updateTabTitle();
            }
            lastScrollY = window.scrollY;
        }

        // Save scroll position for current thread (does not update lastSeenPostCount)
        async function saveScrollPosition() {
            const info = getBoardAndThread();
            if (!info || !(await getSetting("enableScrollSave"))) return;

            const scrollPosition = window.scrollY;
            const timestamp = Date.now();

            let allData = await getAllSavedScrollData();
            const keys = Object.keys(allData);
            if (keys.length >= MAX_THREADS) {
                keys.sort((a, b) => (allData[a].timestamp || 0) - (allData[b].timestamp || 0));
                for (let i = 0; i < keys.length - MAX_THREADS + 1; ++i) delete allData[keys[i]];
            }

            const key = `${info.board}/${info.thread}`;
            if (!allData[key]) allData[key] = {};
            if (
                typeof allData[key].position !== "number" ||
                scrollPosition > allData[key].position
            ) {
                allData[key].position = scrollPosition;
                allData[key].timestamp = timestamp;
                await setAllSavedScrollData(allData);
            }
        }

        // Helper: Calculate center of screen
        function scrollElementToViewportCenter(el) {
            if (!el) return;
            const rect = el.getBoundingClientRect();
            const elTop = rect.top + window.pageYOffset;
            const elHeight = rect.height;
            const viewportHeight = window.innerHeight;

            // Calculate scroll position so that the element is centered
            const scrollTo = elTop - (viewportHeight / 2) + (elHeight / 2);
            window.scrollTo({ top: scrollTo, behavior: "auto" });
        }

        // Restore scroll position for current thread or scroll to anchor postCell
        async function restoreScrollPosition() {
            const info = getBoardAndThread();
            if (!info || !(await getSetting("enableScrollSave"))) return;

            const allData = await getAllSavedScrollData();
            const key = `${info.board}/${info.thread}`;
            const saved = allData[key];
            if (!saved || typeof saved.position !== "number") return;

            const anchor = window.location.hash ? window.location.hash.replace(/^#/, "") : null;
            // If anchor, scroll to the postCell with that id (sanitized)
            const safeAnchor = anchor && /^[a-zA-Z0-9_-]+$/.test(anchor) ? anchor : null;

            if (safeAnchor) {
                setTimeout(() => {
                    const post = document.getElementById(safeAnchor);
                    if (post && post.classList.contains("postCell")) {
                        scrollElementToViewportCenter(post);
                    }
                    // Add unread-line but do NOT scroll to it
                    addUnreadLineAtSavedScrollPosition(saved.position, false);
                }, 25);
                return;
            }
            // No anchor: restore scroll and add unread-line
            saved.timestamp = Date.now();
            await setAllSavedScrollData(allData);
            // Restore scroll position directly
            window.scrollTo({ top: saved.position, behavior: "auto" });
            // Only insert unread-line, do not scroll to it (set to true to scroll to unread-line)
            setTimeout(() => addUnreadLineAtSavedScrollPosition(saved.position, false), 80);
        }

        // Add an unread-line marker after the .postCell <div> at a specific scroll position
        async function addUnreadLineAtSavedScrollPosition(scrollPosition, centerAfter = false) {
            if (!(await getSetting("enableScrollSave_showUnreadLine"))) return;
            if (!divPosts) return;

            // Don't insert unread-line if scrollPosition is at (or near) the bottom ---
            const margin = 5; // px, same as in removeUnreadLineIfAtBottom
            const docHeight = document.body.offsetHeight;
            if ((scrollPosition + window.innerHeight) >= (docHeight - margin)) {
                return;
            }

            // Find the postCell whose top is just below or equal to the scrollPosition
            const posts = Array.from(divPosts.querySelectorAll(":scope > .postCell[id]"));
            let targetPost = null;
            for (let i = 0; i < posts.length; ++i) {
                const postTop = posts[i].offsetTop;
                if (postTop > scrollPosition) break;
                targetPost = posts[i];
            }
            if (!targetPost) return;

            // Remove old marker if exists
            removeUnreadLineMarker();

            // Insert marker after the target post
            const marker = document.createElement("hr");
            marker.id = UNREAD_LINE_ID;
            if (targetPost.nextSibling) {
                divPosts.insertBefore(marker, targetPost.nextSibling);
            } else {
                divPosts.appendChild(marker);
            }

            // If requested, scroll so unread-line is slightly above center
            if (centerAfter) {
                setTimeout(() => {
                    const markerElem = document.getElementById(UNREAD_LINE_ID);
                    if (markerElem) {
                        const rect = markerElem.getBoundingClientRect();
                        // Calculate the offset so the unread-line is about 1/3 from the top
                        const desiredY = window.innerHeight / 3;
                        const scrollY = window.scrollY + rect.top - desiredY;
                        window.scrollTo({ top: scrollY, behavior: "auto" });
                    }
                }, 25);
            }
        }

        // Watch for changes in .divPosts (new posts)
        let unseenUpdateTimeout = null;
        function debouncedUpdateUnseenCount() {
            if (unseenUpdateTimeout) clearTimeout(unseenUpdateTimeout);
            unseenUpdateTimeout = setTimeout(() => {
                updateUnseenCountFromSaved();
                unseenUpdateTimeout = null;
            }, 100);
        }

        const divPostsObs = observeSelector('.divPosts', { childList: true, subtree: false });
        if (divPostsObs) {
            divPostsObs.addHandler(function saveScrollPostCountHandler() {
                debouncedUpdateUnseenCount();
            });
        }

        // Remove unread line at the bottom
        async function removeUnreadLineIfAtBottom() {
            if (!(await getSetting("enableScrollSave_showUnreadLine"))) return;
            const margin = 5; // px
            if ((window.innerHeight + window.scrollY) >= (document.body.offsetHeight - margin)) {
                removeUnreadLineMarker();
            }
        }

        // --- Event listeners and initialization ---
        // Save Scroll Position
        window.addEventListener("beforeunload", () => {
            saveScrollPosition();
        });

        document.addEventListener("DOMContentLoaded", () => {
            tabTitleBase = document.title.replace(/^\(\d+\)\s*/, "");
            updateTabTitle();
        });
        // On Page Load
        window.addEventListener("load", async () => {
            await restoreScrollPosition();
            await updateUnseenCountFromSaved();
        });

        let scrollTimeout = null;
        window.addEventListener("scroll", () => {
            if (scrollTimeout) return;
            scrollTimeout = setTimeout(async () => {
                await onScrollUpdateSeen();
                await removeUnreadLineIfAtBottom();
                scrollTimeout = null;
            }, 100); // 100ms throttle to the scroll event
        });

        // Initial restore and unseen count update (in case load event already fired)
        await restoreScrollPosition();
        await updateUnseenCountFromSaved();
    }

    // --- Feature: Header Catalog Links ---
    async function featureHeaderCatalogLinks() {
        async function appendCatalogToLinks() {
            const openInNewTab = await getSetting("enableHeaderCatalogLinks_openInNewTab");
            
            // Process both board lists
            const boardLists = [
                document.getElementById("navBoardsTop"),
                document.getElementById("navBoardsFavorite")
            ];

            for (const navboardsSpan of boardLists) {
                if (navboardsSpan) {
                    const links = navboardsSpan.getElementsByTagName("a");

                    for (let link of links) {
                        // Prevent duplicate appends and only process once
                        if (
                            link.href &&
                            !link.href.endsWith("/catalog.html") &&
                            !link.dataset.catalogLinkProcessed
                        ) {
                            link.href += "/catalog.html";
                            link.dataset.catalogLinkProcessed = "1";

                            // Set target="_blank" if the option is enabled
                            if (openInNewTab) {
                                link.target = "_blank";
                                link.rel = "noopener noreferrer"; // Security best practice
                            } else {
                                link.target = "";
                                link.rel = "";
                            }
                        }
                    }
                }
            }
        }

        // Initial run
        appendCatalogToLinks();

        // Debounced handler for observer
        const debouncedAppend = debounce(appendCatalogToLinks, 100);

        // Use the observer registry for both board lists
        const navboardsTopObs = observeSelector('#navBoardsTop', { childList: true, subtree: true });
        if (navboardsTopObs) {
            navboardsTopObs.addHandler(function headerCatalogLinksHandler() {
                debouncedAppend();
            });
        }

        const navboardsFavoriteObs = observeSelector('#navBoardsFavorite', { childList: true, subtree: true });
        if (navboardsFavoriteObs) {
            navboardsFavoriteObs.addHandler(function headerCatalogLinksHandler() {
                debouncedAppend();
            });
        }
    }

    // --- Feature: Always Open Catalog Threads in New Tab ---
    function catalogThreadsInNewTab() {
        if (!window.pageType?.isCatalog) return;

        // Set target="_blank" for existing cells
        catalogDiv.querySelectorAll('.catalogCell a.linkThumb').forEach(link => {
            if (link.getAttribute('target') !== '_blank') {
                link.setAttribute('target', '_blank');
            }
        });

        // Use event delegation for future clicks
        catalogDiv.addEventListener('click', function (e) {
            const link = e.target.closest('.catalogCell a.linkThumb');
            if (link && link.getAttribute('target') !== '_blank') {
                link.setAttribute('target', '_blank');
            }
        });
    }

    // --- Feature: Image/Video/Audio Hover Preview ---
    function featureImageHover() {
        // --- Config ---
        const MEDIA_MAX_WIDTH = "90vw";
        const MEDIA_OPACITY_LOADING = "0";
        const MEDIA_OPACITY_LOADED = "1";
        const MEDIA_OFFSET = 50; // Margin between cursor and image, in px
        const MEDIA_BOTTOM_MARGIN = 3; // Margin from bottom of viewport to avoid browser UI, in vh
        const AUDIO_INDICATOR_TEXT = "▶ Playing audio...";

        // --- Utility: MIME type to extension mapping ---
        function getExtensionForMimeType(mime) {
            const map = {
                "image/jpeg": ".jpg",
                "image/jpg": ".jpg",
                "image/jxl": ".jxl",
                "image/png": ".png",
                "image/apng": ".png",
                "image/gif": ".gif",
                "image/avif": ".avif",
                "image/webp": ".webp",
                "image/bmp": ".bmp",
                "video/mp4": ".mp4",
                "video/webm": ".webm",
                "video/x-m4v": ".m4v",
                "audio/ogg": ".ogg",
                "audio/mpeg": ".mp3",
                "audio/x-m4a": ".m4a",
                "audio/x-wav": ".wav",
            };
            return map[mime.toLowerCase()] || null;
        }

        // --- Utility: Sanitize URLs before assigning to src/href ---
        function sanitizeUrl(url) {
            try {
                const parsed = new URL(url, window.location.origin);
                // Only allow http(s) protocols and same-origin or trusted hosts
                if ((parsed.protocol === "http:" || parsed.protocol === "https:") &&
                    parsed.origin === window.location.origin) {
                    return parsed.href;
                }
            } catch { }
            return "";
        }

        // --- Initial state ---
        let floatingMedia = null;
        let cleanupFns = [];
        let currentAudioIndicator = null;
        let lastMouseEvent = null; // Store last mouse event for initial placement

        // --- Utility: Clamp value between min and max ---
        function clamp(val, min, max) {
            return Math.max(min, Math.min(max, val));
        }

        // --- Utility: Position floating media to the right or left of mouse, never touching bottom ---
        function positionFloatingMedia(event) {
            if (!floatingMedia) return;
            const vw = window.innerWidth;
            const vh = window.innerHeight;
            const mw = floatingMedia.offsetWidth || 0;
            const mh = floatingMedia.offsetHeight || 0;

            const docElement = document.documentElement;
            const SCROLLBAR_WIDTH = window.innerWidth - docElement.clientWidth; // Calculate scrollbar width once
            const MEDIA_BOTTOM_MARGIN_PX = vh * (MEDIA_BOTTOM_MARGIN / 100);

            let x, y;

            // Try to show on the right of the cursor first
            const rightX = event.clientX + MEDIA_OFFSET;
            const leftX = event.clientX - MEDIA_OFFSET - mw;

            // If there's enough space on the right, use it
            if (rightX + mw <= vw - SCROLLBAR_WIDTH) {
                x = rightX;
            }
            // Else, if there's enough space on the left, use it
            else if (leftX >= 0) {
                x = leftX;
            }
            // Else, clamp to fit in viewport
            else {
                x = clamp(rightX, 0, vw - mw - SCROLLBAR_WIDTH);
            }

            y = event.clientY;
            const maxY = vh - mh - MEDIA_BOTTOM_MARGIN_PX;
            y = Math.max(0, Math.min(y, maxY));

            floatingMedia.style.left = `${x}px`;
            floatingMedia.style.top = `${y}px`;
        }

        // --- Utility: Clean up floating media and event listeners ---
        function cleanupFloatingMedia() {
            cleanupFns.forEach(fn => { try { fn(); } catch { } });
            cleanupFns = [];
            if (floatingMedia) {
                if (["VIDEO", "AUDIO"].includes(floatingMedia.tagName)) {
                    try {
                        floatingMedia.pause();
                        floatingMedia.srcObject = null;
                        URL.revokeObjectURL(floatingMedia.src);
                        floatingMedia.removeAttribute("src");
                        floatingMedia.load();
                    } catch { }
                }
                floatingMedia.remove();
                floatingMedia = null;
            }
            if (currentAudioIndicator && currentAudioIndicator.parentNode) {
                currentAudioIndicator.parentNode.removeChild(currentAudioIndicator);
                currentAudioIndicator = null;
            }
        }

        // --- Helper: Get full media URL from thumbnail and MIME type ---
        function getFullMediaSrc(thumbNode, filemime) {
            let thumbnailSrc = thumbNode.getAttribute("src");
            // Strip hash fragment (e.g., #spoiler) for processing
            if (thumbnailSrc) {
                thumbnailSrc = thumbnailSrc.split('#')[0];
            }
            const parentA = thumbNode.closest("a.linkThumb, a.imgLink");
            const href = parentA ? parentA.getAttribute("href") : "";
            // Try to get width/height from data attributes, else fallback to image's natural size
            let fileWidth = parentA ? parseInt(parentA.getAttribute("data-filewidth"), 10) : null;
            let fileHeight = parentA ? parseInt(parentA.getAttribute("data-fileheight"), 10) : null;
            if ((!fileWidth || !fileHeight) && thumbNode.naturalWidth && thumbNode.naturalHeight) {
                fileWidth = thumbNode.naturalWidth;
                fileHeight = thumbNode.naturalHeight;
            }

            // Helper: does a string have an extension?
            function hasExtension(str) {
                return /\.[a-z0-9]+$/i.test(str);
            }
            // Helper: is a t_ thumbnail?
            function isTThumb(str) {
                return /\/t_/.test(str);
            }
            // Helper: is a direct hash (no extension)?
            function isDirectHash(str) {
                return /^\/\.media\/[a-f0-9]{40,}$/i.test(str) && !hasExtension(str);
            }
            // Helper: is a small image?
            function isSmallImage() {
                return (fileWidth && fileWidth <= 220) || (fileHeight && fileHeight <= 220);
            }
            // Helper: is a PNG with no t_ and no extension?
            function isBarePngNoThumb() {
                return (
                    filemime &&
                    filemime.toLowerCase() === "image/png" &&
                    parentA &&
                    !isTThumb(href) &&
                    !hasExtension(href)
                );
            }
            // Helper: is a small PNG with no t_ and no extension in src?
            function isSmallBarePngSrc() {
                return (
                    isSmallImage() &&
                    filemime &&
                    filemime.toLowerCase() === "image/png" &&
                    !isTThumb(thumbnailSrc) &&
                    !hasExtension(thumbnailSrc)
                );
            }
            // Helper: is a generic fallback thumbnail?
            function isGenericThumb() {
                return (
                    /\/spoiler\.png$/i.test(thumbnailSrc) ||
                    /\/custom\.spoiler$/i.test(thumbnailSrc) ||
                    /\/audioGenericThumb\.png$/i.test(thumbnailSrc)
                );
            }

            // 1. If filemime is missing, fallback: use src as-is if in catalogCell or matches extensionless pattern
            if (!filemime) {
                if (
                    thumbNode.closest('.catalogCell') ||
                    /^\/\.media\/t?_[a-f0-9]{40,}$/i.test(thumbnailSrc.replace(/\\/g, ''))
                ) {
                    return thumbnailSrc;
                }
                return null;
            }

            // 2. PNG with no t_ and no extension in href: show as-is
            if (isBarePngNoThumb()) {
                return thumbnailSrc;
            }

            // 3. Small PNG with no t_ and no extension in src: show as-is
            if (isSmallBarePngSrc()) {
                return thumbnailSrc;
            }

            // 4. For small images with extension, use original src directly
            if (isSmallImage() && hasExtension(thumbnailSrc)) {
                return thumbnailSrc;
            }

            // 5. If "t_" thumbnail, transform to full image
            if (isTThumb(thumbnailSrc)) {
                let base = thumbnailSrc.replace(/\/t_/, "/");
                base = base.replace(/\.(jpe?g|jxl|png|apng|gif|avif|webp|webm|mp4|m4v|ogg|mp3|m4a|wav)$/i, "");

                // Special cases: APNG and m4v - do not append extension
                if (filemime && (filemime.toLowerCase() === "image/apng" || filemime.toLowerCase() === "video/x-m4v")) {
                    return base;
                }

                const ext = filemime ? getExtensionForMimeType(filemime) : null;
                if (!ext) return null;
                return base + ext;
            }

            // 6. If src is a direct hash (no t_) and has no extension, append extension unless APNG or m4v
            if (isDirectHash(thumbnailSrc)) {
                if (filemime && (filemime.toLowerCase() === "image/apng" || filemime.toLowerCase() === "video/x-m4v")) {
                    return thumbnailSrc;
                }
                const ext = filemime ? getExtensionForMimeType(filemime) : null;
                if (!ext) {
                    return thumbnailSrc;
                }
                return thumbnailSrc + ext;
            }

            // 7. If generic fallback thumbnail, use href if available
            if (isGenericThumb()) {
                if (parentA && parentA.getAttribute("href")) {
                    return sanitizeUrl(parentA.getAttribute("href"));
                }
                return null;
            }

            return null;
        }

        // --- Event Handlers (defined once for reuse) ---
        function leaveHandler() {
            cleanupFloatingMedia();
        }
        function mouseMoveHandler(ev) {
            lastMouseEvent = ev;
            positionFloatingMedia(ev);
        }

        // --- Main hover handler ---
        async function onThumbEnter(e) {
            cleanupFloatingMedia();
            lastMouseEvent = e; // Store the mouse event for initial placement
            const thumb = e.currentTarget;
            let filemime = null, fullSrc = null, isVideo = false, isAudio = false;

            // Determine file type and source
            if (thumb.tagName === "IMG") {
                const parentA = thumb.closest("a.linkThumb, a.imgLink");
                if (!parentA) return;
                const href = parentA.getAttribute("href");
                if (!href) return;
                const ext = href.split(".").pop().toLowerCase();
                filemime =
                    parentA.getAttribute("data-filemime") ||
                    {
                        jpg: "image/jpeg",
                        jpeg: "image/jpeg",
                        jxl: "image/jxl",
                        png: "image/png",
                        apng: "image/apng",
                        gif: "image/gif",
                        avif: "image/avif",
                        webp: "image/webp",
                        bmp: "image/bmp",
                        mp4: "video/mp4",
                        webm: "video/webm",
                        m4v: "video/x-m4v",
                        ogg: "audio/ogg",
                        mp3: "audio/mpeg",
                        m4a: "audio/x-m4a",
                        wav: "audio/wav",
                    }[ext];
                fullSrc = getFullMediaSrc(thumb, filemime);
                // If the thumbnail is a generic spoiler, use the parent link's href as the preview source
                if (
                    /custom\.spoiler$|spoiler\.png$/i.test(thumb.getAttribute("src") || "") &&
                    parentA && parentA.getAttribute("href")
                ) {
                    fullSrc = parentA.getAttribute("href");
                }
                isVideo = filemime && filemime.startsWith("video/");
                isAudio = filemime && filemime.startsWith("audio/");
            }

            // If filemime is missing, still try to preview if getFullMediaSrc returns something
            fullSrc = sanitizeUrl(fullSrc);
            if (!fullSrc) return;

            // --- Setup floating media element ---
            // Get user volume setting (default 0.5) first
            let volume = 0.5;
            try {
                if (typeof getSetting === "function") {
                    const v = await getSetting("hoverVideoVolume");
                    if (typeof v === "number" && !isNaN(v)) {
                        volume = Math.max(0, Math.min(1, v / 100));
                    }
                }
            } catch { }

            if (isAudio) {
                // Audio: show indicator, play audio (hidden)
                // Always append indicator to the nearest .imgLink or .linkThumb
                const container = thumb.closest("a.linkThumb, a.imgLink");
                let audioSrc = fullSrc;
                // If the thumbnail is a generic audio thumb, use the parent link's href as the audio source
                if (
                    thumb.tagName === "IMG" &&
                    container &&
                    /audioGenericThumb\.png$/.test(thumb.getAttribute("src") || "") &&
                    container.getAttribute("href")
                ) {
                    audioSrc = container.getAttribute("href");
                }
                if (container && !container.style.position) {
                    container.style.position = "relative";
                }
                floatingMedia = document.createElement("audio");
                floatingMedia.src = audioSrc;
                floatingMedia.controls = false;
                floatingMedia.style.display = "none";
                floatingMedia.volume = volume;
                document.body.appendChild(floatingMedia);
                floatingMedia.play().catch(() => { });

                // Show indicator
                const indicator = document.createElement("div");
                indicator.classList.add("audio-preview-indicator");
                indicator.textContent = AUDIO_INDICATOR_TEXT;
                if (container) {
                    container.appendChild(indicator);
                }
                currentAudioIndicator = indicator;

                // Cleanup on leave/click/scroll
                thumb.addEventListener("mouseleave", leaveHandler, { once: true });
                if (container) container.addEventListener("click", leaveHandler, { once: true });
                window.addEventListener("scroll", leaveHandler, { passive: true, once: true });
                cleanupFns.push(() => thumb.removeEventListener("mouseleave", leaveHandler));
                if (container) cleanupFns.push(() => container.removeEventListener("click", leaveHandler));
                cleanupFns.push(() => window.removeEventListener("scroll", leaveHandler));
                return;
            }

            // --- Image or Video ---
            let videoSrc = fullSrc;
            if (
                isVideo &&
                thumb.tagName === "IMG" &&
                thumb.closest("a.linkThumb, a.imgLink") &&
                (!/\.(mp4|webm|m4v)$/i.test(fullSrc) || /\/\.media\//.test(fullSrc) && !/\.(mp4|webm|m4v)$/i.test(fullSrc))
            ) {
                // If the thumbnail src is not a valid video file, use the parent link's href
                const parentA = thumb.closest("a.linkThumb, a.imgLink");
                if (parentA && parentA.getAttribute("href")) {
                    videoSrc = parentA.getAttribute("href");
                }
            }
            floatingMedia = isVideo ? document.createElement("video") : document.createElement("img");
            floatingMedia.src = isVideo ? videoSrc : fullSrc;
            floatingMedia.id = "hover-preview-media";
            floatingMedia.style.position = "fixed";
            floatingMedia.style.zIndex = "9999";
            floatingMedia.style.pointerEvents = "none";
            floatingMedia.style.opacity = MEDIA_OPACITY_LOADING;
            floatingMedia.style.left = "-9999px";
            floatingMedia.style.top = "-9999px";
            floatingMedia.style.maxWidth = MEDIA_MAX_WIDTH;
            // Dynamically set maxHeight to fit above the bottom margin
            const availableHeight = window.innerHeight * (1 - MEDIA_BOTTOM_MARGIN / 100);
            floatingMedia.style.maxHeight = `${availableHeight}px`;
            if (isVideo) {
                floatingMedia.autoplay = true;
                floatingMedia.loop = true;
                floatingMedia.muted = false;
                floatingMedia.playsInline = true;
                floatingMedia.volume = volume;
            }
            document.body.appendChild(floatingMedia);

            // Placement of the image
            // --- Always follow the cursor, even while loading ---
            document.addEventListener("mousemove", mouseMoveHandler, { passive: true });
            thumb.addEventListener("mouseleave", leaveHandler, { passive: true, once: true });
            cleanupFns.push(() => document.removeEventListener("mousemove", mouseMoveHandler));

            // Place at initial mouse position
            if (lastMouseEvent) {
                positionFloatingMedia(lastMouseEvent);
            }

            // When loaded, fade in and reposition with real size
            if (isVideo) {
                floatingMedia.onloadeddata = function () {
                    if (floatingMedia) {
                        floatingMedia.style.opacity = MEDIA_OPACITY_LOADED;
                        if (lastMouseEvent) positionFloatingMedia(lastMouseEvent);
                    }
                };
            } else {
                floatingMedia.onload = function () {
                    if (floatingMedia) {
                        floatingMedia.style.opacity = MEDIA_OPACITY_LOADED;
                        if (lastMouseEvent) positionFloatingMedia(lastMouseEvent);
                    }
                };
            }
            // If error, cleanup
            floatingMedia.onerror = cleanupFloatingMedia;

            // Cleanup on leave/scroll
            thumb.addEventListener("mouseleave", leaveHandler, { once: true });
            window.addEventListener("scroll", leaveHandler, { passive: true, once: true });
            cleanupFns.push(() => thumb.removeEventListener("mouseleave", leaveHandler));
            cleanupFns.push(() => window.removeEventListener("scroll", leaveHandler));
        }

        // --- Attach listeners to thumbnails and audio links ---
        function attachThumbListeners(root = document) {
            // Attach to all descendant images inside a.linkThumb or a.imgLink
            root.querySelectorAll("a.linkThumb img, a.imgLink img").forEach(thumb => {
                if (!thumb._fullImgHoverBound) {
                    thumb.addEventListener("mouseenter", onThumbEnter);
                    thumb._fullImgHoverBound = true;
                }
            });
            // If root itself is an img inside a link, attach as well
            if (
                root.tagName === "IMG" &&
                root.parentElement &&
                (root.parentElement.closest("a.linkThumb") || root.parentElement.closest("a.imgLink")) &&
                !root._fullImgHoverBound
            ) {
                root.addEventListener("mouseenter", onThumbEnter);
                root._fullImgHoverBound = true;
            }
        }

        // Attach to all existing thumbs at startup
        attachThumbListeners();

        // Use the observer registry for #divThreads
        const divThreadsObs = observeSelector('#divThreads', { childList: true, subtree: true });
        if (divThreadsObs) {
            divThreadsObs.addHandler(function imageHoverHandler(mutations) {
                for (const mutation of mutations) {
                    for (const addedNode of mutation.addedNodes) {
                        if (addedNode.nodeType === 1) {
                            attachThumbListeners(addedNode);
                        }
                    }
                }
            });
        }
    }

    // --- Feature: Blur Spoilers + Remove Spoilers suboption ---
    // Utility: MIME type to extension mapping
    function getExtensionForMimeType(mime) {
        const map = {
            "image/jpeg": ".jpg",
            "image/jpg": ".jpg",
            "image/jxl": ".jxl",
            "image/png": ".png",
            "image/apng": ".png",
            "image/gif": ".gif",
            "image/avif": ".avif",
            "image/webp": ".webp",
            "image/bmp": ".bmp",
        };
        return map[mime.toLowerCase()] || "";
    }

    async function featureBlurSpoilers() {
        // Only run on thread or index pages
        if (!(window.pageType?.isThread || window.pageType?.isIndex)) {
            return;
        }

        const removeSpoilers = await getSetting("blurSpoilers_removeSpoilers");

        // Helper to apply blur or remove spoilers styles
        function applyBlurOrRemoveSpoilers(img, removeSpoilers) {
            if (removeSpoilers) {
                img.style.filter = "";
                img.style.transition = "";
                img.style.border = "1px dotted var(--border-color)";
                img.onmouseover = null;
                img.onmouseout = null;
            } else {
                img.style.filter = "blur(5px)";
                img.style.transition = "filter 0.3s ease";
            }
        }

        function processImgLink(link) {
            if (link.dataset.blurSpoilerProcessed === "1") {
                return;
            }
            const img = link.querySelector("img");
            if (!img) {
                return;
            }
            // Skip if src is already a full media file (not t_ and has extension)
            if (
                /\/\.media\/[^\/]+?\.[a-zA-Z0-9]+$/.test(img.src) &&
                !/\/\.media\/t_[^\/]+?\.[a-zA-Z0-9]+$/.test(img.src)
            ) {
                link.dataset.blurSpoilerProcessed = "1";
                return;
            }
            // Check if this is a custom spoiler image
            const isCustomSpoiler = img.src.includes("/custom.spoiler")
                || img.src.includes("/*/custom.spoiler")
                || img.src.includes("/spoiler.png");
            // Check if this is NOT already a thumbnail
            const isNotThumbnail = !img.src.includes("/.media/t_");
            const hasFilenameExtension = !isCustomSpoiler && /\.[a-zA-Z0-9]+$/.test(img.src);

            if (isNotThumbnail || isCustomSpoiler) {
                let href = link.getAttribute("href");
                if (!href) {
                    link.dataset.blurSpoilerProcessed = "1";
                    return;
                }
                // Extract filename without extension
                const match = href.match(/\/\.media\/([^\/]+)\.[a-zA-Z0-9]+$/);
                if (!match) {
                    link.dataset.blurSpoilerProcessed = "1";
                    return;
                }

                // Get file extension from data-filemime
                const fileMime = link.getAttribute("data-filemime") || "";
                const ext = getExtensionForMimeType(fileMime);

                // Check for data-filewidth attribute
                let fileWidthAttr = link.getAttribute("data-filewidth");
                let fileHeightAttr = link.getAttribute("data-fileheight");
                let transformedSrc;
                if (
                    (fileWidthAttr && Number(fileWidthAttr) <= 220) ||
                    (fileHeightAttr && Number(fileHeightAttr) <= 220)
                ) {
                    // If this is a video, do not rewrite the src
                    if (fileMime && fileMime.startsWith('video/')) {
                        link.dataset.blurSpoilerProcessed = "1";
                        return;
                    }
                    // Use the full image, not the thumbnail, and append extension
                    transformedSrc = `/.media/${match[1]}${ext}`;
                } else if (!hasFilenameExtension && isCustomSpoiler) {
                    // Use the thumbnail path (t_filename) and append extension
                    transformedSrc = `/.media/t_${match[1]}`;
                } else {
                    link.dataset.blurSpoilerProcessed = "1";
                    return;
                }

                // Custom spoiler + no fileWidth/Height: check .dimensionLabel and use href if small
                if (isCustomSpoiler && !fileWidthAttr && !fileHeightAttr) {
                    const uploadCell = img.closest('.uploadCell');
                    if (uploadCell) {
                        const dimensionLabel = uploadCell.querySelector('.dimensionLabel');
                        if (dimensionLabel) {
                            const dimensions = dimensionLabel.textContent.trim().split(/x|×/);
                            if (dimensions.length === 2) {
                                const parsedWidth = parseInt(dimensions[0].trim(), 10);
                                const parsedHeight = parseInt(dimensions[1].trim(), 10);
                                if ((parsedWidth <= 220 || parsedHeight <= 220)) {
                                    img.src = href + "#spoiler";
                                    link.dataset.blurSpoilerProcessed = "1";
                                    applyBlurOrRemoveSpoilers(img, removeSpoilers);
                                    return;
                                }
                            }
                        }
                    }
                }

                // Temporarily lock rendered size to avoid layout shift
                const initialWidth = img.offsetWidth;
                const initialHeight = img.offsetHeight;
                img.style.width = initialWidth + "px";
                img.style.height = initialHeight + "px";

                // Change the src
                img.src = transformedSrc + "#spoiler";

                // Set width/height to its initial thumbnail size when loading img again
                img.addEventListener('load', function () {
                    img.style.width = img.naturalWidth + "px";
                    img.style.height = img.naturalHeight + "px";
                });

                applyBlurOrRemoveSpoilers(img, removeSpoilers);
                link.dataset.blurSpoilerProcessed = "1";
                return;
            }
            link.dataset.blurSpoilerProcessed = "1";
        }

        // Initial processing for all existing links
        document.querySelectorAll("a.imgLink").forEach(link => processImgLink(link));

        // Debounced batch processing for observer
        let pendingImgLinks = new WeakSet();
        let debounceTimeout = null;
        function processPendingImgLinks() {
            const allLinks = document.querySelectorAll("a.imgLink");
            allLinks.forEach(link => {
                if (pendingImgLinks.has(link)) {
                    processImgLink(link);
                }
            });
            pendingImgLinks = new WeakSet(); // Reset the WeakSet
            debounceTimeout = null;
        }

        // Use the observer registry for #divThreads
        const divThreadsObs = observeSelector('#divThreads', { childList: true, subtree: true });
        if (divThreadsObs) {
            divThreadsObs.addHandler(function blurSpoilersHandler(mutations) {
                for (const mutation of mutations) {
                    for (const addedNode of mutation.addedNodes) {
                        if (addedNode.nodeType !== 1) continue;
                        if (addedNode.classList && addedNode.classList.contains('imgLink')) {
                            pendingImgLinks.add(addedNode);
                        } else if (addedNode.querySelectorAll) {
                            addedNode.querySelectorAll('.imgLink').forEach(link => pendingImgLinks.add(link));
                        }
                    }
                }
                if (!debounceTimeout) {
                    debounceTimeout = setTimeout(processPendingImgLinks, 50);
                }
            });
        }

        // Observe for .quoteTooltip additions and process spoilers inside
        const bodyObs = observeSelector('body', { childList: true, subtree: true });
        if (bodyObs) {
            bodyObs.addHandler(function quoteTooltipSpoilerHandler(mutations) {
                for (const mutation of mutations) {
                    for (const addedNode of mutation.addedNodes) {
                        if (addedNode.nodeType !== 1) continue;
                        if (addedNode.classList && addedNode.classList.contains('quoteTooltip')) {
                            addedNode.querySelectorAll('a.imgLink').forEach(link => processImgLink(link));
                        } else if (addedNode.querySelectorAll) {
                            addedNode.querySelectorAll('.quoteTooltip a.imgLink').forEach(link => processImgLink(link));
                        }
                    }
                }
            });
        }

        // Use event delegation for blur toggling
        document.body.addEventListener("mouseover", function (e) {
            if (e.target.matches("a.imgLink img[style*='blur(5px)']")) {
                e.target.style.filter = "none";
            }
        });
        document.body.addEventListener("mouseout", function (e) {
            if (e.target.matches("a.imgLink img[style*='transition']")) {
                e.target.style.filter = "blur(5px)";
            }
        });
    }

    // --- Feature: Stop small APNG images from playing ---
    function featureAPNGStop() {
        if (window.pageType?.isCatalog) return;

        // Helper: create a canvas snapshot of the first frame
        function createCanvasSnapshot(img) {
            const canvas = document.createElement('canvas');
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            return canvas;
        }

        // Helper: create overlay element
        function createOverlay(width, height) {
            const overlay = document.createElement('div');
            overlay.className = 'apng-overlay';
            overlay.style.width = width + 'px';
            overlay.style.height = height + 'px';
            return overlay;
        }

        // Detect APNG by MIME or extension
        function isAPNG(mime, src) {
            if (mime) {
                const lower = mime.toLowerCase();
                if (lower === 'image/apng' || lower === 'image/png') return true;
            }
            if (src && /\.(a?png)(\?.*)?$/i.test(src)) return true;
            return false;
        }

        // Process a single thumbnail image
        function processThumb(img) {
            if (img.dataset.apngProcessed === '1') return;

            const link = img.closest('a.linkThumb, a.imgLink');
            if (!link) return;

            const mime = (link.getAttribute('data-filemime') || '').toLowerCase();
            const href = link.getAttribute('href') || '';

            if (!isAPNG(mime, href)) return;

            const width = parseInt(link.getAttribute('data-filewidth'), 10);
            const height = parseInt(link.getAttribute('data-fileheight'), 10);
            if (width > 220 || height > 220) return;

            if (!img.complete || img.naturalWidth === 0) {
                img.addEventListener('load', () => processThumb(img), { once: true });
                return;
            }

            img.dataset.apngProcessed = '1';

            const canvas = createCanvasSnapshot(img);
            canvas.className = 'apng-canvas-snapshot';

            img.style.visibility = 'hidden';

            const overlay = createOverlay(canvas.width, canvas.height);

            const wrapper = document.createElement('div');
            Object.assign(wrapper.style, {
                position: 'relative',
                display: 'inline-block',
                width: canvas.width + 'px',
                height: canvas.height + 'px',
                marginRight: '1em',
                marginBottom: '0.7em'
            });

            img.parentNode.insertBefore(wrapper, img);
            wrapper.append(img, canvas, overlay);

            overlay.addEventListener('click', () => {
                overlay.remove();
                canvas.remove();
                img.style.visibility = '';
            });

            ['mouseenter', 'mouseleave'].forEach(type => {
                overlay.addEventListener(type, e => {
                    img.dispatchEvent(new MouseEvent(type, {
                        bubbles: false,
                        cancelable: true,
                        clientX: e.clientX,
                        clientY: e.clientY
                    }));
                });
            });
        }

        // Initial pass
        const SEL = 'a.linkThumb img, a.imgLink img';
        document.querySelectorAll(SEL).forEach(processThumb);

        // Observe dynamically added thumbs using helper
        const obs = observeSelector('#divThreads', { childList: true, subtree: true });
        if (obs) {
            obs.addHandler(function apngStopHandler(mutations) {
                for (const m of mutations) {
                    for (const node of m.addedNodes) {
                        if (node.nodeType !== 1) continue;
                        if (node.matches && node.matches(SEL)) {
                            processThumb(node);
                        } else if (node.querySelectorAll) {
                            node.querySelectorAll(SEL).forEach(processThumb);
                        }
                    }
                }
            });
        }
    }

    // --- Feature: Background Mascots ---
    async function featureMascots() {
        // Only show mascots on catalog, thread, and index pages
        if (!(window.pageType?.isCatalog || window.pageType?.isThread || window.pageType?.isIndex)) {
            return;
        }

        // Get settings
        const opacity = await getSetting("enableMascots_mascotOpacity") || 30;
        const urlsText = await getSetting("enableMascots_mascotUrls") || "";

        if (!urlsText.trim()) return;

        // Parse URLs from textarea (one per line)
        const urlLines = urlsText.split('\n');
        const trimmedUrls = urlLines.map(url => url.trim());
        const validUrls = trimmedUrls.filter(url => url && (url.startsWith('/') || url.startsWith('http')));
        const urls = validUrls.filter(url => /\.(png|apng|jpg|jpeg|gif|webp)$/i.test(url));

        if (urls.length === 0) {
            console.log('8chanSS: No valid mascot URLs found. Check that URLs start with / or http and have valid image extensions (.png, .jpg, .gif, etc.)');
            return;
        }

        // Check if sidebar is enabled
        const enableSidebar = await getSetting("enableSidebar");
        const leftSidebar = await getSetting("enableSidebar_leftSidebar");

        // Pick random mascot from the list
        const randomIndex = Math.floor(Math.random() * urls.length);
        const selectedUrl = urls[randomIndex];

        const mascot = document.createElement('img');
        mascot.className = 'chSS-mascot';
        mascot.src = selectedUrl;
        mascot.style.opacity = opacity / 100;

        // Position mascot
        if (enableSidebar) {
            if (leftSidebar) {
                // Left sidebar
                mascot.style.left = '0px';
                mascot.style.bottom = '0px';
                mascot.style.maxWidth = '312px';
            } else {
                // Right sidebar
                mascot.style.right = '0px';
                mascot.style.bottom = '0px';
                mascot.style.maxWidth = '312px';
            }
        } else {
            // No sidebar
            mascot.style.right = '0px';
            mascot.style.bottom = '0px';
            mascot.style.maxWidth = '70vh';
        }

        document.body.appendChild(mascot);

        // Cleanup if mascot already exists
        return () => {
            document.querySelectorAll('.chSS-mascot').forEach(mascot => {
                if (mascot.parentNode) {
                    mascot.parentNode.removeChild(mascot);
                }
            });
        };
    }

    // --- Feature: Auto-hide Header on Scroll ---
    function autoHideHeaderOnScroll() {
        const header = document.getElementById('dynamicHeaderThread');
        if (!header) return;
        // Configuration
        const scrollThreshold = 50; // How many pixels to scroll before hiding/showing
        // Track scroll position
        let lastScrollY = window.scrollY;
        let scrollDirection = 'none';
        let ticking = false;

        function updateHeaderVisibility() {
            // Calculate scroll direction
            const currentScrollY = window.scrollY;
            scrollDirection = currentScrollY > lastScrollY ? 'down' : 'up';
            lastScrollY = currentScrollY;
            // Calculate if we're near the top of the page
            const isNearTop = currentScrollY < 100;

            // Show header when:
            if (scrollDirection === 'up' || isNearTop) {
                header.classList.remove('nav-hidden');
            } else if (scrollDirection === 'down' && currentScrollY > scrollThreshold) {
                // Hide header when scrolling down and not at the top
                header.classList.add('nav-hidden');
            }

            ticking = false;
        }

        // Add CSS for the transition
        const style = document.createElement('style');
        style.textContent = `
            #dynamicHeaderThread {
                transition: transform 0.3s ease;
            }
            #dynamicHeaderThread.nav-hidden {
                transform: translateY(-100%);
            }
            :root.bottom-header #dynamicHeaderThread.nav-hidden {
                transform: translateY(100%);
            }
        `;
        document.head.appendChild(style);

        // Listen for scroll events
        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(updateHeaderVisibility);
                ticking = true;
            }
        }, { passive: true });

        // Initial check
        updateHeaderVisibility();
    }

    ////////// THREAD WATCHER THINGZ ////////////////////////////////////////////////////////////////////////////////////////////////

    // Decode HTML entities in <a> to string (e.g., &gt; to >, &apos; to ')
    const decodeHtmlEntitiesTwice = (() => {
        const txt = document.createElement('textarea');
        return function (html) {
            txt.innerHTML = html;
            const once = txt.value;
            txt.innerHTML = once;
            return txt.value;
        };
    })();

    // --- Feature: Highlight TW mentions and new posts ---
    function highlightMentions() {
        const watchedCells = document.querySelectorAll("#watchedMenu .watchedCell");
        const watchButton = document.querySelector(".opHead .watchButton");
        if (!watchedCells.length) return; // Early exit if no watched cells

        // Process all cells in a single pass
        watchedCells.forEach((cell) => {
            const notification = cell.querySelector(".watchedNotification");
            if (!notification) return; // Skip if no notification

            const labelLink = cell.querySelector(".watchedCellAnchor");
            if (!labelLink) return; // Skip if no link

            // Process board data only once per link
            if (!labelLink.dataset.board) {
                const href = labelLink.getAttribute("href");
                const match = href?.match(/^(?:https?:\/\/[^\/]+)?\/([^\/]+)\//);
                if (match) {
                    labelLink.dataset.board = `/${match[1]}/ -`;
                }

                // Highlight watch button if this thread is open
                if (document.location.href.includes(href)) {
                    if (watchButton) {
                        watchButton.style.color = "var(--board-title-color)";
                        watchButton.title = "Watched";
                    }
                }

                // Decode HTML entities (only if needed)
                const originalText = labelLink.textContent;
                const decodedText = decodeHtmlEntitiesTwice(originalText);
                if (labelLink.textContent !== decodedText) {
                    labelLink.textContent = decodedText;
                }
            }

            // Get notification elements
            const repliesSpan = notification.querySelector(".watchedNotificationReplies");
            const yousSpan = notification.querySelector(".watchedNotificationYous");
            const hasYou = yousSpan && !yousSpan.classList.contains("hidden");
            const replyCount = repliesSpan ? repliesSpan.textContent.trim() : "";

            // Skip if already processed
            if (labelLink.dataset.mentionProcessed === "true") {
                return;
            }

            // Case 1: Has "(You)" mention - color link, replies span, and yous span
            if (hasYou) {
                labelLink.style.color = "var(--board-title-color)";
                labelLink.style.fontWeight = "bold";
                if (repliesSpan) {
                    repliesSpan.style.color = "var(--board-title-color)";
                    repliesSpan.style.fontWeight = "";
                }
                if (yousSpan) {
                    yousSpan.style.color = "var(--board-title-color)";
                    yousSpan.style.fontWeight = "";
                }
            }
            // Case 2: Just replies (no You) - color link and replies span
            else if (replyCount && /^\d+$/.test(replyCount)) {
                labelLink.style.color = "var(--link-color)";
                if (repliesSpan) {
                    repliesSpan.style.color = "var(--link-color)";
                    repliesSpan.style.fontWeight = "";
                }
            }

            // Mark as processed
            labelLink.dataset.mentionProcessed = "true";
        });
    }

    // Initial highlight on page load
    highlightMentions();

    // --- Highlight active watched thread in thread watcher ---
    function highlightActiveWatchedThread() {
        const currentPath = window.pageType?.path;
        if (!currentPath) return;
        document.querySelectorAll('.watchedCellAnchor').forEach(link => {
            // Strip anchors to compare
            const watchedPath = link.getAttribute('href').replace(/#.*$/, '');
            const cell = link.closest('.watchedCell');
            const repliesSpan = cell?.querySelector('.watchedNotificationReplies');
            const yousSpan = cell?.querySelector('.watchedNotificationYous');
            
            if (watchedPath === currentPath) {
                link.classList.add('ss-active');
                link.style.fontWeight = "bold";
                // Make notification spans bold when thread is open
                if (repliesSpan) {
                    repliesSpan.style.fontWeight = "bold";
                }
                if (yousSpan) {
                    yousSpan.style.fontWeight = "bold";
                }
            } else {
                link.classList.remove('ss-active');
                link.style.fontWeight = "";
                // Remove bold from notification spans when thread is not open
                if (repliesSpan) {
                    repliesSpan.style.fontWeight = "";
                }
                if (yousSpan) {
                    yousSpan.style.fontWeight = "";
                }
            }
        });
    }

    // Use the observer registry for #watchedMenu
    const watchedMenuObs = observeSelector('#watchedMenu', { childList: true, subtree: true });
    if (watchedMenuObs) {
        watchedMenuObs.addHandler(function highlightMentionsHandler() {
            highlightMentions();
            highlightActiveWatchedThread();
        });
    }

    // --- Feature: Watch Thread on Reply ---
    async function featureWatchThreadOnReply() {
        if ((window.pageType?.isIndex || window.pageType?.isCatalog)) {
            return;
        }

        // --- Helpers ---
        const getWatchButton = () => document.querySelector(".watchButton");

        // Watch the thread if not already watched
        function watchThreadIfNotWatched() {
            const btn = getWatchButton();
            if (btn && !btn.classList.contains("watched-active")) {
                btn.click(); // Triggers site's watcher logic
                // Fallback: ensure class is set after watcher logic
                setTimeout(() => {
                    btn.classList.add("watched-active");
                }, 100);
            }
        }

        // Handle reply submit: watch thread if setting enabled
        const submitButton = document.getElementById("qrbutton");
        if (submitButton) {
            // Remove any previous handler to avoid duplicates
            submitButton.removeEventListener("click", submitButton._watchThreadHandler || (() => { }));
            submitButton._watchThreadHandler = async function () {
                if (await getSetting("watchThreadOnReply")) {
                    setTimeout(watchThreadIfNotWatched, 500); // Wait for post to go through
                }
            };
            submitButton.addEventListener("click", submitButton._watchThreadHandler);
        }

    }

    // --- Feature: Pin Thread Watcher ---
    async function featureAlwaysShowTW() {
        if (!(await getSetting("alwaysShowTW"))) return;
        if ((await getSetting("alwaysShowTW_noPinInCatalog")) && window.pageType.isCatalog) return;

        const POSITION_STORAGE_KEY = "8chanSS_threadWatcherPosition";

        async function restorePosition() {
            const watchedMenu = document.getElementById("watchedMenu");
            if (!watchedMenu) return;

            try {
                const position = await getStoredObject(POSITION_STORAGE_KEY);
                if (position.left !== undefined && position.top !== undefined) {
                    watchedMenu.style.left = position.left + "px";
                    watchedMenu.style.top = position.top + "px";
                }
            } catch (err) {
                console.error("Failed to restore thread watcher position:", err);
            }
        }

        async function savePosition() {
            const watchedMenu = document.getElementById("watchedMenu");
            if (!watchedMenu) return;

            try {
                const left = parseInt(watchedMenu.style.left) || 0;
                const top = parseInt(watchedMenu.style.top) || 0;
                if (left > 0 || top > 0) {
                    await setStoredObject(POSITION_STORAGE_KEY, { left, top });
                }
            } catch (err) {
                console.error("Failed to save thread watcher position:", err);
            }
        }

        function showThreadWatcher() {
            const watchedMenu = document.getElementById("watchedMenu");
            if (watchedMenu) {
                restorePosition();
            }
        }

        // After update need to click the watcher button to populate the thread watcher
        const watcherButton = document.querySelector("#navLinkSpan > .jsOnly > .watcherButton");
        if (watcherButton) {
            watcherButton.click();
        }
        setTimeout(showThreadWatcher, 100);
        // Also restore position after a longer delay in case the site resets it during population
        setTimeout(restorePosition, 500);

        // Watch for position changes and save them
        const watchedMenuObs = observeSelector('#watchedMenu', { attributes: true, attributeFilter: ['style'] });
        if (watchedMenuObs) {
            let saveTimeout = null;
            watchedMenuObs.addHandler(function positionSaveHandler() {
                // Debounce saves to avoid excessive storage writes
                if (saveTimeout) clearTimeout(saveTimeout);
                saveTimeout = setTimeout(savePosition, 500);
            });
        }
    }

    // --- Feature: Mark All Threads as Read Button ---
    (function markAllThreadsAsRead() {
        const handleDiv = document.querySelector('#watchedMenu > div.handle');
        if (!handleDiv) return;
        // Check if the button already exists to avoid duplicates
        if (handleDiv.querySelector('.markAllRead')) return;

        // Create the button
        const btn = document.createElement('span');
        btn.className = 'coloredIcon glowOnHover markAllRead';
        btn.title = 'Mark all threads as read';

        // Helper to check if there are unread threads
        function hasUnreadThreads() {
            const watchedMenu = document.querySelector('#watchedMenu');
            if (!watchedMenu) return false;
            // Check if any buttons exist
            return watchedMenu.querySelector('.watchedNotification:not(.hidden) .watchedCellDismissButton:not(.markAllRead)') !== null;
        }

        // Helper to update button state
        function updateButtonState() {
            if (hasUnreadThreads()) {
                btn.classList.remove('disabled');
                btn.style.opacity = '1';
                btn.style.cursor = 'pointer';
                btn.title = 'Mark all threads as read';
            } else {
                btn.classList.add('disabled');
                btn.style.opacity = '0.5';
                btn.style.cursor = 'default';
                btn.title = 'No unread threads';
            }
        }

        // Reusable function to find and click all 'Mark as read' buttons
        function clickAllMarkAsReadButtons(watchedMenu) {
            // Only click buttons inside visible watchedNotification spans, exclude markAllRead button
            const markButtons = watchedMenu.querySelectorAll('.watchedNotification:not(.hidden) .watchedCellDismissButton:not(.markAllRead)');
            markButtons.forEach(btn => {
                try {
                    btn.click();
                } catch (e) {
                    console.log("Error clicking button:", e);
                }
            });
            return markButtons.length;
        }

        // Function to mark all threads with retry capability
        function markAllThreadsAsReadWithRetry(retriesLeft, callback) {
            setTimeout(function () {
                const watchedMenu = document.querySelector('#watchedMenu');
                if (!watchedMenu) {
                    if (callback) callback();
                    return;
                }
                const clickedCount = clickAllMarkAsReadButtons(watchedMenu);
                if (clickedCount === 0) {
                    updateButtonState();
                    if (callback) callback();
                    return;
                }
                if (retriesLeft > 0) {
                    setTimeout(() => markAllThreadsAsReadWithRetry(retriesLeft - 1, callback), 200);
                } else if (callback) {
                    callback();
                }
            }, 100);
        }

        // Use the observer registry for #watchedMenu > div.floatingContainer
        const watchedMenuObs = observeSelector('#watchedMenu > div.floatingContainer', { childList: true, subtree: true });
        if (watchedMenuObs) {
            const debouncedUpdate = debounce(updateButtonState, 100);
            watchedMenuObs.addHandler(function markAllThreadsAsReadHandler() {
                debouncedUpdate();
            });
        }

        // Set initial state
        updateButtonState();

        // Insert button before close-btn
        const closeBtn = handleDiv.querySelector('.close-btn');
        if (closeBtn) {
            handleDiv.insertBefore(btn, closeBtn);
        } else {
            // Fallback: append if close-btn not found
            handleDiv.appendChild(btn);
        }

        // Event delegation for close button and mark-all-read button
        document.body.addEventListener('click', function (e) {
            // Close button delegation
            const closeBtn = e.target.closest('#watchedMenu .close-btn');
            if (closeBtn) {
                const watchedMenu = document.getElementById("watchedMenu");
                if (watchedMenu) watchedMenu.style.display = "none";
                return;
            }
            // Mark all as read button delegation
            const markAllBtn = e.target.closest('.markAllRead');
            if (markAllBtn) {
                e.preventDefault();
                e.stopPropagation();
                if (markAllBtn.style.pointerEvents === 'none' || markAllBtn.classList.contains('disabled') || markAllBtn.dataset.processing === 'true') return;
                markAllBtn.dataset.processing = 'true';
                markAllBtn.style.opacity = '0.5';
                markAllThreadsAsReadWithRetry(3, function () {
                    markAllBtn.dataset.processing = 'false';
                    updateButtonState();
                });
            }
        });
    })();

    ///////// THREAD WATCHER END ////////////////////////////////////////////////////////////////////////////////////////////////////

    // --- Feature: Hash Navigation ---
    // Adapted from impregnator's code for 8chan Lightweight Extended Suite
    // MIT License
    // https://greasyfork.org/en/scripts/533173-8chan-lightweight-extended-suite
    function hashNavigation() {
        // Only proceed if the page is a thread
        if (!window.pageType?.isThread) return;

        // Use a WeakSet to track processed links
        const processedLinks = new WeakSet();

        // Add # links to quote/backlink anchors within a container
        function addHashLinks(container = document) {
            const links = container.querySelectorAll('.panelBacklinks a, .altBacklinks a, .divMessage .quoteLink');
            // Cache NodeList in a variable to avoid multiple queries
            links.forEach(link => {
                if (
                    processedLinks.has(link) ||
                    (link.nextSibling && link.nextSibling.classList && link.nextSibling.classList.contains('hash-link-container'))
                ) return;

                // Create # link
                const hashSpan = document.createElement('span');
                hashSpan.textContent = ' #';
                hashSpan.className = 'hash-link';
                hashSpan.style.cursor = 'pointer';
                hashSpan.style.color = 'var(--navbar-text-color)';
                hashSpan.title = 'Scroll to post';

                // Wrap in container
                const wrapper = document.createElement('span');
                wrapper.className = 'hash-link-container';
                wrapper.appendChild(hashSpan);

                link.insertAdjacentElement('afterend', wrapper);
                processedLinks.add(link);
            });
        }

        // Initial run
        addHashLinks();

        // Use the observer registry for #divThreads
        const divThreadsObs = observeSelector('#divThreads', { childList: true, subtree: true });
        if (divThreadsObs) {
            const debouncedAddHashLinks = debounce(() => addHashLinks(), 25);
            divThreadsObs.addHandler(function hashNavigationHandler() {
                debouncedAddHashLinks();
            });
        }

        // Event delegation for hash link clicks
        const postsContainer = document.getElementById('divThreads') || document.body;
        postsContainer.addEventListener('click', function (e) {
            if (e.target.classList.contains('hash-link')) {
                e.preventDefault();
                const link = e.target.closest('.hash-link-container').previousElementSibling;
                if (!link || !link.href) return;
                // Extract post ID from the href's hash
                const hashMatch = link.href.match(/#(\d+)$/);
                if (!hashMatch) return;
                const postId = hashMatch[1];
                // Sanitize postId: only allow digits
                const safePostId = /^[0-9]+$/.test(postId) ? postId : null;
                if (!safePostId) return;
                const postElem = document.getElementById(safePostId);
                if (postElem) {
                    window.location.hash = `#${safePostId}`;
                    if (postElem.classList.contains('opCell')) {
                        const offset = 25; // px
                        const rect = postElem.getBoundingClientRect();
                        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                        const targetY = rect.top + scrollTop - offset;
                        window.scrollTo({ top: targetY, behavior: "smooth" });
                    } else {
                        postElem.scrollIntoView({ behavior: "smooth", block: "center" });
                    }
                }
            }
        }, true);
    }

    // --- Feature: Scroll Arrows ---
    function featureScrollArrows() {
        // Only add once
        if (document.getElementById("scroll-arrow-up") || document.getElementById("scroll-arrow-down")) {
            return;
        }

        // Up arrow
        const upBtn = document.createElement("button");
        upBtn.id = "scroll-arrow-up";
        upBtn.className = "scroll-arrow-btn";
        upBtn.title = "Scroll to top";
        upBtn.innerHTML = "▲";
        upBtn.addEventListener("click", () => {
            window.scrollTo({ top: 0, behavior: "smooth" });
        });

        // Down arrow
        const downBtn = document.createElement("button");
        downBtn.id = "scroll-arrow-down";
        downBtn.className = "scroll-arrow-btn";
        downBtn.title = "Scroll to bottom";
        downBtn.innerHTML = "▼";
        downBtn.addEventListener("click", () => {
            window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
        });

        document.body.appendChild(upBtn);
        document.body.appendChild(downBtn);
    }

    // --- Feature: Hide Announcement and unhide if message changes ---
    async function featureHideAnnouncement() {
        // Helper to process the dynamic announcement element
        async function processElement(selector, settingKey, contentKey) {
            const el = document.querySelector(selector);
            if (!el) return;

            const content = (el.textContent || "").replace(/[^\w\s.,!?-]/g, ""); // Basic sanitization

            // Get setting and stored content from GM storage
            const shouldHide = await GM.getValue(`8chanSS_${settingKey}`, "false") === "true";
            const storedContent = await GM.getValue(`8chanSS_${contentKey}`, null);

            // Reference to the root element for toggling the class
            const root = document.documentElement;

            if (shouldHide) {
                if (storedContent !== null && storedContent !== content) {
                    // Announcement content changed: disable the setting
                    if (typeof window.setSetting === "function") {
                        await window.setSetting("hideAnnouncement", false);
                    }
                    await GM.setValue(`8chanSS_${settingKey}`, "false");
                    await GM.deleteValue(`8chanSS_${contentKey}`);
                    // No need to remove class; on reload, class won't be present
                    return;
                }
                // Content is equal to stored content or first time: hide announcement and store content
                root.classList.add("hide-announcement");
                await GM.setValue(`8chanSS_${contentKey}`, content);
            } else {
                root.classList.remove("hide-announcement");
                await GM.deleteValue(`8chanSS_${contentKey}`);
            }
        }

        await processElement("#dynamicAnnouncement", "hideAnnouncement", "announcementContent");
    }

    // --- Feature: Beep/Notify on (You) ---
    (async function featureBeepOnYou() {
        if (!divPosts) return;

        // Web Audio API beep
        let audioContext = null;
        let audioContextReady = false;
        let audioContextPromise = null;

        // Helper to create/resume AudioContext after user gesture
        function ensureAudioContextReady() {
            if (audioContextReady) return Promise.resolve();
            if (audioContextPromise) return audioContextPromise;

            audioContextPromise = new Promise((resolve) => {
                function resumeAudioContext() {
                    if (!audioContext) {
                        audioContext = new (window.AudioContext || window.webkitAudioContext)();
                    }
                    // Resume if suspended
                    if (audioContext.state === 'suspended') {
                        audioContext.resume().then(() => {
                            audioContextReady = true;
                            window.removeEventListener('click', resumeAudioContext);
                            window.removeEventListener('keydown', resumeAudioContext);
                            resolve();
                        });
                    } else {
                        audioContextReady = true;
                        window.removeEventListener('click', resumeAudioContext);
                        window.removeEventListener('keydown', resumeAudioContext);
                        resolve();
                    }
                }
                // Listen for first user gesture
                window.addEventListener('click', resumeAudioContext);
                window.addEventListener('keydown', resumeAudioContext);
            });
            return audioContextPromise;
        }

        async function createBeepSound() {
            if (!(await getSetting("beepOnYou"))) {
                return;
            }
            // Wait for AudioContext to be ready (after user gesture)
            await ensureAudioContextReady();

            return function playBeep() {
                try {
                    // Create oscillator for the beep
                    const oscillator = audioContext.createOscillator();
                    const gainNode = audioContext.createGain();

                    oscillator.type = 'sine';
                    oscillator.frequency.value = 550; // frequency in hertz
                    gainNode.gain.value = 0.1; // volume

                    oscillator.connect(gainNode);
                    gainNode.connect(audioContext.destination);

                    // Start and stop the beep
                    oscillator.start();
                    setTimeout(() => {
                        oscillator.stop();
                    }, 100); // 100ms beep duration
                } catch (e) {
                    console.warn("Beep failed:", e);
                }
            };
        }

        // Store the original title globally so all functions can access it
        window.originalTitle = document.title;
        window.isNotifying = false;

        // Cache settings to avoid repeated async calls
        let beepOnYouSetting = false;
        let notifyOnYouSetting = false;
        let customMsgSetting = "(!) ";

        // Store previous favicon state so we can restore it after notif
        let previousFaviconState = null;

        // Initialize settings
        async function initSettings() {
            beepOnYouSetting = await getSetting("beepOnYou");
            notifyOnYouSetting = await getSetting("notifyOnYou");
            const customMsg = await getSetting("notifyOnYou_customMessage");
            if (customMsg) customMsgSetting = customMsg;
        }
        // Await settings before observer setup
        await initSettings();

        // Store the beep
        let playBeep = null;
        createBeepSound().then(fn => { playBeep = fn; });

        // Function to notify on (You)
        let scrollHandlerActive = false;
        async function notifyOnYou() {
            if (!window.isNotifying) {
                window.isNotifying = true;
                document.title = customMsgSetting + " " + window.originalTitle;
                if (await getSetting("customFavicon")) {
                    // Store previous favicon state before setting "notif"
                    const { style, state } = faviconManager.getCurrentFaviconState();
                    if (state !== "notif") {
                        previousFaviconState = { style, state };
                    }
                    // Use setFaviconStyle to preserve current style but change state to "notif"
                    faviconManager.setFaviconStyle(style, "notif");
                }
            }
        }

        // Remove notification when user scrolls to the bottom of the page
        function setupNotificationScrollHandler() {
            if (scrollHandlerActive) return;
            scrollHandlerActive = true;
            const BOTTOM_OFFSET = 45;

            // Function to check if user has scrolled to the bottom
            function checkScrollPosition() {
                if (!window.isNotifying) return;
                const scrollPosition = window.scrollY + window.innerHeight;
                const documentHeight = document.documentElement.scrollHeight;

                // If user has scrolled to near the bottom (with offset)
                if (scrollPosition >= documentHeight - BOTTOM_OFFSET) {
                    document.title = window.originalTitle;
                    window.isNotifying = false;
                    // Restore previous favicon state if available
                    const { state } = faviconManager.getCurrentFaviconState();
                    if (state === "notif" && previousFaviconState) {
                        faviconManager.setFaviconStyle(previousFaviconState.style, previousFaviconState.state);
                        previousFaviconState = null;
                    } else if (state === "notif") {
                        // Fallback: reset to base if no previous state
                        faviconManager.setFavicon("base");
                    }
                    // Remove the scroll listener once notification is cleared
                    window.removeEventListener('scroll', checkScrollPosition);
                    scrollHandlerActive = false;
                }
            }

            // Add scroll event listener
            window.addEventListener('scroll', checkScrollPosition);
        }

        // Set up the scroll handler when a notification appears
        window.addEventListener("focus", () => {
            if (window.isNotifying) {
                // Clear notification when user scrolls to bottom
                setupNotificationScrollHandler();
            }
        });

        // Use the observer registry for .divPosts
        const divPostsObs = observeSelector('.divPosts', { childList: true, subtree: false });
        if (divPostsObs) {
            divPostsObs.addHandler(function beepOnYouHandler(mutations) {
                for (const mutation of mutations) {
                    for (const node of mutation.addedNodes) {
                        if (
                            node.nodeType === 1 &&
                            typeof node.matches === "function" &&
                            (node.matches('.postCell') || node.matches('.opCell')) &&
                            node.querySelector("a.quoteLink.you") &&
                            !node.closest('.innerPost')
                        ) {
                            if (beepOnYouSetting && playBeep) {
                                playBeep();
                            }
                            if (notifyOnYouSetting) {
                                notifyOnYou();
                                setupNotificationScrollHandler();
                            }
                        }
                    }
                }
            });
        }

        // Listen for settings changes
        window.addEventListener("8chanSS_settingChanged", async (e) => {
            if (e.detail && e.detail.key) {
                const key = e.detail.key;
                if (key === "beepOnYou") {
                    beepOnYouSetting = await getSetting("beepOnYou");
                    // Recreate beep function if setting changes
                    createBeepSound().then(fn => { playBeep = fn; });
                } else if (key === "notifyOnYou") {
                    notifyOnYouSetting = await getSetting("notifyOnYou");
                } else if (key === "notifyOnYou_customMessage") {
                    const customMsg = await getSetting("notifyOnYou_customMessage");
                    if (customMsg) customMsgSetting = customMsg;
                }
            }
        });
    })();

    // --- Feature: Enhanced Links (YouTube, Twitch, X.com, Bluesky, Rentry, Catbox) ---
    (async function enhanceLinks() {
        // Only run on thread or index pages
        if (!(window.pageType?.isThread || window.pageType?.isIndex)) {
            return;
        }

        // Load parent settings first
        const enableShowIcons = await getSetting("enhanceLinks_showIcons");
        const enableShowThumbnails = await getSetting("enhanceLinks_showThumbnails");
        const enableEmbeds = await getSetting("enhanceLinks_enableEmbeds");
        
        // Load subOptions only if parent is enabled
        const showIconsYoutube = enableShowIcons && await getSetting("enhanceLinks_showIcons_showIconsYoutube");
        const showIconsTwitch = enableShowIcons && await getSetting("enhanceLinks_showIcons_showIconsTwitch");
        const showIconsX = enableShowIcons && await getSetting("enhanceLinks_showIcons_showIconsX");
        const showIconsBsky = enableShowIcons && await getSetting("enhanceLinks_showIcons_showIconsBsky");
        const showIconsRentry = enableShowIcons && await getSetting("enhanceLinks_showIcons_showIconsRentry");
        const showIconsCatbox = enableShowIcons && await getSetting("enhanceLinks_showIcons_showIconsCatbox");
        const showIconsPastebin = enableShowIcons && await getSetting("enhanceLinks_showIcons_showIconsPastebin");
        
        const showThumbnailsYoutube = enableShowThumbnails && await getSetting("enhanceLinks_showThumbnails_showThumbnailsYoutube");
        const showThumbnailsTwitch = enableShowThumbnails && await getSetting("enhanceLinks_showThumbnails_showThumbnailsTwitch");
        
        const enableEmbedsX = enableEmbeds && await getSetting("enhanceLinks_enableEmbeds_enableEmbedsX");
        const enableEmbedsBsky = enableEmbeds && await getSetting("enhanceLinks_enableEmbeds_enableEmbedsBsky");
        const enableEmbedsRentry = enableEmbeds && await getSetting("enhanceLinks_enableEmbeds_enableEmbedsRentry");
        const enableEmbedsPastebin = enableEmbeds && await getSetting("enhanceLinks_enableEmbeds_enableEmbedsPastebin");

        // If no features are enabled, return early
        if (!showIconsYoutube && !showIconsTwitch && !showIconsX && !showIconsBsky && !showIconsRentry && !showIconsCatbox && !showIconsPastebin &&
            !showThumbnailsYoutube && !showThumbnailsTwitch &&
            !enableEmbedsX && !enableEmbedsBsky && !enableEmbedsRentry && !enableEmbedsPastebin) {
            return;
        }
        const MAX_CACHE_SIZE = 350;
        const ORDER_KEY = "_order";
        const TRACKING_PARAMS = [
            "si", "feature", "ref", "fsi", "source",
            "utm_source", "utm_medium", "utm_campaign", "gclid", "gclsrc", "fbclid"
        ];

        // SVG icons
        const YT_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" width="18" height="16" style="vertical-align:middle;margin-right:2px;"><path fill="#FF0000" d="M549.7 124.1c-6.3-23.7-24.9-42.4-48.6-48.6C456.5 64 288 64 288 64s-168.5 0-213.1 11.5c-23.7 6.3-42.4 24.9-48.6 48.6C16 168.5 16 256 16 256s0 87.5 10.3 131.9c6.3 23.7 24.9 42.4 48.6 48.6C119.5 448 288 448 288 448s168.5 0 213.1-11.5c23.7-6.3 42.4-24.9 48.6-48.6 10.3-44.4 10.3-131.9 10.3-131.9s0-87.5-10.3-131.9zM232 334.1V177.9L361 256 232 334.1z"/></svg>`;
        const TWITCH_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="18" height="16" style="vertical-align:middle;margin-right:2px;"><path fill="#9146FF" d="M391.17,103.47H352.54v109.7h38.63ZM285,103H246.37V212.75H285ZM120.83,0,24.31,91.42V420.58H140.14V512l96.53-91.42h77.25L487.69,256V0ZM449.07,237.75l-77.22,73.12H294.61l-67.6,64v-64H140.14V36.58H449.07Z"/></svg>`;
        const RENTRY_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="16" style="vertical-align:middle;margin-right:2px;" fill="currentColor"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm4 18H6V4h7v5h5v11z"/></svg>`;
        const PASTEBIN_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="16" style="vertical-align:middle;margin-right:2px;" fill="currentColor"><path d="M19.385 2.5H4.615A2.115 2.115 0 0 0 2.5 4.615v14.77a2.115 2.115 0 0 0 2.115 2.115h14.77a2.115 2.115 0 0 0 2.115-2.115V4.615A2.115 2.115 0 0 0 19.385 2.5M8.423 18.308v-7.423H6.154V6.5h5.888v1.154H8.423v3.462h3.462v1.154H8.423v5.039H6.154m8.654 0v-7.423h-2.269V6.5h5.888v1.154h-3.619v3.462h3.462v1.154h-3.462v5.039H15.077Z"/></svg>`;
        const CATBOX_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="16" style="vertical-align:middle;margin-right:2px;" fill="currentColor"><path d="M20 6h-2.18c.11-.31.18-.65.18-1a2.996 2.996 0 0 0-5.5-1.65l-.5.67-.5-.68C10.96 2.54 10 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm11 15H4v-2h16v2zm0-5H4V8h5.08L7 10.83 8.62 12 11 8.76l1-1.36 1 1.36L15.38 12 17 10.83 14.92 8H20v6z"/></svg>`;
        const X_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="16" style="vertical-align:middle;margin-right:2px;" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.48 11.25H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`;
        const BSKY_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 57" width="18" height="16" style="vertical-align:middle;margin-right:2px;"><path fill="#0085FF" d="M13.873 3.805C21.21 9.332 29.103 20.537 32 26.55v15.882c0-.338-.13.044-.41.867-1.512 4.456-7.418 21.847-20.923 7.944-7.111-7.32-3.819-14.64 9.125-16.85-7.405 1.264-15.73-.825-18.014-9.015C1.12 23.022 0 8.51 0 6.55 0-3.268 8.579-.182 13.873 3.805ZM50.127 3.805C42.79 9.332 34.897 20.537 32 26.55v15.882c0-.338.130.044.410.867 1.512 4.456 7.418 21.847 20.923 7.944 7.111-7.32 3.819-14.64-9.125-16.85 7.405 1.264 15.73-.825 18.014-9.015C62.88 23.022 64 8.51 64 6.55c0-9.818-8.578-6.732-13.873-2.745Z"/></svg>`;

        // Try to load cache and order from localStorage
        function loadCache(cacheKey) {
            try {
                const data = localStorage.getItem(cacheKey);
                if (data) {
                    const parsed = JSON.parse(data);
                    if (!Array.isArray(parsed[ORDER_KEY])) {
                        parsed[ORDER_KEY] = [];
                    }
                    return parsed;
                }
            } catch (e) { }
            return { [ORDER_KEY]: [] };
        }
        function saveCache(cacheKey, cache) {
            try {
                localStorage.setItem(cacheKey, JSON.stringify(cache));
            } catch (e) { }
        }

        // Initialize caches
        const ytTitleCache = loadCache('ytTitleCache');

        function getYouTubeInfo(url) {
            try {
                const u = new URL(url);
                // youtu.be short links
                if (u.hostname === 'youtu.be') {
                    const id = u.pathname.slice(1);
                    return { type: 'video', id: id };
                }
                // Standard YouTube links
                if (u.hostname.endsWith('youtube.com')) {
                    // Standard watch links
                    if (u.pathname === '/watch') {
                        const videoId = u.searchParams.get('v');
                        if (videoId) {
                            return { type: 'video', id: videoId };
                        }
                    }
                    // /live/VIDEOID or /embed/VIDEOID or /shorts/VIDEOID
                    const liveMatch = u.pathname.match(/^\/(live|embed|shorts)\/([a-zA-Z0-9_-]{11})/);
                    if (liveMatch) {
                        return { type: 'video', id: liveMatch[2] };
                    }
                    // /post/POSTID or /@channelname/post/POSTID
                    const postMatch = u.pathname.match(/^(?:\/@([a-zA-Z0-9_.-]+))?\/post\/([a-zA-Z0-9_-]+)/);
                    if (postMatch) {
                        return { 
                            type: 'post', 
                            id: postMatch[2],
                            channel: postMatch[1] || null
                        };
                    }
                    // /@channelname or /c/channelname or /channel/channelid or /user/username or /channelname (bare)
                    const channelMatch = u.pathname.match(/^\/(?:@([a-zA-Z0-9_.-]+)|c\/([a-zA-Z0-9_.-]+)|channel\/([a-zA-Z0-9_-]+)|user\/([a-zA-Z0-9_-]+)|([a-zA-Z0-9_.-]+))(?:\/|$)/);
                    if (channelMatch) {
                        // Extract the channel identifier (one of the capture groups will match)
                        const channelId = channelMatch[1] || channelMatch[2] || channelMatch[3] || channelMatch[4] || channelMatch[5];
                        if (channelId) {
                            // Store without @ prefix - display code will add it
                            return { type: 'channel', id: channelId };
                        }
                    }
                }
            } catch (e) { }
            return null;
        }

        // Helper to sanitize YouTube video ID (should be 11 valid chars)
        function sanitizeYouTubeId(videoId) {
            if (!videoId) return null;
            // YouTube IDs are 11 chars, letters, numbers, - and _
            const match = videoId.match(/([a-zA-Z0-9_-]{11})/);
            return match ? match[1] : null;
        }
        // Strip tracking params
        function stripTrackingParams(url) {
            try {
                const u = new URL(url);
                let changed = false;
                // Remove tracking params, keep t and start
                const KEEP_PARAMS = new Set(['t', 'start']);
                TRACKING_PARAMS.forEach(param => {
                    if (u.searchParams.has(param) && !KEEP_PARAMS.has(param)) {
                        u.searchParams.delete(param);
                        changed = true;
                    }
                });
                // Also handle hash params (e.g. #t=75)
                if (u.hash && u.hash.includes('?')) {
                    const [hashPath, hashQuery] = u.hash.split('?');
                    const hashParams = new URLSearchParams(hashQuery);
                    let hashChanged = false;
                    TRACKING_PARAMS.forEach(param => {
                        if (hashParams.has(param) && !KEEP_PARAMS.has(param)) {
                            hashParams.delete(param);
                            hashChanged = true;
                        }
                    });
                    if (hashChanged) {
                        u.hash = hashParams.toString()
                            ? `${hashPath}?${hashParams.toString()}`
                            : hashPath;
                        changed = true;
                    }
                }
                return changed ? u.toString() : url;
            } catch (e) {
                return url;
            }
        }

        async function fetchYouTubeTitle(videoId) {
            const cleanId = sanitizeYouTubeId(videoId);
            if (!cleanId) return null;
            if (ytTitleCache.hasOwnProperty(cleanId)) {
                const idx = ytTitleCache[ORDER_KEY].indexOf(cleanId);
                if (idx !== -1) {
                    ytTitleCache[ORDER_KEY].splice(idx, 1);
                }
                ytTitleCache[ORDER_KEY].push(cleanId);
                saveCache('ytTitleCache', ytTitleCache);
                return ytTitleCache[cleanId];
            }
            try {
                const data = await new Promise((resolve, reject) => {
                    GM.xmlHttpRequest({
                        method: "GET",
                        url: `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${cleanId}&format=json`,
                        timeout: 8000,
                        onload: (response) => {
                            if (response.status === 200) {
                                try {
                                    resolve(JSON.parse(response.responseText));
                                } catch (e) {
                                    reject(e);
                                }
                            } else {
                                reject(new Error(`HTTP ${response.status}`));
                            }
                        },
                        onerror: () => reject(new Error('Network error')),
                        ontimeout: () => reject(new Error('Timeout'))
                    });
                });
                const title = data ? data.title : null;
                if (title) {
                    ytTitleCache[cleanId] = title;
                    ytTitleCache[ORDER_KEY].push(cleanId);
                    while (ytTitleCache[ORDER_KEY].length > MAX_CACHE_SIZE) {
                        const oldest = ytTitleCache[ORDER_KEY].shift();
                        delete ytTitleCache[oldest];
                    }
                    saveCache('ytTitleCache', ytTitleCache);
                }
                return title;
            } catch {
                return null;
            }
        }

        // Fetch as data URL using GM.xmlHttpRequest
        function getYouTubeThumbnailUrl(videoId) {
            return `https://i.ytimg.com/vi_webp/${videoId}/hqdefault.webp`;
        }

        async function fetchAsDataURL(url) {
            return new Promise((resolve) => {
                try {
                    GM.xmlHttpRequest({
                        method: "GET",
                        url: url,
                        responseType: "blob",
                        timeout: 10000,
                        onload: (response) => {
                            if (response.status === 200 && response.response) {
                                try {
                                    const reader = new FileReader();
                                    reader.onloadend = () => resolve(reader.result);
                                    reader.onerror = () => resolve(null);
                                    reader.readAsDataURL(response.response);
                                } catch (e) {
                                    resolve(null);
                                }
                            } else {
                                resolve(null);
                            }
                        },
                        onerror: () => resolve(null),
                        ontimeout: () => resolve(null)
                    });
                } catch (e) {
                    resolve(null);
                }
            });
        }

        function addThumbnailHover(link, thumbnailUrl, altText = "Thumbnail") {
            if (link.dataset.thumbHover) return;
            link.dataset.thumbHover = "1";
            let thumbDiv = null;
            let lastImg = null;
            let lastHoverToken = 0;

            function showThumb(e) {
                if (!thumbDiv) {
                    thumbDiv = document.createElement('div');
                    thumbDiv.style.position = 'fixed';
                    thumbDiv.style.zIndex = 9999;
                    thumbDiv.style.pointerEvents = 'none';
                    thumbDiv.style.background = '#222';
                    thumbDiv.style.border = '1px solid #444';
                    thumbDiv.style.padding = '2px';
                    thumbDiv.style.borderRadius = '4px';
                    thumbDiv.style.boxShadow = '0 2px 8px rgba(0,0,0,0.4)';
                    thumbDiv.style.transition = 'opacity 0.1s';
                    thumbDiv.style.opacity = '0';
                    thumbDiv.style.maxWidth = '280px';
                    thumbDiv.style.maxHeight = '200px';
                    thumbDiv.style.color = '#fff';

                    const img = document.createElement('img');
                    img.style.display = 'block';
                    img.style.maxWidth = '280px';
                    img.style.maxHeight = '200px';
                    img.style.borderRadius = '3px';
                    img.alt = altText;
                    img.src = "data:image/gif;base64,R0lGODlhEAAQAPIAAP///wAAAMLCwkJCQv///wAAACH5BAEAAAMALAAAAAAQABAAAAIgjI+py+0Po5yUFQA7"; // spinner

                    lastImg = img;
                    const hoverToken = ++lastHoverToken;

                    fetchAsDataURL(thumbnailUrl).then(dataUrl => {
                        if (lastImg === img && hoverToken === lastHoverToken) {
                            if (dataUrl) {
                                img.src = dataUrl;
                            } else {
                                img.alt = "Failed to load thumbnail";
                            }
                        }
                    });

                    thumbDiv.appendChild(img);
                    document.body.appendChild(thumbDiv);

                    setTimeout(() => {
                        if (thumbDiv) thumbDiv.style.opacity = '1';
                    }, 10);
                }
                // Position near mouse
                const top = Math.min(window.innerHeight - 130, e.clientY + 12);
                const left = Math.min(window.innerWidth - 290, e.clientX + 12);
                thumbDiv.style.top = `${top}px`;
                thumbDiv.style.left = `${left}px`;
            }

            function moveThumb(e) {
                if (thumbDiv) {
                    const top = Math.min(window.innerHeight - 130, e.clientY + 12);
                    const left = Math.min(window.innerWidth - 290, e.clientX + 12);
                    thumbDiv.style.top = `${top}px`;
                    thumbDiv.style.left = `${left}px`;
                }
            }

            function hideThumb() {
                lastHoverToken++;
                if (thumbDiv && thumbDiv.parentNode) {
                    thumbDiv.parentNode.removeChild(thumbDiv);
                    thumbDiv = null;
                }
                lastImg = null;
            }

            link.addEventListener('mouseenter', showThumb);
            link.addEventListener('mousemove', moveThumb);
            link.addEventListener('mouseleave', hideThumb);
        }

        // Check if link is inside a codeblock or embed
        function isInsideCodeblock(link) {
            return link.closest('.inlineCode, .aa, .katex, .katex-html, .hljs-built_in, .hljs-string, .embedContainer, .embed-wrapper, [data-embed], .embed') !== null;
        }

        // YouTube handlers
        function processYouTubeLink(link) {
            if (link.dataset.enhanced) return;
            if (isInsideCodeblock(link)) return;
            const ytInfo = getYouTubeInfo(link.href);
            if (!ytInfo) return;
            link.dataset.enhanced = "1";

            const cleanUrl = stripTrackingParams(link.href);
            if (cleanUrl !== link.href) {
                link.href = cleanUrl;
            }

            if (showIconsYoutube) {
                if (ytInfo.type === 'video') {
                    const cleanId = sanitizeYouTubeId(ytInfo.id);
                    if (cleanId) {
                        fetchYouTubeTitle(cleanId).then(title => {
                            if (title) link.innerHTML = `${YT_ICON} ${title}`;
                        });
                    }
                } else if (ytInfo.type === 'post') {
                    link.innerHTML = `${YT_ICON} ${link.textContent.trim()}`;
                } else if (ytInfo.type === 'channel') {
                    const channelName = ytInfo.id.startsWith('@') ? ytInfo.id : `@${ytInfo.id}`;
                    link.innerHTML = `${YT_ICON} ${channelName}`;
                }
            }

            if (showThumbnailsYoutube && ytInfo.type === 'video') {
                const cleanId = sanitizeYouTubeId(ytInfo.id);
                if (cleanId) {
                    const thumbUrl = getYouTubeThumbnailUrl(cleanId);
                    addThumbnailHover(link, thumbUrl, "YouTube thumbnail");
                }
            }
        }

        function extractTitleAndThumbnail(html) {
            const result = { title: null, thumbnail: null };
            const jsonLdMatch = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/i);
            if (jsonLdMatch) {
                try {
                    const jsonLd = JSON.parse(jsonLdMatch[1]);
                    if (jsonLd.name) result.title = jsonLd.name.trim();
                } catch (e) {}
            }
            if (!result.title) {
                const ogTitleMatch = html.match(/<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i);
                if (ogTitleMatch && ogTitleMatch[1]) {
                    const title = ogTitleMatch[1].trim();
                    if (title !== 'Twitch') result.title = title;
                }
            }
            if (!result.title) {
                const twitterTitleMatch = html.match(/<meta\s+name=["']twitter:title["']\s+content=["']([^"']+)["']/i);
                if (twitterTitleMatch && twitterTitleMatch[1]) {
                    const title = twitterTitleMatch[1].trim();
                    if (title !== 'Twitch') result.title = title;
                }
            }
            const ogImageMatch = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i);
            if (ogImageMatch && ogImageMatch[1]) result.thumbnail = ogImageMatch[1].trim();
            if (!result.thumbnail) {
                const twitterImageMatch = html.match(/<meta\s+name=["']twitter:image["']\s+content=["']([^"']+)["']/i);
                if (twitterImageMatch && twitterImageMatch[1]) result.thumbnail = twitterImageMatch[1].trim();
            }
            return result;
        }

        function getTwitchInfo(url) {
            try {
                const u = new URL(url);
                if (u.hostname.includes('twitch.tv')) {
                    // Video: /videos/1234567890
                    const videoMatch = u.pathname.match(/^\/videos?\/(\d+)/);
                    if (videoMatch) {
                        return { type: 'video', id: videoMatch[1] };
                    }
                    // Clip: /username/clip/clipId (clipId can contain hyphens)
                    const clipMatch = u.pathname.match(/^\/([a-zA-Z0-9_]+)\/clip\/([a-zA-Z0-9_-]+)/);
                    if (clipMatch) {
                        return { type: 'clip', id: clipMatch[2], username: clipMatch[1] };
                    }
                    // Channel: /username
                    const channelMatch = u.pathname.match(/^\/([a-zA-Z0-9_]+)\/?$/);
                    if (channelMatch) {
                        return { type: 'channel', id: channelMatch[1] };
                    }
                }
            } catch (e) { }
            return null;
        }


        function getTwitchThumbnailUrl(twitchInfo) {
            if (!twitchInfo) return null;
            if (twitchInfo.type === 'clip') {
                const clipParts = twitchInfo.id.split('-');
                const slug = clipParts.length > 1 ? clipParts.slice(0, -1).join('-') : twitchInfo.id;
                return `https://clips-media-assets2.twitch.tv/${slug}-preview-480x272.jpg`;
            } else if (twitchInfo.type === 'channel') {
                return `https://static-cdn.jtvnw.net/previews-ttv/live_user_${twitchInfo.id}-320x180.jpg`;
            }
            return null;
        }

        async function fetchTwitchPageInfo(url) {
            try {
                const response = await new Promise((resolve, reject) => {
                    GM.xmlHttpRequest({
                        method: 'GET',
                        url: url,
                        onload: (r) => r.status === 200 ? resolve(r.responseText) : reject(new Error(`HTTP ${r.status}`)),
                        onerror: reject
                    });
                });
                return extractTitleAndThumbnail(response);
            } catch (e) {
                return { title: null, thumbnail: null };
            }
        }

        function processTwitchLink(link) {
            if (link.dataset.enhanced) return;
            if (isInsideCodeblock(link)) return;
            const twitchInfo = getTwitchInfo(link.href);
            if (!twitchInfo) return;
            
            if (link.closest('.embedContainer, .embed-wrapper, [data-embed], .embed') || 
                link.hasAttribute('data-embed') || 
                link.classList.contains('embed-link')) {
                return;
            }
            
            link.dataset.enhanced = "1";

            if (showIconsTwitch) {
                const originalText = link.textContent.trim();
                let displayText = twitchInfo.type === 'channel' ? twitchInfo.id : 
                                 twitchInfo.type === 'clip' ? twitchInfo.username : 
                                 `Video ${twitchInfo.id}`;
                link.innerHTML = `${TWITCH_ICON} ${displayText}`;
                
                if (twitchInfo.type === 'clip') {
                    const pageUrl = `https://www.twitch.tv/${twitchInfo.username}/clip/${twitchInfo.id}`;
                    fetchTwitchPageInfo(pageUrl).then(info => {
                        if (info.title) link.innerHTML = `${TWITCH_ICON} ${info.title}`;
                        if (showThumbnailsTwitch) {
                            const thumbUrl = info.thumbnail || getTwitchThumbnailUrl(twitchInfo);
                            if (thumbUrl) addThumbnailHover(link, thumbUrl, "Twitch thumbnail");
                        }
                    });
                } else if (twitchInfo.type === 'video') {
                    const pageUrl = `https://www.twitch.tv/videos/${twitchInfo.id}`;
                    fetchTwitchPageInfo(pageUrl).then(info => {
                        if (info.title) link.innerHTML = `${TWITCH_ICON} ${info.title}`;
                    });
                }
            }

            if (showThumbnailsTwitch && twitchInfo.type === 'channel') {
                const thumbUrl = getTwitchThumbnailUrl(twitchInfo);
                if (thumbUrl) addThumbnailHover(link, thumbUrl, "Twitch thumbnail");
            }
        }

        function isRentryLink(url) {
            try {
                const u = new URL(url);
                return u.hostname === 'rentry.co' || u.hostname === 'rentry.org';
            } catch (e) { }
            return false;
        }

        function getRentryKey(url) {
            try {
                const u = new URL(url);
                const match = u.pathname.match(/^\/([a-zA-Z0-9_-]+)\/?$/);
                return match ? match[1] : null;
            } catch (e) { }
            return null;
        }

        function processRentryLink(link) {
            if (link.dataset.enhanced) return;
            if (isInsideCodeblock(link)) return;
            if (!isRentryLink(link.href)) return;
            link.dataset.enhanced = "1";

            if (showIconsRentry) {
                const originalText = link.textContent.trim();
                link.innerHTML = `${RENTRY_ICON} ${originalText}`;
            }
            
            if (enableEmbedsRentry && getRentryKey(link.href)) {
                addEmbedButton(link, createRentryEmbed);
            }
        }

        function isPastebinLink(url) {
            try {
                const u = new URL(url);
                return u.hostname === 'pastebin.com' || u.hostname === 'www.pastebin.com';
            } catch (e) { }
            return false;
        }

        function getPastebinKey(url) {
            try {
                const u = new URL(url);
                const match = u.pathname.match(/^\/(?:raw\/)?([a-zA-Z0-9]+)$/);
                return match ? match[1] : null;
            } catch (e) { }
            return null;
        }

        function processPastebinLink(link) {
            if (link.dataset.enhanced) return;
            if (isInsideCodeblock(link)) return;
            if (!isPastebinLink(link.href)) return;
            link.dataset.enhanced = "1";

            if (showIconsPastebin) {
                const originalText = link.textContent.trim();
                link.innerHTML = `${PASTEBIN_ICON} ${originalText}`;
            }
            
            if (enableEmbedsPastebin && getPastebinKey(link.href)) {
                addEmbedButton(link, createPastebinEmbed);
            }
        }

        function isCatboxLink(url) {
            try {
                const u = new URL(url);
                return u.hostname === 'catbox.moe' || u.hostname.endsWith('.catbox.moe');
            } catch (e) { }
            return false;
        }

        function processCatboxLink(link) {
            if (link.dataset.enhanced) return;
            if (isInsideCodeblock(link)) return;
            if (!isCatboxLink(link.href)) return;
            link.dataset.enhanced = "1";

            if (showIconsCatbox) {
                const originalText = link.textContent.trim();
                link.innerHTML = `${CATBOX_ICON} ${originalText}`;
            }
        }

        function isXLink(url) {
            try {
                const u = new URL(url);
                return u.hostname.includes('x.com') || u.hostname.includes('twitter.com');
            } catch (e) { }
            return false;
        }

        function getXPostId(url) {
            try {
                const u = new URL(url);
                const match = u.pathname.match(/\/status\/(\d+)/);
                return match ? match[1] : null;
            } catch (e) { }
            return null;
        }

        function getXPostInfo(url) {
            try {
                const u = new URL(url);
                const match = u.pathname.match(/\/([^\/]+)\/status\/(\d+)/);
                if (match) {
                    return { username: match[1], statusId: match[2] };
                }
            } catch (e) { }
            return null;
        }

        function applyEmbedStyles(container) {
            container.style.marginTop = '10px';
            container.style.border = '1px solid #444';
            container.style.padding = '15px';
            container.style.boxShadow = '0 2px 8px rgba(0,0,0,0.4)';
        }

        function createAuthorDiv(authorName, authorUrl, handlePrefix = '@') {
            if (!authorName && !authorUrl) return null;
            const div = document.createElement('div');
            div.style.display = 'flex';
            div.style.alignItems = 'center';
            div.style.gap = '8px';
            if (authorName) {
                const name = document.createElement('strong');
                name.textContent = authorName;
                name.style.color = 'var(--text-color, #fff)';
                div.appendChild(name);
            }
            if (authorUrl) {
                const link = document.createElement('a');
                link.href = authorUrl;
                link.textContent = `${handlePrefix}${authorUrl.split('/').pop()}`;
                link.target = '_blank';
                link.style.color = 'var(--link-color, #00E)';
                div.appendChild(link);
            }
            return div;
        }

        function createEmbedCard(oembedData, viewLinkText, originalUrl) {
            const card = document.createElement('div');
            card.style.display = 'flex';
            card.style.flexDirection = 'column';
            card.style.gap = '10px';
            
            const authorDiv = createAuthorDiv(oembedData.author_name, oembedData.author_url);
            if (authorDiv) card.appendChild(authorDiv);
            
            if (oembedData.html) {
                const contentDiv = document.createElement('div');
                contentDiv.innerHTML = oembedData.html;
                contentDiv.style.color = 'var(--text-color, #fff)';
                contentDiv.querySelectorAll('script').forEach(script => script.remove());
                card.appendChild(contentDiv);
            }
            
            if (oembedData.thumbnail_url) {
                const img = document.createElement('img');
                img.src = oembedData.thumbnail_url;
                img.style.maxWidth = '100%';
                img.style.height = 'auto';
                img.style.borderRadius = '4px';
                img.style.cursor = 'pointer';
                img.onclick = () => window.open(originalUrl, '_blank');
                card.appendChild(img);
            }
            
            const linkDiv = document.createElement('div');
            const link = document.createElement('a');
            link.href = originalUrl;
            link.textContent = viewLinkText;
            link.target = '_blank';
            link.style.color = 'var(--link-color, #00E)';
            linkDiv.appendChild(link);
            card.appendChild(linkDiv);
            
            return card;
        }

        function createFxEmbedCard(fxData, viewLinkText, originalUrl) {
            const card = document.createElement('div');
            card.style.display = 'flex';
            card.style.flexDirection = 'column';
            card.style.gap = '10px';
            
            // FxEmbed API response structure: { code: 200, tweet: {...} } or { code: 200, post: {...} }
            if (fxData.code !== 200) {
                card.innerHTML = `<a href="${originalUrl}" target="_blank">${originalUrl}</a>`;
                return card;
            }
            
            // Handle both Twitter/X and Bluesky response formats
            const post = fxData.tweet || fxData.post || fxData;
            
            // Author info
            if (post.author) {
                const authorUrl = post.author.url || 
                    (post.author.screen_name ? `https://x.com/${post.author.screen_name}` : null) ||
                    (post.author.handle ? `https://bsky.app/profile/${post.author.handle}` : null);
                const authorDiv = createAuthorDiv(post.author.name, authorUrl);
                if (authorDiv) card.appendChild(authorDiv);
            }
            
            // Text content
            const text = post.text || post.content || '';
            if (text) {
                const textDiv = document.createElement('div');
                textDiv.style.color = 'var(--text-color, #fff)';
                textDiv.style.whiteSpace = 'pre-wrap';
                textDiv.style.wordWrap = 'break-word';
                textDiv.textContent = text;
                card.appendChild(textDiv);
            }
            
            // Media (images and videos)
            if (post.media) {
                const photos = post.media.photos || post.media.images || [];
                if (photos.length > 0) {
                    const mediaContainer = document.createElement('div');
                    mediaContainer.style.cssText = 'display:flex;flex-wrap:wrap;gap:8px;margin-top:8px';
                    photos.forEach(photo => {
                        mediaContainer.appendChild(createMediaImage(photo.url || photo));
                    });
                    card.appendChild(mediaContainer);
                }
                
                const videos = post.media.videos || [];
                if (videos.length > 0) {
                    const video = videos[0];
                    const videoContainer = document.createElement('div');
                    videoContainer.style.cssText = 'margin-top:8px;position:relative';
                    
                    if (video.url) {
                        const videoEl = document.createElement('video');
                        videoEl.controls = true;
                        videoEl.style.cssText = 'max-width:100%;height:auto;border-radius:4px;display:block';
                        fetchMediaAsBlob(video.url).then(blobUrl => {
                            videoEl.src = blobUrl;
                        }).catch(() => {
                            videoEl.style.display = 'none';
                            if (video.thumbnail_url) {
                                videoContainer.appendChild(createVideoThumbnail(video.thumbnail_url, originalUrl));
                            }
                        });
                        videoEl.onerror = () => {
                            videoEl.style.display = 'none';
                            if (video.thumbnail_url) {
                                videoContainer.appendChild(createVideoThumbnail(video.thumbnail_url, originalUrl));
                            }
                        };
                        videoContainer.appendChild(videoEl);
                    } else if (video.thumbnail_url) {
                        videoContainer.appendChild(createVideoThumbnail(video.thumbnail_url, originalUrl));
                    }
                    card.appendChild(videoContainer);
                }
            }
            
            return card;
        }

        function getContentTypeFromUrl(url) {
            const match = url.match(/\.(jpg|jpeg|png|gif|webp|mp4|webm)$/i);
            if (!match) return 'application/octet-stream';
            const ext = match[1].toLowerCase();
            const types = {
                jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png',
                gif: 'image/gif', webp: 'image/webp',
                mp4: 'video/mp4', webm: 'video/webm'
            };
            return types[ext] || 'application/octet-stream';
        }

        async function fetchMediaAsBlob(url) {
            return new Promise((resolve, reject) => {
                GM.xmlHttpRequest({
                    method: 'GET',
                    url: url,
                    responseType: 'arraybuffer',
                    onload: (r) => {
                        if (r.status === 200) {
                            try {
                                let contentType = 'application/octet-stream';
                                if (typeof r.getResponseHeader === 'function') {
                                    contentType = r.getResponseHeader('Content-Type') || getContentTypeFromUrl(url);
                                } else if (r.responseHeaders) {
                                    const match = r.responseHeaders.match(/content-type:\s*([^\r\n]+)/i);
                                    contentType = match ? match[1].trim() : getContentTypeFromUrl(url);
                                } else {
                                    contentType = getContentTypeFromUrl(url);
                                }
                                const blob = new Blob([r.response], { type: contentType });
                                resolve(URL.createObjectURL(blob));
                            } catch (e) {
                                reject(e);
                            }
                        } else {
                            reject(new Error(`HTTP ${r.status}`));
                        }
                    },
                    onerror: reject,
                    ontimeout: () => reject(new Error('Timeout'))
                });
            });
        }

        function createMediaImage(url, onClick) {
            const img = document.createElement('img');
            img.style.cssText = 'max-width:100%;max-height:400px;height:auto;border-radius:4px;cursor:pointer';
            img.onclick = onClick || (() => window.open(url, '_blank'));
            img.onerror = () => { img.style.display = 'none'; };
            fetchMediaAsBlob(url).then(blobUrl => {
                img.src = blobUrl;
            }).catch(() => {
                img.style.display = 'none';
            });
            return img;
        }

        function createVideoThumbnail(thumbnailUrl, originalUrl) {
            const wrapper = document.createElement('div');
            wrapper.style.cssText = 'position:relative;cursor:pointer';
            wrapper.onclick = () => window.open(originalUrl, '_blank');
            
            const img = createMediaImage(thumbnailUrl);
            wrapper.appendChild(img);
            
            const playBtn = document.createElement('div');
            playBtn.style.cssText = 'position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:64px;height:64px;border-radius:50%;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;font-size:24px;color:#fff';
            playBtn.innerHTML = '▶';
            wrapper.appendChild(playBtn);
            
            return wrapper;
        }

        async function createXEmbed(url) {
            const embedContainer = document.createElement('div');
            embedContainer.className = 'embedContainer';
            applyEmbedStyles(embedContainer);
            
            try {
                const postInfo = getXPostInfo(url);
                if (!postInfo) {
                    throw new Error('Invalid X.com URL');
                }
                
                const response = await new Promise((resolve, reject) => {
                    GM.xmlHttpRequest({
                        method: 'GET',
                        url: `https://api.fxtwitter.com/${encodeURIComponent(postInfo.username)}/status/${postInfo.statusId}`,
                        onload: (r) => {
                            if (r.status === 200) {
                                try {
                                    resolve(JSON.parse(r.responseText));
                                } catch (e) {
                                    reject(e);
                                }
                            } else {
                                reject(new Error(`HTTP ${r.status}`));
                            }
                        },
                        onerror: reject,
                        ontimeout: () => reject(new Error('Timeout'))
                    });
                });
                embedContainer.appendChild(createFxEmbedCard(response, 'View on X.com', url));
            } catch (e) {
                embedContainer.innerHTML = `<a href="${url}" target="_blank">${url}</a>`;
            }
            return embedContainer;
        }

        function addEmbedButton(link, createEmbedFn) {
            if (link.nextSibling?.classList?.contains('embedButton') ||
                link.closest('.embedContainer, .embed-wrapper, [data-embed], .embed')) {
                return;
            }
            
            const embedButton = document.createElement('span');
            embedButton.className = 'embedButton glowOnHover';
            embedButton.textContent = '[Embed]';
            
            embedButton.addEventListener('click', async (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const embedContainer = embedButton.nextElementSibling;
                if (embedContainer?.classList.contains('embedContainer')) {
                    embedContainer.remove();
                    embedButton.textContent = '[Embed]';
                } else {
                    embedButton.textContent = '[Loading...]';
                    embedButton.style.pointerEvents = 'none';
                    try {
                        const newContainer = await createEmbedFn(link.href);
                        embedButton.parentNode.insertBefore(newContainer, embedButton.nextSibling);
                        embedButton.textContent = '[Remove]';
                    } catch (error) {
                        embedButton.textContent = '[Embed]';
                        console.error('Failed to create embed:', error);
                    } finally {
                        embedButton.style.pointerEvents = 'auto';
                    }
                }
            });
            
            link.nextSibling 
                ? link.parentNode.insertBefore(embedButton, link.nextSibling)
                : link.parentNode.appendChild(embedButton);
        }

        function processXLink(link) {
            if (link.dataset.enhanced) return;
            if (isInsideCodeblock(link)) return;
            if (!isXLink(link.href)) return;
            link.dataset.enhanced = "1";

            if (showIconsX) {
                link.innerHTML = `${X_ICON} ${link.textContent.trim()}`;
            }
            
            if (enableEmbedsX && getXPostId(link.href)) {
                addEmbedButton(link, createXEmbed);
            }
        }

        function isBskyLink(url) {
            try {
                const u = new URL(url);
                return u.hostname.includes('bsky.app');
            } catch (e) { }
            return false;
        }

        function getBskyPostId(url) {
            try {
                const u = new URL(url);
                const match = u.pathname.match(/\/profile\/[^\/]+\/post\/([a-zA-Z0-9_-]+)/);
                return match ? match[1] : null;
            } catch (e) { }
            return null;
        }

        function extractBskyMedia(html) {
            const result = { images: [], videos: [], title: null, author: null };
            
            // Extract title
            const ogTitleMatch = html.match(/<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i);
            if (ogTitleMatch && ogTitleMatch[1]) {
                result.title = ogTitleMatch[1].trim();
            }
            if (!result.title) {
                const twitterTitleMatch = html.match(/<meta\s+name=["']twitter:title["']\s+content=["']([^"']+)["']/i);
                if (twitterTitleMatch && twitterTitleMatch[1]) {
                    result.title = twitterTitleMatch[1].trim();
                }
            }
            
            // Extract author
            const ogSiteNameMatch = html.match(/<meta\s+property=["']og:site_name["']\s+content=["']([^"']+)["']/i);
            if (ogSiteNameMatch && ogSiteNameMatch[1]) {
                result.author = ogSiteNameMatch[1].trim();
            }
            
            // Extract images - check for multiple og:image tags
            const ogImageMatches = html.matchAll(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/gi);
            for (const match of ogImageMatches) {
                if (match[1] && !match[1].includes('embed.bsky.app')) {
                    result.images.push(match[1].trim());
                }
            }
            
            // Fallback to twitter:image
            if (result.images.length === 0) {
                const twitterImageMatch = html.match(/<meta\s+name=["']twitter:image["']\s+content=["']([^"']+)["']/i);
                if (twitterImageMatch && twitterImageMatch[1] && !twitterImageMatch[1].includes('embed.bsky.app')) {
                    result.images.push(twitterImageMatch[1].trim());
                }
            }
            
            // Extract video - check for og:video
            const ogVideoMatch = html.match(/<meta\s+property=["']og:video["']\s+content=["']([^"']+)["']/i);
            if (ogVideoMatch && ogVideoMatch[1]) {
                result.videos.push(ogVideoMatch[1].trim());
            }
            
            // Extract video thumbnail
            const ogVideoImageMatch = html.match(/<meta\s+property=["']og:video:image["']\s+content=["']([^"']+)["']/i);
            if (ogVideoImageMatch && ogVideoImageMatch[1] && result.videos.length > 0) {
                result.videos[0] = { url: result.videos[0], thumbnail: ogVideoImageMatch[1].trim() };
            }
            
            // Try to extract from JSON-LD
            const jsonLdMatch = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/i);
            if (jsonLdMatch) {
                try {
                    const jsonLd = JSON.parse(jsonLdMatch[1]);
                    if (jsonLd.image && !result.images.length) {
                        if (Array.isArray(jsonLd.image)) {
                            result.images = jsonLd.image.map(img => typeof img === 'string' ? img : img.url || img.contentUrl).filter(Boolean);
                        } else if (typeof jsonLd.image === 'string') {
                            result.images.push(jsonLd.image);
                        } else if (jsonLd.image.url || jsonLd.image.contentUrl) {
                            result.images.push(jsonLd.image.url || jsonLd.image.contentUrl);
                        }
                    }
                } catch (e) {}
            }
            
            return result;
        }

        async function createBskyEmbed(url) {
            const embedContainer = document.createElement('div');
            embedContainer.className = 'embedContainer';
            applyEmbedStyles(embedContainer);
            
            try {
                // Fetch both oEmbed and the actual post page
                const [oembedResponse, pageHtml] = await Promise.all([
                    new Promise((resolve, reject) => {
                        GM.xmlHttpRequest({
                            method: 'GET',
                            url: `https://embed.bsky.app/oembed?url=${encodeURIComponent(url)}&maxwidth=600`,
                            onload: (r) => {
                                if (r.status === 200) {
                                    try {
                                        resolve(JSON.parse(r.responseText));
                                    } catch (e) {
                                        resolve(null);
                                    }
                                } else {
                                    resolve(null);
                                }
                            },
                            onerror: () => resolve(null),
                            ontimeout: () => resolve(null)
                        });
                    }),
                    new Promise((resolve, reject) => {
                        GM.xmlHttpRequest({
                            method: 'GET',
                            url: url,
                            onload: (r) => {
                                if (r.status === 200) {
                                    resolve(r.responseText);
                                } else {
                                    resolve(null);
                                }
                            },
                            onerror: () => resolve(null),
                            ontimeout: () => resolve(null)
                        });
                    })
                ]);
                
                const card = document.createElement('div');
                card.style.display = 'flex';
                card.style.flexDirection = 'column';
                card.style.gap = '10px';
                
                // Extract media from page HTML
                let mediaData = { images: [], videos: [], title: null, author: null };
                if (pageHtml) {
                    mediaData = extractBskyMedia(pageHtml);
                }
                
                // Extract author info from oEmbed or page
                const authorName = oembedResponse?.author_name || mediaData.author || 'Bluesky';
                const authorUrl = oembedResponse?.author_url || url;
                const authorDiv = createAuthorDiv(authorName, authorUrl);
                if (authorDiv) card.appendChild(authorDiv);
                
                // Extract text content from oEmbed
                if (oembedResponse?.html) {
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = oembedResponse.html;
                    const blockquote = tempDiv.querySelector('blockquote');
                    if (blockquote) {
                        const textDiv = document.createElement('div');
                        textDiv.style.color = 'var(--text-color, #fff)';
                        textDiv.style.whiteSpace = 'pre-wrap';
                        textDiv.style.wordWrap = 'break-word';
                        const textContent = blockquote.cloneNode(true);
                        textContent.querySelectorAll('script').forEach(s => s.remove());
                        textDiv.textContent = textContent.textContent || blockquote.textContent;
                        card.appendChild(textDiv);
                    }
                }
                
                if (mediaData.images.length > 0) {
                    const mediaContainer = document.createElement('div');
                    mediaContainer.style.cssText = 'display:flex;flex-wrap:wrap;gap:8px;margin-top:8px';
                    mediaData.images.forEach(imageUrl => {
                        mediaContainer.appendChild(createMediaImage(imageUrl));
                    });
                    card.appendChild(mediaContainer);
                }
                
                if (mediaData.videos.length > 0) {
                    mediaData.videos.forEach(video => {
                        const videoContainer = document.createElement('div');
                        videoContainer.style.marginTop = '8px';
                        
                        if (typeof video === 'object' && video.thumbnail) {
                            videoContainer.appendChild(createVideoThumbnail(video.thumbnail, url));
                        } else if (typeof video === 'string') {
                            const videoEl = document.createElement('video');
                            videoEl.controls = true;
                            videoEl.style.cssText = 'max-width:100%;height:auto;border-radius:4px;display:block';
                            fetchMediaAsBlob(video).then(blobUrl => {
                                videoEl.src = blobUrl;
                            }).catch(() => {
                                videoEl.style.display = 'none';
                            });
                            videoEl.onerror = () => { videoEl.style.display = 'none'; };
                            videoContainer.appendChild(videoEl);
                        }
                        card.appendChild(videoContainer);
                    });
                }
                
                if (oembedResponse?.thumbnail_url && mediaData.images.length === 0 && mediaData.videos.length === 0) {
                    card.appendChild(createMediaImage(oembedResponse.thumbnail_url, () => window.open(url, '_blank')));
                }
                
                embedContainer.appendChild(card);
            } catch (e) {
                console.error('Bluesky embed error:', e);
                embedContainer.innerHTML = `<a href="${url}" target="_blank">${url}</a>`;
            }
            return embedContainer;
        }

        async function createRentryEmbed(url) {
            const embedContainer = document.createElement('div');
            embedContainer.className = 'embedContainer';
            applyEmbedStyles(embedContainer);
            
            try {
                const rentryKey = getRentryKey(url);
                if (!rentryKey) {
                    throw new Error('Invalid Rentry URL');
                }
                
                const baseUrl = url.includes('rentry.org') ? 'https://rentry.org' : 'https://rentry.co';
                const pageUrl = `${baseUrl}/${rentryKey}`;
                
                const html = await new Promise((resolve, reject) => {
                    GM.xmlHttpRequest({
                        method: 'GET',
                        url: pageUrl,
                        onload: (r) => {
                            if (r.status === 200) {
                                resolve(r.responseText);
                            } else {
                                reject(new Error(`HTTP ${r.status}`));
                            }
                        },
                        onerror: reject,
                        ontimeout: () => reject(new Error('Timeout'))
                    });
                });
                
                let title = null;
                const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
                if (titleMatch) {
                    title = titleMatch[1].replace(/\s*-\s*rentry\.(co|org)/i, '').trim();
                }
                
                let content = null;
                const contentMatch = html.match(/<div[^>]*class="[^"]*markdown[^"]*"[^>]*>([\s\S]*?)<\/div>/i) ||
                                    html.match(/<div[^>]*id=["']content["'][^>]*>([\s\S]*?)<\/div>/i) ||
                                    html.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
                
                if (contentMatch && contentMatch[1]) {
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = contentMatch[1];
                    tempDiv.querySelectorAll('script, iframe, object, embed').forEach(el => el.remove());
                    content = tempDiv.innerHTML;
                }
                
                if (!content) {
                    const textareaMatch = html.match(/<textarea[^>]*id=["']text["'][^>]*>([\s\S]*?)<\/textarea>/i);
                    if (textareaMatch && textareaMatch[1]) {
                        const tempDiv = document.createElement('div');
                        tempDiv.innerHTML = textareaMatch[1].replace(/&amp;/g, '&');
                        content = tempDiv.textContent || tempDiv.innerText || textareaMatch[1];
                    }
                }
                
                if (!content) {
                    throw new Error('Could not extract content from Rentry page');
                }
                
                const card = document.createElement('div');
                card.style.display = 'flex';
                card.style.flexDirection = 'column';
                card.style.gap = '10px';
                
                const titleDiv = document.createElement('div');
                titleDiv.style.cssText = 'font-weight:bold;color:var(--text-color,#fff)';
                titleDiv.textContent = title ? `Rentry: ${title}` : `Rentry: ${rentryKey}`;
                card.appendChild(titleDiv);
                
                const contentDiv = document.createElement('div');
                contentDiv.style.cssText = 'padding:12px;border-radius:4px;overflow-x:auto;max-height:600px;overflow-y:auto;color:var(--text-color,#fff);word-wrap:break-word';
                
                if (content.includes('<')) {
                    contentDiv.innerHTML = content;
                    contentDiv.querySelectorAll('script').forEach(script => script.remove());
                    contentDiv.querySelectorAll('a').forEach(link => {
                        link.target = '_blank';
                        link.rel = 'noopener noreferrer';
                    });
                } else {
                    const pre = document.createElement('pre');
                    pre.style.cssText = 'white-space:pre-wrap;word-wrap:break-word;font-family:monospace;font-size:12px;margin:0';
                    pre.textContent = content;
                    contentDiv.appendChild(pre);
                }
                
                card.appendChild(contentDiv);
                embedContainer.appendChild(card);
            } catch (e) {
                console.error('Rentry embed error:', e);
                embedContainer.innerHTML = `<a href="${url}" target="_blank">${url}</a>`;
            }
            return embedContainer;
        }

        async function createPastebinEmbed(url) {
            const embedContainer = document.createElement('div');
            embedContainer.className = 'embedContainer';
            applyEmbedStyles(embedContainer);
            
            try {
                const pasteKey = getPastebinKey(url);
                if (!pasteKey) {
                    throw new Error('Invalid Pastebin URL');
                }
                
                const rawUrl = `https://pastebin.com/raw/${pasteKey}`;
                const content = await new Promise((resolve, reject) => {
                    GM.xmlHttpRequest({
                        method: 'GET',
                        url: rawUrl,
                        onload: (r) => {
                            if (r.status === 200) {
                                resolve(r.responseText);
                            } else {
                                reject(new Error(`HTTP ${r.status}`));
                            }
                        },
                        onerror: reject,
                        ontimeout: () => reject(new Error('Timeout'))
                    });
                });
                
                const card = document.createElement('div');
                card.style.display = 'flex';
                card.style.flexDirection = 'column';
                card.style.gap = '10px';
                
                const titleDiv = document.createElement('div');
                titleDiv.style.cssText = 'font-weight:bold;color:var(--text-color,#fff)';
                titleDiv.textContent = `Pastebin: ${pasteKey}`;
                card.appendChild(titleDiv);
                
                const contentDiv = document.createElement('pre');
                contentDiv.style.cssText = 'padding:12px;border-radius:4px;overflow-x:auto;max-height:400px;overflow-y:auto;color:var(--text-color,#fff);white-space:pre-wrap;word-wrap:break-word;font-family:monospace;font-size:12px;margin:0';
                contentDiv.textContent = content;
                card.appendChild(contentDiv);
                
                embedContainer.appendChild(card);
            } catch (e) {
                console.error('Pastebin embed error:', e);
                embedContainer.innerHTML = `<a href="${url}" target="_blank">${url}</a>`;
            }
            return embedContainer;
        }

        function processBskyLink(link) {
            if (link.dataset.enhanced) return;
            if (isInsideCodeblock(link)) return;
            if (!isBskyLink(link.href)) return;
            link.dataset.enhanced = "1";

            if (showIconsBsky) {
                link.innerHTML = `${BSKY_ICON} ${link.textContent.trim()}`;
            }
            
            if (enableEmbedsBsky && getBskyPostId(link.href)) {
                addEmbedButton(link, createBskyEmbed);
            }
        }

        function processLinks(root = document) {
            if (showIconsYoutube || showThumbnailsYoutube) {
                root.querySelectorAll('a[href*="youtu"]').forEach(processYouTubeLink);
            }
            if (showIconsTwitch || showThumbnailsTwitch) {
                root.querySelectorAll('a[href*="twitch"]').forEach(processTwitchLink);
            }
            if (showIconsRentry || enableEmbedsRentry) {
                root.querySelectorAll('a[href*="rentry.co"], a[href*="rentry.org"]').forEach(processRentryLink);
            }
            if (showIconsCatbox) {
                root.querySelectorAll('a[href*="catbox.moe"]').forEach(processCatboxLink);
            }
            if (showIconsPastebin || enableEmbedsPastebin) {
                root.querySelectorAll('a[href*="pastebin.com"]').forEach(processPastebinLink);
            }
            if (showIconsX || enableEmbedsX) {
                root.querySelectorAll('a[href*="x.com"], a[href*="twitter.com"]').forEach(processXLink);
            }
            if (showIconsBsky || enableEmbedsBsky) {
                root.querySelectorAll('a[href*="bsky.app"]').forEach(processBskyLink);
            }
        }

        // Initial run
        processLinks(document);

        function enhanceLinksHandler(mutations) {
            for (const mutation of mutations) {
                for (const addedNode of mutation.addedNodes) {
                    if (addedNode.nodeType === 1) {
                        processLinks(addedNode);
                    }
                }
            }
        }

        const divThreadsObs = observeSelector('#divThreads', { childList: true, subtree: true });
        if (divThreadsObs) divThreadsObs.addHandler(enhanceLinksHandler);

        const quoteTooltipObs = observeSelector('.quoteTooltip', { childList: true, subtree: true });
        if (quoteTooltipObs) quoteTooltipObs.addHandler(enhanceLinksHandler);
    })();

    // --- Feature: Convert to 12-hour format (AM/PM) ---
    async function featureLabelCreated12h() {
        if (window.pageType?.isCatalog) {
            return;
        }
        
        if (!(await getSetting("switchTimeFormat"))) {
            return;
        }

        function convertLabelCreatedSpan(span) {
            if (span.dataset.timeConverted === "1") return;

            // Get datetime attribute (UTC string)
            const datetimeAttr = span.getAttribute('datetime');
            if (!datetimeAttr) return;

            try {
                const date = new Date(datetimeAttr);
                if (isNaN(date.getTime())) return;

                // Time is displayed in local timezone
                let hour = date.getHours();
                const min = date.getMinutes().toString().padStart(2, '0');
                const sec = date.getSeconds().toString().padStart(2, '0');

                // Convert to 12-hour format
                const ampm = hour >= 12 ? 'PM' : 'AM';
                let hour12 = hour % 12;
                if (hour12 === 0) hour12 = 12;

                // Get the whole text to preserve the date part
                const originalText = span.textContent.trim();
                const datePartMatch = originalText.match(/^(.+?)\s+\d{1,2}:\d{2}:\d{2}/);
                if (!datePartMatch) {
                    span.textContent = `${hour12}:${min}:${sec} ${ampm}`;
                    span.dataset.timeConverted = "1";
                    return;
                }
                const datePart = datePartMatch[1].trim();

                // Reconstruct text with 12-hour time
                const newText = datePart ? `${datePart} ${hour12}:${min}:${sec} ${ampm}` : `${hour12}:${min}:${sec} ${ampm}`;
                span.textContent = newText;
                span.dataset.timeConverted = "1";
            } catch (e) {
                console.error("Error converting labelCreated time:", e);
            }
        }

        // Initial conversion on page load
        function convertAllLabelCreated(root = document) {
            const timeElements = root.querySelectorAll('time.labelCreated');
            timeElements.forEach(convertLabelCreatedSpan);
        }
        // Short timeout for page to load
        setTimeout(convertAllLabelCreated, 100);

        const divPostsObs = observeSelector('.divPosts', { childList: true, subtree: true });
        if (divPostsObs) {
            divPostsObs.addHandler(function labelCreated12hHandler(mutations) {
                for (const mutation of mutations) {
                    for (const addedNode of mutation.addedNodes) {
                        if (addedNode.nodeType !== 1) continue;
                        if (addedNode.tagName === 'TIME' && 
                            addedNode.classList && addedNode.classList.contains('labelCreated')) {
                            convertLabelCreatedSpan(addedNode);
                        } else if (addedNode.querySelectorAll) {
                            addedNode.querySelectorAll('time.labelCreated').forEach(convertLabelCreatedSpan);
                        }
                    }
                }
            });
        }
    }

    // --- Feature: Truncate Filenames and Show Only Extension ---
    function truncateFilenames(filenameLength) {
        if (window.pageType?.isCatalog) return;
        if (!divThreads) return;

        // Store full and truncated filenames in dataset for quick access
        function processLinks(root = document) {
            const links = root.querySelectorAll('a.originalNameLink');
            links.forEach(link => {
                // Skip if already processed
                if (link.dataset.truncated === "1") return;
                const fullFilename = link.getAttribute('download');
                if (!fullFilename) return;
                const lastDot = fullFilename.lastIndexOf('.');
                if (lastDot === -1) return; // No extension found
                const name = fullFilename.slice(0, lastDot);
                const ext = fullFilename.slice(lastDot);
                let truncated = fullFilename;
                if (name.length > filenameLength) {
                    truncated = name.slice(0, filenameLength) + '(...)' + ext;
                }
                link.textContent = truncated;
                link.dataset.truncated = "1";
                link.dataset.fullFilename = fullFilename;
                link.dataset.truncatedFilename = truncated;
                link.title = fullFilename;
            });
        }

        // Initial processing
        processLinks(document);

        // Event delegation for hover: show full filename on mouseenter, truncated on mouseleave
        divThreads.addEventListener('mouseover', function (e) {
            const link = e.target.closest('a.originalNameLink');
            if (link && link.dataset.fullFilename) {
                link.textContent = link.dataset.fullFilename;
            }
        });
        divThreads.addEventListener('mouseout', function (e) {
            const link = e.target.closest('a.originalNameLink');
            if (link && link.dataset.truncatedFilename) {
                link.textContent = link.dataset.truncatedFilename;
            }
        });

        // Use the observer registry for #divThreads
        const divThreadsObs = observeSelector('#divThreads', { childList: true, subtree: true });
        if (divThreadsObs) {
            const debouncedProcess = debounce(() => processLinks(divThreads), 100);
            divThreadsObs.addHandler(function truncateFilenamesHandler() {
                debouncedProcess();
            });
        }
    }

    // --- Feature: Show Thread Stats in Header ---
    function threadInfoHeader() {
        const navHeader = document.querySelector('.navHeader');
        const navOptionsSpan = document.getElementById('navOptionsSpan');
        const postCountEl = document.getElementById('postCount');
        const userCountEl = document.getElementById('userCountLabel');
        const fileCountEl = document.getElementById('fileCount');

        if (!(navHeader && navOptionsSpan && postCountEl && userCountEl && fileCountEl)) return;

        function updateHeader() {
            const postCount = postCountEl.textContent || '0';
            const userCount = userCountEl.textContent || '0';
            const fileCount = fileCountEl.textContent || '0';

            // Find or create display element
            let statsDisplay = navHeader.querySelector('.thread-stats-display');
            if (!statsDisplay) {
                statsDisplay = document.createElement('span');
                statsDisplay.className = 'thread-stats-display';
                statsDisplay.style.marginRight = '1px';
            }

            statsDisplay.innerHTML = `
        [ 
        <span class="statLabel">Posts: </span><span class="statNumb">${postCount}</span> | 
        <span class="statLabel">Users: </span><span class="statNumb">${userCount}</span> | 
        <span class="statLabel">Files: </span><span class="statNumb">${fileCount}</span>
        ]
        `;

            // Prepend statsDisplay to #navOptionsSpan if it exists
            if (statsDisplay.parentNode && statsDisplay.parentNode !== navOptionsSpan) {
                statsDisplay.parentNode.removeChild(statsDisplay);
            }
            if (navOptionsSpan.firstChild !== statsDisplay) {
                navOptionsSpan.insertBefore(statsDisplay, navOptionsSpan.firstChild);
            }
        }

        // Initial update
        updateHeader();

        // Use the observer registry for each stat element
        const statSelectors = ['#postCount', '#userCountLabel', '#fileCount'];
        statSelectors.forEach(selector => {
            const statObs = observeSelector(selector, { childList: true, subtree: false, characterData: true });
            if (statObs) {
                const debouncedUpdate = debounce(updateHeader, 100);
                statObs.addHandler(function threadInfoHeaderHandler() {
                    debouncedUpdate();
                });
            }
        });
    }

    // --- Feature: Advanced Media Viewer ---
    function mediaViewerPositioning() {
        // Set native 8chan setting
        localStorage.setItem("mediaViewer", "true");

        async function updateMediaViewerClass() {
            const mediaViewer = document.getElementById('media-viewer');
            if (!mediaViewer) return;

            const isEnabled = await getSetting("enableMediaViewer");
            if (!isEnabled) {
                // Remove positioning classes if feature is disabled
                mediaViewer.classList.remove('topright', 'topleft');
                return;
            }

            const viewerStyle = await getSetting("enableMediaViewer_viewerStyle");

            // Remove all positioning classes first
            mediaViewer.classList.remove('topright', 'topleft');

            // Apply the appropriate class based on setting
            if (viewerStyle === 'topright' || viewerStyle === 'topleft') {
                mediaViewer.classList.add(viewerStyle);
            }
            // For 'native', we don't add any class
        }

        // Initial setup if media viewer already exists
        updateMediaViewerClass();

        // Use the observer registry for #media-viewer
        const mediaViewerObs = observeSelector('#media-viewer', { childList: false, subtree: false });
        if (mediaViewerObs) {
            mediaViewerObs.addHandler(function mediaViewerPositioningHandler() {
                updateMediaViewerClass();
            });
        }

        // If #media-viewer is not present, observe the body for its addition
        const bodyObs = observeSelector('body', { childList: true, subtree: false });
        if (bodyObs) {
            bodyObs.addHandler(function bodyMediaViewerHandler(mutations) {
                for (const mutation of mutations) {
                    for (const node of mutation.addedNodes) {
                        if (node.nodeType === 1 && node.id === 'media-viewer') {
                            updateMediaViewerClass();
                        }
                    }
                }
            });
        }
    }

    // --- Feature: Highlight New IDs ---
    async function featureHighlightNewIds() {
        if (window.pageType?.isLast || window.pageType?.isCatalog) {
            return;
        }

        const hlStyle = await getSetting("highlightNewIds_idHlStyle");
        if (!divPosts) return;
        // Return early if there are no .spanId elements on this board
        if (!document.querySelector('.spanId')) return;

        // Map option value to actual class name
        const styleClassMap = {
            moetext: "moeText",
            glow: "id-glow",
            dotted: "id-dotted"
        };
        const styleClass = styleClassMap[hlStyle] || "moeText"; // fallback to 'moetext'

        // Helper: Highlight IDs
        function highlightIds(root = divPosts) {
            // Build frequency map
            const idFrequency = {};
            const labelSpans = root.querySelectorAll('.labelId');
            labelSpans.forEach(span => {
                const id = getRawIdFromLabelId(span);
                idFrequency[id] = (idFrequency[id] || 0) + 1;
            });

            // Track first occurrence and apply class
            const seen = {};
            labelSpans.forEach(span => {
                const id = getRawIdFromLabelId(span);
                // Remove all possible highlight classes in case of re-run
                span.classList.remove('moetext', 'id-glow', 'id-dotted');
                if (!seen[id]) {
                    seen[id] = true;
                    // Add class if first occurrence
                    span.classList.add(styleClass);
                    // Add a tooltip for clarity
                    span.title = idFrequency[id] === 1
                        ? "This ID appears only once."
                        : "This was the first occurrence of this ID.";
                } else {
                    // Remove tooltip for subsequent occurrences
                    span.title = "";
                }
            });
        }

        // Initial run
        highlightIds();

        // Use the observer registry for .divPosts
        const divPostsObs = observeSelector('.divPosts', { childList: true, subtree: true });
        if (divPostsObs) {
            const debouncedHighlightIds = debounce(() => highlightIds(), 50);
            divPostsObs.addHandler(function highlightNewIdsHandler(mutations) {
                let needsUpdate = false;
                for (const mutation of mutations) {
                    for (const node of mutation.addedNodes) {
                        if (
                            node.nodeType === 1 &&
                            (node.matches?.('.labelId') || node.querySelector?.('.labelId'))
                        ) {
                            needsUpdate = true;
                            break;
                        }
                    }
                    if (needsUpdate) break;
                }
                if (needsUpdate) {
                    debouncedHighlightIds();
                }
            });
        }
    }

    // --- Feature: Always show post count for IDs ---
    async function featureShowIDCount() {
        // Skip if /gacha/ board
        if (window.pageType?.path?.includes('/gacha/')) return;
        
        // Early return if no .spanId exists on the page
        if (!document.querySelector('.spanId')) return;

        // Add CSS class to root
        document.documentElement.classList.add('show-ID-count');

        // Cache processed labels to avoid reprocessing
        const processedLabels = new WeakSet();
        // Cache label data to avoid re-triggering mouseover
        const labelDataCache = new WeakMap();

        function processIDLabels() {
            const allLabels = Array.from(document.querySelectorAll('.labelId'));
            const unprocessedLabels = allLabels.filter(label => !processedLabels.has(label));
            
            if (unprocessedLabels.length === 0) return;

            // Process in batches
            let index = 0;
            const batchSize = 50;

            function processBatch() {
                const end = Math.min(index + batchSize, unprocessedLabels.length);
                
                for (let i = index; i < end; i++) {
                    const label = unprocessedLabels[i];
                    
                    // Skip if already processed
                    if (processedLabels.has(label)) {
                        continue;
                    }

                    // Check cache first
                    let cachedData = labelDataCache.get(label);
                    if (!cachedData) {
                        // Store original events
                        const originalMouseover = label.onmouseover;
                        // Trigger site mouseover to get the count
                        if (originalMouseover) {
                            originalMouseover.call(label);
                        }

                        const text = label.textContent;
                        const match = text.match(/^(.+?)\s*\((\d+)\)$/);

                        if (match) {
                            const idText = match[1].trim();
                            const count = match[2];
                            cachedData = { idText, count };
                            labelDataCache.set(label, cachedData);
                        } else {
                            // No match, mark as processed to skip in future
                            processedLabels.add(label);
                            continue;
                        }
                    }

                    const { idText, count } = cachedData;

                    // Restore original textContent (ID only) - CSS displays the count
                    label.textContent = idText;

                    // Store count in data attribute
                    label.setAttribute('data-posts-by-this-id', count);

                    // Mark as processed
                    processedLabels.add(label);

                    // Disable hover events to prevent interference
                    label.onmouseover = null;
                    label.onmouseout = null;

                    // Add event listeners that do nothing to prevent interference
                    label.addEventListener('mouseover', function (e) {
                        e.stopPropagation();
                        // Do nothing
                    });

                    label.addEventListener('mouseout', function (e) {
                        e.stopPropagation();
                        // Do nothing
                    });
                }

                index = end;

                if (index < unprocessedLabels.length) {
                    requestAnimationFrame(processBatch);
                }
            }

            processBatch();
        }

        // Initial processing
        setTimeout(processIDLabels, 50);

        // Use the global observer registry
        const debouncedProcess = debounce(processIDLabels, 50);

        function showIDCountHandler(mutations) {
            let hasNewLabels = false;

            for (const mutation of mutations) {
                for (const node of mutation.addedNodes) {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        if (node.classList?.contains('labelId')) {
                            hasNewLabels = true;
                            break;
                        } else if (node.querySelectorAll) {
                            const newLabels = node.querySelectorAll('.labelId');
                            if (newLabels.length > 0) {
                                hasNewLabels = true;
                                break;
                            }
                        }
                    }
                }
                if (hasNewLabels) break;
            }

            if (hasNewLabels) {
                debouncedProcess();
            }
        }

        const divThreadsObs = observeSelector('#divThreads', { childList: true, subtree: true });
        if (divThreadsObs) {
            divThreadsObs.addHandler(showIDCountHandler);
        }

        const quoteTooltipObs = observeSelector('.quoteTooltip', { childList: true, subtree: true });
        if (quoteTooltipObs) {
            quoteTooltipObs.addHandler(showIDCountHandler);
        }
    }

    // --- Feature: Quote Threading ---
    async function featureQuoteThreading() {
        // Feature toggle check
        const isEnabled = typeof getSetting === "function"
            ? await getSetting("quoteThreading")
            : true;

        if (!isEnabled) {
            document.querySelector('.quoteThreadingRefresh')?.remove();
            return;
        }

        // Deduplicate character ID icons that get duplicated when posts are moved
        function deduplicateCharacterIcons(movedPosts = null) {
            // Skip if no character icons
            if (!document.querySelector('.characterIdIcon')) {
                return;
            }
            
            // If specific posts were moved, only check those; otherwise check all
            const postsToCheck = movedPosts || document.querySelectorAll('.postCell, .opCell');
            
            postsToCheck.forEach(post => {
                const spanIds = post.querySelectorAll('.spanId');
                spanIds.forEach(spanId => {
                    const icons = spanId.querySelectorAll('.characterIdIcon');
                    if (icons.length > 1) {
                        // Keep only the first icon, remove duplicates
                        for (let i = 1; i < icons.length; i++) {
                            icons[i].remove();
                        }
                    }
                });
            });
        }

        // Core Threading Logic
        function processPosts(posts) {
            const movedPosts = [];
            
            posts.forEach(post => {
                const backlinks = post.querySelectorAll('.panelBacklinks .backLink.postLink');

                backlinks.forEach(backlink => {
                    const targetUri = backlink.getAttribute('data-target-uri');
                    if (!targetUri) return;

                    const targetPostId = targetUri.split('#')[1];
                    if (!targetPostId) return;
                    
                    const targetPost = document.getElementById(targetPostId);

                    if (targetPost) {
                        let repliesContainer = post.nextElementSibling;

                        // Create container if needed
                        if (!repliesContainer?.classList.contains('threadedReplies')) {
                            repliesContainer = document.createElement('div');
                            repliesContainer.className = 'threadedReplies';
                            post.parentNode.insertBefore(repliesContainer, post.nextSibling);
                        }

                        // Move post if not already in container
                        if (!repliesContainer.contains(targetPost)) {
                            repliesContainer.appendChild(targetPost);
                            movedPosts.push(targetPost);
                        }
                    }
                });
            });
            
            // Deduplicate character ID icons only in moved posts (with small delay)
            setTimeout(() => deduplicateCharacterIcons(movedPosts.length > 0 ? movedPosts : null), 50);
        }

        // Threading Handlers
        function threadAllPosts() {
            processPosts(document.querySelectorAll('.divPosts .postCell'));
        }

        function threadNewPosts() {
            const allPosts = document.querySelectorAll('.divPosts .postCell');
            processPosts(Array.from(allPosts).slice(-5));
        }

        // Use the observer registry for .divPosts
        const divPostsObs = observeSelector('.divPosts', { childList: true, subtree: false });
        if (divPostsObs) {
            divPostsObs.addHandler(function quoteThreadingHandler(mutations) {
                for (const mutation of mutations) {
                    if (mutation.addedNodes.length) {
                        setTimeout(threadNewPosts, 50);
                    }
                }
            });
        }

        // Refresh Button
        function addRefreshButton() {
            const replyButton = document.querySelector('.threadBottom .innerUtility #replyButton');
            if (!replyButton || replyButton.nextElementSibling?.classList.contains('quoteThreadingBtn')) return;

            const refreshBtn = document.createElement('a');
            refreshBtn.href = "#";
            refreshBtn.className = "quoteThreadingBtn";
            refreshBtn.title = "Refresh quote threading";
            refreshBtn.textContent = "ReThread";

            replyButton.after(' ', refreshBtn);

            refreshBtn.addEventListener('click', e => {
                e.preventDefault();
                threadAllPosts();
            });
        }

        // --- Initialization ---
        // Wait a bit for backlinks to be populated
        setTimeout(() => {
            threadAllPosts();  // Process all posts on initial load
        }, 500);
        addRefreshButton();
    }

    // --- Feature: Last 50 Button ---
    function featureLastFifty() {
        if (!window.pageType?.isCatalog) return;
        if (!catalogDiv) return;

        // Add the [L] button to catalog cell
        function addLastLinkButtons(root = document) {
            root.querySelectorAll('.catalogCell').forEach(cell => {
                const linkThumb = cell.querySelector('.linkThumb');
                const threadStats = cell.querySelector('.threadStats');
                if (!linkThumb || !threadStats) return;

                const href = linkThumb.getAttribute('href');
                if (!href || !/\/res\//.test(href)) return;

                // Create the /last/ href
                const lastHref = href.replace('/res/', '/last/');

                // Remove any existing button to avoid duplicates (robustness)
                threadStats.querySelectorAll('.last-link-btn').forEach(btn => btn.remove());

                // Create the [L] button
                const span = document.createElement('span');
                span.className = 'last-link-btn';
                span.style.marginLeft = '0.5em';
                const a = document.createElement('a');
                a.href = lastHref;
                a.textContent = '[L]';
                a.title = 'Go to last 50 posts of this thread';
                a.style.textDecoration = 'none';
                a.style.fontWeight = 'bold';
                span.appendChild(a);

                // Insert after .labelPage if present, else as last child of .threadStats
                const labelPage = threadStats.querySelector('.labelPage');
                if (labelPage && labelPage.parentNode) {
                    labelPage.parentNode.insertBefore(span, labelPage.nextSibling);
                } else {
                    threadStats.appendChild(span);
                }
            });
        }

        // Initial run on page load
        addLastLinkButtons(document);

        // Use the observer registry for .catalogDiv
        const catalogDivObs = observeSelector('.catalogDiv', { childList: true, subtree: false });
        if (catalogDivObs) {
            const debouncedUpdate = debounce(() => addLastLinkButtons(document), 50);
            catalogDivObs.addHandler(function lastFiftyHandler() {
                debouncedUpdate();
            });
        }
    }

    // --- Feature: Toggle ID as Yours ---
    function featureToggleIdAsYours() {
        // Early return if not on thread page
        if (!window.pageType?.isThread) return;
        // Early return if no .spanId exists on the page
        if (!document.querySelector('.spanId')) return;

        // --- Board Key Detection ---
        function getBoardName() {
            const postCell = document.querySelector('.postCell[data-boarduri], .opCell[data-boarduri]');
            if (postCell) return postCell.getAttribute('data-boarduri');
            const match = location.pathname.match(/^\/([^\/]+)\//);
            return match ? match[1] : 'unknown';
        }
        const BOARD_NAME = getBoardName();
        const T_YOUS_KEY = `${BOARD_NAME}-yous`;
        const MENU_ENTRY_CLASS = "toggleIdAsYoursMenuEntry";
        const MENU_SELECTOR = ".floatingList.extraMenu";

        // --- Storage Helpers (post numbers as numbers) ---
        function getYourPostNumbers() {
            try {
                const val = localStorage.getItem(T_YOUS_KEY);
                return val ? JSON.parse(val).map(Number) : [];
            } catch {
                return [];
            }
        }
        function setYourPostNumbers(arr) {
            localStorage.setItem(T_YOUS_KEY, JSON.stringify(arr.map(Number)));
        }

        // Menu/Post Association
        document.body.addEventListener('click', function (e) {
            if (e.target.matches('.extraMenuButton')) {
                const postCell = e.target.closest('.postCell, .opCell');
                if (!postCell) return;
                setTimeout(() => {
                    let menu = e.target.parentNode.querySelector('.floatingList.extraMenu');
                    if (!menu) {
                        const menus = Array.from(document.querySelectorAll('.floatingList.extraMenu'));
                        menu = menus[menus.length - 1];
                    }
                    if (menu) {
                        menu.setAttribute('data-post-id', postCell.id);
                        const labelIdSpan = postCell.querySelector('.labelId');
                        if (labelIdSpan) {
                            menu.setAttribute('data-label-id', getRawIdFromLabelId(labelIdSpan));
                        }
                        // Immediately add the Toggle ID as Yours entry if not present
                        addMenuEntries(menu.parentNode || menu);
                    }
                }, 0);
            }
        });

        function getLabelIdFromMenu(menu) {
            return menu.getAttribute('data-label-id') || null;
        }

        // Toggle all posts with a given ID
        function toggleYouNameClassForId(labelId, add) {
            document.querySelectorAll('.postCell, .opCell').forEach(postCell => {
                const labelIdSpan = postCell.querySelector('.labelId');
                const rawId = getRawIdFromLabelId(labelIdSpan);
                if (rawId === labelId) {
                    const nameLink = postCell.querySelector(".linkName.noEmailName");
                    if (nameLink) {
                        nameLink.classList.toggle("youName", add);
                    }
                }
            });
        }

        // Get all post numbers for a given ID
        function getAllPostNumbersForId(labelId) {
            const postNumbers = [];
            document.querySelectorAll('.divPosts .postCell').forEach(postCell => {
                const labelIdSpan = postCell.querySelector('.labelId');
                const rawId = getRawIdFromLabelId(labelIdSpan);
                if (rawId === labelId) {
                    const num = Number(postCell.id);
                    if (!isNaN(num)) postNumbers.push(num);
                }
            });
            return postNumbers;
        }

        // Menu Entry Logic
        function addMenuEntries(root = document) {
            root.querySelectorAll(MENU_SELECTOR).forEach(menu => {
                // Only proceed if the menu is a descendant of an .extraMenuButton
                if (!menu.closest('.extraMenuButton')) return;
                const ul = menu.querySelector("ul");
                if (!ul || ul.querySelector("." + MENU_ENTRY_CLASS)) return;

                // Get the correct labelId for this menu (ensure raw ID)
                // Find the menu button that opened this menu
                const menuButton = menu.closest('.extraMenuButton') || (menu.parentNode && menu.parentNode.querySelector('.extraMenuButton'));
                let labelId = null;
                if (menuButton) {
                    // Find the closest .innerPost or .innerOP
                    const innerPost = menuButton.closest('.innerPost, .innerOP');
                    const labelIdSpan = innerPost ? innerPost.querySelector('.labelId') : null;
                    if (labelIdSpan) {
                        labelId = getRawIdFromLabelId(labelIdSpan);
                    }
                }
                // Fallback to old method if not found
                if (!labelId) {
                    labelId = getLabelIdFromMenu(menu);
                    if (!labelId) return;
                    labelId = labelId.split(/[|\\(]/)[0].trim();
                }
                // Store the correct labelId on the menu for robust toggling
                menu.setAttribute('data-label-id', labelId);

                // Check if any post with this ID is marked as "yours"
                const yourPostNumbers = getYourPostNumbers();
                const postNumbersForId = getAllPostNumbersForId(labelId);
                const isMarked = postNumbersForId.length > 0 && postNumbersForId.every(num => yourPostNumbers.includes(num));

                const li = document.createElement("li");
                li.className = MENU_ENTRY_CLASS;
                li.style.cursor = "pointer";
                li.textContent = "Toggle ID as Yours";

                ul.appendChild(li);

                li.addEventListener("click", function (e) {
                    e.stopPropagation();
                    // Use the labelId stored on the menu (from the correct .labelId)
                    let labelId = menu.getAttribute('data-label-id');
                    if (!labelId) return;
                    labelId = labelId.split(/[|\(]/)[0].trim();
                    let yourPostNumbers = getYourPostNumbers();
                    const postNumbersForId = getAllPostNumbersForId(labelId);

                    if (postNumbersForId.length === 0) return;

                    const allMarked = postNumbersForId.every(num => yourPostNumbers.includes(num));
                    if (!allMarked) {
                        postNumbersForId.forEach(num => {
                            if (!yourPostNumbers.includes(num)) yourPostNumbers.push(num);
                        });
                        setYourPostNumbers(yourPostNumbers);
                        toggleYouNameClassForId(labelId, true);
                    } else {
                        yourPostNumbers = yourPostNumbers.filter(num => !postNumbersForId.includes(num));
                        setYourPostNumbers(yourPostNumbers);
                        toggleYouNameClassForId(labelId, false);
                    }
                });

                // On menu open, update all posts with this ID to reflect current state
                toggleYouNameClassForId(labelId, isMarked);
            });
        }

        // Listen for storage changes
        window.addEventListener("storage", function (event) {
            if (event.key === T_YOUS_KEY) {
                const yourPostNumbers = getYourPostNumbers();
                document.querySelectorAll('.postCell, .opCell').forEach(postCell => {
                    const nameLink = postCell.querySelector(".linkName.noEmailName");
                    if (nameLink) {
                        const postNum = Number(postCell.id);
                        nameLink.classList.toggle("youName", yourPostNumbers.includes(postNum));
                    }
                });
            }
        });

        // Use the observer registry for #divThreads
        const divThreadsObs = observeSelector('#divThreads', { childList: true, subtree: true });
        if (divThreadsObs) {
            const debouncedObserverCallback = debounce((mutations) => {
                for (const mutation of mutations) {
                    for (const node of mutation.addedNodes) {
                        if (node.nodeType !== 1) continue;
                        if (node.matches && node.matches(MENU_SELECTOR)) {
                            if (!node.hasAttribute('data-label-id')) {
                                const btn = node.closest('.extraMenuButton');
                                const postCell = btn && btn.closest('.postCell, .opCell');
                                if (postCell) {
                                    const labelIdSpan = postCell.querySelector('.labelId');
                                    if (labelIdSpan) {
                                        node.setAttribute('data-label-id', getRawIdFromLabelId(labelIdSpan));
                                    }
                                }
                            }
                            addMenuEntries(node.parentNode || node);
                        } else if (node.querySelectorAll) {
                            node.querySelectorAll(MENU_SELECTOR).forEach(menu => {
                                if (!menu.hasAttribute('data-label-id')) {
                                    const btn = menu.closest('.extraMenuButton');
                                    const postCell = btn && btn.closest('.postCell, .opCell');
                                    if (postCell) {
                                        const labelIdSpan = postCell.querySelector('.labelId');
                                        if (labelIdSpan) {
                                            menu.setAttribute('data-label-id', getRawIdFromLabelId(labelIdSpan));
                                        }
                                    }
                                }
                                addMenuEntries(menu.parentNode || menu);
                            });
                        }
                    }
                }
            }, 100);
            divThreadsObs.addHandler(debouncedObserverCallback);
        }

        // Initial marking on page load for all marked post numbers
        const yourPostNumbers = getYourPostNumbers();
        document.querySelectorAll('.postCell, .opCell').forEach(postCell => {
            const nameLink = postCell.querySelector(".linkName.noEmailName");
            if (nameLink) {
                const postNum = Number(postCell.id);
                nameLink.classList.toggle("youName", yourPostNumbers.includes(postNum));
            }
        });
    }

    // --- Feature: Sauce Links, appended to .uploadDetails ---
    async function featureSauceLinks() {
        // Only enable for index or thread
        if (!(window.pageType?.isThread || window.pageType?.isIndex)) {
            return;
        }

        // Check if the Sauce Links feature is enabled
        const enabled = await getSetting("enableTheSauce");
        if (!enabled) return;

        // Fetch all service settings
        const [
            iqdbEnabled,
            saucenaoEnabled,
            pixivEnabled
        ] = await Promise.all([
            getSetting("enableTheSauce_iqdb"),
            getSetting("enableTheSauce_saucenao"),
            getSetting("enableTheSauce_pixiv")
        ]);

        const services = [
            {
                key: "iqdb",
                label: "iqdb",
                enabled: iqdbEnabled,
                method: "post",
                url: "https://iqdb.org/",
                fileField: "file",
            },
            {
                key: "saucenao",
                label: "sauce",
                enabled: saucenaoEnabled,
                method: "post",
                url: "https://saucenao.com/search.php",
                fileField: "file",
            },
            {
                key: "pixiv",
                label: "pixiv",
                enabled: pixivEnabled,
                method: "pixiv",
            },
        ];

        // Helper: Get the image URL from a .uploadDetails div
        function getImageUrl(detailDiv) {
            let imgSrc = null;
            const imageContainer = detailDiv.closest('.uploadCell, .postCell, .opCell');

            if (imageContainer) {
                // Try to get thumbnail first
                const thumbImg = imageContainer.querySelector('.imgLink > img');
                const thumbSrc = thumbImg?.getAttribute("src");
                if (thumbImg && thumbSrc?.startsWith('/.media/t_')) {
                    imgSrc = thumbSrc;
                }

                // If no thumbnail, get full image from the same container.
                if (!imgSrc) {
                    const imgLink = imageContainer.querySelector('.imgLink');
                    if (imgLink) {
                        imgSrc = imgLink.getAttribute('href');
                    }
                }
            }

            if (!imgSrc) {
                return null;
            }

            let origin = window.location.origin;

            // Normalize the image URL
            if (imgSrc.startsWith("//")) {
                return window.location.protocol + imgSrc;
            } else if (imgSrc.startsWith("/")) {
                return origin + imgSrc;
            } else if (/^https?:\/\//.test(imgSrc)) {
                return imgSrc;
            } else {
                return origin + "/" + imgSrc;
            }
        }

        // Helper: Fetch the image as a Blob
        async function fetchImageBlob(url) {
            const response = await fetch(url);
            if (!response.ok) throw new Error("Failed to fetch image");
            return await response.blob();
        }

        // Helper: Extract Pixiv ID from filename
        function getPixivId(detailDiv) {
            const origNameLink = detailDiv.querySelector('.originalNameLink');
            if (!origNameLink) return null;
            const filename = origNameLink.getAttribute('download') || origNameLink.textContent;
            const match = filename && filename.match(/^(\d+)_p\d+\./);
            return match ? match[1] : null;
        }

        // Utility function for form creation and submission
        function submitImageToService({ url, fileField, file }) {
            const form = document.createElement("form");
            form.action = url;
            form.method = "POST";
            form.enctype = "multipart/form-data";
            form.target = "_blank";
            form.style.display = "none";

            const input = document.createElement("input");
            input.type = "file";
            input.name = fileField;
            form.appendChild(input);

            const dt = new DataTransfer();
            dt.items.add(file);
            input.files = dt.files;

            document.body.appendChild(form);
            form.submit();
            setTimeout(() => form.remove(), 10000);
        }

        // Main: Add sauce links to a single .uploadDetails element
        function addSauceLinksToElement(detailDiv) {
            // Prevent duplicate processing
            if (detailDiv.classList.contains('sauceLinksProcessed')) {
                return;
            }

            // Remove any existing sauce links first
            detailDiv.querySelectorAll('.sauceLinksContainer').forEach(el => el.remove());

            const imgUrl = getImageUrl(detailDiv);
            if (!imgUrl) {
                return;
            }

            const container = document.createElement('div');
            container.className = 'sauceLinksContainer';
            container.style.marginBottom = '3px';
            container.style.display = 'inline-flex';
            container.style.flexWrap = 'wrap';
            container.style.gap = '6px';

            let anyLink = false;

            services.forEach(service => {
                if (!service.enabled) {
                    return;
                }

                const a = document.createElement('a');
                a.className = 'sauceLink';
                a.target = '_blank';
                a.style.fontSize = '90%';
                a.textContent = service.label;

                if (service.method === "post") {
                    a.href = "#";
                    a.title = `Upload thumbnail to ${service.label}`;
                    a.addEventListener('click', async (e) => {
                        e.preventDefault();
                        try {
                            const blob = await fetchImageBlob(imgUrl);
                            const file = new File([blob], "image.png", { type: blob.type || "image/png" });
                            submitImageToService({ url: service.url, fileField: service.fileField, file });
                        } catch (err) {
                            callPageToast("Failed to upload thumbnail.", "red", 2500);
                        }
                    });
                } else if (service.method === "pixiv") {
                    const pixivId = getPixivId(detailDiv);
                    if (pixivId) {
                        a.href = `https://www.pixiv.net/artworks/${pixivId}`;
                        a.title = "Open Pixiv artwork";
                    } else {
                        return;
                    }
                }

                container.appendChild(a);
                anyLink = true;
            });

            if (anyLink) {
                detailDiv.classList.add('sauceLinksProcessed');
                // Append after .uploadDetails instead of inside it
                detailDiv.after(container);
            }
        }

        // Initial observation for all .uploadDetails in .divPosts
        function observeAllUploadDetails(container = document) {
            const details = container.querySelectorAll('.uploadDetails:not(.sauceLinksProcessed)');
            details.forEach(detailDiv => addSauceLinksToElement(detailDiv));
        }
        observeAllUploadDetails();

        const pendingUploadDetails = new Set();
        const debouncedProcessUploadDetails = debounce(() => {
            pendingUploadDetails.forEach(detailDiv => addSauceLinksToElement(detailDiv));
            pendingUploadDetails.clear();
        }, 50);

        const divPostsObs = observeSelector('.divPosts', { childList: true, subtree: true });
        if (divPostsObs) {
            divPostsObs.addHandler(function sauceLinksHandler(mutations) {
                for (const mutation of mutations) {
                    for (const node of mutation.addedNodes) {
                        if (node.nodeType === 1) {
                            if (node.classList && node.classList.contains('uploadDetails')) {
                                pendingUploadDetails.add(node);
                            } else if (node.querySelectorAll) {
                                node.querySelectorAll('.uploadDetails:not(.sauceLinksProcessed)').forEach(n => pendingUploadDetails.add(n));
                            }
                        }
                    }
                }
                debouncedProcessUploadDetails();
            });
        }

        // Observe for .quoteTooltip and .innerPost additions and process .uploadDetails inside
        const bodyObs = observeSelector('body', { childList: true, subtree: true });
        if (bodyObs) {
            bodyObs.addHandler(function quoteTooltipSauceLinksHandler(mutations) {
                for (const mutation of mutations) {
                    for (const node of mutation.addedNodes) {
                        if (node.nodeType !== 1) continue;
                        // .quoteTooltip
                        if (node.classList && node.classList.contains('quoteTooltip')) {
                            node.querySelectorAll('.uploadDetails:not(.sauceLinksProcessed)').forEach(addSauceLinksToElement);
                        } else if (node.classList && node.classList.contains('innerPost')) {
                            node.querySelectorAll('.uploadDetails:not(.sauceLinksProcessed)').forEach(addSauceLinksToElement);
                        } else if (node.querySelectorAll) {
                            node.querySelectorAll('.quoteTooltip .uploadDetails:not(.sauceLinksProcessed)').forEach(addSauceLinksToElement);
                            node.querySelectorAll('.innerPost .uploadDetails:not(.sauceLinksProcessed)').forEach(addSauceLinksToElement);
                        }
                    }
                }
            });
        }
    }

    // --- Feature: Show all posts by ID ---
    async function featureIdFiltering() {
        if (!window.pageType?.isThread) return;
        if (!divThreads) return;

        const postCellSelector = ".postCell, .opCell, .innerOP";
        const labelIdSelector = ".labelId";
        const hiddenClassName = "is-hidden-by-filter";
        let activeFilterColor = null;

        // Get subOptions for view mode
        const showIdLinks = await getSetting("enableIdFilters_idViewMode");
        let floatingDiv = null;
        let outsideClickHandler = null;

        // Remove any existing floating div
        function closeFloatingDiv() {
            if (floatingDiv && floatingDiv.parentNode) {
                floatingDiv.parentNode.removeChild(floatingDiv);
                floatingDiv = null;
            }
            if (outsideClickHandler) {
                document.removeEventListener("mousedown", outsideClickHandler, true);
                outsideClickHandler = null;
            }
        }

        // Remove native onclick handler from .labelId elements
        function removeNativeLabelIdOnClickHandlers() {
            document.querySelectorAll('.labelId').forEach(label => {
                // Remove inline onclick attribute if present
                if (label.hasAttribute('onclick')) {
                    label.removeAttribute('onclick');
                }
                // Remove property-based handler if present
                if (typeof label.onclick === 'function') {
                    label.onclick = null;
                }
            });
        }
        // Show floating div with links to all posts by this ID
        function showIdList(id, clickedLabel) {
            closeFloatingDiv();
            const idToMatch = (id.match(/^[a-fA-F0-9]{6}/) || [id.trim()])[0];

            const threadsContainer = document.getElementById('divThreads');
            if (!threadsContainer) {
                return [];
            }

            const allPosts = Array.from(threadsContainer.querySelectorAll('.postCell, .opCell, .innerOP'));

            const matchingPosts = [];
            allPosts.forEach(postEl => {
                const label = postEl.querySelector('.labelId');
                const postId = postEl.id;
                if (label && postId) {
                    const labelId = (label.textContent.match(/^[a-fA-F0-9]{6}/) || [label.textContent.trim()])[0];
                    if (labelId === idToMatch) {
                        matchingPosts.push(postEl);
                    }
                }
            });

            // Get board and thread from URL
            const match = window.location.pathname.match(/^\/([^/]+)\/(res|last)\/(\d+)\.html/);
            const board = match ? match[1] : '';
            const thread = match ? match[3] : '';

            // Build the floating div
            floatingDiv = document.createElement('div');
            floatingDiv.className = 'ss-idlinks-floating';

            // Title
            const title = document.createElement('div');
            if (showIdLinks === "showIdLinksOnly") {
                title.textContent = `Posts by ID: ${idToMatch} (${matchingPosts.length})`;
                title.style.fontWeight = 'bold';
                title.style.marginBottom = '8px';
                floatingDiv.appendChild(title);
            }

            // List of links
            const linkContainer = document.createElement('div');
            if (showIdLinks === "showIdLinksVertical") {
                linkContainer.classList.add('ss-vertical-id-list');
                linkContainer.style.display = 'block';
            } else {
                linkContainer.style.display = 'flex';
            }
            linkContainer.style.flexWrap = 'wrap';
            linkContainer.style.gap = '0.3em';

            matchingPosts.forEach(postEl => {
                const postId = postEl.id;
                const link = document.createElement('a');
                link.className = 'quoteLink postLink';
                link.href = `/${board}/res/${thread}.html#${postId}`;
                link.textContent = `>>${postId}`;
                link.setAttribute('data-target-uri', `${board}/${thread}#${postId}`);
                link.onclick = function (e) {
                    e.preventDefault();
                    closeFloatingDiv();
                    const target = document.getElementById(postId);
                    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                };
                // Wrap each link in a div.innerPost with dataset.uri for tooltip compatibility
                const wrapper = document.createElement('div');
                wrapper.className = 'innerPost';
                wrapper.dataset.uri = `${board}/${thread}#${postId}`;
                wrapper.appendChild(link);

                linkContainer.appendChild(wrapper);
            });
            floatingDiv.appendChild(linkContainer);

            // Position the floating div below the clicked label
            document.body.appendChild(floatingDiv);
            const rect = clickedLabel.getBoundingClientRect();
            const floatWidth = 320;
            const floatHeight = floatingDiv.offsetHeight || 200;
            let left = rect.left + window.scrollX;
            let top = rect.bottom + window.scrollY + 4;
            // Clamp left to viewport
            if (left + floatWidth > window.innerWidth) left = Math.max(0, window.innerWidth - floatWidth - 10);
            // If not enough space below, show above the label
            if (top + floatHeight > window.scrollY + window.innerHeight) {
                top = rect.top + window.scrollY - floatHeight - 4;
                if (top < 0) top = 10; // Clamp to top
            }
            floatingDiv.style.top = `${top}px`;
            floatingDiv.style.left = `${left}px`;
            // Close on click outside
            outsideClickHandler = function (e) {
                if (floatingDiv && !floatingDiv.contains(e.target)) {
                    closeFloatingDiv();
                }
            };
            setTimeout(() => {
                document.addEventListener("mousedown", outsideClickHandler, true);
            }, 0);
            return matchingPosts;
        }

        // Filtering logic
        function applyFilter(targetRgbColor) {
            activeFilterColor = targetRgbColor;
            const cells = document.querySelectorAll(postCellSelector); // cache NodeList
            cells.forEach(cell => {
                const label = cell.querySelector(labelIdSelector);
                const matches = label && window.getComputedStyle(label).backgroundColor === targetRgbColor;
                cell.classList.toggle(hiddenClassName, !!targetRgbColor && !matches);
            });
        }

        // Click handler
        function handleClick(event) {
            const clickedLabel = event.target.closest(labelIdSelector);
            if (clickedLabel && clickedLabel.closest(postCellSelector) && !clickedLabel.closest(".de-pview")) {
                // Hijack native marking for specific modes
                if (showIdLinks === "showIdLinksOnly" || showIdLinks === "showIdLinksVertical") {
                    event.preventDefault();
                    event.stopPropagation();
                    event.stopImmediatePropagation();
                    if (clickedLabel.hasAttribute('onclick')) clickedLabel.removeAttribute('onclick');
                    if (typeof clickedLabel.onclick === 'function') clickedLabel.onclick = null;
                }

                const id = clickedLabel.textContent.trim();
                if (showIdLinks != "showPostsOfIdOnly") {
                    showIdList(id, clickedLabel);
                } else {
                    const clickedColor = window.getComputedStyle(clickedLabel).backgroundColor;
                    const rect = clickedLabel.getBoundingClientRect();
                    const cursorOffsetY = event.clientY - rect.top;
                    if (activeFilterColor === clickedColor) {
                        applyFilter(null); // Toggle off if already active
                    } else {
                        applyFilter(clickedColor);
                    }
                    // Scroll to keep the clicked label in view
                    clickedLabel.scrollIntoView({ behavior: "instant", block: "center" });
                    window.scrollBy(0, cursorOffsetY - rect.height / 2);
                }
            }
        }
        // Debounced click handler
        const debouncedHandleClick = debounce(handleClick, 50);
        document.body.addEventListener("click", debouncedHandleClick, true);

        // On mode change or initial load, remove native handlers if needed
        if (showIdLinks === "showIdLinksOnly" || showIdLinks === "showIdLinksVertical") {
            removeNativeLabelIdOnClickHandlers();
        }
    }

    ///// MENU /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // --- Floating Settings Menu with Tabs ---
    async function createSettingsMenu() {
        let menu = document.getElementById("8chanSS-menu");
        if (menu) return menu;
        menu = document.createElement("div");
        menu.id = "8chanSS-menu";
        menu.style.position = "fixed";
        menu.style.zIndex = "99999";
        menu.style.background = "var(--menu-color)";
        menu.style.color = "var(--text-color)";
        menu.style.borderColor = "1px solid var(--border-color)";
        menu.style.padding = "0";
        menu.style.boxShadow = "0 4px 16px rgba(0,0,0,0.25)";
        menu.style.display = "none";
        menu.style.minWidth = "220px";
        menu.style.width = "100%";
        menu.style.maxWidth = "470px";
        menu.style.fontFamily = "sans-serif";
        menu.style.userSelect = "none";

        // Responsive menu positioning
        function positionMenu() {
            const viewportWidth = window.innerWidth;
            const isMobile = viewportWidth < 768;
            
            if (isMobile) {
                // Center with some padding
                menu.style.left = "50%";
                menu.style.transform = "translateX(-50%)";
                menu.style.top = "3rem";
                menu.style.maxWidth = "90vw"; // Use more of the viewport on mobile
            } else {
                // Desktop positioning
                menu.style.left = "35rem";
                menu.style.transform = "none";
                menu.style.top = "3rem";
                menu.style.maxWidth = "470px";
            }
        }
        
        // Set initial position
        positionMenu();
        
        // Update position on window resize
        window.addEventListener("resize", positionMenu);

        // Draggable
        let isDragging = false,
            dragOffsetX = 0,
            dragOffsetY = 0;
        const header = document.createElement("div");
        header.style.display = "flex";
        header.style.justifyContent = "space-between";
        header.style.alignItems = "center";
        header.style.marginBottom = "0";
        header.style.cursor = "move";
        header.style.color = "var(--subject-color)";
        header.style.background = "var(--contrast-color)";
        header.style.padding = "1px 18px 1px";
        header.addEventListener("mousedown", function (e) {
            isDragging = true;
            const rect = menu.getBoundingClientRect();
            dragOffsetX = e.clientX - rect.left;
            dragOffsetY = e.clientY - rect.top;
            document.body.style.userSelect = "none";
        });
        document.addEventListener("mousemove", function (e) {
            if (!isDragging) return;
            let newLeft = e.clientX - dragOffsetX;
            let newTop = e.clientY - dragOffsetY;
            const menuRect = menu.getBoundingClientRect();
            const menuWidth = menuRect.width;
            const menuHeight = menuRect.height;
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;
            newLeft = Math.max(0, Math.min(newLeft, viewportWidth - menuWidth));
            newTop = Math.max(0, Math.min(newTop, viewportHeight - menuHeight));
            menu.style.left = newLeft + "px";
            menu.style.top = newTop + "px";
            menu.style.right = "auto";
        });
        document.addEventListener("mouseup", function () {
            isDragging = false;
            document.body.style.userSelect = "";
        });

        // Title and close button
        const title = document.createElement("span");
        title.textContent = "8chanSS Settings";
        title.style.fontWeight = "bold";
        header.appendChild(title);

        const closeBtn = document.createElement("button");
        closeBtn.textContent = "✕";
        closeBtn.style.background = "none";
        closeBtn.style.setProperty("background", "none", "important");
        closeBtn.style.border = "none";
        closeBtn.style.color = "var(--subject-color)";
        closeBtn.style.fontSize = "18px";
        closeBtn.style.cursor = "pointer";
        closeBtn.style.marginLeft = "10px";
        closeBtn.addEventListener("click", () => {
            menu.style.display = "none";
        });
        header.appendChild(closeBtn);

        menu.appendChild(header);

        // Add click outside to close functionality
        const closeOnOutsideClick = (e) => {
            if (menu.style.display !== "none" && !menu.contains(e.target)) {
                // Make sure we're not clicking the menu toggle button
                const menuToggle = document.getElementById("8chanSS-icon");
                if (menuToggle && !menuToggle.contains(e.target)) {
                    menu.style.display = "none";
                }
            }
        };

        // Add the event listener when the menu is shown, remove when hidden
        Object.defineProperty(menu.style, 'display', {
            set: function (value) {
                const oldValue = this.getPropertyValue('display');
                this.setProperty('display', value);

                // If changing from hidden to visible, add listener and reposition
                if (oldValue === 'none' && value !== 'none') {
                    positionMenu(); // Reposition when shown
                    setTimeout(() => { // Use timeout to avoid immediate triggering
                        document.addEventListener('click', closeOnOutsideClick);
                    }, 10);
                }
                // If changing from visible to hidden, remove listener
                else if (oldValue !== 'none' && value === 'none') {
                    document.removeEventListener('click', closeOnOutsideClick);
                }
            },
            get: function () {
                return this.getPropertyValue('display');
            }
        });

        // Tab navigation
        const tabNav = document.createElement("div");
        tabNav.style.display = "flex";
        tabNav.style.borderBottom = "1px solid #444";
        tabNav.style.background = "rgb(from var(--menu-color) r g b / 1)";

        // Tab content container
        const tabContent = document.createElement("div");
        tabContent.style.padding = "15px 16px";
        tabContent.style.maxHeight = "70vh";
        tabContent.style.overflowY = "auto";
        tabContent.style.scrollbarWidth = "thin";
        tabContent.style.fontSize = "smaller";

        // Store current (unsaved) values
        const tempSettings = {};
        await Promise.all(
            Object.keys(flatSettings).map(async (key) => {
                tempSettings[key] = await getSetting(key);
            })
        );

        // Cache tab contents
        const tabContentCache = {};
        const shortcutsTabCache = { node: null };

        // Create tabs
        const tabs = {
            site: {
                label: "Site",
                content: tabContentCache.site || (tabContentCache.site = createTabContent("site", tempSettings)),
            },
            threads: {
                label: "Threads",
                content: tabContentCache.threads || (tabContentCache.threads = createTabContent("threads", tempSettings)),
            },
            catalog: {
                label: "Catalog",
                content: tabContentCache.catalog || (tabContentCache.catalog = createTabContent("catalog", tempSettings)),
            },
            styling: {
                label: "Style",
                content: tabContentCache.styling || (tabContentCache.styling = createTabContent("styling", tempSettings)),
            },
            miscel: {
                label: "Misc.",
                content: tabContentCache.miscel || (tabContentCache.miscel = createTabContent("miscel", tempSettings)),
            },
            shortcuts: {
                label: "⌨️",
                content: shortcutsTabCache.node || (shortcutsTabCache.node = createShortcutsTab()),
            },
        };

        // Create tab buttons
        Object.keys(tabs).forEach((tabId, index, arr) => {
            const tab = tabs[tabId];
            const tabButton = document.createElement("button");
            tabButton.textContent = tab.label;
            tabButton.dataset.tab = tabId;
            tabButton.style.background = index === 0 ? "var(--contrast-color)" : "transparent";
            tabButton.style.border = "none";
            tabButton.style.borderRight = "1px solid #444";
            tabButton.style.setProperty("border-left-radius", "0", "important");
            tabButton.style.color = "var(--text-color)";
            tabButton.style.padding = "8px 15px";
            tabButton.style.margin = "5px 0 0 0";
            tabButton.style.setProperty("border-top-right-radius", "0", "important");
            tabButton.style.setProperty("border-bottom-right-radius", "0", "important");
            tabButton.style.cursor = "pointer";
            tabButton.style.flex = "1";
            tabButton.style.fontSize = "14px";
            tabButton.style.transition = "background 0.2s";

            // Add rounded corners and margin to the first and last tab
            if (index === 0) {
                tabButton.style.setProperty("border-top-left-radius", "8px", "important");
                tabButton.style.setProperty("border-top-right-radius", "0", "important");
                tabButton.style.setProperty("border-bottom-left-radius", "0", "important");
                tabButton.style.setProperty("border-bottom-right-radius", "0", "important");
                tabButton.style.margin = "5px 0 0 5px";
            }
            if (index === arr.length - 1) {
                tabButton.style.setProperty("border-top-right-radius", "8px", "important");
                tabButton.style.setProperty("border-top-left-radius", "0", "important");
                tabButton.style.setProperty("border-bottom-left-radius", "0", "important");
                tabButton.style.setProperty("border-bottom-right-radius", "0", "important");
                tabButton.style.margin = "5px 5px 0 0";
                tabButton.style.borderRight = "none"; // Remove border on last tab
            }

            tabButton.addEventListener("click", () => {
                // Hide all tab contents
                Object.values(tabs).forEach((t) => {
                    t.content.style.display = "none";
                });

                // Show selected tab content
                tab.content.style.display = "block";

                // Update active tab button
                tabNav.querySelectorAll("button").forEach((btn) => {
                    btn.style.background = "transparent";
                });
                tabButton.style.background = "var(--contrast-color)";
            });

            tabNav.appendChild(tabButton);
        });

        menu.appendChild(tabNav);

        // Add all tab contents to the container
        Object.values(tabs).forEach((tab, index) => {
            tab.content.style.display = index === 0 ? "block" : "none";
            tabContent.appendChild(tab.content);
        });

        menu.appendChild(tabContent);

        // Button container for Save and Reset buttons
        const buttonContainer = document.createElement("div");
        buttonContainer.style.display = "flex";
        buttonContainer.style.gap = "10px";
        buttonContainer.style.padding = "0 18px 15px";

        // Save Button
        const saveBtn = document.createElement("button");
        saveBtn.textContent = "Save";
        saveBtn.style.setProperty("background", "#4caf50", "important");
        saveBtn.style.setProperty("color", "#fff", "important");
        saveBtn.style.border = "none";
        saveBtn.style.borderRadius = "4px";
        saveBtn.style.padding = "8px 18px";
        saveBtn.style.fontSize = "15px";
        saveBtn.style.cursor = "pointer";
        saveBtn.style.flex = "1";
        saveBtn.addEventListener("click", debounce(async function () {
            for (const key of Object.keys(tempSettings)) {
                await setSetting(key, tempSettings[key]);
            }
            saveBtn.textContent = "Saved!";
            setTimeout(() => {
                saveBtn.textContent = "Save";
            }, 900);
            setTimeout(() => {
                window.location.reload();
            }, 400);
        }, 50));
        buttonContainer.appendChild(saveBtn);

        // Reset Button
        const resetBtn = document.createElement("button");
        resetBtn.textContent = "Reset";
        resetBtn.style.setProperty("background", "#dd3333", "important");
        resetBtn.style.setProperty("color", "#fff", "important");
        resetBtn.style.border = "none";
        resetBtn.style.borderRadius = "4px";
        resetBtn.style.padding = "8px 18px";
        resetBtn.style.fontSize = "15px";
        resetBtn.style.cursor = "pointer";
        resetBtn.style.flex = "1";
        resetBtn.addEventListener("click", debounce(async function () {
            if (confirm("Reset all 8chanSS settings to defaults?")) {
                const keys = await GM.listValues();
                for (const key of keys) {
                    if (key.startsWith("8chanSS_")) {
                        await GM.deleteValue(key);
                    }
                }
                resetBtn.textContent = "Reset!";
                setTimeout(() => {
                    resetBtn.textContent = "Reset";
                }, 900);
                setTimeout(() => {
                    window.location.reload();
                }, 400);
            }
        }, 50));
        buttonContainer.appendChild(resetBtn);

        menu.appendChild(buttonContainer);

        // Info
        const info = document.createElement("div");
        info.style.fontSize = "11px";
        info.style.padding = "0 18px 12px";
        info.style.opacity = "0.7";
        info.style.textAlign = "center";
        info.innerHTML = 'Press Save to apply changes. Page will reload. - <a href="https://github.com/otacoo/8chanSS/blob/main/CHANGELOG.md" target="_blank" title="Check the changelog." style="color: var(--link-color); text-decoration: underline dashed;">Ver. ' + VERSION + '</a>';
        menu.appendChild(info);

        document.body.appendChild(menu);
        return menu;
    }

    // Helper function to create tab content
    function createTabContent(category, tempSettings) {
        const container = document.createElement("div");
        const categorySettings = scriptSettings[category];
        let hiddenListContainer;

        Object.keys(categorySettings).forEach((key) => {
            const setting = categorySettings[key];

            // --- Separator ---
            if (setting.type === "separator") {
                const hr = document.createElement("hr");
                hr.style.border = "none";
                hr.style.borderTop = "1px solid #444";
                hr.style.margin = "12px 0";
                container.appendChild(hr);
                return;
            }

            // --- Section Title ---
            if (setting.type === "title") {
                const title = document.createElement("div");
                title.textContent = setting.label;
                title.style.fontWeight = "bold";
                title.style.color = "var(--subject-title)";
                title.style.fontSize = "1rem";
                title.style.margin = "10px 0 6px 0";
                title.style.opacity = "0.9";
                container.appendChild(title);
                return;
            }

            // --- Button ---
            if (setting.type === "button") {
                const button = document.createElement("button");
                button.textContent = setting.label;
                button.style.setProperty("background", "var(--contrast-color)", "important");
                button.style.color = "#fff";
                button.style.border = "none";
                button.style.borderRadius = "4px";
                button.style.padding = "8px 12px";
                button.style.cursor = "pointer";
                button.style.width = "100%";
                button.style.marginBottom = "10px";

                if (key === "saveWatchedThreads") {
                    button.addEventListener('click', async () => {
                        const watchedData = localStorage.getItem('watchedData');
                        if (watchedData) {
                            await GM.setValue('8chanSS_watchedData', watchedData);
                            callPageToast('Watched threads saved!', 'green', 2000);
                        } else {
                            callPageToast('No watched threads found in localStorage.', 'orange', 2500);
                        }
                    });
                } else if (key === "restoreWatchedThreads") {
                    button.addEventListener('click', async () => {
                        const savedData = await GM.getValue('8chanSS_watchedData', null);
                        if (savedData) {
                            localStorage.setItem('watchedData', savedData);
                            callPageToast('Watched threads restored. Please reload the page.', 'blue', 3000);
                        } else {
                            callPageToast('No saved watched threads found.', 'orange', 2500);
                        }
                    });
                } else if (key === "saveFavoriteBoards") {
                    button.addEventListener('click', async () => {
                        const favoriteBoardsData = localStorage.getItem('navBoardData');
                        if (favoriteBoardsData) {
                            await GM.setValue('8chanSS_savedFavoriteBoards', favoriteBoardsData);
                            callPageToast('Favorite boards saved!', 'green', 2000);
                        } else {
                            callPageToast('No favorite boards found in localStorage.', 'orange', 2500);
                        }
                    });
                } else if (key === "restoreFavoriteBoards") {
                    button.addEventListener('click', async () => {
                        const savedData = await GM.getValue('8chanSS_savedFavoriteBoards', null);
                        if (savedData) {
                            localStorage.setItem('navBoardData', savedData);
                            callPageToast('Favorite boards restored. Please reload the page.', 'blue', 3000);
                        } else {
                            callPageToast('No saved favorite boards found.', 'orange', 2500);
                        }
                    });
                }

                // Check if this is a storage button for special layout
                const isStorageButton = ["saveWatchedThreads", "restoreWatchedThreads", "saveFavoriteBoards", "restoreFavoriteBoards"].includes(key);
                
                if (isStorageButton) {
                    // Get or create storage buttons container
                    let storageContainer = container.querySelector('.storage-buttons-container');
                    if (!storageContainer) {
                        storageContainer = document.createElement("div");
                        storageContainer.className = "storage-buttons-container";
                        storageContainer.style.display = "grid";
                        storageContainer.style.gridTemplateColumns = "1fr 1fr";
                        storageContainer.style.gap = "10px";
                        storageContainer.style.marginBottom = "10px";
                        container.appendChild(storageContainer);
                        
                        // Add a separator line between the two columns
                        const separator = document.createElement("div");
                        separator.style.position = "absolute";
                        separator.style.left = "50%";
                        separator.style.top = "0";
                        separator.style.bottom = "0";
                        separator.style.width = "1px";
                        separator.style.background = "var(--border-color)";
                        separator.style.opacity = "0.6";
                        storageContainer.style.position = "relative";
                        storageContainer.appendChild(separator);
                    }
                    
                    // Style the button for grid layout
                    button.style.width = "100%";
                    button.style.marginBottom = "0";
                    
                    storageContainer.appendChild(button);
                } else {
                    container.appendChild(button);
                }
                return;
            }

            // Parent row: flex for checkbox, label, chevron
            const parentRow = document.createElement("div");
            parentRow.style.display = "flex";
            parentRow.style.alignItems = "center";
            parentRow.style.marginBottom = "0px";

            // Special case: hoverVideoVolume slider
            if (key === "hoverVideoVolume" && setting.type === "number") {
                const label = document.createElement("label");
                label.htmlFor = "setting_" + key;
                label.textContent = setting.label + ": ";
                label.style.flex = "1";

                const sliderContainer = document.createElement("div");
                sliderContainer.style.display = "flex";
                sliderContainer.style.alignItems = "center";
                sliderContainer.style.flex = "1";

                const slider = document.createElement("input");
                slider.type = "range";
                slider.id = "setting_" + key;
                slider.min = setting.min;
                slider.max = setting.max;
                slider.value = Number(tempSettings[key]).toString();
                slider.style.flex = "unset";
                slider.style.width = "100px";
                slider.style.marginRight = "10px";

                const valueLabel = document.createElement("span");
                valueLabel.textContent = slider.value + "%";
                valueLabel.style.minWidth = "40px";
                valueLabel.style.textAlign = "right";

                slider.addEventListener("input", function () {
                    let val = Number(slider.value);
                    if (isNaN(val)) val = setting.default;
                    val = Math.max(setting.min, Math.min(setting.max, val));
                    slider.value = val.toString();
                    tempSettings[key] = val;
                    valueLabel.textContent = val + "%";
                });

                sliderContainer.appendChild(slider);
                sliderContainer.appendChild(valueLabel);

                parentRow.appendChild(label);
                parentRow.appendChild(sliderContainer);

                // Wrapper for parent row and sub-options
                const wrapper = document.createElement("div");
                wrapper.style.marginBottom = "10px";
                wrapper.appendChild(parentRow);
                container.appendChild(wrapper);
                return; // Skip the rest for this key
            }

            // Checkbox for boolean settings
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.id = "setting_" + key;
            checkbox.checked =
                tempSettings[key] === true || tempSettings[key] === "true";
            checkbox.style.marginRight = "8px";

            // Label
            const label = document.createElement("label");
            label.htmlFor = checkbox.id;
            label.textContent = setting.label;
            label.style.flex = "1";

            // Chevron for subOptions
            let chevron = null;
            let subOptionsContainer = null;
            if (setting?.subOptions) {
                chevron = document.createElement("span");
                chevron.className = "ss-chevron";
                chevron.innerHTML = "&#9654;"; // Right-pointing triangle
                chevron.style.display = "inline-block";
                chevron.style.transition = "transform 0.2s";
                chevron.style.marginLeft = "6px";
                chevron.style.fontSize = "12px";
                chevron.style.userSelect = "none";
                chevron.style.transform = checkbox.checked
                    ? "rotate(90deg)"
                    : "rotate(0deg)";
            }

            // Checkbox change handler
            checkbox.addEventListener("change", function () {
                tempSettings[key] = checkbox.checked;
                if (!setting?.subOptions) return;
                if (!subOptionsContainer) return;

                subOptionsContainer.style.display = checkbox.checked
                    ? "block"
                    : "none";

                if (!chevron) return;
                chevron.style.transform = checkbox.checked
                    ? "rotate(90deg)"
                    : "rotate(0deg)";

                // Handle catalog filtering UI visibility
                if (key === "enableThreadHiding") {
                    const catalogFilterContainer = wrapper.querySelector("div[style*='background: var(--menu-color)']");
                    if (catalogFilterContainer) {
                        // Only show if both main option and subOption are enabled
                        const subOptionEnabled = tempSettings["enableThreadHiding_enableCatalogFiltering"];
                        catalogFilterContainer.style.display = (checkbox.checked && subOptionEnabled) ? "block" : "none";
                    }
                }
            });

            parentRow.appendChild(checkbox);
            parentRow.appendChild(label);
            if (chevron) parentRow.appendChild(chevron);

            // Wrapper for parent row and sub-options
            const wrapper = document.createElement("div");
            wrapper.style.marginBottom = "10px";

            wrapper.appendChild(parentRow);

            // Handle sub-options if any exist
            if (setting?.subOptions) {
                subOptionsContainer = document.createElement("div");
                subOptionsContainer.style.marginLeft = "25px";
                subOptionsContainer.style.marginTop = "5px";
                subOptionsContainer.style.display = checkbox.checked ? "block" : "none";

                Object.keys(setting.subOptions).forEach((subKey) => {
                    const subSetting = setting.subOptions[subKey];
                    const fullKey = `${key}_${subKey}`;

                    const subWrapper = document.createElement("div");
                    subWrapper.style.marginBottom = "5px";

                    if (subSetting.type === "text") {
                        // Text input for custom notification message
                        const subLabel = document.createElement("label");
                        subLabel.htmlFor = "setting_" + fullKey;
                        subLabel.textContent = subSetting.label + ": ";

                        const subInput = document.createElement("input");
                        subInput.type = "text";
                        subInput.id = "setting_" + fullKey;
                        subInput.value = tempSettings[fullKey] || "";
                        subInput.maxLength = subSetting.maxLength;
                        subInput.style.width = "60px";
                        subInput.style.marginLeft = "2px";
                        subInput.placeholder = "(!) ";

                        // Escape input and enforce length
                        subInput.addEventListener("input", function () {
                            let val = subInput.value.replace(/[<>"']/g, "");
                            if (val.length > subInput.maxLength) {
                                val = val.slice(0, subInput.maxLength);
                            }
                            subInput.value = val;
                            tempSettings[fullKey] = val;
                        });

                        subWrapper.appendChild(subLabel);
                        subWrapper.appendChild(subInput);
                    } else if (subSetting.type === "textarea") {
                        // Textarea for multi-line input
                        const subLabel = document.createElement("label");
                        subLabel.htmlFor = "setting_" + fullKey;
                        subLabel.textContent = subSetting.label + ": ";

                        const subTextarea = document.createElement("textarea");
                        subTextarea.id = "setting_" + fullKey;
                        subTextarea.value = tempSettings[fullKey] || "";
                        subTextarea.rows = subSetting.rows || 4;
                        subTextarea.style.width = "100%";
                        subTextarea.style.maxWidth = "385px";
                        subTextarea.style.margin = "5px 0 0";
                        subTextarea.placeholder = subSetting.placeholder || "";

                        subTextarea.addEventListener("input", function () {
                            tempSettings[fullKey] = subTextarea.value;
                        });

                        subWrapper.appendChild(subLabel);
                        subWrapper.appendChild(document.createElement("br"));
                        subWrapper.appendChild(subTextarea);
                    } else if (subSetting.type === "number") {
                        const subLabel = document.createElement("label");
                        subLabel.htmlFor = "setting_" + fullKey;
                        subLabel.textContent = subSetting.label + ": ";

                        const subInput = document.createElement("input");
                        subInput.type = "number";
                        subInput.id = "setting_" + fullKey;
                        subInput.value = tempSettings[fullKey] || subSetting.default;
                        if (subSetting.min !== undefined) subInput.min = subSetting.min;
                        if (subSetting.max !== undefined) subInput.max = subSetting.max;
                        subInput.style.width = "60px";
                        subInput.style.marginLeft = "2px";

                        subInput.addEventListener("input", function () {
                            let val = Number(subInput.value);
                            if (isNaN(val)) val = subSetting.default;
                            if (subSetting.min !== undefined) val = Math.max(subSetting.min, val);
                            if (subSetting.max !== undefined) val = Math.min(subSetting.max, val);
                            subInput.value = val;
                            tempSettings[fullKey] = val;
                        });

                        subWrapper.appendChild(subLabel);
                        subWrapper.appendChild(subInput);
                    } else if (subSetting.type === "select") {
                        // Select dropdown for options like favicon style
                        const subSelect = document.createElement("select");
                        subSelect.id = "setting_" + fullKey;
                        subSelect.style.marginLeft = "5px";
                        subSelect.style.width = "120px";

                        // Add options to select
                        if (Array.isArray(subSetting.options)) {
                            subSetting.options.forEach(option => {
                                const optionEl = document.createElement("option");
                                optionEl.value = option.value;
                                optionEl.textContent = option.label;
                                if (tempSettings[fullKey] === option.value) {
                                    optionEl.selected = true;
                                }
                                subSelect.appendChild(optionEl);
                            });
                        }

                        // Set default if no value is selected
                        if (!subSelect.value && subSetting.default) {
                            subSelect.value = subSetting.default;
                            tempSettings[fullKey] = subSetting.default;
                        }

                        // --- Live preview: update favicon immediately on change ---
                        subSelect.addEventListener("change", function () {
                            tempSettings[fullKey] = subSelect.value;
                            // Only update favicon if customFavicon is enabled
                            if (key === "customFavicon" && tempSettings["customFavicon"]) {
                                faviconManager.setFaviconStyle(subSelect.value, "base");
                            }
                            if (key === "faviconStyle" && tempSettings["customFavicon"]) {
                                faviconManager.setFaviconStyle(subSelect.value, "base");
                            }
                        });

                        const subLabel = document.createElement("label");
                        subLabel.htmlFor = "setting_" + fullKey;
                        subLabel.textContent = subSetting.label || fullKey;
                        subLabel.style.marginLeft = "10px";

                        subWrapper.appendChild(subLabel);
                        subWrapper.appendChild(subSelect);
                    } else {
                        // Checkbox for boolean suboptions
                        const subCheckbox = document.createElement("input");
                        subCheckbox.type = "checkbox";
                        subCheckbox.id = "setting_" + fullKey;
                        subCheckbox.checked = tempSettings[fullKey];
                        subCheckbox.style.marginRight = "8px";

                        subCheckbox.addEventListener("change", function () {
                            tempSettings[fullKey] = subCheckbox.checked;
                            
                            // Catalog filtering container visibility
                            if (fullKey === "enableThreadHiding_enableCatalogFiltering") {
                                const catalogFilterContainer = wrapper.querySelector("div[style*='background: var(--menu-color)']");
                                if (catalogFilterContainer) {
                                    // Only show if both main option and subOption are enabled
                                    const mainOptionEnabled = tempSettings["enableThreadHiding"];
                                    catalogFilterContainer.style.display = (mainOptionEnabled && subCheckbox.checked) ? "block" : "none";
                                }
                            }
                        });

                        const subLabel = document.createElement("label");
                        subLabel.htmlFor = subCheckbox.id;
                        subLabel.textContent = subSetting.label;

                        subWrapper.appendChild(subCheckbox);
                        subWrapper.appendChild(subLabel);
                    }
                    subOptionsContainer.appendChild(subWrapper);
                });

                wrapper.appendChild(subOptionsContainer);
            }

            // Create Catalog Filtering UI
            if (key === "enableThreadHiding" && setting?.subOptions?.enableCatalogFiltering) {
                const catalogFilterContainer = document.createElement("div");
                catalogFilterContainer.style.display = (tempSettings["enableThreadHiding"] 
                    && tempSettings["enableThreadHiding_enableCatalogFiltering"]) ? "block" : "none";
                catalogFilterContainer.style.margin = "10px 0";
                catalogFilterContainer.style.maxHeight = "300px";
                catalogFilterContainer.style.overflowY = "auto";
                catalogFilterContainer.style.background = "var(--menu-color)";
                catalogFilterContainer.style.border = "1px solid var(--border-color)";
                catalogFilterContainer.style.borderRadius = "6px";
                catalogFilterContainer.style.padding = "8px";
                catalogFilterContainer.style.fontSize = "13px";

                // Help text explaining wildcards
                const filterTitle = document.createElement("div");
                filterTitle.innerHTML = "Use <strong>*</strong> as wildcard: <strong>word</strong> (exact), <strong>word*</strong> (starts with), <strong>*word</strong> (ends with), <strong>*word*</strong> (contains)";
                filterTitle.style.fontSize = "10px";
                filterTitle.style.marginBottom = "5px";
                filterTitle.style.color = "var(--text-color)";
                catalogFilterContainer.appendChild(filterTitle);

                // Filters container
                const filtersContainer = document.createElement("div");
                filtersContainer.id = "catalog-filters-container";
                catalogFilterContainer.appendChild(filtersContainer);

                // Add new filter button
                const addFilterBtn = document.createElement("button");
                addFilterBtn.textContent = "Add New Filter";
                addFilterBtn.style.background = "var(--contrast-color)";
                addFilterBtn.style.color = "#fff";
                addFilterBtn.style.border = "none";
                addFilterBtn.style.borderRadius = "4px";
                addFilterBtn.style.padding = "6px 12px";
                addFilterBtn.style.cursor = "pointer";
                addFilterBtn.style.marginTop = "8px";
                addFilterBtn.style.width = "100%";

                // Function to create a filter row
                function createFilterRow(filterData = null) {
                    const filterRow = document.createElement("div");
                    filterRow.style.display = "flex";
                    filterRow.style.alignItems = "center";
                    filterRow.style.gap = "6px";

                    // Word input
                    const wordInput = document.createElement("input");
                    wordInput.type = "text";
                    wordInput.placeholder = "Filter word";
                    wordInput.style.flex = "1";
                    wordInput.style.padding = "4px 8px";
                    wordInput.style.border = "1px solid var(--border-color)";
                    wordInput.style.borderRadius = "4px";
                    wordInput.style.background = "var(--background-color)";
                    wordInput.style.color = "var(--text-color)";
                    if (filterData) wordInput.value = filterData.word;

                    // Boards input
                    const boardsInput = document.createElement("input");
                    boardsInput.type = "text";
                    boardsInput.placeholder = "Boards (comma-separated, leave empty for all)";
                    boardsInput.style.flex = "2";
                    boardsInput.style.padding = "4px 8px";
                    boardsInput.style.border = "1px solid var(--border-color)";
                    boardsInput.style.borderRadius = "4px";
                    boardsInput.style.background = "var(--background-color)";
                    boardsInput.style.color = "var(--text-color)";
                    if (filterData) boardsInput.value = filterData.boards;

                    // Remove button
                    const removeBtn = document.createElement("button");
                    removeBtn.textContent = "✕";
                    removeBtn.style.background = "none";
                    removeBtn.style.border = "none";
                    removeBtn.style.color = "#c00";
                    removeBtn.style.cursor = "pointer";

                    // Save filter data
                    function saveFilterData() {
                        const word = wordInput.value.trim();
                        const boards = boardsInput.value.trim();
                        if (word) {
                            const filterKey = `filter_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                            const filterData = { word, boards, key: filterKey };
                            tempSettings[filterKey] = filterData;
                            // Also save to storage for persistence
                            saveCatalogFilters();
                        }
                    }

                    // Add event listeners
                    wordInput.addEventListener("blur", saveFilterData);
                    boardsInput.addEventListener("blur", saveFilterData);
                    removeBtn.addEventListener("click", (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        filterRow.remove();
                        saveCatalogFilters();
                    });

                    filterRow.appendChild(wordInput);
                    filterRow.appendChild(boardsInput);
                    filterRow.appendChild(removeBtn);

                    return filterRow;
                }

                // Load existing filters
                async function loadCatalogFilters() {
                    const filters = await getStoredObject("8chanSS_catalogFilters");
                    filtersContainer.innerHTML = "";
                    if (filters && Object.keys(filters).length > 0) {
                        Object.values(filters).forEach(filterData => {
                            const filterRow = createFilterRow(filterData);
                            filtersContainer.appendChild(filterRow);
                        });
                    }
                }

                // Save filters to storage
                async function saveCatalogFilters() {
                    const filters = {};
                    const filterRows = filtersContainer.querySelectorAll("div[style*='display: flex']");
                    filterRows.forEach(row => {
                        const wordInput = row.querySelector("input:first-child");
                        const boardsInput = row.querySelector("input:nth-child(2)");
                        if (wordInput && wordInput.value.trim()) {
                            const filterKey = `filter_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                            filters[filterKey] = {
                                word: wordInput.value.trim(),
                                boards: boardsInput.value.trim(),
                                key: filterKey
                            };
                        }
                    });
                    await setStoredObject("8chanSS_catalogFilters", filters);
                }

                // Add new filter button handler
                addFilterBtn.addEventListener("click", () => {
                    const filterRow = createFilterRow();
                    filtersContainer.appendChild(filterRow);
                });

                catalogFilterContainer.appendChild(addFilterBtn);

                // Load filters on init
                loadCatalogFilters();

                // Insert after the enableThreadHiding option
                wrapper.appendChild(catalogFilterContainer);
            }

            container.appendChild(wrapper);
        });

        return container;
    }

    // --- Menu Icon ---
    const themeSelector = document.getElementById("themeSelector");
    const sidebarMenu = document.querySelector("#hamburger-menu-icon #sidebar-menu");
    let link = null;
    let openBracketSpan = null;
    let closeBracketSpan = null;
    
    // Detect mobile: check if desktop themeSelector is visible
    // If themeSelector exists and is visible, use desktop; otherwise use mobile
    const isDesktop = themeSelector && window.getComputedStyle(themeSelector).display !== "none";
    
    // Mobile: append as list item in sidebar menu
    if (!isDesktop && sidebarMenu) {
        // Check if mobile button already exists to avoid duplicates
        if (!document.getElementById("8chanSS-icon-mobile")) {
            const listItem = document.createElement("li");
            listItem.className = "jsOnly";
            const mobileLink = document.createElement("a");
            mobileLink.id = "8chanSS-icon-mobile";
            mobileLink.href = "#";
            mobileLink.className = "coloredIcon settingsButton";
            mobileLink.textContent = "8chanSS";
            mobileLink.title = "Open 8chanSS settings";
            listItem.appendChild(mobileLink);
            
            // Insert after settingsButton
            const settingsButton = sidebarMenu.querySelector("a.settingsButton");
            if (settingsButton && settingsButton.id !== "8chanSS-icon-mobile" && settingsButton.parentElement) {
                settingsButton.parentElement.insertAdjacentElement("afterend", listItem);
            } else {
                const firstUl = sidebarMenu.querySelector("ul");
                if (firstUl) {
                    firstUl.appendChild(listItem);
                }
            }
            
            // Hook up mobile icon to open/close the menu
            mobileLink.style.cursor = "pointer";
            mobileLink.addEventListener("click", async function (e) {
                e.preventDefault();
                let menu = await createSettingsMenu();
                menu.style.display = menu.style.display === "none" ? "block" : "none";
            });
        }
    }
    
    // Desktop: append after themeSelector
    if (isDesktop && themeSelector) {
        openBracketSpan = document.createElement("span");
        openBracketSpan.textContent = " [";
        link = document.createElement("a");
        link.id = "8chanSS-icon";
        link.href = "#";
        link.textContent = "8chanSS";
        link.style.fontWeight = "bold";

        themeSelector.parentNode.insertBefore(
            openBracketSpan,
            themeSelector.nextSibling
        );
        themeSelector.parentNode.insertBefore(link, openBracketSpan.nextSibling);
        
        closeBracketSpan = document.createElement("span");
        closeBracketSpan.textContent = "\u00A0]";
        themeSelector.parentNode.insertBefore(closeBracketSpan, link.nextSibling);
    }

    // --- Shortcuts tab ---
    function createShortcutsTab() {
        const container = document.createElement("div");
        // Title
        const title = document.createElement("h3");
        title.textContent = "Keyboard Shortcuts";
        title.style.margin = "0 0 15px 0";
        title.style.fontSize = "16px";
        container.appendChild(title);
        // Shortcuts table
        const table = document.createElement("table");
        table.style.width = "100%";
        table.style.borderCollapse = "collapse";
        // Table styles
        const tableStyles = {
            th: {
                textAlign: "left",
                padding: "8px 5px",
                borderBottom: "1px solid #444",
                fontSize: "14px",
                fontWeight: "bold",
            },
            td: {
                padding: "8px 5px",
                borderBottom: "1px solid #333",
                fontSize: "13px",
            },
            kbd: {
                background: "#f7f7f7",
                color: "#000",
                border: "1px solid #555",
                borderRadius: "3px",
                padding: "2px 5px",
                fontSize: "12px",
                fontFamily: "monospace",
            },
        };

        // Create header row
        const headerRow = document.createElement("tr");
        const shortcutHeader = document.createElement("th");
        shortcutHeader.textContent = "Shortcut";
        Object.assign(shortcutHeader.style, tableStyles.th);
        headerRow.appendChild(shortcutHeader);

        const actionHeader = document.createElement("th");
        actionHeader.textContent = "Action";
        Object.assign(actionHeader.style, tableStyles.th);
        headerRow.appendChild(actionHeader);

        table.appendChild(headerRow);

        // Shortcut data
        const shortcuts = [
            { keys: ["Ctrl", "F1"], action: "Open 8chanSS settings" },
            { keys: ["Tab"], action: "Target Quick Reply text area" },
            { keys: ["R"], action: "Refresh Thread (5 sec. cooldown)" },
            { keys: ["Ctrl", "Q"], action: "Toggle Quick Reply" },
            { keys: ["Ctrl", "Enter"], action: "Submit post" },
            { keys: ["Escape"], action: "Clear QR textarea and hide all dialogs" },
            { keys: ["ALT", "W"], action: "Watch Thread" },
            { keys: ["SHIFT", "T"], action: "Toggle Quote Threading" },
            { keys: ["SHIFT", "CLICK"], action: "Hide Thread in Catalog" },
            { keys: ["CTRL", "UP/DOWN"], action: "Scroll between Your Replies" },
            { keys: ["CTRL", "SHIFT", "UP/DOWN"], action: "Scroll between Replies to You" },
            { keys: ["Ctrl", "B"], action: "Bold text" },
            { keys: ["Ctrl", "I"], action: "Italic text" },
            { keys: ["Ctrl", "U"], action: "Underline text" },
            { keys: ["Ctrl", "S"], action: "Spoiler text" },
            { keys: ["Ctrl", "D"], action: "Srz Bizniz text" },
            { keys: ["Ctrl", "M"], action: "Moe text" },
            { keys: ["Alt", "C"], action: "Code block" },
        ];

        // Create rows for each shortcut
        shortcuts.forEach((shortcut) => {
            const row = document.createElement("tr");

            // Shortcut cell
            const shortcutCell = document.createElement("td");
            Object.assign(shortcutCell.style, tableStyles.td);

            // Create kbd elements for each key
            shortcut.keys.forEach((key, index) => {
                const kbd = document.createElement("kbd");
                kbd.textContent = key;
                Object.assign(kbd.style, tableStyles.kbd);
                shortcutCell.appendChild(kbd);

                // Add + between keys
                if (index < shortcut.keys.length - 1) {
                    const plus = document.createTextNode(" + ");
                    shortcutCell.appendChild(plus);
                }
            });

            row.appendChild(shortcutCell);

            // Action cell
            const actionCell = document.createElement("td");
            actionCell.textContent = shortcut.action;
            Object.assign(actionCell.style, tableStyles.td);
            row.appendChild(actionCell);

            table.appendChild(row);
        });

        container.appendChild(table);

        // Add note about BBCode shortcuts
        const note = document.createElement("p");
        note.textContent =
            "Text formatting shortcuts work when text is selected or when inserting at cursor position.";
        note.style.fontSize = "12px";
        note.style.marginTop = "15px";
        note.style.opacity = "0.7";
        note.style.fontStyle = "italic";
        container.appendChild(note);

        return container;
    }

    // Hook up the icon to open/close the menu
    if (link) {
        link.style.cursor = "pointer";
        link.title = "Open 8chanSS settings";
        link.addEventListener("click", async function (e) {
            e.preventDefault();
            let menu = await createSettingsMenu();
            menu.style.display = menu.style.display === "none" ? "block" : "none";
        });
    }
    //////// MENU END ///////////////////////////////////////////////////////////////////////////////////////////////////////////////

    ///////// KEYBOARD SHORTCUTS ////////////////////////////////////////////////////////////////////////////////////////////////////
    // --- Global toggle for all shortcuts ---
    async function shortcutsGloballyEnabled() {
        return await getSetting("enableShortcuts");
    }

    // --- BBCODE Combination keys and Tags ---
    const bbCodeCombinations = new Map([
        ["s", ["[spoiler]", "[/spoiler]"]],
        ["b", ["'''", "'''"]],
        ["u", ["__", "__"]],
        ["i", ["''", "''"]],
        ["d", ["==", "=="]],           // Srz Biznizz
        ["m", ["[moe]", "[/moe]"]],
        ["c", ["[code]", "[/code]"]],
    ]);

    // Helper function for applying BBCode
    function applyBBCode(textBox, key) {
        const [openTag, closeTag] = bbCodeCombinations.get(key);
        const { selectionStart, selectionEnd, value } = textBox;

        if (selectionStart === selectionEnd) {
            // No selection: insert empty tags and place cursor between them
            const before = value.slice(0, selectionStart);
            const after = value.slice(selectionEnd);
            const newCursor = selectionStart + openTag.length;
            textBox.value = before + openTag + closeTag + after;
            textBox.selectionStart = textBox.selectionEnd = newCursor;
        } else {
            // Replace selected text with tags around it
            const before = value.slice(0, selectionStart);
            const selected = value.slice(selectionStart, selectionEnd);
            const after = value.slice(selectionEnd);
            textBox.value = before + openTag + selected + closeTag + after;
            // Keep selection around the newly wrapped text
            textBox.selectionStart = selectionStart + openTag.length;
            textBox.selectionEnd = selectionEnd + openTag.length;
        }

        // Dispatch an input event so QR listener is notified
        textBox.dispatchEvent(new Event('input', { bubbles: true }));
    }

    // --- Feature: Scroll between posts functionality ---
    let lastHighlighted = null;
    let lastType = null; // "own" or "reply"
    let lastRefreshTime = 0; // Refresh cooldown

    function getEligiblePostCells(isOwnReply) {
        // Find all .postCell and .opCell that contain at least one matching anchor
        const selector = isOwnReply
            ? '.postCell:has(a.youName), .opCell:has(a.youName)'
            : '.postCell:has(a.quoteLink.you), .opCell:has(a.quoteLink.you)';
        return Array.from(document.querySelectorAll(selector));
    }

    function scrollToReply(isOwnReply = true, getNextReply = true) {
        const postCells = getEligiblePostCells(isOwnReply);
        if (!postCells.length) return;

        // Determine current index in postCells for navigation
        let currentIndex = -1;
        const expectedType = isOwnReply ? "own" : "reply";

        // Try to use lastHighlighted if it matches the current navigation type and is still present
        if (
            lastType === expectedType &&
            lastHighlighted
        ) {
            const container = lastHighlighted.closest('.postCell, .opCell');
            currentIndex = postCells.indexOf(container);
        }
        // If lastHighlighted is not valid, find the first cell below the viewport middle
        if (currentIndex === -1) {
            const viewportMiddle = window.innerHeight / 2;
            currentIndex = postCells.findIndex(cell => {
                const rect = cell.getBoundingClientRect();
                return rect.top + rect.height / 2 > viewportMiddle;
            });
            // If none found, set to -1 (before first) or postCells.length (after last) depending on direction
            if (currentIndex === -1) {
                currentIndex = getNextReply ? -1 : postCells.length;
            }
        }

        // Determine target index
        const targetIndex = getNextReply ? currentIndex + 1 : currentIndex - 1;
        if (targetIndex < 0 || targetIndex >= postCells.length) return;

        const postContainer = postCells[targetIndex];
        if (postContainer) {
            postContainer.scrollIntoView({ behavior: "smooth", block: "center" });

            // Remove highlight from previous post
            if (lastHighlighted) {
                lastHighlighted.classList.remove('target-highlight');
            }

            // Find the anchor id for this post (usually something like id="p123456")
            let anchorId = null;
            let anchorElem = postContainer.querySelector('[id^="p"]');
            if (anchorElem && anchorElem.id) {
                anchorId = anchorElem.id;
            } else if (postContainer.id) {
                anchorId = postContainer.id;
            }

            // Update the URL hash to simulate :target
            if (anchorId && location.hash !== '#' + anchorId) {
                history.replaceState(null, '', '#' + anchorId);
            }

            // Add highlight class to .innerPost
            const innerPost = postContainer.querySelector('.innerPost');
            if (innerPost) {
                innerPost.classList.add('target-highlight');
                lastHighlighted = innerPost;
            } else {
                lastHighlighted = null;
            }

            // Track type for next navigation
            lastType = isOwnReply ? "own" : "reply";
        }
    }

    // Remove highlight and update on hash change
    window.addEventListener('hashchange', () => {
        if (lastHighlighted) {
            lastHighlighted.classList.remove('target-highlight');
            lastHighlighted = null;
        }
        const hash = location.hash.replace('#', '');
        if (hash) {
            const postElem = document.getElementById(hash);
            if (postElem) {
                const innerPost = postElem.querySelector('.innerPost');
                if (innerPost) {
                    innerPost.classList.add('target-highlight');
                    lastHighlighted = innerPost;
                }
            }
        }
    });

    // --- Consolidated Keyboard Shortcuts ---
    document.addEventListener("keydown", async function (event) {
        // Check if global toggle is enabled first
        if (!(await shortcutsGloballyEnabled())) return;

        // Don't trigger shortcuts in input/textarea/contenteditable except for QR textarea
        const active = document.activeElement;
        if (
            active &&
            event.key !== "Tab" && // Allow Tab key to pass through
            (active.tagName === "INPUT" ||
                active.tagName === "TEXTAREA" ||
                active.isContentEditable)
        ) {
            return;
        }

        // Open 8chanSS menu (CTRL + F1)
        if (event.ctrlKey && event.key === "F1") {
            event.preventDefault();
            let menu = document.getElementById("8chanSS-menu") || (await createSettingsMenu());
            menu.style.display = menu.style.display === "none" || menu.style.display === "" ? "block" : "none";
            return;
        }

        // QR (CTRL + Q)
        if (event.ctrlKey && (event.key === "q" || event.key === "Q")) {
            event.preventDefault();
            const hiddenDiv = document.getElementById("quick-reply");
            if (!hiddenDiv) return;

            // Toggle QR
            const isHidden = hiddenDiv.style.display === "none" || hiddenDiv.style.display === "";
            hiddenDiv.style.display = isHidden ? "block" : "none";

            // Focus the textarea after a small delay to ensure it's visible
            if (isHidden) {
                setTimeout(() => {
                    const textarea = document.getElementById("qrbody");
                    if (textarea) textarea.focus();
                }, 50);
            }
            return;
        }

        // Tab key: focus #qrbody if not already focused, else focus #QRfieldCaptcha
        if (
            event.key === "Tab" &&
            !event.ctrlKey &&
            !event.altKey &&
            !event.metaKey
        ) {
            const qrbody = document.getElementById("qrbody");
            const captcha = document.getElementById("QRfieldCaptcha");

            if (qrbody) {
                if (document.activeElement === qrbody && captcha) {
                    // If focus is on qrbody and captcha exists, focus captcha
                    event.preventDefault();
                    captcha.focus();
                } else if (document.activeElement === captcha) {
                    // If focus is on captcha, cycle back to qrbody
                    event.preventDefault();
                    qrbody.focus();
                } else if (document.activeElement !== qrbody) {
                    // If focus is anywhere else, focus qrbody
                    event.preventDefault();
                    qrbody.focus();
                }
            }
            return;
        }

        // (R key): refresh thread page with 5 sec cooldown
        if (event.key === "r" || event.key === "R") {
            const isThread = window.pageType?.isThread;
            const isCatalog = window.pageType?.isCatalog;
            const threadRefreshBtn = document.getElementById("refreshButton");
            const catalogRefreshBtn = document.getElementById("catalogRefreshButton");
            const now = Date.now();

            if (
                (isThread && threadRefreshBtn) ||
                (isCatalog && catalogRefreshBtn)
            ) {
                if (now - lastRefreshTime >= 5000) {
                    event.preventDefault();
                    if (isThread && threadRefreshBtn) {
                        threadRefreshBtn.click();
                    } else if (isCatalog && catalogRefreshBtn) {
                        catalogRefreshBtn.click();
                    }
                    lastRefreshTime = now;
                } else {
                    event.preventDefault();
                }
                return;
            }
        }

        // --- Shift+T to toggle quote threading ---
        if (event.shiftKey && !event.ctrlKey && !event.altKey && (event.key === "t" || event.key === "T")) {
            event.preventDefault();

            const current = await getSetting("quoteThreading");
            const newValue = !current;
            await setSetting("quoteThreading", newValue);

            // Show a quick notification
            try {
                const msg = `Quote threading <b>${newValue ? "enabled" : "disabled"}</b>`;
                const color = newValue ? 'blue' : 'black';
                callPageToast(msg, color, 1300);
            } catch { }
            // Reload to apply the change after 1.4 secs
            setTimeout(() => window.location.reload(), 1400);
            return;
        }

        // (ESC) Clear textarea and hide all dialogs
        if (event.key === "Escape") {
            // Clear the textarea
            const textarea = document.getElementById("qrbody");
            if (textarea) textarea.value = "";

            // Hide QR
            const quickReply = document.getElementById("quick-reply");
            if (quickReply) quickReply.style.display = "none";
            // Hide TW            
            const threadWatcher = document.getElementById("watchedMenu");
            if (threadWatcher) threadWatcher.style.display = "none";
            return;
        }

        // Scroll between posts with CTRL+Arrow keys
        if (event.ctrlKey && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
            event.preventDefault();
            const isOwnReply = !event.shiftKey;
            const isNext = event.key === 'ArrowDown';
            scrollToReply(isOwnReply, isNext);
            return;
        }

        // Watch Thread on ALT+W Keyboard Shortcut
        if (
            event.altKey &&
            (event.key === "w" || event.key === "W")
        ) {
            event.preventDefault();
            const btn = document.querySelector(".watchButton");
            if (btn && !btn.classList.contains("watched-active")) {
                btn.click();
                setTimeout(() => {
                    btn.classList.add("watched-active");
                }, 100);
            }
            return;
        }
    });

    // (CTRL + Enter) and BBCodes - Only for QR textarea
    const bbTextareas = document.querySelectorAll("#qrbody, #fieldMessage");

    // Check if global toggle is enabled first
    if (!(await shortcutsGloballyEnabled())) {
        return;
    } else bbTextareas.forEach((textarea) => {
        textarea.addEventListener("keydown", async function (event) {
            if (event.ctrlKey && event.key === "Enter") {
                event.preventDefault();
                const submitButton = document.getElementById("qrbutton");
                if (submitButton) {
                    submitButton.click();
                    if (await getSetting("watchThreadOnReply")) {
                        setTimeout(() => {
                            const btn = document.querySelector(".watchButton");
                            if (btn && !btn.classList.contains("watched-active")) {
                                btn.click();
                                setTimeout(() => {
                                    btn.classList.add("watched-active");
                                }, 100);
                            }
                        }, 500);
                    }
                }
            }

            // BBCODE Combination keys and Tags - Keep with the textarea
            const key = event.key.toLowerCase();

            // Special case: alt+c for [code] tag
            if (key === "c" && event.altKey && !event.ctrlKey && bbCodeCombinations.has(key)) {
                event.preventDefault();
                applyBBCode(event.target, key);
                return;
            }

            // All other tags: ctrl+key
            if (event.ctrlKey && !event.altKey && bbCodeCombinations.has(key) && key !== "c") {
                event.preventDefault();
                applyBBCode(event.target, key);
                return;
            }
        });
    });

    // --- Feature: Hide catalog threads with SHIFT+click, per-board storage ---
    function featureCatalogHiding() {
        const STORAGE_KEY = "8chanSS_hiddenCatalogThreads";
        let showHiddenMode = false;

        // Extract board name and thread number from a .catalogCell
        function getBoardAndThreadNumFromCell(cell) {
            const link = cell.querySelector("a.linkThumb[href*='/res/']");
            if (!link) return { board: null, threadNum: null };
            const match = link.getAttribute("href").match(/^\/([^/]+)\/res\/(\d+)\.html/);
            if (!match) return { board: null, threadNum: null };
            return { board: match[1], threadNum: match[2] };
        }

        // Load hidden threads object from storage
        async function loadHiddenThreadsObj() {
            const raw = await GM.getValue(STORAGE_KEY, "{}");
            try {
                const obj = JSON.parse(raw);
                return typeof obj === "object" && obj !== null ? obj : {};
            } catch {
                return {};
            }
        }

        // Save hidden threads object to storage
        async function saveHiddenThreadsObj(obj) {
            await GM.setValue(STORAGE_KEY, JSON.stringify(obj));
        }

        // Hide all catalog cells whose thread numbers are in the hidden list for this board
        async function applyHiddenThreads() {
            const hiddenThreadsObjRaw = await GM.getValue(STORAGE_KEY, "{}");
            let hiddenThreadsObj;
            try {
                hiddenThreadsObj = JSON.parse(hiddenThreadsObjRaw);
                if (typeof hiddenThreadsObj !== "object" || hiddenThreadsObj === null) hiddenThreadsObj = {};
            } catch {
                hiddenThreadsObj = {};
            }

            // Get catalog filters if enabled
            let catalogFilters = [];
            const enableCatalogFiltering = await getSetting("enableThreadHiding_enableCatalogFiltering");
            if (enableCatalogFiltering) {
                const filtersObj = await getStoredObject("8chanSS_catalogFilters");
                catalogFilters = Object.values(filtersObj || {});
            }

            // Loop through all catalog cells
            document.querySelectorAll(".catalogCell").forEach(cell => {
                const { board, threadNum } = getBoardAndThreadNumFromCell(cell);
                if (!board || !threadNum) return;
                const hiddenThreads = hiddenThreadsObj[board] || [];

                // Check if thread should be filtered based on catalog filters
                let shouldFilter = false;
                if (catalogFilters.length > 0) {
                    const subject = cell.querySelector('.labelSubject')?.textContent || '';
                    const message = cell.querySelector('.divMessage')?.textContent || '';
                    const threadText = (subject + ' ' + message).toLowerCase();
                    
                    for (const filter of catalogFilters) {
                        const word = filter.word.toLowerCase();
                        const boards = filter.boards.toLowerCase().split(',').map(b => b.trim());
                        
                        // Check if word matches thread text using wildcard patterns
                        let matches = false;
                        if (word.includes('*')) {
                            // Handle wildcard patterns
                            if (word === '*') {
                                // Just * matches everything
                                matches = true;
                            } else if (word.startsWith('*') && word.endsWith('*')) {
                                // *word* - contains the pattern
                                const pattern = word.slice(1, -1);
                                matches = threadText.includes(pattern);
                            } else if (word.startsWith('*')) {
                                // *word - ends with the pattern
                                const pattern = word.slice(1);
                                matches = threadText.endsWith(pattern) || threadText.includes(' ' + pattern);
                            } else if (word.endsWith('*')) {
                                // word* - starts with the pattern
                                const pattern = word.slice(0, -1);
                                matches = threadText.startsWith(pattern) || threadText.includes(pattern + ' ');
                            }
                        } else {
                            // No wildcards - exact match
                            matches = threadText.includes(word);
                        }
                        
                        if (matches) {
                            // Check if board restriction applies
                            if (boards.length === 0 || boards[0] === '' || boards.includes(board)) {
                                shouldFilter = true;
                                break;
                            }
                        }
                    }
                }

                if (typeof showHiddenMode !== "undefined" && showHiddenMode) {
                    // Show only hidden threads, hide all others
                    if (hiddenThreads.includes(threadNum) || shouldFilter) {
                        cell.style.display = "";
                        cell.classList.add("ss-unhide-thread");
                        cell.classList.remove("ss-hidden-thread");
                    } else {
                        cell.style.display = "none";
                        cell.classList.remove("ss-unhide-thread", "ss-hidden-thread");
                    }
                } else {
                    // Normal mode: hide hidden threads and filtered threads, show all others
                    if (hiddenThreads.includes(threadNum) || shouldFilter) {
                        cell.style.display = "none";
                        cell.classList.add("ss-hidden-thread");
                        cell.classList.remove("ss-unhide-thread");
                    } else {
                        cell.style.display = "";
                        cell.classList.remove("ss-hidden-thread", "ss-unhide-thread");
                    }
                }
            });
        }

        // Event handler for SHIFT+click to hide/unhide a thread
        async function onCatalogCellClick(e) {
            const cell = e.target.closest(".catalogCell");
            if (!cell) return;

            // Only act on shift+left-click
            if (e.shiftKey && e.button === 0) {
                const { board, threadNum } = getBoardAndThreadNumFromCell(cell);
                if (!board || !threadNum) return;

                let hiddenThreadsObj = await loadHiddenThreadsObj();
                if (!hiddenThreadsObj[board]) hiddenThreadsObj[board] = [];
                let hiddenThreads = hiddenThreadsObj[board];

                if (showHiddenMode) {
                    // Unhide: remove from hidden list
                    hiddenThreads = hiddenThreads.filter(num => num !== threadNum);
                    hiddenThreadsObj[board] = hiddenThreads;
                    await saveHiddenThreadsObj(hiddenThreadsObj);
                    await applyHiddenThreads();
                } else {
                    // Hide: add to hidden list
                    if (!hiddenThreads.includes(threadNum)) {
                        hiddenThreads.push(threadNum);
                        hiddenThreadsObj[board] = hiddenThreads;
                    }
                    await saveHiddenThreadsObj(hiddenThreadsObj);
                    cell.style.display = "none";
                    cell.classList.add("ss-hidden-thread");
                }
                e.preventDefault();
                e.stopPropagation();
            }
        }

        // Show all hidden threads in the catalog
        async function showAllHiddenThreads() {
            showHiddenMode = true;
            await applyHiddenThreads();
            // Change button text to "Hide Hidden"
            const btn = document.getElementById("ss-show-hidden-btn");
            if (btn) btn.textContent = "Hide Hidden";
        }

        // Hide all hidden threads again
        async function hideAllHiddenThreads() {
            showHiddenMode = false;
            await applyHiddenThreads();
            // Change button text to "Show Hidden"
            const btn = document.getElementById("ss-show-hidden-btn");
            if (btn) btn.textContent = "Show Hidden";
        }

        // Toggle show/hide hidden threads
        async function toggleShowHiddenThreads() {
            if (showHiddenMode) {
                await hideAllHiddenThreads();
            } else {
                await showAllHiddenThreads();
            }
        }

        // Add the Show Hidden button
        function addShowHiddenButton() {
            if (document.getElementById("ss-show-hidden-btn")) return;
            const refreshBtn = document.querySelector("#catalogRefreshButton");
            if (!refreshBtn) return;
            const btn = document.createElement("button");
            btn.id = "ss-show-hidden-btn";
            btn.className = "catalogLabel";
            btn.type = "button";
            btn.textContent = "Show Hidden";
            btn.style.marginRight = "8px";
            btn.addEventListener("click", toggleShowHiddenThreads);
            refreshBtn.parentNode.insertBefore(btn, refreshBtn);
        }

        // Attach event listeners and apply hidden threads on catalog load
        function hideThreadsOnRefresh() {
            // Only run on catalog pages
            if (!window.pageType?.isCatalog) return;

            // Add the Show Hidden button
            onReady(addShowHiddenButton);

            // Apply hidden threads on load
            onReady(applyHiddenThreads);

            // Scope event listener to catalog container only
            const catalogContainer = document.querySelector(".catalogWrapper, .catalogDiv");
            if (catalogContainer) {
                catalogContainer.addEventListener("click", onCatalogCellClick, true);
            }
        }
        hideThreadsOnRefresh();

        // Use the observer registry for .catalogDiv
        const catalogDivObs = observeSelector('.catalogDiv', { childList: true, subtree: false });
        if (catalogDivObs) {
            const debouncedApply = debounce(applyHiddenThreads, 50);
            catalogDivObs.addHandler(function catalogHidingHandler() {
                debouncedApply();
            });
        }
    }

    ////// KEYBOARD END /////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // --- Misc Fixes ---

    // Captcha input no history
    (function noCaptchaHistory() {
        const captchaInput = document.getElementById("QRfieldCaptcha");
        if (captchaInput) {
            captchaInput.autocomplete = "off";
        }
    })();

    // Move file uploads below OP title
    (function moveFileUploadsBelowOp() {
        if (window.pageType?.isCatalog) {
            return;
        } else if (opHeadTitle && innerOP) {
            innerOP.insertBefore(opHeadTitle, innerOP.firstChild);
        }
    })();

    // --- Version notification ---
    async function updateNotif() {
        const VERSION_KEY = "8chanSS_version";
        let storedVersion = null;
        try {
            storedVersion = await GM.getValue(VERSION_KEY, null);
        } catch (err) {
            console.error("[8chanSS] Failed to get stored script version:", err);
        }

        if (storedVersion !== VERSION) {
            // Only notify if this isn't the first install (i.e., storedVersion is not null)
            if (storedVersion !== null) {
                let tries = 0;
                while (typeof window.callPageToast !== "function" && tries < 20) {
                    await new Promise(res => setTimeout(res, 100));
                    tries++;
                }
                if (typeof window.callPageToast === "function") {
                    window.callPageToast(
                        `8chanSS has updated to v${VERSION}. Check out the <b><a href="https://github.com/otacoo/8chanSS/blob/main/CHANGELOG.md" target="_blank">changelog</a></b>.`,
                        "blue",
                        15000
                    );
                }
            }
            try {
                await GM.setValue(VERSION_KEY, VERSION);
            } catch (err) {
                console.error("[8chanSS] Failed to store script version:", err);
            }
        }
    }
});