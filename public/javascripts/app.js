require([
  'io', 'preloadjs', 'createjs',
  'Publisher',
  'AuthModel', 'AuthView', 'AuthCtrl',
  'UserModel', 'UserView', 'UserCtrl',
  'GameModel', 'GameView',
  'VimpCtrl', 'BackCtrl', 'RadarCtrl',
  'Factory',
  'BackModel', 'ShipModel', 'RadarModel'
], function (
  io, preloadjs, createjs,
  Publisher,
  AuthModel, AuthView, AuthCtrl,
  UserModel, UserView, UserCtrl,
  GameModel, GameView,
  VimpCtrl, BackCtrl, RadarCtrl,
  Factory,
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
    // Частота полной очистки памяти от объектов
    // Измеряется в количестве обновлений поступивших
    // с сервера.
    // Чем выше этот параметр, тем больше будет
    // объектов храниться в памяти и тем проще будет с
    // ними работать.
    // После достижения лимита вся память будет очищена
    // и объекты будут создаваться заново
    , LIMIT_ITERATION = 100

    , loader
    // TODO: перенести это на сервер
    // и выдавать в случае удачной авторизации
    , manifest = [
      {
        id: 'background',
        src: '/vimp/images/space.jpg',
        width: 500,
        height: 500
      }
    ]

    // число обновлений с сервера
    , iterations = 0

    // кеш данных пользователя при последнем обновлении
    , vimpUserCache = null
    , radarUserCache = null

    , back = document.getElementById(CANVAS_BACK_ID)
    , vimp = document.getElementById(CANVAS_VIMP_ID)
    , radar = document.getElementById(CANVAS_RADAR_ID)

  // TODO: выпилить ненужное!!!!
    , userModel = null
    , userCtrl = null

    , vimpCtrl = null
    , backCtrl = null
    , radarCtrl = null
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

    authCtrl.parseModels({
      ship: {
        constructor: 'Ship',
        x: 30,
        y: 35,
        scaleX: 1.4,
        scaleY: 1.4,
        rotation: 270,
        colorA: colorA,
        colorB: colorB
      },
      ship2: {
        constructor: 'Ship',
        x: 90,
        y: 35,
        scaleX: 1.4,
        scaleY: 1.4,
        rotation: 270,
        colorA: colorA,
        colorB: colorB
      }
    });

    authCtrl.parseData([
      {name: 'name', type: 'name', value: name},
      {name: 'colorA', type: 'color', value: colorA},
      {name: 'colorB', type: 'color', value: colorB},
      {name: 'model', type: 'model', value: 'Ship'}
    ]);

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

  // стартует игру
  function startGame() {
    var userView
      , vimpModel
      , vimpView
      , backModel
      , backView
      , radarModel
      , radarView;

    // старт user
    // TODO: выпилить userModel;
    userModel = new UserModel();
    userView = new UserView(window);
    userCtrl = new UserCtrl(userModel, userView);

    // старт vimp
    vimpModel = new GameModel();
    vimpView = new GameView(vimp, vimpModel);
    vimpCtrl = new VimpCtrl(vimpModel, vimpView);

    // старт back
    backModel = new GameModel();
    backView = new GameView(back, backModel);
    backCtrl = new BackCtrl(backModel, backView);

    // старт radar
    radarModel = new GameModel();
    radarView = new GameView(radar, radarModel);
    radarCtrl = new RadarCtrl(radarModel, radarView);
  }

  // отрисовывает фон игры при ресайзе
  function drawBack(width, height) {
    var img = loader.getItem('background');

    if (img) {
      // очищает back
      backCtrl.remove()

      // создание фона с учетом текущих размеров игры
      backCtrl.parse('background', {
        back: {
          constructor: 'Back',
          image: loader.getResult('background'),
          width: width,
          height: height,
          imgWidth: img.width,
          imgHeight: img.height
        }
      });
    }
  }

  // ресайз игры
  function resize(data) {
    var width = data.width
      , height = data.height;

    back.width = width;
    back.height = height;

    // создание нового фона с учетом новых размеров
    drawBack(back.width, back.height);

    vimp.width = width;
    vimp.height = height;

    radar.width = radar.height =
      Math.round(width * RADAR_PROPORTION);

    gameUpdateAllView();
  }

  // обновляет все представления
  function gameUpdateAllView() {
    backCtrl.update();

    vimpCtrl.update({
      user: vimpUserCache,
      width: vimp.width,
      height: vimp.height
    });

    radarCtrl.update({
      user: radarUserCache,
      ratio: RADAR_SCALE_RATIO,
      width: radar.width,
      height: radar.height
    });
  }

// ДАННЫЕ С СЕРВЕРА

  // поступление начальных данных игры
  // (срабатывает в начале игры)
  // активация игры
  socket.on('auth', function (serverData) {
    // если активация на сервере прошла успешно
    if (serverData.auth === true) {

      // загрузка графических файлов
      loader = new LoadQueue(false);
      loader.onComplete = handleComplete;
      loader.loadManifest(manifest);

      // загрузка данных завершена
      function handleComplete() {
        // флаг при отправке пустого массива
        // При бездействии пользователя информация на
        // сервер не отправляется
        var emptyArr = false
          , cmds = []
          , keys = serverData.keys
          , user = serverData.user;

        // запуск игры
        startGame();

        // создание игрока пользователя
        vimpCtrl.parse(userName, user['vimp']);
        radarCtrl.parse(userName, user['radar']);

        // кеширование
        vimpUserCache = user['vimp']['player'];
        radarUserCache = user['radar'];

        // подписка на события от userModel
        userModel.publisher.on('resize', resize);
        userModel.publisher.on('cmds', function (data) {
          cmds = data;
        });

        // загружаем управление пользователя,
        // полученное с сервера
        userCtrl.updateKeys(keys);

        // подстраиваем размер под размер пользователя
        userCtrl.resize({
          width: window.innerWidth,
          height: window.innerHeight
        });

        // Счетчик: отправляет данные
        // нажатых клавиш на сервер.
        // Если данных нет, то на сервер
        // поступает пустой массив
        // (но только 1 раз!)
        Ticker.addEventListener("tick", function () {
          if (cmds.length !== 0) {
            socket.emit('cmds', cmds);
            emptyArr = false;
          } else if (emptyArr === false) {
            socket.emit('cmds', cmds);
            emptyArr = true;
          }
        });

        // отображение игры
        back.style.display = 'block';
        vimp.style.display = 'block';
        radar.style.display = 'block';
      }
    } else {
      // TODO: авторизация на сервере закончилась
      // неудачей
    }
  });

  // поступление новых данных игры
  socket.on('game', function (data) {
    // TODO: в будещем использование WebWorker
    var i;

    // обновление фона
    // Это срабатывает только когда переместился
    // пользователь. Другие игроки не должны влиять на
    // координаты и вызывать этот метод
    // Эти вычисления должны производится до обновления
    // модели игрока (т.к. используются как старые
    // так и новые данные)
    // вычисляет данные для фона игры
    if (data[userName]) {
      backCtrl.updateCoords({
        oldData: vimpUserCache,
        newData: data[userName]['vimp']['player']
      });

      // кеширование
      vimpUserCache = data[userName]['vimp']['player'];
      radarUserCache = data[userName]['radar'];
    }

    // очистка памяти от объектов
    // TODO: можно разделить на несколько этапов
    // чтоб не создавать нагрузку на систему
    // Например сначала чистим радар, потом игровое
    // полотно
    // TODO: выпилить баг:
    // если после очистки памяти объект не двигается -
    // он не появляется (потому как бездейственные
    // объекты не приходят с сервера)
    // Решение: ПРИСЫЛАТЬ ВСЕ ОБЪЕКТЫ С СЕРВЕРА,
    // ДАЖЕ ТЕ, КОТОРЫЕ НЕ СОВЕРШАЛИ ДЕЙСТВИЙ
    if (iterations === LIMIT_ITERATION) {
      vimpCtrl.remove();
      radarCtrl.remove();
      iterations = 0;
    }

    iterations += 1;

    for (i in data) {
      if (data.hasOwnProperty(i)) {
        vimpCtrl.parse(i, data[i]['vimp']);
        radarCtrl.parse(i, data[i]['radar']);
      }
    }

    // тут будет обновление всех представлений
    gameUpdateAllView();

  });
});
