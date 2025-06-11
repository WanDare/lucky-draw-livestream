import Phaser from "phaser";
import type { PrizeInfo } from "../model/lucky_draw_model";
import { launchConfetti } from "../effects/confetti";

export class PopupComponent {
  static showCongrat(
    scene: Phaser.Scene,
    prize: PrizeInfo,
    onClose?: () => void
  ) {
    const { width, height } = scene.scale;

    const overlay = scene.add
      .rectangle(360, 512, 720, 1024, 0x000000, 0.48)
      .setDepth(300)
      .setAlpha(0);

    const popup = scene.add
      .image(width / 2, height / 2, "Congrat")
      .setOrigin(0.5)
      .setDisplaySize(width, height)
      .setDepth(2000)
      .setAlpha(0);

    const nameText = scene.add
      .text(width / 2 + 40, height - 520, prize.name, {
        font: "bold 16px Arial",
        color: "#538B3C",
        align: "center",
      })
      .setOrigin(0.5)
      .setDepth(2001)
      .setAlpha(0);

    const phoneText = scene.add
      .text(width / 2 + 40, height - 490, prize.phone, {
        font: "bold 24px Arial",
        color: "#538B3C",
        align: "center",
      })
      .setOrigin(0.5)
      .setDepth(2001)
      .setAlpha(0);

    scene.tweens.add({
      targets: [overlay, popup, nameText, phoneText],
      alpha: 1,
      duration: 300,
      ease: "Quad.easeOut",
      onComplete: () => {
        let closed = false;
        const closePopup = () => {
          if (closed) return;
          closed = true;
          scene.tweens.add({
            targets: [overlay, popup, nameText, phoneText],
            alpha: 0,
            duration: 350,
            onComplete: () => {
              overlay.destroy();
              popup.destroy();
              nameText.destroy();
              phoneText.destroy();
              if (onClose) onClose();
            },
          });
        };
        overlay.setInteractive({ useHandCursor: true });
        popup.setInteractive({ useHandCursor: true });
        overlay.once("pointerdown", closePopup);
        popup.once("pointerdown", closePopup);
        scene.time.delayedCall(3000, closePopup);
      },
    });
  }

  // Stage or Game Complete overlay
  static showTextOverlay(
    scene: Phaser.Scene,
    mainText: string,
    color: string,
    onDone?: () => void,
    withConfetti?: boolean
  ) {
    const overlay = scene.add
      .rectangle(720, 512, 1440, 1024, 0x000000, 0.7)
      .setDepth(250)
      .setAlpha(0);

    const text = scene.add
      .text(720, 512, mainText, {
        font: "bold 54px Arial",
        color,
        align: "center",
      })
      .setOrigin(0.5)
      .setDepth(251)
      .setAlpha(0);

    scene.tweens.add({
      targets: [overlay, text],
      alpha: 1,
      duration: 350,
      ease: "Quad.easeIn",
      onComplete: () => {
        if (withConfetti) {
          launchConfetti(scene, { x: 720, y: 512, amount: 70 });
          scene.time.delayedCall(600, () => {
            launchConfetti(scene, { x: 720, y: 412, amount: 48 });
          });
        }
        scene.time.delayedCall(1000, () => {
          scene.tweens.add({
            targets: [overlay, text],
            alpha: 0,
            duration: 350,
            onComplete: () => {
              overlay.destroy();
              text.destroy();
              if (onDone) onDone();
            },
          });
        });
      },
    });
  }
}
