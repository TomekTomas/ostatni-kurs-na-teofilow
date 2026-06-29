import { loadFont } from "@remotion/fonts";
import { Audio, Video } from "@remotion/media";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { wipe } from "@remotion/transitions/wipe";
import {
  AbsoluteFill,
  Easing,
  Img,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";

loadFont({
  family: "Lexend Deca",
  url: staticFile("fonts/lexend-deca-regular.woff2"),
  weight: "400",
});
loadFont({
  family: "Lexend Deca",
  url: staticFile("fonts/lexend-deca-900.woff2"),
  weight: "900",
});

const COLORS = {
  navy: "#033968",
  green: "#33b54b",
  white: "#ffffff",
  gold: "#ffb22e",
  dark: "#10131a",
  cyan: "#50d2c2",
  pink: "#ff5c8a",
};

const transition = linearTiming({ durationInFrames: 10 });

type PromoSceneProps = {
  clip: string;
  eyebrow: string;
  headline: string;
  accent: string;
  detail: string;
  marker: string;
  objectPosition?: string;
};

const enter = (frame: number, delay = 0) =>
  interpolate(frame, [delay, delay + 14], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

const CreatorMark: React.FC<{ compact?: boolean }> = ({ compact = false }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 20,
      height: compact ? 80 : 112,
    }}
  >
    <div style={{ width: 7, height: compact ? 54 : 76, background: COLORS.green }} />
    <div
      style={{
        fontSize: compact ? 34 : 46,
        fontWeight: 900,
        color: COLORS.white,
        lineHeight: 1,
      }}
    >
      TOMASZ TOMAS
    </div>
  </div>
);

const RouteStrip: React.FC<{ marker: string; color: string }> = ({ marker, color }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 18, width: "100%" }}>
    <div
      style={{
        width: 66,
        height: 66,
        display: "grid",
        placeItems: "center",
        background: COLORS.green,
        color: COLORS.dark,
        fontSize: 36,
        fontWeight: 900,
      }}
    >
      8
    </div>
    <div style={{ flex: 1, height: 8, background: "#33424d", position: "relative" }}>
      <div style={{ width: marker, height: "100%", background: color }} />
    </div>
    <div style={{ fontSize: 30, fontWeight: 900, color: COLORS.white }}>TEOFILÓW</div>
  </div>
);

const GameplayFrame: React.FC<{ clip: string; objectPosition?: string }> = ({
  clip,
  objectPosition = "center",
}) => {
  const frame = useCurrentFrame();
  const scale = interpolate(frame, [0, 120], [1.035, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        width: 920,
        height: 518,
        border: `5px solid ${COLORS.gold}`,
        background: "#05070a",
        overflow: "hidden",
        boxShadow: "0 24px 70px rgba(0, 0, 0, 0.52)",
        scale,
      }}
    >
      <Video
        src={staticFile(`footage/${clip}`)}
        muted
        loop
        objectFit="cover"
        style={{ width: "100%", height: "100%", objectPosition }}
      />
    </div>
  );
};

