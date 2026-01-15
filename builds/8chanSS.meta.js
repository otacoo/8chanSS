// ==UserScript==
// @name         8chanSS
// @version      1.58.7
// @namespace    8chanss
// @description  A userscript to add functionality to 8chan.
// @author       otakudude
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
// @grant        GM.xmlHttpRequest
// @connect      youtube.com
// @connect      i.ytimg.com
// @run-at       document-start
// @updateURL    https://github.com/otacoo/8chanSS/releases/latest/download/8chanSS.meta.js
// @downloadURL  https://github.com/otacoo/8chanSS/releases/latest/download/8chanSS.user.js
// @icon         data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAMAAABg3Am1AAAAZlBMVEUAAABdlloAhl758AH58AH58AcAhl758ADj4CYAh14AhV4AhV0Ahl748AcChl4Chl0Ab2H58AIAhl758AD58AAAhl757wL48AD47wL78QL47wcAh1748AF3oFfs5yEAh1/68QDz7BM5qSu8AAAAH3RSTlMA/lg/OYtM8g/onXtoXzAaCdzBsIFzczMeaCXXyrmp9ddA3QAAANpJREFUSMft0tkOgjAQheFjtVCQVVxwnfr+L+kWM5FOC73TxP/6fBedFJwpyx5CtSpqSHXWpns4qYxo1cDtkNp7GoOW9KgSwM4+09KeEhmw4H0IuGJDAbCw79a8nwJYFDQCuO1gT8oLWCiKAXavKA5cZ78I5n/wBx7wfb+1TwOggpD2gxxSpvWBrIbY3AcUPK1lkMNbJ4FV4wd964KsQqBF6oAEwcoh2GAk/QlyjNYx4AeHMicGxxoTOrRvIB5IPtULJJhY+QIFJrd9gCUi0tdZjqgu5yYOGAO5G/kyc3TkciPeAAAAAElFTkSuQmCC
// ==/UserScript==