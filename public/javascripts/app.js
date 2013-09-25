require([
  'io', 'preloadjs', 'createjs',
  'Publisher',
  'UserModel', 'UserView', 'UserCtrl',
  'BackModel', 'BackView',
  'GameModel', 'GameView', 'GameCtrl',
  'ShipModel',
  'RadarModel', 'RadarView'
], function (
  io, preloadjs, createjs,
  Publisher,
  UserModel, UserView, UserCtrl,
  BackModel, BackView,
  GameModel, GameView, GameCtrl,
  ShipModel,
  RadarModel, RadarView
) {

  var window = this
    , localStorage = window.localStorage
    , userName = localStorage.userName
    , userColor = localStorage.userColor

    , document = window.document

    , socket = io.connect('http://localhost:3000')
    , LoadQueue = createjs.LoadQueue
    , Ticker = createjs.Ticker

    , CANVAS_BACK_ID = 'back'
    , CANVAS_VIMP_ID = 'vimp'
    , CANVAS_RADAR_ID = 'radar'
    , RADAR_PROPORTION = 0.15

    , loader
    , manifest = [
      {
        id: 'background',
        src: '/vimp/images/space.jpg',
        width: 500,
        height: 500
      }
    ]

    , backModel = null  // модель фона
    , backView = null   // представление фона

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
      , back = document.getElementById(CANVAS_BACK_ID)
      , vimp = document.getElementById(CANVAS_VIMP_ID)
      , radar = document.getElementById(CANVAS_RADAR_ID);

    // маcштабирование игры под пользователя
    function resizeGame(width, height) {
      back.width = width || window.innerWidth;
      back.height = height || window.innerHeight;
      vimp.width = width || window.innerWidth;
      vimp.height = height || window.innerHeight;
      radar.width = radar.height = Math.round(vimp.width * RADAR_PROPORTION);
    }

    // если активация на сервере прошла успешно
    if (data.auth === true) {
      // настройка разрешения
      resizeGame();

      backModel = new BackModel();
      backView = new BackView(backModel, {
        width: back.width,
        height: back.height,
        stage: back
      });

      gameModel = new GameModel();

      // Активация GameView
      gameView = new GameView(gameModel, {
        width: vimp.width,
        height: vimp.height,
        stage: vimp,
        window: window
      });

      // активация GameCtrl
      // TODO: присылается с сервера
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

      // загрузка графических файлов
      loader = new LoadQueue(false);
      loader.onComplete = handleComplete;
      loader.loadManifest(manifest);

      function handleComplete() {
        var img = loader.getItem('background');

        // Фон игры.
        // Длина и высота фона больше экрана
        // на размер изображения помноженное на 2
        // Фон смещен на координаты равные
        // размеру фона
        // То есть фон больше экрана со всех сторон
        // на один размер изображения
        backModel.create({
          name: img.id,
          image: loader.getResult('background'),
          x: -img.width,
          y: -img.height,
          width: back.width + (img.width * 2),
          height: back.height + (img.height * 2),
          stepX: img.width,
          stepY: img.height
        });
      }

      // отображение игры
      back.style.display = 'block';
      vimp.style.display = 'block';
      radar.style.display = 'block';

      // Счетчик: отправляет данные
      // нажатых клавиш на сервер.
      // Если данных нет, то на сервер
      // поступает пустой массив
      // (но только 1 раз!)
      Ticker.addEventListener("tick", function() {
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
      // TODO: сделать параметры пользователя универсальными
      window.onresize = function () {
        resizeGame();
        backView.resize(back.width, back.height);
        backView.update(gameModel._data[userName]);
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
      , backX
      , backY
      , i;

    // обновление фона
    // Это срабатывает только когда переместился
    // пользователь. Другие игроки не должны влиять на
    // координаты и вызывать этот метод
    // вычисляет данные для фона игры
    if (data[userName] && players[userName]) {
      var scale = data[userName].scale;
      backX = players[userName].x - data[userName].x;
      backY = players[userName].y - data[userName].y;

      // если x или y не равны 0
      if (backX || backY) {
        backModel.move('background', backX, backY, scale);
      }
    }

    for (i in data) {
      if (data.hasOwnProperty(i)) {

        // если игрок есть - обновить данные
        if (players[i]) {
          console.log('обновление игрока');
          gameModel.update(data[i]);
          radarModel.update(data[i]);

        // иначе создать игрока
        } else {
          console.log('cоздание игрока');
          gameModel.create(data[i]);
          radarModel.create(data[i]);
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
