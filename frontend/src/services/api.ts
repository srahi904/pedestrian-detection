import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api/v1';

const api = axios.create({
  baseURL: API_URL,
  timeout: 5000,
});

export interface Camera {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'maintenance';
  resolution: string;
  fps: number;
  pedestrian_count: number;
  location: string;
}

export interface Alert {
  id: string;
  type: 'crowd' | 'loitering' | 'intrusion' | 'camera_offline';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  camera: string;
  timestamp: string;
  acknowledged: boolean;
}

export const AppAPI = {
  getCameras: async (): Promise<Camera[]> => {
    try {
      const response = await api.get('/cameras');
      return response.data;
    } catch (error) {
      console.error('API Error: Failed to fetch cameras', error);
      throw error;
    }
  },

  getAlerts: async () => {
    try {
      const response = await api.get('/alerts');
      return response.data;
    } catch (error) {
      console.error('API Error: Failed to fetch alerts', error);
      throw error;
    }
  },
  
  // Helper to check backend health
  checkHealth: async (): Promise<{ status: string; model_loading?: boolean } | boolean> => {
    try {
      const response = await api.get('/health');
      return response.data;
    } catch (e) {
      return false;
    }
  },

  acknowledgeAllAlerts: async () => {
    try {
      const response = await api.post('/alerts/acknowledge-all');
      return response.data;
    } catch (error) {
      console.error('API Error: Failed to acknowledge alerts', error);
      throw error;
    }
  },

  updateSettings: async (settings: any) => {
    try {
      // Map frontend settings to backend expected format
      const payload = {
        confidence_threshold: settings.confidenceThreshold,
        nms_iou_threshold: settings.nmsThreshold,
        model_variant: settings.model
      };
      const response = await api.put('/settings/threshold', payload);
      return response.data;
    } catch (error) {
       console.error('API Error: Failed to update settings', error);
       throw error;
    }
  },

  getSettings: async () => {
    try {
      const response = await api.get('/settings/threshold');
      return response.data;
    } catch (error) {
      console.error('API Error: Failed to fetch settings', error);
      throw error;
    }
  },

  detectFrame: async (imageBlob: Blob) => {
    try {
      const formData = new FormData();
      formData.append('file', imageBlob, 'frame.jpg');
      
      const response = await api.post('/detect', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('API Error: Failed to detect frame', error);
      throw error;
    }
  },

  getSystemStats: async () => {
    try {
      const response = await api.get('/stats/system');
      return response.data;
    } catch (error) {
      console.error('API Error: Failed to fetch system stats', error);
      throw error;
    }
  },

  getWeeklyStats: async () => {
    try {
      const response = await api.get('/stats/weekly');
      return response.data;
    } catch (error) {
      console.error('API Error: Failed to fetch weekly stats', error);
      throw error;
    }
  },

  getHourlyStats: async () => {
    try {
      const response = await api.get('/stats/hourly');
      return response.data;
    } catch (error) {
      console.error('API Error: Failed to fetch hourly stats', error);
      throw error;
    }
  },

  getZoneStats: async () => {
    try {
      const response = await api.get('/stats/zones');
      return response.data;
    } catch (error) {
      console.error('API Error: Failed to fetch zone stats', error);
      throw error;
    }
  },

  getHeatmapStats: async () => {
    try {
      const response = await api.get('/stats/heatmap');
      return response.data;
    } catch (error) {
      console.error('API Error: Failed to fetch heatmap stats', error);
      throw error;
    }
  },

  getLogs: async (level?: string) => {
    try {
      const params = level ? { level } : {};
      const response = await api.get('/logs', { params });
      return response.data;
    } catch (error) {
      console.error('API Error: Failed to fetch logs', error);
      throw error;
    }
  }
};