const PromoScene: React.FC<PromoSceneProps> = ({
  clip,
  eyebrow,
  headline,
  accent,
  detail,
  marker,
  objectPosition,
}) => {
  const frame = useCurrentFrame();
  const titleProgress = enter(frame, 2);
  const visualProgress = enter(frame, 8);
  const detailProgress = enter(frame, 15);

  return (
    <AbsoluteFill style={{ background: COLORS.dark, fontFamily: "Lexend Deca", overflow: "hidden" }}>
      <Video
        src={staticFile(`footage/${clip}`)}
        muted
        loop
        objectFit="cover"
        style={{
          position: "absolute",
          inset: -60,
          width: 1200,
          height: 2040,
          filter: "blur(30px) brightness(0.2) saturate(0.8)",
          opacity: 0.72,
        }}
      />
      <AbsoluteFill style={{ background: "rgba(16, 19, 26, 0.7)" }} />
      <div
        style={{
          position: "relative",
          height: "100%",
          padding: "112px 80px 190px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 42,
        }}
      >
        <div style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <CreatorMark compact />
          <div style={{ color: COLORS.gold, fontSize: 32, fontWeight: 900 }}>LINIA 8</div>
        </div>
        <div
          style={{
            width: "100%",
            minHeight: 270,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            opacity: titleProgress,
            translate: `0 ${interpolate(titleProgress, [0, 1], [42, 0])}px`,
          }}
        >
          <div style={{ fontSize: 34, fontWeight: 900, color: accent, marginBottom: 18 }}>{eyebrow}</div>
          <div
            style={{
              fontSize: 88,
              lineHeight: 0.98,
              fontWeight: 900,
              color: COLORS.white,
              maxWidth: 900,
            }}
          >
            {headline.split("\\n").map((line) => (
              <div key={line}>{line}</div>
            ))}
          </div>
        </div>
        <div
          style={{
            opacity: visualProgress,
            translate: `0 ${interpolate(visualProgress, [0, 1], [34, 0])}px`,
          }}
        >
          <GameplayFrame clip={clip} objectPosition={objectPosition} />
        </div>
        <div
          style={{
            width: "100%",
            minHeight: 250,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 42,
            opacity: detailProgress,
          }}
        >
          <div style={{ color: COLORS.white, fontSize: 42, lineHeight: 1.24, fontWeight: 900 }}>{detail}</div>
          <RouteStrip marker={marker} color={accent} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const title = enter(frame, 5);
  const subtitle = enter(frame, 20);

  return (
    <AbsoluteFill style={{ background: COLORS.dark, fontFamily: "Lexend Deca", overflow: "hidden" }}>
      <Video
        src={staticFile("footage/menu.mp4")}
        muted
        loop
        objectFit="cover"
        style={{ width: "100%", height: "100%", filter: "brightness(0.28) saturate(0.86)" }}
      />
      <AbsoluteFill style={{ background: "rgba(16, 19, 26, 0.66)" }} />
      <div
        style={{
          position: "relative",
          height: "100%",
          padding: "150px 84px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-between",
          textAlign: "center",
        }}
      >
        <CreatorMark />
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 38 }}>
          <div style={{ width: 160, height: 10, background: COLORS.gold }} />
          <div
            style={{
              fontSize: 112,
              lineHeight: 0.9,
              fontWeight: 900,
              color: COLORS.gold,
              opacity: title,
              scale: interpolate(title, [0, 1], [0.92, 1]),
            }}
          >
            OSTATNI
            <br />
            KURS
          </div>
          <div
            style={{
              fontSize: 58,
              fontWeight: 900,
              color: COLORS.white,
              opacity: subtitle,
              translate: `0 ${interpolate(subtitle, [0, 1], [30, 0])}px`,
            }}
          >
            NA TEOFILÓW
          </div>
        </div>
        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 40 }}>
          <div style={{ fontSize: 40, lineHeight: 1.25, fontWeight: 900, color: COLORS.white }}>
            Arcade tramwajowe
            <br />z linii 8 w Łodzi
          </div>
          <RouteStrip marker="22%" color={COLORS.gold} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const progress = enter(frame, 4);
  const pulse = interpolate(frame % 30, [0, 15, 30], [1, 1.025, 1]);

  return (
    <AbsoluteFill
      style={{
        background: COLORS.dark,
        fontFamily: "Lexend Deca",
        padding: "150px 84px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
        textAlign: "center",
      }}
    >
      <CreatorMark />
      <Img src={staticFile("branding/landing-tram.webp")} style={{ width: 940, objectFit: "contain" }} />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 32,
          opacity: progress,
          translate: `0 ${interpolate(progress, [0, 1], [36, 0])}px`,
        }}
      >
        <div style={{ color: COLORS.white, fontSize: 56, fontWeight: 900 }}>CZY DOJEDZIESZ DO KOŃCA?</div>
        <div
          style={{
            width: 850,
            padding: "38px 42px",
            background: COLORS.gold,
            color: COLORS.dark,
            border: `6px solid ${COLORS.white}`,
            fontSize: 64,
            fontWeight: 900,
            scale: pulse,
          }}
        >
          ZAGRAJ BEZPŁATNIE
        </div>
        <div style={{ color: COLORS.cyan, fontSize: 46, fontWeight: 900 }}>gra.tomasztomas.pl</div>
      </div>
      <RouteStrip marker="100%" color={COLORS.green} />
    </AbsoluteFill>
  );
};

const AudioBed: React.FC = () => (
  <>
    <Audio
      src={staticFile("audio/promo-track.wav")}
      volume={(frame) => interpolate(frame, [0, 18, 680, 719], [0, 0.82, 0.82, 0], { extrapolateRight: "clamp" })}
    />
    <Sequence from={85} durationInFrames={350} premountFor={30}>
      <Audio src={staticFile("audio/konstal-ride.ogg")} loop volume={0.15} />
    </Sequence>
    <Sequence from={430} durationInFrames={180} premountFor={30}>
      <Audio src={staticFile("audio/pesa-ride.ogg")} loop volume={0.13} />
    </Sequence>
  </>
);

