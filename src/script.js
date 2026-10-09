/* 8chanSS — native-menu pages after Data. See SS_PAGES to add options. */
(function () {
"use strict";

var VERSION = "__SS_VERSION__";

/* ================= SECTION: Helpers ================= */

var pageType = (function () {
  var path = (location.pathname || "").toLowerCase();
  return {
    isCatalog: /\/catalog\.html$/i.test(path),
    isThread: /\/(res|last)\/[^/]+\.html$/i.test(path),
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

/* ================= SECTION: Settings store ================= */

var SS_STORE_KEY = "8chanSS_settings_v2";

var SS_DEFAULTS = {
  catalogLinks: true,
  scrollArrows: false,
  arrowPageScroll: true,
  bottomHeader: false,
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
  roundedCorners: false,
  enableSidebar: false,
  leftSidebar: false,
  enableFitReplies: false,
  highlightOnYou: true,
  opBackground: false,
  applyFixes: true,
  enableStickyQR: false,
  fadeQuickReply: false,
  threadHideCloseBtn: false,
  blurSpoilers: false,
  removeSpoilers: false,
  enableMediaPlayer: false,
  viewerStyle: "native",
  trackHoverPlayback: false,
  noPinInCatalog: false,
  smallFont: false,
  expandTW: false,
  catalogImageHover: false,
  threadImageHover: true,  threadHiding: false,
  catalogFiltering: false,
  catalogNewTab: false,
  lastFifty: false,
  catalogLinksNewTab: false,
  catalogFilters: {},
  enableShortcuts: false,
  updateNotif: true,
  ssVersion: ""
};

var SS_PAGES = [
  {
    page: "ss-general", title: "General", options: [
      { head: "Site" },
      { key: "bottomHeader", label: "Bottom Header", title: "Move nav header to bottom of viewport" },
      { key: "catalogLinks", label: "Catalog Links", title: "Turn all board links in the header into /catalog.html links", sub: [
        { key: "catalogLinksNewTab", label: "Always open in new tab" }
      ] },
      { key: "scrollArrows", label: "Show Up/Down Arrows", title: "Floating scroll buttons", sub: [
        { key: "arrowPageScroll", label: "Scroll by page", title: "When off, up jumps to the very top and down to the very bottom" }
      ] },
      { head: "Media" },
      { key: "blurSpoilers", label: "Blur Spoilers", sub: [
        { key: "removeSpoilers", label: "Remove Spoilers" }
      ] },
      { key: "enableMediaPlayer", label: "Enable Advanced Media Player", sub: [
        { key: "viewerStyle", label: "Style", type: "select", options: [
          { value: "native", label: "Native" },
          { value: "topright", label: "Pin Top Right" },
          { value: "topleft", label: "Pin Top Left" }
        ] }
      ] },
      { key: "trackHoverPlayback", label: "Track and Restore Hover Media Playback", title: "Remembers hover video/audio position" },
      { key: "threadImageHover", label: "Thread Image Hover" },
      { head: "Thread Watcher" },
      { key: "noPinInCatalog", label: "Don't pin in Catalog" },
      { key: "smallFont", label: "Smaller font" },
      { key: "expandTW", label: "Auto Expand Thread Watcher" },
      { head: "Catalog" },
      { key: "catalogImageHover", label: "Catalog Image Hover" },
      { key: "threadHiding", label: "Enable Thread Hiding (Shift + Click to hide/unhide a thread)", sub: [
        { key: "catalogFiltering", label: "Enable Catalog Thread Filtering" }
      ] },
      { key: "catalogNewTab", label: "Always Open Threads in New Tab" },
      { key: "lastFifty", label: "Show Last 50 Posts button" }
    ]
  },
  {
    page: "ss-styling", title: "Styling", options: [
      { head: "Mascots" },
      { key: "enableMascots", label: "Enable Mascots", title: "Show a random mascot image (one URL per line)", sub: [
        { key: "mascotOpacity", label: "Mascot Opacity (0-100%)", type: "number", min: 0, max: 100 },
        { key: "mascotUrls", label: "Mascot Image URLs (one per line)", type: "textarea", rows: 4, placeholder: "One URL per line, e.g.\n/.media/mascot1.png" }
      ] },
      { head: "Site Styling" },
      { key: "roundedCorners", label: "Rounded Corners" },
      { key: "hideAnnouncement", label: "Hide Announcement (unhides if changed)" },
      { key: "hidePanelMessage", label: "Hide Panel Message" },
      { key: "hideFooter", label: "Hide Footer" },
      { key: "hidePostingForm", label: "Hide Posting Form", sub: [
        { key: "showCatalogForm", label: "Don't Hide in Catalog" }
      ] },
      { key: "hideBanner", label: "Hide Board Banners" },
      { key: "hideNoCookieLink", label: "Hide No Cookie? Link" },
      { key: "hideJannyTools", label: "Hide Janitor Forms" },
      { key: "hlCurrentBoard", label: "Highlight Current Board" },
      { key: "customFavicon", label: "Custom Favicon", title: "Replace the site favicon with an 8chanSS style", sub: [
        { key: "faviconStyle", label: "Favicon Style", type: "select", options: [
          { value: "default", label: "Default" },
          { value: "pixel", label: "Pixel" },
          { value: "pixel_alt", label: "Pixel Alt" },
          { value: "eight", label: "Eight" },
          { value: "eight_dark", label: "Eight Dark" }
        ] }
      ] },
      { head: "Thread Styling" },
      { key: "enableSidebar", label: "Enable Sidebar", sub: [
        { key: "leftSidebar", label: "Sidebar on Left" }
      ] },
      { key: "enableFitReplies", label: "Fit Replies" },
      { key: "highlightOnYou", label: "Style (You) posts" },
      { key: "opBackground", label: "OP background" },
      { key: "enableStickyQR", label: "Sticky Quick Reply" },
      { key: "fadeQuickReply", label: "Fade Quick Reply" },
      { key: "threadHideCloseBtn", label: "Hide Inline Close Button" },
      { head: "Misc" },
      { key: "applyFixes", label: "Apply 8chanSS fixes", title: "Applies small fixes that must run before the page renders" }
    ]
  },
  { page: "ss-misc", title: "Misc", options: [
    { head: "Keyboard Shortcuts" },
    { key: "enableShortcuts", label: "Enable Keyboard Shortcuts" },
    { key: "updateNotif", label: "8chanSS update notifications" }
  ] },
  { page: "ss-shortcuts", title: "Shortcuts", options: [] }
];

var ssSettings = Object.assign({}, SS_DEFAULTS);
var ssFresh = true;

function loadSettings() {
  if (typeof GM === "undefined" || !GM.getValue) return Promise.resolve();
  return GM.getValue(SS_STORE_KEY, null).then(function (stored) {
    ssFresh = (stored === null);
    if (stored && typeof stored === "object") {
      for (var k in SS_DEFAULTS) {
        if (typeof stored[k] === typeof SS_DEFAULTS[k]) ssSettings[k] = stored[k];
      }
    }
  }).catch(function (err) {
    console.error("[8chanSS] loadSettings failed:", err);
  });
}

function saveSettings() {
  try { localStorage.setItem("8chanSS_fixes", ssSettings.applyFixes ? "1" : "0"); } catch (e) {}
  if (typeof GM === "undefined" || !GM.setValue) return Promise.resolve();
  return GM.setValue(SS_STORE_KEY, ssSettings).catch(function (err) {
    console.error("[8chanSS] saveSettings failed:", err);
  });
}

var LEGACY_MAP = {
  enableHeaderCatalogLinks: "catalogLinks",
  enableHeaderCatalogLinks_openInNewTab: "catalogLinksNewTab",
  enableScrollArrows: "scrollArrows",
  enableBottomHeader: "bottomHeader",
  customFavicon: "customFavicon",
  customFavicon_faviconStyle: "faviconStyle",
  enableMascots: "enableMascots",
  enableMascots_mascotOpacity: "mascotOpacity",
  enableMascots_mascotUrls: "mascotUrls",
  hideAnnouncement: "hideAnnouncement",
  announcementContent: "announceHash",
  hidePanelMessage: "hidePanelMessage",
  hidePostingForm: "hidePostingForm",
  hidePostingForm_showCatalogForm: "showCatalogForm",
  hideBanner: "hideBanner",
  hideNoCookieLink: "hideNoCookieLink",
  hideJannyTools: "hideJannyTools",
  hlCurrentBoard: "hlCurrentBoard",
  enableSidebar: "enableSidebar",
  enableSidebar_leftSidebar: "leftSidebar",
  enableFitReplies: "enableFitReplies",
  highlightOnYou: "highlightOnYou",
  opBackground: "opBackground",
  enableStickyQR: "enableStickyQR",
  fadeQuickReply: "fadeQuickReply",
  threadHideCloseBtn: "threadHideCloseBtn",
  blurSpoilers: "blurSpoilers",
  blurSpoilers_removeSpoilers: "removeSpoilers",
  enableMediaViewer: "enableMediaPlayer",
  enableMediaViewer_viewerStyle: "viewerStyle",
  trackMediaPlayback: "trackHoverPlayback",
  autoExpandTW: "expandTW",
  enableCatalogImageHover: "catalogImageHover",
  enableThreadImageHover: "threadImageHover",
  enableThreadHiding: "threadHiding",
  enableThreadHiding_enableCatalogFiltering: "catalogFiltering",
  openCatalogThreadNewTab: "catalogNewTab",
  enableLastFifty: "lastFifty",
  enableShortcuts: "enableShortcuts",
  enableUpdateNotif: "updateNotif",
  version: "ssVersion",
  catalogFilters: "catalogFilters"
};

var LEGACY_KEEP = [
  "8chanSS_watchedData",
  "8chanSS_savedFavoriteBoards",
  "8chanSS_saveFavoriteBoards",
  "8chanSS_saveWatchedThreads",
  "8chanSS_saveQRCheckboxes",
  "8chanSS_scrollPositions"
];

function legacyKept(full) {
  if (LEGACY_KEEP.indexOf(full) !== -1) return true;
  return full.indexOf("8chanSS_scrollPosition_") === 0;
}

function convertLegacyValue(newKey, raw) {
  var def = SS_DEFAULTS[newKey];
  if (typeof def === "boolean") return raw === true || raw === "true";
  if (typeof def === "number") {
    var n = parseInt(raw, 10);
    return isNaN(n) ? def : n;
  }
  if (typeof def === "string") return raw === null || raw === undefined ? def : String(raw);
  if (def && typeof def === "object") return (raw && typeof raw === "object") ? raw : def;
  return def;
}

function migrateLegacy() {
  if (typeof GM === "undefined" || !GM.listValues || !GM.getValue || !GM.deleteValue) return Promise.resolve();
  return GM.listValues().then(function (keys) {
    var pending = [];
    var touched = false;
    (keys || []).forEach(function (full) {
      if (full === SS_STORE_KEY || full === HIDDEN_THREADS_KEY || legacyKept(full)) return;
      if (full.indexOf("8chanSS_") !== 0) return;
      var short = full.slice("8chanSS_".length);
      if (short === "hiddenCatalogThreads") {
        pending.push(GM.getValue(HIDDEN_THREADS_KEY, null).then(function (existing) {
          if (existing) return;
          return GM.getValue(full, "{}").then(function (raw) {
            try {
              var obj = JSON.parse(raw);
              if (obj && typeof obj === "object") {
                hiddenThreadsCache = obj;
                return saveHiddenThreads();
              }
            } catch (e) {}
          });
        }).then(function () {
          return GM.deleteValue(full).catch(function () {});
        }).catch(function () {}));
        return;
      }
      var target = LEGACY_MAP[short];
      if (target && ssFresh) {
        pending.push(GM.getValue(full, null).then(function (raw) {
          if (raw !== null && raw !== undefined) {
            ssSettings[target] = convertLegacyValue(target, raw);
            touched = true;
          }
          return GM.deleteValue(full).catch(function () {});
        }).catch(function () {}));
      } else {
        pending.push(GM.deleteValue(full).catch(function () {}));
      }
    });
    return Promise.all(pending).then(function () {
      if (touched) return saveSettings();
    });
  }).catch(function (err) {
    console.error("[8chanSS] legacy migration failed:", err);
  });
}

/* ================= SECTION: CSS injection ================= */

(function injectShimAsap() {
  function doInject() {
    if (document.getElementById("ssShim")) return;
    if (!document.head) { setTimeout(doInject, 1); return; }
    var fixesOn = true;
    try { fixesOn = localStorage.getItem("8chanSS_fixes") !== "0"; } catch (e) {}
    if (!fixesOn) return;
    var style = document.createElement("style");
    style.id = "ssShim";
    style.textContent = __SS_SHIM_CSS__;
    document.head.appendChild(style);
  }
  doInject();
})();

function injectPageCss() {
  if (document.getElementById("ssStyle")) return;
  var css = __SS_SITE_CSS__;
  if (pageType.isCatalog) {
    css += __SS_CATALOG_CSS__;
  } else {
    css += __SS_THREAD_CSS__;
  }
  var style = document.createElement("style");
  style.id = "ssStyle";
  style.textContent = css;
  document.head.appendChild(style);
}

/* ================= SECTION: Features ================= */

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
var FAVICON_STATES = ["base", "unread", "notif"];
var FAVICON_DATA = {
  default: { base: __SS_FAV_DEFAULT_BASE__, unread: __SS_FAV_DEFAULT_UNREAD__, notif: __SS_FAV_DEFAULT_NOTIF__ },
  eight: { base: __SS_FAV_EIGHT_BASE__, unread: __SS_FAV_EIGHT_UNREAD__, notif: __SS_FAV_EIGHT_NOTIF__ },
  eight_dark: { base: __SS_FAV_EIGHT_DARK_BASE__, unread: __SS_FAV_EIGHT_DARK_UNREAD__, notif: __SS_FAV_EIGHT_DARK_NOTIF__ },
  pixel: { base: __SS_FAV_PIXEL_BASE__, unread: __SS_FAV_PIXEL_UNREAD__, notif: __SS_FAV_PIXEL_NOTIF__ },
  pixel_alt: { base: __SS_FAV_PIXEL_ALT_BASE__, unread: __SS_FAV_PIXEL_ALT_UNREAD__, notif: __SS_FAV_PIXEL_ALT_NOTIF__ }
};
var faviconApplied = null;
var faviconOriginalHref = null;

function setFavicon(style, state) {
  if (FAVICON_STYLES.indexOf(style) === -1) style = "default";
  if (FAVICON_STATES.indexOf(state) === -1) state = "base";
  var id = style + ":" + state;
  if (faviconApplied === id) return;
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
  link.href = "data:image/png;base64," + FAVICON_DATA[style][state];
  document.head.appendChild(link);
  faviconApplied = id;
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
  catalogFiltering: "threadHiding",
  catalogLinksNewTab: "catalogLinks"
};

function rootToggle(cls, on) {
  document.documentElement.classList.toggle(cls, !!on);
}

function openQuickReply() {
  if (document.getElementById("quick-reply")) return true;
  var btn = document.getElementById("replyButton") ||
    document.querySelector(".innerUtility #replyButton");
  if (!btn) return false;
  btn.click();
  requestAnimationFrame(function () {
    var qr = document.getElementById("quick-reply");
    if (qr && qr.contains(document.activeElement)) document.activeElement.blur();
  });
  return true;
}

var spoilerThreadsObserver = null;
var spoilerTooltipObserver = null;
var debouncedSpoilerApply = null;
var mediaViewerObserver = null;
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
              img.src = href + "#spoiler";
              link.dataset.blurSpoilerProcessed = "1";
              applyBlurOrRemoveSpoilers(img);
              return;
            }
          }
        }
      }
    }
    var initialWidth = img.offsetWidth;
    var initialHeight = img.offsetHeight;
    img.style.width = initialWidth + "px";
    img.style.height = initialHeight + "px";
    img.src = transformedSrc + "#spoiler";
    img.addEventListener("load", function () {
      img.style.width = img.naturalWidth + "px";
      img.style.height = img.naturalHeight + "px";
    });
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
    if (img) img.classList.remove("ss-spoiler-blurred", "ss-spoiler-border");
  }
}

