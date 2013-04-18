<!DOCTYPE html>
<html>
   <head>
      <title>MongoBook demo</title>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link href="bootstrap.min.css" rel="stylesheet" media="screen">
      <link href="mongobook.css" rel="stylesheet" media="screen">
   </head>
   <body>
      <div class="container-fluid">
         <div class="row-fluid">
            <div class="span12">
               <div class="page-header">
                  <h1>MongoBook 
                  <small>This is a basic demonstration using nodejs and mongo.</small></h1>
               </div>
               <div class="row-fluid">
                  <div class="span1"></div>
                  <div class="span10">
                     <div class="well text-center">
                        <button class="btn btn-primary" type="button">Add Address</button>
                        <table class="table table-striped table-hover">
                           <thead>
                              <tr>
                                 <th>First</th>
                                 <th>Last</th>
                                 <th>Email</th>
                              </tr>
                           </thead>
                           <tbody>
                              {{#addresses}}
                              <tr>
                                 <td>{{first}}</td>
                                 <td>{{last}}</td>
                                 <td>{{email}}</td>
                              </tr>
                              {{/addresses}}
                           </tbody>
                        </table>
                     </div>
                     <div id="addresses">
                        <ul class="nav nav-tabs" id="tabs">
                        </ul>
                        <div class="tab-content">
                        </div>
                     </div>
                  </div>
                  <div class="span1"></div>
               </div>
            </div>
         </div>
      </div>

      <script src="http://code.jquery.com/jquery.js"></script>
      <script src="bootstrap.min.js"></script>
      <script src="mongobook.js"></script>
   </body>
</html>
