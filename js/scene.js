/* 
---------------------------------------------------------------------------------------------------

Scene

Set the scene and it behaiour

Scene objects:
- head
- cue ball

Behaviour:
- "arm" sound when head & ball are still
- "success" sound if ball moves and head stays still (from 0.5 sec before ball starts moving and 0.5 sec after)
- "failure" sound if ball moves and head doesn't stay still 
- "disarm" sound if head moves and cue ball stays still

---------------------------------------------------------------------------------------------------
*/
 
var HS = HS || {};

/* 
---------------------------------------------------------------------------------------------------

Scene state

---------------------------------------------------------------------------------------------------
*/

HS.Scene = {
	isArmed: false,
	hasShot: false,
	cueBallTimer: undefined,
	headTimer: undefined
}

/* 
---------------------------------------------------------------------------------------------------

Objects  

---------------------------------------------------------------------------------------------------
*/
     
var head = new HS.TrackedObject({name: "head", color: "cyan"});
var cueBall = new HS.TrackedObject({name: "cue ball", color: "yellow"});

HS.objects = [ head, cueBall ];


/* 
---------------------------------------------------------------------------------------------------

Handlers

---------------------------------------------------------------------------------------------------
*/

cueBall.onLock = function() {
	if (head.isStill && !HS.Scene.hasShot) {
		HS.Scene.isArmed = true;
		HS.View.feedback({
			message: "Ready to shoot",
			sound: 'arm',
			type: 'default'
		});
	}
}

head.onLock = function() {
	if (cueBall.isStill && !HS.Scene.hasShot) {
		HS.Scene.isArmed = true;		
		HS.View.feedback({
			message: "Ready to shoot",
			sound: 'arm',
			type: 'default'
		});
	}
}

cueBall.onUnlock = function() {
	if (HS.Scene.isArmed && !HS.Scene.hasShot) {
		if (HS.Scene.headTimer) {

			// Cue ball just moved but head has moved as well less than x sec ago -> Failure
			clearTimeout(HS.Scene.headTimer);
			HS.Scene.headTimer = undefined;
			HS.Scene.hasShot = true;
			HS.View.feedback({
				message: "Bad shot !",
				sound: 'failure',
				type: 'danger'
			});

		} else {
			HS.Scene.cueBallTimer = setTimeout(function() {
				
				// Cue ball moved x sec ago and head has stayed still the whole time -> Success
				HS.Scene.cueBallTimer = undefined;
				HS.Scene.hasShot = true;
				HS.View.feedback({
					message: "Nice !",
					sound: 'success',
					type: 'success'
				});

			}, HS.Settings.requiredStillnessTimeAfterContact)
		}
	}
}

head.onUnlock = function() {
	if (HS.Scene.isArmed) {
		if (HS.Scene.cueBallTimer) {

			// Head just moved but cue ball has moved as well less than x sec ago -> Failure
			clearTimeout(HS.Scene.cueBallTimer);
			HS.Scene.cueBallTimer = undefined;
			HS.Scene.hasShot = true;
			HS.View.feedback({
				message: "Bad shot !",
				sound: 'failure',
				type: 'danger'
			});

		} else {
			HS.Scene.headTimer = setTimeout(function() {

				// Head moved x sec ago and ball has stayed still the whole time -> Disarm
				HS.Scene.headTimer = undefined;
				HS.Scene.isArmed = false;
				HS.Scene.hasShot = false;
				HS.View.feedback({
					message: "",
					sound: 'disarm'
				});

			}, HS.Settings.requiredStillnessTimeBeforeContact)
		}

	}
}
