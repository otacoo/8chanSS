## v1.33.0
*2025-04-27*

Added toggles for certain features:
    - New (old) Option: Enable Thread Hiding in catalog
    - New (old) Option: Hide Inline Close Button for inlined posts

- Moved settings around in the menu and added capability for separators and titles
- Use more responsive values for Image Hover and Sidebar
- Upload files in QR will show horizontally
- Add a link to the changelog in the version number
- Fix for OP posts not being marked as yours when using the feature
- Still better targeting of posts for (You) highlighting


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