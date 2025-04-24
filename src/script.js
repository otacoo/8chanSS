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
    swapTheme();
    document.addEventListener("DOMContentLoaded", swapTheme);

    // Also, if the theme selector exists, set its value to the user's theme
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
////////// Disable native extension settings //////
(function () {
    try {
        // Image Hover
        localStorage.removeItem("hoveringImage");
    } catch (e) {
        // Ignore errors (e.g., storage not available)
    }
})();
////////// ON READY HELPER ///////////////////////
function onReady(fn) {
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", fn, { once: true });
    } else {
        fn();
    }
}
//////// START OF THE SCRIPT ////////////////////
onReady(async function () {
    // --- Default Settings ---
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
            enableScrollSave: { label: "Save Scroll Position", default: true },
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

    // Flatten settings for backward compatibility with existing functions
    const flatSettings = {};
    function flattenSettings() {
        Object.keys(scriptSettings).forEach((category) => {
            Object.keys(scriptSettings[category]).forEach((key) => {
                flatSettings[key] = scriptSettings[category][key];
                // Also flatten any sub-options
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

    // --- GM storage wrappers ---
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
        // Always store as string for consistency
        await GM.setValue("8chanSS_" + key, String(value));
    }

    // --- Root CSS Class Toggles ---
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
        // URL-based class toggling
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
    // Init
    featureCssClassToggles();

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

    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // Custom CSS injection
    function addCustomCSS(css) {
        if (!css) return;
        const style = document.createElement("style");
        style.type = "text/css";
        style.id = "8chSS";
        style.appendChild(document.createTextNode(css));
        document.head.appendChild(style);
    }
    // Get the current URL path
    const currentPath = window.location.pathname.toLowerCase();
    const currentHost = window.location.hostname.toLowerCase();

    // Apply CSS based on URL pattern
    if (/^8chan\.(se|moe)$/.test(currentHost)) {
        // General CSS for all pages
        const css = "<%= grunt.file.read('tmp/site.min.css').replace(/\\(^\")/g, '') %>";
        addCustomCSS(css);
    }

    // Thread page CSS
    if (/\/res\/[^/]+\.html$/.test(currentPath)) {
        const css = "<%= grunt.file.read('tmp/thread.min.css').replace(/\\(^\")/g, '') %>";
        addCustomCSS(css);
    }

    // Catalog page CSS
    if (/\/catalog\.html$/.test(currentPath)) {
        const css = "<%= grunt.file.read('tmp/catalog.min.css').replace(/\\(^\")/g, '') %>";
        addCustomCSS(css);
    }

    // --- Floating Settings Menu with Tabs ---
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
        tabContent.style.padding = "15px 18px";
        tabContent.style.maxHeight = "60vh";
        tabContent.style.overflowY = "auto";

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
        info.textContent = "Press Save to apply changes. Page will reload.";
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
            if (setting.subOptions) {
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

            // Wrapper for parent row and sub-options
            const wrapper = document.createElement("div");
            wrapper.style.marginBottom = "10px";

            wrapper.appendChild(parentRow);

            // Handle sub-options if any exist
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

        // Add minimal CSS for chevron (only once)
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

    // --- Feature: Catalog & Image Hover ---
    async function featureImageHover() {
        // Accepts the thumb <img> node as the first argument
        function getFullMediaSrcFromMime(thumbNode, filemime) {
            if (!thumbNode || !filemime) return null;
            const thumbnailSrc = thumbNode.getAttribute("src");

            // If it's a t_ thumbnail
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

            // If it's a /spoiler.png thumbnail or /custom.spoiler, use parent <a>'s href
            if (
                /\/spoiler\.png$/i.test(thumbnailSrc) ||
                /\/custom\.spoiler$/i.test(thumbnailSrc) ||
                /\/audioGenericThumb\.png$/i.test(thumbnailSrc)
            ) {
                const parentA = thumbNode.closest("a.linkThumb, a.imgLink");
                if (parentA && parentA.getAttribute("href")) {
                    // Use the full file URL from href
                    return parentA.getAttribute("href");
                }
                return null;
            }

            // Fallback: return null if not recognized
            return null;
        }

        // Inject CSS for the audio indicator (only once)
        if (!document.getElementById("audio-preview-indicator-style")) {
            const style = document.createElement("style");
            style.id = "audio-preview-indicator-style";
            style.textContent = `
                /* Make containers position:relative so absolute positioning works */
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
                        // Silently handle media cleanup errors
                    }
                }

                if (floatingMedia.parentNode) {
                    floatingMedia.parentNode.removeChild(floatingMedia);
                }
            }

            // Remove any audio indicators
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

            // Determine media dimensions based on type
            let mediaWidth = 0,
                mediaHeight = 0;

            if (floatingMedia.tagName === "IMG") {
                mediaWidth =
                    floatingMedia.naturalWidth ||
                    floatingMedia.width ||
                    floatingMedia.offsetWidth ||
                    0;
                mediaHeight =
                    floatingMedia.naturalHeight ||
                    floatingMedia.height ||
                    floatingMedia.offsetHeight ||
                    0;
            } else if (floatingMedia.tagName === "VIDEO") {
                mediaWidth = floatingMedia.videoWidth || floatingMedia.offsetWidth || 0;
                mediaHeight =
                    floatingMedia.videoHeight || floatingMedia.offsetHeight || 0;
            } else if (floatingMedia.tagName === "AUDIO") {
                // Don't move audio elements - they're hidden anyway
                return;
            }

            mediaWidth = Math.min(mediaWidth, viewportWidth * 0.9);
            mediaHeight = Math.min(mediaHeight, viewportHeight * 0.9);

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

            // Get the actual container element (important for audio files)
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

                // Case 1: Image/video thumbnail
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
                // Case 2: Audio file download link
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

                // Helper to set common styles for floating media
                function setCommonStyles(el) {
                    el.style.position = "fixed";
                    el.style.zIndex = 9999;
                    el.style.pointerEvents = "none";
                    el.style.maxWidth = "95vw";
                    el.style.maxHeight = "95vh";
                    el.style.transition = "opacity 0.15s";
                    el.style.opacity = "0";
                    el.style.left = "-9999px";
                }

                // Setup cleanup listeners
                removeListeners = function () {
                    window.removeEventListener("scroll", cleanupFloatingMedia, true);
                };
                window.addEventListener("scroll", cleanupFloatingMedia, true);

                if (filemime.startsWith("image/")) {
                    floatingMedia = document.createElement("img");
                    setCommonStyles(floatingMedia);

                    floatingMedia.onload = function () {
                        if (!loaded && floatingMedia && isStillHovering) {
                            loaded = true;
                            floatingMedia.style.opacity = "1";
                            document.body.appendChild(floatingMedia);
                            document.addEventListener("mousemove", onMouseMove);
                            onMouseMove(e);
                        }
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
                    floatingMedia.controls = false; // No controls for videos

                    // Set volume from settings (0-100)
                    let volume = 50;
                    try {
                        if (typeof getSetting === "function") {
                            const v = await getSetting("hoverVideoVolume");
                            if (typeof v === "number" && !isNaN(v)) {
                                volume = v;
                            }
                        }
                    } catch (e) {
                        // Use default if setting can't be retrieved
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
                    floatingMedia.src = fullSrc;
                } else if (filemime.startsWith("audio/")) {
                    // --- AUDIO HOVER INDICATOR LOGIC ---
                    // Remove any lingering indicator first
                    const oldIndicator = container.querySelector(
                        ".audio-preview-indicator"
                    );
                    if (oldIndicator) oldIndicator.remove();

                    // Make sure container has position:relative for proper indicator positioning
                    if (container && !container.style.position) {
                        container.style.position = "relative";
                    }

                    floatingMedia = document.createElement("audio");
                    floatingMedia.src = fullSrc;
                    floatingMedia.controls = false; // No controls for audio
                    floatingMedia.style.display = "none"; // Hide the element visually

                    // Set volume from settings (0-100)
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

                    // Add indicator to the container (parent a tag) instead of the img
                    const indicator = document.createElement("div");
                    indicator.classList.add("audio-preview-indicator");
                    indicator.textContent = "▶ Playing audio...";
                    container.appendChild(indicator);

                    floatingMedia.play().catch((error) => {
                        console.error("Audio playback failed:", error);
                    });

                    // Remove audio and indicator on click as well
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
            }, 120); // Short delay before showing preview
        }

        function attachThumbListeners(root = document) {
            // Attach to image thumbnails (works for both thread and catalog)
            const thumbs = root.querySelectorAll(
                "a.linkThumb > img, a.imgLink > img"
            );
            thumbs.forEach((thumb) => {
                if (!thumb._fullImgHoverBound) {
                    thumb.addEventListener("mouseenter", onThumbEnter);
                    thumb._fullImgHoverBound = true;
                }
            });

            // Always attach to audio download links (both catalog and thread)
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

        // Initial attachment
        attachThumbListeners();

        // Watch for new elements
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

    /* --- Feature: Blur Spoilers + Remove Spoilers suboption --- */
    function featureBlurSpoilers() {
        function revealSpoilers() {
            const spoilerLinks = document.querySelectorAll("a.imgLink");
            spoilerLinks.forEach(async (link) => {
                const img = link.querySelector("img");
                if (img) {
                    // Check if this is a custom spoiler image
                    const isCustomSpoiler = img.src.includes("/custom.spoiler");
                    // Check if this is NOT already a thumbnail
                    const isNotThumbnail = !img.src.includes("/.media/t_");

                    if (isNotThumbnail || isCustomSpoiler) {
                        let href = link.getAttribute("href");
                        if (href) {
                            // Extract filename without extension
                            const match = href.match(/\/\.media\/([^\/]+)\.[a-zA-Z0-9]+$/);
                            if (match) {
                                // Use the thumbnail path (t_filename)
                                const transformedSrc = `/\.media/t_${match[1]}`;
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
                        }
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

    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // --- Feature: Watch Thread on Reply ---
    async function featureWatchThreadOnReply() {
        // Helper: Get the watch button element
        function getWatchButton() {
            return document.querySelector(".watchButton");
        }

        // Helper: Check if thread is watched (by presence of watched-active class)
        function isThreadWatched() {
            const btn = getWatchButton();
            return btn && btn.classList.contains("watched-active");
        }

        // Helper: Trigger the native watch button click if not already watched
        function watchThreadIfNotWatched() {
            const btn = getWatchButton();
            if (btn && !isThreadWatched()) {
                btn.click(); // Triggers the site's watcher logic
                // The site should add watched-active, but if not, we can add it ourselves:
                setTimeout(() => {
                    btn.classList.add("watched-active");
                }, 100);
            }
        }

        // On post submit (button)
        const submitButton = document.getElementById("qrbutton");
        if (submitButton) {
            submitButton.addEventListener("click", async function () {
                if (await getSetting("watchThreadOnReply")) {
                    setTimeout(watchThreadIfNotWatched, 500); // Wait for post to go through
                }
            });
        }

        // On page load, update the icon if already watched
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

        // Also update when the user manually clicks the watch button
        const btn = getWatchButton();
        if (btn) {
            btn.addEventListener("click", function () {
                setTimeout(updateWatchButtonClass, 100);
            });
        }
    }

    // --- Watch Thread on ALT+W Keyboard Shortcut ---
    document.addEventListener("keydown", async function (event) {
        // Only trigger if ALT+W is pressed and no input/textarea is focused
        if (
            event.altKey &&
            !event.ctrlKey &&
            !event.shiftKey &&
            !event.metaKey &&
            (event.key === "w" || event.key === "W")
        ) {
            // Prevent default browser behavior (e.g., closing tab in some browsers)
            event.preventDefault();
            // Only run if the setting is enabled
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

    // --- Feature: Move new post notification and show board ---
    function processWatchedLabels() {
        document.querySelectorAll('.watchedCellLabel').forEach(label => {
            // Safety: Only operate if label is still in the DOM
            if (!label.isConnected) return;

            const notif = label.querySelector('.watchedNotification');
            const link = label.querySelector('a');
            if (!notif || !link) return;

            // Move notif to the front if not already there
            if (label.firstElementChild !== notif) {
                label.prepend(notif);
            }

            // Extract board name from href (between first two slashes)
            const match = link.getAttribute('href').match(/^\/([^\/]+)\//);
            if (!match) return;
            const board = `/${match[1]}/`;

            // Remove any existing board prefix (e.g. "(b) - " or "/b/ - ")
            link.textContent = link.textContent.replace(/^\([^)]+\)\s*-\s*|^\/[^\/]+\/\s*-\s*/i, '');

            // Prepend the new board prefix
            link.textContent = `${board} - ${link.textContent}`;
        });
    }

    // Initial run
    processWatchedLabels();

    // Try to find the container for watched threads
    function getWatchedContainer() {
        // Try common selectors; adjust as needed for your board
        return document.querySelector('.floatingContainer, #watchedThreads, .watchedThreads');
    }

    const container = getWatchedContainer();
    if (container) {
        // Observe for changes in the watched threads container
        const observer = new MutationObserver(() => {
            processWatchedLabels();
        });
        observer.observe(container, { childList: true, subtree: true });
    }

    // Optionally, re-run on page navigation
    window.addEventListener('DOMContentLoaded', processWatchedLabels);
    window.addEventListener('load', processWatchedLabels);

    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // --- Feature: Scroll Arrows ---
    function featureScrollArrows() {
        // Only add once
        if (
            document.getElementById("scroll-arrow-up") ||
            document.getElementById("scroll-arrow-down")
        )
            return;

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

    // --- Feature: Save Scroll Position (now with unread line) ---
    async function featureSaveScroll() {
        // Return early if root has .is-index
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

            const scrollPosition = window.scrollY;
            const timestamp = Date.now();

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

        async function addUnreadLine() {
            // If the URL contains a hash (e.g. /res/1190.html#1534), do nothing
            if (window.location.hash && window.location.hash.length > 1) {
                return;
            }

            const savedData = await GM.getValue(
                `8chanSS_scrollPosition_${currentPage}`,
                null
            );

            if (savedData) {
                let position;
                try {
                    // Try to parse as JSON (new format)
                    const data = JSON.parse(savedData);
                    position = data.position;

                    // Update the timestamp to "refresh" this entry
                    await GM.setValue(
                        `8chanSS_scrollPosition_${currentPage}`,
                        JSON.stringify({
                            position: position,
                            timestamp: Date.now(),
                        })
                    );
                } catch (e) {
                    // If parsing fails, skip (should not happen with cleaned storage)
                    return;
                }

                if (!isNaN(position)) {
                    window.scrollTo(0, position);

                    // Only add unread-line if a saved position exists (i.e., not first visit)
                    setTimeout(addUnreadLineAtViewportCenter, 100);
                }
            }
        }

        //---- Add an unread-line marker after the .postCell <div>  ----
        function addUnreadLineAtViewportCenter() {
            const divPosts = document.querySelector(".divPosts");
            if (!divPosts) return;

            // Find the element at the center of the viewport
            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;
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

        // For load event, we can use an async function
        window.addEventListener("load", async () => {
            await addUnreadLine();
        });

        // Initial restore attempt (in case the load event already fired)
        await addUnreadLine();
    }

    // Init
    featureSaveScroll();

    // --- Feature: Delete (Save) Name Checkbox ---
    // Pay attention that it needs to work on localStorage for the name key (not GM Storage)
    function featureDeleteNameCheckbox() {
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
    }

    // --- Feature: Beep on (You) ---
    function featureBeepOnYou() {
        // Beep sound (base64)
        const beep = new Audio(
            "data:audio/wav;base64,UklGRjQDAABXQVZFZm10IBAAAAABAAEAgD4AAIA+AAABAAgAc21wbDwAAABBAAADAAAAAAAAAAA8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABkYXRhzAIAAGMms8em0tleMV4zIpLVo8nhfSlcPR102Ki+5JspVEkdVtKzs+K1NEhUIT7DwKrcy0g6WygsrM2k1NpiLl0zIY/WpMrjgCdbPhxw2Kq+5Z4qUkkdU9K1s+K5NkVTITzBwqnczko3WikrqM+l1NxlLF0zIIvXpsnjgydZPhxs2ay95aIrUEkdUdC3suK8N0NUIjq+xKrcz002WioppdGm091pK1w0IIjYp8jkhydXPxxq2K295aUrTkoeTs65suK+OUFUIzi7xqrb0VA0WSoootKm0t5tKlo1H4TYqMfkiydWQBxm16+85actTEseS8y7seHAPD9TIza5yKra01QyWSson9On0d5wKVk2H4DYqcfkjidUQB1j1rG75KsvSkseScu8seDCPz1TJDW2yara1FYxWSwnm9Sn0N9zKVg2H33ZqsXkkihSQR1g1bK65K0wSEsfR8i+seDEQTxUJTOzy6rY1VowWC0mmNWoz993KVc3H3rYq8TklSlRQh1d1LS647AyR0wgRMbAsN/GRDpTJTKwzKrX1l4vVy4lldWpzt97KVY4IXbUr8LZljVPRCxhw7W3z6ZISkw1VK+4sMWvXEhSPk6buay9sm5JVkZNiLWqtrJ+TldNTnquqbCwilZXU1BwpKirrpNgWFhTaZmnpquZbFlbVmWOpaOonHZcXlljhaGhpZ1+YWBdYn2cn6GdhmdhYGN3lp2enIttY2Jjco+bnJuOdGZlZXCImJqakHpoZ2Zug5WYmZJ/bGlobX6RlpeSg3BqaW16jZSVkoZ0bGtteImSk5KIeG5tbnaFkJKRinxxbm91gY2QkIt/c3BwdH6Kj4+LgnZxcXR8iI2OjIR5c3J0e4WLjYuFe3VzdHmCioyLhn52dHR5gIiKioeAeHV1eH+GiYqHgXp2dnh9hIiJh4J8eHd4fIKHiIeDfXl4eHyBhoeHhH96eHmA"
        );

        // Store the original title
        const originalTitle = document.title;
        let isNotifying = false;

        // Create MutationObserver to detect when you are quoted
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach(async (node) => {
                    if (
                        node.nodeType === 1 &&
                        node.querySelector &&
                        node.querySelector("a.quoteLink.you")
                    ) {
                        // Only play beep if the setting is enabled
                        if (await getSetting("beepOnYou")) {
                            playBeep();
                        }

                        // Trigger notification in separate function if enabled
                        if (await getSetting("notifyOnYou")) {
                            featureNotifyOnYou();
                        }
                    }
                });
            });
        });

        observer.observe(document.body, { childList: true, subtree: true });

        // Function to play the beep sound
        function playBeep() {
            if (beep.paused) {
                beep.play().catch((e) => console.warn("Beep failed:", e));
            } else {
                beep.addEventListener("ended", () => beep.play(), { once: true });
            }
        }
        // Function to notify on (You)
        function featureNotifyOnYou() {
            // Store the original title if not already stored
            if (!window.originalTitle) {
                window.originalTitle = document.title;
            }

            // Add notification to title if not already notifying and tab not focused
            if (!window.isNotifying && !document.hasFocus()) {
                window.isNotifying = true;
                document.title = "(!) " + window.originalTitle;

                // Set up focus event listener if not already set
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
        // Function to add notification to the title
        function addNotificationToTitle() {
            if (!isNotifying && !document.hasFocus()) {
                isNotifying = true;
                document.title = "(!) " + originalTitle;
            }
        }
        // Remove notification when tab regains focus
        window.addEventListener("focus", () => {
            if (isNotifying) {
                document.title = originalTitle;
                isNotifying = false;
            }
        });
    }

    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // --- Feature Initialization based on Settings ---

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

    // Check if we should enable image hover based on the current page
    const isCatalogPage = /\/catalog\.html$/.test(
        window.location.pathname.toLowerCase()
    );
    if (
        (isCatalogPage && (await getSetting("enableCatalogImageHover"))) ||
        (!isCatalogPage && (await getSetting("enableThreadImageHover")))
    ) {
        featureImageHover();
    }

    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    
    // --- Keyboard Shortcuts ---
    // Open 8chanSS menu (CTRL + F1)
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

    // Submit post (CTRL + Enter)
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

    // QR (CTRL + Q)
    function toggleQR(event) {
        // Check if Ctrl + Q is pressed
        if (event.ctrlKey && (event.key === "q" || event.key === "Q")) {
            const hiddenDiv = document.getElementById("quick-reply");
            // Toggle QR
            if (
                hiddenDiv.style.display === "none" ||
                hiddenDiv.style.display === ""
            ) {
                hiddenDiv.style.display = "block"; // Show the div

                // Focus the textarea after a small delay to ensure it's visible
                setTimeout(() => {
                    const textarea = document.getElementById("qrbody");
                    if (textarea) {
                        textarea.focus();
                    }
                }, 50);
            } else {
                hiddenDiv.style.display = "none"; // Hide the div
            }
        }
    }
    document.addEventListener("keydown", toggleQR);

    // (ESC) Clear textarea and hide QR
    function clearTextarea(event) {
        // Check if Escape key is pressed
        if (event.key === "Escape") {
            // Clear the textarea
            const textarea = document.getElementById("qrbody");
            if (textarea) {
                textarea.value = ""; // Clear the textarea
            }

            // Hide the quick-reply div
            const quickReply = document.getElementById("quick-reply");
            if (quickReply) {
                quickReply.style.display = "none"; // Hide the quick-reply
            }
        }
    }
    document.addEventListener("keydown", clearTextarea);

    //--- Scroll to Reply scrolling between replies using Ctrl + Arrow Up/Down (and Shift for others' replies to you)


    // BBCODE Combination keys and Tags
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
        // Special case: alt+c for [code] tag
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
            return;
        }
        // All other tags: ctrl+key
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
            return;
        }
    }
    document
        .getElementById("qrbody")
        ?.addEventListener("keydown", replyKeyboardShortcuts);
});