

$xx(document).ready(function(){
	
	$xx('#result_code').hide();
	
	var options = {
					"username":"laurenleto", 
					"width":"270px", 
					"count":"3", 
					"shell_background":"#666666", 
					"shell_color":"#48ff05", 
					"conversation_background":"#1a1717", 
					"link_color":"#ff6a00", 
					"message_right_color":"#591717", 
					"message_left_color":"#000000", 
					};
	
	bp = new BnterProfiler(options);
	
	$xx('.bp_option.color_chooser').change(function(){
		var property = $xx(this).attr('name');
		var value = $xx(this).val();
		
		if (property=='width') value += 'px';
		if ($xx(this).hasClass('color_chooser')) value = '#' + value;
		
		bp.setProperty(property, value);
	});
	
	$xx('#submit').click(function(){
		$xx('#result_code').hide();
		var script = '<script src="http://bnterprofiler.appspot.com/js/bnterprofiler.min.js" type="text/javascript"></script>\n';
		var options  = GetOptionsFromForm();
		var options_string = OptionsToString(options); 
		script += '<script type="text/javascript">\n';
		script += 'var options = ' + options_string + ';';
		script += '\n$xx(document).ready(function () {\nnew BnterProfiler(options);\n}); \n</script>\n<div id="bnterprofile"></div>';
		$xx('#result_code').val(script);
		$xx('#result_code').show('slow');
	});
	
	$xx('.color_chooser').click(function(){
		$xx('.color_chooser').removeClass('current_color_chooser');
		$xx(this).addClass('current_color_chooser');
	});
	
	$xx('.color_chooser').change(function(){
		var hex = $xx(this).val();
		$xx(this).siblings('.color_demo').css('background', '#' + hex);
		
	});
	
	$xx('.color_chooser + .color_demo').each(function(){
		var hex = $xx(this).siblings('.color_chooser').val();
		$xx(this).css('background', '#' + hex);
		
	});
	
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
	
	$xx('#width').change(function(){
		var val = $xx(this).val();
		if (val.length != 0 && (isNaN(val) || val < 270)) {
			alert('Width should be a number greater than 270, or blank for autosize');
			$xx(this).val('270');
		}
	});
	
	$xx('#conversation_count').change(function(){
		var val = $xx(this).val();
		if (isNaN(val) || val <= 0 || val > 10) {
			alert('Include between 1 and 10 conversations');
			$xx(this).val('5');
		}
	});
	
});

function OptionsToString(options){
	var optStr = '{\n';
	for (var key in options) {
		optStr += '"' + key + '":"' + options[key] + '", \n'
	}
	optStr += '}';
	return optStr;
}

function GetOptionsFromForm(){
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