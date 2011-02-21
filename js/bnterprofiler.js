// http://www.jslint.com/
/*global jQuery, browser: true, devel: true */

var $xx = jQuery.noConflict(true);

/* Object responsible for setting all of the colors that
 * are available to customize.  Directly sets CSS for
 * all of the relevant classes */
var Settings = function (options) {
    var that = {};

    that.init = function (options) {
        that.options = options;
        that.createStyles();
    };
    
    that.setSetting = function (property, value) {
        that.options[property] = value;
        that.CreateStyles();
    };
    
    that.getSettings = function () {
        return that.options;
    };
     
    that.createStyles = function () {
        var HTML = '', css;
        
        HTML += '#bnterprofile{ width:' + that.options.width + ';';
        HTML += 'background:' + that.options.shell_background + ';';
        HTML += 'color:' + that.options.shell_color + ';}';
        
        HTML += '#bnterprofile .message.left{ color:' + that.options.message_left_color + ';}';
        HTML += '#bnterprofile .message.right{ color:' + that.options.message_right_color + ';}';
        HTML += '#bnterprofile .conversation{background: ' + that.options.conversation_background + ';}';
        HTML += '#bnterprofile a{ color: ' + that.options.link_color + '}';
        
        if ($xx('#bnterprofile_styles').length > 0) {
            $xx('#bnterprofile_styles').remove();
        }
        
        css  = $xx("<style id='bnterprofile_styles'>" + HTML + "<style />");
        $xx('head').append(css);
        $xx('head').append('<link rel="stylesheet" type="text/css" href="http://bnterprofiler.appspot.com/css/bnterprofile.min.css" />');
    };
 
    that.init(options);        
    return that;
};


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
            
    return  (
                (day_diff === 0) && 
                (
                    (diff < 60 && "just now") ||
                    (diff < 120 && "1 minute ago") ||
                    (diff < 3600 && Math.floor( diff / 60 ) + " minutes ago") ||
                    (diff < 7200 && "1 hour ago") ||
                    (diff < 86400 && Math.floor( diff / 3600 ) + " hours ago")
                )
            ) 
            ||
            (day_diff === 1 && "Yesterday") ||
            (day_diff < 7 && day_diff + " days ago") ||
            (day_diff < 31 && Math.ceil( day_diff / 7 ) + " weeks ago");
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

var Element = function() {
    var that = {},
        HTML = '';
    
    that.getHTML = function () {
        return HTML;
    };
    
    that.setHTML = function (newHTML) {
        HTML = newHTML;
    };
    return that;
};

/* HTML for a single message */
var Message = function (JSON, left_user) {
    var text, sender, is_left, img_size, sender_img, HTML, that;
    that = Element();
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
    
    that.setHTML(HTML);
    return that;
};

/* HTML for all the messages in a conversation */
var Messages = function (JSON, left_user) {
    var messages = [], 
        HTML = '', 
        that = Element();
       
    $xx.each(JSON, function (index, value) { 
        messages[index] = Message(value, left_user); 
        HTML += messages[index].getHTML();
    });
    
    that.setHTML(HTML);
    return that;
};

/* The HTML for a single user, image, and and username 
 * which links to them if they are registered. 
 * is_left dictates whether it floats left or right */
var User = function (JSON, is_left) {
    var has_profile = JSON.id > 0, 
        img_size = 40, 
        user_img = JSON.profile_image_url.replace('?s=400', '?s=' + img_size),
        that = {},
        screen_name = JSON.screen_name;
    
    that.getScreenNameHTML = function (asLink) {
        var HTML =     '<span class="username ' + (is_left ? 'left' : 'right') + '">';
        if (has_profile && asLink) { 
            HTML +=      '<a href="http://bnter.com/' + screen_name + '">';
        }
        HTML += screen_name;
        if (has_profile && asLink) { 
            HTML += '</a>';
        }
        HTML += '</span>';
        return HTML;
    };
    
    that.getProfileImageHTML = function () {
        var HTML;
        HTML = '<img class="profile_image ' + (is_left ? 'left' : 'right') + '"';
        HTML += ' src="' + user_img + '" alt="sender" />';  
        return HTML;
    };

    that.getScreenName = function () {
        return screen_name;
    };

    return that;
};

