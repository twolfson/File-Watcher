Synopsis
========
Currently, there is no cross-platform solution that allows a front-end developer to alter some code (flavor agnostic) and immediately see the result occur in the browser.

This is a poor man's solution to solving that problem half way. The code base has been split up into two halves; a script that watches specific URL's for any content changes and another script which gathers the resources used on the page.

This script is the first half.

How It Works
============
FileWatcher is a constructor function that keeps a in-object cache of the contents of files. When a file is added to the watcher, it is pushed into a queue.

When a watcher is started, it takes the first item from the queue and fires an XHR or one of its cousins (cross-browser down to IE5.5) to fetch the content of a resource.

If the content has never been seen before, it is added to our cache. If there is a change, trigger the listeners.

Next, the file is added back to the queue to be watched. Then, one second later (or whatever the delay is) the next item is pulled from the queue and the process begins again.

Develop with a hands-free refresh
=================================
FileWatcher was initially built with a sister script called ResourceCollector. When these scripts are used together, they allow for webpages to dynamically refresh whenever there is an HTML change and seamlessly update images and CSS.

Below are two common examples of how to use the scripts.

Refresh always
--------------
This snippet will make the entire webpage reload on any resource change (HTML, CSS, script, or image). Place this snippet at the bottom of the body of your HTML page since collector will not find all the resources otherwise.

    <script src="//raw.github.com/twolfson/File-Watcher/master/src/watcher.js"></script>
    <script src="//raw.github.com/twolfson/Resource-Collector/master/src/collector.js"></script>
    <script>
        (function () {
           var watcher = new FileWatcher(),
               resources = ResourceCollector.collect();
           watcher.addListener(function () {
             location.reload();
           });
           watcher.watch(resources);
        }());
    </script>

Smart refresh
-------------
This snippet will reload when there is an HTML or script change. Additionally, we will watch CSS and images for changes (which when the browser sees a change has occurred, will update without a refresh).

    <script src="//raw.github.com/twolfson/File-Watcher/master/src/watcher.js"></script>
    <script src="//raw.github.com/twolfson/Resource-Collector/master/src/collector.js"></script>
    <script>
        (function () {
           var watcher = new FileWatcher(),
               resources = ResourceCollector.collect();
           watcher.addListener(function (url) {
             if (url.match(/(js|html)$/)) {
               location.reload();
             }
           });
           watcher.watch(resources);
        }());
    </script>

Standalone Usage
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

Tested in
=========
 - Firefox 7
 - IE 6

The API
=========
 - **start**([concurrencyCount=1]) - Begins looping through the queue of files. If there is a concurrencyCount specified, that many XHR's will be running at the same time.

 - **stop**() - Terminates any further XHR's from being requested. The current FileWatcher does not support ignoring already started requests.

 - **next**() - Fire an XHR for the next file in the queue

 - **add**(url | url[]) - Add either a URL string or array of URLs to the queue of files to watch

 - **watch**(url | url[]) - Runs 'add' method then 'start' method acting as a nice layer of sugar.

 - **addListener**(eventFn) - Adds a function to execute when there is a change to one of the files. The eventFn receives three parameters, the file name, its old contents, and its new contents.

 - **delay**(msWait) - Sets the time to wait between XHR calls. This is 1000ms by default.

Enjoy!