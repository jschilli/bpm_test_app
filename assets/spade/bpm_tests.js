/* ===========================================================================
   BPM Combined Asset File
   MANIFEST: spade (1.0.1)
   This file is generated automatically by the bpm (http://www.bpmjs.org)
   =========================================================================*/

// ==========================================================================
// Project:   Spade - CommonJS Runtime
// Copyright: ©2010 Strobe Inc. All rights reserved.
// License:   Licened under MIT license (see __preamble__.js)
// ==========================================================================
/*globals spade */


(function() {

var t = {}, Spade = spade.Spade;
  
// ..........................................................
// BASIC REQUIRE
// 

module('spade: async require', {
  setup: function() {
    t.spade = new Spade(); 

    // preload a module
    t.spade.register('foo/baz', function(require,e) { 
      e.id = 'foo/baz'; 
      e.async = require.async; // export for testing
    });

    // dummy loader loads only foo/bar on demand after delay
    t.spade.loader = {

      requests: 0, 

      loadFactory: function(spade, id, done) {
        this.requests++;
        if (id === 'foo/bar') {
          setTimeout(function() {
            spade.register(id, function(r,e) { e.id='foo/bar'; });
            done();
          }, 10);

        } else {
          done('Not Found'); // immediately
        }
      }
    };
  },
  
  teardown: function() {
    delete t.spade;
  }
});

test('should not talk to loader if registered', function() {
  var spade = t.spade;

  stop(1000);
  
  spade.async('foo/baz', function(err) {
    start();
    equal(err, null);
    equal(spade.loader.requests, 0, 'loader should not have been called');
    equal(spade.require('foo/baz').id, 'foo/baz', 'should find foo');
  });
  
});

test('should let loader register', function() {
  var spade = t.spade;
  stop(1000);
  spade.async('foo/bar', function(err) {
    start();
    equal(err, null);
    equal(spade.loader.requests, 1, 'loader should have been called');
    equal(spade.require('foo/bar').id, 'foo/bar', 'should find foo');
  });
});


test('should normalize id', function() {
  var spade = t.spade;
  stop(1000);
  spade.async('/./foo/baz/../bar', function(err) {
    start();
    equal(err, null);
    equal(spade.loader.requests, 1, 'loader should have been called');
    equal(spade.require('foo/bar').id, 'foo/bar', 'should find foo');
  });
});


test('should expose async inside of module', function() {
  var spade = t.spade;
  stop(1000);

  var async = spade.require('foo/baz').async;
  ok(async, 'should have an async function');
  
  // normalize relative to async
  async('./bar', function(err) {
    start();
    equal(err, null);
    equal(spade.loader.requests, 1, 'loader should have been called');
    equal(spade.require('foo/bar').id, 'foo/bar', 'should find foo');
  });
});


test('should return err if loader does not register', function() {
  var spade = t.spade;
  stop(1000);
  spade.async('imaginary/bar', function(err) {
    start();
    equal(err, 'Not Found');
    equal(spade.loader.requests, 1, 'loader should have been called');

    raises(function() {
      spade.require('imaginary/bar');
    });
  });
  
});

})();
// ==========================================================================
// Project:   Spade - CommonJS Runtime
// Copyright: ©2010 Strobe Inc. All rights reserved.
// License:   Licened under MIT license (see __preamble__.js)
// ==========================================================================
/*globals spade */


(function() {

var t = {}, Spade = spade.Spade;
  
// ..........................................................
// BASIC REQUIRE
// 

module('spade: loader', {
  setup: function() {
    t.spade = new Spade(); 

    // preload a module
    t.spade.register('foo/main', function(r, e) { e.id = 'foo'; });

    // dummy loader loads only foo/bar on demand
    t.spade.loader = {

      requests: 0, 

      loadFactory: function(spade, id, formats, done) {
        this.requests++;
        if (id === 'foo/bar') {
          spade.register(id, function(r,e) { e.id='foo/bar'; });
        }
        if (done) throw "should not be passed done"
      }
    };
  },
  
  teardown: function() {
    delete t.spade;
  }
});

test('should not talk to loader if module is registered', function() {
  var spade = t.spade;
  equal(spade.require('foo').id, 'foo', 'should find foo');
  equal(spade.loader.requests, 0, 'loader should not have been called');
});

test('should let loader register', function() {
  var spade = t.spade;
  equal(spade.require('foo/bar').id, 'foo/bar', 'should find foo');
  equal(spade.loader.requests, 1, 'loader should have been called');
});

test('should throw if loader does not register', function() {
  var spade = t.spade;
  raises(function() {
    spade.require('imaginary/bar');
  });
  equal(spade.loader.requests, 1, 'loader should have been called');
});

})();
// ==========================================================================
// Project:   Spade - CommonJS Runtime
// Copyright: ©2010 Strobe Inc. All rights reserved.
// License:   Licened under MIT license (see __preamble__.js)
// ==========================================================================
/*globals spade */


