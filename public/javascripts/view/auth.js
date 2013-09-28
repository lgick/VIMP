define(['Publisher'], function (Publisher) {
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
    this._error = elements.error;
    this._enter = elements.enter;

    this.publisher = new Publisher();

    // изменение имени
    this._name.onchange = function () {
      authView.publisher.emit('change', {
        name: authView._name.value
      });
    };

    // фокус на поле ввода цвета
    this._colorInput.onfocus = function () {
      var color = authView._colorInput.value ||
                  authView._colorRadio.value;

      authView.publisher.emit('focus', {
        color: color
      });
    };

    // действие с радиокнопками или полем ввода цвета
    this._colorsSelect.onchange = function (e) {
      if (e.target.tagName !== 'INPUT') {
        return;
      }

      authView.publisher.emit('change', {
        color: e.target.value
      });
    };

    // форма заполнена
    this._enter.onclick = function() {
      authView.publisher.emit('ready', [
        'name', 'color'
      ]);
    };

    this._mPublic.on('update', 'update', authView);
    this._mPublic.on('error', 'readErr', authView);
    this._mPublic.on('ready', 'hideAuth', authView);
  }

  AuthView.prototype = {
    // показывает форму
    showAuth: function () {
      this._auth.style.display = 'block';
    },
    // скрывает форму
    hideAuth: function () {
      this._auth.style.display = 'none';
    },
    // пользовательский ввод цвета
    switchInput: function (color) {
      this._colorRadio.checked = true;
      this._colorInput.value = color;
    },
    // обрабатывает ошибки
    readErr: function (bugs) {
      var i = 0
        , len = bugs.length
        , message = '';

      for (; i < len; i += 1) {
        message += 'Please ' + bugs[i].type + '!<br>';
      }

      this._error.innerHTML = message;
    },
    // обновляет форму
    update: function (data) {
      var type = data.type
        , value = data.value;

      this._error.innerHTML = '';

      if (type === 'color') {
        this._colorPreview.style.background = value;
        this._colorInput.value = value;
        this._colorRadio.value = value;
      }

      if (type === 'name') {
        this._name.value = value;
      }
    }
  };

  return AuthView;
});
