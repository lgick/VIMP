define([
  'createjs',
  'Publisher'
], function (
  createjs,
  Publisher
) {
  // Singleton RadarModel
  var Shape = createjs.Shape
    , radarModel
    , p;

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
    create: function (name, data) {
      var player
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
      g.moveTo(0, 14);
      g.lineTo(5, 0);
      g.lineTo(0, 2);
      g.lineTo(-5, 0);
      g.closePath();

      this.publisher.emit('create', player);
    },
    // изменяет данные объекта
    update: function (name, data) {
      var p = this._data[name];

      p.x = data.x;
      p.y = data.y;
      p.rotation = data.rotation;
      p.scale = data.scale;
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
