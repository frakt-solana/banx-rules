import airtable from "airtable";
import fs from "fs";
import traits from "./traits.json" assert { type: "json" };

airtable.configure({
  endpointUrl: "https://api.airtable.com",
  apiKey:
    "patAMXj3c4gedrbRE.5e3eefbdc79625812d0fd2290d103a67d6eb846f3810cdd64696b852a5224e70",
});

const base = airtable.base("appuQP7QzvQwbl6dP");

const getApprovedSheet = async () => {
  const table = base("Approve");
  const records = await table.select({ pageSize: 100 }).all();
  console.log("# loaded records", records.length);
  return records.map((record) => record.fields);
};

const getMaxedOutTraits = (approvedSets) => {
  const approvedTraitsCount = approvedSets.reduce((acc, set) => {
    const keyValues = Object.keys(set).map((key) => `${key}:${set[key]}`);

    return keyValues.reduce((counts, key) => {
      return { ...counts, [key]: counts[key] ? counts[key] + 1 : 1 };
    }, acc);
  }, {});

  const maxed = Object.keys(approvedTraitsCount).reduce((acc, key) => {
    const trait = traits.find((i) => i.Key === key);
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

fs.writeFileSync(
  "./maxedOutTraits.json",
  JSON.stringify(getMaxedOutTraits(await getApprovedSheet()))
);
