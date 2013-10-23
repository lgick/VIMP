define(['Publisher'], function (Publisher) {
  // Singleton UserModel
  var userModel;

  function UserModel() {
    if (userModel) {
      return userModel;
    }

    userModel = this;

    this._cmds = [];
    this._keys = null;

    this.publisher = new Publisher();
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

      this.publisher.emit('cmds', this._cmds);
    },
    // удаляет команду
    removeCmd: function (keyCode) {
      var cmd = this.parseKey(keyCode)
        , index = this._cmds.indexOf(cmd);

      if (!cmd || index === -1) {
        return;
      }

      this._cmds.splice(index, 1);

      this.publisher.emit('cmds', this._cmds);
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
    // обновляет набор клавиша-команда
    updateKeys: function (keyData) {
      this._keys = keyData;
    },
    // размеры игры
    resize: function (data) {
      this.publisher.emit('resize', data);
    }
  };

  return UserModel;
});
