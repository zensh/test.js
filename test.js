'use strict';
/*global module, define, process, console*/

/**
 * test.js, version 0.0.1, 2013/10/20
 * Test tool!
 * https://github.com/zensh/test.js, admin@zensh.com
 * License: MIT
 */

(function () {
    var slice = [].slice,
        toString = Object.prototype.toString,
        testList = [],
        failList = [],
        okList = [],
        options = {
            run: false
        };

    var ASSERT_NAME = ['Null', 'Undefined', 'Boolean', 'String', 'Number', 'Array', 'Object',
      'Function', 'Date', 'RegExp', 'Empty', 'Equal'];

    function noop() {return this;}
    function hasOwn(obj, key) {
        return Object.prototype.hasOwnProperty.call(obj, key);
    }
    function each(obj, iterator, context) {
        if (assert.isArray(obj)) {
            for (var i = 0, l = obj.length; i < l; i++) {
                iterator.call(context, obj[i], i, obj);
            }
        } else {
            for (var key in obj) {
                if (hasOwn(obj, key)) {
                    iterator.call(context, obj[key], key, obj);
                }
            }
        }
    }
    function toErr(err) {
        return new Error(err);
    }
    function getTitle(tag, type) {
        type = type || 'LOG';
        return new Date().toLocaleString() + ' [' + type + '] ' + tag + ' : ';
    }
    function nextTag() {
        return 'testJS_' + (testList.length + 1);
    }
    var assert = {
        isNull: function (obj) {
            return obj === null;
        },
        isUndefined: function (obj) {
            return typeof obj === 'undefined';
        },
        isBoolean: function (value) {
          return typeof value === 'boolean';
        },
        isString: function (str) {
            return typeof str === 'string';
        },
        isNumber: function (num) {
            return  typeof num === 'number';
        },
        isArray: function (obj) {
            return toString.call(obj) === '[object Array]';
        },
        isObject: function (obj) {
            return obj !== null && typeof obj === 'object';
        },
        isFunction: function (fn) {
            return typeof fn === 'function';
        },
        isDate: function (date){
          return toString.call(date) === '[object Date]';
        },
        isRegExp: function (reg) {
          return toString.apply(reg) === '[object RegExp]';
        },
        isEmpty: function (obj) {
            if (obj) {
                for (var key in obj) {
                    return !hasOwn(obj, key);
                }
            }
            return true;
        },
        isEqual: function (a, b) {
            return JSON.stringify(a) === JSON.stringify(b);
        }
    };

    function Test(testTag) {
        this.testTag = testTag;
        testList.push(this);
    }

    var prototype = Test.prototype;
    prototype.logger = {
        log: console.log.bind(console),
        info: console.info.bind(console),
        warn: console.warn.bind(console),
        error: console.error.bind(console)
    };

    prototype.fail = function (err) {
        err = assert.isUndefined(err) ? this._error : err;
        if (!assert.isNull(err) && !assert.isUndefined(err)) {
            this.failMsg = getTitle(this.testTag, 'FAIL');
            this.error = toErr(err);
            failList.push(this);
            this.logger.error(this._fail);
            this.logger.error(this._error);
        }
        return this;
    };
    prototype.ok = function (msg) {
        this.okMsg = getTitle(this.testTag, 'OK');
        okList.push(this);
        if (!assert.isNull(msg) && !assert.isUndefined(msg)) {
            if (assert.isObject(msg)) {
                msg = JSON.stringify(msg);
            }
            this.okMsg += msg;
            this.logger.info();
        }
        return this;
    };
    prototype.log = function (obj) {
        this.logger.log(obj);
        return this;
    };
    each(ASSERT_NAME, function (name) {
        var is = 'is' + name;
        prototype[is] = function () {
            var result = assert[is].apply(this, arguments);
            if (!result) {
                this.fail(slice.call(arguments) + ' is not ' + name);
            } else {
                this.ok();
            }
        };
        prototype['isNot' + name] = function () {
            var result = assert[is].apply(this, arguments);
            if (result) {
                this.fail(slice.call(arguments) + ' is ' + name);
            } else {
                this.ok();
            }
        };
    });

    function runTest(testTag, testFn) {
        testFn = assert.isFunction(testTag) ? testTag : testFn;
        testFn = assert.isFunction(testFn) ? testFn : noop;
        testTag = assert.isString(testTag) ? testTag : nextTag();
        var test = new Test(testTag);
        testFn.apply(test, arguments);
        return test;
    }

    function runNoop() {
        var test = {};
        each(prototype, function (value, key) {
            test[key] = noop.bind(test);
        });
        return test;
    }

    function testjs(testTag, testFn) {
        if (options.run) {
            return runTest(testTag, testFn);
        } else {
            return runNoop();
        }
    }

    testjs.config = function (obj) {
        each(obj, function (value, key) {
            options[key] = value;
        });
    };
    testjs.getAll = function () {
        return testList;
    };
    testjs.getFail = function () {
        return failList;
    };
    testjs.getOk = function () {
        return okList;
    };
    testjs.stats = function () {
        each(testList, function (test) {
            console.log(test.okMsg || (test.failMsg + test.error));
        });
        console.log('Ok: ' + okList.length + ', Fail: ' + failList.length);
    };

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = testjs;
    } else if (typeof define === 'function') {
        define(function () {
            return testjs;
        });
    }
    if (typeof window === 'object') {
        window.testjs = testjs;
    }
    return testjs;
})();