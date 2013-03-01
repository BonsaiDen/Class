## The `Class` Factory

The `Class` factory is the *base* of all created *Classes*. This means that all
Classes created by it automatically inherit from a special method `is` from it.

`Class.is` basically works like `instanceof`, where first parameter would be 
the left-hand value of the `instanceof` operator and the (optional) second 
parameter the right-hand value.

The `is` method is both Class and a Instance method:

```javascript
    var Foo = Class();
    Class.is(Foo); // true
    Class.is(Foo, Class); // true

    new Foo().is(Class); // true
    new Foo().is(Foo); // true
```

## Basic Usage

To create the most simple *Class* just pass in a function as the constructor and 
an object with the members into the `Class` factory:

```javascript
    var Foo = Class(function(value) {
        this.value = value;

    }, {
        getValue: function() {
            return this.value;
        }
    });

    new Foo(1).getValue(); // 1
```

> Note: Both of the arguments are *optional* and either one can be left out.


## Inheritance and Unbound Methods

You can pass any number of other *Classes* into the `Class` factory to make 
the new class inherit from them.

If the first parameter to the factory is either a `function` or a `Class`, 
it will become the constructor of the new *Class*.

If a Class inherits from another one, it can call that Class's *unbound* 
constructor from within it's own, passing *itself* as the instance argument:

```javascript
    var Bar = Class(function(value) {
        Foo(this, value);

    }, Foo, ... );

```

All methods also have a unbound Class version available, this makes calling 
super methods easy.

```javascript
    var Bar = Class(... , Foo, {
        method: function(value) {
            return Foo.method(this, value);
        }
    });

```

## Static Fields and Methods

Any field prefixed with a `$` will automatically become a static one:

```javascript

    var Baz = Class({
        $fromFactory: function(data) {
            return new Baz(data);
        }
    });

    instance = Baz.fromFactory({ ... });
```

> Note: Static fields are direct references; thus, that they are shared 
> between any sub classes and their bases.


## Wrapping `prototype` based structures into Classes

For easy integration of other `prototype` based code, you can simply wrap the 
desired structures as classes:

```javascript
    var FooClass = Class(Foo, Foo.prototype);
```

The `Class` factory will actually do the right thing here and will **not** 
convert fields which are prefixed with `$` into statics in order to avoid 
breaking existing code.

## License

Licensed under MIT.

