// TODO: Test in IE6
// TODO: Wrap in anonymous function

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
var origText;
// TODO: Allow for any URL - fallback to location.href
(function checkPageUpdate() {
  var req = XHR();
  req.open("GET", location.href, true);

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
          setTimeout( checkPageUpdate, 1000 );
      }
  };

  req.send(null);
}());