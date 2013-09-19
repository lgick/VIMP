var utils = {
  // возвращает случайное целое число в заданном диапазоне
  getRandom: function (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },

  // возвращает объект с игроками ботами
  // TODO: еще может поменятся!
  getBot: function (params) {
    var bots = {}
      , sum = params.sum || 20
      , xMin = params.xMin || 0
      , xMax = params.xMax || 800
      , yMin = params.yMin || 0
      , yMax = params.yMax || 600
      , rMin = params.rMin || 0
      , rMax = params.rMax || 360
      , count = 0
      , botName;

    while (count < sum) {
      botName = 'вася#' + count;
      bots[botName] = {
        name: botName,
        color: 'rgb(' +
          this.getRandom(0, 255) + ', ' +
          this.getRandom(0, 255) + ', ' +
          this.getRandom(0, 255) + ')',
        scale: 100,
        model: 'Ship',
        score: 10000,
        status: 'alive',
        x: this.getRandom(xMin, xMax),
        y: this.getRandom(yMin, yMax),
        rotation: this.getRandom(rMin, rMax),
        gunRotation: 0
      };

      count += 1;
    }

    return bots;
  },

  // передвигает ботов
  goBot: function (bots, mapWidth, mapHeight) {
    var vX
      , vY
      , r
      , i;

    for (i in bots) {
      if (bots.hasOwnProperty(i)) {
        r = bots[i].rotation;
        vX = Math.sin(r * (Math.PI / -180)) * 16;
        vY = Math.cos(r * (Math.PI / -180)) * 16;
        bots[i].x += Math.round(vX);
        bots[i].y += Math.round(vY);
       // bots[i].rotation = this.rangeNumber(r + 4, true);
        bots[i].x = this.rangeNumber(bots[i].x, false, mapWidth, 0);
        bots[i].y = this.rangeNumber(bots[i].y, false, mapHeight, 0);
      }
    }

    return bots;
  },

  // проверяет число в заданном диапазоне
  // Если repeat === true, то диапазон зациклен
  // Если repeat === false, то диапазон ограничен значениями
  // Возвращает значение
  rangeNumber: function (value, repeat, max, min) {
    var repeat = repeat || false
      , max = max || 360
      , min = min || 0;

    // зациклить
    if (repeat === true) {
      if (value <= min) {
        value = max + value;
      }
      if (value >= max) {
        value = value - max;
      }
    // не зацикливать
    } else {
      if (value <= min) {
        value = min;
      }
      if (value >= max) {
        value = max;
      }
    }

    return value;
  }
};

module.exports = utils;

//var bots = {};
//
//// возвращает случайное целое число в заданном диапазоне
//function getRandom(min, max) {
//  return Math.floor(Math.random() * (max - min + 1)) + min;
//}
//
//// возвращает объект с игроками ботами
//// TODO: еще может поменятся!
//function getBot(params) {
//  var sum = params.sum || 20
//    , xMin = params.xMin || 0
//    , xMax = params.xMax || 800
//    , yMin = params.yMin || 0
//    , yMax = params.yMax || 600
//    , rMin = params.rMin || 0
//    , rMax = params.rMax || 360
//    , count = 0
//    , botName;
//
//  while (count < sum) {
//    botName = 'вася#' + count;
//    bots[botName] = {
//      user : {
//        name: botName,
//        color: 'rgb(' +
//          getRandom(0, 255) + ', ' +
//          getRandom(0, 255) + ', ' +
//          getRandom(0, 255) + ')'
//      },
//      x: getRandom(xMin, xMax),
//      y: getRandom(yMin, yMax),
//      rotation: getRandom(rMin, rMax)
//    };
//
//    count += 1;
//  }
//
//  return bots;
//}
//
//// передвигает ботов
//function goBot(mapWidth, mapHeight) {
//  var vX
//    , vY
//    , r
//    , i;
//
//  for (i in bots) {
//    if (bots.hasOwnProperty(i)) {
//      r = bots[i].rotation;
//      vX = Math.sin(r * (Math.PI / -180)) * 16;
//      vY = Math.cos(r * (Math.PI / -180)) * 16;
//      bots[i].x += Math.round(vX);
//      bots[i].y += Math.round(vY);
//      bots[i].rotation = rangeNumber(r + 4, true);
//      bots[i].x = rangeNumber(bots[i].x, false, mapWidth, 0);
//      bots[i].y = rangeNumber(bots[i].y, false, mapHeight, 0);
//    }
//  }
//
//  return bots;
//}
//
//// проверяет число в заданном диапазоне
//// Если repeat === true, то диапазон зациклен
//// Если repeat === false, то диапазон ограничен значениями
//// Возвращает значение
//function rangeNumber(value, repeat, max, min) {
//  var repeat = repeat || false
//    , max = max || 360
//    , min = min || 0;
//
//  // зациклить
//  if (repeat === true) {
//    if (value <= min) {
//      value = max + value;
//    }
//    if (value >= max) {
//      value = value - max;
//    }
//  // не зацикливать
//  } else {
//    if (value <= min) {
//      value = min;
//    }
//    if (value >= max) {
//      value = max;
//    }
//  }
//
//  return value;
//}
//
//exports.getRandom = getRandom;
//exports.getBot = getBot;
//exports.goBot = goBot;
//exports.rangeNumber = rangeNumber;
