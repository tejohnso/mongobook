<div class='tab-pane active' id='{{tabID}}'>
   <form class='form-horizontal'>
      <div class='control-group'>
         <label class='control-label' for='first'>first</label>
         <div class='controls'>
            <div class='input-append'>
               <input type='text' name='first' value='{{first}}'>
               <button class='btn' type='button'><i class='icon-edit'></i></button>
            </div>
         </div>
      </div>
      <div class='control-group'>
         <label class='control-label' for='last'>last</label>
         <div class='controls'>
            <div class='input-append'>
               <input type='text' name='last' value='{{last}}'>
               <button class='btn' type='button'><i class='icon-edit'></i></button>
            </div>
         </div>
      </div>
      <div class='control-group'>
         <label class='control-label' for='email'>email</label>
         <div class='controls'>
            <div class='input-append'>
               <input type='text' name='email' value='{{email}}'>
               <button class='btn' type='button'><i class='icon-edit'></i></button>
            </div>
         </div>
      </div>
      <div class='control-group'>
         <label class='control-label' for='cell'>cell</label>
         <div class='controls'>
            <div class='input-append'>
               <input type='text' name='cell' value='{{cell}}'>
               <button class='btn' type='button'><i class='icon-edit'></i></button>
            </div>
         </div>
      </div>
      <div class='form-actions'>
         <input type='hidden' name='docID' value='{{_id}}'>
         <button type='submit' class='btn' 
         data-toggle='modal' data-target='#saveModal'>Save</button>
      </div>
      <div id='saveModal' class='modal hide fade' tabindex='-1' role='dialog'>
         <div class='modal-body'><p>Saving document ...</p></div>
      </div>
   </div>
</div>
