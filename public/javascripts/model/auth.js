define([
  'Publisher',
  'GameModel'
], function (
  Publisher,
  GameModel
) {
  // Singleton AuthModel
  var authModel;

  function AuthModel() {
    if (authModel) {
      return authModel;
    }

    authModel = this;

    this._data = {};
    this._models = {};
    this.publisher = new Publisher();
  }

  // проверка данных
  AuthModel.prototype.validate = function (data) {
    var name = data.name
      , type = data.type
      , value = data.value
      , result;

    result = AuthModel.validate[type](value);

    if (result) {
      this._data[name] = value;
    } else {
      value = this._data[name] || '';
    }

    this.publisher.emit('update', {
      name: name,
      type: type,
      value: value
    });
  };

  // проверка данных по именам
  // Возвращает готовый объект проверенных данных
  // или в случае неудачи
  // массив багов
  AuthModel.prototype.verify = function (names) {
    var i = 0
      , len = names.length
      , data = {}
      , bugs = [];

    for (; i < len; i += 1) {
      if (this._data[names[i]]) {
        data[names[i]] = this._data[names[i]];
      } else {
        bugs.push({
          name: names[i],
          value: this._data[names[i]]
        });
      }
    }

    if (bugs.length) {
      this.publisher.emit('error', bugs);
    } else {
      this.publisher.emit('ready', data);
    }
  };

  // создание моделей игроков
  AuthModel.prototype.createModels = function (data) {
    for (var i in data) {
      if (data.hasOwnProperty(i)) {
        this._models[data[i].model] = new GameModel(
          data[i].model, data[i]
        );
      }
    }

    this.publisher.emit('models', this._models);
  };

  // обновляет модели с актуальным цветом
  AuthModel.prototype.updateModels = function () {
    var colorA = this._data['colorA']
      , colorB = this._data['colorB'];

    if (colorA && colorB) {
      for (var i in this._models) {
        if (this._models.hasOwnProperty(i)) {
          this._models[i].create(colorA, colorB);
        }
      }
    }

    this.publisher.emit('upModels');
  };

  // шаблоны для проверки данных
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
