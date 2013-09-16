define([
  'createjs',
  'Publisher'
], function(
  createjs,
  Publisher
) {
  // Singleton GameView
  var gameView
    , Stage = createjs.Stage;

  function GameView(params) {
    if (gameView) {
      return gameView;
    }

    gameView = this;

    this.key = new Publisher();
    this._stage = new Stage(params.vimp);
    this._width = params.width;
    this._height = params.height;

    params.window.onkeydown = function (e) {
      gameView.key.emit('down', e.keyCode);
    };
    params.window.onkeyup = function (e) {
      gameView.key.emit('up', e.keyCode);
    };
  }

  GameView.prototype = {
    // создает новый объект
    addChild: function (model) {
      this._stage.addChild(model);
    },
    // обновляет полотно
    update: function (userModel) {
      if (userModel) {
        var x = userModel.scale / 100 || 1;
        this._stage.x = -(userModel.x * x - this._width / 2);
        this._stage.y = -(userModel.y * x - this._height / 2);
        this._stage.scaleX = x;
        this._stage.scaleY = x;
      }

      this._stage.update();
    },
    // изменение размеров игры
    resize: function (width, height) {
      this._width = width;
      this._height = height;
    }
  };

  return GameView;
});
