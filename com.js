var speedGauge;
var powerGauge;


var SUB_ID_STEERING_CURRENT=0;
var SUB_ID_RIGHT=0;
var SUB_ID_GEAR=0;

var state="INIT";
var inBoost=false;

var wscon = null;

TOKEN="eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJrdWtzYS52YWwiLCJpc3MiOiJFY2xpcHNlIEtVS1NBIERldiIsImFkbWluIjp0cnVlLCJpYXQiOjE1MTYyMzkwMjIsImV4cCI6MTc2NzIyNTU5OSwia3Vrc2EtdnNzIjp7IioiOiJydyJ9fQ.QQcVR0RuRJIoasPXYsMGZhdvhLjUalk4GcRaxhh3-0_j3CtVSZ0lTbv_Z3As5BfIYzaMlwUzFGvCVOq2MXVjRK81XOAZ6wIsyKOxva16zjbZryr2V_m3yZ4twI3CPEzJch11_qnhInirHltej-tGg6ySfLaTYeAkw4xYGwENMBBhN5t9odANpScZP_xx5bNfwdW1so6FkV1WhpKlCywoxk_vYZxo187d89bbiu-xOZUa5D-ycFkd1-1rjPXLGE_g5bc4jcQBvNBc-5FDbvt4aJlTQqjpdeppxhxn_gjkPGIAacYDI7szOLC-WYajTStbksUju1iQCyli11kPx0E66me_ZVwOX07f1lRF6D2brWm1LcMAHM3bQUK0LuyVwWPxld64uSAEsvSKsRyJERc7nZUgLf7COnUrrkxgIUNjukbdT2JVN_I-3l3b4YXg6JVD7Y5g0QYBKgXEFpZrDbBVhzo7PXPAhJD6-c3DcUQyRZExbrnFV56RwWuExphw8lYnbMvxPWImiVmB9nRVgFKD0TYaw1sidPSSlZt8Uw34VZzHWIZQAQY0BMjR33fefg42XQ1YzIwPmDx4GYXLl7HNIIVbsRsibKaJnf49mz2qnLC1K272zXSPljO11Ke1MNnsnKyUH7mcwEs9nhTsnMgEOx_TyMLRYo-VEHBDLuEOiBo"

function setRight(val)  {
    //if (pow == null) 
    //    return 
    //$('#acfVSSG').attr('data-value', pow)
    window.rknob.setValue(val);
    //console.log("New Right is "+val);
}




function setSteeringCurrent(val) {
    //Change the value, so "+" is right and "-" is left
    val=-1*val;
    window.steeringcurrent.setValue(val);
    if (val >0) {
        window.steeringcurrent.setProperty('colorFG', '#0000ff');
    }
    else {
        window.steeringcurrent.setProperty('colorFG', '#ff0000');
    }
    //console.log("New Left is "+val);
}




function initAll() {
    initWebsocket();
}

function statusMessage(msg) {
    console.log(msg);
    $("#messages").html(msg);
}

function keepAlive( ) {
	aliveMSG = { action: "get", path: "Vehicle.VehicleIdentification.VIN", "requestId": "99" }
	if (wscon != null && wscon.readyState == WebSocket.OPEN) {
		wscon.send(JSON.stringify(aliveMSG));
	}
	setTimeout(keepAlive,2000); //we need to regularly send data thorugh ws to detect disconnects


}

function publishTargetAngle(value) {
    var msg = { action: "set", path: "Vehicle.ADAS.LaneAssist.TargetSteeringWheelAngle", value: value, requestId: "5" }
    wscon.send(JSON.stringify(msg));
}

function initWebsocket() {
    host=window.location.hostname
    wscon = new WebSocket("ws://"+host+":8090");

    statusMessage("Waiting for connection...")
    wscon.onopen = function () {
        console.log("Open. Send Auhtorize"); 
        statusMessage("Websocket open. Sending authorization & subsription request...")
        $("#messages").hide();

        //authMsg = { action: "authorize", tokens: TOKEN, requestId: "1" }
        //wscon.send(JSON.stringify(authMsg));

        subMsg = { action: "subscribe", path: "Vehicle.Chassis.SteeringWheel.Angle", "requestId": "2" }
        wscon.send(JSON.stringify(subMsg));

        subMsg = { action: "subscribe", path: "Vehicle.Cabin.RightKnob", "requestId": "3" }
        wscon.send(JSON.stringify(subMsg));
 
        setTimeout(keepAlive,2000); //we need to regularly send data thorugh ws to detect disconnects 

    };
    

    wscon.onerror = function () {
        statusMessage(" Connection error. Reconnecting...")
        $("#messages").show();
        //onclose will be called anyway
        //setTimeout(initWebsocket,500);
    };
    
    wscon.onclose = function () {
        statusMessage("Connction Error. Reconnecting...")
        $("#messages").show();
        setTimeout(initWebsocket,500);
    };

    wscon.onmessage = function (e) {
        jsonobj = JSON.parse(e.data);
        if ( jsonobj.hasOwnProperty("requestId") ) {
            if (jsonobj['requestId'] == 2) {
                SUB_ID_STEERING_CURRENT=jsonobj['subscriptionId'];
                statusMessage("Steeringwheel current subcription succeeded.")
            }
            else if (jsonobj['requestId'] == 3) {
                SUB_ID_RIGHT=jsonobj['subscriptionId'];
                statusMessage("RightKnob subcription succeeded.")
            }
            else if (jsonobj['requestId'] == 4) {
                SUB_ID_GEAR=jsonobj['subscriptionId'];
                statusMessage("Gear subcription succeeded.")
            }
            else if (jsonobj['requestId'] == 5) {
                statusMessage("TargetAngle set succeeded.")
            }
            else if (jsonobj['requestId'] == 99) {
                    return 
			}

        }
        if ( jsonobj.hasOwnProperty("action") ) {
            if (jsonobj['action'] == "subscription" && jsonobj.hasOwnProperty("data") ) {
                parseData(jsonobj);
                statusMessage("Receiving data")
                return;
            }
        }
        console.log("Received control message "+e.data); // Send the message 'Ping' to the server
    };

}

function parseData(js) {
    if ( js.hasOwnProperty("subscriptionId") ) {
        if (js['subscriptionId'] == SUB_ID_STEERING_CURRENT) {
            setSteeringCurrent(js['data']['dp']['value']);
            return;
        }
        else if (js['subscriptionId'] == SUB_ID_RIGHT) {
            setRight(js['data']['dp']['value']);
            return;
        }
        else if (js['subscriptionId'] == SUB_ID_GEAR) {
            setState(js['data']['dp']['value']);
            return;
        }

    }
    console.log("Received unknown data "+js);
}


function initGauges() {

    
    /*
    speedGauge = new RadialGauge({
        renderTo: 'acfcanG',
        width: 300,
        height: 300,
        units: "Km/h",
        minValue: 0,
        maxValue: 220,
	valueDec: 1,
        majorTicks: [
            "0",
            "20",
            "40",
            "60",
            "80",
            "100",
            "120",
            "140",
            "160",
            "180",
            "200",
            "220"
        ],
        minorTicks: 2,
        strokeTicks: true,
        highlights: [
            {
                "from": 160,
                "to": 220,
                "color": "rgba(255, 0, 0, .8)"
            }
        ],
        colorPlate: "#fff",
        borderShadowWidth: 0,
        borders: false,
        needleType: "arrow",
        needleWidth: 2,
        needleCircleSize: 7,
        needleCircleOuter: true,
        needleCircleInner: false,
	animation: false,
        animationDuration: 500,
        animationRule: "linear"
    }).draw();

    */

    

}
