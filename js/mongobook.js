$('.btn-primary').on('click', function(event) {
   appendNewAddressTab({});
   return false; //stop propagation
});

var appendNewAddressTab = function(newAddressData) {
   //fetch an address - or create a blank one if newAddressData is empty json

   $.ajax({
      url: '/address',
      type: 'POST',
      data: newAddressData,
      success: function(data) {
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
   alert('saving ' + event.target);
   return false;
};
