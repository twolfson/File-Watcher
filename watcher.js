// TODO: Test in IE6
var FileWatcher = (function () {

/**
 * XHR generator function
 * Try to create each possible form of XMLHttpRequest and return one if it works
 */
var XHR = (function () {
  var retFn;

  // Modern browsers
  try {
    retFn = function () {
      return new XMLHttpRequest();
    };
    retFn();
    return retFn;
  } catch(e) {}

  if( ActiveXObject ) {
    // Modern IE
    try {
      retFn = function () {
        return new ActiveXObject("Microsoft.XMLHTTP");
      };
      retFn();
      return retFn;
    } catch(f) {}

    // IE 5/6 support
    try {
      retFn = function () {
        return new ActiveXObject("Msxml2.XMLHTTP");
      };
      retFn();
      return retFn;
    } catch(g) {}
  }

  // Worst case, return noop
  return function(){};
}());

/**
 * Constructor function for a FileWatcher
 * @constructor
 */
function FileWatcher() {
  // Default options
  var delay = 1000,
      watchFiles = [],
      fileChangedFn = function () {
        location.reload();
      },
      fileCache = {},
      noop = function(){},
      loopCallback = noop;

  /**
   * FileWatcher object
   */
  return {
    /**
     * Add a new item to the end of the list
     * @param {String|String[]} url URL or array of URLs to add to watch list
     * @returns {this} Returns same object for fluent interface
     */
    'append': function (url) {
      // Concatenate to the current list of files
      watchFiles.concat(url);
      return this;
    },
    /**
     * Sugar method for append; same functionality
     * @see FileWatcher.append
     */
    'add': function (url) {
      return this.append(url);
    },
    /**
     * Sugar method for adding items and starting watcher
     * @param {String|String[]} url URL or array of URLs to watch
     * @returns {this} Returns same object for fluent interface
     */
    'watch': function (url) {
      this.append(url);
      this.start();
      return this;
    },
    /**
     * Start method for watcher to begin checking files
     * @returns {this} Returns same object for fluent interface
     */
    'start': function () {
      var that = this;
      // Set up async loop
      function asyncCallback() {
        that.next(loopCallback);
      }

      // Set up privitized variable for stopping
      loopCallback = function () {
        setTimeout( asyncCallback, delay );
      };

      // Begin the loop
      asyncCallback();
      return this;
    },
    /**
     * Check if next file in queue has changed
     * @param {Function} callback (Error, Return Data) function the be run when the XHR is complete
     * @returns {this} Returns same object for fluent interface
     */
    'next': function (callback) {
      // Create a new XHR
      var req = XHR(),
      // By default, if there are no files in the queue, watch the current page
          url = watchFiles.shift() || '/';

      // Set up the XHR as async
      req.open("GET", url, true);

      // Retrieve the files content
      req.onreadystatechange = function () {

        // Once the file has been completely retrieved
        if( req.readyState === 4 ) {
          // Add the file to the queue
          watchFiles.push(url);
          // If the returned file is valid
          if( req.status === 200 ) {
            // Get the text
            var resText = req.responseText,
                origText = fileCache[url];

            // If the url has never been loaded before
            if( !origText ) {
              // Save the content to our cache
              fileCache[url] = origText;
            } else {
            // Otherwise...
              // If the content has changed
              if( origText !== resText ) {
                // Call the main fileChangedFn and overwrite the cache
                fileChangedFn(origText, resText);
                fileCache[url] = resText;
              }
            }

            // Callback with the return data
            callback(undefined, resText);
          } else {
            // If there has been a server error, callback with a custom object
            callback({'url': url, 'xhr': req});
          }
        }
      };

      // Send the request off with no data
      req.send(null);
      return this;
    }
    // TODO: Stop fn
    // TODO: Setttings fns
    // TODO: Remove item fn
    // TODO: Remove all fn
    // TODO: Clear cache fn (overwrite with {})
  };
}

return FileWatcher;
}());