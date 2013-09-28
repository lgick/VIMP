define(['Publisher'], function (Publisher) {
  // Singleton AuthModel
  var authModel;

  function AuthModel() {
    if (authModel) {
      return authModel;
    }

    authModel = this;

    this._data = {};

    this.publisher = new Publisher();
  }

  // проверка данных
  AuthModel.prototype.validate = function (data) {
    var type = data.type
      , value = data.value
      , result;

    result = AuthModel.validate[type](value);

    if (result) {
      this._data[type] = value;
    } else {
      value = this._data[type] || '';
    }

    this.publisher.emit('update', {
      type: type,
      value: value
    });
  };

  // проверка по запрашиваемым типам
  // Возвращает готовый объект проверенных данных
  // или в случае неудачи
  // массив багов
  AuthModel.prototype.verify = function (types) {
    var i = 0
      , len = types.length
      , data = {}
      , bugs = [];

    for (; i < len; i += 1) {
      if (this._data[types[i]]) {
        data[types[i]] = this._data[types[i]];
      } else {
        bugs.push({
          type: types[i],
          value: this._data[types[i]]
        });
      }
    }

    if (bugs.length) {
      this.publisher.emit('error', bugs);
    } else {
      this.publisher.emit('ready', data);
    }
  };

  AuthModel.validate = {
    name: function (name) {
      var regExp = /^[a-zA-Z]([\w\s#]{0,13})[\w]{1}$/;
      return regExp.test(name);
    },
    color: function (color) {
      var regExp = /^#(?:[0-9a-fA-F]{3}){1,2}$/;
      return regExp.test(color);
    }
  };

  return AuthModel;
});