function positionMediaViewer() {
  var viewer = document.querySelector(".mediaViewer");
  if (!viewer) return;
  viewer.classList.remove("topright", "topleft");
  var style = ssSettings.viewerStyle;
  if (style === "topright" || style === "topleft") viewer.classList.add(style);
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

// Feature: Image Hover
var MEDIA_MAX_WIDTH = "90vw";
var MEDIA_OPACITY_LOADING = "0";
var MEDIA_OPACITY_LOADED = "1";
var MEDIA_OFFSET = 50;
var MEDIA_BOTTOM_MARGIN = 3;
var MEDIA_VOLUME = 0.5;
var AUDIO_INDICATOR_TEXT = "▶ Playing audio...";

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
  "audio/x-wav": ".wav"
};

function mimeExt(mime) {
  return MIME_TO_EXT[String(mime).toLowerCase()] || "";
}

function getExtensionForMimeType(mime) {
  return mimeExt(mime);
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
  } catch (e) {}
  return "";
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
  function hasExtension(str) {
    return /\.[a-z0-9]+$/i.test(str);
  }
  function isTThumb(str) {
    return /\/t_/.test(str);
  }
  function isDirectHash(str) {
    return /^\/\.media\/[a-f0-9]{40,}$/i.test(str) && !hasExtension(str);
  }
  function isSmallImage() {
    return (fileWidth && fileWidth <= 220) || (fileHeight && fileHeight <= 220);
  }
  function isBarePngNoThumb() {
    return (
      filemime &&
      filemime.toLowerCase() === "image/png" &&
      parentA &&
      !isTThumb(href) &&
      !hasExtension(href)
    );
  }
  function isSmallBarePngSrc() {
    return (
      isSmallImage() &&
      filemime &&
      filemime.toLowerCase() === "image/png" &&
      !isTThumb(thumbnailSrc) &&
      !hasExtension(thumbnailSrc)
    );
  }
  function isGenericThumb() {
    return (
      /\/spoiler\.png$/i.test(thumbnailSrc) ||
      /\/custom\.spoiler$/i.test(thumbnailSrc) ||
      /\/audioGenericThumb\.png$/i.test(thumbnailSrc)
    );
  }
  if (!filemime) {
    if (
      thumbNode.closest(".catalogCell") ||
      /^\/\.media\/t?_[a-f0-9]{40,}$/i.test(thumbnailSrc.replace(/\\/g, ""))
    ) {
      return thumbnailSrc;
    }
    return null;
  }
  if (isBarePngNoThumb()) {
    return thumbnailSrc;
  }
  if (isSmallBarePngSrc()) {
    return thumbnailSrc;
  }
  if (isSmallImage() && hasExtension(thumbnailSrc)) {
    return thumbnailSrc;
  }
  if (isTThumb(thumbnailSrc)) {
    var base = thumbnailSrc.replace(/\/t_/, "/");
    base = base.replace(/\.(jpe?g|jxl|png|apng|gif|avif|webp|webm|mp4|m4v|ogg|flac|opus|mp3|m4a|wav)$/i, "");
    if (filemime && (filemime.toLowerCase() === "image/apng" || filemime.toLowerCase() === "video/x-m4v")) {
      return base;
    }
    var ext = filemime ? getExtensionForMimeType(filemime) : null;
    if (!ext) return null;
    return base + ext;
  }
  if (isDirectHash(thumbnailSrc)) {
    if (filemime && (filemime.toLowerCase() === "image/apng" || filemime.toLowerCase() === "video/x-m4v")) {
      return thumbnailSrc;
    }
    var ext2 = filemime ? getExtensionForMimeType(filemime) : null;
    if (!ext2) {
      return thumbnailSrc;
    }
    return thumbnailSrc + ext2;
  }
  if (isGenericThumb()) {
    if (parentA && parentA.getAttribute("href")) {
      return sanitizeMediaUrl(parentA.getAttribute("href"));
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
    try { cleanupFns[i](); } catch (e) {}
  }
  cleanupFns = [];
  if (floatingMedia) {
    if (floatingMedia.tagName === "VIDEO" || floatingMedia.tagName === "AUDIO") {
      try {
        var key = floatingMedia.dataset && floatingMedia.dataset.previewSrc ? floatingMedia.dataset.previewSrc : (floatingMedia.src || "");
        var t = Number(floatingMedia.currentTime);
        if (key && !isNaN(t) && isFinite(t) && t > 0) saveHoverPlaybackTime(key, t);
      } catch (e) {}
      try { floatingMedia.pause(); } catch (e) {}
      try { floatingMedia.srcObject = null; } catch (e) {}
      try {
        if (floatingMedia.dataset && floatingMedia.dataset.blobUrl) {
          URL.revokeObjectURL(floatingMedia.dataset.blobUrl);
        }
      } catch (e) {}
    }
    floatingMedia.remove();
    floatingMedia = null;
  }
  if (currentAudioIndicator && currentAudioIndicator.parentNode) {
    currentAudioIndicator.parentNode.removeChild(currentAudioIndicator);
    currentAudioIndicator = null;
  }
}

