define(['createjs'], function (createjs) {
  var Shape = createjs.Shape
    , p;

  function Back(params) {
    if (typeof params === 'object') {
      this.initialize(params);
    }
  }

  p = Back.prototype = new Shape();
  p.Shape_initialize = p.initialize;

  // инициализация
  p.initialize = function (params) {
    this.Shape_initialize();

    // величина шага
    this._stepX = params.stepX;
    this._stepY = params.stepY;

    this.x = -this._stepX;
    this.y = -this._stepY;

    this.create(params);
  };

  // создание фона
  p.create = function (params) {
    var g = this.graphics;

    g.beginBitmapFill(params.image);
    g.drawRect(
      params.x, params.y, params.width, params.height
    );
  };

  // обновляет координаты
  p.update = function (data) {
    var x = data.x
      , y = data.y
      , s = data.scale;

    this.x = (this.x + x * s) % this._stepX;
    this.y = (this.y + y * s) % this._stepY;

    // устранение неточности
    this.x = +(this.x).toFixed(10);
    this.y = +(this.y).toFixed(10);
  };

  return Back;
});
