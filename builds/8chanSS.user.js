// ==UserScript==
// @name         8chanSS
// @version      1.46.0
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
const faviconManager = (() => {
    const STYLES = [
        "default",
        "eight", "eight_dark",
        "pixel"
    ];
    const STATES = ["base", "unread", "notif"];
    const FAVICON_DATA = {
        default: {
            base: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAulBMVEUAAAB8rcF2lqSE1PWZ1Oyr1eaqzNqyx9DO7vuc3ffh8vmB0fKv3e/B4e693+56x+bb6e6gydl7wd3L3OOwytSAuNC35fjZ8fuQ2feB1Pbo9vyy5Pjm9Pmp4PW85fbW7feO1/S55Pbk8/mq3/SB0vOK1PLY7fbn9Pnf7/bQ6vWS1fDa7fWH0vCb0+rY6/OH0e+T0evc7POBzezA4/GNz+vJ4+6dz+O62eaSyuLH1958wNx0utbD6vqm4Piw9F0wAAAAPHRSTlMADwXliF4dD/7948uflIVpZSglJBcW+vn5+fj46ODd2tjX1dTS0MzIxb28rayinJyWko6KgHtYU1ExLRzJDM8dAAAAhklEQVQY05WOxRKEQAxEJxnBbRfW3d1d/v+3yBQHihv0IZWXSifNqsiAIt4XqxBzxqs5tDthBsnrocDz4/dkaWiubaz/VOoD515dLx9bJ9HvuhHDra1o8OU7ZJHbGPhe84DawS9UQY5/5poc1DqzTyL2oOQzzp4EbT6yBMuFgTO/FVMCYXmlpd8IdbxYuKsAAAAASUVORK5CYII=",
            unread: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAw1BMVEUAAACB1/mG2vyC1/iC2fuD2fyE2fyG3P2n3vWH1vaB1PWC2PuE2vyH3PuI2/mk4PaK1vSB0/Og2/OP1vJ/0fGB0/SF1vaC1faB1vmF2vyy5PiP2PbF6vnK6vjU7/mo3fKF0/K55PaL1PKR1vKW2PKK1PGI1fOA0/SP2PWA1PaA1/mB1/qC2PqD2fuC2fuE2fyD2fyE2viE2fyH2vyJ3v2x4va95vbA5/aT1e+S1/PX8PqC1PXO7vqb3fjl9fzc8vq25fjSsPNOAAAAOnRSTlMAmR2tYlc/EOvIxIAsFQv9/fzy8OrQv7afI/7+/f378/Pw7eni4c+8ubCRhXt2b1pKOzgaB/v69PPUtOA8IQAAAL9JREFUGNN1j0UWwjAARJPG00JdcHerYRXg/qciDxZlw+z+bGY+aNJug9+0KCEJazjDURBA0voA0zSNhLw/4CjOFRtY14+QV4PiwXcaAJ29XCyEGHFxHw5RChiWVm2aMx8dtpPnmgIDjnuua3adJUTXQhU0LMebaOm8us6omEAD0FXpbQ/In5371UVgBpKNbftyepNiPg/2HTWy80qrV7vwqOvYUC/yGHm2NQ2Jese+Eie4khHOGg2WkhNVEn/E38P7EOpFNC2nAAAAAElFTkSuQmCC",
            notif: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAABBVBMVEUAAACC1veB2PqB2fuB1faD2fyE2vyH3PqA4PyD1PSB1faB2PuE2vyG2vyI2/jQ7PaM1vSB0/OR1/On3vSG1/eB1vmC2PqE2vmG2vql4Pe54vKF0/KrLzam4PaN1PF+0PGO1fGD1faP2PWE2fyD2fyD2fyI3P6J3v3W8Pqj3vTD5PG11+WXtcW55PVvbnqqOj+XmKac2vKT1e+h3/ex3e2B0fGI0/J+obS4AACBjqGH0/F8vNh5hpuQNj+P2PaA0/VyX2+C1/SKEBOC2ftjKjCE4v8pAAAdAAAJAACD1fXkAADg9Pu05/qb3fiQ2fe1vsefoq+xhIildHu4PECpMjSkLDDPAQEi/+blAAAASXRSTlMArplixVY9FBDMt4MsHQr9/Pzs6cCfeTgj/vTz8/Lw6ObPuVpKQRkH/vv7+/v6+vn48/Py7+7t7ezk4M7OzcS+nZGRcFlTMhUIpnbxjgAAAMxJREFUGNN1z0WywlAURdH7lBcjnuAu390VhwTX+Q+FFBQFHU5vt04tOC4eh9PFOGO+OHaNuI6DWWwXQtM0JtvXVzaq1KNWiaK0cXa6mg9tRQNIePSrIEnZh/Be15EPglBjnLwsFH/CzMuwVAUVpyc5Kzl6/gwzqYsSBy4HaeRKj6NZuNRTWIWqHLw2PVS0btaL2z8igCPTlGjuiX7fvTteIjpR8kFgjC3c2PwSFQDqFZQ3jTe52/loiT2ijP+pS2qDXv/A8lmZR4gz8C3ykRYGbZB0XwAAAABJRU5ErkJggg==",
        },
        eight: {
            base: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAA5FBMVEUAAAA3Wm1OboA1WGs7XnE6XG82WGs1Vmk2WGw1V2o3Wm03Wm03W244XG9CbIBIaHo5ZHk2WGs4W242WW01WGvi6++U4/o8an81ZHq17f2r6fyD3/pFv+V3pLZfm7M5eJH6/f6g5fne8ffR6/M6x/Jbyuy94Ou02uZVw+U8vOXS3eJuxuKNyd23x8+Ou8xLqchYnbZxoLOUqLIzja1rk6RXjaNxkaBNh55piZhmg5JTcYFIaHk/YnXA8f9Uyu9OyO5dxOU8stg2sdjEztR8tssypct0tMquvMRBnb1/qLhlnrNDfZVMt0NDAAAAFHRSTlMA1/6/89WpfWpUOy0TCfv39++djVUg8M4AAADPSURBVBjTNc5VEsJAEATQlSgJvhshhrtbFHe4/30ItWH++tVUz4BsFIFDMZTy/5zjwwkdLovVTFS8bTUprV+KEgMZ9boBih71JWQgrs0XgeWIDuPfvixix1yQCkSUorQPFzbuuDZNCAmaEw4ovD+yLK1Rmy6cbisUgOB1+nP3msrO7G15BXCzg0dIctfGzhrhHAC6bRuwQlztjUVZTW8Y54FehmRubUT2Aly1n7r+OY4KMgOpdGvb/X3HxyqDfLW0Og1mHp/2ZSJBw+AEJYtfEOwVJ+cVEq0AAAAASUVORK5CYII=",
            unread: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAmVBMVEUAAAAoXH0nW3wnWnswZIYoXH0nW30oXH0iVHcgUXIsX3wnXX4nWn0pXoAoXH0qX4ApXH1et+qS0vB7yPB1xfBmu+uM0fGBy/GAxulktuVJjbVHgqUzbpRco8tUk7dOkLY8dJWa2fRwwe6LyORrtNpzsc9oqcxMmMVYlrhimrc/h7NLhqhAfaJarN1Rp9uEv9pOodNtqMU7cpSYIe5fAAAAD3RSTlMAz1Wd/vDp3jMXCI+DkIvxne6HAAAAuklEQVQY0zWOVxKDMBBDd216yq4Nprf0Aqn3P1ycAd6fNBpJMBNKlxgFLATe96QPN5KzjrBKU613L5ozwsnznuizu+FkrIbsyj6TPvA/LzbYZS2vfdKabB86VXeMz8zcpycXQm8s9kkSx+f2mqe9BFmboiwb62RZXnkhuBdT23STHNvBwQCAlCF/zWXS4VZEdoOfiuxiua9W0wW8qwtRXRTOcpLeSiljRoxgQtL9oZraC2BBIJMrw1n9AJTkDhyKCtG8AAAAAElFTkSuQmCC",
            notif: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAABgFBMVEUAAAA4Wm0AAAA2WGs7XnE2WGs4XG84W283Wm0pRFJIaHo5ZHl3AAA3WWwAAAAAAAAdAAA2WW01Vmk4WWw1WGwAAAA1V2onKDBNb4FCbIDJAACpAAAfBQczVmk4WWshDxIiAAAMGR9pAAAFEBMrSVhVAAA0VmkpOEQxUWI4W24AAAAxUGAAAAAhAgJ+AADl7fBfm7NScIE+an82WGv/AAD6/f607f2U5P2s6fyB3fk6x/JRye9byuxbxOVuxuPS3eI5sth8qLZzorSUqLIzja1Nh547d49Pbn80Zn1IaHk3Y3gNGh/lAADiAACj6P6Y5v6I4fyg5fne8feU3/bR6/Pg6+/j6ey83+tEwOc8vue12uZRwuVGv+VGveI9uuKNyd3EztS3x8+PvM18tssypct0tMpMqchKqMiuvMRBnb1anbZWnLZnmqlrk6RXjaOUn6FwkKBWi6BWiJlvjphniJdDfZU2epRmg5I3aYBreX8/YnU4VmZ4PD5zBAW7AACDAAC1tWqYAAAALXRSTlMA1wT+86kJOi0S9/f0v7ifko19ampaVP77+/v28/Hv5uLg39vKxr+rop2CLhaXktx/AAAA80lEQVQY0zXOY5MDYRAE4Jl3kY2ds411bPts27Yvfz3ZSjLf5qmurobWcQxdKKGLbf86/DhaT2QM9pbozY+ry6LoOzS4muDp3N54LciXvgw2wXHnT6nYJ68lSlre4xhP+9PU5FDlQZQbfeaue+kgePzT8Sf8ftHAYS4eWgwsBV/4qleoMMDko7Eb6WRlPsXPeYWRGaAvIu8U9X22cKuBhYCyt1vEKUoKPPd2V01WAuXk1mc/qtehp4lB3jYLgNnwlaK8xeLqQM//8DQBp/E0vLkTieZGbabamJsAazdmk/vnedTprRa3Npt1YrlIMxwAIQSgDr+eKshCsMCtAAAAAElFTkSuQmCC",
        },
        eight_dark: {
            base: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAA6lBMVEUAAAAAAAAcHh4DBAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAQESHSEVFRUGERQAAAAAAAAAAABXc3wLGR4DEhe37/+V5v5WxeY8ttxDbXqt7P/6/P2C3/ug5frb7fM6xvHO5ezf5efe3+DY3uC31d5UudiszNY6sNRluNHHy8yBtsYuoMOkqap8nadll6Y9cYJ2eHlJW2E1VV9MVVgoS1ZCR0kUO0Y8Pz8RMj0jIiIUFBQKCwzB8/+J5P+o5PaT3vVLxepLuNmzs7Mhiqo6i6Q4iqSXl5cqeJBlfYRee4RJcHwYXXMTXHK7ZShPAAAAEnRSTlMA1/7yv6l9alQ7LRMJ+/f3nY0o+Yk1AAAA0UlEQVQY0zXO1RKDMBAF0GwSpFANTt3dHai7/f/vlE7ovt0zO3cXRaMIBPsgxf85Bqt+tTNOZiJR6axcrFZyp6TEQcbN+gJ7t9wYOIgT88GAeJWO/9uXRaqZGksDrtVw2EcTU7ebHQSMLYp9ghSYt/Nbq7AbaM96eSUgYW03Ru5wX8huzOYMFESuhyVjwdDqahNMYwjpLceANHOtFxVlNbxh9BydABvlpyJ/Ad6lu64vG+2EzEFKnUvO0bbnVOUQz6Q+vdZlDWFfJBIYBhGUKH4BCtAU9AMVJ6MAAAAASUVORK5CYII=",
            unread: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAABLFBMVEUAAAAAAAADBAQAAAAAAAAAAAAAAAAAAAABAQECAgIAAAAAAAAAAACnqaoVFRUGERR3d3cAAAAAAAAdHR0AAAAAAAAAAADJyckcICESHSEZGBgXFhYjIyNpaWkAAABVVVUgICAAAAB/f39EbnoNGh3////k5eZVxebh4uIDERULDAy27/+V5v76/f2i5/yC3/s6xvHb4eM/tttUudg6sNRmudHHy8wuoMNll6Y5i6SVmZplfIM9cYJXc3x2eHk1VV9KWFwoS1YRMj0FGB4UFBSt7P+Z5/+J5P+q5viT3vXb7fPN5OxLxerc3d621N43ttxLuNmszNaBtsa7u7uzs7N6prMhiqp8nadkkqEqeJCDg4N5fn8YXXMTXHJxcXFbXl9AR0kbPUcOOUY8Pz+Gf/rZAAAAIHRSTlMA1/Kqn2otEwnVv386+/f39N64ko1aVPv7+/Pm4t/KxnB/XeAAAADqSURBVBjTNc/nkoJAEATg2V2CgFnPy3e7gCCYc85ezjmY9f3fQSxx/vVXU13V4J5AMB0h3rPPXmnte6p0/FFXRLn3cJ8w0p9+fgexo7fnBaWNdAftQOklmwxhmq+Mtv8xRW4n24wLsUaeOn3ycVd7v/qx7Zk6nmMQpH45e5PK3DapEVcZATIwiy2tdpf5oom4GhIA1x9XjNm1698thAH0UsFCHNNS2smhEeQArOrLECPWynbJGY2IAGiS+9P1ZbGsn/o+zhUAPvCdK7yaZv8iEvy/PADwRAPTaqk+kLwiF3ayIzyyhpgI7u4NAyAfb7mvG6QAAAAASUVORK5CYII=",
            notif: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAABDlBMVEUAAAAAAAAEBQQbHR4AAAAAAAAAAAAAAAAAAAAAAAABAQEAAAAAAAAAAAAVFRUGERR3AAAdAAAAAAAdAAAAAAAOAADJAACpAAAZAABpAAAAAABVAAAAAAAKGR6AAABEbnshAgLjAACW5//d3+EQNEADERX/AAC27//6/f2s6fyi5/yC3/s6xvFOxure5eZXxOQ7t91Uudg/s9ZmudHHy8wuoMNilaU5i6SVmptlfYQ9cYJXc3x2eHkVXHI1VV9KWFwoS1Y+Q0QiIiIUFBQKDAyJ5P+T3vXb7fPN5Oy21N5LuNmszNY2r9OBtsZ6qLWzs7Okqaohiqp8nadpmKYqeJBbYGEbPUd5PkC7AABxAADDG85nAAAAHHRSTlMA2PP+qp9qVy0TCb9/Ovf39OS4ko3++/bz38rGKc/yuwAAAOFJREFUGNM1z+WSwkAQBOCZ3Y2R4JzvJhA53N313BV4/xchKcL866+muqohPJURukY5cspRXH46nUksE4qmzx8fnFrhIyYfQaEvT0u6GhQmeARjnh9yJKtaZx38K4Y+zo+5hHzgUL9PpzPrrfi9Odub2z8CKi7a5Tu7VBxmc7cmZ8DcenNk/dyX3gNAFUi/6nK+6dm9AFIAotXyUOKWbV2e5xISgNdtCIJ8VJ6xZDatAeC08ivEf7Mtkhe7KwNAjn9VGs/V+uI6nTBvFIBIJj7tvvZdjGpSys++yOgJwtRw9wFQqBu3wZY/EgAAAABJRU5ErkJggg==",
        },
        pixel: {
            base: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAhFBMVEUAAAAQDAaMRAAMAAAfMjsRGyAeICARGyAQDgkNCQQIAAAyNjceLzYaHB0PGBw3Ojw3OjwrMTMdLDMDBAQdICAuMzYeISEAAAAMCAKksbZdmbMkMjghLjMgND10v+G5x81prMrO3uTJ3OOr0eOdv8+bu8s7SVCx0+N6weBmqMUeICERHCHxncC+AAAAHnRSTlMAMgQcz+bMzDk1IPv75+fPzv395+bl5Woz/f3l5c9e4GTZAAAAhklEQVQY041P2Q6DMAxry9lxwxjsSpoW2PX//ze2MAlpmjS/ObZsR/yG8jaeWh9kuAvlSuoLJCykeklREGldIlnCMp65b8Ac2z0mWUK4FfHM4eqGqWq6zNJdBAbSPB2dGyt2PADyrqmn4WLfGeyob4dTyy2cAeasNe9YWvz+s3TZIb+f+B9PPUYLBX8tpxIAAAAASUVORK5CYII=",
            unread: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAdVBMVEUAAAAPaoQMYXQ3iKQfgKMdfqEwhaIdeZceeZcRdJYQbIcNaYQIYHYad5UPc5UmgaADaIoRdJYuhKEigKERdZcAX3+kzt1dttp0yu+53OjO6fNowOSc0ejM6PKv3fJpwOU7j63J5/Km2vJ6zO+12eUeeZgRdZdMQvBCAAAAGHRSTlMAMhzPz/z75szMOTUg5+f95+bl5eVq/f1FNvSFAAAAgUlEQVQY05VP2Q6DMAxroOXqOAZjSw8Ku/j/T6QiIIGQkPCbY8t22AmCW7DjkMQJbCQIlVYhzFL6SKX0vPOXzHNusG/q5y/KI61ilnmO348dyqrNO/1nd4OiKK1zdnGMiEVbicG695xBDmFeTU0tlIE9l5J2UIvhsMxZd8DhiQuYAP0yCNbT1QIaAAAAAElFTkSuQmCC",
            notif: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAhFBMVEUAAAADBAUAAAAQGR4TGx4fMjsEAAAjLjMcLjY4PD65yM0dHyAjMTYaAAAJCgoFCAqksbZdmbMDAwQsMTQAAAB0wOFprMo4GxzL3eMdAwOr0eOYusrDAACewNCgrrM7SVAdGRqrAAB6weCwwMVmqMWerbIeICERHCEvGBolBgeUAAAsAADCmQM2AAAAFXRSTlMAMBvmzc/L/vvO/ebl5Tc3/f3n5Wh99QQQAAAAhElEQVQY05VP2Q7CMAxrmnbdYNykW1t2cR///39EeUBDSEjzmx3LdtQfaK2/OGSLDEYnMGEIRhQwaACKtjpUl2LJ3Hry5W59YqGezdWKOR1j07kHC/VVoaccXYox3Qdx3Ihwv3Vdk/pX33KGOPLzpsTwlBbJIG/hs0NaLIyWyo6fJybgDdPwCHDyGfzdAAAAAElFTkSuQmCC",
        }
    };
    let currentStyle = "default";
    let currentState = "base";
    function removeFavicons() {
        document.querySelectorAll('link[rel="icon"], link[rel="shortcut icon"]').forEach(link => link.remove());
    }
    function insertFavicon(href) {
        const link = document.createElement('link');
        link.rel = 'icon';
        link.type = 'image/png';
        link.href = href;
        document.head.appendChild(link);
    }
    async function getUserFaviconStyle() {
        let style = "default";
        try {
            style = await getSetting("customFavicon_faviconStyle");
        } catch { }
        if (!STYLES.includes(style)) style = "default";
        return style;
    }
    async function setFaviconStyle(style, state = "base") {
        if (!STYLES.includes(style)) style = "default";
        if (!STATES.includes(state)) state = "base";
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
            _threadsMediaTitle: { type: "title", label: ":: Media" },
            _threadsSection2: { type: "separator" },
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
            scrollToBottom: { label: "Don't Scroll to Bottom on Reply", default: true },
            deleteSavedName: { label: "Delete Name Checkbox", default: false }
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
            hideCheckboxes: { label: "Hide Checkboxes", default: false }
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
    featureSidebar();
    const currentPath = window.location.pathname.toLowerCase();
    const currentHost = window.location.hostname.toLowerCase();

    let css = "";

    if (/^8chan\.(se|moe)$/.test(currentHost)) {
        css += ":not(.is-catalog) body{margin:0}#sideCatalogDiv{z-index:200;background:var(--background-gradient)}#navFadeEnd,#navFadeMid,.watchedNotification::before,:root.disable-banner #bannerImage,:root.hide-announcement #dynamicAnnouncement,:root.hide-checkboxes .deletionCheckBox,:root.hide-close-btn .inlineQuote>.innerPost>.postInfo.title>a:first-child,:root.hide-jannytools #actionsForm,:root.hide-jannytools #boardContentLinks,:root.hide-nocookie #captchaBody>table:nth-child(2)>tbody:first-child>tr:nth-child(2),:root.hide-panelmessage #panelMessage,:root.hide-posting-form #postingForm{display:none}:root.hide-defaultBL #navTopBoardsSpan{display:none!important}:root.is-catalog.show-catalog-form #postingForm{display:block!important}footer{visibility:hidden;height:0}nav.navHeader{z-index:300}nav.navHeader>.nav-boards:hover{overflow-x:auto;overflow-y:hidden;scrollbar-width:thin}:not(:root.bottom-header) .navHeader{box-shadow:0 1px 2px rgba(0,0,0,.15)}:root.bottom-header nav.navHeader{top:auto!important;bottom:0!important;box-shadow:0 -1px 2px rgba(0,0,0,.15)}:root.highlight-you .innerOP:has(> .opHead.title > .youName),:root.highlight-you .innerPost:has(> .postInfo.title > .youName){border-left:dashed #68b723 3px}:root.highlight-you .innerPost:has(>.divMessage>.you),:root.highlight-you .innerPost:has(>.divMessage>:not(div)>.you),:root.highlight-you .innerPost:has(>.divMessage>:not(div)>:not(div)>.you){border-left:solid var(--subject-color) 3px}:root.fit-replies :not(.hidden).innerPost{margin-left:10px;display:flow-root}:root.fit-replies :not(.hidden,.inlineQuote).innerPost{margin-left:0}.originalNameLink{display:inline;overflow-wrap:anywhere;white-space:normal}.multipleUploads .uploadCell:not(.expandedCell){max-width:215px}.imgExpanded,video{max-height:90vh!important;object-fit:contain;width:auto!important}:not(:root.auto-expand-tw) #watchedMenu .floatingContainer{overflow-x:hidden;overflow-wrap:break-word}:root.auto-expand-tw #watchedMenu .floatingContainer{height:fit-content!important;padding-bottom:10px}.watchedCellLabel a::before{content:attr(data-board);color:#aaa;margin-right:4px;font-weight:700}.watchButton.watched-active::before{color:#dd003e!important}#media-viewer,#multiboardMenu,#settingsMenu,#watchedMenu{font-size:smaller;padding:5px!important;box-shadow:-3px 3px 2px 0 rgba(0,0,0,.19)}#watchedMenu,#watchedMenu .floatingContainer{min-width:200px;max-width:100vw}.watchedNotification::before{padding-right:2px}#watchedMenu .floatingContainer{scrollbar-width:thin;scrollbar-color:var(--link-color) var(--contrast-color)}.scroll-arrow-btn{position:fixed;right:50px;width:36px;height:35px;background:#222;color:#fff;border:none;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,.18);font-size:22px;cursor:pointer;opacity:.7;z-index:800;display:flex;align-items:center;justify-content:center;transition:opacity .2s,background .2s}:root:not(.is-index,.is-catalog).ss-sidebar .scroll-arrow-btn{right:330px!important}.scroll-arrow-btn:hover{opacity:1;background:#444}#scroll-arrow-up{bottom:80px}#scroll-arrow-down{bottom:32px}.innerUtility.top{margin-top:2em;background-color:transparent!important;color:var(--link-color)!important}.innerUtility.top a{color:var(--link-color)!important}.bumpLockIndicator::after{padding-right:3px}.floatingMenu.focused{z-index:305!important}#quick-reply{padding:0}#media-viewer{padding:20px 0 0!important}#media-viewer.topright{top:26px!important;right:0!important;left:auto!important}#media-viewer.topleft{top:26px!important;left:0!important;right:auto!important}#media-viewer.topright::after{pointer-events:none}#media-viewer.topleft::after{pointer-events:none}.ss-chevron{transition:transform .2s;margin-left:6px;font-size:12px;display:inline-block}a.imgLink[data-filemime^='audio/'],a.originalNameLink[href$='.m4a'],a.originalNameLink[href$='.mp3'],a.originalNameLink[href$='.ogg'],a.originalNameLink[href$='.wav']{position:relative}.audio-preview-indicator{display:none;position:absolute;background:rgba(0,0,0,.7);color:#fff;padding:5px;font-size:12px;border-radius:3px;z-index:1000;left:0;top:0;white-space:nowrap;pointer-events:none}a.originalNameLink:hover .audio-preview-indicator,a[data-filemime^='audio/']:hover .audio-preview-indicator{display:block}.yt-icon{width:16px;height:13px;vertical-align:middle;margin-right:2px}.id-glow{box-shadow:0 0 12px var(--subject-color)}.id-dotted{border:2px dotted #fff}";
    }
    if (/\/res\/[^/]+\.html$/.test(currentPath)) {
        css += ":root.sticky-qr #quick-reply{display:block;top:auto!important;bottom:0}:root.sticky-qr.ss-sidebar #quick-reply{left:auto!important;right:0!important}:root.sticky-qr.ss-leftsidebar #quick-reply{left:0!important;right:auto!important}:root.sticky-qr #qrbody{resize:vertical;max-height:50vh;height:130px}#selectedDivQr,:root.sticky-qr #selectedDiv{display:inline-flex;overflow:scroll hidden;max-width:300px}#qrbody{min-width:300px}:root.bottom-header #quick-reply{bottom:28px!important}:root.fade-qr #quick-reply{padding:0;opacity:.7;transition:opacity .3s ease}:root.fade-qr #quick-reply:focus-within,:root.fade-qr #quick-reply:hover{opacity:1}#qrFilesBody{max-width:310px}#quick-reply{box-shadow:-3px 3px 2px 0 rgba(0,0,0,.19)}#unread-line{height:2px;border:none!important;pointer-events:none!important;background-image:linear-gradient(to left,rgba(185,185,185,.2),var(--text-color),rgba(185,185,185,.2));margin:-3px auto 0 auto;width:60%}:root.ss-sidebar #bannerImage{width:19rem;right:0;position:fixed;top:26px}:root.ss-sidebar.bottom-header #bannerImage{top:0!important}:root.ss-leftsidebar #bannerImage{width:19rem;left:0;position:fixed;top:26px}:root.ss-leftsidebar.bottom-header #bannerImage{top:0!important}.quoteTooltip{z-index:999}.nestedQuoteLink{text-decoration:underline dashed!important}:root.hide-stub .unhideButton{display:none}.quoteTooltip .innerPost{overflow:hidden}.inlineQuote .innerPost,.quoteTooltip .innerPost{box-shadow:-1px 1px 2px 0 rgba(0,0,0,.19)}.inlineQuote{margin-top:4px}.postInfo.title>.inlineQuote{margin-left:15px}.postCell.is-hidden-by-filter{display:none}.deleted-span{color:red;font-weight:700}.reply-inlined{opacity:.5;text-decoration:underline dashed!important;text-underline-offset:2px}.quote-inlined{opacity:.5;text-decoration:underline dashed!important;text-underline-offset:2px}.target-highlight{background:var(--marked-color);border-color:var(--marked-border-color);color:var(--marked-text-color)}.statLabel{color:var(--link-color)}.statNumb{color:var(--text-color)}.postCell::before{display:inline!important;height:auto!important}.threadedReplies{border-left:1px solid #ccc;padding-left:15px}";
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
    const featureMap = [
        { key: "enableScrollSave", fn: featureSaveScroll },
        { key: "watchThreadOnReply", fn: featureWatchThreadOnReply },
        { key: "blurSpoilers", fn: featureBlurSpoilers },
        { key: "enableHeaderCatalogLinks", fn: featureHeaderCatalogLinks },
        { key: "openCatalogThreadNewTab", fn: catalogThreadsInNewTab },
        { key: "deleteSavedName", fn: featureDeleteNameCheckbox },
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
    const isCatalogPage = /\/catalog\.html$/.test(window.location.pathname.toLowerCase());
    let imageHoverEnabled = false;
    try {
        if (isCatalogPage) {
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
        function getDivPosts() {
            return document.querySelector(".divPosts");
        }
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
            const divPosts = getDivPosts();
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
        async function updateTabTitle() {
            if (window.isNotifying) return;
            if (!tabTitleBase) tabTitleBase = document.title.replace(/^\(\d+\)\s*/, "");
            document.title = unseenCount > 0 ? `(${unseenCount}) ${tabTitleBase}` : tabTitleBase;
            const { style, state } = faviconManager.getCurrentFaviconState();

            if (unseenCount > 0 && (await getSetting("customFavicon"))) {
                if (state !== "unread") {
                    previousFaviconState = { style, state };
                }
                faviconManager.setFaviconStyle(style, "unread");
            } else if (unseenCount == 0 && (await getSetting("customFavicon"))) {
                if (state === "unread" && previousFaviconState) {
                    faviconManager.setFaviconStyle(previousFaviconState.style, previousFaviconState.state);
                    previousFaviconState = null;
                } else if (state === "unread") {
                    faviconManager.setFavicon("base");
                }
            } else {
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

            setTimeout(() => addUnreadLineAtSavedScrollPosition(saved.position, true), 100);
        }
        async function addUnreadLineAtSavedScrollPosition(scrollPosition, centerAfter = false) {
            if (!(await getSetting("enableScrollSave_showUnreadLine"))) return;
            const divPosts = getDivPosts();
            if (!divPosts) return;
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
            const divPosts = getDivPosts();
            if (!divPosts) return;
            const observer = new MutationObserver(() => {
                updateUnseenCountFromSaved();
            });
            observer.observe(divPosts, { childList: true, subtree: false });
        }
        async function removeUnreadLineIfAtBottom() {
            if (!(await getSetting("enableScrollSave_showUnreadLine"))) return;
            const margin = 10; 
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
        function debounce(fn, delay) {
            let timeout;
            return function (...args) {
                clearTimeout(timeout);
                timeout = setTimeout(() => fn.apply(this, args), delay);
            };
        }

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
        const catalogDiv = document.querySelector('.catalogDiv');
        if (!catalogDiv) return;
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
            if (!thumbNode || !filemime) return null;
            const thumbnailSrc = thumbNode.getAttribute("src");
            const parentA = thumbNode.closest("a.linkThumb, a.imgLink");
            const fileWidth = parentA ? parseInt(parentA.getAttribute("data-filewidth"), 10) : null;
            const fileHeight = parentA ? parseInt(parentA.getAttribute("data-fileheight"), 10) : null;
            const isSmallImage = (fileWidth && fileWidth < 220) || (fileHeight && fileHeight < 220);
            if (
                isSmallImage &&
                filemime.toLowerCase() === "image/png" &&
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
                if (filemime.toLowerCase() === "image/apng" || filemime.toLowerCase() === "video/x-m4v") {
                    return base;
                }

                const ext = getExtensionForMimeType(filemime);
                if (!ext) return null;
                return base + ext;
            }
            if (
                thumbnailSrc.match(/^\/\.media\/[a-f0-9]{40,}$/i) && 
                !/\.[a-z0-9]+$/i.test(thumbnailSrc)
            ) {
                if (filemime.toLowerCase() === "image/apng" || filemime.toLowerCase() === "video/x-m4v") {
                    return thumbnailSrc;
                }

                const ext = getExtensionForMimeType(filemime);
                if (!ext) return null;
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
        const divThreads = document.getElementById("divThreads");
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
        function revealSpoilers() {
            const spoilerLinks = document.querySelectorAll("a.imgLink");
            spoilerLinks.forEach(async (link) => {
                const img = link.querySelector("img");
                if (!img) return;
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
                    if (!href) return;
                    const match = href.match(/\/\.media\/([^\/]+)\.[a-zA-Z0-9]+$/);
                    if (!match) return;
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
                    img.src = transformedSrc;
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
    };
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
        function debounce(fn, delay) {
            let timeout;
            return function (...args) {
                clearTimeout(timeout);
                timeout = setTimeout(() => fn.apply(this, args), delay);
            };
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
        if (!document.documentElement.classList.contains("is-thread")) return;
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
        function debounce(fn, delay) {
            let timer;
            return function (...args) {
                clearTimeout(timer);
                timer = setTimeout(() => fn.apply(this, args), delay);
            };
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
        const postsContainer = document.querySelector('.divPosts') || document.body;
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
        observer.observe(postsContainer, { childList: true, subtree: true });
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
    async function featureHideAnnouncement() {
        function getContentHash(str) {
            let hash = 5381;
            for (let i = 0; i < str.length; i++) {
                hash = ((hash << 5) + hash) + str.charCodeAt(i);
            }
            return hash >>> 0;
        }
        async function processElement(selector, settingKey, hashKey) {
            const el = document.querySelector(selector);
            if (!el) return;

            const content = el.textContent || "";
            const sanitizedContent = content.replace(/[^\w\s.,!?-]/g, ""); 
            const hash = getContentHash(sanitizedContent);
            const shouldHide = await GM.getValue(`8chanSS_${settingKey}`, "false") === "true";
            const storedHash = await GM.getValue(`8chanSS_${hashKey}`, null);
            const root = document.documentElement;

            if (shouldHide) {
                if (storedHash !== null && String(storedHash) !== String(hash)) {
                    if (typeof window.setSetting === "function") {
                        await window.setSetting("hideAnnouncement", false);
                    }
                    await GM.setValue(`8chanSS_${settingKey}`, "false");
                    await GM.deleteValue(`8chanSS_${hashKey}`);
                    return;
                }
                root.classList.add("hide-announcement");
                await GM.setValue(`8chanSS_${hashKey}`, hash);
            } else {
                root.classList.remove("hide-announcement");
                await GM.deleteValue(`8chanSS_${hashKey}`);
            }
        }

        await processElement("#dynamicAnnouncement", "hideAnnouncement", "announcementHash");
    }
    async function featureBeepOnYou() {
        let audioContext = null;
        function createBeepSound() {
            if (!audioContext) {
                audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }
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
        const playBeep = createBeepSound();
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
                        if (beepOnYouSetting) {
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
        const ytTitleCache = {};
        function loadCache() {
            try {
                const data = localStorage.getItem('ytTitleCache');
                if (data) Object.assign(ytTitleCache, JSON.parse(data));
            } catch (e) { }
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
        function fetchYouTubeTitle(videoId) {
            if (ytTitleCache[videoId]) {
                return Promise.resolve(ytTitleCache[videoId]);
            }
            return fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`)
                .then(r => r.ok ? r.json() : null)
                .then(data => {
                    const title = data ? data.title : null;
                    if (title) {
                        ytTitleCache[videoId] = title;
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
    function threadInfoHeader(retries = 10, delay = 200) {
        const navHeader = document.querySelector('.navHeader');
        const navOptionsSpan = document.getElementById('navOptionsSpan');
        const postCountEl = document.getElementById('postCount');
        const userCountEl = document.getElementById('userCountLabel');
        const fileCountEl = document.getElementById('fileCount');
        if (!navHeader || !navOptionsSpan || !postCountEl || !userCountEl || !fileCountEl) {
            if (retries > 0) {
                setTimeout(() => threadInfoHeader(retries - 1, delay), delay);
            }
            return;
        }
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
            statIds.forEach(id => {
                const el = document.getElementById(id);
                if (el) {
                    new MutationObserver(() => threadInfoHeader(0, delay)).observe(el, { childList: true, subtree: true, characterData: true });
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
            observer.observe(document.body, { childList: true, subtree: true });
        }
    }
    async function featureHighlightNewIds() {
        const threads = document.querySelector('.divPosts');
        const hlStyle = await getSetting("highlightNewIds_idHlStyle");
        if (!threads) return;
        if (!document.querySelector('.spanId')) return;
        const styleClassMap = {
            moetext: "moeText",
            glow: "id-glow",
            dotted: "id-dotted"
        };
        const styleClass = styleClassMap[hlStyle] || "moeText"; 
        const idFrequency = {};
        const labelSpans = threads.querySelectorAll('.labelId');
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
    function featureQuoteThreading() {
        const allPosts = document.querySelectorAll('.divPosts .postCell');

        allPosts.forEach(post => {
            const backlinks = post.querySelectorAll('.panelBacklinks .backLink.postLink');

            backlinks.forEach(backlink => {
                const targetUri = backlink.getAttribute('data-target-uri');
                const targetPostId = targetUri.split('#')[1];
                const targetPost = document.getElementById(targetPostId);

                if (targetPost) {
                    let repliesContainer = post.nextElementSibling;
                    if (!repliesContainer || !repliesContainer.classList.contains('threadedReplies')) {
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
        info.innerHTML = 'Press Save to apply changes. Page will reload. - <a href="https://github.com/otacoo/8chanSS/blob/main/CHANGELOG.md" target="_blank" title="Check the changelog." style="color: var(--link-color); text-decoration: underline dashed;">Ver. 1.46.0</a>';
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
        const opHeadTitle = document.querySelector('.opHead.title');
        const innerOP = document.querySelector('.innerOP');
        if (opHeadTitle && innerOP) {
            innerOP.insertBefore(opHeadTitle, innerOP.firstChild);
        }
    }
    moveFileUploadsBelowOp();
    function styleDeletedSpans() {
        const divThreads = document.getElementById('divThreads');
        if (divThreads) {
            const observer = new MutationObserver(mutations => {
                for (const mutation of mutations) {
                    for (const node of mutation.addedNodes) {
                        if (node.nodeType === 1) {
                            const containers = divThreads.querySelectorAll('.postInfo.title');
                            containers.forEach(container => {
                                container.querySelectorAll('span:not([class]):not([id])').forEach(span => {
                                    if (span.textContent.trim() === '(Deleted)') {
                                        span.classList.add('deleted-span');
                                    }
                                });
                            });
                        }
                    }
                }
            });
            observer.observe(divThreads, { childList: true, subtree: true });
        }
    }
    styleDeletedSpans();
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