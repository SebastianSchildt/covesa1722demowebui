# Serving the website

This webpage needs to run on the same host as KUKSA databroker. Simplest way wo run a webserver

```
python3 -m http.server
```

App should be reachable under http://127.0.0.1:8000

## Container for webserver

Build container from main directory:

```
 docker build -t webapp -f docker/Dockerfile.web  .
```

or when cross compiling

```
 docker buildx build --platform=linux/arm64 -t webapp -f docker/Dockerfile.web  .
```



Running the container

```
docker run -it --rm --net=host webapp
```

App should be reachable under http://127.0.0.1:8000

## Testing

The application uses two datapoints

 -  `Vehicle.Chassis.SteeringWheel.Angle` can be subscribed. This will be regularly published containing the current Steering Wheel angle
 -  `Vehicle.ADAS.LaneAssist.TargetSteeringWheelAngle` this can be SET to set a target value for the steering angle

As the second VSS point is not standard, the correct model needs to be loaded into databroker. The easiest way to achieve this for teste is using the script in [./databroker/rundatabrokerEW2025.sh](./databroker/rundatabrokerEW2025.sh)

## Using databroker CLI to test

To test function of the mini webapp use databroker-cli on the same computer where you started databroker and the webserver

```
docker run -it --rm --net=host ghcr.io/eclipse-kuksa/kuksa-databroker-cli:0.5 
```

to set the steering angle, do 

```
kuksa.val.v1 > publish Vehicle.Chassis.SteeringWheel.Angle 42
[publish]  OK  
kuksa.val.v1 > 
```

Expectation: The gauge on the web app should show steering angle.

To check that the target steering angle is correctly received, when moving the slider do

set it manually

```
uksa.val.v1 > actuate Vehicle.ADAS.LaneAssist.TargetSteeringWheelAngle 22
[actuate]  OK  
kuksa.val.v1 > gettarget Vehicle.ADAS.LaneAssist.TargetSteeringWheelAngle
[gettarget]  OK  
Vehicle.ADAS.LaneAssist.TargetSteeringWheelAngle: 22 
```

Expectation: NOTHING happens in webapp

Move slider

do gettarget again

```
kuksa.val.v1 > gettarget Vehicle.ADAS.LaneAssist.TargetSteeringWheelAngle
[gettarget]  OK  
Vehicle.ADAS.LaneAssist.TargetSteeringWheelAngle: 360 
```

Expectation: Target moved to whatever you set in the WebUI
