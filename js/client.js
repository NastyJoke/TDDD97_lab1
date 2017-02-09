
// Source:http://blog.gerv.net/2011/05/html5_email_address_regexp/
var mailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

// This keeps track of the search in the browse tab
var search;

// Used to refresh only the posts from the user's own wall
refreshOwnMessages = function() {
      if (localStorage.getItem("token") != null) {
          var messages = serverstub.getUserMessagesByToken(localStorage.getItem("token")).data;

          var prevHtml = "";
          document.getElementById("ownWall").innerHTML = "";
          for (i = 0; i < messages.length; i++)
          {
            prevHtml = document.getElementById("ownWall").innerHTML;
            var html = "<center><div class='message'>From: <i>".concat(messages[i].writer).concat("</i><br />").concat(messages[i].content).concat("").concat("</div></center>");
            document.getElementById("ownWall").innerHTML = prevHtml.concat(html);
          }
      }
}

// Used to refresh messages from the wall of the user in the 'search' variable
refreshUserMessages = function() {
      if (search != "") {
          var messages = serverstub.getUserMessagesByEmail(localStorage.getItem("token"),search).data;
          var prevHtml = "";
          document.getElementById("userWall").innerHTML = "";
          for (i = 0; i < messages.length; i++)
          {
            prevHtml = document.getElementById("userWall").innerHTML;
            var html = "<center><div class='message'>From: <i>".concat(messages[i].writer).concat("</i><br />").concat(messages[i].content).concat("").concat("</div></center>");
            document.getElementById("userWall").innerHTML = prevHtml.concat(html);
          }
      }
}

// Used to change the style of the current tab button
activeButton = function(index) {
	buttons = ["homeButton", "browseButton", "accountButton"];
	for (buttonIndex = 0; buttonIndex < buttons.length; buttonIndex++) {
		if (buttonIndex != index)
			document.getElementById(buttons[buttonIndex]).style.backgroundColor = "#60b957";
		else
			document.getElementById(buttons[buttonIndex]).style.backgroundColor = "#088B00";
	}
}

// Used to switch between the connect screen and the connected view
displayView = function(view) {
	if (view == "welcome")
	{
		document.getElementById("mainView").style.display = "none";
		document.getElementById("welcomeView").style.display = "block";
		window.location.hash = "";
	}
	else if (view == "main")
	{
		document.getElementById("welcomeView").style.display = "none";
		document.getElementById("mainView").style.display = "block";
		document.getElementById("password").value = "";
		
		window.location = "#home";
		activeButton(0);
		
		// Fill the info in the page according to the connected user
		var info = serverstub.getUserDataByToken(localStorage.getItem("token"));
		document.getElementById("displayName").innerHTML = info.data.firstname.concat(' '.concat((info.data.familyname)));
		document.getElementById("displayMail").innerHTML = info.data.email;
		document.getElementById("displayCity").innerHTML = info.data.city;
		document.getElementById("displayCountry").innerHTML = info.data.country;
		document.getElementById("displayGender").innerHTML = info.data.gender;
		
	}
}

// Used to display the searched user information
displaySearch = function()
{
    if (search != "") { // IF SEARCH NOT EMPTY AND DIFFERS FROM notfound

		var info = serverstub.getUserDataByEmail(localStorage.getItem("token"), search); // GET INFO FROM URL SEARCH

		if (info.success == false) {
			document.getElementById("searchMessage").innerHTML = info.message;
			document.getElementById("browseUser").style.display = "none";
		}
		else // user found
		{
			// display layout
			document.getElementById('browseUser').style.display = "block";
			// fill data in
			document.getElementById("displayUserName").innerHTML = info.data.firstname.concat(' '.concat((info.data.familyname)));
			document.getElementById("displayUserMail").innerHTML = info.data.email;
			document.getElementById("displayUserCity").innerHTML = info.data.city;
			document.getElementById("displayUserCountry").innerHTML = info.data.country;
			document.getElementById("displayUserGender").innerHTML = info.data.gender;

			refreshUserMessages();

		}

		}
		else { // search is empty
			  document.getElementById("browseUser").style.display = "none";
			 }
}

