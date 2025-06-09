export function launchConfetti(
  scene: Phaser.Scene,
  opts?: { x?: number; y?: number; amount?: number }
) {
  const centerX = opts?.x ?? 720;
  const centerY = opts?.y ?? 512;
  const amount = opts?.amount ?? 64;
  const colors = [
    0xffeb3b, 0xe91e63, 0x4caf50, 0x03a9f4, 0xff9800, 0x9c27b0, 0xffffff,
  ];

  for (let i = 0; i < amount; i++) {
    const angle = Phaser.Math.FloatBetween(-120, -60);
    const speed = Phaser.Math.Between(400, 900);
    const vx = Math.cos(Phaser.Math.DegToRad(angle)) * speed;
    const vy = Math.sin(Phaser.Math.DegToRad(angle)) * speed;

    const color = colors[Phaser.Math.Between(0, colors.length - 1)];
    const size = Phaser.Math.Between(12, 22);

    const confetti = scene.add
      .rectangle(centerX, centerY, size, size / 3, color)
      .setRotation(Phaser.Math.FloatBetween(0, Math.PI * 2))
      .setAlpha(0.85)
      .setDepth(999);

    scene.tweens.add({
      targets: confetti,
      x: centerX + vx * 1.2,
      y: centerY + vy * 1.0 + Phaser.Math.Between(200, 420),
      angle: Phaser.Math.Between(0, 360),
      rotation: Phaser.Math.FloatBetween(0, Math.PI * 4),
      alpha: 0.25,
      scaleX: Phaser.Math.FloatBetween(0.7, 1.3),
      scaleY: Phaser.Math.FloatBetween(0.6, 1.5),
      duration: Phaser.Math.Between(900, 1500),
      ease: "Cubic.easeOut",
      onComplete: () => confetti.destroy(),
    });
  }
}