(function() {
  
var t = {};   
var t3; 

// ..........................................................
// BASIC REQUIRE
// 

module('spade: normalize', {
  setup: function() {
    t.spade = new spade.Spade(); 
  }, 
  
  teardown: function() {
    delete t.spade;
  }
});

test('normalize', function() {
  var spade = t.spade;
  equal(spade.normalize('foo/bar'), 'foo/bar');
  equal(spade.normalize('./foo', 'bar/baz'), 'bar/foo');
  equal(spade.normalize('../foo', 'bar/baz'), 'foo/main');
  equal(spade.normalize('foo/../bar//foo/./baz', 'bar/baz'), 'bar/foo/baz');

  equal(spade.normalize('/foo/./bar'), 'foo/bar');
  equal(spade.normalize('foo/../bar/'), 'bar/main');
  equal(spade.normalize('/foo/../bar/'), 'bar/main');

  equal(spade.normalize('/foo/bar'), 'foo/bar');
  equal(spade.normalize('foo/bar/'), 'foo/bar');
  equal(spade.normalize('/foo/bar/'), 'foo/bar');
  
  equal(spade.normalize('PKG/foo/bar'), 'PKG/foo/bar');
  equal(spade.normalize('BAR/foo', 'PKG/bar/baz'), 'BAR/foo');
  equal(spade.normalize('./foo', 'PKG/bar/baz'), 'PKG/bar/foo');
  equal(spade.normalize('../foo', 'PKG/bar/baz'), 'PKG/foo');
  equal(spade.normalize('./foo/../../bar//foo/./baz', 'PKG/bar/baz'), 'PKG/bar/foo/baz');
  
});

test('normalize package', function() {
  var spade = t.spade;
  spade.register('sproutcore', {}); // register as a package
  equal(spade.normalize('sproutcore'), 'sproutcore/main');
  equal(spade.normalize('foo/sproutcore'), 'foo/sproutcore');
});

test('normalize relative require from main', function() {
  // I think this is a valid test, but not certain
  var spade = t.spade, mainRequire, otherRequire;
  spade.register('foo', { main: './lib/foo', directories: { lib: './lib/foo' } });
  spade.register('foo/main', 'return require;');
  spade.register('foo/other/main', 'return require;');
  mainRequire = spade.require('foo/main');
  otherRequire = spade.require('foo/other/main');
  equal(mainRequire.normalize('./foo/adfadf'), 'foo/adfadf', 'works for real main');
  equal(otherRequire.normalize('./foo/core'), 'foo/other/foo/core', "no difference for fake main");
});

test('normalize tilde paths with lib', function() {
  var spade = t.spade, fooRequire;
  spade.register('foo', { directories: { lib: './lib' }}); // register as a package
  spade.register('foo/main', 'return require;');
  fooRequire = spade.require('foo');
  equal(fooRequire.normalize('foo/~lib/main'), 'foo/main');
  equal(fooRequire.normalize('foo/~lib/core'), 'foo/core');
});

})();
// ==========================================================================
// Project:   Spade - CommonJS Runtime
// Copyright: ©2010 Strobe Inc. All rights reserved.
// License:   Licened under MIT license (see __preamble__.js)
// ==========================================================================
/*globals spade deepEqual */


(function() {
  
var t = {}, Spade = spade.Spade;

module('spade: packages', {
  setup: function() {
    t.spade = new Spade();
  },
  
  teardown: function() {
    delete t.spade;
  }
});

test('should find registered package', function() {
  
  var spade = t.spade;
  spade.register('PKG', { name: 'PKG' });
  
  equal(spade.package('PKG').name, 'PKG');
  equal(spade.package('PKG/foo/bar').name, 'PKG');
  
});

test('should respect mappings', function() {
  
  var spade = t.spade;
  spade.register('PKG', { mappings: { foo: 'FOO' } });
  
  spade.register('PKG/bar', function(require, exports) {
    exports.id = require('foo/foo').id;
  });
  
  spade.register('FOO/foo', function(r, e) { e.id = 'FOO'; });
  
  equal(spade.require('PKG/bar').id, 'FOO'); // should remap pkg name
  
});

test('should set default directories', function() {
  var spade = t.spade;
  spade.register('PKG', { name: 'PKG' });
  deepEqual(spade.package('PKG').directories, { 'lib': ['lib'] });
});

})();
// ==========================================================================
// Project:   Spade - CommonJS Runtime
// Copyright: ©2010 Strobe Inc. All rights reserved.
// License:   Licened under MIT license (see __preamble__.js)
// ==========================================================================
/*globals spade */


