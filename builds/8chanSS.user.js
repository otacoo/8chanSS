// ==UserScript==
// @name         8chanSS
// @version      1.41.0
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
// @icon         data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAMAAABg3Am1AAAAZlBMVEUAAABdlloAhl758AH58AH58AcAhl758ADj4CYAh14AhV4AhV0Ahl748AcChl4Chl0Ab2H58AIAhl758AD58AAAhl757wL48AD47wL78QL47wcAh1748AF3oFfs5yEAh1/68QDz7BM5qSu8AAAAH3RSTlMA/lg/OYtM8g/onXtoXzAaCdzBsIFzczMeaCXXyrmp9ddA3QAAANpJREFUSMft0tkOgjAQheFjtVCQVVxwnfr+L+kWM5FOC73TxP/6fBedFJwpyx5CtSpqSHXWpns4qYxo1cDtkNp7GoOW9KgSwM4+09KeEhmw4H0IuGJDAbCw79a8nwJYFDQCuO1gT8oLWCiKAXavKA5cZ78I5n/wBx7wfb+1TwOggpD2gxxSpvWBrIbY3AcUPK1lkMNbJ4FV4wd964KsQqBF6oAEwcoh2GAk/QlyjNYx4AeHMicGxxoTOrRvIB5IPtULJJhY+QIFJrd9gCUi0tdZjqgu5yYOGAO5G/kyc3TkciPeAAAAAElFTkSuQmCC
// ==/UserScript==

