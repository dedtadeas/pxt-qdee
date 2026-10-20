/**
 * Joystick:bit remote control for the Qdee (and any robot that speaks the same radio messages).
 *
 * On the Joystick:bit:   "start Joystick:bit remote"
 * On the robot:          "drive Qdee with the remote" + "on remote button ... pressed"
 *
 * Radio messages (same as the robotics-club Cutebot programs):
 *   value "go"   -100..100  forward / backward, sent 20 times a second
 *   value "turn"  -60..60   left / right
 *   string "color"  left star button  (C, P12)
 *   string "horn"   top star button   (D, P13)
 *   string "lights" bottom star button (E, P14)
 *   right star button (F, P15) switches tilt steering on the remote itself
 *   string "bump"   robot -> remote: the remote vibrates
 */
enum QdeeRemoteButton {
    //% block="left"
    Left = 0,
    //% block="top"
    Top = 1,
    //% block="bottom"
    Bottom = 2
}

//% weight=90 color=#0fbc11 icon="" block="Qdee remote"
//% groups='["Joystick:bit", "Robot"]'
namespace qdeeRemote {
    let tiltMode = false
    let remoteGoSpeed = 0
    let remoteTurnSpeed = 0
    let lastHeard = 0
    let robotStarted = false
    let remoteStarted = false
    const MESSAGES = ["color", "horn", "lights"]
    const BUTTON_EVENT = 0x7A00

    function buttonName(pin: DigitalPin): string {
        if (pin == DigitalPin.P12) return "color"
        if (pin == DigitalPin.P13) return "horn"
        return "lights"
    }

    function onStarButton(pin: DigitalPin) {
        pins.onPulsed(pin, PulseValue.High, function () {
            radio.sendString(buttonName(pin))
        })
    }

    function showRemotePicture() {
        if (tiltMode) {
            basic.showIcon(IconNames.Diamond)
        } else {
            basic.showLeds(`
                . . # . .
                . . # . .
                . . # . .
                # # # # #
                # # # # #
                `)
        }
    }

    /**
     * Run this on the micro:bit inside the Joystick:bit. It sends the stick and the
     * star buttons to the robot by radio. Right star button = tilt steering on / off.
     * @param channel radio channel, the robot must use the same one, eg: 42
     */
    //% blockId=qdee_remote_start block="start Joystick:bit remote on channel %channel"
    //% group="Joystick:bit" weight=100
    //% channel.min=0 channel.max=255
    export function startJoystickRemote(channel: number = 42): void {
        if (remoteStarted) return
        remoteStarted = true
        radio.setGroup(channel)
        // Same start-up as the Joystick:bit extension: buzzer off, buttons pulled up, vibration off.
        pins.digitalWritePin(DigitalPin.P0, 0)
        pins.setPull(DigitalPin.P12, PinPullMode.PullUp)
        pins.setPull(DigitalPin.P13, PinPullMode.PullUp)
        pins.setPull(DigitalPin.P14, PinPullMode.PullUp)
        pins.setPull(DigitalPin.P15, PinPullMode.PullUp)
        pins.digitalWritePin(DigitalPin.P16, 1)
        onStarButton(DigitalPin.P12)
        onStarButton(DigitalPin.P13)
        onStarButton(DigitalPin.P14)
        pins.onPulsed(DigitalPin.P15, PulseValue.High, function () {
            tiltMode = !tiltMode
            showRemotePicture()
        })
        radio.onReceivedString(function (message) {
            if (message == "bump") {
                basic.showIcon(IconNames.No)
                pins.digitalWritePin(DigitalPin.P16, 0)
                basic.pause(400)
                pins.digitalWritePin(DigitalPin.P16, 1)
                showRemotePicture()
            }
        })
        showRemotePicture()
        control.inBackground(function () {
            while (true) {
                let go = 0
                let turn = 0
                if (tiltMode) {
                    go = Math.map(input.acceleration(Dimension.Y), -700, 700, 100, -100)
                    turn = Math.map(input.acceleration(Dimension.X), -700, 700, -60, 60)
                } else {
                    go = Math.map(pins.analogReadPin(AnalogPin.P2), 0, 1023, -100, 100)
                    turn = Math.map(pins.analogReadPin(AnalogPin.P1), 0, 1023, -60, 60)
                }
                if (Math.abs(go) < 15) go = 0
                if (Math.abs(turn) < 10) turn = 0
                radio.sendValue("go", Math.round(Math.constrain(go, -100, 100)))
                radio.sendValue("turn", Math.round(Math.constrain(turn, -60, 60)))
                basic.pause(50)
            }
        })
    }

    // Registers the radio handlers once. The channel is set by "drive Qdee with the remote".
    function startListening() {
        if (robotStarted) return
        robotStarted = true
        radio.onReceivedValue(function (name, value) {
            if (name == "go") {
                remoteGoSpeed = value
                lastHeard = input.runningTime()
            } else if (name == "turn") {
                remoteTurnSpeed = value
            }
        })
        radio.onReceivedString(function (message) {
            for (let i = 0; i < MESSAGES.length; i++) {
                if (message == MESSAGES[i]) {
                    control.raiseEvent(BUTTON_EVENT, i + 1)
                }
            }
        })
    }

    /**
     * Run this on the Qdee. It drives with the Joystick:bit stick and stops by itself
     * when the remote is switched off or out of range. Put "Initialize Qdee" before it.
     * @param channel radio channel, the same as the remote, eg: 42
     */
    //% blockId=qdee_remote_drive block="drive Qdee with the remote on channel %channel"
    //% group="Robot" weight=90
    //% channel.min=0 channel.max=255
    export function driveWithRemote(channel: number = 42): void {
        radio.setGroup(channel)
        startListening()
        control.inBackground(function () {
            while (true) {
                if (input.runningTime() - lastHeard > 500) {
                    qdee.qdee_setMotorSpeed(0, 0)
                } else {
                    // Left and right tracks: turning slows one side and speeds up the other.
                    let left = Math.constrain(remoteGoSpeed - remoteTurnSpeed, -100, 100)
                    let right = Math.constrain(remoteGoSpeed + remoteTurnSpeed, -100, 100)
                    qdee.qdee_setMotorSpeed(left, right)
                }
                basic.pause(100)
            }
        })
    }

    /**
     * Do something on the robot when a star button on the remote is pressed.
     * Use it together with "drive Qdee with the remote", which sets the radio channel.
     * @param button which star button
     * @param handler what to do
     */
    //% blockId=qdee_remote_on_button block="on remote button %button pressed"
    //% group="Robot" weight=80
    export function onRemoteButton(button: QdeeRemoteButton, handler: () => void): void {
        startListening()
        control.onEvent(BUTTON_EVENT, button + 1, handler)
    }

    /**
     * Tell the remote that something is in the way: it vibrates and shows an X.
     */
    //% blockId=qdee_remote_bump block="make the remote vibrate"
    //% group="Robot" weight=70
    export function vibrateRemote(): void {
        radio.sendString("bump")
    }
}
