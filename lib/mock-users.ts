import type { AuthUser } from './types'

export interface MockCredential {
  username: string
  password: string
  user: AuthUser
}

export const MOCK_CREDENTIALS: MockCredential[] = [
  // ── Students ──────────────────────────────────────────────
  {
    username: 'ahmed.benali',
    password: 'test123',
    user: {
      id: 'student-001',
      username: 'ahmed.benali',
      role: 'student',
      displayName: 'Ahmed Benali',
      createdAt: '2025-09-01T08:00:00Z',
    },
  },
  {
    username: 'fatima.zahra',
    password: 'test123',
    user: {
      id: 'student-002',
      username: 'fatima.zahra',
      role: 'student',
      displayName: 'Fatima Zahra Alaoui',
      createdAt: '2025-09-01T08:00:00Z',
    },
  },
  {
    username: 'youssef.khalil',
    password: 'test123',
    user: {
      id: 'student-003',
      username: 'youssef.khalil',
      role: 'student',
      displayName: 'Youssef Khalil',
      createdAt: '2025-09-01T08:00:00Z',
    },
  },
  {
    username: 'nadia.moussaoui',
    password: 'test123',
    user: {
      id: 'student-004',
      username: 'nadia.moussaoui',
      role: 'student',
      displayName: 'Nadia Moussaoui',
      createdAt: '2025-09-01T08:00:00Z',
    },
  },
  {
    username: 'hamza.ouali',
    password: 'test123',
    user: {
      id: 'student-005',
      username: 'hamza.ouali',
      role: 'student',
      displayName: 'Hamza Ouali',
      createdAt: '2025-09-01T08:00:00Z',
    },
  },
  // ── Teachers ──────────────────────────────────────────────
  {
    username: 'prof.jalal',
    password: 'teach123',
    user: {
      id: 'teacher-001',
      username: 'prof.jalal',
      role: 'teacher',
      displayName: 'Prof. Jalal Asermouh',
      createdAt: '2025-09-01T07:00:00Z',
    },
  },
  {
    username: 'prof.achraf',
    password: 'teach123',
    user: {
      id: 'teacher-002',
      username: 'prof.achraf',
      role: 'teacher',
      displayName: 'Prof. Achraf Jarhni',
      createdAt: '2025-09-01T07:00:00Z',
    },
  },
  // ── Admin ─────────────────────────────────────────────────
  {
    username: 'admin',
    password: 'admin123',
    user: {
      id: 'admin-001',
      username: 'admin',
      role: 'admin',
      displayName: 'Administrateur ENS Fès',
      createdAt: '2025-09-01T06:00:00Z',
    },
  },
  // ── Demo (any credentials) ────────────────────────────────
  {
    username: 'student',
    password: 'demo',
    user: {
      id: 'student-demo',
      username: 'student',
      role: 'student',
      displayName: 'Étudiant Démo',
      createdAt: '2025-09-01T08:00:00Z',
    },
  },
  {
    username: 'teacher',
    password: 'demo',
    user: {
      id: 'teacher-demo',
      username: 'teacher',
      role: 'teacher',
      displayName: 'Professeur Démo',
      createdAt: '2025-09-01T07:00:00Z',
    },
  },
]

export const MOROCCAN_INSTITUTIONS = [
  'Lycée Mohammed V – Fès',
  'Lycée Ibn Khaldoun – Meknès',
  'Lycée Allal El Fassi – Fès',
  'Lycée Moulay Idriss – Fès',
  'Lycée Hassan II – Oujda',
  'Lycée Imam Malik – Rabat',
  'Lycée Omar Ibn Khattab – Casablanca',
  'ENS Fès (École Normale Supérieure)',
  'Lycée Technique – Fès',
  'Autre établissement',
]

export const DEMO_TEACHERS = [
  { id: 'teacher-001', name: 'Prof. Jalal Asermouh', institution: 'ENS Fès' },
  { id: 'teacher-002', name: 'Prof. Achraf Jarhni', institution: 'ENS Fès' },
  { id: 'teacher-003', name: 'Prof. Sanaa Benkirane', institution: 'Lycée Mohammed V – Fès' },
  { id: 'teacher-004', name: 'Prof. Rachid Hdidou', institution: 'Lycée Ibn Khaldoun – Meknès' },
]
