// TODO: Test in IE6
// AMD inspired by domready
(function (name, definition) {
  var defObj;
  if (typeof define === 'function') {
    defObj[name] = definition;
    define(defObj);
  } else if (typeof exports !== 'undefined') {
    exports[name] = definition;
  } else {
    this[name] = definition;
  }
}('FileWatcher', (function () {
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
  var _delay = 1000,
      _fileChangedFn = function () {
        location.reload();
      },
  // Instance privitized variables
      watchFiles = [],
      fileCache = {},
      noop = function(){},
      loopCallback;

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
      watchFiles.push.apply(watchFiles, [].concat(url));
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
     * Check if next file in queue has changed
     * @param {Function} callback (Error, Return Data) function the be run when the XHR is complete
     * @returns {this} Returns same object for fluent interface
     */
    'next': function (callback) {
      // Create a new XHR
      var req = XHR(),
          url = watchFiles.shift();

      // If there is no 'next' item, return early
      if( !url ) {
        return this;
      }

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
              fileCache[url] = resText;
            } else {
            // Otherwise...
              // If the content has changed
              if( origText !== resText ) {
                // Call the main fileChangedFn and overwrite the cache
                _fileChangedFn(origText, resText);
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
    },
    /**
     * Start method for watcher to begin checking files (circular queue)
     * @param {Number} [concurrentCount] Amount of items to check concurrently
     * @returns {this} Returns same object for fluent interface
     */
    'start': function (concurrentCount) {
      var that = this,
          i;

      // Set up async loop
      function asyncCallback() {
        that.next(loopCallback);
      }

      // Set up privitized variable for stopping
      loopCallback = function () {
        setTimeout( asyncCallback, _delay );
      };

      // Fallback concurrent count to 1
      concurrentCount = concurrentCount || 1;
      // Start the concurrent loops
      for( i = 0; i < concurrentCount; i++ ) {
        asyncCallback();
      }
      return this;
    },
    /**
     * Stop method for watching files. DOES NOT CLEAR CACHE
     * @returns {this} Returns same object for fluent interface
     */
    'stop': function () {
      loopCallback = noop;
      return this;
    },
    /**
     * Setter method for delay in async loop
     * @param {Number} delay New delay to set to
     * @returns {this} Returns same object for fluent interface
     */
    'delay': function (delay) {
      _delay = delay;
      return this;
    },
    /**
     * Trigger/setter function for fileChanged function
     * @param {Function} [fileChangedFn] New file changed funciton. If not specified, the current function will be triggered.
     * @returns {this} Returns same object for fluent interface
     */
    'fileChanged': function (fileChangedFn) {
      if( arguments.length > 0 ) {
        _fileChangedFn = fileChangedFn;
      } else {
        _fileChangedFn();
      }
      return this;
    },
    /**
     * Remove first occurence file from watcher. DOES NOT REMOVE ITEM FROM CACHE NOR FILES CURRENTLY BEING REQUESTED
     * @param {String} url Url of file to stop watching
     * @returns {this} Returns same object for fluent interface
     */
    'remove': function (url) {
      var urlIndex = -1;
      // If we have the .indexOf method on arrays, use it
      if( watchFiles.indexOf ) {
        urlIndex = watchFiles.indexOf(url);
      } else {
      // Otherwise, do a linear search
        var i = watchFiles.length;
        while( i-- ) {
          if( watchFiles[i] === url ) {
            urlIndex = i;
            break;
          }
        }
      }
      
      // If the file has been found, remove it
      if( urlIndex !== -1 ) {
        watchFiles.splice(urlIndex, 1);
      }
      return this;
    },
    /**
     * Remove all files from watcher. DOES NOT REMOVE FILES CURRENTLY BEING REQUESTED
     * @returns {this} Returns same object for fluent interface
     */
    'removeAll': function () {
      watchFiles = [];
      return this;
    },
    /**
     * Clear cache of original text from each file
     * @returns {this} Returns same object for fluent interface
     */
    'clearCache': function () {
      cache = {};
      return this;
    },
    /**
     * Sugar method for removing all files and resetting cache
     * @returns {this} Returns same object for fluent interface
     */
    'reset': function () {
      this.removeAll();
      this.clearCache();
      return this;
    }
  };
}

return FileWatcher;
}())
));