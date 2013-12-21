define([
  'Publisher', 'GameView'
], function (
  Publisher, GameView
) {
  // Singleton AuthView
  var authView;

  function AuthView(model, elements) {
    if (authView) {
      return authView;
    }

    authView = this;

    this._mPublic = model.publisher;

    this._auth = elements.auth;
    this._name = elements.name;
    this._colorsSelect = elements.colorsSelect;
    this._colorRadio = elements.colorRadio;
    this._colorInput = elements.colorInput;
    this._colorPreview = elements.colorPreview;
    // TODO: this._colorType нарушает структуру MVC,
    // но существенно упрощает код
    this._colorType = elements.colorType;
    this._error = elements.error;
    this._enter = elements.enter;

    this.publisher = new Publisher();

    this.gameView = new GameView(
      model.gameModel, this._colorPreview
    );

    // изменение имени
    this._name.onchange = function () {
      authView.publisher.emit('change', {
        name: 'name',
        type: 'name',
        value: authView._name.value
      });
    };

    // фокус на поле ввода цвета
    this._colorInput.onfocus = function () {
      var color = authView._colorInput.value ||
                  authView._colorRadio.value;

      authView.publisher.emit('focus', {
        name: authView._colorType,
        type: 'color',
        value: color
      });
    };

    // действие с радиокнопками или полем ввода цвета
    this._colorsSelect.onchange = function (e) {
      if (e.target.name === 'auth-color') {
        authView.publisher.emit('change', {
          name: authView._colorType,
          type: 'color',
          value: e.target.value
        });
      }

      if (e.target.name === 'auth-type') {
        authView.publisher.emit('type', {
          name: e.target.value,
          type: 'color',
          value: ''
        });
      }
    };

    // форма заполнена
    this._enter.onclick = function() {
      authView.publisher.emit('ready', [
        'name', 'colorA', 'colorB', 'model'
      ]);
    };

    this._mPublic.on('update', 'updateForm', authView);
    this._mPublic.on('error', 'readErr', authView);
    this._mPublic.on('ready', 'hideAuth', authView);
  }

  // показывает форму
  AuthView.prototype.showAuth = function () {
    this._auth.style.display = 'block';
  };

  // скрывает форму
  AuthView.prototype.hideAuth = function () {
    this._auth.style.display = 'none';
  };

  // пользовательский ввод цвета
  AuthView.prototype.switchInput = function (color) {
    this._colorRadio.checked = true;
    this._colorInput.value = color;
  };

  // переключает значение типа цвета
  AuthView.prototype.switchType = function (type) {
    this._colorType = type;
  };

  // обрабатывает ошибки
  AuthView.prototype.readErr = function (bugs) {
    var i = 0
      , len = bugs.length
      , message = '';

    for (; i < len; i += 1) {
      message += 'Please ' + bugs[i].name + '!<br>';
    }

    this._error.innerHTML = message;
  };

  // обновляет форму
  AuthView.prototype.updateForm = function (data) {
    var name = data.name
      , type = data.type
      , value = data.value;

    this._error.innerHTML = '';

    if (type === 'color') {
      if (name === this._colorType) {
        this._colorInput.value = value;
        this._colorRadio.value = value;

        this.publisher.emit('color');
      }
    }

    if (type === 'name') {
      this._name.value = value;
    }
  };

  return AuthView;
});
