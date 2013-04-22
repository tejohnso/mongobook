var mongobook = {};

mongobook.appendNewAddress = function(docID) {
   //create the new address panel then create the tab for it - then click the tab
   //also create the row in the address list - no view caches are updated until SAVE

   var templatePaths;
   var templates = ['/address/', '/addressTabTitle/'];
   var templateContainers = ['#addressPanes', '#tabs'];
   var path = '_id/' + docID;
   var newTabCallback = function(newTab) {
      newTab.find('a').click();
      $(newTab.find('a').attr('href')).find('input').first().focus();
   };
   var callbacks = [null, newTabCallback];
   if (docID === '') {

      //for a new BLANK address, we need to add a new row and set the _id
      docID = Math.random().toString().substr(2, 18);
      path = '{"first":"first","last":"last","_id":"' + docID + '"}';
      templates.push('/addresses/');
      templateContainers.push('#rows');
      callbacks.push(null);
   }
   templatePaths = [path, path, '{"addresses": [' + path + ']}'];

   $.each(templates, function(idx, template) {
      controller.renderView(template + templatePaths[idx], 
                            templateContainers[idx],
                            callbacks[idx]);
   });
};

mongobook.delAddress = function(event) {
   var button = $(event.target);
   var id = button.parent().find('input[name=_id]').val();
   $('#addresses .nav-tabs').find('a[href=#' + id + ']').closest('li').remove();
   $('#' + id).remove();
   $('.table-striped').find('tbody').
      find('td.hidden:contains(' + id + ')').closest('tr').remove();
   delete mongobook.views['/addresses/_id/$all'];
   delete mongobook.views['/addresses/_id/' + id];
   $.ajax({
      url: '/addresses/_id/' + id,
      type: 'DELETE'
   });
   return false;
};

mongobook.saveAddress = function(event, del){
   var button = $(event.target);
   var type = (del === true) ? 'DELETE' : 'POST';
   var newAddressData = urlQueryToObject(button.closest('form').serialize());
   var id = newAddressData._id;
   delete newAddressData._id; //never try to update an id in an existing document
   mongobook.updateView('/addresses/_id/' + id, newAddressData);
   $('.table-striped').find('td.hidden:contents(' + id + ')').parent().find('td').last().html('<img src="ajax-loader.gif" />'); //add the spinner
   
   controller.renderView('/addresses/_id/' + id, '.table-striped tbody', updateAddress);

   var updateRow = function(newRow) {
      newRow.find('.hidden').html('#' + newID); //update the id in the address list row
      button.closest('input[name=_id]').val(newID); //update the id in the save button
      $(tabID).attr('id', '#' + newID); //update the id in the tab contents 
      $('#tabs').find('a[href=' + tabID + ']').attr('href', '#' + newID); //update the id in the tab link
      newRow.find('td').last().html(''); //remove the loading gif
   };
   controller.updateView('/address/_id/' + id, '.tab-content', updateRow);
   return false;
};

mongobook.urlQueryToObject = function(query) {
   //maybe we can get rid of this if we always pass in a JSON-valid path to renderView
   var obj = {};
   $.each(query.split('&'), function(idx, val) {
      obj[val.split('=')[0]] = val.split('=')[1];
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
