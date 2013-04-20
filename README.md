mongobook
======

mongobook is an address book application primarily used as a means to evaluate
bootstrap for layout and basic design components.  

A live demo can be viewed at http://mongobook.herokuapp.com

###Features
Built on a custom node.js server running with express and mongodb for data storage.  A custom library for template processing and common mongodb tasks (CRUD) acts as the controller for the application.

###Future Enhancements
Client side templating:  mustache is being used on the server to render templates on every entry request.  The full template is retrieved rather than only the data.  Saves and deletes have to refresh the document to retrieve an updated entry list template and data.

