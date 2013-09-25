define(['createjs'], function (createjs) {
  var Container = createjs.Container
    , Shape = createjs.Shape
    , p;

  function Tank(params) {
    if (typeof params === 'object') {
      this.initialize(params);
    }
  }

  // обновляет функционал экземпляра
  Tank.update = function (player, data) {
    player.x = data.x;
    player.y = data.y;
    player.rotation = data.rotation;
    player.scale = data.scale;
    player.gun.rotation = data.gunRotation;

    return player;
  };

  p = Tank.prototype = new Container();
  p.Container_initialize = p.initialize;

  // инициализация
  p.initialize = function (params) {
    this.Container_initialize();

    this.body = new Shape();
    this.gun = new Shape();

    this.addChild(this.body);
    this.addChild(this.gun);

    this.name = params.name || 'Bot';
    this.color = params.color || '#ffffff';
    this.scale = params.scale || 100;
    this.model = params.model || 'tank';
    this.score = params.score || 10000;
    this.status = params.status || 'alive';
    this.x = params.x || 0;
    this.y = params.y || 0;
    this.rotation = params.rotation || 0;

    this.gun.rotation = params.gunRotation || 0;

    this.makeBody();
    this.makeGun();
  };

  // создание тела
  p.makeBody = function () {
    var g = this.body.graphics;

    g.clear();

    g.setStrokeStyle(1);
    g.beginStroke('#cccccc');
    g.beginFill('#333333');
    g.moveTo(-18, 22);
    g.lineTo(-18, -26);
    g.lineTo(18, -26);
    g.lineTo(18, 22);
    g.closePath();
  };

  // создание пушки
  p.makeGun = function () {
    var g = this.gun.graphics;

    g.clear();

    g.setStrokeStyle(1);
    g.beginStroke('#cccccc');
    g.beginFill(this.color);
    g.moveTo(-5, 16);
    g.lineTo(-12, 5);
    g.lineTo(-12, -5);
    g.lineTo(-5, -16);
    g.lineTo(5, -16);
    g.lineTo(12, -5);
    g.lineTo(12, 5);
    g.lineTo(5, 16);
    g.closePath();

    g.setStrokeStyle(1);
    g.beginStroke('#cccccc');
    g.beginFill('#333333');
    g.moveTo(-3, 28);
    g.lineTo(-3, 3);
    g.lineTo(3, 3);
    g.lineTo(3, 28);
    g.closePath();
  };

  return Tank;
});
