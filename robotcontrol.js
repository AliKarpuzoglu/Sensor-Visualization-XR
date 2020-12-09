/**
 * we use this file for our ros3djs/roslibjs code
 */



var menuOpen = false;
var rootObjectNode // the Aframe node to which we will add children nodes to add visualizations to
// we need to add child nodes for the visualization because otherwise some things will only be partially loaded
let ip = "192.168.0.8" 
let used_visualisations = {} // a dictionary for which visualizations we use
let used_controls  = {} // a dictionary for the controls we use with the robot


/**
 * this function loads the robot model
 * @param {} ros
 * @param {*} tfClient 
 * @param {*} rootObjectScene  the object that the visualization should be attatched to
 * @param {*} _callback  if a callback is needed after running the function
 */
function load_urdf(ros, tfClient, rootObjectScene, _callback) {
    // Setup the URDF client.
    var urdfClient = new ROS3D.UrdfClient({
        ros: ros,
        tfClient: tfClient,
        path: 'https://' + ip + ':8080/',
        rootObject: rootObjectScene
    });
    // await new Promise(r => setTimeout(r, 10000));
    _callback();
    return urdfClient
}

function getCloudClient(ros,tfClient,topic,rootObject,decay){

    this._floatColor = new Float32Array(1);
    this._rgb_lut = new Float32Array(256);
    for (var i = 0; i < 256; i++) {
        this._rgb_lut[i] = i / 255.0
    }

    var that = this;
    colormap = function (x) {
        that._floatColor[0] = x;
        const intColorArray = new Int32Array(that._floatColor.buffer);
        const intColor = intColorArray[0];

        return {
            r: that._rgb_lut[(intColor >> 16) & 0xff],
            g: that._rgb_lut[(intColor >> 8) & 0xff],
            b: that._rgb_lut[(intColor) & 0xff],
            a: 1.0
        };
    }

    //Colorized cloud of the rotating laser scanner
    var cloudClient = new ROS3D.PointCloud2({
        ros: ros,
        tfClient: tfClient,
        topic: topic,
        rootObject: rootObject,
        material: { size: 0.05 },
        colormap: colormap,
        max_pts: 30000000,
        decay:decay
    });
}

/**
 * Setup all visualization elements when the page is loaded.
 */
async function init_env() {

    var scene = document.querySelector('a-scene');


    // these are the events of common/mappings.js
    // slowly we should replace them by our events
    // common.js -> inputActions 
    // var events = ['dpadleft', 'dpadrightlong', 'dpad', 'logtask1', 'logtask2', 'logdefault', 'righthand', 'lefthand', 'doubletouch', 'doublepress', 'longpress'];
    // if(leftHanded){
        // replace left and right in the strings and register the event listeners
        //  TODO: good idea?
    // }
    var robotMovementEvents = ['moveForward','moveBackward','turnLeft','turnRight','stopRobot']
    var loggingEvents = ['logtask1'] // this is an example to demonstrate the different modes in the mappings
    // console.log(events)


        
    AFRAME.registerComponent('thumbstick-logging',{
        init: function () {
          this.el.addEventListener('trackpadmoved', this.logThumbstick);
        },
        logThumbstick: function (evt) {
            if(AFRAME.currentInputMapping==='roboControls') {         
          controls = [evt.detail.y,0,0,0,0,evt.detail.x]
          
          moveRobot(controls)
          
          if (evt.detail.y > 0.95) { console.log("DOWN"); }
          if (evt.detail.y < -0.95) { console.log("UP"); }
          if (evt.detail.x < -0.95) { console.log("LEFT"); }
          if (evt.detail.x > 0.95) { console.log("RIGHT"); }
        }
            }
      });


    scene.addEventListener('changeMode',changeMode)
    scene.addEventListener('rescalegrip',rescalegrip)
    scene.addEventListener('endrescalegrip',endrescalegrip)


    scene.addEventListener('openMenu', openMenu);

    for (var i = 0; i < robotMovementEvents.length; i++) {
        scene.addEventListener(robotMovementEvents[i], function (event) {
            var type = event.type;
            var currentMappingActions = AFRAME.inputActions[AFRAME.currentInputMapping];
            var parameters = currentMappingActions[type] ? currentMappingActions[type].params : [0,0,0,0,0,0];
            moveRobot(parameters)
        });
    }

    rootObjectNode = document.getElementById('robot-element-parent')

    // Connect to ROS.
    var ros = new ROSLIB.Ros({
        url: 'wss://' + ip + ':9090'
    });

    // the topic we will publish controls to
    var cmdVel = new ROSLIB.Topic({
        ros : ros,
        name : '/cmd_vel',
        messageType : 'geometry_msgs/Twist'
      });

    // Setup a client to listen to TFs.
    var tfClient = new ROSLIB.TFClient({
        ros: ros,
        angularThres: 0.01,
        transThres: 0.01,
        rate: 10.0,
        fixedFrame: '/world'
    });


    var node = document.createElement("a-entity");
    rootObjectNode.appendChild(node)
    var cloudClient = getCloudClient(ros,tfClient,'/colored_cloud',node.object3D,5)


    // node = document.createElement("a-entity");
    // rootObjectNode.appendChild(node)

    // markerClient = new ROS3D.MarkerArrayClient(
    //     {
    //         ros: ros,
    //         topic: '/worldmodel_main/occupied_cells_vis_array',
    //         tfClient: tfClient,
    //         rootObject: node.object3D

    //     }
    // )

    // // Point cloud of the rotating laser scanner
    // var cloudClientOfLaserScanner = new ROS3D.PointCloud2({
    //     ros: ros,
    //     tfClient: tfClient,
    //     topic: '/scan_matched_points2', 
    //     rootObject :  node.object3D,
    //     material: { size: 0.02, color: "rgb(123,45,125)"},

    // });

    node = document.createElement("a-entity");
    rootObjectNode.appendChild(node)
    //Occupancy grid map used for navigation
    var gridClient = new ROS3D.OccupancyGridClient({
        ros: ros,
        topic: '/map',
        rootObject: node.object3D,
    });

    node = document.createElement("a-entity");
    rootObjectNode.appendChild(node)

    var urdfClient = load_urdf(ros, tfClient, node.object3D, () => console.log('huzzah, I\'m done!'))


    used_visualisations["urdf"] = urdfClient;
    used_visualisations["cloudClient"] = cloudClient;
    used_visualisations["gridClient"] = gridClient;
    // used_visualisations["markerClient"] = markerClient;
    used_controls["cmd_vel"]  = cmdVel;
}

