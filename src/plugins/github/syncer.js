/*\
title: $:/plugins/ustuehler/github/syncer.js
type: application/javascript
module-type: utils

Story view that cooperates with the Muuri grid layout engine

\*/
(function () {
  /* global $tw */

  var syncEnabled = false
  var syncQueue = new Set()

  exports.getGitHubPagesSync = function () {
    return syncEnabled
  }

  exports.setGitHubPagesSync = function (enabled) {
    if (enabled) {
      if (!syncEnabled) {
        $tw.wiki.addEventListener('change', handleChanges)
      }
    } else {
      if (syncEnabled) {
        $tw.wiki.removeEventListener('change', handleChanges)
      }
    }
  }

  function handleChanges (changes) {
    var changedTiddlers = []
    $tw.utils.each(changes, function (change, title) {
      changedTiddlers.push(title)
    })

    var syncFilter = $tw.wiki.getTiddlerText('$:/config/SyncFilter')
    var pagesFilter = $tw.wiki.getTiddlerText('$:/config/GitHubPages/SyncFilter')

    var input = $tw.utils.stringifyList(changedTiddlers)
    var output = $tw.wiki.filterTiddlers(input + ' +' + syncFilter + ' ' + pagesFilter)

    if (output.length < 1) {
      console.debug('GitHub Pages sync ignored changes in:')
      console.debug(changedTiddlers)
      return
    }

    console.debug('GitHub Pages sync noticed changes in:')
    console.debug(changedTiddlers)

    // Merge the new tiddlers into the existing queue
    output.forEach(function (title) { syncQueue.add(title) })

    // Update the temporary tiddler to let the user know
    var queue = $tw.utils.stringifyList(Array.from(syncQueue))
    $tw.wiki.setText('$:/status/GitHubPages/SyncQueue', 'list', undefined, queue)

    console.debug('The GitHub Pages sync queue is now: ' + queue)
  }

  // Enable background sync by default. Runs as long as required settings are
  // present.
  setTimeout(function () {
    console.log('Starting background sync with GitHub Pages')
    exports.setGitHubPagesSync(true)
  }, 1000)
})()
