import api from './api';

/**
 * Giveaway API Service Layer
 * Decouples the UI from backend routing and data schemas.
 */

// GET /giveaways
export const fetchGiveaways = async () => {
  try {
    const response = await api.get('/giveaways');
    return response.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Unable to load giveaways right now.'
    };
  }
};

// GET /giveaways/current
export const fetchCurrentGiveaway = async () => {
  try {
    const response = await api.get('/giveaways/current');
    return response.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Unable to load current giveaway.'
    };
  }
};

// GET /giveaways/:id
export const fetchGiveawayById = async (id) => {
  try {
    const response = await api.get(`/giveaways/${id}`);
    return response.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Unable to load giveaway details.'
    };
  }
};

// GET /giveaways/:id/winners (or /winners)
export const fetchGiveawayWinners = async (id) => {
  try {
    const endpoint = id ? `/giveaways/${id}/winners` : '/winners';
    const response = await api.get(endpoint);
    return response.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Unable to load winners.'
    };
  }
};

// GET /giveaways/previous
export const fetchPreviousGiveaways = async () => {
  try {
    const response = await api.get('/giveaways/previous');
    return response.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Unable to load previous giveaways.'
    };
  }
};

// GET /giveaways/my-status (or /giveaways/:id/my-status)
export const fetchMyGiveawayStatus = async (id) => {
  try {
    const endpoint = id ? `/giveaways/${id}/my-status` : '/giveaways/my-status';
    const response = await api.get(endpoint);
    return response.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Unable to load participant status.'
    };
  }
};

// POST /giveaways/:id/join (supports both /giveaways/:id/join and /participations/join)
export const joinGiveaway = async (id, payload = {}) => {
  try {
    const response = await api.post(`/giveaways/${id}/join`, payload);
    return response.data;
  } catch (primaryErr) {
    // Fall back to /participations/join for current backend compatibility
    const fallbackResponse = await api.post('/participations/join', {
      giveawayId: id,
      ...payload
    });
    return fallbackResponse.data;
  }
};

// POST /giveaways/:id/claim (supports both /giveaways/:id/claim and /claims)
export const claimPrize = async (id, payload = {}) => {
  try {
    const response = await api.post(`/giveaways/${id}/claim`, payload);
    return response.data;
  } catch (primaryErr) {
    // Fall back to /claims for current backend compatibility
    const fallbackResponse = await api.post('/claims', {
      giveawayId: id,
      ...payload
    });
    return fallbackResponse.data;
  }
};
