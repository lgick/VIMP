require([
  'io', 'createjs',
  'AuthModel', 'AuthView', 'AuthCtrl',
  'UserModel', 'UserView', 'UserCtrl',
  'GameModel', 'GameView',
  'VimpCtrl', 'BackCtrl', 'RadarCtrl',
  'Factory',
  'BackParts', 'RadarParts',
  'HalkParts', 'FlatParts'
], function (
  io, createjs,
  AuthModel, AuthView, AuthCtrl,
  UserModel, UserView, UserCtrl,
  GameModel, GameView,
  VimpCtrl, BackCtrl, RadarCtrl,
  Factory,
  BackParts, RadarParts,
  HalkParts, FlatParts
) {

  var window = this
    , document = window.document
    , localStorage = window.localStorage

    , userName = localStorage.userName || ''
    , userColorA = localStorage.userColorA || '#333333'
    , userColorB = localStorage.userColorB || '#444444'
    , userModelType = localStorage.userModelType || 'Halk'

    , socket = io.connect('', {
        reconnect: false
      })

    , LoadQueue = createjs.LoadQueue
    , ticker = createjs.Ticker

      // AUTH MODEL
    , AUTH_COLOR_TYPE = 'colorA'
    , AUTH_REGEXP_NAME = /^[a-zA-Z]([\w\s#]{0,13})[\w]{1}$/
    , AUTH_REGEXP_COLOR = /^#(?:[0-9a-fA-F]{3}){1,2}$/
    , AUTH_REGEXP_MODEL = /^Halk$|^Flat$/

      // AUTH VIEW
    , AUTH_ID = 'auth'
    , AUTH_FORM_ID = 'auth-form'
    , AUTH_NAME_INPUT_ID = 'auth-name-input'
    , AUTH_COLOR_INPUT_ID = 'auth-color-input'
    , AUTH_PREVIEW_ID = 'auth-preview'
    , AUTH_ERROR_ID = 'auth-error'
    , AUTH_ENTER_ID = 'auth-enter'

      // MODULE ID
    , CANVAS_BACK_ID = 'back'
    , CANVAS_VIMP_ID = 'vimp'
    , CANVAS_RADAR_ID = 'radar'
    , PANEL_ID = 'panel'
    , CHAT_ID = 'chat'

      // USER MODEL
    , CHAT_LIST_LIMIT = 5    // количество выводимых на экран сообщений
    , CHAT_LINE_TIME = 15000 // время жизни строки чата (в ms)
    , CHAT_CACHE_MIN = 200   // минимально допустимое количество сообщений в памяти
    , CHAT_CACHE_MAX = 300   // максимально допустимое количество сообщений в памяти
    , USER_MODE = 'game'     // дефолтный пользовательский режим
    , USER_PANEL = ['health', 'score', 'rank']     // пользовательская панель
    , SIZE_RATIO = {vimp: 1, back: 1, radar: 0.15} // пропорции элементов при ресайзе

      // USER VIEW
    , CHAT_BOX_ID = 'chat-box'
    , CMD_ID = 'cmd'
    , PANEL_HEALTH_ID = 'panel-health'
    , PANEL_SCORE_ID = 'panel-score'
    , PANEL_RANK_ID = 'panel-rank'

      // ERROR
    , ERROR_ID = 'error'


    , RADAR_SCALE_RATIO = 20

      // Частота полной очистки памяти от объектов
      // Измеряется в количестве обновлений поступивших
      // с сервера.
      // Чем выше этот параметр, тем больше будет
      // объектов храниться в памяти и тем проще будет с
      // ними работать.
      // После достижения лимита вся память будет очищена
      // и объекты будут создаваться заново
    , MEMORY_ITERATION_LIMIT = 100

    , loader
      // TODO: перенести это на сервер
      // и выдавать в случае удачной авторизации
    , manifest = [
        {
          id: 'background',
          src: '/img/space.jpg',
          width: 500,
          height: 500
        }
      ]

      // число обновлений с сервера
    , iterations = 0

      // кеш данных пользователя при последнем обновлении
    , vimpUserCache = null
    , radarUserCache = null

      // DOM
    , auth = document.getElementById(AUTH_ID)
    , authForm = document.getElementById(AUTH_FORM_ID)
    , authName = document.getElementById(AUTH_NAME_INPUT_ID)
    , authColor = document.getElementById(AUTH_COLOR_INPUT_ID)
    , authPreview = document.getElementById(AUTH_PREVIEW_ID)
    , authError = document.getElementById(AUTH_ERROR_ID)
    , authEnter = document.getElementById(AUTH_ENTER_ID)
    , back = document.getElementById(CANVAS_BACK_ID)
    , vimp = document.getElementById(CANVAS_VIMP_ID)
    , radar = document.getElementById(CANVAS_RADAR_ID)
    , chat = document.getElementById(CHAT_ID)
    , chatBox = document.getElementById(CHAT_BOX_ID)
    , cmd = document.getElementById(CMD_ID)
    , panel = document.getElementById(PANEL_ID)
    , panelHealth = document.getElementById(PANEL_HEALTH_ID)
    , panelScore = document.getElementById(PANEL_SCORE_ID)
    , panelRank = document.getElementById(PANEL_RANK_ID)
    , error = document.getElementById(ERROR_ID)

    , userModel = null
    , userCtrl = null

    , vimpCtrl = null
    , backCtrl = null
    , radarCtrl = null
  ;

  // инициализация конструкторов игры
  Factory.add('Back', BackParts);
  Factory.add('Radar', RadarParts);
  Factory.add('Halk', HalkParts);
  Factory.add('Flat', FlatParts);

  // авторизация пользователя
  function authUser() {
    var authModel
      , authView
      , authCtrl;

    authModel = new AuthModel({
      data: {
        name: userName,
        colorA: userColorA,
        colorB: userColorB,
        model: userModelType
      },
      listExp: {
        name: AUTH_REGEXP_NAME,
        colorA: AUTH_REGEXP_COLOR,
        colorB: AUTH_REGEXP_COLOR,
        model: AUTH_REGEXP_MODEL
      },
      colorType: AUTH_COLOR_TYPE,
      socket: socket
    });

    authView = new AuthView(authModel, {
      auth: auth,
      form: authForm,
      name: authName,
      color: authColor,
      preview: authPreview,
      error: authError,
      enter: authEnter
    });

    authCtrl = new AuthCtrl(authModel, authView);

    // инициализация авторизации
    authCtrl.init([
      {name: 'cType', value: AUTH_COLOR_TYPE},
      {name: 'name', value: userName},
      {name: 'color', value: userColorA},
      {name: 'model', value: userModelType}
    ]);
  }
  authUser();

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
    userModel = new UserModel({
      chatListLimit: CHAT_LIST_LIMIT,
      chatLineTime: CHAT_LINE_TIME,
      chatCacheMin: CHAT_CACHE_MIN,
      chatCacheMax: CHAT_CACHE_MAX,
      mode: USER_MODE,
      panel: USER_PANEL,
      sizeRatio: SIZE_RATIO,
      socket: socket,
      ticker: ticker
    });
    userView = new UserView(userModel, {
      window: window,
      modules: [back, vimp, radar, chat, panel],
      panel: {
        health: panelHealth,
        score: panelScore,
        rank: panelRank
      },
      cmd: cmd,
      chatBox: chatBox
    });
    userCtrl = new UserCtrl(userModel, userView);

    // старт vimp
    vimpModel = new GameModel();
    vimpView = new GameView(vimpModel, vimp);
    vimpCtrl = new VimpCtrl(vimpModel, vimpView);

    // старт back
    backModel = new GameModel();
    backView = new GameView(backModel, back);
    backCtrl = new BackCtrl(backModel, backView);

    // старт radar
    radarModel = new GameModel();
    radarView = new GameView(radarModel, radar);
    radarCtrl = new RadarCtrl(radarModel, radarView);
  }

  // отрисовывает фон игры при ресайзе
  function drawBack(data) {
    var img = loader.getItem('background');

    if (img) {
      // очищает back
      backCtrl.remove();

      // создание фона с учетом текущих размеров игры
      backCtrl.parse('background', {
        back: {
          constructor: 'Back',
          image: loader.getResult('background'),
          width: data.width,
          height: data.height,
          imgWidth: img.width,
          imgHeight: img.height
        }
      });
    }
  }

  // ресайз игры
  function resize(data) {
    if (data.name === 'back') {
      drawBack(data);
    }

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

  // переподключение к серверу
  function reconnect() {
    socket.once('error', function () {
      window.setTimeout(reconnect, 500);
    });

    socket.socket.connect();
  }

// ДАННЫЕ С СЕРВЕРА

  // поступление начальных данных игры
  // (срабатывает в начале игры)
  // активация игры
  socket.on('auth', function (serverData) {
    // если активация на сервере прошла успешно
    if (serverData.auth === true) {
      // запись авторизационных данных в хранилище
      userName = localStorage.userName = serverData.user.name;
      userColorA = localStorage.userColorA = serverData.user.colorA;
      userColorB = localStorage.userColorB = serverData.user.colorB;
      userModelType = localStorage.userModelType = serverData.user.model;

      // загрузка графических файлов
      loader = new LoadQueue(false);
      loader.loadManifest(manifest);

      // событие при завершении загрузки
      loader.on("complete", function () {
        var game = serverData.game;

        // запуск игры
        startGame();

        // создание игрока пользователя
        vimpCtrl.parse(userName, game.vimp);
        radarCtrl.parse(userName, game.radar);

        // кеширование
        vimpUserCache = game.vimp.player;
        radarUserCache = game.radar;

        userModel.publisher.on('resize', resize);

        // инициализация
        userCtrl.init({
          keys: serverData.keys,
          panel: serverData.panel,
          size: {
            width: window.innerWidth,
            height: window.innerHeight
          }
        });
      });
    } else {
      // TODO: авторизация на сервере закончилась неудачей
      authUser();
    }
  });

  // поступление новых данных игры
  socket.on('game', function (data) {
    var p;

    // обновление данных игрока
    if (data[userName]) {
      // ОБНОВЛЕНИЕ ФОНА
      // Это срабатывает только когда переместился
      // пользователь. Другие игроки не должны влиять на
      // координаты и вызывать этот метод
      // Эти вычисления должны производится до обновления
      // модели игрока (т.к. используются как старые
      // так и новые данные)
      // вычисляет данные для фона игры
      backCtrl.updateCoords({
        oldData: vimpUserCache,
        newData: data[userName].vimp.player
      });

      // КЕШИРОВАНИЕ
      vimpUserCache = data[userName].vimp.player;
      radarUserCache = data[userName].radar;

      // ОБНОВЛЕНИЕ ЧАТА
      if (data[userName].chat) {
        userCtrl.updateChat(data[userName].chat);
      }

      // ОБНОВЛЕНИЕ ПАНЕЛИ
      if (data[userName].panel) {
        userCtrl.updatePanel(data[userName].panel);
      }
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
    if (iterations === MEMORY_ITERATION_LIMIT) {
      vimpCtrl.remove();
      radarCtrl.remove();
      iterations = 0;
    }

    iterations += 1;

    for (p in data) {
      if (data.hasOwnProperty(p)) {
        vimpCtrl.parse(p, data[p].vimp);
        radarCtrl.parse(p, data[p].radar);
      }
    }

    // тут будет обновление всех представлений
    gameUpdateAllView();

  });



  // Ошибки соединения
  socket.on('connect', function () {
    error.innerHTML = '';
    error.style.display = 'none';
  });

  socket.on('disconnect', function () {
    error.innerHTML = 'Server disconnect :(';
    error.style.display = 'block';
    window.setTimeout(reconnect, 500);
  });

  socket.on('reconnect_failed', function () {
    error.innerHTML = 'Server reconnect failed :(';
    error.style.display = 'block';
  });

  socket.on('connect_failed', function () {
    error.innerHTML = 'Server connect failed :(';
    error.style.display = 'block';
  });
});