function leaveHandler() {
  cleanupFloatingMedia();
}

function mouseMoveHandler(ev) {
  lastMouseEvent = ev;
  positionFloatingMedia(ev);
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
    filemime = parentA.getAttribute("data-filemime") || {
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
      wav: "audio/wav"
    }[ext];
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
  var volume = MEDIA_VOLUME;
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
    floatingMedia.src = audioSrc;
    floatingMedia.controls = false;
    floatingMedia.style.display = "none";
    floatingMedia.volume = volume;
    document.body.appendChild(floatingMedia);
    try {
      var savedAudio = getHoverPlaybackTime(audioSrc);
      if (typeof savedAudio === "number" && !isNaN(savedAudio) && isFinite(savedAudio) && savedAudio > 0) {
        var onLoadedMeta = function () {
          var onSeeked = function () {
            try { floatingMedia.play().catch(function () {}); } finally { floatingMedia.removeEventListener("seeked", onSeeked); }
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
            floatingMedia.play().catch(function () {});
          }
        };
        floatingMedia.addEventListener("loadedmetadata", onLoadedMeta, { once: true });
      } else {
        floatingMedia.addEventListener("canplay", function () { floatingMedia.play().catch(function () {}); }, { once: true });
      }
    } catch (err) {
      floatingMedia.play().catch(function () {});
    }
    var indicator = document.createElement("div");
    indicator.classList.add("audio-preview-indicator");
    indicator.textContent = AUDIO_INDICATOR_TEXT;
    if (container) {
      container.appendChild(indicator);
    }
    currentAudioIndicator = indicator;
    thumb.addEventListener("mouseleave", leaveHandler, { once: true });
    if (container) container.addEventListener("click", leaveHandler, { once: true });
    window.addEventListener("scroll", leaveHandler, { passive: true, once: true });
    cleanupFns.push(function () { thumb.removeEventListener("mouseleave", leaveHandler); });
    if (container) cleanupFns.push(function () { container.removeEventListener("click", leaveHandler); });
    cleanupFns.push(function () { window.removeEventListener("scroll", leaveHandler); });
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
  floatingMedia.src = isVideo ? videoSrc : fullSrc;
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
  thumb.addEventListener("mouseleave", leaveHandler, { passive: true, once: true });
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
          try { floatingMedia.play().catch(function () {}); } catch (err) {}
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
        try { floatingMedia.style.visibility = "visible"; floatingMedia.style.opacity = MEDIA_OPACITY_LOADED; } catch (err2) {}
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
    fetch(failedSrc).then(function (res) {
      if (!res.ok) throw new Error("fetch failed");
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
  floatingMedia.onerror = mediaBlobFallback;
  thumb.addEventListener("mouseleave", leaveHandler, { once: true });
  window.addEventListener("scroll", leaveHandler, { passive: true, once: true });
  cleanupFns.push(function () { thumb.removeEventListener("mouseleave", leaveHandler); });
  cleanupFns.push(function () { window.removeEventListener("scroll", leaveHandler); });
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
          if (nodes[j].nodeType !== 1) continue;
          if (nodes[j].matches && nodes[j].matches("a.linkThumb img, a.imgLink img")) {
            attachThumbListeners(nodes[j]);
          } else if (nodes[j].querySelectorAll) {
            attachThumbListeners(nodes[j]);
          }
        }
      }
    });
    hoverObserver.observe(document.body, { childList: true, subtree: true });
  }
}

