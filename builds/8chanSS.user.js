// ==UserScript==
// @name         8chanSS
// @version      1.48.0
// @namespace    8chanss
// @description  A userscript to add functionality to 8chan.
// @author       otakudude
// @minGMVer     4.3
// @minFFVer     121
// @license      MIT; https://github.com/otacoo/8chanSS/blob/main/LICENSE 
// @match        *://dev.8ch.moe/*
// @exclude      *://dev.8ch.moe/login.html
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
const debounce = (fn, delay) => {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => fn.apply(this, args), delay);
    };
};
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
const faviconManager = (() => {
    const STYLES = [
        "default",
        "eight", "eight_dark",
        "pixel", "pixel_alt"
    ];
    const STATES = ["base", "unread", "notif"];
    const FAVICON_DATA = {
        default: {
            base: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAq1BMVEUAAACKtMV2lqSE1PWZ1Oyr1eaqzNp7udPO7vuc3ffh8vmG0/OB0fKv3e+N0e3B4e693+56x+bb6e6YzeOgydl7wd3L3OOwytS35fjZ8fuQ2feB1Pbo9vyy5Pjm9Pmp4PW85fbW7feO1/S55Pbk8/mq3/TY7fbn9Pnf7/bQ6vWS1fDa7fWH0vCb0+rY6/Pc7POBzezA4/GNz+vJ4+662ebH1958wNzD6vqm4Ph4HvJJAAAAN3RSTlMADwXliF4dGP7949HLn5mUhWllVCglJBf6+fn5+Pjo4N3a2NfV1MzIxb28rayinJKOioB7UzEt0Y3/cQAAAIBJREFUGNOVjsUOhVAMRG97BXcePHd3Q/7/y0hhQWDHrDpJT86wIQHo1t/xHGLb8aNvzHnYFC2KFHh+mu1PNTW6GuVB0vlaJvTsTl2xWjgxw5upCOB3ZLEzXvve5IlE8DdJ5K7QL0nts61cEw9Q8p82kmDGt4ZgbTCwrS/0Rw9IBRlvB34XFuslAAAAAElFTkSuQmCC",
            unread: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAolBMVEUAAACG2vyC1/iH1vaB1/mC1PSC2PuC2fuD2fyE2fyG3P2I3Pqn3vWB1PWO1fKD2fuE2vqE2vyH3Puk4PaK1vSg2/OP1vJ/0fGB0/SF1vaC1faB1vmF2vyy5PiP2PbF6vnK6vjU7/m/5/ao3fKF0/K55PaW2PKK1PGA0/SP2PWA1/mC2fuE2fyD2fyx4vaT1e+S1/PX8PrO7vqb3fjh9Pu25fiNN6jgAAAAMXRSTlMAHK7Kmf6CYlc/EAnrxOt4OSwV/f3y8OrQv7afI/7+/f379/Pz8OLhvLmRb1pK+/PUqRXqEQAAALhJREFUGNN1j8cSgkAAQ7c3dykiSLFTpaiA/v+vCXrAi7klM5nkgUWrFfjVWgrhqMVDnkQREeuPURBCEevjSaNurrmcsYbo4dQ/NYMA7GxTlhinGj/OZ+QAxc1m9DwrRHad91cJXJIdgsDb+5igyxzImGYowf5r76d9TlwgK7qtbRRat+NwwVwBB1EaGutucFFE9m4aYVu6OYwBaRjj7kzQoSmxYjG9U1+IllQm4XDBUI5o5QTxB/wNI78Nh2SdMuEAAAAASUVORK5CYII=",
            notif: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAA4VBMVEUAAACE3vuD1veC1veB2PqB2fuD2/2H2/2I3PqP1vOB1faE2vyN1/WD1PSB2PuE2vzQ7Pak4PaB0/OG0/J/0fGn3vSB1vmC2PqE2vmG2vq54vKf3fWrLzam4PaO1fGD1faP2PWE2fyD2fyD2fzW8PrD5PG11+WXtcW55PVvbnqqOj+XmKaT1e+x3e1+obS4AACBjqGH0/F8vNh5hpuQNj+P2PZyX2+C1/SKEBOC2ftjKjApAAAdAAAJAACD1fXkAADg9Pu05/qb3fi1vsefoq+xhIildHu4PECpMjSkLDDPAQHtACoGAAAAPnRSTlMAEsOumWJVGwnuuT39zIMs/f388erpn3k4I/Tz8/Lmz7laSkH++/v7+vr5+PPv7ezk4M7OzcSdkZFwWTIVCIgxa4YAAADDSURBVBjTdY/VrgJBGIP/cWZm3XE77oLLLm7v/0BAgMANvWuapv3gqlwOboU05wm6esEijClHp1AIwVX49BiSxrFmM8vq0/J8s5yElgDIx/i3Yprl9+zNcUgCiGFj5rqV6n9W+pzUmmBT35DSnRZ/slLhoaZBq9QnkVmcLrK1U6A2NFUadGNSlc/b1UubIdDE80wsP/Df6xeO84cRK0hTYyZpZ9di9pGgQQLP8BUffPfOP+tU4YiJ8XB0wUp4XR/CO+B76XMRs7uqu4cAAAAASUVORK5CYII=",
        },
        eight: {
            base: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAA6lBMVEUAAAAxV2oFSGADP1Y1Wm0zWW1EY3Q1VmgpU2g2VWYkUGUyUWIiTWEAKUcFSmErU2c5W24zVWghUWckTmIKSmEZTmUxUmMwUWP1+fxcc4HL6f7j9f/g7PWi1fWWprFJZXUeSl7Z7v6Myu7d4OOjt8SKrcOSrsFMa30/YnT////C5v/Q6PmHz/nt7/Gw1e+bzu+Dx+7A1+d7wOa+ztqtx9m5v8Sds8KDn7J0lqqJl6GEkZtJfZlRb4E5Zn1Ybnw0YHc3V2kPSWAAQVqY0vZpstqMu9mIutjO0tV5rcyru8dfm7xTmLthh51TfpcZngh2AAAAGHRSTlMA1cx8MBoH8fHm5s3Kv5qUiFhYUFDxmpptBtYcAAAAzUlEQVQY0zWOVRKDQBBEB4+77OLB4+5B43b/64QU8P76VddMQwpTyWGFbEAGXTjoaLxWqmlmSRnF9HUl7bSwKO49fO+vyURQsvCMiDZGY+Xfb1JlQ9iENcJDCMf3SqetOe8tgzDaIz0HTH43GfD8sLfcGCI6VKD7laamtYqNIIhygQHudj6qarDi54aMSRrA1jSfqKkWb5WpFhv/cBYzlyNUc7ClkgnF1+hh2x9pcmomou5cRtpUknYlFhKqznsxux7zNGTUi77LdZg0/QBWixhGoJiKLQAAAABJRU5ErkJggg==",
            unread: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAtFBMVEUAAAAAYYUAYYQAXIAAW38AYYMAY4YAXYAAYIQAZIcAY4Udc5MAWX8BZogldJQAWn6L2fIRa4xy0faB2/xt0vqI3Ph+0vBdxO1Wp8c/i6l41fhPwO1Ivu1Lo8dEoMYegaYYcZMEa46X5f1NxvZfyfNZyPOI1OxqwuV3w947rttputpdttldq8porscrmcNRnbtEmLpOmLU9krQFb5MHZIVIueY6tuaAyeJOstp1vNRCp9Auh6qJsLovAAAADnRSTlMAWfLRzujVm5EzHAqLiBrNc7IAAADDSURBVBjTNY9XEsIwEEPd0mFtp4d0eocU+v3vRRic9yeNZldCCtsgIBlGI5aWbMX6JE2lHdoEgRDzh1QZDGGYALzmJ/Y3JhfvyHUCYi1/eWzS2Iv5VAchYLhH4ZpvZvue8yTYEmRrbeT7rjvbx8cwSAxklMuoKA6D43lho9mI7FYl5/3B3cQXoBZCkKW1PuWFn7MJdoYf9T3riM5z/6pasvPiXVWfKKrGknK3SNPVsqWO2mHK8y17lpqFRjCrO2LYSn0BV4wQhK3VgFcAAAAASUVORK5CYII=",
            notif: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAABEVBMVEUAAAAAW38AYoUAYoQAYYQAZYgAYYMAZIYAXoEBZom1AwbrAABGAAAALT4AAAAAYYRHAAAAAAAadJTeAAABZohHGymuAABFAACcAAAAAAAAAAAAUnIAZ4oAAAAQao2M2/Qic5Rw0/pKv+1EoscAXoD5AAB31fhfxO0egaYpdpUAa40AWX3/AgK/AAC6AABNAACX5f2B2/xr0fqH2/dNxvZy0fVfyfNZyPN80e+I1OxQv+x7xuA7rttmu9ldttlorsddqsdUpsZLocMrmcNEmLpPm7g+iqkFb5MZcJJYwu1IueY6tuZoweROstp1vNRdsdBCp9Bwt8xAk7U6kbRYnbEuh6oJZYWZdYM1RF0AKDwAHjhOZ3nrAAAAHnRSTlMA0FnyjRzo1psy/v785K2UiVwL+PLu6OPLyL6nm49luDk4AAAA4ElEQVQY0zWP5XLDMBAGT5YpnJRRkiHGOg0zc7lheP8HiTN29t/t7NzMByGCjBlBHFyIiNMWbfRIKryv0KRUojTfImHD2fX6lNm/+R4KBD8p9F0J27RBzj3Ho0FhoPOJw4Iy/x9i4+G30dH3UW+3vgFBXJlFRakY/ffsm3d8Admqfmhat2J0fJFLCIDbNcvVt13l7yyeAJjadCRe15RhPJaNJgHIlzrDkqsVx8/38TQAoFH5fz7fmKZzex27ewXgSLusNmvVJUrnvIeMn6TI6FP9scQIJB8zwRDkzLAsQMAJImsd3S869hIAAAAASUVORK5CYII=",
        },
        eight_dark: {
            base: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAA2FBMVEUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAmKCkAAAADBAQAAAD1+fxMTEzM6v4vLy7i9f/E6P/v8PKMye2frbiFo7aNpLQ1P0b////Z7/+I0PrQ6Pmk1vab0/bi7PXe6fKfz+6w1O2Cxu15veS/1OPY2dq8ydOrwdKHtdK1traZqbSQmqF8kZ+QlJhshJSBhIZ7fH0+YnY9R09GREMOIiwfJivp+f/X7fyYzO3g4OBmrtTMzMt0pcKnsrpWjq1Ii6xUcIEyZX8ENUgYNkYAKD1NaNryAAAADnRSTlMAzPGY5tV8WFAwGge/iAmaI18AAADKSURBVBjTNY7XFoIwEEQ3CR1NQi/23rsC9q7//0fiAe7bzLlndyBHI5ibSIYCVdgMmTM1SZ51tGQplZOZOwpvt9YRv1SmKCukuXWjIubMMf++IpU8a0bLYuQwnt5Du4U/qI4opWs2xKAJq65tG/XDaOa12IYA2TY6fjA26tW91V4KGuBJ85XaY2PgzTlSAULX/YplGhhBSVL09Efc732wSH17IWUT0L12DcNnp7tTskJOzjX32GyskA4ZJHn0e5OtoEKBjOI3Jlqefl82Et7gg4sWAAAAAElFTkSuQmCC",
            unread: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAA6lBMVEUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAQEAAADb3NxEQ0IAAAAAAABISEgAAAAAAAAlKCk9NzGurq6cnJwAAAD+/v73+Pi6u7tNTExGREMwLy7N6v61trY1QEfE6P/t7u+dzu6Mye2rwdKForaNpLTy+f/h9f/Z7//S6vuI0Pqk1vbg6/Sw1O2Cxu2+0uCHtdLKzM2qtbycqrV8kaCPl51shJV8f4I+YnYOIiwfJiud1PaY0vbo6Oh+vuR0vOPg4OBmrtS8ydN0pcLAwMBWjq1Ii6yjpaZUcIEyZX88R08ENUgYNkYAKD0sty6hAAAAFXRSTlMAzZjyWeUa1owv/Oe/roh8UAf26MtVcWhmAAAA10lEQVQY0zWP1ZLDMBRDr+04SbkLpjgMZeZ2mfn/f2ebqas3aTQaHTCyMVEaWXBWhW6rIg40Nv4CrTsdIfijNp22Go22nprzAJ2C1rq7YA5RItZlv92qL7tL5lI25+q4h75X+bT3zHQg5QcBm27GUeT3ewuPc8kw4N0wyYvM7089wSW1gcxuvxhjmZ+VQR0gTNM/x2WFX1zGPGgA7B8mv8RhebTCNa8JAOht8BKGn8k4rFXvrlwA6/A0SJOb4QY15et1+Rwf3u8nsx2tQMPQWmj/Q7BtOP8BG/MW/0ZJlAQAAAAASUVORK5CYII=",
            notif: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAABDlBMVEUAAAAAAAAAAAAAAAAAAAAAAAAAAQEAAAAAAAAAAAC2AQHrAAA4AAAAAAAAAABIAgIAAAAAAAAlKCneAABDAACuAABFAACcAAADBAQAAAAAAAC8AABNTE3+AQHN6v72+PmKo7QvLy5GAAD+/v/E6P+Myu6rwtLy+f/h9f/Z7//S6vuI0Pqk1vab0/bg6/Sfz+6w1O2Cxu2+0uHc3d2HtdLKzc61tracqrV8kaBshJV8f4I+YnY5R081QUkOIiwfJiv3AADt7u/r7e6YzO1+vuR0vONmrtS8ydN0pcKtucGnsrqQqLeCordWjq1Ii6yjqaqQmqGOk5i3hYhUcIEyZX8ENUgYNkZGREM1PEEAKD1ovUZyAAAAGnRSTlMAzfLlmliSGtYv/v77v66IfFAH+Ozo4suIXxNuy1MAAADcSURBVBjTNY9VjkJBFERvyxMcxud2Pxfc3cfdffa/ESA09VeVk0oOqBicSo9osEuCTbrO+cDTVd8j78Wi4wRdTzEF2WhMfmU/GJDtkH8rPaBJpXPhbfhCPjMsDVFn2A/k+o/MRm6nfIvppPh4pWCwcSsM7Ur53rcsgRz4tNZ8cmO70vHPLMEMoL36FyLGdrwZMgDzKPo3T9C1H9MpK5kFWFy3f6iJbjjiR34OAMhz9W7+99lszQ72U4c6gLa8qUaX9dqY5IQ4PgUAffly1e5NWQKyylYji2/KDeW5AobCG0Lco88iAAAAAElFTkSuQmCC",
        },
        pixel: {
            base: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAYFBMVEUAAAAAAAAAAABiam00WmxcZWlFTE4jQE1GTU8jQU4yV2g8QUIbNkE/WGRWYWY9WGUAAAAAAADg8vnY6fB5yOyA0fW95fi23fB+z/PQ4Od0weNoeYFWcoBSXmNFS00jP0wFxP2oAAAAEnRSTlMAIRHe3v3w8Nzc/ezs/u7u7EbfERAsAAAAcUlEQVQY05VP1wqAMAw0de82TYf7//9SOhBFELy3G1wuyQcYYw8OVVHBzYJUokzBW3VZg+MYFMhI0ThMMm9zlIXnVmmzbFy0iHtSkmq63mhtYuJQthO8X40OHSHR0DwO4UrsoAziDq84HudcO15P/MAJxpAGt0Xg7i0AAAAASUVORK5CYII=",
            unread: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAYFBMVEUAAAAATHcAIGJii6I0gKFFepYjdJVGepYjdJUAXIFeiaEyf6A8dZIbcJJThZ8/f55WhZ89f58AY4YAM2ng8/p/0vbY6/R5zPC95vq23/TQ5O10xelolKxWj6tFepUjdJUJarSxAAAAFHRSTlMAIBHe3vDw3Nwj/f3s7P7+7u7sRkWW9w4AAAB4SURBVBjTlY/ZDoUwCERL3fcNSnsX/f+/tEpjNCYm8nZgMjOoh9FaXxiyJIPTCSKDJoL9lKc5bIx+U3iOmXjoP6asSzSJKjwTWfdrx6lGnFXKVDWds9a1oliImmns/s6Khygq/g69pAQPjiH0kBTPoc7R4/bEi1kBHCgHTIPhydUAAAAASUVORK5CYII=",
            notif: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAhFBMVEUAAAAAV34AIDg0gKEkdJQjdJUUAAMAAEAyf6AbcJI7dZA/f55MAABAgaBEeZVljaVUhJ4AZIZpkKYAQmp5y/B+0fVrS0224PPf8vnP4uu85vqA0/fY6/NUIivtAABNHynjAAB0xelolKxWj6tNgZpFepUjdJVOTU9fREtAREvaAABiAADosgfnAAAAFHRSTlMAIBHe8NzcIP3s3v7x7u7e7uzeRqhOt1sAAACESURBVBjTlY9ZDoMwDERxCHvp6mASSKH7dv/71YWoAiEh4b83Ho3H3swIIUYchaswGqwgta1N4ccQyABgr4tjoTfA7KPCfKtrFsp63bGqDJ2vloXy5klUcZKRMfRsO8e9Uslhl12IXp8HZ/SOGE+5bN4NX3EZ6IPr0SvMrs6/x+SJBfMF/doItAPX5RIAAAAASUVORK5CYII=",
        },
        pixel_alt: {
            base: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAY1BMVEUAAAAATHcAIGJii6I0gKFFepYjdJVGepYjdJUAXIFeiaEyf6A8dZIbcJJThZ8/f55WhZ89f58AY4YAQmoAJGjg8/p/0vbY6/R5zPC95vq23/TQ5O10xelolKxWj6tFepUjdJUOfB3LAAAAFXRSTlMAIBHe3vDw3Nwj/f3s7P7+7u7sRkaqQLDYAAAAeUlEQVQY05WP6Q6EMAiES73vYxdKu4e+/1NapTEaExP598FkZlA3o7U+MWRJBocTRAZNBNspT3NYGf2m8Bwz8dB/TFmXaBJVeCay7teO7xpxUilT1XTOWteKYiZqXmP3d1Y8RFHxd+glJXhwDKGHpHgOdfYelycezAI9gweHH0yPzQAAAABJRU5ErkJggg==",
            unread: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAhFBMVEUAAAAjR1sKChFJeZBBa4FAZ3tCbIEVFRYABA9IeI9OaXlReI1MTExSeo9WcYBxh5RjfYw4WGt0ipcdKTh7y+6A0vdqbm/f8fi85fl+0PTY6vK23fDt7OzP4OdVWFlOUlS44PPj4+NZdITR4+t3xefa2tpyj55jiZ1Ba4BgZ2tiYF9ATFKjqzLCAAAAFHRSTlMAIBHe8O3c3CD93v7x7u7e7uzeRvBdAgMAAACFSURBVBjTlY9ZDoMwDERxIKylqwOBlATo3t7/fjVpVIGQkPDfG4/GY29hGGMTjqNNFI9WkOpOpzAwhEEIcGyKc9HsgNhHgfn+UpNQ1lvLlZDtvdcklL0XoEh4pqRUr846nqLip0P2aNXnbSjj50jwmnNzM3TFZaAProdVBnZ1/j1mT6yYLxHCCNKMC/PDAAAAAElFTkSuQmCC",
            notif: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAdVBMVEUAAAAkSFwKChFAaX9JeZAABBhCbIEVAABIeI9yiJVObnxReI1MAABSeo9WcYBjfYw4WGsdKTiA0vd7y+5rS0233/JSHiPf8vnP4um85fnY6/LtAABZdobjAAB3xedyj55jiZ1Ba4BOTU9gREtAREvaAABiAADFYUIqAAAAEnRSTlMAIRHv3iDc3P3e3v7x7u7u7EYDRb2ZAAAAgklEQVQY05WPWQ7CMAxE67jpSlnsOk1Kyw73PyJJFCEQUqX6741H43G2MEqpH9blptRfK2jMbBoIDAUWoGvbH3tbg+ecibudHb0wjNvIRE7Ok/HCMGXIVGErzsl9jo4rER727UXk8bqFjOio+NSheYYrKYNzSD2iEjjV+fT4e2LFvAFuzge5hY5wYgAAAABJRU5ErkJggg==",
        }
    };
    let currentStyle = "default";
    let currentState = "base";
    let cachedUserStyle = null;
    function removeFavicons() {
        const head = document.head;
        if (!head) return;
        head.querySelectorAll('link[rel="icon"], link[rel="shortcut icon"]').forEach(link => link.remove());
    }
    function insertFavicon(href) {
        const head = document.head;
        if (!head) return;
        const link = document.createElement('link');
        link.rel = 'icon';
        link.type = 'image/png';
        link.href = href;
        head.appendChild(link);
    }
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
    async function setFaviconStyle(style, state = "base") {
        if (!STYLES.includes(style)) style = "default";
        if (!STATES.includes(state)) state = "base";
        if (currentStyle === style && currentState === state) return; 

        const url = (FAVICON_DATA?.[style]?.[state]) || FAVICON_DATA.default.base;
        removeFavicons();
        insertFavicon(url);
        currentStyle = style;
        currentState = state;
        document.dispatchEvent(new CustomEvent("faviconStateChanged", {
            detail: { style, state }
        }));
    }
    async function setFavicon(state = "base") {
        if (!STATES.includes(state)) state = "base";
        const style = await getUserFaviconStyle();
        await setFaviconStyle(style, state);
    }
    async function resetFavicon() {
        await setFavicon("base");
    }
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
onReady(async function () {
    "use strict";
    const divThreads = document.getElementById("divThreads");
    const innerOP = document.querySelector(".innerOP");
    const divPosts = document.querySelector(".divPosts");
    const opHeadTitle = document.querySelector(".opHead.title");
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

    Object.freeze(scriptSettings); 
    let flatSettings = null;
    function flattenSettings() {
        if (flatSettings !== null) return flatSettings; 
        const result = {};
        Object.keys(scriptSettings).forEach((category) => {
            Object.keys(scriptSettings[category]).forEach((key) => {
                if (key.startsWith('_')) return;
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
        try {
            await GM.setValue("8chanSS_" + key, String(value));
        } catch (err) {
            console.error(`Failed to set setting for key ${key}:`, err);
        }
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
    featureSidebar();
    (function injectCustomCss() {
        let css = "";
        if (pageType.is8chan) {
            css += ":not(.is-catalog) body{margin:0}#sideCatalogDiv{z-index:200;background:var(--background-gradient)}#navFadeEnd,#navFadeMid,.watchedNotification::before,:root.disable-banner #bannerImage,:root.hide-announcement #dynamicAnnouncement,:root.hide-checkboxes .deletionCheckBox,:root.hide-close-btn .inlineQuote>.innerPost>.postInfo.title>a:first-child,:root.hide-jannytools #actionsForm,:root.hide-jannytools #boardContentLinks,:root.hide-nocookie #captchaBody>table:nth-child(2)>tbody:first-child>tr:nth-child(2),:root.hide-panelmessage #panelMessage,:root.hide-posting-form #postingForm{display:none}:root.hide-defaultBL #navTopBoardsSpan{display:none!important}:root.is-catalog.show-catalog-form #postingForm{display:block!important}:root.is-thread footer{visibility:hidden;height:0}nav.navHeader{z-index:300}nav.navHeader>.nav-boards:hover{overflow-x:auto;overflow-y:hidden;scrollbar-width:thin}:not(:root.bottom-header) .navHeader{box-shadow:0 1px 2px rgba(0,0,0,.15)}:root.bottom-header nav.navHeader{top:auto!important;bottom:0!important;box-shadow:0 -1px 2px rgba(0,0,0,.15)}:root.highlight-you .innerOP:has(> .opHead.title > .youName),:root.highlight-you .innerPost:has(> .postInfo.title > .youName){border-left:dashed #68b723 2px}:root.highlight-you .innerPost:has(>.divMessage>.you),:root.highlight-you .innerPost:has(>.divMessage>:not(div)>.you),:root.highlight-you .innerPost:has(>.divMessage>:not(div)>:not(div)>.you){border-left:solid var(--subject-color) 2px}:root.fit-replies :not(.hidden).innerPost{margin-left:10px;display:flow-root}:root.fit-replies :not(.hidden,.inlineQuote).innerPost{margin-left:0}.originalNameLink{display:inline;overflow-wrap:anywhere;white-space:normal}.multipleUploads .uploadCell:not(.expandedCell){max-width:215px}:not(#media-viewer)>.imgExpanded,:not(#media-viewer)>video{max-height:90vh!important;object-fit:contain;width:auto!important}:not(:root.auto-expand-tw) #watchedMenu .floatingContainer{overflow-x:hidden;overflow-wrap:break-word}:root.auto-expand-tw #watchedMenu .floatingContainer{height:fit-content!important;padding-bottom:10px}.watchedCellLabel a::before{content:attr(data-board);color:#aaa;margin-right:4px;font-weight:700}.watchButton.watched-active::before{color:#dd003e!important}#media-viewer,#multiboardMenu,#settingsMenu,#watchedMenu{font-size:smaller;padding:5px!important;box-shadow:-3px 3px 2px 0 rgba(0,0,0,.19)}#watchedMenu,#watchedMenu .floatingContainer{min-width:200px;max-width:100vw}.watchedNotification::before{padding-right:2px}#watchedMenu .floatingContainer{scrollbar-width:thin;scrollbar-color:var(--link-color) var(--contrast-color)}.scroll-arrow-btn{position:fixed;right:50px;width:36px;height:35px;background:#222;color:#fff;border:none;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,.18);font-size:22px;cursor:pointer;opacity:.7;z-index:800;display:flex;align-items:center;justify-content:center;transition:opacity .2s,background .2s}:root:not(.is-index,.is-catalog).ss-sidebar .scroll-arrow-btn{right:330px!important}.scroll-arrow-btn:hover{opacity:1;background:#444}#scroll-arrow-up{bottom:80px}#scroll-arrow-down{bottom:32px}.innerUtility.top{margin-top:2em;background-color:transparent!important;color:var(--link-color)!important}.innerUtility.top a{color:var(--link-color)!important}.bumpLockIndicator::after{padding-right:3px}.floatingMenu.focused{z-index:305!important}#quick-reply{padding:0}#media-viewer{padding:20px 0 0!important}#media-viewer.topright{top:26px!important;right:0!important;left:auto!important;max-height:97%!important;max-width:max-content!important}#media-viewer.topleft{top:26px!important;left:0!important;right:auto!important;max-height:97%!important;max-width:max-content!important}#media-viewer.topright::after{pointer-events:none}#media-viewer.topleft::after{pointer-events:none}.ss-chevron{transition:transform .2s;margin-left:6px;font-size:12px;display:inline-block}a.imgLink[data-filemime^='audio/'],a.originalNameLink[href$='.m4a'],a.originalNameLink[href$='.mp3'],a.originalNameLink[href$='.ogg'],a.originalNameLink[href$='.wav']{position:relative}.audio-preview-indicator{display:none;position:absolute;background:rgba(0,0,0,.7);color:#fff;padding:5px;font-size:12px;border-radius:3px;z-index:1000;left:0;top:0;white-space:nowrap;pointer-events:none}a.originalNameLink:hover .audio-preview-indicator,a[data-filemime^='audio/']:hover .audio-preview-indicator{display:block}.yt-icon{width:16px;height:13px;vertical-align:middle;margin-right:2px}.id-glow{box-shadow:0 0 12px var(--subject-color)}.id-dotted{border:2px dotted #fff}";
        }
        if (pageType.isThread) {
            css += ":root.sticky-qr #quick-reply{display:block;top:auto!important;bottom:0}:root.sticky-qr.ss-sidebar #quick-reply{left:auto!important;right:0!important}:root.sticky-qr.ss-leftsidebar #quick-reply{left:0!important;right:auto!important}:root.sticky-qr #qrbody{resize:vertical;max-height:50vh;height:130px}#selectedDivQr,:root.sticky-qr #selectedDiv{display:inline-flex;overflow:scroll hidden;max-width:300px}#qrbody{min-width:300px}:root.bottom-header #quick-reply{bottom:28px!important}:root.fade-qr #quick-reply{padding:0;opacity:.7;transition:opacity .3s ease}:root.fade-qr #quick-reply:focus-within,:root.fade-qr #quick-reply:hover{opacity:1}#qrFilesBody{max-width:310px}#quick-reply{box-shadow:-3px 3px 2px 0 rgba(0,0,0,.19)}#unread-line{height:2px;border:none!important;pointer-events:none!important;background-image:linear-gradient(to left,rgba(185,185,185,.2),var(--text-color),rgba(185,185,185,.2));margin:-3px auto -3px auto;width:60%}:root.ss-sidebar #bannerImage{width:19rem;right:0;position:fixed;top:26px}:root.ss-sidebar.bottom-header #bannerImage{top:0!important}:root.ss-leftsidebar #bannerImage{width:19rem;left:0;position:fixed;top:26px}:root.ss-leftsidebar.bottom-header #bannerImage{top:0!important}.quoteTooltip{z-index:999}.nestedQuoteLink{text-decoration:underline dashed!important}:root.hide-stub .unhideButton{display:none}.quoteTooltip .innerPost{overflow:hidden}.inlineQuote .innerPost,.quoteTooltip .innerPost{box-shadow:-1px 1px 2px 0 rgba(0,0,0,.19)}.inlineQuote{margin-top:4px}.postInfo.title>.inlineQuote{margin-left:15px}.postCell.is-hidden-by-filter{display:none}.reply-inlined{opacity:.5;text-decoration:underline dashed!important;text-underline-offset:2px}.quote-inlined{opacity:.5;text-decoration:underline dashed!important;text-underline-offset:2px}.target-highlight{background:var(--marked-color);border-color:var(--marked-border-color);color:var(--marked-text-color)}.statLabel{color:var(--link-color)}.statNumb{color:var(--text-color)}.postCell::before{display:inline!important;height:auto!important}.threadedReplies{border-left:1px solid #ccc;padding-left:15px}";
        } else if (pageType.isCatalog) {
            css += "#postingForm{margin:2em auto}#divTools>div:nth-child(5){float:left!important;margin-top:9px!important;margin-right:8px}";
        }
        if (css && !document.getElementById('8chSS')) {
            const style = document.createElement('style');
            style.id = '8chSS';
            style.textContent = css;
            document.head.appendChild(style);
        }
    })();
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
    for (const { key, fn } of featureMap) {
        try {
            if (await getSetting(key)) {
                fn();
            }
        } catch (e) {
            console.error(`${fn.name || 'Feature'} failed:`, e);
        }
    }
    if (await getSetting("truncFilenames")) {
        try {
            const filenameLength = await getSetting("truncFilenames_customTrunc");
            truncateFilenames(filenameLength);
        } catch (e) {
            console.error("truncateFilenames failed:", e);
        }
    }
    async function enableFavicon() {
        try {
            const customFaviconEnabled = await getSetting("customFavicon");
            const selectedStyle = await getSetting("customFavicon_faviconStyle");

            if (customFaviconEnabled) {
                if (selectedStyle && typeof selectedStyle === 'string') {
                    await faviconManager.setFaviconStyle(selectedStyle);
                } else {
                    console.warn("Invalid favicon style:", selectedStyle);
                    await faviconManager.setFaviconStyle("eight_dark");
                }
            } else {
                await faviconManager.resetFavicon();
            }
        } catch (e) {
            console.error("Error updating favicon:", e);
        }
    }
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
    async function featureSaveScroll() {
        if (!pageType.isThread) return;

        const STORAGE_KEY = "8chanSS_scrollPositions";
        const UNREAD_LINE_ID = "unread-line";
        const MAX_THREADS = 200;
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
            if (!divPosts) return 0;
            return divPosts.querySelectorAll(":scope > .postCell[id]").length;
        }
        function removeUnreadLineMarker() {
            const oldMarker = document.getElementById(UNREAD_LINE_ID);
            if (oldMarker && oldMarker.parentNode) {
                oldMarker.parentNode.removeChild(oldMarker);
            }
        }
        let lastSeenPostCount = 0;
        let unseenCount = 0;
        let tabTitleBase = null;
        let previousFaviconState = null;
        const customFaviconEnabled = await getSetting("customFavicon");

        async function updateTabTitle() {
            if (window.isNotifying) return;
            if (!tabTitleBase) tabTitleBase = document.title.replace(/^\(\d+\)\s*/, "");
            document.title = unseenCount > 0 ? `(${unseenCount}) ${tabTitleBase}` : tabTitleBase;
            const { style, state } = faviconManager.getCurrentFaviconState();

            if (unseenCount > 0 && customFaviconEnabled) {
                if (state !== "unread") {
                    previousFaviconState = { style, state };
                }
                faviconManager.setFaviconStyle(style, "unread");
            } else if (unseenCount == 0 && customFaviconEnabled) {
                if (state === "unread" && previousFaviconState) {
                    faviconManager.setFaviconStyle(previousFaviconState.style, previousFaviconState.state);
                    previousFaviconState = null;
                } else if (state === "unread") {
                    faviconManager.setFavicon("base");
                }
            }
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
        function scrollElementToViewportCenter(el) {
            if (!el) return;
            const rect = el.getBoundingClientRect();
            const elTop = rect.top + window.pageYOffset;
            const elHeight = rect.height;
            const viewportHeight = window.innerHeight;
            const scrollTo = elTop - (viewportHeight / 2) + (elHeight / 2);
            window.scrollTo({ top: scrollTo, behavior: "auto" });
        }
        async function restoreScrollPosition() {
            const info = getBoardAndThread();
            if (!info || !(await getSetting("enableScrollSave"))) return;

            const allData = await getAllSavedScrollData();
            const key = `${info.board}/${info.thread}`;
            const saved = allData[key];
            if (!saved || typeof saved.position !== "number") return;

            const anchor = window.location.hash ? window.location.hash.replace(/^#/, "") : null;
            const safeAnchor = anchor && /^[a-zA-Z0-9_-]+$/.test(anchor) ? anchor : null;

            if (safeAnchor) {
                setTimeout(() => {
                    const post = document.getElementById(safeAnchor);
                    if (post && post.classList.contains("postCell")) {
                        scrollElementToViewportCenter(post);
                    }
                    addUnreadLineAtSavedScrollPosition(saved.position, false);
                }, 25);
                return;
            }
            saved.timestamp = Date.now();
            await setAllSavedScrollData(allData);
            window.scrollTo({ top: saved.position, behavior: "auto" });
            setTimeout(() => addUnreadLineAtSavedScrollPosition(saved.position, false), 80);
        }
        async function addUnreadLineAtSavedScrollPosition(scrollPosition, centerAfter = false) {
            if (!(await getSetting("enableScrollSave_showUnreadLine"))) return;
            if (!divPosts) return;
            const margin = 5; 
            const docHeight = document.body.offsetHeight;
            if ((scrollPosition + window.innerHeight) >= (docHeight - margin)) {
                return;
            }
            const posts = Array.from(divPosts.querySelectorAll(":scope > .postCell[id]"));
            let targetPost = null;
            for (let i = 0; i < posts.length; ++i) {
                const postTop = posts[i].offsetTop;
                if (postTop > scrollPosition) break;
                targetPost = posts[i];
            }
            if (!targetPost) return;
            removeUnreadLineMarker();
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
                }, 25);
            }
        }
        function observePostCount() {
            if (!divPosts) return;
            const observer = new MutationObserver(() => {
                updateUnseenCountFromSaved();
            });
            observer.observe(divPosts, { childList: true, subtree: false });
        }
        async function removeUnreadLineIfAtBottom() {
            if (!(await getSetting("enableScrollSave_showUnreadLine"))) return;
            const margin = 5; 
            if ((window.innerHeight + window.scrollY) >= (document.body.offsetHeight - margin)) {
                removeUnreadLineMarker();
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

        let scrollTimeout = null;
        window.addEventListener("scroll", () => {
            if (scrollTimeout) return;
            scrollTimeout = setTimeout(async () => {
                await onScrollUpdateSeen();
                await removeUnreadLineIfAtBottom();
                scrollTimeout = null;
            }, 100); 
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
                    if (
                        link.href &&
                        !link.href.endsWith("/catalog.html") &&
                        !link.dataset.catalogLinkProcessed
                    ) {
                        link.href += "/catalog.html";
                        link.dataset.catalogLinkProcessed = "1";
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
        const debouncedAppend = debounce(appendCatalogToLinks, 100);
        const config = { childList: true, subtree: true };
        const navboardsSpan = document.getElementById("navBoardsSpan");
        if (navboardsSpan && !navboardsSpan._catalogLinksObserverAttached) {
            const observer = new MutationObserver(debouncedAppend);
            observer.observe(navboardsSpan, config);
            navboardsSpan._catalogLinksObserverAttached = true;
        }
    }
    function catalogThreadsInNewTab() {
        if (!pageType.isCatalog) return;
        catalogDiv.querySelectorAll('.catalogCell a.linkThumb').forEach(link => {
            if (link.getAttribute('target') !== '_blank') {
                link.setAttribute('target', '_blank');
            }
        });
        catalogDiv.addEventListener('click', function (e) {
            const link = e.target.closest('.catalogCell a.linkThumb');
            if (link && link.getAttribute('target') !== '_blank') {
                link.setAttribute('target', '_blank');
            }
        });
    }
    function featureImageHover() {
        const MEDIA_MAX_WIDTH = "90vw";
        const MEDIA_OPACITY_LOADING = "0";
        const MEDIA_OPACITY_LOADED = "1";
        const MEDIA_OFFSET = 50; 
        const MEDIA_BOTTOM_MARGIN = 3; 
        const AUDIO_INDICATOR_TEXT = "▶ Playing audio...";
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
        function sanitizeUrl(url) {
            try {
                const parsed = new URL(url, window.location.origin);
                if ((parsed.protocol === "http:" || parsed.protocol === "https:") &&
                    parsed.origin === window.location.origin) {
                    return parsed.href;
                }
            } catch { }
            return "";
        }
        let floatingMedia = null;
        let cleanupFns = [];
        let currentAudioIndicator = null;
        let lastMouseEvent = null; 
        const docElement = document.documentElement;
        const SCROLLBAR_WIDTH = window.innerWidth - docElement.clientWidth; 
        function clamp(val, min, max) {
            return Math.max(min, Math.min(max, val));
        }
        function positionFloatingMedia(event) {
            if (!floatingMedia) return;
            const vw = window.innerWidth;
            const vh = window.innerHeight;
            const mw = floatingMedia.offsetWidth || 0;
            const mh = floatingMedia.offsetHeight || 0;

            const MEDIA_BOTTOM_MARGIN_PX = window.innerHeight * (MEDIA_BOTTOM_MARGIN / 100); 

            let x, y;
            let rightX = event.clientX + MEDIA_OFFSET;
            let leftX = event.clientX - MEDIA_OFFSET - mw;
            if (rightX + mw <= vw - SCROLLBAR_WIDTH) {
                x = rightX;
            }
            else if (leftX >= 0) {
                x = leftX;
            }
            else {
                x = clamp(rightX, 0, vw - mw - SCROLLBAR_WIDTH);
            }

            y = event.clientY;
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
        function getFullMediaSrc(thumbNode, filemime) {
            const thumbnailSrc = thumbNode.getAttribute("src");
            if (!filemime) {
                if (
                    thumbNode.closest('.catalogCell') ||
                    /^\/\.media\/t?_[a-f0-9]{40,}$/i.test(thumbnailSrc.replace(/\\/g, ''))
                ) {
                    return thumbnailSrc;
                }
                return null;
            }
            const parentA = thumbNode.closest("a.linkThumb, a.imgLink");
            const fileWidth = parentA ? parseInt(parentA.getAttribute("data-filewidth"), 10) : null;
            const fileHeight = parentA ? parseInt(parentA.getAttribute("data-fileheight"), 10) : null;
            const isSmallImage = (fileWidth && fileWidth <= 220) || (fileHeight && fileHeight <= 220);
            if (
                isSmallImage &&
                filemime && filemime.toLowerCase() === "image/png" &&
                !/\/t_/.test(thumbnailSrc) &&
                !/\.[a-z0-9]+$/i.test(thumbnailSrc)
            ) {
                return thumbnailSrc;
            }
            if (isSmallImage && thumbnailSrc.match(/\/\.media\/[^\/]+\.[a-zA-Z0-9]+$/)) {
                return thumbnailSrc;
            }
            if (/\/t_/.test(thumbnailSrc)) {
                let base = thumbnailSrc.replace(/\/t_/, "/");
                base = base.replace(/\.(jpe?g|jxl|png|apng|gif|avif|webp|webm|mp4|m4v|ogg|mp3|m4a|wav)$/i, "");
                if (filemime && (filemime.toLowerCase() === "image/apng" || filemime.toLowerCase() === "video/x-m4v")) {
                    return base;
                }

                const ext = filemime ? getExtensionForMimeType(filemime) : null;
                if (!ext) return null;
                return base + ext;
            }
            if (
                thumbnailSrc.match(/^\/\.media\/[a-f0-9]{40,}$/i) && 
                !/\.[a-z0-9]+$/i.test(thumbnailSrc)
            ) {
                if (filemime && (filemime.toLowerCase() === "image/apng" || filemime.toLowerCase() === "video/x-m4v")) {
                    return thumbnailSrc;
                }

                const ext = filemime ? getExtensionForMimeType(filemime) : null;
                if (!ext) {
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
            fullSrc = sanitizeUrl(fullSrc);
            if (!fullSrc) return;
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
                window.addEventListener("scroll", cleanup, { passive: true, once: true });
                cleanupFns.push(() => thumb.removeEventListener("mouseleave", cleanup));
                if (container) cleanupFns.push(() => container.removeEventListener("click", cleanup));
                cleanupFns.push(() => window.removeEventListener("scroll", cleanup));
                return;
            }
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
            function mouseMoveHandler(ev) {
                lastMouseEvent = ev;
                positionFloatingMedia(ev);
            }
            document.addEventListener("mousemove", mouseMoveHandler, { passive: true });
            thumb.addEventListener("mouseleave", leaveHandler, { passive: true, once: true });
            cleanupFns.push(() => document.removeEventListener("mousemove", mouseMoveHandler));
            if (lastMouseEvent) {
                positionFloatingMedia(lastMouseEvent);
            }
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
            floatingMedia.onerror = cleanupFloatingMedia;
            function leaveHandler() { cleanupFloatingMedia(); }
            thumb.addEventListener("mouseleave", leaveHandler, { once: true });
            window.addEventListener("scroll", leaveHandler, { passive: true, once: true });
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
        if (divThreads) {
            const observer = new MutationObserver((mutations) => {
                const addedElements = [];
                for (const mutation of mutations) {
                    for (const node of mutation.addedNodes) {
                        if (node.nodeType === 1) {
                            addedElements.push(node);
                        }
                    }
                }
                addedElements.forEach(node => attachThumbListeners(node));
            });
            observer.observe(divThreads, { childList: true, subtree: true });
        }
    }
    function featureBlurSpoilers() {
        if (pageType.isCatalog) return;
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
            if (
                /\/\.media\/[^\/]+?\.[a-zA-Z0-9]+$/.test(img.src) && 
                !/\/\.media\/t_[^\/]+?\.[a-zA-Z0-9]+$/.test(img.src) 
            ) {
                return;
            }
            const isCustomSpoiler = img.src.includes("/custom.spoiler")
                || img.src.includes("/*/custom.spoiler")
                || img.src.includes("/spoiler.png");
            const isNotThumbnail = !img.src.includes("/.media/t_");
            const hasFilenameExtension = !isCustomSpoiler && /\.[a-zA-Z0-9]+$/.test(img.src);

            if (isNotThumbnail || isCustomSpoiler) {
                let href = link.getAttribute("href");
                if (!href) {
                    return;
                }
                const match = href.match(/\/\.media\/([^\/]+)\.[a-zA-Z0-9]+$/);
                if (!match) {
                    return;
                }
                const fileMime = link.getAttribute("data-filemime") || "";
                const ext = getExtensionForMimeType(fileMime);
                const fileWidthAttr = link.getAttribute("data-filewidth");
                const fileHeightAttr = link.getAttribute("data-fileheight");
                let transformedSrc;
                if (
                    (fileWidthAttr && Number(fileWidthAttr) < 250) ||
                    (fileHeightAttr && Number(fileHeightAttr) < 250)
                ) {
                    transformedSrc = `/.media/${match[1]}${ext}`;
                } else if (!hasFilenameExtension && isCustomSpoiler) {
                    transformedSrc = `/.media/t_${match[1]}`;
                } else {
                    return;
                }
                const initialWidth = img.offsetWidth;
                const initialHeight = img.offsetHeight;
                img.style.width = initialWidth + "px";
                img.style.height = initialHeight + "px";
                img.src = transformedSrc;
                img.onload = function () {
                    img.style.width = img.naturalWidth + "px";
                    img.style.height = img.naturalHeight + "px";
                };
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
        const spoilerLinks = document.querySelectorAll("a.imgLink");
        spoilerLinks.forEach((link, idx) => processImgLink(link, idx));
        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType !== 1) return; 
                    if (node.classList && node.classList.contains('imgLink')) {
                        processImgLink(node);
                    } else if (node.querySelectorAll) {
                        node.querySelectorAll('.imgLink').forEach(link => processImgLink(link));
                    }
                });
            });
        });
        observer.observe(divThreads, { childList: true, subtree: true });
    }
    function autoHideHeaderOnScroll() {
        const header = document.getElementById('dynamicHeaderThread');
        if (!header) return;
        const scrollThreshold = 50; 
        let lastScrollY = window.scrollY;
        let scrollDirection = 'none';
        let ticking = false;

        function updateHeaderVisibility() {
            const currentScrollY = window.scrollY;
            scrollDirection = currentScrollY > lastScrollY ? 'down' : 'up';
            lastScrollY = currentScrollY;
            const isNearTop = currentScrollY < 100;
            if (scrollDirection === 'up' || isNearTop) {
                header.classList.remove('nav-hidden');
            } else if (scrollDirection === 'down' && currentScrollY > scrollThreshold) {
                header.classList.add('nav-hidden');
            }

            ticking = false;
        }
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
        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(updateHeaderVisibility);
                ticking = true;
            }
        }, { passive: true });
        updateHeaderVisibility();
    }
    const decodeHtmlEntitiesTwice = (() => {
        const txt = document.createElement('textarea');
        return function (html) {
            txt.innerHTML = html;
            const once = txt.value;
            txt.innerHTML = once;
            return txt.value;
        };
    })();
    function highlightMentions() {
        const watchedCells = document.querySelectorAll("#watchedMenu .watchedCell");
        const watchButton = document.querySelector(".opHead .watchButton");
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
                    if (watchButton) {
                        watchButton.style.color = "var(--board-title-color)";
                        watchButton.title = "Watched";
                    }
                }
                const originalText = labelLink.textContent;
                const decodedText = decodeHtmlEntitiesTwice(originalText);
                if (labelLink.textContent !== decodedText) {
                    labelLink.textContent = decodedText;
                }
            }
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
            if (notificationText.startsWith("(") === true) {
                return;
            }
            if (notificationText.includes("(you)") === true) {
                const parts = notificationText.split(", ");
                const totalReplies = parts[0];
                styleMentionYou(labelLink, notification, totalReplies);
            }
            else if (/^\d+$/.test(notificationText)) {
                styleMentionNumber(notification, notificationText);
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
        if (pageType.isCatalog || pageType.isIndex) return;
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

        showThreadWatcher();
    }
    function markAllThreadsAsRead() {
        const handleDiv = document.querySelector('#watchedMenu > div.handle');
        if (!handleDiv) return;
        if (handleDiv.querySelector('.watchedCellDismissButton.markAllRead')) return;
        const btn = document.createElement('a');
        btn.className = 'watchedCellDismissButton glowOnHover coloredIcon markAllRead';
        btn.title = 'Mark all threads as read';
        btn.style.float = 'right';
        btn.style.paddingTop = '3px';
        function hasUnreadThreads() {
            const watchedMenu = document.querySelector('#watchedMenu > div.floatingContainer');
            if (!watchedMenu) return false;
            return watchedMenu.querySelectorAll('td.watchedCellDismissButton.glowOnHover.coloredIcon[title="Mark as read"]').length > 0;
        }
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
        const watchedMenu = document.querySelector('#watchedMenu > div.floatingContainer');
        let observer = null;
        if (watchedMenu) {
            const debouncedUpdate = debounce(updateButtonState, 100);
            observer = new MutationObserver(debouncedUpdate);
            observer.observe(watchedMenu, { childList: true, subtree: true });
            const removalObserver = new MutationObserver(() => {
                if (!document.body.contains(watchedMenu) || watchedMenu.style.display === "none") {
                    observer.disconnect();
                    removalObserver.disconnect();
                }
            });
            removalObserver.observe(document.body, { childList: true, subtree: true });
        }
        updateButtonState();
        handleDiv.appendChild(btn);
        document.body.addEventListener('click', function (e) {
            const closeBtn = e.target.closest('#watchedMenu .close-btn');
            if (closeBtn) {
                const watchedMenu = document.getElementById("watchedMenu");
                if (watchedMenu) watchedMenu.style.display = "none";
                return;
            }
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
    function hashNavigation() {
        if (!pageType.isThread) return;
        const processedLinks = new WeakSet();
        function addHashLinks(container = document) {
            const links = container.querySelectorAll('.panelBacklinks a, .altBacklinks a, .divMessage .quoteLink');
            links.forEach(link => {
                if (
                    processedLinks.has(link) ||
                    (link.nextSibling && link.nextSibling.classList && link.nextSibling.classList.contains('hash-link-container'))
                ) return;
                const hashSpan = document.createElement('span');
                hashSpan.textContent = ' #';
                hashSpan.className = 'hash-link';
                hashSpan.style.cursor = 'pointer';
                hashSpan.style.color = 'var(--navbar-text-color)';
                hashSpan.title = 'Scroll to post';
                const wrapper = document.createElement('span');
                wrapper.className = 'hash-link-container';
                wrapper.appendChild(hashSpan);

                link.insertAdjacentElement('afterend', wrapper);
                processedLinks.add(link);
            });
        }
        addHashLinks();
        if (window.tooltips) {
            ['loadTooltip', 'addLoadedTooltip'].forEach(fn => {
                if (typeof tooltips[fn] === 'function') {
                    const orig = tooltips[fn];
                    tooltips[fn] = function (...args) {
                        const result = orig.apply(this, args);
                        let container = args[0];
                        if (container && container.nodeType === Node.ELEMENT_NODE) {
                            addHashLinks(container);
                        }
                        return result;
                    };
                }
            });
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
        const postsContainer = divThreads || document.body;
        postsContainer.addEventListener('click', function (e) {
            if (e.target.classList.contains('hash-link')) {
                e.preventDefault();
                const link = e.target.closest('.hash-link-container').previousElementSibling;
                if (!link || !link.href) return;
                const hashMatch = link.href.match(/#(\d+)$/);
                if (!hashMatch) return;
                const postId = hashMatch[1];
                const safePostId = /^[0-9]+$/.test(postId) ? postId : null;
                if (!safePostId) return;
                const postElem = document.getElementById(safePostId);
                if (postElem) {
                    window.location.hash = `#${safePostId}`;
                    if (postElem.classList.contains('opCell')) {
                        const offset = 25; 
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
    async function featureHideAnnouncement() {
        async function processElement(selector, settingKey, contentKey) {
            const el = document.querySelector(selector);
            if (!el) return;

            const content = (el.textContent || "").replace(/[^\w\s.,!?-]/g, ""); 
            const shouldHide = await GM.getValue(`8chanSS_${settingKey}`, "false") === "true";
            const storedContent = await GM.getValue(`8chanSS_${contentKey}`, null);
            const root = document.documentElement;

            if (shouldHide) {
                if (storedContent !== null && storedContent !== content) {
                    if (typeof window.setSetting === "function") {
                        await window.setSetting("hideAnnouncement", false);
                    }
                    await GM.setValue(`8chanSS_${settingKey}`, "false");
                    await GM.deleteValue(`8chanSS_${contentKey}`);
                    return;
                }
                root.classList.add("hide-announcement");
                await GM.setValue(`8chanSS_${contentKey}`, content);
            } else {
                root.classList.remove("hide-announcement");
                await GM.deleteValue(`8chanSS_${contentKey}`);
            }
        }

        await processElement("#dynamicAnnouncement", "hideAnnouncement", "announcementContent");
    }
    async function featureBeepOnYou() {
        if (!divPosts) return;
        let audioContext = null;
        let audioContextReady = false;
        let audioContextPromise = null;
        function ensureAudioContextReady() {
            if (audioContextReady) return Promise.resolve();
            if (audioContextPromise) return audioContextPromise;

            audioContextPromise = new Promise((resolve) => {
                function resumeAudioContext() {
                    if (!audioContext) {
                        audioContext = new (window.AudioContext || window.webkitAudioContext)();
                    }
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
                window.addEventListener('click', resumeAudioContext);
                window.addEventListener('keydown', resumeAudioContext);
            });
            return audioContextPromise;
        }

        async function createBeepSound() {
            if (!(await getSetting("beepOnYou"))) {
                return;
            }
            await ensureAudioContextReady();

            return function playBeep() {
                try {
                    const oscillator = audioContext.createOscillator();
                    const gainNode = audioContext.createGain();

                    oscillator.type = 'sine';
                    oscillator.frequency.value = 550; 
                    gainNode.gain.value = 0.1; 

                    oscillator.connect(gainNode);
                    gainNode.connect(audioContext.destination);
                    oscillator.start();
                    setTimeout(() => {
                        oscillator.stop();
                    }, 100); 
                } catch (e) {
                    console.warn("Beep failed:", e);
                }
            };
        }
        window.originalTitle = document.title;
        window.isNotifying = false;
        let beepOnYouSetting = false;
        let notifyOnYouSetting = false;
        let customMsgSetting = "(!) ";
        let previousFaviconState = null;
        async function initSettings() {
            beepOnYouSetting = await getSetting("beepOnYou");
            notifyOnYouSetting = await getSetting("notifyOnYou");
            const customMsg = await getSetting("notifyOnYou_customMessage");
            if (customMsg) customMsgSetting = customMsg;
        }
        await initSettings();
        let playBeep = null;
        createBeepSound().then(fn => { playBeep = fn; });
        let scrollHandlerActive = false;
        async function notifyOnYou() {
            if (!window.isNotifying) {
                window.isNotifying = true;
                document.title = customMsgSetting + " " + window.originalTitle;
                if (await getSetting("customFavicon")) {
                    const { style, state } = faviconManager.getCurrentFaviconState();
                    if (state !== "notif") {
                        previousFaviconState = { style, state };
                    }
                    faviconManager.setFaviconStyle(style, "notif");
                }
            }
        }
        function setupNotificationScrollHandler() {
            if (scrollHandlerActive) return;
            scrollHandlerActive = true;
            const BOTTOM_OFFSET = 45;
            function checkScrollPosition() {
                if (!window.isNotifying) return;
                const scrollPosition = window.scrollY + window.innerHeight;
                const documentHeight = document.documentElement.scrollHeight;
                if (scrollPosition >= documentHeight - BOTTOM_OFFSET) {
                    document.title = window.originalTitle;
                    window.isNotifying = false;
                    const { state } = faviconManager.getCurrentFaviconState();
                    if (state === "notif" && previousFaviconState) {
                        faviconManager.setFaviconStyle(previousFaviconState.style, previousFaviconState.state);
                        previousFaviconState = null;
                    } else if (state === "notif") {
                        faviconManager.setFavicon("base");
                    }
                    window.removeEventListener('scroll', checkScrollPosition);
                    scrollHandlerActive = false;
                }
            }
            window.addEventListener('scroll', checkScrollPosition);
        }
        window.addEventListener("focus", () => {
            if (window.isNotifying) {
                setupNotificationScrollHandler();
            }
        });
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
        if (pageType.isCatalog) return;
        const ytTitleCache = {};
        const MAX_CACHE_SIZE = 350;
        const ORDER_KEY = "_order";
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
        function sanitizeYouTubeId(videoId) {
            if (!videoId) return null;
            const match = videoId.match(/([a-zA-Z0-9_-]{11})/);
            return match ? match[1] : null;
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
                return Promise.resolve(ytTitleCache[cleanId]);
            }
            return fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${cleanId}&format=json`)
                .then(r => r.ok ? r.json() : null)
                .then(data => {
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
                })
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
        new MutationObserver(() => processLinks(divThreads)).observe(divThreads, { childList: true, subtree: true });
    }
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
        function convertAllLabelCreated(root = document) {
            const spans = root.querySelectorAll
                ? root.querySelectorAll('.labelCreated')
                : [];
            spans.forEach(convertLabelCreatedSpan);
        }

        convertAllLabelCreated();
        if (typeof divPosts !== "undefined" && divPosts) {
            new MutationObserver(mutations => {
                mutations.forEach(mutation => {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType !== 1) return; 
                        if (node.classList && node.classList.contains('labelCreated')) {
                            convertLabelCreatedSpan(node);
                        } else if (node.querySelectorAll) {
                            node.querySelectorAll('.labelCreated').forEach(convertLabelCreatedSpan);
                        }
                    });
                });
            }).observe(divPosts, { childList: true, subtree: true });
        }
    }
    function truncateFilenames(filenameLength) {
        if (pageType.isCatalog) return;

        function processLinks(root = document, fromObserver = false) {
            const links = root.querySelectorAll('a.originalNameLink');
            links.forEach(link => {
                if (link.dataset.truncated === "1") return;
                const fullFilename = link.getAttribute('download');
                if (!fullFilename) {
                    return;
                }
                const lastDot = fullFilename.lastIndexOf('.');
                if (lastDot === -1) {
                    return; 
                }
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
        processLinks(document, false);
        if (divThreads) {
            new MutationObserver((mutations) => {
                mutations.forEach(mutation => {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === 1) { 
                            if (node.matches && node.matches('a.originalNameLink')) {
                                processLinks(node, true);
                            } else {
                                processLinks(node, true);
                            }
                        }
                    });
                });
            }).observe(divThreads, { childList: true, subtree: true });
        }
    }
    function threadInfoHeader(retries = 10, delay = 200) {
        const navHeader = document.querySelector('.navHeader');
        const navOptionsSpan = document.getElementById('navOptionsSpan');
        const postCountEl = document.getElementById('postCount');
        const userCountEl = document.getElementById('userCountLabel');
        const fileCountEl = document.getElementById('fileCount');
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
        const postCount = postCountEl.textContent || '0';
        const userCount = userCountEl.textContent || '0';
        const fileCount = fileCountEl.textContent || '0';
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
        if (statsDisplay.parentNode && statsDisplay.parentNode !== navOptionsSpan) {
            statsDisplay.parentNode.removeChild(statsDisplay);
        }
        if (navOptionsSpan.firstChild !== statsDisplay) {
            navOptionsSpan.insertBefore(statsDisplay, navOptionsSpan.firstChild);
        }
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
    function mediaViewerPositioning() {
        localStorage.setItem("mediaViewer", "true");
        async function updateMediaViewerClass() {
            const mediaViewer = document.getElementById('media-viewer');
            if (!mediaViewer) return;

            const isEnabled = await getSetting("enableMediaViewer");
            if (!isEnabled) {
                mediaViewer.classList.remove('topright', 'topleft');
                return;
            }

            const viewerStyle = await getSetting("enableMediaViewer_viewerStyle");
            mediaViewer.classList.remove('topright', 'topleft');
            if (viewerStyle === 'topright' || viewerStyle === 'topleft') {
                mediaViewer.classList.add(viewerStyle);
            } else {
            }
        }
        function setupIfMediaViewerExists() {
            const mediaViewer = document.getElementById('media-viewer');
            if (mediaViewer) {
                updateMediaViewerClass();
                return true;
            }
            return false;
        }
        if (setupIfMediaViewerExists()) {
        } else {
            const observer = new MutationObserver((mutations) => {
                for (const mutation of mutations) {
                    if (mutation.addedNodes.length) {
                        for (const node of mutation.addedNodes) {
                            if (node.id === 'media-viewer' ||
                                (node.nodeType === 1 && node.querySelector('#media-viewer'))) {
                                updateMediaViewerClass();
                                observer.disconnect();
                                return;
                            }
                        }
                    }
                }
            });
            observer.observe(document.body, { childList: true, subtree: false });
        }
    }
    async function featureHighlightNewIds() {
        if (pageType.isLast || pageType.isCatalog) return;

        const hlStyle = await getSetting("highlightNewIds_idHlStyle");
        if (!divPosts) return;
        if (!document.querySelector('.spanId')) return;
        const styleClassMap = {
            moetext: "moeText",
            glow: "id-glow",
            dotted: "id-dotted"
        };
        const styleClass = styleClassMap[hlStyle] || "moeText"; 
        function highlightIds(root = divPosts) {
            const idFrequency = {};
            const labelSpans = root.querySelectorAll('.labelId');
            labelSpans.forEach(span => {
                const id = span.textContent.trim();
                idFrequency[id] = (idFrequency[id] || 0) + 1;
            });
            const seen = {};
            labelSpans.forEach(span => {
                const id = span.textContent.trim();
                span.classList.remove('moetext', 'id-glow', 'id-dotted');
                if (!seen[id]) {
                    seen[id] = true;
                    span.classList.add(styleClass);
                    span.title = idFrequency[id] === 1
                        ? "This ID appears only once."
                        : "This was the first occurrence of this ID.";
                } else {
                    span.title = "";
                }
            });
        }
        highlightIds();
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
    async function featureQuoteThreading() {
        const isEnabled = typeof getSetting === "function"
            ? await getSetting("quoteThreading")
            : true;

        if (!isEnabled) {
            document.querySelector('.quoteThreadingRefresh')?.remove();
            return;
        }
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
                        if (!repliesContainer?.classList.contains('threadedReplies')) {
                            repliesContainer = document.createElement('div');
                            repliesContainer.className = 'threadedReplies';
                            post.parentNode.insertBefore(repliesContainer, post.nextSibling);
                        }
                        if (!repliesContainer.contains(targetPost)) {
                            repliesContainer.appendChild(targetPost);
                        }
                    }
                });
            });
        }
        function threadAllPosts() {
            processPosts(document.querySelectorAll('.divPosts .postCell'));
        }

        function threadNewPosts() {
            const allPosts = document.querySelectorAll('.divPosts .postCell');
            processPosts(Array.from(allPosts).slice(-5));
        }
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
        threadAllPosts();  
        addRefreshButton();
        setupPostObserver();
    }
    function featureLastFifty() {
        if (!pageType.isCatalog) return;
        function addLastLinkButtons(root = document) {
            root.querySelectorAll('.catalogCell').forEach(cell => {
                const linkThumb = cell.querySelector('.linkThumb');
                const threadStats = cell.querySelector('.threadStats');
                if (!linkThumb || !threadStats) return;

                const href = linkThumb.getAttribute('href');
                if (!href || !/\/res\//.test(href)) return;
                const lastHref = href.replace('/res/', '/last/');
                threadStats.querySelectorAll('.last-link-btn').forEach(btn => btn.remove());
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
                const labelPage = threadStats.querySelector('.labelPage');
                if (labelPage && labelPage.parentNode) {
                    labelPage.parentNode.insertBefore(span, labelPage.nextSibling);
                } else {
                    threadStats.appendChild(span);
                }
            });
        }
        addLastLinkButtons(document);
        if (!divThreads) return;
        const debouncedUpdate = debounce(() => addLastLinkButtons(document), 50);
        const observer = new MutationObserver(debouncedUpdate);

        observer.observe(divThreads, { childList: true, subtree: false });
    }
    async function createSettingsMenu() {
        let menu = document.getElementById("8chanSS-menu");
        if (menu) return menu;
        menu = document.createElement("div");
        menu.id = "8chanSS-menu";
        menu.style.position = "fixed";
        menu.style.top = "3rem"; 
        menu.style.left = "20rem"; 
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
        const closeOnOutsideClick = (e) => {
            if (menu.style.display !== "none" && !menu.contains(e.target)) {
                const menuToggle = document.getElementById("8chanSS-icon");
                if (menuToggle && !menuToggle.contains(e.target)) {
                    menu.style.display = "none";
                }
            }
        };
        Object.defineProperty(menu.style, 'display', {
            set: function (value) {
                const oldValue = this.getPropertyValue('display');
                this.setProperty('display', value);
                if (oldValue === 'none' && value !== 'none') {
                    setTimeout(() => { 
                        document.addEventListener('click', closeOnOutsideClick);
                    }, 10);
                }
                else if (oldValue !== 'none' && value === 'none') {
                    document.removeEventListener('click', closeOnOutsideClick);
                }
            },
            get: function () {
                return this.getPropertyValue('display');
            }
        });
        const tabNav = document.createElement("div");
        tabNav.style.display = "flex";
        tabNav.style.borderBottom = "1px solid #444";
        tabNav.style.background = "rgb(from var(--menu-color) r g b / 1)";
        const tabContent = document.createElement("div");
        tabContent.style.padding = "15px 16px";
        tabContent.style.maxHeight = "65vh";
        tabContent.style.overflowY = "auto";
        tabContent.style.scrollbarWidth = "thin";
        tabContent.style.fontSize = "smaller";
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
                tabButton.style.background = "var(--contrast-color)";
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
        info.innerHTML = 'Press Save to apply changes. Page will reload. - <a href="https://github.com/otacoo/8chanSS/blob/main/CHANGELOG.md" target="_blank" title="Check the changelog." style="color: var(--link-color); text-decoration: underline dashed;">Ver. 1.48.0</a>';
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
                title.style.color = "var(--subject-title)";
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
                    } else if (subSetting.type === "select") {
                        const subSelect = document.createElement("select");
                        subSelect.id = "setting_" + fullKey;
                        subSelect.style.marginLeft = "5px";
                        subSelect.style.width = "120px";
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
                        if (!subSelect.value && subSetting.default) {
                            subSelect.value = subSetting.default;
                            tempSettings[fullKey] = subSetting.default;
                        }
                        subSelect.addEventListener("change", function () {
                            tempSettings[fullKey] = subSelect.value;
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
                background: "#f7f7f7",
                color: "#000",
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
        if (event.shiftKey && !event.ctrlKey && !event.altKey && (event.key === "t" || event.key === "T")) {
            event.preventDefault();

            const current = await getSetting("quoteThreading");
            await setSetting("quoteThreading", !current);
            try {
                const msg = `Quote threading ${!current ? "enabled" : "disabled"}`;
                if (window.showToast) {
                    window.showToast(msg);
                } else {
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
            setTimeout(() => window.location.reload(), 1400);
            return;
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
            if (!pageType.isCatalog) return;
            onReady(addShowHiddenButton);
            onReady(applyHiddenThreads);
            const catalogContainer = document.querySelector(".catalogWrapper, .catalogDiv");
            if (catalogContainer) {
                catalogContainer.addEventListener("click", onCatalogCellClick, true);
                const observer = new MutationObserver(applyHiddenThreads);
                observer.observe(catalogContainer, { childList: true, subtree: false });
            }
        }
        hideThreadsOnRefresh();
    }
    function noCaptchaHistory() {
        const captchaInput = document.getElementById("QRfieldCaptcha");
        if (captchaInput) {
            captchaInput.autocomplete = "off";
        }
    }
    noCaptchaHistory();
    function preventFooterScrollIntoView() {
        const footer = document.getElementById('footer');
        if (footer && !footer._scrollBlocked) {
            footer._scrollBlocked = true; 
            footer.scrollIntoView = function () {
                return;
            };
        }
    }
    function moveFileUploadsBelowOp() {
        if (pageType.isCatalog) {
            return;
        } else if (opHeadTitle && innerOP) {
            innerOP.insertBefore(opHeadTitle, innerOP.firstChild);
        }
    }
    moveFileUploadsBelowOp();
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
        if (!pageType.isThread) return;

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
            if (clickedLabel && clickedLabel.closest(postCellSelector) && !clickedLabel.closest(".de-pview")) {
                event.preventDefault();
                event.stopPropagation();

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
});