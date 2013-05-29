/**
  * Copyright (c) 2012-2013 Ivo Wetzel.
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
(function(exports) {

    var Class = require('../lib/Class').Class;

    // Helpers ----------------------------------------------------------------
    function assertClass(test, clas) {
        test.ok(Class.is(clas), 'Class.is recognizes the class as a Class');
        test.ok(Class.is(clas, clas), 'Class.is recognizes the class as a Class itself');

        var inst = new clas();
        test.ok(Class.is(inst), 'Class.is recognizes a instance as a Class');
        test.ok(Class.is(inst, clas), 'Class.is recognizes a instance as being of the class itself');
    }

    function assertConstructor(test, clas) {

        var value = Math.random(),
            instance = new clas(value);

        test.strictEqual(value, instance.value, 'Constructor assigns correct field');

        var obj = {};
        clas(obj, value);
        test.strictEqual(value, obj.value, 'Unbound-Constructor assigns correct field');

    }

    function assertMethod(test, clas, name) {

        var instance = new clas(),
            value = Math.random();

        // Members
        test.strictEqual('function', typeof instance[name], 'Instance has method');
        test.strictEqual(value, instance[name](value), 'Method returns correct result');

        // Unbound
        test.strictEqual('function', typeof clas[name], 'Class has unbound method');
        test.strictEqual(value, clas[name](null, value), 'Unbound-Method returns correct result without instance context');
        test.strictEqual(value, clas[name](instance, value), 'Unbound-Method returns correct result with instance context');

    }

    function assertStaticMethod(test, clas, name) {

        var instance = new clas(),
            value = Math.random();

        // Members
        test.strictEqual('undefined', typeof instance[name], 'Instance has no static method');

        // Static
        test.strictEqual('function', typeof clas[name], 'Class has static method');
        test.strictEqual(value, clas[name](value), 'Static-Method returns correct result');

    }

    function assertStaticField(test, clas, name, value) {

        var instance = new clas();

        // Members
        test.strictEqual('undefined', typeof instance[name], 'Instance has no static field');

        // Static
        test.strictEqual(typeof value, typeof clas[name], 'Class has static field');
        test.strictEqual(value, clas[name], 'Static field is a reference');

    }

    function assertInheritance(test, clas, base) {
        var inst = new clas();
        test.ok(Class.is(clas, base), 'Class.is recognizes the class as a extension of the base Class');
        test.ok(Class.is(inst, base), 'Class.is recognizes a instance as being the exentions of the base Class');
    }


    // Unit Tests -------------------------------------------------------------
    exports.Basic = {

        create: function(test) {
            assertClass(test, Class());
            test.done();
        },

        withConstructor: function(test) {

            var template = Class(function(value) {
                this.value = value;
            });

            assertClass(test, template);
            assertConstructor(test, template);
            test.done();

        },

        withMethods: function(test) {

            var template = Class({
                a: function(value) { return value; },
                b: function(value) { return value; }
            });

            assertClass(test, template);

            assertMethod(test, template, 'a');
            assertMethod(test, template, 'b');

            test.done();

        },

        withConstructorAndMethods: function(test) {

            var template = Class(function(value) {
                this.value = value;
            }, {
                a: function(value) { return value; },
                b: function(value) { return value; }
            });

            assertClass(test, template);
            assertConstructor(test, template);
            assertMethod(test, template, 'a');
            assertMethod(test, template, 'b');

            test.done();

        }

    };

    exports.Static = {

        methods: function(test) {

            var template = Class({
                $a: function(value) { return value; },
                $b: function(value) { return value; }
            });

            assertClass(test, template);
            assertStaticMethod(test, template, 'a');
            assertStaticMethod(test, template, 'b');

            var nonTemplate = Class({
                $: function(value) { return value; }
            });

            assertClass(test, nonTemplate);
            assertMethod(test, nonTemplate, '$');

            test.done();

        },

        fields: function(test) {

            var staticField = {
                key: 'value'
            };

            var template = Class({
                $a: 100,
                $b: staticField
            });

            assertClass(test, template);
            assertStaticField(test, template, 'a', 100);
            assertStaticField(test, template, 'b', staticField);

            test.done();

        }

    };

    exports.Inheritance = {

        single: function(test) {

            var staticField = {
                key: 'value'
            };

            var Base = Class(function(value) {
                this.value = value;

            }, {
                $field: staticField,

                a: function(value) {
                    return value;
                },

                $c: function(value) {
                    return value;
                }

            });

            var Sub = Class(function(value) {
                Base(this, value);

            }, Base, {
                b: function(value) {
                    return value;
                }
            });

            assertClass(test, Sub);
            assertConstructor(test, Sub);
            assertMethod(test, Sub, 'a');
            assertMethod(test, Sub, 'b');
            assertStaticMethod(test, Sub, 'c');
            assertStaticField(test, Sub, 'field', staticField);
            assertInheritance(test, Sub, Base);

            var Direct = Class(Base, {
                b: function(value) {
                    return value;
                }
            });

            assertClass(test, Direct);
            assertConstructor(test, Direct);
            assertMethod(test, Direct, 'a');
            assertMethod(test, Direct, 'b');
            assertStaticMethod(test, Direct, 'c');
            assertStaticField(test, Direct, 'field', staticField);
            assertInheritance(test, Direct, Base);

            test.done();

        },

        dual: function(test) {

            var staticField = {
                key: 'value'
            };

            var Base = Class(function(value) {
                this.value = value;

            }, {
                $field: staticField,

                a: function(value) {
                    return value;
                },

                $c: function(value) {
                    return value;
                }

            });

            var staticArray = [];

            var Sub = Class(function(value) {
                Base(this, value);

            }, Base, {
                $array: staticArray,
                b: function(value) {
                    return value;
                }
            });

            var Final = Class(function(value) {
                Sub(this, value);

            }, Sub, {
                d: function(value) {
                    return value;
                }
            });

            assertClass(test, Final);
            assertConstructor(test, Final);
            assertMethod(test, Final, 'a');
            assertMethod(test, Final, 'b');
            assertStaticMethod(test, Final, 'c');
            assertMethod(test, Final, 'd');
            assertStaticField(test, Final, 'array', staticArray);
            assertStaticField(test, Final, 'field', staticField);
            assertInheritance(test, Final, Sub);
            assertInheritance(test, Final, Base);

            test.done();

        },

        multiple: function(test) {

            var A = Class(function(value) {
                this.valueB = value;

            }, {
                a: function(value) {
                    return value;
                },

                $as: function(value) {
                    return value;
                }
            });

            var B = Class(function(value) {
                this.valueB = value;

            }, {
                b: function(value) {
                    return value;
                },

                $bs: function(value) {
                    return value;
                }
            });

            var C = Class(function(value) {
                this.valueC = value;

            }, {
                c: function(value) {
                    return value;
                },

                $cs: function(value) {
                    return value;
                }
            });

            var M = Class(function(value) {
                this.value = value;
                A(this, value);
                B(this, value);
                C(this, value);

            }, A, B, C, {
                m: function(value) {
                    return value;
                },

                $ms: function(value) {
                    return value;
                }
            });

            assertClass(test, M);
            assertConstructor(test, M);
            assertMethod(test, M, 'a');
            assertMethod(test, M, 'b');
            assertMethod(test, M, 'c');
            assertMethod(test, M, 'm');
            assertStaticMethod(test, M, 'as');
            assertStaticMethod(test, M, 'bs');
            assertStaticMethod(test, M, 'cs');
            assertStaticMethod(test, M, 'ms');

            assertInheritance(test, M, A);
            assertInheritance(test, M, B);
            assertInheritance(test, M, C);

            test.done();

        }

    };

    exports.Compatibility = {

        wrapPrototypeBased: function(test) {

            var Foo = function(value) {
                this.value = value;
            };

            Foo.prototype = {
                a: function(value) { return value; },
                b: function(value) { return value; },

                // These should NOT get converted to static fields
                $a: function(value) { return value; },
                $b: function(value) { return value; }

            };

            var template = Class(Foo, Foo.prototype);

            assertClass(test, template);
            assertConstructor(test, template);
            assertMethod(test, template, 'a');
            assertMethod(test, template, 'b');
            assertMethod(test, template, '$a');
            assertMethod(test, template, '$b');

            test.done();

        }

    };

})(typeof exports !== 'undefined' ? exports : (this.tests = {}));

