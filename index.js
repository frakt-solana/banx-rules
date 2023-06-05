import pkg from "lodash";
import http from "http";
import express from "express";
const {
  shuffle,
  find,
  includes,
  intersectionBy,
  isEmpty,
  orderBy,
  sample,
  reduce,
  some,
} = pkg;
import { glob, globSync, globStream, globStreamSync, Glob } from "glob";
import { createCanvas, loadImage } from "canvas";
import fs from "fs";
import traits from "./traits.json" assert { type: "json" };
import airtable from "airtable";
const out = fs.createWriteStream("test.png");
const app = express();

airtable.configure({
  endpointUrl: "https://api.airtable.com",
  apiKey:
    "patAMXj3c4gedrbRE.5e3eefbdc79625812d0fd2290d103a67d6eb846f3810cdd64696b852a5224e70",
});

const base = airtable.base("appuQP7QzvQwbl6dP");

const sendToTable = (nft, status) => {
  base(status).create(
    [
      {
        fields: {
          Background: nft.Background.Name,
          Fur: nft.Fur.Fur,
          Eyes: nft.Eyes.Eyes,
          Mouth: nft.Mouth.Name,
          Head: nft.Head.Name,
          Body: nft.Body.Name,
        },
      },
    ],
    function (err, records) {
      if (err) {
        console.error(err);
        return;
      }
      records.forEach(function (record) {});
    }
  );
};

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

const excludeTraitsRule = (item) => {
  let result = false;
  for (const i in item.traits) {
    const trait = item.traits[i];
    const traitsToExclude = trait.Exclude.split(",");
    if (!isEmpty(traitsToExclude[0])) {
      console.log({ trait: trait.Name, traitsToExclude });
      result = some(traitsToExclude, (traitRuleStr) => {
        const traitRule = parseTraitFromRule(traitRuleStr);

        return item[traitRule.Layer]?.Name === traitRule?.Name;
      });
    }
  }

  return result;
};

const forceTraitsRule = (item) => {
  let result = false;
  for (const i in item.traits) {
    const trait = item.traits[i];
    const traitsToEnforce = trait.Force.split(",");

    if (!isEmpty(traitsToEnforce[0])) {
      result = some(traitsToEnforce, (traitRuleStr) => {
        const traitRule = parseTraitFromRule(traitRuleStr);

        return item[traitRule.Layer]?.Name === traitRule?.Name;
      });
    }
  }

  return result;
};

