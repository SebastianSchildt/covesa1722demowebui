# For embedded world
# this will read target value and publish 
# it to current (as is expected by the CPP controller)

from kuksa_client.grpc import Datapoint
from kuksa_client.grpc import VSSClient


with VSSClient('127.0.0.1', 55555) as client:
    print("Connected to KUKSA")
    for updates in client.subscribe_target_values([
        'Vehicle.ADAS.LaneAssist.TargetSteeringWheelAngle',
    ]):
        if updates['Vehicle.ADAS.LaneAssist.TargetSteeringWheelAngle'] is not None:
            print("Sync")
            client.set_current_values({
                'Vehicle.ADAS.LaneAssist.TargetSteeringWheelAngle': updates['Vehicle.ADAS.LaneAssist.TargetSteeringWheelAngle']})
