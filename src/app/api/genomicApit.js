export const getVisualizationData = async (file) => {
   try {
        const formData = new FormData();
        formData.append('file', file);

        // Determine endpoint based on file extension
        const isVcf = file.name.toLowerCase().endsWith('.vcf');
        const endpoint = isVcf ? 'processedData' : 'processedFaData';

        const response = await fetch(`http://127.0.0.1:5000/${endpoint}`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Received visualization data:', data);
        return { type: isVcf ? 'vcf' : 'fasta', data };
    } catch (error) {
        console.error('Error uploading genomic file:', error);
        throw error;
    }
};