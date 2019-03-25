const API = 'http://localhost:3000';

export default class TripService {
    
    static async getCities() {
        const response = await fetch(`${API}/cities/`);
        const data = await response.json();
        return data;
    }

    static async getWeather() {
        const response = await fetch(`${API}/weather/`);
        const data = await response.json();
        return data;
    }
}