window.onload = function(){
	
  search = "";
	
  if (window.location.hash = "")
	window.location.hash = "#home"; // Adds #home to the URL without refreshing the page. Hashed are used to keep track of the current tab
  // Scroll to top, if there are too many messages to show
  window.scrollTo(0,0);
 
  // buttons listeners
  document.getElementById("loginSubmit").addEventListener("click", function(event){
    event.preventDefault();
    validateLogin();
    refreshOwnMessages();
    window.scrollTo(0,0);
    });
  document.getElementById("signupSubmit").addEventListener("click", function(event){
    event.preventDefault();
    validateSignup();
    });
  document.getElementById("postSubmit").addEventListener("click", function(event){
    event.preventDefault();
    validatePostMessage();
    refreshOwnMessages();
    });
  document.getElementById("homeButton").addEventListener("click", function(event){
    event.preventDefault();
    // We didn't use the href attribute of the links in the menu bar, because then we couldn't use the scrollTo method.
    window.location = "#home";
    window.scrollTo(0,0);
    });
  document.getElementById("browseButton").addEventListener("click", function(event){
    event.preventDefault();
    displaySearch();
    window.location = "#browse";
    window.scrollTo(0,0);
    });
  document.getElementById("accountButton").addEventListener("click", function(event){
    event.preventDefault();
    window.location = "#account";
    window.scrollTo(0,0);
    });
  document.getElementById("searchSubmit").addEventListener("click", function(event){
    event.preventDefault();
	searchUser();
    window.scrollTo(0,0);
    });
  document.getElementById("changePwdSubmit").addEventListener("click", function(event){
    event.preventDefault();
	validateChangePassword();
    window.scrollTo(0,0);
    });
  document.getElementById("postMessageSubmit").addEventListener("click", function(event){
    event.preventDefault();
	validatePostMessage(0);
    window.scrollTo(0,0);
    });



  if (localStorage.getItem("token") != null && localStorage.getItem("token") != "")
  {
      // Show the Connected view instead of the connect view
      displayView("main");
      refreshOwnMessages();
  }
  else // Display the connection screen
  {
	  displayView("welcome");
  }
};

// Used to verify information before sending the information to the server
validateLogin = function() {
  var email = document.getElementById('email').value;
  var password = document.getElementById('password').value;
  if (!mailRegex.test(email)) {
    document.getElementById('loginErrorMessage').innerHTML = "<center>Please enter your email.</center>";
    return false;
  }
  if (password.length < 6) {
        document.getElementById('loginErrorMessage').innerHTML = "<center>Your password must be at least 6 characters long.</center>";
        return false;
      }
  //else signin
  var serverResponse = serverstub.signIn(email,password);

  if (serverResponse.success == true)
  {
    localStorage.setItem("token",serverResponse.data);
    displayView("main");
  }
  else
  {
    document.getElementById('loginErrorMessage').innerHTML = "<center>" + serverResponse.message + "</center>";
    return false;
  }

};

