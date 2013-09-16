define([], function () {
  // Singleton UserCtrl
  var userCtrl;

  function UserCtrl(model, view) {
    if (userCtrl) {
      return userCtrl;
    }

    userCtrl = this;

    this._model = model;
    this._view = view;

    this._view.authEnter.on('data', 'read', userCtrl);
  }

  UserCtrl.prototype = {
    // читает форму
    read: function (elements) {
      var name = this.getName(elements.name)
        , color = this.getColor(elements.colors);

      this._model.addData({
        name: name,
        color: color
      });
    },
    // возвращает имя
    getName: function (name) {
      var value = name.value;

      if (value && !(/\W/).test(value)) {
        return value;
      }
    },
    // возвращает цвет
    getColor: function (colors) {
      var i = 0
        , len = colors.length
        , color;

      for (; i < len; i += 1) {
        if (colors[i].checked) {
          color = colors[i].value;
        }
      }

      return color;
    }
  };

  return UserCtrl;
});
