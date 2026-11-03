# The Robots

The game has three robots: Pam, Dan, and Pen. They float beside the game
introduction and can be clicked or dragged. Their appearance and animations are
defined in `styles.css`, their markup is in `index.html`, and their interactions
are handled in `prime.js`.

## Pam

- **Face:** Shares a random prime-number fun fact in the speech bubble.
- **Antenna:** Makes Pam dodge briefly, then hide behind Dan for 10 seconds.
  The countdown starts once she reaches her hiding position. Pam follows Dan
  while approaching, hiding, and revealing, even if Dan moves. She then returns
  to her original position before the follow ends. During the reveal, she moves
  aside to leave a small gap between her and Dan. Her heart breaks until she
  returns to her original position.
- **Body:** Makes Pam dodge.
- While Pen is permanently angry, Pam stays home until her body is clicked.
  Clicking her makes only her chase Pen quickly. She returns to her original
  position once Dan has also caught up with Pen.
- **Appearance:** Pink, with a heart on her body.

## Dan

- **Face:** Shares one random educational message from a set of 50. Messages
  cover prime numbers, electrical circuits, calculation shortcuts, and
  mathematical and electrical formulas. Dan avoids repeating the previous
  message on consecutive clicks.
- **Body:** Makes Dan dodge half as far as the other robots. His eyebrows rise
  and his mouth becomes a flat line for four seconds.
- Ten consecutive body clicks within a five-second inactivity window make Dan
  avoid the cursor for 20 seconds. He tracks cursor speed and direction, gliding
  away with acceleration and deceleration while staying within the viewport,
  then returns to his layout position. If the cursor gets very close, Dan
  makes a brief high-speed escape burst before resuming adaptive movement.
  The avoidance period and click-counter reset are timed independently.
- While Pen is permanently angry, Dan stays home until his body is clicked.
  Clicking him makes only him chase Pen quickly; this takes priority over cursor
  avoidance and does not count toward the body-click sequence. He returns to his
  original position after Pam also reaches Pen.
- **Appearance:** Blue, with a small triangle on his body.

## Pen

- **Face:** Shares a random prime-number fun fact, like Pam.
- **Body:** Scoots a few pixels and briefly closes his eyes with an annoyed
  mouth. Every two consecutive clicks add a 💢 symbol; after ten clicks he
  enters a red-faced rage that remains until both Pam and Dan reach him to
  calm him. The rage smoke and animation are temporary; Pen remains red until
  the two-robot calming sequence completes. Five seconds without a click
  clears irritation before maximum rage.
- **When Pam's antenna is clicked:** Says one of two warning phrases in the
  speech bubble. His eyes close and his mouth becomes a flat line for five
  seconds.
- **Appearance:** Dark-colored, with a star on his body.

## Shared behavior

- Messages use the same speech bubble, and a new message replaces the current
  one. Face facts stay visible for eight seconds; Pen's antenna warning stays
  visible for five.
- Clicking a robot's body triggers its reaction. Dragging a robot also works
  and triggers its movement and expression animations.
- All three robots float when idle. Their animations pause during hiding,
  returning, and dragging as needed for those movements.
- Each robot's face and body actions are separate buttons and keyboard
  accessible.

## Dan drag, Pen chase and capture

- Dan can be dragged (mouse, touch or pen). She gets a mischievous face, a wiggle and a taunt. Dragging is disabled while Pen is raging, because clicking Dan then activates her calming pursuit.
- Pen turns annoyed (angry brows, frown, a 💢) and chases Dan's actual position, accelerating the longer the chase lasts. This is separate from the 10-click rage: no `.is-raging`, no `.is-permanently-angry`, no red styling, no cursor pursuit.
- If Pen gets within reach while the user is still holding Dan, the drag is ended forcibly, Pen escorts Dan back to her home position, then walks to his own home and both return to normal.
- If the user lets go first, Pen stops at once, gloats, and walks home. Dan stays where she was dropped.

## Pam drag rescue

- When the user drags Pam, Pen (once per drag) complains and tells Dan to fetch her. Dan rushes over and hangs onto Pam, following her live position. She never takes Pam out of the user's grip.
- Release within 5 seconds: Dan stops holding and waits for Pam's head-shake to finish, then escorts her to her original position, then returns to her own.
- Hold for more than 5 seconds: Pen becomes furious (separate from his rage system) and walks toward Pam and Dan, tracking them live. The user keeps control until Pen reaches Pam; then Pen forcibly ends the grip (even if the button or finger is still down), Pam does her usual dizzy and head-shake, and Dan and Pen escort her home. If the user lets go first, the same wait-then-escort sequence plays.
- Pam's drag is unchanged, and the sequence is skipped if Pen or Dan are busy with another mechanic (rage, calming, cursor avoidance, Dan being dragged).

