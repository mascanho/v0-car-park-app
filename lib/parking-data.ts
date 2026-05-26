export interface ParkingSpace {
  id: string;
  row: string;
  number: number;
  type: 'standard' | 'handicap' | 'electric';
}

export interface Booking {
  spaceId: string;
  date: string;
  userName: string;
}

// Generate parking spaces layout
export function generateParkingSpaces(): ParkingSpace[] {
  const spaces: ParkingSpace[] = [];
  const rows = ['A', 'B', 'C', 'D', 'E', 'F'];
  
  rows.forEach((row) => {
    const spacesPerRow = row === 'A' || row === 'F' ? 8 : 10;
    for (let i = 1; i <= spacesPerRow; i++) {
      let type: ParkingSpace['type'] = 'standard';
      if (row === 'A' && i <= 2) type = 'handicap';
      if (row === 'F' && i >= spacesPerRow - 1) type = 'electric';
      
      spaces.push({
        id: `${row}${i}`,
        row,
        number: i,
        type,
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
