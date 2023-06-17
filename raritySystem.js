import _ from "lodash";

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

const getBaseBanxMetadata = ({ tier, oldAttributes }) => {
  const pointsAttributes = _.filter(
    oldAttributes,
    (trait) =>
      trait.trait_type === "player points" ||
      trait.trait_type === "partner points"
  );
  const { image, imageAttributes } = getImage(tier);

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
          uri: "image",
          type: "image/png",
        },
      ],
      creators: [
        { address: "bnxZZLyvcezhYxRzBwdw7duK9Q9DN26Jd9YZhizTnwg", share: 100 },
      ],
    },
  };
};

const getImage = (tier) => {
  // TODO: get image based on tier
  return { image: "", imageAttributes: [] };
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
      // TODO: mint
      const banxMetadata = getBaseBanxMetadata({
        tier: TIERS[1],
        oldAttributes: metadataObj.attributes,
      });
    }

    // ! TIER EPIC
    if (shape === "Eye" || (shape === "Star" && color === "Magenta")) {
      // TODO: mint
      const banxMetadata = getBaseBanxMetadata({
        tier: TIERS[2],
        oldAttributes: metadataObj.attributes,
      });
    }

    // ! TIER RARE
    if (
      (shape === "Star" && color === "Red") ||
      (shape === "Portal" && color === "Magenta") ||
      (shape === "Net" && color === "Magenta")
    ) {
      const banxMetadata = getBaseBanxMetadata({
        tier: TIERS[3],
        oldAttributes: metadataObj.attributes,
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
      const banxMetadata = getBaseBanxMetadata({
        tier: TIERS[4],
        oldAttributes: metadataObj.attributes,
      });
    }

    // ! TIER UNCOMMON
    if (
      (shape === "Portal" && color === "White") ||
      (shape === "Net" && color === "Orange") ||
      (shape === "Net" && color === "White")
    ) {
      const banxMetadata = getBaseBanxMetadata({
        tier: TIERS[5],
        oldAttributes: metadataObj.attributes,
      });
    }
  }

  if (metadataObj.symbol === "PWNG") {
    const bet = _.random(100, true);

    for (const tier of TIERS) {
      if (tier.chance <= bet) {
        //! pull new random NFT from tier sets
      }
    }
  }
};

//getTraitsBasedOnInputNFT(exampleFraktMetadata);
