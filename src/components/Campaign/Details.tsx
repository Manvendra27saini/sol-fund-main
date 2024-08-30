import React, { useEffect } from "react";
import {
  Box,
  Container,
  Center,
  Text,
  Heading,
  Progress,
  Flex,
  Table,
  Thead,
  Tbody,
  Tfoot,
  Tr,
  Th,
  Td,
  TableCaption,
  TableContainer,
  Button,
  NumberInput,
  NumberInputField,
} from "@chakra-ui/react";
import { Navigate, Router, useNavigate, useParams } from "react-router-dom";
import { AppContext } from "../../Context";
import Navbar from "../Navbar";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useAppSelector } from "../../redux/hook";
import { TransactionT } from "../../redux/types";
import { ChatIcon } from "@chakra-ui/icons";
	@@ -33,31 +27,23 @@ import SideNav from "../SideNav/HalfSide";

function Details() {
  const { id }: any = useParams();
  const { getACampaign, donate, transactionPending } =
    React.useContext(AppContext);

  const recipient = useAppSelector((state) => state.recipient);
  console.log(recipient);

  const navigate = useNavigate();

  const { publicKey } = useWallet();

  const [amount, setAmount] = React.useState<number>(0);
  React.useMemo(() => {
    const call = async () => {
      if (id) {
        await getACampaign(id);
      }
    };
    call();
  }, [publicKey, id]);

  const amountLeft = recipient.amountRequired - recipient.amountDonated;
  const progress = (recipient.amountDonated / recipient.amountRequired) * 100;

  const parse: any = (val: string) => val.replace(/^\$/, "");
  const format = (val: number) => `$` + val;

  const handleDonate = async () => {
    await donate(amount);
	@@ -67,13 +53,13 @@ function Details() {
    <SideNav>
      {!publicKey ? (
        <Flex align="center" justify="center" flexDirection="column">
          <Text fontSize={"24px"}>
            Please connect a wallet to see full details and donate
          </Text>
          {/* <WalletMultiButton /> */}
        </Flex>
      ) : (
        <Flex flexDirection={"column"} my={8} gap={6}>
          {recipient.name.length > 2 ? (
            <>
              <Flex justify="space-evenly">
	@@ -82,13 +68,13 @@ function Details() {
                <Box />
              </Flex>

              {/* funding details */}
              <Box
                color="black"
                py={3}
                mx={8}
                px={8}
                borderRadius={"15px"}
                h={170}
                bgColor="white"
                gap={6}
	@@ -101,7 +87,6 @@ function Details() {
                <Flex color="#353535" mt={1}>
                  0.334 SOL
                </Flex>

                <Flex
                  color="#1935C4"
                  fontWeight={600}
	@@ -114,38 +99,17 @@ function Details() {
                <Progress color="#1935C4" value={Math.floor(progress)} />
              </Box>

              {/* extra funding details */}
              <NumberInput
                mx={8}
                value={format(amount)}
                onChange={(value: string) => setAmount(parse(value))}
                defaultValue={0}
                clampValueOnBlur={false}
                h={"40px"}
              >
                <NumberInputField />
              </NumberInput>

              {/* <Box
                color="black"
                py={1}
                mx={8}
                px={8}
                borderRadius={"15px"}
                h={49}
                bgColor="white"
              >
                {" "}
                <Flex
                  color="#1935C4"
                  fontWeight={600}
                  mt={3}
                  justify="space-between"
                >
                  <Text>$10,000</Text>
                  <Text>30 SOL</Text>
                </Flex>
              </Box> */}
              <Button
                mx={8}
                py={4}
	@@ -158,12 +122,13 @@ function Details() {
              >
                Send {recipient.name} some Sol
              </Button>
              {/* Message */}
              <Flex
                justify="flex-end"
                mx={3}
                gap={3}
                cursor={"pointer"}
                onClick={() => navigate("/message")}
              >
                <Text>Send a Message</Text>
	@@ -176,102 +141,24 @@ function Details() {
              </Box>
            </>
          ) : (
            <Heading textAlign={"center"}>
              Opps!... You can't solFund yourself
            </Heading>
          )}
        </Flex>
      )}
    </SideNav>
  );
  // return (
  //   <Container
  //     maxW={{ base: "90%", md: "60%" }}
  //     h={"100vh"}
  //     my={8}
  //     border={"1px solid white"}
  //     py={10}
  //     px={10}
  //   >
  //     {!publicKey ? (
  //       <Flex align="center" justify="center" flexDirection="column">
  //         <Text fontSize={"24px"}>
  //           Please connect a wallet to see full details and donate
  //         </Text>
  //         <WalletMultiButton />
  //       </Flex>
  //     ) : (
  //       <>
  //         <Navbar />
  //         {recipient.name.length > 2 ? (
  //           <>
  //             <Heading textAlign="center">
  //               SolFunding for {recipient.name}
  //             </Heading>
  //             <Text>{recipient.description}</Text>
  //             <Box mt={"40px"}>
  //               <Progress value={progress} />
  //               <Flex justify={"flex-end"}>
  //                 <Text mt={4}>
  //                   $ {amountLeft.toLocaleString()} to reach goal🎉
  //                 </Text>
  //               </Flex>
  //               <Flex justify={"center"} gap={3} flexDirection={"column"}>
  //                 <NumberInput
  //                   value={format(amount)}
  //                   onChange={(value: string) => setAmount(parse(value))}
  //                   defaultValue={0}
  //                   clampValueOnBlur={false}
  //                   h={"40px"}
  //                 >
  //                   <NumberInputField />
  //                 </NumberInput>
  //                 <Button
  //                   py={7}
  //                   px={5}
  //                   onClick={handleDonate}
  //                   isDisabled={amount < 0.1 || transactionPending}
  //                   isLoading={transactionPending}
  //                 >
  //                   Send {recipient.name} some Sol
  //                 </Button>
  //                 {/* Message */}
  //                 <Flex
  //                   justify="flex-end"
  //                   gap={3}
  //                   cursor={"pointer"}
  //                   onClick={() => navigate("/message")}
  //                 >
  //                   <Text>Send a Message</Text>
  //                   <ChatIcon color="primary.50" boxSize={6} />
  //                 </Flex>
  //               </Flex>
  //             </Box>
  //             {/* transaction */}
  //             <Box h={"100px"} />
  //             <Transactions />
  //           </>
  //         ) : (
  //           <Heading textAlign={"center"}>
  //             Opps!... You can't solFund yourself
  //           </Heading>
  //         )}
  //       </>
  //     )}
  //   </Container>
  // );
}

export default Details;

export function Transactions() {
  const transaction = useAppSelector((state) => state.transction);

  return (
    <TableContainer
      mx={8}
      h={"200px"}
      overflowY={"scroll"}
      css={{
        "&::-webkit-scrollbar": {
          display: "none", // Hide scrollbar for Chrome, Safari, and Opera
	@@ -300,6 +187,7 @@ export function Transactions() {
        </Tbody>
      </Table>
    </TableContainer>
    //nothingS
  );
}
