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

    this._vPublic.on('keyDown', 'add', userCtrl);
    this._vPublic.on('keyUp', 'remove', userCtrl);
    this._vPublic.on('resize', 'resize', userCtrl);
  }

  UserCtrl.prototype = {
    // добавляет команду
    add: function (keyCode) {
      this._model.addCmd(keyCode);
    },
    // удаляет команду
    remove: function (keyCode) {
      this._model.removeCmd(keyCode);
    },
    // обновляет клавиши ввода
    updateKeys: function (keyData) {
      this._model.updateKeyData(keyData);
    },
    // обновляет размеры
    resize: function (data) {
      this._model.resize(data.width, data.height);
    }
  };

  return UserCtrl;
});