(function() {

var t = {}, Spade = spade.Spade;
  
// ..........................................................
// BASIC REQUIRE
// 

module('spade: relative require', {
  setup: function() {
    t.spade = new Spade(); 

    ['foo', 'bar'].forEach(function(id) {
      t.spade.register(id, { "name": id });
    });

    // register some dummy modules.  These will just set an 'id' prop on exports
    ['foo/bar', 'bar/main', 'foo/bar/baz'].forEach(function(id) {
      t.spade.register(id, function(r, e) { e.id = id; });
    });
  },
  
  teardown: function() {
    delete t.spade;
  }
});

test('require absolute', function() {
  var spade = t.spade;

  spade.register('blah/main', function(require, e) {
    e.found = require('foo/bar').id;
  });

  equal(spade.require('blah').found, 'foo/bar');
});

test('require relative top level', function() {
  var spade = t.spade;
  spade.register('blah/main', function(require, e) { 
    e.found = require('../bar').id; 
  });
  
  equal(spade.require('blah').found, 'bar/main');
});

test('require relative nested', function() {
  var spade = t.spade;
  spade.register('foo/blah', function(require, e) { 
    e.found = require('./bar').id; 
  });
  
  equal(spade.require('foo/blah').found, 'foo/bar');
});

test('require relative  up nested', function() {
  var spade = t.spade;
  spade.register('bar/blah', function(require, e) { 
    e.found = require('../foo/bar/baz').id; 
  });
  
  equal(spade.require('bar/blah').found, 'foo/bar/baz');
});

})();
// ==========================================================================
// Project:   Spade - CommonJS Runtime
// Copyright: ©2010 Strobe Inc. All rights reserved.
// License:   Licened under MIT license (see __preamble__.js)
// ==========================================================================
/*globals spade raises */


(function() {
  
var t = {},
    Spade = spade.Spade;
    
// ..........................................................
// BASIC REQUIRE
//

module('spade: basic require', {
  setup: function() {
    t.spade = new Spade();
  },
  
  teardown: function() {
    delete t.spade;
  }
});

test('register then require a module', function() {
  var spade = t.spade;

  spade.register('foo/bar', function(require, exports) {
    exports.foo = 'bar';
  });

  var exp = spade.require('foo/bar');
  equal(exp.foo, 'bar', 'exports.foo == bar - means require succeeded');
});

test('register a string factory then require', function() {
  var spade = t.spade;

  spade.register('foo/bar', "exports.foo = 'bar';");

  var exp = spade.require('foo/bar');
  equal(exp.foo, 'bar', 'exports.foo == bar - means require succeeded');
});

test('require a non-existant module will throw an exception', function() {
  var spade = t.spade;
  raises(function() {
    spade.require('imaginary/foo');
  }, 'Module imaginary/foo not found');
});

test('require a module that was just registered symbolically.  This is for compatibility with non-module items', function() {
  var spade = t.spade;
  spade.register('not/a-module');
  ok(spade.require('not/a-module'));
});

})();
// ==========================================================================
// Project:   Spade - CommonJS Runtime
// Copyright: ©2011 Strobe Inc. All rights reserved.
// License:   Licened under MIT license (see __preamble__.js)
// ==========================================================================
/*globals spade */


(function() {

var t = {}, Spade = spade.Spade, Sandbox = spade.Sandbox;
  

module('spade: Sandbox Creation', {
  setup: function() {
    t.spade = new Spade(); 
  },
  
  teardown: function() {
    delete t.spade;
  }
});

test('basic sandbox', function() {
  var spade = t.spade,
      sandbox = new Sandbox(spade);
      
  // note: using equal() here causes an infinite loop for some reason
  ok(sandbox.spade === spade, 'sandbox.spade == spade');
  equal(sandbox.name, '(anonymous)');
  equal(sandbox.isIsolated, false);
});

test('named sandbox', function() {
  var sandbox = new Sandbox(t.spade, 'Test Sandbox');

  equal(sandbox.name, 'Test Sandbox');
});

test('isolated sandbox', function() {
  var sandbox = new Sandbox(t.spade, 'Test Sandbox', true),
      sandbox2 = new Sandbox(t.spade, true);

  equal(sandbox.isIsolated, true);
  equal(sandbox2.isIsolated, true);
});

})();

