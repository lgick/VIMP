define(['createjs'], function (createjs) {
  var Container = createjs.Container
    , Shape = createjs.Shape
    , p;

  function Ship(params) {
    if (typeof params === 'object') {
      this.initialize(params);
    }
  }

  p = Ship.prototype = new Container();
  p.Container_initialize = p.initialize;

  // инициализация
  p.initialize = function (params) {
    this.Container_initialize();

    this.body = new Shape();
    this.flame = new Shape();

    this.addChild(this.body);
    this.addChild(this.flame);

    this.name = params.name || 'Bot';
    this.color = params.color || '#ffffff';
    this.scale = params.scale || 100;
    this.model = params.model || 'tank';
    this.score = params.score || 10000;
    this.status = params.status || 'alive';
    this.x = params.x || 0;
    this.y = params.y || 0;
    this.rotation = params.rotation || 0;

    this.makeBody();
    this.makeFlame();
  };

  // создание тела
  p.makeBody = function () {
    var g = this.body.graphics
      , color = this.color;

    g.clear();

    g.setStrokeStyle(1);
    g.beginStroke('#cccccc');
    g.beginFill(color);
    g.moveTo(0, 20);
    g.lineTo(6, 6);
    g.lineTo(10, 6);
    g.lineTo(10, 1);
    g.lineTo(12, -8);
    g.lineTo(0, -2);
    g.lineTo(-12, -8);
    g.lineTo(-10, 1);
    g.lineTo(-10, 6);
    g.lineTo(-6, 6);
    g.closePath();
    // кабина пилота
    g.beginStroke('#333333');
    g.beginFill('#cccccc');
    g.moveTo(0, 14);
    g.lineTo(5, 0);
    g.lineTo(0, 2);
    g.lineTo(-5, 0);
    g.closePath();
    // левое крыло
    g.setStrokeStyle(1);
    g.beginStroke('#cccccc');
    g.beginFill(color);
    g.moveTo(-10, 6);
    g.lineTo(-18, 0);
    g.lineTo(-16, -8);
    g.lineTo(-12, -8);
    g.lineTo(-10, 1);
    g.closePath();
    // правое крыло
    g.setStrokeStyle(1);
    g.beginStroke('#cccccc');
    g.beginFill(color);
    g.moveTo(10, 6);
    g.lineTo(18, 0);
    g.lineTo(16, -8);
    g.lineTo(12, -8);
    g.lineTo(10, 1);
    g.closePath();
  };

  // создание турбины
  p.makeFlame = function (fire) {
    var g = this.flame.graphics;

    g.clear();

    if (fire) {
      g.setStrokeStyle(1);
      g.beginStroke('blue');
      g.beginFill('orange');
      g.moveTo(-6, -6);
      g.lineTo(-4, -8);
      g.lineTo(-2, -6);
      g.lineTo(0, -12);
      g.lineTo(2, -6);
      g.lineTo(4, -8);
      g.lineTo(6, -6);
      g.lineTo(0, -2);
      g.closePath();
    } else {
      g.setStrokeStyle(1);
      g.beginStroke('#444444');
      g.beginFill('#440000');
      g.moveTo(-6, -6);
      g.lineTo(-4, -8);
      g.lineTo(-2, -6);
      g.lineTo(0, -8);
      g.lineTo(2, -6);
      g.lineTo(4, -8);
      g.lineTo(6, -6);
      g.lineTo(0, -2);
      g.closePath();
    }
  };

  return Ship;
});
