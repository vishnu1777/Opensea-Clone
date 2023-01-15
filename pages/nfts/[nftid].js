import Header from "../../components/Header";
import { useEffect, useMemo, useState } from "react";
import { useContract, useAddress } from "@thirdweb-dev/react";
import { useRouter } from "next/router";
import NFTImage from "../../components/nft/NFTImage";
import GeneralDetails from "../../components/nft/GeneralDetails";
import ItemActivity from "../../components/nft/ItemActivity";
import Purchase from "../../components/nft/Purchase";
import { CgLayoutGrid } from "react-icons/cg";

const style = {
  wrapper: `flex flex-col items-center container-lg text-[#e5e8eb]`,
  container: `container p-6`,
  topContent: `flex`,
  nftImgContainer: `flex-1 mr-4`,
  detailsContainer: `flex-[2] ml-4`,
};

const Nft = () => {
  const router = useRouter();
  const address = useAddress();
  const [selectedNft, setSelectedNft] = useState([]);
  const [listings, setListings] = useState([]);

  // nft collection section
  const { contract: nftModules } = useContract(
    "0x7bBeB929392E104BAB9f4D72d6472cf849360E8f",
    "nft-collection"
  );

  const nftModule = useMemo(() => {
    if (!address) return;
    return nftModules;
  }, [selectedNft]);

  useEffect(() => {
    if (!nftModule) return;
    (async () => {
      const nfts = await nftModule.getAll();

      const selectedNftItem = nfts.map((nft) => {
        if (nft.metadata.id === router.query.nftid) {
          console.log(`here we select ${nft.metadata.id}`);

          setSelectedNft(nft.metadata);

          return;
        }
      });
    })();
  }, [nftModule]);

  // Maket place module section
  const { contract: marketPlaceModules } = useContract(
    "0x933771f3bABB03a29a2AC79ED015748Edbe8973B",
    "marketplace"
  );

  const marketPlaceModule = useMemo(() => {
    if (!address) return;
    return marketPlaceModules;
  }, [marketPlaceModules]);

  useEffect(() => {
    if (!marketPlaceModule) return;
    (async () => {
      setListings(await marketPlaceModule.getActiveListings());
    })();
  }, [marketPlaceModules]);

  return (
    <div>
      <Header />
      <div className={style.wrapper}>
        <div className={style.container}>
          <div className={style.topContent}>
            <div className={style.nftImgContainer}>
              <NFTImage selectedNft={selectedNft} />
            </div>
            <div className={style.detailsContainer}>
              <GeneralDetails selectedNft={selectedNft} />
              <Purchase
                isListed={router.query.isListed}
                selectedNft={selectedNft}
                listings={listings}
                marketPlaceModule={marketPlaceModule}
              />
            </div>
          </div>
          <ItemActivity />
        </div>
      </div>
    </div>
  );
};

export default Nft;
