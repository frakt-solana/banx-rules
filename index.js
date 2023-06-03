import pkg from "lodash";
import http from "http";
const {
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
      records.forEach(function (record) {
        console.log(record.getId());
      });
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
    console.log(trait.Name, traitsToExclude);
    if (!isEmpty(traitsToExclude[0])) {
      result = some(traitsToExclude, (traitRuleStr) => {
        const traitRule = parseTraitFromRule(traitRuleStr);
        console.log(
          "# comparing to exclude",
          item[traitRule.Layer]?.Name,
          traitRule?.Name
        );
        return item[traitRule.Layer]?.Name === traitRule?.Name;
      });
    }
  }

  console.log({ exlude: result });
  return result;
};

const forceTraitsRule = (item) => {
  let result = false;
  for (const i in item.traits) {
    const trait = item.traits[i];
    const traitsToEnforce = trait.Force.split(",");
    console.log(trait.Name, traitsToEnforce);
    if (!isEmpty(traitsToEnforce[0])) {
      result = some(traitsToEnforce, (traitRuleStr) => {
        const traitRule = parseTraitFromRule(traitRuleStr);
        console.log(
          "# comparing to force",
          item[traitRule.Layer]?.Name,
          traitRule?.Name
        );
        return item[traitRule.Layer]?.Name === traitRule?.Name;
      });
    }
  }

  console.log({ enforce: result });
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

const findTraitImageLayer = async (name, type) => {
  const images = await glob([`layers4/${type}/${name}.png`]);
  return images[0];
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

const getRandomSet = () => {
  const backgroundTrait = sample(
    BackgroundTraits.filter((trait) => trait.Name !== "None")
  );
  const furTrait = sample(FurTraits.filter((trait) => trait.Name !== "None"));
  const mouthTrait = sample(
    MouthTraits.filter((trait) => trait.Name !== "None")
  );
  const eyesTrait = sample(EyesTraits.filter((trait) => trait.Name !== "None"));
  const headTrait = sample(HeadTraits);
  //const bodyTrait = BodyTraits.find((t) => t.Name === "Hoodie up (black)");
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

  if (excludeTraitsRule(sampleNFT)) {
    return getRandomSet();
  }

  if (!forceTraitsRule(sampleNFT)) {
    return getRandomSet();
  }

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

  const sampleNFT = getRandomSet();

  for (const trait of sampleNFT.traits) {
    const image = await loadImage(
      `layers4/${trait.Layer}/${trait.Name.toLowerCase()}.png`
    );
    ctx.drawImage(image, 0, 0);
  }
  //console.log({ traits: sampleNFT.traits });

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
    //console.log({ image, nft });
    body = `<img style="width: 600px; height: 600px;" src="data:image/png;base64,${Buffer.from(
      image
    ).toString(
      "base64"
    )}" /> <div style="display:flex;justify-content:space-around;margin: 50px;"><button style="font-size:40px" onclick=send("Approve")>Approve</button> <button style="font-size:40px" onclick=send("Deny")>Deny</button></div>${nft.traits.map(
      (trait) => `<span>${trait.Layer}: ${trait.Name} </span>

      `
    )}
    <script>
    var nft = ${JSON.stringify(
      reduce(
        nft,
        (res, trait, key) => ({ ...res, [key.toString()]: trait.Name }),
        {}
      )
    )}
    const send = (base) => {
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
        });
        
    }
    </script>`;
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
