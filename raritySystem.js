import _, { includes, range } from "lodash";
import records from "./data/recordsSortedByTraitsRarity.json" assert { type: "json" };
import gnomiesRankedByRarity from "./data/gnomiesRarity.json" assert { type: "json" };

const exampleFraktMetadata =
  '{"name":"Frakt-1354","symbol":"FKT","description":"","seller_fee_basis_points":500,"image":"https://www.arweave.net/P21vSOj4Rax1HJNHztxL4jruLAvCxFbbpGigfD7yL6c","animation_url":"","external_url":"https://frakt.art/explore/CH2iNegF8qM99YSZpy7vWiuWLBZwbFkfiouTbrWityci","attributes":[{"trait_type":"shape","value":"Portal"},{"trait_type":"color","value":"Orange"},{"trait_type":"player points","value":"2"},{"trait_type":"partner points","value":"20"}],"properties":{"files":["https://www.arweave.net/EikRDX05cvH_zH0JdMZmTgdjsSavSeLkcvpKFnWnSgw","https://www.arweave.net/igiz6Le-PpzBZZJW3qBDRQuctGuoEBxGNBThYeB-GbM","https://www.arweave.net/Kqp4Mzlc2f2O2tLg06JCBM5ejy4_qXIch2LoM37slww"],"creators":[{"address":"6wPYbuGRXZjVw2tCeTxwRiQU7AzFDTeFEKuUFpJZpcix","share":100}]},"collection":{"name":"Frakt","family":"Frakt"}}';

const exampleGnomieMetadata =
  '{"name":"Pawnshop gnomie #1084","symbol":"PWNG","description":"DAO-based NFT pawnshop","seller_fee_basis_points":500,"external_url":"https://pawnshopgnomies.com","image":"https://www.arweave.net/T0qtNo2aKxo-K3tZx087GbzE6Q7hVelHJOnLPV9tjZo?ext=png","attributes":[{"trait_type":"Background","value":"Mint"},{"trait_type":"Body","value":"Classic"},{"trait_type":"Cloth","value":"Prince jacket"},{"trait_type":"Beard","value":"Long mustache"},{"trait_type":"Hat","value":"No hat"},{"trait_type":"Ears","value":"Nothing"},{"trait_type":"Eyes","value":"Classic"},{"trait_type":"Mouth","value":"Nothing"},{"trait_type":"player points","value":"1"},{"trait_type":"partner points","value":"63"}],"collection":{"name":"Pawnshop Gnomies","family":"Pawnshop Gnomies"},"properties":{"category":"image","files":[{"uri":"https://www.arweave.net/T0qtNo2aKxo-K3tZx087GbzE6Q7hVelHJOnLPV9tjZo?ext=png","type":"image/png"}],"creators":[{"address":"EEgrfJLLdEo8GdP25BCLAaEAofcGq7Bq1Qpb9ZrXizGm","share":100}]}}';

const TIERS = _.sortBy(
  [
    { name: "1/1", chance: 0.1 },
    { name: "Legendary", chance: 1 },
    { name: "Epic", chance: 7 },
    { name: "Rare", chance: 11.4 },
    { name: "Uncommon", chance: 37.8 },
    { name: "Common", chance: 42.7 },
  ],
  "chance"
);

const LAYERS_NAMES = ["Background", "Fur", "Body", "Mouth", "Head", "Eyes"];

const legendaryFraktCustomRanks = [19976, 19977];
const legendaryGnomieCustomRanks = [19978, 19979];
const epicCustomRanks = [19980, 19981, 19982, 19983];
const rareCustomRanks = [19984, 19985, 19986, 19987];
const uncommonCustomRanks = [19988, 19989, 19990, 19991];
const commonCustomRanks = [19992, 19993, 19994, 19995];
const publicCustomRanks = [19996, 19997, 19998, 19999, 20000];

const allCustomRanks = [
  ...legendaryFraktCustomRanks,
  ...legendaryGnomieCustomRanks,
  ...epicCustomRanks,
  ...rareCustomRanks,
  ...uncommonCustomRanks,
  ...commonCustomRanks,
  ...publicCustomRanks,
];

const allCustomRanksWithoutPublic = [
  ...legendaryFraktCustomRanks,
  ...legendaryGnomieCustomRanks,
  ...epicCustomRanks,
  ...rareCustomRanks,
  ...uncommonCustomRanks,
  ...commonCustomRanks,
];

const filterTakenUtilityRanks = (utilityRank) => {
  const takenUtilityRank = [1, 4, 6];
  return !takenUtilityRank.includes(utilityRank);
};

