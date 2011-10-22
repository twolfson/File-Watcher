// TODO: Test in IE6
// TODO: Wrap in anonymous function
/* Options */
// Delay between update requests (in ms)
var delay = 3000,
// Files to watch (location.href is this current page)
    watchFiles = [location.href];

// Set up XHR generator
var XHR = (function () {
  var retFn;
  
  // Try the modern version
  try {
    retFn = function () {
      return new XMLHttpRequest();
    }
    retFn();
    return retFn;
  } catch(e) {}
  
  // Modern IE
  try {
    retFn = function () {
      return new ActiveXObject("Microsoft.XMLHTTP");
    };
    retFn();
    return retFn;
  } catch(e) {}
  
  // IE 5/6 support
  try {
    retFn = function () {
      return new ActiveXObject("Msxml2.XMLHTTP");
    };
    retFn();
    return retFn;
  } catch(e) {}

  // Worst case, return noop
  return function(){};
}());

// Simple-reload functionality
// Factory function that begins update loops
function checkFileUpdate(url) {
  var origText;
  // XHR loop with closured url
  (function checkFn() {
    var req = XHR();
    req.open("GET", url, true);

    // We will grab the file's current content
    req.onreadystatechange = function () {
        if( req.readyState === 4 ) {
            if( req.status === 200 ) {
                var resText = req.responseText;
                // We must generate the text from XHR since Javascript could make things screwy when we do innerHTML on a document
                if( origText === undefined ) {
                    origText = resText;
                } else {
                    // If the content is different, reload the page
                    if( origText !== resText ) {
                        location.reload();
                    }
                }
            }
            // Continue async xhr loop with 1s delay
            setTimeout( checkFn, delay );
        }
    };

    req.send(null);
  }());
};

// Start watching files
var i = watchFiles.length;
while( i-- ) {
  checkFileUpdate( watchFiles[i] );
}