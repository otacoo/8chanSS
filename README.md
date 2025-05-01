# 8chanSS :beginner:

A :warning: WORK IN PROGRESS :warning: userscript to add functionality to 8chan, heavily influenced by 4chanSS, 4chanX and StyleChan.


## [![install](https://github.com/user-attachments/assets/9a9d62fd-0b3e-460b-bb6c-092dd38b2b8d)](https://github.com/otacoo/8chanSS/raw/refs/heads/main/builds/8chanSS.user.js)


### Install instructions

First install a userscript manager:
- **Firefox**: Requires the [Violentmonkey](https://addons.mozilla.org/en-US/firefox/addon/violentmonkey/) addon.
- **Chrome**: Requires the [Violentmonkey](https://chromewebstore.google.com/detail/violentmonkey/jinjaccalgkegednnccohejagnlnfdag/) extension.

Then press the big install button to install the script.


### Configure
- Check in the 8chan header for the 8chanSS menu button
- Alternatively, press `CTRL` + `F1` to open the menu


### What it does:
- Catalog links for the header
- Image hover for catalog and thread images, videos and audio (new)
- Image Hover for spoilers
- Autoscroll page to last read post + unread line
- Sidebar
- Quick Reply to sidebar
- Blur or remove spoilers
- Beep on getting a (You)
- Custom text for (You) notification in the tab
- Improved styling of the site
- Adds a checkbox to the Quick Reply to save (or not save) the name field on refresh
- Hide Posting Form and Announcements
- Show full filename of media posts
- Style (You) posts (green for your posts & red for replies to you)
- Image Hover that follows the cursor
- Bottom Header
- Up/Down Arrows
- Pin Thread Watcher
- Hide/unhide threads in the catalog
- Mark/unmark posts as yours
- Show all posts by ID

More incoming...

### Keyboard Shortcuts:

`CTRL` + `F1` : Open 8chanSS settings menu

`CTRL` + `Enter` : Submit post

`Tab` : Target Quick Reply text area

`R` : Refresh Thread (5 sec. cooldown)

`Esc` : Clear and close the Quick Reply

`CTRL` + `Q` : Toggle Quick Reply on/off

`ALT` + `W` : Watch thread

`CTRL` + `S` : Add spoiler tags

`ALT` + `C` : Add code tags

`CTRL` + `B` : Add **bold** tags

`CTRL` + `U` : Add underline tags

`CTRL` + `I` : Add *italics* tags

`CTRL` + `D` : Add Srz Bizniz tags

`CTRL` + `M` : Add moe tags

### How to add boards to your header:

![fav](https://github.com/user-attachments/assets/8b97ca2b-8e9e-46e3-bc8b-37e4c7c42712)

### How to block custom themes:

**Note:** Userscripts CANNOT block network requests directly. I have tried to block the custom theme from loading on page load to avoid flashing of unstyled content (FOUC), it minimizes the issue but doesn't fix it.
If you use uBlock Origin you can more directly prevent the custom CSS from loading altogether with the following:

Add this to uBlock's *My Filters* page and press Save Changes, then restart your browser.

```
! Block Custom Theme CSS on https://8chan.moe|se
||8chan.*/*/custom.css$css
```

## Contributing
Read [Contributing](https://github.com/otacoo/8chanSS/blob/main/CONTRIBUTING.md#development--contribution) first to set up, fork the repo, then do a pull request to here.

#### Feature Request
Open a [new issue](https://github.com/otacoo/8chanSS/issues) and request a feature.

#### Reporting Bugs

Read [Reporting Bugs](https://github.com/otacoo/8chanSS/blob/main/CONTRIBUTING.md#reporting-bugs-and-suggestions) first if you have an issue and want to report a bug.