export const OstatniKursReel: React.FC = () => (
  <AbsoluteFill style={{ background: COLORS.dark }}>
    <TransitionSeries>
      <TransitionSeries.Sequence durationInFrames={90} premountFor={30}>
        <Intro />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={transition} />
      <TransitionSeries.Sequence durationInFrames={100} premountFor={30}>
        <PromoScene
          clip="menu.mp4"
          eyebrow="WYBIERZ SWÓJ TRAMWAJ"
          headline="2 TRAMWAJE\n4 TRYBY"
          accent={COLORS.gold}
          detail="Konstal 805Na albo Pesa Swing. Każdy kurs prowadzi się inaczej."
          marker="35%"
        />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={wipe({ direction: "from-left" })} timing={transition} />
      <TransitionSeries.Sequence durationInFrames={130} premountFor={30}>
        <PromoScene
          clip="day.mp4"
          eyebrow="PRAWDZIWA TRASA LINII 8"
          headline="34 PRZYSTANKI"
          accent={COLORS.cyan}
          detail="Z Zarzewa przez Widzew i centrum aż na Teofilów."
          marker="55%"
        />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={transition} />
      <TransitionSeries.Sequence durationInFrames={120} premountFor={30}>
        <PromoScene
          clip="hazards.mp4"
          eyebrow="ŁÓDŹ NIE UŁATWIA ZADANIA"
          headline="PATRZ NA TOR"
          accent={COLORS.pink}
          detail="Ruch uliczny, zwrotnice, sygnalizacja i remonty po drodze."
          marker="70%"
        />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={wipe({ direction: "from-right" })} timing={transition} />
      <TransitionSeries.Sequence durationInFrames={130} premountFor={30}>
        <PromoScene
          clip="night.mp4"
          eyebrow="MIASTO PO ZMROKU"
          headline="NOCNY KURS"
          accent={COLORS.gold}
          detail="Światła, iskry pantografu i tramwaje mijające Cię na trasie."
          marker="84%"
        />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={transition} />
      <TransitionSeries.Sequence durationInFrames={90} premountFor={30}>
        <PromoScene
          clip="score.mp4"
          eyebrow="LICZY SIĘ KAŻDY PRZYSTANEK"
          headline="POBIJ REKORD"
          accent={COLORS.green}
          detail="Punktualność, płynność i komplet pasażerów."
          marker="94%"
        />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={wipe({ direction: "from-bottom" })} timing={transition} />
      <TransitionSeries.Sequence durationInFrames={120} premountFor={30}>
        <Outro />
      </TransitionSeries.Sequence>
    </TransitionSeries>
    <AudioBed />
  </AbsoluteFill>
);

export const OstatniKursCover: React.FC = () => (
  <AbsoluteFill style={{ background: COLORS.dark, fontFamily: "Lexend Deca", overflow: "hidden" }}>
    <Img
      src={staticFile("branding/landing-tram.webp")}
      style={{ position: "absolute", width: "100%", height: "100%", objectFit: "cover", opacity: 0.32 }}
    />
    <AbsoluteFill style={{ background: "rgba(16, 19, 26, 0.58)" }} />
    <div
      style={{
        position: "relative",
        height: "100%",
        padding: "150px 84px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
        textAlign: "center",
      }}
    >
      <CreatorMark />
      <div style={{ display: "flex", flexDirection: "column", gap: 30, alignItems: "center" }}>
        <div style={{ width: 160, height: 10, background: COLORS.gold }} />
        <div style={{ color: COLORS.gold, fontSize: 112, lineHeight: 0.92, fontWeight: 900 }}>OSTATNI KURS</div>
        <div style={{ color: COLORS.white, fontSize: 62, fontWeight: 900 }}>NA TEOFILÓW</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 36, width: "100%" }}>
        <div style={{ color: COLORS.white, fontSize: 44, fontWeight: 900 }}>TRAMWAJOWA GRA Z ŁODZI</div>
        <div style={{ background: COLORS.gold, color: COLORS.dark, padding: 32, fontSize: 54, fontWeight: 900 }}>
          ZAGRAJ BEZPŁATNIE
        </div>
        <div style={{ color: COLORS.cyan, fontSize: 42, fontWeight: 900 }}>gra.tomasztomas.pl</div>
      </div>
    </div>
  </AbsoluteFill>
);
