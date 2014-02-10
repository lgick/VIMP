define([
  'Publisher', 'GameView'
], function (
  Publisher, GameView
) {
  // Singleton AuthView
  var authView;

  function AuthView(model, data) {
    if (authView) {
      return authView;
    }

    authView = this;

    this._mPublic = model.publisher;

    this._auth = data.auth;
    this._form = data.form;
    this._name = data.name;
    this._color = data.color;
    this._error = data.error;
    this._enter = data.enter;

    this._gameView = new GameView(
      model.gameModel, data.preview
    );

    this.publisher = new Publisher();

    // действие с инпутами
    this._form.onchange = function (e) {
      var tg = e.target;

      if (tg.tagName === 'INPUT') {
        authView.publisher.emit('input', {
          name: tg.name,
          value: tg.value
        });
      }
    };

    // форма заполнена
    this._enter.onclick = function () {
      authView.publisher.emit('enter');
    };

    this._mPublic.on('form', 'renderData', this);
    this._mPublic.on('preview', 'renderPreview', this);
    this._mPublic.on('error', 'renderError', this);
    this._mPublic.on('ok', 'hideAuth', this);
  }

  // показывает форму
  AuthView.prototype.showAuth = function () {
    this._auth.style.display = 'block';
  };

  // скрывает форму
  AuthView.prototype.hideAuth = function () {
    this._auth.style.display = 'none';
  };

  // обновляет форму
  AuthView.prototype.renderData = function (data) {
    var name = data.name
      , value = data.value
      , list = this._form.querySelectorAll('input')
      , i = 0
      , len = list.length;

    this._error.innerHTML = '';

    if (name === 'name') {
      this._name.value = value;
    }

    if (name === 'color') {
      this._color.value = value;

      // запрос на перерисовку модели
      this.publisher.emit('preview');
    }

    if (name === 'model') {
      // запрос на перерисовку модели
      this.publisher.emit('preview');
    }

    // делает активной нужную радиокнопку
    for (; i < len; i += 1) {
      if (list[i].name === name) {
        if (list[i].value === value) {
          list[i].checked = true;
        } else {
          list[i].checked = false;
        }
      }
    }
  };

  // обновляет визуализацию
  AuthView.prototype.renderPreview = function () {
    this._gameView.update();
  };

  // отображает ошибки
  AuthView.prototype.renderError = function (bugs) {
    var i = 0
      , len = bugs.length
      , message = ''
      , error;

    for (; i < len; i += 1) {
      error = bugs[i].name.toUpperCase();
      message += error +  ' is not correctly!<br>';
    }

    this._error.innerHTML = message;
  };

  return AuthView;
});