async function init_env_after_seconds(seconds) {
    await new Promise(r => setTimeout(r, seconds * 1000));
    init_env()

}
/**
 * This function turns a specific visualization on or off
 * 
 * 
 * sadly the toggle does not pass any "toggled" flag as far as I can tell, so as of now these things just behave like buttons
 * We have two options to check for the toggle, one way is to see if the object is visible 
 * The nicer option would be to check for a subscribeId but we have had issues when using the subscribeId using the occupancymap
 * @param {} click the fired event when clicking/toggling a topic
 */
function toggleTopic(click) {
    console.log(click)
    topicName = click.target.getAttribute("value")
    console.log(used_visualisations[topicName].rosTopic.subscribeId)

    var has_sub_id = used_visualisations[topicName].rosTopic.subscribeId // it has a subscribeID -- Maybe we should check if it's visible instead?
    var something_is_visible = used_visualisations[topicName].rootObject && used_visualisations[topicName].rootObject.visible
    || used_visualisations[topicName].points && used_visualisations[topicName].points.rootObject.visible 
    if ( something_is_visible )  { 
        if (used_visualisations[topicName].rootObject) { // points object doesnt immediately have the rootObject - TODO: this needs to be adapted whenever we toggle topics
            used_visualisations[topicName].rootObject.visible = false

        } else {
            used_visualisations[topicName].points.rootObject.visible = false
        }
        used_visualisations[topicName].unsubscribe()
        return
    } else {
        if (used_visualisations[topicName].rootObject) { // points object doesnt immediately have the rootObject - TODO: this needs to be adapted whenever we toggle topics
            used_visualisations[topicName].rootObject.visible = true

        } else {
            used_visualisations[topicName].points.rootObject.visible = true

        }
        used_visualisations[topicName].subscribe()
        console.log("subscribe")
        return

    }

}

//controls

/**
 * this needs to be configured to the specific robot
 */
function teleportToRobot(){
    scale = rootObjectNode.getAttribute("scale")
    position = used_visualisations["urdf"].tfClient.frameInfos.arm_base_link.transform.translation //TODO: make configurable
    position.x *=scale.x
    position.y *=scale.y
    position.z *=scale.z

    rig.setAttribute("position",position)
}

/**
 * Rescaling the scene 
 * @param {*} click 
 * @param {*} percent 
 */
function rescaleaction(click, percent) {
    console.log(percent)
    value_of_scale = percent * 2 + 0.1
    scale_string = value_of_scale + " " + value_of_scale + " " + value_of_scale
    rootObjectNode.setAttribute("scale", scale_string)

}

/**
 * opening the toggle menu
 */
function openMenu() {
    menuOpen = !menuOpen

    var menugui = document.getElementById('menu-gui')
    menugui.setAttribute("visible", menuOpen);

}
/**
 * helper function
 * @param {} val 
 * @param {*} min 
 * @param {*} max 
 */
function clamp(val, min, max) {
    return val > max ? max : val < min ? min : val;
}


let velocities = [0,0,0,0,0,0]
/**
 * Instead of taking the parameters, we also want to be able to work if someone moves diagonally
 * so instead of just taking the movement and publishing it - which only publishes one of two commands, we will try to
 * publish one at a time
 * 
 * this works well when using a controller with a joystick/ diagonal movements, but this needs to be configured for keyboards 
 * eg: make clicking forward and left into one message instead of two
 * 
 * 
 * @param {*} x linear x 
 * @param {*} y linear y
 * @param {*} z  linear z
 * @param {*} a angular x
 * @param {*} b angular y
 * @param {*} c angular z
 */
function moveRobot(arr){
    // console.log(x)
    // var arr = [x,y,z,a,b,c]
    // var newVelocities = zvelocities.map((a, i) => clamp(a + arr[i],-1,1));
    velocities = arr
    console.log(velocities)
    // var newVelocities = [0,0,0,0,0,0]

      var twist = new ROSLIB.Message({
        linear : {
          x : velocities[0],
          y : velocities[1],
          z : velocities[2]
        },
        angular : {
          x : velocities[3],
          y : velocities[4],
          z : velocities[5]
        }
      });
      used_controls['cmd_vel'].publish(twist);
}