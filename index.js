import pkg from "lodash";
import http from "http";
const { find, includes, intersectionBy, isEmpty, orderBy, sample } = pkg;
import { glob, globSync, globStream, globStreamSync, Glob } from "glob";
import { createCanvas, loadImage } from "canvas";
import fs from "fs";
import traits from "./traits.json" assert { type: "json" };
const out = fs.createWriteStream("test.png");

const maxTraitSimilarityRule = (item, collection) => {
  const allowedMatchingTraits = 2;
  const match = find(collection, (i) => {
    const matchingTraits = intersectionBy(i.traits, item.traits);

    if (matchingTraits.length > allowedMatchingTraits) {
      return false;
    }

    return true;
  });

  return match ? true : false;
};

const metadataOverridesRule = (item, collection) => {
  const exceptionalTraits = [{ Layer: "1/1" }];

  if (includes(item.traits)) {
  }
};

const excludeTraitsRule = (item) =>
  some(
    item.traits,
    (trait) =>
      !isEmpty(intersectionBy(trait["Exclude Traits"], item.traits, "Name"))
  );

const excludeLayerRule = (item) => {
  const allNoneTraits = item.traits.reduce((acc, trait) => [
    ...acc,
    trait["Exclude Layers"],
  ]);

  if (
    some(
      item.traits,
      (trait) => allNoneTraits.includes(trait.name) && trait.value !== "None"
    )
  ) {
    return false;
  }

  return false;
};

const findTraitImageLayer = async (name, type) => {
  const images = await glob([`layers/${type}/${name}.png`]);
  return images[0];
};

const BackgroundTraits = traits.filter((trait) => trait.Layer === "Background");
const FurTraits = traits.filter((trait) => trait.Layer === "Fur");
const MouthTraits = traits.filter((trait) => trait.Layer === "Mouth");
const EyesTraits = traits.filter((trait) => trait.Layer === "Eyes");
const HeadTraits = traits.filter((trait) => trait.Layer === "Head");
const BodyTraits = traits.filter((trait) => trait.Layer === "Body");

console.log({ FurTraits: FurTraits.length });

const renderImage = async () => {
  const canvas = createCanvas(2048, 2048);
  const ctx = canvas.getContext("2d");

  // some items for the layers
  // Background
  // Fur
  // Mouth
  // Eyes
  // Head
  // Body

  // create a layer order 1

  const backgroundTrait = sample(
    BackgroundTraits.filter((trait) => trait.Name !== "None")
  );
  const furTrait = sample(FurTraits.filter((trait) => trait.Name !== "None"));
  const mouthTrait = sample(
    MouthTraits.filter((trait) => trait.Name !== "None")
  );
  const eyesTrait = sample(EyesTraits.filter((trait) => trait.Name !== "None"));
  const headTrait = sample(HeadTraits);
  const bodyTrait = sample(BodyTraits);

  const sampleNFT = {
    Background: backgroundTrait,
    Fur: furTrait,
    Mouth: mouthTrait,
    Eyes: eyesTrait,
    Head: headTrait,
    Body: bodyTrait,
    traits: orderBy(
      [backgroundTrait, furTrait, mouthTrait, eyesTrait, headTrait, bodyTrait],
      "Order"
    ),
  };

  //   !run rules here

  for (const trait of sampleNFT.traits) {
    const image = await loadImage(
      `layers/${trait.Layer}/${trait.Name.toLowerCase()}.png`
    );
    ctx.drawImage(image, 0, 0);
  }
  console.log({ traits: sampleNFT.traits });

  //  const BackgroundImage = await loadImage(
  //    `layers/Background/${backgroundTrait.Name.toLowerCase()}.png`
  //  );
  //  ctx.drawImage(BackgroundImage, 0, 0);

  //  const FurImage = await loadImage(
  //    `layers/Fur/${furTrait.Name.toLowerCase()}.png`
  //  );
  // ctx.drawImage(FurImage, 0, 0);

  //  const MouthImage = await loadImage(
  //   `layers/Mouth/${mouthTrait.Name.toLowerCase()}.png`
  //  );
  // ctx.drawImage(MouthImage, 0, 0);

  // const EyesImage = await loadImage(
  //  `layers/Eyes/${eyesTrait.Name.toLowerCase()}.png`
  //  );
  //  ctx.drawImage(EyesImage, 0, 0);

  //  const HeadImage = await loadImage(
  //   `layers/Head/${headTrait.Name.toLowerCase()}.png`
  // );
  // ctx.drawImage(HeadImage, 0, 0);

  //  const BodyImage = await loadImage(
  //   `layers/Cloth/${bodyTrait.Name.toLowerCase()}.png`
  //  );
  //  ctx.drawImage(BodyImage, 0, 0);

  //console.log("added layers");
  //const stream = canvas.createPNGStream();
  //stream.pipe(out);
  //out.on("finish", () => console.log("The PNG file was created."));
  const buf2 = canvas.toBuffer("image/png", {
    compressionLevel: 3,
    filters: canvas.PNG_FILTER_NONE,
  });

  return { image: buf2, nft: sampleNFT };
  //fs.writeFileSync("test2.png", buf2);
};

http
  .createServer(async function (req, res) {
    const html = await buildHtml(req);

    res.writeHead(200, {
      "Content-Type": "text/html",
      "Content-Length": html.length,
      Expires: new Date().toUTCString(),
    });
    res.end(html);
  })
  .listen(8080);

const buildHtml = async (req) => {
  var header = "";
  var body = "hello";
  try {
    const { image, nft } = await renderImage();
    console.log({ image, nft });
    body = `<img style="width: 600px; height: 600px;" src="data:image/png;base64,${Buffer.from(
      image
    ).toString(
      "base64"
    )}" /> <div style="display:flex;justify-content:space-around;margin: 50px;"><button style="font-size:40px">Approve</button> <button style="font-size:40px">Reject</button></div>${nft.traits.map(
      (trait) => `<span>${trait.Layer}: ${trait.Name} </span>`
    )}`;
  } catch (error) {
    body = error;
  }

  // concatenate header string
  // concatenate body string

  return (
    "<!DOCTYPE html>" +
    "<html><head>" +
    header +
    "</head><body>" +
    body +
    "</body></html>"
  );
};
