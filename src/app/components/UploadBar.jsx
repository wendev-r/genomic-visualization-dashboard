"use client";

import TextField from '@mui/material/TextField';


export default function UploadBar({ size = "medium", sx = {}, handleEnter, value = '' }) {
    return (
        <TextField
            variant="outlined"
            placeholder="Upload file"
            value={value}
            InputProps={{ readOnly: true }}
            size={size}
            sx={sx}
            onKeyDown={handleEnter}
        />
    );
}