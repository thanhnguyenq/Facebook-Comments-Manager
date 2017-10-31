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

// Filter value
// 0: By name(Default)
// 1: By message

var filter_mode = 0;

function changeFilterMode(mode) {
  filter_mode = mode;
  if(mode == 0) {
    $("#filter-mode-status").text("Tên thành viên");
  } else if(mode == 1) {
    $("#filter-mode-status").text("Nội dung bình luận");
  }
}

// Close button
$("#close-btn").click(function () {
  var window = remote.getCurrentWindow();
  window.close();
});

// Minimize button
$("#minimize-btn").click(function () {
  var window = remote.getCurrentWindow();
  window.minimize();
});

// Setting button
$("#setting-btn").click(function () {
  ipcRenderer.send('open-setting');
});

var num_result = 0;
// Run scan
$("#run-btn").click(function () {
  num_result = 0;

  if(!check_access_token()) {
    return;
  }

  $("#postid").prop('readonly', true);
  $("#run-btn").prop('disabled', true);

  // Check Post ID
  var post_id = $('#postid').val();

  if(post_id.match(/.*_\d+/g) == null)  {
    notify("Lỗi", "Hãy kiểm tra lại Post ID");
    $("#postid").prop('readonly', false);
    $("#run-btn").prop('disabled', false);
    $('#postid').val("");
    return;
  }

  console.log("Send API");

  $.ajax({
    url: "https://graph.facebook.com/v2.10/" + post_id + "/comments?limit=100&order=chronological&access_token=" + access_token,
  }).done(function(data) {
    console.log("Success");
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
      $("#res-status").text("Tìm thấy " + num_result + " kết quả");
    }
  }).fail(function(data) {
    console.log("ERROR 400");
    if(data.responseJSON["error"]["message"].includes("Session has expired")) {
      notify("Lỗi", "Access Token hết hạn, vui lòng thay token mới!");
    } else {
      notify("Lỗi", "Hãy kiểm tra lại Post ID");
    }
    $("#postid").prop('readonly', false);
    $("#run-btn").prop('disabled', false);
    $('#postid').val("");
    return;
  });
});

function recursive_send(url) {
  $.ajax({
    url: url,
  }).done(function(data) {
    console.log("Success");
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
      $("#res-status").text("Tìm thấy " + num_result + " kết quả");
    }
  }).fail(function() {
    console.log("ERROR 400");
    notify("Lỗi", "Hãy kiểm tra lại Post ID");
    $("#postid").prop('readonly', false);
    $("#run-btn").prop('disabled', false);
    $('#postid').val("");
    return;
  });
}


// Refresd

$("#refresh-btn").click(function () {
  $("#postid").prop('readonly', false);
  $("#run-btn").prop('disabled', false);
  $('#postid').val("");
  $("#result tbody").empty();
});

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

/* Filter */
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
