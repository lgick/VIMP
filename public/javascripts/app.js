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
    , userName = localStorage.userName || ''
    , userColorA = localStorage.userColorA || '#333333'
    , userColorB = localStorage.userColorB || '#444444'

    , document = window.document

    , socket = io.connect('http://localhost:3000')
    , LoadQueue = createjs.LoadQueue
    , Ticker = createjs.Ticker

      // AUTH MODEL
    , AUTH_REGEXP_NAME = /^[a-zA-Z]([\w\s#]{0,13})[\w]{1}$/
    , AUTH_REGEXP_COLOR = /^#(?:[0-9a-fA-F]{3}){1,2}$/
    , AUTH_REGEXP_MODEL = /Ship/

      // AUTH VIEW
    , AUTH_ID = 'auth'
    , AUTH_NAME_ID = 'auth-name'
    , AUTH_COLORS_ID = 'auth-colors'
    , AUTH_COLOR_RADIO_ID = 'auth-color-radio'
    , AUTH_COLOR_INPUT_ID = 'auth-color-input'
    , AUTH_COLOR_PREVIEW_ID = 'auth-color-preview'
    , AUTH_ERROR_ID = 'auth-error'
    , AUTH_ENTER_ID = 'auth-enter'
    , AUTH_COLOR_TYPE = 'colorA'

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
    , USER_PANEL = ['health', 'score', 'rank']  // пользовательская панель

      // USER VIEW
    , CHAT_BOX_ID = 'chat-box'
    , CMD_ID = 'cmd'
    , PANEL_HEALTH_ID = 'panel-health'
    , PANEL_SCORE_ID = 'panel-score'
    , PANEL_RANK_ID = 'panel-rank'



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

      // DOM
    , auth = document.getElementById(AUTH_ID)
    , authName = document.getElementById(AUTH_NAME_ID)
    , authColors = document.getElementById(AUTH_COLORS_ID)
    , authColorRadio = document.getElementById(AUTH_COLOR_RADIO_ID)
    , authColorInput = document.getElementById(AUTH_COLOR_INPUT_ID)
    , authColorPreview = document.getElementById(AUTH_COLOR_PREVIEW_ID)
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
      , authCtrl;

    authModel = new AuthModel({
      name: AUTH_REGEXP_NAME,
      color: AUTH_REGEXP_COLOR,
      model: AUTH_REGEXP_MODEL
    });
    authView = new AuthView(authModel, {
      auth: auth,
      name: authName,
      colorsSelect: authColors,
      colorRadio: authColorRadio,
      colorInput: authColorInput,
      colorPreview: authColorPreview,
      // TODO: colorType нарушает структуру MVC,
      // но существенно упрощает код
      colorType: AUTH_COLOR_TYPE,
      error: authError,
      enter: authEnter
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
        colorA: userColorA,
        colorB: userColorB
      },
      ship2: {
        constructor: 'Ship',
        x: 90,
        y: 35,
        scaleX: 1.4,
        scaleY: 1.4,
        rotation: 270,
        colorA: userColorA,
        colorB: userColorB
      }
    });

    authCtrl.parseData([
      {name: 'name', type: 'name', value: userName},
      {name: 'colorA', type: 'color', value: userColorA},
      {name: 'colorB', type: 'color', value: userColorB},
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
    userModel = new UserModel({
      chatListLimit: CHAT_LIST_LIMIT,
      chatLineTime: CHAT_LINE_TIME,
      chatCacheMin: CHAT_CACHE_MIN,
      chatCacheMax: CHAT_CACHE_MAX,
      mode: USER_MODE,
      panel: USER_PANEL
    });
    userView = new UserView(userModel, {
      window: window,
      cmd: cmd,
      chatBox: chatBox,
      panelHealth: panelHealth,
      panelScore: panelScore,
      panelRank: panelRank
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
  // TODO перенести в userView
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
          , gameKeys = []
          , userKeys = serverData.keys
          , userPanel = serverData.panel
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
        userModel.publisher.on('gameKeys', function (data) {
          gameKeys = data;
        });
        userModel.publisher.on('chat', function (message) {
          socket.emit('chat', {
            name: userName,
            text: message
          });
        });

        // загружаем пользовательские настройки,
        // полученное с сервера
        userCtrl.updateKeys(userKeys);
        userCtrl.updatePanel(userPanel);

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
        Ticker.addEventListener('tick', function () {
          if (gameKeys.length !== 0) {
            socket.emit('cmds', gameKeys);
            emptyArr = false;
          } else if (emptyArr === false) {
            socket.emit('cmds', gameKeys);
            emptyArr = true;
          }
        });

        // отображение игры
        back.style.display = 'block';
        vimp.style.display = 'block';
        radar.style.display = 'block';
        panel.style.display = 'block';
        chat.style.display = 'block';
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
        newData: data[userName]['vimp']['player']
      });

      // КЕШИРОВАНИЕ
      vimpUserCache = data[userName]['vimp']['player'];
      radarUserCache = data[userName]['radar'];

      // ОБНОВЛЕНИЕ ЧАТА
      if (data[userName]['chat']) {
        userCtrl.updateChat(data[userName]['chat']);
      }

      // ОБНОВЛЕНИЕ ПАНЕЛИ
      if (data[userName]['panel']) {
        userCtrl.updatePanel(data[userName]['panel']);
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
