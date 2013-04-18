<div class='tab-pane active' id='{{tabID}}'>
   <form class='form-horizontal'>
      <div class='control-group'>
         <label class='control-label' for='first'>first</label>
         <div class='controls'>
            <div class='input-append'>
               <input type='text' name='first' placeholder='{{first}}'>
               <button class='btn' type='button'><i class='icon-edit'></i></button>
            </div>
         </div>
      </div>
      <div class='control-group'>
         <label class='control-label' for='last'>last</label>
         <div class='controls'>
            <div class='input-append'>
               <input type='text' name='last' placeholder='{{last}}'>
               <button class='btn' type='button'><i class='icon-edit'></i></button>
            </div>
         </div>
      </div>
      <div class='control-group'>
         <label class='control-label' for='email'>email</label>
         <div class='controls'>
            <div class='input-append'>
               <input type='text' name='email' placeholder='{{email}}'>
               <button class='btn' type='button'><i class='icon-edit'></i></button>
            </div>
         </div>
      </div>
      <div class='form-actions'>
         <input type='hidden' name='docID' value='{{_id}}'>
         <button type='submit' class='btn'>Save</button>
      </div>
   </div>
</div>
