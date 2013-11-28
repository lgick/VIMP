define([], function () {
  // Singleton AuthCtrl
  var authCtrl;

  function AuthCtrl(model, view) {
    if (authCtrl) {
      return authCtrl;
    }

    authCtrl = this;

    this._model = model;
    this._view = view;
    this._vPublic = view.publisher;

    this._vPublic.on('change', 'updateForm', authCtrl);
    this._vPublic.on('focus', 'switchInput', authCtrl);
    this._vPublic.on('type', 'switchType', authCtrl);
    this._vPublic.on('color', 'updateModels', authCtrl)
    this._vPublic.on('ready', 'verifyData', authCtrl);
  }

  // обновление данных
  AuthCtrl.prototype.updateForm = function (data) {
    this._model.validate(data);
  };

  // переключение на пользовательски ввод
  AuthCtrl.prototype.switchInput = function (data) {
    if (data.type === 'color') {
      this._view.switchInput(data.value);
      this.updateForm(data);
    }
  };

  // переключения значение типа (для цвета)
  AuthCtrl.prototype.switchType = function (data) {
    this._view.switchType(data.name);
    // отправка на валидацию с пустым value
    // чтобы модель вернула текущее значение в view
    this.updateForm(data);
  };

  // преобразует исходные данные для валидации
  AuthCtrl.prototype.parseData = function (data) {
    var i = 0
      , len = data.length;

    for (; i < len; i += 1) {
      this._model.validate(data[i]);
    }
  };

  // преобразует данные для создания модели
  AuthCtrl.prototype.parseModels = function (data) {
    var gameModel = this._model.gameModel
      , p;

    for (p in data) {
      if (data.hasOwnProperty(p)) {
        if (gameModel.read('models', p)) {
          gameModel.update('models', p, data[p]);
        } else {
          gameModel.create(
            'models',
            p,
            data[p]['constructor'],
            data[p]
          );
        }
      }
    }

    this._view.gameView.update();
  };

  // обновление моделей
  AuthCtrl.prototype.updateModels = function () {
    this._model.updateModels('models');
    this._view.gameView.update();
  };

  // верификация данных
  AuthCtrl.prototype.verifyData = function (names) {
    this._model.verify(names);
  };

  return AuthCtrl;
});
