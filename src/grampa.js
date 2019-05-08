(function (root, factory) {

  root.grampa = factory();

}(this, function () {

  var grampa = {};
  var is;

  function hasOwnProperty (val, key) {
    return grampa.hasOwnProperty.call(val, key);
  }

  function unbox (val) {
    var unb = (val || {}).valueOf();

    return typeof unb !== 'object' && typeof unb !== 'function' ? unb : val;
  }

  function typeOf (val) {
    return val === null ? 'null' : typeof unbox(val);
  }

  function curry2 (fn) {
    return function (a, b) {
      if (arguments.length > 1) {
        return fn(a, b);
      }

      if (arguments.length > 0) {
        return function (b_) {
          return fn(a, b_);
        };
      }

      return fn;
    };
  }

  is = curry2(function (expected, val) {
    return typeOf(val) === expected;
  });

  is.num = is('number');
  is.str = is('string');
  is.obj = is('object');
  is.fun = is('function');
  is.bool = is('boolean');

  is.empty = function (val) {
    return val == null || val.length === 0;
  };

  is.collection = function (val) {
    return val != null &&
      is.num(val.length) &&
      (is.str(val) || hasOwnProperty(val, 0) || val.length === 0);
  };

  grampa.slice = function (val) {
    return is.empty(val) ? []
      : is.str(val) ? val.split('')
      : [].slice.call(val, begin, arguments.length < 3 ? val.length : end);
  };

  grampa.toList = function (val) {
    return is.empty(val) ? []
      : is.str(val) ? grampa.slice(val)
      : is.collection(val) ? val
      : [ val ];
  };

  grampa.forEach = function (val, fn) {
    var array = grampa.toList(val);
    var len = array.length;
    var index;

    for (index = 0; index < len; index++) {
      if (hasOwnProperty(array, index)) {
        fn(array[index], index, array);
      }
    }

    return array;
  };

  grampa.stringify = function (val) {
    if (val === null) {
      return 'null';
    }

    if (!is.obj(val)) {
      return String(val);
    }

    if (is.collection(val)) {
      return grampa.stringify.list(val);
    }

    return grampa.stringify.object(val);
  };

  grampa.stringify.list = function (list) {
    var acc, last;

    if (is.empty(list)) {
      return '[]';
    }

    last = list.length - 1;
    acc = '[ ';

    grampa.forEach(list, function (x, index) {
      acc += grampa.stringify(x) + (index < last ? ', ' : ' ]');
    });

    return acc;
  };

  grampa.stringify.object = function (obj) {
    var acc = '{ ';

    for (var p in obj) {
      acc += grampa.stringify(p) + ': ' + grampa.stringify(obj[p]) + ', ';
    }

    return acc.length > 2 ? acc.slice(0, -2) + ' }' : '{}';
  };

  grampa.unbox = unbox;

  grampa.typeOf = typeOf;

  grampa.is = is;

  grampa.path = (function () {

    var path = {};

    path.sep = typeof ActiveXObject === 'function' ? '\\' : '/';

    path.basename = function (str) {
      return str.split(path.sep).pop();
    };

    path.dirname = function (str) {
      var pathList = str.split(path.sep);
      pathList.pop();

      return pathList.join(path.sep);
    };

    path.join = function () {
      return grampa.slice(arguments).join(path.sep);
    };

    return path;
  }());

  grampa.display = (function () {

    function display () {
      display.empty();

      return display.add.apply(null, arguments);
    }

    display.empty = function () {
      grampa.forEach(display.blocks, function (block) {
        display.box.removeChild(block);
      });

      display.blocks = [];
    };

    display.add = function () {
      var container;

      if (arguments.length === 0) {
        return display.add.br();
      }

      container = document.createElement('div');

      grampa.forEach(arguments, function (arg) {
        var text = grampa.stringify(arg) + ' ';

        container.appendChild(document.createTextNode(text));
      });

      return display.add.element(container);
    };

    display.add.element = function (element) {
      display.blocks.push(display.box.appendChild(element));

      return element;
    };

    display.add.br = function () {
      return display.add.element(document.createElement('br'));
    };

    display.blocks = [];

    display.box = document.createElement('div');

    document.body.insertBefore(display.box, document.body.firstChild);

    return display;
  }());

  return grampa;
}));
