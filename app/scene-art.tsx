import {useId} from "react";

const sceneDescriptions = {
  arrival: "보고서를 든 신입과 빨간 펜으로 자료를 확인하는 청사관리팀장",
  investigation: "업무 PC와 두 개의 문서를 번갈아 확인하는 신규 담당자",
  phone: "사무실 유선전화를 받고 있는 신규 담당자",
  ending: "첫 보고를 마친 신입과 작게 미소 짓는 청사관리팀장",
} as const;

export type StoryScene = keyof typeof sceneDescriptions;

// Coordinates stay in the original 1280×720 image space. The SVG and base image
// use the same centered cover crop, so eyelids also line up in narrow portraits.
const sceneBlinks: Partial<Record<StoryScene, {
  who: "hero" | "boss";
  eyes: {cx: number; cy: number; rx: number; ry: number}[];
}[]>> = {
  arrival: [
    {who: "hero", eyes: [{cx: 411, cy: 185, rx: 30, ry: 16}, {cx: 482, cy: 200, rx: 26, ry: 18}]},
    {who: "boss", eyes: [{cx: 851, cy: 225, rx: 27, ry: 19}, {cx: 928, cy: 244, rx: 33, ry: 19}]},
  ],
  investigation: [
    {who: "hero", eyes: [{cx: 557, cy: 212, rx: 31, ry: 18}, {cx: 633, cy: 227, rx: 27, ry: 18}]},
  ],
};

export function SceneStill({
  scene,
  caption,
  className = "",
  priority = false,
}: {
  scene: StoryScene;
  caption?: string;
  className?: string;
  priority?: boolean;
}) {
  const id = `scene-eyes-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const blinks = sceneBlinks[scene];
  return (
    <figure className={`sceneStill sceneStill-${scene} ${className}`}>
      <img
        src={`/art/retro-v5/${scene}.webp`}
        alt={sceneDescriptions[scene]}
        width={1280}
        height={720}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        decoding="async"
      />
      {blinks && <svg className="sceneEyeOverlay" viewBox="0 0 1280 720" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
        <defs>{blinks.map(({who, eyes}) => <clipPath key={who} id={`${id}-${who}`}>
          {eyes.map((eye, index) => <ellipse key={index} {...eye}/>)}
        </clipPath>)}</defs>
        {blinks.map(({who}) => <image key={who} className={`sceneEyeBlink sceneEyeBlink-${who}`} href={`/art/retro-v5/${scene}-blink.webp`} width="1280" height="720" clipPath={`url(#${id}-${who})`}/>)}
      </svg>}
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
}
