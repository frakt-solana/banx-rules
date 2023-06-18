import fs from "fs";
import { glob } from "glob";
import traits from "./data/traits.json" assert { type: "json" };
import manuals from "./manuals.json" assert { type: "json" };
import _ from "lodash";
import airtable from "airtable";

airtable.configure({
  endpointUrl: "https://api.airtable.com",
  apiKey:
    "patAMXj3c4gedrbRE.5e3eefbdc79625812d0fd2290d103a67d6eb846f3810cdd64696b852a5224e70",
});

const base = airtable.base("appuQP7QzvQwbl6dP");

const checkManuals = async () => {
  const chunkSize = 10;
  for (let i = 0; i < manuals.length; i += chunkSize) {
    const chunk = manuals.slice(i, i + chunkSize).map((fields) => ({ fields }));
    await base("Approve").create(chunk);
    // do whatever
  }
};

const findTraitImageLayer = async (name, type) => {
  try {
    const images = await glob([`layers/${type}/${name}.png`]);

    return images[0] ? true : false;
  } catch (err) {
    console.log(err);
    return false;
  }
};

const notFound = [];

for (const i in traits) {
  const trait = traits[i];
  const found = await findTraitImageLayer(
    trait.Name.toLowerCase().trim(),
    trait.Layer
  );

  if (!found) {
    notFound.push({ name: trait.Name, layer: trait.Layer });
  }
}

console.log({ notFound });

await checkManuals();

fs.writeFileSync("./notFound.json", JSON.stringify(notFound));
