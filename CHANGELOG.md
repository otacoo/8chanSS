### v1.54.1
*2025-07-22*

- Fix for sauce links not fetching the correct image
- Minor changes

## v1.54.0
*2025-07-17*

- **New Option:** Prevent animated PNGs from playing (issue #10)

### v1.53.7 (Patch)
*2025-06-25*

- Re-add file renaming feature

### v1.53.6 (Patch)
*2025-06-13*

- Better implementation for ID post count by Anon

### v1.53.5 (Patch)
*2025-06-12*

- Small menu changes
- Fix for post count ID not updating ID post count for older posts

### v1.53.4 (Patch)
*2025-06-11*

- Fix for the previous fixes

### v1.53.3 (Patch)
*2025-06-11*

- Watched threads in the TW will now get a `.ss-active` class to highlight that they're currently being visited
- Fix for ID post count going up when posts are inlined

### v1.53.2 (Patch)
*2025-06-09*

- Fix for Vertical ID list when Fit Replies is disabled
- Fix for "Toggle ID as Yours" when used inside inlined posts toggling the outer post's ID instead

### v1.53.1 (Patch)
*2025-06-09*

- Compact floating ID lists
- Fix bug with floating ID lists sometimes getting stuck
- Newly added spoilered images with a custom spoiler will now work correctly for image hover

**PR #7 by @KillAllBugsEatAllPotatos :**
- Vertical list css update

## v1.53.0
*2025-06-08*

- **New Feature:** Show a filter list in the menu to remove hiding filters
- ID post count will now work for OP and inline posts
- Refactor "plus" hiding options and recursive hiding, should no longer hide random innocent posts (might still be buggy however...)
- Move options for IDs to Thread tab
- Adjust style for vertical ID list
- Prevent posts from being marked when an ID is clicked (floating lists only)
- Improved Sauce links
- Fix for small images inside nested posts not being hoverable
- Fix for small videos not playing on hover if they were spoilered
- Fix for small videos having broken spoilers
- Fix for audio files with generic thumbs not being playable on hover

**PR #6 by @KillAllBugsEatAllPotatos :**
- Added toggle function to list post history by id in a vertical list

### v1.52.1 (Patch)
*2025-06-04*

- Fix for "recursive hiding" not working with "Always show post count of IDs"
- Fix for "recursive hiding" hiding unrelated posts up in the chain
- Fix for "toggle ID as yours" to work with "Always show post count of IDs"

## v1.52.0
*2025-06-03*

- **New Option:** Recursive hide/filter/name+ (hide replies to replies)
- **New Option:** Always show post count for IDs
- Add a close button to dismiss 8chanSS notifications
- Adjust floating ID list CSS, remove rounded corners
- Removed some lingering console.logs

## v1.51.0
*2025-06-02*

- **New Options:** 
  - Misc > Enhanced Youtube Links > Show Thumbnails on Hover\
    *Note:* To support Youtube thumbnails on hover the userscript will now connect to `youtube.com` and `i.ytimg.com`.
  - Misc. > Alternative post hiding menu & features (replaces the native post hiding menu, "plus" options will hide *direct* replies to filtered/hidden IDs, posts & names) (Issue #5)
  - Misc > Show only posts by ID when ID is clicked > Show as a floating list
- Add support for /embed/, /live/ and /shorts/ Youtube links
- Youtube links will now correctly keep their time stamp parameter (tracking params are still stripped)
- Sauce links will now correctly show up in inlined posts
- Blurred/revealed spoilers will now work correctly for hovering tooltips
- Various optimizations to the code

### v1.50.3 (Patch)
*2025-05-27*

- **New Option:** Pin Thread Watcher > Don't pin in Catalog
- Fix for 8chanSS menu colors not working on older browsers

### v1.50.2 (Patch)
*2025-05-27*

- Fix for the script not loading when document.head isn't immediately available
- Fix for notifications firing too soon on page load

## v1.50.0
*2025-05-26*

- **New Option:** Styling > OP Background
- Added a settings toggle for 8chanSS update notifications
- Fix for new posts not getting Sauce links when enabled
- Fix for Tab shortcut key not checking for modifier keys


## v1.49.0
*2025-05-24*

### **New Feature: Notification API**
This API allows any script to call a notification, set a color (black, green, orange, red, blue) and duration in ms (default 1200 ms).\
It allows the passing of certain HTML code as well, all tag attributes are stripped except for `<a>`'s href, target and rel.\
Allowed tags: `<a>`, `<b>`, `<i>`, `<u>`, `<strong`, `<em>`.

#### How to call:

`window.showGlobalToast('Message', 'color', duration)`

Examples:
```
window.showGlobalToast('A new XYZ version is <b>available</b>!', 'blue');
window.showGlobalToast('Something went <a href="#">wrong</a>.', 'red', 7000);
window.showGlobalToast('Test from console!', 'black, 3000); // 3 seconds
```

- **New Options:**
  - Sauce Links (IQDB, Saucenao, Pixiv)
  - Add menu entry to toggle ID as yours
- Fix for APNG images not being hoverable if added in a new post
- Fix for images with exactly 220px width/height not being hoverable
- Rearranged some of the menu
- Various code optimizations

## v1.48.0
*2025-05-21*

- **New Option:** Show Last 50 Posts button for the catalog
- Removed: Delete Name Checkbox, will no longer be necessary after site update
- Updated Beep on (You) to only fire if the setting is enabled and prevent WebAudio warnings in the console
- Bug fix for Hash Navigation not working correctly for links in OP
- Bug fix for Quote Threading not threading correctly
- Improved caching of YT titles and cap it at 350 entries
- Improved the dynamic Announcement hiding with a much simpler and faster implementation
- Footer (copyright stuff) will only be hidden in threads
- Adjusted Save Scroll position and Unread line, unread line will no longer appear if the page is loaded at its end
- Various optimizations, reduced redundancy and optimized observers

## v1.47.0
*2025-05-18*

- **New Option:** Quote Threading, `SHIFT` + `T` to toggle on/off after enabling it in the settings, will thread all posts on page load then thread any new posts up to 6 new posts
- YT links will now be correctly sanitized before being parsed
- Advanced Media Viewer will now correctly expand with the inner element
- Pinned Advanced Media Viewer will only scroll zoom until reaching viewport to keep aspect ratio (set to Native if you don't like this behaviour)
- Revealed spoilers will now get their correct thumbnail size
- Add Alt Pixel favicon and update Pixel, Eight and Eight Dark favicon
- Reorganized some options
- Adjusted post margins and reduced (You) highlights border size
- Newly added IDs will now be correctly styled
- Various optimizations

## v1.46.0
*2025-05-16*

- **New Option:** Highlight new IDs
- Revert (You) highlighting to better target (You)s
- Advanced Media Viewer will no longer fit the content to viewport
- Fix auto-hide header on scroll for bottom header

### v1.45.2
*2025-05-16*

- Fix for Custom Favicon not being disabled when the setting is off

### v1.45.1
*2025-05-16*

- Fix for Advanced Media Preview not being disabled when the setting is off
- Style Changelog link

## v1.45.0
*2025-05-16*

- **New Option:** Auto-hide Header on Scroll
- **New Option:** Advanced Media Viewer (enables the native setting)
- **New Option:** Custom Favicon
- **Renamed**: Hightlight (You) posts -> Style (You) posts, to make use of the native highlighting
- Settings menu will now make use of the current theme's colors
- Settings menu will now close when clicked outside of it
- Enhanced Youtube Links will now cache the links for faste retrieval
- Removed: Mark Posts as Yours feature due to native setting added
- Removed: Remember QR Checkboxes Status, wasn't working correctly
- Fix for tooltips getting stuck after site update
- Style (Deleted) posts text


### v1.44.1 (Patch)
*2025-05-12*

- Fix for Image Hover not working correctly after refactor
- Added in v1.44.0: M4V format support
- Remove old meta @grant added in the last version
- Small code changes & fixes

## v1.44.0
*2025-05-12*

- New option: Remember QR Checkboxes State
- Re-implemented the Beep on (You) feature to use the web audio API
- Add M4V video support
- Re-organized the settings menu
- OP posts that are yours will now also get the highlight border
- Custom (You) notification will now only disappear when scrolled to the bottom not on tab/window focus
- Announcement *should* now correctly unhide itself when the message changes & the setting is enabled
- Lots of code optimizations and safety features, if an option or feature fails it should no longer lock the whole script and will throw an error instead
- Removed: Rename Filenames feature (temporarily)

## v1.43.0
*2025-05-09*

- New option: Hash Navigation (adds a hash next to the quote/backlink to navigate to that post, adapated from impregnator's code for 8chan Lightweight Extended Suite, MIT License)
- New option: Thread Stats in Header
- New feature: Eye button to mark all threads as read in the TW
- Added a small padding to TW so the last thread in the list can be closed
- Hover media now has an id (#hover-preview-media) so it can styled by users
- Add AVIF and JXL support (lol) for future-proofing
- Fix for APNG and small images not showing on hover
- Custom Board List will now get a small scrollbar on hover if its content is cut off from showing in full
- Experimental: the hide Announcement setting will now store a very simple hash of the current message and unhide itself if the message changes (no way to test if it works without the message changing however)

## v1.42.0
*2025-05-06*

- Apply Anon's fix for file renamer issue
- Hovered Images will no longer "jump" to the mouse cursor when finished loading
- Hovered Images can now show on both sides of the cursor
- Mark as Your Post menu entry will now correctly show "Unmark as Your Post" when the post is currently yours
- Small spoilered thumbnails should no longer have broken thumbnails (all edge cases hopefully)
- Various code optimizations


## v1.41.0
*2025-05-05*

May I suggest a reset of your 8chanSS settings?

- Removed the "Enable Inline Replies" option, too buggy
- Inlined backlinks and quotelinks will still get a dashed underline and reduced opacity
- Add a shadow to the Quick Reply

## v1.40.0
*2025-05-05*

- Apply Anon's bruteforce solution for (You) borders on inline quoted posts
- `R` shortcut key will now refresh the catalog as well
- (You) notifications should work again (see known issues below)
- Opening catalog threads in a new tab should now work after a refresh of the catalog
- (You) highlights will now show in the Index page as well
- File renaming will now work on the posting form as well and both QR and Posting Form will be synced
- Removed Spoilers will now get a small dotted border to show they were spoilers
- Small dimension image spoiler thumbnails should no longer be broken
- Fix for certain board's spoiler images not being removed

Know Issues:
- Unread count in the tab will disappear if a (You) notification is sent and until new posts are added
- Renaming multiple files and then deleting one or more files will upload the wrong file as the file index goes out of sync


## v1.39.0
*2025-05-01*

- New Option: Enhanced Youtube Links
- New Option: Hide Janitor Forms
- New Shortcut: `R` to refresh the thread (5 second cooldown, only triggers outside of QR or inputs)
- Rewrite of Save Scroll Position option, now tab title has an unread post counter
- `Tab` shortcut key will now switch between QR and captcha input field when QR is in focus
- Removed JANK THEME FLASH FIX (barely does anything, check Github readme for better solution)
- Float search field in the catalog to the left
- Bottom replies will now correctly be taken into account for Inline Replies option
- Audio playing indicator will no longer append to filenames only thumbs
- Fix for video hover volume not taking the volume setting into account
- File uploads will now correctly be shown below OP title and details
- Slightly adjust inline post shadow

## v1.38.0
*2025-04-30*

Small bugfixing update

- Newly added posts will now correctly have their filenames truncated
- `ALT` + `W` will now correctly be disabled when shortcuts are disabled
- Bug fix for inline replies not working correctly for OP
- (You) quotes will now use the theme's subject color instead of just "red"

## v1.37.0
*2025-04-30*

- New Option: Enable Keyboard Shortcuts
- New Option: Auto Expand Thread Watcher (TW will expand/shrink vertically as threads are added)
- New Option: Show only Posts by ID when ID is clicked (toggle for previously implemented feature)
- Replaced Doom text with Srz Bizniz text (shortcut still same)
- Fix Mark As Your Post being added to the Hide menu
- Inlined backlink posts should now always show up below the post title no matter how deeply nested (similar to 4chanX)
- Clicked quotelinks will have their opacity reduced (similar to 4chanX)
- Gave native 8chan settings and Multiboard menus a bit of styling similar to the thread watcher
- `Esc` keyboard shortcut will now  also close the thread watcher
- Add icon to 8chanSS userscript

### v1.36.0 (skipped one version)
*2025-04-29*

- New tab with Miscellaneous options
- New Option: Hide Checkboxes
- New Option: Always Open Threads in New Tab (for Catalog)
- New Option: Enable 12-Hour Clock
- New Option: Truncate Filenames
- New Option: Hide No Cookie? Link
- New Shortcut: `Tab` will target quick reply text area
- New Feature: Click ID to show all post by that ID
- New Feature: Rename filenames in quick reply (click the filename)
- Adjusted the styling of Thread Watcher notifications, threads will now get the number of replies between parenthesis and (You) threads will be colored, e.g. `/b/ - Thread name (12) (you)`
- Adjusted inline backlinks to show above the post message and make newly opened backlinks show above old inline backlinks
- Various optimizations

## v1.34.0
*2025-04-27*

- New Feature: CTRL + UP/DOWN Arrow to scroll between Your posts, CTRL + SHIFT + UP/DOWN ARROW for posts quoting (You)
- Add option for 8chanSS inline/nested replies
    Note: Because 8chSS relies on the native inline option, this option will enable the native inline replies option but will not disable it when you disable 8chSS's, so you have to do disable the native feature manually.
- Add option for fading Quick Reply
- Adjusted Image Hover
- Threads in the Thread Watcher will now have their HTML elements properly decoded, e.g. " &gt; " will turn into " > "
- Styled Thread Watcher scrollbar

## v1.33.0
*2025-04-27*

- 8chanSS will no longer force native Inline Replies to be enabled
- Moved settings around in the menu and added capability for separators and titles
- Use more responsive values for Image Hover and Sidebar
- Upload files in QR will show horizontally
- Add a link to the changelog in the version number
- Fix for OP posts not being marked as yours when using the feature
- Still better targeting of posts for (You) highlighting

Added toggles for certain features:
- New (old) Option: Enable Thread Hiding in catalog
- New (old) Option: Hide Inline Close Button for inlined posts


## v1.32.0
*2025-04-26*

- New Option: "Custom Notification Text" for (You)s in the tab 🔥 (8 chars max.)
- New Option: "Don't Scroll To Bottom on Reply"
- New Feature: "Mark Post as Yours" in the post menu, click again to unmark
- Refactored and optimized lot of the code thanks to @bapao1
- Save Scroll *should* now correctly save position regardless of URL anchor
- Thread Watcher can be expanded again
- Threads in the TW that quote you will get a (You) notification
- Uploads and images for OP will now be appended below the name
- Slightly expanded the native inline feature to also append inline quotes above the original message and give the opened quotelink a dashed underline
- Inlined posts will no longer beep if the post contains a (You) quote
- Better targeting for (You) highlighting of posts
- Hovered images should no longer touch the bottom of the viewport


#### PR by @bapao1:
- add // @ts-check for typescript linting;
- add // @ts-ignore above GM variables;
- change style.zIndex value types from int to string;
- refactor nested if statements by changing it into null checks and gaurd clasuses with early returns;
- refactor featureWatchThreadOnReply() function slightly better readability;


## v1.31.0
*2025-04-25*

- New Feature: Hide Catalog Threads (Shift + Click), has a button to show hidden threads, shift + click again to unhide (saved per board)
- New Feature: Better inline replies, inlined posts will now appear above the message, opened quotelinks will receive an dashed underline
- Add some CSS to Thread Watcher again
- Thread Watcher will now highlight threads where you got an (You) in red
- Watched threads will now have their little eye colored to signify they're being watched
- Scrolls Arrows will correctly be positioned for the Index and Catalog

## v1.30.0
*2025-04-25*

- New Option: Sidebar on Left
- New Option: Hide Default Board List
- Rewrote the Image/Video/Audio hover function, should be a bit better
- Rewrote how Index is detected, will no longer have its Scroll Position saved

## v1.29.0
*2025-04-24*

- New Option: Show Unread Line
- Unread Line will now disappear if the page is scrolled to the bottom
- Images on Hover will now show up while loading
- Removed most of Thread Watcher CSS and JS styling for now as it's causing slow downs with large # of threads
- Captcha input field will no longer show history (useless)

### v1.28.0
*2025-04-24*

- Versioning change again because 'tarded
- Expanded images and video should now fit to viewport
- Delete Name checkbox will no longer appear if there's no Name input
- Give the side catalog a background so it's more readable
- Fixed z-indexes for certain elements so they don't get hidden

### v1.2.27
*2025-04-24*

- Bug fix for Hide Stubs of Hidden Posts targeting the wrong class
- Reorganized the code
- Versioning
