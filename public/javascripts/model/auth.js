define([
  'Publisher', 'GameModel'
], function (
  Publisher, GameModel
) {
  // Singleton AuthModel
  var authModel;

  function AuthModel(data) {
    if (authModel) {
      return authModel;
    }

    authModel = this;

    this._data = {};
    this._checkList = data;
    this.gameModel = new GameModel();
    this.publisher = new Publisher();
  }

  // проверка данных
  AuthModel.prototype.validate = function (data) {
    var name = data.name
      , type = data.type
      , value = data.value;

    if (this._checkList[type].test(value)) {
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

  // обновляет модели с актуальным цветом
  AuthModel.prototype.updateModels = function (type) {
    var models = this.gameModel._data[type]
      , colorA = this._data['colorA']
      , colorB = this._data['colorB']
      , i;

    if (colorA && colorB) {
      for (i in models) {
        if (models.hasOwnProperty(i)) {
          models[i].create(colorA, colorB);
        }
      }
    }
  };

  return AuthModel;
});
