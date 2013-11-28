<h1>VIMP (в работе)</h1>

<p>
  многопользовательская 2D браузерная игра на javascript
</p>

<img src="https://github.com/hnoe/VIMP/raw/master/public/images/poster.png" alt="poster">


++++++++++++++++++++++++++++
<div>Объект игры</div>

<pre>

>>>>> Сервер --> app.js :

// Example 0
user = {
  Vasya: {
    player: {
    },
    bullet: {
    },
    radar
  },
  Petya: {
  },
  Vova: {
  }
}

// Example 1
user = {
  data: {
    colorA: data.colorA,
    colorB: data.colorB,
    scale: data.scale,
    x: data.x,
    y: data.y,
    rotation: data.rotation
  }
  vimp: {
    player: {
      constructor: 'Ship',
      flameStatus: data.flameStatus
    },
    bullet: {
      constructor: 'Bullet'
    }
  },
  radar: {
    constructor: 'Radar',
  },
  back: {
  }
}

// Example 2
user = {
  vimp: {
    player: {
      constructor: 'Ship',
      colorA: data.colorA,
      colorB: data.colorB,
      scale: data.scale,
      x: data.x,
      y: data.y,
      rotation: data.rotation,
      flameStatus: data.flameStatus
    },
    bullet: {
    }
  },
  radar: {
    constructor: 'Radar',
    colorA: data.colorA,
    colorB: data.colorB,
    scale: data.scale,
    x: data.x,
    y: data.y,
    rotation: data.rotation
  },
  back: {
  }
}

// Example 3
user.player = {
  constructor: 'Ship',
  colorA: data.colorA,
  colorB: data.colorB,
  scale: data.scale,
  x: data.x,
  y: data.y,
  rotation: data.rotation,
  flameStatus: data.flameStatus
};
user.bullet = {};
user.radar = {
  constructor: 'Radar',
  colorA: data.colorA,
  colorB: data.colorB,
  scale: data.scale,
  x: data.x,
  y: data.y,
  rotation: data.rotation
};

>>>>> app.js --> GameCtrl

for (var user in data) {
  gameCtrl.parseInst(user, data[user]);
}

// после этого
gameCtrl.update();


>>>>> GameCtrl --> GameModel

if (!gameModel.read(type, name)) {
  gameModel.create(type, name, constructor, data);
  gameModel.create('player', 'Vasya', 'Ship', {});
  gameModel.create('radar', 'Vasya', 'Radar', {});
} else {
  gameModel.update(type, name, data);
  gameModel.update('player', 'Vasya', {});
  gameModel.update('radar', 'Vasya', {});
}


</pre>

<div>Объект с сервера для конфигурирования</div>

<pre>
  {
    vimp: {
      player: {
        'Ship',
        'Tank'
      },
      bullet: {
        'Ship',
        'Tank'
      },
    },
    radar: {
      
    },
    back: {
    }
  }
</pre>



<!-- User.js - объект пользователя. В нем информация о пользователе.
Player.js - создание объекта Игрок
Bullet.js - создание объекта Пуля
auth.js - авторизация
controller.js - общение с пользователем
transport.js - общение с сервером
view.js - отрисовка на клиенте
CONSTANTS.js - константы


Client(Auth):
{
  name: 'god',
  color: 'red'
}

Server(Auth):
{
  name: 'god',
  x: 120,
  y: 220,
  rotation: 130,
  health: 1000,
  playerType: 1,
  score: 0
}

Client:
['forward', 'fire']

Server:
[
  {
    name: 'god',
    x: 120,
    y: 220,
    rotation: 330,
    playerType: 1,
    score: 300
  },
  {
    name: 'man',
    x: 10,
    y: 20,
    rotation: 130,
    playerType: 6,
    score: 3444
  },
  {
    name: 'ddd',
    x: 90,
    y: 20,
    rotation: 360,
    playerType: 4,
    score: 2406
  },
]


КОНФИГ ПОЛЬЗОВАТЕЛЯ (для изменения вводить set + опцию).
Список опций:
background - фон игры (пример: '#432255')


-->
