import React from "react";
import { Text, Flex } from "@chakra-ui/react";

function Footer() {
  return (
    <Flex
      justify={{ md: "space-evenly" }}
      flexDirection={{ base: "column", md: "row" }}
      align={{ base: "center" }}
      mt={8}
    >
      <Flex>
        <Text size="24px" fontWeight={500}>
          Powered by Solana
        </Text>
      </Flex>
    </Flex>
  );
}

export default Footer;
