// ==UserScript==
// @name         8chanSS
// @version      2.3.0
// @namespace    8chanss
// @description  A userscript to add functionality to 8chan.
// @author       otacoo
// @license      MIT; https://github.com/otacoo/8chanSS/blob/main/LICENSE 
// @match        *://*.8chan.moe/*
// @match        *://*.8chan.st/*
// @match        *://*.8chan.cc/*
// @match        *://alephchvkipd2houttjirmgivro5pxullvcgm4c47ptm7mhubbja6kad.onion/*
// @exclude      *://*.8chan.moe/login.html
// @exclude      *://*.8chan.st/login.html
// @exclude      *://*.8chan.cc/login.html
// @exclude      *://alephchvkipd2houttjirmgivro5pxullvcgm4c47ptm7mhubbja6kad.onion/login.html
// @grant        GM.getValue
// @grant        GM.setValue
// @grant        GM.deleteValue
// @grant        GM.listValues
// @grant        unsafeWindow
// @grant        GM.xmlHttpRequest
// @connect      youtube.com
// @connect      i.ytimg.com
// @connect      twitch.tv
// @connect      static-cdn.jtvnw.net
// @connect      clips-media-assets2.twitch.tv
// @connect      api.fxtwitter.com
// @connect      embed.bsky.app
// @connect      bsky.app
// @connect      cdn.bsky.app
// @connect      *.twimg.com
// @connect      pastebin.com
// @connect      rentry.co
// @connect      rentry.org
// @run-at       document-start
// @updateURL    https://github.com/otacoo/8chanSS/releases/latest/download/8chanSS.meta.js
// @downloadURL  https://github.com/otacoo/8chanSS/releases/latest/download/8chanSS.user.js
// @icon         data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAMAAABg3Am1AAAAZlBMVEUAAABdlloAhl758AH58AH58AcAhl758ADj4CYAh14AhV4AhV0Ahl748AcChl4Chl0Ab2H58AIAhl758AD58AAAhl757wL48AD47wL78QL47wcAh1748AF3oFfs5yEAh1/68QDz7BM5qSu8AAAAH3RSTlMA/lg/OYtM8g/onXtoXzAaCdzBsIFzczMeaCXXyrmp9ddA3QAAANpJREFUSMft0tkOgjAQheFjtVCQVVxwnfr+L+kWM5FOC73TxP/6fBedFJwpyx5CtSpqSHXWpns4qYxo1cDtkNp7GoOW9KgSwM4+09KeEhmw4H0IuGJDAbCw79a8nwJYFDQCuO1gT8oLWCiKAXavKA5cZ78I5n/wBx7wfb+1TwOggpD2gxxSpvWBrIbY3AcUPK1lkMNbJ4FV4wd964KsQqBF6oAEwcoh2GAk/QlyjNYx4AeHMicGxxoTOrRvIB5IPtULJJhY+QIFJrd9gCUi0tdZjqgu5yYOGAO5G/kyc3TkciPeAAAAAElFTkSuQmCC
// ==/UserScript==