const utilityRanksWithTraits = [
  ..._.range(1, 5 + 1).map(() => [
    { trait_type: "player points", value: 88 },
    { trait_type: "partner points", value: 880 },
  ]),
  ..._.range(1, 10 + 1).map(() => [
    { trait_type: "player points", value: 58 },
    { trait_type: "partner points", value: 587 },
  ]),
  ..._.range(1, 10 + 1).map(() => [
    { trait_type: "player points", value: 44 },
    { trait_type: "partner points", value: 440 },
  ]),
  ..._.range(1, 10 + 1).map(() => [
    { trait_type: "player points", value: 35 },
    { trait_type: "partner points", value: 352 },
  ]),
  ...range(1, 20 + 1).map(() => [
    { trait_type: "player points", value: 17 },
    { trait_type: "partner points", value: 176 },
  ]),
  ...range(1, 30 + 1).map(() => [
    { trait_type: "player points", value: 11 },
    { trait_type: "partner points", value: 117 },
  ]),
  ...range(1, 80 + 1).map(() => [
    { trait_type: "player points", value: 8 },
    { trait_type: "partner points", value: 88 },
  ]),
  ...range(1, 1145 + 1).map(() => [
    { trait_type: "player points", value: 1 },
    { trait_type: "partner points", value: 63 },
  ]),
  ...range(1, 3130 + 1).map(() => [
    { trait_type: "player points", value: 1 },
    { trait_type: "partner points", value: 63 },
  ]),
];

const getDescriptionBasedOnRank = (rank) => {
  if (allCustomRanks.includes(rank)) {
    //TODO: custom description
  }

  const record = records.find((r) => r.rank === rank);

  let description = `Banx is the frakt protocol's collection. Each Banx unlocks a share of revenue and governance proportional to its Partner points. Every Banx makes you a first-class user of the protocol, with discounts and boosts proportional to its Player points. Art by Tainaker, Utility by frakt, Community by you. `;

  if (record.fields.Set) {
    const setName = record.fields.Set;
    const setBoss = record.fields["Set Boss"];
    description += `This Banx is part of the ${setName} Set. `;

    if (setBoss) {
      description += `This Banx is the ${setBoss}.`;
    }
  }

  return description.trim();
};

const getBaseBanxMetadata = ({ tier, oldAttributes, rank }) => {
  const pointsAttributes = _.filter(
    oldAttributes,
    (trait) =>
      trait.trait_type === "player points" ||
      trait.trait_type === "partner points"
  );
  const { imageUrl, imageAttributes } = getImage(rank);

  const description = getDescriptionBasedOnRank(rank);
  return {
    name: `Banx #${rank}`,
    symbol: "BANX",
    description,
    seller_fee_basis_points: 420,
    external_url: "https://frakt.xyz",
    image: imageUrl,
    attributes: [
      ...pointsAttributes,
      ...imageAttributes,
      { trait_type: "Tier", value: tier.name },
    ],
    properties: {
      category: "image",
      files: [
        {
          uri: imageUrl,
          type: "image/png",
        },
      ],
      creators: [
        { address: "bnxZZLyvcezhYxRzBwdw7duK9Q9DN26Jd9YZhizTnwg", share: 100 },
      ],
    },
  };
};

const getImage = (rank) => {
  if (allCustomRanks.includes(rank)) {
    const imageUrl = `https://banxnft.s3.amazonaws.com/images/custom.png`;
    return { imageUrl, imageAttributes: [] };
  }

  const imageUrl = `https://banxnft.s3.amazonaws.com/images/${rank}.png`;
  const attributes = records.find((rec) => rec.rank === rank).fields;
  const imageAttributes = Object.keys(attributes)
    .filter((key) => LAYERS_NAMES.includes(key))
    .map((key) => ({
      trait_type: key,
      value: imageAttributes[key],
    }));
  // TODO: get image based on tier
  return { imageUrl, imageAttributes };
};

const filterTakenRanks = (rank) => {
  const takenRanks = [1, 3, 545];
  return !takenRanks.includes(rank);
};

// TODO add 10 - 1/1 to traits based an 15 to public mint

