//one function to help with all routing scenarios.
//Should be 25 lines or less
//Should handle post, get, delete
//
//include a parameter for the applicable collection name
//pre-existing template values should be in the request body
//flag for overwriting existing template values
//id should be part of the path
//should return a JSON formatted string 
//
//
var CRUD = function(request, response, next, coll, override) {
   conLog('CRUD processing path: ' + request.path);
   var docID = request.path.split('/')[1];
   conLog('CRUD processing id: ' + docID);
   switch (request.method) {
      case 'GET':
         mongostash.getDocument('_id', docID, coll, request.body, callBack);
         break;
      case 'POST':
         mongostash.setDocument('_id', docID, coll, request.body, false, callBack);
         break;
      case 'DELETE':
         mongostash.setDocument('_id', docID, coll, {}, true, callBack);
      break;
   }

   var callBack = function(err, doc) {

   };
};
