define(['Publisher'], function (Publisher) {
  // Singleton UserModel
  var userModel;

  function UserModel(params) {
    if (userModel) {
      return userModel;
    }

    userModel = this;

    this._params = params;
    this.data = new Publisher();
  }

  UserModel.prototype = {
    // добавление данных
    addData: function (data) {
      var name = data.name
        , color = data.color;

      if (name && color) {
        this.publishData(data);
      } else {
        this.publishError('Error this form');
      }
    },
    // рассылка: параметры
    publishData: function (data) {
      this.data.emit('data', data);
    },
    // рассылка: ошибка
    publishError: function (error) {
      this.data.emit('error', error);
    }
  };

  return UserModel;
});
