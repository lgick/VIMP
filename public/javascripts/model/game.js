define([
  'TankModel',
  'ShipModel'
], function (
  Tank,
  Ship
) {
  // Factory GameModel
  function GameModel(type, params) {
    if (typeof GameModel[type] !== 'function') {
      return;
    }

    // новый экземпляр
    var instance = new GameModel[type](params);

    return instance;
  }

  // метод для добавления новых продуктов к фабрике
  GameModel.add = function (name, object) {
    var props = GameModel.prototype
      , i;

    for (i in props) {
      if (props.hasOwnProperty(i)) {
        object.prototype[i] = props[i];
      }
    }

    GameModel[name] = object;
  };

  // общие методы, которые наследуются всегда
  GameModel.prototype = {
    getModel: function () {
      console.log(this.model);
    },
    getColor: function () {
      console.log(this.color);
    },
    getName: function () {
      console.log(this.name);
    }
  };

  GameModel.add('Tank', Tank);  // делает танки
  GameModel.add('Ship', Ship);  // делает корабли

  return GameModel;
});
