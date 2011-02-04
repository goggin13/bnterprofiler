
var $xx = jQuery.noConflict(true);

/* Object responsible for setting all of the colors that
 * are available to customize.  Directly sets CSS for
 * all of the relevant classes */
function Settings(options) {
    
    $xx('head').append('<link rel="stylesheet" type="text/css" href="http://bnterprofiler.appspot.com/css/bnterprofile.min.css" />');

    this.Init = function (options) {
        this.options = options;
    };
    
    this.setSetting = function (property, value) {
        this.options[property] = value;
        this.CreateStyles();
    };
    
    this.getSettings = function () {
        return this.options;
    };
     
    this.CreateStyles = function () {
        var HTML = '', css = $xx('<style />');
        
        HTML += '#bnterprofile{ width:' + this.options.width + ';';
        HTML += 'background:' + this.options.shell_background + ';';
        HTML += 'color:' + this.options.shell_color + ';}';
        
        HTML += '#bnterprofile .message.left{ color:' + this.options.message_left_color + ';}';
        HTML += '#bnterprofile .message.right{ color:' + this.options.message_right_color + ';}';
        HTML += '#bnterprofile .conversation{background: ' + this.options.conversation_background + ';}';
        HTML += '#bnterprofile a{ color: ' + this.options.link_color + '}';
        
        if ($xx('#bnterprofile_styles').length > 0) {
            $xx('#bnterprofile_styles').remove();
        }
        
        css.attr('id', 'bnterprofile_styles');
        css.html(HTML);
        $xx('head').append(css);
    };
    
    this.Init(options);
    this.CreateStyles();
    
}


/*
 * JavaScript Pretty Date
 * Copyright (c) 2008 John Resig (jquery.com)
 * Licensed under the MIT license.
 */

// Takes an ISO time and returns a string representing how
// long ago the date represents.
function prettyDate(time) {
    var date = new Date((time || "").replace(/-/g, "/").replace(/[TZ]/g, " ")),
        diff = (((new Date()).getTime() - date.getTime()) / 1000),
        day_diff = Math.floor(diff / 86400);
            
    if (isNaN(day_diff) || day_diff < 0 || day_diff >= 31) {
        return;
    }
            
	return day_diff == 0 && (
			diff < 60 && "just now" ||
			diff < 120 && "1 minute ago" ||
			diff < 3600 && Math.floor( diff / 60 ) + " minutes ago" ||
			diff < 7200 && "1 hour ago" ||
			diff < 86400 && Math.floor( diff / 3600 ) + " hours ago") ||
		day_diff == 1 && "Yesterday" ||
		day_diff < 7 && day_diff + " days ago" ||
		day_diff < 31 && Math.ceil( day_diff / 7 ) + " weeks ago";
}

/* takes a unix timestamp and returns the common and sexier (some think)
 * version in the "ago" format */
function unixToPrettyDate(unix_timestamp) {
    var date, year, day, month, hours, minutes, seconds, formattedTime;
    date = new Date(unix_timestamp * 1000);
    year = date.getFullYear();
    day = date.getDate();
    month = date.getMonth() + 1;
    hours = date.getHours();
    minutes = date.getMinutes();
    seconds = date.getSeconds();

    formattedTime = year + '-' + month + '-' + day + 'T' + hours + ':' + minutes + ':' + seconds + 'Z';
    return prettyDate(formattedTime);
}


/* HTML for a single message */
function Message(JSON, left_user) {
    var text, sender, is_left, img_size, sender_img, HTML;
    text = JSON.text;
    sender = JSON.sender;
    is_left = sender === left_user;
    img_size = 75;
    sender_img = JSON.profile_image_url.replace('?s=400', '?s=' + img_size);

    HTML = '<div class="message ' + (is_left ? 'left' : 'right') + '" >';
    HTML +=    '<div class="top"></div>';
    HTML +=    '<div class="middle"><span class="content">' + text + '</span></div>';
    HTML +=    '<div class="bottom"></div>';
    HTML += '</div>';
    HTML += '<div class="clear"></div>';
    
    this.getHTML = function () {
        return HTML;
    };
    
}

/* HTML for all the messages in a conversation */
function Messages(JSON, left_user) {
    var messages, HTML;
    messages = [];
    HTML = '';
    
    $xx.each(JSON, function (index, value) { 
        messages[index] = new Message(value, left_user); 
        HTML += messages[index].getHTML();
    });
    
    this.getHTML = function () {
        return HTML;
    };
    
}

