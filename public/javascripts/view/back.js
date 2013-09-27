define(['createjs'], function(createjs) {
  // Singleton BackView
  var backView
    , Stage = createjs.Stage;

  function BackView(model, params) {
    if (backView) {
      return backView;
    }

    backView = this;

    this._mPublic = model.publisher;
    this._stage = new Stage(params.stage);

    this._mPublic.on('create', 'add', backView);
    this._mPublic.on('move', 'update', backView);
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
    }
  };

  return BackView;
});
