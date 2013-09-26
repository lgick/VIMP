define(['Publisher'], function (Publisher) {
  // Singleton UserView
  var userView;

  function UserView(model, elements) {
    if (userView) {
      return userView;
    }

    userView = this;

    this._mPublic = model.publisher;
    this._auth = elements.auth;
    this._name = elements.name;
    this._colors = elements.colors;
    this._enter = elements.enter;

    this.publisher = new Publisher();

    this._enter.onclick = function() {
      var colors = userView._colors
        , i = 0
        , len = colors.length
        , color;

      for (; i < len; i += 1) {
        if (colors[i].checked) {
          color = colors[i].value;
        }
      }

      userView.publisher.emit('auth', {
        name: userView._name.value,
        color: color
      });
    };

    this._mPublic.on('data', 'hide', userView);
    this._mPublic.on('error', 'clear', userView);
  }

  UserView.prototype = {
    // показывает форму
    show: function () {
      this._auth.style.display = 'block';
    },
    // скрывает форму
    hide: function () {
      this._auth.style.display = 'none';
    },
    // очищает форму
    clear: function () {
      this._name.value = '';
    }
  };

  return UserView;
});