const getTraitsBasedOnInputNFT = (inputMetadata) => {
  const metadataObj = JSON.parse(inputMetadata);

  // мб тут еще лучше какая-то проверка по креатору, нфт может быть битая
  if (metadataObj.symbol === "FKT") {
    const shape = metadataObj.attributes.find(
      (atr) => atr.trait_type === "shape"
    ).value;

    const color = metadataObj.attributes.find(
      (atr) => atr.trait_type === "color"
    ).value;

    // ! TIER LEGENDARY
    if (shape === "Wave") {
      //
      // ! RAINBOW WAVES = 10 top Banx
      if (color === "Rainbow") {
        const allowedRanks = _.range(1, 10 + 1).filter(filterTakenRanks);
        const rank = _.sample(_.shuffle(allowedRanks));

        const banxMetadata = getBaseBanxMetadata({
          tier: TIERS[1],
          oldAttributes: metadataObj.attributes,
          rank,
        });
      }

      // ! TRYING CHANCES IN 1/1

      const customTry = _.sample(
        [..._.range(10, 151 + 1), ...legendaryFraktCustomRanks].filter(
          filterTakenRanks
        )
      );

      if (legendaryFraktCustomRanks.includes(customTry)) {
        const rank = customTry;

        const banxMetadata = getBaseBanxMetadata({
          tier: TIERS[0],
          oldAttributes: metadataObj.attributes,
          rank,
        });
      }

      //
      // ! RED WAVES = 10 - 30 top Banx
      if (color === "Red") {
        // мб где-то тут чекать занятые id
        const allowedRanks = _.range(11, 30 + 1).filter(filterTakenRanks);
        const rank = _.sample(_.shuffle(allowedRanks));

        const banxMetadata = getBaseBanxMetadata({
          tier: TIERS[1],
          oldAttributes: metadataObj.attributes,
          rank,
        });
      }

      //
      // ! ORANGE WAVES = 30 - 60 top Banx
      if (color === "Orange") {
        // мб где-то тут чекать занятые id
        const allowedRanks = _.range(31, 60 + 1).filter(filterTakenRanks);
        const rank = _.sample(_.shuffle(allowedRanks));

        const banxMetadata = getBaseBanxMetadata({
          tier: TIERS[1],
          oldAttributes: metadataObj.attributes,
          rank,
        });
      }

      //
      // ! WHITE WAVES = 60 - 100 top Banx
      if (color === "White") {
        // мб где-то тут чекать занятые id
        const allowedRanks = _.range(61, 100 + 1).filter(filterTakenRanks);
        const rank = _.sample(_.shuffle(allowedRanks));

        const banxMetadata = getBaseBanxMetadata({
          tier: TIERS[1],
          oldAttributes: metadataObj.attributes,
          rank,
        });
      }
    }

    // ! TIER EPIC
    if (shape === "Eye" || (shape === "Star" && color === "Magenta")) {
      // TODO: mint
      const allowedRanks = [
        ..._.range(201, 1600 + 1),
        ...epicCustomRanks,
      ].filter(filterTakenRanks);

      const rank = _.sample(_.shuffle(allowedRanks));
      const banxMetadata = getBaseBanxMetadata({
        tier: TIERS[2],
        oldAttributes: metadataObj.attributes,
        rank,
      });
    }

    // ! TIER RARE
    if (
      (shape === "Star" && color === "Red") ||
      (shape === "Portal" && color === "Magenta") ||
      (shape === "Net" && color === "Magenta")
    ) {
      const allowedRanks = [
        ..._.range(1601, 3880 + 1),
        ...rareCustomRanks,
      ].filter(filterTakenRanks);
      const rank = _.sample(_.shuffle(allowedRanks));
      const banxMetadata = getBaseBanxMetadata({
        tier: TIERS[3],
        oldAttributes: metadataObj.attributes,
        rank,
      });
    }

    // ! TIER UNCOMMON
    if (
      (shape === "Portal" && color === "Red") ||
      (shape === "Star" && color === "Orange") ||
      (shape === "Star" && color === "White") ||
      (shape === "Net" && color === "Red") ||
      (shape === "Portal" && color === "Orange")
    ) {
      const allowedRanks = [
        ..._.range(3881, 11440 + 1),
        ...uncommonCustomRanks,
      ].filter(filterTakenRanks);
      const rank = _.sample(_.shuffle(allowedRanks));
      const banxMetadata = getBaseBanxMetadata({
        tier: TIERS[4],
        oldAttributes: metadataObj.attributes,
        rank,
      });
    }

    // ! TIER COMMON
    if (
      (shape === "Portal" && color === "White") ||
      (shape === "Net" && color === "Orange") ||
      (shape === "Net" && color === "White")
    ) {
      const allowedRanks = [
        ..._.range(11441, 19975 + 1),
        ...commonCustomRanks,
      ].filter(filterTakenRanks);
      const rank = _.sample(_.shuffle(allowedRanks));
      const banxMetadata = getBaseBanxMetadata({
        tier: TIERS[5],
        oldAttributes: metadataObj.attributes,
        rank,
      });
    }
  }

  if (metadataObj.symbol === "PWNG") {
    const exampleTokenMint = "GhJPR4QxADvero4ot5yGFSqqYYnAA2SQzjX497ZMxnBP";
    const tokenMint = exampleTokenMint;
    const gnomieWithRarityRank = gnomiesRankedByRarity.find(
      (gnomie) => gnomie.mint === tokenMint
    );
    const gnomieRank = gnomieWithRarityRank.rank;

    //! TIER LEGENDARY
    if (gnomieRank <= 55) {
      const allowedRanks = [
        ..._.range(101, 155 + 1),
        ...legendaryGnomieCustomRanks,
      ].filter(filterTakenRanks);
      const rank = _.sample(_.shuffle(allowedRanks));

      const banxMetadata = getBaseBanxMetadata({
        tier: TIERS[1],
        oldAttributes: metadataObj.attributes,
        rank,
      });
    }

    //
    // ! TIER EPIC
    if (gnomieRank <= 445) {
      const allowedRanks = [
        ..._.range(201, 1600 + 1),
        ...epicCustomRanks,
      ].filter(filterTakenRanks);
      const rank = _.sample(_.shuffle(allowedRanks));

      const banxMetadata = getBaseBanxMetadata({
        tier: TIERS[2],
        oldAttributes: metadataObj.attributes,
        rank,
      });
    }

    //
    // ! TIER RARE
    if (gnomieRank <= 1080) {
      const allowedRanks = [
        ..._.range(1601, 3880 + 1),
        ...rareCustomRanks,
      ].filter(filterTakenRanks);
      const rank = _.sample(_.shuffle(allowedRanks));

      const banxMetadata = getBaseBanxMetadata({
        tier: TIERS[3],
        oldAttributes: metadataObj.attributes,
        rank,
      });
    }

    //
    // ! TIER UNCOMMON
    if (gnomieRank <= 3180) {
      const allowedRanks = [
        ..._.range(3881, 11440 + 1),
        ...uncommonCustomRanks,
      ].filter(filterTakenRanks);
      const rank = _.sample(_.shuffle(allowedRanks));

      const banxMetadata = getBaseBanxMetadata({
        tier: TIERS[4],
        oldAttributes: metadataObj.attributes,
        rank,
      });
    }

    //
    // ! TIER COMMON
    if (gnomieRank <= 5555) {
      const allowedRanks = [
        ..._.range(11441, 19975 + 1),
        ...commonCustomRanks,
      ].filter(filterTakenRanks);
      const rank = _.sample(_.shuffle(allowedRanks));

      const banxMetadata = getBaseBanxMetadata({
        tier: TIERS[5],
        oldAttributes: metadataObj.attributes,
        rank,
      });
    }
  }
};

