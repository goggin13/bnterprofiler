
/* for now, load up settings object and pass it to profile */
$(document).ready(function(){
	var options  = []
	
	options['shell_background'] = '#CCDDEE';
	options['shell_color'] = '#CCAAEE';
	options['conversation_background'] = '#AABBAA';
	options['link_color'] = '#EEDDAA';
	options['message_right_color'] = '#EEDD00';
	options['message_left_color'] = '#DDEE00';
	options['width'] = '270px';
	options['link_color'] = '#000000';
		
	var username = 'goggin13';

	new BnterProfiler(username, options);

});


/* Object responsible for setting all of the colors that
 * are available to customize.  Directly sets CSS for
 * all of the relevant classes */
function Settings(options){
	
	eProfile = $('#bnterprofile');
	eProfile.css('width', options['width']);
	eProfile.css('background', options['shell_background']);
	eProfile.css('color', options['shell_color']);
	
	eMessages_left = $('.message.left');
	eMessages_left.css('color', options['message_left_color']);
	eMessages_right = $('.message.right');
	eMessages_right.css('color', options['message_right_color']);
	
	
	eConversations = $('.conversation');
	eConversations.css('background', options['conversation_background']);	
}


/* The top level profile object.  Builds itself on existing div,
 * <div id='bnterprofile'>, and inserts the rest of the HTML dynamically */
function BnterProfiler(username, options){
	var username = username;
	var eProfile = $('#bnterprofile');	
	
	var HTML = "<div id='bnter_header'>";
	HTML += '<p id="username" class="left">';
	HTML += '<a href="http://www.bnter.com/' + username + '">' + username + '</a></p>';
	HTML += '<a href="http://www.bnter.com"><img alt="" src="http://bnter.com/web/assets/images/logo-small-2.png" class="right"></a>';
	HTML += '<div class="clear"></div></div>';
	
	var eHeader = $(HTML);

	var conversations = Conversations(username, options);
	
	eProfile.append(eHeader);
	eProfile.append(conversations);
	
}

/* The HTML for all the conversations displayed.  */
function Conversations(username, options){
	var url = "http://bnter.com/api/v1/user/conversations.json?user_screen_name=";
	url += username;
	url = "http://localhost:8080/js/sampleresponse2.js";
	var HTML = $('<div id="conversations"></div>');
	
	$.getJSON(url, function(JSON) {
	   $.each(JSON['conversations'], function(index, value) { 
  			c = new Conversation(value); 
			HTML.append(c.getHTML());
		});
		s = new Settings(options);
	});
	
	return HTML;
}

/* A single conversation, all the messages involved between
 * 2 users, and also the display for the users themselves displayed 
 * underneath the messages */
function Conversation(JSON, options){
	var timestamp = JSON['unix_timestamp'];
	var user1 = User(JSON['user'], true);
	var left_user = user1.getScreenName();
	user1 = user1.getHTML();
	var user2 = new User(JSON['user_two'], false).getHTML();
	
	var messages = Messages(JSON['messages'], left_user);
	
	var HTML = '<div class="conversation">';
	HTML += messages.getHTML();
	HTML += '<div class="clear"></div>';
	HTML += user1 + user2;
	HTML += '<div class="clear"></div>';
	HTML += '</div>';
	HTML = $(HTML);
	
	self.getHTML = function() {
		return HTML;
	}
	
	return self;
}

/* The HTML for a single user, image, and and username 
 * which links to them if they are registered. 
 * is_left dictates whether it floats left or right */
function User(JSON, is_left){
	var me = self;
	me.screen_name = JSON['screen_name'];
	me.name = JSON['name'];
	
	var has_profile = JSON['id'] > 0;
	var img_size = 40;
	var user_img = JSON['profile_image_url'].replace('?s=400', '?s=' + img_size);
	
	me.HTML  = '<div class="profile_image ' + (is_left ? 'left' : 'right') + '">';
	me.HTML +=    '<img src="' + user_img + '" alt="sender" ';
	me.HTML +=     	'class="' + (is_left ? 'left' : 'right') + '" />';
	me.HTML += 	   '<span class="username ' + (is_left ? 'left' : 'right') + '">';
	if (has_profile) me.HTML +=      '<a href="http://bnter.com/' + me.screen_name + '">';
	me.HTML +=      me.screen_name 
	if (has_profile) me.HTML +='</a>';
	me.HTML += '</span>';
	me.HTML += '</div>';
	
	me.getScreenName = function() {
		return me.screen_name;
	}
	
	me.getHTML = function() {
		
		return me.HTML;
	}
	
	return me;
}

/* HTML for all the messages in a conversation */
function Messages(JSON, left_user){
	messages = [];
	var HTML = '';
	
	$.each(JSON, function(index, value) { 
  		messages[index] = new Message(value, left_user); 
		HTML += messages[index].getHTML();
	});
	
	self.getHTML = function() {
		return HTML;
	}
	
	return self;
}

/* HTML for a single message */
function Message(JSON, left_user) {
	var text = JSON['text'];
	var sender = JSON['sender'];
	var is_left = sender == left_user;
	var img_size = 75;
	var sender_img = JSON['profile_image_url'].replace('?s=400', '?s=' + img_size);

	var HTML = '<div class="message ' + (is_left ? 'left' : 'right') + '" >';
	HTML +=    '<div class="top"></div>';
	HTML +=    '<div class="middle"><span class="content">' + text + '</span></div>';
	HTML +=    '<div class="bottom"></div>';
	HTML += '</div>';
	
	self.getHTML = function() {
		return HTML;
	}
	
	return self;
}

