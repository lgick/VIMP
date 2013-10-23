require([
  'io', 'preloadjs', 'createjs',
  'Publisher',
  'AuthModel', 'AuthView', 'AuthCtrl',
  'UserModel', 'UserView', 'UserCtrl',
  'GameModel', 'GameView', 'GameCtrl',
  'Factory',
  'BackModel', 'ShipModel', 'RadarModel'
], function (
  io, preloadjs, createjs,
  Publisher,
  AuthModel, AuthView, AuthCtrl,
  UserModel, UserView, UserCtrl,
  GameModel, GameView, GameCtrl,
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

    , back = document.getElementById(CANVAS_BACK_ID)
    , vimp = document.getElementById(CANVAS_VIMP_ID)
    , radar = document.getElementById(CANVAS_RADAR_ID)

    , userModel = null
    , userView = null
    , userCtrl = null

    , gameModel = null
    , gameCtrl = null
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
    authModel.validate(
      {name: 'model', type: 'model', value: 'Ship'}
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

  // стартует игру
  function startGame() {
    userModel = new UserModel();
    userView = new UserView(window);
    userCtrl = new UserCtrl(userModel, userView);

    // модель игры
    gameModel = new GameModel({
      player: {},
      radar: {},
      bullet: {},
      back: {}
    });

    // контроллер игры (медиатор)
    gameCtrl = new GameCtrl(gameModel, {
      back: new GameView(back),
      vimp: new GameView(vimp),
      radar: new GameView(radar)
    });
  }

  // отрисовывает фон игры
  function drawBack(width, height) {
    var img = loader.getItem('background');

    if (img) {
      // если фон уже есть удаляем его
      if (gameModel.read('back', 'background')) {
        gameModel.clear(['back']);
      }

      // создание фона с учетом текущих размеров игры
      gameModel.create(
        'back', 'background', 'Back',
        {
          image: loader.getResult('background'),
          width: width,
          height: height,
          imgWidth: img.width,
          imgHeight: img.height
        }
      );
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
    var uPlayer = gameModel.read('player', userName)
      , uRadar = gameModel.read('radar', userName);

    gameCtrl.update('back');

    gameCtrl.update('vimp', {
      user: uPlayer,
      ratio: 1,
      width: vimp.width,
      height: vimp.height
    });

    gameCtrl.update('radar', {
      user: uRadar,
      ratio: RADAR_SCALE_RATIO,
      width: radar.width,
      height: radar.height
    });
  }

// ДАННЫЕ С СЕРВЕРА

  // поступление начальных данных игры
  // (срабатывает в начале игры)
  // активация игры
  // TODO: присылать данные для юзера тут!
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

        // cоздание игрока пользователя
        gameModel.create(
          'player', userName, user.model, user
        );

        // создание игрока пользователя на радаре
        gameModel.create(
          'radar', userName, 'Radar', user
        );

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
    }
  });

  // поступление новых данных игры
  socket.on('game', function (data) {
    // TODO: в будещем использование WebWorker
    // чтобы снять нагрузку
    var player = data.player
      , bullet = data.bullet
      , i;

    // обновление фона
    // Это срабатывает только когда переместился
    // пользователь. Другие игроки не должны влиять на
    // координаты и вызывать этот метод
    // Эти вычисления должны производится до обновления
    // модели игрока (т.к. используются как старые
    // так и новые данные)
    // вычисляет данные для фона игры
    if (player[userName]) {
      var back = gameModel.read('back', 'background')
        , oldData = gameModel.read('player', userName)
        , newData = player[userName]
        , scale = newData.scale
        , backX = newData.x - oldData.x
        , backY = newData.y - oldData.y;

      // если x или y не равны 0
      if (back && backX || backY) {
        back.update({
          x: backX,
          y: backY,
          scale: scale
        });
      }
    }

    // очистка памяти от объектов
    // TODO: можно разделить на несколько этапов
    // чтоб не создавать нагрузку на систему
    // Например сначала чистим радар, потом игровое
    // полотно
    if (iterations >= LIMIT_ITERATION) {
      iterations = 0;
      gameModel.clear(['player', 'bullet', 'radar']);
    }

    iterations += 1;

//    console.log(iterations);

    // работает с моделями на vimp и radar
    for (i in player) {
      if (player.hasOwnProperty(i)) {

        // если игрок есть - обновить данные
        if (gameModel.read('player', i)) {
//          console.log('обновление экземпляра');
          gameModel.update('player', i, player[i]);
          gameModel.update('radar', i, player[i]);

        // иначе создать игрока
        } else {
//          console.log('cоздание экземпляра');
          gameModel.create('player', i, player[i].model, player[i]);
          gameModel.create('radar', i, 'Radar', player[i]);
        }
      }
    }

    // тут будет обновление всех представлений
    gameUpdateAllView();
  });
});
