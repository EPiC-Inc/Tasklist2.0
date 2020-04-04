var tasklists = {};
var showHiddenTasks = false;
var DISPLAYMODE = "block";

// This was stolen from the Google documentation.
// Some of it was, anyway
var GoogleAuth;
var SCOPE = "https://www.googleapis.com/auth/tasks";
var PATH = "https://www.googleapis.com/tasks/v1/";

function initClient() {
  // Retrieve the discovery document for version 3 of Google Drive API.
  // In practice, your app can retrieve one or more discovery documents.
  var discoveryUrl = 'https://www.googleapis.com/discovery/v1/apis/tasks/v1/rest';

  // Initialize the gapi.client object, which app uses to make API requests.
  // Get API key and client ID from API Console.
  // 'scope' field specifies space-delimited list of access scopes.
  gapi.client.init({
      'apiKey': atob('QUl6YVN5Q3kzcE1tOGdZTzkwSUpnQVdOM2p0UVFhUDhhTHZYN1FV'),
      'clientId': atob("OTMzMTg4MTcyMzUxLWI2ZHJxa3M2NGhzOWcxMmVvYXE2ZGl1N29tYXVxNm44LmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29t"),
      'discoveryDocs': [discoveryUrl],
      'scope': SCOPE
  }).then(function () {
    GoogleAuth = gapi.auth2.getAuthInstance();

    // Listen for sign-in state changes.
    GoogleAuth.isSignedIn.listen(updateSigninStatus);

    // Handle initial sign-in state. (Determine if user is already signed in.)
    var user = GoogleAuth.currentUser.get();
    setSigninStatus();

    // Call handleAuthClick function when user clicks on
    //      "Sign In/Authorize" button.
    $('#signin-button').click(function() {
      handleAuthClick();
    });
    $('#revoke-access-button').click(function() {
      revokeAccess();
    });

    //ANCHOR: Show / hide tasks
    $("#hidden-tasks-button").click(function() {
      if (showHiddenTasks) {
        $('#hidden-tasks-button').html("Show Completed Tasks");
        showHiddenTasks = false;
      } else {
        $('#hidden-tasks-button').html("Hide Completed Tasks");
        showHiddenTasks = true;
      }
      for (var id in tasklists) {
        for (var taskId in tasklists[id].tasks) {
          var currentTask = tasklists[id].tasks[taskId]
          //console.log(currentTask);
          if (currentTask.hidden & showHiddenTasks) {
            $("#"+taskId).css("display", DISPLAYMODE);
          } else if (currentTask.hidden & !showHiddenTasks) {
            $("#"+taskId).css("display", "none");
          }
        }
      }
    });

    //ANCHOR: Tasklist selection
    $("#selected-tasklist").change(function(a) {
      if ($("#selected-tasklist").val() == "*") {
        // If the user wants to see all tasklists
        for (var id in tasklists) {
          $("#"+id).css("display", DISPLAYMODE);
        }
      } else {
        // If the user wants to see a specific list
        for (var id in tasklists) {
          if (id == $("#selected-tasklist").val()) {
            $("#"+id).css("display", DISPLAYMODE);
          } else {
            $("#"+id).css("display", "none");
          }
        }
      }
    });

    //ANCHOR: Sort-by selection
    $("#sort-by").change(function() {
      $("#main-tasks-div").removeClass();
      $("#main-tasks-div").addClass($("#sort-by").val());
    });

    //ANCHOR: Theme selection
    $("#theme").change(function() {
      $("html").removeClass();
      $("html").addClass($("#theme").val());
    });

  });
}

function handleAuthClick() {
  if (GoogleAuth.isSignedIn.get()) {
    // User is authorized and has clicked "Sign out" button.
    GoogleAuth.signOut();
    clearTasks();
  } else {
    // User is not signed in. Start Google auth flow.
    GoogleAuth.signIn().then(function() {
      //alert("Success");
    },
    function(e) {
      console.log(e.error);
    });
    console.log("Starting sign in");
  }
}