// Verify info before signing user up
validateSignup = function(){

  var data = {"firstname":document.getElementById('firstName').value,
              "familyname":document.getElementById('familyName').value,
              "gender":document.getElementById('gender').value,
              "city":document.getElementById('city').value,
              "country":document.getElementById('country').value,
              "email":document.getElementById('newEmail').value,
              "password":document.getElementById('newPassword').value};
  var repeat_password = document.getElementById('repeatPassword').value;



  // errors
  var errorMessage = "<center>";
  if (data.firstname == "") {
        errorMessage += "Please enter your first name.";
  }
  else if (data.familyname == "") {
        errorMessage += "Please enter your last name.";
  }
  else if (data.gender != "male" && data.gender != "female") {
        errorMessage += "Please select your gender.";
  }
  else if (data.city == "") {
        errorMessage += "Please enter your city.";
  }
  else if (data.country == "") {
        errorMessage += "Please enter your country.";
  }
  else if (!mailRegex.test(data.email)) {
        errorMessage += "Please enter your email.";
  }
  else if (data.password.length < 6) {
        errorMessage += "Password should be at least 6 characters.";
  }
  else if (data.password != repeat_password) {
        errorMessage += "Passwords mismatch.";
  }
  
  errorMessage += "</center>";
  document.getElementById('signupMessage').innerHTML = errorMessage;
  
  
  if (errorMessage != "<center></center>") // If there is any of the errors from above
	return false;
  


  //else signup
  var serverResponse = serverstub.signUp(data);
  if (serverResponse.success == false)
  {
    // server error
    document.getElementById('signupMessage').innerHTML = "<center>"+serverResponse.message+"</center>";
    return false;
  }
  else
  {
    // Reset the form
    document.getElementById('signupMessage').innerHTML = '<center><span class="successMessage">Your account has been created!</span></center>';
    document.getElementById('firstName').value = "";
    document.getElementById('familyName').value = "";
    document.getElementById('gender').selectedIndex = "0";
    document.getElementById('city').value = "";
    document.getElementById('country').value = "";
    document.getElementById('newEmail').value = "";
    document.getElementById('newPassword').value = "";
    document.getElementById('repeatPassword').value = "";
  }

};


// Check info before changing password
validateChangePassword = function(){
  var oldPassword = document.getElementById('oldPassword').value;
  var newPassword = document.getElementById('changePassword').value;
  var repeatPassword = document.getElementById('repeatChangePassword').value;

  if (oldPassword.length < 6)
      {
        document.getElementById('changePasswordErrorMessage').innerHTML = "Your password should be at least 6 characters long.";
        return false;
      }
  if (repeatPassword != newPassword)
  {
        document.getElementById('changePasswordErrorMessage').innerHTML = "Passwords mismatch.";
        return false;
  }
  if (newPassword.length < 6)
      {
        document.getElementById('changePasswordErrorMessage').innerHTML = "Your new password should be at least 6 characters long.";
        return false;
      }

  //else changePassword
  var serverResponse = serverstub.changePassword(localStorage.getItem("token"), oldPassword, newPassword);
  if (serverResponse.success == false)
  {
        document.getElementById('changePasswordErrorMessage').innerHTML = serverResponse.message;
        return false;
  }
  else
  {
        document.getElementById('changePasswordErrorMessage').innerHTML = "<span style='color:green;'>Your password has been changed.</span>";
  }
}

// self = 1 for message on your own wall
// self = 0 for message on someone's wall
// Used to post a message either on own wall or the wall of the user in the 'search' variable
validatePostMessage = function(self = 1) {
  var senderToken = localStorage.getItem("token");
  if (self) {
	var message = document.getElementById("postMessage").value;
	var receiver = serverstub.getUserDataByToken(senderToken).data.email;
	document.getElementById("postMessage").value = "";
  }
  else {
    var message = document.getElementById("postUserMessage").value;
    var receiver = search;
    document.getElementById("postUserMessage").value = "";
  }
  message = message.replace(new RegExp("<","g"),"&lt;");
  message = message.replace(new RegExp(">","g"),"&gt;");
  message = message.replace(new RegExp("\n","g"),"<br />");
  if (message == "")
		return false;

  serverstub.postMessage(senderToken,message,receiver);


  refreshOwnMessages();
  refreshUserMessages();

}

// Used to disconnect
disconnect = function() {
  var serverResponse = serverstub.signOut(localStorage.getItem("token"));
  localStorage.removeItem("token");
  displayView("welcome");
}

// Used to get information corresponding to the 'search' variable
searchUser = function() {
	var s = document.getElementById('search').value;
	if (!mailRegex.test(s)) {
		document.getElementById('searchMessage').innerHTML = "Please enter a valid email.";
		return false;
	}
	else
	{
	    var selfMail = serverstub.getUserDataByToken(localStorage.getItem("token")).data.email;
		if (s == selfMail) {
		    search = "";
		    document.getElementById('searchMessage').innerHTML = "You narcissistic.";
		    }
		else {
		    search = s;
		    document.getElementById('searchMessage').innerHTML = "";
		}
		displaySearch();
	}
	
}


