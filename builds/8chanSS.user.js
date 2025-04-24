// ==UserScript==
// @name         8chanSS
// @version      1.29.0
// @namespace    8chanSS
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
    swapTheme();
    document.addEventListener("DOMContentLoaded", swapTheme);
    document.addEventListener("DOMContentLoaded", function () {
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
    try {
        localStorage.removeItem("hoveringImage");
    } catch (e) {
    }
})();
function onReady(fn) {
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", fn, { once: true });
    } else {
        fn();
    }
}
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
                    },
                },
            },
            enableBottomHeader: { label: "Bottom Header", default: false },
            enableScrollSave: {
                label: "Save Scroll Position",
                default: true,
                subOptions: {
                    showUnreadLine: {
                        label: "Show Unread Line",
                        default: true,
                    },
                },
            },
            enableScrollArrows: { label: "Show Up/Down Arrows", default: false, },
            hoverVideoVolume: { label: "Hover Media Volume (0-100%)", default: 50, type: "number", min: 0, max: 100, },
        },
        threads: {
            enableThreadImageHover: { label: "Thread Image Hover", default: true, },
            watchThreadOnReply: { label: "Watch Thread on Reply", default: true, },
            beepOnYou: { label: "Beep on (You)", default: false },
            notifyOnYou: { label: "Notify when (You) (!)", default: true },
            highlightOnYou: { label: "Highlight (You) posts", default: true },
            hideHiddenPostStub: { label: "Hide Stubs of Hidden Posts", default: false, },
            blurSpoilers: {
                label: "Blur Spoilers",
                default: false,
                subOptions: {
                    removeSpoilers: {
                        label: "Remove Spoilers",
                        default: false,
                    },
                },
            },
            deleteSavedName: { label: "Delete Name Checkbox", default: true },
        },
        catalog: {
            enableCatalogImageHover: { label: "Catalog Image Hover", default: true, },
        },
        styling: {
            enableStickyQR: { label: "Enable Sticky Quick Reply", default: false, },
            enableFitReplies: { label: "Fit Replies", default: false },
            enableSidebar: { label: "Enable Sidebar", default: false },
            hideAnnouncement: { label: "Hide Announcement", default: false },
            hidePanelMessage: { label: "Hide Panel Message", default: false },
            hidePostingForm: {
                label: "Hide Posting Form",
                default: false,
                subOptions: {
                    showCatalogForm: {
                        label: "Don't Hide in Catalog",
                        default: false,
                    },
                },
            },
            hideBanner: { label: "Hide Board Banners", default: false },
        },
    };
    const flatSettings = {};
    function flattenSettings() {
        Object.keys(scriptSettings).forEach((category) => {
            Object.keys(scriptSettings[category]).forEach((key) => {
                flatSettings[key] = scriptSettings[category][key];
                if (scriptSettings[category][key].subOptions) {
                    Object.keys(scriptSettings[category][key].subOptions).forEach(
                        (subKey) => {
                            const fullKey = `${key}_${subKey}`;
                            flatSettings[fullKey] =
                                scriptSettings[category][key].subOptions[subKey];
                        }
                    );
                }
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
        return val === "true";
    }

    async function setSetting(key, value) {
        await GM.setValue("8chanSS_" + key, String(value));
    }
    async function featureCssClassToggles() {
        document.documentElement.classList.add("8chanSS");
        const classToggles = {
            enableFitReplies: "fit-replies",
            enableSidebar: "ss-sidebar",
            enableStickyQR: "sticky-qr",
            enableBottomHeader: "bottom-header",
            hideHiddenPostStub: "hide-stub",
            hideBanner: "disable-banner",
            hidePostingForm: "hide-posting-form",
            hidePostingForm_showCatalogForm: "show-catalog-form",
            hideAnnouncement: "hide-announcement",
            hidePanelMessage: "hide-panelmessage",
            highlightOnYou: "highlight-you",
        };
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
            { pattern: /^\/$/, className: "is-index" },
        ];
        const currentPath = window.location.pathname.toLowerCase();
        urlClassMap.forEach(({ pattern, className }) => {
            if (pattern.test(currentPath)) {
                document.documentElement.classList.add(className);
            } else {
                document.documentElement.classList.remove(className);
            }
        });
    }
    featureCssClassToggles();
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
            { keys: ["Ctrl", "Q"], action: "Toggle Quick Reply" },
            { keys: ["Ctrl", "Enter"], action: "Submit post" },
            { keys: ["Ctrl", "W"], action: "Watch Thread" },
            { keys: ["Escape"], action: "Clear textarea and hide Quick Reply" },
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
    function addCustomCSS(css) {
        if (!css) return;
        const style = document.createElement("style");
        style.type = "text/css";
        style.id = "8chSS";
        style.appendChild(document.createTextNode(css));
        document.head.appendChild(style);
    }
    const currentPath = window.location.pathname.toLowerCase();
    const currentHost = window.location.hostname.toLowerCase();
    if (/^8chan\.(se|moe)$/.test(currentHost)) {
        const css = ":not(.is-catalog) body{margin:0}:root.ss-sidebar #mainPanel{margin-right:305px}#sideCatalogDiv{z-index:200;background:var(--background-gradient)}#navFadeEnd,#navFadeMid,#navTopBoardsSpan,:root.hide-announcement #dynamicAnnouncement,:root.hide-panelmessage #panelMessage,:root.hide-posting-form #postingForm{display:none}:root.is-catalog.show-catalog-form #postingForm{display:block!important}footer{visibility:hidden;height:0}nav.navHeader{z-index:300}:not(:root.bottom-header) .navHeader{box-shadow:0 1px 2px rgba(0,0,0,.15)}:root.bottom-header nav.navHeader{top:auto!important;bottom:0!important;box-shadow:0 -1px 2px rgba(0,0,0,.15)}.watchButton.watched-active::before{color:#dd003e!important}#watchedMenu{font-size:smaller;padding:5px!important;box-shadow:-3px 3px 2px 0 rgba(0,0,0,.19)}#watchedMenu,#watchedMenu .floatingContainer{min-width:200px}.watchedNotification::before{padding-right:2px}.scroll-arrow-btn{position:fixed;right:50px;width:36px;height:35px;background:#222;color:#fff;border:none;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,.18);font-size:22px;cursor:pointer;opacity:.7;z-index:800;display:flex;align-items:center;justify-content:center;transition:opacity .2s,background .2s}:root.ss-sidebar .scroll-arrow-btn{right:330px!important}.scroll-arrow-btn:hover{opacity:1;background:#444}#scroll-arrow-up{bottom:80px}#scroll-arrow-down{bottom:32px}.innerUtility.top{margin-top:2em;background-color:transparent!important;color:var(--link-color)!important}.innerUtility.top a{color:var(--link-color)!important}.bumpLockIndicator::after{padding-right:3px}";
        addCustomCSS(css);
    }
    if (/\/res\/[^/]+\.html$/.test(currentPath)) {
        const css = ":root.sticky-qr #quick-reply{display:block;top:auto!important;bottom:0;left:auto!important;position:fixed;right:0!important}:root.sticky-qr #qrbody{resize:vertical;max-height:50vh;height:130px}#qrbody{min-width:300px}:root.bottom-header #quick-reply{bottom:28px!important}#quick-reply{padding:0;opacity:.7;transition:opacity .3s ease}#quick-reply:focus-within,#quick-reply:hover{opacity:1}.floatingMenu{padding:0!important}#qrFilesBody{max-width:300px}#unread-line{height:2px;border:none!important;pointer-events:none!important;background-image:linear-gradient(to left,rgba(185,185,185,.2),var(--text-color),rgba(185,185,185,.2));margin:-3px auto 0 auto;width:60%}:root.disable-banner #bannerImage{display:none}:root.ss-sidebar #bannerImage{width:305px;right:0;position:fixed;top:26px}:root.ss-sidebar.bottom-header #bannerImage{top:0!important}.quoteTooltip{z-index:999}.inlineQuote .replyPreview{margin-left:20px;border-left:1px solid #ccc;padding-left:10px}.nestedQuoteLink{text-decoration:underline dashed!important}:root.hide-stub .unhideButton{display:none}.quoteTooltip .innerPost{overflow:hidden;box-shadow:-3px 3px 2px 0 rgba(0,0,0,.19)}:root.fit-replies :not(.hidden).innerPost{margin-left:10px;display:flow-root}:root.fit-replies .quoteTooltip{display:table!important}:root.highlight-you .innerPost:has(.youName){border-left:dashed #68b723 3px}:root.highlight-you .innerPost:not(:has(.youName)):has(.quoteLink.you){border-left:solid #dd003e 3px}.originalNameLink{display:inline;overflow-wrap:anywhere;white-space:normal}.multipleUploads .uploadCell:not(.expandedCell){max-width:215px}.imgExpanded,video{max-height:90vh!important;object-fit:contain;width:auto!important}.postCell::before{display:inline!important;height:auto!important}";
        addCustomCSS(css);
    }
    if (/\/catalog\.html$/.test(currentPath)) {
        const css = "#dynamicAnnouncement{display:none}#postingForm{margin:2em auto}";
        addCustomCSS(css);
    }
    async function createSettingsMenu() {
        let menu = document.getElementById("8chanSS-menu");
        if (menu) return menu;
        menu = document.createElement("div");
        menu.id = "8chanSS-menu";
        menu.style.position = "fixed";
        menu.style.top = "80px";
        menu.style.left = "30px";
        menu.style.zIndex = 99999;
        menu.style.background = "#222";
        menu.style.color = "#fff";
        menu.style.padding = "0";
        menu.style.borderRadius = "8px";
        menu.style.boxShadow = "0 4px 16px rgba(0,0,0,0.25)";
        menu.style.display = "none";
        menu.style.minWidth = "220px";
        menu.style.width = "100%";
        menu.style.maxWidth = "365px";
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
        tabContent.style.padding = "15px 18px";
        tabContent.style.maxHeight = "60vh";
        tabContent.style.overflowY = "auto";
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
        info.textContent = "Press Save to apply changes. Page will reload. - Ver. 1.29.0";
        menu.appendChild(info);

        document.body.appendChild(menu);
        return menu;
    }
    function createTabContent(category, tempSettings) {
        const container = document.createElement("div");
        const categorySettings = scriptSettings[category];

        Object.keys(categorySettings).forEach((key) => {
            const setting = categorySettings[key];
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
                slider.value = Number(tempSettings[key]);
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
                    slider.value = val;
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
            if (setting.subOptions) {
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
                if (setting.subOptions && subOptionsContainer) {
                    subOptionsContainer.style.display = checkbox.checked
                        ? "block"
                        : "none";
                    if (chevron) {
                        chevron.style.transform = checkbox.checked
                            ? "rotate(90deg)"
                            : "rotate(0deg)";
                    }
                }
            });

            parentRow.appendChild(checkbox);
            parentRow.appendChild(label);
            if (chevron) parentRow.appendChild(chevron);
            const wrapper = document.createElement("div");
            wrapper.style.marginBottom = "10px";

            wrapper.appendChild(parentRow);
            if (setting.subOptions) {
                subOptionsContainer = document.createElement("div");
                subOptionsContainer.style.marginLeft = "25px";
                subOptionsContainer.style.marginTop = "5px";
                subOptionsContainer.style.display = checkbox.checked ? "block" : "none";

                Object.keys(setting.subOptions).forEach((subKey) => {
                    const subSetting = setting.subOptions[subKey];
                    const fullKey = `${key}_${subKey}`;

                    const subWrapper = document.createElement("div");
                    subWrapper.style.marginBottom = "5px";

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
                    subOptionsContainer.appendChild(subWrapper);
                });

                wrapper.appendChild(subOptionsContainer);
            }

            container.appendChild(wrapper);
        });
        if (!document.getElementById("ss-chevron-style")) {
            const style = document.createElement("style");
            style.id = "ss-chevron-style";
            style.textContent = `
                      .ss-chevron {
                          transition: transform 0.2s;
                          margin-left: 6px;
                          font-size: 12px;
                          display: inline-block;
                      }
                  `;
            document.head.appendChild(style);
        }

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
    async function featureImageHover() {
        function getFullMediaSrcFromMime(thumbNode, filemime) {
            if (!thumbNode || !filemime) return null;
            const thumbnailSrc = thumbNode.getAttribute("src");
            if (/\/t_/.test(thumbnailSrc)) {
                let base = thumbnailSrc.replace(/\/t_/, "/");
                base = base.replace(/\.(jpe?g|png|gif|webp|webm|mp4|webm|ogg|mp3|m4a|wav)$/i, "");
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
                    "audio/wav": ".wav",
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
        if (!document.getElementById("audio-preview-indicator-style")) {
            const style = document.createElement("style");
            style.id = "audio-preview-indicator-style";
            style.textContent = `
                a.imgLink[data-filemime^="audio/"], 
                a.originalNameLink[href$=".mp3"],
                a.originalNameLink[href$=".ogg"],
                a.originalNameLink[href$=".m4a"],
                a.originalNameLink[href$=".wav"] {
                    position: relative;
                }
                
                .audio-preview-indicator {
                    display: none;
                    position: absolute;
                    background: rgba(0, 0, 0, 0.7);
                    color: #ffffff;
                    padding: 5px;
                    font-size: 12px;
                    border-radius: 3px;
                    z-index: 1000;
                    left: 0;
                    top: 0;
                    white-space: nowrap;
                    pointer-events: none;
                }
                
                a[data-filemime^="audio/"]:hover .audio-preview-indicator,
                a.originalNameLink:hover .audio-preview-indicator {
                    display: block;
                }
            `;
            document.head.appendChild(style);
        }

        let floatingMedia = null;
        let removeListeners = null;
        let hoverTimeout = null;
        let lastThumb = null;
        let isStillHovering = false;

        function cleanupFloatingMedia() {
            if (hoverTimeout) {
                clearTimeout(hoverTimeout);
                hoverTimeout = null;
            }

            if (removeListeners) {
                removeListeners();
                removeListeners = null;
            }

            if (floatingMedia) {
                if (
                    floatingMedia.tagName === "VIDEO" ||
                    floatingMedia.tagName === "AUDIO"
                ) {
                    try {
                        floatingMedia.pause();
                        floatingMedia.removeAttribute("src");
                        floatingMedia.load();
                    } catch (e) {
                    }
                }

                if (floatingMedia.parentNode) {
                    floatingMedia.parentNode.removeChild(floatingMedia);
                }
            }
            const indicators = document.querySelectorAll(".audio-preview-indicator");
            indicators.forEach((indicator) => {
                if (indicator.parentNode) {
                    indicator.parentNode.removeChild(indicator);
                }
            });

            floatingMedia = null;
            lastThumb = null;
            isStillHovering = false;
            document.removeEventListener("mousemove", onMouseMove);
        }

        function onMouseMove(event) {
            if (!floatingMedia) return;
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;
            let mediaWidth = floatingMedia.offsetWidth || 0;
            let mediaHeight = floatingMedia.offsetHeight || 0;
            let newX = event.clientX + 10;
            let newY = event.clientY + 10;
            if (newX + mediaWidth > viewportWidth) {
                newX = viewportWidth - mediaWidth - 10;
            }
            if (newY + mediaHeight > viewportHeight) {
                newY = viewportHeight - mediaHeight - 10;
            }
            newX = Math.max(newX, 0);
            newY = Math.max(newY, 0);
            floatingMedia.style.left = `${newX}px`;
            floatingMedia.style.top = `${newY}px`;
            floatingMedia.style.maxWidth = "90vw";
            floatingMedia.style.maxHeight = "90vh";
        }

        async function onThumbEnter(e) {
            const thumb = e.currentTarget;
            if (lastThumb === thumb) return;
            lastThumb = thumb;

            cleanupFloatingMedia();
            isStillHovering = true;
            const container =
                thumb.tagName === "IMG"
                    ? thumb.closest("a.linkThumb, a.imgLink")
                    : thumb;

            function onLeave() {
                isStillHovering = false;
                cleanupFloatingMedia();
            }

            thumb.addEventListener("mouseleave", onLeave, { once: true });

            hoverTimeout = setTimeout(async () => {
                hoverTimeout = null;
                if (!isStillHovering) return;

                let filemime = null;
                let fullSrc = null;
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

                    fullSrc = getFullMediaSrcFromMime(thumb, filemime);
                }
                else if (thumb.classList.contains("originalNameLink")) {
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
                    }
                }

                if (!fullSrc || !filemime) return;

                let loaded = false;
                function setCommonStyles(el) {
                    el.style.position = "fixed";
                    el.style.zIndex = 9999;
                    el.style.pointerEvents = "none";
                    el.style.maxWidth = "95vw";
                    el.style.maxHeight = "95vh";
                    el.style.transition = "opacity 0.15s";
                    el.style.opacity = "0.4"; 
                    el.style.left = "-9999px";
                }

                function showFloatingMediaImmediately(floatingMedia, e) {
                    document.body.appendChild(floatingMedia);
                    document.addEventListener("mousemove", onMouseMove);
                    onMouseMove(e);
                }
                removeListeners = function () {
                    window.removeEventListener("scroll", cleanupFloatingMedia, true);
                };
                window.addEventListener("scroll", cleanupFloatingMedia, true);

                if (filemime.startsWith("image/")) {
                    floatingMedia = document.createElement("img");
                    setCommonStyles(floatingMedia);
                    floatingMedia.src = fullSrc;
                    showFloatingMediaImmediately(floatingMedia, e);
                    floatingMedia.onload = function () {
                        floatingMedia.style.opacity = "1";
                    };

                    floatingMedia.onerror = cleanupFloatingMedia;
                    floatingMedia.src = fullSrc;
                } else if (filemime.startsWith("video/")) {
                    floatingMedia = document.createElement("video");
                    setCommonStyles(floatingMedia);
                    floatingMedia.autoplay = true;
                    floatingMedia.loop = true;
                    floatingMedia.muted = false;
                    floatingMedia.playsInline = true;
                    floatingMedia.controls = false;
                    floatingMedia.src = fullSrc;
                    showFloatingMediaImmediately(floatingMedia, e);
                    floatingMedia.onloadeddata = function () {
                        floatingMedia.style.opacity = "1";
                    };
                    let volume = 50;
                    try {
                        if (typeof getSetting === "function") {
                            const v = await getSetting("hoverVideoVolume");
                            if (typeof v === "number" && !isNaN(v)) {
                                volume = v;
                            }
                        }
                    } catch (e) {
                        volume = 50;
                    }
                    floatingMedia.volume = Math.max(0, Math.min(1, volume / 100));

                    floatingMedia.onloadeddata = function () {
                        if (!loaded && floatingMedia && isStillHovering) {
                            loaded = true;
                            floatingMedia.style.opacity = "1";
                            document.body.appendChild(floatingMedia);
                            document.addEventListener("mousemove", onMouseMove);
                            onMouseMove(e);
                        }
                    };

                    floatingMedia.onerror = cleanupFloatingMedia;
                } else if (filemime.startsWith("audio/")) {
                    const oldIndicator = container.querySelector(
                        ".audio-preview-indicator"
                    );
                    if (oldIndicator) oldIndicator.remove();
                    if (container && !container.style.position) {
                        container.style.position = "relative";
                    }

                    floatingMedia = document.createElement("audio");
                    floatingMedia.src = fullSrc;
                    floatingMedia.controls = false; 
                    floatingMedia.style.display = "none"; 
                    let volume = 50;
                    try {
                        if (typeof getSetting === "function") {
                            const v = await getSetting("hoverVideoVolume");
                            if (typeof v === "number" && !isNaN(v)) {
                                volume = v;
                            }
                        }
                    } catch (e) {
                        volume = 50;
                    }
                    floatingMedia.volume = Math.max(0, Math.min(1, volume / 100));

                    document.body.appendChild(floatingMedia);
                    const indicator = document.createElement("div");
                    indicator.classList.add("audio-preview-indicator");
                    indicator.textContent = "▶ Playing audio...";
                    container.appendChild(indicator);

                    floatingMedia.play().catch((error) => {
                        console.error("Audio playback failed:", error);
                    });
                    function removeAudioAndIndicator() {
                        if (floatingMedia) {
                            floatingMedia.pause();
                            floatingMedia.currentTime = 0;
                            floatingMedia.remove();
                            floatingMedia = null;
                        }
                        if (indicator) {
                            indicator.remove();
                        }
                    }

                    container.addEventListener("click", removeAudioAndIndicator, {
                        once: true,
                    });
                }
            }, 120); 
        }

        function attachThumbListeners(root = document) {
            const thumbs = root.querySelectorAll(
                "a.linkThumb > img, a.imgLink > img"
            );
            thumbs.forEach((thumb) => {
                if (!thumb._fullImgHoverBound) {
                    thumb.addEventListener("mouseenter", onThumbEnter);
                    thumb._fullImgHoverBound = true;
                }
            });
            const audioLinks = root.querySelectorAll("a.originalNameLink");
            audioLinks.forEach((link) => {
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
        const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                for (const node of mutation.addedNodes) {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        attachThumbListeners(node);
                    }
                }
            }
        });

        observer.observe(document.body, { childList: true, subtree: true });
    }
    function featureBlurSpoilers() {
        function revealSpoilers() {
            const spoilerLinks = document.querySelectorAll("a.imgLink");
            spoilerLinks.forEach(async (link) => {
                const img = link.querySelector("img");
                if (img) {
                    const isCustomSpoiler = img.src.includes("/custom.spoiler");
                    const isNotThumbnail = !img.src.includes("/.media/t_");

                    if (isNotThumbnail || isCustomSpoiler) {
                        let href = link.getAttribute("href");
                        if (href) {
                            const match = href.match(/\/\.media\/([^\/]+)\.[a-zA-Z0-9]+$/);
                            if (match) {
                                const transformedSrc = `/\.media/t_${match[1]}`;
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
                        }
                    }
                }
            });
        }
        revealSpoilers();
        const observer = new MutationObserver(revealSpoilers);
        observer.observe(document.body, { childList: true, subtree: true });
    }
    async function featureWatchThreadOnReply() {
        function getWatchButton() {
            return document.querySelector(".watchButton");
        }
        function isThreadWatched() {
            const btn = getWatchButton();
            return btn && btn.classList.contains("watched-active");
        }
        function watchThreadIfNotWatched() {
            const btn = getWatchButton();
            if (btn && !isThreadWatched()) {
                btn.click(); 
                setTimeout(() => {
                    btn.classList.add("watched-active");
                }, 100);
            }
        }
        const submitButton = document.getElementById("qrbutton");
        if (submitButton) {
            submitButton.addEventListener("click", async function () {
                if (await getSetting("watchThreadOnReply")) {
                    setTimeout(watchThreadIfNotWatched, 500); 
                }
            });
        }
        function updateWatchButtonClass() {
            const btn = getWatchButton();
            if (!btn) return;
            if (isThreadWatched()) {
                btn.classList.add("watched-active");
            } else {
                btn.classList.remove("watched-active");
            }
        }
        updateWatchButtonClass();
        const btn = getWatchButton();
        if (btn) {
            btn.addEventListener("click", function () {
                setTimeout(updateWatchButtonClass, 100);
            });
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
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", () => {
                showThreadWatcher();
                addCloseListener();
            });
        } else {
            showThreadWatcher();
            addCloseListener();
        }
    }
    function featureScrollArrows() {
        if (
            document.getElementById("scroll-arrow-up") ||
            document.getElementById("scroll-arrow-down")
        )
            return;
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
            const footer = document.getElementById("footer");
            if (footer) {
                footer.scrollIntoView({ behavior: "smooth", block: "end" });
            } else {
                window.scrollTo({
                    top: document.body.scrollHeight,
                    behavior: "smooth",
                });
            }
        });

        document.body.appendChild(upBtn);
        document.body.appendChild(downBtn);
    }
    async function featureSaveScroll() {
        if (document.documentElement.classList.contains("is-index")) return;

        const MAX_PAGES = 50;
        const currentPage = window.location.href;
        const excludedPagePatterns = [
            /\/catalog\.html$/i,
            /\/.media\/$/i,
            /\/boards\.js$/i,
            /\/login\.html$/i,
            /\/overboard$/i,
            /\/sfw$/i
        ];

        function isExcludedPage(url) {
            return excludedPagePatterns.some((pattern) => pattern.test(url));
        }

        async function saveScrollPosition() {
            if (isExcludedPage(currentPage)) return;
            if (!(await getSetting("enableScrollSave"))) return;

            const scrollPosition = window.scrollY;
            const timestamp = Date.now();
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
            if (isExcludedPage(currentPage)) return;
            if (!(await getSetting("enableScrollSave"))) return;

            const savedData = await GM.getValue(
                `8chanSS_scrollPosition_${currentPage}`,
                null
            );

            if (savedData) {
                let position;
                try {
                    const data = JSON.parse(savedData);
                    position = data.position;
                    await GM.setValue(
                        `8chanSS_scrollPosition_${currentPage}`,
                        JSON.stringify({
                            position: position,
                            timestamp: Date.now(),
                        })
                    );
                } catch (e) {
                    return;
                }
                if (!isNaN(position)) {
                    window.scrollTo(0, position);
                    setTimeout(() => addUnreadLineAtViewportCenter(position), 100);
                }
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
    featureSaveScroll();
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
    function featureDeleteNameCheckbox() {
        const nameExists = document.getElementById("qr-name-row");
        if (nameExists && nameExists.classList.contains("hidden")) {
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
        const alwaysUseBypassCheckbox = document.getElementById("qralwaysUseBypassCheckBox");
        if (alwaysUseBypassCheckbox) {
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
    }
    function featureBeepOnYou() {
        const beep = new Audio(
            "data:audio/wav;base64,UklGRjQDAABXQVZFZm10IBAAAAABAAEAgD4AAIA+AAABAAgAc21wbDwAAABBAAADAAAAAAAAAAA8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABkYXRhzAIAAGMms8em0tleMV4zIpLVo8nhfSlcPR102Ki+5JspVEkdVtKzs+K1NEhUIT7DwKrcy0g6WygsrM2k1NpiLl0zIY/WpMrjgCdbPhxw2Kq+5Z4qUkkdU9K1s+K5NkVTITzBwqnczko3WikrqM+l1NxlLF0zIIvXpsnjgydZPhxs2ay95aIrUEkdUdC3suK8N0NUIjq+xKrcz002WioppdGm091pK1w0IIjYp8jkhydXPxxq2K295aUrTkoeTs65suK+OUFUIzi7xqrb0VA0WSoootKm0t5tKlo1H4TYqMfkiydWQBxm16+85actTEseS8y7seHAPD9TIza5yKra01QyWSson9On0d5wKVk2H4DYqcfkjidUQB1j1rG75KsvSkseScu8seDCPz1TJDW2yara1FYxWSwnm9Sn0N9zKVg2H33ZqsXkkihSQR1g1bK65K0wSEsfR8i+seDEQTxUJTOzy6rY1VowWC0mmNWoz993KVc3H3rYq8TklSlRQh1d1LS647AyR0wgRMbAsN/GRDpTJTKwzKrX1l4vVy4lldWpzt97KVY4IXbUr8LZljVPRCxhw7W3z6ZISkw1VK+4sMWvXEhSPk6buay9sm5JVkZNiLWqtrJ+TldNTnquqbCwilZXU1BwpKirrpNgWFhTaZmnpquZbFlbVmWOpaOonHZcXlljhaGhpZ1+YWBdYn2cn6GdhmdhYGN3lp2enIttY2Jjco+bnJuOdGZlZXCImJqakHpoZ2Zug5WYmZJ/bGlobX6RlpeSg3BqaW16jZSVkoZ0bGtteImSk5KIeG5tbnaFkJKRinxxbm91gY2QkIt/c3BwdH6Kj4+LgnZxcXR8iI2OjIR5c3J0e4WLjYuFe3VzdHmCioyLhn52dHR5gIiKioeAeHV1eH+GiYqHgXp2dnh9hIiJh4J8eHd4fIKHiIeDfXl4eHyBhoeHhH96eHmA"
        );
        const originalTitle = document.title;
        let isNotifying = false;
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach(async (node) => {
                    if (
                        node.nodeType === 1 &&
                        node.querySelector &&
                        node.querySelector("a.quoteLink.you")
                    ) {
                        if (await getSetting("beepOnYou")) {
                            playBeep();
                        }
                        if (await getSetting("notifyOnYou")) {
                            featureNotifyOnYou();
                        }
                    }
                });
            });
        });

        observer.observe(document.body, { childList: true, subtree: true });
        function playBeep() {
            if (beep.paused) {
                beep.play().catch((e) => console.warn("Beep failed:", e));
            } else {
                beep.addEventListener("ended", () => beep.play(), { once: true });
            }
        }
    }
    if (!window.originalTitle) {
        window.originalTitle = document.title;
    }

    function featureNotifyOnYou() {
        if (!window.isNotifying && !document.hasFocus()) {
            window.isNotifying = true;
            document.title = "(!) " + window.originalTitle;
            if (!window.notifyFocusListenerAdded) {
                window.addEventListener("focus", () => {
                    if (window.isNotifying) {
                        document.title = window.originalTitle;
                        window.isNotifying = false;
                    }
                });
                window.notifyFocusListenerAdded = true;
            }
        }
    }
    window.addEventListener("focus", () => {
        if (window.isNotifying) {
            document.title = window.originalTitle;
            window.isNotifying = false;
        }
    });

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
    if (await getSetting("deleteSavedName")) {
        featureDeleteNameCheckbox();
    }
    if (await getSetting("enableScrollArrows")) {
        featureScrollArrows();
    }
    if ((await getSetting("beepOnYou")) || (await getSetting("notifyOnYou"))) {
        featureBeepOnYou();
    }
    if (await getSetting("alwaysShowTW")) {
        featureAlwaysShowTW();
    }
    const isCatalogPage = /\/catalog\.html$/.test(
        window.location.pathname.toLowerCase()
    );
    if (
        (isCatalogPage && (await getSetting("enableCatalogImageHover"))) ||
        (!isCatalogPage && (await getSetting("enableThreadImageHover")))
    ) {
        featureImageHover();
    }
    document.addEventListener("keydown", async function (event) {
        if (event.ctrlKey && event.key === "F1") {
            event.preventDefault();
            let menu =
                document.getElementById("8chanSS-menu") ||
                (await createSettingsMenu());
            menu.style.display =
                menu.style.display === "none" || menu.style.display === ""
                    ? "block"
                    : "none";
        }
    });
    async function submitWithCtrlEnter(event) {
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
    }
    const replyTextarea = document.getElementById("qrbody");
    if (replyTextarea) {
        replyTextarea.addEventListener("keydown", submitWithCtrlEnter);
    }
    function toggleQR(event) {
        if (event.ctrlKey && (event.key === "q" || event.key === "Q")) {
            const hiddenDiv = document.getElementById("quick-reply");
            if (
                hiddenDiv.style.display === "none" ||
                hiddenDiv.style.display === ""
            ) {
                hiddenDiv.style.display = "block"; 
                setTimeout(() => {
                    const textarea = document.getElementById("qrbody");
                    if (textarea) {
                        textarea.focus();
                    }
                }, 50);
            } else {
                hiddenDiv.style.display = "none"; 
            }
        }
    }
    document.addEventListener("keydown", toggleQR);
    function clearTextarea(event) {
        if (event.key === "Escape") {
            const textarea = document.getElementById("qrbody");
            if (textarea) {
                textarea.value = ""; 
            }
            const quickReply = document.getElementById("quick-reply");
            if (quickReply) {
                quickReply.style.display = "none"; 
            }
        }
    }
    document.addEventListener("keydown", clearTextarea);
    const bbCodeCombinations = new Map([
        ["s", ["[spoiler]", "[/spoiler]"]],
        ["b", ["'''", "'''"]],
        ["u", ["__", "__"]],
        ["i", ["''", "''"]],
        ["d", ["[doom]", "[/doom]"]],
        ["m", ["[moe]", "[/moe]"]],
        ["c", ["[code]", "[/code]"]],
    ]);

    function replyKeyboardShortcuts(ev) {
        const key = ev.key.toLowerCase();
        if (
            key === "c" &&
            ev.altKey &&
            !ev.ctrlKey &&
            bbCodeCombinations.has(key)
        ) {
            ev.preventDefault();
            const textBox = ev.target;
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
            return;
        }
        if (
            ev.ctrlKey &&
            !ev.altKey &&
            bbCodeCombinations.has(key) &&
            key !== "c"
        ) {
            ev.preventDefault();
            const textBox = ev.target;
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
            return;
        }
    }
    document
        .getElementById("qrbody")
        ?.addEventListener("keydown", replyKeyboardShortcuts);
    const captchaInput = document.getElementById("QRfieldCaptcha");
    if (captchaInput) {
        captchaInput.autocomplete = "off";
    }
});