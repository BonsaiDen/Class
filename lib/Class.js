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

    function Class(ctor) {

        // Check whether the ctor function is in fact another class and not
        // just a plain function. We also check whether it's a function or not.
        var ctorIsClass = ctor && ctor.constructor === Class,
            ctorIsFunction = ctor instanceof Function;

        // Setup the class constructor which can be called in two different ways:
        //
        // 1. new ClassConstructor(args...)
        //
        //     - This will create a new instance as usual
        //
        // 2. ClassConstructor(instance, args...)
        //
        //     - This will function as a call to the super constructor
        //
        // The trick here is to figure out in what context the below function is
        // invoked.
        function clas() {

            // If we have a ctor function or a base class we need to invoke it
            if (ctorIsClass || ctorIsFunction) {

                // We check to see if this function was called unbound
                // or we're trying to call the ctor of another class
                var unbound = this.constructor === Class || ctorIsClass;

                // If so, we need to setup the next call in a different way
                (unbound ? ctor : Class.call).apply(unbound ? this : ctor, arguments);

            }

        }

        // Set up the prototype chain and the internal prototype object `$proto`
        // which is used to extend subclasses with the methods of this class
        // when they inherit.
        var proto = clas.prototype,
            $proto = clas.$$ = {},
            $extend = clas.$$$ = [clas, Class];

        // Now we set prototype constructor to Class,
        // this way we can identify function's as classes later on
        clas.constructor = proto.constructor = Class;

        // Static and member function `is` can be used to to check for
        // inheritance on both the class object and any of its instances
        clas.is = proto.is = function(o) {
            return $extend.indexOf(o) !== -1;
        };

        // Now we can extend the clas constructor and it's prototype with all
        // objects and base classes passed to the factory
        var ext, i = 0;
        while((ext = arguments[i++])) {

            // Check if we extend with a class
            var isClass = ext.constructor === Class;

            // If so, push the extending class' inheritance chain into ours
            isClass && $extend.push.apply($extend, ext.$$$);

            // For classes we need to grab the internal prototype field
            // instead of it's public properties.
            // In case of an object we just use its properties.
            var props = isClass ? ext.$$ : ext;

            // Now go over all potential methods and properties.
            for(var key in props) {

                if (!props.hasOwnProperty(key)) {
                    continue;
                }

                // Add the field the internal prototype field
                var field = ($proto[key] = props[key]);

                // Check to see if the field is NOT a static
                var isMember = key.charAt(0) !== '$';

                // If it's not static add it to the prototype chain
                isMember && (proto[key] = field);

                // Check if the field is a function
                var isFunction = field instanceof Function;

                // Strip the static prefix from the field name
                key = key.match(/^\$?([a-z0-9_$]*)$/)[1];

                // Now we need to create the static fields and unbound versions
                // of any members
                clas[key] = isFunction ?

                        // Unbound (static) version of the member
                        (function(context, callee) {
                            return function() {
                                return callee.apply(context, arguments);
                            };

                        }(isMember ? field : clas,
                          isMember ? Class.call : field))

                    // Handle non-function field
                    : field;

            }

        }

        return clas;

    }

    Class.is = function(obj) {
        return obj.hasOwnProperty('$$$') && obj.$$$.indexOf(Class) !== -1;
    };

    exports.Class = Class;

})(typeof exports !== 'undefined' ? exports : this);

