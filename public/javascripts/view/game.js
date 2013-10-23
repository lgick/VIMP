define(['createjs'], function (createjs) {
  // Объект для инициализации представлений игры
  var Stage = createjs.Stage;

  function GameView(stage) {
    if (stage) {
      this.initialize(stage);
    }
  }

  GameView.prototype = {
    // инициализация
    initialize: function (stage) {
      this._stage = new Stage(stage);
    },
    // создает экземпляр на полотне
    add: function (instance) {
      this._stage.addChild(instance);
    },
    // обновляет полотно
    update: function (data) {
      if (data) {
        this._stage.x = data.x;
        this._stage.y = data.y;

        this._stage.scaleX = data.scale;
        this._stage.scaleY = data.scale;
      }

      this._stage.update();
    },
    // удаляет экземпляр с полотна
    // TODO: пока не используется
    remove: function (instance) {
      this._stage.removeChild(instance);
    },
    // полностью очищает полотно
    clear: function () {
      this._stage.removeAllChildren();
    }
  };

  return GameView;
});
