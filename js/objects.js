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
   

// tracking.ColorTracker.registerColor('blue', function(r, g, b) {
//   if (r < 100 && g < 100 && b > 150) {
//     return true;
//   }
//   return false;
// });

HS.tracker = new tracking.ColorTracker([settings.cueBallColor, settings.headColor]);

/* 
---------------------------------------------------------------------------------------------------
Events

Raises motion events for each object individually:
- LOCKED: the object became still
- UNLOCKED: the object was still and just moved
- IN-CAMERA: the object was detected in the frame
- OFF-CAMERA: the object is no more present in the frame
---------------------------------------------------------------------------------------------------
*/
 
HS.objects = [ {
    name: "head",
    position: null,
    immobilityDuration: 0,
    color: settings.headColor,
    isStill: false
}, {
    name: "cue ball",
    position: null,
    immobilityDuration: 0,
    color: settings.cueBallColor,
    isStill: false
} ];

HS.tracker.on('track', function(event) {
    
_(objects).each( function(o) {

  var rectangles = _(event.data).where({color: o.color});

  if (rectangles.length > 1) {
    console.warn(rectangles.length + " objects with the " + o.name + " color have been detected, something is wrong here!");
    return;
  }

  if (rectangles.length === 0) {
      if (o.position !== null) {
        console.info("OBJECT OFF-CAMERA!");
        o.position = null;
      }
      return;
  }

  var rect = rectangles[0];
  rect.center = {
    x: rect.x + rect.width / 2,
    y: rect.y + rect.height / 2        
  }

  if (o.position === null) {

    console.info("OBJECT ON-CAMERA!");
    o.position = rect.center;
    o.immobilityDuration = 0;
  
  } else {

    if ( Math.abs(rect.center.x - o.position.x) <= settings.immobilityTolerance && Math.abs(rect.center.y - o.position.y) <= settings.immobilityTolerance ) {

      // Object stayed still since previous frame
      o.immobilityDuration++;
      o.position = {
        x: (rect.center.x * settings.newPositionWeight + o.position.x * (1 - settings.newPositionWeight)),
        y: (rect.center.y * settings.newPositionWeight + o.position.y * (1 - settings.newPositionWeight))
      }
      if (o.immobilityDuration === settings.immobilityLockThreshold) {
        console.info("OBJECT LOCKED!");
      }
    } else {
      
      // Object moved since previous frame
      if (o.immobilityDuration >= settings.immobilityLockThreshold) {
        console.info("OBJECT UNLOCKED!");
      }
      o.immobilityDuration = 0;
      o.position = rect.center;

    }
  }
});
