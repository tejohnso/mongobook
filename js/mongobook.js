$('.btn-primary').on('click', function(event) {
   appendNewAddressTab();
   return false; //stop propagation
});

var appendNewAddressTab = function(docID) {
   //fetch an address - or create a blank one (we still go back to the server)
   //we go back to the server to hit the template again - client side caching would be ++
   $.ajax({
      url: '/address/' + (docID || ''),
      type: 'GET',
      success: function(data) {
         //data contains title html and address panel html
         data = data.replace(/[\n\r]/g, ' ');
         data = JSON.parse(data);
         var newTab = $(data.address).prependTo('.tab-content');
         newTab.find('.icon-edit').closest('.btn').on('click', function(event) {
               $(this).prev().focus();
         });
         newTab.find('.form-actions').find('button.btn-save').on('click', updAddress);
         newTab.find('.form-actions').find('button.btn-delete').on('click', delAddress);
         var newTabTitle = $(data.title).prependTo('#tabs');
         newTabTitle.find('.icon-remove').click(function(event) {
            $($(this).closest('a').attr('href')).remove();
            $(this).closest('li').remove();
         });
         newTabTitle.find('a').click();
         newTab.find('input').first().focus();
      }});
};

var updAddress = function(event, del){
   var button = event.target;
   var type = 'POST';
   if (del === true) {type = 'DELETE';}
   $.ajax({
      url: '/address',
      type: type,
      data: $(button).closest('form').serialize(),
      success: function(data) {
         //$(button).siblings('input[name=docID]').val(JSON.parse(data)._id); //deprecated
         location.reload(true); //could be improved if the view was a separate template
      }
   });
};

var delAddress = function(event) {
   updAddress(event, true);
};

//handler for clicking on table rows to select a document
$('.table-striped').on('click', 'tr', function(event) { //delegate event only to tr
   appendNewAddressTab($(this).find('.hidden').html());
   return false;
});




var mongobook = {};
mongobook.templateList = ['addresses', 'address', 'addressTabTitle'];

//mongobook[models][path] gives the model collection for that path.  
//path can be a /template/searchField/searchTarget for one item or
//path can be /template/_id/$all to get all the models for that collection
mongobook.loadTemplates = function() {
   mongobook.templates = {};
   mongobook.views = {};
   $.each(mongobook.templateList, function(idx, val) {
      $.get(val + '.mu', function(data) {
         mongobook.templates[val] = Mustache.compile(data);
      });
   });
};

mongobook.renderView = function(path, insertInto) {
   if (mongobook.views[path] === undefined) {
      $.get(path, function(data) {
         mongobook.views[path] = mongobook.templates[path.split('/')[1]](JSON.parse(data)).trim();
         $(mongobook.views[path]).prependTo(insertInto);
      });
   } else {
      $(mongobook.views[path]).prependTo(insertInto);
   }
};

$(document).ready(function() {
   mongobook.loadTemplates();
   mongobook.renderView('/addresses/_id/$all', '.table-striped tbody');
});
