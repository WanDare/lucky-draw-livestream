import Phaser from "phaser";
import LoadingScene from "./scenes/LoadingScene";
import LuckyDrawScene from "./scenes/LuckyDrawScene";

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 1440,
  height: 1024,
  backgroundColor: "#538b3c",
  scene: [LuckyDrawScene],
  parent: "game",
};

new Phaser.Game(config);