function setSigninStatus(isSignedIn) {
  var user = GoogleAuth.currentUser.get();
  var isAuthorized = user.hasGrantedScopes(SCOPE);
  profile = user.getBasicProfile();

  if (isAuthorized) {
    $('#signin-button').html('Sign out');
    $('#revoke-access-button').css('display', DISPLAYMODE);
    $("#tasklist-controls").css('display', DISPLAYMODE);
    $('#auth-status').html('Welcome, ' + profile.getGivenName() + "! (" + profile.getEmail().substring(0, 6) + "*".repeat(profile.getEmail().length - 6) + ")");
    
    //ANCHOR: This runs on sign in, even between page loads
    getTasks();
    if (getUrlParameter("display")) {
      $("#sort-by").val(getUrlParameter("display")).change();
    }
    if (getUrlParameter("theme")) {
      $("#theme").val(getUrlParameter("theme")).change();
    }

  } else {
    $('#signin-button').html('Sign In/Authorize');
    $('#revoke-access-button').css('display', 'none');
    $('#auth-status').html('You have not authorized this app or you are ' +
        'signed out.');
    $("#tasklist-controls").css('display', 'none');
  }
}

function updateSigninStatus(isSignedIn) {
  setSigninStatus();
}



//ANCHOR Get tasks
function getTasks() {
  //Clear HTML of tasks
  clearTasks();

  // Collect user's task lists
  gapi.client.request({
    'path':PATH+'users/@me/lists'
  }).then(res => {
    // For each tasklist, write out some details to console
    res.result.items.forEach(tList => {
      //console.log(tList.title + " | " + tList.id);

      // Append a visual representation of the list to main-tasks-div
      $("<div class='tasklist' id='"+tList.id+"'>" +
      "<p class='tasklist-name'>"+tList.title+"</p>" +
      "</div>").appendTo( $("#main-tasks-div") );

      // Add a copy of the tasklist to tasks
      tasklists[tList.id] = {
        title: tList.title,
        tasks: {}
      };

      // Add the list to the list selector
      $("<option value='"+tList.id+"'>"+tList.title+"</option>").appendTo("#selected-tasklist");

      // For each task in the tasklist, write out some details to console
      gapi.client.request({
        'path':PATH+'lists/'+tList.id+"/tasks?showHidden=true"
      }).then(res => {
        if (res.result.items) {
          res.result.items.forEach(task => {
            //console.log(task);
            //console.log(tList.title + " | " + task.title + " | " + task.due + " | " + task.status + " | " + task.hidden + " | " + task.completed + " | " + task.id);

            // Add task to html
            var classToAdd = 'task';
            if (task.completed) {
              classToAdd += " completed";
            }
            $(`<div class='${classToAdd}' id='${task.id}'>${createSpan(task.title, 'taskName')} | ${createSpan(task.due, "taskDueDate")} | ${createSpan(task.completed, 
            "taskCompletedDate")}</div>`).appendTo( $("#"+tList.id) );

            // Add task to appropriate list
            tasklists[tList.id].tasks[task.id] = {
              title: task.title,
              dueDate: task.due,
              status: task.status,
              hidden: task.hidden,
              completed: task.completed,
            };

            if (task.hidden) {
              $("#"+task.id).css('display', 'none');
            }
          });
        }
      });
    });
  });

  // Show the hidden-tasks button
  $("#tasklist-controls").css('display', DISPLAYMODE);
}

//ANCHOR: Small utility functions
function createSpan(thingToPutInSpan, spanClass=undefined) {
  if (spanClass) {
    return "<span class='"+spanClass+"'>"+thingToPutInSpan+"</span>";
  }
  return "<span>"+thingToPutInSpan+"</span>";
}

function handleClientLoad() {
  // Hide tasklist control panel because of bugs
  $("#tasklist-controls").css('display', 'none');
  // Load the API's client and auth2 modules.
  // Call the initClient function after the modules load.
  console.log("Page loaded; loading Google client")
  gapi.load('client:auth2', initClient);
}

function revokeAccess() {
  GoogleAuth.disconnect();
}

function clearTasks() {
  tasks = {};
  $("#main-tasks-div").html("");
}