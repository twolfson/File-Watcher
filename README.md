Synopsis
========
Fires XHRs to the watched files. When any change happens to any attached file, the user defined listeners will be triggered.

Usage
========
To watch your own set of files, download and include the FileWatcher script on your page (either via &lt;script&gt; or an AMD loader).

    <script src="//raw.github.com/twolfson/File-Watcher/master/src/watcher.js"></script>
    OR
    require(['FileWatcher'], function (FileWatcher) { /* Your code goes here */ });

Then, create your new FileWatcher object, set up what you would like it to do when a file changes, and start watching your items.

        var watcher = new FileWatcher();
        watcher.addListener(function () {
            location.reload(); // Reload when a file changes
        });
        watcher.watch('index.css');

Develop with a hands-free refresh
=================================
FileWatcher was initially built with a sister script called ResourceCollector. Currently, it is under a refactoring but when completed you will be able to refresh the page dynamically whenever there is an HTML change and seamlessly update images and CSS.


The API
=========
 - **start**([concurrencyCount=1]) - Begins looping through the queue of files. If there is a concurrencyCount specified, that many XHR's will be running at the same time.

 - **stop**() - Terminates any further XHR's from being requested. The current FileWatcher does not support ignoring already started requests.
 - next() - Fire an XHR for the next file in the queue

 - **add**(url | [url */\*, url, ...\*/*]) - Add either a URL string or array of URLs to the queue of files to watch

 - **watch**(url | [url */\*, url, ...\*/*]) - Runs 'add' method then 'start' method acting as a nice layer of sugar.

 - **addListener**(eventFn) - Adds a function to execute when there is a change to one of the files. The eventFn receives three parameters, the file name, its old contents, and its new contents.

Enjoy!