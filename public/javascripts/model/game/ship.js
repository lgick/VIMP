define(['createjs'], function (createjs) {
  var Container = createjs.Container
    , Shape = createjs.Shape
    , p;

  function Ship(params) {
    if (typeof params === 'object') {
      this.initialize(params);
    }
  }

  // обновляет функционал экземпляра
  Ship.update = function (player, data) {
    player.x = data.x;
    player.y = data.y;
    player.rotation = data.rotation;
    player.scale = data.scale;

    if (data.flame) {
      player.makeFlameOn();
    } else {
      player.makeFlameOff();
    }

    return player;
  };

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
    this.makeFlameOff();
  };

  // создание тела
  p.makeBody = function () {
    var g = this.body.graphics
      , color = this.color;

    g.clear();

    g.setStrokeStyle(1);
    g.beginStroke('#cccccc');
    g.beginFill(color);
    g.moveTo(0, 13);
    g.lineTo(6, -1);
    g.lineTo(10, -2);
    g.lineTo(10, -6);
    g.lineTo(12, -15);
    g.lineTo(0, -9);
    g.lineTo(-12, -15);
    g.lineTo(-10, -6);
    g.lineTo(-10, -2);
    g.lineTo(-6, -1);
    g.closePath();
    // кабина пилота
    g.beginStroke('#333333');
    g.beginFill('#cccccc');
    g.moveTo(0, 7);
    g.lineTo(5, -7);
    g.lineTo(0, -5);
    g.lineTo(-5, -7);
    g.closePath();
    // левое крыло
    g.setStrokeStyle(1);
    g.beginStroke('#cccccc');
    g.beginFill(color);
    g.moveTo(-10, -2);
    g.lineTo(-18, -7);
    g.lineTo(-16, -15);
    g.lineTo(-12, -15);
    g.lineTo(-10, -6);
    g.closePath();
    // правое крыло
    g.setStrokeStyle(1);
    g.beginStroke('#cccccc');
    g.beginFill(color);
    g.moveTo(10, -2);
    g.lineTo(18, -7);
    g.lineTo(16, -15);
    g.lineTo(12, -15);
    g.lineTo(10, -6);
    g.closePath();
  };

  p.makeFlameOn = function () {
    var g = this.flame.graphics;

    g.clear();

    g.setStrokeStyle(1);
    g.beginStroke('blue');
    g.beginFill('orange');
    g.moveTo(-6, -13);
    g.lineTo(-4, -15);
    g.lineTo(-2, -13);
    g.lineTo(0, -19);
    g.lineTo(2, -13);
    g.lineTo(4, -15);
    g.lineTo(6, -13);
    g.lineTo(0, -9);
    g.closePath();
  };

  p.makeFlameOff = function () {
    var g = this.flame.graphics;

    g.clear();

    g.setStrokeStyle(1);
    g.beginStroke('#444444');
    g.beginFill('#440000');
    g.moveTo(-6, -13);
    g.lineTo(-4, -15);
    g.lineTo(-2, -13);
    g.lineTo(0, -15);
    g.lineTo(2, -13);
    g.lineTo(4, -15);
    g.lineTo(6, -13);
    g.lineTo(0, -9);
    g.closePath();
  };

  return Ship;
});
