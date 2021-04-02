# Robot Control using WebVR
This is a JavaScript library for robotics using WebXR.


## Installation

To run this example
1. Clone the repository
1. install ROS (everything here was tested using our Jasmine setup) found [here](https://redmine.sim.informatik.tu-darmstadt.de/projects/hector/wiki/Hector_standard_software_install)
1. create an ssl keypair:

    ```shell
    openssl req -x509 -newkey rsa:4096 -keyout server1.example.com.key -out server1.example.com.pem -days 365 -nodes
    ```
    + **remember the path to these files or move them to /etc/ssl/certs/localcerts/**
    + to move the files use
    ```shell
    mv server1.example.com.key /etc/ssl/certs/localcerts/server1.example.com.key
    mv server1.example.com.pem /etc/ssl/certs/localcerts/server1.example.com.pem
    ```
    + next you have to change the permissions to allow your python server to access the certificate

    ```shell
    chmod 777 /etc/ssl/certs/localcerts/server1.example.com.key
    chmod 777 /etc/ssl/certs/localcerts/server1.example.com.pem
    chmod 777 /etc/ssl/certs/localcerts
    ```
    TODO: change permissions to be less permissive  
    Note: we need SSL/https to be able to use WebXR

1. Create a symlink from opt/hector/share/VRRobot to your cloned repository 
    + note this is a very specific step for this project. It's needed because our URDF are being returned with the python server with simple get requests
    ```shell
    ln -s ~/VRRobot /opt/hector/share/VRRobot
    ```
1. Allow connections to your firewall
    ```shell
    sudo ufw allow 9090 # for the websocket
    sudo ufw allow 8080 # for the webserver (you can choose any other port)
    ```
   note for self signed certificates:
   before opening the simulation, you have to visit https://127.0.0.1:9090 and https://127.0.0.1:8080 - to accept the certificates

1. make your python server executable
    ```shell
    chhmod +x ~/VRRobot/shttps.py
    ```



## Usage
on a default TU setup you can install tmux -  `sudo apt install tmux` and just run:  `~/VRRobot/dev-tmux`   
**Manual Running**  
execute these commands in order (wait a few seconds after running roscore to initialize the environment)
1. `roscore`
2. `rosrun tf2_web_republisher tf2_web_republisher`
3. `roslaunch rosbridge_server rosbridge_websocket.launch ssl:=true port:=9090 certfile:=/etc/ssl/certs/localcerts/server1.example.com.pem keyfile:=/etc/ssl/certs/localcerts/server1.example.com.key`
   * note that this assumes you have moved the files from the previous step
1. in `/opt/hector/share` run `VRRobot/shttps.py` 
   * note that you need to run this in `opt/hector/share` so the correct 3D models can be delivered
   * note that you need to configure the `shttps.py` file
1. `hector sim` and start the simulation or use **bagfiles**




**Notes** 
To record bagfiles:
1. `rosbag record /tf /tf_static /joint_states /colored_cloud /map /smooth_path /trajectory /front_rgbd_cam/depth/color/points /colored_cloud_world`
2. `rosrun rqt_robot_steering rqt_robot_steering` and drive around



to add a visualization: use any ROS3DJS visualization.
eg
```javascript
 var  cloudClient = addVisualization(rootObjectNode,'cloudClient', ROS3D.PointCloud2,{
        ros: ros,
        tfClient: tfClient,
        topic: '/colored_cloud',
        material: { size: 0.05 },
        colormap: colormap,
        max_pts: 30000000,
        decay:5
      });
```

## Controls
To add a controller you need to modify commons/mappings.js
## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## Known Issues
* CORS Exceptions  
    go to https://127.0.0.1:8080 and not https://localhost:8080 
## License
[MIT](https://choosealicense.com/licenses/mit/)

