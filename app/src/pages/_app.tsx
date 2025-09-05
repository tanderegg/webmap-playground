import { ChakraProvider, defaultSystem } from '@chakra-ui/react'
import type { AppProps } from "next/app";

import { designSystemStyles } from '@worldresources/wri-design-systems'

import "../styles/globals.css";

export default function WebmapPlayground({ Component, pageProps }: AppProps) {
  return (
    <html lang="en">
      <body>
        <ChakraProvider value={designSystemStyles}>
          <Component {...pageProps} />
        </ChakraProvider>
      </body>
    </html>
  )
}