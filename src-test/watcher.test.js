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
          }), 1050);
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
          }), 1050);
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
              }), 1050);
            });
          });
        });
      });
    });
  },
  'test A FileWatcher "watch"ing a single file with an event listener': function (queue) {
    var watcher = new FileWatcher(),
        timestamp = +new Date();
    window.fileWatchTimestamp = timestamp;

    // Set up event listener
    watcher.addListener(function () {
      window.fileWatchTimestamp = +new Date();
    });

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

          // Stop watcher for good measure
          watcher.stop();

          // and when given a different response
          xhr.respond(200, { "Content-Type": "text/plain" }, '1234');

          // the event handler is triggered
          assertNotSame(timestamp, window.fileWatchTimestamp);
        });
      });
    });
  },
  // TODO: Test concurrency count
  // TODO: Test step/next?
  // TODO: Write out tests in BDD format and export as selenium ready test (but make it a modular wrapper layer)
  'tearDown': function () {
    this.fakeXhr.restore();
  }
});