define([], function () {
  // Singleton GameCtrl
  // является посредником (pattern Mediator) между
  // GameView (представлениями игры) и GameModel
  // (моделью игры)
  //
  // GameCtrl хранит ссылки на все представления
  // игры с которыми взаимодействует модель игры
  // (GameModel). Эти представления доступны так:
  // this._view['название объекта']
  //
  // GameCtrl подписан на события из модели GameModel
  // и в зависимости от типа события и контекта
  // передает их в соответствующее представление
  // (то есть осуществляет маршрутизацию между
  // GameModel и всеми представлениями игры)
  //
  // Например: модель обновляет данных
  // для представления radar. GameCtrl определяет для
  // какой view обновили данные и обновляет их,
  // используя нужный объект (в данном случае radar)
  var gameCtrl;

  function GameCtrl(gameModel, views) {
    if (gameCtrl) {
      return gameCtrl;
    }

    gameCtrl = this;

    this._gameModel = gameModel;
    this._view = views;

    // подписка на события модели
    this._mPublic = this._gameModel.publisher;

    this._mPublic.on('create', 'create', gameCtrl);
    this._mPublic.on('update', 'update', gameCtrl);
    this._mPublic.on('remove', 'remove', gameCtrl);
    this._mPublic.on('clear', 'clear', gameCtrl);
  }

  // создает экземпляр на полученном представлении
  GameCtrl.prototype.create = function (data) {
    var type = GameCtrl.parseType(data.type)
      , instance = data.instance;

    this._view[type].add(instance);
  };

  // обновляет представление
  GameCtrl.prototype.update = function (type, data) {
    // если требуется вычислить объект относительно
    // которого будет отрисовано представление
    if (data) {
      var coords = GameCtrl.getUserCoords(data);
      this._view[type].update(coords);
    // иначе, просто обновляем
    } else {
      this._view[type].update();
    }
  };

  // удаляет экземпляр из полученного представления
  // TODO: пока не используется
  GameCtrl.prototype.remove = function (data) {
    var type = GameCtrl.parseType(data.type)
      , instance = data.instance;

    this._view[type].remove(instance);
    this.update(type);
  };

  // очищает представление
  GameCtrl.prototype.clear = function (type) {
    var type = GameCtrl.parseType(type);

    this._view[type].clear();
  };

  // преобразует тип из модели в тип представления
  GameCtrl.parseType = function (dataType) {
    switch (dataType) {
      case 'player':
      case 'bullet':
        return 'vimp';
      case 'radar':
        return 'radar';
      case 'back':
        return 'back';
    }
  };

  // возвращает координаты для отображения
  // пользователя в центре игры (нужно для view)
  GameCtrl.getUserCoords = function (data) {
    var user = data.user
      , ratio = data.ratio || 1
      , width = data.width
      , height = data.height
      , coords = {};

    coords.scale = +(user.scale / ratio).toFixed(10);
    coords.x = -(user.x * coords.scale - width / 2);
    coords.y = -(user.y * coords.scale - height / 2);

    // устранение неточности
    coords.x = +(coords.x).toFixed(10);
    coords.y = +(coords.y).toFixed(10);

    return coords;
  };

  return GameCtrl;
});
