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

    this._vPublic.on('change', 'updateData', authCtrl);
    this._vPublic.on('focus', 'switchInput', authCtrl);
    this._vPublic.on('ready', 'verifyData', authCtrl);
  }

  AuthCtrl.prototype = {
    // обновление данных
    updateData: function (data) {
      var prop;

      for (prop in data) {
        if (data.hasOwnProperty(prop)) {
          this._model.validate({
            type: prop,
            value: data[prop]
          });
        }
      }
    },
    // переключение на пользовательски ввод
    switchInput: function (data) {
      if (data['color']) {
        this._view.switchInput(data['color']);
        this.updateData(data);
      }
    },
    // верификация данных
    verifyData: function (types) {
      this._model.verify(types);
    }
  };

  return AuthCtrl;
});
