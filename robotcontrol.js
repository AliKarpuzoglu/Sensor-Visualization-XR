var open = false;
var rootObjectNode
var viewer;
let ip = "192.168.0.8"
let used_visualisations = {}

function load_urdf(ros, tfClient, rootObjectScene, _callback) {
    // Setup the URDF client.
    var urdfClient = new ROS3D.UrdfClient({
        ros: ros,
        tfClient: tfClient,
        path: 'https://' + ip + ':8080/',
        // rootObject : viewer.scene
        rootObject: rootObjectScene
    });
    // await new Promise(r => setTimeout(r, 10000));
    _callback();
    return urdfClient
}

/**
 * Setup all visualization elements when the page is loaded.
 */
async function init_env() {

    var scene = document.querySelector('a-scene');


    // these are the events of common/mappings.js
    // slowly we should replace them by our events
    // common.js -> inputActions 
    var events = ['dpadleft', 'dpadrightlong', 'dpad', 'logtask1', 'logtask2', 'logdefault', 'righthand', 'lefthand', 'doubletouch', 'doublepress', 'longpress'];
    console.log(events)


    scene.addEventListener('openMenu', openMenu);
    for (var i = 0; i < events.length; i++) {
        console.log(event)

        scene.addEventListener(events[i], function (event) {
            logEvent(event);
        });
    }
    let ip = "192.168.0.8"

    var rootObjectScene = document.getElementById('robot-element-parent').object3D //  AFRAME.scenes[0].object3D // 
    rootObjectNode = document.getElementById('robot-element-parent')
    // rootObjectScene.add(new ROS3D.Grid());

    // Connect to ROS.
    var ros = new ROSLIB.Ros({
        url: 'wss://' + ip + ':9090'
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
    this._floatColor = new Float32Array(1);
    this._rgb_lut = new Float32Array(256);
    for (var i = 0; i < 256; i++) {
        this._rgb_lut[i] = i / 255.0
    }

    var that = this;
    colormapa = function (x) {
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
        topic: '/colored_cloud',
        rootObject: node.object3D,
        material: { size: 0.05 },
        colormap: colormapa,
        max_pts: 30000000



    });

    node = document.createElement("a-entity");
    rootObjectNode.appendChild(node) 

    markerClient =  new ROS3D.MarkerArrayClient(
        {
            ros:ros,
            topic:'/worldmodel_main/occupied_cells_vis_array',
            tfClient:tfClient,
            rootObject: node.object3D

        }
    )

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


    used_visualisations["urdf"] = urdfClient
    used_visualisations["cloudClient"] = cloudClient
    used_visualisations["gridClient"] = gridClient
    used_visualisations["markerClient"] = markerClient
}

async function init_env_after_seconds(seconds) {
    await new Promise(r => setTimeout(r, seconds * 1000));
    init_env()

}

function toggleTopic(click){
    console.log(click)
    topicName = click.target.getAttribute("value")
    if(topicName.subscribeId){ // it has a subscribeID
        used_visualisations[topicName].unsubscribe()
        used_visualisations[topicName].rootObject.visible = false
    }else{
        used_visualisations[topicName].subscribe()
        used_visualisations[topicName].rootObject.visible = true

    }

}

//controls


function rescaleaction(click, percent) {
    console.log(percent)
    value_of_scale = percent * 2 + 0.1
    scale_string = value_of_scale + " " + value_of_scale + " " + value_of_scale
    rootObjectNode.setAttribute("scale", scale_string)

}
function openMenu() {
    open = !open

    var menugui = document.getElementById('menu-gui')
    menugui.setAttribute("visible", open);

}