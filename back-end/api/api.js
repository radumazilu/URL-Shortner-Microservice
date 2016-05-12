'use strict'
module.exports = function(app, db) {

  app.get('/:url', function(req, res) {
    var fullUrl = req.protocol + '://' + req.get('host');
    var url = fullUrl + '/' + req.params.url;
    if(url) findUrl(url, db, res);
  })

  app.get('/add/:url*', function(req, res) {
    var fullUrl = req.protocol + '://' + req.get('host');
    var url = req.url.slice(5);
    console.log(req.params.url)
    var urlInfo = {};
    if(validateURL(url)) {
      urlInfo = {
        'original_url': url,
        'short_url': fullUrl + '/' + linkNumber()
      };
      res.send(urlInfo);
      addUrl(urlInfo, db);
    }
    else {
      urlInfo = {
        "error": "Wrong url format, make sure you have a valid protocol and real site."
      };
      res.send(urlInfo);
    }
  });

  function linkNumber() {
    // Generate random link numbers
    var num = Math.floor(100000 + Math.random() * 900000);
    return num.toString().substring(0, 4);
  }

  function addUrl(newUrl, db) {
    // Add a new field into the database
    var sites = db.collection('sites');
    console.log('Adding site...')
    sites.save(newUrl, (err, result) => {
      if(err) throw err;
      console.log('Saved ' + result);
    })
  }

  function findUrl(link, db, res) {
    var sites = db.collection('sites');
    console.log('Searching site...')
    // See if the Url exists
    sites.findOne({
      "short_url": link
    }, function(err, result) {
      if(err) throw err;
      if(result) {
        console.log('Found ' + result);
        console.log('Redirecting to: ' + result.original_url);
        res.redirect(result.original_url);
      }
      else {
        res.send({
          "error": "This url is not on the database."
        });
      }
    });
  }

  function validateURL(url) {
    // Checks to see if it is an actual url
    // Regex from https://gist.github.com/dperini/729294
    var regex = /^(?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,}))\.?)(?::\d{2,5})?(?:[/?#]\S*)?$/i;
    return regex.test(url);
  }

}