var HIDDEN_THREADS_KEY = "8chanSS_hiddenThreads";
var hiddenThreadsCache = null;
var catalogHiddenMode = false;
var catalogHidingObserver = null;
var debouncedCatalogHiddenApply = null;
var catalogHidingWired = false;

function loadHiddenThreads() {
  if (hiddenThreadsCache) return Promise.resolve(hiddenThreadsCache);
  hiddenThreadsCache = {};
  if (typeof GM === "undefined" || !GM.getValue) return Promise.resolve(hiddenThreadsCache);
  return GM.getValue(HIDDEN_THREADS_KEY, "{}").then(function (raw) {
    try {
      var obj = JSON.parse(raw);
      if (obj && typeof obj === "object") hiddenThreadsCache = obj;
    } catch (e) {}
    return hiddenThreadsCache;
  }).catch(function () {
    return hiddenThreadsCache;
  });
}

function saveHiddenThreads() {
  if (typeof GM === "undefined" || !GM.setValue) return Promise.resolve();
  return GM.setValue(HIDDEN_THREADS_KEY, JSON.stringify(hiddenThreadsCache)).catch(function () {});
}

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

function applyHiddenThreads() {
  if (!pageType.isCatalog) return Promise.resolve();
  return loadHiddenThreads().then(function (obj) {
    var filters = ssSettings.catalogFiltering ? Object.values(ssSettings.catalogFilters || {}) : [];
    var cells = document.querySelectorAll(".catalogCell");
    for (var i = 0; i < cells.length; i++) {
      var cell = cells[i];
      var info = cellBoardThread(cell);
      if (!info) continue;
      var hidden = (obj[info.board] || []).indexOf(info.threadNum) !== -1;
      if (!hidden && filters.length) {
        var text = ((cell.querySelector(".labelSubject") || {}).textContent || "") + " " +
          ((cell.querySelector(".divMessage") || {}).textContent || "");
        text = text.toLowerCase();
        for (var f = 0; f < filters.length; f++) {
          if (filters[f] && filterMatches(filters[f].word, text)) {
            var boards = String(filters[f].boards || "").toLowerCase().split(",").map(function (b) {
              return b.trim();
            }).filter(function (b) { return !!b; });
            if (!boards.length || boards.indexOf(info.board) !== -1) {
              hidden = true;
              break;
            }
          }
        }
      }
      if (catalogHiddenMode ? !hidden : hidden) {
        cell.style.display = "none";
        cell.classList.add("ss-hidden-thread");
        cell.classList.remove("ss-unhide-thread");
      } else {
        cell.style.display = "";
        cell.classList.remove("ss-hidden-thread");
        cell.classList.toggle("ss-unhide-thread", catalogHiddenMode);
      }
    }
    updateShowHiddenBtn();
  });
}

