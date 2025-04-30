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