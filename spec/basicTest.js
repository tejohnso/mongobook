if (typeof module === 'object' && typeof require === 'function') {
   var buster = require('buster');
}

buster.testCase("Initial Testing", {
   "Buster is working": function() {
      assert(true);
   },

   "browser test - ": {
      requiresSupportFor: {"DOM": typeof document !== 'undefined'},
      "window object exists": function() {
         assert.equals(typeof window, 'object');
      }
   }
});
