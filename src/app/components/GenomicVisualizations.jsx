'use client';

import { useState, useEffect, Suspense } from 'react';
import dynamic from 'next/dynamic';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import CircularProgress from '@mui/material/CircularProgress';

const Plot = dynamic(() => import('react-plotly.js'), {
    ssr: false,
    loading: () => <CircularProgress />
});

export default function GenomicVisualizations({ data }) {
    const [charts, setCharts] = useState({
        barChart: {},
        scatterPlot: {},
        pieChart: {}
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!data) return;

        setIsLoading(true);
        
        try {
            // Bar Chart setup
            const barChart = {
                data: [{
                    x: Object.keys(data.chrom_counts),
                    y: Object.values(data.chrom_counts),
                    type: 'bar',
                    marker: {
                        color: 'rgb(158,202,225)',
                        opacity: 0.8,
                    },
                }],
                layout: {
                    title: 'Distribution of Variants Across Chromosomes',
                    xaxis: {
                        title: 'Chromosome Number',
                        ticktext: Object.keys(data.chrom_counts),
                        tickvals: Object.keys(data.chrom_counts),
                    },
                    yaxis: { 
                        title: 'Number of Variants',
                        tickformat: ',d' // Add commas for large numbers
                    },
                    bargap: 0.2,
                    height: 500,
                    margin: { t: 50, b: 100 } // More space for labels
                }
            };

            // Scatter Plot setup
            const scatterData = [];
            Object.entries(data.positions_by_chrom).forEach(([chrom, positions]) => {
                scatterData.push({
                    x: positions,
                    y: Array(positions.length).fill(chrom),
                    type: 'scatter',
                    mode: 'markers',
                    name: `Chr ${chrom}`,
                    marker: {
                        size: 6,
                        opacity: 0.6
                    },
                    hovertemplate: 'Position: %{x}<br>Chromosome: %{y}<extra></extra>'
                });
            });

            const scatterPlot = {
                data: scatterData,
                layout: {
                    title: 'Genomic Position Distribution',
                    xaxis: { 
                        title: 'Genomic Position',
                        tickformat: '.2s' // Use scientific notation for large numbers
                    },
                    yaxis: { 
                        title: 'Chromosome',
                        ticktext: Object.keys(data.positions_by_chrom),
                        tickvals: Object.keys(data.positions_by_chrom),
                    },
                    height: 500,
                    showlegend: true,
                    margin: { t: 50, b: 100 }
                }
            };

            // Pie Chart setup
            const pieChart = {
                data: [{
                    values: Object.values(data.variant_type_counts),
                    labels: Object.keys(data.variant_type_counts),
                    type: 'pie',
                    hole: 0.4,
                    marker: {
                        colors: ['rgb(158,202,225)', 'rgb(94,158,217)', 'rgb(32,119,180)'],
                    },
                    textinfo: 'label+percent',
                    hovertemplate: '%{label}: %{value:,d} variants<extra></extra>'
                }],
                layout: {
                    title: 'Variant Type Distribution',
                    height: 500,
                    showlegend: true,
                    margin: { t: 50, b: 50 }
                }
            };

            setCharts({ barChart, scatterPlot, pieChart });
        } catch (error) {
            console.error('Error preparing charts:', error);
        } finally {
            setIsLoading(false);
        }
    }, [data]);

    if (!data) return <Typography>No data available for visualization</Typography>;
    
    if (isLoading) {
        return (
            <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '400px',
                flexDirection: 'column',
                gap: 2
            }}>
                <CircularProgress />
                <Typography>Preparing visualizations...</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ width: '100%', p: 3 }}>
            <Grid container direction="column" spacing={4}>
                {/* Chromosome Distribution */}
                <Grid item xs={12}>
                    <Paper elevation={3} sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Chromosome Variant Distribution
                        </Typography>
                        <Typography variant="body2" color="text.secondary" paragraph>
                            This chart shows the number of variants found in each chromosome. 
                            Higher bars indicate chromosomes with more genetic variations.
                        </Typography>
                        <Plot
                            data={charts.barChart.data || []}
                            layout={charts.barChart.layout || {}}
                            config={{ responsive: true }}
                            style={{ width: '100%' }}
                        />
                    </Paper>
                </Grid>

                {/* Genomic Positions */}
                <Grid item xs={12}>
                    <Paper elevation={3} sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Genomic Position Map
                        </Typography>
                        <Typography variant="body2" color="text.secondary" paragraph>
                            This scatter plot visualizes where variants occur along each chromosome. 
                            Clusters indicate potential mutation hotspots.
                        </Typography>
                        <Plot
                            data={charts.scatterPlot.data || []}
                            layout={charts.scatterPlot.layout || {}}
                            config={{ responsive: true }}
                            style={{ width: '100%' }}
                        />
                    </Paper>
                </Grid>

                {/* Variant Types */}
                <Grid item xs={12}>
                    <Paper elevation={3} sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Variant Type Distribution
                        </Typography>
                        <Typography variant="body2" color="text.secondary" paragraph>
                            This donut chart shows the distribution of different variant types (SNPs, insertions, deletions, etc.).
                            Hover over segments to see exact counts.
                        </Typography>
                        <Plot
                            data={charts.pieChart.data || []}
                            layout={charts.pieChart.layout || {}}
                            config={{ responsive: true }}
                            style={{ width: '100%' }}
                        />
                    </Paper>
                </Grid>

                {/* Summary Statistics */}
                <Grid item xs={12}>
                    <Paper elevation={3} sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Summary Statistics
                        </Typography>
                        <Typography variant="body1">
                            Total Variants: {data.total_variants.toLocaleString()}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            Analysis includes variants across {Object.keys(data.chrom_counts).length} chromosomes
                        </Typography>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
}