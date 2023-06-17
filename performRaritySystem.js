import maxedOutTraits from "./data/maxedOutTraits.json" assert { type: "json" };
import collectionTraits from "./data/traits.json" assert { type: "json" };
import records from "./data/records.json" assert { type: "json" };
import _ from "lodash";
import fs from "fs";
import Airtable from "airtable";

Airtable.configure({
  endpointUrl: "https://api.airtable.com",
  apiKey:
    "patAMXj3c4gedrbRE.5e3eefbdc79625812d0fd2290d103a67d6eb846f3810cdd64696b852a5224e70",
});

const sortByTraitsOccurance = (sets, counts) => {
  const sortedTraits = _.sortBy(
    Object.keys(maxedOutTraits.counts).map((key) => ({
      key,
      current: maxedOutTraits.counts[key].current,
      max: maxedOutTraits.counts[key].max,
    })),
    "current"
  );
};

const LAYERS_NAMES = ["Background", "Fur", "Body", "Mouth", "Head", "Eyes"];

const sortedAttributesByCurrent = _.sortBy(
  Object.keys(maxedOutTraits.counts).map((key) => ({
    key,
    layer: key.split(":")[0],
    current: maxedOutTraits.counts[key].current,
    max: maxedOutTraits.counts[key].max,
  })),
  "current"
);

const maxOccurancesOfAttribute = LAYERS_NAMES.reduce((acc, layer) => {
  const maxAttribute = _.find(_.reverse(sortedAttributesByCurrent), { layer });
  return { ...acc, [layer]: maxAttribute.current };
}, {});

console.log({ maxOccurancesOfAttribute });

const sortRecordsByRaritySystem = (records) => {
  const recordsSortedByTraitsRarity = records.reduce((acc, record) => {
    const set = record.fields;

    let sum = 0;

    const traits = Object.keys(set).map((layer) => `${layer}:${set[layer]}`);

    for (const trait of traits) {
      if (maxedOutTraits.counts[trait]) {
        const n =
          1 /
          (maxedOutTraits.counts[trait].current /
            maxOccurancesOfAttribute[trait.split(":")[0]]);

        console.log({ n });

        sum += n;
      } else {
        //console.log({ set });
        return acc;
      }
    }

    //console.log({ sum });
    const result = { ...record, sum };
    return _.sortBy([...acc, result], "sum");
  }, []);

  fs.writeFile(
    "./data/recordsSortedByTraitsRarity.json",
    JSON.stringify(recordsSortedByTraitsRarity),
    () => console.log("success")
  );
};
