/*
 * This script handles the task of setting up the form, initializing
 * the demo widget, setting up the color chooers, performing very simple 
 * data validation, and updating the demo as the form changes.  
 */

/* 
 * Set up the default options and pass them
 * to the widget.  Initialize the widget and the demo form 
 */
$xx(document).ready(function(){
	
	alert('hello world');
	var options, widget;
	
	options = {
				"username":"laurenleto", 
				"width":"270px", 
				"count":"3", 
				"shell_background":"#666666", 
				"shell_color":"#48ff05", 
				"conversation_background":"#1a1717", 
				"link_color":"#ff6a00", 
				"message_right_color":"#591717", 
				"message_left_color":"#000000" 
				};
	
	widget = new BnterProfiler(options);
	form = new WidgetForm(widget);

});


/* 
 * This object is the form for manipulating the demo widget, and 
 * generating the code snippet.  It responds to changes in the 
 * appropriate fields by updating the widget (reference is passed in)
 */
function WidgetForm(widget) {

	// set up the color choosers, hide the result code 
	// and map the starting colors to the demo
	Init = function () {
		
		$xx('#result_code').hide();
		
		$xx('.color_chooser + .color_demo').each(function(){
			var hex;
			hex = $xx(this).siblings('.color_chooser').val();
			$xx(this).css('background', '#' + hex);
		});
		
		// set up the color choosers
		$xx('.color_chooser').ColorPicker({
			onSubmit: function(hsb, hex, rgb, el) {
				$xx('.current_color_chooser').val(hex);
				$xx('.current_color_chooser').change();
				$xx(el).ColorPickerHide();
			},
			onChange: function (hsb, hex, rgb) {
				$xx('.current_color_chooser').val(hex);
				$xx('.current_color_chooser').change();
			}
		});
	}
	
	// creates a javascript hash of the options, suitable to insert in the script
	OptionsToString = function (options) {
		var optStr = '{\n';
		for (var key in options) {
			optStr += '"' + key + '":"' + options[key] + '", \n';
		}
		optStr += '}';
		return optStr;
	}
	
	// gets the options, as a hash, from the form
	GetOptions = function () {
		var options = [];
		$xx('.bp_option').each(function(i){
			var property = $xx(this).attr('name');
			var value = $xx(this).val();
		
			if (property=='width') value += 'px';
			if ($xx(this).hasClass('color_chooser')) value = '#' + value;
		
			options[property] = value;
		});
		return options;	
	}
	
	// given the JS string of options, makes the script for output to the user
	MakeScript = function(options_string) {
		var script;
		script = '<script src="http://bnterprofiler.appspot.com/js/bnterprofiler.min.js" type="text/javascript"></script>\n';
		script += '<script type="text/javascript">\n';
		script += 'var options = ' + options_string + ';';
		script += '\n$xx(document).ready(function () {\nnew BnterProfiler(options);\n}); \n</script>\n<div id="bnterprofile"></div>';
		return script;
	}
	
	Init();
	
	/* 
	 * the following are all event bindings to the relevant pieces of the form
	 */
	
	// validate the width on the form
	$xx('#width').change(function(){
		var val = $xx(this).val();
		if (val.length != 0 && (isNaN(val) || val < 270)) {
			alert('Width should be a number greater than 270, or blank for autosize');
			$xx(this).val('270');
		}
	});
	
	// validate the conversation count
	$xx('#conversation_count').change(function(){
		var val = $xx(this).val();
		if (isNaN(val) || val <= 0 || val > 10) {
			alert('Include between 1 and 10 conversations');
			$xx(this).val('5');
		}
	});
	
	// the button to display the output script 
	// (the point of this whole dog and pony show; ta da!)
	$xx('#submit').click(function(){
		var script, options, options_string;
		$xx('#result_code').hide();
		options  = GetOptions();
		options_string = OptionsToString(options); 
		script = MakeScript(options_string)
		$xx('#result_code').val(script);
		$xx('#result_code').show('slow');
	});
	
	// when the colors are switched, update the widget and the 
	// display box
	$xx('.color_chooser').change(function(){
		var property, hex;
		
		hex = $xx(this).val();
		$xx(this).siblings('.color_demo').css('background', '#' + hex);
		
		property = $xx(this).attr('name');
		widget.setProperty(property, '#' + hex);
	});
	
	// We need to keep track of the active color chooser field, so that
	// we can write to it as the color chooser is updated.  
	$xx('.color_chooser').click(function(){
		$xx('.color_chooser').removeClass('current_color_chooser');
		$xx(this).addClass('current_color_chooser');
	});
		
	
	
}

