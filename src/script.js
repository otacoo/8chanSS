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
// URL-based location helper (catalog, thread, index) 
// Usage: e.g. pageType.isCatalog, or to get the raw values: pageType.host or pageType.path
window.pageType = (() => {
    const path = window.location.pathname.toLowerCase();
    const currentHost = window.location.hostname.toLowerCase();

    return {
        isCatalog: /\/catalog\.html$/i.test(path),
        isThread: /\/(res|last)\/[^/]+\.html$/i.test(path),
        isLast: /\/last\/[^/]+\.html$/i.test(path),
        isIndex: /\/[^/]+\/$/i.test(path),
        is8chan: /^dev\.8ch\.(se|moe)$/.test(currentHost),
        host: currentHost,
        path: path
    };
})();
// Favicon Manager
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
//////// START OF THE SCRIPT ////////////////////
onReady(async function () {
    "use strict";
    //////// GLOBAL SELECTORS ///////////////////////
    const divThreads = document.getElementById("divThreads");
    const innerOP = document.querySelector(".innerOP");
    const divPosts = document.querySelector(".divPosts");
    const opHeadTitle = document.querySelector(".opHead.title");

    /////// Default Settings ////////////////////////
    const scriptSettings = {
        site: {
            _siteTWTitle: { type: "title", label: ":: Thread Watcher" },
            _siteSection1: { type: "separator" },
            alwaysShowTW: { label: "Pin Thread Watcher", default: false },
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
            quoteThreading: { label: "Enable Quote Threading", default: false },
            enableHashNav: { label: "Hash Navigation", default: false },
            threadStatsInHeader: { label: "Thread Stats in Header", default: false },
            watchThreadOnReply: { label: "Watch Thread on Reply", default: true },
            scrollToBottom: { label: "Don't Scroll to Bottom on Reply", default: true }
        },
        catalog: {
            enableCatalogImageHover: { label: "Catalog Image Hover", default: true },
            enableThreadHiding: { label: "Enable Thread Hiding", default: false },
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
            highlightOnYou: { label: "Style (You) posts", default: true },
            enableStickyQR: { label: "Enable Sticky Quick Reply", default: false },
            fadeQuickReply: { label: "Fade Quick Reply", default: false },
            enableFitReplies: { label: "Fit Replies", default: false },
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
            threadHideCloseBtn: { label: "Hide Inline Close Button", default: false },
            hideHiddenPostStub: { label: "Hide Stubs of Hidden Posts", default: false, },
            hideCheckboxes: { label: "Hide Post Checkbox", default: false }
        },
        miscel: {
            enableShortcuts: { label: "Enable Keyboard Shortcuts", type: "checkbox", default: true },
            enhanceYoutube: { label: "Enhanced Youtube Links", type: "checkbox", default: true },
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
            enableIdFilters: { label: "Show only posts by ID when ID is clicked", type: "checkbox", default: true },
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
            }
        }
    };

    Object.freeze(scriptSettings); // Prevent accidental mutation of original settings

    // Flatten settings for backward compatibility with existing functions
    let flatSettings = null;
    function flattenSettings() {
        if (flatSettings !== null) return flatSettings; // Return cached if already flattened
        const result = {};
        Object.keys(scriptSettings).forEach((category) => {
            Object.keys(scriptSettings[category]).forEach((key) => {
                if (key.startsWith('_')) return;
                // Also flatten any sub-options
                result[key] = scriptSettings[category][key];
                if (!scriptSettings[category][key].subOptions) return;
                Object.keys(scriptSettings[category][key].subOptions).forEach(
                    (subKey) => {
                        const fullKey = `${key}_${subKey}`;
                        result[fullKey] =
                            scriptSettings[category][key].subOptions[subKey];
                    }
                );
            });
        });
        flatSettings = Object.freeze(result);
        return flatSettings;
    }
    flattenSettings();

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
        if (flatSettings[key].type === "number") return Number(val);
        if (flatSettings[key].type === "text") return String(val).replace(/[<>"']/g, "").slice(0, flatSettings[key].maxLength || 32);
        if (flatSettings[key].type === "textarea") return String(val);
        if (flatSettings[key].type === "select") return String(val);
        return val === "true";
    }

    async function setSetting(key, value) {
        // Always store as string for consistency
        try {
            await GM.setValue("8chanSS_" + key, String(value));
        } catch (err) {
            console.error(`Failed to set setting for key ${key}:`, err);
        }
    }

    // --- Root CSS Class Toggles ---
    async function featureCssClassToggles() {
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
            highlightOnYou: "highlight-you",
            threadHideCloseBtn: "hide-close-btn",
            hideCheckboxes: "hide-checkboxes",
            hideNoCookieLink: "hide-nocookie",
            autoExpandTW: "auto-expand-tw",
            hideJannyTools: "hide-jannytools"
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
        if (pageType.isCatalog) {
            document.documentElement.classList.add("is-catalog");
        } else {
            document.documentElement.classList.remove("is-catalog");
        }
        if (pageType.isThread) {
            document.documentElement.classList.add("is-thread");
        } else {
            document.documentElement.classList.remove("is-thread");
        }
        if (pageType.isIndex) {
            document.documentElement.classList.add("is-index");
        } else {
            document.documentElement.classList.remove("is-index");
        }
    }
    // Init
    featureCssClassToggles();

    // Sidebar Right/Left
    async function featureSidebar() {
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
    }
    // Init
    featureSidebar();

    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // Custom CSS injection
    (function injectCustomCss() {
        let css = "";

        // Always inject site CSS for 8chan domains
        if (pageType.is8chan) {
            css += "<%= grunt.file.read('tmp/site.min.css').replace(/\\(^\")/g, '') %>";
        }
        // Inject CSS based on page type
        if (pageType.isThread) {
            css += "<%= grunt.file.read('tmp/thread.min.css').replace(/\\(^\")/g, '') %>";
        } else if (pageType.isCatalog) {
            css += "<%= grunt.file.read('tmp/catalog.min.css').replace(/\\(^\")/g, '') %>";
        }

        // Only inject if not already present and if there's CSS to inject
        if (css && !document.getElementById('8chSS')) {
            const style = document.createElement('style');
            style.id = '8chSS';
            style.textContent = css;
            document.head.appendChild(style);
        }
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
        { key: "enableIdFilters", fn: enableIdFiltering },
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
        if (pageType.isCatalog) {
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

    //////////// FEATURES ///////////////////////////////////////////////////////////////////////////////////////////////////////////

    // --- Feature: Save Scroll Position ---
    async function featureSaveScroll() {
        if (!pageType.isThread) return;

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
        function observePostCount() {
            if (!divPosts) return;
            const observer = new MutationObserver(() => {
                updateUnseenCountFromSaved();
            });
            observer.observe(divPosts, { childList: true, subtree: false });
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
            observePostCount();
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
        observePostCount();
    }

    // --- Feature: Header Catalog Links ---
    async function featureHeaderCatalogLinks() {
        async function appendCatalogToLinks() {
            const navboardsSpan = document.getElementById("navBoardsSpan");
            if (navboardsSpan) {
                const links = navboardsSpan.getElementsByTagName("a");
                const openInNewTab = await getSetting(
                    "enableHeaderCatalogLinks_openInNewTab"
                );

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

        // Debounced observer callback for performance
        const debouncedAppend = debounce(appendCatalogToLinks, 100);
        const config = { childList: true, subtree: true };
        const navboardsSpan = document.getElementById("navBoardsSpan");
        // Prevent multiple observers
        if (navboardsSpan && !navboardsSpan._catalogLinksObserverAttached) {
            const observer = new MutationObserver(debouncedAppend);
            observer.observe(navboardsSpan, config);
            navboardsSpan._catalogLinksObserverAttached = true;
        }
    }

    // --- Feature: Always Open Catalog Threads in New Tab ---
    function catalogThreadsInNewTab() {
        if (!pageType.isCatalog) return;

        // Set target="_blank" for existing cells
        catalogDiv.querySelectorAll('.catalogCell a.linkThumb').forEach(link => {
            if (link.getAttribute('target') !== '_blank') {
                link.setAttribute('target', '_blank');
            }
        });

        // Use event delegation for future clicks (no MutationObserver needed)
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
        const docElement = document.documentElement;
        const SCROLLBAR_WIDTH = window.innerWidth - docElement.clientWidth; // Calculate scrollbar width once

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

            const MEDIA_BOTTOM_MARGIN_PX = window.innerHeight * (MEDIA_BOTTOM_MARGIN / 100); // Calculate scrollbar width

            let x, y;

            // Try to show on the right of the cursor first
            let rightX = event.clientX + MEDIA_OFFSET;
            let leftX = event.clientX - MEDIA_OFFSET - mw;

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

            // If filemime is missing, fallback: use src as-is if in catalogCell or matches extensionless pattern
            if (!filemime) {
                if (
                    thumbNode.closest('.catalogCell') ||
                    /^\/\.media\/t?_[a-f0-9]{40,}$/i.test(thumbnailSrc.replace(/\\/g, ''))
                ) {
                    return thumbnailSrc;
                }
                return null;
            }

            // Get parent link to check for small image dimensions
            const parentA = thumbNode.closest("a.linkThumb, a.imgLink");
            const fileWidth = parentA ? parseInt(parentA.getAttribute("data-filewidth"), 10) : null;
            const fileHeight = parentA ? parseInt(parentA.getAttribute("data-fileheight"), 10) : null;
            const isSmallImage = (fileWidth && fileWidth <= 220) || (fileHeight && fileHeight <= 220);

            // Special case: small PNG, no t_, no extension: leave src alone
            if (
                isSmallImage &&
                filemime && filemime.toLowerCase() === "image/png" &&
                !/\/t_/.test(thumbnailSrc) &&
                !/\.[a-z0-9]+$/i.test(thumbnailSrc)
            ) {
                return thumbnailSrc;
            }

            // For small images, use the original src directly without transformation
            if (isSmallImage && thumbnailSrc.match(/\/\.media\/[^\/]+\.[a-zA-Z0-9]+$/)) {
                return thumbnailSrc;
            }

            // If "t_" thumbnail
            if (/\/t_/.test(thumbnailSrc)) {
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

            // If src is a direct hash (no t_) and has no extension, append extension unless APNG or m4v
            if (
                thumbnailSrc.match(/^\/\.media\/[a-f0-9]{40,}$/i) && // hash only, no extension
                !/\.[a-z0-9]+$/i.test(thumbnailSrc)
            ) {
                // Special cases: APNG and m4v - do not append extension
                if (filemime && (filemime.toLowerCase() === "image/apng" || filemime.toLowerCase() === "video/x-m4v")) {
                    return thumbnailSrc;
                }

                const ext = filemime ? getExtensionForMimeType(filemime) : null;
                if (!ext) {
                    // Fallback: load as-is
                    return thumbnailSrc;
                }
                return thumbnailSrc + ext;
            }

            if (
                /\/spoiler\.png$/i.test(thumbnailSrc) ||
                /\/custom\.spoiler$/i.test(thumbnailSrc) ||
                /\/audioGenericThumb\.png$/i.test(thumbnailSrc)
            ) {
                if (parentA && parentA.getAttribute("href")) {
                    return sanitizeUrl(parentA.getAttribute("href"));
                }
                return null;
            }
            return null;
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
                let container = thumb.closest("a.linkThumb, a.imgLink");
                if (container && !container.style.position) {
                    container.style.position = "relative";
                }
                floatingMedia = document.createElement("audio");
                floatingMedia.src = fullSrc;
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
                const cleanup = () => cleanupFloatingMedia();
                thumb.addEventListener("mouseleave", cleanup, { once: true });
                if (container) container.addEventListener("click", cleanup, { once: true });
                window.addEventListener("scroll", cleanup, { passive: true, once: true });
                cleanupFns.push(() => thumb.removeEventListener("mouseleave", cleanup));
                if (container) cleanupFns.push(() => container.removeEventListener("click", cleanup));
                cleanupFns.push(() => window.removeEventListener("scroll", cleanup));
                return;
            }

            // --- Image or Video ---
            floatingMedia = isVideo ? document.createElement("video") : document.createElement("img");
            floatingMedia.src = fullSrc;
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
            function mouseMoveHandler(ev) {
                lastMouseEvent = ev;
                positionFloatingMedia(ev);
            }
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
            function leaveHandler() { cleanupFloatingMedia(); }
            thumb.addEventListener("mouseleave", leaveHandler, { once: true });
            window.addEventListener("scroll", leaveHandler, { passive: true, once: true });
            cleanupFns.push(() => thumb.removeEventListener("mouseleave", leaveHandler));
            cleanupFns.push(() => window.removeEventListener("scroll", leaveHandler));
        }

        // --- Attach listeners to thumbnails and audio links ---
        function attachThumbListeners(root = document) {
            // Attach to all a.linkThumb > img and a.imgLink > img in root
            root.querySelectorAll("a.linkThumb > img, a.imgLink > img").forEach(thumb => {
                if (!thumb._fullImgHoverBound) {
                    thumb.addEventListener("mouseenter", onThumbEnter);
                    thumb._fullImgHoverBound = true;
                }
            });
            // If root itself is such an img, attach as well
            if (
                root.tagName === "IMG" &&
                root.parentElement &&
                (root.parentElement.matches("a.linkThumb") || root.parentElement.matches("a.imgLink")) &&
                !root._fullImgHoverBound
            ) {
                root.addEventListener("mouseenter", onThumbEnter);
                root._fullImgHoverBound = true;
            }
        }

        // Attach to all existing thumbs at startup
        attachThumbListeners();

        // Observe for any new nodes under #divThreads
        if (divThreads) {
            const observer = new MutationObserver((mutations) => {
                // Flatten all added nodes from all mutations into a single array
                const addedElements = [];
                for (const mutation of mutations) {
                    for (const node of mutation.addedNodes) {
                        if (node.nodeType === 1) {
                            addedElements.push(node);
                        }
                    }
                }
                // Attach listeners for each added element
                addedElements.forEach(node => attachThumbListeners(node));
            });
            observer.observe(divThreads, { childList: true, subtree: true });
        }
    }

    // --- Feature: Blur Spoilers + Remove Spoilers suboption ---
    function featureBlurSpoilers() {
        if (pageType.isCatalog) return;
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

        async function processImgLink(link, idx = null) {
            const img = link.querySelector("img");
            if (!img) {
                return;
            }
            // Skip if src is already a full media file (not t_ and has extension)
            if (
                /\/\.media\/[^\/]+?\.[a-zA-Z0-9]+$/.test(img.src) && // has extension
                !/\/\.media\/t_[^\/]+?\.[a-zA-Z0-9]+$/.test(img.src) // not a thumbnail
            ) {
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
                    return;
                }
                // Extract filename without extension
                const match = href.match(/\/\.media\/([^\/]+)\.[a-zA-Z0-9]+$/);
                if (!match) {
                    return;
                }

                // Get file extension from data-filemime
                const fileMime = link.getAttribute("data-filemime") || "";
                const ext = getExtensionForMimeType(fileMime);

                // Check for data-filewidth attribute
                const fileWidthAttr = link.getAttribute("data-filewidth");
                const fileHeightAttr = link.getAttribute("data-fileheight");
                let transformedSrc;
                if (
                    (fileWidthAttr && Number(fileWidthAttr) < 250) ||
                    (fileHeightAttr && Number(fileHeightAttr) < 250)
                ) {
                    // Use the full image, not the thumbnail, and append extension
                    transformedSrc = `/.media/${match[1]}${ext}`;
                } else if (!hasFilenameExtension && isCustomSpoiler) {
                    // Use the thumbnail path (t_filename) and append extension
                    transformedSrc = `/.media/t_${match[1]}`;
                } else {
                    return;
                }
                // Temporarily lock rendered size to avoid layout shift
                const initialWidth = img.offsetWidth;
                const initialHeight = img.offsetHeight;
                img.style.width = initialWidth + "px";
                img.style.height = initialHeight + "px";

                // Change the src
                img.src = transformedSrc;

                // Set width/height to its initial thumbnail size when loading img again
                img.onload = function () {
                    img.style.width = img.naturalWidth + "px";
                    img.style.height = img.naturalHeight + "px";
                };

                // If Remove Spoilers is enabled, do not apply blur, just show the thumbnail
                if (await getSetting("blurSpoilers_removeSpoilers")) {
                    img.style.filter = "";
                    img.style.transition = "";
                    img.style.border = "1px dotted var(--border-color)";
                    img.onmouseover = null;
                    img.onmouseout = null;
                    return;
                } else {
                    img.style.filter = "blur(5px)";
                    img.style.transition = "filter 0.3s ease";
                    img.addEventListener("mouseover", () => {
                        img.style.filter = "none";
                    });
                    img.addEventListener("mouseout", () => {
                        img.style.filter = "blur(5px)";
                    });
                }
            }
        }

        // Initial run: process all existing spoiler links
        const spoilerLinks = document.querySelectorAll("a.imgLink");
        spoilerLinks.forEach((link, idx) => processImgLink(link, idx));

        // Efficiently process only new .imgLink anchors on mutation
        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType !== 1) return; // Only process element nodes
                    if (node.classList && node.classList.contains('imgLink')) {
                        processImgLink(node);
                    } else if (node.querySelectorAll) {
                        // If the node is an element, check for .imgLink descendants
                        node.querySelectorAll('.imgLink').forEach(link => processImgLink(link));
                    }
                });
            });
        });
        observer.observe(divThreads, { childList: true, subtree: true });
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

    // Observe #watchedMenu for changes to update highlights dynamically
    const watchedMenu = document.getElementById("watchedMenu");
    if (watchedMenu) {
        const observer = new MutationObserver(() => {
            highlightMentions();
        });
        observer.observe(watchedMenu, { childList: true, subtree: true });
    }

    // --- Feature: Watch Thread on Reply ---
    async function featureWatchThreadOnReply() {
        if (pageType.isCatalog || pageType.isIndex) return;

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

        function showThreadWatcher() {
            const watchedMenu = document.getElementById("watchedMenu");
            if (watchedMenu) {
                watchedMenu.style.display = "flex";
            }
        }

        showThreadWatcher();
    }

    // --- Feature: Mark All Threads as Read Button ---
    function markAllThreadsAsRead() {
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

        // Observe the watchedMenu for changes to enable/disable the button dynamically
        const watchedMenu = document.querySelector('#watchedMenu > div.floatingContainer');
        let observer = null;
        if (watchedMenu) {
            const debouncedUpdate = debounce(updateButtonState, 100);
            observer = new MutationObserver(debouncedUpdate);
            observer.observe(watchedMenu, { childList: true, subtree: true });

            // Disconnect observer when watchedMenu is removed or hidden
            const removalObserver = new MutationObserver(() => {
                if (!document.body.contains(watchedMenu) || watchedMenu.style.display === "none") {
                    observer.disconnect();
                    removalObserver.disconnect();
                }
            });
            removalObserver.observe(document.body, { childList: true, subtree: true });
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
    }
    markAllThreadsAsRead();

    ///////// THREAD WATCHER END ////////////////////////////////////////////////////////////////////////////////////////////////////

    // --- Feature: Hash Navigation ---
    // Adapted from impregnator's code for 8chan Lightweight Extended Suite
    // MIT License
    // https://greasyfork.org/en/scripts/533173-8chan-lightweight-extended-suite
    function hashNavigation() {
        // Only proceed if the page is a thread
        if (!pageType.isThread) return;

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
        // Patch tooltips if present
        if (window.tooltips) {
            // Patch loadTooltip and addLoadedTooltip to always call addHashLinks
            ['loadTooltip', 'addLoadedTooltip'].forEach(fn => {
                if (typeof tooltips[fn] === 'function') {
                    const orig = tooltips[fn];
                    tooltips[fn] = function (...args) {
                        const result = orig.apply(this, args);
                        // Try to find the container to apply hash links
                        let container = args[0];
                        if (container && container.nodeType === Node.ELEMENT_NODE) {
                            addHashLinks(container);
                        }
                        return result;
                    };
                }
            });
            // Patch addInlineClick and processQuote to skip hash links
            ['addInlineClick', 'processQuote'].forEach(fn => {
                if (typeof tooltips[fn] === 'function') {
                    const orig = tooltips[fn];
                    tooltips[fn] = function (quote, ...rest) {
                        if (
                            !quote.href ||
                            quote.classList.contains('hash-link') ||
                            quote.closest('.hash-link-container') ||
                            quote.href.includes('#q')
                        ) {
                            return;
                        }
                        return orig.apply(this, [quote, ...rest]);
                    };
                }
            });
        }

        // Observe for dynamically added quote/backlink links
        const postsContainer = divThreads || document.body;

        // Event delegation for hash link clicks
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

        const debouncedAddHashLinks = debounce(addHashLinks, 25);

        const observer = new MutationObserver(mutations => {
            let shouldUpdate = false;
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        shouldUpdate = true;
                    }
                });
            });
            if (shouldUpdate) debouncedAddHashLinks();
        });
        observer.observe(divThreads, { childList: true, subtree: true });
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
    async function featureBeepOnYou() {
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

        // Create MutationObserver to detect when you are quoted
        const observer = new MutationObserver((mutations) => {
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

        observer.observe(divPosts, { childList: true, subtree: false });

        // Listen for settings changes
        window.addEventListener("8chanSS_settingChanged", async (e) => {
            if (e.detail && e.detail.key) {
                const key = e.detail.key;
                if (key === "beepOnYou") {
                    beepOnYouSetting = await getSetting("beepOnYou");
                } else if (key === "notifyOnYou") {
                    notifyOnYouSetting = await getSetting("notifyOnYou");
                } else if (key === "notifyOnYou_customMessage") {
                    const customMsg = await getSetting("notifyOnYou_customMessage");
                    if (customMsg) customMsgSetting = customMsg;
                }
            }
        });
    }
    // Init
    featureBeepOnYou();

    // --- Feature: Enhanced Youtube links ---
    function enhanceYouTubeLinks() {
        if (pageType.isCatalog) return;

        // In-memory cache and order tracker (order is stored as a special property)
        const ytTitleCache = {};
        const MAX_CACHE_SIZE = 350;
        const ORDER_KEY = "_order";

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
        // Save cache and order to localStorage
        function saveCache() {
            try {
                localStorage.setItem('ytTitleCache', JSON.stringify(ytTitleCache));
            } catch (e) { }
        }
        loadCache();

        // Helper to extract YouTube video ID from URL
        function getYouTubeId(url) {
            try {
                const u = new URL(url);
                if (u.hostname.endsWith('youtube.com')) {
                    return u.searchParams.get('v');
                }
                if (u.hostname === 'youtu.be') {
                    return u.pathname.slice(1);
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

        // Fetch video title using YouTube oEmbed (no API key needed)
        async function fetchYouTubeTitle(videoId) {
            // Sanitize the videoId before using it
            const cleanId = sanitizeYouTubeId(videoId);
            if (!cleanId) return null;
            // Check cache first
            if (ytTitleCache.hasOwnProperty(cleanId)) {
                // Move to end to mark as recently used
                const idx = ytTitleCache[ORDER_KEY].indexOf(cleanId);
                if (idx !== -1) {
                    ytTitleCache[ORDER_KEY].splice(idx, 1);
                }
                ytTitleCache[ORDER_KEY].push(cleanId);
                saveCache();
                return Promise.resolve(ytTitleCache[cleanId]);
            }
            return fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${cleanId}&format=json`)
                .then(r => r.ok ? r.json() : null)
                .then(data => {
                    const title = data ? data.title : null;
                    if (title) {
                        ytTitleCache[cleanId] = title;
                        ytTitleCache[ORDER_KEY].push(cleanId);
                        // Evict oldest if over limit
                        while (ytTitleCache[ORDER_KEY].length > MAX_CACHE_SIZE) {
                            const oldest = ytTitleCache[ORDER_KEY].shift();
                            delete ytTitleCache[oldest];
                        }
                        saveCache();
                    }
                    return title;
                })
                .catch(() => null);
        }
        // Process all YouTube links
        function processLinks(root = document) {
            root.querySelectorAll('a[href*="youtu"]').forEach(link => {
                if (link.dataset.ytEnhanced) return;
                const videoId = getYouTubeId(link.href);
                if (!videoId) return;
                link.dataset.ytEnhanced = "1";
                // Replace link text with favicon, [Youtube], and video title
                fetchYouTubeTitle(videoId).then(title => {
                    if (title) {
                        link.innerHTML = `<img class="yt-icon" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAMCAYAAABr5z2BAAABIklEQVQoz53LvUrDUBjG8bOoOammSf1IoBSvoCB4JeIqOHgBLt6AIMRBBQelWurQ2kERnMRBsBUcIp5FJSBI5oQsJVkkUHh8W0o5nhaFHvjBgef/Mq+Q46RJBMkI/vE+aOus956tnEswIZe1LV0QyJ5sE2GzgZfVMtRNIdiDpccEssdlB1mW4bvTwdvWJtRdErM7U+8S/FJykCRJX5qm+KpVce8UMNLRLbulz4iSjTAMh6Iowsd5BeNadp3nUF0VlxAEwZBotXC0Usa4ll3meZdA1iguwvf9vpvDA2wvmKgYGtSud8suDB4TyGr2PF49D/vra9jRZ1BVdknMzgwuCGSnZEObwu6sBnVTCHZiaC7BhFx2PKdxUidiAH/4lLo9Mv0DELVs9qsOHXwAAAAASUVORK5CYII="><span>[Youtube]</span> ${title}`;
                    }
                });
            });
        }
        // Initial run
        processLinks(document);
        // Observe for dynamically added links
        new MutationObserver(() => processLinks(divThreads)).observe(divThreads, { childList: true, subtree: true });
    }

    // --- Feature: Convert to 12-hour format (AM/PM) ---
    function featureLabelCreated12h() {
        if (pageType.isCatalog) return;

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

        // Process only new .labelCreated spans on mutation
        if (typeof divPosts !== "undefined" && divPosts) {
            new MutationObserver(mutations => {
                mutations.forEach(mutation => {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType !== 1) return; // Only process element nodes
                        if (node.classList && node.classList.contains('labelCreated')) {
                            convertLabelCreatedSpan(node);
                        } else if (node.querySelectorAll) {
                            // If the node is an element, check for .labelCreated descendants
                            node.querySelectorAll('.labelCreated').forEach(convertLabelCreatedSpan);
                        }
                    });
                });
            }).observe(divPosts, { childList: true, subtree: true });
        }
    }

    // --- Feature: Truncate Filenames and Show Only Extension ---
    function truncateFilenames(filenameLength) {
        if (pageType.isCatalog) return;

        function processLinks(root = document, fromObserver = false) {
            const links = root.querySelectorAll('a.originalNameLink');
            links.forEach(link => {
                // Skip if already processed
                if (link.dataset.truncated === "1") return;
                const fullFilename = link.getAttribute('download');
                if (!fullFilename) {
                    return;
                }
                const lastDot = fullFilename.lastIndexOf('.');
                if (lastDot === -1) {
                    return; // No extension found
                }
                const name = fullFilename.slice(0, lastDot);
                const ext = fullFilename.slice(lastDot);
                // Only truncate if needed
                let truncated = fullFilename;
                if (name.length > filenameLength) {
                    truncated = name.slice(0, filenameLength) + '(...)' + ext;
                }
                // Set initial truncated text
                link.textContent = truncated;
                // Mark as processed to avoid reprocessing
                link.dataset.truncated = "1";
                // Show full filename on hover, revert on mouseout
                link.addEventListener('mouseenter', function () {
                    link.textContent = fullFilename;
                });
                link.addEventListener('mouseleave', function () {
                    link.textContent = truncated;
                });
                // Optional: set title attribute for accessibility
                link.title = fullFilename;
            });
        }
        // Initial processing
        processLinks(document, false);
        // Set up observer for dynamically added links in #divThreads
        if (divThreads) {
            new MutationObserver((mutations) => {
                mutations.forEach(mutation => {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === 1) { // ELEMENT_NODE
                            // If the node itself is a link, process it directly
                            if (node.matches && node.matches('a.originalNameLink')) {
                                processLinks(node, true);
                            } else {
                                // Otherwise, process any links within the subtree
                                processLinks(node, true);
                            }
                        }
                    });
                });
            }).observe(divThreads, { childList: true, subtree: true });
        }
    }

    // --- Feature: Show Thread Stats in Header ---
    function threadInfoHeader(retries = 10, delay = 200) {
        const navHeader = document.querySelector('.navHeader');
        const navOptionsSpan = document.getElementById('navOptionsSpan');
        const postCountEl = document.getElementById('postCount');
        const userCountEl = document.getElementById('userCountLabel');
        const fileCountEl = document.getElementById('fileCount');

        // Retry utility function for modularity and readability
        function retryIfElementsMissing(checkFn, callback, retries, delay) {
            if (!checkFn()) {
                if (retries > 0) {
                    setTimeout(() => retryIfElementsMissing(checkFn, callback, retries - 1, delay), delay);
                }
                return true;
            }
            return false;
        }

        if (retryIfElementsMissing(
            () => navHeader && navOptionsSpan && postCountEl && userCountEl && fileCountEl,
            () => threadInfoHeader(retries - 1, delay),
            retries,
            delay
        )) return;

        // Get stats
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

        // Observe changes to stats and update header accordingly (only once)
        if (!threadInfoHeader._observerInitialized) {
            const statIds = ['postCount', 'userCountLabel', 'fileCount'];

            if (!threadInfoHeader._debouncedUpdate) {
                threadInfoHeader._debouncedUpdate = debounce(() => threadInfoHeader(0, delay), 100);
            }
            statIds.forEach(id => {
                const el = document.getElementById(id);
                if (el) {
                    new MutationObserver(threadInfoHeader._debouncedUpdate).observe(el, { childList: true, subtree: false, characterData: true });
                }
            });
            threadInfoHeader._observerInitialized = true;
        }
    }

    // --- Feature: Advanced Media Viewer ---
    function mediaViewerPositioning() {
        // Set native 8chan setting
        localStorage.setItem("mediaViewer", "true");

        // Apply the appropriate class based on settings
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
            } else {
                // For 'native', we don't add any class
            }
        }

        // Check if media viewer exists and set up if needed
        function setupIfMediaViewerExists() {
            const mediaViewer = document.getElementById('media-viewer');
            if (mediaViewer) {
                // Media viewer already exists, apply class immediately
                updateMediaViewerClass();
                return true;
            }
            return false;
        }

        // Try to set up immediately if media viewer already exists
        if (setupIfMediaViewerExists()) {
            // Media viewer already exists, no need for observer
        } else {
            // Set up a one-time observer to detect when the media viewer first appears
            const observer = new MutationObserver((mutations) => {
                for (const mutation of mutations) {
                    if (mutation.addedNodes.length) {
                        for (const node of mutation.addedNodes) {
                            if (node.id === 'media-viewer' ||
                                (node.nodeType === 1 && node.querySelector('#media-viewer'))) {
                                updateMediaViewerClass();
                                // Disconnect observer since we only need to detect first appearance
                                observer.disconnect();
                                return;
                            }
                        }
                    }
                }
            });
            // Observe only until media viewer is found
            observer.observe(document.body, { childList: true, subtree: false });
        }
    }

    // --- Feature: Highlight New IDs ---
    async function featureHighlightNewIds() {
        if (pageType.isLast || pageType.isCatalog) return;

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

        // Helper: Highlight IDs in a given root (default: threads)
        function highlightIds(root = divPosts) {
            // Build frequency map
            const idFrequency = {};
            const labelSpans = root.querySelectorAll('.labelId');
            labelSpans.forEach(span => {
                const id = span.textContent.trim();
                idFrequency[id] = (idFrequency[id] || 0) + 1;
            });

            // Track first occurrence and apply class
            const seen = {};
            labelSpans.forEach(span => {
                const id = span.textContent.trim();
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

        // Observe divPosts for newly added posts
        const observer = new MutationObserver(mutations => {
            let needsUpdate = false;
            for (const mutation of mutations) {
                for (const node of mutation.addedNodes) {
                    if (node.nodeType === 1 && node.querySelector && node.querySelector('.labelId')) {
                        needsUpdate = true;
                        break;
                    }
                }
                if (needsUpdate) break;
            }
            if (needsUpdate) {
                highlightIds();
            }
        });
        observer.observe(divPosts, { childList: true, subtree: true });
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

        // --- Core Threading Logic ---
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

        // --- Threading Handlers ---
        function threadAllPosts() {
            processPosts(document.querySelectorAll('.divPosts .postCell'));
        }

        function threadNewPosts() {
            const allPosts = document.querySelectorAll('.divPosts .postCell');
            processPosts(Array.from(allPosts).slice(-5));
        }

        // --- Post Observer ---
        function setupPostObserver() {
            const observer = new MutationObserver(mutations => {
                mutations.forEach(mutation => {
                    if (mutation.addedNodes.length) {
                        setTimeout(threadNewPosts, 50);
                    }
                });
            });

            if (typeof divPosts !== 'undefined') {
                observer.observe(divPosts, {
                    childList: true,
                    subtree: false
                });
            }
        }

        // --- Refresh Button ---
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
        setupPostObserver();
    }

    // --- Feature: Last 50 Button ---
    function featureLastFifty() {
        if (!pageType.isCatalog) return;

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

        // Set up MutationObserver for dynamic updates
        if (!divThreads) return;

        // Debounce to avoid excessive calls
        const debouncedUpdate = debounce(() => addLastLinkButtons(document), 50);
        const observer = new MutationObserver(debouncedUpdate);

        observer.observe(divThreads, { childList: true, subtree: false });
    }

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
        menu.style.background = "rgb(from var(--menu-color) r g b / 1)";
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
        header.style.background = "rgb(from var(--contrast-color) r g b / 1)";
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
        tabContent.style.maxHeight = "65vh";
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

        // Create tabs
        const tabs = {
            site: {
                label: "Site",
                content: createTabContent("site", tempSettings),
            },
            threads: {
                label: "Threads",
                content: createTabContent("threads", tempSettings),
            },
            catalog: {
                label: "Catalog",
                content: createTabContent("catalog", tempSettings),
            },
            styling: {
                label: "Style",
                content: createTabContent("styling", tempSettings),
            },
            miscel: {
                label: "Misc.",
                content: createTabContent("miscel", tempSettings),
            },
            shortcuts: {
                label: "⌨️",
                content: createShortcutsTab(),
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
        saveBtn.addEventListener("click", async function () {
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
        });
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
        resetBtn.addEventListener("click", async function () {
            if (confirm("Reset all 8chanSS settings to defaults?")) {
                // Remove all 8chanSS_ GM values
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
        });
        buttonContainer.appendChild(resetBtn);

        menu.appendChild(buttonContainer);

        // Info
        const info = document.createElement("div");
        info.style.fontSize = "11px";
        info.style.padding = "0 18px 12px";
        info.style.opacity = "0.7";
        info.style.textAlign = "center";
        info.innerHTML = 'Press Save to apply changes. Page will reload. - <a href="https://github.com/otacoo/8chanSS/blob/main/CHANGELOG.md" target="_blank" title="Check the changelog." style="color: var(--link-color); text-decoration: underline dashed;">Ver. <%= version %></a>';
        menu.appendChild(info);

        document.body.appendChild(menu);
        return menu;
    }

    // Helper function to create tab content
    function createTabContent(category, tempSettings) {
        const container = document.createElement("div");
        const categorySettings = scriptSettings[category];

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
            { keys: ["SHIFT", "M1"], action: "Hide Thread in Catalog" },
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
        let menu = await createSettingsMenu();
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
        if (event.key === "Tab") {
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
            const isThread = pageType.isThread;
            const isCatalog = pageType.isCatalog;
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
            await setSetting("quoteThreading", !current);

            // Show a quick notification
            try {
                const msg = `Quote threading ${!current ? "enabled" : "disabled"}`;
                if (window.showToast) {
                    window.showToast(msg);
                } else {
                    // fallback: flash a message near the settings icon
                    const icon = document.getElementById("8chanSS-icon");
                    if (icon) {
                        let toast = document.createElement("span");
                        toast.textContent = msg;
                        toast.style.position = "absolute";
                        toast.style.background = "#222";
                        toast.style.color = "#fff";
                        toast.style.padding = "2px 8px";
                        toast.style.borderRadius = "4px";
                        toast.style.fontSize = "13px";
                        toast.style.zIndex = 99999;
                        toast.style.left = (icon.offsetLeft - 50) + "px";
                        toast.style.top = "27px";
                        toast.style.transition = "opacity 0.3s";
                        icon.parentNode.appendChild(toast);
                        setTimeout(() => { toast.style.opacity = "0"; }, 900);
                        setTimeout(() => { toast.remove(); }, 1200);
                    }
                }
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
    if (replyTextarea) {
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
            if (!pageType.isCatalog) return;

            // Add the Show Hidden button
            onReady(addShowHiddenButton);

            // Apply hidden threads on load and after DOM mutations
            onReady(applyHiddenThreads);

            // Scope event listener to catalog container only
            const catalogContainer = document.querySelector(".catalogWrapper, .catalogDiv");
            if (catalogContainer) {
                catalogContainer.addEventListener("click", onCatalogCellClick, true);

                // Re-apply hidden threads if catalog is dynamically updated
                const observer = new MutationObserver(applyHiddenThreads);
                observer.observe(catalogContainer, { childList: true, subtree: false });
            }
        }
        hideThreadsOnRefresh();
    }

    ////// KEYBOARD END /////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // --- Misc Fixes ---

    // Captcha input no history
    function noCaptchaHistory() {
        const captchaInput = document.getElementById("QRfieldCaptcha");
        if (captchaInput) {
            captchaInput.autocomplete = "off";
        }
    }
    noCaptchaHistory();

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
    function moveFileUploadsBelowOp() {
        if (pageType.isCatalog) {
            return;
        } else if (opHeadTitle && innerOP) {
            innerOP.insertBefore(opHeadTitle, innerOP.firstChild);
        }
    }
    moveFileUploadsBelowOp();

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

    // --- Feature: Show all posts by ID ---
    function enableIdFiltering() {
        if (!pageType.isThread) return;

        const postCellSelector = ".postCell";
        const labelIdSelector = ".labelId";
        const hiddenClassName = "is-hidden-by-filter";
        let activeFilterColor = null;
        // Filter posts    
        function applyFilter(targetRgbColor) {
            activeFilterColor = targetRgbColor;
            document.querySelectorAll(postCellSelector).forEach(cell => {
                const label = cell.querySelector(labelIdSelector);
                const matches = label && window.getComputedStyle(label).backgroundColor === targetRgbColor;
                cell.classList.toggle(hiddenClassName, !!targetRgbColor && !matches);
            });
        }
        // Click handler
        function handleClick(event) {
            const clickedLabel = event.target.closest(labelIdSelector);
            // Only trigger if inside a .postCell and not inside a preview
            if (clickedLabel && clickedLabel.closest(postCellSelector) && !clickedLabel.closest(".de-pview")) {
                event.preventDefault();
                event.stopPropagation();

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
        document.body.addEventListener("click", handleClick);
    }
});