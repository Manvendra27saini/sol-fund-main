import React, { useState } from "react";
import {
  Box,
  Flex,
  Text,
  Progress,
  Link,
  Input,
  VStack,
  Show,
  Hide,
  Image,
} from "@chakra-ui/react";
import { AppContext } from "../../Context";
import { useLocation } from "react-router-dom";
import { useWallet } from "@solana/wallet-adapter-react";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { CopyIcon } from "@chakra-ui/icons";
import { motion } from "framer-motion";
import SideNav from "../SideNav";

const AnimatedCopyIcon = motion(CopyIcon);

function Index() {
  const { user } = React.useContext(AppContext);
  const location = useLocation();
  const { publicKey } = useWallet();
  const fullUrl = `${window.location.origin}/details/${user.pda}`;

  const percentDonated = (user?.amountDonated / user?.amountRequired) * 100;

  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);

  const iconVariants = {
    normal: { scale: 1, color: "#7F7F7F" },
    hovered: { scale: 1.2 },
    clicked: { rotate: 360, scale: 1.2, color: "#341A41" },
  };

  return (
    <SideNav>
      {/* Selection */}
      <Flex
        mt={8}
        gap={8}
        overflowX="scroll"
        css={{
          "&::-webkit-scrollbar": { display: "none" },
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        <Hide below="md">
          <OptionCard
            title="Lending"
            description="This feature is coming soon"
          />
          <OptionCard
            title="Crowdfunding"
            description="Easily raise funds under 10 seconds"
          />
          <OptionCard
            title="Borrowing"
            description="This feature is coming soon"
          />
        </Hide>
        <Show below="md">
          <OptionCard
            title="Crowdfunding"
            description="Easily raise funds under 10 seconds"
          />
        </Show>
      </Flex>

      <Text my={4} mx={3} fontWeight={600}>
        Active funds
      </Text>

      <Box
        color="black"
        py={3}
        mx={8}
        px={8}
        borderRadius="15px"
        h={170}
        bgColor="white"
        gap={6}
        transition="transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out"
        _hover={{
          transform: "scale(1.05)",
          boxShadow: "xl",
        }}
        cursor="pointer"
      >
        <Flex color="#5E5E5E" fontWeight={600} justify="space-between">
          <Text>{user?.name}</Text>
          <Text>{Math.floor(percentDonated)}%</Text>
        </Flex>
        <Flex color="#353535" mt={1}>
          0.334 SOL
        </Flex>
        <Flex color="#1935C4" fontWeight={600} mt={3} justify="space-between">
          <Text>${user?.amountDonated}</Text>
          <Text>${user?.amountRequired}</Text>
        </Flex>
        <Progress color="#1935C4" value={Math.floor(percentDonated)} />

        <Link>
          <Input
            fontStyle="italic"
            color="#7F7F7F"
            isReadOnly
            value={fullUrl}
            w="250px"
          />
          <CopyToClipboard text={fullUrl}>
            <AnimatedCopyIcon
              boxSize={6}
              variants={iconVariants}
              initial="normal"
              animate={isClicked ? "clicked" : isHovered ? "hovered" : "normal"}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              onClick={() => setIsClicked(!isClicked)}
              style={{ color: "#7F7F7F" }}
            />
          </CopyToClipboard>
        </Link>
      </Box>
    </SideNav>
  );
}

export default Index;

interface OptionCardProps {
  title: string;
  description: string;
}

const OptionCard: React.FC<OptionCardProps> = ({ title, description }) => {
  return (
    <Box
      maxW="346px"
      maxH="208px"
      borderRadius="15px"
      overflow="hidden"
      transition="transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out"
      _hover={{
        transform: "scale(1.05)",
        boxShadow: "xl",
      }}
      position="relative"
    >
      <Image
        src="crowd-funding.png"
        alt="Placeholder Image"
        w="346px"
        h="208px"
      />
      <Box
        position="absolute"
        top="0"
        left="0"
        width="100%"
        height="100%"
        bg="rgba(0, 0, 0, 0.5)"
        color="white"
        opacity="0"
        transition="opacity 0.2s ease-in-out"
        _hover={{ opacity: 1 }}
        display="flex"
        alignItems="center"
        justifyContent="center"
        textAlign="center"
        px="4"
        cursor="pointer"
      >
        <VStack>
          <Text fontWeight="bold" fontSize="xl">
            {title}
          </Text>
          <Text>{description}</Text>
        </VStack>
      </Box>
    </Box>
  );
};
