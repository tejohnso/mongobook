{{#addresses}}
<div class='tab-pane active' id='{{_id}}'>
   <form>
      <fieldset>
         <legend>Primary Information</legend>
         <label>first</label>
         <div class='input-append'>
            <input class='input-medium' type='text' name='first' value='{{first}}'>
            <button class='btn btn-edit' type='button' tabindex='-1'><i class='icon-edit'></i></button>
         </div>
         <label>last</label>
         <div class='input-append'>
            <input class='input-medium' type='text' name='last' value='{{last}}'>
            <button class='btn btn-edit' type='button' tabindex='-1'><i class='icon-edit'></i></button>
         </div>
         <label>email</label> 
         <div class='input-append'>
            <input class='input-medium 'type='text' name='email' value='{{email}}'>
            <button class='btn btn-edit' type='button' tabindex='-1'><i class='icon-edit'></i></button>
         </div>
         <label>cell</label> 
         <div class='input-append'>
            <input class='input-medium' type='text' name='cell' value='{{cell}}'>
            <button class='btn btn-edit' type='button' tabindex='-1'><i class='icon-edit'></i></button>
         </div>
      </fieldset>
      <div class='form-actions'>
         <input type='hidden' name='_id' value='{{_id}}'>
         <button type='submit' class='btn btn-save btn-info'>Save</button>
         <button type='submit' class='btn btn-delete btn-danger'>Delete</button>
      </div>
   </form>
</div>
{{/addresses}}