/* A single conversation, all the messages involved between
 * 2 users, and also the display for the users themselves displayed 
 * underneath the messages */
var Conversation = function (JSON, options) {
    var timestamp = JSON.unix_timestamp, 
        that = Element(),
        HTML = '', 
        user1 = User(JSON.user, true),
        user2 = User(JSON.user_two, false),
        left_user = user1.getScreenName(),
        left_profile = user1.getProfileImageHTML(),
        left_screenname = user1.getScreenNameHTML(true),
        right_profile = user2.getProfileImageHTML(),
        right_screenname = user2.getScreenNameHTML(true),
        messages = Messages(JSON.messages, left_user);
    
    HTML += '<div class="conversation">';
    HTML += messages.getHTML();
    HTML += '<div class="users">' + left_profile + left_screenname + right_profile + right_screenname + '</div>';
    HTML += '<div class="clear"></div>';
    HTML += '<span class="timestamp">' + unixToPrettyDate(timestamp) + '</span>';
    HTML += '</div>';
    HTML = $xx(HTML);

    that.setHTML(HTML);
    return that;
};

/* A single conversation in teaser form, just the user names
 * and profile images*/
var Teaser = function (JSON, options) {
    var timestamp = JSON.unix_timestamp, 
        that = Element(),
        HTML = '', 
        user1 = User(JSON.user, true),
        user2 = User(JSON.user_two, false),
        left_profile = user1.getProfileImageHTML(),
        left_screenname = user1.getScreenNameHTML(true),
        right_profile = user2.getProfileImageHTML(),
        right_screenname = user2.getScreenNameHTML(true);
    
    HTML = '<div class="conversation"><a  href="http://bnter.com/convo/' + JSON.id + '">';
    HTML += '<span class="timestamp">' + unixToPrettyDate(timestamp) + '</span>';
    HTML += '<div class="clear"></div>';
    HTML += left_profile + left_screenname + right_profile + right_screenname;
    HTML += '<div class="clear"></div>';
    HTML += '</a></div>';

    HTML = $xx(HTML);

    that.setHTML(HTML);
    return that;
};

/* The HTML for all the conversations displayed.  */
var Conversations = function (options, eProfile, cache) {
    var that = {},
        count = options.count, 
        HTML, conversation,
        url = 'http://bnterprofiler.appspot.com/bnter?user_screen_name=' + options.username;
        
    that.getConversations = function(callback) {
        
        function makeConversationFrom (value) {
            return ( options.type === 'teaser' ? Teaser(value, options) : Conversation(value, options));
        }
        
        if (options.type in cache) {
            callback(cache[options.type]);
        } else {
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
                    conversation = makeConversationFrom(value);  
                    HTML.append(conversation.getHTML());
                });
                cache[options.type] = HTML;
                callback(HTML);
            });
        }
    };
   
    that.addHTML = function (HTML){
        eProfile.append(HTML);
    };
    
    that.getConversations(that.addHTML);
    return that;
};


/* The top level profile object.  Builds itself on existing div,
 * <div id='bnterprofile'>, and inserts the rest of the HTML dynamically */
var BnterProfiler = function (options) {
    var that = {},
        eProfile = $xx('#bnterprofile'), 
        cache = [],
        HTML = '', eHeader, conversations, settings;

    HTML  = "<div id='bnter_header'>";
    HTML += '<p id="username" class="left">';
    HTML += '<a href="http://www.bnter.com/' + options.username + '">' + options.username + '</a></p>';
    HTML += '<a id="bnter_header_link" href="http://www.bnter.com"><img alt="" src="http://bnter.com/web/assets/images/logo-small-2.png" class="right"></a>';
    HTML += '<div class="clear"></div></div>';
    
    eHeader = $xx(HTML);
    eProfile.append(eHeader);
    conversations = Conversations(options, eProfile, cache);
    settings = Settings(options);

    that.setProperty = function (property, value) {
        settings.setSetting(property, value);
    };
    
    that.getProperties = function () {
        return settings.getSettings();
    };
    
    that.setType = function (type) {
        $xx('#conversations').remove();
        options.type = type;
        conversations = Conversations(options, eProfile, cache);
    };
    
    return that;
};
