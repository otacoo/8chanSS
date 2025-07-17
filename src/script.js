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

    // Disconnect on unload
    window.addEventListener('beforeunload', () => observer.disconnect());

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
        is8chan: /^8chan\.(se|moe)$/.test(currentHost),
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
            enableThreadImageHover: { label: "Thread Image Hover", default: true },
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
            enablePNGstop: { label: "Prevent animated PNG images from playing.", default: false },
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
            quoteThreading: { label: "Quote Threading", default: false },
            enableHashNav: { label: "Hash Navigation", default: false },
            threadStatsInHeader: { label: "Thread Stats in Header", default: false },
            watchThreadOnReply: { label: "Watch Thread on Reply", default: true },
            scrollToBottom: { label: "Don't Scroll to Bottom on Reply", default: true },
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
            enableThreadHiding: { label: "Enable Thread Hiding (Shift + Click to hide/unhide a thread)", default: false },
            openCatalogThreadNewTab: { label: "Always Open Threads in New Tab", default: false },
            enableLastFifty: { label: "Show Last 50 Posts button", default: false }
        },
        styling: {
            _stylingSiteTitle: { type: "title", label: ":: Site Styling" },
            _stylingSection1: { type: "separator" },
            hideAnnouncement: { label: "Hide Announcement", default: false },
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
            hideDefaultBL: { label: "Hide Default Board List", default: true },
            hideNoCookieLink: { label: "Hide No Cookie? Link", default: false },
            hideJannyTools: { label: "Hide Janitor Forms", default: false },
            _stylingThreadTitle: { type: "title", label: ":: Thread Styling" },
            _stylingSection2: { type: "separator" },
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
            enhanceYoutube: {
                label: "Enhanced Youtube Links",
                default: true,
                subOptions: {
                    ytThumbs: {
                        label: "Show Thumbnails on Hover",
                        default: true,
                    }
                }
            },
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
            _miscelFilterTitle: { type: "title", label: ":: Filtering" },
            _miscelSection1: { type: "separator" },
            enableHidingMenu: {
                label: "Alternative post hiding menu & features",
                default: false,
                subOptions: {
                    recursiveHide: {
                        label: "Recursive hide/filter/name+ (hide replies to replies)",
                        default: false
                    }
                }
            },
            hideHiddenPostStub: { label: "Hide Stubs of Hidden Posts", default: false, }
        }
    };

    Object.freeze(scriptSettings); // Prevent accidental mutation of original settings

    // Flatten settings for backward compatibility with existing functions
    function flattenSettings() {
        const result = {};
        Object.keys(scriptSettings).forEach((category) => {
            Object.keys(scriptSettings[category]).forEach((key) => {
                if (key.startsWith('_')) return;
                result[key] = scriptSettings[category][key];
                const subOptions = scriptSettings[category][key].subOptions;
                if (!subOptions || typeof subOptions !== "object") return;
                Object.keys(subOptions).forEach((subKey) => {
                    const fullKey = `${key}_${subKey}`;
                    result[fullKey] = subOptions[subKey];
                });
            });
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
            hideDefaultBL: "hide-defaultBL",
            hidePanelMessage: "hide-panelmessage",
            highlightOnYou: "highlight-yous",
            threadHideCloseBtn: "hide-close-btn",
            hideCheckboxes: "hide-checkboxes",
            hideNoCookieLink: "hide-nocookie",
            autoExpandTW: "auto-expand-tw",
            hideJannyTools: "hide-jannytools",
            opBackground: "op-background",
            blurSpoilers: "ss-blur-spoilers",
            alwaysShowIdCount: "show-ID-count"
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
        { key: "scrollToBottom", fn: preventFooterScrollIntoView },
        { key: "enableThreadHiding", fn: featureCatalogHiding },
        { key: "switchTimeFormat", fn: featureLabelCreated12h },
        { key: "enableIdFilters", fn: featureIdFiltering },
        { key: "enhanceYoutube", fn: enhanceYouTubeLinks },
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
        { key: "enableHidingMenu", fn: featureCustomPostHideMenu },
        { key: "alwaysShowIdCount", fn: featureShowIDCount },
        { key: "enablePNGstop", fn: featureAPNGStop },
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
            localStorage.removeItem("hoveringImage");
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

        const script = document.createElement('script');
        script.textContent = '(' + function (sanitizeToastHTML) {
            window.showGlobalToast = function (htmlMessage, color = "black", duration = 1200) {
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
                toast.style.padding = "2px 12px";
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
                closeBtn.onclick = function (e) {
                    e.stopPropagation();
                    if (toast.parentNode) toast.parentNode.removeChild(toast);
                    if (timeout1) clearTimeout(timeout1);
                    if (timeout2) clearTimeout(timeout2);
                };
                closeBtn.onmouseover = function () { closeBtn.style.opacity = "1"; };
                closeBtn.onmouseout = function () { closeBtn.style.opacity = "0.7"; };
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
            };
        } + ')(' + sanitizeToastHTML.toString() + ');';
        document.documentElement.appendChild(script);
        script.remove();

        // Helper for userscript context to call the global notification handler
        window.callPageToast = function (msg, color = 'black', duration = 1200) {
            const script = document.createElement('script');
            script.textContent = `window.showGlobalToast && window.showGlobalToast(${JSON.stringify(msg)}, ${JSON.stringify(color)}, ${duration});`;
            document.documentElement.appendChild(script);
            script.remove();
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
            const navboardsSpan = document.getElementById("navBoardsSpan");
            if (navboardsSpan) {
                const links = navboardsSpan.getElementsByTagName("a");
                const openInNewTab = await getSetting("enableHeaderCatalogLinks_openInNewTab");

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

        // Initial run
        appendCatalogToLinks();

        // Debounced handler for observer
        const debouncedAppend = debounce(appendCatalogToLinks, 100);

        // Use the observer registry for #navBoardsSpan
        const navboardsObs = observeSelector('#navBoardsSpan', { childList: true, subtree: true });
        if (navboardsObs) {
            navboardsObs.addHandler(function headerCatalogLinksHandler() {
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
            const thumbnailSrc = thumbNode.getAttribute("src");
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
                                    img.src = href;
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
                img.src = transformedSrc;

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
            const linksToProcess = Array.from(document.querySelectorAll("a.imgLink")).filter(link => pendingImgLinks.has(link));
            linksToProcess.forEach(link => processImgLink(link));
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
        document.querySelectorAll('a.linkThumb img, a.imgLink img').forEach(processThumb);

        // Observe dynamically added thumbs using helper
        const obs = observeSelector('body', { childList: true, subtree: true });
        if (obs) {
            obs.addHandler(function apngStopHandler(mutations) {
                for (const m of mutations) {
                    for (const node of m.addedNodes) {
                        if (node.nodeType !== 1) continue;
                        if (node.matches && node.matches('a.linkThumb img, a.imgLink img')) {
                            processThumb(node);
                        } else if (node.querySelectorAll) {
                            node.querySelectorAll('a.linkThumb img, a.imgLink img').forEach(processThumb);
                        }
                    }
                }
            });
        }
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
            const notification = cell.querySelector(".watchedCellLabel span.watchedNotification");
            if (!notification) return; // Skip if no notification

            const labelLink = cell.querySelector(".watchedCellLabel a");
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

            // Process notification text
            const notificationText = notification.textContent.trim();

            function styleMentionYou(labelLink, notification, totalReplies) {
                labelLink.style.color = "var(--board-title-color)";
                notification.style.color = "var(--board-title-color)";
                notification.textContent = ` (${totalReplies}) (You)`;
                notification.style.fontWeight = "bold";
            }

            function styleMentionNumber(notification, notificationText) {
                notification.textContent = ` (${notificationText})`;
                notification.style.color = "var(--link-color)";
                notification.style.fontWeight = "bold";
            }

            // Skip if already processed (starts with parenthesis)
            if (notificationText.startsWith("(") === true) {
                return;
            }

            // Case 1: Has "(you)" - format "2, 1 (you)"
            if (notificationText.includes("(you)") === true) {
                const parts = notificationText.split(", ");
                const totalReplies = parts[0];
                styleMentionYou(labelLink, notification, totalReplies);
            }
            // Case 2: Just a number - format "2"
            else if (/^\d+$/.test(notificationText)) {
                styleMentionNumber(notification, notificationText);
            }

            // Mark as processed
            notification.dataset.processed = "true";
        });
    }

    // Initial highlight on page load
    highlightMentions();

    // --- Highlight active watched thread in thread watcher ---
    function highlightActiveWatchedThread() {
        const currentPath = window.pageType?.path;
        if (!currentPath) return;
        document.querySelectorAll('.watchedCellLabel').forEach(label => {
            const link = label.querySelector('a[href]');
            if (!link) return;
            // Stip anchors to compare
            const watchedPath = link.getAttribute('href').replace(/#.*$/, '');
            if (watchedPath === currentPath) {
                label.classList.add('ss-active');
            } else {
                label.classList.remove('ss-active');
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

        // Update the watch button's class to reflect watched state
        function updateWatchButtonClass() {
            const btn = getWatchButton();
            if (!btn) return;
            if (btn.classList.contains("watched-active")) {
                btn.classList.add("watched-active");
            } else {
                btn.classList.remove("watched-active");
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

        // On page load, sync the watch button UI
        updateWatchButtonClass();

        // Keep UI in sync when user manually clicks the watch button
        const btn = getWatchButton();
        if (btn) {
            // Remove any previous handler to avoid duplicates
            btn.removeEventListener("click", btn._updateWatchHandler || (() => { }));
            btn._updateWatchHandler = () => setTimeout(updateWatchButtonClass, 100);
            btn.addEventListener("click", btn._updateWatchHandler);
        }
    }

    // --- Feature: Pin Thread Watcher ---
    async function featureAlwaysShowTW() {
        if (!(await getSetting("alwaysShowTW"))) return;
        if ((await getSetting("alwaysShowTW_noPinInCatalog")) && window.pageType.isCatalog) return;

        function showThreadWatcher() {
            const watchedMenu = document.getElementById("watchedMenu");
            if (watchedMenu) {
                watchedMenu.style.display = "flex";
            }
        }

        showThreadWatcher();
    }

    // --- Feature: Mark All Threads as Read Button ---
    (function markAllThreadsAsRead() {
        const handleDiv = document.querySelector('#watchedMenu > div.handle');
        if (!handleDiv) return;
        // Check if the button already exists to avoid duplicates
        if (handleDiv.querySelector('.watchedCellDismissButton.markAllRead')) return;

        // Create the "Mark all threads as read" button
        const btn = document.createElement('a');
        btn.className = 'watchedCellDismissButton glowOnHover coloredIcon markAllRead';
        btn.title = 'Mark all threads as read';
        btn.style.float = 'right';
        btn.style.paddingTop = '3px';

        // Helper to check if there are unread threads
        function hasUnreadThreads() {
            const watchedMenu = document.querySelector('#watchedMenu > div.floatingContainer');
            if (!watchedMenu) return false;
            return watchedMenu.querySelectorAll('td.watchedCellDismissButton.glowOnHover.coloredIcon[title="Mark as read"]').length > 0;
        }

        // Helper to update button state
        function updateButtonState() {
            if (hasUnreadThreads()) {
                btn.style.opacity = '1';
                btn.style.pointerEvents = 'auto';
                btn.title = 'Mark all threads as read';
            } else {
                btn.style.opacity = '0.5';
                btn.style.pointerEvents = 'none';
                btn.title = 'No unread threads';
            }
        }

        // Reusable function to find and click all 'Mark as read' buttons
        function clickAllMarkAsReadButtons(watchedMenu) {
            const markButtons = watchedMenu.querySelectorAll('td.watchedCellDismissButton.glowOnHover.coloredIcon[title="Mark as read"]');
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
                const watchedMenu = document.querySelector('#watchedMenu > div.floatingContainer');
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

        // Append the button as the last child of div.handle
        handleDiv.appendChild(btn);

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
            const markAllBtn = e.target.closest('.watchedCellDismissButton.markAllRead');
            if (markAllBtn) {
                e.preventDefault();
                if (markAllBtn.style.pointerEvents === 'none' || markAllBtn.dataset.processing === 'true') return;
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

    // --- Feature: Enhanced Youtube links ---
    async function enhanceYouTubeLinks() {
        // Only run on thread or index pages
        if (!(window.pageType?.isThread || window.pageType?.isIndex)) {
            return;
        }
        // Check if thumbnail hover is enabled
        const ytThumbsEnabled = await getSetting("enhanceYoutube_ytThumbs");
        // Title cache
        const ytTitleCache = {};
        const MAX_CACHE_SIZE = 350;
        const ORDER_KEY = "_order";
        const TRACKING_PARAMS = [
            "si", "feature", "ref", "fsi", "source",
            "utm_source", "utm_medium", "utm_campaign", "gclid", "gclsrc", "fbclid"
        ];

        // Thumbnail cache (videoId -> dataURL or null)
        const ytThumbCache = {};

        // Try to load cache and order from localStorage
        function loadCache() {
            try {
                const data = localStorage.getItem('ytTitleCache');
                if (data) {
                    const parsed = JSON.parse(data);
                    Object.assign(ytTitleCache, parsed);
                    if (!Array.isArray(ytTitleCache[ORDER_KEY])) {
                        ytTitleCache[ORDER_KEY] = [];
                    }
                } else {
                    ytTitleCache[ORDER_KEY] = [];
                }
            } catch (e) {
                ytTitleCache[ORDER_KEY] = [];
            }
        }
        function saveCache() {
            try {
                localStorage.setItem('ytTitleCache', JSON.stringify(ytTitleCache));
            } catch (e) { }
        }
        loadCache();

        // Helper to extract YouTube video ID from URL
        function getYouTubeId(url) {
            try {
                // youtu.be short links
                const u = new URL(url);
                if (u.hostname === 'youtu.be') {
                    return u.pathname.slice(1);
                }
                // Standard watch links
                if (u.hostname.endsWith('youtube.com')) {
                    if (u.pathname === '/watch') {
                        return u.searchParams.get('v');
                    }
                    // /live/VIDEOID or /embed/VIDEOID or /shorts/VIDEOID
                    const liveMatch = u.pathname.match(/^\/(live|embed|shorts)\/([a-zA-Z0-9_-]{11})/);
                    if (liveMatch) {
                        return liveMatch[2];
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
                saveCache();
                return ytTitleCache[cleanId];
            }
            try {
                const r = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${cleanId}&format=json`);
                if (!r.ok) return null;
                const data = await r.json();
                const title = data ? data.title : null;
                if (title) {
                    ytTitleCache[cleanId] = title;
                    ytTitleCache[ORDER_KEY].push(cleanId);
                    while (ytTitleCache[ORDER_KEY].length > MAX_CACHE_SIZE) {
                        const oldest = ytTitleCache[ORDER_KEY].shift();
                        delete ytTitleCache[oldest];
                    }
                    saveCache();
                }
                return title;
            } catch {
                return null;
            }
        }

        // Fetch as data URL using GM.xmlHttpRequest
        async function fetchAsDataURL(url) {
            return new Promise((resolve) => {
                GM.xmlHttpRequest({
                    method: "GET",
                    url: url,
                    responseType: "blob",
                    timeout: 8000,
                    onload: (response) => {
                        if (response.status === 200 && response.response) {
                            const reader = new FileReader();
                            reader.onloadend = () => resolve(reader.result);
                            reader.onerror = () => resolve(null);
                            reader.readAsDataURL(response.response);
                        } else {
                            resolve(null);
                        }
                    },
                    onerror: () => resolve(null),
                    ontimeout: () => resolve(null)
                });
            });
        }

        // Thumbnail fetch with per-videoId cache and DOM safety
        async function fetchYouTubeThumbnailAsDataURL(videoId) {
            if (ytThumbCache.hasOwnProperty(videoId)) {
                return ytThumbCache[videoId];
            }
            const webpUrl = `https://i.ytimg.com/vi_webp/${videoId}/hqdefault.webp`;
            const jpgUrl = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

            let dataUrl = await fetchAsDataURL(webpUrl);
            if (!dataUrl) {
                dataUrl = await fetchAsDataURL(jpgUrl);
            }
            ytThumbCache[videoId] = dataUrl;
            return dataUrl;
        }

        // Show thumbnail on hover (CSP-safe, webp/jpg fallback)
        function addThumbnailHover(link, videoId) {
            if (link.dataset.ytThumbHover) return;
            link.dataset.ytThumbHover = "1";
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

                    const img = document.createElement('img');
                    img.style.display = 'block';
                    img.style.maxWidth = '280px';
                    img.style.maxHeight = '200px';
                    img.style.borderRadius = '3px';
                    img.alt = "YouTube thumbnail";
                    img.src = "data:image/gif;base64,R0lGODlhEAAQAPIAAP///wAAAMLCwkJCQv///wAAACH5BAEAAAMALAAAAAAQABAAAAIgjI+py+0Po5yUFQA7"; // spinner

                    lastImg = img;
                    const hoverToken = ++lastHoverToken;

                    fetchYouTubeThumbnailAsDataURL(videoId).then(dataUrl => {
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

        function processLinks(root = document) {
            root.querySelectorAll('a[href*="youtu"]').forEach(link => {
                if (link.dataset.ytEnhanced) return;
                const videoId = getYouTubeId(link.href);
                const cleanId = sanitizeYouTubeId(videoId);
                if (!cleanId) return;
                link.dataset.ytEnhanced = "1";

                // Strip tracking params from href
                const cleanUrl = stripTrackingParams(link.href);
                if (cleanUrl !== link.href) {
                    link.href = cleanUrl;
                }

                // Replace link text with SVG icon and video title
                fetchYouTubeTitle(cleanId).then(title => {
                    if (title) {
                        link.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" width="18" height="16" style="vertical-align:middle;margin-right:2px;"><path fill="#FF0000" d="M549.7 124.1c-6.3-23.7-24.9-42.4-48.6-48.6C456.5 64 288 64 288 64s-168.5 0-213.1 11.5c-23.7 6.3-42.4 24.9-48.6 48.6C16 168.5 16 256 16 256s0 87.5 10.3 131.9c6.3 23.7 24.9 42.4 48.6 48.6C119.5 448 288 448 288 448s168.5 0 213.1-11.5c23.7-6.3 42.4-24.9 48.6-48.6 10.3-44.4 10.3-131.9 10.3-131.9s0-87.5-10.3-131.9zM232 334.1V177.9L361 256 232 334.1z"/></svg><span></span> ${title}`;
                    }
                });

                // Add thumbnail hover only if enabled
                if (ytThumbsEnabled) {
                    addThumbnailHover(link, cleanId);
                }
            });
        }

        // Initial run
        processLinks(document);

        // Use the observer registry for #divThreads
        const divThreadsObs = observeSelector('#divThreads', { childList: true, subtree: true });
        if (divThreadsObs) {
            divThreadsObs.addHandler(function enhanceYoutubeLinksHandler(mutations) {
                for (const mutation of mutations) {
                    for (const addedNode of mutation.addedNodes) {
                        if (addedNode.nodeType === 1) {
                            processLinks(addedNode);
                        }
                    }
                }
            });
        }
    }

    // --- Feature: Convert to 12-hour format (AM/PM) ---
    function featureLabelCreated12h() {
        if (window.pageType?.isCatalog) {
            return;
        }

        function convertLabelCreatedSpan(span) {
            if (span.dataset.timeConverted === "1") return;

            const text = span.textContent;
            const match = text.match(/^(.+\))\s+(\d{2}):(\d{2}):(\d{2})$/);
            if (!match) return;

            const [_, datePart, hourStr, minStr, secStr] = match;
            let hour = parseInt(hourStr, 10);
            const min = minStr;
            const sec = secStr;
            const ampm = hour >= 12 ? 'PM' : 'AM';
            let hour12 = hour % 12;
            if (hour12 === 0) hour12 = 12;

            const newText = `${datePart} ${hour12}:${min}:${sec} ${ampm}`;
            span.textContent = newText;
            span.dataset.timeConverted = "1";
        }

        // Initial conversion on page load
        function convertAllLabelCreated(root = document) {
            const spans = root.querySelectorAll
                ? root.querySelectorAll('.labelCreated')
                : [];
            spans.forEach(convertLabelCreatedSpan);
        }

        convertAllLabelCreated();

        // Use the observer registry for .divPosts
        const divPostsObs = observeSelector('.divPosts', { childList: true, subtree: true });
        if (divPostsObs) {
            divPostsObs.addHandler(function labelCreated12hHandler(mutations) {
                for (const mutation of mutations) {
                    for (const addedNode of mutation.addedNodes) {
                        if (addedNode.nodeType !== 1) continue;
                        if (addedNode.classList && addedNode.classList.contains('labelCreated')) {
                            convertLabelCreatedSpan(addedNode);
                        } else if (addedNode.querySelectorAll) {
                            addedNode.querySelectorAll('.labelCreated').forEach(convertLabelCreatedSpan);
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
                const id = span.textContent.split(/[|\(]/)[0].trim();
                idFrequency[id] = (idFrequency[id] || 0) + 1;
            });

            // Track first occurrence and apply class
            const seen = {};
            labelSpans.forEach(span => {
                const id = span.textContent.split(/[|\(]/)[0].trim();
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
        // Early return if not on thread page
        if (!window.pageType?.isThread) return;
        // Early return if no .spanId exists on the page
        if (!document.querySelector('.spanId')) return;
        // Only run if posting is defined
        if (typeof posting === "undefined") return;

        // Process all posts rendered before this script runs
        for (const [id, posts] of Object.entries(posting.idsRelation)) {
            for (const post of posts) {
                const label = post.querySelector(".labelId");
                if (!label) continue;
                label.onmouseover = null;
                label.onmouseout = null;
                label.setAttribute("data-posts-by-this-id", posts.length);
            }
        }
        // Override processIdLabel to update post counts and styles
        posting.processIdLabel = function (label) {
            if (!label) return;
            const id = label.textContent;
            const postsOfThisId = posting.idsRelation[id] || [];
            const innerPost = label.closest(".innerPost, .innerOP");
            if (innerPost.classList.contains("clone")) {
                label.setAttribute("data-posts-by-this-id", postsOfThisId.length);
            } else {
                posting.idsRelation[id] = postsOfThisId;
                postsOfThisId.push(innerPost);
                for (let post of postsOfThisId) {
                    const l = post.querySelector(".labelId");
                    if (l) l.setAttribute("data-posts-by-this-id", postsOfThisId.length);
                }
            }
            label.onclick = function () {
                var index = posting.highLightedIds.indexOf(id);
                window.location.hash = '_';
                if (index > -1) {
                    posting.highLightedIds.splice(index, 1);
                } else {
                    posting.highLightedIds.push(id);
                }
                for (const cellToChange of postsOfThisId) {
                    if (cellToChange.className === 'innerOP') continue;
                    cellToChange.classList.toggle("markedPost", index === -1);
                }
            };
        };
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

        // Core Threading Logic
        function processPosts(posts) {
            posts.forEach(post => {
                const backlinks = post.querySelectorAll('.panelBacklinks .backLink.postLink');

                backlinks.forEach(backlink => {
                    const targetUri = backlink.getAttribute('data-target-uri');
                    if (!targetUri) return;

                    const targetPostId = targetUri.split('#')[1];
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
                        }
                    }
                });
            });
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
        threadAllPosts();  // Process all posts on initial load
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
                            menu.setAttribute('data-label-id', labelIdSpan.textContent.split(/[|\(]/)[0].trim());
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
                const rawId = labelIdSpan ? labelIdSpan.textContent.split(/[|\(]/)[0].trim() : null;
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
                const rawId = labelIdSpan ? labelIdSpan.textContent.split(/[|\(]/)[0].trim() : null;
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
                        labelId = labelIdSpan.textContent.split(/[|\\(]/)[0].trim();
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
                                        node.setAttribute('data-label-id', labelIdSpan.textContent.split(/[|\(]/)[0].trim());
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
                                            menu.setAttribute('data-label-id', labelIdSpan.textContent.split(/[|\(]/)[0].trim());
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
            const parentCell = detailDiv.closest('.postCell') || detailDiv.closest('.opCell');
            const imgLink = parentCell?.querySelector('.imgLink');
            const img = imgLink ? imgLink.querySelector('img') : null;
            if (!img) {
                return null;
            }

            let imgSrc = img.getAttribute('src');
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
            container.style.marginTop = '3px';
            container.style.display = 'flex';
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
                detailDiv.appendChild(container);
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

    // --- Feature: Custom Post Hide Menu ---
    function featureCustomPostHideMenu() {
        // --- DOM helpers ---
        function getAllHideButtons(root = document) {
            return Array.from(root.querySelectorAll('label.hideButton'));
        }
        function getPostCellFromButton(btn) {
            return btn.closest('.postCell, .opCell');
        }
        function getInnerPostElem(cell) {
            return cell.querySelector('.innerPost') || cell.querySelector('.innerOP');
        }
        function getThreadIdFromInnerPost(inner) {
            if (!inner) return null;
            const dataUri = inner.getAttribute('data-uri');
            if (!dataUri) return null;
            const parts = dataUri.split('/');
            if (parts.length < 2) return null;
            return parts[1].split('#')[0];
        }
        function getPostId(cell) {
            return cell.id ? cell.id.replace(/\D/g, '') : '';
        }
        function getBoardUri(cell) {
            return cell.getAttribute('data-boarduri') || '';
        }

        // --- Hide/unhide logic ---
        function hidePostCellWithStub(cell, boardUri, postId, onUnhide, reason) {
            if (!cell) return;
            const inner = getInnerPostElem(cell);
            if (!inner) return;
            inner.classList.add('hidden');
            // Remove any existing stub for this post
            const oldStub = cell.querySelector('.unhideButton');
            if (oldStub) oldStub.remove();
            const unhideBtn = document.createElement('span');
            unhideBtn.className = 'unhideButton glowOnHover';
            let stubText = `[Unhide post /${boardUri}/${postId}]`;
            if (reason === 'filteredID') stubText += ' (filtered ID)';
            else if (reason === 'filteredIDPlus') stubText += ' (reply to filtered ID)';
            else if (reason === 'filteredName') stubText += ' (filtered name)';
            else if (reason === 'filteredNamePlus') stubText += ' (reply to filtered name)';
            else if (reason === 'hidePostPlus') stubText += ' (reply to hidden post)';
            unhideBtn.textContent = stubText;
            unhideBtn.addEventListener('click', function (e) {
                e.stopPropagation();
                inner.classList.remove('hidden');
                unhideBtn.remove();
                if (typeof onUnhide === 'function') onUnhide();
                if (typeof updateAllQuoteLinksFiltered === 'function') updateAllQuoteLinksFiltered();
            });
            inner.parentNode.insertBefore(unhideBtn, inner.nextSibling);
        }
        function unhidePostCell(cell, boardUri, postId) {
            const inner = getInnerPostElem(cell);
            if (inner) inner.classList.remove('hidden');
            const unhideBtn = cell.querySelector('.unhideButton');
            if (unhideBtn) unhideBtn.remove();
            if (typeof updateAllQuoteLinksFiltered === 'function') updateAllQuoteLinksFiltered();
        }

        // --- Helper: Get all direct children (posts that quote any in rootIds) ---
        function getDirectChildren(rootIds) {
            const children = new Set();
            document.querySelectorAll('.postCell, .opCell').forEach(cell => {
                if (cell.classList.contains('opCell') || cell.classList.contains('innerOP')) return;
                const pid = getPostId(cell);
                const quoteLinks = cell.querySelectorAll('.quoteLink[data-target-uri]');
                for (const link of quoteLinks) {
                    const targetUri = link.getAttribute('data-target-uri');
                    const match = targetUri && targetUri.match(/^([^#]+)#(\w+)$/);
                    if (match && rootIds.has(match[2])) {
                        children.add(pid);
                        break;
                    }
                }
            });
            return children;
        }
        // --- Helper: Get all descendant post IDs (recursive quote tree, only quoteLinks, never backlinks) ---
        function getAllDescendants(initialSet) {
            const toHide = new Set(initialSet);
            const queue = Array.from(initialSet);
            while (queue.length > 0) {
                const currentId = queue.shift();
                document.querySelectorAll('.postCell, .opCell').forEach(cell => {
                    if (cell.classList.contains('opCell') || cell.classList.contains('innerOP')) return;
                    const pid = getPostId(cell);
                    if (toHide.has(pid)) return;
                    const quoteLinks = cell.querySelectorAll('.quoteLink[data-target-uri]');
                    for (const link of quoteLinks) {
                        const targetUri = link.getAttribute('data-target-uri');
                        const match = targetUri && targetUri.match(/^([^#]+)#(\w+)$/);
                        if (match && match[2] === currentId) {
                            toHide.add(pid);
                            queue.push(pid);
                            break;
                        }
                    }
                });
            }
            return toHide;
        }

        // --- Hide/unhide by ID (simple/plus/recursive) ---
        async function setPostsWithIdHidden(boardUri, threadId, id, hide = true, plus = false) {
            const postIdsWithId = new Set();
            if (!/^[a-z0-9]+$/i.test(id)) return;
            document.querySelectorAll(`.postCell[data-boarduri="${boardUri}"], .opCell[data-boarduri="${boardUri}"]`).forEach(cell => {
                if (cell.classList.contains('opCell') || cell.classList.contains('innerOP')) return;
                const inner = getInnerPostElem(cell);
                const cellThreadId = getThreadIdFromInnerPost(inner);
                const idElem = cell.querySelector('.labelId');
                const cellId = idElem ? idElem.textContent.split(/[|\(]/)[0].trim() : null;
                if (
                    cellThreadId === threadId &&
                    cellId &&
                    cellId === id
                ) {
                    const postId = getPostId(cell);
                    postIdsWithId.add(postId);
                    if (hide) {
                        hidePostCellWithStub(cell, boardUri, postId, null, plus ? 'filteredIDPlus' : 'filteredID');
                    } else {
                        unhidePostCell(cell, boardUri, postId);
                    }
                }
            });

            if (plus && postIdsWithId.size > 0) {
                const recursiveHide = await getSetting("enableHidingMenu_recursiveHide");
                let toHide = getDirectChildren(postIdsWithId);
                if (recursiveHide) {
                    const initial = new Set([...postIdsWithId, ...toHide]);
                    toHide = getAllDescendants(initial);
                    for (const pid of postIdsWithId) toHide.delete(pid);
                }
                document.querySelectorAll('.postCell, .opCell').forEach(cell => {
                    if (cell.classList.contains('opCell') || cell.classList.contains('innerOP')) return;
                    const pid = getPostId(cell);
                    if (toHide.has(pid)) {
                        if (hide) {
                            hidePostCellWithStub(cell, getBoardUri(cell), pid, null, 'filteredIDPlus');
                        } else {
                            unhidePostCell(cell, getBoardUri(cell), pid);
                        }
                    }
                });
            }
            if (typeof updateAllQuoteLinksFiltered === 'function') updateAllQuoteLinksFiltered();
        }

        // --- Hide/unhide by name (simple/plus/recursive) ---
        async function setPostsWithNameHidden(name, hide = true, plus = false) {
            const postIdsWithName = new Set();
            document.querySelectorAll('.postCell, .opCell').forEach(cell => {
                if (cell.classList.contains('opCell') || cell.classList.contains('innerOP')) return;
                const nameElem = cell.querySelector('.linkName');
                if (nameElem && nameElem.textContent.trim() === name) {
                    const boardUri = getBoardUri(cell);
                    const postId = getPostId(cell);
                    postIdsWithName.add(postId);
                    if (hide) {
                        hidePostCellWithStub(cell, boardUri, postId, null, plus ? 'filteredNamePlus' : 'filteredName');
                    } else {
                        unhidePostCell(cell, boardUri, postId);
                    }
                }
            });

            if (plus && postIdsWithName.size > 0) {
                const recursiveHide = await getSetting("enableHidingMenu_recursiveHide");
                let toHide = getDirectChildren(postIdsWithName);
                if (recursiveHide) {
                    const initial = new Set([...postIdsWithName, ...toHide]);
                    toHide = getAllDescendants(initial);
                    for (const pid of postIdsWithName) toHide.delete(pid);
                }
                document.querySelectorAll('.postCell, .opCell').forEach(cell => {
                    if (cell.classList.contains('opCell') || cell.classList.contains('innerOP')) return;
                    const pid = getPostId(cell);
                    if (toHide.has(pid)) {
                        if (hide) {
                            hidePostCellWithStub(cell, getBoardUri(cell), pid, null, 'filteredNamePlus');
                        } else {
                            unhidePostCell(cell, getBoardUri(cell), pid);
                        }
                    }
                });
            }
            if (typeof updateAllQuoteLinksFiltered === 'function') updateAllQuoteLinksFiltered();
        }

        // --- Hide/unhide by post (simple/plus/recursive) ---
        async function setPostHidden(boardUri, postId, hide = true, plus = false) {
            const recursiveHide = await getSetting("enableHidingMenu_recursiveHide");
            // Always hide/unhide the post itself
            document.querySelectorAll(`.postCell[data-boarduri="${boardUri}"], .opCell[data-boarduri="${boardUri}"]`).forEach(cell => {
                if (cell.classList.contains('opCell') || cell.classList.contains('innerOP')) return;
                if (getPostId(cell) === postId) {
                    if (hide) {
                        hidePostCellWithStub(cell, boardUri, postId, null, plus ? 'hidePostPlus' : 'hidePost');
                    } else {
                        unhidePostCell(cell, boardUri, postId);
                    }
                }
            });
            if (plus) {
                let toHide = getDirectChildren(new Set([postId]));
                if (recursiveHide) {
                    const initial = new Set([postId, ...toHide]);
                    toHide = getAllDescendants(initial);
                    toHide.delete(postId);
                }
                document.querySelectorAll('.postCell, .opCell').forEach(cell => {
                    if (cell.classList.contains('opCell') || cell.classList.contains('innerOP')) return;
                    const pid = getPostId(cell);
                    if (toHide.has(pid)) {
                        if (hide) {
                            hidePostCellWithStub(cell, getBoardUri(cell), pid, null, 'hidePostPlus');
                        } else {
                            unhidePostCell(cell, getBoardUri(cell), pid);
                        }
                    }
                });
            }
            if (typeof updateAllQuoteLinksFiltered === 'function') updateAllQuoteLinksFiltered();
        }

        async function updateAllQuoteLinksFiltered() {
            // Gather all hidden post IDs, filtered IDs, and filtered names
            const hiddenPostsObj = await getStoredObject(HIDDEN_POSTS_KEY);
            let filteredNamesObj = await getStoredObject(FILTERED_NAMES_KEY);
            if (!filteredNamesObj || typeof filteredNamesObj !== "object" || Array.isArray(filteredNamesObj)) {
                filteredNamesObj = { simple: Array.isArray(filteredNamesObj) ? filteredNamesObj : [], plus: [] };
            }
            if (!Array.isArray(filteredNamesObj.simple)) filteredNamesObj.simple = [];
            if (!Array.isArray(filteredNamesObj.plus)) filteredNamesObj.plus = [];

            // Build a set of all hidden/filtered post IDs
            const filteredPostIds = new Set();

            // Hidden posts (simple and plus)
            for (const boardUri in hiddenPostsObj) {
                for (const postId of (hiddenPostsObj[boardUri]?.simple || [])) {
                    filteredPostIds.add(postId + ''); // ensure string
                }
                for (const postId of (hiddenPostsObj[boardUri]?.plus || [])) {
                    filteredPostIds.add(postId + '');
                }
            }

            // Filtered IDs (simple and plus)
            const filteredIdsObj = await getStoredObject(FILTERED_IDS_KEY);
            for (const boardUri in filteredIdsObj) {
                for (const threadId in filteredIdsObj[boardUri]) {
                    let threadObj = filteredIdsObj[boardUri][threadId];
                    if (Array.isArray(threadObj)) {
                        threadObj = { simple: threadObj, plus: [] };
                        filteredIdsObj[boardUri][threadId] = threadObj;
                    }
                    // Simple
                    for (const id of threadObj.simple || []) {
                        document.querySelectorAll(`.postCell[data-boarduri="${boardUri}"], .opCell[data-boarduri="${boardUri}"]`).forEach(cell => {
                            const idElem = cell.querySelector('.labelId');
                            if (idElem && idElem.textContent.split(/[|\\(]/)[0].trim() === id) {
                                filteredPostIds.add(getPostId(cell));
                            }
                        });
                    }
                    // Plus
                    for (const id of threadObj.plus || []) {
                        document.querySelectorAll(`.postCell[data-boarduri="${boardUri}"], .opCell[data-boarduri="${boardUri}"]`).forEach(cell => {
                            const idElem = cell.querySelector('.labelId');
                            if (idElem && idElem.textContent.split(/[|\\(]/)[0].trim() === id) {
                                filteredPostIds.add(getPostId(cell));
                            }
                        });
                    }
                }
            }

            // Filtered names (simple and plus)
            for (const name of filteredNamesObj.simple) {
                document.querySelectorAll('.postCell, .opCell').forEach(cell => {
                    const nameElem = cell.querySelector('.linkName');
                    if (nameElem && nameElem.textContent.trim() === name) {
                        filteredPostIds.add(getPostId(cell));
                    }
                });
            }
            for (const name of filteredNamesObj.plus) {
                document.querySelectorAll('.postCell, .opCell').forEach(cell => {
                    const nameElem = cell.querySelector('.linkName');
                    if (nameElem && nameElem.textContent.trim() === name) {
                        filteredPostIds.add(getPostId(cell));
                    }
                });
            }

            // Now update all quoteLinks
            document.querySelectorAll('.quoteLink').forEach(link => {
                let isFiltered = false;
                const targetUri = link.getAttribute('data-target-uri');
                if (targetUri) {
                    const match = targetUri.match(/^([^#]+)#(\w+)$/);
                    if (match && filteredPostIds.has(match[2])) {
                        isFiltered = true;
                    }
                }
                if (isFiltered) link.classList.add('filtered');
                else link.classList.remove('filtered');
            });
        }

        // --- Menu logic ---
        class CustomHideMenu {
            constructor(hideButton, postCell, options) {
                this.hideButton = hideButton;
                this.postCell = postCell;
                this.options = options;
                this.menu = null;
            }
            render() {
                this.remove();
                this.menu = document.createElement('div');
                this.menu.className = 'floatingList extraMenu';
                this.menu.setAttribute('data-custom', '1');
                const rect = this.hideButton.getBoundingClientRect();
                this.menu.style.position = 'absolute';
                this.menu.style.left = `${rect.left + window.scrollX}px`;
                this.menu.style.top = `${rect.bottom + window.scrollY}px`;
                this.menu.style.zIndex = 9999;
                this.menu.style.fontSize = "10pt";
                const list = document.createElement('ul');
                this.menu.appendChild(list);
                this.options.forEach(opt => {
                    const li = document.createElement('li');
                    li.textContent = opt.name;
                    li.onclick = opt.callback;
                    list.appendChild(li);
                });
                document.body.appendChild(this.menu);
                setTimeout(() => {
                    document.addEventListener('mousedown', this.handleOutsideClick.bind(this));
                }, 0);
            }
            handleOutsideClick(e) {
                if (!this.menu.contains(e.target)) {
                    this.remove();
                    document.removeEventListener('mousedown', this.handleOutsideClick.bind(this));
                }
            }
            remove() {
                if (this.menu && this.menu.parentNode) {
                    this.menu.parentNode.removeChild(this.menu);
                    this.menu = null;
                }
            }
        }

        async function showCustomMenu(hideButton, postCell) {
            removeExistingMenu();
            const boardUri = getBoardUri(postCell);
            const postId = getPostId(postCell);
            const inner = getInnerPostElem(postCell);
            const threadId = getThreadIdFromInnerPost(inner);
            const idElem = postCell.querySelector('.labelId');
            const id = idElem ? idElem.textContent.split(/[|\(]/)[0].trim() : null;
            const nameElem = postCell.querySelector('.linkName');
            const name = nameElem ? nameElem.textContent.trim() : null;
            const isOP = postCell.classList.contains('opCell') || postCell.classList.contains('innerOP');

            // Get storage state
            const hiddenPostsObj = await getStoredObject(HIDDEN_POSTS_KEY);
            if (!hiddenPostsObj[boardUri]) hiddenPostsObj[boardUri] = { simple: [], plus: [] };
            if (!Array.isArray(hiddenPostsObj[boardUri].simple)) hiddenPostsObj[boardUri].simple = [];
            if (!Array.isArray(hiddenPostsObj[boardUri].plus)) hiddenPostsObj[boardUri].plus = [];
            const isHiddenSimple = hiddenPostsObj[boardUri].simple.includes(Number(postId));
            const isHiddenPlus = hiddenPostsObj[boardUri].plus.includes(Number(postId));
            const filteredIdsObj = await getStoredObject(FILTERED_IDS_KEY);
            // Ensure correct structure for filteredIdsObj[boardUri][threadId]
            let threadObj = filteredIdsObj[boardUri] && filteredIdsObj[boardUri][threadId];
            if (Array.isArray(threadObj)) {
                threadObj = { simple: threadObj, plus: [] };
                filteredIdsObj[boardUri][threadId] = threadObj;
            } else if (!threadObj) {
                threadObj = { simple: [], plus: [] };
                if (!filteredIdsObj[boardUri]) filteredIdsObj[boardUri] = {};
                filteredIdsObj[boardUri][threadId] = threadObj;
            }
            if (!Array.isArray(threadObj.simple)) threadObj.simple = [];
            if (!Array.isArray(threadObj.plus)) threadObj.plus = [];
            const isFilteredId = id && threadObj.simple.includes(id);
            const isFilteredIdPlus = id && threadObj.plus.includes(id);

            // Filtered names: support both old array and new object
            let filteredNamesObj = await getStoredObject(FILTERED_NAMES_KEY);
            if (!filteredNamesObj || typeof filteredNamesObj !== "object") {
                filteredNamesObj = { simple: [], plus: [] };
            }
            if (!Array.isArray(filteredNamesObj.simple)) filteredNamesObj.simple = [];
            if (!Array.isArray(filteredNamesObj.plus)) filteredNamesObj.plus = [];
            const isNameFiltered = name && filteredNamesObj.simple.includes(name);
            const isNameFilteredPlus = name && filteredNamesObj.plus.includes(name);

            // Menu entries
            const options = [];

            if (!isOP) {
                options.push(
                    {
                        name: isHiddenSimple ? 'Unhide post' : 'Hide post',
                        callback: async () => {
                            let obj = await getStoredObject(HIDDEN_POSTS_KEY);
                            if (!obj[boardUri]) obj[boardUri] = { simple: [], plus: [] };
                            let arr = obj[boardUri].simple;
                            const idx = arr.indexOf(Number(postId));
                            if (idx !== -1) {
                                arr.splice(idx, 1);
                                obj[boardUri].simple = arr;
                                await setStoredObject(HIDDEN_POSTS_KEY, obj);
                                setPostHidden(boardUri, postId, false, false);
                            } else {
                                arr.push(Number(postId));
                                obj[boardUri].simple = arr;
                                await setStoredObject(HIDDEN_POSTS_KEY, obj);
                                setPostHidden(boardUri, postId, true, false);
                            }
                            removeExistingMenu();
                        }
                    },
                    {
                        name: isHiddenPlus ? 'Unhide post+' : 'Hide post+',
                        callback: async () => {
                            let obj = await getStoredObject(HIDDEN_POSTS_KEY);
                            if (!obj[boardUri]) obj[boardUri] = { simple: [], plus: [] };
                            let arr = obj[boardUri].plus;
                            const idx = arr.indexOf(Number(postId));
                            if (idx !== -1) {
                                arr.splice(idx, 1);
                                obj[boardUri].plus = arr;
                                await setStoredObject(HIDDEN_POSTS_KEY, obj);
                                setPostHidden(boardUri, postId, false, true);
                            } else {
                                arr.push(Number(postId));
                                obj[boardUri].plus = arr;
                                await setStoredObject(HIDDEN_POSTS_KEY, obj);
                                setPostHidden(boardUri, postId, true, true);
                            }
                            removeExistingMenu();
                        }
                    }
                );
            }

            options.push(
                {
                    name: isNameFiltered ? 'Unfilter name' : 'Filter name',
                    callback: async () => {
                        let obj = await getStoredObject(FILTERED_NAMES_KEY);
                        if (!obj || typeof obj !== "object") {
                            obj = { simple: [], plus: [] };
                        }
                        if (!Array.isArray(obj.simple)) obj.simple = [];
                        const idx = obj.simple.indexOf(name);
                        if (idx !== -1) {
                            obj.simple.splice(idx, 1);
                            await setStoredObject(FILTERED_NAMES_KEY, obj);
                            setPostsWithNameHidden(name, false, false);
                        } else {
                            obj.simple.push(name);
                            await setStoredObject(FILTERED_NAMES_KEY, obj);
                            setPostsWithNameHidden(name, true, false);
                        }
                        removeExistingMenu();
                    }
                },
                {
                    name: isNameFilteredPlus ? 'Unfilter name+' : 'Filter name+',
                    callback: async () => {
                        let obj = await getStoredObject(FILTERED_NAMES_KEY);
                        if (!obj || typeof obj !== "object") {
                            obj = { simple: [], plus: [] };
                        }
                        if (!Array.isArray(obj.plus)) obj.plus = [];
                        const idx = obj.plus.indexOf(name);
                        if (idx !== -1) {
                            obj.plus.splice(idx, 1);
                            await setStoredObject(FILTERED_NAMES_KEY, obj);
                            setPostsWithNameHidden(name, false, true);
                        } else {
                            obj.plus.push(name);
                            await setStoredObject(FILTERED_NAMES_KEY, obj);
                            setPostsWithNameHidden(name, true, true);
                        }
                        removeExistingMenu();
                    }
                },
                {
                    name: isFilteredId ? 'Unfilter ID' : 'Filter ID',
                    callback: async () => {
                        let obj = await getStoredObject(FILTERED_IDS_KEY);
                        if (!obj[boardUri]) obj[boardUri] = {};
                        let threadObj = obj[boardUri][threadId];
                        if (Array.isArray(threadObj)) {
                            threadObj = { simple: threadObj, plus: [] };
                            obj[boardUri][threadId] = threadObj;
                        } else if (!threadObj) {
                            threadObj = { simple: [], plus: [] };
                            obj[boardUri][threadId] = threadObj;
                        }
                        if (!Array.isArray(threadObj.simple)) threadObj.simple = [];
                        let arr = threadObj.simple;
                        // Use the raw ID for storage and comparison
                        const rawId = id ? id.split(/[|\(]/)[0].trim() : id;
                        const idx = arr.indexOf(rawId);
                        if (idx !== -1) {
                            arr.splice(idx, 1);
                            threadObj.simple = arr;
                            await setStoredObject(FILTERED_IDS_KEY, obj);
                            setPostsWithIdHidden(boardUri, threadId, rawId, false, false);
                        } else {
                            arr.push(rawId);
                            threadObj.simple = arr;
                            await setStoredObject(FILTERED_IDS_KEY, obj);
                            setPostsWithIdHidden(boardUri, threadId, rawId, true, false);
                        }
                        removeExistingMenu();
                    }
                },
                {
                    name: isFilteredIdPlus ? 'Unfilter ID+' : 'Filter ID+',
                    callback: async () => {
                        let obj = await getStoredObject(FILTERED_IDS_KEY);
                        if (!obj[boardUri]) obj[boardUri] = {};
                        let threadObj = obj[boardUri][threadId];
                        if (Array.isArray(threadObj)) {
                            threadObj = { simple: threadObj, plus: [] };
                            obj[boardUri][threadId] = threadObj;
                        } else if (!threadObj) {
                            threadObj = { simple: [], plus: [] };
                            obj[boardUri][threadId] = threadObj;
                        }
                        if (!Array.isArray(threadObj.plus)) threadObj.plus = [];
                        let arr = threadObj.plus;
                        const rawId = id ? id.split(/[|\(]/)[0].trim() : id;
                        const idx = arr.indexOf(rawId);
                        if (idx !== -1) {
                            arr.splice(idx, 1);
                            threadObj.plus = arr;
                            await setStoredObject(FILTERED_IDS_KEY, obj);
                            setPostsWithIdHidden(boardUri, threadId, rawId, false, true);
                        } else {
                            arr.push(rawId);
                            threadObj.plus = arr;
                            await setStoredObject(FILTERED_IDS_KEY, obj);
                            setPostsWithIdHidden(boardUri, threadId, rawId, true, true);
                        }
                        removeExistingMenu();
                    }
                }
            );

            const menu = new CustomHideMenu(hideButton, postCell, options);
            menu.render();
        }

        function removeExistingMenu() {
            document.querySelectorAll('.floatingList.extraMenu[data-custom]').forEach(menu => menu.remove());
        }

        // Hijack hide buttons
        function hijackHideButtons(root = document) {
            getAllHideButtons(root).forEach(hideButton => {
                if (hideButton.dataset.customMenuHijacked) return;
                hideButton.dataset.customMenuHijacked = "1";
                hideButton.onclick = null;
                hideButton.addEventListener('click', function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    showCustomMenu(hideButton, getPostCellFromButton(hideButton));
                }, true);
            });
        }

        // Initial page load: apply all hiding/filtering
        async function autoHideAll() {
            // Hide posts
            const obj = await getStoredObject(HIDDEN_POSTS_KEY);
            for (const boardUri in obj) {
                const arrSimple = obj[boardUri]?.simple || [];
                const arrPlus = obj[boardUri]?.plus || [];
                arrSimple.forEach(postId => setPostHidden(boardUri, String(postId), true, false));
                arrPlus.forEach(postId => setPostHidden(boardUri, String(postId), true, true));
            }
            // Hide filtered IDs
            const idsObj = await getStoredObject(FILTERED_IDS_KEY);
            for (const boardUri in idsObj) {
                for (const threadId in idsObj[boardUri]) {
                    let threadObj = idsObj[boardUri][threadId];
                    if (Array.isArray(threadObj)) {
                        threadObj = { simple: threadObj, plus: [] };
                        idsObj[boardUri][threadId] = threadObj;
                    }
                    (threadObj.simple || []).forEach(id => setPostsWithIdHidden(boardUri, threadId, id, true, false));
                    (threadObj.plus || []).forEach(id => setPostsWithIdHidden(boardUri, threadId, id, true, true));
                }
            }
            // Hide filtered names (simple and plus)
            let namesObj = await getStoredObject(FILTERED_NAMES_KEY);
            if (!namesObj || typeof namesObj !== "object") {
                namesObj = { simple: [], plus: [] };
            }
            (namesObj.simple || []).forEach(name => setPostsWithNameHidden(name, true, false));
            (namesObj.plus || []).forEach(name => setPostsWithNameHidden(name, true, true));
            // Update all quoteLinks after initial hiding
            updateAllQuoteLinksFiltered();
        }

        // Post parent/child map cache
        const postMapCache = (() => {
            let postParentMap = null;
            let childMap = null;
            let filteredNamePlusSet = null;
            let plusHiddenSet = null;
            return {
                getParentMap: function () {
                    if (!postParentMap) {
                        postParentMap = {};
                        document.querySelectorAll('.postCell, .opCell').forEach(postCell => {
                            const pid = postCell.id;
                            const parentIds = [];
                            postCell.querySelectorAll('.quoteLink[data-target-uri]').forEach(link => {
                                const targetUri = link.getAttribute('data-target-uri');
                                const match = targetUri && targetUri.match(/^([^#]+)#(\d+)$/);
                                if (match) parentIds.push(match[2]);
                            });
                            postParentMap[pid] = parentIds;
                        });
                    }
                    return postParentMap;
                },
                getChildMap: function () {
                    if (!childMap) {
                        childMap = {};
                        const postParentMap = this.getParentMap();
                        Object.entries(postParentMap).forEach(([childId, parentIds]) => {
                            parentIds.forEach(parentId => {
                                if (!childMap[parentId]) childMap[parentId] = [];
                                childMap[parentId].push(childId);
                            });
                        });
                    }
                    return childMap;
                },
                getFilteredNamePlusSet: function (filteredNamesObj) {
                    if (!filteredNamePlusSet) {
                        filteredNamePlusSet = new Set();
                        const initialFiltered = [];
                        // Find all postCells with a filtered name (plus)
                        document.querySelectorAll('.postCell, .opCell').forEach(postCell => {
                            const nameElem = postCell.querySelector('.linkName');
                            const name = nameElem ? nameElem.textContent.trim() : null;
                            if (name && filteredNamesObj.plus.includes(name)) {
                                filteredNamePlusSet.add(postCell.id);
                                initialFiltered.push(postCell.id);
                            }
                        });
                        // Recursively add all descendants (replies of replies, etc.)
                        const childMap = this.getChildMap();
                        const queue = [...initialFiltered];
                        while (queue.length > 0) {
                            const current = queue.shift();
                            const children = childMap[current] || [];
                            for (const child of children) {
                                if (!filteredNamePlusSet.has(child)) {
                                    filteredNamePlusSet.add(child);
                                    queue.push(child);
                                }
                            }
                        }
                    }
                    return filteredNamePlusSet;
                },
                getPlusHiddenSet: function (plusHiddenMap) {
                    if (!plusHiddenSet) {
                        plusHiddenSet = new Set();
                        for (const b in plusHiddenMap) {
                            for (const hid of plusHiddenMap[b]) {
                                plusHiddenSet.add(hid);
                            }
                        }
                    }
                    return plusHiddenSet;
                },
                invalidate: function () {
                    postParentMap = null;
                    childMap = null;
                    filteredNamePlusSet = null;
                    plusHiddenSet = null;
                }
            };
        })();

        // Use the observer registry for .divPosts
        const divPostsObs = observeSelector('.divPosts', { childList: true, subtree: false });
        if (divPostsObs) {
            const debouncedHandler = debounce(async function customPostHideMenuHandler(mutations) {
                // Invalidate caches on DOM mutation
                postMapCache.invalidate();

                // Gather all plus-hidden post IDs for all boards, etc.
                const hiddenPostsObj = await getStoredObject(HIDDEN_POSTS_KEY);
                const filteredIdsObj = await getStoredObject(FILTERED_IDS_KEY);
                let filteredNamesObj = await getStoredObject(FILTERED_NAMES_KEY);
                if (!filteredNamesObj || typeof filteredNamesObj !== "object") {
                    filteredNamesObj = { simple: [], plus: [] };
                }
                if (!Array.isArray(filteredNamesObj.simple)) filteredNamesObj.simple = [];
                if (!Array.isArray(filteredNamesObj.plus)) filteredNamesObj.plus = [];

                // Map: boardUri -> Set of plus-hidden post IDs (as strings)
                const plusHiddenMap = {};
                for (const boardUri in hiddenPostsObj) {
                    plusHiddenMap[boardUri] = new Set((hiddenPostsObj[boardUri]?.plus || []).map(String));
                }

                // Build a map of boardUri+threadId => Set of postIds with plus-filtered IDs
                const plusFilteredIdPostIds = {};
                for (const boardUri in filteredIdsObj) {
                    for (const threadId in filteredIdsObj[boardUri]) {
                        let threadObj = filteredIdsObj[boardUri][threadId];
                        if (Array.isArray(threadObj)) {
                            threadObj = { simple: threadObj, plus: [] };
                            filteredIdsObj[boardUri][threadId] = threadObj;
                        }
                        if (!plusFilteredIdPostIds[boardUri]) plusFilteredIdPostIds[boardUri] = {};
                        plusFilteredIdPostIds[boardUri][threadId] = new Set();
                        for (const id of threadObj.plus || []) {
                            // Find all postIds in this thread with this ID
                            document.querySelectorAll(`.postCell[data-boarduri="${boardUri}"], .opCell[data-boarduri="${boardUri}"]`).forEach(cell => {
                                const inner = getInnerPostElem(cell);
                                const cellThreadId = getThreadIdFromInnerPost(inner);
                                const idElem = cell.querySelector('.labelId');
                                const cellId = idElem ? idElem.textContent.split(/[|\(]/)[0].trim() : null;
                                if (
                                    cellThreadId === threadId &&
                                    cellId &&
                                    cellId === id
                                ) {
                                    plusFilteredIdPostIds[boardUri][threadId].add(getPostId(cell));
                                }
                            });
                        }
                    }
                }

                for (const mutation of mutations) {
                    for (const node of mutation.addedNodes) {
                        if (node.nodeType !== 1) continue;
                        let postCells = [];
                        if (node.classList && (node.classList.contains('postCell') || node.classList.contains('opCell'))) {
                            postCells.push(node);
                        }
                        if (node.querySelectorAll) {
                            postCells = postCells.concat(Array.from(node.querySelectorAll('.postCell, .opCell')));
                        }
                        for (const cell of postCells) {
                            hijackHideButtons(cell);
                            const boardUri = getBoardUri(cell);
                            const postId = getPostId(cell);
                            const inner = getInnerPostElem(cell);
                            const threadId = getThreadIdFromInnerPost(inner);
                            const idElem = cell.querySelector('.labelId');
                            const id = idElem ? idElem.textContent.split(/[|\(]/)[0].trim() : null;
                            const nameElem = cell.querySelector('.linkName');
                            const name = nameElem ? nameElem.textContent.trim() : null;

                            // Hide post (simple/plus)
                            if (hiddenPostsObj[boardUri]?.simple?.includes(Number(postId))) {
                                setPostHidden(boardUri, postId, true, false);
                            }
                            if (hiddenPostsObj[boardUri]?.plus?.includes(Number(postId))) {
                                setPostHidden(boardUri, postId, true, true);
                            }

                            // Hide by filtered ID (simple and plus)
                            let threadObj = filteredIdsObj[boardUri] && filteredIdsObj[boardUri][threadId];
                            if (Array.isArray(threadObj)) {
                                threadObj = { simple: threadObj, plus: [] };
                                filteredIdsObj[boardUri][threadId] = threadObj;
                            } else if (!threadObj) {
                                threadObj = { simple: [], plus: [] };
                                if (!filteredIdsObj[boardUri]) filteredIdsObj[boardUri] = {};
                                filteredIdsObj[boardUri][threadId] = threadObj;
                            }
                            if (id && threadObj.simple.includes(id)) {
                                setPostsWithIdHidden(boardUri, threadId, id, true, false);
                            }
                            if (id && threadObj.plus.includes(id)) {
                                setPostsWithIdHidden(boardUri, threadId, id, true, true);
                            }

                            // Hide by filtered name (simple and plus)
                            if (name && filteredNamesObj.simple.includes(name)) {
                                setPostsWithNameHidden(name, true, false);
                            }
                            if (name && filteredNamesObj.plus.includes(name)) {
                                setPostsWithNameHidden(name, true, true);
                            }

                            // --- Hide if replying (directly or indirectly) to a plus-hidden post or filtered name+ ---
                            let shouldHidePlus = false;
                            const quoteLinks = cell.querySelectorAll('.quoteLink[data-target-uri]');
                            // Cache in a closure-scoped variable
                            const postParentMap = postMapCache.getParentMap();
                            const plusHiddenSet = postMapCache.getPlusHiddenSet(plusHiddenMap);
                            const filteredNamePlusSet = postMapCache.getFilteredNamePlusSet(filteredNamesObj);

                            // Walk up the parent chain in memory
                            const visited = new Set();
                            function isDescendantOfPlusHiddenOrFilteredNamePlus(pid) {
                                if (visited.has(pid)) return false;
                                visited.add(pid);
                                if (plusHiddenSet.has(pid)) return true;
                                if (filteredNamePlusSet.has(pid)) return true;
                                const parents = postParentMap[pid] || [];
                                for (const par of parents) {
                                    if (isDescendantOfPlusHiddenOrFilteredNamePlus(par)) return true;
                                }
                                return false;
                            }
                            if (isDescendantOfPlusHiddenOrFilteredNamePlus(postId)) {
                                shouldHidePlus = true;
                            }
                            if (shouldHidePlus) {
                                setPostHidden(boardUri, postId, true, true);
                            }

                            // --- Hide if replying to a plus-filtered ID (Filter ID+) ---
                            // Only direct replies (not recursive)
                            if (
                                plusFilteredIdPostIds[boardUri] &&
                                plusFilteredIdPostIds[boardUri][threadId] &&
                                plusFilteredIdPostIds[boardUri][threadId].size > 0
                            ) {
                                // Check .panelBacklinks .backLink
                                const panelBacklinks = cell.querySelector('.panelBacklinks');
                                let isDirectReplyToFilteredId = false;
                                if (panelBacklinks) {
                                    const backLinks = panelBacklinks.querySelectorAll('.backLink[data-target-uri]');
                                    for (const link of backLinks) {
                                        const targetUri = link.getAttribute('data-target-uri');
                                        const match = targetUri && targetUri.match(/^([^#]+)#(\d+)$/);
                                        if (match && plusFilteredIdPostIds[boardUri][threadId].has(match[2])) {
                                            isDirectReplyToFilteredId = true;
                                            break;
                                        }
                                    }
                                }
                                // Also check .quoteLink (for completeness)
                                if (!isDirectReplyToFilteredId) {
                                    for (const link of quoteLinks) {
                                        const targetUri = link.getAttribute('data-target-uri');
                                        const match = targetUri && targetUri.match(/^([^#]+)#(\d+)$/);
                                        if (match && plusFilteredIdPostIds[boardUri][threadId].has(match[2])) {
                                            isDirectReplyToFilteredId = true;
                                            break;
                                        }
                                    }
                                }
                                if (isDirectReplyToFilteredId) {
                                    hidePostCellWithStub(cell, boardUri, postId, null, 'filteredIDPlus');
                                }
                            }
                        }
                    }
                }
                updateAllQuoteLinksFiltered();
            }, 50); // 50ms debounce
            divPostsObs.addHandler(debouncedHandler);
        }

        // --- Initial setup ---
        hijackHideButtons();
        autoHideAll();
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

    // --- Feature: File Renamer ---
    function renameFileAtIndex(index) {
        const currentFile = postCommon.selectedFiles[index];
        if (!currentFile) return;
        const currentName = currentFile.name;
        const newName = prompt("Enter new file name:", currentName);

        if (!newName || newName === currentName) return;

        const extension = currentName.includes('.') ? currentName.substring(currentName.lastIndexOf('.')) : '';
        const hasExtension = newName.includes('.');
        const finalName = hasExtension ? newName : newName + extension;

        if (hasExtension && newName.substring(newName.lastIndexOf('.')) !== extension) {
            alert(`You cannot change the file extension. The extension must remain "${extension}".`);
            return;
        }
        const renamedFile = new File([currentFile], finalName, {
            type: currentFile.type,
            lastModified: currentFile.lastModified,
        });

        postCommon.selectedFiles[index] = renamedFile;

        // Update the label in all containers
        updateFileLabels(finalName, index);
    }

    function getSelectedCellIndex(element) {
        const cell = element.closest('.selectedCell');
        if (!cell || !cell.parentElement) return -1;
        const cells = Array.from(cell.parentElement.querySelectorAll(':scope > .selectedCell'));
        return cells.indexOf(cell);
    }

    // Helper to update the label text in all relevant containers
    function updateFileLabels(finalName, index) {
        //update name in both forms from nth file
        //CSS :nth-of-type starts from 1, arrays start from 0
        const cssIndex = index + 1;
        const selector = `form .selectedCell:nth-of-type(${cssIndex}) .nameLabel`;
        const labels = document.querySelectorAll(selector);
        labels.forEach(label => {
            label.textContent = finalName;
            label.title = finalName;
        });
    }

    // Unified event delegation for .nameLabel clicks in both containers
    function handleNameLabelClick(event) {
        const label = event.target.closest('.nameLabel');
        if (!label) return;
        const index = getSelectedCellIndex(label);
        if (index !== -1) {
            renameFileAtIndex(index);
        }
    }

    function handleCustomRemoveClick(event) {
        //Prevent any original 'onclick' attribute or other listeners
        //This isnt doing anything as we already removed the node.onclick function
        event.stopImmediatePropagation();

        const button = event.currentTarget;
        const index = getSelectedCellIndex(button);

        if (index === -1) {
            console.error("Could not determine index of the cell to remove.");
            return;
        }

        //Remove the file from the data array
        const removedFiles = postCommon.selectedFiles.splice(index, 1);

        // Adjust budget if a file was actually removed from the array
        if (removedFiles && removedFiles.length > 0 && removedFiles[0]) {
            // Ensure adjustBudget exists and the file has a size property
            if (typeof postCommon.adjustBudget === 'function' && typeof removedFiles[0].size === 'number') {
                postCommon.adjustBudget(-removedFiles[0].size);
            } else {
                console.warn("postCommon.adjustBudget function missing or removed file has no size property.");
            }
        } else {
            console.warn("Spliced file array but got no result for index:", index);
        }

        //Remove the file's cells from both forms
        //CSS :nth-of-type starts from 1, arrays start from 0
        const cssIndex = index + 1;
        const selector = `form .selectedCell:nth-of-type(${cssIndex})`;
        const fileCells = document.querySelectorAll(selector);
        fileCells.forEach(cell => {
            cell.remove();
        });
    }

    // Attach event delegation to a container if not already attached
    function observePostForms(containerSelector) {
        const container = document.querySelector(containerSelector);
        if (!container) {
            // console.warn(`Container ${containerSelector} not found.`);
            return;
        }

        // Attach Name Label Click Listener (Delegated) ---
        if (!container.dataset.renameDelegationAttached) {
            // Use capture phase potentially if stopImmediatePropagation in remove handler
            // interferes, but usually bubble phase is fine.
            container.addEventListener('click', handleNameLabelClick, false); // Use bubble phase
            container.dataset.renameDelegationAttached = 'true';
            // console.log(`Attached name label listener to ${containerSelector}`);
        }

        // Process Remove Buttons (Existing and Future) ---
        // Helper function to attach the custom handler to a button
        const setupRemoveButton = (button) => {
            if (!button.dataset.customRemoveAttached) {
                // Remove the original inline onclick function, if it exists
                if (typeof button.onclick === 'function') {
                    button.onclick = null;
                }
                // Add our custom listener
                button.addEventListener('click', handleCustomRemoveClick);
                button.dataset.customRemoveAttached = 'true'; // Mark as processed
            }
        };

        // Setup MutationObserver if not already attached to this container
        if (!container.dataset.removeObserverAttached) {
            const removeBtnObserver = (mutationsList, observer) => {
                for (const mutation of mutationsList) {
                    if (mutation.type === 'childList') {
                        mutation.addedNodes.forEach(node => {
                            // Only process if the added node is a div.selectedCell
                            if (
                                node.nodeType === Node.ELEMENT_NODE &&
                                node.matches('div.selectedCell')
                            ) {
                                node.querySelectorAll('.removeButton').forEach(setupRemoveButton);
                            }
                        });
                    }
                }
            };

            // Create and start the observer
            const rmvObserver = new MutationObserver(removeBtnObserver);
            rmvObserver.observe(container, {
                childList: true,
                subtree: true
            });

            // Mark the container so we don't attach multiple observers
            container.dataset.removeObserverAttached = 'true';
        }
    }

    // Watch both containers for changes and attach event delegation
    function startObservingPostForms() {
        observePostForms('#qrFilesBody');
        observePostForms('#postingFormContents');
    }

    // Init
    startObservingPostForms();

    ///// MENU /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // --- Floating Settings Menu with Tabs ---
    async function createSettingsMenu() {
        let menu = document.getElementById("8chanSS-menu");
        if (menu) return menu;
        menu = document.createElement("div");
        menu.id = "8chanSS-menu";
        menu.style.position = "fixed";
        menu.style.top = "3rem"; // Position of menu
        menu.style.left = "20rem"; // Position of menu
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

                // If changing from hidden to visible, add listener
                if (oldValue === 'none' && value !== 'none') {
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
                        subTextarea.style.width = "90%";
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
                        // Checkbox for boolean suboptions (existing code)
                        const subCheckbox = document.createElement("input");
                        subCheckbox.type = "checkbox";
                        subCheckbox.id = "setting_" + fullKey;
                        subCheckbox.checked = tempSettings[fullKey];
                        subCheckbox.style.marginRight = "8px";

                        subCheckbox.addEventListener("change", function () {
                            tempSettings[fullKey] = subCheckbox.checked;
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

            // Create Filter lists
            if (key === "enableHidingMenu") {
                // Container for the tabbed hidden/filtered list UI
                hiddenListContainer = document.createElement("div");
                hiddenListContainer.style.display = tempSettings["enableHidingMenu"] ? "block" : "none";
                hiddenListContainer.style.margin = "10px 0";
                hiddenListContainer.style.maxHeight = "220px";
                hiddenListContainer.style.overflowY = "auto";
                hiddenListContainer.style.background = "var(--menu-color)";
                hiddenListContainer.style.border = "1px solid var(--border-color)";
                hiddenListContainer.style.borderRadius = "6px";
                hiddenListContainer.style.padding = "8px";
                hiddenListContainer.style.fontSize = "13px";

                // Tab selector
                const tabRow = document.createElement("div");
                tabRow.style.display = "flex";
                tabRow.style.marginBottom = "8px";
                tabRow.style.gap = "6px";
                const tabs = [
                    { key: "posts", label: "Hidden Posts" },
                    { key: "names", label: "Filtered Names" },
                    { key: "ids", label: "Filtered IDs" }
                ];
                let currentTab = "posts";
                const tabButtons = {};

                tabs.forEach(tab => {
                    const btn = document.createElement("button");
                    btn.textContent = tab.label;
                    btn.style.flex = "1";
                    btn.style.padding = "4px 8px";
                    btn.style.border = "none";
                    btn.style.borderRadius = "4px";
                    btn.style.setProperty("background", tab.key === currentTab ? "var(--contrast-color)" : "#222", "important");
                    btn.style.color = "#fff";
                    btn.style.cursor = "pointer";
                    btn.addEventListener("click", () => {
                        currentTab = tab.key;
                        Object.values(tabButtons).forEach(b => b.style.setProperty("background", "#222", "important"));
                        btn.style.setProperty("background", "var(--contrast-color)", "important");
                        renderList();
                    });
                    tabButtons[tab.key] = btn;
                    tabRow.appendChild(btn);
                });

                hiddenListContainer.appendChild(tabRow);

                // List area
                const listArea = document.createElement("div");
                listArea.style.overflowY = "auto";
                listArea.style.maxHeight = "160px";
                listArea.style.scrollbarWidth = "thin";
                hiddenListContainer.appendChild(listArea);

                // Render the list for the current tab
                async function renderList() {
                    listArea.innerHTML = "<span style='color: #aaa; font-size: 12px;'>Loading...</span>";
                    if (currentTab === "posts") {
                        const hiddenPostsObj = await getStoredObject(HIDDEN_POSTS_KEY);
                        const items = [];
                        for (const boardUri in hiddenPostsObj) {
                            for (const postId of (hiddenPostsObj[boardUri]?.simple || [])) {
                                items.push({ boardUri, postId, type: "simple" });
                            }
                            for (const postId of (hiddenPostsObj[boardUri]?.plus || [])) {
                                items.push({ boardUri, postId, type: "plus" });
                            }
                        }
                        if (items.length === 0) {
                            listArea.innerHTML = "<span style='color: #aaa;'>No hidden posts.</span>";
                            return;
                        }
                        listArea.innerHTML = "";
                        items.forEach(({ boardUri, postId, type }) => {
                            const row = document.createElement("div");
                            row.style.display = "flex";
                            row.style.alignItems = "center";
                            row.style.justifyContent = "space-between";
                            row.style.marginBottom = "2px";
                            row.innerHTML = `<span style="flex:1;">/${boardUri}/ #${postId} ${type === 'plus' ? '(+)' : ''}</span>`;
                            const xBtn = document.createElement("button");
                            xBtn.textContent = "✕";
                            xBtn.style.background = "none";
                            xBtn.style.border = "none";
                            xBtn.style.color = "#c00";
                            xBtn.style.cursor = "pointer";
                            xBtn.style.fontWeight = "bold";
                            xBtn.title = "Unhide";
                            xBtn.onclick = async () => {
                                const obj = await getStoredObject(HIDDEN_POSTS_KEY);
                                if (obj[boardUri]) {
                                    const arr = obj[boardUri][type] || [];
                                    const idx = arr.indexOf(Number(postId));
                                    if (idx !== -1) {
                                        arr.splice(idx, 1);
                                        obj[boardUri][type] = arr;
                                        await setStoredObject(HIDDEN_POSTS_KEY, obj);
                                        renderList();
                                    }
                                }
                            };
                            row.appendChild(xBtn);
                            listArea.appendChild(row);
                        });
                    } else if (currentTab === "names") {
                        const obj = await getStoredObject(FILTERED_NAMES_KEY);
                        let simple = obj.simple || [];
                        let plus = obj.plus || [];
                        if (simple.length === 0 && plus.length === 0) {
                            listArea.innerHTML = "<span style='color: #aaa;'>No filtered names.</span>";
                            return;
                        }
                        listArea.innerHTML = "";
                        simple.forEach(name => {
                            const row = document.createElement("div");
                            row.style.display = "flex";
                            row.style.alignItems = "center";
                            row.style.justifyContent = "space-between";
                            row.style.marginBottom = "2px";
                            row.innerHTML = `<span style="flex:1;">${name}</span>`;
                            const xBtn = document.createElement("button");
                            xBtn.textContent = "✕";
                            xBtn.style.background = "none";
                            xBtn.style.border = "none";
                            xBtn.style.color = "#c00";
                            xBtn.style.cursor = "pointer";
                            xBtn.title = "Remove filter";
                            xBtn.onclick = async () => {
                                const obj = await getStoredObject(FILTERED_NAMES_KEY);
                                obj.simple = (obj.simple || []).filter(n => n !== name);
                                await setStoredObject(FILTERED_NAMES_KEY, obj);
                                renderList();
                            };
                            row.appendChild(xBtn);
                            listArea.appendChild(row);
                        });
                        plus.forEach(name => {
                            const row = document.createElement("div");
                            row.style.display = "flex";
                            row.style.alignItems = "center";
                            row.style.justifyContent = "space-between";
                            row.style.marginBottom = "2px";
                            row.innerHTML = `<span style="flex:1;">${name} (+)</span>`;
                            const xBtn = document.createElement("button");
                            xBtn.textContent = "✕";
                            xBtn.style.background = "none";
                            xBtn.style.border = "none";
                            xBtn.style.color = "#c00";
                            xBtn.style.cursor = "pointer";
                            xBtn.title = "Remove filter+";
                            xBtn.onclick = async () => {
                                const obj = await getStoredObject(FILTERED_NAMES_KEY);
                                obj.plus = (obj.plus || []).filter(n => n !== name);
                                await setStoredObject(FILTERED_NAMES_KEY, obj);
                                renderList();
                            };
                            row.appendChild(xBtn);
                            listArea.appendChild(row);
                        });
                    } else if (currentTab === "ids") {
                        const obj = await getStoredObject(FILTERED_IDS_KEY);
                        const items = [];
                        for (const boardUri in obj) {
                            for (const threadId in obj[boardUri]) {
                                let threadObj = obj[boardUri][threadId];
                                if (Array.isArray(threadObj)) {
                                    threadObj = { simple: threadObj, plus: [] };
                                    obj[boardUri][threadId] = threadObj;
                                }
                                (threadObj.simple || []).forEach(id => {
                                    items.push({ boardUri, threadId, id, type: 'simple' });
                                });
                                (threadObj.plus || []).forEach(id => {
                                    items.push({ boardUri, threadId, id, type: 'plus' });
                                });
                            }
                        }
                        if (items.length === 0) {
                            listArea.innerHTML = "<span style='color: #aaa;'>No filtered IDs.</span>";
                            return;
                        }
                        listArea.innerHTML = "";
                        items.forEach(({ boardUri, threadId, id, type }) => {
                            const row = document.createElement("div");
                            row.style.display = "flex";
                            row.style.alignItems = "center";
                            row.style.justifyContent = "space-between";
                            row.style.marginBottom = "2px";
                            row.innerHTML = `<span style="flex:1;">/${boardUri}/ [${threadId}] ${id} ${type === 'plus' ? '(+)' : ''}</span>`;
                            const xBtn = document.createElement("button");
                            xBtn.textContent = "✕";
                            xBtn.style.background = "none";
                            xBtn.style.border = "none";
                            xBtn.style.color = "#c00";
                            xBtn.style.cursor = "pointer";
                            xBtn.title = "Remove filter";
                            xBtn.onclick = async () => {
                                const obj = await getStoredObject(FILTERED_IDS_KEY);
                                let threadObj = obj[boardUri][threadId];
                                if (Array.isArray(threadObj)) {
                                    threadObj = { simple: threadObj, plus: [] };
                                    obj[boardUri][threadId] = threadObj;
                                }
                                threadObj[type] = (threadObj[type] || []).filter(val => val !== id);
                                await setStoredObject(FILTERED_IDS_KEY, obj);
                                renderList();
                            };
                            row.appendChild(xBtn);
                            listArea.appendChild(row);
                        });
                    }
                }
                // Show/hide the container when enableHidingMenu is toggled
                checkbox.addEventListener('change', function () {
                    hiddenListContainer.style.display = checkbox.checked ? "block" : "none";
                    if (checkbox.checked) renderList();
                });
                // Insert after the enableHidingMenu option in the menu
                wrapper.appendChild(hiddenListContainer);
            }

            container.appendChild(wrapper);
        });

        return container;
    }

    // --- Menu Icon ---
    const themeSelector = document.getElementById("themesBefore");
    let link = null;
    let bracketSpan = null;
    if (themeSelector) {
        bracketSpan = document.createElement("span");
        bracketSpan.textContent = "] [ ";
        link = document.createElement("a");
        link.id = "8chanSS-icon";
        link.href = "#";
        link.textContent = "8chanSS";
        link.style.fontWeight = "bold";

        themeSelector.parentNode.insertBefore(
            bracketSpan,
            themeSelector.nextSibling
        );
        themeSelector.parentNode.insertBefore(link, bracketSpan.nextSibling);
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
    const replyTextarea = document.getElementById("qrbody");
    // Check if global toggle is enabled first
    if (!(await shortcutsGloballyEnabled())) {
        return;
    } else if (replyTextarea) {
        replyTextarea.addEventListener("keydown", async function (event) {
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
        });

        // BBCODE Combination keys and Tags - Keep with the textarea
        replyTextarea.addEventListener("keydown", function (event) {
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
    }

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

            // Loop through all catalog cells
            document.querySelectorAll(".catalogCell").forEach(cell => {
                const { board, threadNum } = getBoardAndThreadNumFromCell(cell);
                if (!board || !threadNum) return;
                const hiddenThreads = hiddenThreadsObj[board] || [];

                if (typeof showHiddenMode !== "undefined" && showHiddenMode) {
                    // Show only hidden threads, hide all others
                    if (hiddenThreads.includes(threadNum)) {
                        cell.style.display = "";
                        cell.classList.add("ss-unhide-thread");
                        cell.classList.remove("ss-hidden-thread");
                    } else {
                        cell.style.display = "none";
                        cell.classList.remove("ss-unhide-thread", "ss-hidden-thread");
                    }
                } else {
                    // Normal mode: hide hidden threads, show all others
                    if (hiddenThreads.includes(threadNum)) {
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

    // Don't scroll to bottom on post
    function preventFooterScrollIntoView() {
        const footer = document.getElementById('footer');
        if (footer && !footer._scrollBlocked) {
            footer._scrollBlocked = true; // Prevent double-wrapping
            footer.scrollIntoView = function () {
                return;
            };
        }
    }

    // Move file uploads below OP title
    (function moveFileUploadsBelowOp() {
        if (window.pageType?.isCatalog) {
            return;
        } else if (opHeadTitle && innerOP) {
            innerOP.insertBefore(opHeadTitle, innerOP.firstChild);
        }
    })();

    // Dashed underline for inlined reply backlinks and quotelinks
    document.addEventListener('click', function (e) {
        const a = e.target.closest('.panelBacklinks > a');
        if (a) {
            setTimeout(() => {
                a.classList.toggle('reply-inlined');
            }, 0);
            return;
        }
        const b = e.target.closest('a.quoteLink');
        if (b) {
            setTimeout(() => {
                b.classList.toggle('quote-inlined');
            }, 0);
        }
    });

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