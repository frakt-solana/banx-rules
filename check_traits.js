import fs from "fs";
import { glob } from "glob";
import traits from "./traits.json" assert { type: "json" };

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

fs.writeFileSync("./notFound.json", JSON.stringify(notFound));
