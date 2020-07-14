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

