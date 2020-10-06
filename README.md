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
*first we have to move the launch file in the correct dir*

`roslaunch rosbridge_server er_rosbridge_websocket.launch  port:=9090 certfile:=/etc/ssl/certs/localcerts/server1.example.com.pem keyfile:=/etc/ssl/certs/localcerts/server1.example.com.key`

`chhmod +x shttps.py` 

./shhtps.py instead of simplehttpserver

#VERY IMPORTANT STEP

if you want to use the self signed certificates. before opening the simulation, you have to visit https://127.0.0.1:9090 and https://127.0.0.1:8080 - to accept the certificates

Also: you have to go to https://127.0.0.1 and not https://localhost:8080 because of the cross origin stuff
