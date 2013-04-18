module.exports = function(logYN) {   
   
   //setup a logging function conLog if consoleOutput is 1
   if (logYN === 1) {
      return function(out) {console.log(out);};
   }
   return function() {return;};
}
