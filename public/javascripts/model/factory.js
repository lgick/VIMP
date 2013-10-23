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
  function Factory(type, params) {
    if (typeof Factory[type] !== 'function') {
      return;
    }

    return new Factory[type](params);
  }

  // наделяет конструкторы дополнительными методами
  // каждый добавленный конструктор будет их иметь
  Factory._add = function (name, object) {
    var addons = Factory.prototype._addons
      , i;

    for (i in addons) {
      if (addons.hasOwnProperty(i)) {
        object.prototype[i] = addons[i];
      }
    }

    Factory[name] = object;
  };

  // общие методы, которые наследуют конструкторы
  Factory.prototype._addons = {
    getModel: function () {
      console.log(this.model);
    },
    getColor: function () {
      console.log(this.color);
    }
  };

  // конструкторы
  Factory._add('Back', Back);
  Factory._add('Radar', Radar);
  Factory._add('Ship', Ship);

  return Factory;
});
