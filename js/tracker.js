/* 
---------------------------------------------------------------------------------------------------

Objects tracker

Tracks colored objects stillness

---------------------------------------------------------------------------------------------------
*/
 
var HS = HS || {};


/* 
---------------------------------------------------------------------------------------------------

Tracker configuration

---------------------------------------------------------------------------------------------------
*/

HS.tracker = new tracking.ColorTracker(HS.Settings.trackedColors);

// TODO: add custom color detection
//
// Example:
//
// tracking.ColorTracker.registerColor('blue', function(r, g, b) {
//   if (r < 100 && g < 100 && b > 150) {
//     return true;
//   }
//   return false;
// });
//


/* 
---------------------------------------------------------------------------------------------------

TrackedObject class

---------------------------------------------------------------------------------------------------
*/


HS.TrackedObject = function(data) {

	_(this).extend(
		_(data).defaults( {
	    	name: "object",
	    	color: 'cyan',
		    position: null,
		    immobilityDuration: 0,
		    isStill: false,
		    isVisible: false,
		    onAppear: function() {console.log(this.name + ' appeared')},
		    onDisappear: function() {console.log(this.name + ' disappeared')},
		    onLock: function() {console.log(this.name + ' locked')},
		    onUnlock: function() {console.log(this.name + ' unlocked')}
		})
	);

	_(this).bindAll('onAppear','onDisappear', 'onLock', 'onUnlock');

}

// HS.TrackedObject.prototype.myMethod = function() {
// }


/* 
---------------------------------------------------------------------------------------------------

Tracking

Raises motion events for each object individually:
- lock: the object became still
- unlock: the object was still and just moved
- appear: the object was detected in the frame
- disappear: the object is no more present in the frame

---------------------------------------------------------------------------------------------------
*/
 

HS.objects = []

HS.tracker.on('track', function(event) {
    
	_(HS.objects).each( function(o) {

	  var rectangles = _(event.data).where({color: o.color});

	  if (rectangles.length > 1) {
	    console.warn(rectangles.length + " objects with the " + o.name + " color have been detected. Frame skipped.");
	    return;
	  }

	  if (rectangles.length === 0) {
	      if (o.isVisible) {
	        o.position = null;
	        o.isVisible = false;
	        o.isStill = false;
	        o.onDisappear();
	      }
	      return;
	  }

	  var rect = rectangles[0];
	  rect.center = {
	    x: rect.x + rect.width / 2,
	    y: rect.y + rect.height / 2        
	  }

	  if (!o.isVisible) {

	    o.position = rect.center;
	    o.immobilityDuration = 0;
	    o.isVisible = true;
	    o.onAppear();
	  
	  } else {

	    if ( Math.abs(rect.center.x - o.position.x) <= HS.Settings.immobilityTolerance && Math.abs(rect.center.y - o.position.y) <= HS.Settings.immobilityTolerance ) {

	      // Object stayed still (since previously recorded position)
	      o.immobilityDuration++;
	      if (o.immobilityDuration === HS.Settings.immobilityLockThreshold) {
	        o.isStill = true;
	        o.position = rect.center;
	        o.onLock();
	      }

	    } else {
	      
	      // Object moved (since previously recorded position)
	      o.immobilityDuration = 0;
	      o.position = rect.center;
	      if (o.isStill) {
	        o.isStill = false;
	        o.onUnlock();
	      }

	    }
	  }
  });
});
