import Phaser from "phaser";
import type { PrizeInfo } from "../model/lucky_draw_model";

function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 11) return phone;

  const country = digits.slice(0, 3);
  const operator = digits.slice(3, 5);
  const suffix = digits.slice(-2);

  return `${country} ${operator}XXXXXX${suffix}`;
}

function isKhmer(text: string): boolean {
  return /[\u1780-\u17FF]/.test(text);
}

function truncateText(text: string, maxLength: number): string {
  return text.length > maxLength ? text.slice(0, maxLength - 3) + "..." : text;
}

export class PrizeCardComponent {
  static create(
    scene: Phaser.Scene,
    x: number,
    y: number,
    prize: PrizeInfo,
    width = 209,
    height = 65
  ): Phaser.GameObjects.Container {
    const paddingX = 12;
    const paddingY = 8;

    const nameFontSize = 14;
    const phoneFontSize = 18;

    const cardBg = scene.add
      .image(0, 0, "card_bg")
      .setDisplaySize(width, height)
      .setOrigin(0.5);

    const isKhmerName = isKhmer(prize.name);
    const nameFont = isKhmerName ? "Kantumruy Pro" : "Poppins";
    let displayName = isKhmerName ? prize.name : prize.name.toUpperCase();
    displayName = truncateText(displayName, 18);

    const nameText = scene.add
      .text(0, 0, displayName, {
        font: `${nameFontSize}px ${nameFont}`,
        color: "#ffffff",
        align: "center",
        fontStyle: "400",
        wordWrap: { width: width - 2 * paddingX, useAdvancedWrap: true },
      })
      .setOrigin(0.5, 0);

    const phoneText = scene.add
      .text(0, 0, maskPhone(prize.phone), {
        font: `${phoneFontSize}px Poppins`,
        color: "#ffffff",
        align: "center",
        fontStyle: "600",
        letterSpacing: -0.4,
        wordWrap: { width: width - 2 * paddingX, useAdvancedWrap: true },
      })
      .setOrigin(0.5, 0);

    const totalTextHeight = nameText.height + paddingY + phoneText.height;

    nameText.y = -totalTextHeight / 2;
    phoneText.y = nameText.y + nameText.height + paddingY;

    const container = scene.add.container(x, y, [cardBg, nameText, phoneText]);
    container.setDepth(22);

    container.setScale(0.7).setAlpha(0);
    scene.tweens.add({
      targets: container,
      alpha: 1,
      scale: 1,
      duration: 200,
      ease: "Back.Out",
    });

    return container;
  }
}
