const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const youtubeConfig = require('../config/youtube'); // Changed from ./config/youtube
const parseUtils = require('../utils/parseYouTubeData'); // Changed from ./utils/parseYouTubeData
// ... rest of the file
/**
 * Live YouTube API Test
 * This will make an actual API call to verify your key works
 */
async function testYouTubeAPI() {
  console.log('=== Live YouTube API Test ===\n');
  
  try {
    // Test 1: Search for videos
    console.log('1. Testing Search API...');
    const searchResponse = await youtubeConfig.client.search.list({
      part: 'snippet',
      q: 'javascript tutorial',
      maxResults: 3,
      type: 'video'
    });

    if (searchResponse.data.items && searchResponse.data.items.length > 0) {
      console.log('   ✓ Search API works!');
      console.log('   Found', searchResponse.data.items.length, 'videos');
      console.log('   First result:', searchResponse.data.items[0].snippet.title);
    } else {
      console.log('   ✗ No results returned');
    }

    // Test 2: Get video details
    console.log('\n2. Testing Video Details API...');
    const videoId = searchResponse.data.items[0].id.videoId;
    const videoResponse = await youtubeConfig.client.videos.list({
      part: 'snippet,contentDetails,statistics',
      id: videoId
    });

    if (videoResponse.data.items && videoResponse.data.items.length > 0) {
      const video = videoResponse.data.items[0];
      console.log('   ✓ Video Details API works!');
      console.log('   Title:', video.snippet.title);
      console.log('   Views:', video.statistics.viewCount);
      console.log('   Duration:', video.contentDetails.duration);
    }

    // Test 3: Get channel details
    console.log('\n3. Testing Channel Details API...');
    const channelId = videoResponse.data.items[0].snippet.channelId;
    const channelResponse = await youtubeConfig.client.channels.list({
      part: 'snippet,statistics',
      id: channelId
    });

    if (channelResponse.data.items && channelResponse.data.items.length > 0) {
      const channel = channelResponse.data.items[0];
      console.log('   ✓ Channel Details API works!');
      console.log('   Channel:', channel.snippet.title);
      console.log('   Subscribers:', channel.statistics.subscriberCount);
    }

    console.log('\n=== ✅ All API Tests Passed! ===');
    console.log('\nYour YouTube API is fully configured and working correctly! 🎉');

  } catch (error) {
    console.error('\n=== ❌ API Test Failed ===');
    
    if (error.code === 403) {
      console.error('\n❌ Error: API Key Issue (403 Forbidden)');
      console.error('Possible causes:');
      console.error('  1. YouTube Data API v3 is not enabled');
      console.error('  2. API key restrictions are blocking the request');
      console.error('  3. API key is invalid');
      console.error('\nSolutions:');
      console.error('  1. Go to Google Cloud Console');
      console.error('  2. Enable YouTube Data API v3');
      console.error('  3. Check API key restrictions (remove restrictions for testing)');
    } else if (error.code === 400) {
      console.error('\n❌ Error: Bad Request (400)');
      console.error('The API request format is incorrect');
    } else if (error.code === 429) {
      console.error('\n❌ Error: Quota Exceeded (429)');
      console.error('You have exceeded your daily API quota');
    } else {
      console.error('\n❌ Error:', error.message);
      console.error('Details:', error.response?.data || error);
    }
  }
}

testYouTubeAPI();


