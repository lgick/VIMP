define([], function () {
  // Singleton GameCtrl
  var gameCtrl;

  function GameCtrl(view, keys) {
    if (gameCtrl) {
      return gameCtrl;
    }

    gameCtrl = this;

    this.cmds = [];
    this._view = view;
    this._keys = keys;

    this._view.key.on('down', 'add', gameCtrl);
    this._view.key.on('up', 'remove', gameCtrl);
  }

  GameCtrl.prototype = {
    // добавляет команду
    add: function (keyCode) {
      var cmd = this.parseKey(keyCode)
        , index = this.cmds.indexOf(cmd);

      if (!cmd || index !== -1) {
        return;
      }

      this.cmds.push(cmd);
    },
    // удаляет команду
    remove: function (keyCode) {
      var cmd = this.parseKey(keyCode)
        , index = this.cmds.indexOf(cmd);

      if (!cmd || index === -1) {
        return;
      }

      this.cmds.splice(index, 1);
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
    }
  };

  return GameCtrl;
});
