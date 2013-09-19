require([
  'io', 'createjs',
  'Publisher',
  'UserModel', 'UserView', 'UserCtrl',
  'GameModel', 'GameView', 'GameCtrl',
  'TankModel', 'ShipModel',
  'RadarModel', 'RadarView'
], function (
  io, createjs,
  Publisher,
  UserModel, UserView, UserCtrl,
  GameModel, GameView, GameCtrl,
  TankModel, ShipModel,
  RadarModel, RadarView
) {

  var window = this
    , localStorage = window.localStorage
    , userName = localStorage.userName
    , userColor = localStorage.userColor

    , document = window.document

    , socket = io.connect('http://localhost:3000')
    , ticker = createjs.Ticker

    , CANVAS_VIMP_ID = 'vimp'
    , CANVAS_RADAR_ID = 'radar'

    , gameModel = null  // модель
    , gameView = null   // представление
    , gameCtrl = null   // контроллер

    , radarModel = null // модель радара
    , radarView = null  // представление радара

    , V;

  V = {
    // отправляет данные на сервер
    sendData: function (tag, data) {
      socket.emit(tag, data);
    },

    // авторизация пользователя
    createUser: function () {
      var userModel
        , userView
        , userCtrl;

      userModel = new UserModel();
      userView = new UserView(userModel, {
        auth: document.getElementById('auth'),
        name: document.getElementById('auth-name'),
        colors: document.getElementsByName('auth-color'),
        enter: document.getElementById('auth-enter')
      });
      userCtrl = new UserCtrl(userModel, userView);

      userView.show();

      // при поступлении новых данных:
      // - отправка данных на сервер
      userModel.data.on('data', function (data) {
        V.sendData('user', data);
        // имя и цвет
        // в переменные(переменные используются!)
        // и в хранилище
        userName = localStorage.userName = data.name;
        userColor = localStorage.userColor = data.color;
      });
    },
  };

  // проверка наличия данных
  // для авторизации
  if (!userName || !userColor) {
    V.createUser();
  } else {
    V.sendData('user', {
      name: userName,
      color: userColor
    });
  }

// ДАННЫЕ С СЕРВЕРА

  // подтверждение авторизации
  socket.on('auth', function (data) {
    var emptyArr = false // флаг при отправке пустого массива
      , vimp = document.getElementById(CANVAS_VIMP_ID)
      , radar = document.getElementById(CANVAS_RADAR_ID);

    // маcштабирование игры под пользователя
    function resizeGame(width, height) {
      vimp.width = width || window.innerWidth;
      vimp.height = height || window.innerHeight;
      radar.width = radar.height = Math.round(vimp.width * 0.15);
    }

    // если активация на сервере прошла успешно
    if (data.auth === true) {
      // настройка разрешения
      // и отображения игры
      resizeGame();
      vimp.style.display = 'block';
      radar.style.display = 'block';

      gameModel = new GameModel();

      // Активация GameView
      gameView = new GameView(gameModel, {
        width: vimp.width,
        height: vimp.height,
        stage: vimp,
        window: window
      });

      // активация GameCtrl
      gameCtrl = new GameCtrl(gameView, {
        87: 'forward',
        83: 'back',
        65: 'left',
        68: 'right',
        72: 'gLeft',
        74: 'gRight',
        67: 'gCenter',
        75: 'fire',
        80: 'zoomPlus',
        79: 'zoomMinus',
        81: 'zoomDefault'
      });

      radarModel = new RadarModel();

      // Активация RadarView
      radarView = new RadarView(radarModel, {
        width: radar.width,
        height: radar.height,
        stage: radar
      });

      // Счетчик: отправляет данные
      // нажатых клавиш на сервер.
      // Если данных нет, то на сервер
      // поступает пустой массив
      // (но только 1 раз!)
      ticker.addEventListener("tick", function() {
        var cmds = gameCtrl.cmds;

        if (cmds.length !== 0) {
          V.sendData('cmds', cmds);
          emptyArr = false;
        } else if (emptyArr === false) {
          V.sendData('cmds', cmds);
          emptyArr = true;
        }
      });

      // событие при изменении размеров игры
      window.onresize = function () {
        resizeGame();
        gameView.resize(vimp.width, vimp.height);
        gameView.update(gameModel._data[userName]);
        radarView.resize(radar.width, radar.height);
        radarView.update(radarModel._data[userName]);
      };
    }
  });

  // данные игры
  socket.on('game', function (data) {
    if (typeof data !== 'object') {
      return;
    }

    var players = gameModel._data
      , i;

    for (i in data) {
      if (data.hasOwnProperty(i)) {

        // если игрок есть - обновить данные
        if (players[i]) {
          console.log('обновление игрока');
          gameModel.update(i, data[i]);
          radarModel.update(i, data[i]);

        // иначе создать игрока
        } else {
          console.log('cоздание игрока');
          gameModel.create(i, data[i]);
          radarModel.create(i, data[i]);
        }
      }
    }

    // После обработки данных
    // обновление полотна пользователя
    gameView.update(players[userName]);

    // Обновление радара
    radarView.update(players[userName]);
  });

});
