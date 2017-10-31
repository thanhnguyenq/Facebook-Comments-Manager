if (localStorage.access_token) {
  $("#access_token").val(localStorage.access_token);
}

$("#setting-save-btn").click(function () {
  localStorage.setItem("access_token", $("#access_token").val());
  var window = remote.getCurrentWindow();
  window.close();
});