function onCatalogCellClick(e) {
  if (!e.shiftKey || e.button !== 0) return;
  var cell = e.target.closest(".catalogCell");
  if (!cell) return;
  var info = cellBoardThread(cell);
  if (!info) return;
  e.preventDefault();
  e.stopPropagation();
  loadHiddenThreads().then(function (obj) {
    if (!obj[info.board]) obj[info.board] = [];
    var list = obj[info.board];
    var at = list.indexOf(info.threadNum);
    if (catalogHiddenMode) {
      if (at !== -1) list.splice(at, 1);
    } else if (at === -1) {
      list.push(info.threadNum);
    }
    saveHiddenThreads().then(applyHiddenThreads);
  });
}

function updateShowHiddenBtn() {
  var btn = document.getElementById("ss-show-hidden-btn");
  if (btn) btn.textContent = catalogHiddenMode ? "Hide Hidden" : "Show Hidden";
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
    catalogDiv.addEventListener("click", onCatalogThumbClick);
  }
}

var Features = {
  // Feature: Catalog Links
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
  // Feature: Custom Favicon
  customFavicon: function (on) {
    if (on) {
      setFavicon(ssSettings.faviconStyle, "base");
    } else {
      resetFavicon();
    }
  },
  // Feature: Mascots
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
  // Feature: Hide Announcement
  hideAnnouncement: function (on) {
    var root = document.documentElement;
    if (!on) {
      root.classList.remove("hide-announcement");
      if (ssSettings.announceHash) { ssSettings.announceHash = ""; saveSettings(); }
      return;
    }
    var el = document.getElementById("dynamicAnnouncement");
    var content = el ? (el.textContent || "").replace(/\s+/g, " ").trim() : "";
    if (ssSettings.announceHash && content && ssSettings.announceHash !== content) {
      ssSettings.hideAnnouncement = false;
      ssSettings.announceHash = "";
      saveSettings();
      var box = document.querySelector('input[data-ss-setting="hideAnnouncement"]');
      if (box) box.checked = false;
      root.classList.remove("hide-announcement");
      return;
    }
    root.classList.add("hide-announcement");
    if (content && ssSettings.announceHash !== content) {
      ssSettings.announceHash = content;
      saveSettings();
    }
  },
  // Feature: Hide Posting Form
  hidePostingForm: function (on) {
    rootToggle("hide-posting-form", on);
    rootToggle("show-catalog-form", ssSettings.showCatalogForm);
  },
  // Feature: Sidebar
  enableSidebar: function (on) {
    var left = !!ssSettings.leftSidebar;
    rootToggle("ss-sidebar", on && !left);
    rootToggle("ss-leftsidebar", on && left);
  },
  // Feature: Sticky Quick Reply
  enableStickyQR: function (on) {
    rootToggle("sticky-qr", on);
    if (on && !openQuickReply()) {
      setTimeout(openQuickReply, 800);
    }
  },
  // Feature: Blur Spoilers
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
  // Feature: Advanced Media Player
  enableMediaPlayer: function (on) {
    if (on) {
      try { localStorage.setItem("mediaViewer", "true"); } catch (e) {}
      positionMediaViewer();
      if (!mediaViewerObserver) {
        mediaViewerObserver = new MutationObserver(function (mutations) {
          for (var i = 0; i < mutations.length; i++) {
            var nodes = mutations[i].addedNodes;
            for (var j = 0; j < nodes.length; j++) {
              if (nodes[j].nodeType === 1 && nodes[j].classList && nodes[j].classList.contains("mediaViewer")) {
                positionMediaViewer();
                return;
              }
            }
          }
        });
        mediaViewerObserver.observe(document.body, { childList: true });
      }
    } else {
      if (mediaViewerObserver) {
        mediaViewerObserver.disconnect();
        mediaViewerObserver = null;
      }
      var viewer = document.querySelector(".mediaViewer");
      if (viewer) viewer.classList.remove("topright", "topleft");
    }
  },
  // Feature: Track Hover Playback
  trackHoverPlayback: function () {},
  // Feature: Thread Hiding
  threadHiding: function (on) {
    if (!pageType.isCatalog) return;
    if (on) {
      applyHiddenThreads();
      var container = document.querySelector(".catalogWrapper, .catalogDiv");
      if (container && !catalogHidingWired) {
        catalogHidingWired = true;
        container.addEventListener("click", onCatalogCellClick, true);
      }
      if (!catalogHidingObserver) {
        debouncedCatalogHiddenApply = debounce(function () { applyHiddenThreads(); }, 50);
        var catalogDiv = document.querySelector(".catalogDiv");
        if (catalogDiv) catalogHidingObserver = new MutationObserver(function () { debouncedCatalogHiddenApply(); });
        if (catalogHidingObserver) catalogHidingObserver.observe(catalogDiv, { childList: true, subtree: false });
      }
      if (!document.getElementById("ss-show-hidden-btn")) {
        var refreshBtn = document.querySelector("#catalogRefreshButton");
        if (refreshBtn) {
          var btn = document.createElement("button");
          btn.id = "ss-show-hidden-btn";
          btn.className = "catalogLabel";
          btn.type = "button";
          btn.textContent = "Show Hidden";
          btn.style.marginRight = "8px";
          btn.addEventListener("click", function () {
            catalogHiddenMode = !catalogHiddenMode;
            applyHiddenThreads();
          });
          refreshBtn.parentNode.insertBefore(btn, refreshBtn);
        }
      }
    } else {
      if (catalogHidingObserver) { catalogHidingObserver.disconnect(); catalogHidingObserver = null; }
      catalogHiddenMode = false;
      var showBtn = document.getElementById("ss-show-hidden-btn");
      if (showBtn) showBtn.remove();
      var cells = document.querySelectorAll(".catalogCell.ss-hidden-thread, .catalogCell.ss-unhide-thread");
      for (var i = 0; i < cells.length; i++) {
        cells[i].style.display = "";
        cells[i].classList.remove("ss-hidden-thread", "ss-unhide-thread");
      }
    }
  },
  // Feature: Catalog New Tab
  catalogNewTab: function (on) {
    if (on && pageType.isCatalog) applyCatalogNewTab();
  },
  // Feature: Catalog Image Hover
  catalogImageHover: function (on) {
    if (on) {
      wireHoverOnce();
    } else {
      cleanupFloatingMedia();
    }
  },
  // Feature: Thread Image Hover
  threadImageHover: function (on) {
    if (on) {
      wireHoverOnce();
    } else {
      cleanupFloatingMedia();
    }
  },
  // Feature: Last Fifty
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
  // Feature: Scroll Arrows
  scrollArrows: function (on) {
    document.documentElement.classList.toggle("ss-scroll-arrows", !!on);
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
  }
};

