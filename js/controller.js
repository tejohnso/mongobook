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

controller.updateViews = function(paths, templateDocs, affectedElements, cbs) {
   //paths contains a list of template paths to update
   //templateDocs contains an array of new documents for each template render or 
   //it can be a single object applied to all renders
   //
   //when we return from updating the server, we refresh the local template again
   //to capture any chagnes the server made (eg: _id update on new doc save)
   var returnedDocs = [];
   var returnCounter = 0;
   var updatedDataSources = [];
   var dataSourcePath;
   var sourceIndex;
   var multipleSourceDocuments = $.isArray(templateDocs);
   var newDoc = templateDocs;  //assume we only have one document coming in for now
   var runCallbacks = function() {
   //when all posts are complete, update the views (again, incase new data from server)
   //if there are callbacks, run them agains the returnedDocs
   //we have to wait until all posts are complete because some view updates might depend
   //on a document update that happens from a different view update.  For instance if 
   //3 views use the same document source, only one of the updates is going to server.
      var oldDoc;
      var searchField;
      $.each(paths, function(idx, val) {
         var returnedDoc; //the actual doc needs to be extracted from the templating format
         //check to see if the search field in the path is different. 
         //if so, delete view, otherwise just overwrite
         //our return document may point to another index if it was the same post path
         
         if ($.isNumeric(returnedDocs[idx])) {
            returnedDocs[idx] = returnedDocs[returnedDocs[idx]];
         } else {
            returnedDocs[idx] = JSON.parse(returnedDocs[idx]);
         }
         oldDoc = multipleSourceDocuments ? templateDocs[idx] : templateDocs;
         searchField = val.split('/')[2];
         returnedDoc = returnedDocs[idx][mongobook.templateDataSourceCollections[val.split('/')[1]]][0];
         if (oldDoc[searchField] !== returnedDoc[searchField]) {
            delete controller.views[val];
         }
         controller.views['/' + val.split('/')[1] + '/' + searchField + 
         '/' + returnedDoc[searchField]] = controller.
         templates[val.split('/')[1]](returnedDocs[idx]).trim();

         //replace old elements with newly fetched doc call renderviews
         if ($.isArray(affectedElements[idx])) {
            $.each(affectedElements[idx], function() {
               affectedElements[idx].replaceWith($(controller.views[val]));
            });
         } else {
            $(affectedElements[idx]).replaceWith($(controller.views[val]));
         }
         if (cbs[idx]) {cbs[idx](returnedDoc);}  // Trigger our ui confirmation 
      });
   };
       
   $.each(paths, function(idx, val) {
      var postID = val.split('/')[3];
      if (multipleSourceDocuments) {newDoc = templateDocs[idx];}
      controller.views[val] = controller.templates[val.split('/')[1]](newDoc).trim();
      dataSourcePath = mongobook.templateDataSourceCollections[val.split('/')[1]];
      dataSourcePath = '/' + dataSourcePath + '/' + val.split('/')[2] + '/' + postID;
      sourceIndex = updatedDataSources.indexOf(dataSourcePath);
      if (val.split('/')[2] === '_id' && postID.length !== 24) {
         postID = '$new';
      }
      if (sourceIndex === -1 || multipleSourceDocuments) { //un-updated datasource
         $.ajax({
            url: dataSourcePath,
            type: 'POST', //posting to the server will update its cache
            data: newDoc,
            success: function(data) { 
               //add counter to the listener. 
               returnedDocs[idx] = data;
               returnCounter += 1;
               if (returnCounter === paths.length) {runCallbacks();}
            }
         });
         updatedDataSources.push(dataSourcePath);
      } else {
         //if we were posting the same collection, search field, and target value
         //then we don't re-post.  We take the same data as before
         returnCounter += 1;
         returnedDocs[idx] = sourceIndex;
         if (returnCounter === paths.length) {runCallbacks();}
      }
   });
};

