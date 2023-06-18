import airtable from "airtable";
import fs from "fs";
import _ from "lodash";
import traits from "./data/traits.json" assert { type: "json" };
import setsCounts from "./data/setsTraitCount.json" assert { type: "json" };

const LAYERS_NAMES = ["Background", "Fur", "Body", "Mouth", "Head", "Eyes"];

import cron from "node-cron";

airtable.configure({
  endpointUrl: "https://api.airtable.com",
  apiKey:
    "patAMXj3c4gedrbRE.5e3eefbdc79625812d0fd2290d103a67d6eb846f3810cdd64696b852a5224e70",
});

const base = airtable.base("appuQP7QzvQwbl6dP");

const setsCountsByKey = setsCounts.reduce((acc, obj) => {
  const layer = Object.keys(obj)[0];

  const count = parseInt(Object.values(obj)[1]);

  return { ...acc, [`${layer}:${obj[layer]}`]: count };
}, {});

const getApprovedSheet = async () => {
  const table = base("Approve");
  console.log("# loading data...");
  const records = await table.select({ pageSize: 100 }).all();

  console.log("# loaded records", records.length);
  return { sets: records.map((record) => record.fields), records };
};

const getMaxedOutTraits = (approvedSets) => {
  const approvedTraitsCount = approvedSets.reduce((acc, set) => {
    const keyValues = Object.keys(set)
      .filter((key) => LAYERS_NAMES.includes(key))
      .map((key) => `${key}:${set[key]}`);

    return keyValues.reduce((counts, key) => {
      return { ...counts, [key]: counts[key] ? counts[key] + 1 : 1 };
    }, acc);
  }, {});

  const maxed = Object.keys(approvedTraitsCount).reduce((acc, key) => {
    const trait = traits.find((i) => i.Key === key);

    if (!traits.find((i) => i.Key === key)) {
      console.log("# cant find", key);
    }

    return trait
      ? { ...acc, [key]: approvedTraitsCount[key] >= trait.Count }
      : acc;
  }, {});

  const counts = Object.keys(approvedTraitsCount).reduce((acc, key) => {
    const trait = traits.find((i) => i.Key === key);
    return trait
      ? {
          ...acc,
          [key]: { current: approvedTraitsCount[key], max: trait.Count },
        }
      : acc;
  }, {});
  return { maxed, counts };
};

const sortRecordsByRaritySystem = (records, maxedOutTraits) => {
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
    const maxAttribute = _.find(_.reverse(sortedAttributesByCurrent), {
      layer,
    });
    return { ...acc, [layer]: maxAttribute.current };
  }, {});

  const recordsSortedByTraitsRarity = records.reduce((acc, record) => {
    const set = record.fields;

    let sum = 0;

    const traits = Object.keys(set)
      .filter((key) => LAYERS_NAMES.includes(key))
      .map((layer) => `${layer}:${set[layer]}`);

    for (const trait of traits) {
      if (maxedOutTraits.counts[trait]) {
        const traitLayer = trait.split(":")[0];
        const traitCount =
          traitLayer === "Fur"
            ? maxedOutTraits.counts[trait].current / 40
            : traitLayer === "Head"
            ? maxedOutTraits.counts[trait].current * 1.3
            : maxedOutTraits.counts[trait].current;
        const maxTraitCount = maxOccurancesOfAttribute[traitLayer];
        const n = 1 / (traitCount / maxTraitCount);

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

const loadAndSaveData = async () => {
  const { sets, records } = await getApprovedSheet();
  const maxedOutTraits = getMaxedOutTraits(sets);
  fs.writeFile("./maxedOutTraits.json", JSON.stringify(maxedOutTraits), () =>
    console.log("# success")
  );

  fs.writeFile(
    "./data/maxedOutTraits.json",
    JSON.stringify(maxedOutTraits),
    () => console.log("# success")
  );

  fs.writeFile("./data/approved.json", JSON.stringify(sets), () =>
    console.log("# success")
  );

  fs.writeFile("./data/records.json", JSON.stringify(records), () =>
    console.log("# success")
  );

  sortRecordsByRaritySystem(records, maxedOutTraits);
};

loadAndSaveData();

cron.schedule("*/5 * * * *", async () => {
  await loadAndSaveData();
  console.log("# updated data", new Date().toLocaleString());
});
