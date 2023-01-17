import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/router";
import { useAddress } from "@thirdweb-dev/react";
import { useContract } from "@thirdweb-dev/react";
import { client } from "../../lib/sanityClient";
import Header from "../../components/Header";
import { CgWebsite } from "react-icons/cg";
import { AiOutlineInstagram, AiOutlineTwitter } from "react-icons/ai";
import { HiDotsVertical } from "react-icons/hi";
import NFTCard from "../../components/NFTCard";

const style = {
  bannerImageContainer: `h-[20vh] w-screen overflow-hidden flex justify-center items-center`,
  bannerImage: `w-full object-cover`,
  infoContainer: `w-screen px-4`,
  midRow: `w-full flex justify-center text-white`,
  endRow: `w-full flex justify-end text-white`,
  profileImg: `w-40 h-40 object-cover rounded-full border-2 border-[#202225] mt-[-4rem]`,
  socialIconsContainer: `flex text-3xl mb-[-2rem]`,
  socialIconsWrapper: `w-44`,
  socialIconsContent: `flex container justify-between text-[1.4rem] border-2 rounded-lg px-2`,
  socialIcon: `my-2`,
  divider: `border-r-2`,
  title: `text-5xl font-bold mb-4`,
  createdBy: `text-lg mb-4`,
  statsContainer: `w-[44vw] flex justify-between py-4 border border-[#151b22] rounded-xl mb-4`,
  collectionStat: `w-1/4`,
  statValue: `text-3xl font-bold w-full flex items-center justify-center`,
  ethLogo: `h-6 mr-2`,
  statName: `text-lg w-full text-center mt-1`,
  description: `text-[#8a939b] text-xl w-max-1/4 flex-wrap mt-4`,
};

const MyNfts = () => {
  const router = useRouter();
  const address = useAddress();

  const [collection, setCollection] = useState({});
  const [nfts, setNfts] = useState([]);
  const [listings, setListings] = useState([]);

  console.log(`The Provider is ${address}`);

  // get the nft-collection
  const { contract: nftModules } = useContract(
    "0x7bBeB929392E104BAB9f4D72d6472cf849360E8f",
    "nft-collection"
  );

  const nftModule = useMemo(() => {
    if (!address) return;
    return nftModules;
  }, [nftModules]);

  // get all NFTs in the collection
  useEffect(() => {
    if (!nftModule) {
      return;
    }
    (async () => {
      try {
        const nfts = await nftModule.getOwned(address);
        setNfts(nfts);
      } catch (e) {
        console.log(e);
      }
    })();
  }, [nftModule]);

  // Get our marketplace contract
  const { contract: marketPlaceModules } = useContract(
    "0x933771f3bABB03a29a2AC79ED015748Edbe8973B",
    "marketplace"
  );
  const marketPlaceModule = useMemo(() => {
    if (!address) return;
    return marketPlaceModules;
  }, [address, marketPlaceModules]);

  // get all listings in the our marketplace
  useEffect(() => {
    if (!marketPlaceModule) return;
    (async () => {
      setListings(await marketPlaceModule.getActiveListings());
    })();
  }, [marketPlaceModule]);

  // query the user data from our sanity by using our GROQ query
  const fetchCollectionData = async (sanityClient = client) => {
    const query = `*[_type == "marketItems" && contractAddress == "0x7bBeB929392E104BAB9f4D72d6472cf849360E8f" ] {
      "imageUrl": profileImage.asset->url,
      "bannerImageUrl": bannerImage.asset->url,
      volumeTraded,
      createdBy,
      contractAddress,
      "creator": createdBy->userName,
      title, floorPrice,
      "allOwners": owners[]->,
      description
    }`;

    // console.log(`this is the image uri:${query.imageUrl}`);
    const collectionData = await sanityClient.fetch(query);

    console.log(collectionData, "🔥");

    // the query returns 1 object inside of an array
    await setCollection(collectionData[0]);
  };

  useEffect(() => {
    fetchCollectionData();
  }, ["0x7bBeB929392E104BAB9f4D72d6472cf849360E8f"]);

  return (
    <div className="overflow-hidden">
      <Header />
      <div className={style.bannerImageContainer}>
        <img
          className={style.bannerImage}
          src={collection?.bannerImageUrl ? collection.bannerImageUrl : ""}
          alt="banner"
        />
      </div>
      <div className={style.infoContainer}>
        <div className={style.midRow}>
          <img
            className={style.profileImg}
            src={
              collection?.imageUrl
                ? collection.imageUrl
                : "https://cdn.sanity.io/images/vqklqttt/production/321da653a0c1b7ea4c9cd609eb6b529ac972f15d-225x225.png"
            }
            alt="profile image"
          />
        </div>
        <div className={style.endRow}>
          <div className={style.socialIconsContainer}>
            <div className={style.socialIconsWrapper}>
              <div className={style.socialIconsContent}>
                <div className={style.socialIcon}>
                  <CgWebsite />
                </div>
                <div className={style.divider} />
                <div className={style.socialIcon}>
                  <AiOutlineInstagram />
                </div>
                <div className={style.divider} />
                <div className={style.socialIcon}>
                  <AiOutlineTwitter />
                </div>
                <div className={style.divider} />
                <div className={style.socialIcon}>
                  <HiDotsVertical />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className={style.midRow}>
          <div className={style.title}>{collection?.title}</div>
        </div>
        <div className={style.midRow}>
          <div className={style.createdBy}>
            Created by{" "}
            <span className="text-[#2081e2]">{collection?.creator}</span>
          </div>
        </div>
        <div className={style.midRow}>
          <div className={style.statsContainer}>
            <div className={style.collectionStat}>
              <div className={style.statValue}>{nfts.length}</div>
              <div className={style.statName}>items</div>
            </div>

            <div className={style.collectionStat}>
              <div className={style.statValue}>
                <img
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQHYglxCUmvOO85Gl6rTLx2ATmjUo03t4rypg&usqp=CAU"
                  alt="eth"
                  className={style.ethLogo}
                />
                {collection?.floorPrice}
              </div>
              <div className={style.statName}>floor price</div>
            </div>
            <div className={style.collectionStat}>
              <div className={style.statValue}>
                <img
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQHYglxCUmvOO85Gl6rTLx2ATmjUo03t4rypg&usqp=CAU"
                  alt="eth"
                  className={style.ethLogo}
                />
                {collection?.volumeTraded}.5K
              </div>
              <div className={style.statName}>volume traded</div>
            </div>
          </div>
        </div>
        <div className={style.midRow}>
          <div className={style.description}>{collection?.description}</div>
        </div>
      </div>
      <div className="flex flex-wrap ">
        {nfts.map((nftItem) => (
          <NFTCard
            key={nftItem.metadata.id}
            nftItem={nftItem}
            title={collection?.title}
            listings={listings}
          />
        ))}
      </div>
    </div>
  );
};

export default MyNfts;
