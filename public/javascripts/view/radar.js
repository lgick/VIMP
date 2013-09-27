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
      this._stage.scaleX = player.scale;
      this._stage.scaleY = player.scale;
      this._stage.addChild(player);
    },
    // обновляет полотно
    update: function (userModel) {
      if (userModel) {
        var s = +(userModel.scale / 20).toFixed(10);

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
    // удаляет экземпляр с полотна
    remove: function (player) {
      this._stage.removeChild(player);
    },
    // полностью очищает полотно
    clear: function () {
      this._stage.removeAllChildren();
    },
    // изменение размеров игры
    resize: function (width, height) {
      this._width = width;
      this._height = height;
    }
  };

  return RadarView;
});
