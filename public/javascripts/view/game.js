define(['createjs'], function(createjs) {
  // Наследуемый объект
  // для отображения игры в нескольких видах
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
    add: function (player) {
      this._stage.addChild(player);
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
    remove: function (player) {
      this._stage.removeChild(player);
    },
    // полностью очищает полотно
    clear: function () {
      this._stage.removeAllChildren();
    }
  };

  return GameView;
});
