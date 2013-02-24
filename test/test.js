/**
  * Copyright (c) 2012 Ivo Wetzel.
  *
  * Permission is hereby granted, free of charge, to any person obtaining a copy
  * of this software and associated documentation files (the "Software"), to deal
  * in the Software without restriction, including without limitation the rights
  * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  * copies of the Software, and to permit persons to whom the Software is
  * furnished to do so, subject to the following conditions:
  *
  * The above copyright notice and this permission notice shall be included in
  * all copies or substantial portions of the Software.
  *
  * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
  * THE SOFTWARE.
  */

if (typeof window === 'undefined') {
    var Class = require('../lib/Class').Class;
    var nodeunit = require('nodeunit');
}


// Helpers --------------------------------------------------------------------
function classFactory() {

    var methods = {};
    for(var i = 0, l = arguments.length; i < l; i++) {

        var methodName = arguments[i];
        methods[methodName] = function(a, b) {
            return [this, this.a, this.b, a, b];
        };

    }

    return Class(function(a, b) {
        this.a = a;
        this.b = b;

    }, methods);

}

function clas(test, instance, a, b) {

    test.strictEqual(typeof instance, 'object');
    test.strictEqual(typeof instance.is, 'function');
    test.strictEqual(instance.a, a);
    test.strictEqual(instance.b, b);

}

function unboundConstructor(test, clas, a, b) {

    test.strictEqual(typeof clas, 'function');

    var instance = { 'me': 123 };
    test.strictEqual(clas(instance, a, b), undefined);
    test.strictEqual(instance.a, a);
    test.strictEqual(instance.b, b);

}

function boundMethod(test, instance, method, a, b) {

    test.strictEqual(typeof method, 'function');

    var result = method.call(instance, a, b);
    test.deepEqual(result, [instance, instance.a, instance.b, a, b]);

}

function unboundMethod(test, instance, method, a, b) {

    test.strictEqual(typeof method, 'function');
    test.strictEqual(typeof instance, 'object');

    var result = method(instance, a, b);
    test.deepEqual(result, [instance, instance.a, instance.b, a, b]);

}

function staticMethod(test, clas, method, a, b) {

    test.strictEqual(typeof method, 'function');
    test.strictEqual(typeof clas, 'function');

    var result = method.call(null, a, b);
    test.deepEqual(result, [clas, undefined, undefined, a, b]);

}


// Tests ----------------------------------------------------------------------
var tests = nodeunit.testCase({

    'Plain': function(test) {

        var Foo = new Class();
        test.strictEqual(typeof Foo, 'function');
        test.strictEqual(typeof new Foo(), 'object');
        test.strictEqual(typeof Foo.is, 'function');
        test.ok(Foo.is(Foo));
        test.ok(Foo.is(Class));

        test.ok(Class.is(Foo));
        test.ok(!Class.is({}));

        Foo();
        test.done();

    },


    'Methodless': function(test) {

        var Foo = new Class(function(a, b) {
            this.a = a;
            this.b = b;
        });

        test.strictEqual(typeof Foo, 'function');
        test.ok(Foo.is(Foo));
        test.ok(Foo.is(Class));

        var foo = new Foo(1, 2);
        test.ok(foo.is(Foo));
        test.ok(foo.is(Class));
        clas(test, foo, 1, 2);

        test.done();

    },

    'Constructless': function(test) {

        var Foo = new Class({
            test: function(a, b) {
                return [this, a, b];
            }
        });

        test.strictEqual(typeof Foo, 'function');
        test.ok(Foo.is(Foo));

        var foo = new Foo(1, 2);
        test.deepEqual(foo.test(1, 2), [foo, 1, 2]);
        test.done();

    },

    'Single': function(test) {

        var Foo = classFactory('method', 'test'),
            foo = new Foo(1, 2);

        clas(test, foo, 1, 2);
        unboundConstructor(test, Foo, 1, 2);

        boundMethod(test, foo, foo.method, 4, 5);
        boundMethod(test, foo, foo.test, 6, 7);

        unboundMethod(test, foo, Foo.method, 8, 9);
        unboundMethod(test, foo, Foo.test, 10, 11);

        test.done();

    },

    'Single Inheritance': function(test) {

        // Test against non-working values for the this inside the class thing
        // sounds crazy, but prevents errors!
        var namespace = {
            Foo: classFactory('method', 'test')
        };

        namespace.Bar = Class(function() {
            namespace.Foo(this, 1, 2);

        }, namespace.Foo, {

            custom: function(a, b) {
                return [this, this.a, this.b, a, b];
            }

        });

        test.ok(namespace.Bar.is(namespace.Bar));
        test.ok(namespace.Bar.is(namespace.Foo));

        var bar = new namespace.Bar(1, 2);

        test.ok(bar.is(namespace.Bar));
        test.ok(bar.is(namespace.Foo));

        clas(test, bar, 1, 2);
        unboundConstructor(test, namespace.Bar, 1, 2);

        boundMethod(test, bar, bar.method, 4, 5);
        boundMethod(test, bar, bar.test, 6, 7);

        unboundMethod(test, bar, namespace.Bar.method, 8, 9);
        unboundMethod(test, bar, namespace.Bar.test, 10, 11);

        boundMethod(test, bar, bar.custom, 6, 7);
        unboundMethod(test, bar, namespace.Bar.custom, 10, 11);

        test.done();
    },

    'Multi Single Inheritance(Constructless)': function(test) {

        var Foo = classFactory('method', 'test');
        var Test = Class(Foo);
        var Bar = Class(Test, {

            custom: function(a, b) {
                return [this, this.a, this.b, a, b];
            }

        });

        test.ok(Bar.is(Class));
        test.ok(Bar.is(Foo));
        test.ok(Bar.is(Test));
        test.ok(Bar.is(Bar));

        var bar = new Bar(1, 2);

        test.ok(bar.is(Class));
        test.ok(bar.is(Foo));
        test.ok(bar.is(Test));
        test.ok(bar.is(Bar));
        clas(test, bar, 1, 2);

        unboundConstructor(test, Bar, 1, 2);

        test.done();

    },

    'Multiple Inheritance': function(test) {
        // test method
        // test unbound method
        // test method inherited a
        // test unbound method inherited a
        // test method inherited b
        // test unbound method inherited b
        test.done();
    },

    'Static': function(test) {

        var Foo = classFactory('method', '$test'),
            foo = new Foo(1, 2);

        clas(test, foo, 1, 2);
        unboundConstructor(test, Foo, 1, 2);

        boundMethod(test, foo, foo.method, 4, 5);
        unboundMethod(test, foo, Foo.method, 8, 9);

        test.strictEqual(foo.test, undefined);
        staticMethod(test, Foo, Foo.test, 10, 11);

        test.done();

    },

    'Static Inheritance': function(test) {

        var Bar = classFactory('method', '$test'),
            Foo = Class(function(a, b) {
                Bar(this, a, b);
            }, Bar, {
                method: function(a, b) {
                    return Bar.method(this, a, b);
                }
            }),
            foo = new Foo(1, 2);

        clas(test, foo, 1, 2);
        unboundConstructor(test, Foo, 1, 2);

        boundMethod(test, foo, foo.method, 5, 6);
        unboundMethod(test, foo, Bar.method, 9, 10);
        unboundMethod(test, foo, Foo.method, 9, 10);

        test.strictEqual(foo.test, undefined);
        staticMethod(test, Foo, Foo.test, 10, 11);

        test.done();

    }

});


if (typeof window === 'undefined') {
    module.exports = tests;
}