function applyAll() {
  for (var k in Features) {
    try { Features[k](ssSettings[k]); }
    catch (err) { console.error("[8chanSS] feature failed:", k, err); }
  }
}

// Feature: Simple :root class toggles (one line each, no custom logic)
var CLASS_TOGGLES = {
  bottomHeader: "ss-bottom-header",
  hidePanelMessage: "hide-panelmessage",
  hideBanner: "disable-banner",
  hideNoCookieLink: "hide-nocookie",
  hideJannyTools: "hide-jannytools",
  hlCurrentBoard: "hl-currentBoard",
  hideFooter: "ss-hide-footer",
  roundedCorners: "ss-rounded",
  enableFitReplies: "fit-replies",
  highlightOnYou: "highlight-yous",
  opBackground: "op-background",
  fadeQuickReply: "fade-qr",
  threadHideCloseBtn: "hide-close-btn",
  noPinInCatalog: "ss-nopin-catalog",
  smallFont: "ss-small-font",
  smallFont: "ss-small-font",
  expandTW: "auto-expand-tw"
};
Object.keys(CLASS_TOGGLES).forEach(function (key) {
  Features[key] = function (on) { rootToggle(CLASS_TOGGLES[key], on); };
});

function disconnectAll() {
  if (catalogObserver) { catalogObserver.disconnect(); catalogObserver = null; }
  if (spoilerThreadsObserver) { spoilerThreadsObserver.disconnect(); spoilerThreadsObserver = null; }
  if (spoilerTooltipObserver) { spoilerTooltipObserver.disconnect(); spoilerTooltipObserver = null; }
  if (mediaViewerObserver) { mediaViewerObserver.disconnect(); mediaViewerObserver = null; }
  if (catalogHidingObserver) { catalogHidingObserver.disconnect(); catalogHidingObserver = null; }
  if (lastFiftyObserver) { lastFiftyObserver.disconnect(); lastFiftyObserver = null; }
  if (hoverObserver) { hoverObserver.disconnect(); hoverObserver = null; }
}

