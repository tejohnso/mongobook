var mongobook = {};
//ALL POSSIBLE PATHS SHOULD BE IN AN OBJECT
//THAT WAY WHEN WE NEED TO UPDATE THE CACHE WE CAN ITERATE THE OBJECT ELEMENTS MATCHING
//OUR CURRENT PATH - ACTUALLY WE SHOULD ITERATE THE UNIQUE TEMPLATEDATASOURCES
mongobook.templateDataSourceCollections = {"addresses": "addresses",
                                           "address": "addresses",
                                           "addressTabTitle": "addresses"};

mongobook.appendNewAddress = function(docID) {
   //create the new address panel then create the tab for it - then click the tab
   //also create the row in the address list - no view caches are updated until SAVE

   var templatePaths;  
   var templates = ['/address/', '/addressTabTitle/'];
   var templateContainers = ['#addressPanes', '#tabs'];
   var path = '_id/' + docID;
   var newTabCallback = function(newTab) {
      $('#addresses .tab-pane').removeClass('active');
      newTab.find('a').click();
      $(newTab.find('a').attr('href')).find('input').first().focus();
   };
   var callbacks = [null, newTabCallback];
   if (docID === '') {
      //can render a temporary view locally by specifying JSON in the path
      //for a new BLANK address, we need to add a new row and set the _id
      templates.push('/addresses/');
      docID = Math.random().toString().substr(2, 18);
      path = '{"addresses": [{"first":"first","last":"last","_id":"' + docID + '"}]}';
      
      templateContainers.push('#rows');
      callbacks.push(null);
   }
   templatePaths = [path, path, path];
   
   $.each(templates, function(idx, template) {
      controller.renderView(template + templatePaths[idx], 
                            templateContainers[idx],
                            callbacks[idx]);
   });
};

mongobook.delAddress = function(event) {
   
   //remove 3 elements - clear caches (2 local, 2 remote)
   var button = $(event.target);
   var id = button.parent().find('input[name=_id]').val();
   $('#tabs').find('a[href=#' + id + ']').closest('li').remove();
   $('#' + id).remove();
   $('#rows').find('td.hidden:contains(' + id + ')').closest('tr').remove();
   delete controller.views['/addresses/_id/$all'];
   delete controller.views['/addresses/_id/' + id];
   $.ajax({
      url: '/addresses/_id/' + id,
      type: 'DELETE'
   });
   return false;
};

mongobook.saveAddress = function(event, del){
   var button = $(event.target);
   var type = (del === true) ? 'DELETE' : 'POST';
   var newAddressData = mongobook.urlQueryToObject(button.closest('form').serialize());
   var oldID = newAddressData._id;
   var updatePaths = ['/address/_id/' + oldID,
                     '/addressTabTitle/_id/' + oldID,
                     '/addresses/_id/' + oldID]; 
   //elementSelectors will be passed into updateViews.  
   //Each array index will be one or more selector strings that 
   //need to be removed and re-rendered after all posts are completed
   var elementsForRefresh = [
      $('#' + oldID),
      $('#tabs').find('a[href=#' + oldID + ']').parent(),
      $('#rows').find('td.hidden:contains(' + oldID + ')').parent()];

   var uiConfirm = function(oldID) { 
      //return a callback that updates the loading gif with the done gif
      return function() {
         var doneImg = $('<img src="ajax-loader-done.gif" class="hidden"/>');
         var blankImg = $('<img src="ajax-loader-blank.gif"/>');
         var rowImageCol = ($('#rows').find('td.hidden:contains(' + oldID + ')').parent()
         .find('td').last());
         rowImageCol.find('img').remove();
         doneImg.prependTo(rowImageCol).fadeIn('slow'); 

         setTimeout(function() {
            doneImg.fadeOut('slow', function() {
               doneImg.replaceWith(blankImg);
            });
         }, 4000);
      };
   };

   $('#rows').find('td.hidden:contains(' + oldID + ')').parent()
   .find('td').last().html('<img src="ajax-loader.gif" />'); //add the spinner

   //update all the appropriate local view caches and server. After the first one completes
   //we will indicate success on the ui since these all have the same data source.
   controller.updateViews(updatePaths,
                          newAddressData,
                          elementsForRefresh,
                          [null, null, uiConfirm(oldID)]);
   return false;
};

mongobook.urlQueryToObject = function(query) {
   //maybe we can get rid of this if we always pass in a JSON-valid path to renderView
   var obj = {};
   $.each(query.split('&'), function(idx, val) {
      obj[decodeURIComponent(val.split('=')[0])] = decodeURIComponent(val.split('=')[1]);
   });
   return obj;
};

$(document).ready(function() {
   controller.loadTemplates(["address", "addresses", "addressTabTitle"]);
   controller.renderView('/addresses/_id/$all', '.table-striped tbody', function(view) {
      $('.btn-primary').on('click', function(event) {
         mongobook.appendNewAddress('');
         return false; 
      });
   
      //handler for clicking on table rows to select a document
      $('#rows').on('click', 'tr', function(event) { //delegate event only to tr
         mongobook.appendNewAddress($(this).find('.hidden').html());
         return false;
      });
   });

   //click handlers for new address panes
   $('#addresses').on('click', 'button', function(event) {
      if ($(this).attr('class').indexOf('btn-edit') > -1) {
         $(this).prev().focus();
         return false;
      }
      if ($(this).attr('class').indexOf('btn-save') > -1) {
         mongobook.saveAddress(event);
         return false;
      }
      if ($(this).attr('class').indexOf('btn-delete') > -1) {
         mongobook.delAddress(event);
         return false;
      }
   });

   //click handler for new tabs
   $('#tabs').on('click', 'i', function(event) {
      var id = $(this).closest('a').attr('href').substr(1);
      if (id.length < 24) {                          //remove table row for unsaved closes
         $('#rows').find('td.hidden:contains(' + id + ')').closest('tr').remove();
      }
      $('#' + id).remove();                                //remove address details
      $(this).closest('li').remove();                //remove tab
      return false;
   });   
});