function onReady(fn) {
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", fn, { once: true });
    } else {
        fn();
    }
}
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
    "use strict";
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
            hideNoCookieLink: { label: "Hide No Cookie? Link", default: false },
            hideJannyTools: { label: "Hide Janitor Forms", default: false }
        }
    };
    const flatSettings = {};
    function flattenSettings() {
        Object.keys(scriptSettings).forEach((category) => {
            Object.keys(scriptSettings[category]).forEach((key) => {
                if (key.startsWith('_')) return;
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
            hideNoCookieLink: "hide-nocookie",
            autoExpandTW: "auto-expand-tw",
            hideJannyTools: "hide-jannytools"
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
        const path = window.location.pathname.toLowerCase();
        const urlClassMap = [
            { pattern: /\/catalog\.html$/i, className: "is-catalog" },
            { pattern: /\/res\/[^/]+\.html$/i, className: "is-thread" },
            { pattern: /\/[^/]+\/$/i, className: "is-index" },
        ];

        urlClassMap.forEach(({ pattern, className }) => {
            if (pattern.test(path)) {
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
        css += ":not(.is-catalog) body{margin:0}#sideCatalogDiv{z-index:200;background:var(--background-gradient)}#navFadeEnd,#navFadeMid,.watchedNotification::before,:root.disable-banner #bannerImage,:root.hide-announcement #dynamicAnnouncement,:root.hide-checkboxes .deletionCheckBox,:root.hide-close-btn .inlineQuote>.innerPost>.postInfo.title>a:first-child,:root.hide-jannytools #actionsForm,:root.hide-jannytools #boardContentLinks,:root.hide-nocookie #captchaBody>table:nth-child(2)>tbody:first-child>tr:nth-child(2),:root.hide-panelmessage #panelMessage,:root.hide-posting-form #postingForm{display:none}:root.hide-defaultBL #navTopBoardsSpan{display:none!important}:root.is-catalog.show-catalog-form #postingForm{display:block!important}footer{visibility:hidden;height:0}nav.navHeader{z-index:300}:not(:root.bottom-header) .navHeader{box-shadow:0 1px 2px rgba(0,0,0,.15)}:root.bottom-header nav.navHeader{top:auto!important;bottom:0!important;box-shadow:0 -1px 2px rgba(0,0,0,.15)}:root.highlight-you .innerPost:has(> .postInfo.title > .youName){border-left:dashed #68b723 3px}:root.highlight-you .innerPost:has(>.divMessage>.you),:root.highlight-you .innerPost:has(>.divMessage>:not(div)>.you),:root.highlight-you .innerPost:has(>.divMessage>:not(div)>:not(div)>.you){border-left:solid var(--subject-color) 3px}:root.fit-replies :not(.hidden).innerPost{margin-left:10px;display:flow-root}:root.fit-replies :not(.hidden,.inlineQuote).innerPost{margin-left:0}:root.fit-replies .quoteTooltip{display:table!important}.originalNameLink{display:inline;overflow-wrap:anywhere;white-space:normal}.multipleUploads .uploadCell:not(.expandedCell){max-width:215px}.imgExpanded,video{max-height:90vh!important;object-fit:contain;width:auto!important}:not(:root.auto-expand-tw) #watchedMenu .floatingContainer{overflow-x:hidden;overflow-wrap:break-word}:root.auto-expand-tw #watchedMenu .floatingContainer{height:fit-content!important}.watchedCellLabel a::before{content:attr(data-board);color:#aaa;margin-right:4px;font-weight:700}.watchButton.watched-active::before{color:#dd003e!important}#multiboardMenu,#settingsMenu,#watchedMenu{font-size:smaller;padding:5px!important;box-shadow:-3px 3px 2px 0 rgba(0,0,0,.19)}#watchedMenu,#watchedMenu .floatingContainer{min-width:200px;max-width:100vw}.watchedNotification::before{padding-right:2px}#watchedMenu .floatingContainer{scrollbar-width:thin;scrollbar-color:var(--link-color) var(--contrast-color)}.scroll-arrow-btn{position:fixed;right:50px;width:36px;height:35px;background:#222;color:#fff;border:none;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,.18);font-size:22px;cursor:pointer;opacity:.7;z-index:800;display:flex;align-items:center;justify-content:center;transition:opacity .2s,background .2s}:root:not(.is-index,.is-catalog).ss-sidebar .scroll-arrow-btn{right:330px!important}.scroll-arrow-btn:hover{opacity:1;background:#444}#scroll-arrow-up{bottom:80px}#scroll-arrow-down{bottom:32px}.innerUtility.top{margin-top:2em;background-color:transparent!important;color:var(--link-color)!important}.innerUtility.top a{color:var(--link-color)!important}.bumpLockIndicator::after{padding-right:3px}.floatingMenu.focused{z-index:305!important}.ss-chevron{transition:transform .2s;margin-left:6px;font-size:12px;display:inline-block}a.imgLink[data-filemime^='audio/'],a.originalNameLink[href$='.m4a'],a.originalNameLink[href$='.mp3'],a.originalNameLink[href$='.ogg'],a.originalNameLink[href$='.wav']{position:relative}.audio-preview-indicator{display:none;position:absolute;background:rgba(0,0,0,.7);color:#fff;padding:5px;font-size:12px;border-radius:3px;z-index:1000;left:0;top:0;white-space:nowrap;pointer-events:none}a.originalNameLink:hover .audio-preview-indicator,a[data-filemime^='audio/']:hover .audio-preview-indicator{display:block}.yt-icon{width:16px;height:13px;vertical-align:middle;margin-right:2px}";
    }
    if (/\/res\/[^/]+\.html$/.test(currentPath)) {
        css += ":root.sticky-qr #quick-reply{display:block;top:auto!important;bottom:0}:root.sticky-qr.ss-sidebar #quick-reply{left:auto!important;right:0!important}:root.sticky-qr.ss-leftsidebar #quick-reply{left:0!important;right:auto!important}:root.sticky-qr #qrbody{resize:vertical;max-height:50vh;height:130px}#selectedDivQr,:root.sticky-qr #selectedDiv{display:inline-flex;overflow:scroll hidden;max-width:300px}#qrbody{min-width:300px}:root.bottom-header #quick-reply{bottom:28px!important}:root.fade-qr #quick-reply{padding:0;opacity:.7;transition:opacity .3s ease}:root.fade-qr #quick-reply:focus-within,:root.fade-qr #quick-reply:hover{opacity:1}.floatingMenu{padding:0!important}#qrFilesBody{max-width:310px}#quick-reply{box-shadow:-3px 3px 2px 0 rgba(0,0,0,.19)}#unread-line{height:2px;border:none!important;pointer-events:none!important;background-image:linear-gradient(to left,rgba(185,185,185,.2),var(--text-color),rgba(185,185,185,.2));margin:-3px auto 0 auto;width:60%}:root.ss-sidebar #bannerImage{width:19rem;right:0;position:fixed;top:26px}:root.ss-sidebar.bottom-header #bannerImage{top:0!important}:root.ss-leftsidebar #bannerImage{width:19rem;left:0;position:fixed;top:26px}:root.ss-leftsidebar.bottom-header #bannerImage{top:0!important}.quoteTooltip{z-index:999}.nestedQuoteLink{text-decoration:underline dashed!important}:root.hide-stub .unhideButton{display:none}.quoteTooltip .innerPost{overflow:hidden}.inlineQuote .innerPost,.quoteTooltip .innerPost{box-shadow:-1px 1px 2px 0 rgba(0,0,0,.19)}.inlineQuote{margin:2px 0}.postCell.is-hidden-by-filter{display:none}.reply-inlined{opacity:.5;text-decoration:underline dashed!important;text-underline-offset:2px}.quote-inlined{opacity:.5;text-decoration:underline dashed!important;text-underline-offset:2px}.target-highlight{background:var(--marked-color);border-color:var(--marked-border-color);color:var(--marked-text-color)}.postCell::before{display:inline!important;height:auto!important}";
    }
    if (/\/catalog\.html$/.test(currentPath)) {
        css += "#postingForm{margin:2em auto}#divTools>div:nth-child(5){float:left!important;margin-top:9px!important;margin-right:8px}";
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
        const STORAGE_KEY = "8chanSS_scrollPositions";
        const UNREAD_LINE_ID = "unread-line";
        const MAX_THREADS = 150;
        const threadPagePattern = /^\/[^/]+\/res\/[^/]+\.html$/i;
        if (!threadPagePattern.test(window.location.pathname)) return;
        function getBoardAndThread() {
            const match = window.location.pathname.match(/^\/([^/]+)\/res\/([^/.]+)\.html$/i);
            if (!match) return null;
            return { board: match[1], thread: match[2] };
        }
        async function getAllSavedScrollData() {
            const saved = await GM.getValue(STORAGE_KEY, null);
            if (!saved) return {};
            try { return JSON.parse(saved); } catch { return {}; }
        }
        async function setAllSavedScrollData(data) {
            await GM.setValue(STORAGE_KEY, JSON.stringify(data));
        }
        function getCurrentPostCount() {
            const divPosts = document.querySelector(".divPosts");
            if (!divPosts) return 0;
            return divPosts.querySelectorAll(":scope > .postCell[id]").length;
        }
        let lastSeenPostCount = 0;
        let unseenCount = 0;
        let tabTitleBase = null;

        function updateTabTitle() {
            if (window.isNotifying) return;
            if (!tabTitleBase) tabTitleBase = document.title.replace(/^\(\d+\)\s*/, "");
            document.title = unseenCount > 0 ? `(${unseenCount}) ${tabTitleBase}` : tabTitleBase;
        }

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
        let lastScrollY = window.scrollY;
        async function onScrollUpdateSeen() {
            const info = getBoardAndThread();
            if (!info || !(await getSetting("enableScrollSave"))) return;

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
        async function restoreScrollPosition() {
            const info = getBoardAndThread();
            if (!info || !(await getSetting("enableScrollSave"))) return;

            const allData = await getAllSavedScrollData();
            const key = `${info.board}/${info.thread}`;
            const saved = allData[key];
            if (!saved || typeof saved.position !== "number") return;

            const anchor = window.location.hash ? window.location.hash.replace(/^#/, "") : null;
            if (anchor) {
                setTimeout(() => {
                    const post = document.getElementById(anchor);
                    if (post && post.classList.contains("postCell")) {
                        post.scrollIntoView({ behavior: "auto", block: "start" });
                    }
                    addUnreadLineAtSavedScrollPosition(saved.position, false);
                }, 100);
                return;
            }
            saved.timestamp = Date.now();
            await setAllSavedScrollData(allData);

            setTimeout(() => addUnreadLineAtSavedScrollPosition(saved.position, true), 100);
        }
        async function addUnreadLineAtSavedScrollPosition(scrollPosition, centerAfter = false) {
            if (!(await getSetting("enableScrollSave_showUnreadLine"))) return;

            const divPosts = document.querySelector(".divPosts");
            if (!divPosts) return;
            const posts = Array.from(divPosts.querySelectorAll(":scope > .postCell[id]"));
            let targetPost = null;
            for (let i = 0; i < posts.length; ++i) {
                const postTop = posts[i].offsetTop;
                if (postTop > scrollPosition) break;
                targetPost = posts[i];
            }
            if (!targetPost) return;
            const oldMarker = document.getElementById(UNREAD_LINE_ID);
            if (oldMarker && oldMarker.parentNode) {
                oldMarker.parentNode.removeChild(oldMarker);
            }
            const marker = document.createElement("hr");
            marker.id = UNREAD_LINE_ID;
            if (targetPost.nextSibling) {
                divPosts.insertBefore(marker, targetPost.nextSibling);
            } else {
                divPosts.appendChild(marker);
            }
            if (centerAfter) {
                setTimeout(() => {
                    const markerElem = document.getElementById(UNREAD_LINE_ID);
                    if (markerElem) {
                        const rect = markerElem.getBoundingClientRect();
                        const desiredY = window.innerHeight / 3;
                        const scrollY = window.scrollY + rect.top - desiredY;
                        window.scrollTo({ top: scrollY, behavior: "auto" });
                    }
                }, 0);
            }
        }
        function observePostCount() {
            const divPosts = document.querySelector(".divPosts");
            if (!divPosts) return;
            const observer = new MutationObserver(() => {
                updateUnseenCountFromSaved();
            });
            observer.observe(divPosts, { childList: true, subtree: false });
        }

        async function removeUnreadLineIfAtBottom() {
            if (!(await getSetting("enableScrollSave_showUnreadLine"))) return;
            const margin = 20; 
            if ((window.innerHeight + window.scrollY) >= (document.body.offsetHeight - margin)) {
                const oldMarker = document.getElementById(UNREAD_LINE_ID);
                if (oldMarker && oldMarker.parentNode) {
                    oldMarker.parentNode.removeChild(oldMarker);
                }
            }
        }
        window.addEventListener("beforeunload", () => {
            saveScrollPosition();
        });

        document.addEventListener("DOMContentLoaded", () => {
            tabTitleBase = document.title.replace(/^\(\d+\)\s*/, "");
            updateTabTitle();
        });

        window.addEventListener("load", async () => {
            await restoreScrollPosition();
            await updateUnseenCountFromSaved();
            observePostCount();
        });

        window.addEventListener("scroll", async () => {
            await onScrollUpdateSeen();
            await removeUnreadLineIfAtBottom();
        });
        await restoreScrollPosition();
        await updateUnseenCountFromSaved();
        observePostCount();
    }
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
        const observer = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === 1 && node.classList.contains('catalogCell')) {
                        setLinksTargetBlank(node);
                    } else if (node.nodeType === 1) {
                        node.querySelectorAll && node.querySelectorAll('.catalogCell').forEach(setLinksTargetBlank);
                    }
                });
            });
        });
        observer.observe(catalogDiv, { childList: true, subtree: true });
    }
    function featureImageHover() {
        const MEDIA_MAX_WIDTH = "90vw";
        const MEDIA_OPACITY_LOADING = "0";
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
            }

            if (!fullSrc || !filemime) return;
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
                const indicator = document.createElement("div");
                indicator.classList.add("audio-preview-indicator");
                indicator.textContent = AUDIO_INDICATOR_TEXT;
                if (container) {
                    container.appendChild(indicator);
                }
                currentAudioIndicator = indicator;
                const cleanup = () => cleanupFloatingMedia();
                thumb.addEventListener("mouseleave", cleanup, { once: true });
                if (container) container.addEventListener("click", cleanup, { once: true });
                window.addEventListener("scroll", cleanup, { once: true });
                cleanupFns.push(() => thumb.removeEventListener("mouseleave", cleanup));
                if (container) cleanupFns.push(() => container.removeEventListener("click", cleanup));
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
                floatingMedia.volume = volume;
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
        attachThumbListeners();
        const divThreads = document.getElementById("divThreads");
        if (divThreads) {
            const observer = new MutationObserver((mutations) => {
                mutations.forEach(mutation => {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === 1) {
                            attachThumbListeners(node);
                        }
                    });
                });
            });
            observer.observe(divThreads, { childList: true, subtree: true });
        }
    }
    function featureBlurSpoilers() {
        function revealSpoilers() {
            const spoilerLinks = document.querySelectorAll("a.imgLink");
            spoilerLinks.forEach(async (link) => {
                const img = link.querySelector("img");
                if (!img) return;
                const isCustomSpoiler = img.src.includes("/custom.spoiler") || img.src.includes("/spoiler.png");
                const isNotThumbnail = !img.src.includes("/.media/t_");
                const hasFilenameExtension = !isCustomSpoiler && /\.[a-zA-Z0-9]+$/.test(img.src);

                if (isNotThumbnail || isCustomSpoiler) {
                    let href = link.getAttribute("href");
                    if (!href) return;
                    const match = href.match(/\/\.media\/([^\/]+)\.[a-zA-Z0-9]+$/);
                    if (!match) return;

                    if (!hasFilenameExtension) {
                        const transformedSrc = `/.media/t_${match[1]}`;
                        img.src = transformedSrc;
                    } else return;
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
                if (!postCell) return;
                setTimeout(() => {
                    let menu = e.target.parentNode.querySelector('.floatingList.extraMenu');
                    if (!menu) {
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
            const postCell = document.getElementById(postId);
            if (!postCell) return;
            const nameLink = postCell.querySelector(".linkName.noEmailName");
            if (nameLink) {
                nameLink.classList.toggle("youName", add);
            }
        }
        function addMenuEntries(root = document) {
            root.querySelectorAll(MENU_SELECTOR).forEach(menu => {
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
    featureMarkYourPost();
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
    async function featureBeepOnYou() {
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
        await initSettings();
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
    function enhanceYouTubeLinks() {
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
        function fetchYouTubeTitle(videoId) {
            return fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`)
                .then(r => r.ok ? r.json() : null)
                .then(data => data ? data.title : null)
                .catch(() => null);
        }
        function processLinks(root = document) {
            root.querySelectorAll('a[href*="youtu"]').forEach(link => {
                if (link.dataset.ytEnhanced) return;
                const videoId = getYouTubeId(link.href);
                if (!videoId) return;
                link.dataset.ytEnhanced = "1";
                fetchYouTubeTitle(videoId).then(title => {
                    if (title) {
                        link.innerHTML = `<img class="yt-icon" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAMCAYAAABr5z2BAAABIklEQVQoz53LvUrDUBjG8bOoOammSf1IoBSvoCB4JeIqOHgBLt6AIMRBBQelWurQ2kERnMRBsBUcIp5FJSBI5oQsJVkkUHh8W0o5nhaFHvjBgef/Mq+Q46RJBMkI/vE+aOus956tnEswIZe1LV0QyJ5sE2GzgZfVMtRNIdiDpccEssdlB1mW4bvTwdvWJtRdErM7U+8S/FJykCRJX5qm+KpVce8UMNLRLbulz4iSjTAMh6Iowsd5BeNadp3nUF0VlxAEwZBotXC0Usa4ll3meZdA1iguwvf9vpvDA2wvmKgYGtSud8suDB4TyGr2PF49D/vra9jRZ1BVdknMzgwuCGSnZEObwu6sBnVTCHZiaC7BhFx2PKdxUidiAH/4lLo9Mv0DELVs9qsOHXwAAAAASUVORK5CYII="><span>[Youtube]</span> ${title}`;
                    }
                });
            });
        }
        processLinks(document);
        const threads = document.querySelector('#divThreads') || document.body;
        new MutationObserver(() => processLinks(threads)).observe(threads, { childList: true, subtree: true });
    }
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
        updateFileLabels(finalName, index);
    }
    function updateFileLabels(finalName, index) {
        const selectors = [
            '#qrFilesBody .selectedCell .nameLabel',
            '#postingFormContents .selectedCell .nameLabel'
        ];
        selectors.forEach(sel => {
            const labels = document.querySelectorAll(sel);
            const label = labels[index];
            if (label) {
                label.textContent = finalName;
                label.title = finalName;
            }
        });
    }
    function handleNameLabelClick(event) {
        const label = event.target.closest('.nameLabel');
        if (!label) return;
        const container = label.closest('#qrFilesBody, #postingFormContents');
        if (!container) return;
        const labels = Array.from(container.querySelectorAll('.selectedCell .nameLabel'));
        const index = labels.indexOf(label);
        if (index !== -1) {
            renameFileAtIndex(index);
        }
    }
    function observeNameLabelClicks(containerSelector) {
        const container = document.querySelector(containerSelector);
        if (!container) return;

        if (!container.dataset.renameDelegationAttached) {
            container.addEventListener('click', handleNameLabelClick);
            container.dataset.renameDelegationAttached = 'true';
        }
    }
    function startNameLabelObservers() {
        observeNameLabelClicks('#qrFilesBody');
        observeNameLabelClicks('#postingFormContents');
    }
    startNameLabelObservers();
    async function createSettingsMenu() {
        let menu = document.getElementById("8chanSS-menu");
        if (menu) return menu;
        menu = document.createElement("div");
        menu.id = "8chanSS-menu";
        menu.style.position = "fixed";
        menu.style.top = "3rem"; 
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
        menu.style.maxWidth = "470px";
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
        info.innerHTML = 'Press Save to apply changes. Page will reload. - <a href="https://github.com/otacoo/8chanSS/blob/main/CHANGELOG.md" target="_blank" title="Check the changelog." style="color: #fff; text-decoration: underline dashed;">Ver. 1.41.0</a>';
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
            { keys: ["R"], action: "Refresh Thread (5 sec. cooldown)" },
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
    async function shortcutsGloballyEnabled() {
        return await getSetting("enableShortcuts");
    }
    const bbCodeCombinations = new Map([
        ["s", ["[spoiler]", "[/spoiler]"]],
        ["b", ["'''", "'''"]],
        ["u", ["__", "__"]],
        ["i", ["''", "''"]],
        ["d", ["==", "=="]],
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
    let lastRefreshTime = 0; 

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
        const expectedType = isOwnReply ? "own" : "reply";
        if (
            lastType === expectedType &&
            lastHighlighted
        ) {
            const container = lastHighlighted.closest('.postCell, .opCell');
            currentIndex = postCells.indexOf(container);
        }
        if (currentIndex === -1) {
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
            if (anchorId && location.hash !== '#' + anchorId) {
                history.replaceState(null, '', '#' + anchorId);
            }
            const innerPost = postContainer.querySelector('.innerPost');
            if (innerPost) {
                innerPost.classList.add('target-highlight');
                lastHighlighted = innerPost;
            } else {
                lastHighlighted = null;
            }
            lastType = isOwnReply ? "own" : "reply";
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
    document.addEventListener("keydown", async function (event) {
        if (!(await shortcutsGloballyEnabled())) return;
        const active = document.activeElement;
        if (
            active &&
            event.key !== "Tab" && 
            (active.tagName === "INPUT" ||
                active.tagName === "TEXTAREA" ||
                active.isContentEditable)
        ) {
            return;
        }
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
        if (event.key === "Tab") {
            const qrbody = document.getElementById("qrbody");
            const captcha = document.getElementById("QRfieldCaptcha");

            if (qrbody) {
                if (document.activeElement === qrbody && captcha) {
                    event.preventDefault();
                    captcha.focus();
                } else if (document.activeElement === captcha) {
                    event.preventDefault();
                    qrbody.focus();
                } else if (document.activeElement !== qrbody) {
                    event.preventDefault();
                    qrbody.focus();
                }
            }
            return;
        }
        if (event.key === "r" || event.key === "R") {
            const isThread = document.documentElement.classList.contains("is-thread");
            const isCatalog = document.documentElement.classList.contains("is-catalog");
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
        if (event.key === "Escape") {
            const textarea = document.getElementById("qrbody");
            if (textarea) textarea.value = "";
            const quickReply = document.getElementById("quick-reply");
            if (quickReply) quickReply.style.display = "none";
            const threadWatcher = document.getElementById("watchedMenu");
            if (threadWatcher) threadWatcher.style.display = "none";
            return;
        }
        if (event.ctrlKey && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
            event.preventDefault();
            const isOwnReply = !event.shiftKey;
            const isNext = event.key === 'ArrowDown';
            scrollToReply(isOwnReply, isNext);
            return;
        }
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
    const innerOP = document.querySelector('.innerOP');
    if (opHeadTitle && innerOP) {
        innerOP.insertBefore(opHeadTitle, innerOP.firstChild);
    }
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
    function truncateFilenames(filenameLength) {
        function processLinks(root = document) {
            root.querySelectorAll('a.originalNameLink').forEach(link => {
                if (link.dataset.truncated === "1") return;
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
                link.dataset.truncated = "1";
                link.addEventListener('mouseenter', function () {
                    link.textContent = fullFilename;
                });
                link.addEventListener('mouseleave', function () {
                    link.textContent = truncated;
                });
                link.title = fullFilename;
            });
        }
        processLinks(document);
        const divThreads = document.querySelector('#divThreads');
        if (divThreads) {
            new MutationObserver(() => {
                processLinks(divThreads);
            }).observe(divThreads, { childList: true, subtree: true });
        }
    }
});