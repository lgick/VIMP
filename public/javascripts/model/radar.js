define([
  'createjs',
  'Publisher'
], function (
  createjs,
  Publisher
) {
  // Singleton RadarModel
  var radarModel
    , Shape = createjs.Shape;

  function RadarModel() {
    if (radarModel) {
      return radarModel;
    }

    radarModel = this;

    this._data = {};
    this.publisher = new Publisher();
  }

  RadarModel.prototype = {
    // создает новый объект
    create: function (data) {
      var name = data.name
        , player
        , g;

      player = this._data[name] = new Shape();
      player.x = data.x;
      player.y = data.y;
      player.rotation = data.rotation;
      player.scaleX = 20;
      player.scaleY = 20;

      g = player.graphics;

      g.beginStroke('#333333');
      g.beginFill(data.color);
      g.moveTo(0, 7);
      g.lineTo(5, -7);
      g.lineTo(0, -5);
      g.lineTo(-5, -7);
      g.closePath();

      this.publisher.emit('create', player);
    },
    // изменяет данные объектов
    update: function (data) {
      var p = this._data[data.name];

      p.x = data.x;
      p.y = data.y;
      p.rotation = data.rotation;
    },
    // удаляет объект
    remove: function (name) {
      var player = this._data[name];

      delete this._data[name];
      this.publisher.emit('remove', player);
    },
    // очищает радар
    clear: function () {
      this._data = {};
      this.publisher.emit('clear');
    }
  };

  return RadarModel;
});
