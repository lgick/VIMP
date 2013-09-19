define([
  'Publisher',
  'TankModel',
  'ShipModel'
], function (
  Publisher,
  Tank,
  Ship
) {
  // Модель для строительства объектов
  // на игровом пространстве.
  // Объекты хранятся в переменной gameModel
  // TODO: Доступны как this._data[тип][имя]
  var gameModel;

  // Singleton GameModel
  function GameModel() {
    if (gameModel) {
      return gameModel;
    }

    gameModel = this;

    this._data = {};
    this.publisher = new Publisher();
  }

  // наделяет конструкторы дополнительными методами
  GameModel._add = function (name, object) {
    var addons = GameModel.prototype._addon
      , i;

    for (i in addons) {
      if (addons.hasOwnProperty(i)) {
        object.prototype[i] = addons[i];
      }
    }

    GameModel[name] = object;
  };

  // общие методы, которые наследуют конструкторы
  GameModel.prototype._addon = {
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

  // Factory Method GameModel.factory()
  GameModel.prototype.create = function (name, data) {
    this._data[name] = new GameModel[data.model](data);
    this.publisher.emit('create', this._data[name]);
  };

  // обновляет данные игрока
  GameModel.prototype.update = function (name, data) {
    var p = this._data[name];

    p.x = data.x;
    p.y = data.y;
    p.rotation = data.rotation;
    p.scale = data.scale;
  };

  // удаляет игрока
  GameModel.prototype.remove = function (name) {
    var player = this._data[name];

    delete this._data[name];
    this.publisher.emit('remove', player);
  };

  // удаляет всех игроков всех типов
  GameModel.prototype.clear = function () {
    this._data = {};
    this.publisher.emit('clear');
  };

  GameModel._add('Tank', Tank);  // делает танки
  GameModel._add('Ship', Ship);  // делает корабли

  return GameModel;
});
