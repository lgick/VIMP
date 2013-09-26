define([], function () {
  // Singleton UserCtrl
  var userCtrl;

  function UserCtrl(model, view) {
    if (userCtrl) {
      return userCtrl;
    }

    userCtrl = this;

    this._model = model;
    this._view = view;
    this._vPublic = view.publisher;

    this._vPublic.on('auth', 'validate', userCtrl);
  }

  UserCtrl.prototype = {
    // читает форму
    validate: function (data) {
      this._model.validate(data);
    }
  };

  return UserCtrl;
});
