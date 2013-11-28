var mapWidth = 5000
  , mapHeight = 5000;

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
    var botOn = false;   // флаг для включения ботов в игру

    // создание ботов для проверки
    var bots = utils.getBot({
      sum: 100,
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
      // Example 2
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
        flameStatus: false
      };

      updateUser(data);

//      console.log('===================================================================================')
//      console.log(user);
//      console.log('===================================================================================')

      // отправка пользователю сообщения о успешной авторизации
      socket.emit('auth', {
        auth: true,
        message: 'auth is true',
        keys: {
          87: 'forward',
          83: 'back',
          65: 'left',
          68: 'right',
          75: 'fire',
          80: 'zoomPlus',
          79: 'zoomMinus',
          81: 'zoomDefault'
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

        // если массив не пуст
        if (cmds.length !== 0) {
//        console.log('vX= ' + vX);
//        console.log('vY= ' + vY);
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
