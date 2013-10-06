define(['Publisher'], function (Publisher) {
  // Singleton UserView
  var userView;

  function UserView(model, params) {
    if (userView) {
      return userView;
    }

    userView = this;

//    this._mPublic = model.publisher;

    this._window = params.window;
    this._elements = params.elements;
    this.publisher = new Publisher();

    this._window.onkeydown = function (e) {
      userView.publisher.emit('keyDown', e.keyCode);
    };

    this._window.onkeyup = function (e) {
      userView.publisher.emit('keyUp', e.keyCode);
    };

    this._window.onresize = function () {
      userView.publisher.emit('resize', {
        width: userView._window.innerWidth,
        height: userView._window.innerHeight
      });
    };
  }

  return UserView;
});
