/* 
---------------------------------------------------------------------------------------------------

View

Interaction with user:
- Display feedback messages
- Play sound clips

---------------------------------------------------------------------------------------------------
*/

var HS = HS || {};


HS.View = {

	sounds: {
		arm: new buzz.sound("sounds/arm.mp3"),
		disarm: new buzz.sound("sounds/disarm.mp3"),
		success: new buzz.sound("sounds/success.mp3"),
		failure: new buzz.sound("sounds/failure.mp3")
	},

	feedback: function(data) {
		_(data).defaults({
			message: '',
			sound: 'arm',
			type: 'default'
		});

		if (!data.message) {
			$('#feedback').html('');
			return;
		}

		var html = '<span class="label label-' + data.type + '">' + data.message + '</span>';
		$('#feedback').html(html);
		
		HS.View.sounds[data.sound].play();
	}

}

buzz.all().load();
buzz.all().setVolume(100);
