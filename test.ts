// Compile check for the main blocks (not included when used as an extension).
qdee.qdee_Init()
qdee.qdee_servo(1, 40, 500)
qdee.qdee_setBusServoNum(1)
qdee.qdee_setMotorSpeed(50, 50)
let distance = qdee.qdee_ultrasonic(qdee.ultrasonicPort.port1)
qdee.qdee_setLineFollowerBlackThreshold(100)
qdee.onQdee_remote_ir_longpressed(qdee.IRKEY.R2, function () {
    qdee.qdee_setMotorSpeed(0, 0)
})
qdee.onQdee_remote_no_ir(function () {
    qdee.qdee_setMotorSpeed(0, 0)
})
qdee.controlIODigital(qdee.statusPort.High)
