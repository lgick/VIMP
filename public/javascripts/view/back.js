define(['createjs'], function(createjs) {
  // Singleton BackView
  var backView
    , Stage = createjs.Stage;

  function BackView(model, params) {
    if (backView) {
      return backView;
    }

    backView = this;

    this._model = model.publisher;
    this._stage = new Stage(params.stage);
    this._width = params.width;
    this._height = params.height;

    this._model.on('create', 'add', backView);
    this._model.on('move', 'update', backView);
  }

  BackView.prototype = {
    // создает экземпляр на полотне
    add: function (shape) {
      this._stage.addChild(shape);
      this.update();
    },
    // обновляет полотно
    update: function () {
      this._stage.update();
    },
    // изменение размеров игры
    resize: function (width, height) {
      this._width = width;
      this._height = height;
    }
  };

  return BackView;
});
