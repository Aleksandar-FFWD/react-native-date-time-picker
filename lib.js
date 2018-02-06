function momentRound(moment, precision, key, direction) {
    if (typeof direction === 'undefined') {
        direction = 'round';
    }

    var keys = ['Hours', 'Minutes', 'Seconds', 'Milliseconds'];
    var maxValues = [24, 60, 60, 1000];

    // Capitalize first letter
    key = key.charAt(0).toUpperCase() + key.slice(1).toLowerCase();

    // make sure key is plural
    if (key.indexOf('s', key.length - 1) === -1) {
        key += 's';
    }
    var value = 0;
    var rounded = false;
    var subRatio = 1;
    var maxValue;
    for (var i in keys) {
        var k = keys[i];
        if (k === key && typeof moment._d['get' + key] === "function") {
            value = moment._d['get' + key]();
            maxValue = maxValues[i];
            rounded = true;
        } else if (rounded && typeof moment._d['get' + k] === "function") {
            subRatio *= maxValues[i];
            value += moment._d['get' + k]() / subRatio;
            moment._d['set' + k](0);
        }
    };

    value = Math[direction](value / precision) * precision;
    value = Math.min(value, maxValue);
    moment._d['set' + key](value);

    return moment;
};

export {
    momentRound
};