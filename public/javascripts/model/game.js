define([
  'Publisher',
  'Factory'
], function (
  Publisher,
  Factory
) {
  // Singleton gameModel
  // содержит данные игры.
  // CRUD-функционал (create, read, update, delete):
  // создает новые объекты игры (create),
  // возвращает объект (read),
  // обновляет объекты игры (update),
  // удаляет объекты игры (remove, clear)
  var gameModel;

  // создание модели с заданными данными
  // аргумент dataTypes имеет вид
  // dataTypes = {
  //   player: {},
  //   radar: {},
  //   bullet: {},
  //   back: {}
  // }
  function GameModel(dataTypes) {
    if (gameModel) {
      return gameModel;
    }

    gameModel = this;

    this._data = dataTypes;

    this.publisher = new Publisher();
  }

  // создает новый объект
  // по данным:
  //
  // dataType: тип которому соответствует объект
  // (например тип пули или тип радар или тип player)
  // name: имя игрока
  //
  // (например получить модель машинки игрока у
  // пользователя с именем 'Bob' можно так:
  // this._data['player']['Bob'];
  // его пули можно будет получить так:
  // this._data['bullet']['Bob'];
  // его модель на радаре:
  // this._data['radar']['Bob'];
  // )
  GameModel.prototype.create = function (
    dataType, name, type, params
  ) {
    this._data[dataType][name] = Factory(type, params);

    this.publisher.emit('create', {
      type: dataType,
      instance: this._data[dataType][name]
    });
  };

  // возвращает данные по аргументам:
  // - данные конкретного типа и имени
  // - данные конкетного типа
  // - все данные
  GameModel.prototype.read = function (dataType, name) {
    if (dataType && name) {
      return this._data[dataType][name];
    } else if (dataType) {
      return this._data[dataType];
    } else {
      return this._data;
    }
  };

  // обновляет данные
  GameModel.prototype.update = function (
    dataType, name, data
  ) {
    this._data[dataType][name].update(data);
  };

  // удаляет данные по dataType и name
  // TODO: пока не используется
  GameModel.prototype.remove = function (
    dataType, name
  ) {
    delete this._data[dataType][name];

    this.publisher.emit('remove', {
      type: dataType,
      instance: this._data[dataType][name]
    });
  };

  // полностью очищает объект от данных
  // защищая от переполнения
  // В качестве аргумента массив с типами
  GameModel.prototype.clear = function (dataTypes) {
    var i = 0
      , len = dataTypes.length;

    for (; i < len; i += 1) {
      this._data[dataTypes[i]] = {};

      this.publisher.emit('clear', dataTypes[i]);
    }
  };

  return GameModel;
});
