function noop(){}

function reverseCall() {
  var i = arguments.length;
  while( i-- ) {
    arguments[i]();
  }
}

AsyncTestCase('FileWatcherTest', {
  'setUp': function () {
    var requests = this.requests = [],
        that = this;
    this.fakeXhr = sinon.useFakeXMLHttpRequest();
    this.createFn = noop;
    this.sendFn = noop;
    this.fakeXhr.onCreate = function (xhr) {
      requests.push(xhr);
      that.createFn(xhr);
      xhr.onSend = that.sendFn;
    }
  },
  'test A new FileWatcher': function () {
    // A new File Watcher
    var watcher = new FileWatcher();
    assertObject('is a type of object', watcher);
  },
  'test FileWatcher.watch(singleFile)': function (queue) {
    // A new File Watcher
    var watcher = new FileWatcher(),
        that = this,
        timestamp = +new Date(),
        myCallbacks = [];

    // set a window variable for later
    window.fileWatchTimestamp = timestamp;

    queue.call(function (callbacks) {
      that.sendFn = callbacks.add(function (xhr) {
        that.sendFn = noop;
        assertObject('makes an asynchronous request', xhr);
        assertMatch('makes an asynchronous request to the proper file', /hello\.html$/, xhr.url);

        // and requests it again
        that.sendFn = myCallbacks[0];

        // Respond with data set 1
        xhr.respond(200, { "Content-Type": "text/plain" }, 'abcd');
      });

      myCallbacks.push(callbacks.add(function (xhr) {
        assertObject('makes an asynchronous request', xhr);
        assertMatch('makes an asynchronous request to the proper file', /hello\.html$/, xhr.url);

        watcher.fileChanged(function () {
          window.fileWatchTimestamp = +new Date();;
        });

        // Respond with data set 2
        xhr.respond(200, { "Content-Type": "text/plain" }, '1234');
        // and calls proper function when changed
        assertNotSame(timestamp, window.fileWatchTimestamp);
      }));

      // Start watching a single file
      watcher.watch('hello.html');
    });
  },
  'testAppendStart': function () {

  },
  'tearDown': function () {
    this.fakeXhr.restore();
  }
});