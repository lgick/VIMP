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

    this._data = data.data;
    this._listExp = data.listExp;
    this._colorType = data.colorType;
    this._socket = data.socket;

    this.gameModel = new GameModel();

    this.publisher = new Publisher();
  }

  // возвращает данные по ключу или полностью
  AuthModel.prototype.getData = function (key) {
    if (key) {
      return this._data[key];
    } else {
      return this._data;
    }
  };

  // возвращает текущий тип цвета
  AuthModel.prototype.getCType = function () {
    return this._colorType;
  };

  // переключение типа цвета
  AuthModel.prototype.switchCType = function (data) {
    var name = data.name
      , value = data.value;

    this._colorType = value;

    this.publisher.emit('form', {
      name: name,
      value: value
    });
  };

  // обновление данных
  // если value невалиден, возвращается текущий value
  AuthModel.prototype.update = function (key, data) {
    var name = data.name
      , value = data.value;

    // если значение по заданному типу соответствует
    if (this._listExp[key].test(value)) {
      this._data[key] = value;
    } else {
      value = this._data[key] || '';
    }

    this.publisher.emit('form', {
      name: name,
      value: value
    });
  };

  // создание визуализации модели
  AuthModel.prototype.createPreview = function (data) {
    var t = data.type
      , n = data.name
      , c = data.constructor
      , d = data.data;

    this.gameModel.remove();
    this.gameModel.create(t, n, c, d);
    this.publisher.emit('preview');
  };

  // валидация всех данных и отправка данных на сервер
  // в случае неудачи возвращает массив багов
  AuthModel.prototype.send = function () {
    var data = this._data
      , bugs = []
      , p;

    for (p in data) {
      if (data.hasOwnProperty(p)) {
        if (!this._listExp[p].test(data[p])) {
          bugs.push({name: p, value: data[p]});
        }
      }
    }

    if (bugs.length) {
      this.publisher.emit('error', bugs);
    } else {
      this._socket.emit('auth', data);
      this.publisher.emit('ok');
    }
  };

  return AuthModel;
});
