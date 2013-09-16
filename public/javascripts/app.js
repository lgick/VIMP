require([
  'io', 'createjs',
  'Publisher',
  'UserModel', 'UserView', 'UserCtrl',
  'GameModel', 'GameView', 'GameCtrl',
  'TankModel', 'ShipModel'
], function (
  io, createjs,
  Publisher,
  UserModel, UserView, UserCtrl,
  GameModel, GameView, GameCtrl,
  TankModel, ShipModel
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

    , V;

  V = {
    // представление
    gameView: null,

    // контроллер
    gameCtrl: null,

    // все игроки
    // TODO: после каждого раунда игры
    // этот объект нужно очищать
    players: {},

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

    // создание нового игрока
    createPlayer: function (player, data) {
      // TODO эту хрень можно удалить
      if (this.players[player]) {
        return;
      }

      this.players[player] = GameModel(data.model, data);
      this.gameView.addChild(this.players[player]);

      console.log('Создан игрок с координатами x:' + data.x + ', y:' + data.y);
    },

    // обновление данных игрока
    updatePlayer: function (player, data) {
      var player = this.players[player];

      player.x = data.x;
      player.y = data.y;
      player.rotation = data.rotation;
    //  player.gun.rotation = data.gunRotation;

      console.log(
        'Игрок переместился на координаты x:' + player.x + ', y:' + player.y
      );

      // если сервер сменил статус
      // обновить частные персональные пользователя
      if (data.status === 'update') {
        player.name = data.name;
        player.color = data.color;
        player.scale = data.scale;
      }
    },

    // удаление игрока
    removePlayer: function (player) {
      delete this.players[player];
    },

    // изменяет все данные на дефолтные
    // значения
    // (это нужно, например перед началом
    // нового раунда или при длительном
    // игровом процессе)
    cleanData: function () {
      this.players = {};
    }
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

      // активация GameView
      V.gameView = new GameView({
        width: vimp.width,
        height: vimp.height,
        vimp: vimp,
        window: window
      });

      // TODO: активация RadarView
      //V.radarView = new RadarView({
      //  radar: radar
      //});

      // активация GameCtrl
      V.gameCtrl = new GameCtrl(V.gameView, {
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

      // Счетчик: отправляет данные
      // нажатых клавиш на сервер.
      // Если данных нет, то на сервер
      // поступает пустой массив
      // (но только 1 раз!)
      ticker.addEventListener("tick", function() {
        var cmds = V.gameCtrl.cmds;

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
        V.gameView.resize(vimp.width, vimp.height);
        V.gameView.update(V.players[userName]);
      };
    }
  });

  // данные игры
  socket.on('game', function (data) {
    if (typeof data !== 'object') {
      return;
    }

    var players = V.players
      , i;

    for (i in data) {
      if (data.hasOwnProperty(i)) {
        // если игрок есть - обновить данные
        if (players[i]) {
          V.updatePlayer(i, data[i]);
        // иначе создать игрока
        } else {
          V.createPlayer(i, data[i]);
        }
      }
    }

    // обновление полотна пользователя
    V.gameView.update(players[userName]);
  });

});
