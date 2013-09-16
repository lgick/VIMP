exports.index = function(req, res){
  res.render('index', {
    baseURL: '/vimp/',
    jsURL: '/vimp/javascripts/',
    cssURL: '/vimp/stylesheets/',
    title: 'VIMP'
  });
};
