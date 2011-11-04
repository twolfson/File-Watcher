(function(){
var checkFileUpdate = (function(){
// TODO: Test in IE6
/* Options */
// Delay between update requests (in ms)
var delay = 3000;

// Set up XHR generator
var XHR = (function () {
  var retFn;
  
  // Try the modern version
  try {
    retFn = function () {
      return new XMLHttpRequest();
    };
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
  } catch(f) {}
  
  // IE 5/6 support
  try {
    retFn = function () {
      return new ActiveXObject("Msxml2.XMLHTTP");
    };
    retFn();
    return retFn;
  } catch(g) {}

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
              // Continue async xhr loop with 1s delay
              setTimeout( checkFn, delay );
            }
        }
    };

    req.send(null);
  }());
}

return checkFileUpdate;
}());

/* Options */
// Boolean to watch inline relative elements <elt src=''>
var watchInlineElements = true,
// Boolean to relative urls in CSS * { property: url('') }
    watchCssUrls = true,
// Callback to run once all resources are collected
    callback = function (resources) {
      var i = resources.length;
      while( i-- ) {
        checkFileUpdate(resources[i]);
      }
    };

function Set() {
  var set = {};

  this.add = function (key) {
    // Do not accept undefined keys
    if( !key ) {
      return;
    }
    set[key] = 1;
  };

  this.items = function () {
    // Localize for faster multiple lookups [Zakas]
    var _set = set,
        key,
        retArr = [];

    for( key in _set ) {
      if( _set.hasOwnProperty(key) ) {
        // Faster than push [Zakas]
        retArr[retArr.length] = key;
      }
    }

    return retArr;
  };
}

// TODO: Test in IE6
// TODO: Wrap in anonymous function

// Wait until DOM is ready. I would use DOM Parsed but can't find a good snippet
/* Attribution: https://github.com/ded/domready */
!function(a,b){this[a]=this.domReady=b()}("domready",function(a){function l(a){k=1;while(a=b.shift())a()}var b=[],c,d=!1,e=document,f=e.documentElement,g=f.doScroll,h="DOMContentLoaded",i="addEventListener",j="onreadystatechange",k=/^loade|c/.test(e.readyState);e[i]&&e[i](h,c=function(){e.removeEventListener(h,c,d),l()},d),g&&e.attachEvent(j,c=function(){/^c/.test(e.readyState)&&(e.detachEvent(j,c),l())});return a=g?function(c){self!=top?k?c():b.push(c):function(){try{f.doScroll("left")}catch(b){return setTimeout(function(){a(c)},50)}c()}()}:function(a){k?a():b.push(a)}});

var host = location.hostname;
function checkUrlRelative(url) {
  var relative = true,
      urlHostArr,
      _host;

  // If the url is absolute
  if( url.match(/([^:]*:)?\/\//) ) {
    relative = false;

    // Get hostname
    urlHostArr = url.match(/\/\/([^\/]*)/);
    if( urlHostArr ) {
      _host = host;
      urlHost = urlHostArr[1];

      // TODO: Robustify this? (www. vs www2. will not match)
      // Check if one is a subdomain of the other (this also accounts for same domain)
      if( _host.indexOf( urlHost ) !== -1 || urlHost.indexOf(_host) !== -1 ) {
        relative = true;
      }
    }
  }

  return relative;
}

function grabRelativePath(str, quoteIndex) {
  var quote = str[quoteIndex],
      endIndex,
      url;

  // Skip any wierd script instances
  if( !quote.match(/['"]/) ) {
    return;
  }

  // Find the true source (4 is allow for checking \)
  // TODO: Test \"
  endIndex = quoteIndex;
  do {
    endIndex = str.indexOf(quote, quoteIndex + 1);

    // If there is no end quote, something is wrong and continue
    if( endIndex === -1 ) {
      return;
    }
  } while( str[endIndex - 1] === "\\" );

  // Collect the URL
  url = str.slice(quoteIndex + 1, endIndex);

  // Check out url
  if( !checkUrlRelative(url) ) {
    return;
  }

  // Return the valid relative url
  return url;
}

// Run collecter onces dom is ready
domready(function(){
  var resources = new Set();
  
  // Track this document
  resources.add(location);

  // In innerHTML, find all src=""
  if( watchInlineElements ) {
      var srcWithJunkArr = document.body.innerHTML.match(/src=([^>]*>)/g),
          srcWithJunk,
          i = srcWithJunkArr.length,
          srcStr;

      // Loop through all the sources
      while( i-- ) {
        // Find the quote used for the source
        srcWithJunk = srcWithJunkArr[i];
        srcStr = grabRelativePath(srcWithJunk, 4);
        // console.log(srcStr);
        if( srcStr !== undefined ) {
          resources.add(srcStr);
        }
      }
  }

  // In styleSheets, find all url()
  if( watchCssUrls ) {
    var styleSheets = document.styleSheets || [],
        styleSheet,
        i = styleSheets.length,
        rules,
        j,
        text,
        urlMatches,
        k,
        urlStr;

    while( i-- ) {
      styleSheet = styleSheets[i];

      // Collect stylesheet url
      urlStr = styleSheet.href || '';
      if( checkUrlRelative(urlStr) ) {
        // Store stylesheet to resources
        resources.add(urlStr);

        // Grab inner urls
        rules = styleSheet.cssRules || styleSheet.rules || [];
        j = rules.length;
        while( j-- ) {
          text = rules[j].cssText;
          urlMatches = text.match(/url\([^\)]*\)/g);
          if( urlMatches ) {
            k = urlMatches.length;
            while( k-- ) {
              var urlStr = grabRelativePath(urlMatches[k], 4);
              resources.add(urlStr);
            }
          }
        }
      }
    }
  }

  // Execute callback function on resources
  callback(resources.items());
});
}());