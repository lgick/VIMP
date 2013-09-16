var mapWidth = 10000
  , mapHeight = 10000;

//  , width = 800
//  , height = 600

  // диапазон значений для перемещения пользователя
  // TODO: это все вычислять на клиенте
//  , uWMax = width / 2 + 50
//  , uWMin = width / 2 - 50
//  , uHMax = height / 2 + 50
//  , uHMin = height / 2 - 50;

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

      // отправка пользователю сообщения о успешной авторизации
      socket.emit('auth', {
        auth: true,
        message: 'auth is true'
      });

      // Объект пользователя с дефолтными значениями
      data = {
        name: params.name,
        color: params.color,
        scale: 100,
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
        gunRotation: 0
      };

      // открыть флаг при первичной отправки данных на клиент
      flag = true;

      // создание ботов для проверки
      bots = utils.getBot({
        sum: 100,
        xMax: mapWidth,
        yMax: mapHeight
      });

      updateGame(bots);

      // рассчет данных и отправка на сервер
      setInterval(function() {
        if (!data.name) {
          return;
        }

        // если данные остались без изменения
        // данные пользователя на сервер не поступают!!!
        var vX = 0
          , vY = 0
          , i
          , len
          , formData = {};

        // данные по умолчанию
        data.status = 'alive';

        // если массив не пуст
        if (cmds.length !== 0) {
          i = 0
          len = cmds.length;

          vX = Math.sin(data.rotation * (Math.PI / -180)) * 16;
          vY = Math.cos(data.rotation * (Math.PI / -180)) * 16;

          for (; i < len; i += 1) {
            // вперед
            if (cmds[i] === 'forward') {
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
                data.scale + 5, false, 300, 30
              );

              data.status = 'update';
            }
            // отдаляет игру
            if (cmds[i] === 'zoomMinus') {
              data.scale = utils.rangeNumber(
                data.scale - 5, false, 300, 30
              );

              data.status = 'update';
            }
            // зум по умолчанию
            if (cmds[i] === 'zoomDefault') {
              data.scale = 100;
              data.status = 'update';
            }
          }

          // ограничения перемещания по карте
          data.x = utils.rangeNumber(data.x, false, mapWidth, 0);
          data.y = utils.rangeNumber(data.y, false, mapHeight, 0);

          flag = true;
        }

        // двигает ботов
        //updateGame(utils.goBot(bots, mapWidth, mapHeight));

        if (flag === true) {
          console.log('отправляю данные всех игроков на клиент');

          // составляем целочисленный объект
          // для отправки на сервер
          formData[data.name] = {
            name: data.name,
            color: data.color,
            scale: data.scale,
            model: data.model,
            typeModel: data.typeModel,
            score: data.score,
            status: data.status,
            x: Math.round(data.x),
            y: Math.round(data.y),
            rotation: data.rotation,
            gunRotation: data.gunRotation
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
