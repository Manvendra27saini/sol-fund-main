import React from "react";
import * as anchor from "@project-serum/anchor";
import {
  useAnchorWallet,
  useConnection,
  useWallet,
} from "@solana/wallet-adapter-react";
import { PublicKey, SystemProgram, Connection } from "@solana/web3.js";
import idl from "../idl.json";
import { findProgramAddressSync } from "@project-serum/anchor/dist/cjs/utils/pubkey";
import { utf8 } from "@project-serum/anchor/dist/cjs/utils/bytes";
import toast from "react-hot-toast";
import { useLocation, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../redux/hook";
import { addRecipient } from "../redux/slice/RecepientSlice";
import { addCampaign, clearCampaign } from "../redux/slice/CampaignSlice";
import {
  addTransaction,
  clearTransactions,
} from "../redux/slice/TransactionSlice";

const PROGRAM_KEY = new PublicKey(idl.metadata.address);

type bioT = {
  name: string;
  description: string;
};

export const AppContext = React.createContext<{
  step: number;
  setStep: any;
  smartContract: any;
  user: any;
  transactionPending: any;
  getUser: any;
  tags: any;
  setTags: any;
  bio: bioT;
  setBio: any;
  initialized: any;
  amount: number;
  setAmount: any;
  initUser: any;
  getAllCampaigns: any;
  getACampaign: any;
  donate: any;
}>({
  step: 1,
  setStep: undefined,
  smartContract: undefined,
  user: undefined,
  transactionPending: undefined,
  getUser: undefined,
  tags: undefined,
  setTags: undefined,
  bio: { name: "", description: "" },
  setBio: undefined,
  initialized: undefined,
  amount: 0,
  setAmount: undefined,
  initUser: undefined,
  getAllCampaigns: undefined,
  getACampaign: undefined,
  donate: undefined,
});

export const AppProvider = ({ children }: any) => {
  const [step, setStep] = React.useState<number>(1);
  const [transactionPending, setTransactionPending] = React.useState(false);
  const [initialized, setInitialized] = React.useState(false);
  const [tags, setTags] = React.useState<string[]>([]);
  const [bio, setBio] = React.useState({
    name: "",
    description: "",
  });
  const [amount, setAmount] = React.useState<number>(0);
  const anchorWallet = useAnchorWallet();
  const { connection } = useConnection();
  const [user, setUser] = React.useState({
    pda: "",
    name: "",
    amountDonated: 0,
    amountRequired: 0,
    description: "",
    donationComplete: false,
  });
  const { publicKey } = useWallet();
  const navigate = useNavigate();
  const location = useLocation();
  // console.log("publickey type", publicKey);
  const dispatch = useAppDispatch();
  const recipient = useAppSelector((state) => state.recipient);
  const smartContract = React.useMemo(() => {
    if (anchorWallet && publicKey) {
      const provider = new anchor.AnchorProvider(
        connection,
        anchorWallet,
        anchor.AnchorProvider.defaultOptions()
      );
      return new anchor.Program(idl as any, PROGRAM_KEY, provider);
    }
  }, [connection, anchorWallet]);
  const getUser = async () => {
    setTransactionPending(true);
    try {
      if (smartContract && publicKey) {
        const [CampaignPda] = findProgramAddressSync(
          [utf8.encode("COMPAIGN_DEMO"), publicKey.toBuffer()],
          smartContract.programId
        );

        const data: any = await smartContract.account.campaign.fetch(
          CampaignPda
        );

        if (data) {
          // console.log("pda", CampaignPda.toString());
          setUser({
            ...user,
            pda: CampaignPda.toString(),
            name: data.name,
            amountDonated: data.amountDonated.toNumber(),
            amountRequired: data.amountRequired.toNumber(),
            description: data.description,
            donationComplete: data.donationComplete,
          });
        }
        setInitialized(true);
        setTransactionPending(false);
        navigate(location.state);
        return;
      }
    } catch (err: any) {
      if (err.message.includes("Account does not exist or has no data")) {
        toast.success("Welcome, create an Account");
        navigate("onboarding");
        return;
      }
      toast.success(err.message);

      console.log(err.message);
    }
  };

  const initUser = async () => {
    setTransactionPending(true);
    try {
      if (smartContract && publicKey) {
        const [CampaignPda] = findProgramAddressSync(
          [utf8.encode("COMPAIGN_DEMO"), publicKey.toBuffer()],
          smartContract.programId
        );

        await smartContract.methods
          .create(
            bio.name,
            new anchor.BN(12),
            new anchor.BN(amount),
            tags,
            bio.description
          )
          .accounts({
            campaign: CampaignPda,
            user: publicKey,
            systemProgram: SystemProgram.programId,
          })
          .rpc();
        navigate("/profile");
      }
    } catch (err: any) {
      toast.success(err.message);

      console.log(err);
    } finally {
      setTransactionPending(false);
    }
  };

  const getAllCampaigns = async () => {
    try {
      if (smartContract && publicKey) {
        setTransactionPending(true);
        // campaigns.length = 0;
        const data = await smartContract.account.campaign.all();
        // campaigns.map((d) => d.pop());
        if (data) {
          dispatch(clearCampaign());
          data.forEach((d: any) => {
            var res = {
              pubKey: d.publicKey.toString(),
              name: d.account.name,
              amountDonated: d.account.amountDonated.toNumber(),
              amountRequired: d.account.amountRequired.toNumber(),
              description: d.account.description,
              donationComplete: d.account.donationComplete,
              id: d.account.id,
            };
            dispatch(addCampaign(res));
          });
          return;
        }
      }
    } catch (err: any) {
      toast.success(err.message);
      console.log(err);
    } finally {
      setTransactionPending(false);
    }
  };

  const getACampaign = async (pub: string) => {
    try {
      if (smartContract && publicKey) {
        const val: any = await smartContract.account.campaign.all();
        if (val) {
          console.log(val);
          // const val: any = campaign.find((d) => {
          //   return d.publicKey.toString() === pub;
          // });
          // campaign.map((val: any) => {
          for (let i = 0; i < val.length; i++) {
            console.log(val[i], val[i].publicKey.toString(), pub.toString());
            if (val[i].publicKey.toString() === pub.toString()) {
              // console.log(val[i]);
              dispatch(
                addRecipient({
                  publicKey: val[i].publicKey,
                  name: val[i].account.name,
                  description: val[i].account.description,
                  amountDonated: val[i].account.amountDonated.toNumber(),
                  amountRequired: val[i].account.amountRequired.toNumber(),
                  donationComplete: val[i].account.donationComplete,
                  // donationComplete: false,
                })
              );
            }
          }
          // });
        }
      }
    } catch (err: any) {
      toast.success(err.message);
      console.log(err);
    } finally {
      setTransactionPending(false);
    }
  };

  const donate = async (val: number) => {
    try {
      setTransactionPending(true);
      if (smartContract && publicKey && recipient.publicKey) {
        const [CampaignPda] = findProgramAddressSync(
          [utf8.encode("COMPAIGN_DEMO"), recipient.publicKey.toBuffer()],
          smartContract.programId
        );

        await smartContract.methods
          .donate(new anchor.BN(val))
          .accounts({
            campaign: recipient.publicKey,
            user: publicKey,
            systemProgram: SystemProgram.programId,
          })
          .rpc();

        toast.success("You have successfully donated");
        // window.reload()
      }
    } catch (err: any) {
      toast.success(err.message);
      console.log(err);
    } finally {
      setTransactionPending(false);
    }
  };

  const getTransactions = async () => {
    const endpoint =
      "https://virulent-ultra-replica.solana-devnet.quiknode.pro/8d0f174b8b11b55aee43b27a6f913fff39963312/";
    const solanaConnection = new Connection(endpoint);

    if (smartContract && publicKey) {
      let transactionList = await solanaConnection?.getSignaturesForAddress(
        publicKey,
        { limit: 5 }
      );
      dispatch(clearTransactions());
      transactionList.forEach((transaction: any, i: number) => {
        const date = new Date(transaction.blockTime * 1000);
        dispatch(
          addTransaction({
            transactionNo: i + 1,
            time: date,
            signature: transaction.signature,
            status: transaction.confirmationStatus,
          })
        );
        // console.log(`Transaction No: ${i + 1}`);
        // console.log(`Signature: ${transaction.signature}`);
        // console.log(`Time: ${date}`);
        // console.log(`Status: ${transaction.confirmationStatus}`);
        // console.log("-".repeat(20));
        // console.log(transaction);
      });
    }
  };
  React.useEffect(() => {
    getUser();
    getTransactions();
  }, [publicKey]);

  return (
    <AppContext.Provider
      value={{
        user,
        transactionPending,
        step,
        setStep,
        smartContract,
        getUser,
        tags,
        setTags,
        bio,
        setBio,
        initialized,
        amount,
        setAmount,
        initUser,
        getAllCampaigns,
        getACampaign,
        donate,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export default AppProvider;
