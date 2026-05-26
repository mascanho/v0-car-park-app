export interface CarPark {
  id: string;
  name: string;
  location: string;
  rows: string[];
  spacesPerRow: Record<string, number>;
  spaceNumbers?: Record<string, number[]>;
}

export interface ParkingSpace {
  id: string;
  row: string;
  number: number;
  type: 'standard' | 'handicap' | 'electric';
  carParkId: string;
}

export interface Booking {
  id?: string;
  spaceId: string;
  date: string;
  userName: string;
  initials?: string;
  carParkId: string;
  originalUser?: string | null;
}

export interface BorrowRecord {
  id?: number;
  spaceId: string;
  carParkId: string;
  date: string;
  originalOwner: string;
  borrowedBy: string;
  borrowedAt: string;
}

// Car park configurations
export const CAR_PARKS: CarPark[] = [
  {
    id: 'grosvenor',
    name: 'Grosvenor House',
    location: 'Grosvenor House Car Parking',
    rows: ['Ground', 'First'],
    spacesPerRow: { Ground: 30, First: 22 },
    spaceNumbers: {
      Ground: [6, 7, 8, 14, 15, 16, 26, 29],
      First: [39, 40, 41, 52],
    },
  },
  {
    id: 'smallwood',
    name: 'Smallwood',
    location: 'Smallwood Car Parking',
    rows: ['A', 'B'],
    spacesPerRow: { A: 20, B: 20 },
    spaceNumbers: {
      A: [31, 32, 33, 34, 35, 36, 37, 38, 39, 40],
      B: [56, 58, 59],
    },
  },
];

// Generate parking spaces layout for a specific car park
export function generateParkingSpaces(carPark: CarPark): ParkingSpace[] {
  const spaces: ParkingSpace[] = [];
  
  carPark.rows.forEach((row) => {
    const spacesPerRow = carPark.spacesPerRow[row] || 8;
    const numbers = carPark.spaceNumbers?.[row] ?? Array.from({ length: spacesPerRow }, (_, i) => i + 1);
    
    numbers.forEach((num) => {
      let type: ParkingSpace['type'] = 'standard';
      if (row === carPark.rows[0] && numbers.indexOf(num) <= 1) type = 'handicap';
      if (row === carPark.rows[carPark.rows.length - 1] && numbers.indexOf(num) >= numbers.length - 2) type = 'electric';
      
      spaces.push({
        id: `${num}`,
        row,
        number: num,
        type,
        carParkId: carPark.id,
      });
    });
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

export function extractInitials(name: string): string {
  return name
    .split(/[\s._-]+/)
    .filter(Boolean)
    .map((w) => w[0].toUpperCase())
    .join('')
    .slice(0, 2)
    || name.charAt(0).toUpperCase();
}
