define([
  'BackModel',
  'RadarModel',
  'ShipModel'
], function (
  Back,
  Radar,
  Ship
) {
  // Фабрика для строительства объектов игры
  // создает объект игры указанного типа
  // по заданным параметрам
  function GameModel(type, params) {
    if (typeof GameModel[type] !== 'function') {
      throw {
        name: 'error',
        message: type + ' not valid'
      }
    }

    return new GameModel[type](params);
  }

  // наделяет конструкторы дополнительными методами
  // каждый добавленный конструктор будет их иметь
  GameModel._add = function (name, object) {
    var addons = GameModel.prototype._addons
      , i;

    for (i in addons) {
      if (addons.hasOwnProperty(i)) {
        object.prototype[i] = addons[i];
      }
    }

    GameModel[name] = object;
  };

  // общие методы, которые наследуют конструкторы
  GameModel.prototype._addons = {
    getModel: function () {
      console.log(this.model);
    },
    getColor: function () {
      console.log(this.color);
    }
  };

  // конструкторы
  GameModel._add('Back', Back);
  GameModel._add('Radar', Radar);
  GameModel._add('Ship', Ship);

  return GameModel;
});