// Feature: Toasts
var TOAST_COLORS = {
  black: "#222",
  orange: "#cc7a00",
  green: "#339933",
  blue: "#1976d2",
  red: "#c62828"
};

function sanitizeToastHTML(html) {
  html = String(html).replace(/<(\/?)(?!a\b|b\b|i\b|u\b|strong\b|em\b)[^>]*>/gi, "");
  html = html.replace(/<(b|i|u|strong|em)[^>]*>/gi, "<$1>");
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
  saveSettings();
  if (!firstInstall) {
    showToast(
      "8chanSS has updated to v" + VERSION + '. Check out the <b><a href="https://github.com/otacoo/8chanSS/blob/main/CHANGELOG.md" target="_blank" rel="noopener noreferrer">changelog</a></b>.',
      "blue",
      15000
    );
  }
}

// Feature: Keyboard Shortcuts
var BBCODE_TAGS = {
  s: ["[spoiler]", "[/spoiler]"],
  b: ["'''", "'''"],
  u: ["__", "__"],
  i: ["''", "''"],
  d: ["==", "=="],
  m: ["[moe]", "[/moe]"],
  c: ["[code]", "[/code]"]
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
  var cells = Array.from(document.querySelectorAll(isOwnReply
    ? ".postCell:has(a.youName), .opCell:has(a.youName)"
    : ".postCell:has(a.quoteLink.you), .opCell:has(a.quoteLink.you)"));
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
    try { history.replaceState(null, "", "#" + anchorId); } catch (e) {}
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

    if (inQR) {
      if (e.ctrlKey && e.key === "Enter") {
        e.preventDefault();
        var submit = document.getElementById("qrbutton");
        if (submit) submit.click();
        return;
      }
      var bbKey = e.key.toLowerCase();
      if (bbKey === "c" && e.altKey && !e.ctrlKey && BBCODE_TAGS[bbKey]) {
        e.preventDefault();
        applyBBCode(t, bbKey);
        return;
      }
      if (e.ctrlKey && !e.altKey && bbKey !== "c" && BBCODE_TAGS[bbKey]) {
        e.preventDefault();
        applyBBCode(t, bbKey);
        return;
      }
      return;
    }

    var tag = t && t.tagName;
    if (t && e.key !== "Tab" && (tag === "INPUT" || tag === "TEXTAREA" || t.isContentEditable)) return;

    if (e.key === "Tab") {
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

    if (!e.ctrlKey && !e.altKey && e.key === "Escape") {
      var area = document.getElementById("qrbody");
      if (area) area.value = "";
      var quickReply = document.getElementById("quick-reply");
      if (quickReply) quickReply.style.removeProperty("display");
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
      var watchBtn = document.querySelector(".watchButton");
      if (watchBtn && !watchBtn.classList.contains("watched-active")) {
        watchBtn.click();
        setTimeout(function () { watchBtn.classList.add("watched-active"); }, 100);
      }
      return;
    }
  });
}

