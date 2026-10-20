# Qdee blocks for MakeCode

MakeCode blocks for the **Hiwonder Qdee** micro:bit robot: motors, servos, ultrasonic sensor,
line follower, lights, IR remote, buttons, knob and more.

Made for a children's robotics club. It starts from Hiwonder's own Qdee extension and fixes the
problems we ran into, so everything here has been built and checked in current MakeCode.

## Add it to a MakeCode project

1. Open https://makecode.microbit.org and your project.
2. Click **Extensions** (or ⚙️ → **Extensions**).
3. Paste `https://github.com/dedtadeas/pxt-qdee` into the search box and press Enter.
4. Click **qdee**. A **Qdee** category appears in the block list.

Always put **Initialize Qdee** in **on start**. Without it, the Qdee board ignores every command.

## Remote control with the Joystick:bit

The **Qdee remote** category has blocks for both micro:bits:

**On the micro:bit in the Joystick:bit**: one block in **on start**:

```blocks
qdeeRemote.startJoystickRemote(42)
```

Stick = drive. Right star button = tilt steering on / off (a diamond shows on the screen).
The left, top and bottom star buttons are sent to the robot.

**On the micro:bit in the Qdee**:

```blocks
qdee.qdee_Init()
qdeeRemote.driveWithRemote(42)
qdeeRemote.onRemoteButton(QdeeRemoteButton.Top, function () {
    qdee.qdee_servo(1, 40, 500)
})
```

- The robot **stops by itself** when the remote is switched off or out of range.
- Both micro:bits must use the **same channel** (42 above). Every robot on that channel listens,
  so switch off the robots you aren't using, or give each pair its own channel.
- **make the remote vibrate** buzzes the Joystick:bit, for example when the ultrasonic sensor sees a wall.
- The remote speaks the same radio messages as the robotics-club Cutebot programs, so one Joystick:bit
  can drive either robot.

## Czech blocks / Bloky česky

Set MakeCode to Czech (⚙️ → **Language** → **Čeština**) and the Qdee blocks appear in Czech,
for example **spusť Qdee** and **otoč servo 1 na úhel 40 za 500 ms**. Port names stay as printed on the board.

## Servos

The Qdee's servos don't plug into the board directly:

```
Qdee board  Port 10  ──5-pin cable──  Hiwonder Servo Driver  ──3-pin cables──  servo 1, servo 2
```

- Use the block **move servo 1 to angle 40 in 500 ms**. `0` is the middle, the range is −120 to 120.
- **Port 10** is the servo port. Port 1 to 9 are for sensors (Port 1 is the ultrasonic sensor's default).
- **Every servo has a number.** New servos often all have the same number, so they all move
  together. To give a servo its own number, connect **only that servo** and run
  **Set bus servo number 1** once.
- A servo with a **blinking light** has switched itself off to protect itself: it's blocked, too hot,
  or getting the wrong voltage. Switch off, check that it can move freely, and try again.

## Old micro:bit (V1) inside the Qdee

- **Shake** and other accelerometer blocks crash the V1 with **error 050** inside the Qdee.
  Use buttons instead, or a micro:bit V2.
- The V1 has little memory. This version fixes a leak in the original extension that made the
  V1 crash with **error 020** after a while.

## If nothing moves

1. Is the micro:bit pushed **all the way** into the Qdee's slot? A loose micro:bit can still light up
   on USB, but the board can't hear it.
2. Are the batteries in the **right way round**? One reversed AA battery heats up the whole pack.
   Check every battery against the + and − marks. Don't use lithium "AA size" cells (14500).
3. Is the Qdee switched **ON**? Motors and servos only get power from the batteries, not from USB.

## Changes compared to Hiwonder's versions

Based on the most complete Hiwonder version ([pygoubet/Qdee](https://github.com/pygoubet/Qdee), 2019),
with parts of [LewanSoul2018/Qdee](https://github.com/LewanSoul2018/Qdee) (2021):

- Fixed a compile error (`qdee_setLineFollowerBlackThreshold`) that stopped the extension from loading.
- Fixed a memory leak in the serial message handler and stopped it from throwing away messages.
- New simple servo block: **move servo … to angle … in … ms**.
- Added from the 2021 version: **on remote-control … long pressed**, **on remote-control stop send**,
  **Set port HIGH/LOW**.
- New **Qdee remote** blocks for the Joystick:bit (radio).
- Czech translation of all blocks.
- [LOBOT-ROBOT/Qdee](https://github.com/LOBOT-ROBOT/Qdee) can't be used any more: it depends on
  repositories that were deleted.

## License

MIT. Original code © 2018 LewanSoul2018 (Hiwonder), see [LICENSE](LICENSE).
