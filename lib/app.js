var mapWidth = 5000
  , mapHeight = 5000;

function create(server) {
  var utils = require('./utils');
  var io = require('socket.io').listen(server);

  io.sockets.on('connection', function (socket) {

    var cmds = [];
    var data = {};
    var bots;
    var flag = false;

    // рассылает данные пользователям
    function updateGame(data) {
      if (typeof data !== 'object') {
        return;
      }

      var object = {}
        , i;

      for (i in data) {
        if(data.hasOwnProperty(i)) {
          object[i] = data[i];
        }
      }

      io.sockets.emit('game', object);
    }

    // инициализация пользователя
    // происходит 1 раз и запускает
    // игровой таймер
    socket.on('user', function (params) {
      // TODO: сейчас по умолчанию ошибок нет
      // и сервер в ЛЮБОМ случае запустит игру
      // В будущем сделать возврат неудачной авторизации

      // Объект пользователя с дефолтными значениями
      data = {
        name: params.name,
        colorA: params.colorA,
        colorB: params.colorB,
        scale: 1,
        model: 'Ship',
        score: 10000,
        // Статус:
        // alive - живой
        // dead - мертвый
        // pause - пауза
        // update - обновление пользовательских данных (объект user)
        status: 'alive',
        x: utils.getRandom(0, mapWidth),
        y: utils.getRandom(0, mapHeight),
        rotation: 180,
        gunRotation: 0,
        flame: false
      };

      // отправка пользователю сообщения о успешной авторизации
      socket.emit('auth', {
        auth: true,
        message: 'auth is true',
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
        },
        user: data
      });

      // открыть флаг при первичной отправки данных на клиент
//      flag = true;

      // создание ботов для проверки
//      bots = utils.getBot({
//        sum: 10,
//        xMax: mapWidth,
//        yMax: mapHeight
//      });
//
//      updateGame(bots);

      // рассчет данных и отправка на сервер
      setInterval(function() {
        if (!data.name) {
          return;
        }

        // если данные остались без изменения
        // данные пользователя на сервер не поступают!!!
        var vX = Math.sin(data.rotation * (Math.PI / -180)) * 32
          , vY = Math.cos(data.rotation * (Math.PI / -180)) * 32
          , i
          , len
          , formData = {
            player: {},
            bullet: {}
          };

        // данные по умолчанию
        data.status = 'alive';

        // если массив не пуст
        if (cmds.length !== 0) {
          i = 0
          len = cmds.length;

          // начальные установки
          data.flame = false;

          for (; i < len; i += 1) {
            // вперед
            if (cmds[i] === 'forward') {
              data.flame = true;
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
            // поворот пушки налево
            if (cmds[i] === 'gLeft') {
              data.gunRotation = utils.rangeNumber(data.gunRotation - 3, false, 100, -100);
            }
            // поворот пушки направо
            if (cmds[i] === 'gRight') {
              data.gunRotation = utils.rangeNumber(data.gunRotation + 3, false, 100, -100);
            }
            // пушка по центру
            if (cmds[i] === 'gCenter') {
              data.gunRotation = 0;
            }
            // приближает игру
            if (cmds[i] === 'zoomPlus') {
              data.scale = utils.rangeNumber(
                data.scale + 0.05, false, 3, 0.5
              );

              data.status = 'update';
            }
            // отдаляет игру
            if (cmds[i] === 'zoomMinus') {
              data.scale = utils.rangeNumber(
                data.scale - 0.05, false, 3, 0.5
              );

              data.status = 'update';
            }
            // зум по умолчанию
            if (cmds[i] === 'zoomDefault') {
              data.scale = 1;
              data.status = 'update';
            }
          }

          // ограничения перемещания по карте
          data.x = utils.rangeNumber(data.x, true, mapWidth, 0);
          data.y = utils.rangeNumber(data.y, true, mapHeight, 0);

          flag = true;
        } else if (data.flame === true) {
          data.flame = false;
          flag = true;
        }

        // двигает ботов
//        updateGame(utils.goBot(bots, mapWidth, mapHeight));

        if (flag === true) {
          console.log('отправляю данные всех игроков на клиент');

          // составляем целочисленный объект
          // для отправки на сервер
          formData['player'][data.name] = {
            name: data.name,
            colorA: data.colorA,
            colorB: data.colorB,
            scale: +(data.scale).toFixed(10),
            model: data.model,
            typeModel: data.typeModel,
            score: data.score,
            status: data.status,
            x: Math.round(data.x),
            y: Math.round(data.y),
            rotation: data.rotation,
            gunRotation: data.gunRotation,
            flame: data.flame
          };

          updateGame(formData);

          // возвращаем флаг в исходное состояние
          flag = false;
        }
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
      bots = null;
      console.log('DISCONNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNECTQ');
    });
  });
}

exports.create = create;
