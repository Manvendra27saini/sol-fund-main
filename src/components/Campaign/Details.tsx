import React, { useEffect, useState, useMemo, useContext } from "react";
import {
  Box,
  Flex,
  Text,
  Progress,
  Button,
  NumberInput,
  NumberInputField,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  TableCaption,
} from "@chakra-ui/react";
import { useNavigate, useParams } from "react-router-dom";
import { AppContext } from "../../Context";
import { useWallet } from "@solana/wallet-adapter-react";
import { useAppSelector } from "../../redux/hook";
import { TransactionT } from "../../redux/types";
import { ChatIcon } from "@chakra-ui/icons";
import { IoIosArrowBack } from "react-icons/io";
import SideNav from "../SideNav/HalfSide";

function Details() {
  const { id }: any = useParams();
  const { getACampaign, donate, transactionPending } = useContext(AppContext);
  const recipient = useAppSelector((state) => state.recipient);
  const navigate = useNavigate();
  const { publicKey } = useWallet();
  const [amount, setAmount] = useState<number>(0);

  useEffect(() => {
    if (id) {
      getACampaign(id);
    }
  }, [id, publicKey, getACampaign]);

  const amountLeft = recipient.amountRequired - recipient.amountDonated;
  const progress = (recipient.amountDonated / recipient.amountRequired) * 100;

  const parse = (val: string) => parseFloat(val.replace(/^\$/, ""));
  const format = (val: number) => `$${val}`;

  const handleDonate = async () => {
    await donate(amount);
  };

  return (
    <SideNav>
      {!publicKey ? (
        <Flex align="center" justify="center" flexDirection="column">
          <Text fontSize="24px">
            Please connect a wallet to see full details and donate
          </Text>
          {/* <WalletMultiButton /> */}
        </Flex>
      ) : (
        <Flex flexDirection="column" my={8} gap={6}>
          {recipient.name.length > 2 ? (
            <>
              <Flex justify="space-evenly">
                <IoIosArrowBack />
                <Text>SolFunding for {recipient.name}</Text>
                <Box />
              </Flex>

              {/* Funding Details */}
              <Box
                color="black"
                py={3}
                mx={8}
                px={8}
                borderRadius="15px"
                h={170}
                bgColor="white"
                gap={6}
                cursor="pointer"
              >
                <Flex color="#5E5E5E" fontWeight={600} justify="space-between">
                  <Text>{recipient.name}</Text>
                  <Text>{Math.floor(progress)}%</Text>
                </Flex>
                <Flex color="#353535" mt={1}>
                  0.334 SOL
                </Flex>
                <Flex
                  color="#1935C4"
                  fontWeight={600}
                  mt={3}
                  justify="space-between"
                >
                  <Text>${recipient?.amountDonated}</Text>
                  <Text>${recipient?.amountRequired}</Text>
                </Flex>
                <Progress color="#1935C4" value={Math.floor(progress)} />
              </Box>

              {/* Extra Funding Details */}
              <NumberInput
                mx={8}
                value={format(amount)}
                onChange={(value: string) => setAmount(parse(value))}
                defaultValue={0}
                clampValueOnBlur={false}
                h="40px"
              >
                <NumberInputField />
              </NumberInput>
              <Button
                mx={8}
                py={4}
                bgColor="#4C3FE7"
                color="white"
                border="none"
                onClick={handleDonate}
                isDisabled={amount < 0.1 || transactionPending}
                isLoading={transactionPending}
              >
                Send {recipient.name} some Sol
              </Button>

              {/* Message */}
              <Flex
                justify="flex-end"
                mx={3}
                gap={3}
                cursor="pointer"
                onClick={() => navigate("/message")}
              >
                <Text>Send a Message</Text>
                <ChatIcon boxSize={6} />
              </Flex>

              <Text mx={8}>Transaction History</Text>
              <Box>
                <Transactions />
              </Box>
            </>
          ) : (
            <Heading textAlign="center">
              Oops!... You can't SolFund yourself
            </Heading>
          )}
        </Flex>
      )}
    </SideNav>
  );
}

function Transactions() {
  const transaction = useAppSelector((state) => state.transaction);

  return (
    <TableContainer
      mx={8}
      h="200px"
      overflowY="scroll"
      css={{
        "&::-webkit-scrollbar": {
          display: "none", // Hide scrollbar for Chrome, Safari, and Opera
        },
        scrollbarWidth: "none", // Hide scrollbar for Firefox
        msOverflowStyle: "none", // Hide scrollbar for Internet Explorer and Edge
      }}
    >
      <Table variant="simple">
        <TableCaption>Transaction details</TableCaption>
        <Thead>
          <Tr>
            <Th>Signature</Th>
            <Th>Date</Th>
            <Th>Status</Th>
          </Tr>
        </Thead>
        <Tbody>
          {transaction?.map((val: TransactionT) => (
            <Tr key={val.transactionNo}>
              <Td>{val.signature.slice(0, 30)}...</Td>
              <Td>{val.time.toISOString()}</Td>
              <Td>{val.status}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </TableContainer>
  );
}

export default Details;
