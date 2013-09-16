var user;

function User(params) {
  if (user) {
    return user;
  }

  user = this;

  this._name = params.name;
  this._color = params.color;
  this._scale = params.scale;
  this._x = params.x;
  this._y = params.y;
  this._rotation = params.rotation;

  this.rangeNumber = function () {};
}

User.prototype = {
  // движение вперед
  forward: function (step) {
    this._x += step;
    this._y += step;
  },
  // движение назад
  back: function (step) {
    this._x -= step;
    this._y += step;
  },
  // движение влево
  left: function (step) {
    this._rotation -= step;
  },
  // движение вправо
  right: function (step) {
    this._rotation += step;
  },
  gLeft: function () {},
  gRight: function () {},
  gCenter: function () {},
  zoomPlus: function () {},
  zoomMinus: function () {},
  zoomDefault: function () {}
};

exports.User = User;
