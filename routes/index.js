module.exports = function (app) {
  app.get('/', function (req, res, next) {
    res.render('vimp', {
      title: 'VIMP - game framework'
    });
  });

  app.get('/vimp', function (req, res, next) {
    res.render('vimp', {
      title: 'VIMP game'
    });
  });

  app.get('/tank', function (req, res, next) {
    res.render('tank game', {
      title: 'tank game'
    });
  });

  app.get('/forum', function (req, res, next) {
    res.render('forum', {
      title: 'VIMP forum'
    });
  });
};
