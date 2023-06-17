import _ from "lodash";
import records from "./data/records.json" assert { type: "json" };

const checkDuplicates = () => {
  const uniqs = _.uniqWith(records, (a, b) => _.isEqual(a.fields, b.fields));

  console.log(records.length, uniqs.length, records.length - uniqs.length);
};

const turnSetToArr = (obj) => {
  return Object.keys(obj).map((layer) => `${layer}:${obj[layer]}`);
};

const checkSimilar = () => {
  const similars = records.reduce((acc, record) => {
    const set = record.fields;
    const setArr = turnSetToArr(set);
    const similarToSet = records.reduce((acc, rec) => {
      const intersection = _.intersection(setArr, turnSetToArr(rec.fields));
      console.log(intersection, intersection.length);
      return rec.id !== record.id && intersection.length >= 2
        ? [...acc, { set, intersection }]
        : acc;
    }, []);

    if (_.isEmpty(similarToSet)) {
      return acc;
    }

    return [
      ...acc,
      {
        set,
        similars: similarToSet,
      },
    ];
  }, []);

  console.log({ similars }, similars.length);
};

const checkSimilar2 = () => {
  const similars = _.uniqWith(
    records,
    (a, b) =>
      _.intersection(turnSetToArr(a.fields), turnSetToArr(b.fields)).length < 3
  );

  console.log({ similars: similars.map((s) => s.fields) }, similars.length);
};

checkSimilar2();
