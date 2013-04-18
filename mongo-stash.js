//look at every *.mu file in the mustache directory
//for each hash block in each file, try to find a database collection with that hash block name
//store the documents for the collection 
//templateCollections = {"template1": { "sectionA": ["xxx","yyy","zzz"],
//                                      "sectionB": ["xx", "xxx", "xxx"]},
//                       "template2": { "sectionA": ["xxx', "xxx", "xxx"]}}
//This way all template variables are stored in an object and they can be used by compileAndRender

var mongo = require('mongodb');
var Db = mongo.Db;
var fs = require('fs');
var events = require('events');
require('buffer-helpers');
var conLog = require('./conLog.js')(1);

var loadCollections = function(templatesPath, dbOrURL, cb) {
   var templateCollections = {};
   var fetchCount = {};
   var fileCount = 0;

   var fileProcessor = new events.EventEmitter();
   fileProcessor.populateCollectionObjects = function(fileName, db) {
      var templateName = fileName.split('.')[0];
      templateCollections[templateName] = {};
      fs.readFile(templatesPath + '/' + fileName, function(err, data) {
         if (err) {if (cb) {cb(err);} else {throw err;}}
         data = data.extractSubsets('{{#', '}}');
         if (data.length === 0) {fileProcessor.emit('fileDone', templateName);return;}
         fetchCount[templateName] = data.length;
         data.forEach(function(key) {
            collectionGetter.getCollectionData(templateName, key.toString(), db); //get each collection
         });
      });
   };

   var collectionGetter = new events.EventEmitter();
   collectionGetter.getCollectionData = function(template, colName, db) {
      db.collection(colName, function(err, coll) {
         if (err) {if (cb) {cb(err);} else {throw err;}}
         coll.find(function(err, curs) {
            if (err) {if (cb) {cb(err);} else {throw err;}}
            curs.toArray(function(err, docs) {
               if (err) {if (cb) {cb(err);} else {throw err;}}
               templateCollections[template][colName] = docs;
               collectionGetter.emit('collDone', template);
            });
         });
      }); 
   };

   collectionGetter.on('collDone', function(templateDone) {
      fetchCount[templateDone] -= 1;
      if (fetchCount[templateDone] === 0) {
         fileProcessor.emit('fileDone', templateDone);
      }
   });

   fileProcessor.on('fileDone', function(name) {
      console.log(name);
      fileCount -= 1;
      if (fileCount === 0) {
         console.log('-----------------------\n');
         if (cb) {cb();}
      }
   });

   var processFiles = function(db) {
      console.log('reading template directory ' + templatesPath + '\n');
      fs.readdir(templatesPath, function(err, files) {
         if (err) {if (cb) {cb(err);} else {throw err;}}
         console.log('---loading templates---');
         fileCount = files.length;
         files.forEach(function(key) {
            fileProcessor.populateCollectionObjects(key, db); //process each template file
         });
      });
   };
   
   if (typeof dbOrURL === 'string') {
      conLog('creating connection for template load');
      Db.connect(dbOrURL, function(err, db) {
         if (err) {if (cb) {cb(err);} else {throw err;}}
         loadCollections.db = db;
         processFiles(db);
      });
   } else {
      if (!(dbOrURL instanceof Db)) {
         cb("mongo-stash: Expecting a mongo database or a url to a mongo database.");
         return;
      }
      loadCollections.db = dbOrURL;
      processFiles(dbOrURL);
   }

   loadCollections.templateCollections = templateCollections;
   return loadCollections;
};

loadCollections.getDocument = function(searchElement, searchTarget, templateName, templateVars, cb) {
   //This function will retrieve a collection of data for a particular document
   loadCollections.db.collection(templateName, function(err, coll) {
      if (err) {cb(err);return;}
      var searchObject = {}, searchObjectText = {}, searchObjectNum = {};
      if (searchElement === "_id") {
         searchObject._id = mongo.BSONPure.ObjectID.createFromHexString(searchTarget);
      } else {
         searchObjectText[searchElement] = searchTarget.toString();
         searchObjectNum[searchElement] = parseInt(searchTarget, 10);
         searchObject = {$or: [searchObjectText, searchObjectNum]};
      }
      coll.findOne(searchObject, function(err, doc) {
         var key;
         if (err) {cb(err);return;}
         if (doc === null) {cb(templateVars); return;} 
         for (key in doc) {if (doc.hasOwnProperty(key)) {templateVars[key] = doc[key];}}
         cb(null, templateVars);
      });
   }); 
};

loadCollections.setDocument = function(contents, target, collection, cb) {
   loadCollections.db.collection(collection, function(err, coll) {
      if (err) {cb(err); return;}
      if (target.length > 1) {
         target = mongo.BSONPure.ObjectID.createFromHexString(target);
      }
      coll.findAndModify({"_id": target}, {}, contents, 
      {"upsert": true, "new": true}, function(err, res) {
         if (err) {cb(err); return;}
         cb(null, res);
      });
   });
};

loadCollections.getCollectionFields = function(searchField, collection, cb) {
   //For a particular collection, look in every document and return the value of a particular field. 
   //For example return all ocurring customerNums in a Customers collection
   loadCollections.db.collection(collection, function(err, coll) {
      if (err) {throw err;}
      var fld = {}; fld[searchField] = 1;
      coll.find({}, fld).toArray(function(err, docs) {
         if (err) {cb(err);}
         var returnArray = [];
         var j = 0; k = docs.length;
         for (j = 0; j < k; j += 1) { //don't return an array of objects. we just need the values.
            returnArray.push(docs[j][searchField]);  
         }
         cb(null, returnArray);
      });
   });
};

module.exports = loadCollections;

