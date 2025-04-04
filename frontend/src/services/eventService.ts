import { CalendarEvent } from '@/types/Calendar';
import { API_URL } from '@/config/constants';
import { mockEvents } from '@/mockData/calendarEvents';

// Convert backend event format to frontend format
const convertEventFormat = (backendEvent: any): CalendarEvent => {
  // Crear fechas teniendo en cuenta la zona horaria
  const start = new Date(backendEvent.start_date);
  const end = backendEvent.end_date ? new Date(backendEvent.end_date) : undefined;

  return {
    id: backendEvent.id,
    title: backendEvent.title,
    start,
    end,
    type: backendEvent.type as 'english' | 'masterclass' | 'workshop' | 'mockinterview' | 'other',
    allDay: backendEvent.all_day || false,
    description: backendEvent.description,
    location: backendEvent.location,
    meetingUrl: backendEvent.meeting_url,
  };
};

export const fetchEvents = async (
  startDate?: Date,
  endDate?: Date,
  type?: string,
  useMockOnFail: boolean = true
): Promise<CalendarEvent[]> => {
  try {
    let url = `${API_URL}/events/`;
    
    // Add query params if provided
    const params = new URLSearchParams();
    if (startDate) {
      // Convertir a UTC para el backend
      params.append('start_date', startDate.toISOString());
    }
    if (endDate) {
      // Convertir a UTC para el backend
      params.append('end_date', endDate.toISOString());
    }
    if (type) {
      params.append('type', type);
    }
    
    // Append params to URL if there are any
    if ([...params.keys()].length > 0) {
      url += `?${params.toString()}`;
    }
    
    console.log(`Attempting to fetch events from: ${url}`);

    // Obtener el token de autenticación
    const token = localStorage.getItem('auth_token');
    if (!token) {
      console.warn('No authentication token found, using mock data');
      return mockEvents;
    }
    
    // Use a timeout to prevent long waiting times
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000); // Aumentado a 12 segundos
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId); // Clear the timeout if fetch completes
      
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Convert backend format to frontend format
      return data.map(convertEventFormat);
    } catch (fetchError) {
      console.error('Error during fetch operation:', fetchError);
      if (useMockOnFail) {
        console.log('Using mock event data instead');
        return mockEvents;
      }
      throw fetchError; // Re-throw to be caught by outer catch
    } finally {
      clearTimeout(timeoutId); // Ensure timeout is cleared
    }
  } catch (error) {
    console.error('Error fetching events:', error);
    if (useMockOnFail) {
      console.log('Using mock event data as fallback');
      return mockEvents;
    }
    return []; // Return empty array if mock data shouldn't be used
  }
};