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

    this._vPublic.on('auth', 'validate', authCtrl);
  }

  AuthCtrl.prototype = {
    // читает форму
    validate: function (data) {
      this._model.validate(data);
    }
  };

  return AuthCtrl;
});
