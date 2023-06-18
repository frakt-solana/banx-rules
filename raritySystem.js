import _ from "lodash";
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

const getBaseBanxMetadata = ({ tier, oldAttributes, rank }) => {
  const pointsAttributes = _.filter(
    oldAttributes,
    (trait) =>
      trait.trait_type === "player points" ||
      trait.trait_type === "partner points"
  );
  const { imageUrl, imageAttributes } = getImage(rank);

  return {
    name: "Banx",
    symbol: "BANX",
    description: "",
    seller_fee_basis_points: 420,
    external_url: "https://frakt.xyz",
    image,
    attributes: [
      ...imageAttributes,
      ...pointsAttributes,
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
  const imageUrl = `https://banxnft.s3.amazonaws.com/images/${rank}.png`;
  const attributes = records.find((rec) => rec.rank === rank).fields;
  const imageAttributes = Object.keys(imageAttributes).map((key) => ({
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

      // TODO: mint
      const banxMetadata = getBaseBanxMetadata({
        tier: TIERS[1],
        oldAttributes: metadataObj.attributes,
        rank,
      });
    }

    // ! TIER EPIC
    if (shape === "Eye" || (shape === "Star" && color === "Magenta")) {
      // TODO: mint
      const allowedRanks = _.range(156, 1600 + 1).filter(filterTakenRanks);
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
      const allowedRanks = _.range(1601, 3880 + 1).filter(filterTakenRanks);
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
      const allowedRanks = _.range(3881, 11440 + 1).filter(filterTakenRanks);
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
      const allowedRanks = _.range(11441, 19975 + 1).filter(filterTakenRanks);
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
      const allowedRanks = _.range(101, 155 + 1).filter(filterTakenRanks);
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
      const allowedRanks = _.range(156, 1600 + 1).filter(filterTakenRanks);
      const rank = _.sample(_.shuffle(allowedRanks));

      const banxMetadata = getBaseBanxMetadata({
        tier: TIERS[1],
        oldAttributes: metadataObj.attributes,
        rank,
      });
    }

    //
    // ! TIER RARE
    if (gnomieRank <= 1080) {
      const allowedRanks = _.range(1601, 3880 + 1).filter(filterTakenRanks);
      const rank = _.sample(_.shuffle(allowedRanks));

      const banxMetadata = getBaseBanxMetadata({
        tier: TIERS[1],
        oldAttributes: metadataObj.attributes,
        rank,
      });
    }

    //
    // ! TIER UNCOMMON
    if (gnomieRank <= 3180) {
      const allowedRanks = _.range(3881, 11440 + 1).filter(filterTakenRanks);
      const rank = _.sample(_.shuffle(allowedRanks));

      const banxMetadata = getBaseBanxMetadata({
        tier: TIERS[1],
        oldAttributes: metadataObj.attributes,
        rank,
      });
    }

    //
    // ! TIER COMMON
    if (gnomieRank <= 5555) {
      const allowedRanks = _.range(11441, 19975 + 1).filter(filterTakenRanks);
      const rank = _.sample(_.shuffle(allowedRanks));

      const banxMetadata = getBaseBanxMetadata({
        tier: TIERS[1],
        oldAttributes: metadataObj.attributes,
        rank,
      });
    }
  }
};

//getTraitsBasedOnInputNFT(exampleFraktMetadata);
