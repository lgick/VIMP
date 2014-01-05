define([], function () {
  // Singleton AuthCtrl
  var authCtrl;

  function AuthCtrl(model, view) {
    if (authCtrl) {
      return authCtrl;
    }

    authCtrl = this;

    this._model = model;
    this._view = view;

    this._vPublic = view.publisher;

    this._vPublic.on('input', 'update', this);
    this._vPublic.on('preview', 'createPreview', this);
    this._vPublic.on('enter', 'send', this);
  }

  // инициализация
  AuthCtrl.prototype.init = function (data) {
    var i = 0
      , len = data.length;

    for (; i < len; i += 1) {
      this.update(data[i]);
    }

    this._view.showAuth();
  };

  // обновление
  AuthCtrl.prototype.update = function (data) {
    var name = data.name
      , value = data.value;

    if (name === 'name') {
      this._model.update('name', data);
    }

    if (name === 'cType') {
      this._model.switchCType(data);
      this._model.update(data.value, {
        name: 'color',
        value: null
      });
    }

    if (name === 'color') {
      this._model.update(this._model.getCType(), data);
    }

    if (name === 'model') {
      this._model.update('model', data);
    }
  };

  // визуализация модели
  AuthCtrl.prototype.createPreview = function () {
    this._model.createPreview({
      type: 'auth',
      name: this._model.getData('model'),
      constructor: this._model.getData('model'),
      data: {
        x: 45,
        y: 35,
        scaleX: 2,
        scaleY: 2,
        rotation: 270,
        colorA: this._model.getData('colorA'),
        colorB: this._model.getData('colorB')
      }
    });
  };

  // отправка данных
  AuthCtrl.prototype.send = function () {
    this._model.send();
  };

  return AuthCtrl;
});