// ==========================================================================
// Project:   Spade - CommonJS Runtime
// Copyright: ©2011 Strobe Inc. All rights reserved.
// License:   Licened under MIT license (see __preamble__.js)
// ==========================================================================
/*globals spade */


(function() {

var t = {}, Spade = spade.Spade, Sandbox = spade.Sandbox;
  

module('spade: Sandbox evaluation', {
  setup: function() {
    t.sandbox = new Sandbox(new Spade());
  },
  
  teardown: function() {
    delete t.sandbox;
  }
});

test('normal', function(){
  equal(t.sandbox._evaluatorInited, undefined);
  equal(t.sandbox.evaluate('2 * 2'), 4);
  equal(t.sandbox._evaluatorInited, true);
});

test('already initialized', function(){
  // Initialize
  t.sandbox.evaluate('');
  // Test
  equal(t.sandbox.evaluate('3 * 3'), 9);
});

test('destroyed', function(){
  t.sandbox.destroy();
  raises(function(){ t.sandbox.evaluate('4 * 4'); }, Error, "Sandbox destroyed");
});

})();

// ==========================================================================
// Project:   Spade - CommonJS Runtime
// Copyright: ©2011 Strobe Inc. All rights reserved.
// License:   Licened under MIT license (see __preamble__.js)
// ==========================================================================
/*globals spade */


(function() {

var t = {}, Spade = spade.Spade, Sandbox = spade.Sandbox;
  

module('spade: Sandbox Miscellaneous', {
  setup: function() {
    t.sandbox = new Sandbox(new Spade(), 'Test Sandbox');
  },
  
  teardown: function() {
    delete t.sandbox;
  }
});

test('toString', function(){
  equal(t.sandbox.toString(), '[Sandbox Test Sandbox]');
});

test("exists", function(){
  t.sandbox.spade.register('test', { name: 'test' });
  t.sandbox.spade.register('test/main', '');

  ok(t.sandbox.exists('test'), "test should exist");
  ok(!t.sandbox.exists('missing'), "missing should not exist");
});

test("async", function(){
  t.sandbox.spade.register('test', { name: 'test' });
  t.sandbox.spade.register('test/main', 'exports.hello = "hi";');

  stop(1000);
  t.sandbox.async('test', function(err) {
    equals(err, null, 'should not return an error');
    start();
  });
});

test("url", function(){
  t.sandbox.spade.register('no-root', { name: 'no-root' });
  t.sandbox.spade.register('with-root', { name: 'with-root', root: 'root/url' });

  raises(function(){ t.sandbox.url('missing'); }, "Can't get url for non-existent package missing/main");
  raises(function(){ t.sandbox.url('no-root'); }, "Package for no-root/main does not support urls");
  equal(t.sandbox.url('with-root'), 'root/url/main');
});

test("destroy", function(){
  equal(t.sandbox.isDestroyed, false);
  t.sandbox.destroy();
  equal(t.sandbox.isDestroyed, true);
});

})();

// ==========================================================================
// Project:   Spade - CommonJS Runtime
// Copyright: ©2011 Strobe Inc. All rights reserved.
// License:   Licened under MIT license (see __preamble__.js)
// ==========================================================================
/*globals spade */


(function() {

var t = {}, Spade = spade.Spade, Sandbox = spade.Sandbox;
  

module('spade: Sandbox require', {
  setup: function() {
    t.sandbox = new Sandbox(new Spade()); 
    t.sandbox.spade.register('testing', { name: 'testing' });
    t.sandbox.spade.register('testing/main', "exports.hello = 'hi';");
  },
  
  teardown: function() {
    delete t.sandbox;
  }
});

test("require new", function(){
  equal(t.sandbox.require('testing').hello, 'hi');
});

// NOTE: This test doesn't necessarily tell us that anything special is happening, just that it works
test("require existing", function(){
  // Cache it
  t.sandbox.require('testing');
  // Now require again
  equal(t.sandbox.require('testing').hello, 'hi');
});

test("throw if doesn't exist", function(){
  raises(function(){ t.sandbox.require('missing'); }, "Module missing not found");
});

})();


