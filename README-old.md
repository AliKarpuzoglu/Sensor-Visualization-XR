# robot_control_xr_interface

XR (VR, AR..) interface for robot data visualization and control for ROS.



How to use:  
1. run `roscore` 
Then  

2. `rosrun tf2_web_republisher tf2_web_republisher`  # publishes transformations
3. `roslaunch hector_tracked_vehicles_description xacrodisplay_jasmine_2018_ugv.launch` # depending on the robot
3.a instead we could use `hector sim`
4. `roslaunch rosbridge_server rosbridge_websocket.launch` # connection ROS-JSON
5. `sudo ufw allow PORT`
6. `python -m SimpleHTTPServer PORT` # in /opt/hector/share/ , TODO: create Symlinks
6a. For https run `python shttps.py` 

for ssl:

`openssl req -x509 -newkey rsa:4096 -keyout server1.example.com.key -out server1.example.com.pem -days 365 -nodes`  


*first we have to move the  certificates in the correct dir *

`chmod 777 /etc/ssl/certs/localcerts/server1.example.com.key`
`chmod 777 /etc/ssl/certs/localcerts/server1.example.com.pem`
`chmod 777 /etc/ssl/certs/localcerts`

TODO: change permissions to be less permissive

`roslaunch rosbridge_server rosbridge_websocket.launch ssl:=true port:=9090 certfile:=/etc/ssl/certs/localcerts/server1.example.com.pem keyfile:=/etc/ssl/certs/localcerts/server1.example.com.key`



*in /opt/hector/share* 
`chhmod +x VRRobot/shttps.py` 

then run ./VRRobot/shhtps.py instead of simplehttpserver

#VERY IMPORTANT STEP

if you want to use the self signed certificates. before opening the simulation, you have to visit https://127.0.0.1:9090 and https://127.0.0.1:8080 - to accept the certificates

Also: you have to go to https://127.0.0.1 and not https://localhost:8080 because of the cross origin stuff

I'll clean up the readme later this week, to run the whole environment in one line try:
1. install tmux
2. 

tmux \
        new-session "roscore ; read" \; \
        split-window "sleep 5; rosrun tf2_web_republisher tf2_web_republisher; read" \;\
        split-window "sleep 5; roslaunch rosbridge_server rosbridge_websocket.launch ssl:=true port:=9090 certfile:=/etc/ssl/certs/localcerts/server1.example.com.pem keyfile:=/etc/ssl/certs/localcerts/server1.example.com.key;read" \;\
        split-window "cd /opt/hector/share; python VRRobot/shttps.py; read"\;\
        select-layout even-vertical

3. hector sim or use bagfiles



To record bagfiles:
1. rosbag record /tf /tf_static /joint_states /colored_cloud /map /smooth_path /trajectory /front_rgbd_cam/depth/color/points /colored_cloud_world
2. rosrun rqt_robot_steering rqt_robot_steering // drive around
