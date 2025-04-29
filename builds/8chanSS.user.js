// ==UserScript==
// @name         8chanSS
// @version      1.36.0
// @namespace    8chanss
// @description  Userscript to style 8chan
// @author       otakudude
// @minGMVer     4.3
// @minFFVer     121
// @license      MIT; https://github.com/otacoo/8chanSS/blob/main/LICENSE 
// @match        *://8chan.moe/*
// @match        *://8chan.se/*
// @exclude      *://8chan.moe/login.html
// @exclude      *://8chan.se/login.html
// @grant        GM.getValue
// @grant        GM.setValue
// @grant        GM.deleteValue
// @grant        GM.listValues
// @run-at       document-start
// @updateURL    https://github.com/otacoo/8chanSS/releases/latest/download/8chanSS.meta.js
// @downloadURL  https://github.com/otacoo/8chanSS/releases/latest/download/8chanSS.user.js
// ==/UserScript==

function onReady(fn) {
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", fn, { once: true });
    } else {
        fn();
    }
}
(function () {
    const userTheme = localStorage.selectedTheme;
    if (!userTheme) return;
    const swapTheme = () => {
        const themeLink = Array.from(
            document.getElementsByTagName("link")
        ).find(
            (link) =>
                link.rel === "stylesheet" &&
                /\/\.static\/css\/themes\//.test(link.href)
        );
        if (themeLink) {
            const themeBase = themeLink.href.replace(/\/[^\/]+\.css$/, "/");
            themeLink.href = themeBase + userTheme + ".css";
        }
    };
    onReady(swapTheme);
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
            ["hoveringImage"],      
            {}      
        );
    } catch (e) {
    }
})();
onReady(async function () {
    const scriptSettings = {
        site: {
            alwaysShowTW: { label: "Pin Thread Watcher", default: false },
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
            _siteTitle: { type: "title", label: ":: Site Styling" }, 
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
            _threadTitle: { type: "title", label: ":: Thread Styling" }, 
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
    const flatSettings = {};
    function flattenSettings() {
        Object.keys(scriptSettings).forEach((category) => {
            Object.keys(scriptSettings[category]).forEach((key) => {
                flatSettings[key] = scriptSettings[category][key];
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
        await GM.setValue("8chanSS_" + key, String(value));
    }
    async function featureCssClassToggles() {
        document.documentElement.classList.add("8chanSS");
        const enableSidebar = await getSetting("enableSidebar");
        const enableSidebar_leftSidebar = await getSetting("enableSidebar_leftSidebar");

        const classToggles = {
            enableFitReplies: "fit-replies",
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
            hideNoCookieLink: "hide-nocookie"
        };
        if (enableSidebar && !enableSidebar_leftSidebar) {
            document.documentElement.classList.add("ss-sidebar");
        } else {
            document.documentElement.classList.remove("ss-sidebar");
        }
        for (const [settingKey, className] of Object.entries(classToggles)) {
            if (await getSetting(settingKey)) {
                document.documentElement.classList.add(className);
            } else {
                document.documentElement.classList.remove(className);
            }
        }
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
    featureCssClassToggles();
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
    onReady(featureSidebar);
    const currentPath = window.location.pathname.toLowerCase();
    const currentHost = window.location.hostname.toLowerCase();

    let css = "";

    if (/^8chan\.(se|moe)$/.test(currentHost)) {
        css += ":not(.is-catalog) body{margin:0}#sideCatalogDiv{z-index:200;background:var(--background-gradient)}#navFadeEnd,#navFadeMid,.watchedNotification::before,:root.disable-banner #bannerImage,:root.hide-announcement #dynamicAnnouncement,:root.hide-checkboxes .deletionCheckBox,:root.hide-close-btn .inlineQuote>.innerPost>.postInfo.title>a:first-child,:root.hide-nocookie #captchaBody>table:nth-child(2)>tbody:first-child>tr:nth-child(2),:root.hide-panelmessage #panelMessage,:root.hide-posting-form #postingForm{display:none}:root.hide-defaultBL #navTopBoardsSpan{display:none!important}:root.is-catalog.show-catalog-form #postingForm{display:block!important}footer{visibility:hidden;height:0}nav.navHeader{z-index:300}:not(:root.bottom-header) .navHeader{box-shadow:0 1px 2px rgba(0,0,0,.15)}:root.bottom-header nav.navHeader{top:auto!important;bottom:0!important;box-shadow:0 -1px 2px rgba(0,0,0,.15)}:root.fit-replies :not(.hidden).innerPost{margin-left:10px;display:flow-root}:root.fit-replies :not(.hidden,.inlineQuote).innerPost{margin-left:0}:root.fit-replies .quoteTooltip{display:table!important}.originalNameLink{display:inline;overflow-wrap:anywhere;white-space:normal}.multipleUploads .uploadCell:not(.expandedCell){max-width:215px}.imgExpanded,video{max-height:90vh!important;object-fit:contain;width:auto!important}#watchedMenu .floatingContainer{overflow-x:hidden;overflow-wrap:break-word}.watchedCellLabel a::before{content:attr(data-board);color:#aaa;margin-right:4px;font-weight:700}.watchButton.watched-active::before{color:#dd003e!important}#watchedMenu{font-size:smaller;padding:5px!important;box-shadow:-3px 3px 2px 0 rgba(0,0,0,.19)}#watchedMenu,#watchedMenu .floatingContainer{min-width:200px}.watchedNotification::before{padding-right:2px}#watchedMenu .floatingContainer{scrollbar-width:thin;scrollbar-color:var(--link-color) var(--contrast-color)}.scroll-arrow-btn{position:fixed;right:50px;width:36px;height:35px;background:#222;color:#fff;border:none;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,.18);font-size:22px;cursor:pointer;opacity:.7;z-index:800;display:flex;align-items:center;justify-content:center;transition:opacity .2s,background .2s}:root:not(.is-index,.is-catalog).ss-sidebar .scroll-arrow-btn{right:330px!important}.scroll-arrow-btn:hover{opacity:1;background:#444}#scroll-arrow-up{bottom:80px}#scroll-arrow-down{bottom:32px}.innerUtility.top{margin-top:2em;background-color:transparent!important;color:var(--link-color)!important}.innerUtility.top a{color:var(--link-color)!important}.bumpLockIndicator::after{padding-right:3px}.floatingMenu.focused{z-index:305!important}.ss-chevron{transition:transform .2s;margin-left:6px;font-size:12px;display:inline-block}a.imgLink[data-filemime^='audio/'],a.originalNameLink[href$='.m4a'],a.originalNameLink[href$='.mp3'],a.originalNameLink[href$='.ogg'],a.originalNameLink[href$='.wav']{position:relative}.audio-preview-indicator{display:none;position:absolute;background:rgba(0,0,0,.7);color:#fff;padding:5px;font-size:12px;border-radius:3px;z-index:1000;left:0;top:0;white-space:nowrap;pointer-events:none}a.originalNameLink:hover .audio-preview-indicator,a[data-filemime^='audio/']:hover .audio-preview-indicator{display:block}";
    }
    if (/\/res\/[^/]+\.html$/.test(currentPath)) {
        css += ":root.sticky-qr #quick-reply{display:block;top:auto!important;bottom:0}:root.sticky-qr.ss-sidebar #quick-reply{left:auto!important;right:0!important}:root.sticky-qr.ss-leftsidebar #quick-reply{left:0!important;right:auto!important}:root.sticky-qr #qrbody{resize:vertical;max-height:50vh;height:130px}#selectedDivQr,:root.sticky-qr #selectedDiv{display:inline-flex;overflow:scroll hidden;max-width:300px}#qrbody{min-width:300px}:root.bottom-header #quick-reply{bottom:28px!important}:root.fade-qr #quick-reply{padding:0;opacity:.7;transition:opacity .3s ease}:root.fade-qr #quick-reply:focus-within,:root.fade-qr #quick-reply:hover{opacity:1}.floatingMenu{padding:0!important}#qrFilesBody{max-width:310px}#unread-line{height:2px;border:none!important;pointer-events:none!important;background-image:linear-gradient(to left,rgba(185,185,185,.2),var(--text-color),rgba(185,185,185,.2));margin:-3px auto 0 auto;width:60%}:root.ss-sidebar #bannerImage{width:19rem;right:0;position:fixed;top:26px}:root.ss-sidebar.bottom-header #bannerImage{top:0!important}:root.ss-leftsidebar #bannerImage{width:19rem;left:0;position:fixed;top:26px}:root.ss-leftsidebar.bottom-header #bannerImage{top:0!important}.quoteTooltip{z-index:999}.nestedQuoteLink{text-decoration:underline dashed!important}:root.hide-stub .unhideButton{display:none}.quoteTooltip .innerPost{overflow:hidden;box-shadow:-3px 3px 2px 0 rgba(0,0,0,.19)}.inlineQuote{margin:2px 0}.postCell.is-hidden-by-filter{display:none}.reply-inlined{text-decoration:underline dashed!important;text-underline-offset:2px}.target-highlight{background:var(--marked-color);border-color:var(--marked-border-color);color:var(--marked-text-color)}:root.highlight-you .innerPost:has(> .postInfo.title > .youName){border-left:dashed #68b723 3px}:root.highlight-you .innerPost:not(:has(> .postInfo.title > .youName)):has(.divMessage > .quoteLink.you){border-left:solid #dd003e 3px}.postCell::before{display:inline!important;height:auto!important}";
    }
    if (/\/catalog\.html$/.test(currentPath)) {
        css += "#dynamicAnnouncement{display:none}#postingForm{margin:2em auto}";
    }

    if (!document.getElementById('8chSS')) {
        const style = document.createElement('style');
        style.id = '8chSS';
        style.textContent = css;
        document.head.appendChild(style);
    }
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
    initImageHover();
    async function featureSaveScroll() {
        const MAX_PAGES = 50;
        const currentPage = window.location.origin + window.location.pathname + window.location.search;
        const hasAnchor = !!window.location.hash;
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
            if (!isThreadPage(window.location.pathname)) return;
            if (!(await getSetting("enableScrollSave"))) return;

            const scrollPosition = window.scrollY;
            const timestamp = Date.now();
            const savedData = await getSavedScrollData();
            if (savedData && typeof savedData.position === "number") {
                if (scrollPosition <= savedData.position) {
                    return;
                }
            }
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
            const allKeys = await GM.listValues();
            const scrollKeys = allKeys.filter((key) =>
                key.startsWith("8chanSS_scrollPosition_")
            );

            if (scrollKeys.length > MAX_PAGES) {
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
                keyData.sort((a, b) => a.timestamp - b.timestamp);
                const keysToRemove = keyData.slice(0, keyData.length - MAX_PAGES);
                for (const item of keysToRemove) {
                    await GM.deleteValue(item.key);
                }
            }
        }
        async function restoreScrollPosition() {
            if (!isThreadPage(window.location.pathname)) return;
            if (!(await getSetting("enableScrollSave"))) return;

            const savedData = await getSavedScrollData();
            if (!savedData || typeof savedData.position !== "number") return;
            const position = savedData.position;
            await GM.setValue(
                `8chanSS_scrollPosition_${currentPage}`,
                JSON.stringify({
                    position: position,
                    timestamp: Date.now(),
                })
            );

            if (hasAnchor) {
                setTimeout(() => addUnreadLineAtViewportCenter(position), 100);
                return;
            }
            if (!isNaN(position)) {
                window.scrollTo(0, position);
                setTimeout(() => addUnreadLineAtViewportCenter(position), 100);
            }
        }
        async function addUnreadLineAtViewportCenter(scrollPosition) {
            if (!(await getSetting("enableScrollSave_showUnreadLine"))) {
                return;
            }

            const divPosts = document.querySelector(".divPosts");
            if (!divPosts) return;
            const centerX = window.innerWidth / 2;
            const centerY = (typeof scrollPosition === "number")
                ? (window.innerHeight / 2) + (scrollPosition - window.scrollY)
                : window.innerHeight / 2;
            let el = document.elementFromPoint(centerX, centerY);
            while (el && el !== divPosts && (!el.classList || !el.classList.contains("postCell"))) {
                el = el.parentElement;
            }
            if (!el || el === divPosts || !el.id) return;
            if (el.parentElement !== divPosts) return;
            const oldMarker = document.getElementById("unread-line");
            if (oldMarker && oldMarker.parentNode) {
                oldMarker.parentNode.removeChild(oldMarker);
            }
            const marker = document.createElement("hr");
            marker.id = "unread-line";
            if (el.nextSibling) {
                divPosts.insertBefore(marker, el.nextSibling);
            } else {
                divPosts.appendChild(marker);
            }
        }
        window.addEventListener("beforeunload", () => {
            saveScrollPosition();
        });
        window.addEventListener("load", async () => {
            await restoreScrollPosition();
        });
        await restoreScrollPosition();
    }
    async function removeUnreadLineIfAtBottom() {
        if (!(await getSetting("enableScrollSave_showUnreadLine"))) {
            return;
        }
        const margin = 20; 
        if ((window.innerHeight + window.scrollY) >= (document.body.offsetHeight - margin)) {
            const oldMarker = document.getElementById("unread-line");
            if (oldMarker && oldMarker.parentNode) {
                oldMarker.parentNode.removeChild(oldMarker);
            }
        }
    }

    window.addEventListener("scroll", removeUnreadLineIfAtBottom);
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
                        if (openInNewTab) {
                            link.target = "_blank";
                            link.rel = "noopener noreferrer"; 
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
    function catalogThreadsInNewTab() {
        const catalogDiv = document.querySelector('.catalogDiv');
        if (!catalogDiv) return;

        function setLinksTargetBlank(cell) {
            const link = cell.querySelector('a.linkThumb');
            if (link) link.setAttribute('target', '_blank');
        }
        catalogDiv.querySelectorAll('.catalogCell').forEach(setLinksTargetBlank);
        if (catalogDiv) {
            const observer = new MutationObserver(() => {
                setLinksTargetBlank(catalogDiv);
            });
            observer.observe(catalogDiv, { childList: true, subtree: true });
        }
    }
    function featureImageHover() {
        const MEDIA_MAX_WIDTH = "90vw";
        const MEDIA_OPACITY_LOADING = "0.75";
        const MEDIA_OPACITY_LOADED = "1";
        const MEDIA_OFFSET = 2; 
        const MEDIA_BOTTOM_MARGIN = 3; 
        const AUDIO_INDICATOR_TEXT = "▶ Playing audio...";
        function getMediaOffset() {
            return window.innerWidth * (MEDIA_OFFSET / 100);
        }
        function getMediaBottomMargin() {
            return window.innerHeight * (MEDIA_BOTTOM_MARGIN / 100);
        }
        let floatingMedia = null;
        let cleanupFns = [];
        let currentAudioIndicator = null;
        let lastMouseEvent = null; 
        function clamp(val, min, max) {
            return Math.max(min, Math.min(max, val));
        }
        function positionFloatingMedia(event) {
            if (!floatingMedia) return;
            const vw = window.innerWidth;
            const vh = window.innerHeight;
            const mw = floatingMedia.offsetWidth || 0;
            const mh = floatingMedia.offsetHeight || 0;

            const MEDIA_OFFSET_PX = getMediaOffset();
            const MEDIA_BOTTOM_MARGIN_PX = getMediaBottomMargin();
            const SCROLLBAR_WIDTH = window.innerWidth - document.documentElement.clientWidth; 
            let x = event.clientX + MEDIA_OFFSET_PX;
            x = clamp(x, 0, vw - mw - SCROLLBAR_WIDTH);
            let y = event.clientY;
            const maxY = vh - mh - MEDIA_BOTTOM_MARGIN_PX;
            y = Math.max(0, Math.min(y, maxY));

            floatingMedia.style.left = `${x}px`;
            floatingMedia.style.top = `${y}px`;
        }
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
        async function onThumbEnter(e) {
            cleanupFloatingMedia();
            lastMouseEvent = e; 
            const thumb = e.currentTarget;
            let filemime = null, fullSrc = null, isVideo = false, isAudio = false;
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
            if (isAudio) {
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
                const indicator = document.createElement("div");
                indicator.classList.add("audio-preview-indicator");
                indicator.textContent = AUDIO_INDICATOR_TEXT;
                container.appendChild(indicator);
                currentAudioIndicator = indicator;
                const cleanup = () => cleanupFloatingMedia();
                thumb.addEventListener("mouseleave", cleanup, { once: true });
                container.addEventListener("click", cleanup, { once: true });
                window.addEventListener("scroll", cleanup, { once: true });
                cleanupFns.push(() => thumb.removeEventListener("mouseleave", cleanup));
                cleanupFns.push(() => container.removeEventListener("click", cleanup));
                cleanupFns.push(() => window.removeEventListener("scroll", cleanup));
                return;
            }
            floatingMedia = isVideo ? document.createElement("video") : document.createElement("img");
            floatingMedia.src = fullSrc;
            floatingMedia.style.position = "fixed";
            floatingMedia.style.zIndex = "9999";
            floatingMedia.style.pointerEvents = "none";
            floatingMedia.style.opacity = MEDIA_OPACITY_LOADING;
            floatingMedia.style.left = "-9999px";
            floatingMedia.style.top = "-9999px";
            floatingMedia.style.maxWidth = MEDIA_MAX_WIDTH;
            const availableHeight = window.innerHeight - getMediaBottomMargin();
            floatingMedia.style.maxHeight = `${availableHeight}px`;
            if (isVideo) {
                floatingMedia.autoplay = true;
                floatingMedia.loop = true;
                floatingMedia.muted = false;
                floatingMedia.playsInline = true;
            }
            document.body.appendChild(floatingMedia);
            function initialPlacement() {
                if (lastMouseEvent) {
                    positionFloatingMedia(lastMouseEvent);
                }
            }
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
            floatingMedia.onerror = cleanupFloatingMedia;
            function leaveHandler() { cleanupFloatingMedia(); }
            thumb.addEventListener("mouseleave", leaveHandler, { once: true });
            window.addEventListener("scroll", leaveHandler, { once: true });
            cleanupFns.push(() => thumb.removeEventListener("mouseleave", leaveHandler));
            cleanupFns.push(() => window.removeEventListener("scroll", leaveHandler));
        }
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
        attachThumbListeners();
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
    function featureNestedReplies() {
        function ensureReplyPreviewPlacement(root = document) {
            root.querySelectorAll('.innerOP').forEach(innerOP => {
                const opHeadTitle = innerOP.querySelector('.opHead.title');
                const replyPreview = innerOP.querySelector('.replyPreview');
                if (opHeadTitle && replyPreview && opHeadTitle.nextSibling !== replyPreview) {
                    innerOP.insertBefore(replyPreview, opHeadTitle.nextSibling);
                }
            });
            root.querySelectorAll('.innerPost').forEach(innerPost => {
                const postInfoTitle = innerPost.querySelector('.postInfo.title');
                const replyPreview = innerPost.querySelector('.replyPreview');
                if (postInfoTitle && replyPreview && postInfoTitle.nextSibling !== replyPreview) {
                    innerPost.insertBefore(replyPreview, postInfoTitle.nextSibling);
                }
            });
        }
        function ensureInlineQuotePlacement(node) {
            if (
                node.nodeType === 1 &&
                node.classList.contains('inlineQuote') &&
                node.parentElement &&
                node.parentElement.classList.contains('replyPreview')
            ) {
                const replyPreview = node.parentElement;
                if (replyPreview.firstChild !== node) {
                    replyPreview.insertBefore(node, replyPreview.firstChild);
                }
            }
            else if (node.nodeType === 1) {
                node.querySelectorAll('.replyPreview .inlineQuote').forEach(inlineQuote => {
                    const replyPreview = inlineQuote.parentElement;
                    if (replyPreview.firstChild !== inlineQuote) {
                        replyPreview.insertBefore(inlineQuote, replyPreview.firstChild);
                    }
                });
            }
        }
        ensureReplyPreviewPlacement();
        const observer = new MutationObserver(mutations => {
            for (const mutation of mutations) {
                for (const node of mutation.addedNodes) {
                    if (node.nodeType !== 1) continue; 
                    if (node.matches && (node.matches('.innerPost') || node.matches('.innerOP'))) {
                        ensureReplyPreviewPlacement(node);
                    } else if (node.querySelectorAll) {
                        node.querySelectorAll('.innerPost, .innerOP').forEach(post => {
                            ensureReplyPreviewPlacement(post);
                        });
                    }
                    ensureInlineQuotePlacement(node);
                }
            }
        });
        const postsContainer = document.querySelector('.opCell');
        if (postsContainer) {
            observer.observe(postsContainer, { childList: true, subtree: true });
        }
        document.addEventListener('click', function (e) {
            const a = e.target.closest('.panelBacklinks > a');
            if (!a) return;
            setTimeout(() => {
                a.classList.toggle('reply-inlined');
            }, 0);
        });
    }
    function featureBlurSpoilers() {
        function revealSpoilers() {
            const spoilerLinks = document.querySelectorAll("a.imgLink");
            spoilerLinks.forEach(async (link) => {
                const img = link.querySelector("img");
                if (!img) return;
                const isCustomSpoiler = img.src.includes("/custom.spoiler");
                const isNotThumbnail = !img.src.includes("/.media/t_");

                if (isNotThumbnail || isCustomSpoiler) {
                    let href = link.getAttribute("href");
                    if (!href) return;
                    const match = href.match(/\/\.media\/([^\/]+)\.[a-zA-Z0-9]+$/);
                    if (!match) return;
                    const transformedSrc = `/.media/t_${match[1]}`;
                    img.src = transformedSrc;
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
        revealSpoilers();
        const observer = new MutationObserver(revealSpoilers);
        observer.observe(document.body, { childList: true, subtree: true });
    }
    function decodeHtmlEntitiesTwice(html) {
        const txt = document.createElement('textarea');
        txt.innerHTML = html;
        const once = txt.value;
        txt.innerHTML = once;
        return txt.value;
    }
    function highlightMentions() {
        const watchedCells = document.querySelectorAll("#watchedMenu .watchedCell");
        if (!watchedCells.length) return; 
        watchedCells.forEach((cell) => {
            const notification = cell.querySelector(".watchedCellLabel span.watchedNotification");
            if (!notification) return; 

            const labelLink = cell.querySelector(".watchedCellLabel a");
            if (!labelLink) return; 
            if (!labelLink.dataset.board) {
                const href = labelLink.getAttribute("href");
                const match = href?.match(/^(?:https?:\/\/[^\/]+)?\/([^\/]+)\//);
                if (match) {
                    labelLink.dataset.board = `/${match[1]}/ -`;
                }
                if (document.location.href.includes(href)) {
                    const watchButton = document.querySelector(".opHead .watchButton");
                    if (watchButton) {
                        watchButton.style.color = "var(--board-title-color)";
                        watchButton.title = "Watched";
                    }
                }
                const originalHtml = labelLink.innerHTML;
                const decodedText = decodeHtmlEntitiesTwice(originalHtml);
                if (labelLink.textContent !== decodedText) {
                    labelLink.textContent = decodedText;
                }
            }
            const notificationText = notification.textContent.trim();
            if (notificationText.startsWith("(")) {
                return;
            }
            if (notificationText.includes("(you)")) {
                const parts = notificationText.split(", ");
                const totalReplies = parts[0];
                labelLink.style.color = "var(--board-title-color)";
                notification.style.color = "var(--board-title-color)";
                notification.textContent = ` (${totalReplies}) (You)`;
                notification.style.fontWeight = "bold";
            }
            else if (/^\d+$/.test(notificationText)) {
                notification.textContent = ` (${notificationText})`;
                notification.style.color = "var(--link-color)";
                notification.style.fontWeight = "bold";
            }
            notification.dataset.processed = "true";
        });
    }
    highlightMentions();
    const watchedMenu = document.getElementById("watchedMenu");
    if (watchedMenu) {
        const observer = new MutationObserver(() => {
            highlightMentions();
        });
        observer.observe(watchedMenu, { childList: true, subtree: true });
    }
    async function featureWatchThreadOnReply() {
        const getWatchButton = () => document.querySelector(".watchButton");
        function watchThreadIfNotWatched() {
            const btn = getWatchButton();
            if (btn && !btn.classList.contains("watched-active")) {
                btn.click(); 
                setTimeout(() => {
                    btn.classList.add("watched-active");
                }, 100);
            }
        }
        function updateWatchButtonClass() {
            const btn = getWatchButton();
            if (!btn) return;
            if (btn.classList.contains("watched-active")) {
                btn.classList.add("watched-active");
            } else {
                btn.classList.remove("watched-active");
            }
        }
        const submitButton = document.getElementById("qrbutton");
        if (submitButton) {
            submitButton.removeEventListener("click", submitButton._watchThreadHandler || (() => { }));
            submitButton._watchThreadHandler = async function () {
                if (await getSetting("watchThreadOnReply")) {
                    setTimeout(watchThreadIfNotWatched, 500); 
                }
            };
            submitButton.addEventListener("click", submitButton._watchThreadHandler);
        }
        updateWatchButtonClass();
        const btn = getWatchButton();
        if (btn) {
            btn.removeEventListener("click", btn._updateWatchHandler || (() => { }));
            btn._updateWatchHandler = () => setTimeout(updateWatchButtonClass, 100);
            btn.addEventListener("click", btn._updateWatchHandler);
        }
    }
    document.addEventListener("keydown", async function (event) {
        if (
            event.altKey &&
            !event.ctrlKey &&
            !event.shiftKey &&
            !event.metaKey &&
            (event.key === "w" || event.key === "W")
        ) {
            event.preventDefault();
            if (
                typeof getSetting === "function" &&
                (await getSetting("watchThreadOnReply"))
            ) {
                const btn = document.querySelector(".watchButton");
                if (btn && !btn.classList.contains("watched-active")) {
                    btn.click();
                    setTimeout(() => {
                        btn.classList.add("watched-active");
                    }, 100);
                }
            }
        }
    });
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
        onReady(() => {
            showThreadWatcher();
            addCloseListener();
        });
    }
    function featureMarkYourPost() {
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
        function getTYous() {
            try {
                const val = localStorage.getItem(T_YOUS_KEY);
                return val ? JSON.parse(val) : [];
            } catch {
                return [];
            }
        }

        function setTYous(arr) {
            localStorage.setItem(T_YOUS_KEY, JSON.stringify(arr.map(Number)));
        }
        document.body.addEventListener('click', function (e) {
            if (e.target.matches('.extraMenuButton')) {
                const postCell = e.target.closest('.postCell, .opCell');
                if (postCell) {
                    const menu = document.querySelector(MENU_SELECTOR);
                    if (menu) {
                        menu.setAttribute('data-post-id', postCell.id);
                    }
                }
            }
        });

        function getPostIdFromMenu(menu) {
            return menu.getAttribute('data-post-id') || null;
        }

        function toggleYouNameClass(postId, add) {
            const postCell = document.getElementById(postId);
            if (!postCell) return;
            const nameLink = postCell.querySelector(".linkName.noEmailName");
            if (nameLink) {
                nameLink.classList.toggle("youName", add);
            }
        }
        function addMenuEntries(root = document) {
            root.querySelectorAll(MENU_SELECTOR).forEach(menu => {
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
    onReady(featureMarkYourPost);
    function featureScrollArrows() {
        if (document.getElementById("scroll-arrow-up") || document.getElementById("scroll-arrow-down")) {
            return;
        }
        const upBtn = document.createElement("button");
        upBtn.id = "scroll-arrow-up";
        upBtn.className = "scroll-arrow-btn";
        upBtn.title = "Scroll to top";
        upBtn.innerHTML = "▲";
        upBtn.addEventListener("click", () => {
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
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
    function featureDeleteNameCheckbox() {
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
        const savedCheckboxState = localStorage.getItem("8chanSS_deleteNameCheckbox") === "true";
        checkbox.checked = savedCheckboxState;

        const nameInput = document.getElementById("qrname");
        if (nameInput) {
            if (checkbox.checked) {
                nameInput.value = "";
                localStorage.removeItem("name");
            }
            checkbox.addEventListener("change", function () {
                localStorage.setItem("8chanSS_deleteNameCheckbox", checkbox.checked);
            });
        }
    }
    function featureBeepOnYou() {
        const beep = new Audio(
            "data:audio/wav;base64,UklGRjQDAABXQVZFZm10IBAAAAABAAEAgD4AAIA+AAABAAgAc21wbDwAAABBAAADAAAAAAAAAAA8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABkYXRhzAIAAGMms8em0tleMV4zIpLVo8nhfSlcPR102Ki+5JspVEkdVtKzs+K1NEhUIT7DwKrcy0g6WygsrM2k1NpiLl0zIY/WpMrjgCdbPhxw2Kq+5Z4qUkkdU9K1s+K5NkVTITzBwqnczko3WikrqM+l1NxlLF0zIIvXpsnjgydZPhxs2ay95aIrUEkdUdC3suK8N0NUIjq+xKrcz002WioppdGm091pK1w0IIjYp8jkhydXPxxq2K295aUrTkoeTs65suK+OUFUIzi7xqrb0VA0WSoootKm0t5tKlo1H4TYqMfkiydWQBxm16+85actTEseS8y7seHAPD9TIza5yKra01QyWSson9On0d5wKVk2H4DYqcfkjidUQB1j1rG75KsvSkseScu8seDCPz1TJDW2yara1FYxWSwnm9Sn0N9zKVg2H33ZqsXkkihSQR1g1bK65K0wSEsfR8i+seDEQTxUJTOzy6rY1VowWC0mmNWoz993KVc3H3rYq8TklSlRQh1d1LS647AyR0wgRMbAsN/GRDpTJTKwzKrX1l4vVy4lldWpzt97KVY4IXbUr8LZljVPRCxhw7W3z6ZISkw1VK+4sMWvXEhSPk6buay9sm5JVkZNiLWqtrJ+TldNTnquqbCwilZXU1BwpKirrpNgWFhTaZmnpquZbFlbVmWOpaOonHZcXlljhaGhpZ1+YWBdYn2cn6GdhmdhYGN3lp2enIttY2Jjco+bnJuOdGZlZXCImJqakHpoZ2Zug5WYmZJ/bGlobX6RlpeSg3BqaW16jZSVkoZ0bGtteImSk5KIeG5tbnaFkJKRinxxbm91gY2QkIt/c3BwdH6Kj4+LgnZxcXR8iI2OjIR5c3J0e4WLjYuFe3VzdHmCioyLhn52dHR5gIiKioeAeHV1eH+GiYqHgXp2dnh9hIiJh4J8eHd4fIKHiIeDfXl4eHyBhoeHhH96eHmA"
        );
        window.originalTitle = document.title;
        window.isNotifying = false;
        let beepOnYouSetting = false;
        let notifyOnYouSetting = false;
        let customMsgSetting = "(!) ";
        async function initSettings() {
            beepOnYouSetting = await getSetting("beepOnYou");
            notifyOnYouSetting = await getSetting("notifyOnYou");
            const customMsg = await getSetting("notifyOnYou_customMessage");
            if (customMsg) customMsgSetting = customMsg;
        }
        initSettings();
        function playBeep() {
            if (beep.paused) {
                beep.play().catch((e) => console.warn("Beep failed:", e));
            } else {
                beep.currentTime = 0; 
            }
        }
        function notifyOnYou() {
            if (!window.isNotifying && !document.hasFocus()) {
                window.isNotifying = true;
                document.title = customMsgSetting + " " + window.originalTitle;
            }
        }
        window.addEventListener("focus", () => {
            if (window.isNotifying) {
                document.title = window.originalTitle;
                window.isNotifying = false;
            }
        });
        const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                for (const node of mutation.addedNodes) {
                    if (
                        node.nodeType === 1 &&
                        node.querySelector &&
                        node.querySelector("a.quoteLink.you")
                    ) {
                        if (node.closest('.innerPost')) {
                            continue;
                        }
                        if (beepOnYouSetting) {
                            playBeep();
                        }
                        if (notifyOnYouSetting) {
                            notifyOnYou();
                        }
                    }
                }
            }
        });

        observer.observe(document.body, { childList: true, subtree: true });
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
    featureBeepOnYou();
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
        convertLabelCreatedTimes();
        const threadsContainer = document.querySelector('.divPosts');
        if (threadsContainer) {
            new MutationObserver(() => {
                convertLabelCreatedTimes(threadsContainer);
            }).observe(threadsContainer, { childList: true, subtree: true });
        }
    }
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
        const labels = document.querySelectorAll('#qrFilesBody .selectedCell .nameLabel');
        const label = labels[index];
        if (label) {
            label.textContent = finalName;
            label.title = finalName;
        }
    }
    function handleQrFilesBodyClick(event) {
        const label = event.target.closest('.nameLabel');
        if (!label || !label.closest('#qrFilesBody')) return;
        const labels = Array.from(document.querySelectorAll('#qrFilesBody .selectedCell .nameLabel'));
        const index = labels.indexOf(label);
        if (index !== -1) {
            renameFileAtIndex(index);
        }
    }
    function observeQrFilesBody() {
        const qrFilesBody = document.querySelector('#qrFilesBody');
        if (!qrFilesBody) return;
        if (!qrFilesBody.dataset.renameDelegationAttached) {
            qrFilesBody.addEventListener('click', handleQrFilesBodyClick);
            qrFilesBody.dataset.renameDelegationAttached = 'true';
        }
    }
    function startQrFilesBodyObserver() {
        const qrFilesBody = document.querySelector('#qrFilesBody');
        if (!qrFilesBody) return;
        observeQrFilesBody();
    }
    startQrFilesBodyObserver();
    async function createSettingsMenu() {
        let menu = document.getElementById("8chanSS-menu");
        if (menu) return menu;
        menu = document.createElement("div");
        menu.id = "8chanSS-menu";
        menu.style.position = "fixed";
        menu.style.top = "4rem"; 
        menu.style.left = "20rem"; 
        menu.style.zIndex = "99999";
        menu.style.background = "#222";
        menu.style.color = "#fff";
        menu.style.padding = "0";
        menu.style.borderRadius = "8px";
        menu.style.boxShadow = "0 4px 16px rgba(0,0,0,0.25)";
        menu.style.display = "none";
        menu.style.minWidth = "220px";
        menu.style.width = "100%";
        menu.style.maxWidth = "450px";
        menu.style.fontFamily = "sans-serif";
        menu.style.userSelect = "none";
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
        const tabNav = document.createElement("div");
        tabNav.style.display = "flex";
        tabNav.style.borderBottom = "1px solid #444";
        tabNav.style.background = "#2a2a2a";
        const tabContent = document.createElement("div");
        tabContent.style.padding = "15px 16px";
        tabContent.style.maxHeight = "65vh";
        tabContent.style.overflowY = "auto";
        tabContent.style.scrollbarWidth = "thin";
        const tempSettings = {};
        await Promise.all(
            Object.keys(flatSettings).map(async (key) => {
                tempSettings[key] = await getSetting(key);
            })
        );
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
            if (index === 0) {
                tabButton.style.borderTopLeftRadius = "8px";
                tabButton.style.margin = "5px 0 0 5px";
            }
            if (index === arr.length - 1) {
                tabButton.style.borderTopRightRadius = "8px";
                tabButton.style.margin = "5px 5px 0 0";
                tabButton.style.borderRight = "none"; 
            }

            tabButton.addEventListener("click", () => {
                Object.values(tabs).forEach((t) => {
                    t.content.style.display = "none";
                });
                tab.content.style.display = "block";
                tabNav.querySelectorAll("button").forEach((btn) => {
                    btn.style.background = "transparent";
                });
                tabButton.style.background = "#333";
            });

            tabNav.appendChild(tabButton);
        });

        menu.appendChild(tabNav);
        Object.values(tabs).forEach((tab, index) => {
            tab.content.style.display = index === 0 ? "block" : "none";
            tabContent.appendChild(tab.content);
        });

        menu.appendChild(tabContent);
        const buttonContainer = document.createElement("div");
        buttonContainer.style.display = "flex";
        buttonContainer.style.gap = "10px";
        buttonContainer.style.padding = "0 18px 15px";
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
        const info = document.createElement("div");
        info.style.fontSize = "11px";
        info.style.padding = "0 18px 12px";
        info.style.opacity = "0.7";
        info.style.textAlign = "center";
        info.innerHTML = 'Press Save to apply changes. Page will reload. - <a href="https://github.com/otacoo/8chanSS/blob/main/CHANGELOG.md" target="_blank" title="Check the changelog." style="color: #fff; text-decoration: underline dashed;">Ver. 1.36.0</a>';
        menu.appendChild(info);

        document.body.appendChild(menu);
        return menu;
    }
    function createTabContent(category, tempSettings) {
        const container = document.createElement("div");
        const categorySettings = scriptSettings[category];

        Object.keys(categorySettings).forEach((key) => {
            const setting = categorySettings[key];
            if (setting.type === "separator") {
                const hr = document.createElement("hr");
                hr.style.border = "none";
                hr.style.borderTop = "1px solid #444";
                hr.style.margin = "12px 0";
                container.appendChild(hr);
                return;
            }
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
            const parentRow = document.createElement("div");
            parentRow.style.display = "flex";
            parentRow.style.alignItems = "center";
            parentRow.style.marginBottom = "0px";
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
                const wrapper = document.createElement("div");
                wrapper.style.marginBottom = "10px";
                wrapper.appendChild(parentRow);
                container.appendChild(wrapper);
                return; 
            }
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.id = "setting_" + key;
            checkbox.checked =
                tempSettings[key] === true || tempSettings[key] === "true";
            checkbox.style.marginRight = "8px";
            const label = document.createElement("label");
            label.htmlFor = checkbox.id;
            label.textContent = setting.label;
            label.style.flex = "1";
            let chevron = null;
            let subOptionsContainer = null;
            if (setting?.subOptions) {
                chevron = document.createElement("span");
                chevron.className = "ss-chevron";
                chevron.innerHTML = "&#9654;"; 
                chevron.style.display = "inline-block";
                chevron.style.transition = "transform 0.2s";
                chevron.style.marginLeft = "6px";
                chevron.style.fontSize = "12px";
                chevron.style.userSelect = "none";
                chevron.style.transform = checkbox.checked
                    ? "rotate(90deg)"
                    : "rotate(0deg)";
            }
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
            const wrapper = document.createElement("div");
            wrapper.style.marginBottom = "10px";

            wrapper.appendChild(parentRow);
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
    function createShortcutsTab() {
        const container = document.createElement("div");
        const title = document.createElement("h3");
        title.textContent = "Keyboard Shortcuts";
        title.style.margin = "0 0 15px 0";
        title.style.fontSize = "16px";
        container.appendChild(title);
        const table = document.createElement("table");
        table.style.width = "100%";
        table.style.borderCollapse = "collapse";
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
        const shortcuts = [
            { keys: ["Ctrl", "F1"], action: "Open 8chanSS settings" },
            { keys: ["Tab"], action: "Target Quick Reply text area" },
            { keys: ["Ctrl", "Q"], action: "Toggle Quick Reply" },
            { keys: ["Ctrl", "Enter"], action: "Submit post" },
            { keys: ["Escape"], action: "Clear textarea and hide Quick Reply" },
            { keys: ["ALT", "W"], action: "Watch Thread" },
            { keys: ["SHIFT", "M1"], action: "Hide Thread in Catalog" },
            { keys: ["CTRL", "UP/DOWN"], action: "Scroll between Your Replies" },
            { keys: ["CTRL", "SHIFT", "UP/DOWN"], action: "Scroll between Replies to You" },
            { keys: ["Ctrl", "B"], action: "Bold text" },
            { keys: ["Ctrl", "I"], action: "Italic text" },
            { keys: ["Ctrl", "U"], action: "Underline text" },
            { keys: ["Ctrl", "S"], action: "Spoiler text" },
            { keys: ["Ctrl", "D"], action: "Doom text" },
            { keys: ["Ctrl", "M"], action: "Moe text" },
            { keys: ["Alt", "C"], action: "Code block" },
        ];
        shortcuts.forEach((shortcut) => {
            const row = document.createElement("tr");
            const shortcutCell = document.createElement("td");
            Object.assign(shortcutCell.style, tableStyles.td);
            shortcut.keys.forEach((key, index) => {
                const kbd = document.createElement("kbd");
                kbd.textContent = key;
                Object.assign(kbd.style, tableStyles.kbd);
                shortcutCell.appendChild(kbd);
                if (index < shortcut.keys.length - 1) {
                    const plus = document.createTextNode(" + ");
                    shortcutCell.appendChild(plus);
                }
            });

            row.appendChild(shortcutCell);
            const actionCell = document.createElement("td");
            actionCell.textContent = shortcut.action;
            Object.assign(actionCell.style, tableStyles.td);
            row.appendChild(actionCell);

            table.appendChild(row);
        });

        container.appendChild(table);
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
    document.addEventListener("keydown", async function (event) {
        if (event.ctrlKey && event.key === "F1") {
            event.preventDefault();
            let menu = document.getElementById("8chanSS-menu") || (await createSettingsMenu());
            menu.style.display = menu.style.display === "none" || menu.style.display === "" ? "block" : "none";
            return;
        }
        if (event.ctrlKey && (event.key === "q" || event.key === "Q")) {
            event.preventDefault();
            const hiddenDiv = document.getElementById("quick-reply");
            if (!hiddenDiv) return;
            const isHidden = hiddenDiv.style.display === "none" || hiddenDiv.style.display === "";
            hiddenDiv.style.display = isHidden ? "block" : "none";
            if (isHidden) {
                setTimeout(() => {
                    const textarea = document.getElementById("qrbody");
                    if (textarea) textarea.focus();
                }, 50);
            }
            return;
        }
        if (event.key === "Escape") {
            const textarea = document.getElementById("qrbody");
            if (textarea) textarea.value = "";
            const quickReply = document.getElementById("quick-reply");
            if (quickReply) quickReply.style.display = "none";
            return;
        }
        if (event.ctrlKey && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
            event.preventDefault();
            const isOwnReply = !event.shiftKey;
            const isNext = event.key === 'ArrowDown';
            scrollToReply(isOwnReply, isNext);
            return;
        }
    });
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
        replyTextarea.addEventListener("keydown", function (event) {
            const key = event.key.toLowerCase();
            if (key === "c" && event.altKey && !event.ctrlKey && bbCodeCombinations.has(key)) {
                event.preventDefault();
                applyBBCode(event.target, key);
                return;
            }
            if (event.ctrlKey && !event.altKey && bbCodeCombinations.has(key) && key !== "c") {
                event.preventDefault();
                applyBBCode(event.target, key);
                return;
            }
        });
    }
    const bbCodeCombinations = new Map([
        ["s", ["[spoiler]", "[/spoiler]"]],
        ["b", ["'''", "'''"]],
        ["u", ["__", "__"]],
        ["i", ["''", "''"]],
        ["d", ["[doom]", "[/doom]"]],
        ["m", ["[moe]", "[/moe]"]],
        ["c", ["[code]", "[/code]"]],
    ]);
    function applyBBCode(textBox, key) {
        const [openTag, closeTag] = bbCodeCombinations.get(key);
        const { selectionStart, selectionEnd, value } = textBox;

        if (selectionStart === selectionEnd) {
            const before = value.slice(0, selectionStart);
            const after = value.slice(selectionEnd);
            const newCursor = selectionStart + openTag.length;
            textBox.value = before + openTag + closeTag + after;
            textBox.selectionStart = textBox.selectionEnd = newCursor;
        } else {
            const before = value.slice(0, selectionStart);
            const selected = value.slice(selectionStart, selectionEnd);
            const after = value.slice(selectionEnd);
            textBox.value = before + openTag + selected + closeTag + after;
            textBox.selectionStart = selectionStart + openTag.length;
            textBox.selectionEnd = selectionEnd + openTag.length;
        }
    }
    let lastHighlighted = null;
    let lastType = null; 
    let lastIndex = -1;

    function getEligiblePostCells(isOwnReply) {
        const selector = isOwnReply
            ? '.postCell:has(a.youName), .opCell:has(a.youName)'
            : '.postCell:has(a.quoteLink.you), .opCell:has(a.quoteLink.you)';
        return Array.from(document.querySelectorAll(selector));
    }

    function scrollToReply(isOwnReply = true, getNextReply = true) {
        const postCells = getEligiblePostCells(isOwnReply);
        if (!postCells.length) return;
        let currentIndex = -1;
        if (
            lastType === (isOwnReply ? "own" : "reply") &&
            lastHighlighted &&
            (currentIndex = postCells.indexOf(lastHighlighted.closest('.postCell, .opCell'))) !== -1
        ) {
        } else {
            const viewportMiddle = window.innerHeight / 2;
            currentIndex = postCells.findIndex(cell => {
                const rect = cell.getBoundingClientRect();
                return rect.top + rect.height / 2 > viewportMiddle;
            });
            if (currentIndex === -1) {
                currentIndex = getNextReply ? -1 : postCells.length;
            }
        }
        const targetIndex = getNextReply ? currentIndex + 1 : currentIndex - 1;
        if (targetIndex < 0 || targetIndex >= postCells.length) return;

        const postContainer = postCells[targetIndex];
        if (postContainer) {
            postContainer.scrollIntoView({ behavior: "smooth", block: "center" });
            if (lastHighlighted) {
                lastHighlighted.classList.remove('target-highlight');
            }
            let anchorId = null;
            let anchorElem = postContainer.querySelector('[id^="p"]');
            if (anchorElem && anchorElem.id) {
                anchorId = anchorElem.id;
            } else if (postContainer.id) {
                anchorId = postContainer.id;
            }
            if (anchorId) {
                if (location.hash !== '#' + anchorId) {
                    history.replaceState(null, '', '#' + anchorId);
                }
            }
            const innerPost = postContainer.querySelector('.innerPost');
            if (innerPost) {
                innerPost.classList.add('target-highlight');
                lastHighlighted = innerPost;
            } else {
                lastHighlighted = null;
            }
            lastType = isOwnReply ? "own" : "reply";
            lastIndex = targetIndex;
        }
    }
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
    function featureCatalogHiding() {
        const STORAGE_KEY = "8chanSS_hiddenCatalogThreads";
        let showHiddenMode = false;
        function getBoardAndThreadNumFromCell(cell) {
            const link = cell.querySelector("a.linkThumb[href*='/res/']");
            if (!link) return { board: null, threadNum: null };
            const match = link.getAttribute("href").match(/^\/([^/]+)\/res\/(\d+)\.html/);
            if (!match) return { board: null, threadNum: null };
            return { board: match[1], threadNum: match[2] };
        }
        async function loadHiddenThreadsObj() {
            const raw = await GM.getValue(STORAGE_KEY, "{}");
            try {
                const obj = JSON.parse(raw);
                return typeof obj === "object" && obj !== null ? obj : {};
            } catch {
                return {};
            }
        }
        async function saveHiddenThreadsObj(obj) {
            await GM.setValue(STORAGE_KEY, JSON.stringify(obj));
        }
        async function applyHiddenThreads() {
            const STORAGE_KEY = "8chanSS_hiddenCatalogThreads";
            const hiddenThreadsObjRaw = await GM.getValue(STORAGE_KEY, "{}");
            let hiddenThreadsObj;
            try {
                hiddenThreadsObj = JSON.parse(hiddenThreadsObjRaw);
                if (typeof hiddenThreadsObj !== "object" || hiddenThreadsObj === null) hiddenThreadsObj = {};
            } catch {
                hiddenThreadsObj = {};
            }
            document.querySelectorAll(".catalogCell").forEach(cell => {
                const { board, threadNum } = getBoardAndThreadNumFromCell(cell);
                if (!board || !threadNum) return;
                const hiddenThreads = hiddenThreadsObj[board] || [];

                if (typeof showHiddenMode !== "undefined" && showHiddenMode) {
                    if (hiddenThreads.includes(threadNum)) {
                        cell.style.display = "";
                        cell.classList.add("ss-unhide-thread");
                        cell.classList.remove("ss-hidden-thread");
                    } else {
                        cell.style.display = "none";
                        cell.classList.remove("ss-unhide-thread", "ss-hidden-thread");
                    }
                } else {
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
        async function onCatalogCellClick(e) {
            const cell = e.target.closest(".catalogCell");
            if (!cell) return;
            if (e.shiftKey && e.button === 0) {
                const { board, threadNum } = getBoardAndThreadNumFromCell(cell);
                if (!board || !threadNum) return;

                let hiddenThreadsObj = await loadHiddenThreadsObj();
                if (!hiddenThreadsObj[board]) hiddenThreadsObj[board] = [];
                let hiddenThreads = hiddenThreadsObj[board];

                if (showHiddenMode) {
                    hiddenThreads = hiddenThreads.filter(num => num !== threadNum);
                    hiddenThreadsObj[board] = hiddenThreads;
                    await saveHiddenThreadsObj(hiddenThreadsObj);
                    await applyHiddenThreads();
                } else {
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
        async function showAllHiddenThreads() {
            showHiddenMode = true;
            await applyHiddenThreads();
            const btn = document.getElementById("ss-show-hidden-btn");
            if (btn) btn.textContent = "Hide Hidden";
        }
        async function hideAllHiddenThreads() {
            showHiddenMode = false;
            await applyHiddenThreads();
            const btn = document.getElementById("ss-show-hidden-btn");
            if (btn) btn.textContent = "Show Hidden";
        }
        async function toggleShowHiddenThreads() {
            if (showHiddenMode) {
                await hideAllHiddenThreads();
            } else {
                await showAllHiddenThreads();
            }
        }
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
        function hideThreadsOnRefresh() {
            if (!/\/catalog\.html$/.test(window.location.pathname)) return;
            onReady(addShowHiddenButton);
            onReady(applyHiddenThreads);
            const catalogContainer = document.querySelector(".catalogWrapper, .catalogDiv");
            if (catalogContainer) {
                catalogContainer.addEventListener("click", onCatalogCellClick, true);
                const observer = new MutationObserver(applyHiddenThreads);
                observer.observe(catalogContainer, { childList: true, subtree: true });
            }
        }

        hideThreadsOnRefresh();
    }
    const captchaInput = document.getElementById("QRfieldCaptcha");
    if (captchaInput) {
        captchaInput.autocomplete = "off";
    }
    function preventFooterScrollIntoView() {
        const footer = document.getElementById('footer');
        if (footer && !footer._scrollBlocked) {
            footer._scrollBlocked = true; 
            footer.scrollIntoView = function () { };
        }
    }
    const opHeadTitle = document.querySelector('.opHead.title');
    const innerOP = document.querySelector('.innerOp');
    const innerQuote = document.querySelector('.innerQuote');
    if (opHeadTitle && innerOP) {
        innerOP.insertBefore(opHeadTitle, innerOP.firstChild);
    }
    document.addEventListener("keydown", (e) => {
        if (e.key === "Tab") {
            const qrbody = document.getElementById("qrbody");
            if (qrbody && document.activeElement !== qrbody) {
                e.preventDefault();
                qrbody.focus();
            }
        }
    });
    function enableIdFiltering() {
        const postCellSelector = ".postCell";
        const labelIdSelector = ".labelId";
        const hiddenClassName = "is-hidden-by-filter";
        let activeFilterColor = null;
        function applyFilter(targetRgbColor) {
            activeFilterColor = targetRgbColor;
            document.querySelectorAll(postCellSelector).forEach(cell => {
                const label = cell.querySelector(labelIdSelector);
                const matches = label && window.getComputedStyle(label).backgroundColor === targetRgbColor;
                cell.classList.toggle(hiddenClassName, !!targetRgbColor && !matches);
            });
        }
        function handleClick(event) {
            const clickedLabel = event.target.closest(labelIdSelector);
            if (clickedLabel && clickedLabel.closest(".postCell") && !clickedLabel.closest(".de-pview")) {
                const clickedColor = window.getComputedStyle(clickedLabel).backgroundColor;
                const rect = clickedLabel.getBoundingClientRect();
                const cursorOffsetY = event.clientY - rect.top;

                if (activeFilterColor === clickedColor) {
                    applyFilter(null);
                } else {
                    applyFilter(clickedColor);
                }
                clickedLabel.scrollIntoView({ behavior: "instant", block: "center" });
                window.scrollBy(0, cursorOffsetY - rect.height / 2);
            }
        }

        document.body.addEventListener("click", handleClick);
    }
    enableIdFiltering();
    function truncateFilenames(filenameLength) {
        document.querySelectorAll('a.originalNameLink').forEach(link => {
            const fullFilename = link.getAttribute('download');
            if (!fullFilename) return;

            const lastDot = fullFilename.lastIndexOf('.');
            if (lastDot === -1) return; 

            const name = fullFilename.slice(0, lastDot);
            const ext = fullFilename.slice(lastDot);
            let truncated = fullFilename;
            if (name.length > filenameLength) {
                truncated = name.slice(0, filenameLength) + '(...)' + ext;
            }
            link.textContent = truncated;
            link.addEventListener('mouseenter', function () {
                link.textContent = fullFilename;
            });
            link.addEventListener('mouseleave', function () {
                link.textContent = truncated;
            });
            link.title = fullFilename;
        });
    }
});