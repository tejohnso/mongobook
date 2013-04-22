var controller = {};
//controller.views[path] gives the rendered view for that path.  
//path is /template/searchField/searchTarget 
//target can be $all as in /template/_id/$all to get all the models for that collection
controller.loadTemplates = function(templateNames) {
   controller.templates = {};
   controller.views = {};
   $.each(templateNames, function(idx, val) {
      $.get(val + '.mu', function(data) {
         controller.templates[val] = Mustache.compile(data);
      });
   });
};

//views can be rendered with a search path and results will be cached or they
//can be rendered with a local url string uncached meant to be temporary
//the resulting view will be inserted into the passed in jQuery select and
//the callback will be called on the new element tree
controller.renderView = function(path, insertInto, cb) {
   var newElements;
   if (path.indexOf('{') > -1) { 
      
      //return rendered template from supplied path string
      newElements = $(controller.templates[path.split('/')[1]](JSON.parse(path.split('/')[2])).trim()).prependTo(insertInto);
      if (cb) {cb(newElements);}
   } else {  
      
      //check for cached compiled view
      if (controller.views[path] === undefined) { //no cache
      $.get(path, function(data) {
         controller.views[path] = controller.templates[path.split('/')[1]](JSON.parse(data)).trim();
         newElements = $(controller.views[path]).prependTo(insertInto);
         if (cb) {cb(newElements);}
      });
      } else {  
         
         //take from cache
         newElements = $(controller.views[path]).prependTo(insertInto);
         if (cb) {cb(newElements);}
      }
   }
};

controller.updateView = function(path, cb) {
   $.ajax({
      url: path, 
      type: type,
      data: newAddressData,
      success: function(data) { //update the old id in 4 places and remove the spinner
         controller.views[path] = controller.templates[path.split('/')[1]](data);
         if (cb) {cb(data);}
      }
   });
};

