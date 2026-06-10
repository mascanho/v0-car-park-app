export interface CarPark {
  id: string;
  name: string;
  location: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  rows: string[];
  spacesPerRow: Record<string, number>;
  spaceNumbers?: Record<string, number[]>;
}

export interface ParkingSpace {
  id: string;
  row: string;
  number: number;
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
  allocatedBy?: string | null;
  borrowedAt: string;
}

export interface Note {
  id?: number;
  userName: string;
  carParkId: string;
  noteDate: string;
  message: string;
  createdAt?: string;
}

// Car park configurations
export const CAR_PARKS: CarPark[] = [
  {
    id: 'grosvenor',
    name: 'Grosvenor House',
    location: 'Grosvenor House Car Parking',
    rows: ['A', 'B'],
    spacesPerRow: { A: 30, B: 22 },
    spaceNumbers: {
      A: [6, 7, 8, 14, 15, 16, 26, 29],
      B: [39, 40, 41, 52],
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
      B: [56, 57, 58, 59],
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
      spaces.push({
        id: `${num}`,
        row,
        number: num,
        carParkId: carPark.id,
      });
    });
  });
  
  return spaces;
}

// Format date as YYYY-MM-DD using local timezone
export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
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

// Default user-to-space assignments (from seed data)
export const USER_DEFAULT_SPACES: Record<string, Record<string, string>> = {
  grosvenor: {
    'Hayley Thornton': '6',
    'Natasha Cooper': '7',
    'Jessie Cooper': '8',
    'Samara Simons': '14',
    'Jenny Lowrie': '14',
    'Emily Berry': '15',
    'Sam Phipps': '16',
    'Mike Donnelly': '26',
    'Will Severn': '29',
    'Lee Eagleton': '39',
    'Adam Greensmith': '40',
    'Jack Shortt': '41',
    'Richard Evans': '52',
  },
  smallwood: {
    'Lisa Berry': '31',
    'Jason Haller': '32',
    'Samuel Round': '33',
    'Andrew Brush': '34',
    'Chris Robertson': '35',
    'Joshua Taiwo': '36',
    'Rob Hutton': '37',
    'Zu Ali': '38',
    'Marco Guerreiro': '39',
    'Victoria Lima': '40',
    'Rob Crellin': '56',
    'Viv Keech': '57',
    'Javier Garcia': '58',
    'Mark Wheeler': '59',
  },
};

export function getUserDefaultSpace(userName: string, carParkId: string): string | null {
  return USER_DEFAULT_SPACES[carParkId]?.[userName] ?? null;
}

export function findUserSpace(userName: string, email: string | undefined, carParkId: string): { spaceId: string; dbUserName: string } | null {
  const spaces = USER_DEFAULT_SPACES[carParkId];
  if (!spaces) return null;

  // Exact match by name
  if (spaces[userName]) return { spaceId: spaces[userName], dbUserName: userName };

  if (!email) return null;

  const emailPrefix = email.split('@')[0].toLowerCase();

  // Direct email-to-name override (handles typos in seed data)
  const EMAIL_TO_NAME: Record<string, string> = {
    'm.guerreiro': 'Marco Guerreiro',
  };
  const overrideName = EMAIL_TO_NAME[emailPrefix];
  if (overrideName && spaces[overrideName]) {
    return { spaceId: spaces[overrideName], dbUserName: overrideName };
  }

  // Try fuzzy match against each key
  for (const [key, spaceId] of Object.entries(spaces)) {
    const keyNorm = key.toLowerCase().replace(/\s+/g, '');
    const emailNorm = emailPrefix.replace(/[.\-_]/g, '');

    if (keyNorm.includes(emailNorm) || emailNorm.includes(keyNorm)) {
      return { spaceId, dbUserName: key };
    }

    const emailAsName = emailPrefix.replace(/\./g, ' ');
    if (key.toLowerCase().startsWith(emailAsName)) {
      return { spaceId, dbUserName: key };
    }

    // Match by last name (part after the dot in email)
    const dotIndex = emailPrefix.lastIndexOf('.');
    if (dotIndex !== -1) {
      const lastName = emailPrefix.slice(dotIndex + 1);
      if (lastName.length > 2 && keyNorm.includes(lastName)) {
        return { spaceId, dbUserName: key };
      }
    }
  }

  return null;
}
