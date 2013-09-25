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

  function GameView(model, params) {
    if (gameView) {
      return gameView;
    }

    gameView = this;

    this.key = new Publisher();
    this._model = model.publisher;
    this._stage = new Stage(params.stage);
    this._width = params.width;
    this._height = params.height;

    params.window.onkeydown = function (e) {
      gameView.key.emit('down', e.keyCode);
    };
    params.window.onkeyup = function (e) {
      gameView.key.emit('up', e.keyCode);
    };

    this._model.on('create', 'add', gameView);
    this._model.on('remove', 'remove', gameView);
    this._model.on('clear', 'clear', gameView);
  }

  GameView.prototype = {
    // создает экземпляр на полотне
    add: function (player) {
      this._stage.addChild(player);
    },
    // удаляет экземпляр с полотна
    remove: function (player) {
      this._stage.removeChild(player);
    },
    // полностью очищает полотно
    clear: function () {
      this._stage.removeAllChildren();
    },
    // обновляет полотно
    update: function (userModel) {
      if (userModel) {
        var s = userModel.scale;

        this._stage.x = -(userModel.x * s - this._width / 2);
        this._stage.y = -(userModel.y * s - this._height / 2);

        // устранение неточности
        this._stage.x = +(this._stage.x).toFixed(10);
        this._stage.y = +(this._stage.y).toFixed(10);

        this._stage.scaleX = s;
        this._stage.scaleY = s;
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
