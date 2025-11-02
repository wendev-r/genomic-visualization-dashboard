'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import CircularProgress from '@mui/material/CircularProgress';

// Dynamically import Plotly
const Plot = dynamic(() => import('react-plotly.js'), {
    ssr: false,
    loading: () => <CircularProgress />
});

// Helper function to calculate GC content for a sequence window
const calculateGCContent = (sequence, windowSize = 100) => {
    if (!sequence || typeof sequence !== 'string') {
        console.warn('Invalid sequence provided to calculateGCContent');
        return [];
    }
    const gcContents = [];
    // Ensure we don't try to create windows larger than the sequence
    if (sequence.length < windowSize) {
        // If sequence is shorter than window size, calculate for whole sequence
        const gcCount = (sequence.match(/[GC]/gi) || []).length;
        gcContents.push(gcCount / sequence.length * 100);
        return gcContents;
    }
    for (let i = 0; i <= sequence.length - windowSize; i += windowSize) {
        const window = sequence.slice(i, i + windowSize);
        const gcCount = (window.match(/[GC]/gi) || []).length;
        gcContents.push(gcCount / windowSize * 100);
    }
    return gcContents;
};

export default function FastaVisualizations({ data }) {
    const [charts, setCharts] = useState({
        gcHeatmap: null
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!data || !data.sequences) return;

        setIsLoading(true);
        try {
            // Create bar chart for sequence lengths using sequence objects
            const lengthData = [{
                x: data.sequences.map(seq => seq.id),
                y: data.sequences.map(seq => seq.length),
                type: 'bar',
                name: 'Sequence Length',
                marker: {
                    color: 'rgb(158,202,225)',
                },
            }];

            // Create bar chart for GC content
            const gcData = [{
                x: Object.keys(data.gc_content),
                y: Object.values(data.gc_content).map(v => v * 100), // Convert to percentage
                type: 'bar',
                name: 'GC Content',
                marker: {
                    color: 'rgb(94,158,217)',
                },
            }];

            const gcHeatmap = {
                data: [...lengthData, ...gcData],
                layout: {
                    title: 'Sequence Statistics',
                    grid: {rows: 2, columns: 1},
                    height: 600,
                    margin: { l: 50, r: 50, t: 50, b: 50 },
                    showlegend: true,
                    subplot1: {
                        title: 'Sequence Length Distribution',
                        xaxis: {title: 'Sequence ID'},
                        yaxis: {title: 'Length (bp)'}
                    },
                    subplot2: {
                        title: 'GC Content Distribution',
                        xaxis: {title: 'Sequence ID'},
                        yaxis: {title: 'GC Content (%)'}
                    }
                }
            };

            setCharts({ gcHeatmap });
        } catch (error) {
            console.error('Error preparing FASTA visualizations:', error);
        } finally {
            setIsLoading(false);
        }
    }, [data]);

    if (!data) return null;
    if (isLoading) return <CircularProgress />;

    return (
        <Box sx={{ width: '100%', p: 3 }}>
            <Grid container direction="column" spacing={4}>
                {/* Formatted Sequence Display */}
                <Grid item xs={12}>
                    <Paper elevation={3} sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Sequence View
                        </Typography>
                        <Box sx={{ 
                            maxHeight: '400px', 
                            overflowY: 'auto',
                            fontFamily: 'monospace',
                            whiteSpace: 'pre-wrap',
                            bgcolor: 'background.paper',
                            p: 2,
                            borderRadius: 1,
                            border: '1px solid',
                            borderColor: 'divider'
                        }}>
                            {data.sequences && data.sequences.map((seq, index) => {
                                if (!seq) {
                                    return null;
                                }
                                
                                const formattedSequence = seq.seq
                                    ? seq.seq.match(/.{1,60}/g)?.join('\n')
                                    : 'No sequence data available';

                                return (
                                    <Box key={index} sx={{ mb: 4 }}>
                                        <Typography 
                                            component="div" 
                                            sx={{ 
                                                color: 'primary.main',
                                                mb: 1,
                                                fontWeight: 'bold'
                                            }}
                                        >
                                            &gt;{seq.id || `Sequence ${index + 1}`}
                                            {seq.description && ` ${seq.description}`}
                                        </Typography>
                                        <Typography 
                                            component="div"
                                            sx={{ 
                                                letterSpacing: '0.1em',
                                                lineHeight: 1.5
                                            }}
                                        >
                                            {formattedSequence}
                                        </Typography>
                                    </Box>
                                );
                            })}
                        </Box>
                    </Paper>
                </Grid>

                {/* GC Content Heatmap */}
                <Grid item xs={12}>
                    <Paper elevation={3} sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Sequence Statistics
                        </Typography>
                        <Typography variant="body2" color="text.secondary" paragraph>
                            Showing sequence length and GC content distribution for each sequence.
                        </Typography>
                        <Plot
                            data={charts.gcHeatmap?.data || []}
                            layout={charts.gcHeatmap?.layout || {}}
                            config={{ responsive: true }}
                            style={{ width: '100%' }}
                        />
                    </Paper>
                </Grid>

                {/* Sequence Summary */}
                <Grid item xs={12}>
                    <Paper elevation={3} sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Sequence Summary
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <Typography>
                                    <strong>Total Sequences:</strong> {data.total_sequences}
                                </Typography>
                                {data.sequences.map((seq) => (
                                    <Typography key={seq.id} variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                                        <strong>{seq.id}:</strong> {seq.length.toLocaleString()} bp
                                    </Typography>
                                ))}
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography>
                                    <strong>GC Content:</strong>
                                </Typography>
                                {Object.entries(data.gc_content).map(([id, gc]) => (
                                    <Typography key={id} variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                                        <strong>{id}:</strong> {(gc * 100).toFixed(1)}%
                                    </Typography>
                                ))}
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
}