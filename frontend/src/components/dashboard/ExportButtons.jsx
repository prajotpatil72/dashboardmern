/**
 * ExportButtons Component
 * Task 248: Export as CSV and PDF buttons
 */
import React, { useState } from 'react';
import { Download, FileText, File } from 'lucide-react';

const ExportButtons = ({ videos, searchMetadata }) => {
  const [exporting, setExporting] = useState(null);

  /**
   * Export as CSV
   */
  const exportToCSV = () => {
    setExporting('csv');

    try {
      // CSV Headers
      const headers = [
        'Video ID',
        'Title',
        'Channel',
        'Views',
        'Likes',
        'Comments',
        'Engagement Rate',
        'Duration',
        'Published Date',
        'Category',
        'Tags',
      ];

      // CSV Rows
      const rows = videos.map(video => [
        video.videoId,
        `"${video.title?.replace(/"/g, '""')}"`, // Escape quotes
        `"${video.channelTitle?.replace(/"/g, '""')}"`,
        video.viewCount || 0,
        video.likeCount || 0,
        video.commentCount || 0,
        video.engagementRate || 0,
        video.durationFormatted || '',
        video.publishedAt || '',
        video.categoryName || '',
        `"${video.tags?.join(', ') || ''}"`,
      ]);

      // Combine headers and rows
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(',')),
      ].join('\n');

      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);

      link.setAttribute('href', url);
      link.setAttribute('download', `youtube_analytics_${Date.now()}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setTimeout(() => setExporting(null), 1000);
    } catch (error) {
      console.error('CSV Export Error:', error);
      alert('Failed to export CSV');
      setExporting(null);
    }
  };

  /**
   * Export as PDF (Basic implementation)
   */
  const exportToPDF = () => {
    setExporting('pdf');

    try {
      // Create HTML content
      let htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>YouTube Analytics Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; }
            h1 { color: #2563eb; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #2563eb; color: white; }
            tr:nth-child(even) { background-color: #f9fafb; }
            .summary { background: #eff6ff; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <h1>YouTube Analytics Report</h1>
          <p><strong>Query:</strong> ${searchMetadata.searchQuery || 'N/A'}</p>
          <p><strong>Total Videos:</strong> ${videos.length}</p>
          <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>

          <div class="summary">
            <h2>Summary Statistics</h2>
            <p><strong>Total Views:</strong> ${videos.reduce((sum, v) => sum + parseInt(v.viewCount || 0), 0).toLocaleString()}</p>
            <p><strong>Total Likes:</strong> ${videos.reduce((sum, v) => sum + parseInt(v.likeCount || 0), 0).toLocaleString()}</p>
            <p><strong>Avg Engagement:</strong> ${(videos.reduce((sum, v) => sum + parseFloat(v.engagementRate || 0), 0) / videos.length).toFixed(2)}%</p>
          </div>

          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Channel</th>
                <th>Views</th>
                <th>Likes</th>
                <th>Engagement</th>
                <th>Duration</th>
              </tr>
            </thead>
            <tbody>
              ${videos.map(video => `
                <tr>
                  <td>${video.title}</td>
                  <td>${video.channelTitle}</td>
                  <td>${parseInt(video.viewCount || 0).toLocaleString()}</td>
                  <td>${parseInt(video.likeCount || 0).toLocaleString()}</td>
                  <td>${video.engagementRate}%</td>
                  <td>${video.durationFormatted}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
        </html>
      `;

      // Open in new window and trigger print
      const printWindow = window.open('', '_blank');
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
      // Wait for content to load, then print
      printWindow.onload = () => {
        printWindow.print();
      };

      setTimeout(() => setExporting(null), 1000);
    } catch (error) {
      console.error('PDF Export Error:', error);
      alert('Failed to export PDF. Please allow popups for this site.');
      setExporting(null);
    }
  };

  return (
    <div className="flex gap-3">
      {/* Export CSV Button */}
      <button
        onClick={exportToCSV}
        disabled={exporting !== null}
        className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg font-semibold transition-colors shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
      >
        {exporting === 'csv' ? (
          <>
            <div className="animate-spin">⏳</div>
            <span>Exporting...</span>
          </>
        ) : (
          <>
            <File size={20} />
            <span>Export as CSV</span>
          </>
        )}
      </button>

      {/* Export PDF Button */}
      <button
        onClick={exportToPDF}
        disabled={exporting !== null}
        className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-lg font-semibold transition-colors shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
      >
        {exporting === 'pdf' ? (
          <>
            <div className="animate-spin">⏳</div>
            <span>Exporting...</span>
          </>
        ) : (
          <>
            <FileText size={20} />
            <span>Export as PDF</span>
          </>
        )}
      </button>
    </div>
  );
};

export default ExportButtons;
