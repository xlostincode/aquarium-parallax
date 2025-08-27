import { useEffect, useState } from "react";
import { useAppStore } from "../store/store";
import { classNames } from "../utils";

const Links = () => {
  const experienceStarted = useAppStore((state) => state.experienceStarted);

  const [showLinks, setShowLinks] = useState(true);
  const [showAttribution, setShowAttribution] = useState(false);

  useEffect(() => {
    if (experienceStarted) {
      setShowLinks(false);
    }
  }, [experienceStarted]);

  return (
    <footer
      className={classNames(
        !showLinks && "opacity-50 hover:opacity-100",
        "fixed z-10 bottom-2 left-2 flex gap-4 text-stone-900 p-2 rounded-md"
      )}
    >
      <button onClick={() => setShowLinks(!showLinks)}>Links</button>

      {showLinks && (
        <div className="flex gap-4 ">
          <a href="https://github.com/xlostincode" target="_blank">
            Github
          </a>
          <a href="https://x.com/0xlostincode" target="_blank">
            X/Twitter
          </a>
          <a href="https://www.youtube.com/@0xLostInCode" target="_blank">
            Youtube
          </a>

          <button onClick={() => setShowAttribution(!showAttribution)}>
            Attribution
          </button>
        </div>
      )}

      {showAttribution && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col gap-2 bg-stone-900 text-stone-100 p-4 rounded-md border-2 border-stone-700 mx-auto">
          <div className="flex justify-between">
            <h2 className="text-lg">Attributions</h2>
            <button onClick={() => setShowAttribution(!showAttribution)}>
              Close
            </button>
          </div>

          <a href="https://poly.pizza/m/BEcU9rjiAq" target="_blank">
            Fish by Quaternius
          </a>
          <a href="https://poly.pizza/m/h6M5zlF5Yx" target="_blank">
            Mandarin Fish by Quaternius
          </a>
          <a href="https://poly.pizza/m/TQaMo8GTJl" target="_blank">
            Blue Tang by Quaternius
          </a>
          <a href="https://poly.pizza/m/Vg8IlYjdZi" target="_blank">
            Betta by Quaternius
          </a>
          <a href="https://poly.pizza/m/qyGtRmhgzl" target="_blank">
            Koi by Quaternius
          </a>
          <a href="https://poly.pizza/m/80uVAty6wZ2" target="_blank">
            Coral by Poly by Google [CC-BY] via Poly Pizza
          </a>

          <a href="https://cassala.itch.io/bubble-sprites" target="_blank">
            Bubble Sprite
          </a>

          <a
            href="https://opengameart.org/content/caustic-textures"
            target="_blank"
          >
            Caustic Textures
          </a>

          <a
            href="https://www.poliigon.com/texture/mixed-bubbles-water-droplets-texture/2400"
            target="_blank"
          >
            Mixed Bubbles Water Droplets Texture
          </a>

          <a
            href="https://www.flaticon.com/free-icons/aquarium"
            title="aquarium icons"
            target="_blank"
          >
            Aquarium icons created by Freepik - Flaticon
          </a>
        </div>
      )}
    </footer>
  );
};

export default Links;
