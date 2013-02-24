Class
=====

A trivial class fill in for JavaScript with a focus on being extensible and 
having nearly zero overhead.

## Synopsis

```javascript
    Class(
        constructor: Function || Class,
        extends: Class(es),
        properties: Object(s)
    )
```

## Basics

```javascript
    var Foo = Class(function(value) {
        this.value = value;

    }, {
        method: function() {
            return this.value;
        }
    });

    var foo = new Foo(1);
    foo.method(); // 1
    foo.is(Foo); // true
```

## Inheritance and unbound calls

```javascript
    var Bar = Class(function(value) {
        Foo(this, value);

    }, Foo, {
        method: function() {
            return Foo.method(this) * 2;
        }
    });

    var bar = new Bar(1);
    bar.method(); // 2
    bar.is(Foo); // true
    bar.is(Bar); // true
```

## Statics

```javascript
    var Baz = Class({
        $deserialize: function(data) {
            return new Baz(data.a, data.b);
        }
    });

    var baz = Baz.deserialize({ a: 1, b: 2};
```

## License

Licensed under MIT.

