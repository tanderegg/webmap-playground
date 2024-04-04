import Head from "next/head";
import React from 'react';

import MyMap from "../components/map";

import styles from "../styles/Home.module.css";

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>PMTiles Playground</title>
      </Head>

      <header className={styles.header}>
        <h1 className={styles.title}>
          Welcome to the PMTiles Playground!
        </h1>
      </header>

      <main className={styles.main}>
        <MyMap />
      </main>

      <footer className={styles.footer}>
        <h3>Site by Tim Anderegg</h3>
      </footer>
    </div>
  );
}