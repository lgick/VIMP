define(['Publisher'], function (Publisher) {
  // Singleton UserModel
  var userModel;

  function UserModel() {
    if (userModel) {
      return userModel;
    }

    userModel = this;

    this.publisher = new Publisher();
  }

  UserModel.prototype = {
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

  return UserModel;
});
