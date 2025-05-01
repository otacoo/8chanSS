////////// HELPERS ///////////////////////
function onReady(fn) {
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", fn, { once: true });
    } else {
        fn();
    }
}
///// JANK THEME FLASH FIX LOAD ASAP /////////
(function () {
    // Get the user's selected theme from localStorage
    const userTheme = localStorage.selectedTheme;
    if (!userTheme) return;

    // Try to swap the theme <link> as early as possible
    const swapTheme = () => {
        // Find the <link rel="stylesheet"> for the board's theme
        const themeLink = Array.from(
            document.getElementsByTagName("link")
        ).find(
            (link) =>
                link.rel === "stylesheet" &&
                /\/\.static\/css\/themes\//.test(link.href)
        );
        if (themeLink) {
            // Replace the href with the user's theme
            const themeBase = themeLink.href.replace(/\/[^\/]+\.css$/, "/");
            themeLink.href = themeBase + userTheme + ".css";
        }
    };

    // Try immediately, and also on DOMContentLoaded in case elements aren't ready yet
    onReady(swapTheme);

    // Also, if the theme selector exists, set its value to the user's theme
    onReady(function () {
        const themeSelector = document.getElementById("themeSelector");
        if (themeSelector) {
            for (let i = 0; i < themeSelector.options.length; i++) {
                if (
                    themeSelector.options[i].value === userTheme ||
                    themeSelector.options[i].text === userTheme
                ) {
                    themeSelector.selectedIndex = i;
                    break;
                }
            }
        }
    });
})();
////////// Disable/Enable native extension settings //////
(function () {
    function updateLocalStorage(removeKeys = [], setMap = {}) {
        for (const key of removeKeys) {
            localStorage.removeItem(key);
        }
        for (const [key, value] of Object.entries(setMap)) {
            localStorage.setItem(key, value);
        }
    }

    try {
        updateLocalStorage(
            ["hoveringImage"],      // Keys to remove
            {}      // Keys to set
        );
    } catch (e) {
        // Ignore errors (e.g., storage not available)
    }
})();
//////// START OF THE SCRIPT ////////////////////
onReady(async function () {
    "use strict";
    // --- Default Settings ---
    const scriptSettings = {
        site: {
            _siteTWTitle: { type: "title", label: ":: Thread Watcher" },
            _siteSection1: { type: "separator" },
            alwaysShowTW: { label: "Pin Thread Watcher", default: false },
            autoExpandTW: { label: "Auto Expand Thread Watcher", default: false },
            _siteSiteTitle: { type: "title", label: ":: Site" },
            _siteSection2: { type: "separator" },
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
            enableBottomHeader: { label: "Bottom Header", default: false },
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
            enableScrollArrows: { label: "Show Up/Down Arrows", default: false },
            hoverVideoVolume: { label: "Hover Media Volume (0-100%)", default: 50, type: "number", min: 0, max: 100 }
        },
        threads: {
            enableThreadImageHover: { label: "Thread Image Hover", default: true },
            enableNestedReplies: { label: "Enabled Inline Replies", default: false },
            enableStickyQR: { label: "Enable Sticky Quick Reply", default: false },
            fadeQuickReply: { label: "Fade Quick Reply", default: false },
            watchThreadOnReply: { label: "Watch Thread on Reply", default: true },
            scrollToBottom: { label: "Don't Scroll to Bottom on Reply", default: true },
            beepOnYou: { label: "Beep on (You)", default: false },
            notifyOnYou: {
                label: "Notify when (You) (!)",
                default: true,
                subOptions: {
                    customMessage: {
                        label: "Custom Notification",
                        default: "",
                        type: "text",
                        maxLength: 8
                    }
                }
            },
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
            deleteSavedName: { label: "Delete Name Checkbox", default: true }
        },
        catalog: {
            enableCatalogImageHover: { label: "Catalog Image Hover", default: true },
            enableThreadHiding: { label: "Enable Thread Hiding", default: false },
            openCatalogThreadNewTab: { label: "Always Open Threads in New Tab", default: false }
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
            _stylingThreadTitle: { type: "title", label: ":: Thread Styling" },
            _stylingSection2: { type: "separator" },
            highlightOnYou: { label: "Highlight (You) posts", default: true },
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
            hideCheckboxes: { label: "Hide Checkboxes", default: false }
        },
        miscel: {
            enableShortcuts: { label: "Enable Keyboard Shortcuts", type: "checkbox", default: true },
            enhanceYoutube: { label: "Enhanced Youtube Links", type: "checkbox", default: true },
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
            },
            hideNoCookieLink: { label: "Hide No Cookie? Link", default: false }
        }
    };

    // Flatten settings for backward compatibility with existing functions
    const flatSettings = {};
    function flattenSettings() {
        Object.keys(scriptSettings).forEach((category) => {
            Object.keys(scriptSettings[category]).forEach((key) => {
                flatSettings[key] = scriptSettings[category][key];

                // Also flatten any sub-options
                if (!scriptSettings[category][key].subOptions) return;
                Object.keys(scriptSettings[category][key].subOptions).forEach(
                    (subKey) => {
                        const fullKey = `${key}_${subKey}`;
                        flatSettings[fullKey] =
                            scriptSettings[category][key].subOptions[subKey];
                    }
                );
            });
        });
    }
    flattenSettings();

    // --- GM storage wrappers ---
    async function getSetting(key) {
        if (!flatSettings[key]) {
            console.warn(`Setting key not found: ${key}`);
            return false;
        }
        let val = await GM.getValue("8chanSS_" + key, null);
        if (val === null) return flatSettings[key].default;
        if (flatSettings[key].type === "number") return Number(val);
        if (flatSettings[key].type === "text") return String(val).replace(/[<>"']/g, "").slice(0, flatSettings[key].maxLength || 32);
        if (flatSettings[key].type === "textarea") return String(val);
        return val === "true";
    }

    async function setSetting(key, value) {
        // Always store as string for consistency
        await GM.setValue("8chanSS_" + key, String(value));
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
            hideAnnouncement: "hide-announcement",
            hidePanelMessage: "hide-panelmessage",
            highlightOnYou: "highlight-you",
            threadHideCloseBtn: "hide-close-btn",
            hideCheckboxes: "hide-checkboxes",
            hideNoCookieLink: "hide-nocookie",
            autoExpandTW: "auto-expand-tw"
        };

        // Special logic for Sidebar: only add if enableSidebar is true and leftSidebar is false
        if (enableSidebar && !enableSidebar_leftSidebar) {
            document.documentElement.classList.add("ss-sidebar");
        } else {
            document.documentElement.classList.remove("ss-sidebar");
        }

        // All other toggles
        for (const [settingKey, className] of Object.entries(classToggles)) {
            if (await getSetting(settingKey)) {
                document.documentElement.classList.add(className);
            } else {
                document.documentElement.classList.remove(className);
            }
        }

        // URL-based class toggling
        const urlClassMap = [
            { pattern: /\/catalog\.html$/i, className: "is-catalog" },
            { pattern: /\/res\/[^/]+\.html$/i, className: "is-thread" },
            { pattern: /\/[^/]+\/(#)?$/i, className: "is-index" },
        ];
        const currentPath = window.location.pathname.toLowerCase() + window.location.hash;
        urlClassMap.forEach(({ pattern, className }) => {
            if (pattern.test(currentPath)) {
                document.documentElement.classList.add(className);
            } else {
                document.documentElement.classList.remove(className);
            }
        });
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

    // Call the function on DOM ready
    onReady(featureSidebar);

    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // Custom CSS injection
    const currentPath = window.location.pathname.toLowerCase();
    const currentHost = window.location.hostname.toLowerCase();

    let css = "";

    if (/^8chan\.(se|moe)$/.test(currentHost)) {
        css += "<%= grunt.file.read('tmp/site.min.css').replace(/\\(^\")/g, '') %>";
    }
    if (/\/res\/[^/]+\.html$/.test(currentPath)) {
        css += "<%= grunt.file.read('tmp/thread.min.css').replace(/\\(^\")/g, '') %>";
    }
    if (/\/catalog\.html$/.test(currentPath)) {
        css += "<%= grunt.file.read('tmp/catalog.min.css').replace(/\\(^\")/g, '') %>";
    }

    if (!document.getElementById('8chSS')) {
        const style = document.createElement('style');
        style.id = '8chSS';
        style.textContent = css;
        document.head.appendChild(style);
    }

    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // --- Feature Initialization based on Settings ---
    // TODO: We could map this later, but I like it for easier reading and adding new items atm
    if (await getSetting("enableScrollSave")) {
        featureSaveScroll();
    }
    if (await getSetting("watchThreadOnReply")) {
        featureWatchThreadOnReply();
    }
    if (await getSetting("blurSpoilers")) {
        featureBlurSpoilers();
    }
    if (await getSetting("enableHeaderCatalogLinks")) {
        featureHeaderCatalogLinks();
    }
    if (await getSetting("openCatalogThreadNewTab")) {
        catalogThreadsInNewTab();
    }
    if (await getSetting("deleteSavedName")) {
        featureDeleteNameCheckbox();
    }
    if (await getSetting("enableScrollArrows")) {
        featureScrollArrows();
    }
    if (await getSetting("alwaysShowTW")) {
        featureAlwaysShowTW();
    }
    if (await getSetting("scrollToBottom")) {
        preventFooterScrollIntoView();
    }
    if (await getSetting("enableThreadHiding")) {
        featureCatalogHiding();
    }
    if (await getSetting("enableNestedReplies")) {
        localStorage.setItem("inlineReplies", "true");
        featureNestedReplies();
    }
    if (await getSetting("switchTimeFormat")) {
        featureLabelCreated12h();
    }
    if (await getSetting("truncFilenames")) {
        const filenameLength = await getSetting("truncFilenames_customTrunc");
        truncateFilenames(filenameLength);
    }
    if (await getSetting("enableIdFilters")) {
        enableIdFiltering();
    }
    if (await getSetting("enhanceYoutube")) {
        enhanceYouTubeLinks();
    }

    // Check if we should enable image hover based on the current page
    async function initImageHover() {
        const isCatalogPage = /\/catalog\.html$/.test(window.location.pathname.toLowerCase());
        let enabled = false;
        if (isCatalogPage) {
            enabled = await getSetting("enableCatalogImageHover");
        } else {
            enabled = await getSetting("enableThreadImageHover");
        }
        if (enabled) {
            featureImageHover();
        }
    }
    // Init
    initImageHover();

    // --- Feature: Save Scroll Position (anchor-aware, optimized)
    async function featureSaveScroll() {
        const MAX_PAGES = 50;
        // Use URL without hash for storage key
        const currentPage = window.location.origin + window.location.pathname + window.location.search;
        const hasAnchor = !!window.location.hash;

        // Only allow saving/restoring for URLs like "/<board>/res/<thread>.html"
        const threadPagePattern = /^\/[^/]+\/res\/[^/]+\.html$/i;
        function isThreadPage(urlPath) {
            return threadPagePattern.test(urlPath);
        }

        async function getSavedScrollData() {
            const savedData = await GM.getValue(
                `8chanSS_scrollPosition_${currentPage}`,
                null
            );
            if (!savedData) return null;
            try {
                return JSON.parse(savedData);
            } catch (e) {
                return null;
            }
        }

        async function saveScrollPosition() {
            // Only save on thread pages
            if (!isThreadPage(window.location.pathname)) return;
            if (!(await getSetting("enableScrollSave"))) return;

            const scrollPosition = window.scrollY;
            const timestamp = Date.now();

            // Only save if scrolled further down than last saved position
            const savedData = await getSavedScrollData();
            if (savedData && typeof savedData.position === "number") {
                if (scrollPosition <= savedData.position) {
                    // Do not update if not scrolled further down
                    return;
                }
            }

            // Store both the scroll position and timestamp using GM storage
            await GM.setValue(
                `8chanSS_scrollPosition_${currentPage}`,
                JSON.stringify({
                    position: scrollPosition,
                    timestamp: timestamp,
                })
            );

            await manageScrollStorage();
        }

        async function manageScrollStorage() {
            // Get all GM storage keys
            const allKeys = await GM.listValues();

            // Filter for scroll position keys
            const scrollKeys = allKeys.filter((key) =>
                key.startsWith("8chanSS_scrollPosition_")
            );

            if (scrollKeys.length > MAX_PAGES) {
                // Create array of objects with key and timestamp
                const keyData = await Promise.all(
                    scrollKeys.map(async (key) => {
                        let data;
                        try {
                            const savedValue = await GM.getValue(key, null);
                            data = savedValue ? JSON.parse(savedValue) : { position: 0, timestamp: 0 };
                        } catch (e) {
                            data = { position: 0, timestamp: 0 };
                        }
                        return {
                            key: key,
                            timestamp: data.timestamp || 0,
                        };
                    })
                );

                // Sort by timestamp (oldest first)
                keyData.sort((a, b) => a.timestamp - b.timestamp);

                // Remove oldest entries until we're under the limit
                const keysToRemove = keyData.slice(0, keyData.length - MAX_PAGES);
                for (const item of keysToRemove) {
                    await GM.deleteValue(item.key);
                }
            }
        }

        // Restore scroll position (always, if enabled)
        async function restoreScrollPosition() {
            // Only restore on thread pages
            if (!isThreadPage(window.location.pathname)) return;
            if (!(await getSetting("enableScrollSave"))) return;

            const savedData = await getSavedScrollData();
            if (!savedData || typeof savedData.position !== "number") return;
            const position = savedData.position;

            // Update the timestamp to "refresh" this entry
            await GM.setValue(
                `8chanSS_scrollPosition_${currentPage}`,
                JSON.stringify({
                    position: position,
                    timestamp: Date.now(),
                })
            );

            if (hasAnchor) {
                // Do NOT scroll, let browser handle anchor
                // But still add unread-line at saved position (not anchor)
                setTimeout(() => addUnreadLineAtViewportCenter(position), 100);
                return;
            }

            // Only restore scroll if a saved position exists (i.e., not first visit)
            if (!isNaN(position)) {
                window.scrollTo(0, position);
                setTimeout(() => addUnreadLineAtViewportCenter(position), 100);
            }
        }

        // Add an unread-line marker after the .postCell <div>
        async function addUnreadLineAtViewportCenter(scrollPosition) {
            // Only add unread-line if showUnreadLine is enabled
            if (!(await getSetting("enableScrollSave_showUnreadLine"))) {
                return;
            }

            const divPosts = document.querySelector(".divPosts");
            if (!divPosts) return;

            // Find the element at the center of the viewport (after scroll restore)
            const centerX = window.innerWidth / 2;
            // Use the restored scroll position if provided, otherwise current
            const centerY = (typeof scrollPosition === "number")
                ? (window.innerHeight / 2) + (scrollPosition - window.scrollY)
                : window.innerHeight / 2;
            let el = document.elementFromPoint(centerX, centerY);

            // Traverse up to find the closest .postCell
            while (el && el !== divPosts && (!el.classList || !el.classList.contains("postCell"))) {
                el = el.parentElement;
            }
            if (!el || el === divPosts || !el.id) return;

            // Ensure .postCell is a direct child of .divPosts
            if (el.parentElement !== divPosts) return;

            // Remove any existing unread-line
            const oldMarker = document.getElementById("unread-line");
            if (oldMarker && oldMarker.parentNode) {
                oldMarker.parentNode.removeChild(oldMarker);
            }

            // Insert the unread-line marker after the .postCell (as a sibling)
            const marker = document.createElement("hr");
            marker.id = "unread-line";
            if (el.nextSibling) {
                divPosts.insertBefore(marker, el.nextSibling);
            } else {
                divPosts.appendChild(marker);
            }
        }

        // Use async event handlers
        window.addEventListener("beforeunload", () => {
            saveScrollPosition();
        });

        // For load event, restore scroll and then add unread-line if enabled
        window.addEventListener("load", async () => {
            await restoreScrollPosition();
        });

        // Initial restore attempt (in case the load event already fired)
        await restoreScrollPosition();
    }

    // --- Remove unread-line at bottom of page ---
    async function removeUnreadLineIfAtBottom() {
        // Check if showUnreadLine is enabled
        if (!(await getSetting("enableScrollSave_showUnreadLine"))) {
            return;
        }

        // Check if user is at the bottom (allowing for a small margin)
        const margin = 20; // px
        if ((window.innerHeight + window.scrollY) >= (document.body.offsetHeight - margin)) {
            const oldMarker = document.getElementById("unread-line");
            if (oldMarker && oldMarker.parentNode) {
                oldMarker.parentNode.removeChild(oldMarker);
            }
        }
    }

    window.addEventListener("scroll", removeUnreadLineIfAtBottom);

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
                    if (link.href && !link.href.endsWith("/catalog.html")) {
                        link.href += "/catalog.html";

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

        appendCatalogToLinks();
        const observer = new MutationObserver(appendCatalogToLinks);
        const config = { childList: true, subtree: true };
        const navboardsSpan = document.getElementById("navBoardsSpan");
        if (navboardsSpan) {
            observer.observe(navboardsSpan, config);
        }
    }

    // Feature: Always Open Catalog Threads in New Tab ---
    function catalogThreadsInNewTab() {
        const catalogDiv = document.querySelector('.catalogDiv');
        if (!catalogDiv) return;

        function setLinksTargetBlank(cell) {
            const link = cell.querySelector('a.linkThumb');
            if (link) link.setAttribute('target', '_blank');
        }

        // Initial run for existing cells
        catalogDiv.querySelectorAll('.catalogCell').forEach(setLinksTargetBlank);

        // Observe catalog container for new cells
        if (catalogDiv) {
            const observer = new MutationObserver(() => {
                setLinksTargetBlank(catalogDiv);
            });
            observer.observe(catalogDiv, { childList: true, subtree: true });
        }
    }

    // ---- Feature: Image/Video/Audio Hover Preview
    function featureImageHover() {
        // --- Config ---
        const MEDIA_MAX_WIDTH = "90vw";
        const MEDIA_OPACITY_LOADING = "0.75";
        const MEDIA_OPACITY_LOADED = "1";
        const MEDIA_OFFSET = 2; // Margin between cursor and image, in vw
        const MEDIA_BOTTOM_MARGIN = 3; // Margin from bottom of viewport to avoid browser UI, in vh
        const AUDIO_INDICATOR_TEXT = "▶ Playing audio...";

        // Calculate and convert vw/vh to numbers in pixels
        function getMediaOffset() {
            return window.innerWidth * (MEDIA_OFFSET / 100);
        }
        function getMediaBottomMargin() {
            return window.innerHeight * (MEDIA_BOTTOM_MARGIN / 100);
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

        // --- Utility: Position floating media to the right of mouse, never touching bottom ---
        function positionFloatingMedia(event) {
            if (!floatingMedia) return;
            const vw = window.innerWidth;
            const vh = window.innerHeight;
            const mw = floatingMedia.offsetWidth || 0;
            const mh = floatingMedia.offsetHeight || 0;

            const MEDIA_OFFSET_PX = getMediaOffset();
            const MEDIA_BOTTOM_MARGIN_PX = getMediaBottomMargin();
            const SCROLLBAR_WIDTH = window.innerWidth - document.documentElement.clientWidth; // Calculate scrollbar width

            // Clamp to viewport
            // Horizontally, always to the right of the cursor, with margin, but clamp to right edge (account for scrollbar)
            let x = event.clientX + MEDIA_OFFSET_PX;
            x = clamp(x, 0, vw - mw - SCROLLBAR_WIDTH);

            // Vertically, align top to cursor, but clamp so it never touches bottom or top
            let y = event.clientY;
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
            if (!thumbNode || !filemime) return null;
            const thumbnailSrc = thumbNode.getAttribute("src");
            if (/\/t_/.test(thumbnailSrc)) {
                let base = thumbnailSrc.replace(/\/t_/, "/");
                base = base.replace(/\.(jpe?g|png|gif|webp|webm|mp4|ogg|mp3|m4a|wav)$/i, "");
                const mimeToExt = {
                    "image/jpeg": ".jpg",
                    "image/jpg": ".jpg",
                    "image/png": ".png",
                    "image/gif": ".gif",
                    "image/webp": ".webp",
                    "image/bmp": ".bmp",
                    "video/mp4": ".mp4",
                    "video/webm": ".webm",
                    "audio/ogg": ".ogg",
                    "audio/mpeg": ".mp3",
                    "audio/x-m4a": ".m4a",
                    "audio/x-wav": ".wav",
                };
                const ext = mimeToExt[filemime.toLowerCase()];
                if (!ext) return null;
                return base + ext;
            }
            if (
                /\/spoiler\.png$/i.test(thumbnailSrc) ||
                /\/custom\.spoiler$/i.test(thumbnailSrc) ||
                /\/audioGenericThumb\.png$/i.test(thumbnailSrc)
            ) {
                const parentA = thumbNode.closest("a.linkThumb, a.imgLink");
                if (parentA && parentA.getAttribute("href")) {
                    return parentA.getAttribute("href");
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
                        png: "image/png",
                        gif: "image/gif",
                        webp: "image/webp",
                        bmp: "image/bmp",
                        mp4: "video/mp4",
                        webm: "video/webm",
                        ogg: "audio/ogg",
                        mp3: "audio/mpeg",
                        m4a: "audio/x-m4a",
                        wav: "audio/wav",
                    }[ext];
                fullSrc = getFullMediaSrc(thumb, filemime);
                isVideo = filemime && filemime.startsWith("video/");
                isAudio = filemime && filemime.startsWith("audio/");
            } else if (thumb.classList.contains("originalNameLink")) {
                const href = thumb.getAttribute("href");
                if (!href) return;
                const ext = href.split(".").pop().toLowerCase();
                if (["mp3", "ogg", "m4a", "wav"].includes(ext)) {
                    filemime = {
                        ogg: "audio/ogg",
                        mp3: "audio/mpeg",
                        m4a: "audio/x-m4a",
                        wav: "audio/wav",
                    }[ext];
                    fullSrc = href;
                    isAudio = true;
                }
            }

            if (!fullSrc || !filemime) return;

            // --- Setup floating media element ---
            if (isAudio) {
                // Audio: show indicator, play audio (hidden)
                const container = thumb.tagName === "IMG"
                    ? thumb.closest("a.linkThumb, a.imgLink")
                    : thumb;
                if (container && !container.style.position) {
                    container.style.position = "relative";
                }
                floatingMedia = document.createElement("audio");
                floatingMedia.src = fullSrc;
                floatingMedia.controls = false;
                floatingMedia.style.display = "none";
                let volume = 0.5;
                try {
                    if (typeof getSetting === "function") {
                        const v = await getSetting("hoverVideoVolume");
                        if (typeof v === "number" && !isNaN(v)) {
                            volume = v / 100;
                        }
                    }
                } catch { }
                floatingMedia.volume = clamp(volume, 0, 1);
                document.body.appendChild(floatingMedia);
                floatingMedia.play().catch(() => { });

                // Show indicator
                const indicator = document.createElement("div");
                indicator.classList.add("audio-preview-indicator");
                indicator.textContent = AUDIO_INDICATOR_TEXT;
                container.appendChild(indicator);
                currentAudioIndicator = indicator;

                // Cleanup on leave/click/scroll
                const cleanup = () => cleanupFloatingMedia();
                thumb.addEventListener("mouseleave", cleanup, { once: true });
                container.addEventListener("click", cleanup, { once: true });
                window.addEventListener("scroll", cleanup, { once: true });
                cleanupFns.push(() => thumb.removeEventListener("mouseleave", cleanup));
                cleanupFns.push(() => container.removeEventListener("click", cleanup));
                cleanupFns.push(() => window.removeEventListener("scroll", cleanup));
                return;
            }

            // --- Image or Video ---
            floatingMedia = isVideo ? document.createElement("video") : document.createElement("img");
            floatingMedia.src = fullSrc;
            floatingMedia.style.position = "fixed";
            floatingMedia.style.zIndex = "9999";
            floatingMedia.style.pointerEvents = "none";
            floatingMedia.style.opacity = MEDIA_OPACITY_LOADING;
            floatingMedia.style.left = "-9999px";
            floatingMedia.style.top = "-9999px";
            floatingMedia.style.maxWidth = MEDIA_MAX_WIDTH;
            // Dynamically set maxHeight to fit above the bottom margin
            const availableHeight = window.innerHeight - getMediaBottomMargin();
            floatingMedia.style.maxHeight = `${availableHeight}px`;
            if (isVideo) {
                floatingMedia.autoplay = true;
                floatingMedia.loop = true;
                floatingMedia.muted = false;
                floatingMedia.playsInline = true;
            }
            document.body.appendChild(floatingMedia);

            // --- Initial placement ---
            // Wait for media to load enough to get dimensions, then place
            function initialPlacement() {
                // Use the last mouse event for accurate placement
                if (lastMouseEvent) {
                    positionFloatingMedia(lastMouseEvent);
                }
            }
            // Only add mousemove after initial placement
            function enableMouseMove() {
                document.addEventListener("mousemove", mouseMoveHandler);
                cleanupFns.push(() => document.removeEventListener("mousemove", mouseMoveHandler));
            }
            function mouseMoveHandler(ev) {
                positionFloatingMedia(ev);
            }
            if (isVideo) {
                floatingMedia.onloadeddata = function () {
                    initialPlacement();
                    enableMouseMove();
                    if (floatingMedia) floatingMedia.style.opacity = MEDIA_OPACITY_LOADED;
                };
            } else {
                floatingMedia.onload = function () {
                    initialPlacement();
                    enableMouseMove();
                    if (floatingMedia) floatingMedia.style.opacity = MEDIA_OPACITY_LOADED;
                };
            }
            // If error, cleanup
            floatingMedia.onerror = cleanupFloatingMedia;

            // Cleanup on leave/scroll
            function leaveHandler() { cleanupFloatingMedia(); }
            thumb.addEventListener("mouseleave", leaveHandler, { once: true });
            window.addEventListener("scroll", leaveHandler, { once: true });
            cleanupFns.push(() => thumb.removeEventListener("mouseleave", leaveHandler));
            cleanupFns.push(() => window.removeEventListener("scroll", leaveHandler));
        }

        // --- Attach listeners to thumbnails and audio links ---
        function attachThumbListeners(root = document) {
            root.querySelectorAll("a.linkThumb > img, a.imgLink > img").forEach(thumb => {
                if (!thumb._fullImgHoverBound) {
                    thumb.addEventListener("mouseenter", onThumbEnter);
                    thumb._fullImgHoverBound = true;
                }
            });
            root.querySelectorAll("a.originalNameLink").forEach(link => {
                const href = link.getAttribute("href") || "";
                const ext = href.split(".").pop().toLowerCase();
                if (
                    ["mp3", "wav", "ogg", "m4a"].includes(ext) &&
                    !link._audioHoverBound
                ) {
                    link.addEventListener("mouseenter", onThumbEnter);
                    link._audioHoverBound = true;
                }
            });
        }

        // --- Initialization ---
        attachThumbListeners();

        // --- Watch for new elements ---
        new MutationObserver(mutations => {
            for (const mutation of mutations) {
                for (const node of mutation.addedNodes) {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        attachThumbListeners(node);
                    }
                }
            }
        }).observe(document.body, { childList: true, subtree: true });
    }

    // --- Feature: Inline replies (barebones) ---
    function featureNestedReplies() {
        let observer;
        // Move .replyPreview after the correct title element as a direct child of .innerOP or .innerPost
        // Check if bottom backlinks are enabled
        const bottomBacklinksEnabled = localStorage.getItem("bottomBacklinks") === "true";
        function ensureReplyPreviewPlacement(root = document) {
            // Skip if bottom backlinks are enabled
            if (bottomBacklinksEnabled) return;

            root.querySelectorAll('.replyPreview').forEach(replyPreview => {
                // Find the closest .innerOP or .innerPost ancestor
                let container = replyPreview.closest('.innerOP, .innerPost');
                if (!container) return;

                // Determine which title to use
                let titleSelector = container.classList.contains('innerOP') ? '.opHead.title' : '.postInfo.title';
                let titleElem = Array.from(container.children).find(child => child.matches && child.matches(titleSelector));
                if (!titleElem) return;

                // Only move if not already in the correct position
                if (replyPreview.parentElement !== container || titleElem.nextSibling !== replyPreview) {
                    container.insertBefore(replyPreview, titleElem.nextSibling);
                }
            });
        }

        // Always add new .inlineQuote divs as first child of their closest .replyPreview parent
        function ensureInlineQuotePlacement(root = document) {
            root.querySelectorAll('.inlineQuote').forEach(inlineQuote => {
                const replyPreview = inlineQuote.closest('.replyPreview');
                if (!replyPreview) return;
                replyPreview.insertBefore(inlineQuote, replyPreview.firstChild);
            });
        }
        // Observer to reconnect after each mutation
        observer = new MutationObserver(() => {
            observer.disconnect();
            // Only run ensureReplyPreviewPlacement if bottom backlinks are not enabled
            if (!bottomBacklinksEnabled) {
                ensureReplyPreviewPlacement(document);
            }
            ensureInlineQuotePlacement(document);
            // Reconnect observer
            const postsContainer = document.querySelector('.opCell');
            if (postsContainer) {
                observer.observe(postsContainer, { childList: true, subtree: true });
            }
        });
        // Observer for the initial setup
        const postsContainer = document.querySelector('.opCell');
        if (postsContainer) {
            observer.observe(postsContainer, { childList: true, subtree: true });
        }

        // --- Feature: Dashed underline for inlined reply backlinks ---
        document.addEventListener('click', function (e) {
            const a = e.target.closest('.panelBacklinks > a');
            if (!a) return;
            setTimeout(() => {
                a.classList.toggle('reply-inlined');
            }, 0);
        });

        // --- Feature: Add 'quote-inlined' class to clicked .quoteLink <a> ---
        document.addEventListener('click', function (e) {
            const quoteLink = e.target.closest('a.quoteLink');
            if (!quoteLink) return;
            setTimeout(() => {
                quoteLink.classList.toggle('quote-inlined');
            }, 0);
        });

        // Only run initial ensureReplyPreviewPlacement if bottom backlinks are not enabled
        if (!bottomBacklinksEnabled) {
            ensureReplyPreviewPlacement(document);
        }

        ensureInlineQuotePlacement(document);
    }

    // --- Feature: Blur Spoilers + Remove Spoilers suboption ---
    function featureBlurSpoilers() {
        function revealSpoilers() {
            const spoilerLinks = document.querySelectorAll("a.imgLink");
            spoilerLinks.forEach(async (link) => {
                const img = link.querySelector("img");
                if (!img) return;

                // Check if this is a custom spoiler image
                const isCustomSpoiler = img.src.includes("/custom.spoiler");
                // Check if this is NOT already a thumbnail
                const isNotThumbnail = !img.src.includes("/.media/t_");

                if (isNotThumbnail || isCustomSpoiler) {
                    let href = link.getAttribute("href");
                    if (!href) return;

                    // Extract filename without extension
                    const match = href.match(/\/\.media\/([^\/]+)\.[a-zA-Z0-9]+$/);
                    if (!match) return;

                    // Use the thumbnail path (t_filename)
                    const transformedSrc = `/.media/t_${match[1]}`;
                    img.src = transformedSrc;

                    // If Remove Spoilers is enabled, do not apply blur, just show the thumbnail
                    if (await getSetting("blurSpoilers_removeSpoilers")) {
                        img.style.filter = "";
                        img.style.transition = "";
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
            });
        }

        // Initial run
        revealSpoilers();

        // Observe for dynamically added spoilers
        const observer = new MutationObserver(revealSpoilers);
        observer.observe(document.body, { childList: true, subtree: true });
    }

    ////////// THREAD WATCHER THINGZ ////////////////////////////////////////////////////////////////////////////////////////////////

    // Decode HTML entities in <a> to string (e.g., &gt; to >, &apos; to ')
    function decodeHtmlEntitiesTwice(html) {
        const txt = document.createElement('textarea');
        txt.innerHTML = html;
        const once = txt.value;
        txt.innerHTML = once;
        return txt.value;
    }
    // --- Feature: Highlight TW mentions and new posts ---
    function highlightMentions() {
        const watchedCells = document.querySelectorAll("#watchedMenu .watchedCell");
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
                    const watchButton = document.querySelector(".opHead .watchButton");
                    if (watchButton) {
                        watchButton.style.color = "var(--board-title-color)";
                        watchButton.title = "Watched";
                    }
                }

                // Decode HTML entities (only if needed)
                const originalHtml = labelLink.innerHTML;
                const decodedText = decodeHtmlEntitiesTwice(originalHtml);
                if (labelLink.textContent !== decodedText) {
                    labelLink.textContent = decodedText;
                }
            }

            // Process notification text
            const notificationText = notification.textContent.trim();

            // Skip if already processed (starts with parenthesis)
            if (notificationText.startsWith("(")) {
                return;
            }

            // Case 1: Has "(you)" - format "2, 1 (you)"
            if (notificationText.includes("(you)")) {
                const parts = notificationText.split(", ");
                const totalReplies = parts[0];

                // Apply styling
                labelLink.style.color = "var(--board-title-color)";
                notification.style.color = "var(--board-title-color)";
                notification.textContent = ` (${totalReplies}) (You)`;
                notification.style.fontWeight = "bold";
            }
            // Case 2: Just a number - format "2"
            else if (/^\d+$/.test(notificationText)) {
                notification.textContent = ` (${notificationText})`;
                notification.style.color = "var(--link-color)";
                notification.style.fontWeight = "bold";
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

        function addCloseListener() {
            const watchedMenu = document.getElementById("watchedMenu");
            if (!watchedMenu) return;
            const closeBtn = watchedMenu.querySelector(".close-btn");
            if (closeBtn) {
                closeBtn.addEventListener("click", () => {
                    watchedMenu.style.display = "none";
                });
            }
        }

        // Run on DOM ready
        onReady(() => {
            showThreadWatcher();
            addCloseListener();
        });
    }

    ///////// THREAD WATCHER END ////////////////////////////////////////////////////////////////////////////////////////////////////

    // --- Feature: Mark Posts as Yours ---
    function featureMarkYourPost() {
        // --- Board Key Detection ---
        function getBoardName() {
            const postCell = document.querySelector('.postCell[data-boarduri], .opCell[data-boarduri]');
            if (postCell) return postCell.getAttribute('data-boarduri');
            const match = location.pathname.match(/^\/([^\/]+)\//);
            return match ? match[1] : 'unknown';
        }

        const BOARD_NAME = getBoardName();
        const T_YOUS_KEY = `${BOARD_NAME}-yous`;
        const MENU_ENTRY_CLASS = "markYourPostMenuEntry";
        const MENU_SELECTOR = ".floatingList.extraMenu";

        // --- Storage Helpers (always use numeric IDs) ---
        function getTYous() {
            try {
                const val = localStorage.getItem(T_YOUS_KEY);
                return val ? JSON.parse(val) : [];
            } catch {
                return [];
            }
        }

        function setTYous(arr) {
            // Convert all IDs to numbers before storing
            localStorage.setItem(T_YOUS_KEY, JSON.stringify(arr.map(Number)));
        }

        // --- Menu/Post Association ---
        document.body.addEventListener('click', function (e) {
            if (e.target.matches('.extraMenuButton')) {
                // Support both .postCell and .opCell
                const postCell = e.target.closest('.postCell, .opCell');
                if (!postCell) return;

                // Wait a tick for the menu to be inserted into the DOM
                setTimeout(() => {
                    // Find the menu that is closest to the button (e.g., next sibling or floating nearby)
                    // You may need to adjust this selector depending on your menu's insertion logic
                    let menu = e.target.parentNode.querySelector('.floatingList.extraMenu');
                    if (!menu) {
                        // Fallback: search globally for the most recently added menu
                        const menus = Array.from(document.querySelectorAll('.floatingList.extraMenu'));
                        menu = menus[menus.length - 1];
                    }
                    if (menu) {
                        menu.setAttribute('data-post-id', postCell.id);
                    }
                }, 0);
            }
        });
        function getPostIdFromMenu(menu) {
            return menu.getAttribute('data-post-id') || null;
        }

        function toggleYouNameClass(postId, add) {
            // Support both .postCell and .opCell
            const postCell = document.getElementById(postId);
            if (!postCell) return;
            const nameLink = postCell.querySelector(".linkName.noEmailName");
            if (nameLink) {
                nameLink.classList.toggle("youName", add);
            }
        }

        // --- Menu Entry Logic ---
        function addMenuEntries(root = document) {
            root.querySelectorAll(MENU_SELECTOR).forEach(menu => {
                // Only proceed if the menu is a descendant of an .extraMenuButton
                if (!menu.closest('.extraMenuButton')) return;

                const ul = menu.querySelector("ul");
                if (!ul || ul.querySelector("." + MENU_ENTRY_CLASS)) return;

                const reportLi = Array.from(ul.children).find(
                    li => li.textContent.trim().toLowerCase() === "report"
                );

                const li = document.createElement("li");
                li.className = MENU_ENTRY_CLASS;
                li.style.cursor = "pointer";

                const postId = getPostIdFromMenu(menu);
                const tYous = getTYous();
                // Convert to number for comparison
                const isMarked = postId && tYous.includes(Number(postId));
                li.textContent = isMarked ? "Unmark as Your Post" : "Mark as Your Post";

                if (reportLi) {
                    ul.insertBefore(li, reportLi);
                } else {
                    ul.insertBefore(li, ul.firstChild);
                }

                li.addEventListener("click", function (e) {
                    e.stopPropagation();
                    const postId = getPostIdFromMenu(menu);
                    if (!postId) return;
                    let tYous = getTYous();
                    // Convert to number for comparison
                    const numericPostId = Number(postId);
                    const idx = tYous.indexOf(numericPostId);
                    if (idx === -1) {
                        tYous.push(numericPostId);
                        setTYous(tYous);
                        toggleYouNameClass(postId, true);
                        li.textContent = "Unmark as Your Post";
                    } else {
                        tYous.splice(idx, 1);
                        setTYous(tYous);
                        toggleYouNameClass(postId, false);
                        li.textContent = "Mark as Your Post";
                    }
                });

                window.addEventListener("storage", function (event) {
                    if (event.key === T_YOUS_KEY) {
                        const tYous = getTYous();
                        const isMarked = postId && tYous.includes(Number(postId));
                        li.textContent = isMarked ? "Unmark as Your Post" : "Mark as Your Post";
                    }
                });
            });
        }

        // --- Observe for Dynamic Menus ---
        const observer = new MutationObserver(mutations => {
            for (const mutation of mutations) {
                for (const node of mutation.addedNodes) {
                    if (node.nodeType !== 1) continue;
                    if (node.matches && node.matches(MENU_SELECTOR)) {
                        addMenuEntries(node.parentNode || node);
                    } else if (node.querySelectorAll) {
                        node.querySelectorAll(MENU_SELECTOR).forEach(menu => {
                            addMenuEntries(menu.parentNode || menu);
                        });
                    }
                }
            }
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }

    // Init
    onReady(featureMarkYourPost);

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

    // --- Feature: Delete (Save) Name Checkbox ---
    // Pay attention that it needs to work on localStorage for the name key (not GM Storage)
    function featureDeleteNameCheckbox() {
        // Check if the #qr-name-row exists and has the 'hidden' class
        const nameExists = document.getElementById("qr-name-row");
        if (nameExists && nameExists.classList.contains("hidden")) {
            return;
        }

        const alwaysUseBypassCheckbox = document.getElementById("qralwaysUseBypassCheckBox");
        if (!alwaysUseBypassCheckbox) {
            return;
        }

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.id = "saveNameCheckbox";
        checkbox.classList.add("postingCheckbox");

        const label = document.createElement("label");
        label.htmlFor = "saveNameCheckbox";
        label.textContent = "Delete Name";
        label.title = "Delete Name on refresh";

        alwaysUseBypassCheckbox.parentNode.insertBefore(checkbox, alwaysUseBypassCheckbox);
        alwaysUseBypassCheckbox.parentNode.insertBefore(label, checkbox.nextSibling);

        // Restore checkbox state
        const savedCheckboxState = localStorage.getItem("8chanSS_deleteNameCheckbox") === "true";
        checkbox.checked = savedCheckboxState;

        const nameInput = document.getElementById("qrname");
        if (nameInput) {
            // If the checkbox is checked on load, clear the input and remove the name from storage
            if (checkbox.checked) {
                nameInput.value = "";
                localStorage.removeItem("name");
            }

            // Save checkbox state
            checkbox.addEventListener("change", function () {
                localStorage.setItem("8chanSS_deleteNameCheckbox", checkbox.checked);
            });
        }
    }

    // --- Feature: Beep and/or notify on (You) ---
    function featureBeepOnYou() {
        // Beep sound (base64)
        const beep = new Audio(
            "data:audio/wav;base64,UklGRjQDAABXQVZFZm10IBAAAAABAAEAgD4AAIA+AAABAAgAc21wbDwAAABBAAADAAAAAAAAAAA8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABkYXRhzAIAAGMms8em0tleMV4zIpLVo8nhfSlcPR102Ki+5JspVEkdVtKzs+K1NEhUIT7DwKrcy0g6WygsrM2k1NpiLl0zIY/WpMrjgCdbPhxw2Kq+5Z4qUkkdU9K1s+K5NkVTITzBwqnczko3WikrqM+l1NxlLF0zIIvXpsnjgydZPhxs2ay95aIrUEkdUdC3suK8N0NUIjq+xKrcz002WioppdGm091pK1w0IIjYp8jkhydXPxxq2K295aUrTkoeTs65suK+OUFUIzi7xqrb0VA0WSoootKm0t5tKlo1H4TYqMfkiydWQBxm16+85actTEseS8y7seHAPD9TIza5yKra01QyWSson9On0d5wKVk2H4DYqcfkjidUQB1j1rG75KsvSkseScu8seDCPz1TJDW2yara1FYxWSwnm9Sn0N9zKVg2H33ZqsXkkihSQR1g1bK65K0wSEsfR8i+seDEQTxUJTOzy6rY1VowWC0mmNWoz993KVc3H3rYq8TklSlRQh1d1LS647AyR0wgRMbAsN/GRDpTJTKwzKrX1l4vVy4lldWpzt97KVY4IXbUr8LZljVPRCxhw7W3z6ZISkw1VK+4sMWvXEhSPk6buay9sm5JVkZNiLWqtrJ+TldNTnquqbCwilZXU1BwpKirrpNgWFhTaZmnpquZbFlbVmWOpaOonHZcXlljhaGhpZ1+YWBdYn2cn6GdhmdhYGN3lp2enIttY2Jjco+bnJuOdGZlZXCImJqakHpoZ2Zug5WYmZJ/bGlobX6RlpeSg3BqaW16jZSVkoZ0bGtteImSk5KIeG5tbnaFkJKRinxxbm91gY2QkIt/c3BwdH6Kj4+LgnZxcXR8iI2OjIR5c3J0e4WLjYuFe3VzdHmCioyLhn52dHR5gIiKioeAeHV1eH+GiYqHgXp2dnh9hIiJh4J8eHd4fIKHiIeDfXl4eHyBhoeHhH96eHmA"
        );

        // Store the original title globally so all functions can access it
        window.originalTitle = document.title;
        window.isNotifying = false;

        // Cache settings to avoid repeated async calls
        let beepOnYouSetting = false;
        let notifyOnYouSetting = false;
        let customMsgSetting = "(!) ";

        // Initialize settings
        async function initSettings() {
            beepOnYouSetting = await getSetting("beepOnYou");
            notifyOnYouSetting = await getSetting("notifyOnYou");
            const customMsg = await getSetting("notifyOnYou_customMessage");
            if (customMsg) customMsgSetting = customMsg;
        }

        // Call initialization
        initSettings();

        // Function to play the beep sound
        function playBeep() {
            if (beep.paused) {
                beep.play().catch((e) => console.warn("Beep failed:", e));
            } else {
                beep.currentTime = 0; // Reset to start if already playing
            }
        }

        // Function to notify on (You)
        function notifyOnYou() {
            if (!window.isNotifying && !document.hasFocus()) {
                window.isNotifying = true;
                document.title = customMsgSetting + " " + window.originalTitle;
            }
        }

        // Remove notification when tab regains focus
        window.addEventListener("focus", () => {
            if (window.isNotifying) {
                document.title = window.originalTitle;
                window.isNotifying = false;
            }
        });

        // Create MutationObserver to detect when you are quoted
        const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                for (const node of mutation.addedNodes) {
                    if (
                        node.nodeType === 1 &&
                        node.querySelector &&
                        node.querySelector("a.quoteLink.you")
                    ) {
                        // If the quote is inside .innerPost, do not beep or notify
                        if (node.closest('.innerPost')) {
                            continue;
                        }

                        // Only play beep if the setting is enabled
                        if (beepOnYouSetting) {
                            playBeep();
                        }

                        // Trigger notification if enabled
                        if (notifyOnYouSetting) {
                            notifyOnYou();
                        }
                    }
                }
            }
        });

        observer.observe(document.body, { childList: true, subtree: true });

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
        // Fetch video title using YouTube oEmbed (no API key needed)
        function fetchYouTubeTitle(videoId) {
            return fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`)
                .then(r => r.ok ? r.json() : null)
                .then(data => data ? data.title : null)
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
        const threads = document.querySelector('#divThreads') || document.body;
        new MutationObserver(() => processLinks(threads)).observe(threads, { childList: true, subtree: true });
    }

    // --- Feature: Convert to 12-hour format (AM/PM) ---
    function featureLabelCreated12h() {
        function convertLabelCreatedTimes(root = document) {
            (root.querySelectorAll
                ? root.querySelectorAll('.labelCreated')
                : []).forEach(span => {
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
                });
        }

        // Initial conversion on page load
        convertLabelCreatedTimes();

        // Observe only .divThreads for added posts
        const threadsContainer = document.querySelector('.divPosts');
        if (threadsContainer) {
            new MutationObserver(() => {
                convertLabelCreatedTimes(threadsContainer);
            }).observe(threadsContainer, { childList: true, subtree: true });
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

        // Update the label
        const labels = document.querySelectorAll('#qrFilesBody .selectedCell .nameLabel');
        const label = labels[index];
        if (label) {
            label.textContent = finalName;
            label.title = finalName;
        }
    }

    // Event delegation for .nameLabel clicks within #qrFilesBody
    function handleQrFilesBodyClick(event) {
        const label = event.target.closest('.nameLabel');
        if (!label || !label.closest('#qrFilesBody')) return;

        // Find the index of the clicked label among all visible .nameLabel elements
        const labels = Array.from(document.querySelectorAll('#qrFilesBody .selectedCell .nameLabel'));
        const index = labels.indexOf(label);
        if (index !== -1) {
            renameFileAtIndex(index);
        }
    }

    // Observe changes in #qrFilesBody and ensure event delegation is attached
    function observeQrFilesBody() {
        const qrFilesBody = document.querySelector('#qrFilesBody');
        if (!qrFilesBody) return;

        // Attach the event listener once
        if (!qrFilesBody.dataset.renameDelegationAttached) {
            qrFilesBody.addEventListener('click', handleQrFilesBodyClick);
            qrFilesBody.dataset.renameDelegationAttached = 'true';
        }
    }

    // Watch #qrFilesBody for changes
    function startQrFilesBodyObserver() {
        const qrFilesBody = document.querySelector('#qrFilesBody');
        if (!qrFilesBody) return;
        // Attach event delegation once
        observeQrFilesBody();
    }

    // Init
    startQrFilesBodyObserver();

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
        menu.style.background = "#222";
        menu.style.color = "#fff";
        menu.style.padding = "0";
        menu.style.borderRadius = "8px";
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
        header.style.background = "#333";
        header.style.padding = "5px 18px 5px";
        header.style.borderTopLeftRadius = "8px";
        header.style.borderTopRightRadius = "8px";
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
        closeBtn.style.border = "none";
        closeBtn.style.color = "#fff";
        closeBtn.style.fontSize = "18px";
        closeBtn.style.cursor = "pointer";
        closeBtn.style.marginLeft = "10px";
        closeBtn.addEventListener("click", () => {
            menu.style.display = "none";
        });
        header.appendChild(closeBtn);

        menu.appendChild(header);

        // Tab navigation
        const tabNav = document.createElement("div");
        tabNav.style.display = "flex";
        tabNav.style.borderBottom = "1px solid #444";
        tabNav.style.background = "#2a2a2a";

        // Tab content container
        const tabContent = document.createElement("div");
        tabContent.style.padding = "15px 16px";
        tabContent.style.maxHeight = "65vh";
        tabContent.style.overflowY = "auto";
        tabContent.style.scrollbarWidth = "thin";

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
            tabButton.style.background = index === 0 ? "#333" : "transparent";
            tabButton.style.border = "none";
            tabButton.style.borderRight = "1px solid #444";
            tabButton.style.color = "#fff";
            tabButton.style.padding = "8px 15px";
            tabButton.style.margin = "5px 0 0 0";
            tabButton.style.cursor = "pointer";
            tabButton.style.flex = "1";
            tabButton.style.fontSize = "14px";
            tabButton.style.transition = "background 0.2s";

            // Add rounded corners and margin to the first and last tab
            if (index === 0) {
                tabButton.style.borderTopLeftRadius = "8px";
                tabButton.style.margin = "5px 0 0 5px";
            }
            if (index === arr.length - 1) {
                tabButton.style.borderTopRightRadius = "8px";
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
                tabButton.style.background = "#333";
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
        saveBtn.style.background = "#4caf50";
        saveBtn.style.color = "#fff";
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
        resetBtn.style.background = "#dd3333";
        resetBtn.style.color = "#fff";
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
        info.innerHTML = 'Press Save to apply changes. Page will reload. - <a href="https://github.com/otacoo/8chanSS/blob/main/CHANGELOG.md" target="_blank" title="Check the changelog." style="color: #fff; text-decoration: underline dashed;">Ver. <%= version %></a>';
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
                        subTextarea.style.margin = "2px 0 3px 0";
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
                background: "#333",
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
            { keys: ["Ctrl", "Q"], action: "Toggle Quick Reply" },
            { keys: ["Ctrl", "Enter"], action: "Submit post" },
            { keys: ["Escape"], action: "Clear QR textarea and hide all dialogs" },
            { keys: ["ALT", "W"], action: "Watch Thread" },
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
    // Global toggle for all shortcuts
    async function shortcutsGloballyEnabled() {
        return await getSetting("enableShortcuts");
    }

    // --- Consolidated Keyboard Shortcuts ---
    document.addEventListener("keydown", async function (event) {
        // Check if global toggle is enabled first
        if (!(await shortcutsGloballyEnabled())) return;

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
                if (document.activeElement !== qrbody) {
                    event.preventDefault();
                    qrbody.focus();
                } else if (captcha) {
                    event.preventDefault();
                    captcha.focus();
                }
            }
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

        // --- Watch Thread on ALT+W Keyboard Shortcut ---
        // Only trigger if ALT+W is pressed and no input/textarea is focused
        if (
            event.altKey &&
            (event.key === "w" || event.key === "W")
        ) {
            // Prevent default browser behavior (e.g., closing tab in some browsers)
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

    // (CTRL + Enter) and BBCodes - Keep separate as it's specific to the textarea
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

    // BBCODE Combination keys and Tags
    const bbCodeCombinations = new Map([
        ["s", ["[spoiler]", "[/spoiler]"]],
        ["b", ["'''", "'''"]],
        ["u", ["__", "__"]],
        ["i", ["''", "''"]],
        ["d", ["==", "=="]],
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
    let lastIndex = -1;

    function getEligiblePostCells(isOwnReply) {
        // Find all .postCell and .opCell that contain at least one matching anchor
        const selector = isOwnReply
            ? '.postCell:has(a.youName), .opCell:has(a.youName)'
            : '.postCell:has(a.quoteLink.you), .opCell:has(a.quoteLink.you)';
        // Use Array.from to get a static list in DOM order
        return Array.from(document.querySelectorAll(selector));
    }

    function scrollToReply(isOwnReply = true, getNextReply = true) {
        const postCells = getEligiblePostCells(isOwnReply);
        if (!postCells.length) return;

        // Determine current index
        let currentIndex = -1;

        // If lastType matches and lastHighlighted is still in the list, use its index
        if (
            lastType === (isOwnReply ? "own" : "reply") &&
            lastHighlighted &&
            (currentIndex = postCells.indexOf(lastHighlighted.closest('.postCell, .opCell'))) !== -1
        ) {
            // Use found index
        } else {
            // Otherwise, find the first cell whose top is below the middle of the viewport
            const viewportMiddle = window.innerHeight / 2;
            currentIndex = postCells.findIndex(cell => {
                const rect = cell.getBoundingClientRect();
                return rect.top + rect.height / 2 > viewportMiddle;
            });
            if (currentIndex === -1) {
                // If none found, default to first or last depending on direction
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
            if (anchorId) {
                if (location.hash !== '#' + anchorId) {
                    history.replaceState(null, '', '#' + anchorId);
                }
            }

            // Add highlight class to .innerPost
            const innerPost = postContainer.querySelector('.innerPost');
            if (innerPost) {
                innerPost.classList.add('target-highlight');
                lastHighlighted = innerPost;
            } else {
                lastHighlighted = null;
            }

            // Track type and index for next navigation
            lastType = isOwnReply ? "own" : "reply";
            lastIndex = targetIndex;
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

    // ---- Feature: Hide catalog threads with SHIFT+click, per-board storage.
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
            // Load the per-board hidden threads object from storage
            const STORAGE_KEY = "8chanSS_hiddenCatalogThreads";
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
            if (!/\/catalog\.html$/.test(window.location.pathname)) return;

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
                observer.observe(catalogContainer, { childList: true, subtree: true });
            }
        }

        hideThreadsOnRefresh();
    }

    ////// KEYBOARD END /////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // --- Misc Fixes ---

    // Captcha input no history
    const captchaInput = document.getElementById("QRfieldCaptcha");
    if (captchaInput) {
        captchaInput.autocomplete = "off";
    }

    // Don't scroll to bottom on post
    function preventFooterScrollIntoView() {
        const footer = document.getElementById('footer');
        if (footer && !footer._scrollBlocked) {
            footer._scrollBlocked = true; // Prevent double-wrapping
            footer.scrollIntoView = function () { };
        }
    }

    // Move file uploads below OP title
    const opHeadTitle = document.querySelector('.opHead.title');
    const innerOP = document.querySelector('.innerOp');
    const innerQuote = document.querySelector('.innerQuote');
    if (opHeadTitle && innerOP) {
        innerOP.insertBefore(opHeadTitle, innerOP.firstChild);
    }

    // Show all posts by ID
    function enableIdFiltering() {
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
        // Click
        function handleClick(event) {
            const clickedLabel = event.target.closest(labelIdSelector);
            // Only trigger if inside a .postCell and not inside a preview
            if (clickedLabel && clickedLabel.closest(".postCell") && !clickedLabel.closest(".de-pview")) {
                const clickedColor = window.getComputedStyle(clickedLabel).backgroundColor;
                const rect = clickedLabel.getBoundingClientRect();
                const cursorOffsetY = event.clientY - rect.top;

                if (activeFilterColor === clickedColor) {
                    applyFilter(null);
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

    // Truncate Filenames and Show Only Extension
    function truncateFilenames(filenameLength) {
        function processLinks(root = document) {
            root.querySelectorAll('a.originalNameLink').forEach(link => {
                // Skip if already processed
                if (link.dataset.truncated === "1") return;
                const fullFilename = link.getAttribute('download');
                if (!fullFilename) return;
                const lastDot = fullFilename.lastIndexOf('.');
                if (lastDot === -1) return; // No extension found
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
        processLinks(document);
        // Set up observer for dynamically added links in #divThreads
        const divThreads = document.querySelector('#divThreads');
        if (divThreads) {
            new MutationObserver(() => {
                processLinks(divThreads);
            }).observe(divThreads, { childList: true, subtree: true });
        }
    }
});