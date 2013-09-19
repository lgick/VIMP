define(['createjs'], function(createjs) {
  // Singleton RadarView
  var radarView
    , Stage = createjs.Stage;

  function RadarView(model, params) {
    if (radarView) {
      return radarView;
    }

    radarView = this;

    this._model = model.publisher;
    this._stage = new Stage(params.stage);
    this._width = params.width;
    this._height = params.height;

    this._model.on('create', 'add', radarView);
    this._model.on('remove', 'remove', radarView);
    this._model.on('clear', 'clear', radarView);
  }

  RadarView.prototype = {
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
        var x = userModel.scale / 2000 || 1;
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

  return RadarView;
});
