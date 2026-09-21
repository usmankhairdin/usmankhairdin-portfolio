$(document).ready(function () {
    //Tooltip
    $('[data-toggle="tooltip"]').tooltip();     
});
$(document).ready(function() {
    $('.js-example-basic-single').select2();
  });
$(".toggle-password").click(function() {

    $(this).toggleClass("fa-eye fa-eye-slash");
    var input = $($(this).attr("toggle"));
    if (input.attr("type") == "password") {
      input.attr("type", "text");
    } else {
      input.attr("type", "password");
    }
  });

function showHidePanels(id,flag)
{
    if(flag == 0)
        $("#" + id).addClass('d-none')
    else
        $("#" + id).removeClass('d-none')

    if ($("#" + id).parent().parent().find('.addnew-btn i').length > 0)
    {
        $("#" + id).parent().parent().find('.addnew-btn i').toggleClass('fa-plus-circle fa-minus-circle'); 
    }


}

function showHidePanelsLogic(id,nodataid,saveCardsID)
{
        if ($("#" + id).parent().parent().find('.addnew-btn i').hasClass("fa-plus-circle"))
        {
            $("#" + id).removeClass('d-none');
            $("#" + id).parent().parent().find('.addnew-btn i').removeClass('fa-plus-circle'); 
            $("#" + id).parent().parent().find('.addnew-btn i').addClass('fa-minus-circle'); 
            
            $("#" + nodataid).addClass('d-none');
        }
        else
        {
            $("#" + id).addClass('d-none');
            $("#" + id).parent().parent().find('.addnew-btn i').removeClass('fa-minus-circle'); 
            $("#" + id).parent().parent().find('.addnew-btn i').addClass('fa-plus-circle'); 
            $("#" + nodataid).removeClass('d-none');
        }

        if (! $("#" + saveCardsID).hasClass('d-none'))
        $("#" + nodataid).addClass('d-none');


}

function showHideEmployeesCards(id)
{
    var parentObject = $(id).parent().parent().parent().parent();
    var parentObjectForBorder = $(id).parent().parent().parent().parent();
    parentObjectForBorder.find(".card").toggleClass('bordered')
    parentObject.find(".card-text").toggleClass('d-none d-block')    
    parentObject.find("h4").toggleClass('d-none')    
    parentObject.find(".edit-form").toggleClass('d-none')
}

function showHideLocationCards(id)
{
    var parentObject = $(id).parent().parent().parent();
    var parentObjectForBorder = $(id).parent().parent().parent().parent();
    parentObjectForBorder.find(".card").toggleClass('bordered')
    parentObject.find(".card-text").toggleClass('d-none d-block')    
    parentObject.find(".edit-form").toggleClass('d-none')
}
function showHideTrackerLocationCards(id)
{
    var parentObject = $(id).parent().parent().parent();
    var parentObjectForBorder = $(id).parent().parent().parent()
    parentObjectForBorder.find(".card").toggleClass('bordered')
    parentObject.find(".card-text").toggleClass('d-none d-block')    
    parentObject.find("h4").toggleClass('d-none')   
    parentObject.find(".edit-form").toggleClass('d-none')
}
function showHideEditCards(id)
{
    var parentObject = $(id).parent().parent();
    var parentObjectForBorder = $(id).parent().parent().parent();
    parentObjectForBorder.find(".card").toggleClass('bordered')
    parentObject.find(".card-text").toggleClass('d-none d-block')    
    parentObject.find(".edit-form").toggleClass('d-none')
}

function SaveCard(id)
{
    var parentObject = $(id).parent().parent().parent().parent();
    var parentObjectForBorder = $(id).parent().parent().parent().parent().parent().parent();
    parentObjectForBorder.find(".card").removeClass('bordered')
    parentObject.find(".card-text").removeClass('d-none')    
    parentObject.find(".edit-form").addClass('d-none')
    parentObject.find("h4").addClass('d-none')
    
}
function SaveEmpCard(id)
{
    var parentObject = $(id).parent().parent().parent().parent().parent();
    var parentObjectForBorder = $(id).parent().parent().parent().parent().parent().parent();
    parentObjectForBorder.find(".card").removeClass('bordered')
    parentObject.find(".card-text").removeClass('d-none')    
    parentObject.find(".edit-form").addClass('d-none')
    parentObject.find("h4").addClass('d-none')
    
}
function SaveTrackerLocationCards(id)
{
    var parentObject = $(id).parent().parent().parent().parent();
    var parentObjectForBorder = $(id).parent().parent().parent().parent().parent().parent();
    parentObjectForBorder.find(".card").removeClass('bordered')
    parentObject.find(".card-text").removeClass('d-none')    
    parentObject.find(".edit-form").addClass('d-none')
    parentObject.find("h4").addClass('d-none')
    
}



// https://stackoverflow.com/questions/11832930/html-input-file-accept-attribute-file-type-csv

const log = console.log;

const file = document.querySelector(`[id="fileElem"]`);

file.addEventListener(`change`, () => {
  const blob = file.files[0];
  const {
    name,
    type,
    size,
  } = blob;
  log(`blob`, blob);
  // type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  // if (!name.includes(`.xls`) || !name.includes(`.csv`)) {
  //   this.$message({
  //     message: `not excel!`,
  //     type: 'error'
  //   });
  // } else {
  //   this.previewFile(box);
  // }
}, false);


const fileSelect = document.getElementById("fileSelect");

fileSelect.addEventListener("click", function (e) {
  if (fileElem) {
    fileElem.click();
  }
}, false);