/* ================= SECTION: Native menu ================= */

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
  saveSettings();
  if (ssSettings.threadHiding) applyHiddenThreads();
}

function refreshFilterBox() {
  if (filterBoxEl) filterBoxEl.hidden = !(ssSettings.threadHiding && ssSettings.catalogFiltering);
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
  box.hidden = !(ssSettings.threadHiding && ssSettings.catalogFiltering);
  filterBoxEl = box;
  return box;
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
    [["Ctrl", "Q"], "Toggle Quick Reply"],
    [["Ctrl", "Enter"], "Submit post"],
    [["Escape"], "Clear QR textarea and hide dialogs"],
    [["Alt", "W"], "Watch Thread"],
    [["Shift", "Click"], "Hide Thread in Catalog"],
    [["Ctrl", "Up/Down"], "Scroll between Your Replies"],
    [["Ctrl", "Shift", "Up/Down"], "Scroll between Replies to You"],
    [["Ctrl", "B"], "Bold text"],
    [["Ctrl", "I"], "Italic text"],
    [["Ctrl", "U"], "Underline text"],
    [["Ctrl", "S"], "Spoiler text"],
    [["Ctrl", "D"], "Srz Bizniz text"],
    [["Ctrl", "M"], "Moe text"],
    [["Alt", "C"], "Code block"]
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
  def.options.forEach(function (opt) {
    if (opt.head) {
      var h = document.createElement("h3");
      h.className = "ss-subhead";
      h.textContent = opt.head;
      panel.appendChild(h);
      return;
    }
    if (opt.sub && opt.sub.length) {
      var wrap = document.createElement("div");
      wrap.appendChild(makeOptionLabel(opt));
      var sub = document.createElement("div");
      sub.className = "ss-sub";
      sub.setAttribute("data-ss-subof", opt.key);
      sub.hidden = !ssSettings[opt.key];
      opt.sub.forEach(function (s) { sub.appendChild(makeOptionLabel(s)); });
      if (opt.key === "threadHiding") sub.appendChild(buildFilterBox());
      wrap.appendChild(sub);
      panel.appendChild(wrap);
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
    saveSettings();
    if (field.type === "checkbox") {
      var sub = menu.querySelector('[data-ss-subof="' + key + '"]');
      if (sub) sub.hidden = !field.checked;
    }
    try {
      var applyKey = SUB_APPLY[key] || key;
      if (Features[applyKey]) Features[applyKey](ssSettings[applyKey]);
      if (key === "threadHiding" || key === "catalogFiltering") refreshFilterBox();
    }
    catch (err) { console.error("[8chanSS] apply failed:", key, err); }
  });

  ssMenuInjected = true;
  return true;
}

function watchNativeMenu() {
  if (tryInjectMenu()) return;
  var observer = new MutationObserver(function () {
    if (tryInjectMenu()) observer.disconnect();
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
  window.addEventListener("beforeunload", function () {
    observer.disconnect();
    disconnectAll();
  }, { once: true });
}

/* ================= SECTION: Boot ================= */

onDomReady(function () {
  try {
    injectPageCss();
    var rootEl = document.documentElement;
    rootEl.classList.toggle("is-catalog", pageType.isCatalog);
    rootEl.classList.toggle("is-thread", pageType.isThread);
    rootEl.classList.toggle("is-index", pageType.isIndex);
    loadSettings().then(function () {
      return migrateLegacy();
    }).then(function () {
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
