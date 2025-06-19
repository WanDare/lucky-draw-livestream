import Phaser from "phaser";
import type { PrizeInfo } from "../model/lucky_draw_model";
import { launchConfetti } from "../effects/confetti";

function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");

  if (digits.length < 11) return phone;

  const prefix = digits.slice(0, 5); // e.g., "85596"
  const hidden = "XXXXXX";
  const suffix = digits.slice(-2); // e.g., "45"

  return `${prefix}${hidden}${suffix}`;
}

export class PopupComponent {
  static showCongrat(
    scene: Phaser.Scene,
    prize: PrizeInfo,
    onClose?: () => void
  ) {
    const { width, height } = scene.scale;

    const overlay = scene.add
      .rectangle(width / 2, height / 2, width, height, 0x000000, 0.48)
      .setDepth(300)
      .setAlpha(0);

    const popup = scene.add
      .image(width / 2, height / 2, "Congrat")
      .setOrigin(0.5)
      .setDisplaySize(width, height)
      .setDepth(2000)
      .setAlpha(0);

    const nameFontSize = Math.max(18);
    const phoneFontSize = Math.max(28);

    const nameText = scene.add
      .text(width / 2 + 50, height * 0.525, prize.name.toUpperCase(), {
        font: `${nameFontSize}px Arial`,
        color: "#538B3C",
        align: "center",
        fontStyle: "normal",
        letterSpacing: -0.32,
      })
      .setOrigin(0.5)
      .setDepth(2001)
      .setAlpha(0);

    const phoneText = scene.add
      .text(
        width / 2 + 50,
        height * 0.555,
        maskPhone(prize.phone.toUpperCase()),
        {
          font: `bold ${phoneFontSize}px Arial`,
          color: "#538B3C",
          align: "center",
          letterSpacing: -0.48,
        }
      )
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

  static showTextOverlay(
    scene: Phaser.Scene,
    mainText: string,
    color: string,
    onDone?: () => void,
    withConfetti?: boolean
  ) {
    const { width, height } = scene.scale;
    const overlay = scene.add
      .rectangle(width / 2, height / 2, width, height, 0x000000, 0.7)
      .setDepth(250)
      .setAlpha(0);

    const mainFontSize = Math.max(32, height * 0.053);

    const text = scene.add
      .text(width / 2, height / 2, mainText, {
        font: `bold ${mainFontSize}px Arial`,
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
          launchConfetti(scene, { x: width / 2, y: height / 2, amount: 70 });
          scene.time.delayedCall(600, () => {
            launchConfetti(scene, {
              x: width / 2,
              y: height / 2 - height * 0.1,
              amount: 48,
            });
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

  static showConfirm(
    scene: Phaser.Scene,
    message: string,
    confirmText: string,
    cancelText: string,
    onConfirm: () => void,
    onCancel: () => void
  ) {
    const { width, height } = scene.scale;

    const overlay = scene.add
      .rectangle(width / 2, height / 2, width, height, 0x000000, 0.5)
      .setDepth(900);

    const panel = scene.add
      .image(width / 2, height / 2, "Pause")
      .setOrigin(0.5)
      .setScale(1)
      .setDisplaySize(width * 0.4, height * 0.25)
      .setDepth(901);

    const text = scene.add
      .text(width / 2, height / 2 - 40, message, {
        font: `bold ${Math.max(24, height * 0.03)}px Arial`,
        color: "#ffffff",
        align: "center",
        wordWrap: { width: width * 0.5 },
      })
      .setOrigin(0.5)
      .setDepth(902);

    const buttonWidth = 128;
    const buttonHeight = 48;

    const createButton = (
      x: number,
      y: number,
      bgColor: number,
      label: string,
      onClick: () => void
    ) => {
      const bg = scene.add.graphics();
      bg.fillStyle(bgColor, 1);
      bg.fillRoundedRect(
        -buttonWidth / 2,
        -buttonHeight / 2,
        buttonWidth,
        buttonHeight,
        12
      );

      const btnText = scene.add
        .text(0, 0, label, {
          font: "20px Arial",
          color: "#ffffff",
          align: "center",
        })
        .setOrigin(0.5);

      const hitZone = scene.add
        .zone(0, 0, buttonWidth, buttonHeight)
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });

      const container = scene.add
        .container(x, y, [bg, btnText, hitZone])
        .setDepth(902);

      hitZone.on("pointerdown", () => {
        destroyAll();
        onClick();
      });

      return container;
    };

    const yesButton = createButton(
      width / 2 - 100,
      height / 2 + 40,
      0x00aa66,
      confirmText,
      onConfirm
    );

    const noButton = createButton(
      width / 2 + 100,
      height / 2 + 40,
      0xaa0000,
      cancelText,
      onCancel
    );

    const destroyAll = () => {
      overlay.destroy();
      panel.destroy();
      text.destroy();
      yesButton.destroy();
      noButton.destroy();
    };
  }
}
