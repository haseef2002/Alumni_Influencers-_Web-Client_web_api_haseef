document.addEventListener('DOMContentLoaded', () => {
    const exportDropdown = document.getElementById('exportDropdown');

    if (exportDropdown) {
        exportDropdown.addEventListener('change', (e) => {
            const type = e.target.value;
            if (type === 'pdf') exportToPDF();
            if (type === 'csv') exportToCSV();
            e.target.value = ""; // Reset dropdown
        });
    }

    function exportToPDF() {
        const element = document.getElementById('dashboardContent');
        // Hide elements that shouldn't be in the PDF (like buttons and inputs)
        const excluded = document.querySelectorAll('.data-exclude, .btn-icon');
        excluded.forEach(el => el.style.display = 'none');

        const opt = {
            margin: 0.5,
            filename: 'Alumni-Analytics-Report.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'in', format: 'letter', orientation: 'landscape' }
        };

        html2pdf().set(opt).from(element).save().then(() => {
            // Restore hidden elements after PDF generates
            excluded.forEach(el => el.style.display = '');
        });
    }

    function exportToCSV() {
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "Category,Metric,Count\n";
        csvContent += "Employment,Software Engineer,15\n";
        csvContent += "Employment,Data Analyst,8\n";
        csvContent += "Education,BSc Computer Science,20\n";
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "alumni_data_export.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
});

// Global function to export a specific Chart as a PNG image
window.downloadChart = function(canvasId, filename) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) {
        alert("Chart not found or still loading.");
        return;
    }
    
    // Create a temporary link element
    const link = document.createElement('a');
    link.download = filename;
    
    // Convert the canvas to a high-quality PNG data URL
    link.href = canvas.toDataURL('image/png', 1.0);
    
    // Trigger the download
    link.click();
};