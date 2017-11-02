const {remote, ipcRenderer, shell} = require('electron');

//Check access_token

var access_token;
function check_access_token(argument) {
  if (localStorage.access_token) {
      access_token = localStorage.access_token;
  } else {
      ipcRenderer.send('open-setting');
      return false;
  }
  return true;
}


/*********************************************************
*********************  Filter  ***************************
**********************************************************/
// 0: By name(Default)
// 1: By message

var filter_mode = 0;

function changeFilterMode(mode) {
  filter_mode = mode;
  if(mode == 0) {
    $("#filter-mode-status").text("Username");
  } else if(mode == 1) {
    $("#filter-mode-status").text("Comment");
  }
}

/*********************************************************
*******************  Close button  ***********************
**********************************************************/
$("#close-btn").click(function () {
  var window = remote.getCurrentWindow();
  window.close();
});

/*********************************************************
*****************  Minimize button  **********************
**********************************************************/
$("#minimize-btn").click(function () {
  var window = remote.getCurrentWindow();
  window.minimize();
});

/*********************************************************
******************  Setting button  **********************
**********************************************************/
$("#setting-btn").click(function () {
  ipcRenderer.send('open-setting');
});

/****************************************************************
************************* RUN  **********************************
*****************************************************************/

var num_result = 0;

$("#run-btn").click(function () {
  num_result = 0;
  isStop = false;

  if(!check_access_token()) {
    return;
  }

  $("#posturl").prop('readonly', true);
  $("#run-btn").prop('disabled', true);
  $("#stop-btn").css('display', 'inline-block');

  // Check Post URL
  checkPostURL();
});

function checkPostURL() {
  console.log("Check URL pattern");

  // Pattern
  var pattern = [/(?:https?:\/\/)?(?:w{3}\.)?(?:facebook|fb)\.com\/(.*)\/posts\/(\d+)/g,
                /(?:https?:\/\/)?(?:w{3}\.)?(?:facebook|fb)\.com\/(.*)\/photos\/.*\/(\d+)\/\?.*/g,
                /(?:https?:\/\/)?(?:w{3}\.)?(?:facebook|fb)\.com\/(.*)\/videos\/(\d+)/g];

  var post_url = $('#posturl').val();
  var match;

  console.log(post_url);

  for (var i = 0; i < pattern.length; i++) {
    match = pattern[i].exec(post_url);
    console.log(pattern[i]);
    console.log(match);
    if(match != null) break;
  }

  if(match == null) {
    console.log("Check URL pattern => Fail");
    console.log(match);
    notify("ERROR", "Please check URL");
    
    $("#posturl").prop('readonly', false);
    $("#run-btn").prop('disabled', false);
    $("#stop-btn").css('display', 'none');
    return;
  } else {
    getRealPostId(match[1], match[2]);
  }
}

function getRealPostId(page_id, post_id) {
  console.log("API: Get page id");

  $.ajax({
    url: "https://graph.facebook.com/v2.10/" + page_id + "?access_token=" + access_token,
  }).done(function (data) {
    getComment(data["id"] + "_" + post_id);
  }).fail(function (error) {
    console.log("API: Get page id => Fail");
    
    if(error.responseJSON["error"]["message"].includes("Session has expired")) {
      notify("ERROR", "Access Token is expired, please renew it!");
    } else {
      notify("ERROR", "Please check URL or Acces Tokken");
    }

    $("#posturl").prop('readonly', false);
    $("#run-btn").prop('disabled', false);
    $("#stop-btn").css('display', 'none');
    return;
  });
}

