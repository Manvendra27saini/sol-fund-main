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
import { addTransaction, clearTransactions } from "../redux/slice/TransactionSlice";

const PROGRAM_KEY = new PublicKey(idl.metadata.address);

type BioT = {
  name: string;
  description: string;
};

export const AppContext = React.createContext<{
  step: number;
  setStep: React.Dispatch<React.SetStateAction<number>>;
  smartContract: anchor.Program | undefined;
  user: any;
  transactionPending: boolean;
  getUser: () => void;
  tags: string[];
  setTags: React.Dispatch<React.SetStateAction<string[]>>;
  bio: BioT;
  setBio: React.Dispatch<React.SetStateAction<BioT>>;
  initialized: boolean;
  amount: number;
  setAmount: React.Dispatch<React.SetStateAction<number>>;
  initUser: () => void;
  getAllCampaigns: () => void;
  getACampaign: (pub: string) => void;
  donate: (val: number) => void;
}>({
  step: 1,
  setStep: () => {},
  smartContract: undefined,
  user: {},
  transactionPending: false,
  getUser: () => {},
  tags: [],
  setTags: () => {},
  bio: { name: "", description: "" },
  setBio: () => {},
  initialized: false,
  amount: 0,
  setAmount: () => {},
  initUser: () => {},
  getAllCampaigns: () => {},
  getACampaign: () => {},
  donate: () => {},
});

export const AppProvider: React.FC = ({ children }) => {
  const [step, setStep] = React.useState<number>(1);
  const [transactionPending, setTransactionPending] = React.useState<boolean>(false);
  const [initialized, setInitialized] = React.useState<boolean>(false);
  const [tags, setTags] = React.useState<string[]>([]);
  const [bio, setBio] = React.useState<BioT>({ name: "", description: "" });
  const [amount, setAmount] = React.useState<number>(0);
  const [user, setUser] = React.useState<any>({
    pda: "",
    name: "",
    amountDonated: 0,
    amountRequired: 0,
    description: "",
    donationComplete: false,
  });
  const anchorWallet = useAnchorWallet();
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const navigate = useNavigate();
  const location = useLocation();
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
    return undefined;
  }, [connection, anchorWallet, publicKey]);

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
        navigate(location.state);
      }
    } catch (err: any) {
      toast.error(err.message);
      if (err.message.includes("Account does not exist or has no data")) {
        toast.success("Welcome, create an Account");
        navigate("onboarding");
      }
    } finally {
      setTransactionPending(false);
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
          .create(bio.name, new anchor.BN(12), new anchor.BN(amount), tags, bio.description)
          .accounts({
            campaign: CampaignPda,
            user: publicKey,
            systemProgram: SystemProgram.programId,
          })
          .rpc();
        navigate("/profile");
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setTransactionPending(false);
    }
  };

  const getAllCampaigns = async () => {
    setTransactionPending(true);
    try {
      if (smartContract && publicKey) {
        const data = await smartContract.account.campaign.all();
        if (data) {
          dispatch(clearCampaign());
          data.forEach((d: any) => {
            dispatch(addCampaign({
              pubKey: d.publicKey.toString(),
              name: d.account.name,
              amountDonated: d.account.amountDonated.toNumber(),
              amountRequired: d.account.amountRequired.toNumber(),
              description: d.account.description,
              donationComplete: d.account.donationComplete,
              id: d.account.id,
            }));
          });
        }
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setTransactionPending(false);
    }
  };

  const getACampaign = async (pub: string) => {
    try {
      if (smartContract && publicKey) {
        const val: any = await smartContract.account.campaign.all();
        if (val) {
          const campaign = val.find((d: any) => d.publicKey.toString() === pub);
          if (campaign) {
            dispatch(addRecipient({
              publicKey: campaign.publicKey,
              name: campaign.account.name,
              description: campaign.account.description,
              amountDonated: campaign.account.amountDonated.toNumber(),
              amountRequired: campaign.account.amountRequired.toNumber(),
              donationComplete: campaign.account.donationComplete,
            }));
          }
        }
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setTransactionPending(false);
    }
  };

  const donate = async (val: number) => {
    setTransactionPending(true);
    try {
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
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setTransactionPending(false);
    }
  };

  const getTransactions = async () => {
    const endpoint =
      "https://virulent-ultra-replica.solana-devnet.quiknode.pro/8d0f174b8b11b55aee43b27a6f913fff39963312/";
    const solanaConnection = new Connection(endpoint);

    const program = new anchor.Program(idl as any, PROGRAM_KEY);
    const transactionSignature = await solanaConnection.getConfirmedSignaturesForAddress2(publicKey);
    if (transactionSignature) {
      dispatch(clearTransactions());
      transactionSignature.forEach((transaction) => {
        dispatch(addTransaction(transaction.signature));
      });
    }
  };

  React.useEffect(() => {
    if (anchorWallet && publicKey) {
      getUser();
    }
  }, [anchorWallet, publicKey]);

  return (
    <AppContext.Provider
      value={{
        step,
        setStep,
        smartContract,
        user,
        transactionPending,
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
