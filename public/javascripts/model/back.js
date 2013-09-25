define([
  'createjs',
  'Publisher'
], function (
  createjs,
  Publisher
) {
  // Singleton BackModel
  var backModel
    , Shape = createjs.Shape;

  function BackModel() {
    if (backModel) {
      return backModel;
    }

    backModel = this;

    this._data = {};
    this.publisher = new Publisher();
  }

  BackModel.prototype = {
    // создает новый объект
    create: function (data) {
      var name = data.name
        , shape
        , g;

      shape = this._data[name] = new Shape();
      shape.x = 0;
      shape.y = 0;
      shape._stepX = data.stepX;
      shape._stepY = data.stepY;

      g = shape.graphics;
      g.beginBitmapFill(data.image);
      g.drawRect(data.x,
                 data.y,
                 data.width,
                 data.height);

      this.publisher.emit('create', shape);
    },
    // двигает объект по XY
    move: function (name, x, y, scale) {
      var shape = this._data[name];

      shape.x = (shape.x + x * scale) % shape._stepX;
      shape.y = (shape.y + y * scale) % shape._stepY;

      // устранение неточности
      shape.x = +(shape.x).toFixed(10);
      shape.y = +(shape.y).toFixed(10);

      this.publisher.emit('move');
    }
  };

  return BackModel;
});
