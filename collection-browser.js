!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.c=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
'use strict';

// pass an Array-like constructor to the exported function
// where appropriate, fast.js functions will return instances of that object
// defaults to Array.
module.exports = function( ctor ) {

  if (ctor == null) {
    ctor = Array;
  }

  // This will return true for instances of Array constructors from other execution contexts.
  // Probably needs edge-case testing.
  var isArrayLike = function(obj) {
    return Object.prototype.toString.call(obj) === '[object Array]';
  };

  // maybe should throw if isArrayLike(new ctor()) is false?

  var methods = {
    /**
     * # Bind
     * Analogue of `Function::bind()`.
     *
     * ```js
     * var bind = require('fast.js').bind;
     * var bound = bind(myfunc, this, 1, 2, 3);
     *
     * bound(4);
     * ```
     *
     *
     * @param  {Function} fn          The function which should be bound.
     * @param  {Object}   thisContext The context to bind the function to.
     * @param  {mixed}    args, ...   Additional arguments to pre-bind.
     * @return {Function}             The bound function.
     */
    bind: function fastBind (fn, thisContext) {
      var boundLength = arguments.length - 2,
          boundArgs;

      if (boundLength > 0) {
        boundArgs = new ctor(boundLength);
        for (var i = 0; i < boundLength; i++) {
          boundArgs[i] = arguments[i + 2];
        }
        return function () {
          var length = arguments.length,
              args = new ctor(boundLength + length),
              i;
          for (i = 0; i < boundLength; i++) {
            args[i] = boundArgs[i];
          }
          for (i = 0; i < length; i++) {
            args[boundLength + i] = arguments[i];
          }
          return fn.apply(thisContext, args);
        };
      }
      else {
        return function () {
          var length = arguments.length,
              args = new ctor(length),
              i;
          for (i = 0; i < length; i++) {
            args[i] = arguments[i];
          }
          return fn.apply(thisContext, args);
        };
      }
    },

    /**
     * # Partial Application
     *
     * Partially apply a function. This is similar to `.bind()`,
     * but with one important difference - the returned function is not bound
     * to a particular context. This makes it easy to add partially
     * applied methods to objects. If you need to bind to a context,
     * use `.bind()` instead.
     *
     *
     * @param  {Function} fn          The function to partially apply.
     * @param  {mixed}    args, ...   Arguments to pre-bind.
     * @return {Function}             The partially applied function.
     */
    partial: function fastPartial (fn) {
      var boundLength = arguments.length - 1,
          boundArgs;

      boundArgs = new ctor(boundLength);
      for (var i = 0; i < boundLength; i++) {
        boundArgs[i] = arguments[i + 1];
      }
      return function () {
        var length = arguments.length,
            args = new ctor(boundLength + length),
            i;
        for (i = 0; i < boundLength; i++) {
          args[i] = boundArgs[i];
        }
        for (i = 0; i < length; i++) {
          args[boundLength + i] = arguments[i];
        }
        return fn.apply(this, args);
      };
    },

    /**
     * # Clone
     *
     * Clone an item. Primitive values will be returned directly,
     * arrays and objects will be shallow cloned. If you know the
     * type of input you're dealing with, call `.cloneArray()` or `.cloneObject()`
     * instead.
     *
     * @param  {mixed} input The input to clone.
     * @return {mixed}       The cloned input.
     */
    clone: function clone (input) {
      if (!input || typeof input !== 'object') {
        return input;
      }
      else if (isArrayLike(input)) {
        return methods.cloneArray(input);
      }
      else {
        return methods.cloneObject(input);
      }
    },

    /**
     * # Clone Array
     *
     * Clone an array or array like object (e.g. `arguments`).
     * This is the equivalent of calling `Array.prototype.slice.call(arguments)`, but
     * significantly faster.
     *
     * @param  {Array} input The array or array-like object to clone.
     * @return {Array}       The cloned array.
     */
    cloneArray: function fastCloneArray (input) {
      var length = input.length,
          sliced = new ctor(length),
          i;
      for (i = 0; i < length; i++) {
        sliced[i] = input[i];
      }
      return sliced;
    },

    /**
     * # Clone Object
     *
     * Shallow clone a simple object.
     *
     * > Note: Prototypes and non-enumerable properties will not be copied!
     *
     * @param  {Object} input The object to clone.
     * @return {Object}       The cloned object.
     */
    cloneObject: function fastCloneObject (input) {
      var keys = Object.keys(input),
          total = keys.length,
          cloned = {},
          i, key;

      for (i = 0; i < total; i++) {
        key = keys[i];
        cloned[key] = input[key];
      }

      return cloned;
    },


    /**
     * # Concat
     *
     * Concatenate multiple arrays.
     *
     * > Note: This function is effectively identical to `Array.prototype.concat()`.
     *
     *
     * @param  {Array|mixed} item, ... The item(s) to concatenate.
     * @return {Array}                 The array containing the concatenated items.
     */
    concat: function fastConcat () {
      var length = arguments.length,
          arr = [],
          i, item, childLength, j;

      for (i = 0; i < length; i++) {
        item = arguments[i];
        if (isArrayLike(item)) {
          childLength = item.length;
          for (j = 0; j < childLength; j++) {
            arr.push(item[j]);
          }
        }
        else {
          arr.push(item);
        }
      }
      return arr;
    },


    /**
     * # Map
     *
     * A fast `.map()` implementation.
     *
     * @param  {Array}    subject     The array (or array-like) to map over.
     * @param  {Function} fn          The mapper function.
     * @param  {Object}   thisContext The context for the mapper.
     * @return {Array}                The array containing the results.
     */
    map: function fastMap (subject, fn, thisContext) {
      var length = subject.length,
          result = new ctor(length),
          i;
      for (i = 0; i < length; i++) {
        result[i] = fn.call(thisContext, subject[i], i, subject);
      }
      return result;
    },

    /**
     * # Reduce
     *
     * A fast `.reduce()` implementation.
     *
     * @param  {Array}    subject      The array (or array-like) to reduce.
     * @param  {Function} fn           The reducer function.
     * @param  {mixed}    initialValue The initial value for the reducer.
     * @param  {Object}   thisContext  The context for the reducer.
     * @return {mixed}                 The final result.
     */
    reduce: function fastReduce (subject, fn, initialValue, thisContext) {
      var length = subject.length,
          result = initialValue,
          i;
      for (i = 0; i < length; i++) {
        result = fn.call(thisContext, result, subject[i], i, subject);
      }
      return result;
    },

    /**
     * # For Each
     *
     * A fast `.forEach()` implementation.
     *
     * @param  {Array}    subject     The array (or array-like) to iterate over.
     * @param  {Function} fn          The visitor function.
     * @param  {Object}   thisContext The context for the visitor.
     */
    forEach: function fastForEach (subject, fn, thisContext) {
      var length = subject.length,
          i;
      for (i = 0; i < length; i++) {
        fn.call(thisContext, subject[i], i, subject);
      }
    },

    /**
     * # Index Of
     *
     * A faster `.indexOf()` implementation.
     *
     * @param  {Array}  subject The array (or array-like) to search within.
     * @param  {mixed}  target  The target item to search for.
     * @return {Number}         The position of the target in the subject, or -1 if it does not exist.
     */
    indexOf: function fastIndexOf (subject, target) {
      var length = subject.length,
          i;
      for (i = 0; i < length; i++) {
        if (subject[i] === target) {
          return i;
        }
      }
      return -1;
    },



    /**
     * # Last Index Of
     *
     * A faster `.lastIndexOf()` implementation.
     *
     * @param  {Array}  subject The array (or array-like) to search within.
     * @param  {mixed}  target  The target item to search for.
     * @return {Number}         The last position of the target in the subject, or -1 if it does not exist.
     */
    lastIndexOf: function fastIndexOf (subject, target) {
      var length = subject.length,
          i;
      for (i = length - 1; i >= 0; i--) {
        if (subject[i] === target) {
          return i;
        }
      }
      return -1;
    }
  
  };

  return methods;
  
};

},{}],2:[function(_dereq_,module,exports){
var poser = _dereq_('./src/node');

module.exports = poser;

['Array', 'Function', 'Object', 'Date', 'String'].forEach(pose);

function pose (type) {
  poser[type] = function poseComputedType () { return poser(type); };
}

},{"./src/node":3}],3:[function(_dereq_,module,exports){
'use strict';

var vm = _dereq_('vm');

function poser (type) {
  var sandbox = {};
  vm.runInNewContext('stolen=' + type + ';', sandbox, 'poser.vm');
  return sandbox.stolen;
}

module.exports = poser;

},{"vm":5}],4:[function(_dereq_,module,exports){
/*! collection- v0.0.0 - MIT license */

"use strict";
module.exports = (function() {
  
  var poser = _dereq_( "poser" );
  var Collection = poser.Array();
  var fast = _dereq_( "../modules/fast.js" )( Collection );
  
  var cp = Collection.prototype;

  // this could be confusing, so dispose of it.
  delete Collection.isArray;

  var isCollection = function( obj ) {
    return obj instanceof this;
  }.bind( Collection );

  function isFunction( obj ) {
    return typeof obj === "function";
  }

  function isArrayLike( obj ) {
    return Object.prototype.toString.call( obj ) === "[object Array]";
  }

  function matches( against, obj ) {
    for ( var prop in against ) {
      if ( obj[prop] !== against[prop] ) { 
        return false;
      }
    }
    return true;
  }

  function flip( fn ) {
    return function( a, b ) {
      return fn.call( this, b, a );
    };
  }

  function partial( fn ) {
    var args = slice( arguments, 1 );
    return function() {
       return fn.apply( this, args.concat( slice( arguments ) ) );
    };
  }

  function get( prop ) {
    return function( obj ) {
      return obj[prop];
    };
  }

  function not( fn ) {
    return function() {
      return !fn.apply( this, arguments );
    };
  }

  function contains( obj, value ) {
    return cp.indexOf.call( obj, value ) > -1;
  }

  function isTruthy( value ) {
    return !!value;
  }

  function identity( value ) {
    return value;
  }

  function iterator( value ) {
    if ( value == null ) {
      return identity;
    } else if ( isFunction( value ) ) {
      return value;
    } else {
      return get( value );
    }
  }

  function breakableEach( obj, callback ) {
    var result;
    for ( var i = 0; i < obj.length; i++ ) {
      result = callback( obj[i], i, obj );
      if ( result === false ) {
        return result;
      }
    }
    return null;
  }

  // helpers
  var slice = Function.prototype.call.bind( cp.slice );

  // create chainable versions of these native methods
  ["push", "pop", "shift", "unshift"].forEach( function( method ) {
    // new methods will be named cPush, cPop, cShift, cUnshift
    var name = "c" + method.charAt( 0 ).toUpperCase() + method.slice( 1 );
    Collection.prototype[name] = function() {
      Collection.prototype[method].apply( this, arguments );
      return this;
    };
  });
  
  // Methods that we're delegating to fast.js
  cp.forEach = function( fn, thisArg ) {
    return fast.forEach.call( null, this, fn, thisArg );
  };

  cp.map = function( fn, thisArg ) {
    return fast.map.call( null, this, fn, thisArg );
  };

  cp.reduce = function( fn, initialValue, thisArg ) {
    return fast.reduce.call( null, this, fn, thisArg );
  };

  cp.filter = function( fn, thisArg ) {
    var results = [];
    fast.forEach.call( null, this, function( el, i, arr ) {
      if ( fn( el, i, arr ) ) {
        results.push( el );
      }
    });
    return results;
  };

  cp.indexOf = function( target ) {
    return fast.indexOf.call( null, this, target );
  };

  cp.lastIndexOf = function( target ) {
    return fast.lastIndexOf.call( null, this, target );
  };

  // aliases for native methods.
  cp.each = cp.forEach;
  cp.collect = cp.map;
  cp.select = cp.filter;

  cp.forEachRight = function( fn ) {
    this.slice().reverse().each( fn );
  };
  cp.eachRight = cp.forEachRight;

  cp.where = function( obj ) {
    return this.filter( partial( matches, obj ) );
  };

  cp.whereNot = function( obj ) {
    return this.filter( not( partial( matches, obj ) ) );
  };

  cp.find = function( testFn ) {
    var result = null;
    breakableEach( this, function( el, i, arr ) {
      if ( testFn( el, i, arr ) ) {
        result = el;
        return false;
      }
    });
    return result;
  };

  cp.findNot = function( testFn ) {
    return this.find( not( testFn ) );
  };

  cp.findWhere = function( obj ) {
    return this.find( partial( matches, obj ) );
  };

  cp.findWhereNot = function( obj ) {
    return this.find( not( partial( matches, obj ) ) );
  };

  cp.pluck = function( prop ) {
    return this.map( get( prop ) );
  };

  cp.pick = function() {
    var props = slice( arguments );
    return this.map( function( el ) {
      var obj = {};
      props.each( function( prop ) {
        obj[prop] = el[prop];
      });
      return obj;
    });
  };

  cp.reject = function( testFn ) {
    return this.filter( not( testFn ) );
  };

  cp.invoke = function( fnOrMethod ) {
    var args = slice( arguments, 1 );
    this.forEach( function( el ) {
      ( isFunction( fnOrMethod ) ? fnOrMethod : el[fnOrMethod] ).apply( el, args );
    });
    return this;
  };

  cp.without = function() {
    var args = slice( arguments );
    return this.reject( partial( contains, args ) );
  };
  cp.remove = cp.without;

  cp.contains = function( obj ) {
    return contains( this, obj );
  };

  cp.tap = function( fn ) {
    fn( this );
    return this;
  };

  cp.clone = function() {
    return this.slice();
  };

  // todo
  // cp.cloneDeep = function() {

  // };

  cp.first = function( num ) {
    if ( num == null ) {
      return this[0];
    }
    return this.slice( 0, num );
  };
  cp.head = cp.first;
  cp.take = cp.first;

  cp.initial = function( num ) {
    if ( num == null ) {
      num = 1;
    }
    return this.slice( 0, this.length - num );
  };

  cp.last = function( num ) {
    if ( num == null ) {
      return this[this.length - 1];
    }
    return this.slice( 0, -1 * num );
  };

  cp.rest = function( num ) {
    if ( num == null ) {
      num = 1;
    }
    return this.slice( num );
  };
  cp.tail = cp.rest;
  cp.drop = cp.rest;

  cp.compact = function() {
    return this.filter( isTruthy );
  };

  // TODO
  // cp.flatten = function() {

  // };

  cp.partition = function( testFn ) {
    var pass = new Collection();
    var fail = new Collection();
    this.each( function( el, i, arr ) {
      ( testFn( el, i, arr ) ? pass : fail ).push( el );
    });
    return factory([ pass, fail ]);
  };

  cp.union = function() {
    return cp.concat.apply( this, arguments ).unique();
  };

  cp.intersection = function() { 
    var result = new Collection();
    var args = slice( arguments );
    this.each( function( el ) {
      var has = args.every( partial( flip( contains ), el ) );
      if ( has ) {
        result.push( el );
      }
    });
    return result;
  };

  cp.difference = function() {
    var result = new Collection();
    var args = slice( arguments );
    this.each( function( el ) {
      var notHas = args.every( not( partial( flip( contains ), el ) ) );
      if ( notHas ) {
        result.push( el );
      }
    });
    return result;
  };
  
  cp.unique = function() {
    var found = new Collection();
    this.each( function( el ) {
      if ( !found.contains( el ) ) {
        found.push( el );
      }
    });
    return found;
  };
  cp.uniq = cp.unique;

  cp.sortBy = function( itr, ctx ) {
    itr = iterator( itr );
    return cp.pluck.call( this.map( function( val, i, obj ) {
      return {
        val: val,
        i: i,
        param: itr.call( ctx, val, i, obj )
      };
    }).sort( function( left, right ) {
      var a = left.param;
      var b = right.param;
      if ( a !== b ) {
        if ( a > b || a === undefined ) {
          return 1;
        }
        if ( a < b || b === undefined ) {
          return -1;
        }
      }
      return left.index - right.index;
    }), "val" );
  };

  // TODO
  // cp.zip = function() {
  // };

  cp.min = function( prop ) {
    if ( prop ) {
      return cp.min.call( this.pluck( prop ) );
    }
    return Math.min.apply( Math, this );
  };

  cp.max = function( prop ) {
    if ( prop ) {
      return cp.max.call( this.pluck( prop ) );
    }
    return Math.max.apply( Math, this );
  };

  cp.extent = function( prop ) {
    return [ this.min( prop ), this.max( prop ) ];
  };

  cp.toArray = function() {
    return Array.prototype.slice.call( this );
  };

  var factory = function( arr ) {
    if ( arr == null ) {
      arr = [];
    }
    return new Collection().concat( arr );
  };

  factory.ctor = Collection;
  factory.proto = Collection.prototype;

  factory.isCollection = isCollection;
  factory.isArrayLike = isArrayLike;

  return factory;

})();
},{"../modules/fast.js":1,"poser":2}],5:[function(_dereq_,module,exports){
var indexOf = _dereq_('indexof');

var Object_keys = function (obj) {
    if (Object.keys) return Object.keys(obj)
    else {
        var res = [];
        for (var key in obj) res.push(key)
        return res;
    }
};

var forEach = function (xs, fn) {
    if (xs.forEach) return xs.forEach(fn)
    else for (var i = 0; i < xs.length; i++) {
        fn(xs[i], i, xs);
    }
};

var defineProp = (function() {
    try {
        Object.defineProperty({}, '_', {});
        return function(obj, name, value) {
            Object.defineProperty(obj, name, {
                writable: true,
                enumerable: false,
                configurable: true,
                value: value
            })
        };
    } catch(e) {
        return function(obj, name, value) {
            obj[name] = value;
        };
    }
}());

var globals = ['Array', 'Boolean', 'Date', 'Error', 'EvalError', 'Function',
'Infinity', 'JSON', 'Math', 'NaN', 'Number', 'Object', 'RangeError',
'ReferenceError', 'RegExp', 'String', 'SyntaxError', 'TypeError', 'URIError',
'decodeURI', 'decodeURIComponent', 'encodeURI', 'encodeURIComponent', 'escape',
'eval', 'isFinite', 'isNaN', 'parseFloat', 'parseInt', 'undefined', 'unescape'];

function Context() {}
Context.prototype = {};

var Script = exports.Script = function NodeScript (code) {
    if (!(this instanceof Script)) return new Script(code);
    this.code = code;
};

Script.prototype.runInContext = function (context) {
    if (!(context instanceof Context)) {
        throw new TypeError("needs a 'context' argument.");
    }
    
    var iframe = document.createElement('iframe');
    if (!iframe.style) iframe.style = {};
    iframe.style.display = 'none';
    
    document.body.appendChild(iframe);
    
    var win = iframe.contentWindow;
    var wEval = win.eval, wExecScript = win.execScript;

    if (!wEval && wExecScript) {
        // win.eval() magically appears when this is called in IE:
        wExecScript.call(win, 'null');
        wEval = win.eval;
    }
    
    forEach(Object_keys(context), function (key) {
        win[key] = context[key];
    });
    forEach(globals, function (key) {
        if (context[key]) {
            win[key] = context[key];
        }
    });
    
    var winKeys = Object_keys(win);

    var res = wEval.call(win, this.code);
    
    forEach(Object_keys(win), function (key) {
        // Avoid copying circular objects like `top` and `window` by only
        // updating existing context properties or new properties in the `win`
        // that was only introduced after the eval.
        if (key in context || indexOf(winKeys, key) === -1) {
            context[key] = win[key];
        }
    });

    forEach(globals, function (key) {
        if (!(key in context)) {
            defineProp(context, key, win[key]);
        }
    });
    
    document.body.removeChild(iframe);
    
    return res;
};

Script.prototype.runInThisContext = function () {
    return eval(this.code); // maybe...
};

Script.prototype.runInNewContext = function (context) {
    var ctx = Script.createContext(context);
    var res = this.runInContext(ctx);

    forEach(Object_keys(ctx), function (key) {
        context[key] = ctx[key];
    });

    return res;
};

forEach(Object_keys(Script.prototype), function (name) {
    exports[name] = Script[name] = function (code) {
        var s = Script(code);
        return s[name].apply(s, [].slice.call(arguments, 1));
    };
});

exports.createScript = function (code) {
    return exports.Script(code);
};

exports.createContext = Script.createContext = function (context) {
    var copy = new Context();
    if(typeof context === 'object') {
        forEach(Object_keys(context), function (key) {
            copy[key] = context[key];
        });
    }
    return copy;
};

},{"indexof":6}],6:[function(_dereq_,module,exports){

var indexOf = [].indexOf;

module.exports = function(arr, obj){
  if (indexOf) return arr.indexOf(obj);
  for (var i = 0; i < arr.length; ++i) {
    if (arr[i] === obj) return i;
  }
  return -1;
};
},{}]},{},[4])
(4)
});