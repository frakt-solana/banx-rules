import airtable from "airtable";

airtable.configure({
  endpointUrl: "https://api.airtable.com",
  apiKey:
    "patAMXj3c4gedrbRE.5e3eefbdc79625812d0fd2290d103a67d6eb846f3810cdd64696b852a5224e70",
});

const base = airtable.base("appuQP7QzvQwbl6dP");

const getApprovedSheet = async () => {
  const table = base("Approve");
  const records = await table.select({ pageSize: 100 }).all();
  return records.map((record) => record.fields);
};

console.log(await getApprovedSheet());
