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
//the resulting view will be inserted into the passed in jQuery select string and
//the callback will be called on the newly inserted element tree
controller.renderView = function(path, insertInto, cb) {
   var newElements;
   if (path.indexOf('{') > -1) { 
      
      //return locally rendered template from supplied path string
      newElements = $(controller.templates[path.split('/')[1]](JSON.parse(path.split('/')[2])).trim()).prependTo(insertInto);
      if (cb) {cb(newElements);}
   } else {  
      
      //check for cached compiled view
      if (controller.views[path] === undefined) { //no cache
         var getPath = path.split('/'); //the server sees the collection name
         getPath[1] = mongobook.templateDataSourceCollections[getPath[1]];
         $.get(getPath.join('/'), function(data) {
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

controller.updateViews = function(paths, newDocs, cbs) {
   //paths contains a list of template paths to update
   //newDocs contains an array of new documents for each template render or 
   //it can be a single object applied to all renders
   var updatedDataSources = [];
   var dataSourcePath;
   var newDoc;
   $.each(paths, function(idx, val) {
      newDoc = $.isArray(newDocs) ? newDocs[idx] : newDocs;
      controller.views[val] = controller.templates[val.split('/')[1]](newDoc).trim();
      dataSourcePath = mongobook.templateDataSourceCollections[val.split('/')[1]];
      if (updatedDataSources.indexOf(dataSourcePath) === -1) { //un-updated datasource
         $.ajax({
            url: '/' + dataSourcePath + '/' + val.split('/')[2] + '/' + val.split('/')[3],
            type: 'POST', //posting to the server will update its cache
            data: newDoc,
            success: function(data) { 
               if (cbs[idx]) {cbs[idx](data);}   //POSTed. Trigger our ui confirmation 
            }
         });
         updatedDataSources.push(dataSourcePath);
      } else {
         if (cbs[idx]) {cbs[idx](doc);}
      }
   });
};

