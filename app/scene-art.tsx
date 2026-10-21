const sceneDescriptions = {
  arrival: "보고서를 든 신입과 빨간 펜으로 자료를 확인하는 청사관리팀장",
  investigation: "업무 PC와 두 개의 문서를 번갈아 확인하는 신규 담당자",
  phone: "사무실 유선전화를 받고 있는 신규 담당자",
  ending: "첫 보고를 마친 신입과 작게 미소 짓는 청사관리팀장",
} as const;

export type StoryScene = keyof typeof sceneDescriptions;

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
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
}
