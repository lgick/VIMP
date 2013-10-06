require([
  'io', 'preloadjs', 'createjs',
  'Publisher',
  'AuthModel', 'AuthView', 'AuthCtrl',
  'UserModel', 'UserView', 'UserCtrl',
  'GameModel', 'GameView',
  'BackModel', 'ShipModel', 'RadarModel'
], function (
  io, preloadjs, createjs,
  Publisher,
  AuthModel, AuthView, AuthCtrl,
  UserModel, UserView, UserCtrl,
  GameModel, GameView,
  BackModel, ShipModel, RadarModel
) {

  var window = this
    , localStorage = window.localStorage
    , userName = localStorage.userName
    , userColorA = localStorage.userColorA
    , userColorB = localStorage.userColorB

    , document = window.document

    , socket = io.connect('http://localhost:3000')
    , LoadQueue = createjs.LoadQueue
    , Ticker = createjs.Ticker

    , CANVAS_BACK_ID = 'back'
    , CANVAS_VIMP_ID = 'vimp'
    , CANVAS_RADAR_ID = 'radar'
    , RADAR_PROPORTION = 0.15
    , RADAR_SCALE_RATIO = 20

    , loader
    , manifest = [
      {
        id: 'background',
        src: '/vimp/images/space.jpg',
        width: 500,
        height: 500
      }
    ]

    , player = {}
    , radar = {}

    , backModel = null  // модель фона
    , backView = null   // представление фона

    , gameView = null   // представление
    , gameCtrl = null   // контроллер

    , radarModel = null // модель радара
    , radarView = null  // представление радара
  ;

  // авторизация пользователя
  (function () {
    var authModel
      , authView
      , authCtrl
      , name = userName || ''
      , colorA = userColorA || '#333333'
      , colorB = userColorB || '#444444';

    authModel = new AuthModel();
    authView = new AuthView(authModel, {
      auth: document.getElementById('auth'),
      name: document.getElementById('auth-name'),
      colorsSelect: document.getElementById('auth-colors'),
      colorRadio: document.getElementById('auth-color-radio'),
      colorInput: document.getElementById('auth-color-input'),
      colorPreview: document.getElementById('auth-color-preview'),
      // TODO: colorType нарушает структуру MVC,
      // но существенно упрощает код
      colorType: 'colorA',
      error: document.getElementById('auth-error'),
      enter: document.getElementById('auth-enter')
    });
    authCtrl = new AuthCtrl(authModel, authView);

    authModel.validate(
      {name: 'name', type: 'name', value: name}
    );
    authModel.validate(
      {name: 'colorA', type: 'color', value: colorA}
    );
    authModel.validate(
      {name: 'colorB', type: 'color', value: colorB}
    );

    authModel.createModels({
      ship: {
        name: 'bot',
        x: 60,
        y: 35,
        scaleX: 2,
        scaleY: 2,
        model: 'Ship',
        rotation: 180,
        colorA: colorA,
        colorB: colorB
      }
    });

    authView.showAuth();

    // при поступлении новых данных:
    // - отправка данных на сервер
    authModel.publisher.on('ready', function (data) {
      socket.emit('user', data);
      // имя и цвет
      // в переменные(переменные используются!)
      // и в хранилище
      userName = localStorage.userName = data.name;
      userColorA = localStorage.userColorA = data.colorA;
      userColorB = localStorage.userColorB = data.colorB;
    });
  }());

// ДАННЫЕ С СЕРВЕРА

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

      radar.width = radar.height =
        Math.round(vimp.width * RADAR_PROPORTION);
    }

    // если активация на сервере прошла успешно
    if (data.auth === true) {
      // настройка разрешения
      resizeGame();

      // Активация USER
      var userModel = new UserModel({
        width: window.innerWidth,
        height: window.innerHeight,
      // TODO: присылается с сервера
        keys: {
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
        }
      });
      var userView = new UserView(userModel, {
        window: window
      });
      var userCtrl = new UserCtrl(userModel, userView);

      // Активация GameView
      gameView = new GameView(vimp);

      // Активация RadarView
      radarView = new GameView(radar);

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
        backModel = new GameModel('Back', {
          image: loader.getResult('background'),
          x: -img.width,
          y: -img.height,
          width: back.width + (img.width * 2),
          height: back.height + (img.height * 2),
          stepX: img.width,
          stepY: img.height
        });

        backView = new GameView(back)
        backView.add(backModel);
        backView.update();
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
        var cmds = userModel._cmds;

        if (cmds.length !== 0) {
          socket.emit('cmds', cmds);
          emptyArr = false;
        } else if (emptyArr === false) {
          socket.emit('cmds', cmds);
          emptyArr = true;
        }
      });

      // событие при изменении размеров игры
      // TODO: сделать параметры пользователя
      // универсальными
//      window.onresize = function () {
//        var user = playerData[userName];
//
//        resizeGame();
//        backModel.move(
//          'background', user.x, user.y, user.scale
//        );
//        gameView.resize(vimp.width, vimp.height);
//        gameView.update(user);
//        radarView.resize(radar.width, radar.height);
//        radarView.update(radarData[userName]);
//      };
    }
  });

  socket.on('game', function (data) {
    if (typeof data !== 'object') {
      return;
    }

    var backX
      , backY
      , i;

    // обновление фона
    // Это срабатывает только когда переместился
    // пользователь. Другие игроки не должны влиять на
    // координаты и вызывать этот метод
    // вычисляет данные для фона игры
    if (data[userName] && player[userName]) {
      var scale = data[userName].scale;
      backX = player[userName].x - data[userName].x;
      backY = player[userName].y - data[userName].y;

      // если x или y не равны 0
      if (backX || backY) {
        backModel.update({
          x: backX,
          y: backY,
          scale: scale
        });
      }
    }

    // функция получения координат пользователя
    function cords(user, ratio, width, height) {
      var ratio = ratio || 1
        , prop = prop || 1
        , scale = +(user.scale / ratio).toFixed(10)
        , data = {}
        , width = width || window.innerWidth
        , height = height || window.innerHeight;

      data.x = -(user.x * scale - width / 2);
      data.y = -(user.y * scale - height / 2);

      // устранение неточности
      data.x = +(data.x).toFixed(10);
      data.y = +(data.y).toFixed(10);

      data.scale = scale;

      return data;
    }

    for (i in data) {
      if (data.hasOwnProperty(i)) {

        // если игрок есть - обновить данные
        if (player[i]) {
          console.log('обновление игрока');
          player[i].update(data[i]);
          radar[i].update(data[i]);

        // иначе создать игрока
        } else {
          console.log('cоздание игрока');
          player[i] = new GameModel(
            data[i].model, data[i]
          );
          gameView.add(player[i]);

          radar[i] = new GameModel('Radar', data[i]);
          radarView.add(radar[i]);
        }
      }
    }

    // После обработки данных
    // обновление полотна пользователя
    if (player[userName]) {
      gameView.update(cords(player[userName]));
      window.user = player[userName];
      window.radar = radar[userName];

      // Обновление радара
      var wRadar = hRadar =
        window.innerWidth * RADAR_PROPORTION;

      radarView.update(
        cords(
          radar[userName],
          RADAR_SCALE_RATIO,
          wRadar,
          hRadar
      ));

      backView.update();
    }

  });
});
