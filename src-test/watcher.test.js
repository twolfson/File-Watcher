function noop() {}
function additionalRequestFn() {
  fail('An additional request was made when it should not have been');
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
  'test A new FileWatcher can add, start, and stop monitoring a file': function (queue) {
    // A new File Watcher
    var watcher = new FileWatcher();
    assertObject('is a type of object', watcher);

    // that tracks a single file
    watcher.add('singleFile.html');

    var that = this;
    queue.call(function (callbacks) {
      // when it begins monitoring
      setTimeout(function () {
        watcher.start();
      }, 1);

      that.sendFn = callbacks.add(function (xhr) {
        that.sendFn = callbacks.addErrback(additionalRequestFn);

        assertObject(xhr);
        assertMatch('requests the appropriate file', /singleFile\.html$/, xhr.url);

        // and when given a good response
        setTimeout(function () {
          xhr.respond(200, { "Content-Type": "text/plain" }, 'abcd');
        }, 1);

        // the content is requested a second time
        that.sendFn = callbacks.add(function (xhr) {
          that.sendFn = callbacks.addErrback(additionalRequestFn);

          assertObject(xhr);
          assertMatch('requests the appropriate file', /singleFile\.html$/, xhr.url);

          // and when it is stopped
          watcher.stop();

          // and when given a good response
          xhr.respond(200, { "Content-Type": "text/plain" }, 'abcd');

          // makes no additional requests
          setTimeout(callbacks.add(function () {
            xhr.sendFn = noop;
          }), 2000);
        });
      });
    });
  },
  'test A FileWatcher can start and stop "watch"ing a file' : function (queue) {
    var watcher = new FileWatcher();

    // that watches a single file
    setTimeout(function () {
      watcher.watch('singleWatchFile.html');
    }, 1);

    // automatically monitors
    var that = this;
    queue.call(function (callbacks) {
      that.sendFn = callbacks.add(function (xhr) {
        that.sendFn = callbacks.addErrback(additionalRequestFn);

        assertObject(xhr);
        assertMatch('requests the appropriate file', /singleWatchFile\.html$/, xhr.url);

        // and when given a good response
        setTimeout(function () {
          xhr.respond(200, { "Content-Type": "text/plain" }, 'abcd');
        }, 1);

        // the content is requested a second time
        that.sendFn = callbacks.add(function (xhr) {
          that.sendFn = callbacks.addErrback(additionalRequestFn);

          assertObject(xhr);
          assertMatch('requests the appropriate file', /singleWatchFile\.html$/, xhr.url);

          // and when it is stopped
          watcher.stop();

          // and when given a good response
          xhr.respond(200, { "Content-Type": "text/plain" }, 'abcd');

          // makes no additional requests
          setTimeout(callbacks.add(function () {
            xhr.sendFn = noop;
          }), 2000);
        });
      });
    });
  },
  'test A FileWatcher can start and stop "watch"ing an array of files': function (queue) {
    var watcher = new FileWatcher();

    // that watches a multiple files
    setTimeout(function () {
      watcher.watch(['multiFile1.html', 'multiFile2.html', 'multiFile3.html']);
    }, 1);

    // automatically monitors
    var that = this;
    queue.call(function (callbacks) {
      that.sendFn = callbacks.add(function (xhr) {
        assertObject(xhr);
        assertMatch('requests one the appropriate file', /multiFile1\.html$/, xhr.url);

        // and when given a good response
        setTimeout(function () {
          xhr.respond(200, { "Content-Type": "text/plain" }, 'abcd');
        }, 1);

        // the next request is made
        that.sendFn = callbacks.add(function (xhr) {
          that.sendFn = callbacks.addErrback(additionalRequestFn);

          assertObject(xhr);
          assertMatch('requests the appropriate file', /multiFile2\.html$/, xhr.url);

          // and when given a good response
          xhr.respond(200, { "Content-Type": "text/plain" }, 'abcd');
          
          // the next request is made
          that.sendFn = callbacks.add(function (xhr) {
            that.sendFn = callbacks.addErrback(additionalRequestFn);

            assertObject(xhr);
            assertMatch('requests the appropriate file', /multiFile3\.html$/, xhr.url);

            // and when given a good response
            xhr.respond(200, { "Content-Type": "text/plain" }, 'abcd');
            
            // the next request is made
            that.sendFn = callbacks.add(function (xhr) {
              that.sendFn = callbacks.addErrback(additionalRequestFn);

              assertObject(xhr);
              assertMatch('requests the appropriate file', /multiFile1\.html$/, xhr.url);
              
              // when stopped
              watcher.stop();

              // and when given a good response
              xhr.respond(200, { "Content-Type": "text/plain" }, 'abcd');

              // makes no additional requests
              setTimeout(callbacks.add(function () {
                xhr.sendFn = noop;
              }), 2000);
            });
          });
        });
      });
    });
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
  // TODO: Test concurrency count
  // TODO: Test step/next?
  // TODO: Write out tests in BDD format and export as selenium ready test (but make it a modular wrapper layer)
  'test FileWatcher.watch(singleFile)': function (queue) {
    // // A new File Watcher
    // var watcher = new FileWatcher(),
        // that = this,
        // timestamp = +new Date();

    // // set a window variable for later
    // window.fileWatchTimestamp = timestamp;

    // // Create an async callback queue
    // queue.call(function (callbacks) {
      // // Begin watching a single file (after everytihng below is set up)
      // setTimeout(function () {
        // watcher.watch('hello.html');
      // }, 1);

      // // When hello.html is first requested
      // that.sendFn = callbacks.add(function (xhr) {
        // // we prevent further hello.html requests from coming through
        // that.sendFn = noop;

        // // then assert that this is in fact an xhr and is requesting the proper url
        // assertObject('makes an asynchronous request', xhr);
        // assertMatch('makes an asynchronous request to the proper file', /hello\.html$/, xhr.url);

        // // then, we respond with some data (after the following is set up)
        // setTimeout(function () {
          // xhr.respond(200, { "Content-Type": "text/plain" }, 'abcd');
        // }, 1);

        // // When hello.html is requested a second time
        // that.sendFn = callbacks.add(function (xhr) {
          // // make sure that xhr is an object and the proper url is being requested
          // assertObject('makes an asynchronous request', xhr);
          // assertMatch('makes an asynchronous request to the proper file', /hello\.html$/, xhr.url);

          // // Set up the watcher to change the timestamp when a change occurs
          // watcher.addListener(function () {
            // window.fileWatchTimestamp = +new Date();
          // });

          // // then, we respond with a different response than the one from before (thus triggering the fileChanged function)
          // xhr.respond(200, { "Content-Type": "text/plain" }, '1234');

          // // finally, we make sure that the fileChanged event was triggered
          // assertNotSame(timestamp, window.fileWatchTimestamp);
        // });
      // });
    // });
  },
  'tearDown': function () {
    this.fakeXhr.restore();
  }
});