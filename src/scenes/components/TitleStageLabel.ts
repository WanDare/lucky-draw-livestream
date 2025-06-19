import Phaser from "phaser";

export interface TitlePart {
  text: string;
  fontSize?: number;
  fontFamily?: string;
  fontStyle?: string; // "bold", "italic", "bold italic", or "normal"
  gradientColors?: string[];
  stroke?: string;
  strokeThickness?: number;
  shadow?: Phaser.Types.GameObjects.Text.TextShadow;
}

export interface TitleStageLabelOptions {
  subtitleStyle?: Phaser.Types.GameObjects.Text.TextStyle;
  spacing?: number;
  depth?: number;
  titleFontSize?: number;
  subtitleFontSize?: number;
  gradientColors?: string[];
  width?: number;
}

/**
 * Create a canvas texture with a linear gradient.
 */
function createGradientTexture(
  scene: Phaser.Scene,
  key: string,
  width: number,
  height: number,
  gradientColors: string[]
): Phaser.Textures.CanvasTexture {
  const texture = scene.textures.createCanvas(key, width, height);
  if (!texture) {
    throw new Error("Failed to create canvas texture.");
  }
  const ctx = texture.getContext();
  const gradient = ctx.createLinearGradient(0, 0, width, 0);

  if (gradientColors.length > 1) {
    gradient.addColorStop(0, gradientColors[0]);
    gradient.addColorStop(0.5, gradientColors[1]);
    if (gradientColors.length > 2) {
      gradient.addColorStop(1, gradientColors[2]);
    }
  } else if (gradientColors.length === 1) {
    gradient.addColorStop(0, gradientColors[0]);
    gradient.addColorStop(1, gradientColors[0]);
  }

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  texture.refresh();
  return texture;
}

/**
 * Render a single line of gradient-filled text as a Phaser container.
 * Supports shadow, stroke, and other style props.
 */
export function createGradientText(
  scene: Phaser.Scene,
  x: number,
  y: number,
  text: string,
  fontSize: number,
  width: number,
  fontFamily: string,
  fontStyle: string,
  gradientColors: string[],
  style: Partial<Phaser.Types.GameObjects.Text.TextStyle> = {},
  lineSpacing: number = 8
): Phaser.GameObjects.Container {
  const maskText = scene.add
    .text(0, 0, text.toUpperCase(), {
      fontFamily,
      fontSize: `${fontSize}px`,
      fontStyle,
      align: "center",
      color: "#fff",
      lineSpacing,
      wordWrap: { width, useAdvancedWrap: true },
      ...style, // Allow stroke, shadow, etc
    })
    .setOrigin(0.5, 0.5);

  const key = `gradient-${Phaser.Math.RND.uuid()}`;
  createGradientTexture(scene, key, width, maskText.height, gradientColors);

  const gradientImg = scene.add.image(0, 0, key).setOrigin(0.5, 0.5);
  gradientImg.setMask(maskText.createBitmapMask());

  const container = scene.add.container(x, y, [gradientImg, maskText]);
  container.setSize(width, maskText.height);

  container.on("destroy", () => {
    if (scene.textures.exists(key)) {
      scene.textures.remove(key);
    }
  });

  return container;
}

export function createTitleStageLabel(
  scene: Phaser.Scene,
  x: number,
  y: number,
  title: string | TitlePart[],
  subtitles: string[],
  options: TitleStageLabelOptions = {}
): Phaser.GameObjects.Container {
  const {
    spacing = 10,
    depth = 1502,
    titleFontSize = 34,
    subtitleFontSize = 24,
    gradientColors = ["#FFF7D5", "#FFFFFF", "#FDF5DB"],
    width = 380,
    subtitleStyle = {
      fontFamily: "Kantumruy Pro",
      fontSize: `${subtitleFontSize}px`,
      fontStyle: "normal",
      align: "center",
      color: "#FFFFFF",
      stroke: "#765934",
      strokeThickness: 2,
      shadow: {
        offsetX: 1,
        offsetY: 2,
        color: "#765934",
        blur: 0,
        stroke: true,
        fill: true,
      },
      lineSpacing: 7,
    },
  } = options;

  // Prepare title parts (multi-style)
  let titleParts: TitlePart[];
  if (typeof title === "string") {
    titleParts = [
      {
        text: title,
        fontSize: titleFontSize,
        fontFamily: "Kantumruy Pro",
        fontStyle: "bold",
        gradientColors,
        stroke: "#765934",
        strokeThickness: 2,
        shadow: {
          offsetX: 1,
          offsetY: 2,
          color: "#765934",
          blur: 0,
          stroke: true,
          fill: true,
        },
      },
    ];
  } else {
    titleParts = title.map((p) => ({
      fontFamily: p.fontFamily || "Kantumruy Pro",
      fontSize: p.fontSize || titleFontSize,
      fontStyle: p.fontStyle || "normal",
      gradientColors: p.gradientColors || gradientColors,
      stroke: p.stroke ?? "#765934",
      strokeThickness: p.strokeThickness ?? 2,
      shadow: p.shadow ?? {
        offsetX: 1,
        offsetY: 2,
        color: "#765934",
        blur: 0,
        stroke: true,
        fill: true,
      },
      ...p,
    }));
  }

  // Create all title lines
  const titleContainers: Phaser.GameObjects.Container[] = [];
  let currTitleY = 0;
  for (const [i, part] of titleParts.entries()) {
    const t = createGradientText(
      scene,
      0,
      0,
      part.text,
      part.fontSize || titleFontSize,
      width,
      part.fontFamily || "Kantumruy Pro",
      part.fontStyle || "normal",
      part.gradientColors || gradientColors,
      {
        stroke: part.stroke,
        strokeThickness: part.strokeThickness,
        shadow: part.shadow,
      },
      Math.round((part.fontSize || titleFontSize) * 0.45)
    );
    t.y = currTitleY;
    currTitleY += t.height + (i < titleParts.length - 1 ? spacing : 0);
    titleContainers.push(t);
  }

  // Subtitles
  const subtitleObjects = subtitles.map((sub) =>
    scene.add
      .text(0, 0, sub.toUpperCase(), {
        ...subtitleStyle,
        fontSize: `${subtitleFontSize}px`,
        // wordWrap: { width, useAdvancedWrap: true },
      })
      .setOrigin(0.5, 0)
  );

  // Layout calculation
  const titleHeight = currTitleY;
  const subtitlesHeight =
    subtitleObjects.reduce((acc, txt) => acc + txt.height + spacing, 0) -
    (subtitles.length > 0 ? spacing : 0);
  const totalHeight =
    titleHeight + (subtitles.length > 0 ? spacing : 0) + subtitlesHeight;

  // Positioning
  let currentY = -totalHeight / 2;
  for (const t of titleContainers) {
    t.y = currentY + t.height / 2;
    currentY += t.height + spacing;
  }
  for (const txt of subtitleObjects) {
    txt.y = currentY;
    currentY += txt.height + spacing;
  }

  const container = scene.add.container(x, y, [
    ...titleContainers,
    ...subtitleObjects,
  ]);
  container.setDepth(depth);
  container.setSize(width, totalHeight);

  return container;
}