const excludeLayerRule = (item) => {
  const allNoneTraits = item.traits.reduce((acc, trait) => [
    ...acc,
    trait["Exclude"],
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

const parseTraitFromRule = (traitFromRule) => {
  const arr = traitFromRule.split(":");
  return { Layer: arr[0], Name: arr[1] };
};

const BackgroundTraits = traits.filter((trait) => trait.Layer === "Background");
const FurTraits = traits.filter((trait) => trait.Layer === "Fur");
const MouthTraits = traits.filter((trait) => trait.Layer === "Mouth");
const EyesTraits = traits.filter((trait) => trait.Layer === "Eyes");
const HeadTraits = traits.filter((trait) => trait.Layer === "Head");
const BodyTraits = traits.filter((trait) => trait.Layer === "Body");

console.log(HeadTraits.length);

const getRandomSet = async () => {
  const backgroundTrait = sample(
    shuffle(BackgroundTraits.filter((trait) => trait.Name !== "None"))
  );
  const furTrait = sample(
    shuffle(FurTraits.filter((trait) => trait.Name !== "None"))
  );
  const mouthTrait = sample(
    shuffle(MouthTraits.filter((trait) => trait.Name !== "None"))
  );
  const eyesTrait = sample(
    shuffle(EyesTraits.filter((trait) => trait.Name !== "None"))
  );
  const headTrait = sample(shuffle(HeadTraits));
  //const bodyTrait = BodyTraits.find((t) => t.Name === "Hoodie up (black)");
  const bodyTrait = sample(BodyTraits);
  const traits = orderBy(
    [backgroundTrait, furTrait, mouthTrait, eyesTrait, headTrait, bodyTrait],
    "Order"
  );
  const images = [];
  for (const i in traits) {
    const image = await glob([
      `layers/${traits[i].Layer}/${traits[i].Name.toLowerCase()}.png`,
    ]);

    images.push[image[0]];
  }

  const sampleNFT = {
    Background: backgroundTrait,
    Fur: furTrait,
    Mouth: mouthTrait,
    Eyes: eyesTrait,
    Head: headTrait,
    Body: bodyTrait,
    traits,
    images,
  };

  if (excludeTraitsRule(sampleNFT)) {
    return getRandomSet();
  }

  /* if (!forceTraitsRule(sampleNFT)) {
    return getRandomSet();
  } */

  //   !run rules here

  return sampleNFT;
};

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

  //const sampleNFT = getRandomSet();
  const nftsSet = await Promise.all([
    getRandomSet(),
    getRandomSet(),
    getRandomSet(),
    getRandomSet(),
    getRandomSet(),
    getRandomSet(),
    getRandomSet(),
    getRandomSet(),
    getRandomSet(),
    getRandomSet(),
  ]);

  //console.log({ traits: sampleNFT.traits });

  const buf2 = canvas.toBuffer("image/png", {
    compressionLevel: 3,
    filters: canvas.PNG_FILTER_NONE,
  });

  return { image: buf2, nftsSet };
  //fs.writeFileSync("test2.png", buf2);
};

app.use(express.static("public"));

app.use("/layers", express.static("./layers"));

app.use("/", async (req, res) => {
  const html = await buildHtml(req);
  res.set("Content-Type", "text/html");
  res.send(Buffer.from(html));
});

app.listen(process.env.PORT || 8080);

const buildHtml = async (req) => {
  var header = "";
  var body = "hello";
  try {
    const { nftsSet, nft } = await renderImage();
    //console.log({ image, nft });
    body = `<div class="container"> ${nftsSet.reduce((acc, item) => {
      let imageString = "";
      for (const trait of item.traits) {
        imageString =
          imageString +
          `<img src="${`layers/${
            trait.Layer
          }/${trait.Name.toLowerCase()}.png`}" />`;
      }
      return (
        acc +
        `<div>${imageString}<menu><button onclick="send('Approve', {${item.traits.map(
          (t) => `${t.Layer}: '${t.Name}'`
        )}})">Approve</button><button onclick="send('Deny', {${item.traits.map(
          (t) => `${t.Layer}: '${t.Name}'`
        )}})">Deny</button></menu><dl>${item.traits.map(
          (t) => `<dt>${t.Layer}</dt><dd>${t.Name}</dd>`
        )}</dl></div>`
      );
    }, "")}
    
    </div>
    <script>
    var nft = ${JSON.stringify(
      reduce(
        nft,
        (res, trait, key) => ({ ...res, [key.toString()]: trait.Name }),
        {}
      )
    )}
    const send = (base, nft) => {
      const response = fetch('https://api.airtable.com/v0/appuQP7QzvQwbl6dP/' + base, {
          method: "POST", // *GET, POST, PUT, DELETE, etc.
          mode: "cors", // no-cors, *cors, same-origin
          cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer patAMXj3c4gedrbRE.5e3eefbdc79625812d0fd2290d103a67d6eb846f3810cdd64696b852a5224e70"
          },
          body: JSON.stringify({
              records:[
                  {fields: nft}
              ]
          }), 
        }).then(alert('success'));
        
    }
    </script>`;
  } catch (error) {
    body = error;
  }

  // concatenate header string
  // concatenate body string

  const styleTag = `<style type="text/css"> body { margin: 0; padding: 1vw; } div.container { position: relative; display: flex; gap: 1vw 2vw; flex-wrap: wrap; justify-content: space-evenly; padding: 0 2vw; } div.container > div { position: relative; border-bottom: 1px solid #CCC; } div.container > div > img { position: absolute; width: 100%; height: auto; top: 0; left; 0; } dl { display: flex; flex-wrap: wrap; justify-content: space-between; font-size: small; } dt, dd { padding: 0; margin: 0; } dt { text-align: right; width: 36%; } dd { text-align: left; font-weight: bold; width: 60%; } menu { display: flex; padding: 0; flex-wrap: wrap; justify-content: space-between; } button { width: 36%; padding: 0; margin: 0; color: white; font-weight: bold; line-height: 1.5; } button:first-child { background-color: green; } button:last-child { background-color: red; } @media screen and (min-width: 1024px){ div.container > div { width: 16vw; padding-top: 16vw; } } @media screen and (max-width: 1023px){ div.container > div { width: 75vh; padding-top: 75vh; } } </style>`;
  return (
    "<!DOCTYPE html>" +
    "<html><head>" +
    header +
    styleTag +
    "</head><body>" +
    body +
    "</body></html>"
  );
};
