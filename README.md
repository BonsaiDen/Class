Flexible, simple and short Classes
==================================

A trivial, small and featureful class fill in for JavaScript.

## The Basics

Look, a __Class__!

    var Foo = Class();

    x = new Foo();


A *Class* can have a __Constructor__:

    var Foo = Class(function(a, b) {
        this.a = a;
        this.b = b;
    });

    x = new Foo(1, 2);


As well, as __Methods__:

    var Foo = Class(function(name) {
        this.name = name;

    }, {

        bar: function() {
            return this.name;
        }

    });

    x = new Foo('tuff');
    x.bar(); => 'tuff'


A Class will always have a __implicit__ default *Constructor*:


    var Foo = Class({

        test: function() {
            return 'Hello World!';
        }

    });

    x = new Foo();
    x.test(); => 'Hello World!'


## Inheritance

Classes can __inherit__ from each other:

    var Foo = Class(function(name) {
        this.name = name;
    });

    var Bar = Class(Foo, {
        
        test: function() {
            return this.name;
        }

    });

    x = new Bar('Ivo');
    x.test(); => 'Ivo'


Each class can be used as an __unbound__ *Constructor* as well:

    var Bar = Class(function() {
        Foo(this, 'Ivo');

    }, Foo);


Which allows for *multiple* inheritance:

    var Bar = Class(function() {
        Foo(this, 'Ivo');

    }, Foo, Baz);

Which is supported by *unbound* methods:

    Foo.bar(x); => 'tuff'


And __static__ methods - these are prefixed with `$`:

    var Foo = new Class({

        $test: function() {
            return 'No instance needed!';
        }

    });

    Foo.$test(); => 'No instance needed!'

## TODO

- Further reduce minified size 
- Finish tests for all features


## License

Licensed under MIT.

