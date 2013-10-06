define([], function () {
  // Singleton UserModel
  var userModel;

  function UserModel(params) {
    if (userModel) {
      return userModel;
    }

    userModel = this;

    this._keys = params.keys;
    this._cmds = [];
    this._width = params.width;
    this._height = params.height;
  }

  UserModel.prototype = {
    // добавляет команду
    addCmd: function (keyCode) {
      var cmd = this.parseKey(keyCode)
        , index = this._cmds.indexOf(cmd);

      if (!cmd || index !== -1) {
        return;
      }

      this._cmds.push(cmd);
    },
    // удаляет команду
    removeCmd: function (keyCode) {
      var cmd = this.parseKey(keyCode)
        , index = this._cmds.indexOf(cmd);

      if (!cmd || index === -1) {
        return;
      }

      this._cmds.splice(index, 1);
    },
    // обновляет набор клавиша-команда
    updateKeyData: function (keyData) {
      this._keys = keyData;
    },
    // преобразует клавишу в команду
    parseKey: function (keyCode) {
      var keys = this._keys
          // преобразование в строку
        , key = keyCode.toString()
        , i;

      for (i in keys) {
        if (keys.hasOwnProperty(i)) {
          if (i === key) {
            return keys[i];
          }
        }
      }
    },
    // изменяет размер игры
    resize: function (width, height) {
      this._width = width;
      this._height = height;
    }
  };

  return UserModel;
});
