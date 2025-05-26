# 8chanSS :beginner:

A userscript to add functionality to 8chan, heavily influenced by 4chanSS, 4chanX and StyleChan.


## [![install](https://github.com/user-attachments/assets/9a9d62fd-0b3e-460b-bb6c-092dd38b2b8d)](https://github.com/otacoo/8chanSS/raw/refs/heads/main/builds/8chanSS.user.js)


### Install

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

<kbd>CTRL</kbd> + <kbd>F1</kbd> : Open 8chanSS settings menu

<kbd>CTRL</kbd> + <kbd>Enter</kbd> : Submit post

<kbd>Tab</kbd> : Target Quick Reply text area

<kbd>R</kbd> : Refresh Thread (5 sec. cooldown)

<kbd>Esc</kbd> : Clear and close the Quick Reply

<kbd>CTRL</kbd> + <kbd>Q</kbd> : Toggle Quick Reply on/off

<kbd>SHIFT</kbd> + <kbd>T</kbd> : Toggle Quote Threading

<kbd>ALT</kbd> + <kbd>W</kbd> : Watch thread

<kbd>CTRL</kbd> + <kbd>UP/DOWN Arrow</kbd> : Scroll between Your replies

<kbd>CTRL</kbd> + <kbd>SHIFT</kbd> + <kbd>UP/DOWN Arrow</kbd> : Scroll between replies to (You)

<kbd>CTRL</kbd> + <kbd>S</kbd> : Add spoiler tags

<kbd>ALT</kbd> + <kbd>C</kbd> : Add code tags

<kbd>CTRL</kbd> + <kbd>B</kbd> : Add **bold** tags

<kbd>CTRL</kbd> + <kbd>U</kbd> : Add underline tags

<kbd>CTRL</kbd> + <kbd>I</kbd> : Add *italics* tags

<kbd>CTRL</kbd> + <kbd>D</kbd> : Add Srz Bizniz tags

<kbd>CTRL</kbd> + <kbd>M</kbd> : Add moe tags

### How to add boards to your header:

![fav](https://github.com/user-attachments/assets/8b97ca2b-8e9e-46e3-bc8b-37e4c7c42712)

### How to block custom themes:

**Note:** Userscripts CANNOT block network requests directly.\
If you use uBlock Origin you can more directly prevent the custom CSS from loading altogether with the following:

Add this to uBlock's *My Filters* page and press Save Changes, then restart your browser.

```
! Block Custom Theme CSS on https://8chan.moe|se
||8chan.*/*/custom.css$css
```

### Notification API

8chanSS makes available a small API to call toast notifications on the page.
The API allows any script to call a notification, set a color (black, green, orange, red, blue) and duration in ms (default 1200 ms).\
It allows the passing of certain HTML code as well, all tag attributes are stripped except for `<a>`'s href, target and rel.\
Allowed tags: `<a>`, `<b>`, `<i>`, `<u>`, `<strong>`, `<em>`.

**How to call:**

`window.showGlobalToast('Message', 'color', duration)`

Examples:
```
window.showGlobalToast('A new XYZ version is <b>available</b>!', 'blue');
window.showGlobalToast('Something went <a href="#">wrong</a>.', 'red', 7000);
window.showGlobalToast('Test from console!', 'black, 3000); // 3 seconds
```

## Contributing
Read [Contributing](https://github.com/otacoo/8chanSS/blob/main/CONTRIBUTING.md#development--contribution) first to set up, fork the repo, then do a pull request to here.

#### Feature Request
Open a [new issue](https://github.com/otacoo/8chanSS/issues) and request a feature.

#### Reporting Bugs

Read [Reporting Bugs](https://github.com/otacoo/8chanSS/blob/main/CONTRIBUTING.md#reporting-bugs-and-suggestions) first if you have an issue and want to report a bug.

#### Credits

- bapao1, for help and insight
- vfyxe, for FullchanX and discussion
- impregnator, for Hash Navigation code
- All the Anons who contributed with code, help, feature requests and bug reports