import Phaser from "phaser";

export class CurtainComponent {
  static close(
    scene: Phaser.Scene,
    curtainLeft: Phaser.GameObjects.Image,
    curtainRight: Phaser.GameObjects.Image,
    onDone?: () => void
  ) {
    curtainLeft.setX(0).setVisible(true).setAlpha(1).setDepth(7);
    curtainRight.setX(720).setVisible(true).setAlpha(1).setDepth(7);
    scene.tweens.add({
      targets: curtainLeft,
      x: 360,
      duration: 1500,
      ease: "Cubic.easeInOut",
    });
    scene.tweens.add({
      targets: curtainRight,
      x: 310,
      duration: 1500,
      ease: "Cubic.easeInOut",
      onComplete: () => {
        if (onDone) onDone();
      },
    });
  }

  static open(
    scene: Phaser.Scene,
    curtainLeft: Phaser.GameObjects.Image,
    curtainRight: Phaser.GameObjects.Image,
    onDone?: () => void
  ) {
    curtainLeft.setX(360).setVisible(true).setAlpha(1).setDepth(7);
    curtainRight.setX(310).setVisible(true).setAlpha(1).setDepth(7);

    let finished = 0;
    function finish() {
      finished += 1;
      if (finished === 2) {
        curtainLeft.setVisible(false);
        curtainRight.setVisible(false);
        if (onDone) onDone();
      }
    }

    scene.tweens.add({
      targets: curtainLeft,
      x: 0,
      duration: 4000,
      ease: "Cubic.easeInOut",
      onComplete: finish,
    });
    scene.tweens.add({
      targets: curtainRight,
      x: 720,
      duration: 4000,
      ease: "Cubic.easeInOut",
      onComplete: finish,
    });
  }
}
