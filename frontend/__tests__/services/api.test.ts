import axios from 'axios';
import { api } from '../../services/api';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('API Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should make GET request with correct parameters', async () => {
    const mockResponse = { data: { test: 'data' }, status: 200 };
    mockedAxios.get.mockResolvedValueOnce(mockResponse);

    const response = await api.get('/test');
    
    expect(mockedAxios.get).toHaveBeenCalledWith('/test');
    expect(response).toEqual(mockResponse);
  });

  it('should make POST request with correct parameters', async () => {
    const mockData = { test: 'data' };
    const mockResponse = { data: mockData, status: 200 };
    mockedAxios.post.mockResolvedValueOnce(mockResponse);

    const response = await api.post('/test', mockData);
    
    expect(mockedAxios.post).toHaveBeenCalledWith('/test', mockData);
    expect(response).toEqual(mockResponse);
  });

  it('should make PUT request with correct parameters', async () => {
    const mockData = { test: 'data' };
    const mockResponse = { data: mockData, status: 200 };
    mockedAxios.put.mockResolvedValueOnce(mockResponse);

    const response = await api.put('/test', mockData);
    
    expect(mockedAxios.put).toHaveBeenCalledWith('/test', mockData);
    expect(response).toEqual(mockResponse);
  });

  it('should make DELETE request with correct parameters', async () => {
    const mockResponse = { data: null, status: 200 };
    mockedAxios.delete.mockResolvedValueOnce(mockResponse);

    const response = await api.delete('/test');
    
    expect(mockedAxios.delete).toHaveBeenCalledWith('/test');
    expect(response).toEqual(mockResponse);
  });

  it('should handle errors correctly', async () => {
    const mockError = new Error('Network error');
    mockedAxios.get.mockRejectedValueOnce(mockError);

    await expect(api.get('/test')).rejects.toThrow('Network error');
  });
}); 