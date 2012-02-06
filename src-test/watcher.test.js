function noop() {}

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
  'test A new FileWatcher can add, start, and stop monitoring a file': function () {
    // A new File Watcher
    var watcher = new FileWatcher();
    assertObject('is a type of object', watcher);
    
    // that tracks a single file
    watcher.add('singleFile.html');
    
    // when it begins monitoring
    watcher.start();
    
    // it makes requests for the appropriate file
      // TODO: Check singleFile.html
    
      // and when it is stopped
            watcher.stop();
      // makes no additional requests
        // TODO: Set up to fail
        // TODO: Set 2s timeout to stop failing and pass
  },
  'test A FileWatcher can start and stop "watch"ing a file' : function () {
    // {
  // 'A FileWatcher' {
    // topic: function () {
      // return new FileWatcher();
    // },
    // 'that watches a single file': {
      // 'automatically monitors': function () {},
      // 'and when stopped': {
        // 'makes no further requests': function () {
        
        // }
      // }
    // }
  // }
// },
  },
  'test A FileWatcher can start and stop "watch"ing an array of files': function () {
  // {
  // 'A FileWatcher': {
    // 'can watch an array of files': {
      // 'and when stopped': {
        // 'makes no further requests': function () {
        
        // }
      // }
    // }
  // }
// },
  },
  'test A FileWatcher "watch"ing a single file with an event listener': function () {
  // {
  // 'A FileWatcher': {
    // 'watching a single file': {
      // 'with an event listener': {
        // 'is triggered when there is a file change': {
        
        // }
      // }
    // }
  // }
// }
  },
  // Below should be broken down into .watch and .addListener
  // TODO: Test concurrency count
  // TODO: Test step/next?
  // TODO: Write out tests in BDD format and export as selenium ready test (but make it a modular wrapper layer)
  'test FileWatcher.watch(singleFile)': function (queue) {
    // A new File Watcher
    var watcher = new FileWatcher(),
        that = this,
        timestamp = +new Date();

    // set a window variable for later
    window.fileWatchTimestamp = timestamp;

    // Create an async callback queue
    queue.call(function (callbacks) {
      // Begin watching a single file (after everytihng below is set up)
      setTimeout(function () {
        watcher.watch('hello.html');
      }, 1);

      // When hello.html is first requested
      that.sendFn = callbacks.add(function (xhr) {
        // we prevent further hello.html requests from coming through
        that.sendFn = noop;

        // then assert that this is in fact an xhr and is requesting the proper url
        assertObject('makes an asynchronous request', xhr);
        assertMatch('makes an asynchronous request to the proper file', /hello\.html$/, xhr.url);

        // then, we respond with some data (after the following is set up)
        setTimeout(function () {
          xhr.respond(200, { "Content-Type": "text/plain" }, 'abcd');
        }, 1);

        // When hello.html is requested a second time
        that.sendFn = callbacks.add(function (xhr) {
          // make sure that xhr is an object and the proper url is being requested
          assertObject('makes an asynchronous request', xhr);
          assertMatch('makes an asynchronous request to the proper file', /hello\.html$/, xhr.url);

          // Set up the watcher to change the timestamp when a change occurs
          watcher.addListener(function () {
            window.fileWatchTimestamp = +new Date();
          });

          // then, we respond with a different response than the one from before (thus triggering the fileChanged function)
          xhr.respond(200, { "Content-Type": "text/plain" }, '1234');

          // finally, we make sure that the fileChanged event was triggered
          assertNotSame(timestamp, window.fileWatchTimestamp);
        });
      });
    });
  },
  'test FileWatcher.watch(fileArray)': function (queue) {

  },
  'tearDown': function () {
    this.fakeXhr.restore();
  }
});