import "./index.css";
import { Composition, Still } from "remotion";
import { OstatniKursCover, OstatniKursReel } from "./Composition";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="OstatniKursReel"
        component={OstatniKursReel}
        durationInFrames={720}
        fps={30}
        width={1080}
        height={1920}
      />
      <Still id="OstatniKursCover" component={OstatniKursCover} width={1080} height={1920} />
    </>
  );
};
