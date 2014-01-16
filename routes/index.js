exports.index = function (req, res){
  res.render('index', {
    baseURL: '/',
    jsURL: '/javascripts/',
    cssURL: '/stylesheets/',
    title: 'VIMP'
  });
};
