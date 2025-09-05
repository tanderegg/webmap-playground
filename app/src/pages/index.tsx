import Head from "next/head";
import React from 'react';

// WRI Design System
import { NavigationRail, Footer } from '@worldresources/wri-design-systems'

import { WRIMap } from "@/components/map";
import styles from "@/styles/Home.module.css";

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Webmap Playground</title>
      </Head>

      <header className={styles.header}>
        <h1 className={styles.title}>
          Welcome to the Webmap Playground!
        </h1>
      </header>

      <main className={styles.main}>
        <WRIMap />
      </main>

      <Footer>
        <h3>Site by Tim Anderegg</h3>
      </Footer>
    </div>
  );
}