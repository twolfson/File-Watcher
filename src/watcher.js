// AMD inspired by domready
(function (name, definition) {
  if (typeof define === 'function') {
    define(function () {
      return definition;
    });
  } else if (typeof exports !== 'undefined') {
    exports[name] = definition;
  } else {
    this[name] = definition;
  }
}('FileWatcher', (function () {
function noop() {}
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

  if (ActiveXObject) {
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
  return noop;
}());

/**
 * Constructor function for a FileWatcher
 * @constructor
 */
function FileWatcher() {
  this._files = [];
  this._cache = {};
  this._listeners = [];
}
var arrPush = [].push;
FileWatcher.prototype = {
  // Default properties
  '_delay': 1000,
  /**
   * Add a new item to the end of the list
   * @param {String|String[]} url URL or array of URLs to add to watch list
   * @returns {this} Returns same object for fluent interface
   */
  'add': function (url) {
    var files = this._files;
    // Concatenate to the current list of files
    arrPush.apply(files, [].concat(url));
    return this;
  },
  /**
   * Sugar method for adding items and starting watcher
   * @param {String|String[]} url URL or array of URLs to watch
   * @param {Number} [concurrencyCount] Amount of files to watch at the same time
   * @returns {this} Returns same object for fluent interface
   */
  'watch': function (url, concurrencyCount) {
    this.add(url);
    this.start(concurrencyCount);
    return this;
  },
  /**
   * Check if next file in queue has changed
   * @param {Function} callback (Error, Return Data) function the be run when the XHR is complete
   * @returns {this} Returns same object for fluent interface
   */
  'next': function (callback) {
    // Create a new XHR
    var files = this._files,
        url = files.shift();

    // If there is no 'next' item, return early
    if (!url) {
      return this;
    }

    var cache = this._cache,
        req = XHR(),
        that = this;

    // Set up the XHR as async
    req.open("GET", url, true);

    // Retrieve the files content
    req.onreadystatechange = function () {
      // Once the file has been completely retrieved
      if (req.readyState === 4) {
        // Add the file to the queue
        files.push(url);
        // If the returned file is valid
        if (req.status === 200) {
          // Get the text
          var resText = req.responseText,
              origText = cache[url];
          // If the url has never been loaded before
          if (origText === undefined) {
            // Save the content to our cache
            cache[url] = resText;
          } else {
          // Otherwise...
            // If the content has changed
            if (origText !== resText) {
              // Call each event listener (in the original context)
              var listeners = that._listeners,
                  i = 0,
                  len = listeners.length;

              for (; i < len; i++) {
                listeners[i].call(that, url, origText, resText);
              }

              // Overwrite the cache
              cache[url] = resText;
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
   * @param {Number} [concurrencyCount] Amount of items to check concurrently
   * @returns {this} Returns same object for fluent interface
   */
  'start': function (concurrencyCount) {
    var that = this,
        i;

    // Set up async loop
    function asyncCallback() {
      that.next(function () {
        // Retrieve and call late-binding loopCallback
        that.loopCallback();
      });
    }

    // Set up privitized variable for stopping
    that.loopCallback = function () {
      setTimeout(asyncCallback, that._delay);
    };

    // Fallback concurrent count to 1
    concurrencyCount = concurrencyCount || 1;
    // Start the concurrent loops
    for (i = 0; i < concurrencyCount; i++) {
      asyncCallback();
    }
    return this;
  },
  /**
   * Stop method for watching files. DOES NOT CLEAR CACHE
   * @returns {this} Returns same object for fluent interface
   */
  'stop': function () {
    this.loopCallback = noop;
    return this;
  },
  /**
   * Setter method for delay in async loop
   * @param {Number} delay New delay to set to
   * @returns {this} Returns same object for fluent interface
   */
  'delay': function (delay) {
    this._delay = delay;
    return this;
  },
  /**
   * Add a listener for when a change occurs
   * @param {Function} Function to run when a change occurs
   * @returns {this} Returns same object for fluent interface
   */
  'addListener': function (fn) {
    this._listeners.push(fn);
    return this;
  },
  /**
   * Remove first occurence file from watcher. DOES NOT REMOVE ITEM FROM CACHE NOR FILES CURRENTLY BEING REQUESTED
   * @param {String} url Url of file to stop watching
   * @returns {this} Returns same object for fluent interface
   */
  'remove': function (url) {
    var files = this._files,
        urlIndex = -1;
    // If we have the .indexOf method on arrays, use it
    if (files.indexOf) {
      urlIndex = files.indexOf(url);
    } else {
    // Otherwise, do a linear search
      var i = files.length;
      while (i--) {
        if (files[i] === url) {
          urlIndex = i;
          break;
        }
      }
    }

    // If the file has been found, remove it
    if (urlIndex !== -1) {
      files.splice(urlIndex, 1);
    }
    return this;
  },
  /**
   * Remove all files from watcher. DOES NOT REMOVE FILES CURRENTLY BEING REQUESTED
   * @returns {this} Returns same object for fluent interface
   */
  'removeAll': function () {
    this._files = [];
    return this;
  },
  /**
   * Clear cache of original text from each file
   * @returns {this} Returns same object for fluent interface
   */
  'clearCache': function () {
    this._cache = {};
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

return FileWatcher;
}())
));