const getPublicMintNFT = () => {
  // get random rank
  const rank = _.sample(
    _.shuffle(
      _.range([1, 20000])
        .filter(
          (rank) =>
            !allCustomRanksWithoutPublic.includes(rank) &&
            !_.range(1, 155 + 1).includes(rank)
        )
        .filter(filterTakenRanks)
    )
  );

  // ! TIER 1/1
  if (publicCustomRanks.includes(rank)) {
    const banxMetadata = getBaseBanxMetadata({
      tier: TIERS[0],
      oldAttributes: [
        { trait_type: "player points", value: 24 },
        { trait_type: "partner points", value: 1021 },
      ],
      rank,
    });
  }

  // ! TIER LEGENDARY
  if (rank <= 200) {
    const highestUtilityRank = _.first(
      _.range(0, 166).filter(filterTakenUtilityRanks)
    );
    const traits = utilityRanksWithTraits[highestUtilityRank];

    //TODO: save selected rank

    const banxMetadata = getBaseBanxMetadata({
      tier: TIERS[1],
      oldAttributes: traits,
      rank,
    });
  }

  // ! TIER EPIC
  if (rank <= 1600) {
    const highestUtilityRank = _.first(
      _.range(27, 1161).filter(filterTakenUtilityRanks)
    );

    const traits = utilityRanksWithTraits[highestUtilityRank];

    const banxMetadata = getBaseBanxMetadata({
      tier: TIERS[2],
      oldAttributes: traits,
      rank,
    });
  }

  // ! TIER RARE
  if (rank <= 3880) {
    const highestUtilityRank = _.first(
      _.range(166, 5555).filter(filterTakenUtilityRanks)
    );

    const traits = utilityRanksWithTraits[highestUtilityRank];

    const banxMetadata = getBaseBanxMetadata({
      tier: TIERS[3],
      oldAttributes: traits,
      rank,
    });
  }

  // ! TIER UNCOMMON
  if (rank <= 11440) {
    const highestUtilityRank = _.first(
      _.range(11441, 5555).filter(filterTakenUtilityRanks)
    );

    const traits = utilityRanksWithTraits[highestUtilityRank];

    const banxMetadata = getBaseBanxMetadata({
      tier: TIERS[4],
      oldAttributes: traits,
      rank,
    });
  }

  // ! TIER COMMON
  if (rank) {
    const highestUtilityRank = _.first(
      _.range(1161, 5555).filter(filterTakenUtilityRanks)
    );

    const traits = utilityRanksWithTraits[highestUtilityRank];

    const banxMetadata = getBaseBanxMetadata({
      tier: TIERS[5],
      oldAttributes: traits,
      rank,
    });
  }
};

//getTraitsBasedOnInputNFT(exampleFraktMetadata);
