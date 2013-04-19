<!DOCTYPE html>
<html>
   <head>
      <title>mongobook demo</title>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link href="bootstrap.min.css" rel="stylesheet" media="screen">
      <link href="mongobook.css" rel="stylesheet" media="screen">
   </head>
   <body>
         <div class="row-fluid">
            <div class="span12">
               <div class="page-header">
                  <h1>mongobook 
                  <small>This is a basic demonstration using nodejs and mongo.</small></h1>
               </div>
               <div class="row-fluid">
                  <div class="span3"></div>
                  <div class="span6">
                     <div class="well text-center">
                        <button class="btn btn-primary" type="button">Add Address</button>
                        <table class="table table-striped table-hover">
                           <thead>
                              <tr>
                                 <th class="hidden"></th>
                                 <th>First</th>
                                 <th>Last</th>
                              </tr>
                           </thead>
                           <tbody>
                              {{#addresses}}
                              <tr>
                                 <td class="hidden">{{_id}}</td>
                                 <td>{{first}}</td>
                                 <td>{{last}}</td>
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
                  <div class="span3"></div>
               </div>
            </div>
         </div>
         <div id='saveModal' class='modal hide fade' tabindex='-1' role='dialog'>
            <div class='modal-body'><p>Updating document ...</p></div>
         </div>

      <script src="http://code.jquery.com/jquery-2.0.0.min.js"></script>
      <script src="bootstrap.min.js"></script>
      <script src="mongobook.js"></script>
   </body>
</html>
