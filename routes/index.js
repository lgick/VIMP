exports.index = function (req, res) {
  res.render('vimp', {
    baseURL: '/',
    jsURL: '/javascripts/',
    cssURL: '/stylesheets/',
    title: 'VIMP'
  });
};
