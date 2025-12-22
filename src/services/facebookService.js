// Facebook/Instagram Messaging Service
// Place this file in: src/services/facebookService.js

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

// Helper to get auth token from localStorage
const getAuthToken = () => {
  const authData = localStorage.getItem('auth');
  if (authData) {
    const parsed = JSON.parse(authData);
    return parsed.token;
  }
  return null;
};

/**
 * Send a message reply to a Facebook conversation
 * @param {string} recipientId - The Facebook user ID to send the message to
 * @param {string} message - The message text to send
 * @param {string} leadId - Optional lead ID to save the message to database
 * @returns {Promise<Object>} Response with success status and data
 */
export const sendFacebookMessage = async (recipientId, message, leadId = null) => {
  try {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/api/facebook/send-message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        recipientId,
        message,
        leadId
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to send message');
    }

    return data;
  } catch (error) {
    console.error('Error sending Facebook message:', error);
    throw error;
  }
};

/**
 * Send a message reply to an Instagram conversation
 * @param {string} recipientId - The Instagram user ID to send the message to
 * @param {string} message - The message text to send
 * @param {string} leadId - Optional lead ID to save the message to database
 * @returns {Promise<Object>} Response with success status and data
 */
export const sendInstagramMessage = async (recipientId, message, leadId = null) => {
  try {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/api/instagram/send-message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        recipientId,
        message,
        leadId
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to send message');
    }

    return data;
  } catch (error) {
    console.error('Error sending Instagram message:', error);
    throw error;
  }
};

/**
 * Send a message to either Facebook or Instagram based on channel
 * @param {string} channel - The channel type ('facebook' or 'instagram')
 * @param {string} recipientId - The user ID to send the message to
 * @param {string} message - The message text to send
 * @param {string} leadId - Optional lead ID to save the message to database
 * @returns {Promise<Object>} Response with success status and data
 */
export const sendMessage = async (channel, recipientId, message, leadId = null) => {
  if (channel === 'instagram' || channel.startsWith('instagram')) {
    return sendInstagramMessage(recipientId, message, leadId);
  } else {
    return sendFacebookMessage(recipientId, message, leadId);
  }
};

/**
 * Fetch Facebook enquiries from database
 * @returns {Promise<Array>} Array of Facebook enquiries
 */
export const getFacebookEnquiries = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/facebook/enquiries`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching Facebook enquiries:', error);
    throw error;
  }
};

/**
 * Fetch Instagram enquiries from database
 * @returns {Promise<Object>} Object with success status and Instagram enquiries data
 */
export const getInstagramEnquiries = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/instagram/enquiries`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching Instagram enquiries:', error);
    throw error;
  }
};

/**
 * Sync Facebook enquiries from Facebook API to database
 * @returns {Promise<Object>} Sync result with count of saved enquiries
 */
export const syncFacebookEnquiries = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/facebook/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error syncing Facebook enquiries:', error);
    throw error;
  }
};

/**
 * Sync Instagram enquiries from Instagram API to database
 * @returns {Promise<Object>} Sync result with count of saved enquiries
 */
export const syncInstagramEnquiries = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/instagram/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error syncing Instagram enquiries:', error);
    throw error;
  }
};
