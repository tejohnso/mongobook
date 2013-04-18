$('.btn-primary').on('click', function(event) {
   appendNewAddressTab();
   return false; //stop propagation
});

var appendNewAddressTab = function(docID) {
   //fetch an address - or create a blank one 
console.log(docID);
console.log(typeof docID);
   $.ajax({
      url: '/address/' + (docID || ''),
      type: 'GET',
      success: function(data) {
         //data contains {title: (title tab html), address: (address form html)}
         data = data.replace(/[\n\r]/g, ' ');
         data = JSON.parse(data);
         $('#addresses .tab-pane.active').removeClass('active');
         var newTab = $(data.address).prependTo('.tab-content');
         newTab.find('.icon-edit').closest('.btn').on('click', function(event) {
               $(this).prev().focus();
         });
         newTab.find('.form-actions').find('button[type=submit]').on('click', saveAddress);
         $('#tabs').prepend(data.title);
      }});
};

var saveAddress = function(event){
   var button = event.target;
   $.ajax({
      url: '/address',
      type: 'POST',
      data: $(button).closest('form').serialize(),
      success: function(data) {
         $(button).siblings('input[name=docID]').val(JSON.parse(data)._id);
      }
   });
   return false;
};
