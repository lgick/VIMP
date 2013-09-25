define([
  'Publisher',
  'ShipModel'
], function (
  Publisher,
  Ship
) {
  // Фабрика для строительства объектов игры
  // Объекты хранятся в переменной GameModel._data
  // TODO:
  // Сейчас данные имеют вид:
  // this._data[имя экземпляра]
  // Лучше строить с учетом названия конструктора:
  // this._data[название конструктора][имя экземпляра]
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
    },
    getName: function () {
      console.log(this.name);
    }
  };

  // Factory Method GameModel.create()
  GameModel.prototype.create = function (data) {
    var name = data.name
      , model = data.model;

    this._data[name] = new GameModel[model](data);
    this.publisher.emit('create', this._data[name]);
  };

  // обновляет данные игрока
  // с помощью метода update конструктора
  // (этот метод отвечает за функционал
  // данного конструктора)
  GameModel.prototype.update = function (data) {
    var name = data.name
      , model = data.model;

    GameModel[model].update(this._data[name], data);
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

  // конструкторы
  GameModel._add('Ship', Ship);

  return GameModel;
});