(function () {
  "use strict";

  var VERSION = "2.3.0";

  var pageType = (function () {
    var path = (location.pathname || "").toLowerCase();
    return {
      isCatalog: /\/catalog\.html$/i.test(path),
      isThread: /\/(res|last)\/[^/]+\.html$/i.test(path),
      isLast: /\/last\/[^/]+\.html$/i.test(path),
      isIndex: /\/[^/]+\/$/i.test(path),
      path: path
    };
  })();

  function onDomReady(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn, { once: true });
    } else {
      fn();
    }
  }

  function debounce(fn, delay) {
    var t = 0;
    return function () {
      var args = arguments, self = this;
      clearTimeout(t);
      t = setTimeout(function () { fn.apply(self, args); }, delay);
    };
  }
  var SS_STORE_PREFIX = "8chanSS_";

  var SS_STORAGE_KEYS = {
    catalogLinks: "enableHeaderCatalogLinks",
    catalogLinksNewTab: "enableHeaderCatalogLinks_openInNewTab",
    scrollArrows: "enableScrollArrows",
    bottomHeader: "enableBottomHeader",
    autoHideHeaderScroll: "enableAutoHideHeaderScroll",
    faviconStyle: "customFavicon_faviconStyle",
    mascotOpacity: "enableMascots_mascotOpacity",
    mascotUrls: "enableMascots_mascotUrls",
    announceHash: "announcementContent",
    showCatalogForm: "hidePostingForm_showCatalogForm",
    leftSidebar: "enableSidebar_leftSidebar",
    removeSpoilers: "blurSpoilers_removeSpoilers",
    enableMediaPlayer: "enableMediaViewer",
    viewerStyle: "enableMediaViewer_viewerStyle",
    trackHoverPlayback: "trackMediaPlayback",
    backlinkIcons: "enableBacklinkIcons",
    noPinInCatalog: "alwaysShowTW_noPinInCatalog",
    expandTW: "autoExpandTW",
    customTrunc: "truncFilenames_customTrunc",
    idHlStyle: "highlightNewIds_idHlStyle",
    showUnreadLine: "enableScrollSave_showUnreadLine",
    showLinkIcons: "enhanceLinks_showIcons",
    iconYoutube: "enhanceLinks_showIcons_showIconsYoutube",
    iconTwitch: "enhanceLinks_showIcons_showIconsTwitch",
    iconX: "enhanceLinks_showIcons_showIconsX",
    iconBsky: "enhanceLinks_showIcons_showIconsBsky",
    iconRentry: "enhanceLinks_showIcons_showIconsRentry",
    iconCatbox: "enhanceLinks_showIcons_showIconsCatbox",
    iconPastebin: "enhanceLinks_showIcons_showIconsPastebin",
    linkThumbnails: "enhanceLinks_showThumbnails",
    thumbYoutube: "enhanceLinks_showThumbnails_showThumbnailsYoutube",
    thumbTwitch: "enhanceLinks_showThumbnails_showThumbnailsTwitch",
    linkEmbeds: "enhanceLinks_enableEmbeds",
    embedX: "enhanceLinks_enableEmbeds_enableEmbedsX",
    embedBsky: "enhanceLinks_enableEmbeds_enableEmbedsBsky",
    embedRentry: "enhanceLinks_enableEmbeds_enableEmbedsRentry",
    embedPastebin: "enhanceLinks_enableEmbeds_enableEmbedsPastebin",
    sauceLinks: "enableTheSauce",
    sauceIqdb: "enableTheSauce_iqdb",
    sauceSaucenao: "enableTheSauce_saucenao",
    saucePixiv: "enableTheSauce_pixiv",
    catalogImageHover: "enableCatalogImageHover",
    threadImageHover: "enableThreadImageHover",
    catalogFiltering: "enableThreadHiding_enableCatalogFiltering",
    hashNavigation: "enableHashNav",
    catalogNewTab: "openCatalogThreadNewTab",
    lastFifty: "enableLastFifty",
    updateNotif: "enableUpdateNotif",
    ssVersion: "version"
  };

  function storageKeyFor(key) {
    return SS_STORAGE_KEYS[key] || key;
  }

  var SS_DEFAULTS = {
    catalogLinks: true,
    scrollArrows: false,
    arrowPageScroll: true,
    bottomHeader: false,
    autoHideHeaderScroll: false,
    customFavicon: false,
    faviconStyle: "default",
    enableMascots: false,
    mascotOpacity: 30,
    mascotUrls: "",
    hideAnnouncement: false,
    announceHash: "",
    hidePanelMessage: false,
    hideFooter: false,
    hidePostingForm: false,
    showCatalogForm: false,
    hideBanner: false,
    hideNoCookieLink: false,
    hideJannyTools: false,
    hlCurrentBoard: true,
    showReplyHeader: false,
    roundedCorners: false,
    styleScrollbars: false,
    thinScrollbars: false,
    enableSidebar: false,
    leftSidebar: false,
    enableFitReplies: false,
    highlightOnYou: true,
    opBackground: false,
    backlinkIcons: false,
    applyFixes: true,
    moveUploads: true,
    enableStickyQR: false,
    fadeQuickReply: false,
    threadHideCloseBtn: false,
    blurSpoilers: false,
    removeSpoilers: false,
    enablePNGstop: false,
    gallery: true,
    enableMediaPlayer: false,
    viewerStyle: "native",
    trackHoverPlayback: false,
    noPinInCatalog: false,
    smallFont: false,
    expandTW: false,
    catalogImageHover: false,
    threadImageHover: true,
    catalogFiltering: false,
    catalogNewTab: false,
    lastFifty: false,
    catalogLinksNewTab: false,
    catalogFilters: {},
    truncFilenames: false,
    customTrunc: 15,
    enableScrollSave: true,
    showUnreadLine: true,
    rememberCommentDraft: false,
    quoteThreading: false,
    hashNavigation: false,
    highlightNewIds: false,
    idHlStyle: "moetext",
    alwaysShowIdCount: false,
    showLinkIcons: true,
    iconYoutube: true,
    iconTwitch: true,
    iconX: true,
    iconBsky: true,
    iconRentry: true,
    iconCatbox: true,
    iconPastebin: true,
    linkThumbnails: true,
    thumbYoutube: true,
    thumbTwitch: true,
    linkEmbeds: false,
    embedX: true,
    embedBsky: true,
    embedRentry: true,
    embedPastebin: true,
    sauceLinks: false,
    sauceIqdb: false,
    sauceSaucenao: false,
    saucePixiv: false,
    autoSaveDaily: false,
    beepOnYou: false,
    enableShortcuts: false,
    updateNotif: true,
    ssVersion: ""
  };

  var SS_PAGES = [
    {
      page: "ss-general", title: "General", options: [
        { head: "Site" },
        { key: "bottomHeader", label: "Bottom Header", title: "Move nav header to bottom of viewport" },
        { key: "autoHideHeaderScroll", label: "Auto-hide Header on Scroll" },
        {
          key: "catalogLinks", label: "Catalog Links", title: "Turn all board links in the header into /catalog.html links", sub: [
            { key: "catalogLinksNewTab", label: "Always open in new tab" }
          ]
        },
        {
          key: "scrollArrows", label: "Show Up/Down Arrows", title: "Floating scroll buttons", sub: [
            { key: "arrowPageScroll", label: "Scroll by page", title: "When off, up jumps to the very top and down to the very bottom" }
          ]
        },
        { head: "Media" },
        { key: "threadImageHover", label: "Image Hover" },
        {
          key: "blurSpoilers", label: "Blur Spoilers", sub: [
            { key: "removeSpoilers", label: "Remove Spoilers" }
          ]
        },
        {
          key: "enableMediaPlayer", label: "Enable Advanced Media Player", sub: [
            {
              key: "viewerStyle", label: "Style", type: "select", options: [
                { value: "native", label: "Native" },
                { value: "topright", label: "Pin Top Right" },
                { value: "topleft", label: "Pin Top Left" }
              ]
            }
          ]
        },
        { key: "trackHoverPlayback", label: "Track and Restore Hover Media Playback", title: "Remembers hover video/audio position" },
        { key: "enablePNGstop", label: "Prevent animated PNG images from playing (slow)" },
        { key: "gallery", label: "Better Gallery", title: "Replaces the site's gallery with a grid of all media" },
        { head: "Thread" },
        {
          key: "enableScrollSave", label: "Save Scroll Position", sub: [
            { key: "showUnreadLine", label: "Show Unread Line" }
          ]
        },
        { key: "rememberCommentDraft", label: "Remember Comment Draft", title: "Saves unsubmitted Quick Reply text and restores it, until the post is sent (drafts expire after 24 hours)" },
        { key: "quoteThreading", label: "Quote Threading", title: "Nests replies under the post they quote instead of showing them in order" },
        { key: "hashNavigation", label: "Hash Navigation", title: "Adds a # link next to quotes and backlinks to jump straight to the post" },
        { head: "Thread Watcher" },
        { key: "noPinInCatalog", label: "Don't pin in Catalog" },
        { key: "smallFont", label: "Smaller font" },
        { key: "expandTW", label: "Auto Expand Thread Watcher" },
        { head: "Catalog" },
        { key: "catalogImageHover", label: "Catalog Image Hover" },
        { key: "catalogNewTab", label: "Always Open Threads in New Tab" },
        { key: "lastFifty", label: "Show Last 50 Posts button" },
        { key: "catalogFiltering", label: "Catalog Thread Hiding", title: "Hides threads matching your word/board filters" }
      ]
    },
    {
      page: "ss-styling", title: "Styling", options: [
        { head: "Mascots" },
        {
          key: "enableMascots", label: "Enable Mascots", title: "Show a random mascot image (one URL per line)", sub: [
            { key: "mascotOpacity", label: "Mascot Opacity (0-100%)", type: "number", min: 0, max: 100 },
            { key: "mascotUrls", label: "Mascot Image URLs (one per line)", type: "textarea", rows: 4, placeholder: "One URL per line, e.g.\n/.media/mascot1.png" }
          ]
        },
        { head: "Site Styling" },
        { key: "roundedCorners", label: "Rounded Corners" },
        {
          key: "styleScrollbars", label: "Style scrollbars", sub: [
            { key: "thinScrollbars", label: "Thin scrollbars" }
          ]
        },
        { key: "hideAnnouncement", label: "Hide Announcement (unhides if changed)" },
        { key: "hidePanelMessage", label: "Hide Panel Message" },
        { key: "hideFooter", label: "Hide Footer" },
        {
          key: "hidePostingForm", label: "Hide Posting Form", sub: [
            { key: "showCatalogForm", label: "Don't Hide in Catalog" }
          ]
        },
        { key: "hideBanner", label: "Hide Board Banners" },
        { key: "hideNoCookieLink", label: "Hide No Cookie? Link" },
        { key: "hideJannyTools", label: "Hide Janitor Forms" },
        { key: "hlCurrentBoard", label: "Highlight Current Board" },
        { key: "showReplyHeader", label: "Reply Header" },
        {
          key: "customFavicon", label: "Custom Favicon", title: "Replace the site favicon with an 8chanSS style", sub: [
            {
              key: "faviconStyle", label: "Favicon Style", type: "select", options: [
                { value: "default", label: "Default" },
                { value: "pixel", label: "Pixel" },
                { value: "pixel_alt", label: "Pixel Alt" },
                { value: "eight", label: "Eight" },
                { value: "eight_dark", label: "Eight Dark" }
              ]
            }
          ]
        },
        { head: "Thread Styling" },
        {
          key: "enableSidebar", label: "Enable Sidebar", sub: [
            { key: "leftSidebar", label: "Sidebar on Left" }
          ]
        },
        { key: "enableFitReplies", label: "Fit Replies" },
        { key: "highlightOnYou", label: "Style (You) posts" },
        { key: "opBackground", label: "OP background" },
        { key: "enableStickyQR", label: "Sticky Quick Reply" },
        { key: "fadeQuickReply", label: "Fade Quick Reply" },
        { key: "threadHideCloseBtn", label: "Hide Inline Close Button" },
        { key: "backlinkIcons", label: "Backlink Icons" },
        { head: "Misc" },
        { key: "applyFixes", label: "Apply 8chanSS fixes", title: "Applies small fixes that must run before the page renders" },
        { key: "moveUploads", label: "Move file uploads below OP title" }
      ]
    },
    {
      page: "ss-misc", title: "Misc", options: [
        { head: "Notifications" },
        { key: "updateNotif", label: "Enable toast notifications" },
        { key: "beepOnYou", label: "Beep on (You)" },
        { head: "IDs" },
        {
          key: "highlightNewIds", label: "Highlight New IDs", sub: [
            {
              key: "idHlStyle", label: "Highlight Style", type: "select", options: [
                { value: "moetext", label: "Moe" },
                { value: "glow", label: "Glow" },
                { value: "dotted", label: "Border" }
              ]
            }
          ]
        },
        { key: "alwaysShowIdCount", label: "Always show ID post count" },
        { head: "Site" },
        {
          key: "truncFilenames", label: "Truncate filenames", sub: [
            { key: "customTrunc", label: "Max filename length (5-50)", type: "number", min: 5, max: 50 }
          ]
        },
        { head: "Linkification" },
        {
          key: "showLinkIcons", label: "Show Icons and Titles", sub: [
            { key: "iconYoutube", label: "Youtube" },
            { key: "iconTwitch", label: "Twitch" },
            { key: "iconX", label: "X.com" },
            { key: "iconBsky", label: "Bluesky" },
            { key: "iconRentry", label: "Rentry" },
            { key: "iconCatbox", label: "Catbox" },
            { key: "iconPastebin", label: "Pastebin" }
          ]
        },
        {
          key: "linkThumbnails", label: "Show Thumbnails on Hover", sub: [
            { key: "thumbYoutube", label: "Youtube" },
            { key: "thumbTwitch", label: "Twitch" }
          ]
        },
        {
          key: "linkEmbeds", label: "Enable Embedding", sub: [
            { key: "embedX", label: "X.com" },
            { key: "embedBsky", label: "Bluesky" },
            { key: "embedRentry", label: "Rentry" },
            { key: "embedPastebin", label: "Pastebin" }
          ]
        },
        { head: "Sauce Links" },
        {
          key: "sauceLinks", label: "Sauce Links", sub: [
            { key: "sauceIqdb", label: "IQDB" },
            { key: "sauceSaucenao", label: "Saucenao" },
            { key: "saucePixiv", label: "Pixiv (only added if filename matches Pixiv ID)" }
          ]
        }
      ]
    },
    {
      page: "ss-storage", title: "Storage", options: [
        { key: "autoSaveDaily", label: "Save every day", title: "Saves your posts, watched threads and favorite boards once every 24 hours" },
        { key: "saveMyPosts", label: "Save my posts", type: "button" },
        { key: "saveWatchedThreads", label: "Save Current Watched Threads", type: "button" },
        { key: "saveFavoriteBoards", label: "Save Current Favorite Boards", type: "button" },
        { key: "restoreMyPosts", label: "Restore my posts", type: "button" },
        { key: "restoreWatchedThreads", label: "Restore Watched Threads", type: "button" },
        { key: "restoreFavoriteBoards", label: "Restore Favorite Boards", type: "button" }
      ]
    },
    { page: "ss-shortcuts", title: "Shortcuts", options: [
      { key: "enableShortcuts", label: "Enable Keyboard Shortcuts" }
    ] }
  ];

  var ssSettings = Object.assign({}, SS_DEFAULTS);

  function convertStoredValue(key, raw) {
    var def = SS_DEFAULTS[key];
    if (typeof def === "boolean") return raw === true || raw === "true";
    if (typeof def === "number") {
      var n = parseInt(raw, 10);
      return isNaN(n) ? def : n;
    }
    if (typeof def === "string") return String(raw);
    if (def && typeof def === "object") {
      if (raw && typeof raw === "object") return raw;
      try {
        var obj = JSON.parse(raw);
        if (obj && typeof obj === "object") return obj;
      } catch (e) { }
    }
    return def;
  }

  function loadSettings() {
    if (typeof GM === "undefined" || !GM.getValue || !GM.listValues) return Promise.resolve();
    return GM.listValues().then(function (names) {
      var present = {};
      (names || []).forEach(function (name) { present[name] = true; });
      var pending = [];
      Object.keys(SS_DEFAULTS).forEach(function (key) {
        var full = SS_STORE_PREFIX + storageKeyFor(key);
        if (!present[full]) return;
        pending.push(GM.getValue(full, null).then(function (raw) {
          if (raw !== null && raw !== undefined) ssSettings[key] = convertStoredValue(key, raw);
        }).catch(function () { }));
      });
      return Promise.all(pending);
    }).catch(function (err) {
      console.error("[8chanSS] loadSettings failed:", err);
    });
  }

  function saveSetting(key) {
    if (key === "applyFixes") {
      try { localStorage.setItem("8chanSS_fixes", ssSettings.applyFixes ? "1" : "0"); } catch (e) { }
    }
    if (typeof GM === "undefined" || !GM.setValue) return Promise.resolve();
    var full = SS_STORE_PREFIX + storageKeyFor(key);
    var value = ssSettings[key];
    return GM.setValue(full, (value && typeof value === "object") ? value : String(value)).catch(function (err) {
      console.error("[8chanSS] saveSetting failed:", key, err);
    });
  }

  function deleteSetting(key) {
    if (typeof GM === "undefined" || !GM.deleteValue) return Promise.resolve();
    return GM.deleteValue(SS_STORE_PREFIX + storageKeyFor(key)).catch(function (err) {
      console.error("[8chanSS] deleteSetting failed:", key, err);
    });
  }

  (function injectShimAsap() {
    function doInject() {
      if (document.getElementById("ssShim")) return;
      if (!document.head) { setTimeout(doInject, 1); return; }
      var fixesOn = true;
      try { fixesOn = localStorage.getItem("8chanSS_fixes") !== "0"; } catch (e) { }
      if (!fixesOn) return;
      var style = document.createElement("style");
      style.id = "ssShim";
      style.textContent = "#dynamicAnnouncement,#panelMessage,#postingForm{visibility:hidden}:not(.is-catalog) body{margin:0}.innerUtility.top{margin-top:2em;background:0 0!important;color:var(--link-color)!important}.innerUtility.top a{color:var(--link-color)!important}.postCell::before{content:initial!important}";
      document.head.appendChild(style);
    }
    doInject();
  })();

  function injectPageCss() {
    if (document.getElementById("ssStyle")) return;
    var css = "#dynamicAnnouncement,#panelMessage,#postingForm{visibility:visible}:root.disable-banner #bannerImage,:root.hide-announcement #dynamicAnnouncement,:root.hide-close-btn .inlineQuote>.innerPost>.postInfo.title>a:first-child,:root.hide-jannytools #actionsForm,:root.hide-jannytools #boardContentLinks,:root.hide-nocookie #captchaBody>table:nth-child(2)>tbody:first-child>tr:nth-child(2),:root.hide-panelmessage #panelMessage,:root.hide-posting-form #postingForm{display:none}:root.ss-hide-footer #footer{visibility:hidden}:root.ss-bottom-header nav.navHeader{top:auto!important;bottom:0!important;box-shadow:0 -1px 2px rgba(0,0,0,.15)}:root.ss-autohide-header #dynamicHeaderThread{transition:transform .3s ease}:root.ss-autohide-header #dynamicHeaderThread.nav-hidden{transform:translateY(-100%)}:root.ss-autohide-header.ss-bottom-header #dynamicHeaderThread.nav-hidden{transform:translateY(100%)}.ss-note{font-size:12px;font-style:italic;opacity:.7;margin:0 0 .5em}.ss-keys{width:100%;margin-top:.5em;border:1px solid var(--border-color,#888);border-radius:4px;border-collapse:separate;border-spacing:0;overflow:hidden;font-size:13px}.ss-keys td{padding:6px 8px;border-bottom:1px solid var(--border-color,#888)}.ss-keys tr:last-child td{border-bottom:none}.ss-keys td:first-child{white-space:nowrap;width:1%}.ss-keys tr:hover td{background:var(--contrast-color,transparent)}.ss-keys kbd{background:#f7f7f7;color:#000;border:1px solid #555;border-radius:3px;padding:1px 5px;font-size:12px;font-family:monospace;white-space:nowrap}#ss-toasts{position:fixed;top:40px;right:12px;z-index:99999;display:flex;flex-direction:column;gap:8px;max-width:min(360px,90vw)}.ss-toast{color:var(--text-color);background:var(--menu-color);border:1px solid var(--border-color);border-left-width:5px;padding:6px 12px;border-radius:4px;font-size:13px;box-shadow:0 3px 10px rgba(0,0,0,.24);opacity:1;transition:opacity .3s;pointer-events:auto;cursor:pointer}.ss-toast-hide{opacity:0}:root.ss-rounded .ss-toast{border-radius:5px}.ss-toast-black{border-left-color:#222}.ss-toast-orange{border-left-color:#cc7a00}.ss-toast-green{border-left-color:#393}.ss-toast-blue{border-left-color:#1976d2}.ss-toast-red{border-left-color:#c62828}.ss-toast a{text-decoration:underline}.ss-foot{font-size:11px;opacity:.6;position:absolute;bottom:5px;padding-left:5px}#ssScrollArrows{position:fixed;right:3em;bottom:8em;z-index:300;display:flex;flex-direction:column;gap:8px}:root.ss-bottom-header #ssScrollArrows{bottom:40px}:root.ss-sidebar #ssScrollArrows{right:calc(19rem + 40px)}#ssScrollArrows button{width:34px;height:34px;padding:0;display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:700;line-height:1;cursor:pointer;opacity:.8;background:var(--contrast-color,#222);color:var(--text-color,#fff);border:1px solid var(--border-color,#888);box-shadow:0 2px 8px rgba(0,0,0,.3);transition:opacity .15s ease,transform .15s ease}#ssScrollArrows button:hover{opacity:1;transform:translateY(-1px)}#ssScrollArrows button:active{transform:translateY(0)}:root.ss-rounded #ssScrollArrows button,:root.ss-rounded .floatingMenu,:root.ss-rounded .imgLink img,:root.ss-rounded .innerPost,:root.ss-rounded .ss-keys,:root.ss-rounded .ss-storage-btn{border-radius:5px}:root.ss-rounded.ss-replyhead .postInfo.title{border-radius:5px 5px 0 0}:root.ss-scrollbars{scrollbar-color:var(--link-color) var(--contrast-color)}:root.ss-thin-scrollbars,:root.ss-thin-scrollbars *{scrollbar-width:thin}#settingsMenu .settingsSectionTitle{font-size:130%!important}.ss-subhead{display:flex;align-items:center;gap:.6em;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;opacity:.85;margin:1.2em 0 .5em;white-space:nowrap}.ss-subhead::after,.ss-subhead::before{content:\"\";height:1px;background:currentColor;opacity:.35}.ss-subhead::before{flex:0 0 1.2em}.ss-subhead::after{flex:1}.panelContents>.ss-subhead:first-of-type{margin-top:.2em}.ss-sub{margin-left:1.2em}#settingsMenu .ss-sub label{display:flex;align-items:flex-end;padding-top:.2em;padding-bottom:.2em;line-height:1}#settingsMenu .ss-sub label.settingsRow--allowWrap{flex-wrap:wrap}#settingsMenu label.ss-textarea-row{display:block}#settingsMenu label.ss-textarea-row textarea{display:block;width:100%;margin-top:4px;box-sizing:border-box}.ss-button-grid{position:relative;display:grid;grid-template-columns:1fr 1fr;grid-template-rows:repeat(3,auto);grid-auto-flow:column;gap:8px;margin:.5em 0}.ss-button-grid::before{content:\"\";position:absolute;top:0;bottom:0;left:50%;width:1px;background:var(--border-color,#888);opacity:.6}.ss-button-grid button{width:100%;margin:0;padding:2px}.ss-sub[hidden]{display:none}.ss-filterbox{margin:8px 0;max-height:300px;overflow-y:auto;border:1px solid var(--border-color,#ccc);border-radius:6px;padding:8px;font-size:13px}.ss-filterbox[hidden]{display:none}.ss-filterhelp{font-size:10px;margin-bottom:5px;opacity:.8}.ss-filterrow{display:flex;align-items:center;gap:6px;margin-bottom:4px}.ss-filterrow input[type=text]{padding:4px 8px;border:1px solid var(--border-color,#ccc);border-radius:4px;background:var(--background-color,transparent);color:var(--text-color,inherit);min-width:0}.ss-filterword{flex:1}.ss-filterboards{flex:2}.ss-filterrm{background:0 0;border:none;color:#c00;cursor:pointer;font-size:14px;padding:0 2px}.ss-filteradd{width:100%;margin-top:4px;cursor:pointer}:root.is-catalog.show-catalog-form #postingForm{display:block!important}:root.op-background .opCell>.innerOP{padding-top:.25em;width:100%;background:var(--contrast-color);border:1px solid var(--horizon-sep-color);border-top-width:0;border-left-width:0}:root.hl-currentBoard .navBoardsLink--current{font-weight:800;color:var(--link-color)!important;text-transform:uppercase}:root.hl-currentBoard .navBoardsLink--current:hover{color:var(--link-color-hover)!important}:root.highlight-yous .innerOP:has(> .opHead.title > .youName),:root.highlight-yous .innerPost:has(> .postInfo.title > .youName),:root.highlight-yous .yourPost{border-left:dashed #68b723 2px!important}:root.highlight-yous .innerPost:has(> .divMessage > .you),:root.highlight-yous .innerPost:has(> .divMessage > :not(div) > .you),:root.highlight-yous .innerPost:has(> .divMessage > :not(div) > :not(div) > .you),:root.highlight-yous .quotesYou{border-left:solid var(--subject-color) 2px!important}:root.ss-replyhead .postInfo.title{margin:-3px;padding:2px;background-color:var(--marked-color);box-shadow:inset var(--horizon-sep-color) 0 -1px 0}:root.backlink-icon .panelBackLinks>a{display:inline-block;width:12px;height:12px;margin:0 2px;text-decoration:none;font-size:0;vertical-align:middle;color:var(--link-color)}:root.backlink-icon .panelBackLinks>a::before{content:'▶';font-size:12px;display:inline-block;line-height:.6;color:var(--link-color);transform:rotate(0);transition:transform .1s ease-in-out,opacity .1s ease-in-out;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI Symbol',Roboto,Ubuntu,Cantarell,sans-serif}:root.backlink-icon .panelBackLinks>a.postLink--inlined::before{transform:rotate(90deg);opacity:.7;color:var(--link-hover-color);line-height:.9}.id-glow{box-shadow:0 0 12px var(--subject-color)}.id-dotted{border:2px dotted #fff}:root.alwaysShowIdCount .labelId::after{content:var(--user-id-count);padding:2px 0 2px 4px;border-left:1px solid #ececec;margin-left:.4em}.apng-canvas-snapshot{display:block;position:absolute;top:0;left:0;z-index:1}.apng-overlay{position:absolute;top:0;left:0;z-index:2;cursor:pointer;user-select:none}:root.fit-replies :not(.hidden).innerPost{margin-left:10px;display:flow-root}:root.fit-replies :not(.hidden,.inlineQuote).innerPost{margin-left:0}:root.ss-sidebar #mainPanel{margin-right:19rem;margin-left:0}:root.ss-leftsidebar #mainPanel{margin-left:19rem;margin-right:0}#watchedMenu{padding:5px!important;box-shadow:-3px 3px 2px 0 rgba(0,0,0,.19)}:root.ss-small-font #watchedMenu{font-size:smaller}#watchedMenu,#watchedMenu .floatingContainer{max-width:100vw}#watchedMenu .floatingContainer{scrollbar-width:thin;scrollbar-color:var(--link-color) var(--contrast-color)}:root.auto-expand-tw #watchedMenu .floatingContainer{height:fit-content!important;padding-bottom:10px;resize:horizontal}:root.ss-nopin-catalog.is-catalog #watchedMenu{display:none!important}.watchedCellLabel a::before{content:attr(data-board);color:#aaa;margin-right:4px;font-weight:700}.markAllRead::before{content:\"\\e065\"}div.modalPanel{z-index:500}#dynamicHeaderThread{z-index:400}#quick-reply,#watchedMenu,.floatingList{z-index:401!important}.mediaViewer{z-index:402!important}#settingsMenu.floatingMenu{z-index:403!important}.quoteTooltip{z-index:404!important}#sideCatalog{z-index:300;position:absolute;background:var(--background-gradient)}.mediaViewer.topleft,.mediaViewer.topright{top:26px!important;max-height:97%!important;max-width:max-content!important}.mediaViewer.topright{right:0!important;left:auto!important}.mediaViewer.topleft{left:0!important;right:auto!important}.mediaViewer.topleft::after,.mediaViewer.topright::after{pointer-events:none}.ss-link-thumb{position:fixed;z-index:9999;pointer-events:none;background:#222;border:1px solid #444;padding:2px;border-radius:4px;box-shadow:0 2px 8px rgba(0,0,0,.4);transition:opacity .1s;max-width:280px;max-height:200px;color:#fff}.ss-link-thumb img{display:block;border-radius:3px}a.originalNameLink[href$=\".m4a\"],a.originalNameLink[href$=\".mp3\"],a.originalNameLink[href$=\".ogg\"],a.originalNameLink[href$=\".wav\"],a[data-filemime^=\"audio/\"]{position:relative}#hover-preview-media.brokenImage{opacity:0!important}.audio-preview-indicator{display:none;position:absolute;background:rgba(0,0,0,.7);color:#fff;padding:5px;font-size:12px;border-radius:3px;z-index:300;left:0;top:0;white-space:nowrap;pointer-events:none}a.originalNameLink:hover .audio-preview-indicator,a[data-filemime^=\"audio/\"]:hover .audio-preview-indicator{display:block}:root.ss-blur-spoilers .quoteTooltip img[src*=\"audioGenericThumb.png\"],:root.ss-blur-spoilers .quoteTooltip img[src*=\"custom.spoiler\"],:root.ss-blur-spoilers .quoteTooltip img[src*=\"spoiler.png\"]{filter:blur(5px)!important;transition:filter .3s ease}a.imgLink img.ss-spoiler-blurred{filter:blur(5px);transition:filter .3s ease}a.imgLink img.ss-spoiler-blurred:hover{filter:none}a.imgLink img.ss-spoiler-border{border:1px dotted var(--border-color)}.chSS-mascot{position:fixed;height:auto;object-fit:contain;pointer-events:none;z-index:-1;user-select:none;-webkit-user-drag:none}.ss-gallery{position:fixed;inset:0;z-index:100000;display:flex;flex-direction:column;background:rgba(0,0,0,.88);color:#fff}.ss-gallery-header{display:flex;align-items:center;gap:8px;padding:10px 14px;font-size:14px;border-bottom:1px solid rgba(255,255,255,.15)}.ss-gallery-title{flex:1;font-weight:700}.ss-gallery .ss-gallery-btn,.ss-gallery .ss-gallery-nav{background:rgba(255,255,255,.1);color:#fff;border:1px solid rgba(255,255,255,.25);border-radius:4px;cursor:pointer}.ss-gallery .ss-gallery-btn:hover,.ss-gallery .ss-gallery-nav:hover:not(:disabled){background:rgba(255,255,255,.22)}.ss-gallery-btn{padding:6px 12px;font-size:14px}.ss-gallery-close{font-weight:700}.ss-gallery-grid{flex:1;display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));grid-auto-rows:150px;gap:8px;padding:12px;overflow-y:auto}.ss-gallery-btn[hidden],.ss-gallery-caption[hidden],.ss-gallery-grid[hidden],.ss-gallery-viewer[hidden]{display:none}.ss-gallery-tile{position:relative;display:block;box-sizing:border-box;width:100%;height:100%;padding:0;margin:0;overflow:hidden;cursor:pointer;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.15);border-radius:4px}.ss-gallery-tile img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transition:transform .15s ease}.ss-gallery-tile:hover img{transform:scale(1.06)}.ss-gallery-badge{position:absolute;right:6px;bottom:6px;padding:1px 6px;font-size:13px;background:rgba(0,0,0,.65);border-radius:3px}.ss-gallery-viewer{position:relative;flex:1;display:flex;align-items:center;justify-content:center;gap:10px;padding:12px;min-height:0}.ss-gallery-media{flex:1;display:flex;align-items:center;justify-content:center;min-width:0;min-height:0;height:100%}.ss-gallery-media img,.ss-gallery-media video{max-width:100%;max-height:100%}.ss-gallery-media audio{width:min(560px,90%)}.ss-gallery-nav{padding:6px 12px;font-size:28px;line-height:1}.ss-gallery-nav:disabled{opacity:.3;cursor:default}.ss-gallery-caption{max-width:45vw;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12px;opacity:.8}";
    if (pageType.isCatalog) {
      css += "#postingForm{margin:2em auto}#divTools>div:nth-child(5),#divTools>div:nth-child(6){float:left!important;margin-top:9px!important;margin-right:8px}.catalogDiv:not(.showHiddenCatalogCells) .catalogCell.ss-hidden-thread{display:none}.catalogCell.catalogCell--hiding,.catalogCell.ss-hidden-thread{opacity:.4}";
    } else {
      css += "#quick-reply{box-shadow:-3px 3px 2px 0 rgba(0,0,0,.19)}#qrbody{min-width:300px}:root.sticky-qr #quick-reply.floatingMenu:not(.hidden){display:block;top:auto!important;bottom:0}:root.sticky-qr.ss-sidebar #quick-reply.floatingMenu{left:auto!important;right:0!important}:root.sticky-qr.ss-leftsidebar #quick-reply.floatingMenu{left:0!important;right:auto!important}:root.sticky-qr #qrbody{resize:vertical;max-height:50vh;height:130px}#selectedDivQr,:root.sticky-qr #selectedDiv{display:inline-flex;overflow:scroll hidden;max-width:300px}:root.bottom-header #quick-reply.floatingMenu{bottom:28px!important}:root.fade-qr #quick-reply{padding:0;opacity:.5;transition:opacity .3s ease}:root.fade-qr #quick-reply:focus-within,:root.fade-qr #quick-reply:hover{opacity:1}:root.ss-sidebar #bannerImage{width:19rem;right:0;position:fixed;top:26px}:root.ss-sidebar.bottom-header #bannerImage{top:0!important}:root.ss-leftsidebar #bannerImage{width:19rem;left:0;position:fixed;top:26px}:root.ss-leftsidebar.bottom-header #bannerImage{top:0!important}.target-highlight{background:var(--marked-color);border-color:var(--marked-border-color);color:var(--marked-text-color)}#unread-line{height:2px;border:none!important;pointer-events:none!important;background-image:linear-gradient(to left,rgba(185,185,185,.2),var(--text-color),rgba(185,185,185,.2));margin:-3px auto -3px auto;width:60%}.threadedReplies{border-left:1px solid var(--border-color,#888);padding-left:15px}.ss-hash-link{color:var(--link-color);text-decoration:none;cursor:pointer;margin-left:2px;opacity:.6}.ss-hash-link:hover{opacity:1}";
    }
    var style = document.createElement("style");
    style.id = "ssStyle";
    style.textContent = css;
    document.head.appendChild(style);
  }

  var catalogObserver = null;
  var debouncedCatalogApply = null;

  function isBoardIndexHref(href) {
    if (!href || href.charAt(0) !== "/" || href.charAt(1) === "/") return false;
    if (href.indexOf("/catalog.html") !== -1 || href.indexOf("/res/") !== -1) return false;
    return /^\/[^/?#]+\/?(?:[?#]|$)/.test(href);
  }

  function rewriteHeaderLinks() {
    var newTab = !!ssSettings.catalogLinksNewTab;
    var lists = [
      document.getElementById("navBoardsTop"),
      document.getElementById("navBoardsFavorite")
    ];
    for (var i = 0; i < lists.length; i++) {
      var list = lists[i];
      if (!list) continue;
      var links = list.getElementsByTagName("a");
      for (var j = 0; j < links.length; j++) {
        var link = links[j];
        var raw = link.getAttribute("href");
        if (!raw || !isBoardIndexHref(raw)) continue;
        if (!link.dataset.ssOrigHref) link.dataset.ssOrigHref = raw;
        var base = raw.split(/[?#]/)[0].replace(/\/$/, "");
        var suffix = raw.match(/[?#].*$/) || [""];
        var next = base + "/catalog.html" + suffix[0];
        if (link.getAttribute("href") !== next) link.setAttribute("href", next);
        if (newTab) {
          link.target = "_blank";
          link.rel = "noopener noreferrer";
        } else {
          link.removeAttribute("target");
          link.removeAttribute("rel");
        }
        link.dataset.ssCatalog = "1";
      }
    }
  }

  function restoreHeaderLinks() {
    var done = document.querySelectorAll('a[data-ss-catalog="1"]');
    for (var i = 0; i < done.length; i++) {
      var link = done[i];
      if (link.dataset.ssOrigHref) link.setAttribute("href", link.dataset.ssOrigHref);
      link.removeAttribute("target");
      link.removeAttribute("rel");
      delete link.dataset.ssCatalog;
    }
  }

  var FAVICON_STYLES = ["default", "eight", "eight_dark", "pixel", "pixel_alt"];
  var FAVICON_DATA = {
    default: "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAq1BMVEUAAACKtMV2lqSE1PWZ1Oyr1eaqzNp7udPO7vuc3ffh8vmG0/OB0fKv3e+N0e3B4e693+56x+bb6e6YzeOgydl7wd3L3OOwytS35fjZ8fuQ2feB1Pbo9vyy5Pjm9Pmp4PW85fbW7feO1/S55Pbk8/mq3/TY7fbn9Pnf7/bQ6vWS1fDa7fWH0vCb0+rY6/Pc7POBzezA4/GNz+vJ4+662ebH1958wNzD6vqm4Ph4HvJJAAAAN3RSTlMADwXliF4dGP7949HLn5mUhWllVCglJBf6+fn5+Pjo4N3a2NfV1MzIxb28rayinJKOioB7UzEt0Y3/cQAAAIBJREFUGNOVjsUOhVAMRG97BXcePHd3Q/7/y0hhQWDHrDpJT86wIQHo1t/xHGLb8aNvzHnYFC2KFHh+mu1PNTW6GuVB0vlaJvTsTl2xWjgxw5upCOB3ZLEzXvve5IlE8DdJ5K7QL0nts61cEw9Q8p82kmDGt4ZgbTCwrS/0Rw9IBRlvB34XFuslAAAAAElFTkSuQmCC",
    eight: "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAA6lBMVEUAAAAxV2oFSGADP1Y1Wm0zWW1EY3Q1VmgpU2g2VWYkUGUyUWIiTWEAKUcFSmErU2c5W24zVWghUWckTmIKSmEZTmUxUmMwUWP1+fxcc4HL6f7j9f/g7PWi1fWWprFJZXUeSl7Z7v6Myu7d4OOjt8SKrcOSrsFMa30/YnT////C5v/Q6PmHz/nt7/Gw1e+bzu+Dx+7A1+d7wOa+ztqtx9m5v8Sds8KDn7J0lqqJl6GEkZtJfZlRb4E5Zn1Ybnw0YHc3V2kPSWAAQVqY0vZpstqMu9mIutjO0tV5rcyru8dfm7xTmLthh51TfpcZngh2AAAAGHRSTlMA1cx8MBoH8fHm5s3Kv5qUiFhYUFDxmpptBtYcAAAAzUlEQVQY0zWOVRKDQBBEB4+77OLB4+5B43b/64QU8P76VddMQwpTyWGFbEAGXTjoaLxWqmlmSRnF9HUl7bSwKO49fO+vyURQsvCMiDZGY+Xfb1JlQ9iENcJDCMf3SqetOe8tgzDaIz0HTH43GfD8sLfcGCI6VKD7laamtYqNIIhygQHudj6qarDi54aMSRrA1jSfqKkWb5WpFhv/cBYzlyNUc7ClkgnF1+hh2x9pcmomou5cRtpUknYlFhKqznsxux7zNGTUi77LdZg0/QBWixhGoJiKLQAAAABJRU5ErkJggg==",
    eight_dark: "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAA2FBMVEUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAmKCkAAAADBAQAAAD1+fxMTEzM6v4vLy7i9f/E6P/v8PKMye2frbiFo7aNpLQ1P0b////Z7/+I0PrQ6Pmk1vab0/bi7PXe6fKfz+6w1O2Cxu15veS/1OPY2dq8ydOrwdKHtdK1traZqbSQmqF8kZ+QlJhshJSBhIZ7fH0+YnY9R09GREMOIiwfJivp+f/X7fyYzO3g4OBmrtTMzMt0pcKnsrpWjq1Ii6xUcIEyZX8ENUgYNkYAKD1NaNryAAAADnRSTlMAzPGY5tV8WFAwGge/iAmaI18AAADKSURBVBjTNY7XFoIwEEQ3CR1NQi/23rsC9q7//0fiAe7bzLlndyBHI5ibSIYCVdgMmTM1SZ51tGQplZOZOwpvt9YRv1SmKCukuXWjIubMMf++IpU8a0bLYuQwnt5Du4U/qI4opWs2xKAJq65tG/XDaOa12IYA2TY6fjA26tW91V4KGuBJ85XaY2PgzTlSAULX/YplGhhBSVL09Efc732wSH17IWUT0L12DcNnp7tTskJOzjX32GyskA4ZJHn0e5OtoEKBjOI3Jlqefl82Et7gg4sWAAAAAElFTkSuQmCC",
    pixel: "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAYFBMVEUAAAAAAAAAAABiam00WmxcZWlFTE4jQE1GTU8jQU4yV2g8QUIbNkE/WGRWYWY9WGUAAAAAAADg8vnY6fB5yOyA0fW95fi23fB+z/PQ4Od0weNoeYFWcoBSXmNFS00jP0wFxP2oAAAAEnRSTlMAIRHe3v3w8Nzc/ezs/u7u7EbfERAsAAAAcUlEQVQY05VP1wqAMAw0de82TYf7//9SOhBFELy3G1wuyQcYYw8OVVHBzYJUokzBW3VZg+MYFMhI0ThMMm9zlIXnVmmzbFy0iHtSkmq63mhtYuJQthO8X40OHSHR0DwO4UrsoAziDq84HudcO15P/MAJxpAGt0Xg7i0AAAAASUVORK5CYII=",
    pixel_alt: "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAY1BMVEUAAAAATHcAIGJii6I0gKFFepYjdJVGepYjdJUAXIFeiaEyf6A8dZIbcJJThZ8/f55WhZ89f58AY4YAQmoAJGjg8/p/0vbY6/R5zPC95vq23/TQ5O10xelolKxWj6tFepUjdJUOfB3LAAAAFXRSTlMAIBHe3vDw3Nwj/f3s7P7+7u7sRkaqQLDYAAAAeUlEQVQY05WP6Q6EMAiES73vYxdKu4e+/1NapTEaExP598FkZlA3o7U+MWRJBocTRAZNBNspT3NYGf2m8Bwz8dB/TFmXaBJVeCay7teO7xpxUilT1XTOWteKYiZqXmP3d1Y8RFHxd+glJXhwDKGHpHgOdfYelycezAI9gweHH0yPzQAAAABJRU5ErkJggg=="
  };
  var faviconApplied = null;
  var faviconOriginalHref = null;

  function setFavicon(style) {
    if (FAVICON_STYLES.indexOf(style) === -1) style = "default";
    if (faviconApplied === style) return;
    if (faviconOriginalHref === null) {
      var cur = document.querySelector('link[rel="icon"], link[rel="shortcut icon"]');
      faviconOriginalHref = (cur && cur.getAttribute("href")) || "";
    }
    var old = document.getElementById("ssFavicon");
    if (old) old.remove();
    var link = document.createElement("link");
    link.id = "ssFavicon";
    link.rel = "icon";
    link.type = "image/png";
    link.href = "data:image/png;base64," + FAVICON_DATA[style];
    document.head.appendChild(link);
    faviconApplied = style;
  }

  function resetFavicon() {
    var old = document.getElementById("ssFavicon");
    if (old) old.remove();
    faviconApplied = null;
    if (faviconOriginalHref) {
      var link = document.createElement("link");
      link.rel = "icon";
      link.type = "image/png";
      link.href = faviconOriginalHref;
      document.head.appendChild(link);
    }
  }

  var SUB_APPLY = {
    faviconStyle: "customFavicon",
    mascotOpacity: "enableMascots",
    mascotUrls: "enableMascots",
    showCatalogForm: "hidePostingForm",
    leftSidebar: "enableSidebar",
    arrowPageScroll: "scrollArrows",
    removeSpoilers: "blurSpoilers",
    viewerStyle: "enableMediaPlayer",
    catalogLinksNewTab: "catalogLinks",
    customTrunc: "truncFilenames",
    showUnreadLine: "enableScrollSave",
    thinScrollbars: "styleScrollbars",
    idHlStyle: "highlightNewIds",
    iconYoutube: "showLinkIcons",
    iconTwitch: "showLinkIcons",
    iconX: "showLinkIcons",
    iconBsky: "showLinkIcons",
    iconRentry: "showLinkIcons",
    iconCatbox: "showLinkIcons",
    iconPastebin: "showLinkIcons",
    thumbYoutube: "linkThumbnails",
    thumbTwitch: "linkThumbnails",
    embedX: "linkEmbeds",
    embedBsky: "linkEmbeds",
    embedRentry: "linkEmbeds",
    embedPastebin: "linkEmbeds",
    sauceIqdb: "sauceLinks",
    sauceSaucenao: "sauceLinks",
    saucePixiv: "sauceLinks"
  };

  function rootToggle(cls, on) {
    document.documentElement.classList.toggle(cls, !!on);
  }

  function pageWindow() {
    try {
      if (typeof unsafeWindow !== "undefined") {
        return unsafeWindow.wrappedJSObject || unsafeWindow;
      }
    } catch (e) { }
    return window;
  }

  function openQuickReply() {
    var qr;
    try {
      qr = pageWindow().qr;
    } catch (e) { }
    if (!qr || typeof qr.showQr !== "function") return false;
    try {
      qr.showQr();
    } catch (err) {
      console.error("[8chanSS] showQr failed:", err);
      return false;
    }
    requestAnimationFrame(function () {
      var panel = document.getElementById("quick-reply");
      if (panel && panel.contains(document.activeElement)) document.activeElement.blur();
    });
    return true;
  }

  var spoilerThreadsObserver = null;
  var spoilerTooltipObserver = null;
  var mediaViewerObserver = null;
  var mediaPlayerApplied = false;
  var hoverPlaybackTimes = {};

  function applyBlurOrRemoveSpoilers(img) {
    if (ssSettings.removeSpoilers) {
      img.classList.add("ss-spoiler-border");
    } else {
      img.classList.add("ss-spoiler-blurred");
    }
  }

  function processSpoilerImgLink(link) {
    if (link.dataset.blurSpoilerProcessed === "1") return;
    var img = link.querySelector("img");
    if (!img) return;
    if (
      /\/\.media\/[^\/]+?\.[a-zA-Z0-9]+$/.test(img.src) &&
      !/\/\.media\/t_[^\/]+?\.[a-zA-Z0-9]+$/.test(img.src)
    ) {
      link.dataset.blurSpoilerProcessed = "1";
      return;
    }
    var isCustomSpoiler = img.src.indexOf("/custom.spoiler") !== -1 ||
      img.src.indexOf("/*/custom.spoiler") !== -1 ||
      img.src.indexOf("/spoiler.png") !== -1;
    var isNotThumbnail = img.src.indexOf("/.media/t_") === -1;
    var hasFilenameExtension = !isCustomSpoiler && /\.[a-zA-Z0-9]+$/.test(img.src);
    if (isNotThumbnail || isCustomSpoiler) {
      var href = link.getAttribute("href");
      if (!href) {
        link.dataset.blurSpoilerProcessed = "1";
        return;
      }
      var match = href.match(/\/\.media\/([^\/]+)\.[a-zA-Z0-9]+$/);
      if (!match) {
        link.dataset.blurSpoilerProcessed = "1";
        return;
      }
      var fileMime = link.getAttribute("data-filemime") || "";
      var ext = getExtensionForMimeType(fileMime);
      var fileWidthAttr = link.getAttribute("data-filewidth");
      var fileHeightAttr = link.getAttribute("data-fileheight");
      var transformedSrc;
      if (
        (fileWidthAttr && Number(fileWidthAttr) <= 220) ||
        (fileHeightAttr && Number(fileHeightAttr) <= 220)
      ) {
        if (fileMime && fileMime.indexOf("video/") === 0) {
          link.dataset.blurSpoilerProcessed = "1";
          return;
        }
        transformedSrc = "/.media/" + match[1] + ext;
      } else if (!hasFilenameExtension && isCustomSpoiler) {
        transformedSrc = "/.media/t_" + match[1];
      } else {
        link.dataset.blurSpoilerProcessed = "1";
        return;
      }
      if (isCustomSpoiler && !fileWidthAttr && !fileHeightAttr) {
        var uploadCell = img.closest(".uploadCell");
        if (uploadCell) {
          var dimensionLabel = uploadCell.querySelector(".dimensionLabel");
          if (dimensionLabel) {
            var dimensions = dimensionLabel.textContent.trim().split(/x|×/);
            if (dimensions.length === 2) {
              var parsedWidth = parseInt(dimensions[0].trim(), 10);
              var parsedHeight = parseInt(dimensions[1].trim(), 10);
              if (parsedWidth <= 220 || parsedHeight <= 220) {
                if (!img.dataset.ssOrigSrc) img.dataset.ssOrigSrc = img.getAttribute("src") || "";
                img.src = href + "#spoiler";
                link.dataset.blurSpoilerProcessed = "1";
                applyBlurOrRemoveSpoilers(img);
                return;
              }
            }
          }
        }
      }
      if (!img.dataset.ssOrigSrc) img.dataset.ssOrigSrc = img.getAttribute("src") || "";
      var initialWidth = img.offsetWidth;
      var initialHeight = img.offsetHeight;
      img.style.width = initialWidth + "px";
      img.style.height = initialHeight + "px";
      img.src = transformedSrc + "#spoiler";
      img.addEventListener("load", function () {
        if (!img.dataset.ssOrigSrc) return;
        img.style.width = img.naturalWidth + "px";
        img.style.height = img.naturalHeight + "px";
      }, { once: true });
      applyBlurOrRemoveSpoilers(img);
      link.dataset.blurSpoilerProcessed = "1";
      return;
    }
    link.dataset.blurSpoilerProcessed = "1";
  }

  function processAllSpoilerLinks() {
    var links = document.querySelectorAll("a.imgLink");
    for (var i = 0; i < links.length; i++) processSpoilerImgLink(links[i]);
  }

  function resetSpoilerLinks() {
    var links = document.querySelectorAll('a.imgLink[data-blur-spoiler-processed="1"]');
    for (var i = 0; i < links.length; i++) {
      delete links[i].dataset.blurSpoilerProcessed;
      var img = links[i].querySelector("img");
      if (!img) continue;
      if (img.dataset.ssOrigSrc) {
        img.src = img.dataset.ssOrigSrc;
        delete img.dataset.ssOrigSrc;
      }
      img.style.removeProperty("width");
      img.style.removeProperty("height");
      img.classList.remove("ss-spoiler-blurred", "ss-spoiler-border");
    }
  }

  function positionMediaViewer(viewer) {
    var style = ssSettings.viewerStyle;
    var viewers = viewer ? [viewer] : document.querySelectorAll(".mediaViewer");
    for (var i = 0; i < viewers.length; i++) {
      viewers[i].dataset.ssHidden = viewers[i].classList.contains("hidden") ? "1" : "0";
      viewers[i].classList.remove("topright", "topleft");
      if (style === "topright" || style === "topleft") viewers[i].classList.add(style);
    }
  }

  function onMediaViewerMouseDown(e) {
    if (e.button !== 0 || e.target.onclick !== null) return;
    var handle = e.target.closest(".mediaViewer > .handle");
    if (!handle || !handle.parentElement) return;
    var viewer = handle.parentElement;
    if (!viewer.classList.contains("topright") && !viewer.classList.contains("topleft")) return;
    var rect = viewer.getBoundingClientRect();
    viewer.classList.remove("topright", "topleft");
    viewer.style.left = rect.left + "px";
    viewer.style.top = rect.top + "px";
    viewer.style.right = "auto";
  }

  function saveHoverPlaybackTime(key, t) {
    if (!ssSettings.trackHoverPlayback || !key) return;
    var keys = Object.keys(hoverPlaybackTimes);
    if (!(key in hoverPlaybackTimes) && keys.length >= 200) delete hoverPlaybackTimes[keys[0]];
    hoverPlaybackTimes[key] = t;
  }

  function getHoverPlaybackTime(key) {
    if (!ssSettings.trackHoverPlayback || !key) return null;
    var t = hoverPlaybackTimes[key];
    return typeof t === "number" ? t : null;
  }
  var MEDIA_MAX_WIDTH = "90vw";
  var MEDIA_OPACITY_LOADING = "0";
  var MEDIA_OPACITY_LOADED = "1";
  var MEDIA_OFFSET = 50;
  var MEDIA_BOTTOM_MARGIN = 3;
  var AUDIO_INDICATOR_TEXT = "▶ Playing audio...";

  function getHoverVolume() {
    var raw = null;
    try { raw = localStorage.getItem("videovol"); } catch (e) { }
    var vol = parseFloat(raw);
    if (isNaN(vol)) vol = 0.5;
    return Math.max(0, Math.min(1, vol));
  }

  var MIME_TO_EXT = {
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
    "audio/flac": ".flac",
    "audio/opus": ".opus",
    "audio/x-m4a": ".m4a",
    "audio/x-wav": ".wav",
    "audio/wav": ".wav"
  };

  var EXT_TO_MIME = {
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
    flac: "audio/flac",
    opus: "audio/opus",
    mp3: "audio/mpeg",
    m4a: "audio/x-m4a",
    wav: "audio/x-wav"
  };

  function getExtensionForMimeType(mime) {
    return MIME_TO_EXT[String(mime).toLowerCase()] || "";
  }

  var hoverMimeCache = {};

  function thumbHash(src) {
    var m = /\/t_([a-f0-9]{40,})/i.exec(src || "");
    return m ? m[1].toLowerCase() : null;
  }

  function cacheThumbMime() {
    var thumbs = document.querySelectorAll('.catalogDiv a.linkThumb[data-filemime] img');
    for (var i = 0; i < thumbs.length; i++) {
      var mime = thumbs[i].closest("a.linkThumb, a.imgLink");
      mime = mime && mime.getAttribute("data-filemime");
      var hash = thumbHash(thumbs[i].getAttribute("src"));
      if (mime && hash) hoverMimeCache[hash] = mime;
    }
  }

  var floatingMedia = null;
  var cleanupFns = [];
  var currentAudioIndicator = null;
  var lastMouseEvent = null;
  var hoverWired = false;

  function sanitizeMediaUrl(url) {
    try {
      var parsed = new URL(url, window.location.origin);
      if ((parsed.protocol === "http:" || parsed.protocol === "https:") &&
        parsed.origin === window.location.origin) {
        return parsed.href;
      }
    } catch (e) { }
    return "";
  }
  function mediaSrcAttr(url) {
    try {
      var parsed = new URL(url, location.href);
      if (parsed.origin === location.origin) return parsed.pathname + parsed.search + parsed.hash;
    } catch (e) { }
    return url;
  }

  function hasExtension(str) {
    return /\.[a-z0-9]+$/i.test(str);
  }

  function isTThumb(str) {
    return /\/t_/.test(str);
  }

  function isDirectHash(str) {
    return /^\/\.media\/[a-f0-9]{40,}$/i.test(str) && !hasExtension(str);
  }

  function isGenericThumbSrc(src) {
    return /\/spoiler\.png$/i.test(src) ||
      /\/custom\.spoiler$/i.test(src) ||
      /\/audioGenericThumb\.png$/i.test(src);
  }

  function getFullMediaSrc(thumbNode, filemime) {
    var thumbnailSrc = thumbNode.getAttribute("src");
    if (thumbnailSrc) {
      thumbnailSrc = thumbnailSrc.split("#")[0];
    }
    var parentA = thumbNode.closest("a.linkThumb, a.imgLink");
    var href = parentA ? parentA.getAttribute("href") : "";
    var fileWidth = parentA ? parseInt(parentA.getAttribute("data-filewidth"), 10) : null;
    var fileHeight = parentA ? parseInt(parentA.getAttribute("data-fileheight"), 10) : null;
    if ((!fileWidth || !fileHeight) && thumbNode.naturalWidth && thumbNode.naturalHeight) {
      fileWidth = thumbNode.naturalWidth;
      fileHeight = thumbNode.naturalHeight;
    }
    var mime = String(filemime || "").toLowerCase();
    var smallImage = (fileWidth && fileWidth <= 220) || (fileHeight && fileHeight <= 220);
    if (!filemime) {
      if (
        thumbNode.closest(".catalogCell") ||
        /^\/\.media\/t?_[a-f0-9]{40,}$/i.test(String(thumbnailSrc || "").replace(/\\/g, ""))
      ) {
        return thumbnailSrc;
      }
      return null;
    }
    if (
      mime === "image/png" &&
      ((parentA && !isTThumb(href) && !hasExtension(href)) ||
        (smallImage && !isTThumb(thumbnailSrc) && !hasExtension(thumbnailSrc)))
    ) {
      return thumbnailSrc;
    }
    if (smallImage && hasExtension(thumbnailSrc)) {
      return thumbnailSrc;
    }
    if (isTThumb(thumbnailSrc)) {
      var base = thumbnailSrc.replace(/\/t_/, "/");
      base = base.replace(/\.(jpe?g|jxl|png|apng|gif|avif|webp|webm|mp4|m4v|ogg|flac|opus|mp3|m4a|wav)$/i, "");
      if (mime === "image/apng" || mime === "video/x-m4v") {
        return base;
      }
      var ext = getExtensionForMimeType(filemime);
      if (!ext) return null;
      return base + ext;
    }
    if (isDirectHash(thumbnailSrc)) {
      if (mime === "image/apng" || mime === "video/x-m4v") {
        return thumbnailSrc;
      }
      var ext2 = getExtensionForMimeType(filemime);
      return ext2 ? thumbnailSrc + ext2 : thumbnailSrc;
    }
    if (isGenericThumbSrc(thumbnailSrc)) {
      if (href) {
        return sanitizeMediaUrl(href);
      }
      return null;
    }
    return null;
  }

  function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
  }

  function positionFloatingMedia(event) {
    if (!floatingMedia) return;
    var vw = window.innerWidth;
    var vh = window.innerHeight;
    var mw = floatingMedia.offsetWidth || 0;
    var mh = floatingMedia.offsetHeight || 0;
    var docElement = document.documentElement;
    var scrollbarWidth = window.innerWidth - docElement.clientWidth;
    var bottomMarginPx = vh * (MEDIA_BOTTOM_MARGIN / 100);
    var x, y;
    var rightX = event.clientX + MEDIA_OFFSET;
    var leftX = event.clientX - MEDIA_OFFSET - mw;
    if (rightX + mw <= vw - scrollbarWidth) {
      x = rightX;
    } else if (leftX >= 0) {
      x = leftX;
    } else {
      x = clamp(rightX, 0, vw - mw - scrollbarWidth);
    }
    y = event.clientY;
    var maxY = vh - mh - bottomMarginPx;
    y = Math.max(0, Math.min(y, maxY));
    floatingMedia.style.left = x + "px";
    floatingMedia.style.top = y + "px";
  }

  function cleanupFloatingMedia() {
    for (var i = 0; i < cleanupFns.length; i++) {
      try { cleanupFns[i](); } catch (e) { }
    }
    cleanupFns = [];
    if (floatingMedia) {
      if (floatingMedia.tagName === "VIDEO" || floatingMedia.tagName === "AUDIO") {
        try {
          var key = floatingMedia.dataset && floatingMedia.dataset.previewSrc ? floatingMedia.dataset.previewSrc : (floatingMedia.src || "");
          var t = Number(floatingMedia.currentTime);
          if (key && !isNaN(t) && isFinite(t) && t > 0) saveHoverPlaybackTime(key, t);
        } catch (e) { }
        try { floatingMedia.pause(); } catch (e) { }
        try { floatingMedia.srcObject = null; } catch (e) { }
        try {
          if (floatingMedia.dataset && floatingMedia.dataset.blobUrl) {
            URL.revokeObjectURL(floatingMedia.dataset.blobUrl);
          }
        } catch (e) { }
      }
      floatingMedia.remove();
      floatingMedia = null;
    }
    if (currentAudioIndicator && currentAudioIndicator.parentNode) {
      currentAudioIndicator.parentNode.removeChild(currentAudioIndicator);
      currentAudioIndicator = null;
    }
  }

  var hoverMoveQueued = false;

  function mouseMoveHandler(ev) {
    lastMouseEvent = ev;
    if (hoverMoveQueued) return;
    hoverMoveQueued = true;
    requestAnimationFrame(function () {
      hoverMoveQueued = false;
      positionFloatingMedia(lastMouseEvent);
    });
  }

  function onThumbEnter(e) {
    cleanupFloatingMedia();
    lastMouseEvent = e;
    var thumb = e.currentTarget;
    var blobTried = false;
    if (thumb.closest(".catalogDiv")) {
      if (!ssSettings.catalogImageHover) return;
    } else if (!ssSettings.threadImageHover || (!pageType.isThread && !pageType.isIndex)) {
      return;
    }
    var filemime = null, fullSrc = null, isVideo = false, isAudio = false;
    if (thumb.tagName === "IMG") {
      var parentA = thumb.closest("a.linkThumb, a.imgLink");
      if (!parentA) return;
      var href = parentA.getAttribute("href");
      if (!href) return;
      var ext = href.split(".").pop().toLowerCase();
      filemime = parentA.getAttribute("data-filemime") || EXT_TO_MIME[ext];
      if (!filemime) {
        cacheThumbMime();
        filemime = hoverMimeCache[thumbHash(thumb.getAttribute("src")) || ""] || null;
      }
      fullSrc = getFullMediaSrc(thumb, filemime);
      if (
        /custom\.spoiler$|spoiler\.png$/i.test(thumb.getAttribute("src") || "") &&
        parentA && parentA.getAttribute("href")
      ) {
        fullSrc = parentA.getAttribute("href");
      }
      isVideo = filemime && filemime.indexOf("video/") === 0;
      isAudio = filemime && filemime.indexOf("audio/") === 0;
    }
    fullSrc = sanitizeMediaUrl(fullSrc);
    if (!fullSrc) return;
    var volume = getHoverVolume();
    if (isAudio) {
      var container = thumb.closest("a.linkThumb, a.imgLink");
      var audioSrc = fullSrc;
      if (
        thumb.tagName === "IMG" &&
        container &&
        /audioGenericThumb\.png$/.test(thumb.getAttribute("src") || "") &&
        container.getAttribute("href")
      ) {
        audioSrc = sanitizeMediaUrl(container.getAttribute("href")) || audioSrc;
      }
      if (container && !container.style.position) {
        container.style.position = "relative";
      }
      floatingMedia = document.createElement("audio");
      floatingMedia.dataset.previewSrc = audioSrc;
      floatingMedia.src = mediaSrcAttr(audioSrc);
      floatingMedia.controls = false;
      floatingMedia.style.display = "none";
      floatingMedia.volume = volume;
      floatingMedia.onerror = mediaBlobFallback;
      document.body.appendChild(floatingMedia);
      try {
        var savedAudio = getHoverPlaybackTime(audioSrc);
        if (typeof savedAudio === "number" && !isNaN(savedAudio) && isFinite(savedAudio) && savedAudio > 0) {
          var onLoadedMeta = function () {
            var onSeeked = function () {
              try { floatingMedia.play().catch(function () { }); } finally { floatingMedia.removeEventListener("seeked", onSeeked); }
            };
            floatingMedia.addEventListener("seeked", onSeeked);
            try {
              var dur = floatingMedia.duration;
              if (!isNaN(dur) && isFinite(dur) && dur > 0) {
                floatingMedia.currentTime = Math.min(savedAudio, Math.max(0, dur - 0.05));
              } else {
                floatingMedia.currentTime = savedAudio;
              }
            } catch (err) {
              floatingMedia.removeEventListener("seeked", onSeeked);
              floatingMedia.play().catch(function () { });
            }
          };
          floatingMedia.addEventListener("loadedmetadata", onLoadedMeta, { once: true });
        } else {
          floatingMedia.addEventListener("canplay", function () { floatingMedia.play().catch(function () { }); }, { once: true });
        }
      } catch (err) {
        floatingMedia.play().catch(function () { });
      }
      var indicator = document.createElement("div");
      indicator.classList.add("audio-preview-indicator");
      indicator.textContent = AUDIO_INDICATOR_TEXT;
      if (container) {
        container.appendChild(indicator);
      }
      currentAudioIndicator = indicator;
      thumb.addEventListener("mouseleave", cleanupFloatingMedia, { once: true });
      if (container) container.addEventListener("click", cleanupFloatingMedia, { once: true });
      window.addEventListener("scroll", cleanupFloatingMedia, { passive: true, once: true });
      cleanupFns.push(function () { thumb.removeEventListener("mouseleave", cleanupFloatingMedia); });
      if (container) cleanupFns.push(function () { container.removeEventListener("click", cleanupFloatingMedia); });
      cleanupFns.push(function () { window.removeEventListener("scroll", cleanupFloatingMedia); });
      return;
    }
    var videoSrc = fullSrc;
    if (
      isVideo &&
      thumb.tagName === "IMG" &&
      thumb.closest("a.linkThumb, a.imgLink") &&
      (!/\.(mp4|webm|m4v)$/i.test(fullSrc) || (/\/\.media\//.test(fullSrc) && !/\.(mp4|webm|m4v)$/i.test(fullSrc)))
    ) {
      var parentLink = thumb.closest("a.linkThumb, a.imgLink");
      if (parentLink && parentLink.getAttribute("href")) {
        videoSrc = parentLink.getAttribute("href");
      }
    }
    floatingMedia = isVideo ? document.createElement("video") : document.createElement("img");
    floatingMedia.dataset.previewSrc = isVideo ? videoSrc : fullSrc;
    floatingMedia.src = mediaSrcAttr(isVideo ? videoSrc : fullSrc);
    floatingMedia.id = "hover-preview-media";
    floatingMedia.style.position = "fixed";
    floatingMedia.style.zIndex = "9999";
    floatingMedia.style.pointerEvents = "none";
    floatingMedia.style.opacity = MEDIA_OPACITY_LOADING;
    floatingMedia.style.visibility = isVideo ? "hidden" : "visible";
    floatingMedia.style.left = "-9999px";
    floatingMedia.style.top = "-9999px";
    floatingMedia.style.maxWidth = MEDIA_MAX_WIDTH;
    var availableHeight = window.innerHeight * (1 - MEDIA_BOTTOM_MARGIN / 100);
    floatingMedia.style.maxHeight = availableHeight + "px";
    if (isVideo) {
      floatingMedia.autoplay = false;
      floatingMedia.loop = true;
      floatingMedia.muted = false;
      floatingMedia.playsInline = true;
      floatingMedia.volume = volume;
    }
    document.body.appendChild(floatingMedia);
    document.addEventListener("mousemove", mouseMoveHandler, { passive: true });
    thumb.addEventListener("mouseleave", cleanupFloatingMedia, { passive: true, once: true });
    cleanupFns.push(function () { document.removeEventListener("mousemove", mouseMoveHandler); });
    if (lastMouseEvent) {
      positionFloatingMedia(lastMouseEvent);
    }
    if (isVideo) {
      floatingMedia.preload = "auto";
      floatingMedia.onloadeddata = function () {
        try {
          var key = floatingMedia.dataset && floatingMedia.dataset.previewSrc ? floatingMedia.dataset.previewSrc : (floatingMedia.src || "");
          var saved = key ? getHoverPlaybackTime(key) : null;
          var revealAndPlay = function () {
            if (!floatingMedia) return;
            floatingMedia.style.visibility = "visible";
            floatingMedia.style.opacity = MEDIA_OPACITY_LOADED;
            if (lastMouseEvent) positionFloatingMedia(lastMouseEvent);
            try { floatingMedia.play().catch(function () { }); } catch (err) { }
          };
          if (typeof saved === "number" && !isNaN(saved) && isFinite(saved) && saved > 0) {
            var onSeeked = function () {
              try { revealAndPlay(); } finally { floatingMedia.removeEventListener("seeked", onSeeked); }
            };
            floatingMedia.addEventListener("seeked", onSeeked);
            try {
              var dur = floatingMedia.duration;
              if (!isNaN(dur) && isFinite(dur) && dur > 0) {
                floatingMedia.currentTime = Math.min(saved, Math.max(0, dur - 0.05));
              } else {
                floatingMedia.currentTime = saved;
              }
            } catch (err) {
              floatingMedia.removeEventListener("seeked", onSeeked);
              revealAndPlay();
            }
          } else {
            var onCanPlay = function () { try { revealAndPlay(); } finally { floatingMedia.removeEventListener("canplay", onCanPlay); } };
            floatingMedia.addEventListener("canplay", onCanPlay);
          }
        } catch (err) {
          try { floatingMedia.style.visibility = "visible"; floatingMedia.style.opacity = MEDIA_OPACITY_LOADED; } catch (err2) { }
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
    function mediaBlobFallback() {
      if (blobTried || !(isVideo || isAudio) || typeof fetch !== "function") {
        cleanupFloatingMedia();
        return;
      }
      blobTried = true;
      var failedSrc = floatingMedia ? floatingMedia.src : "";
      if (!failedSrc || failedSrc.indexOf("blob:") === 0) {
        cleanupFloatingMedia();
        return;
      }
      var fetcher = fetch;
      try {
        var w = pageWindow();
        if (w.api && typeof w.api.fetch === "function") fetcher = function (u) { return w.api.fetch(u); };
      } catch (e) { }
      fetcher(failedSrc).then(function (res) {
        if (!res || !res.ok) throw new Error("fetch failed");
        return res.blob();
      }).then(function (blob) {
        if (!floatingMedia) return;
        var objUrl = URL.createObjectURL(blob);
        floatingMedia.dataset.blobUrl = objUrl;
        floatingMedia.src = objUrl;
      }).catch(function () {
        cleanupFloatingMedia();
      });
    }
    if (isVideo || isAudio) floatingMedia.onerror = mediaBlobFallback;
    thumb.addEventListener("mouseleave", cleanupFloatingMedia, { once: true });
    window.addEventListener("scroll", cleanupFloatingMedia, { passive: true, once: true });
    cleanupFns.push(function () { thumb.removeEventListener("mouseleave", cleanupFloatingMedia); });
    cleanupFns.push(function () { window.removeEventListener("scroll", cleanupFloatingMedia); });
  }

  function attachThumbListeners(root) {
    root = root || document;
    var thumbs = root.querySelectorAll("a.linkThumb img, a.imgLink img");
    for (var i = 0; i < thumbs.length; i++) {
      if (!thumbs[i]._fullImgHoverBound) {
        thumbs[i].addEventListener("mouseenter", onThumbEnter);
        thumbs[i]._fullImgHoverBound = true;
      }
    }
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

  var hoverObserver = null;

  function wireHoverOnce() {
    if (hoverWired) return;
    hoverWired = true;
    cacheThumbMime();
    attachThumbListeners();
    if (!hoverObserver) {
      hoverObserver = new MutationObserver(function (mutations) {
        for (var i = 0; i < mutations.length; i++) {
          var nodes = mutations[i].addedNodes;
          for (var j = 0; j < nodes.length; j++) {
            if (nodes[j].nodeType === 1) attachThumbListeners(nodes[j]);
          }
        }
      });
      hoverObserver.observe(document.body, { childList: true, subtree: true });
    }
  }

  var catalogFilterObserver = null;
  var debouncedCatalogFilterApply = null;

  function cellBoardThread(cell) {
    var link = cell.querySelector("a.linkThumb[href*='/res/']");
    if (!link) return null;
    var match = link.getAttribute("href").match(/^\/([^/]+)\/res\/(\d+)\.html/);
    return match ? { board: match[1], threadNum: match[2] } : null;
  }

  function filterMatches(word, text) {
    var w = String(word).toLowerCase();
    if (!w) return false;
    if (w === "*") return true;
    var pre = w.charAt(0) === "*";
    var suf = w.length > 1 && w.charAt(w.length - 1) === "*";
    var core = w.substring(pre ? 1 : 0, suf ? w.length - 1 : w.length);
    if (!core) return true;
    if (pre && suf) return text.indexOf(core) !== -1;
    if (pre) return text.slice(-core.length) === core || text.indexOf(" " + core) !== -1;
    if (suf) return text.slice(0, core.length) === core || text.indexOf(core + " ") !== -1;
    return text.indexOf(w) !== -1;
  }

  function applyCatalogFilters() {
    if (!pageType.isCatalog) return;
    var filters = [];
    if (ssSettings.catalogFiltering) {
      var saved = ssSettings.catalogFilters || {};
      Object.keys(saved).forEach(function (k) {
        var f = saved[k];
        if (!f || !f.word) return;
        filters.push({
          word: f.word,
          boards: String(f.boards || "").toLowerCase().split(",").map(function (b) {
            return b.trim();
          }).filter(function (b) { return !!b; })
        });
      });
    }
    var cells = document.querySelectorAll(".catalogCell");
    for (var i = 0; i < cells.length; i++) {
      var cell = cells[i];
      var hidden = false;
      if (filters.length) {
        var info = cellBoardThread(cell);
        if (!info) continue;
        var text = ((cell.querySelector(".labelSubject") || {}).textContent || "") + " " +
          ((cell.querySelector(".divMessage") || {}).textContent || "");
        text = text.toLowerCase();
        for (var f = 0; f < filters.length; f++) {
          if (filterMatches(filters[f].word, text)) {
            if (!filters[f].boards.length || filters[f].boards.indexOf(info.board) !== -1) {
              hidden = true;
              break;
            }
          }
        }
      }
      cell.classList.toggle("ss-hidden-thread", hidden);
    }
  }

  var lastFiftyObserver = null;
  var debouncedLastFifty = null;

  function addLastLinkButtons() {
    if (!pageType.isCatalog) return;
    var cells = document.querySelectorAll(".catalogCell");
    for (var i = 0; i < cells.length; i++) {
      var cell = cells[i];
      var linkThumb = cell.querySelector(".linkThumb");
      var threadStats = cell.querySelector(".threadStats");
      if (!linkThumb || !threadStats || threadStats.querySelector(".last-link-btn")) continue;
      var href = linkThumb.getAttribute("href");
      if (!href || href.indexOf("/res/") === -1) continue;
      var span = document.createElement("span");
      span.className = "last-link-btn";
      span.style.marginLeft = "0.5em";
      var a = document.createElement("a");
      a.href = href.replace("/res/", "/last/");
      a.textContent = "[L]";
      a.title = "Go to last 50 posts of this thread";
      a.style.textDecoration = "none";
      a.style.fontWeight = "bold";
      span.appendChild(a);
      var labelPage = threadStats.querySelector(".labelPage");
      if (labelPage && labelPage.parentNode) {
        labelPage.parentNode.insertBefore(span, labelPage.nextSibling);
      } else {
        threadStats.appendChild(span);
      }
    }
  }

  var catalogNewTabWired = false;
  var catalogNewTabDiv = null;

  function onCatalogThumbClick(e) {
    var link = e.target.closest(".catalogCell a.linkThumb");
    if (link && link.getAttribute("target") !== "_blank") {
      link.setAttribute("target", "_blank");
      link.setAttribute("rel", "noopener noreferrer");
    }
  }

  function applyCatalogNewTab() {
    if (!pageType.isCatalog) return;
    var catalogDiv = document.querySelector(".catalogDiv");
    if (!catalogDiv) return;
    var links = catalogDiv.querySelectorAll(".catalogCell a.linkThumb");
    for (var i = 0; i < links.length; i++) {
      links[i].setAttribute("target", "_blank");
      links[i].setAttribute("rel", "noopener noreferrer");
    }
    if (!catalogNewTabWired) {
      catalogNewTabWired = true;
      catalogNewTabDiv = catalogDiv;
      catalogDiv.addEventListener("click", onCatalogThumbClick);
    }
  }

  function removeCatalogNewTab() {
    if (catalogNewTabDiv) {
      catalogNewTabDiv.removeEventListener("click", onCatalogThumbClick);
      catalogNewTabDiv = null;
      catalogNewTabWired = false;
    }
    var links = document.querySelectorAll(".catalogCell a.linkThumb[target='_blank']");
    for (var i = 0; i < links.length; i++) {
      links[i].removeAttribute("target");
      links[i].removeAttribute("rel");
    }
  }

  var truncObserver = null;
  var truncWired = false;
  var truncContainer = null;
  var debouncedTruncApply = null;

  function truncateLink(link, max) {
    var full = link.getAttribute("download");
    if (!full) return;
    var lastDot = full.lastIndexOf(".");
    if (lastDot === -1) return;
    var name = full.slice(0, lastDot);
    var ext = full.slice(lastDot);
    var truncated = name.length > max ? name.slice(0, max) + "(...)" + ext : full;
    link.textContent = truncated;
    link.dataset.ssTruncated = "1";
    link.dataset.ssMax = String(max);
    link.dataset.ssFullFilename = full;
    link.dataset.ssTruncatedFilename = truncated;
    link.title = full;
  }

  function applyTruncFilenames() {
    if (pageType.isCatalog) return;
    var max = parseInt(ssSettings.customTrunc, 10);
    if (isNaN(max)) max = SS_DEFAULTS.customTrunc;
    var links = document.querySelectorAll("a.originalNameLink");
    for (var i = 0; i < links.length; i++) {
      var link = links[i];
      if (link.dataset.ssTruncated === "1" && link.dataset.ssMax === String(max)) continue;
      truncateLink(link, max);
    }
  }

  function onTruncOver(e) {
    var link = e.target.closest("a.originalNameLink");
    if (link && link.dataset.ssFullFilename) link.textContent = link.dataset.ssFullFilename;
  }

  function onTruncOut(e) {
    var link = e.target.closest("a.originalNameLink");
    if (link && link.dataset.ssTruncatedFilename) link.textContent = link.dataset.ssTruncatedFilename;
  }

  function restoreTruncFilenames() {
    var links = document.querySelectorAll('a.originalNameLink[data-ss-truncated="1"]');
    for (var i = 0; i < links.length; i++) {
      var link = links[i];
      if (link.dataset.ssFullFilename) link.textContent = link.dataset.ssFullFilename;
      delete link.dataset.ssTruncated;
      delete link.dataset.ssMax;
      delete link.dataset.ssFullFilename;
      delete link.dataset.ssTruncatedFilename;
      link.removeAttribute("title");
    }
  }

  var autoHideHeaderWired = false;
  var autoHideHeaderEl = null;
  var autoHideLastScrollY = 0;
  var autoHideTicking = false;

  function updateAutoHideHeader() {
    autoHideTicking = false;
    if (!autoHideHeaderEl) return;
    var currentY = window.scrollY;
    var direction = currentY > autoHideLastScrollY ? "down" : "up";
    autoHideLastScrollY = currentY;
    if (direction === "up" || currentY < 100) {
      autoHideHeaderEl.classList.remove("nav-hidden");
    } else if (currentY > 50) {
      autoHideHeaderEl.classList.add("nav-hidden");
    }
  }

  function onAutoHideScroll() {
    if (!autoHideTicking) {
      requestAnimationFrame(updateAutoHideHeader);
      autoHideTicking = true;
    }
  }

  var SCROLL_POSITIONS_KEY = "8chanSS_scrollPositions";
  var UNREAD_LINE_ID = "unread-line";
  var SCROLL_MAX_THREADS = 200;
  var scrollSaveWired = false;
  var scrollSaveThrottle = null;
  var scrollSaveLastY = 0;
  var scrollSaveData = null;
  var scrollSaveLoaded = false;

  function scrollThreadKey() {
    if (!pageType.isThread) return null;
    var match = location.pathname.match(/^\/([^/]+)\/res\/([^/.]+)\.html$/i);
    return match ? match[1] + "/" + match[2] : null;
  }

  function loadScrollPositions() {
    if (scrollSaveLoaded) return Promise.resolve(scrollSaveData);
    scrollSaveLoaded = true;
    scrollSaveData = {};
    if (typeof GM === "undefined" || !GM.getValue) return Promise.resolve(scrollSaveData);
    return GM.getValue(SCROLL_POSITIONS_KEY, null).then(function (raw) {
      if (!raw) return scrollSaveData;
      try {
        var obj = JSON.parse(raw);
        if (obj && typeof obj === "object") scrollSaveData = obj;
      } catch (e) { }
      return scrollSaveData;
    }).catch(function () {
      return scrollSaveData;
    });
  }

  function saveScrollPositions() {
    if (typeof GM === "undefined" || !GM.setValue) return Promise.resolve();
    return GM.setValue(SCROLL_POSITIONS_KEY, JSON.stringify(scrollSaveData || {})).catch(function () { });
  }

  function removeUnreadLine() {
    var marker = document.getElementById(UNREAD_LINE_ID);
    if (marker && marker.parentNode) marker.parentNode.removeChild(marker);
  }

  function addUnreadLine(position) {
    if (!ssSettings.showUnreadLine) return;
    var posts = document.querySelectorAll(".divPosts > .postCell[id]");
    if (!posts.length) return;
    if ((position + window.innerHeight) >= (document.body.offsetHeight - 5)) return;
    var target = null;
    for (var i = 0; i < posts.length; i++) {
      if (posts[i].offsetTop > position) break;
      target = posts[i];
    }
    if (!target) return;
    removeUnreadLine();
    var marker = document.createElement("hr");
    marker.id = UNREAD_LINE_ID;
    if (target.nextSibling) target.parentNode.insertBefore(marker, target.nextSibling);
    else target.parentNode.appendChild(marker);
  }

  function removeUnreadLineIfAtBottom() {
    if (!ssSettings.showUnreadLine) return;
    if ((window.innerHeight + window.scrollY) >= (document.body.offsetHeight - 5)) removeUnreadLine();
  }

  function saveScrollPositionNow() {
    var key = scrollThreadKey();
    if (!key) return Promise.resolve();
    return loadScrollPositions().then(function (data) {
      var position = window.scrollY;
      var keys = Object.keys(data);
      if (keys.length >= SCROLL_MAX_THREADS && !data[key]) {
        keys.sort(function (a, b) { return (data[a].timestamp || 0) - (data[b].timestamp || 0); });
        for (var i = 0; i < keys.length - SCROLL_MAX_THREADS + 1; i++) delete data[keys[i]];
      }
      if (!data[key]) data[key] = {};
      if (typeof data[key].position !== "number" || position > data[key].position) {
        data[key].position = position;
        data[key].timestamp = Date.now();
        return saveScrollPositions();
      }
    });
  }

  function restoreScrollPosition() {
    var key = scrollThreadKey();
    if (!key) return Promise.resolve();
    return loadScrollPositions().then(function (data) {
      var saved = data[key];
      if (!saved || typeof saved.position !== "number") return;
      var anchor = location.hash ? location.hash.slice(1) : "";
      if (anchor && /^[a-zA-Z0-9_-]+$/.test(anchor)) {
        setTimeout(function () {
          var post = document.getElementById(anchor);
          if (post && post.classList.contains("postCell")) {
            var rect = post.getBoundingClientRect();
            window.scrollTo({
              top: rect.top + window.pageYOffset - window.innerHeight / 2 + rect.height / 2,
              behavior: "auto"
            });
          }
          addUnreadLine(saved.position);
        }, 25);
        return;
      }
      window.scrollTo({ top: saved.position, behavior: "auto" });
      setTimeout(function () { addUnreadLine(saved.position); }, 80);
    });
  }

  function onScrollSave() {
    if (scrollSaveThrottle) return;
    scrollSaveThrottle = setTimeout(function () {
      scrollSaveThrottle = null;
      var y = window.scrollY;
      if (y > scrollSaveLastY) saveScrollPositionNow();
      scrollSaveLastY = y;
      removeUnreadLineIfAtBottom();
    }, 100);
  }

  function onBeforeUnloadSave() {
    saveScrollPositionNow();
  }

  var apngObserver = null;

  function isAPNGFile(mime, src) {
    if (mime) {
      var lower = mime.toLowerCase();
      if (lower === "image/apng" || lower === "image/png") return true;
    }
    return !!(src && /\.(a?png)(\?.*)?$/i.test(src));
  }

  function processAPNGThumb(img) {
    if (img.dataset.ssApngProcessed === "1") return;
    var link = img.closest("a.linkThumb, a.imgLink");
    if (!link) return;
    var mime = (link.getAttribute("data-filemime") || "").toLowerCase();
    var href = link.getAttribute("href") || "";
    if (!isAPNGFile(mime, href)) return;
    var width = parseInt(link.getAttribute("data-filewidth"), 10) || img.width || 0;
    var height = parseInt(link.getAttribute("data-fileheight"), 10) || img.height || 0;
    if (width > 220 || height > 220) return;
    img.style.visibility = "hidden";
    if (!img.complete || img.naturalWidth === 0) {
      img.addEventListener("load", function () { processAPNGThumb(img); }, { once: true });
      return;
    }
    img.dataset.ssApngProcessed = "1";
    var canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    canvas.getContext("2d").drawImage(img, 0, 0, img.width, img.height);
    canvas.className = "apng-canvas-snapshot";
    var overlay = document.createElement("div");
    overlay.className = "apng-overlay";
    overlay.style.width = canvas.width + "px";
    overlay.style.height = canvas.height + "px";
    var isCatalog = !!link.closest(".catalogCell");
    var wrapper = document.createElement("div");
    wrapper.style.position = "relative";
    wrapper.style.display = "inline-block";
    wrapper.style.width = canvas.width + "px";
    wrapper.style.height = canvas.height + "px";
    if (!isCatalog) {
      wrapper.style.marginRight = "1em";
      wrapper.style.marginBottom = "0.7em";
    }
    img.parentNode.insertBefore(wrapper, img);
    wrapper.appendChild(img);
    wrapper.appendChild(canvas);
    wrapper.appendChild(overlay);
    overlay.addEventListener("click", function () {
      overlay.remove();
      canvas.remove();
      img.style.visibility = "";
    });
    ["mouseenter", "mouseleave"].forEach(function (type) {
      overlay.addEventListener(type, function (e) {
        img.dispatchEvent(new MouseEvent(type, {
          bubbles: false,
          cancelable: true,
          clientX: e.clientX,
          clientY: e.clientY
        }));
      });
    });
  }

  function processAllAPNGThumbs(root) {
    var thumbs = (root || document).querySelectorAll("a.linkThumb img, a.imgLink img");
    for (var i = 0; i < thumbs.length; i++) processAPNGThumb(thumbs[i]);
  }

  function restoreAPNGThumbs() {
    var overlays = document.querySelectorAll(".apng-overlay");
    for (var i = 0; i < overlays.length; i++) {
      var overlay = overlays[i];
      var wrapper = overlay.parentNode;
      if (!wrapper) continue;
      var img = wrapper.querySelector("img");
      var canvas = wrapper.querySelector("canvas.apng-canvas-snapshot");
      if (canvas) canvas.remove();
      overlay.remove();
      if (img) {
        img.style.visibility = "";
        delete img.dataset.ssApngProcessed;
        if (wrapper.parentNode) wrapper.parentNode.insertBefore(img, wrapper);
      }
      if (wrapper.parentNode && !wrapper.children.length) wrapper.remove();
    }
  }

  var highlightIdsObserver = null;
  var debouncedHighlightIds = null;
  var idCountApplied = false;

  function rawIdFromLabelId(span) {
    if (!span) return null;
    return span.getAttribute("data-id") || span.textContent.trim();
  }

  function setNativeIdCount(on) {
    var value = on ? "true" : "false";
    try {
      window.dispatchEvent(new StorageEvent("storage", {
        key: "alwaysShowIdCount",
        oldValue: localStorage.getItem("alwaysShowIdCount"),
        newValue: value,
        url: location.href,
        storageArea: localStorage
      }));
    } catch (e) { }
    try { localStorage.setItem("alwaysShowIdCount", value); } catch (e) { }
  }

  function applyHighlightNewIds() {
    var posts = document.querySelector(".divPosts");
    if (!posts) return;
    var styleClassMap = { moetext: "moeText", glow: "id-glow", dotted: "id-dotted" };
    var styleClass = styleClassMap[ssSettings.idHlStyle] || "moeText";
    var labelSpans = posts.querySelectorAll(".labelId");
    var idFrequency = {};
    var i;
    for (i = 0; i < labelSpans.length; i++) {
      var id = rawIdFromLabelId(labelSpans[i]);
      idFrequency[id] = (idFrequency[id] || 0) + 1;
    }
    var seen = {};
    for (i = 0; i < labelSpans.length; i++) {
      var span = labelSpans[i];
      var spanId = rawIdFromLabelId(span);
      span.classList.remove("moeText", "id-glow", "id-dotted");
      if (!seen[spanId]) {
        seen[spanId] = true;
        span.classList.add(styleClass);
        span.title = idFrequency[spanId] === 1
          ? "This ID appears only once."
          : "This was the first occurrence of this ID.";
      } else {
        span.title = "";
      }
    }
  }

  function clearHighlightNewIds() {
    var spans = document.querySelectorAll(".labelId.moeText, .labelId.id-glow, .labelId.id-dotted");
    for (var i = 0; i < spans.length; i++) {
      spans[i].classList.remove("moeText", "id-glow", "id-dotted");
      spans[i].removeAttribute("title");
    }
  }

  var enhancedLinksWired = false;

  var CANDIDATE_LINKS = 'a[href*="youtu"], a[href*="twitch"], a[href*="rentry.co"], a[href*="rentry.org"], ' +
    'a[href*="catbox.moe"], a[href*="pastebin.com"], a[href*="x.com"], a[href*="twitter.com"], ' +
    'a[href*="nitter.net"], a[href*="nitter.poast.org"], a[href*="xcancel.com"], a[href*="nitter.space"], ' +
    'a[href*="bsky.app"]';

  function initEnhancedLinks() {
    if (enhancedLinksWired) return;
    var showIcons = !!ssSettings.showLinkIcons;
    var showThumbnails = !!ssSettings.linkThumbnails;
    var enableEmbeds = !!ssSettings.linkEmbeds;
    var showIconsYoutube = showIcons && !!ssSettings.iconYoutube;
    var showIconsTwitch = showIcons && !!ssSettings.iconTwitch;
    var showIconsX = showIcons && !!ssSettings.iconX;
    var showIconsBsky = showIcons && !!ssSettings.iconBsky;
    var showIconsRentry = showIcons && !!ssSettings.iconRentry;
    var showIconsCatbox = showIcons && !!ssSettings.iconCatbox;
    var showIconsPastebin = showIcons && !!ssSettings.iconPastebin;
    var showThumbnailsYoutube = showThumbnails && !!ssSettings.thumbYoutube;
    var showThumbnailsTwitch = showThumbnails && !!ssSettings.thumbTwitch;
    var enableEmbedsX = enableEmbeds && !!ssSettings.embedX;
    var enableEmbedsBsky = enableEmbeds && !!ssSettings.embedBsky;
    var enableEmbedsRentry = enableEmbeds && !!ssSettings.embedRentry;
    var enableEmbedsPastebin = enableEmbeds && !!ssSettings.embedPastebin;
    if (!showIconsYoutube && !showIconsTwitch && !showIconsX && !showIconsBsky &&
      !showIconsRentry && !showIconsCatbox && !showIconsPastebin &&
      !showThumbnailsYoutube && !showThumbnailsTwitch &&
      !enableEmbedsX && !enableEmbedsBsky && !enableEmbedsRentry && !enableEmbedsPastebin) {
      return;
    }
    enhancedLinksWired = true;

    const MAX_CACHE_SIZE = 350;
    const ORDER_KEY = "_order";
    const TRACKING_PARAMS = [
      "si", "feature", "ref", "fsi", "source",
      "utm_source", "utm_medium", "utm_campaign", "gclid", "gclsrc", "fbclid"
    ];

    const YT_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" width="18" height="16" style="vertical-align:middle;margin-right:2px;"><path fill="#FF0000" d="M549.7 124.1c-6.3-23.7-24.9-42.4-48.6-48.6C456.5 64 288 64 288 64s-168.5 0-213.1 11.5c-23.7 6.3-42.4 24.9-48.6 48.6C16 168.5 16 256 16 256s0 87.5 10.3 131.9c6.3 23.7 24.9 42.4 48.6 48.6C119.5 448 288 448 288 448s168.5 0 213.1-11.5c23.7-6.3 42.4-24.9 48.6-48.6 10.3-44.4 10.3-131.9 10.3-131.9s0-87.5-10.3-131.9zM232 334.1V177.9L361 256 232 334.1z"/></svg>`;
    const TWITCH_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="18" height="16" style="vertical-align:middle;margin-right:2px;"><path fill="#9146FF" d="M391.17,103.47H352.54v109.7h38.63ZM285,103H246.37V212.75H285ZM120.83,0,24.31,91.42V420.58H140.14V512l96.53-91.42h77.25L487.69,256V0ZM449.07,237.75l-77.22,73.12H294.61l-67.6,64v-64H140.14V36.58H449.07Z"/></svg>`;
    const RENTRY_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="16" style="vertical-align:middle;margin-right:2px;" fill="currentColor"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm4 18H6V4h7v5h5v11z"/></svg>`;
    const PASTEBIN_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="16" style="vertical-align:middle;margin-right:2px;" fill="currentColor"><path d="M19.385 2.5H4.615A2.115 2.115 0 0 0 2.5 4.615v14.77a2.115 2.115 0 0 0 2.115 2.115h14.77a2.115 2.115 0 0 0 2.115-2.115V4.615A2.115 2.115 0 0 0 19.385 2.5M8.423 18.308v-7.423H6.154V6.5h5.888v1.154H8.423v3.462h3.462v1.154H8.423v5.039H6.154m8.654 0v-7.423h-2.269V6.5h5.888v1.154h-3.619v3.462h3.462v1.154h-3.462v5.039H15.077Z"/></svg>`;
    const CATBOX_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="16" style="vertical-align:middle;margin-right:2px;" fill="currentColor"><path d="M20 6h-2.18c.11-.31.18-.65.18-1a2.996 2.996 0 0 0-5.5-1.65l-.5.67-.5-.68C10.96 2.54 10 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm11 15H4v-2h16v2zm0-5H4V8h5.08L7 10.83 8.62 12 11 8.76l1-1.36 1 1.36L15.38 12 17 10.83 14.92 8H20v6z"/></svg>`;
    const X_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="16" style="vertical-align:middle;margin-right:2px;" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.48 11.25H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`;
    const BSKY_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 57" width="18" height="16" style="vertical-align:middle;margin-right:2px;"><path fill="#0085FF" d="M13.873 3.805C21.21 9.332 29.103 20.537 32 26.55v15.882c0-.338-.13.044-.41.867-1.512 4.456-7.418 21.847-20.923 7.944-7.111-7.32-3.819-14.64 9.125-16.85-7.405 1.264-15.73-.825-18.014-9.015C1.12 23.022 0 8.51 0 6.55 0-3.268 8.579-.182 13.873 3.805ZM50.127 3.805C42.79 9.332 34.897 20.537 32 26.55v15.882c0-.338.130.044.410.867 1.512 4.456 7.418 21.847 20.923 7.944 7.111-7.32 3.819-14.64-9.125-16.85 7.405 1.264 15.73-.825 18.014-9.015C62.88 23.022 64 8.51 64 6.55c0-9.818-8.578-6.732-13.873-2.745Z"/></svg>`;

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

    const ytTitleCache = loadCache('ytTitleCache');

    function getYouTubeInfo(url) {
      try {
        const u = new URL(url);
        if (u.hostname === 'youtu.be') {
          const id = (u.pathname.slice(1).split('/')[0] || '').split('?')[0];
          if (id) return { type: 'video', id: id };
          return null;
        }
        const isYoutube = u.hostname.endsWith('youtube.com') || u.hostname.endsWith('youtube-nocookie.com');
        if (isYoutube) {
          if (u.pathname === '/watch') {
            const videoId = u.searchParams.get('v');
            if (videoId) {
              return { type: 'video', id: videoId };
            }
          }
          const watchPathMatch = u.pathname.match(/^\/watch\/([a-zA-Z0-9_-]{11})(?:\/|$)/);
          if (watchPathMatch) {
            return { type: 'video', id: watchPathMatch[1] };
          }
          const vPathMatch = u.pathname.match(/^\/v\/([a-zA-Z0-9_-]{11})(?:\/|$)/);
          if (vPathMatch) {
            return { type: 'video', id: vPathMatch[1] };
          }
          const liveMatch = u.pathname.match(/^\/(live|embed|shorts)\/([a-zA-Z0-9_-]{11})/);
          if (liveMatch) {
            return { type: 'video', id: liveMatch[2] };
          }
          const postMatch = u.pathname.match(/^(?:\/@([a-zA-Z0-9_.-]+))?\/post\/([a-zA-Z0-9_-]+)/);
          if (postMatch) {
            return {
              type: 'post',
              id: postMatch[2],
              channel: postMatch[1] || null
            };
          }
          const channelMatch = u.pathname.match(/^\/(?:@([a-zA-Z0-9_.-]+)|c\/([a-zA-Z0-9_.-]+)|channel\/([a-zA-Z0-9_-]+)|user\/([a-zA-Z0-9_-]+)|([a-zA-Z0-9_.-]+))(?:\/|$)/);
          if (channelMatch) {
            const channelId = channelMatch[1] || channelMatch[2] || channelMatch[3] || channelMatch[4] || channelMatch[5];
            if (channelId) {
              return { type: 'channel', id: channelId };
            }
          }
        }
      } catch (e) { }
      return null;
    }

    function sanitizeYouTubeId(videoId) {
      if (!videoId) return null;
      const match = videoId.match(/([a-zA-Z0-9_-]{11})/);
      return match ? match[1] : null;
    }

    function stripTrackingParams(url) {
      try {
        const u = new URL(url);
        let changed = false;
        const KEEP_PARAMS = new Set(['t', 'start']);
        TRACKING_PARAMS.forEach(param => {
          if (u.searchParams.has(param) && !KEEP_PARAMS.has(param)) {
            u.searchParams.delete(param);
            changed = true;
          }
        });
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
      let lastEvent = null;
      let thumbWidth = 290;
      let thumbHeight = 210;

      function positionThumb(e) {
        if (!thumbDiv || !e) return;
        let top = e.clientY + 12;
        let left = e.clientX + 12;
        if (top + thumbHeight > window.innerHeight - 8) top = e.clientY - 12 - thumbHeight;
        if (top < 8) top = 8;
        if (left + thumbWidth > window.innerWidth - 8) left = e.clientX - 12 - thumbWidth;
        if (left < 8) left = 8;
        thumbDiv.style.top = `${top}px`;
        thumbDiv.style.left = `${left}px`;
      }

      function measureThumb(e) {
        if (!thumbDiv) return;
        const rect = thumbDiv.getBoundingClientRect();
        if (rect.width) thumbWidth = rect.width;
        if (rect.height) thumbHeight = rect.height;
        positionThumb(e);
      }

      function showThumb(e) {
        lastEvent = e;
        if (!thumbDiv) {
          thumbDiv = document.createElement('div');
          thumbDiv.className = 'ss-link-thumb';
          thumbDiv.style.opacity = '0';

          const img = document.createElement('img');
          img.style.maxWidth = Math.min(280, window.innerWidth - 20) + 'px';
          img.style.maxHeight = Math.min(200, window.innerHeight - 20) + 'px';
          img.alt = altText;
          img.src = "data:image/gif;base64,R0lGODlhEAAQAPIAAP///wAAAMLCwkJCQv///wAAACH5BAEAAAMALAAAAAAQABAAAAIgjI+py+0Po5yUFQA7";
          img.addEventListener('load', () => measureThumb(lastEvent));

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
        positionThumb(e);
      }

      function moveThumb(e) {
        lastEvent = e;
        positionThumb(e);
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

    function isInsideCodeblock(link) {
      return link.closest('.inlineCode, .aa, .katex, .katex-html, .hljs-built_in, .hljs-string, .embedContainer, .embed-wrapper, [data-embed], .embed') !== null;
    }

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
        } catch (e) { }
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
          const videoMatch = u.pathname.match(/^\/videos?\/(\d+)/);
          if (videoMatch) {
            return { type: 'video', id: videoMatch[1] };
          }
          const clipMatch = u.pathname.match(/^\/([a-zA-Z0-9_]+)\/clip\/([a-zA-Z0-9_-]+)/);
          if (clipMatch) {
            return { type: 'clip', id: clipMatch[2], username: clipMatch[1] };
          }
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
        const xDomains = ['x.com', 'twitter.com'];
        if (xDomains.some(domain => u.hostname === domain || u.hostname.endsWith('.' + domain))) {
          return true;
        }
        const nitterDomains = ['nitter.net', 'nitter.poast.org', 'xcancel.com', 'nitter.space'];
        if (nitterDomains.some(domain => u.hostname === domain || u.hostname.endsWith('.' + domain))) {
          return true;
        }
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

    function createFxEmbedCard(fxData, originalUrl) {
      const card = document.createElement('div');
      card.style.display = 'flex';
      card.style.flexDirection = 'column';
      card.style.gap = '10px';

      if (fxData.code !== 200) {
        card.innerHTML = `<a href="${originalUrl}" target="_blank">${originalUrl}</a>`;
        return card;
      }

      const post = fxData.tweet || fxData.post || fxData;

      if (post.author) {
        const authorUrl = post.author.url ||
          (post.author.screen_name ? `https://x.com/${post.author.screen_name}` : null) ||
          (post.author.handle ? `https://bsky.app/profile/${post.author.handle}` : null);
        const authorDiv = createAuthorDiv(post.author.name, authorUrl);
        if (authorDiv) card.appendChild(authorDiv);
      }

      const text = post.text || post.content || '';
      if (text) {
        const textDiv = document.createElement('div');
        textDiv.style.color = 'var(--text-color, #fff)';
        textDiv.style.whiteSpace = 'pre-wrap';
        textDiv.style.wordWrap = 'break-word';
        textDiv.textContent = text;
        card.appendChild(textDiv);
      }

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
          throw new Error('Invalid X/Twitter URL');
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
        embedContainer.appendChild(createFxEmbedCard(response, url));
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
      embedButton.textContent = 'Embed';

      embedButton.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();

        const embedContainer = embedButton.nextElementSibling;
        if (embedContainer?.classList.contains('embedContainer')) {
          embedContainer.remove();
          embedButton.textContent = 'Embed';
        } else {
          embedButton.textContent = 'Loading...';
          embedButton.style.pointerEvents = 'none';
          try {
            const newContainer = await createEmbedFn(link.href);
            embedButton.parentNode.insertBefore(newContainer, embedButton.nextSibling);
            embedButton.textContent = 'Remove';
          } catch (error) {
            embedButton.textContent = 'Embed';
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

      const ogSiteNameMatch = html.match(/<meta\s+property=["']og:site_name["']\s+content=["']([^"']+)["']/i);
      if (ogSiteNameMatch && ogSiteNameMatch[1]) {
        result.author = ogSiteNameMatch[1].trim();
      }

      const ogImageMatches = html.matchAll(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/gi);
      for (const match of ogImageMatches) {
        if (match[1] && !match[1].includes('embed.bsky.app')) {
          result.images.push(match[1].trim());
        }
      }

      if (result.images.length === 0) {
        const twitterImageMatch = html.match(/<meta\s+name=["']twitter:image["']\s+content=["']([^"']+)["']/i);
        if (twitterImageMatch && twitterImageMatch[1] && !twitterImageMatch[1].includes('embed.bsky.app')) {
          result.images.push(twitterImageMatch[1].trim());
        }
      }

      const ogVideoMatch = html.match(/<meta\s+property=["']og:video["']\s+content=["']([^"']+)["']/i);
      if (ogVideoMatch && ogVideoMatch[1]) {
        result.videos.push(ogVideoMatch[1].trim());
      }

      const ogVideoImageMatch = html.match(/<meta\s+property=["']og:video:image["']\s+content=["']([^"']+)["']/i);
      if (ogVideoImageMatch && ogVideoImageMatch[1] && result.videos.length > 0) {
        result.videos[0] = { url: result.videos[0], thumbnail: ogVideoImageMatch[1].trim() };
      }

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
        } catch (e) { }
      }

      return result;
    }

    async function createBskyEmbed(url) {
      const embedContainer = document.createElement('div');
      embedContainer.className = 'embedContainer';
      applyEmbedStyles(embedContainer);

      try {
        const [oembedResponse, pageHtml] = await Promise.all([
          new Promise((resolve) => {
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
          new Promise((resolve) => {
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

        let mediaData = { images: [], videos: [], title: null, author: null };
        if (pageHtml) {
          mediaData = extractBskyMedia(pageHtml);
        }

        const authorName = oembedResponse?.author_name || mediaData.author || 'Bluesky';
        const authorUrl = oembedResponse?.author_url || url;
        const authorDiv = createAuthorDiv(authorName, authorUrl);
        if (authorDiv) card.appendChild(authorDiv);

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
      var links = root.querySelectorAll(CANDIDATE_LINKS);
      for (var i = 0; i < links.length; i++) {
        var link = links[i];
        if (showIconsYoutube || showThumbnailsYoutube) processYouTubeLink(link);
        if (showIconsTwitch || showThumbnailsTwitch) processTwitchLink(link);
        if (showIconsRentry || enableEmbedsRentry) processRentryLink(link);
        if (showIconsCatbox) processCatboxLink(link);
        if (showIconsPastebin || enableEmbedsPastebin) processPastebinLink(link);
        if (showIconsX || enableEmbedsX) processXLink(link);
        if (showIconsBsky || enableEmbedsBsky) processBskyLink(link);
      }
    }

    processLinks(document);

    var enhanceLinksObserver = new MutationObserver(function (mutations) {
      for (var i = 0; i < mutations.length; i++) {
        var added = mutations[i].addedNodes;
        for (var j = 0; j < added.length; j++) {
          var node = added[j];
          if (node.nodeType !== 1 || !node.querySelector || !node.querySelector("a[href]")) continue;
          processLinks(node);
        }
      }
    });
    enhanceLinksObserver.observe(document.body, { childList: true, subtree: true });
  }

  var sauceLinksWired = false;

  function initSauceLinks() {
    if (sauceLinksWired) return;
    if (!ssSettings.sauceLinks) return;
    const iqdbEnabled = !!ssSettings.sauceIqdb;
    const saucenaoEnabled = !!ssSettings.sauceSaucenao;
    const pixivEnabled = !!ssSettings.saucePixiv;
    if (!iqdbEnabled && !saucenaoEnabled && !pixivEnabled) return;
    sauceLinksWired = true;

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

    function getImageUrl(detailDiv) {
      let imgSrc = null;
      const imageContainer = detailDiv.closest('.uploadCell, .postCell, .opCell');

      if (imageContainer) {
        const thumbImg = imageContainer.querySelector('.imgLink > img');
        const thumbSrc = thumbImg?.getAttribute("src");
        if (thumbImg && thumbSrc?.startsWith('/.media/t_')) {
          imgSrc = thumbSrc;
        }

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

    async function fetchImageBlob(url) {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch image");
      return await response.blob();
    }

    function getPixivId(detailDiv) {
      const origNameLink = detailDiv.querySelector('.originalNameLink');
      if (!origNameLink) return null;
      const filename = origNameLink.getAttribute('download') || origNameLink.textContent;
      const match = filename && filename.match(/^(\d+)_p\d+\./);
      return match ? match[1] : null;
    }

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

    function addSauceLinksToElement(detailDiv) {
      if (detailDiv.classList.contains('sauceLinksProcessed')) {
        return;
      }

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
              showToast("Failed to upload thumbnail.", "red", 2500);
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
        detailDiv.after(container);
      }
    }

    function observeAllUploadDetails(container = document) {
      const details = container.querySelectorAll('.uploadDetails:not(.sauceLinksProcessed)');
      details.forEach(detailDiv => addSauceLinksToElement(detailDiv));
    }
    observeAllUploadDetails();

    const sauceBodyObserver = new MutationObserver(function (mutations) {
      for (var i = 0; i < mutations.length; i++) {
        var nodes = mutations[i].addedNodes;
        for (var j = 0; j < nodes.length; j++) {
          var node = nodes[j];
          if (node.nodeType !== 1) continue;
          if (node.classList && node.classList.contains('uploadDetails')) {
            if (!node.classList.contains('sauceLinksProcessed')) addSauceLinksToElement(node);
          } else if (node.classList && (node.classList.contains('quoteTooltip') || node.classList.contains('innerPost'))) {
            node.querySelectorAll('.uploadDetails:not(.sauceLinksProcessed)').forEach(addSauceLinksToElement);
          } else if (node.querySelectorAll) {
            node.querySelectorAll('.quoteTooltip .uploadDetails:not(.sauceLinksProcessed), .innerPost .uploadDetails:not(.sauceLinksProcessed)').forEach(addSauceLinksToElement);
          }
        }
      }
    });
    sauceBodyObserver.observe(document.body, { childList: true, subtree: true });
  }

  var beepOnYouObserver = null;
  var beepAudioContext = null;

  function beepNow(ctx) {
    try {
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      var t = ctx.currentTime;
      osc.frequency.value = 550;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.1, t + 0.008);
      gain.gain.linearRampToValueAtTime(0, t + 0.03);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.032);
    } catch (e) { }
  }

  function playBeep() {
    var Ctor = window.AudioContext || window.webkitAudioContext;
    if (!Ctor) return;
    if (!beepAudioContext) beepAudioContext = new Ctor();
    var ctx = beepAudioContext;
    if (ctx.state === "suspended") {
      ctx.resume().then(function () { beepNow(ctx); });
      return;
    }
    beepNow(ctx);
  }

  var galleryWired = false;
  var galleryOverlay = null;
  var galleryEls = null;
  var galleryItems = [];
  var galleryIndex = 0;
  var galleryViewerOpen = false;

  function galleryFileName(href) {
    var name = href.split("/").pop().split("?")[0];
    try { return decodeURIComponent(name); } catch (e) { return name; }
  }

  function collectGalleryItems() {
    var items = [];
    var seen = {};
    var links = document.querySelectorAll("a.imgLink[href]");
    for (var i = 0; i < links.length; i++) {
      var link = links[i];
      var href = link.getAttribute("href");
      if (!href || seen[href]) continue;
      if (link.closest(".innerClone")) continue;
      seen[href] = true;
      var img = link.querySelector("img");
      var cell = link.closest(".postCell, .opCell");
      items.push({
        href: href,
        mime: (link.getAttribute("data-filemime") || "").toLowerCase(),
        thumb: img ? img.getAttribute("src") : "",
        name: galleryFileName(href),
        postId: cell ? cell.id : ""
      });
    }
    return items;
  }

  function onGalleryButtonClick(e) {
    if (!e.target.closest("#galleryLink")) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    openGallery();
  }

  function closeGallery() {
    if (!galleryOverlay) return;
    document.removeEventListener("keydown", onGalleryKey, true);
    if (galleryOverlay.parentNode) galleryOverlay.parentNode.removeChild(galleryOverlay);
    galleryOverlay = null;
    galleryEls = null;
    galleryItems = [];
    galleryIndex = 0;
    galleryViewerOpen = false;
  }

  function onGalleryKey(e) {
    if (!galleryOverlay) return;
    if (e.key === "Escape") {
      e.preventDefault();
      e.stopImmediatePropagation();
      closeGallery();
      return;
    }
    if (!galleryViewerOpen) return;
    var handled = true;
    if (e.key === "ArrowLeft") showGalleryItem(galleryIndex - 1);
    else if (e.key === "ArrowRight") showGalleryItem(galleryIndex + 1);
    else if (e.key === "ArrowUp") showGalleryItem(galleryIndex - 10);
    else if (e.key === "ArrowDown") showGalleryItem(galleryIndex + 10);
    else if (e.key === "Home") showGalleryItem(0);
    else if (e.key === "End") showGalleryItem(galleryItems.length - 1);
    else handled = false;
    if (handled) {
      e.preventDefault();
      e.stopImmediatePropagation();
    }
  }

  function openGallery() {
    if (galleryOverlay) {
      closeGallery();
      return;
    }
    galleryItems = collectGalleryItems();
    if (!galleryItems.length) {
      showToast("No media to see.", "orange", 2000);
      return;
    }
    galleryIndex = 0;
    galleryViewerOpen = false;

    var overlay = document.createElement("div");
    overlay.className = "ss-gallery";
    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) closeGallery();
    });

    var header = document.createElement("div");
    header.className = "ss-gallery-header";

    var title = document.createElement("span");
    title.className = "ss-gallery-title";
    header.appendChild(title);

    var caption = document.createElement("span");
    caption.className = "ss-gallery-caption";
    caption.hidden = true;
    header.appendChild(caption);

    var postBtn = document.createElement("button");
    postBtn.type = "button";
    postBtn.className = "ss-gallery-btn ss-gallery-post";
    postBtn.textContent = "Post";
    postBtn.title = "Go to the post with this image";
    postBtn.hidden = true;
    postBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      var item = galleryItems[galleryIndex];
      if (!item || !item.postId) return;
      closeGallery();
      var target = document.getElementById(item.postId);
      if (!target) return;
      try { history.replaceState(null, "", "#" + item.postId); } catch (err) { }
      target.scrollIntoView({ behavior: "smooth", block: "center" });
    });
    header.appendChild(postBtn);

    var backBtn = document.createElement("button");
    backBtn.type = "button";
    backBtn.className = "ss-gallery-btn ss-gallery-back";
    backBtn.textContent = "Grid";
    backBtn.title = "Back to grid";
    backBtn.hidden = true;
    backBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      showGalleryGrid();
    });

    var closeBtn = document.createElement("button");
    closeBtn.type = "button";
    closeBtn.className = "ss-gallery-btn ss-gallery-close";
    closeBtn.textContent = "✕";
    closeBtn.title = "Close (Esc)";
    closeBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      closeGallery();
    });

    header.appendChild(backBtn);
    header.appendChild(closeBtn);

    var grid = document.createElement("div");
    grid.className = "ss-gallery-grid";

    var viewer = document.createElement("div");
    viewer.className = "ss-gallery-viewer";
    viewer.hidden = true;

    var prevBtn = document.createElement("button");
    prevBtn.type = "button";
    prevBtn.className = "ss-gallery-nav ss-gallery-prev";
    prevBtn.textContent = "‹";
    prevBtn.title = "Previous";
    prevBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      showGalleryItem(galleryIndex - 1);
    });

    var nextBtn = document.createElement("button");
    nextBtn.type = "button";
    nextBtn.className = "ss-gallery-nav ss-gallery-next";
    nextBtn.textContent = "›";
    nextBtn.title = "Next";
    nextBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      showGalleryItem(galleryIndex + 1);
    });

    var mediaWrap = document.createElement("div");
    mediaWrap.className = "ss-gallery-media";

    viewer.appendChild(prevBtn);
    viewer.appendChild(mediaWrap);
    viewer.appendChild(nextBtn);

    overlay.appendChild(header);
    overlay.appendChild(grid);
    overlay.appendChild(viewer);
    document.body.appendChild(overlay);

    galleryOverlay = overlay;
    galleryEls = {
      title: title,
      backBtn: backBtn,
      postBtn: postBtn,
      grid: grid,
      viewer: viewer,
      mediaWrap: mediaWrap,
      caption: caption,
      prevBtn: prevBtn,
      nextBtn: nextBtn
    };

    galleryItems.forEach(function (item, i) {
      var tile = document.createElement("button");
      tile.type = "button";
      tile.className = "ss-gallery-tile";
      tile.title = item.name;
      if (item.thumb) {
        var img = document.createElement("img");
        img.loading = "lazy";
        img.src = item.thumb;
        img.alt = item.name;
        tile.appendChild(img);
      }
      var badgeText = item.mime.indexOf("video/") === 0 ? "▶" : (item.mime.indexOf("audio/") === 0 ? "♪" : "");
      if (badgeText) {
        var badge = document.createElement("span");
        badge.className = "ss-gallery-badge";
        badge.textContent = badgeText;
        tile.appendChild(badge);
      }
      tile.addEventListener("click", function (e) {
        e.stopPropagation();
        showGalleryItem(i);
      });
      grid.appendChild(tile);
    });

    galleryEls.title.textContent = "Gallery (" + galleryItems.length + ")";
    document.addEventListener("keydown", onGalleryKey, true);
  }

  function showGalleryItem(index) {
    if (!galleryItems.length) return;
    if (index < 0) index = 0;
    if (index >= galleryItems.length) index = galleryItems.length - 1;
    galleryIndex = index;
    galleryViewerOpen = true;

    var item = galleryItems[index];
    var wrap = galleryEls.mediaWrap;
    wrap.textContent = "";

    var media;
    if (item.mime.indexOf("video/") === 0) {
      media = document.createElement("video");
      media.controls = true;
      media.autoplay = true;
      media.loop = true;
      media.src = item.href;
    } else if (item.mime.indexOf("audio/") === 0) {
      media = document.createElement("audio");
      media.controls = true;
      media.autoplay = true;
      media.src = item.href;
    } else {
      media = document.createElement("img");
      media.src = item.href;
      media.alt = item.name;
    }
    wrap.appendChild(media);

    galleryEls.caption.textContent = (index + 1) + " / " + galleryItems.length + " — " + item.name;
    galleryEls.caption.hidden = false;
    galleryEls.viewer.hidden = false;
    galleryEls.grid.hidden = true;
    galleryEls.backBtn.hidden = false;
    galleryEls.postBtn.hidden = !item.postId;
    galleryEls.prevBtn.disabled = index === 0;
    galleryEls.nextBtn.disabled = index === galleryItems.length - 1;
  }

  function showGalleryGrid() {
    galleryViewerOpen = false;
    galleryEls.viewer.hidden = true;
    galleryEls.grid.hidden = false;
    galleryEls.backBtn.hidden = true;
    galleryEls.postBtn.hidden = true;
    galleryEls.caption.hidden = true;
    galleryEls.mediaWrap.textContent = "";
  }

  function applyMiscFixes() {
    var captchaInput = document.getElementById("QRfieldCaptcha");
    if (captchaInput) captchaInput.autocomplete = "off";
  }

  var COMMENT_DRAFT_PREFIX = "8chanSS_rememberComment:";
  var COMMENT_DRAFT_EXPIRY = 24 * 60 * 60 * 1000;
  var COMMENT_DRAFT_MAX = 10;
  var commentDraftBound = false;

  function commentDraftKey() {
    return COMMENT_DRAFT_PREFIX + location.pathname;
  }

  function removeCommentDraft(key) {
    try { localStorage.removeItem(key); } catch (e) { }
  }

  function loadCommentDraft(key) {
    var raw = null;
    try { raw = localStorage.getItem(key); } catch (e) { return null; }
    if (!raw) return null;
    var entry = null;
    try { entry = JSON.parse(raw); } catch (e) { }
    if (!entry || typeof entry.text !== "string" || typeof entry.savedAt !== "number" ||
      Date.now() - entry.savedAt > COMMENT_DRAFT_EXPIRY) {
      removeCommentDraft(key);
      return null;
    }
    return entry;
  }

  function saveCommentDraft(text) {
    try {
      localStorage.setItem(commentDraftKey(), JSON.stringify({ text: text, savedAt: Date.now() }));
    } catch (e) { }
    cleanupCommentDrafts();
  }

  function cleanupCommentDrafts() {
    var keys = [];
    try {
      for (var i = 0; i < localStorage.length; i++) {
        var key = localStorage.key(i);
        if (key && key.indexOf(COMMENT_DRAFT_PREFIX) === 0) keys.push(key);
      }
    } catch (e) { return; }
    var kept = [];
    for (var j = 0; j < keys.length; j++) {
      var draft = loadCommentDraft(keys[j]);
      if (draft) kept.push({ key: keys[j], savedAt: draft.savedAt });
    }
    kept.sort(function (a, b) { return b.savedAt - a.savedAt; });
    for (var k = COMMENT_DRAFT_MAX; k < kept.length; k++) removeCommentDraft(kept[k].key);
  }

  function restoreCommentDraft(body) {
    var draft = loadCommentDraft(commentDraftKey());
    if (draft && !body.value) {
      body.value = draft.text;
      body.dispatchEvent(new Event("input", { bubbles: true }));
    }
  }

  function bindCommentDraft(attempt) {
    if (commentDraftBound || !ssSettings.rememberCommentDraft) return;
    var body = document.getElementById("qrbody");
    if (!body) {
      if ((attempt || 0) < 20) setTimeout(function () { bindCommentDraft((attempt || 0) + 1); }, 250);
      return;
    }
    commentDraftBound = true;

    var form = body.closest("form");
    var panel = document.getElementById("quick-reply") || body;
    var saveTimer = null;
    var pendingText = null;

    restoreCommentDraft(body);

    body.addEventListener("input", function () {
      if (!ssSettings.rememberCommentDraft) return;
      pendingText = body.value;
      clearTimeout(saveTimer);
      saveTimer = setTimeout(function () {
        if (pendingText && pendingText.trim()) saveCommentDraft(pendingText);
        else removeCommentDraft(commentDraftKey());
      }, 5000);
    });

    function clearSaved() {
      clearTimeout(saveTimer);
      pendingText = null;
      removeCommentDraft(commentDraftKey());
    }

    if (form) form.addEventListener("submit", clearSaved, true);
    panel.addEventListener("click", function (e) {
      var target = e.target;
      if (target && target.closest && target.closest("input[type=submit], button[type=submit]")) clearSaved();
    });
    new MutationObserver(function () {
      if (!ssSettings.rememberCommentDraft) return;
      if (!body.value) restoreCommentDraft(body);
    }).observe(panel, { attributes: true, attributeFilter: ["class"] });
  }

  var quoteThreadingObserver = null;
  var quoteThreadingShortcutWired = false;

  function threadContext() {
    var opCell = document.querySelector("#divThreads .opCell");
    return {
      board: opCell ? opCell.getAttribute("data-boarduri") : "",
      threadId: opCell ? opCell.id : ""
    };
  }
  function quotedParent(postCell, ctx) {
    var quotes = postCell.querySelectorAll("a.quoteLink[href]");
    for (var i = quotes.length - 1; i >= 0; i--) {
      var match = (quotes[i].getAttribute("href") || "").match(/\/([^/]+)\/res\/(\d+)\.html#(\d+)/);
      if (!match) continue;
      if (match[1] !== ctx.board || match[2] !== ctx.threadId) continue;
      var parent = document.getElementById(match[3]);
      if (!parent) continue;
      var parentCell = parent.closest(".postCell, .opCell");
      if (parentCell && parentCell !== postCell) return parentCell;
    }
    return null;
  }

  function wireQuoteThreadingShortcut() {
    if (quoteThreadingShortcutWired) return;
    quoteThreadingShortcutWired = true;
    document.addEventListener("keydown", function (e) {
      if (!e.shiftKey || e.ctrlKey || e.altKey || e.metaKey) return;
      if (e.key !== "t" && e.key !== "T") return;
      var t = e.target;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
      e.preventDefault();
      ssSettings.quoteThreading = !ssSettings.quoteThreading;
      saveSetting("quoteThreading");
      Features.quoteThreading(ssSettings.quoteThreading);
      var box = document.querySelector('input[data-ss-setting="quoteThreading"]');
      if (box) box.checked = ssSettings.quoteThreading;
      showToast("Quote threading " + (ssSettings.quoteThreading ? "enabled" : "disabled"), ssSettings.quoteThreading ? "blue" : "black", 1300);
    });
  }

  function nestUnder(postCell, parentCell) {
    if (!postCell || !parentCell || postCell === parentCell) return;
    if (parentCell.classList.contains("opCell")) return;
    var container = parentCell.querySelector(":scope > .threadedReplies");
    if (!container) {
      container = document.createElement("div");
      container.className = "threadedReplies";
      parentCell.appendChild(container);
    }
    if (postCell.parentNode !== container) container.appendChild(postCell);
  }

  function unthreadPosts() {
    var containers = document.querySelectorAll(".threadedReplies");
    for (var i = containers.length - 1; i >= 0; i--) {
      var container = containers[i];
      var anchor = container.parentNode;
      while (container.firstChild) {
        var child = container.firstChild;
        anchor.after(child);
        anchor = child;
      }
      container.remove();
    }
  }

  function wireQuoteThreading() {
    var root = document.getElementById("divThreads");
    if (!root) return;
    var ctx = threadContext();
    var posts = root.querySelector(".divPosts");
    if (posts) {
      var cells = posts.querySelectorAll(".postCell");
      for (var i = 0; i < cells.length; i++) {
        nestUnder(cells[i], quotedParent(cells[i], ctx));
      }
    }
    if (quoteThreadingObserver) return;
    quoteThreadingObserver = new MutationObserver(function (mutations) {
      var ctx = threadContext();
      for (var i = 0; i < mutations.length; i++) {
        var nodes = mutations[i].addedNodes;
        for (var j = 0; j < nodes.length; j++) {
          var node = nodes[j];
          if (node.nodeType !== 1) continue;
          if (node.classList && node.classList.contains("threadedReplies")) continue;
          if (node.classList && node.classList.contains("postCell")) {
            nestUnder(node, quotedParent(node, ctx));
          } else if (node.querySelectorAll) {
            var cells = node.querySelectorAll(".postCell");
            for (var k = 0; k < cells.length; k++) nestUnder(cells[k], quotedParent(cells[k], ctx));
          }
        }
      }
    });
    quoteThreadingObserver.observe(root, { childList: true, subtree: true });
  }

  var HASH_NAV_LINKS = ".divMessage a.quoteLink, .panelBackLinks a.backLink";
  var hashNavObserver = null;
  var hashNavWired = false;

  function addHashLink(link) {
    if (!link || link.dataset.ssHash) return;
    var match = (link.getAttribute("href") || "").match(/#(\d+)$/);
    if (!match) return;
    link.dataset.ssHash = "1";
    var hash = document.createElement("a");
    hash.className = "ss-hash-link";
    hash.textContent = "#";
    hash.href = "#" + match[1];
    hash.title = "Go to post " + match[1];
    link.after(hash);
  }

  function addHashLinks(root) {
    var links = root.querySelectorAll(HASH_NAV_LINKS);
    for (var i = 0; i < links.length; i++) addHashLink(links[i]);
  }

  function removeHashLinks() {
    var links = document.querySelectorAll(".ss-hash-link");
    for (var i = 0; i < links.length; i++) {
      var prev = links[i].previousElementSibling;
      if (prev && prev.dataset) delete prev.dataset.ssHash;
      links[i].remove();
    }
  }

  function onHashNavClick(e) {
    var target = e.target && e.target.closest ? e.target.closest(".ss-hash-link") : null;
    if (!target) return;
    e.preventDefault();
    e.stopPropagation();
    var id = (target.getAttribute("href") || "").replace("#", "");
    if (!/^\d+$/.test(id)) return;
    if (!document.getElementById(id)) return;
    location.hash = id;
  }

  function wireHashNavigation() {
    var root = document.getElementById("divThreads");
    if (!root) return;
    addHashLinks(root);
    if (hashNavObserver) return;
    hashNavObserver = new MutationObserver(function (mutations) {
      for (var i = 0; i < mutations.length; i++) {
        var nodes = mutations[i].addedNodes;
        for (var j = 0; j < nodes.length; j++) {
          var node = nodes[j];
          if (node.nodeType !== 1) continue;
          if (node.matches && node.matches(HASH_NAV_LINKS)) addHashLink(node);
          else addHashLinks(node);
        }
      }
    });
    hashNavObserver.observe(root, { childList: true, subtree: true });
    if (!hashNavWired) {
      hashNavWired = true;
      root.addEventListener("click", onHashNavClick, true);
    }
  }

  var Features = {
    catalogLinks: function (on) {

      if (on) {
        rewriteHeaderLinks();
        if (!catalogObserver) {
          debouncedCatalogApply = debounce(rewriteHeaderLinks, 100);
          catalogObserver = new MutationObserver(function () { debouncedCatalogApply(); });
          var top = document.getElementById("navBoardsTop");
          var fav = document.getElementById("navBoardsFavorite");
          var root = (top && top.parentNode) || (fav && fav.parentNode) || document.body;
          catalogObserver.observe(root, { childList: true, subtree: true });
        }
      } else {
        if (catalogObserver) { catalogObserver.disconnect(); catalogObserver = null; }
        restoreHeaderLinks();
      }
    },
    customFavicon: function (on) {
      if (on) {
        setFavicon(ssSettings.faviconStyle);
      } else {
        resetFavicon();
      }
    },
    enableMascots: function (on) {
      var old = document.querySelector(".chSS-mascot");
      if (old) old.remove();
      if (!on) return;
      if (!(pageType.isCatalog || pageType.isThread || pageType.isIndex)) return;
      var urls = String(ssSettings.mascotUrls || "").split("\n").map(function (u) {
        return u.trim();
      }).filter(function (u) {
        return u && (u.charAt(0) === "/" || u.indexOf("http") === 0) && /\.(png|apng|jpg|jpeg|gif|webp)$/i.test(u);
      });
      if (!urls.length) return;
      var op = parseInt(ssSettings.mascotOpacity, 10);
      if (isNaN(op)) op = 30;
      var img = document.createElement("img");
      img.className = "chSS-mascot";
      img.alt = "";
      img.src = urls[Math.floor(Math.random() * urls.length)];
      img.style.opacity = Math.max(0, Math.min(100, op)) / 100;
      img.style.bottom = "0px";
      if (!!ssSettings.enableSidebar && !!ssSettings.leftSidebar) {
        img.style.left = "0px";
      } else {
        img.style.right = "0px";
      }
      img.style.maxWidth = ssSettings.enableSidebar ? "312px" : "70vh";
      document.body.appendChild(img);
    },
    hideAnnouncement: function (on) {
      var root = document.documentElement;
      if (!on) {
        root.classList.remove("hide-announcement");
        if (ssSettings.announceHash) {
          ssSettings.announceHash = "";
          deleteSetting("announceHash");
        }
        return;
      }
      var el = document.getElementById("dynamicAnnouncement");
      var content = el ? (el.textContent || "").replace(/[^\w\s.,!?-]/g, "") : "";
      if (ssSettings.announceHash && content && ssSettings.announceHash !== content) {
        ssSettings.hideAnnouncement = false;
        ssSettings.announceHash = "";
        saveSetting("hideAnnouncement");
        deleteSetting("announceHash");
        var box = document.querySelector('input[data-ss-setting="hideAnnouncement"]');
        if (box) box.checked = false;
        root.classList.remove("hide-announcement");
        return;
      }
      root.classList.add("hide-announcement");
      if (content && ssSettings.announceHash !== content) {
        ssSettings.announceHash = content;
        saveSetting("announceHash");
      }
    },
    hidePostingForm: function (on) {
      rootToggle("hide-posting-form", on);
      rootToggle("show-catalog-form", ssSettings.showCatalogForm);
    },
    enableSidebar: function (on) {
      var left = !!ssSettings.leftSidebar;
      rootToggle("ss-sidebar", on && !left);
      rootToggle("ss-leftsidebar", on && left);
    },
    enableStickyQR: function (on) {
      rootToggle("sticky-qr", on);
      if (!on) return;
      var tries = 0;
      (function attempt() {
        if (!ssSettings.enableStickyQR) return;
        if (openQuickReply()) return;
        if (++tries < 5) setTimeout(attempt, 500);
      })();
    },
    blurSpoilers: function (on) {
      rootToggle("ss-blur-spoilers", on);
      if (on && (pageType.isThread || pageType.isIndex)) {
        resetSpoilerLinks();
        processAllSpoilerLinks();
        if (!spoilerThreadsObserver) {
          var pending = [];
          var pendingTimer = 0;
          spoilerThreadsObserver = new MutationObserver(function (mutations) {
            for (var i = 0; i < mutations.length; i++) {
              var nodes = mutations[i].addedNodes;
              for (var j = 0; j < nodes.length; j++) {
                if (nodes[j].nodeType !== 1) continue;
                if (nodes[j].classList && nodes[j].classList.contains("imgLink")) {
                  pending.push(nodes[j]);
                } else if (nodes[j].querySelectorAll) {
                  var found = nodes[j].querySelectorAll(".imgLink");
                  for (var k = 0; k < found.length; k++) pending.push(found[k]);
                }
              }
            }
            if (!pendingTimer) {
              pendingTimer = setTimeout(function () {
                pendingTimer = 0;
                for (var n = 0; n < pending.length; n++) processSpoilerImgLink(pending[n]);
                pending = [];
              }, 50);
            }
          });
          var threads = document.getElementById("divThreads");
          if (threads) spoilerThreadsObserver.observe(threads, { childList: true, subtree: true });
        }
        if (!spoilerTooltipObserver) {
          spoilerTooltipObserver = new MutationObserver(function (mutations) {
            for (var i = 0; i < mutations.length; i++) {
              var nodes = mutations[i].addedNodes;
              for (var j = 0; j < nodes.length; j++) {
                if (nodes[j].nodeType !== 1) continue;
                if (nodes[j].classList && nodes[j].classList.contains("quoteTooltip")) {
                  var links = nodes[j].querySelectorAll("a.imgLink");
                  for (var k = 0; k < links.length; k++) processSpoilerImgLink(links[k]);
                } else if (nodes[j].querySelectorAll) {
                  var tips = nodes[j].querySelectorAll(".quoteTooltip a.imgLink");
                  for (var t = 0; t < tips.length; t++) processSpoilerImgLink(tips[t]);
                }
              }
            }
          });
          spoilerTooltipObserver.observe(document.body, { childList: true, subtree: true });
        }
      } else {
        if (spoilerThreadsObserver) { spoilerThreadsObserver.disconnect(); spoilerThreadsObserver = null; }
        if (spoilerTooltipObserver) { spoilerTooltipObserver.disconnect(); spoilerTooltipObserver = null; }
        resetSpoilerLinks();
      }
    },
    enableMediaPlayer: function (on) {
      if (on) {
        try { localStorage.setItem("mediaViewer", "true"); } catch (e) { }
        mediaPlayerApplied = true;
        document.addEventListener("mousedown", onMediaViewerMouseDown, true);
        positionMediaViewer();
        if (!mediaViewerObserver) {
          mediaViewerObserver = new MutationObserver(function (mutations) {
            for (var i = 0; i < mutations.length; i++) {
              var el = mutations[i].target;
              if (!el.classList || !el.classList.contains("mediaViewer")) continue;
              var isHidden = el.classList.contains("hidden");
              var wasHidden = el.dataset.ssHidden;
              el.dataset.ssHidden = isHidden ? "1" : "0";
              if (wasHidden === undefined || (wasHidden === "1" && !isHidden)) positionMediaViewer(el);
            }
          });
          var menus = document.getElementById("floatingMenus") || document.body;
          mediaViewerObserver.observe(menus, { subtree: true, attributes: true, attributeFilter: ["class"] });
        }
      } else {
        if (mediaViewerObserver) {
          mediaViewerObserver.disconnect();
          mediaViewerObserver = null;
        }
        document.removeEventListener("mousedown", onMediaViewerMouseDown, true);
        if (mediaPlayerApplied) {
          try { localStorage.setItem("mediaViewer", "false"); } catch (e) { }
          mediaPlayerApplied = false;
        }
        var viewers = document.querySelectorAll(".mediaViewer");
        for (var v = 0; v < viewers.length; v++) {
          viewers[v].classList.remove("topright", "topleft");
        }
      }
    },
    catalogFiltering: function (on) {
      if (!pageType.isCatalog) return;
      if (on) {
        applyCatalogFilters();
        if (!catalogFilterObserver) {
          debouncedCatalogFilterApply = debounce(applyCatalogFilters, 50);
          var catalogDiv = document.querySelector(".catalogDiv");
          if (catalogDiv) catalogFilterObserver = new MutationObserver(function () { debouncedCatalogFilterApply(); });
          if (catalogFilterObserver) catalogFilterObserver.observe(catalogDiv, { childList: true, subtree: false });
        }
      } else {
        if (catalogFilterObserver) { catalogFilterObserver.disconnect(); catalogFilterObserver = null; }
        var cells = document.querySelectorAll(".catalogCell.ss-hidden-thread");
        for (var i = 0; i < cells.length; i++) {
          cells[i].classList.remove("ss-hidden-thread");
        }
      }
    },
    catalogNewTab: function (on) {
      if (!pageType.isCatalog) return;
      if (on) {
        applyCatalogNewTab();
      } else {
        removeCatalogNewTab();
      }
    },
    catalogImageHover: function (on) {
      if (on) {
        wireHoverOnce();
      } else {
        cleanupFloatingMedia();
      }
    },
    threadImageHover: function (on) {
      if (on) {
        try {
          localStorage.setItem("hoveringImage", "false");
          localStorage.setItem("restrictHoverPreviewSize", "false");
        } catch (e) { }
        wireHoverOnce();
      } else {
        cleanupFloatingMedia();
      }
    },
    lastFifty: function (on) {
      if (!pageType.isCatalog) return;
      if (on) {
        addLastLinkButtons();
        if (!lastFiftyObserver) {
          debouncedLastFifty = debounce(addLastLinkButtons, 50);
          var catalogDiv = document.querySelector(".catalogDiv");
          if (catalogDiv) lastFiftyObserver = new MutationObserver(function () { debouncedLastFifty(); });
          if (lastFiftyObserver) lastFiftyObserver.observe(catalogDiv, { childList: true, subtree: false });
        }
      } else {
        if (lastFiftyObserver) { lastFiftyObserver.disconnect(); lastFiftyObserver = null; }
        var btns = document.querySelectorAll(".last-link-btn");
        for (var i = 0; i < btns.length; i++) btns[i].remove();
      }
    },
    truncFilenames: function (on) {
      if (pageType.isCatalog) return;
      if (on) {
        applyTruncFilenames();
        var container = document.getElementById("divThreads");
        if (container && !truncWired) {
          truncWired = true;
          truncContainer = container;
          container.addEventListener("mouseover", onTruncOver);
          container.addEventListener("mouseout", onTruncOut);
        }
        if (!truncObserver) {
          debouncedTruncApply = debounce(applyTruncFilenames, 100);
          truncObserver = new MutationObserver(function () { debouncedTruncApply(); });
          truncObserver.observe(container || document.body, { childList: true, subtree: true });
        }
      } else {
        if (truncObserver) { truncObserver.disconnect(); truncObserver = null; }
        if (truncContainer) {
          truncContainer.removeEventListener("mouseover", onTruncOver);
          truncContainer.removeEventListener("mouseout", onTruncOut);
          truncContainer = null;
          truncWired = false;
        }
        restoreTruncFilenames();
      }
    },
    enableScrollSave: function (on) {
      if (!pageType.isThread) return;
      if (!on) {
        if (scrollSaveWired) {
          window.removeEventListener("scroll", onScrollSave);
          window.removeEventListener("beforeunload", onBeforeUnloadSave);
          scrollSaveWired = false;
        }
        removeUnreadLine();
        return;
      }
      if (!ssSettings.showUnreadLine) removeUnreadLine();
      if (!scrollSaveWired) {
        scrollSaveWired = true;
        scrollSaveLastY = window.scrollY;
        window.addEventListener("scroll", onScrollSave, { passive: true });
        window.addEventListener("beforeunload", onBeforeUnloadSave);
        if (document.readyState !== "complete") {
          window.addEventListener("load", function () { restoreScrollPosition(); }, { once: true });
        }
      }
      restoreScrollPosition();
    },
    scrollArrows: function (on) {
      var el = document.getElementById("ssScrollArrows");
      if (on && !el) {
        el = document.createElement("div");
        el.id = "ssScrollArrows";
        var up = document.createElement("button");
        up.type = "button"; up.textContent = "↑"; up.dataset.dir = "-1"; up.title = "Scroll up";
        var dn = document.createElement("button");
        dn.type = "button"; dn.textContent = "↓"; dn.dataset.dir = "1"; dn.title = "Scroll down";
        el.appendChild(up); el.appendChild(dn);
        el.addEventListener("click", function (e) {
          var b = e.target.closest("button[data-dir]");
          if (!b) return;
          if (ssSettings.arrowPageScroll) {
            window.scrollBy({ top: Number(b.dataset.dir) * window.innerHeight * 0.9, behavior: "smooth" });
          } else if (b.dataset.dir === "-1") {
            window.scrollTo({ top: 0, behavior: "smooth" });
          } else {
            window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "smooth" });
          }
        });
        document.body.appendChild(el);
      } else if (!on && el) {
        el.remove();
      }
    },
    autoHideHeaderScroll: function (on) {
      if (on) {
        var header = document.getElementById("dynamicHeaderThread");
        if (!header) return;
        rootToggle("ss-autohide-header", true);
        autoHideHeaderEl = header;
        autoHideLastScrollY = window.scrollY;
        if (!autoHideHeaderWired) {
          autoHideHeaderWired = true;
          window.addEventListener("scroll", onAutoHideScroll, { passive: true });
        }
        updateAutoHideHeader();
      } else {
        rootToggle("ss-autohide-header", false);
        if (autoHideHeaderWired) {
          window.removeEventListener("scroll", onAutoHideScroll);
          autoHideHeaderWired = false;
        }
        if (autoHideHeaderEl) {
          autoHideHeaderEl.classList.remove("nav-hidden");
          autoHideHeaderEl = null;
        }
      }
    },
    enablePNGstop: function (on) {
      if (on) {
        processAllAPNGThumbs(document);
        if (!apngObserver) {
          apngObserver = new MutationObserver(function (mutations) {
            for (var i = 0; i < mutations.length; i++) {
              var nodes = mutations[i].addedNodes;
              for (var j = 0; j < nodes.length; j++) {
                if (nodes[j].nodeType === 1) processAllAPNGThumbs(nodes[j]);
              }
            }
          });
          apngObserver.observe(document.body, { childList: true, subtree: true });
        }
      } else {
        if (apngObserver) { apngObserver.disconnect(); apngObserver = null; }
        restoreAPNGThumbs();
      }
    },
    highlightNewIds: function (on) {
      if (pageType.isCatalog || pageType.isLast) return;
      if (!on) {
        if (highlightIdsObserver) { highlightIdsObserver.disconnect(); highlightIdsObserver = null; }
        clearHighlightNewIds();
        return;
      }
      if (!document.querySelector(".spanId")) return;
      applyHighlightNewIds();
      if (!highlightIdsObserver) {
        debouncedHighlightIds = debounce(applyHighlightNewIds, 50);
        var posts = document.querySelector(".divPosts");
        if (posts) {
          highlightIdsObserver = new MutationObserver(function (mutations) {
            var needsUpdate = false;
            for (var i = 0; i < mutations.length && !needsUpdate; i++) {
              var nodes = mutations[i].addedNodes;
              for (var j = 0; j < nodes.length; j++) {
                var node = nodes[j];
                if (node.nodeType !== 1) continue;
                if ((node.matches && node.matches(".labelId")) ||
                  (node.querySelector && node.querySelector(".labelId"))) {
                  needsUpdate = true;
                  break;
                }
              }
            }
            if (needsUpdate) debouncedHighlightIds();
          });
          highlightIdsObserver.observe(posts, { childList: true, subtree: true });
        }
      }
    },
    showLinkIcons: function () { initEnhancedLinks(); },
    linkThumbnails: function () { initEnhancedLinks(); },
    linkEmbeds: function () { initEnhancedLinks(); },
    sauceLinks: function (on) {
      if (on) {
        initSauceLinks();
        return;
      }
      var containers = document.querySelectorAll(".sauceLinksContainer");
      for (var i = 0; i < containers.length; i++) containers[i].remove();
      var processed = document.querySelectorAll(".sauceLinksProcessed");
      for (var j = 0; j < processed.length; j++) processed[j].classList.remove("sauceLinksProcessed");
    },
    autoSaveDaily: function (on) {
      if (autoSaveTimer) {
        clearInterval(autoSaveTimer);
        autoSaveTimer = null;
      }
      if (!on) return;
      runAutoSave();
      autoSaveTimer = setInterval(runAutoSave, 60 * 60 * 1000);
    },
    beepOnYou: function (on) {
      if (!on) {
        if (beepOnYouObserver) { beepOnYouObserver.disconnect(); beepOnYouObserver = null; }
        return;
      }
      if (beepOnYouObserver) return;
      var posts = document.querySelector(".divPosts");
      if (!posts) return;
      var lastPostId = 0;
      var existing = posts.querySelectorAll(".postCell[id], .opCell[id]");
      for (var i = 0; i < existing.length; i++) {
        var existingId = parseInt(existing[i].id, 10);
        if (existingId > lastPostId) lastPostId = existingId;
      }
      beepOnYouObserver = new MutationObserver(function (mutations) {
        var beeped = false;
        for (var i = 0; i < mutations.length; i++) {
          var nodes = mutations[i].addedNodes;
          for (var j = 0; j < nodes.length; j++) {
            var node = nodes[j];
            if (node.nodeType !== 1 || !node.matches || !node.matches(".postCell, .opCell")) continue;
            var postId = parseInt(node.id, 10);
            if (!postId || postId <= lastPostId) continue;
            lastPostId = postId;
            if (beeped || node.querySelector(".yourPost")) continue;
            if (node.querySelector("a.quoteLink.postLink--you")) {
              beeped = true;
              playBeep();
            }
          }
        }
      });
      beepOnYouObserver.observe(posts, { childList: true, subtree: false });
    },
    styleScrollbars: function (on) {
      rootToggle("ss-scrollbars", on);
      rootToggle("ss-thin-scrollbars", !!on && !!ssSettings.thinScrollbars);
    },
    alwaysShowIdCount: function (on) {
      if (on) {
        setNativeIdCount(true);
        idCountApplied = true;
        return;
      }
      if (!idCountApplied) return;
      setNativeIdCount(false);
      idCountApplied = false;
    },
    gallery: function (on) {
      if (on) {
        if (galleryWired) return;
        galleryWired = true;
        document.addEventListener("click", onGalleryButtonClick, true);
      } else {
        if (galleryWired) {
          document.removeEventListener("click", onGalleryButtonClick, true);
          galleryWired = false;
        }
        closeGallery();
      }
    },
    applyFixes: function (on) {
      if (on) applyMiscFixes();
    },
    moveUploads: function (on) {
      var innerOP = document.querySelector(".innerOP");
      if (!innerOP) return;
      var opHeadTitle = innerOP.querySelector(".opHead.title");
      if (!opHeadTitle) return;
      if (on) {
        if (innerOP.firstChild !== opHeadTitle) innerOP.insertBefore(opHeadTitle, innerOP.firstChild);
      } else {
        var uploads = innerOP.querySelector(".panelUploads");
        if (uploads) uploads.after(opHeadTitle);
      }
    },
    rememberCommentDraft: function (on) {
      if (on) bindCommentDraft();
    },
    quoteThreading: function (on) {
      wireQuoteThreadingShortcut();
      if (on) {
        wireQuoteThreading();
      } else {
        unthreadPosts();
        if (quoteThreadingObserver) {
          quoteThreadingObserver.disconnect();
          quoteThreadingObserver = null;
        }
      }
    },
    hashNavigation: function (on) {
      if (on) {
        wireHashNavigation();
      } else {
        removeHashLinks();
        if (hashNavObserver) {
          hashNavObserver.disconnect();
          hashNavObserver = null;
        }
      }
    }
  };

  function applyAll() {
    for (var k in Features) {
      try { Features[k](ssSettings[k]); }
      catch (err) { console.error("[8chanSS] feature failed:", k, err); }
    }
  }
  var CLASS_TOGGLES = {
    bottomHeader: "ss-bottom-header",
    hidePanelMessage: "hide-panelmessage",
    hideBanner: "disable-banner",
    hideNoCookieLink: "hide-nocookie",
    hideJannyTools: "hide-jannytools",
    hlCurrentBoard: "hl-currentBoard",
    showReplyHeader: "ss-replyhead",
    hideFooter: "ss-hide-footer",
    roundedCorners: "ss-rounded",
    enableFitReplies: "fit-replies",
    highlightOnYou: "highlight-yous",
    opBackground: "op-background",
    fadeQuickReply: "fade-qr",
    threadHideCloseBtn: "hide-close-btn",
    backlinkIcons: "backlink-icon",
    noPinInCatalog: "ss-nopin-catalog",
    smallFont: "ss-small-font",
    expandTW: "auto-expand-tw"
  };
  Object.keys(CLASS_TOGGLES).forEach(function (key) {
    Features[key] = function (on) { rootToggle(CLASS_TOGGLES[key], on); };
  });
  var TOAST_COLORS = {
    black: "#222",
    orange: "#cc7a00",
    green: "#339933",
    blue: "#1976d2",
    red: "#c62828"
  };

  function sanitizeToastHTML(html) {
    html = String(html).replace(/<(?!\/?(?:a|b|i|u|strong|em|br)\b)[^>]*>/gi, "");
    html = html.replace(/<(b|i|u|strong|em|br)\b[^>]*>/gi, "<$1>");
    html = html.replace(/<\/(b|i|u|strong|em|br)\b[^>]*>/gi, "</$1>");
    html = html.replace(/<a\s+([^>]+)>/gi, function (match, attrs) {
      var allowed = "";
      attrs.replace(/(\w+)\s*=\s*(['"])(.*?)\2/gi, function (_, name, q, value) {
        name = name.toLowerCase();
        if (name === "href" || name === "target" || name === "rel") {
          if (name === "href" && (/^\s*javascript:/i.test(value) || /^\s*data:/i.test(value))) return;
          allowed += " " + name + "=" + q + value + q;
        }
      });
      return "<a" + allowed + ">";
    });
    return html;
  }

  function showToast(htmlMessage, color, duration) {
    color = TOAST_COLORS[color] ? color : "black";
    duration = duration > 0 ? duration : 1200;
    var box = document.getElementById("ss-toasts");
    if (!box) {
      box = document.createElement("div");
      box.id = "ss-toasts";
      document.body.appendChild(box);
    }
    while (box.children.length >= 4) box.removeChild(box.firstChild);
    var toast = document.createElement("div");
    toast.className = "ss-toast ss-toast-" + color;
    toast.innerHTML = sanitizeToastHTML(htmlMessage);
    toast.addEventListener("click", function (ev) {
      if (ev.target.closest("a")) return;
      if (toast.parentNode) toast.parentNode.removeChild(toast);
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    });
    box.appendChild(toast);
    var fadeTimer = setTimeout(function () { toast.classList.add("ss-toast-hide"); }, Math.max(0, duration - 300));
    var removeTimer = setTimeout(function () {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, duration);
  }

  function checkUpdateNotif() {
    if (!ssSettings.updateNotif || ssSettings.ssVersion === VERSION) return;
    var firstInstall = !ssSettings.ssVersion;
    ssSettings.ssVersion = VERSION;
    saveSetting("ssVersion");
    if (!firstInstall) {
      showToast(
        "8chanSS has updated to <b>v" + VERSION + '</b>. Check out the <b><a href="https://github.com/otacoo/8chanSS/blob/main/CHANGELOG.md" target="_blank" rel="noopener noreferrer">changelog</a></b>.',
        "blue",
        15000
      );
    }
  }
  var BBCODE_TAGS = {
    s: ["[spoiler]", "[/spoiler]"],
    b: ["'''", "'''"],
    u: ["__", "__"],
    i: ["''", "''"],
    d: ["[doom]", "[/doom]"],
    m: ["[moe]", "[/moe]"],
    c: ["[code]", "[/code]"],
    e: ["(((", ")))"],
    "shift+b": ["==", "=="]
  };
  var lastHighlightedPost = null;
  var lastScrollType = null;
  var lastRefreshTime = 0;

  function applyBBCode(textBox, key) {
    var tags = BBCODE_TAGS[key];
    var openTag = tags[0];
    var closeTag = tags[1];
    var start = textBox.selectionStart;
    var end = textBox.selectionEnd;
    var value = textBox.value;
    var before = value.slice(0, start);
    var after = value.slice(end);
    if (start === end) {
      textBox.value = before + openTag + closeTag + after;
      textBox.selectionStart = textBox.selectionEnd = start + openTag.length;
    } else {
      textBox.value = before + openTag + value.slice(start, end) + closeTag + after;
      textBox.selectionStart = start + openTag.length;
      textBox.selectionEnd = end + openTag.length;
    }
    textBox.dispatchEvent(new Event("input", { bubbles: true }));
  }

  function scrollToReply(isOwnReply, getNext) {
    var anchors = document.querySelectorAll(isOwnReply ? "a.youName" : "a.quoteLink.postLink--you");
    var cells = [];
    for (var i = 0; i < anchors.length; i++) {
      var cell = anchors[i].closest(".postCell, .opCell");
      if (cell && cells.indexOf(cell) === -1) cells.push(cell);
    }
    if (!cells.length) return;
    var want = isOwnReply ? "own" : "reply";
    var current = -1;
    if (lastScrollType === want && lastHighlightedPost) {
      current = cells.indexOf(lastHighlightedPost.closest(".postCell, .opCell"));
    }
    if (current === -1) {
      var mid = window.innerHeight / 2;
      current = cells.findIndex(function (cell) {
        var rect = cell.getBoundingClientRect();
        return rect.top + rect.height / 2 > mid;
      });
      if (current === -1) current = getNext ? -1 : cells.length;
    }
    var target = getNext ? current + 1 : current - 1;
    if (target < 0 || target >= cells.length) return;
    var container = cells[target];
    container.scrollIntoView({ behavior: "smooth", block: "center" });
    if (lastHighlightedPost) lastHighlightedPost.classList.remove("target-highlight");
    var anchor = container.querySelector('[id^="p"]');
    var anchorId = (anchor && anchor.id) || container.id;
    if (anchorId && location.hash !== "#" + anchorId) {
      try { history.replaceState(null, "", "#" + anchorId); } catch (e) { }
    }
    var inner = container.querySelector(".innerPost");
    if (inner) {
      inner.classList.add("target-highlight");
      lastHighlightedPost = inner;
    } else {
      lastHighlightedPost = null;
    }
    lastScrollType = want;
  }

  function toggleWatchThread() {
    try {
      var w = pageWindow();
      if (!w.watcher || !w.posting || !w.api || !w.api.boardUri || !w.api.threadId) return;
      var op = w.posting.get(w.posting.uri(w.api.boardUri, w.api.threadId));
      if (op) w.watcher.watchThread(op);
    } catch (e) { }
  }

  function toggleWatcherMenu() {
    try {
      var w = pageWindow();
      if (w.watcher && typeof w.watcher.toggleWatcher === "function") w.watcher.toggleWatcher();
    } catch (e) { }
  }

  function initShortcuts() {
    window.addEventListener("hashchange", function () {
      if (lastHighlightedPost) {
        lastHighlightedPost.classList.remove("target-highlight");
        lastHighlightedPost = null;
      }
    });

    document.addEventListener("keydown", function (e) {
      if (!ssSettings.enableShortcuts || e.metaKey) return;
      var t = e.target;
      var inQR = t && (t.id === "qrbody" || t.id === "fieldMessage");

      if (e.key === "Tab" && !e.ctrlKey && !e.altKey && !e.metaKey) {
        var qrbody = document.getElementById("qrbody");
        var captcha = document.getElementById("QRfieldCaptcha");
        if (qrbody) {
          if (document.activeElement === qrbody && captcha) {
            e.preventDefault();
            captcha.focus();
          } else if (document.activeElement === captcha) {
            e.preventDefault();
            qrbody.focus();
          } else if (document.activeElement !== qrbody) {
            e.preventDefault();
            qrbody.focus();
          }
        }
        return;
      }

      if (inQR) {
        if (e.ctrlKey && e.key === "Enter") {
          e.preventDefault();
          var submit = document.getElementById("qrbutton");
          if (submit) submit.click();
          return;
        }
        var bbKey = e.key.toLowerCase();
        var bbCombo = (e.shiftKey ? "shift+" : "") + bbKey;
        if (e.altKey && !e.ctrlKey && (bbKey === "c" || bbKey === "e")) {
          e.preventDefault();
          applyBBCode(t, bbKey);
          return;
        }
        if (e.ctrlKey && !e.altKey && bbKey !== "c" && BBCODE_TAGS[bbCombo]) {
          e.preventDefault();
          applyBBCode(t, bbCombo);
          return;
        }
        return;
      }

      var tag = t && t.tagName;
      if (t && (tag === "INPUT" || tag === "TEXTAREA" || t.isContentEditable)) return;

      if (e.ctrlKey && (e.key === "q" || e.key === "Q")) {
        e.preventDefault();
        var qr = document.getElementById("quick-reply");
        if (!qr) return;
        var hidden = qr.style.display === "none" || qr.style.display === "";
        qr.style.display = hidden ? "block" : "none";
        if (hidden) {
          setTimeout(function () {
            var area = document.getElementById("qrbody");
            if (area) area.focus();
          }, 50);
        }
        return;
      }

      if (!e.ctrlKey && !e.altKey && (e.key === "r" || e.key === "R")) {
        var threadBtn = pageType.isThread && document.getElementById("refreshButton");
        var catalogBtn = pageType.isCatalog && document.getElementById("catalogRefreshButton");
        if (threadBtn || catalogBtn) {
          e.preventDefault();
          if (Date.now() - lastRefreshTime >= 5000) {
            lastRefreshTime = Date.now();
            (threadBtn || catalogBtn).click();
          }
        }
        return;
      }

      if (!e.ctrlKey && !e.altKey && (e.key === "g" || e.key === "G")) {
        if (ssSettings.gallery) {
          e.preventDefault();
          openGallery();
        }
        return;
      }

      if (!e.ctrlKey && !e.altKey && e.key === "Escape") {
        var area = document.getElementById("qrbody");
        if (area) area.value = "";
        var quickReply = document.getElementById("quick-reply");
        if (quickReply) {
          quickReply.style.removeProperty("display");
          if (!quickReply.classList.contains("hidden")) {
            var closeBtn = quickReply.querySelector(".close-btn");
            if (closeBtn) closeBtn.click();
          }
        }
        var watcher = document.getElementById("watchedMenu");
        if (watcher) watcher.style.removeProperty("display");
        return;
      }

      if (e.ctrlKey && !e.altKey && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
        e.preventDefault();
        scrollToReply(!e.shiftKey, e.key === "ArrowDown");
        return;
      }

      if (e.altKey && !e.ctrlKey && (e.key === "w" || e.key === "W")) {
        e.preventDefault();
        toggleWatchThread();
        return;
      }

      if (e.altKey && !e.ctrlKey && (e.key === "t" || e.key === "T")) {
        e.preventDefault();
        toggleWatcherMenu();
        return;
      }
    });
  }

  var ssMenuInjected = false;
  var filterBoxEl = null;

  function newFilterKey() {
    return "filter_" + Date.now() + "_" + Math.random().toString(36).slice(2, 9);
  }

  function appendFilterRow(data) {
    var row = document.createElement("div");
    row.className = "ss-filterrow";
    row.setAttribute("data-filter-key", (data && data.key) || newFilterKey());
    var word = document.createElement("input");
    word.type = "text";
    word.className = "ss-filterword";
    word.placeholder = "Filter word";
    if (data && data.word) word.value = data.word;
    var boards = document.createElement("input");
    boards.type = "text";
    boards.className = "ss-filterboards";
    boards.placeholder = "Boards (comma-separated, empty for all)";
    if (data && data.boards) boards.value = data.boards;
    var rm = document.createElement("button");
    rm.type = "button";
    rm.className = "ss-filterrm";
    rm.textContent = "✕";
    rm.title = "Remove filter";
    rm.addEventListener("click", function (ev) {
      ev.preventDefault();
      ev.stopPropagation();
      row.remove();
      saveFilterBox();
    });
    row.appendChild(word);
    row.appendChild(boards);
    row.appendChild(rm);
    return row;
  }

  function saveFilterBox() {
    if (!filterBoxEl) return;
    var obj = {};
    var rows = filterBoxEl.querySelectorAll(".ss-filterrow");
    for (var i = 0; i < rows.length; i++) {
      var word = rows[i].querySelector(".ss-filterword").value.trim();
      if (!word) continue;
      var key = rows[i].getAttribute("data-filter-key");
      obj[key] = { word: word, boards: rows[i].querySelector(".ss-filterboards").value.trim(), key: key };
    }
    ssSettings.catalogFilters = obj;
    saveSetting("catalogFilters");
    if (ssSettings.catalogFiltering) applyCatalogFilters();
  }

  function refreshFilterBox() {
    if (filterBoxEl) filterBoxEl.hidden = !ssSettings.catalogFiltering;
  }

  function buildFilterBox() {
    var box = document.createElement("div");
    box.className = "ss-filterbox";
    var help = document.createElement("div");
    help.className = "ss-filterhelp";
    help.textContent = "Use * as wildcard: word (contains), word* (starts with), *word (ends with), *word* (contains)";
    box.appendChild(help);
    var list = document.createElement("div");
    var saved = ssSettings.catalogFilters || {};
    Object.keys(saved).forEach(function (k) {
      if (saved[k] && saved[k].word) list.appendChild(appendFilterRow(saved[k]));
    });
    box.appendChild(list);
    var add = document.createElement("button");
    add.type = "button";
    add.className = "ss-filteradd";
    add.textContent = "Add New Filter";
    add.addEventListener("click", function (ev) {
      ev.stopPropagation();
      var row = appendFilterRow(null);
      list.appendChild(row);
      row.querySelector(".ss-filterword").focus();
    });
    box.appendChild(add);
    box.addEventListener("change", function () { saveFilterBox(); });
    box.hidden = !ssSettings.catalogFiltering;
    filterBoxEl = box;
    return box;
  }

  var AUTO_SAVE_KEY = "8chanSS_lastAutoSave";
  var AUTO_SAVE_INTERVAL = 24 * 60 * 60 * 1000;
  var autoSaveTimer = null;

  function readLocal(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  }

  function writeLocal(key, value) {
    try { localStorage.setItem(key, value); return true; } catch (e) { return false; }
  }

  function gmBackup(gmKey, value) {
    if (typeof GM === "undefined" || !GM.setValue) return Promise.resolve(false);
    return GM.setValue(gmKey, value).then(function () { return true; }).catch(function () { return false; });
  }

  function gmFetch(gmKey) {
    if (typeof GM === "undefined" || !GM.getValue) return Promise.resolve(null);
    return GM.getValue(gmKey, null).catch(function () { return null; });
  }

  function collectYousData() {
    var data = {};
    try {
      for (var i = 0; i < localStorage.length; i++) {
        var key = localStorage.key(i);
        if (key && key.slice(-5) === "-yous") data[key] = localStorage.getItem(key);
      }
    } catch (e) { }
    return data;
  }

  function saveYousData() {
    var data = collectYousData();
    if (!Object.keys(data).length) return Promise.resolve(false);
    return gmBackup("8chanSS_savedMyPosts", JSON.stringify(data));
  }

  var SS_BACKUPS = {
    watchedData: { gmKey: "8chanSS_watchedData", title: "Watched threads", name: "watched threads" },
    navBoardData: { gmKey: "8chanSS_savedFavoriteBoards", title: "Favorite boards", name: "favorite boards" }
  };

  function saveBackup(localKey, silent) {
    var info = SS_BACKUPS[localKey];
    var raw = readLocal(localKey);
    if (!raw) {
      if (!silent) showToast("No " + info.name + " found in localStorage.", "orange", 2500);
      return Promise.resolve(false);
    }
    return gmBackup(info.gmKey, raw).then(function (ok) {
      if (!silent) showToast(ok ? info.title + " saved!" : "Failed to save " + info.name + ".", ok ? "green" : "red", ok ? 2000 : 2500);
      return ok;
    });
  }

  function restoreBackup(localKey) {
    var info = SS_BACKUPS[localKey];
    return gmFetch(info.gmKey).then(function (saved) {
      if (!saved) { showToast("No saved " + info.name + " found.", "orange", 2500); return; }
      if (!writeLocal(localKey, saved)) { showToast("Failed to restore " + info.name + ".", "red", 2500); return; }
      showToast(info.title + " restored. Please reload the page.", "blue", 3000);
    });
  }

  function runAutoSave() {
    var last = parseInt(readLocal(AUTO_SAVE_KEY), 10) || 0;
    if (Date.now() - last < AUTO_SAVE_INTERVAL) return;
    writeLocal(AUTO_SAVE_KEY, String(Date.now()));
    saveYousData();
    saveBackup("watchedData", true);
    saveBackup("navBoardData", true);
  }

  var SS_BUTTONS = {
    saveMyPosts: function () {
      var count = Object.keys(collectYousData()).length;
      if (!count) {
        showToast("No posts found in localStorage.", "orange", 2500);
        return;
      }
      saveYousData().then(function (ok) {
        showToast(ok ? "My posts saved (" + count + " boards)!" : "Failed to save my posts.", ok ? "green" : "red", ok ? 2000 : 2500);
      });
    },
    restoreMyPosts: function () {
      gmFetch("8chanSS_savedMyPosts").then(function (raw) {
        var data = null;
        try { data = raw ? JSON.parse(raw) : null; } catch (e) { }
        if (!data || typeof data !== "object") {
          showToast("No saved posts found.", "orange", 2500);
          return;
        }
        var count = 0;
        Object.keys(data).forEach(function (k) { if (writeLocal(k, data[k])) count++; });
        showToast("My posts restored (" + count + " boards). Please reload the page.", "blue", 3000);
      });
    },
    saveWatchedThreads: function () { saveBackup("watchedData"); },
    saveFavoriteBoards: function () { saveBackup("navBoardData"); },
    restoreWatchedThreads: function () { restoreBackup("watchedData"); },
    restoreFavoriteBoards: function () { restoreBackup("navBoardData"); }
  };

  function makeButton(opt) {
    var button = document.createElement("button");
    button.type = "button";
    button.className = "ss-storage-btn";
    button.textContent = opt.label;
    button.addEventListener("click", function (ev) {
      ev.preventDefault();
      ev.stopPropagation();
      var handler = SS_BUTTONS[opt.key];
      if (handler) handler();
    });
    return button;
  }

  function makeOptionLabel(opt) {
    var label = document.createElement("label");
    if (opt.title) label.title = opt.title;
    if (opt.type === "select") {
      label.className = "settingsRow--allowWrap";
      label.appendChild(document.createTextNode(opt.label));
      var select = document.createElement("select");
      select.setAttribute("data-ss-setting", opt.key);
      opt.options.forEach(function (o) {
        var el = document.createElement("option");
        el.value = o.value;
        el.textContent = o.label;
        select.appendChild(el);
      });
      select.value = ssSettings[opt.key];
      label.appendChild(select);
      return label;
    }
    if (opt.type === "number") {
      label.className = "settingsRow--allowWrap";
      label.appendChild(document.createTextNode(opt.label));
      var num = document.createElement("input");
      num.type = "number";
      num.min = opt.min;
      num.max = opt.max;
      num.value = ssSettings[opt.key];
      num.setAttribute("data-ss-setting", opt.key);
      label.appendChild(num);
      return label;
    }
    if (opt.type === "textarea") {
      label.className = "ss-textarea-row";
      label.appendChild(document.createTextNode(opt.label));
      var ta = document.createElement("textarea");
      ta.rows = opt.rows || 4;
      if (opt.placeholder) ta.placeholder = opt.placeholder;
      ta.value = ssSettings[opt.key] || "";
      ta.setAttribute("data-ss-setting", opt.key);
      label.appendChild(ta);
      return label;
    }
    var input = document.createElement("input");
    input.type = "checkbox";
    input.setAttribute("data-ss-setting", opt.key);
    input.checked = !!ssSettings[opt.key];
    label.appendChild(input);
    label.appendChild(document.createTextNode(opt.label));
    return label;
  }

  function ssFooter() {
    var foot = document.createElement("p");
    foot.className = "ss-foot";
    foot.appendChild(document.createTextNode("8chanSS v" + VERSION + " · "));
    var cl = document.createElement("a");
    cl.href = "https://github.com/otacoo/8chanSS/blob/main/CHANGELOG.md";
    cl.target = "_blank"; cl.rel = "noopener noreferrer"; cl.textContent = "Changelog";
    var iss = document.createElement("a");
    iss.href = "https://github.com/otacoo/8chanSS/issues";
    iss.target = "_blank"; iss.rel = "noopener noreferrer"; iss.textContent = "Issues";
    foot.appendChild(cl);
    foot.appendChild(document.createTextNode(" · "));
    foot.appendChild(iss);
    return foot;
  }

  function buildShortcutTable() {
    var wrap = document.createElement("div");
    var note = document.createElement("p");
    note.className = "ss-note";
    note.textContent = "Text formatting shortcuts work when text is selected or when inserting at cursor position.";
    wrap.appendChild(note);
    var rows = [
      [["Tab"], "Target Quick Reply text area"],
      [["R"], "Refresh Thread (5 sec. cooldown)"],
      [["G"], "Open Gallery"],
      [["Ctrl", "Q"], "Toggle Quick Reply"],
      [["Ctrl", "Enter"], "Submit post"],
      [["Escape"], "Clear QR textarea and hide dialogs"],
      [["Alt", "W"], "Watch/Unwatch Thread"],
      [["Alt", "T"], "Toggle Thread Watcher"],
      [["Shift", "T"], "Toggle Quote Threading"],
      [["Shift", "Click"], "Hide Thread in Catalog"],
      [["Ctrl", "Up/Down"], "Scroll between Your Replies"],
      [["Ctrl", "Shift", "Up/Down"], "Scroll between Replies to You"],
      [["Ctrl", "B"], "Bold text"],
      [["Ctrl", "I"], "Italic text"],
      [["Ctrl", "U"], "Underline text"],
      [["Ctrl", "S"], "Spoiler text"],
      [["Ctrl", "D"], "Doom text"],
      [["Ctrl", "Shift", "B"], "Srz Bizniz text"],
      [["Ctrl", "M"], "Moe text"],
      [["Alt", "C"], "Code block"],
      [["Alt", "E"], "Echo text"]
    ];
    var table = document.createElement("table");
    table.className = "ss-keys";
    rows.forEach(function (row) {
      var tr = document.createElement("tr");
      var keys = document.createElement("td");
      row[0].forEach(function (key, i) {
        if (i > 0) keys.appendChild(document.createTextNode(" + "));
        var kbd = document.createElement("kbd");
        kbd.textContent = key;
        keys.appendChild(kbd);
      });
      var action = document.createElement("td");
      action.textContent = row[1];
      tr.appendChild(keys);
      tr.appendChild(action);
      table.appendChild(tr);
    });
    wrap.appendChild(table);
    return wrap;
  }

  function buildSsPage(def) {
    var section = document.createElement("section");
    section.className = "settingsSection";
    section.dataset.section = def.page;

    var h2 = document.createElement("h2");
    h2.className = "settingsSectionTitle";
    h2.textContent = def.title;
    section.appendChild(h2);

    var panel = document.createElement("div");
    panel.className = "panelContents settingsPanel";
    panel.dataset.tabTitle = def.page;
    var buttonGrid = null;
    def.options.forEach(function (opt) {
      if (opt.head) {
        buttonGrid = null;
        var h = document.createElement("h3");
        h.className = "ss-subhead";
        h.textContent = opt.head;
        panel.appendChild(h);
        return;
      }
      if (opt.type === "button") {
        if (!buttonGrid) {
          buttonGrid = document.createElement("div");
          buttonGrid.className = "ss-button-grid";
          panel.appendChild(buttonGrid);
        }
        buttonGrid.appendChild(makeButton(opt));
        return;
      }
      buttonGrid = null;
      if (opt.sub && opt.sub.length) {
        var wrap = document.createElement("div");
        wrap.appendChild(makeOptionLabel(opt));
        var sub = document.createElement("div");
        sub.className = "ss-sub";
        sub.setAttribute("data-ss-subof", opt.key);
        sub.hidden = !ssSettings[opt.key];
        opt.sub.forEach(function (s) { sub.appendChild(makeOptionLabel(s)); });
        wrap.appendChild(sub);
        panel.appendChild(wrap);
        return;
      }
      if (opt.key === "catalogFiltering") {
        var filterWrap = document.createElement("div");
        filterWrap.appendChild(makeOptionLabel(opt));
        filterWrap.appendChild(buildFilterBox());
        panel.appendChild(filterWrap);
        return;
      }
      panel.appendChild(makeOptionLabel(opt));
    });
    if (def.page === "ss-shortcuts") panel.appendChild(buildShortcutTable());
    section.appendChild(panel);
    section.appendChild(ssFooter());

    return section;
  }

  function activatePage(menu, aside, name) {
    aside.querySelectorAll(".settingsSectionButton").forEach(function (b) {
      if (!b.dataset.section) return;
      b.classList.toggle("selectedSection", b.dataset.section === name);
    });
    var column = menu.querySelector(".settingsColumn");
    if (!column) return;
    column.querySelectorAll(":scope > .settingsSection").forEach(function (s) {
      s.classList.toggle("settingsSection--active", s.dataset.section === name);
    });
    column.scrollTop = 0;
  }

  function tryInjectMenu() {
    if (ssMenuInjected) return true;
    var menu = document.getElementById("settingsMenu");
    if (!menu) return false;
    var column = menu.querySelector(".settingsColumn");
    var dataSection = column && column.querySelector(':scope > section[data-section="data"]');
    var aside = menu.querySelector(".settingsSectionList");
    var dataBtn = aside && aside.querySelector('button[data-section="data"]');
    if (!column || !dataSection || !aside || !dataBtn) return false;
    if (menu.querySelector('section[data-section="ss-general"]')) {
      ssMenuInjected = true;
      return true;
    }

    var sectionAnchor = dataSection;
    SS_PAGES.forEach(function (def) {
      var s = buildSsPage(def);
      sectionAnchor.after(s);
      sectionAnchor = s;
    });

    var rootBtn = document.createElement("button");
    rootBtn.type = "button";
    rootBtn.className = "settingsSectionButton";
    rootBtn.dataset.section = "ss";
    rootBtn.textContent = "8chanSS";
    dataBtn.after(rootBtn);

    var btnAnchor = rootBtn;
    var subBtns = SS_PAGES.map(function (def) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "settingsSectionButton settingsSectionButton--subSection";
      b.setAttribute("data-ss-page", def.page);
      b.textContent = def.title;
      btnAnchor.after(b);
      btnAnchor = b;
      return b;
    });

    function showSsPage(page) {
      activatePage(menu, aside, page);
      rootBtn.classList.add("selectedSection");
      subBtns.forEach(function (b) {
        b.classList.toggle("selectedSection", b.getAttribute("data-ss-page") === page);
      });
    }

    function clearSsNav() {
      rootBtn.classList.remove("selectedSection");
      subBtns.forEach(function (b) { b.classList.remove("selectedSection"); });
    }

    rootBtn.addEventListener("click", function (ev) {
      ev.stopPropagation();
      showSsPage(SS_PAGES[0].page);
    });
    subBtns.forEach(function (b) {
      b.addEventListener("click", function (ev) {
        ev.stopPropagation();
        showSsPage(b.getAttribute("data-ss-page"));
      });
    });

    if (!aside.dataset.ssWired) {
      aside.dataset.ssWired = "1";
      aside.addEventListener("click", function (e) {
        var btn = e.target.closest(".settingsSectionButton");
        if (!btn || !btn.dataset.section || btn.dataset.section === "ss") return;
        activatePage(menu, aside, btn.dataset.section);
        clearSsNav();
      });
    }

    menu.addEventListener("change", function (e) {
      var field = e.target.closest("[data-ss-setting]");
      if (!field) return;
      var key = field.getAttribute("data-ss-setting");
      if (!(key in SS_DEFAULTS)) return;
      if (field.tagName === "SELECT" || field.tagName === "TEXTAREA") {
        ssSettings[key] = field.value;
      } else if (field.type === "number") {
        var n = parseInt(field.value, 10);
        if (isNaN(n)) n = SS_DEFAULTS[key];
        n = Math.max(+field.min || 0, Math.min(+field.max || 100, n));
        field.value = n;
        ssSettings[key] = n;
      } else {
        ssSettings[key] = !!field.checked;
      }
      saveSetting(key);
      if (field.type === "checkbox") {
        var sub = menu.querySelector('[data-ss-subof="' + key + '"]');
        if (sub) sub.hidden = !field.checked;
      }
      try {
        var applyKey = SUB_APPLY[key] || key;
        if (Features[applyKey]) Features[applyKey](ssSettings[applyKey]);
        if (key === "catalogFiltering") refreshFilterBox();
      }
      catch (err) { console.error("[8chanSS] apply failed:", key, err); }
    });

    ssMenuInjected = true;
    return true;
  }

  function watchNativeMenu() {
    if (tryInjectMenu()) return;
    var observer = null;
    var check = debounce(function () {
      if (tryInjectMenu() && observer) observer.disconnect();
    }, 100);
    observer = new MutationObserver(check);
    observer.observe(document.documentElement, { childList: true, subtree: true });
  }

  onDomReady(function () {
    try {
      injectPageCss();
      var rootEl = document.documentElement;
      rootEl.classList.toggle("is-catalog", pageType.isCatalog);
      rootEl.classList.toggle("is-thread", pageType.isThread);
      rootEl.classList.toggle("is-index", pageType.isIndex);
      loadSettings().then(function () {
        applyAll();
        checkUpdateNotif();
        initShortcuts();
        watchNativeMenu();
      });
    } catch (err) {
      console.error("[8chanSS] boot failed:", err);
    }
  });

})();
