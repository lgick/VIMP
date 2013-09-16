define(['Publisher'], function (Publisher) {
  // Singleton UserView
  var userView;

  function UserView(model, elements) {
    if (userView) {
      return userView;
    }

    userView = this;

    this._model = model;
    this._elements = elements;

    this.authEnter = new Publisher();

    this._model.data.on('data', 'hide', userView);
    this._model.data.on('error', 'clear', userView);

    this._elements.enter.onclick = function() {
      userView.authEnter.emit('data', {
        name: userView._elements.name,
        colors: userView._elements.colors
      });
    };
  }

  UserView.prototype = {
    // показывает форму
    show: function () {
      var auth = this._elements.auth;
      auth.style.display = 'block';
    },
    // скрывает форму
    hide: function () {
      var auth = this._elements.auth;
      auth.style.display = 'none';
    },
    // очищает форму
    clear: function () {
      var name = this._elements.name;
      name.value = '';
    }
  };

  return UserView;
});
