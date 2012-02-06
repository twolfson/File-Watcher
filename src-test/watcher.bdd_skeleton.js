// First batch
var batches = [
{
  'A FileWatcher': {
    topic: function () {
      return new FileWatcher();
    },
    'is an object': function () {},
    'that tracks a single file': {
      topic: function (watcher) {
        watcher.add('singleFile.html');
        return watcher;
      },
      'when it begins monitoring': {
        topic: function (watcher) {
          watcher.start();
          return watcher;
        },
        'makes requests for the appropriate file': function () {
          // TODO: Check singleFile.html
        },
        'and when it is stopped': {
          topic: function (watcher) {
            watcher.stop();
            return watcher;
          },
          'makes no additional requests': function () {
            // TODO: Set up to fail
            // TODO: Set 2s timeout to stop failing and pass
          }
        }
      }
    }
  }
},

// Second batch
{
  'A FileWatcher' {
    topic: function () {
      return new FileWatcher();
    },
    'that watches a single file': {
      'automatically monitors': function () {},
      'and when stopped': {
        'makes no further requests': function () {
        
        }
      }
    }
  }
},

// Third batch
{
  'A FileWatcher': {
    'can watch an array of files': {
      'and when stopped': {
        'makes no further requests': function () {
        
        }
      }
    }
  }
},

// Fourth batch
{
  'A FileWatcher': {
    'watching a single file': {
      'with an event listener': {
        'is triggered when there is a file change': {
        
        }
      }
    }
  }
}];