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

  AuthCtrl.prototype = {
    // обновление данных
    updateForm: function (data) {
      this._model.validate(data);
    },
    // переключение на пользовательски ввод
    switchInput: function (data) {
      if (data.type === 'color') {
        this._view.switchInput(data.value);
        this.updateForm(data);
      }
    },
    // переключения значение типа (для цвета)
    switchType: function (data) {
      this._view.switchType(data.name);
      // отправка на валидацию с пустым value
      // чтобы модель вернула текущее значение в view
      this.updateForm(data);
    },
    // обновление моделей
    updateModels: function () {
      this._model.updateModels();
    },
    // верификация данных
    verifyData: function (names) {
      this._model.verify(names);
    }
  };

  return AuthCtrl;
});
