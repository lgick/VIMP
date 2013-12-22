// TODO: проверять данные авторизации на соответствие
// TODO: проверять и экранировать символы '"&<> во всех пользовательских данных
// TODO: при изменении размеров масштаба браузера (cmd +, cmd -) игра ломается
// TODO: проверять данные при авторизаци (длину логина!!!)
// TODO: если пользователь в браузере заменит стили и вернет авторизационное окно находясь в игре. Нажмет отправить - будет 2 учетки
// TODO: чат огранить количество введенных символов
// TODO: банить голосованием (бан по ip, бан по браузеру (localStorage))
// TODO: отказ в авторизации (или добавления к нику тега (<number>)), если игрок с таким ником уже есть на сервере
var mapWidth = 4000
  , mapHeight = 4000;

function create(server) {
  var utils = require('./utils');
  var io = require('socket.io').listen(server);

  io.sockets.on('connection', function (socket) {

    var cmds = [];
    var users = {};      // данные всех игроков (включая пользователя) для отправки на клиент пользователю
    var user = {};       // данных пользователя
    var userName;
    var userIO = {};     // онлайн игроки
    var flag = false;    // флаг об обновлении данных пользователя
    var botOn = true;    // флаг для включения ботов в игру
    var chatList = []    // чат-лист

    // создание ботов для проверки
    var bots = utils.getBot({
      sum: 30,
      xMax: mapWidth,
      yMax: mapHeight
    });

    // рассылает данные пользователям
    function updateGame() {
      var data = {}
        , i
        , f = false
      ;

      // если боты включены
      if (botOn === true) {
        // обновление ботов
        utils.goBot(bots, mapWidth, mapHeight);

        for (i in bots) {
          if (bots.hasOwnProperty(i)) {
            data[i] = bots[i];
          }
        }
        f = true;
      }

      // если данные пользователя обновлены
      if (flag === true) {
        data[userName] = user;
//        console.log(user);
        f = true;
      }

      if (f === true) {
        io.sockets.emit('game', data);
      }
    }

    // обновляет данные пользователя
    function updateUser(data) {
      user.vimp = {
        player: {
          constructor: 'Ship',
          colorA: data.colorA,
          colorB: data.colorB,
          scale: data.scale,
          x: data.x,
          y: data.y,
          rotation: data.rotation,
          flameStatus: data.flameStatus
        }
      };

      user.radar = {
        constructor: 'Radar',
        colorA: data.colorA,
        colorB: data.colorB,
        scale: data.scale,
        x: data.x,
        y: data.y,
        rotation: data.rotation
      };

      user.back = {
      };

      user.chat = data.chat;
      user.panel = data.panel;
    }

    // инициализация пользователя
    // происходит 1 раз и запускает
    // игровой таймер
    socket.on('user', function (params) {
      // TODO: сейчас по умолчанию ошибок нет
      // и сервер в ЛЮБОМ случае запустит игру
      // В будущем сделать возврат неудачной авторизации
      //
      // TODO: возврат неудачной авторизации,
      // если пользователь с таким именем уже есть в системе


      userName = params.name

      var data = {
        colorA: params.colorA,
        colorB: params.colorB,
        scale: 1,
        x: utils.getRandom(0, mapWidth),
        y: utils.getRandom(0, mapHeight),
        rotation: 270,
        flameStatus: false,
        chat: null
      };

      updateUser(data);

//      console.log('===================================================================================')
//      console.log(user);
//      console.log('===================================================================================')

      // отправка пользователю сообщения о успешной авторизации
      socket.emit('auth', {
        auth: true,
        message: 'auth is true',
        panel: {
          health: 100,
          score: 945800,
          rank: 32 + '/' + 8932
        },
        keys: {
          game: {
            87: 'forward',
            83: 'back',
            65: 'left',
            68: 'right',
            75: 'fire',
            80: 'zoomPlus',
            79: 'zoomMinus',
            81: 'zoomDefault',
            78: 'nitro',
            67: 'cmd'
          },
          cmd: {
            27: 'game',
            13: 'enter',
            38: 'up',
            40: 'down'
          }
        },
        user: user
      });


      // рассчет данных и отправка на сервер
      timer = setInterval(function() {
        if (!userName) {
          return;
        }

        // если данные остались без изменения
        // данные пользователя на сервер не поступают!!!
        var radian = +(data.rotation * (Math.PI / 180)).toFixed(10)
          , vX = Math.cos(radian) * 32
          , vY = Math.sin(radian) * 32
          , i
          , len;

        // если массив не пуст или есть сообщения
        if (cmds.length !== 0 || chatList.length !== 0) {
          i = 0
          len = cmds.length;

          // начальные установки
          data.flameStatus = false;

          for (; i < len; i += 1) {
            // вперед
            if (cmds[i] === 'forward') {
              data.flameStatus = true;
              data.x += vX;
              data.y += vY;
            }
            // назад
            if (cmds[i] === 'back') {
              data.x -= vX;
              data.y -= vY;
            }
            // влево
            if (cmds[i] === 'left') {
              data.rotation = utils.rangeNumber(data.rotation - 4, true);
            }
            // вправо
            if (cmds[i] === 'right') {
              data.rotation = utils.rangeNumber(data.rotation + 4, true);
            }
            // приближает игру
            if (cmds[i] === 'zoomPlus') {
              data.scale = utils.rangeNumber(data.scale + 0.05, false, 3, 0.5);
            }
            // отдаляет игру
            if (cmds[i] === 'zoomMinus') {
              data.scale = utils.rangeNumber(data.scale - 0.05, false, 3, 0.5);
            }
            // зум по умолчанию
            if (cmds[i] === 'zoomDefault') {
              data.scale = 1;
            }
          }

          // ограничения перемещания по карте
          data.x = utils.rangeNumber(data.x, true, mapWidth, 0);
          data.y = utils.rangeNumber(data.y, true, mapHeight, 0);

          // округление данных
          data.scale = +(data.scale).toFixed(10);
          data.x = Math.round(data.x);
          data.y = Math.round(data.y);

          if (chatList.length !== 0) {
            data.chat = chatList.shift();
          } else {
            data.chat = null;
          }

          data.panel = {
            health: data.x,
            score: data.y
          };

          updateUser(data);
          flag = true;

        } else if (data.flameStatus === true) {
          data.flameStatus = false;
          updateUser(data);
          flag = true;
        }

//        console.log('===================================================================================')
//        console.log(user);
//        console.log('===================================================================================')

        updateGame();

        flag = false;
      }, 30);
    });

    // получает команды от пользователя
    socket.on('cmds', function (data) {
      cmds = data;
    });

    // получает сообщения от пользователя
    socket.on('chat', function (data) {
      chatList.push(data);
    });

    // обнуляет данные пользователя
    // при отключении
    socket.on('disconnect', function () {
      cmds = [];
      data = {};
      user = {};
      bots = null;
      botOn = false;
      console.log('DISCONNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNECTQ');
    });
  });
}

exports.create = create;
