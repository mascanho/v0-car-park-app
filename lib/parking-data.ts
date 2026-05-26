export interface CarPark {
  id: string;
  name: string;
  location: string;
  rows: string[];
  spacesPerRow: Record<string, number>;
}

export interface ParkingSpace {
  id: string;
  row: string;
  number: number;
  type: 'standard' | 'handicap' | 'electric';
  carParkId: string;
}

export interface Booking {
  spaceId: string;
  date: string;
  userName: string;
  carParkId: string;
}

// Car park configurations
export const CAR_PARKS: CarPark[] = [
  {
    id: 'north',
    name: 'North Car Park',
    location: 'Building A - North Entrance',
    rows: ['A', 'B', 'C', 'D', 'E', 'F'],
    spacesPerRow: { A: 8, B: 10, C: 10, D: 10, E: 10, F: 8 },
  },
  {
    id: 'south',
    name: 'South Car Park',
    location: 'Building B - South Entrance',
    rows: ['A', 'B', 'C', 'D'],
    spacesPerRow: { A: 6, B: 8, C: 8, D: 6 },
  },
];

// Generate parking spaces layout for a specific car park
export function generateParkingSpaces(carPark: CarPark): ParkingSpace[] {
  const spaces: ParkingSpace[] = [];
  
  carPark.rows.forEach((row) => {
    const spacesPerRow = carPark.spacesPerRow[row] || 8;
    for (let i = 1; i <= spacesPerRow; i++) {
      let type: ParkingSpace['type'] = 'standard';
      if (row === carPark.rows[0] && i <= 2) type = 'handicap';
      if (row === carPark.rows[carPark.rows.length - 1] && i >= spacesPerRow - 1) type = 'electric';
      
      spaces.push({
        id: `${row}${i}`,
        row,
        number: i,
        type,
        carParkId: carPark.id,
      });
    }
  });
  
  return spaces;
}

// Format date as YYYY-MM-DD
export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

// Get days in month
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

// Get first day of month (0 = Sunday)
export function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

// Check if date is in the past
export function isPastDate(date: Date): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
}

// Month names
export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

// Day names
export const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
