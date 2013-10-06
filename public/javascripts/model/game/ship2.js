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
    this.colorA = params.colorA || '#ffffff';
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
      , colorA = this.colorA;

    g.clear();

    // тело
    g.setStrokeStyle(1);
    g.beginStroke('#cccccc');
    g.beginFill(colorA);
    g.moveTo(-2, 11);
    g.lineTo(-12, 1);
    g.lineTo(-16, -3);
    g.lineTo(-16, -11);
    g.lineTo(-10, -10);
    g.lineTo(-4, -11);
    g.lineTo(4, -11);
    g.lineTo(10, -10);
    g.lineTo(16, -11);
    g.lineTo(16, -3);
    g.lineTo(12, 1);
    g.lineTo(2, 11);
    g.bezierCurveTo(2, 11, 0, 13, -2, 11);
    g.closePath();
    // кабина пилота
    g.beginStroke('#333333');
    g.beginFill('#cccccc');
    g.moveTo(0, 7);
    g.lineTo(5, -7);
    g.lineTo(0, -5);
    g.lineTo(-5, -7);
    g.closePath();
  };

  // создание турбины
  p.makeFlame = function (fire) {
    var g = this.flame.graphics;


    if (fire) {
      getFire();
    } else {
      notFire();
    }

    function notFire() {
      g.clear();

      g.setStrokeStyle(1);
      g.beginStroke('#444444');
      g.beginFill('#440000');
      g.bezierCurveTo(13, -12, 10, -16, 7, -12);
      g.closePath();

      g.setStrokeStyle(1);
      g.beginStroke('#444444');
      g.beginFill('#440000');
      g.bezierCurveTo(-13, -12, -10, -16, -7, -12);
      g.closePath();
    }

    function getFire() {
      g.clear();

      g.setStrokeStyle(1);
      g.beginStroke('blue');
      g.beginFill('orange');
      g.bezierCurveTo(12, -13, 10, -19, 8, -13);
      g.closePath();

      g.setStrokeStyle(1);
      g.beginStroke('blue');
      g.beginFill('orange');
      g.bezierCurveTo(-12, -13, -10, -19, -8, -13);
      g.closePath();

      setInterval(notFire, 300);
    }

  };

  return Ship;
});

