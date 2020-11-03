var mappings = {
  default: {
    'vive-controls': {
      trackpaddown: 'teleport'
    },

    'oculus-touch-controls': {
      xbuttondown: 'teleport'
    }
  },
  paint: {
    common: {
      triggerdown: 'paint'
    },
  
    'vive-controls': {
      menudown: 'toggleMenu'
    },

    'oculus-touch-controls': {
      abuttondown: 'toggleMenu'
    }
  },
  mappings: {
    default: {
      common: {
        trackpaddown: 'teleportstart',
        trackpadup: 'teleportend'
      },
      'oculus-touch-controls': {
        thumbstickdown: 'teleportstart',
        thumbstickup: 'teleportend'
      },
      keyboard: {
        't_down': 'teleportstart',
        't_up': 'teleportend'
      }
    }
  }
};

AFRAME.registerInputMappings(mappings);
// var inputActions = {
//   task1: {
//     changeTask: { label: 'Change task' },
//     logdefault: { label: 'Test Log' },
//     logtask1: { label: 'Test Log Task 1' },
//     logtask2: { label: 'Test Log Task 2' },
//     lefthand: { label: 'Left hand' },
//     righthand: { label: 'Right hand' },
//     longpress: { label: 'Long press' },
//     doubletouch: { label: 'Double touch' },
//     doublepress: { label: 'Double press' }
//   },
//   task2: {
//     changeTask: { label: 'Change task' },
//     logtask2: { label: 'Test Log Task 2' }
//   }
// }

// AFRAME.registerInputActions(inputActions, 'task1');