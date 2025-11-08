/**
 * Export Utilities
 * Task 248: CSV and PDF export functionality
 */

/**
 * Convert data to CSV format
 * @param {Array} data - Array of objects to export
 * @param {string} filename - Name of the file
 */
export const exportToCSV = (data, filename = 'analytics-export.csv') => {
  if (!data || data.length === 0) {
    console.warn('No data to export');
    return;
  }

  try {
    // Get headers from first object
    const headers = Object.keys(data[0]);
    
    // Create CSV content
    const csvContent = [
      // Header row
      headers.join(','),
      // Data rows
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          // Handle values that contain commas or quotes
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(',')
      )
    ].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    console.log(`✅ Exported ${data.length} rows to ${filename}`);
  } catch (error) {
    console.error('Export to CSV failed:', error);
    throw error;
  }
};

/**
 * Export videos data to CSV
 * Task 248: Format video data for export
 */
export const exportVideosToCSV = (videos, searchMetadata = {}) => {
  const formattedData = videos.map(video => ({
    'Video ID': video.id,
    'Title': video.snippet?.title || video.title || 'N/A',
    'Channel': video.snippet?.channelTitle || 'N/A',
    'Published': video.snippet?.publishedAt || 'N/A',
    'Views': video.statistics?.viewCount || 0,
    'Likes': video.statistics?.likeCount || 0,
    'Comments': video.statistics?.commentCount || 0,
    'Duration': video.contentDetails?.duration || 'N/A',
    'URL': `https://youtube.com/watch?v=${video.id}`,
  }));

  const timestamp = new Date().toISOString().split('T')[0];
  const query = searchMetadata.searchQuery || 'selected-videos';
  const filename = `youtube-analytics-${query}-${timestamp}.csv`;
  
  exportToCSV(formattedData, filename);
};

/**
 * Export to PDF (simple text-based PDF)
 * Task 248: Basic PDF export without external libraries
 */
export const exportToPDF = (videos, searchMetadata = {}) => {
  // Create a printable HTML version
  const printWindow = window.open('', '_blank');
  
  if (!printWindow) {
    alert('Please allow popups to export PDF');
    return;
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>YouTube Analytics Report</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          padding: 40px;
          color: #333;
        }
        h1 {
          color: #1a73e8;
          border-bottom: 3px solid #1a73e8;
          padding-bottom: 10px;
        }
        .metadata {
          background: #f5f5f5;
          padding: 15px;
          margin: 20px 0;
          border-radius: 5px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 12px;
          text-align: left;
        }
        th {
          background-color: #1a73e8;
          color: white;
        }
        tr:nth-child(even) {
          background-color: #f9f9f9;
        }
        .footer {
          margin-top: 30px;
          text-align: center;
          color: #666;
          font-size: 12px;
        }
        @media print {
          body { padding: 20px; }
        }
      </style>
    </head>
    <body>
      <h1>📊 YouTube Analytics Report</h1>
      
      <div class="metadata">
        <strong>Search Query:</strong> ${searchMetadata.searchQuery || 'N/A'}<br>
        <strong>Search Type:</strong> ${searchMetadata.searchType || 'N/A'}<br>
        <strong>Total Results:</strong> ${searchMetadata.totalResults || 0}<br>
        <strong>Selected Videos:</strong> ${videos.length}<br>
        <strong>Generated:</strong> ${new Date().toLocaleString()}
      </div>

      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Title</th>
            <th>Channel</th>
            <th>Views</th>
            <th>Likes</th>
            <th>Comments</th>
          </tr>
        </thead>
        <tbody>
          ${videos.map((video, index) => `
            <tr>
              <td>${index + 1}</td>
              <td>${video.snippet?.title || video.title || 'N/A'}</td>
              <td>${video.snippet?.channelTitle || 'N/A'}</td>
              <td>${parseInt(video.statistics?.viewCount || 0).toLocaleString()}</td>
              <td>${parseInt(video.statistics?.likeCount || 0).toLocaleString()}</td>
              <td>${parseInt(video.statistics?.commentCount || 0).toLocaleString()}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="footer">
        <p>Generated by YouTube Analytics Dashboard</p>
      </div>

      <script>
        window.onload = () => {
          window.print();
          // Close window after printing (optional)
          // setTimeout(() => window.close(), 100);
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
};

/**
 * Calculate summary statistics
 * Task 247: Helper for summary cards
 */
export const calculateSummaryStats = (videos) => {
  if (!videos || videos.length === 0) {
    return {
      totalViews: 0,
      avgEngagement: 0,
      mostViewedVideo: null,
      bestDay: null,
    };
  }

  // Total views
  const totalViews = videos.reduce((sum, video) => {
    return sum + parseInt(video.statistics?.viewCount || 0);
  }, 0);

  // Average engagement rate
  const engagementRates = videos.map(video => {
    const views = parseInt(video.statistics?.viewCount || 0);
    const likes = parseInt(video.statistics?.likeCount || 0);
    const comments = parseInt(video.statistics?.commentCount || 0);
    
    if (views === 0) return 0;
    return ((likes + comments) / views) * 100;
  });
  
  const avgEngagement = engagementRates.reduce((a, b) => a + b, 0) / engagementRates.length;

  // Most viewed video
  const mostViewedVideo = videos.reduce((max, video) => {
    const views = parseInt(video.statistics?.viewCount || 0);
    const maxViews = parseInt(max.statistics?.viewCount || 0);
    return views > maxViews ? video : max;
  }, videos[0]);

  // Best day (most videos published)
  const dayCount = {};
  videos.forEach(video => {
    const publishedDate = video.snippet?.publishedAt;   
    if (publishedDate) {
      const day = new Date(publishedDate).toLocaleDateString('en-US', { weekday: 'long' });
      dayCount[day] = (dayCount[day] || 0) + 1;
    }
  });

  const bestDay = Object.entries(dayCount).reduce((max, [day, count]) => {
    return count > (max.count || 0) ? { day, count } : max;
  }, { day: 'N/A', count: 0 });

  return {
    totalViews,
    avgEngagement: avgEngagement.toFixed(2),
    mostViewedVideo,
    bestDay: bestDay.day,
  };
};