function getComment(real_id) {
  console.log("API: Get comment");

  //Check Stop
  if(isStop) {
    $("#res-status").text(".:Stoped:. " + num_result + " comment(s) found");
    return;
  }

  // Show result
  $("#result").css('display', 'table');

  $.ajax({
    url: "https://graph.facebook.com/v2.10/" + real_id + "/comments?limit=100&order=chronological&access_token=" + access_token,
  }).done(function(data) {
    console.log("API: Get comment => Success");

    for (i = 0; i < data["data"].length; i++) {
      var name = "<a href='https://www.facebook.com/"+ data["data"][i]["id"] +"'>"+ data["data"][i]["from"]["name"] +"</a>";
      var message = data["data"][i]["message"];
      var time = (new Date(data["data"][i]["created_time"])).toLocaleString();
      var newRowContent = "<tr><td>" + name + "</td><td>" + message + "</td><td>" + time + "</td></tr>";

      $("#result tbody").append(newRowContent);
    }

    num_result += data["data"].length;

    if ('paging' in data && 'next' in data["paging"]) {
      recursive_send(data["paging"]["next"]);
    } else {
      $("#stop-btn").css('display', 'none');
      $("#res-status").text(" " + num_result + " comment(s) found");
    }
  }).fail(function(data) {
    console.log("API: Get comment => Fail");

    notify("ERROR", "Please check URL or Acces Tokken");
    $("#posturl").prop('readonly', false);
    $("#run-btn").prop('disabled', false);
    $("#stop-btn").css('display', 'none');
    return;
  });
}

function recursive_send(url) {
  console.log("API: RE Get comment");

  //Check Stop
  if(isStop) {
    $("#res-status").text(".:Stoped:. " + num_result + " comment(s) found");
    return;
  }

  $.ajax({
    url: url,
  }).done(function(data) {
    console.log("API: RE Get comment => Success");

    for (i = 0; i < data["data"].length; i++) {
      var name = "<a href='https://www.facebook.com/"+ data["data"][i]["id"] +"'>"+ data["data"][i]["from"]["name"] +"</a>";
      var message = data["data"][i]["message"];
      var time = (new Date(data["data"][i]["created_time"])).toLocaleString();
      var newRowContent = "<tr><td>" + name + "</td><td>" + message + "</td><td>" + time + "</td></tr>";

      $("#result tbody").append(newRowContent);
    }

    num_result += data["data"].length;

    if ('next' in data["paging"]) {
      recursive_send(data["paging"]["next"]);
    } else {
      $("#stop-btn").css('display', 'none');
      $("#res-status").text(" " + num_result + " comment(s) found");
    }
  }).fail(function() {
    console.log("API: RE Get comment => Fail");

    notify("ERROR", "Please check URL");
    $("#stop-btn").css('display', 'none');
    $("#posturl").prop('readonly', false);
    $("#run-btn").prop('disabled', false);
    $('#posturl').val("");
    return;
  });
}


/***************************************************************
***********************  Reset  ********************************
****************************************************************/

$("#reset-btn").click(function () {
  stop();

  // Wait 0.5s
  setTimeout(function() {
    $("#stop-btn").css('display', 'none');
    $("#result").css('display', 'none');
    $("#posturl").prop('readonly', false);
    $("#run-btn").prop('disabled', false);
    $('#posturl').val("");
    $("#result tbody").empty();
  }, 500);
});

/***************************************************************
************************  Stop  ********************************
****************************************************************/
var isStop = false;

$("#stop-btn").click(function () {
  stop();
  $("#stop-btn").css('display', 'none');
});

function stop() {
  isStop = true;
}

/* Notify */

function notify(title, mes) {
  var notification = new Notification(title, {
    icon: 'icon/dango.png',
    body: mes
  });
}

// Open OS Browser
$(document).on('click', 'a[href^="http"]', function(event) {
    event.preventDefault();
    shell.openExternal(this.href);
});

/***************************************************************
*************************  Filter ******************************
****************************************************************/
function filter() {
  var input = document.getElementById("filter");
  var filter = input.value.toUpperCase();
  var table = document.getElementById("result");
  var tr = table.getElementsByTagName("tr");
  var td, a;
  for (i = 0; i < tr.length; i++) {
    td = tr[i].getElementsByTagName("td")[filter_mode];
    if (td) {
      a = td;
      if(filter_mode == 0) {
        a = td.getElementsByTagName("a")[0];
      }
      if (a.innerHTML.toUpperCase().indexOf(filter) > -1) {
        tr[i].style.display = "";
      } else {
        tr[i].style.display = "none";
      }
    }       
  }
}
