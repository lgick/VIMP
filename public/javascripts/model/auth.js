define(['Publisher'], function (Publisher) {
  // Singleton AuthModel
  var authModel;

  function AuthModel() {
    if (authModel) {
      return authModel;
    }

    authModel = this;

    this.publisher = new Publisher();
  }

  AuthModel.prototype = {
    // проверка имени
    validate: function (data) {
      var name = data.name
        , color = data.color;

      if (name && !(/\W/).test(name)) {
        this.publisher.emit('data', {
          name: name,
          color: color
        });
      } else {
        this.publisher.emit('error', {
          error: 'This form not valid'
        });
      }
    }
  };

  return AuthModel;
});
