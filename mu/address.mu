<div class='tab-pane active' id='{{tabID}}'>
   <form>
      <fieldset>
         <legend>Primary Information</legend>
         <label>first</label>
         <div class='input-append'>
            <input class='input-medium' type='text' name='first' value='{{first}}'>
            <button class='btn' type='button'><i class='icon-edit'></i></button>
         </div>
         <label>last</label>
         <div class='input-append'>
            <input class='input-medium' type='text' name='last' value='{{last}}'>
            <button class='btn' type='button'><i class='icon-edit'></i></button>
         </div>
         <label>email</label> 
         <div class='input-append'>
            <input class='input-medium 'type='text' name='email' value='{{email}}'>
            <button class='btn' type='button'><i class='icon-edit'></i></button>
         </div>
         <label>cell</label> 
         <div class='input-append'>
            <input class='input-medium' type='text' name='cell' value='{{cell}}'>
            <button class='btn' type='button'><i class='icon-edit'></i></button>
         </div>
      </fieldset>
      <div class='form-actions'>
         <input type='hidden' name='docID' value='{{_id}}'>
         <button type='submit' class='btn btn-save btn-info' 
         data-toggle='modal' data-target='#saveModal'>Save</button>
         <button type='submit' class='btn btn-delete btn-danger' 
         data-toggle='modal' data-target='#saveModal'>Delete</button>
      </div>
   </form>
</div>
