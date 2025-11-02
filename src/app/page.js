"use client";
import Image from "next/image";
import styles from "./page.module.css";
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import UploadSection from './components/UploadSection';
import { useState } from "react";
import Head from "next/head";
import Header from "./components/Header";

export default function Home() {
  const [searchValue, setSearchValue] = useState("");
  const [filter, setFilter] = useState("Gene Symbol");
  const [lookupValue, setLookupValue] = useState("");
  const [lookupFilter, setLookupFilter] = useState("Gene Symbol");
  const [isPerformSearch, setIsPerformSearch] = useState(false);
  return (
    <div>
      <Header/>
 <UploadSection 
        value={searchValue}
        setValue={setSearchValue}
        filter={filter}
        setFilter={setFilter}
        finalSearchValue={lookupValue}
        setFinalSearchValue={setLookupValue}
        finalFilter={lookupFilter}
        setFinalFilter={setLookupFilter}
        isPerfomSearch={isPerformSearch}
        setIsPerformSearch={setIsPerformSearch}/>
      <Box sx={{ padding: 2 }}></Box>
    </div>
  );
}
