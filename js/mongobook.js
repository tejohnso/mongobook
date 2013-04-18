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
         console.log(data);
         $('.tab-content').prepend(data.address);
         $('#tabs').prepend(data.title);
      }});
};

