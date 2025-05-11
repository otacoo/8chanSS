// ==UserScript==
// @name         <%= meta.name %>
// @version      <%= version %>
// @namespace    <%= name %>
// @description  <%= description %>
// @author       <%= author %>
// @minGMVer     <%= meta.min.greasemonkey %>
// @minFFVer     <%= meta.min.firefox %>
// @license      <%= license %>; <%= meta.repo %>blob/<%= meta.mainBranch %>/LICENSE 
<%=
  (function() {
    function expand(items, regex, substitutions) {
      return items.flatMap(item => 
        regex.test(item) 
          ? substitutions.map(s => item.replace(regex, s)) 
          : item
      );
    }

    function expandMatches(matches) {
      return expand(matches, /^\*/, ['*']);
    }

    return [
      ...expandMatches(meta.matches).map(match => `// @match        ${match}`),
      ...expandMatches(meta.exclude_matches).map(match => `// @exclude      ${match}`)
    ].join('\n');
  })()
%>
// @grant        GM.getValue
// @grant        GM.setValue
// @grant        GM.deleteValue
// @grant        GM.listValues
// @grant        GM.addStyle
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_deleteValue
// @grant        GM_listValues
// @grant        GM_addStyle
// @run-at       document-start
// @updateURL    <%= meta.downloads %><%= meta.files.metajs %>
// @downloadURL  <%= meta.downloads %><%= meta.files.userjs %>
// @icon         data:image/png;base64,<%= grunt.file.read('src/img/icon48.png', {encoding: 'base64'}) %>
// ==/UserScript==