/* The HTML for a single user, image, and and username 
 * which links to them if they are registered. 
 * is_left dictates whether it floats left or right */
function User(JSON, is_left) {
    var  has_profile, img_size, user_img;

    this.screen_name = JSON.screen_name;
    this.name = JSON.name;
    
    has_profile = JSON.id > 0;
    img_size = 40;
    this.user_img = JSON.profile_image_url.replace('?s=400', '?s=' + img_size);

	this.getScreenNameHTML = function(){
		var HTML =     '<span class="username ' + (is_left ? 'left' : 'right') + '">';
	    if (has_profile) { 
	        HTML +=      '<a href="http://bnter.com/' + this.screen_name + '">';
	    }
	    HTML += this.screen_name;
	    if (has_profile) { 
	        HTML += '</a>';
	    }
	    HTML += '</span>';
		return HTML;
	}
	
	this.getProfileImageHTML = function(){
	    var HTML;
		HTML = '<img class="profile_image ' + (is_left ? 'left' : 'right') + '"'
 		HTML += ' src="' + this.user_img + '" alt="sender" />';	
		return HTML;
	}

    this.getScreenName = function () {
        return this.screen_name;
    };

    
}

/* A single conversation, all the messages involved between
 * 2 users, and also the display for the users themselves displayed 
 * underneath the messages */
function Conversation(JSON, options) {
    var timestamp, left_user, messages, HTML, left_profile, left_screenname, right_profile, right_screenname;
    timestamp = JSON.unix_timestamp;

    user1 = new User(JSON.user, true);
    left_user = user1.getScreenName();
	left_profile = user1.getProfileImageHTML();
	left_screenname = user1.getScreenNameHTML();
	
    user2 = new User(JSON.user_two, false);
    right_profile = user2.getProfileImageHTML();
	right_screenname = user2.getScreenNameHTML();
	
    messages = new Messages(JSON.messages, left_user);
    
    HTML = '<div class="conversation">';
    HTML += messages.getHTML();
    HTML += '<div class="users">' + left_profile + left_screenname + right_profile + right_screenname + '</div>';
    HTML += '<div class="clear"></div>';
    HTML += '<span class="timestamp">' + unixToPrettyDate(timestamp) + '</span>';
    HTML += '</div>';
    HTML = $xx(HTML);
    
    this.getHTML = function () {
        return HTML;
    };
    
}

/* The HTML for all the conversations displayed.  */
function Conversations(options) {
    var username = options.username, count = options.count, HTML, url, c;
    
    url = 'http://bnterprofiler.appspot.com/bnter?user_screen_name=' + username;
    //url = 'js/sampleresponse.js?';
    //this case needs to be here for the demo to work properly.;
    if (document.URL.toLowerCase().indexOf('bnterprofiler.appspot.com') === -1) {
        url += '&callback=?';
    }

    HTML = $xx('<div id="conversations"></div>');

    $xx.getJSON(url, function (JSON) {
        
        $xx.each(JSON.conversations, function (index, value) { 
            if (index >= count) {
                return;
            }
            c = new Conversation(value);
			alert(c.getHTML());
            c = new Conversation(value); 
            HTML.append(c.getHTML());
        });
    });
    
    return HTML;
}

/* The top level profile object.  Builds itself on existing div,
 * <div id='bnterprofile'>, and inserts the rest of the HTML dynamically */
function BnterProfiler(options) {

    var username, count, eProfile, HTML, eHeader, conversations;    
    username = options.username;
    count = options.count;
    eProfile = $xx('#bnterprofile');
    
    HTML  = "<div id='bnter_header'>";
    HTML += '<p id="username" class="left">';
    HTML += '<a href="http://www.bnter.com/' + username + '">' + username + '</a></p>';
    HTML += '<a href="http://www.bnter.com"><img alt="" src="http://bnter.com/web/assets/images/logo-small-2.png" class="right"></a>';
    HTML += '<div class="clear"></div></div>';
    
    eHeader = $xx(HTML);

    conversations = new Conversations(options);
    
    eProfile.append(eHeader);
    eProfile.append(conversations);
    
    this.settings = new Settings(options);
    
    this.setProperty = function (property, value) {
        this.settings.setSetting(property, value);
    };
    
    this.getProperties = function () {
        return this.settings.getSettings();
    };
    
}
