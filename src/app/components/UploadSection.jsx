"use client";

import { useState } from 'react';
import UploadBar from "./UploadBar";
import UploadButton from "./UploadButton";
import Box from '@mui/material/Box';
import { getVisualizationData } from '../api/genomicApit';
import GenomicVisualizations from './GenomicVisualizations';
import FastaVisualizations from './FastaVisualizations';

export default function UploadSection({ value: propValue, setValue: propSetValue }) {
    const [value, setValue] = useState(propValue || '');
    const [error, setError] = useState(null);
    const [visualData, setVisualData] = useState(null);
    const [fileType, setFileType] = useState(null);

    const handleSetValue = (v) => {
        setValue(v);
        if (typeof propSetValue === 'function') propSetValue(v);
    };

    const onFileRead = async (file) => {
        try {
            setError(null);
            const result = await getVisualizationData(file);
            setFileType(result.type);
            setVisualData(result.data);
        } catch (error) {
            console.error("Error processing file:", error);
            setError(error.message);
        }
    };

    return (
        <Box sx={{ width: '100%', p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 4 }}>
                <UploadBar
                    size="medium"
                    sx={{ width: 1000, fontSize: 24 }}
                    value={value}
                />
                <UploadButton 
                    setValue={handleSetValue}
                    onFileRead={onFileRead}
                    accept=".vcf,.fa,.fasta"
                />
            </Box>

            {error && (
                <Box sx={{ color: 'error.main', mt: 2, mb: 2 }}>
                    Error: {error}
                </Box>
            )}

            {visualData && fileType === 'vcf' && (
                <GenomicVisualizations data={visualData} />
            )}

            {visualData && fileType === 'fasta' && (
                <FastaVisualizations data={visualData} />
            )}
        </Box>
    );
}