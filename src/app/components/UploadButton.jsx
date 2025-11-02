import { Box, Button } from "@mui/material";
import UploadFileIcon from '@mui/icons-material/UploadFile';

export default function UploadButton({ setValue, onFileRead, multiple = false, accept = '.vcf,.fa,.fasta', sx = {} }) {
    const handleChange = async (e) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        // Join filenames with comma for display
        const names = files.map(f => f.name).join(', ');
        if (typeof setValue === 'function') setValue(names);

        // Pass the actual File object to parent component
        if (typeof onFileRead === 'function') {
            onFileRead(files[0]); // Send just the first file since backend expects single file
        }
    };

    return (
        <Box>
            <Button
                variant="contained"
                component="label"
                startIcon={<UploadFileIcon />}
                sx={{ height: '100%', textTransform: 'none', ...sx }}
            >
                Upload
                <input
                    hidden
                    accept={accept}
                    multiple={false} // Force single file since backend expects one
                    type="file"
                    onChange={handleChange}
                />
            </Button>
        </Box>
    );
}