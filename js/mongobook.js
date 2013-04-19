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

